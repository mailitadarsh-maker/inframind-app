import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { blog_id } = await req.json();
    if (!blog_id) {
      return NextResponse.json({ error: 'Missing blog_id' }, { status: 400 });
    }

    const { data: blog, error: blogError } = await supabase
      .from('client_blogs')
      .select('*, clients(*)')
      .eq('id', blog_id)
      .single();

    if (blogError || !blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const client = blog.clients;
    if (!client?.wordpress_url || !client?.wordpress_username || !client?.wordpress_app_password) {
      return NextResponse.json({ error: 'WordPress not configured for this client' }, { status: 400 });
    }

    const wpUrl = client.wordpress_url.replace(/\/$/, '') + '/wp-json/wp/v2/posts';
    const auth = Buffer.from(`${client.wordpress_username}:${client.wordpress_app_password}`).toString('base64');

    const wpRes = await fetch(wpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        title: blog.title,
        content: blog.content,
        status: 'publish',
      }),
    });

    const wpData = await wpRes.json();

    if (!wpRes.ok) {
      return NextResponse.json({ error: wpData.message || 'WordPress publish failed' }, { status: 500 });
    }

    // Save the WP post link back for reference
    await supabase
      .from('client_blogs')
      .update({ wordpress_post_url: wpData.link, wordpress_post_id: wpData.id })
      .eq('id', blog_id);

    return NextResponse.json({ success: true, wordpress_url: wpData.link });
  } catch (e: any) {
    console.error('wordpress-publish error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
