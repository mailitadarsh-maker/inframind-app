import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { company_name, industry, target_audience, company_description, tone } = await request.json();
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-4-maverick-17b-128e-instruct',
      max_tokens: 1000,
      messages: [{ role: 'user', content: `Analyze this company and give a punchy content strategy with 3 sections: ## Blog Angle, ## Top 3 Topic Ideas, ## Quick Win. Be specific. Company: ${company_name}, Industry: ${industry}, Audience: ${target_audience}, Description: ${company_description}, Tone: ${tone}.` }]
    })
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || 'Could not load analysis.';
  return NextResponse.json({ analysis: text });
}
