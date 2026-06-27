import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET all clients with their engine settings
export async function GET() {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, industry, plan, image_engine, content_engine, social_posts_per_day')
    .order('company_name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data });
}

// PATCH to update engine for a client
export async function PATCH(request: Request) {
  const { client_id, image_engine, content_engine } = await request.json();
  if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 });

  const updates: any = {};
  if (image_engine)   updates.image_engine   = image_engine;
  if (content_engine) updates.content_engine = content_engine;

  const { error } = await supabase.from('clients').update(updates).eq('id', client_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
