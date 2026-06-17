import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBlogReadyEmail } from '@/lib/notifyClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all clients
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*');

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  const results = [];
  const errors = [];

  for (const client of clients || []) {
    try {
      // Pick a topic for this client
      const topicPrompt = `You are a content strategist. Suggest 1 blog topic for this company:
Company: ${client.company_name}
Industry: ${client.industry}
Target Audience: ${client.target_audience || 'general audience'}
Description: ${client.company_description || ''}

Respond ONLY with the topic as a plain string, no quotes, no explanation.`;

      const topicRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: topicPrompt }],
          temperature: 0.9,
        }),
      });

      const topicData = await topicRes.json();
      const topic = topicData.choices?.[0]?.message?.content?.trim();

      if (!topic) throw new Error('No topic generated');

      // Generate blog for this client
      const blogPrompt = `You are writing a blog post for ${client.company_name}, a ${client.industry} company.
About: ${client.company_description || ''}
Target Audience: ${client.target_audience || 'general audience'}
Tone: ${client.tone || 'Professional'}
Topic: "${topic}"

Write a blog post of 500-700 words. Use clear headings and paragraphs.
End with a short paragraph about how ${client.company_name} helps with this.

Respond ONLY with valid JSON, no markdown:
{"title": "...", "content": "..."}`;

      const blogRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: blogPrompt }],
          temperature: 0.7,
        }),
      });

      const blogData = await blogRes.json();
      let raw = blogData.choices?.[0]?.message?.content?.trim() || '';
      raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
      const parsed = JSON.parse(raw);

      // Generate slug from title
      const slug = parsed.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        + '-' + Date.now();

      // Save to client_blogs
      const { error: insertError } = await supabase.from('client_blogs').insert({
        client_id: client.id,
        title: parsed.title,
        content: parsed.content,
        status: 'pending',
        slug,
      });

      if (insertError) throw new Error(insertError.message);

      await sendBlogReadyEmail(client, parsed.title);

      results.push({ client: client.company_name, title: parsed.title });
    } catch (e: any) {
      errors.push({ client: client.company_name, error: e.message });
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    generated: results.length,
    results,
    errors,
  });
}
