import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('cron_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const summary = {
    total: data?.length || 0,
    success: data?.filter(r => r.status === 'success').length || 0,
    failed: data?.filter(r => r.status === 'failed').length || 0,
    skipped: data?.filter(r => r.status === 'skipped').length || 0,
    last_run: data?.[0]?.created_at || null,
  };

  return NextResponse.json({ logs: data, summary });
}
