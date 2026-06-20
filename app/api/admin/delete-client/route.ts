import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function checkAdmin(req: NextRequest) {
  const cookie = req.cookies.get('im_admin')?.value;
  return process.env.ADMIN_PASSWORD && cookie === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { client_id } = await req.json();
  if (!client_id) return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });

  // Get client's custom domain before deleting
  const { data: client } = await supabase
    .from('clients')
    .select('custom_domain')
    .eq('id', client_id)
    .single();

  // Remove domain from Vercel if exists
  if (client?.custom_domain) {
    await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${client.custom_domain}?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
      }
    );
  }

  // Delete all blogs for this client
  await supabase.from('client_blogs').delete().eq('client_id', client_id);

  // Delete the client record
  await supabase.from('clients').delete().eq('id', client_id);

  return NextResponse.json({ success: true });
}
