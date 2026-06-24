import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_name, website, industry, target_audience, tone, company_description } = body;

    const prompt = `You are a senior content strategist and social media expert. Analyze this company and return a JSON content strategy covering both blogs and social media.

Company: ${company_name}
Website: ${website}
Industry: ${industry}
Target Audience: ${target_audience || 'general audience'}
Tone: ${tone || 'Professional'}
Description: ${company_description || 'Not provided'}

Return ONLY a valid JSON object with exactly these fields:
{
  "content_summary": "2-3 sentence overview of the content strategy you recommend for both blogs and social media",
  "suggested_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "suggested_topics": [
    { "title": "Blog title 1", "why": "One sentence reason this topic works for their audience" },
    { "title": "Blog title 2", "why": "One sentence reason this topic works for their audience" },
    { "title": "Blog title 3", "why": "One sentence reason this topic works for their audience" }
  ],
  "social_post_ideas": [
    { "platform": "instagram", "format": "post", "caption_preview": "A compelling 1-2 sentence Instagram caption idea with 2-3 hashtags that fits this brand" },
    { "platform": "linkedin", "format": "post", "caption_preview": "A professional LinkedIn post idea highlighting a key insight or value proposition for this company" },
    { "platform": "twitter", "format": "post", "caption_preview": "A punchy Twitter/X post under 200 chars with 1-2 hashtags that would resonate with their audience" }
  ],
  "tone_recommendation": "One sentence advice on tone based on their industry and audience",
  "audience_insight": "One sentence insight about what their target audience actually wants to read",
  "suggested_description": "An improved SEO-optimized version of their company description"
}`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-4-maverick-17b-128e-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || '';
    text = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const analysis = JSON.parse(text);

    return NextResponse.json({ analysis });
  } catch (e: any) {
    console.error('analyze-company error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
