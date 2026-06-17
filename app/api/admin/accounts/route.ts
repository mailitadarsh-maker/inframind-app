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

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const { data: clients } = await supabase.from('clients').select('*');
  const { data: monitors } = await supabase.from('monitors').select('*');
  const { data: blogCounts } = await supabase.from('client_blogs').select('client_id, status');

  const blogStatsByClient: Record<string, { total: number; published: number; pending: number }> = {};
  (blogCounts || []).forEach((b: any) => {
    if (!blogStatsByClient[b.client_id]) blogStatsByClient[b.client_id] = { total: 0, published: 0, pending: 0 };
    blogStatsByClient[b.client_id].total++;
    if (b.status === 'published') blogStatsByClient[b.client_id].published++;
    if (b.status === 'pending') blogStatsByClient[b.client_id].pending++;
  });

  const clientsByUser: Record<string, any> = {};
  (clients || []).forEach((c: any) => { clientsByUser[c.user_id] = c; });

  const monitorsByUser: Record<string, any[]> = {};
  (monitors || []).forEach((m: any) => {
    if (!monitorsByUser[m.user_id]) monitorsByUser[m.user_id] = [];
    monitorsByUser[m.user_id].push(m);
  });

  const accounts = usersData.users.map((u: any) => {
    const client = clientsByUser[u.id] || null;
    const userMonitors = monitorsByUser[u.id] || [];

    const products: string[] = [];
    if (client) products.push('blog');
    if (userMonitors.length > 0) products.push('monitoring');

    return {
      user_id: u.id,
      email: u.email,
      signed_up_at: u.created_at,
      products,
      client: client ? { ...client, blog_stats: blogStatsByClient[client.id] || { total: 0, published: 0, pending: 0 } } : null,
      monitors: {
        count: userMonitors.length,
        online: userMonitors.filter((m: any) => m.status === 'online').length,
        offline: userMonitors.filter((m: any) => m.status === 'offline').length,
        list: userMonitors.map((m: any) => ({ id: m.id, name: m.name, type: m.type, target_url: m.target_url, status: m.status })),
      },
    };
  });

  accounts.sort((a: any, b: any) => new Date(b.signed_up_at).getTime() - new Date(a.signed_up_at).getTime());

  return NextResponse.json({ accounts });
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
