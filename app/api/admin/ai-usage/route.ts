import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // e.g. 2025-06

  const startDate = `${month}-01T00:00:00.000Z`;
  const endDate   = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString();

  const { data: logs, error } = await supabase
    .from('generation_logs')
    .select('engine, engine_version, status, cost_usd, tokens, client_id, client_name')
    .gte('created_at', startDate)
    .lt('created_at', endDate);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate by engine
  const engineMap: Record<string, { calls: number; success: number; cost: number; tokens: number; breakdown: Record<string, { calls: number; cost: number }> }> = {};

  for (const log of logs || []) {
    const eng = log.engine || 'unknown';
    if (!engineMap[eng]) engineMap[eng] = { calls: 0, success: 0, cost: 0, tokens: 0, breakdown: {} };
    engineMap[eng].calls++;
    if (log.status === 'success') engineMap[eng].success++;
    engineMap[eng].cost   += log.cost_usd || 0;
    engineMap[eng].tokens += log.tokens   || 0;

    const cname = log.client_name || log.client_id || 'Unknown';
    if (!engineMap[eng].breakdown[cname]) engineMap[eng].breakdown[cname] = { calls: 0, cost: 0 };
    engineMap[eng].breakdown[cname].calls++;
    engineMap[eng].breakdown[cname].cost += log.cost_usd || 0;
  }

  const totalCost    = Object.values(engineMap).reduce((s, e) => s + e.cost, 0);
  const totalTokens  = Object.values(engineMap).reduce((s, e) => s + e.tokens, 0);
  const pendingNvidia = (engineMap['nvidia_flux']?.cost || 0);

  return NextResponse.json({
    month,
    totalCost,
    totalTokens,
    pendingCredits: pendingNvidia,
    engines: engineMap,
  });
}
