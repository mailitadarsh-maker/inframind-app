import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data } = await supabase.from('app_settings').select('*');
  const settings: Record<string, string> = {};
  (data || []).forEach((r: any) => { settings[r.key] = r.value; });
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await supabase.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() });
  }
  return NextResponse.json({ success: true });
}
