import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: Promise<{ clientSlug: string }> }) {
  const { clientSlug } = await params;

  // Find client by slug
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, company_name, website')
    .eq('slug', clientSlug)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Get published blogs
  const { data: blogs, error: blogsError } = await supabase
    .from('client_blogs')
    .select('id, title, content, slug, created_at')
    .eq('client_id', client.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (blogsError) {
    return NextResponse.json({ error: blogsError.message }, { status: 500 });
  }

  const res = NextResponse.json({ client, blogs: blogs || [] });
  res.headers.set('Access-Control-Allow-Origin', '*');
  return res;
}
