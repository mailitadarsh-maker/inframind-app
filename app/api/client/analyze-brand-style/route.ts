import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { image_urls, company_name, industry, client_id } = await req.json();

  if (!image_urls?.length) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }

  // Build image content for Claude Vision
  const imageContent = image_urls.slice(0, 5).map((url: string) => ({
    type: 'image',
    source: { type: 'url', url },
  }));

  const prompt = `You are a brand visual strategist. Analyse these ${image_urls.length} reference images for ${company_name} (${industry}).

Extract:
1. Visual style (2-3 adjectives like "minimalist", "bold", "warm", "editorial")
2. Color mood (warm/cool/neutral/vibrant)
3. Photography style (studio/lifestyle/outdoor/product/abstract)
4. Lighting style (bright/moody/natural/dramatic)
5. Best FLUX image generation style suffix (20-25 words that would make AI images match this brand visual style)

Return ONLY valid JSON:
{
  "styleKeywords": ["minimalist", "warm", "professional"],
  "colorMood": "warm",
  "photoStyle": "lifestyle",
  "lightingStyle": "natural",
  "fluxStyleSuffix": "warm natural lighting, lifestyle photography, soft bokeh background, premium brand aesthetic, clean composition",
  "brandSummary": "One sentence describing the visual brand identity"
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: [...imageContent, { type: 'text', text: prompt }] }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Save brand style to client record
    if (client_id) {
      await supabase.from('clients').update({
        brand_style_keywords: parsed.styleKeywords,
        brand_color_mood: parsed.colorMood,
        brand_photo_style: parsed.photoStyle,
        brand_flux_suffix: parsed.fluxStyleSuffix,
        brand_summary: parsed.brandSummary,
      }).eq('id', client_id);
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
