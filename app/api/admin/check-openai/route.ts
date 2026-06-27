import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: controller.signal,
    });

    if (res.status === 401) return NextResponse.json({ status: 'invalid_key', message: 'Invalid API key (401)', code: 401 });
    if (res.status === 429) return NextResponse.json({ status: 'rate_limited', message: 'Rate limited or quota exceeded (429)', code: 429 });
    if (res.ok)             return NextResponse.json({ status: 'ok', message: 'API key active, credits available', code: 200 });
    const body = await res.text().catch(() => '');
    return NextResponse.json({ status: 'error', message: `HTTP ${res.status}: ${body.slice(0,100)}`, code: res.status });
  } catch(e: any) {
    if (e.name === 'AbortError') return NextResponse.json({ status: 'timeout', message: 'Timed out (10s)', code: 0 });
    return NextResponse.json({ status: 'error', message: String(e), code: 0 });
  }
}
