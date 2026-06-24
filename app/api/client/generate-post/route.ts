import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { client_id, platform, format, suggestion, special_day } = await request.json();
    if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 });

    const { data: client } = await supabase.from('clients').select('*').eq('id', client_id).single();
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Daily limit check
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const { count: todayCount } = await supabase
      .from('social_posts').select('*', { count: 'exact', head: true })
      .eq('client_id', client_id).gte('created_at', todayStart.toISOString());
    if ((todayCount || 0) >= (client.social_posts_per_day ?? 4)) {
      return NextResponse.json({ error: 'Daily post limit reached.', limitReached: true }, { status: 429 });
    }

    // Fetch all previous headlines to prevent duplicates
    const { data: prevPosts } = await supabase
      .from('social_posts')
      .select('caption, headline')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })
      .limit(50);

    const usedHeadlines = (prevPosts || [])
      .map((p: any) => p.headline || p.caption?.slice(0, 60))
      .filter(Boolean);

    // Random content angle to force variety
    const contentAngles = [
      'Share a surprising industry stat or fact',
      'Highlight a specific client pain point and solution',
      'Show a before/after transformation story',
      'Feature a unique product benefit most people overlook',
      'Share a behind-the-scenes insight about the company',
      'Post a bold industry prediction or opinion',
      'Highlight a customer success outcome',
      'Share a quick actionable tip for the target audience',
      'Challenge a common industry myth',
      'Announce or tease an upcoming feature or offer',
    ];
    const angle = contentAngles[Math.floor(Math.random() * contentAngles.length)];

    const isStory = format === 'story';
    const primary = client.brand_primary_color || '#ffffff';
    const secondary = client.brand_secondary_color || '#000000';
    const platformGuide: Record<string,string> = {
      instagram: 'Instagram: engaging, 150-200 chars, 5-8 hashtags',
      linkedin: 'LinkedIn: professional, 200-300 chars, 3-5 hashtags',
      twitter: 'Twitter/X: punchy, under 260 chars, 2-3 hashtags',
    };

    // Step 1: Generate poster concept + caption via Llama
    const conceptPrompt = `You are a professional social media designer and copywriter for ${client.company_name}, a ${client.industry} company.
Brand colors: Primary ${primary}, Secondary ${secondary}
Tone: ${client.tone || 'Professional'}
Platform: ${platformGuide[platform] || platform}
Format: ${isStory ? 'Vertical Story (9:16)' : 'Square Post (1:1)'}
${special_day ? `This is a special day poster for: ${special_day}` : ''}
${suggestion ? `Client direction: ${suggestion}` : ''}
Company: ${client.company_description || ''}
Target audience: ${client.target_audience || ''}
${client.website ? `Website: ${client.website}` : ''}
${client.brand_images?.length > 0 ? 'They have uploaded brand reference images showing their visual style.' : ''}

Content angle for THIS post (must follow this): ${angle}

STRICT RULES:
- The headline MUST be completely different from ALL of these previously used headlines: ${usedHeadlines.length > 0 ? usedHeadlines.map(h => `"${h}"`).join(', ') : 'none yet'}
- Never use generic phrases like "Elevate", "Transform", "Empower", "Unlock", "Discover" unless truly unique in context
- Be specific to the company, industry, and content angle above
- Every generation must feel fresh and different

Design a professional social media poster. Return ONLY valid JSON:
{
  "headline": "Bold 4-8 word headline that goes ON the poster image (large text)",
  "subtext": "1 short line of supporting text on the poster (10-15 words max)",
  "cta": "Short call to action button text (2-4 words)",
  "caption": "Full social media post caption with hashtags for ${platform}",
  "poster_prompt": "Extremely detailed FLUX image generation prompt for a professional ${isStory ? 'vertical 9:16' : 'square 1:1'} social media poster. Include: exact background style using colors ${primary} and ${secondary}, 3D visual elements relevant to ${client.industry}, bold typography placement areas, cinematic lighting, premium quality. The poster must have visible bold text '${client.company_name}' and a headline area. Style like top Pinterest social media designs. No watermarks. 8K quality photorealistic poster design."
}`;

    const aiRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
      body: JSON.stringify({
        model: 'meta/llama-4-maverick-17b-128e-instruct',
        messages: [{ role: 'user', content: conceptPrompt }],
        temperature: 0.95,
        max_tokens: 800,
      }),
    });

    const aiData = await aiRes.json();
    let raw = aiData.choices?.[0]?.message?.content ?? '';
    raw = raw.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const concept = JSON.parse(raw);

    // Step 2: Build the full poster prompt
    const fullPosterPrompt = `Professional social media advertising poster design, NOT a photograph, graphic design artwork. 
${isStory ? 'Vertical 9:16 story format' : 'Square 1:1 post format'}.
Background: bold gradient or solid color using ${primary} as dominant color with ${secondary} accents.
Large bold white typography headline text "${concept.headline}" centered on poster.
Small subtext line "${concept.subtext}" below headline.
Bottom section: CTA button shape with text "${concept.cta}", website text "${client.website || ''}".
Top area: small company name text "${client.company_name}".
Visual style: premium ${client.industry} brand advertisement, geometric shapes, subtle 3D elements or icons relevant to ${client.industry}, cinematic lighting effects, luxury feel.
Style reference: high-end Pinterest social media poster, Canva Pro template quality, bold typography layout.
NOT a stock photo. This is a DESIGNED POSTER with text and graphics. Sharp edges, clean layout, professional advertising design.
Color palette: primary ${primary}, secondary ${secondary}, white text, dark shadows for depth.`;

    // Step 3: Generate poster via FLUX
    let image_url: string | null = null;
    try {
      const imgRes = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
        body: JSON.stringify({
          prompt: fullPosterPrompt,
          width: isStory ? 1024 : 1024,
          height: isStory ? 1344 : 1024,
        }),
      });
      const imgData = await imgRes.json();
      const b64 = imgData.artifacts?.[0]?.base64;

      if (b64) {
        let imageBuffer: any = Buffer.from(b64, 'base64');

        // Step 4: Overlay logo if client has one
        if (client.logo_url) {
          try {
            const logoRes = await fetch(client.logo_url);
            const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
            const posterMeta = await sharp(imageBuffer).metadata();
            const logoSize = Math.round((posterMeta.width || 1024) * 0.18);
            const resizedLogo = await sharp(logoBuffer)
              .resize(logoSize, logoSize, { fit: 'inside' })
              .png()
              .toBuffer();
            imageBuffer = (await sharp(imageBuffer as any)
              .composite([{ input: resizedLogo, top: 28, left: 28, blend: 'over' }])
              .jpeg({ quality: 95 })
              .toBuffer()) as any;
          } catch(e) { console.log('Logo overlay error:', e); }
        }

        const fileName = `social-${client_id}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from('brand-images')
          .upload(fileName, imageBuffer, { contentType: 'image/jpeg', upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('brand-images').getPublicUrl(fileName);
          image_url = urlData.publicUrl || null;
        }
      }
    } catch(e) { console.log('Image error:', e); }

    // Step 5: Insert post
    const { data: post, error: insertErr } = await supabase.from('social_posts').insert({
      client_id,
      platform,
      format,
      caption: concept.caption,
      headline: concept.headline || null,
      image_url,
      suggestion: suggestion || special_day || null,
      status: 'pending',
      post_type: special_day ? 'special_day' : 'manual',
    }).select('id').single();

    if (insertErr) throw new Error(insertErr.message);
    return NextResponse.json({ success: true, post_id: post.id, caption: concept.caption, image_url });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
