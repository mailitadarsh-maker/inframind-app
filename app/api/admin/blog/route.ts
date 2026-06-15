import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('slug, title, description, content, cover_image, published, created_at')
    .order('created_at', { ascending: false });

  return NextResponse.json({ data, error });
}

export async function PATCH(request: Request) {
  const { slug, published, cover_image } = await request.json();
  const updateData: Record<string, unknown> = {};
  if (published !== undefined) updateData.published = published;
  if (cover_image !== undefined) updateData.cover_image = cover_image;

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .update(updateData)
    .eq('slug', slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { slug } = await request.json();

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('slug', slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}