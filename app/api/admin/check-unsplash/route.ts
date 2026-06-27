import { NextResponse } from 'next/server';
export async function GET() {
  try {
    const res = await fetch(`https://api.unsplash.com/photos/random?client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`);
    if (res.status === 401) return NextResponse.json({ status: 'invalid_key', message: 'Invalid API key (401)', code: 401 });
    if (res.status === 403) return NextResponse.json({ status: 'rate_limited', message: 'Rate limited / quota exceeded (403)', code: 403 });
    if (res.ok)             return NextResponse.json({ status: 'ok', message: 'API key active', code: 200 });
    return NextResponse.json({ status: 'error', message: `HTTP ${res.status}`, code: res.status });
  } catch(e: any) {
    return NextResponse.json({ status: 'error', message: String(e), code: 0 });
  }
}
