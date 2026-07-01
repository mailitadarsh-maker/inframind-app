import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { blog_id, title, client } = await request.json();

  try {
    const styleSuffix = client.brand_flux_suffix ? `, ${client.brand_flux_suffix}` : (client.brand_images && client.brand_images.length > 0 ? ', warm gold tones, premium feel, dark rich backgrounds, cinematic lighting' : ', dark background, modern professional aesthetic');
    const imgPrompt = `Professional blog cover image for "${title}". Company: ${client.company_name}, Industry: ${client.industry}${styleSuffix}. Clean composition. CRITICAL: NO TEXT, NO WORDS, NO LETTERS, no logos.`;

    let buffer: Buffer | null = null;
    const nvEndpoints = [
      { url: 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', body: { prompt: imgPrompt, width: 1344, height: 768, seed: Math.floor(Math.random() * 9999), steps: 4 } },
      { url: 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev', body: { prompt: imgPrompt, mode: 'base', cfg_scale: 3.5, width: 1344, height: 768, seed: Math.floor(Math.random() * 9999), steps: 30 } },
    ];
    for (const cfg of nvEndpoints) {
      if (buffer) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        const imgRes = await fetch(cfg.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
          body: JSON.stringify(cfg.body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log('NVIDIA generate-image status:', cfg.url.split('/').pop(), imgRes.status);
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const b64 = imgData.artifacts?.[0]?.base64;
          if (b64) buffer = Buffer.from(b64, 'base64');
        } else {
          console.log('NVIDIA generate-image error body:', (await imgRes.text()).slice(0, 300));
        }
      } catch (e) { console.log('NVIDIA generate-image failed:', cfg.url, e); }
    }
    if (!buffer) {
      console.log('generate-image: NVIDIA failed, falling back to Pollinations');
      const encodedPrompt = encodeURIComponent(imgPrompt.slice(0, 500));
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const polRes = await fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=1344&height=768&nologo=true&seed=${Math.floor(Math.random()*99999)}`);
          if (polRes.ok) { buffer = Buffer.from(await polRes.arrayBuffer()); console.log('generate-image: Pollinations OK'); break; }
        } catch (e) { if (attempt < 2) await new Promise(r => setTimeout(r, 2000)); }
      }
    }
    if (!buffer) return NextResponse.json({ error: 'Image generation failed on all providers' }, { status: 500 });
    const fileName = `flux-${client.id}-${Date.now()}.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from('brand-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

    const { data: urlData } = supabase.storage.from('brand-images').getPublicUrl(fileName);
    await supabase.from('client_blogs').update({ cover_image: urlData.publicUrl }).eq('id', blog_id);

    return NextResponse.json({ ok: true, cover_image: urlData.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
