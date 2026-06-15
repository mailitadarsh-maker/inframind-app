import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, title, description, cover_image, published, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) return NextResponse.json({ posts: [] });
  return NextResponse.json({ posts: data });
}
