import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: 'test',
        width: 256,
        height: 256,
        seed: 1,
        num_inference_steps: 1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 402) {
      return NextResponse.json({ status: 'exhausted', message: 'Credits exhausted (402)', code: 402 });
    }
    if (res.status === 401) {
      return NextResponse.json({ status: 'invalid_key', message: 'Invalid API key (401)', code: 401 });
    }
    if (res.ok) {
      return NextResponse.json({ status: 'ok', message: 'Credits available', code: res.status });
    }
    const body = await res.text().catch(() => '');
    return NextResponse.json({ status: 'error', message: `HTTP ${res.status}: ${body.slice(0, 100)}`, code: res.status });
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return NextResponse.json({ status: 'timeout', message: 'Request timed out (10s)', code: 0 });
    }
    return NextResponse.json({ status: 'error', message: String(e), code: 0 });
  }
}
