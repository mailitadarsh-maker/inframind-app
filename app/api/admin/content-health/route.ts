import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ data: posts }, { data: blogs }, { data: clients }, { data: cronLogs }] = await Promise.all([
    supabase.from('social_posts').select('id,client_id,platform,format,status,image_url,image_provider,generation_error,created_at').order('created_at', { ascending: false }).limit(200),
    supabase.from('client_blogs').select('id,client_id,title,status,cover_image,created_at').order('created_at', { ascending: false }).limit(200),
    supabase.from('clients').select('id,company_name'),
    supabase.from('cron_logs').select('*').order('created_at', { ascending: false }).limit(50),
  ]);

  const clientMap: Record<string, string> = {};
  (clients || []).forEach((c: any) => { clientMap[c.id] = c.company_name; });

  const enriched_posts = (posts || []).map((p: any) => ({ ...p, client_name: clientMap[p.client_id] || p.client_id }));
  const enriched_blogs = (blogs || []).map((b: any) => ({ ...b, client_name: clientMap[b.client_id] || b.client_id }));

  const postSummary = {
    total: enriched_posts.length,
    with_image: enriched_posts.filter((p: any) => p.image_url).length,
    no_image: enriched_posts.filter((p: any) => !p.image_url).length,
    nvidia: enriched_posts.filter((p: any) => p.image_provider === 'nvidia_flux').length,
    pollinations: enriched_posts.filter((p: any) => p.image_provider === 'pollinations').length,
    errors: enriched_posts.filter((p: any) => p.generation_error).length,
  };

  const blogSummary = {
    total: enriched_blogs.length,
    with_image: enriched_blogs.filter((b: any) => b.cover_image).length,
    no_image: enriched_blogs.filter((b: any) => !b.cover_image).length,
    pending: enriched_blogs.filter((b: any) => b.status === 'pending').length,
    approved: enriched_blogs.filter((b: any) => b.status === 'approved').length,
    published: enriched_blogs.filter((b: any) => b.status === 'published').length,
  };

  const lastPost = enriched_posts[0] || null;
  const lastBlogCron = (cronLogs || []).find((l: any) => l.cron_job === 'generate-client-blogs') || null;
  const lastIncidentCron = (cronLogs || []).find((l: any) => l.cron_job?.includes('incident') || l.message?.toLowerCase().includes('incident')) || null;
  const todayPosts = enriched_posts.filter((p: any) => new Date(p.created_at) >= today);
  const todayBlogs = enriched_blogs.filter((b: any) => new Date(b.created_at) >= today);

  const systemHealth = {
    image: {
      last_provider: lastPost?.image_provider || null,
      last_error: lastPost?.generation_error || null,
      last_at: lastPost?.created_at || null,
      today_total: todayPosts.length,
      today_success: todayPosts.filter((p: any) => p.image_url).length,
      today_fail: todayPosts.filter((p: any) => !p.image_url).length,
    },
    blogs: {
      last_status: lastBlogCron?.status || null,
      last_message: lastBlogCron?.message || null,
      last_at: lastBlogCron?.created_at || null,
      today_generated: todayBlogs.length,
    },
    incidents: {
      last_status: lastIncidentCron?.status || null,
      last_message: lastIncidentCron?.message || null,
      last_at: lastIncidentCron?.created_at || null,
    },
  };

  return NextResponse.json({ posts: enriched_posts, blogs: enriched_blogs, postSummary, blogSummary, systemHealth });
}
