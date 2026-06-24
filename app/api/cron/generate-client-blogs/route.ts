import { NextResponse } from 'next/server';
import { cronLog } from '@/lib/cron-logger';
import { createClient } from '@supabase/supabase-js';
import { sendBlogReadyEmail } from '@/lib/notifyClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── How many blogs to generate today per frequency plan ─────────────────────
function blogsToGenerateToday(frequency: string): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const dayOfMonth = now.getDate();

  switch (frequency) {
    case 'daily1': return 1;
    case 'daily2': return 2;
    case 'daily3': return 3;
    case '2/week': return [1, 4].includes(dayOfWeek) ? 1 : 0; // Mon & Thu
    case 'weekly': return dayOfWeek === 1 ? 1 : 0;            // Monday only
    case 'biweekly': return dayOfMonth === 1 || dayOfMonth === 15 ? 1 : 0;
    case 'monthly': return dayOfMonth === 1 ? 1 : 0;
    default: return dayOfWeek === 1 ? 1 : 0; // fallback: weekly
  }
}

// ── Fetch trending topics for this industry via OpenAI ───────────────────────
async function getTrendingTopics(industry: string, audience: string): Promise<string[]> {
  const prompt = `You are a content strategist with access to current market knowledge up to your training date.

What are 5 trending topics RIGHT NOW in the "${industry}" industry that would genuinely interest "${audience}"?

Think about:
- Recent industry shifts or disruptions
- Common pain points people are searching for solutions to
- Emerging technologies or regulations affecting this space
- Seasonal or timely angles

Respond ONLY with a JSON array of 5 topic strings. No explanation.
Example: ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]`;

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-4-maverick-17b-128e-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || '[]';
  try {
    return JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, ''));
  } catch {
    return [];
  }
}

// ── Pick best topic avoiding recent ones ─────────────────────────────────────
async function pickBestTopic(
  trendingTopics: string[],
  recentTitles: string[],
  client: any
): Promise<string> {
  const competitorBlock = client.competitors
    ? `Competitors to be aware of: ${client.competitors}`
    : '';

  const prompt = `You are a content strategist for ${client.company_name}, a ${client.industry} company.
Target audience: ${client.target_audience || 'general audience'}
${competitorBlock}

These are trending topics in their industry right now:
${trendingTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

These topics were recently covered — avoid them:
${recentTitles.length > 0 ? recentTitles.map(t => `- ${t}`).join('\n') : 'None yet'}

Pick the single best topic from the trending list that:
1. Hasn't been covered recently
2. Is most relevant to their specific audience
3. Gives ${client.company_name} a natural opportunity to showcase their expertise

Respond ONLY with the chosen topic as a plain string. No quotes, no explanation.`;

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-4-maverick-17b-128e-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || trendingTopics[0] || 'Industry trends and insights';
}

// ── Generate the actual blog post ────────────────────────────────────────────
async function generateBlog(client: any, topic: string): Promise<{ title: string; description: string; content: string }> {
  const competitorBlock = client.competitors
    ? `Competitors in this space: ${client.competitors}. Make sure the content positions ${client.company_name} distinctively.`
    : '';

  const sampleBlock = client.sample_blog_ref
    ? `Style reference from client: ${client.sample_blog_ref}. Match this writing style and depth.`
    : '';

  const toneInstructions: Record<string, string> = {
    professional: 'Write in a polished, authoritative tone. Use industry terminology correctly. Build trust through expertise.',
    conversational: 'Write in a friendly, approachable tone. Use "you" and "we". Keep sentences short and relatable.',
    technical: 'Write in a detailed, data-driven tone. Include specific numbers, frameworks, and technical depth. Cite concepts precisely.',
    inspirational: 'Write in a bold, motivating tone. Use strong action verbs. Paint a vision of what\'s possible.',
  };

  const toneGuide = toneInstructions[client.tone?.toLowerCase()] || toneInstructions.professional;

  const prompt = `You are a senior content writer creating a high-value blog post for ${client.company_name}.

COMPANY CONTEXT:
- Industry: ${client.industry}
- About: ${client.company_description || 'A growing company in their space'}
- Target audience: ${client.target_audience || 'general audience'}
- Website: ${client.website || ''}
${competitorBlock}

TONE GUIDE:
${toneGuide}
${sampleBlock}

TOPIC: "${topic}"

REQUIREMENTS:
- 700-900 words (more depth = more value)
- Use current market context — write as if this is timely and relevant TODAY
- Include at least one specific insight, stat, or trend that makes it feel researched
- Use HTML tags only: <h2>, <h3>, <p>, <ul>, <li>, <strong>
- End with a natural paragraph about how ${client.company_name} helps readers with this specific challenge
- Make the ending feel helpful, not salesy

Respond ONLY with valid JSON, no markdown fences:
{"title": "...", "description": "One sentence meta description under 160 chars", "content": "<p>...</p>..."}`;

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-4-maverick-17b-128e-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
    }),
  });

  const data = await res.json();
  let raw = data.choices?.[0]?.message?.content?.trim() || '';
  raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  return JSON.parse(raw);
}


// ── Get cover image (Unsplash or DALL·E based on client setting) ─────────────
async function getCoverImage(client: any, title: string): Promise<string | null> {
  const mode = client.image_generation || 'unsplash';

  if (mode === 'dalle') {
    try {
      const imgPrompt = `Professional blog cover image for "${title}". Company: ${client.company_name}, Industry: ${client.industry}. ${(client.brand_images && client.brand_images.length > 0) ? 'Warm gold tones, premium feel, dark rich backgrounds, cinematic lighting.' : 'Dark background, modern professional aesthetic.'} Clean composition, no text, no logos.`;
      const res = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
        body: JSON.stringify({ prompt: imgPrompt, width: 1024, height: 1024 }),
      });
      const data = await res.json();
      const b64 = data.artifacts?.[0]?.base64;
      if (!b64) return null;

      const buffer = Buffer.from(b64, 'base64');
      const fileName = `flux-${client.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('brand-images')
        .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) { console.log('Upload error:', uploadError.message); return null; }

      const { data: urlData } = supabase.storage.from('brand-images').getPublicUrl(fileName);
      return urlData.publicUrl || null;
    } catch (e: any) {
      console.log('FLUX error:', e.message);
      return null;
    }
  }

  // Default: Unsplash
  try {
    const query = encodeURIComponent(title.split(' ').slice(0, 4).join(' '));
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}` } }
    );
    const data = await res.json();
    return data.urls?.regular || null;
  } catch {
    return null;
  }
}

// ── Main cron handler ────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('payment_status', 'trial'); // active clients on trial or paid

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  const results = [];
  const errors = [];
  const skipped = [];

  for (const client of clients || []) {
    try {
      // ── Check how many blogs to generate today for this client ──
      const count = blogsToGenerateToday(client.frequency || 'weekly');

      if (count === 0) {
        skipped.push({ client: client.company_name, reason: `Not scheduled today (plan: ${client.frequency || 'weekly'})` });
        await cronLog('generate-client-blogs', 'skipped', `Not scheduled today (plan: ${client.frequency || 'weekly'})`, client.id, client.company_name);
        continue;
      }

      // ── Get recent blog titles to avoid repetition ──
      const { data: recentBlogs } = await supabase
        .from('client_blogs')
        .select('title')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(15);

      const recentTitles = (recentBlogs || []).map((b: any) => b.title);

      // ── Get trending topics for this client's industry ──
      const trendingTopics = await getTrendingTopics(
        client.industry,
        client.target_audience || 'general audience'
      );

      // ── Generate the required number of blogs ──
      for (let i = 0; i < count; i++) {
        // Pick a fresh topic for each blog
        const topic = await pickBestTopic(trendingTopics, [...recentTitles], client);
        recentTitles.push(topic); // avoid repeating within same batch

        // Generate the blog
        const parsed = await generateBlog(client, topic);

        // Fetch cover image
        const cover_image = await getCoverImage(client, parsed.title);

        // Build slug
        const slug = parsed.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          + '-' + Date.now();

        // Save to Supabase
        const { error: insertError } = await supabase.from('client_blogs').insert({
          client_id: client.id,
          title: parsed.title,
          slug,
          description: parsed.description,
          content: parsed.content,
          cover_image: cover_image || null,
          status: 'pending',
        });

        if (insertError) throw new Error(insertError.message);

        // Notify client only on first blog of the batch
        if (i === 0) {
          await sendBlogReadyEmail(client, parsed.title);
        }

        results.push({ client: client.company_name, title: parsed.title });
        await cronLog('generate-client-blogs', 'success', `Blog generated: ${parsed.title}`, client.id, client.company_name, { title: parsed.title, slug });
      }
    } catch (e: any) {
      errors.push({ client: client.company_name, error: e.message });
      await cronLog('generate-client-blogs', 'failed', e.message, client.id, client.company_name, { error: e.message });
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    generated: results.length,
    skippedCount: skipped.length,
    results,
    skipped,
    errors,
  });
}
