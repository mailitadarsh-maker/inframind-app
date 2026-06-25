import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { company_name, website, industry, target_audience, company_description } = await req.json();

  const prompt = `You are a social media strategist. Analyze this company and provide a detailed social media strategy.

Company: ${company_name}
Industry: ${industry}
Target Audience: ${target_audience || 'General'}
Website: ${website || 'Not provided'}
Description: ${company_description || 'Not provided'}

Also generate 5 specific weekly post topic ideas for this company.

Respond ONLY with valid JSON:
{
  "analysis": {
    "strategy": "2-3 sentence social media strategy overview specific to this company",
    "audience": "1-2 sentence audience insight",
    "tone": "1 sentence tone and style recommendation",
    "best_platforms": ["instagram", "linkedin"],
    "posting_frequency": "Recommended posting frequency"
  },
  "topics": [
    {"title": "Catchy topic title", "description": "One sentence angle", "type": "educational"},
    {"title": "...", "description": "...", "type": "promotional"},
    {"title": "...", "description": "...", "type": "story"},
    {"title": "...", "description": "...", "type": "trend"},
    {"title": "...", "description": "...", "type": "engagement"}
  ],
  "week_theme": "One sentence theme for this week"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: 'Failed to parse' }, { status: 500 });
  }
}
