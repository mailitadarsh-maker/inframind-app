import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { client_id } = await req.json();
  if (!client_id) return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });

  const { data: client } = await supabase.from('clients').select('*').eq('id', client_id).single();
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const { data: recentPosts } = await supabase
    .from('social_posts')
    .select('caption')
    .eq('client_id', client_id)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentTopics = (recentPosts || []).map((p: any) => p.caption?.slice(0, 80)).join('\n');

  const prompt = `You are a social media strategist for ${client.company_name}, a ${client.industry} company.
Description: ${client.company_description || ''}
Target audience: ${client.target_audience || 'General'}
Recent posts: ${recentTopics || 'None yet'}

Generate exactly 5 fresh social media post topic ideas. Return ONLY valid JSON, no markdown:
{"topics":[{"title":"Short catchy title","description":"One sentence angle","type":"educational"},{"title":"...","description":"...","type":"promotional"},{"title":"...","description":"...","type":"story"},{"title":"...","description":"...","type":"trend"},{"title":"...","description":"...","type":"engagement"}],"week_theme":"One sentence theme"}`;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-4-maverick-17b-128e-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    await supabase.from('clients').update({
      topic_suggestions: parsed.topics,
      topic_suggestions_at: new Date().toISOString(),
      topic_week_theme: parsed.week_theme,
    }).eq('id', client_id);

    return NextResponse.json({ topics: parsed.topics, week_theme: parsed.week_theme });
  } catch(e) {
    console.error('Parse error:', e, 'Raw text:', text.slice(0, 200));
    return NextResponse.json({ error: 'Failed to parse' }, { status: 500 });
  }
}
