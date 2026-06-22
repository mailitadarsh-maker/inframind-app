import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('slug', 'goldvault-app')
    .single();

  if (!client) return NextResponse.json([]);

  if (slug) {
    const { data: blog } = await supabase
      .from('client_blogs')
      .select('*')
      .eq('client_id', client.id)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!blog) return NextResponse.json(null, { status: 404 });

    return NextResponse.json({
      _id: blog.id,
      title: blog.title,
      excerpt: (blog.content || '').replace(/<[^>]*>/g, '').slice(0, 200) + '...',
      date: new Date(blog.created_at).toISOString().split('T')[0],
      imageUrl: blog.cover_image || 'https://inframindhq.online/og-image.png',
      slug: blog.slug,
      content: blog.content,
    });
  }

  const { data: blogs } = await supabase
    .from('client_blogs')
    .select('*')
    .eq('client_id', client.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const formatted = (blogs || []).map(blog => ({
    _id: blog.id,
    title: blog.title,
    excerpt: (blog.content || '').replace(/<[^>]*>/g, '').slice(0, 200) + '...',
    date: new Date(blog.created_at).toISOString().split('T')[0],
    imageUrl: blog.cover_image || 'https://inframindhq.online/og-image.png',
    slug: blog.slug,
  }));

  return NextResponse.json(formatted);
}
