import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { blog_id, title, client } = await request.json();

  try {
    const imgPrompt = `Professional blog cover image for "${title}". Company: ${client.company_name}, Industry: ${client.industry}. ${(client.brand_images && client.brand_images.length > 0) ? 'Warm gold tones, premium feel, dark rich backgrounds, cinematic lighting.' : 'Dark background, modern professional aesthetic.'} Clean composition, no text, no logos.`;

    const imgRes = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
      body: JSON.stringify({ prompt: imgPrompt, width: 1024, height: 1024 }),
    });

    const imgData = await imgRes.json();
    const b64 = imgData.artifacts?.[0]?.base64;

    if (!b64) return NextResponse.json({ error: 'No image returned', raw: imgData }, { status: 500 });

    const buffer = Buffer.from(b64, 'base64');
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
