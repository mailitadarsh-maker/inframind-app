import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { blog_id } = await request.json();

  const { data: blog } = await supabase
    .from('client_blogs')
    .select('title, client_id')
    .eq('id', blog_id)
    .single();

  if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, industry, brand_images, regen_limit')
    .eq('id', blog.client_id)
    .single();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const regenLimit = client?.regen_limit ?? 3;
  const { count: regenCount } = await supabase
    .from('client_blogs')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', blog.client_id)
    .not('cover_image', 'is', null)
    .gte('updated_at', todayStart.toISOString());
  if ((regenCount || 0) >= regenLimit) {
    return NextResponse.json({
      error: `Daily image regeneration limit reached (${regenLimit}/day). Try again tomorrow.`,
    }, { status: 429 });
  }

  const hasBrandImages = client?.brand_images?.length > 0;
  const prompt = `Professional blog cover image for "${blog.title}". Company: ${client?.company_name}, Industry: ${client?.industry}. ${hasBrandImages ? 'Warm gold tones, premium feel, dark rich backgrounds, cinematic lighting.' : 'Dark background, modern professional aesthetic.'} Clean composition, no text, no logos, no watermarks.`;

  const res = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      mode: 'base',
      cfg_scale: 3.5,
      width: 1536,
      height: 1024,
      seed: Math.floor(Math.random() * 9999),
      steps: 30,
    }),
  });

  const data = await res.json();
  console.log('NVIDIA regen response status:', res.status, JSON.stringify(data).slice(0, 200));
  const b64 = data.artifacts?.[0]?.base64;
  if (!b64) return NextResponse.json({ error: 'Image generation failed: ' + JSON.stringify(data).slice(0, 200) }, { status: 500 });

  const buffer = Buffer.from(b64, 'base64');
  const fileName = `blog-regen-${client?.id}-${Date.now()}.jpg`;
  await supabase.storage.from('brand-images').upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });
  const { data: urlData } = supabase.storage.from('brand-images').getPublicUrl(fileName);
  const cover_image = urlData.publicUrl;

  await supabase.from('client_blogs').update({ cover_image }).eq('id', blog_id);

  return NextResponse.json({ cover_image });
}
