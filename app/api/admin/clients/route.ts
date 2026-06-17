import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function checkAdmin(req: NextRequest) {
  const cookie = req.cookies.get('im_admin')?.value;
  return !!process.env.ADMIN_PASSWORD && cookie === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get blog counts per client
  const { data: blogCounts } = await supabase
    .from('client_blogs')
    .select('client_id, status');

  const counts: Record<string, { total: number; published: number; pending: number }> = {};
  (blogCounts || []).forEach((b: any) => {
    if (!counts[b.client_id]) counts[b.client_id] = { total: 0, published: 0, pending: 0 };
    counts[b.client_id].total++;
    if (b.status === 'published') counts[b.client_id].published++;
    if (b.status === 'pending') counts[b.client_id].pending++;
  });

  const enriched = (clients || []).map((c: any) => ({
    ...c,
    blog_stats: counts[c.id] || { total: 0, published: 0, pending: 0 },
  }));

  return NextResponse.json({ clients: enriched });
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { client_id, updates } = body;

  if (!client_id || !updates) {
    return NextResponse.json({ error: 'Missing client_id or updates' }, { status: 400 });
  }

  const allowedFields = ['plan', 'blogs_per_month', 'payment_status', 'notes', 'trial_ends_at'];
  const safeUpdates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  const { error } = await supabase
    .from('clients')
    .update(safeUpdates)
    .eq('id', client_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
