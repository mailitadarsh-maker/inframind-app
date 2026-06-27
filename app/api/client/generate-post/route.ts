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

    // Step 2: Pinterest-quality prompt with dominant 3D hero object
    const industryHero: Record<string, string> = {
      technology: 'a massive glowing 3D server rack with neon blue light beams shooting upward, holographic data panels floating around it, circuit board ground, cyberpunk atmosphere',
      finance: 'a giant golden 3D coin stack with light rays bursting through, floating bar chart bars made of glass, dark marble floor reflection, luxury financial aesthetic',
      health: 'a large glowing 3D DNA double helix floating center, soft blue and white particle clouds, clean medical aesthetic, depth of field bokeh background',
      education: 'a glowing open 3D book with light rays emanating from pages, floating graduation cap, golden particle dust, deep space starfield background',
      marketing: 'a giant 3D megaphone exploding with colorful particles and social icons, dynamic light streaks, vibrant energy burst, bold advertising aesthetic',
      retail: 'a luxury 3D product podium with spotlight, gold particle bokeh floating around, glossy reflective dark surface, premium brand showcase lighting',
      food: 'a beautifully lit 3D dish centerpiece with steam rising, cinematic dark moody background, golden hour warm lighting, bokeh restaurant ambiance',
      monitoring: 'a large glowing 3D shield with circuit patterns, neon green uptime graph lines, server tower silhouettes, dark tech background with blue glow',
      infrastructure: 'a massive glowing 3D network node cluster, green status indicators, dark server room background, holographic uptime metrics floating around',
      default: 'a dramatic 3D geometric crystal floating center with internal light refraction, neon glow rings around it, deep dark background, luxury tech aesthetic',
    };
    const industryKey = (client.industry || '').toLowerCase();
    const heroTheme = Object.keys(industryHero).find(k => industryKey.includes(k)) || 'default';
    const heroVisual = industryHero[heroTheme];

    // Detect if brand is light or dark based on primary color
    const isLightBrand = ['#f', '#e', '#d', '#c', '#b', '#ff', '#fe', '#fd', '#fc', '#fb', '#fa', '#df', '#de', '#dd', '#dc', '#db', '#da', 'gold', 'yell', 'fff', 'ffd', 'ffe', 'deca', 'f1af'].some(l => primary.toLowerCase().includes(l));
    console.log('Brand colors — primary:', primary, '| secondary:', secondary, '| isLightBrand:', isLightBrand);

    // Convert hex to readable color name for flux (flux responds better to color words than hex codes)
    const colorDesc = (hex: string) => {
      const h = hex.toLowerCase().replace('#','');
      if (h.startsWith('ff') || h.startsWith('fd') || h.startsWith('fe')) return 'bright golden yellow';
      if (h.startsWith('d4af') || h.startsWith('ffd7') || h.startsWith('ffc') || h.includes('gold')) return 'rich gold';
      if (h.startsWith('f') && parseInt(h[1],16) < 8) return 'warm amber gold';
      if (h.startsWith('1a') || h.startsWith('0a') || h.startsWith('00')) return 'deep navy black';
      return 'warm golden';
    };
    const primaryDesc = colorDesc(primary);
    const fullPosterPrompt = isLightBrand
      ? `Luxury fintech poster background. ${primaryDesc} warm gradient, darker at bottom. CENTER-RIGHT: large prominent stack of 3D gold coins or gold bars, occupying upper-right quadrant, realistic metallic reflections, soft drop shadow, floating above surface. Coins are BIG and clearly visible. Lower-left area intentionally darker and empty for text. Studio lighting, premium minimal. No text, no people, no phones, no logos.`
      : `Premium fintech poster background. ${heroVisual} centered right. ${primaryDesc} glow lighting. Dark background, cinematic. Empty left side for text. 3D render, photorealistic. No text, no logos, no people.`;

    // Step 3: Generate poster — NVIDIA FLUX (schnell → dev), no fallback
    let image_url: string | null = null;
    let imageProvider = '';
    let generationError = '';
    try {
      const width = isStory ? 1024 : 1024;
      const height = isStory ? 1344 : 1024;
      let imageBuffer: any = null;

      const nvConfigs = [
        { url: 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', body: { prompt: fullPosterPrompt, width, height, seed: Math.floor(Math.random() * 9999), steps: 4 } },
        { url: 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev', body: { prompt: fullPosterPrompt, mode: 'base', cfg_scale: 3.5, width, height, seed: Math.floor(Math.random() * 9999), steps: 30 } },
      ];
      for (const { url, body } of nvConfigs) {
        if (imageBuffer) break;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout
          const fluxRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          console.log(`Post image ${url.split('/').pop()} status:`, fluxRes.status);
          if (fluxRes.ok) {
            const fluxData = await fluxRes.json();
            const b64 = fluxData.artifacts?.[0]?.base64 ?? fluxData[0]?.base64 ?? fluxData.image;
            if (b64) { imageBuffer = Buffer.from(b64, 'base64'); imageProvider = 'nvidia_flux'; console.log('Image: NVIDIA', url.split('/').pop()); }
          } else {
            const errText = await fluxRes.text().catch(() => '');
            console.log('NVIDIA error body:', errText.slice(0, 500));
          }
        } catch(e) { generationError = 'NVIDIA failed: ' + String(e); console.log('Post image endpoint failed:', url, e); }
      }
      if (!imageBuffer) {
        console.log('Post image: NVIDIA failed, falling back to Pollinations');
        const encodedPrompt = encodeURIComponent(fullPosterPrompt.slice(0, 500));
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const polRes = await fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random()*99999)}`);
            console.log(`Pollinations attempt ${attempt} status:`, polRes.status);
            if (polRes.ok) { imageBuffer = Buffer.from(await polRes.arrayBuffer()); imageProvider = 'pollinations'; console.log('Image: Pollinations OK'); break; }
            else if (attempt < 2) { await new Promise(r => setTimeout(r, 2000)); }
          } catch(e) { if (attempt < 2) await new Promise(r => setTimeout(r, 2000)); }
        }
      }

      if (imageBuffer) {
        // Resize to exact dimensions so SVG overlay matches
        imageBuffer = await sharp(imageBuffer).resize(width, height, { fit: 'cover' }).toBuffer();

        // Step 4: Overlay logo if client has one
        if (client.logo_url) {
          try {
            const logoRes = await fetch(client.logo_url);
            const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
            const posterMeta = await sharp(imageBuffer).metadata();
            const posterW = (posterMeta.width || 1024);
            const logoMaxW = Math.round(posterW * 0.22);
            const logoMaxH = Math.round(posterW * 0.10);
            const resizedLogo = await sharp(logoBuffer)
              .resize(logoMaxW, logoMaxH, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
              .png()
              .toBuffer();
            const logoMeta = await sharp(resizedLogo).metadata();
            const logoLeft = posterW - (logoMeta.width || logoMaxW) - 32;
            imageBuffer = (await sharp(imageBuffer as any)
              .composite([{ input: resizedLogo, top: 32, left: logoLeft, blend: 'over' }])
              .jpeg({ quality: 95 })
              .toBuffer()) as any;
          } catch(e) { console.log('Logo overlay error:', e); }
        }

        // Premium Sharp text overlay with dark panel, drop shadows, visual hierarchy
        const websiteClean = (client.website || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
        const hl = concept.headline || '';
        const fontSize = hl.length > 30 ? 58 : hl.length > 20 ? 68 : 80;
        // Dynamic spacing: calculate headline line count first, then flow subtext + CTA below it
        const hlWords = hl.split(' ');
        const maxCharsHL = fontSize > 68 ? 12 : fontSize > 58 ? 15 : 18;
        let hlLines = 0, hlCurrent = '';
        for (const w of hlWords) {
          if ((hlCurrent + ' ' + w).trim().length > maxCharsHL && hlCurrent) { hlLines++; hlCurrent = w; }
          else { hlCurrent = (hlCurrent + ' ' + w).trim(); }
        }
        if (hlCurrent) hlLines++;
        const hlStartY = Math.round(height * 0.28);
        const hlEndY = hlStartY + hlLines * Math.round(fontSize * 1.15);
        const subtextStartY = hlEndY + 28;
        const panelY = Math.round(height * 0.22);
        const panelH = Math.round(height * 0.65);
        const ctaY = subtextStartY + 80;

          .jpeg({ quality: 95 })
          .toBuffer()) as any;

        const fileName = `social-${client_id}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from('brand-images')
          .upload(fileName, imageBuffer, { contentType: 'image/jpeg', upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('brand-images').getPublicUrl(fileName);
          image_url = urlData.publicUrl || null;
        }
      }
    } catch(e) { console.log('Image generation error:', String(e)); generationError = String(e); }

    // Step 5: Insert post
    const { data: post, error: insertErr } = await supabase.from('social_posts').insert({
      client_id,
      platform,
      format,
      caption: concept.caption,
      headline: concept.headline || null,
      subtext: concept.subtext || null,
      cta: concept.cta || null,
      image_url,
      image_provider: imageProvider || null,
      generation_error: generationError || null,
      suggestion: suggestion || special_day || null,
      status: 'pending',
      post_type: special_day ? 'special_day' : 'manual',
    }).select('id').single();

    if (insertErr) throw new Error(insertErr.message);

    // Update client with last provider/error for admin visibility
    await supabase.from('clients').update({
      last_social_provider: imageProvider || null,
      last_social_error: generationError || null,
    }).eq('id', client_id);

    return NextResponse.json({ success: true, post_id: post.id, caption: concept.caption, image_url });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
