import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBlogReadyEmail } from '@/lib/notifyClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { client_id } = await request.json();
    if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 });

    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientErr || !client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Enforce trial restrictions using the client's actual row data
    // (blogs_per_month, trial_ends_at, payment_status) rather than hardcoded values,
    // so this respects whatever an admin has set per-client.
    const isTrial = client.payment_status === 'trial' || (!client.payment_status && (client.plan || 'free') === 'free');

    if (isTrial) {
      const trialExpired = client.trial_ends_at
        ? Date.now() >= new Date(client.trial_ends_at).getTime()
        : false;

      if (trialExpired) {
        return NextResponse.json(
          {
            error: 'Your free trial has ended. Upgrade your plan to keep generating blogs.',
            limitReached: true,
          },
          { status: 403 }
        );
      }

      if (client.blogs_per_month !== null && client.blogs_per_month !== undefined) {
        const { count, error: countErr } = await supabase
          .from('client_blogs')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client_id);

        if (countErr) throw new Error(countErr.message);

        if ((count || 0) >= client.blogs_per_month) {
          return NextResponse.json(
            {
              error: `You've used all ${client.blogs_per_month} blogs included in your free trial. Upgrade your plan to keep generating.`,
              limitReached: true,
            },
            { status: 403 }
          );
        }
      }
    }

    // ── Daily blog limit check ──────────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dailyLimit = client.blogs_per_day ?? 4;
    const { count: todayCount } = await supabase
      .from('client_blogs')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client_id)
      .gte('created_at', todayStart.toISOString());
    if ((todayCount || 0) >= dailyLimit) {
      return NextResponse.json({
        error: `Daily limit reached. You can generate up to ${dailyLimit} blogs per day. Try again tomorrow.`,
        limitReached: true,
      }, { status: 429 });
    }

    const { data: recentBlogs } = await supabase
      .from('client_blogs')
      .select('title')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentTitles = (recentBlogs || []).map((b: any) => b.title);
    const avoidBlock = recentTitles.length > 0
      ? 'Avoid these recently covered topics:\n' + recentTitles.map((t: string) => '- ' + t).join('\n')
      : '';

    const descriptionBlock = client.company_description ? `About the company: ${client.company_description}` : '';
    const prompt = `You are writing a blog post for ${client.company_name}, a ${client.industry} company.
Website: ${client.website}
${descriptionBlock}
Target audience: ${client.target_audience || 'general audience'}
Tone: ${client.tone || 'Professional'}

${avoidBlock}

Write a fresh, SEO-optimized blog post highly relevant to their business and industry.
The blog should provide real value to their target audience.

Write in valid HTML using only <h2>, <p>, <ul>, <li>, <strong> tags. 500-700 words.

Respond ONLY with valid JSON, no markdown fences:
{"title": "...", "description": "...", "content": "<p>...</p>..."}`;

    const aiRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-4-maverick-17b-128e-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!aiRes.ok) throw new Error('OpenAI request failed');

    const aiData = await aiRes.json();
    let raw = aiData.choices?.[0]?.message?.content ?? '';
    raw = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    const parsed = JSON.parse(raw);

    const slug = parsed.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    // Generate cover image inline
    let cover_image: string | null = null;
    try {
      const imgPrompt = `Abstract professional photograph related to gold investing and finance, for use as a blog cover image. ${(client.brand_images && client.brand_images.length > 0) ? 'Warm gold tones, premium feel, dark rich backgrounds, cinematic lighting.' : 'Dark background, modern professional aesthetic.'} Photography only, no typography, no text, no words, no letters, no titles, no captions, no watermark, no logos, no signage.`;
      let imgBuffer: Buffer | null = null;

      const nvEndpoints = [
        'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell',
        'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev',
      ];
      for (const endpoint of nvEndpoints) {
        if (imgBuffer) break;
        try {
          const imgRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
            body: JSON.stringify({ prompt: imgPrompt, mode: 'base', cfg_scale: 3.5, width: 1024, height: 1024, seed: Math.floor(Math.random() * 9999), steps: 30 }),
          });
          console.log(`Blog image ${endpoint.split('/').pop()} status:`, imgRes.status);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            const b64 = imgData.artifacts?.[0]?.base64;
            if (b64) { imgBuffer = Buffer.from(b64, 'base64'); console.log('Blog image: NVIDIA', endpoint.split('/').pop()); }
          }
        } catch(e) { console.log('Blog image endpoint failed:', endpoint, e); }
      }
      if (!imgBuffer) {
        console.log('Blog image: NVIDIA failed, falling back to Pollinations');
        const encodedPrompt = encodeURIComponent(imgPrompt.slice(0, 500));
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const polRes = await fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*99999)}`);
            console.log(`Pollinations blog attempt ${attempt} status:`, polRes.status);
            if (polRes.ok) { imgBuffer = Buffer.from(await polRes.arrayBuffer()); console.log('Blog image: Pollinations OK'); break; }
            else if (attempt < 2) { await new Promise(r => setTimeout(r, 2000)); }
          } catch(e) { if (attempt < 2) await new Promise(r => setTimeout(r, 2000)); }
        }
      }

      if (imgBuffer) {
        const fileName = `blog-${client.id}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage.from('brand-images').upload(fileName, imgBuffer, { contentType: 'image/jpeg', upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('brand-images').getPublicUrl(fileName);
          cover_image = urlData.publicUrl || null;
        }
      }
    } catch(e) { console.log('Blog image error:', e); }

    const { error: insertErr } = await supabase.from('client_blogs').insert({
      client_id,
      title: parsed.title,
      slug,
      description: parsed.description,
      content: parsed.content,
      status: 'pending',
      cover_image,
    });

    if (insertErr) throw new Error(insertErr.message);

    await sendBlogReadyEmail(client, parsed.title);

    return NextResponse.json({ success: true, title: parsed.title });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
