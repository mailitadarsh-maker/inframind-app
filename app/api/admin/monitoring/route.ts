import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const client_id = searchParams.get('client_id');
  const status    = searchParams.get('status');
  const type      = searchParams.get('type');
  const engine    = searchParams.get('engine');
  const limit     = parseInt(searchParams.get('limit') || '50');

  let query = supabase
    .from('generation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (client_id) query = query.eq('client_id', client_id);
  if (status)    query = query.eq('status', status);
  if (type)      query = query.eq('type', type);
  if (engine)    query = query.eq('engine', engine);

  const { data: logs, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Stats
  const total   = logs?.length || 0;
  const success = logs?.filter(l => l.status === 'success').length || 0;
  const failed  = logs?.filter(l => l.status === 'failed').length || 0;
  const skipped = logs?.filter(l => l.status === 'skipped').length || 0;
  const totalCost = logs?.reduce((s, l) => s + (l.cost_usd || 0), 0) || 0;

  // Clients list for filter
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, image_engine, content_engine, active')
    .order('company_name');

  return NextResponse.json({ logs, stats: { total, success, failed, skipped, totalCost }, clients });
}
