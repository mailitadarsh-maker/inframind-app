import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TOPICS = [
  'Why website downtime costs small businesses more than they think',
  "A founder's guide to SSL certificate monitoring",
  'API uptime monitoring: what to track and why',
  'How to choose the right uptime check interval for your site',
  "What a good incident report should tell you (and why most don't)",
  'Common causes of website outages and how to catch them early',
  'Setting up status pages: a simple guide for small teams',
  'Why "it works on my machine" isn\'t enough: monitoring after deploy',
  'SSL expiry warnings: how to avoid them embarrassing your business',
  'Uptime monitoring vs. log monitoring: what is the difference',
];

function pickTopic() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return TOPICS[dayIndex % TOPICS.length];
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const topic = pickTopic();

  const prompt = `You are writing a blog post for InfraMind, an AI-powered uptime/API/SSL monitoring SaaS aimed at non-technical founders and small business owners.

Topic: "${topic}"

Write a blog post in valid HTML (use <h2>, <p>, <ul>/<li>, <strong> tags only — no <html>, <head>, or <body> tags). The post should be 500-700 words, practical, friendly, and naturally mention relevant keywords like "uptime monitoring", "website downtime", "SSL certificate monitoring", and "API monitoring" where relevant. End with a short paragraph mentioning how InfraMind helps with this, written in plain English for non-technical readers.

Also provide:
- A short, compelling title (under 70 characters)
- A meta description (under 160 characters)

Respond ONLY with valid JSON in this exact format, no markdown fences, no extra text:
{"title": "...", "description": "...", "content": "<p>...</p>..."}`;

  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    return NextResponse.json({ error: 'OpenAI request failed', details: errText }, { status: 500 });
  }

  const aiData = await aiResponse.json();
  let raw = aiData.choices?.[0]?.message?.content ?? '';

  raw = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');

  let parsed: { title: string; description: string; content: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw }, { status: 500 });
  }

  const baseSlug = slugify(parsed.title);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data: existing } = await supabaseAdmin
      .from('blog_posts')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (!existing) break;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const { error } = await supabaseAdmin.from('blog_posts').insert({
    slug,
    title: parsed.title,
    description: parsed.description,
    content: parsed.content,
    cover_image: null,
    published: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, slug, title: parsed.title });
}