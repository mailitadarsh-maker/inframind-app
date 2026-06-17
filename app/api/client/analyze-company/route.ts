import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_name, website, industry, target_audience, tone, company_description } = body;

    const prompt = `You are a senior content strategist. Analyze this company and return a JSON content strategy.

Company: ${company_name}
Website: ${website}
Industry: ${industry}
Target Audience: ${target_audience || 'general audience'}
Tone: ${tone || 'Professional'}
Description: ${company_description || 'Not provided'}

Return ONLY a valid JSON object with exactly these fields:
{
  "content_summary": "2-3 sentence overview of the content strategy you recommend",
  "suggested_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "suggested_topics": [
    { "title": "Blog title 1", "why": "One sentence reason this topic works for their audience" },
    { "title": "Blog title 2", "why": "One sentence reason this topic works for their audience" },
    { "title": "Blog title 3", "why": "One sentence reason this topic works for their audience" }
  ],
  "tone_recommendation": "One sentence advice on tone based on their industry and audience",
  "audience_insight": "One sentence insight about what their target audience actually wants to read",
  "suggested_description": "An improved SEO-optimized version of their company description"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const analysis = JSON.parse(text);

    return NextResponse.json({ analysis });
  } catch (e: any) {
    console.error('analyze-company error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
