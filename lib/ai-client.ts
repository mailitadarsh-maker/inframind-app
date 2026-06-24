import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getGlobalProvider(service: 'blogs' | 'social'): Promise<'nvidia' | 'openai'> {
  const key = service === 'blogs' ? 'ai_provider_blogs' : 'ai_provider_social';
  const { data } = await supabase.from('app_settings').select('value').eq('key', key).single();
  return (data?.value as 'nvidia' | 'openai') || 'nvidia';
}

export async function getAIProvider(service: 'blogs' | 'social', clientId?: string): Promise<'nvidia' | 'openai'> {
  if (clientId) {
    const col = service === 'blogs' ? 'ai_provider_blogs' : 'ai_provider_social';
    const { data } = await supabase.from('clients').select(col).eq('id', clientId).single();
    const override = (data as any)?.[col];
    if (override && override !== 'global') return override as 'nvidia' | 'openai';
  }
  return getGlobalProvider(service);
}

export async function callAI(prompt: string, maxTokens = 1000, service: 'blogs' | 'social' = 'blogs', clientId?: string): Promise<string> {
  const provider = await getAIProvider(service, clientId);

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } else {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` },
      body: JSON.stringify({ model: 'meta/llama-4-maverick-17b-128e-instruct', messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens, temperature: 0.7 }),
    });
    const data = await res.json();
    let text = data.choices?.[0]?.message?.content?.trim() || '';
    return text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  }
}
