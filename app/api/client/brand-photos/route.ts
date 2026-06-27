import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { industry, company_name } = await req.json();

  // Fetch Pexels photos based on industry
  const query = encodeURIComponent(`${industry} business professional`);
  const pexelsRes = await fetch(
    `https://api.pexels.com/v1/search?query=${query}&per_page=9&orientation=landscape`,
    { headers: { Authorization: process.env.PEXELS_API_KEY! } }
  );
  const pexelsData = await pexelsRes.json();
  const photos = (pexelsData.photos || []).map((p: any) => ({
    id: p.id,
    url: p.src.large,
    thumb: p.src.medium,
    photographer: p.photographer,
  }));

  return NextResponse.json({ photos });
}
