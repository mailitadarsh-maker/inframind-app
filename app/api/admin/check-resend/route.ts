import { NextResponse } from 'next/server';
export async function GET() {
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    if (res.status === 401) return NextResponse.json({ status: 'invalid_key', message: 'Invalid API key (401)', code: 401 });
    if (res.ok)             return NextResponse.json({ status: 'ok', message: 'API key active', code: 200 });
    return NextResponse.json({ status: 'error', message: `HTTP ${res.status}`, code: res.status });
  } catch(e: any) {
    return NextResponse.json({ status: 'error', message: String(e), code: 0 });
  }
}
