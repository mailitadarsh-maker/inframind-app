import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBlogReadyEmail } from '@/lib/notifyClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { client_id } = await request.json();
    if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 });

    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientErr || !client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const { data: recentBlogs } = await supabase
      .from('client_blogs')
      .select('title')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentTitles = (recentBlogs || []).map((b: any) => b.title);
    const avoidBlock = recentTitles.length > 0
      ? 'Avoid these recently covered topics:\n' + recentTitles.map((t: string) => '- ' + t).join('\n')
      : '';

    const descriptionBlock = client.company_description ? `About the company: ${client.company_description}` : '';
    const prompt = `You are writing a blog post for ${client.company_name}, a ${client.industry} company.
Website: ${client.website}
${descriptionBlock}
Target audience: ${client.target_audience || 'general audience'}
Tone: ${client.tone || 'Professional'}

${avoidBlock}

Write a fresh, SEO-optimized blog post highly relevant to their business and industry.
The blog should provide real value to their target audience.

Write in valid HTML using only <h2>, <p>, <ul>, <li>, <strong> tags. 500-700 words.

Respond ONLY with valid JSON, no markdown fences:
{"title": "...", "description": "...", "content": "<p>...</p>..."}`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!aiRes.ok) throw new Error('OpenAI request failed');

    const aiData = await aiRes.json();
    let raw = aiData.choices?.[0]?.message?.content ?? '';
    raw = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    const parsed = JSON.parse(raw);

    const slug = parsed.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const { error: insertErr } = await supabase.from('client_blogs').insert({
      client_id,
      title: parsed.title,
      slug,
      description: parsed.description,
      content: parsed.content,
      status: 'pending',
    });

    if (insertErr) throw new Error(insertErr.message);

    await sendBlogReadyEmail(client, parsed.title);

    return NextResponse.json({ success: true, title: parsed.title });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
