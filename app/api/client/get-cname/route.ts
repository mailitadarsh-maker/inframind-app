import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain');
  if (!domain) return NextResponse.json({ cname: 'cname.vercel-dns.com' });

  try {
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/verify?teamId=${process.env.VERCEL_TEAM_ID}`,
      { method: 'POST', headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` } }
    );
    const data = await res.json();
    // Find the CNAME value from verification array
    const cnameRecord = data?.verification?.find((v: any) => v.type === 'CNAME');
    const cname = cnameRecord?.value || '4d5fdad973050b0a.vercel-dns-017.com';
    return NextResponse.json({ cname });
  } catch {
    return NextResponse.json({ cname: '4d5fdad973050b0a.vercel-dns-017.com' });
  }
}
