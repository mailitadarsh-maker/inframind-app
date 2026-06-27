import { NextResponse } from 'next/server';
export async function GET() {
  try {
    const res = await fetch('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
    });
    if (res.status === 401) return NextResponse.json({ status: 'invalid_key', message: 'Invalid token (401)', code: 401 });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ status: 'ok', message: `Active — ${data.user?.username || data.user?.email || 'connected'}`, code: 200 });
    }
    return NextResponse.json({ status: 'error', message: `HTTP ${res.status}`, code: res.status });
  } catch(e: any) {
    return NextResponse.json({ status: 'error', message: String(e), code: 0 });
  }
}
