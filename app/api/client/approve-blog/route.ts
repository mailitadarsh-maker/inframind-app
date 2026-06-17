import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { blog_id, action } = await req.json();

    if (!blog_id || !action) {
      return NextResponse.json({ error: 'Missing blog_id or action' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const update = action === 'approve'
      ? { status: 'published', approved_at: new Date().toISOString() }
      : { status: 'rejected', rejected_at: new Date().toISOString() };

    const { error } = await supabase
      .from('client_blogs')
      .update(update)
      .eq('id', blog_id);

    if (error) throw error;

    let wordpress_result: any = null;

    // If approved, check delivery mode and push to WordPress if configured
    if (action === 'approve') {
      const { data: blog } = await supabase
        .from('client_blogs')
        .select('client_id, clients(delivery_mode, wordpress_url, wordpress_username, wordpress_app_password)')
        .eq('id', blog_id)
        .single();

      const client: any = blog?.clients;

      if (client?.delivery_mode === 'wordpress' && client?.wordpress_url && client?.wordpress_username && client?.wordpress_app_password) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://inframindhq.online';
          const wpRes = await fetch(`${baseUrl}/api/client/wordpress-publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blog_id }),
          });
          wordpress_result = await wpRes.json();
        } catch (wpErr: any) {
          wordpress_result = { error: wpErr.message };
        }
      }
    }

    return NextResponse.json({ success: true, wordpress_result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
