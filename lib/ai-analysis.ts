import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getIncidentAIProvider(clientId?: string): Promise<'nvidia' | 'openai'> {
  if (clientId) {
    const { data } = await supabase.from('clients').select('ai_provider_incidents').eq('id', clientId).single();
    if (data?.ai_provider_incidents && data.ai_provider_incidents !== 'global') {
      return data.ai_provider_incidents as 'nvidia' | 'openai';
    }
  }
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'ai_provider_incidents').single();
  return (data?.value as 'nvidia' | 'openai') || 'nvidia';
}

export async function generateIncidentAnalysis(
  target: string,
  statusCode: number,
  errorMessage: string,
  monitorType: string = "website",
  clientId?: string
) {
  const typeContext: Record<string, string> = {
    website: "website/HTTP endpoint",
    api:     "REST API endpoint",
    ssl:     "SSL/TLS certificate",
    tcp:     "TCP port/service",
    ping:    "ping/ICMP host",
  };

  const context = typeContext[monitorType] ?? "infrastructure endpoint";

  const prompt = `
You are a senior SRE. Analyze this ${context} failure:
Target: ${target}
Status Code: ${statusCode > 0 ? statusCode : "N/A"}
Error: ${errorMessage}

Instructions:
1. Provide a deep, insightful analysis of WHY this failed. Explain the technical root cause in simple, plain English.
2. Provide a 3-5 step numbered checklist of EXACTLY what to do to fix it. Each step must be on a new line.
3. Be specific (e.g., mention DNS, SSL handshakes, server load, or firewall blocks).

Return ONLY raw JSON in this exact format with no markdown or backticks:
{
  "cause": "2-sentence explanation of why it happened.",
  "action": "1. [Step 1]\n2. [Step 2]\n3. [Step 3]",
  "severity": "low|medium|high|critical"
}
  `.trim();

  const provider = await getIncidentAIProvider(clientId);

  try {
    let content = '';

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 500 }),
      });
      const data = await res.json();
      content = data.choices?.[0]?.message?.content?.trim() || '';
    } else {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
        body: JSON.stringify({ model: 'meta/llama-4-maverick-17b-128e-instruct', messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 500 }),
      });
      const data = await res.json();
      content = data.choices?.[0]?.message?.content?.trim() || '';
    }

    const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      cause: 'The service is currently unreachable.',
      action: '1. Verify your server is online.\n2. Check your DNS and firewall settings.\n3. Review your last deployment logs.',
      severity: 'high',
    };
  }
}
