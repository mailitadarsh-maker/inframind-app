import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Daily regen cap for the company blog (no per-client limit table here, so hardcode a sane default).
const REGEN_LIMIT = 5;

export async function POST(request: Request) {
  const { blog_id } = await request.json();

  const { data: blog } = await supabase
    .from('blog_posts')
    .select('id, title, description')
    .eq('id', blog_id)
    .single();

  if (!blog) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: regenCount } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .not('cover_image', 'is', null)
    .gte('updated_at', todayStart.toISOString());
  if ((regenCount || 0) >= REGEN_LIMIT) {
    return NextResponse.json({
      error: `Daily image regeneration limit reached (${REGEN_LIMIT}/day). Try again tomorrow.`,
    }, { status: 429 });
  }

  // Single-brand company blog — fixed Inframind style suffix instead of per-client brand_flux_suffix.
  const styleSuffix = ', dark rich background, sleek AI/tech aesthetic, cinematic lighting, premium modern feel';
  const prompt = `Professional blog cover image for "${blog.title}". ${blog.description ? `Topic: ${blog.description}. ` : ''}Context: Inframind, an AI automation and software agency${styleSuffix}. Clean composition. CRITICAL: NO TEXT, NO WORDS, NO LETTERS, no logos, no watermarks.`;

  let buffer: Buffer | null = null;
  const nvEndpoints = [
    { url: 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', body: { prompt, width: 1344, height: 768, seed: Math.floor(Math.random() * 9999), steps: 4 } },
    { url: 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev', body: { prompt, mode: 'base', cfg_scale: 3.5, width: 1344, height: 768, seed: Math.floor(Math.random() * 9999), steps: 30 } },
  ];
  for (const cfg of nvEndpoints) {
    if (buffer) break;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` },
        body: JSON.stringify(cfg.body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('NVIDIA blog-post regen status:', cfg.url.split('/').pop(), res.status);
      if (res.ok) {
        const data = await res.json();
        const b64 = data.artifacts?.[0]?.base64;
        if (b64) buffer = Buffer.from(b64, 'base64');
      } else {
        console.log('NVIDIA blog-post regen error body:', (await res.text()).slice(0, 300));
      }
    } catch (e) { console.log('NVIDIA blog-post regen failed:', cfg.url, e); }
  }
  if (!buffer) {
    console.log('Regen blog-post image: NVIDIA failed, falling back to Pollinations');
    const encodedPrompt = encodeURIComponent(prompt.slice(0, 500));
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const polRes = await fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=1344&height=768&nologo=true&seed=${Math.floor(Math.random()*99999)}`);
        if (polRes.ok) { buffer = Buffer.from(await polRes.arrayBuffer()); console.log('Regen blog-post image: Pollinations OK'); break; }
      } catch (e) { if (attempt < 2) await new Promise(r => setTimeout(r, 2000)); }
    }
  }
  if (!buffer) return NextResponse.json({ error: 'Image generation failed on all providers' }, { status: 500 });

  const fileName = `blog-post-regen-${blog.id}-${Date.now()}.jpg`;
  await supabase.storage.from('brand-images').upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('brand-images').getPublicUrl(fileName);
  const cover_image = urlData.publicUrl;

  await supabase.from('blog_posts').update({ cover_image, updated_at: new Date().toISOString() }).eq('id', blog_id);

  return NextResponse.json({ cover_image });
}
