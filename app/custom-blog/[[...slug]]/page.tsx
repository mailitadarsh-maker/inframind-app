import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This page handles requests from custom domains like blog.goldvaulttrading.com/some-post
// The middleware rewrites those requests here and passes the domain via x-custom-domain header.

export async function generateMetadata() {
  return { title: '' }; // overridden per client below
}

export default async function CustomBlogPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const headersList = await headers();
  const customDomain = headersList.get('x-custom-domain');

  if (!customDomain) notFound();

  // Find client by custom_domain
  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, website, slug')
    .eq('custom_domain', customDomain)
    .single();

  if (!client) notFound();

  const { slug: slugParts } = await params;
  const blogSlug = slugParts?.[0];

  // No slug = show blog listing
  if (!blogSlug) {
    const { data: blogs } = await supabase
      .from('client_blogs')
      .select('id, title, content, slug, created_at')
      .eq('client_id', client.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    return <BlogListing client={client} blogs={blogs || []} domain={customDomain} />;
  }

  // Has slug = show single blog post
  const { data: blog } = await supabase
    .from('client_blogs')
    .select('id, title, content, slug, created_at')
    .eq('client_id', client.id)
    .eq('slug', blogSlug)
    .eq('status', 'published')
    .single();

  if (!blog) notFound();

  return <BlogPost client={client} blog={blog} />;
}

function BlogListing({ client, blogs, domain }: { client: any; blogs: any[]; domain: string }) {
  return (
    <>
      <SharedStyles title={`${client.company_name} Blog`} />
      <div style={{ minHeight: '100vh', background: '#fafaf9' }}>
        <header className="blog-header">
          <a href={client.website} target="_blank" rel="noopener noreferrer" className="blog-header-brand">
            {client.company_name}
          </a>
          <a href={client.website} target="_blank" rel="noopener noreferrer" className="blog-header-back">
            <span>←</span> Back to website
          </a>
        </header>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <h1 style={{ fontFamily: '-apple-system, sans-serif', fontSize: 28, fontWeight: 700, color: '#1c1917', marginBottom: 32 }}>
            Blog
          </h1>
          {blogs.length === 0 ? (
            <p style={{ fontFamily: 'sans-serif', color: '#78716c', fontSize: 15 }}>No posts published yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {blogs.map(blog => {
                const date = new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                const excerpt = (blog.content || '').replace(/<[^>]*>/g, '').slice(0, 140);
                return (
                  <a key={blog.id} href={`/${blog.slug}`} className="blog-card-link">
                    <div className="blog-card">
                      <p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#a8a29e', marginBottom: 8 }}>{date}</p>
                      <h2 style={{ fontFamily: '-apple-system, sans-serif', fontSize: 20, fontWeight: 700, color: '#1c1917', marginBottom: 10, lineHeight: 1.3 }}>{blog.title}</h2>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#57534e', lineHeight: 1.7, marginBottom: 14 }}>{excerpt}...</p>
                      <span style={{ fontFamily: 'sans-serif', fontSize: 13, fontWeight: 600, color: '#10b981' }}>Read article →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <SharedFooter />
      </div>
    </>
  );
}

function BlogPost({ client, blog }: { client: any; blog: any }) {
  const date = new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const readingTime = Math.ceil((blog.content || '').replace(/<[^>]*>/g, '').split(' ').length / 200);

  return (
    <>
      <SharedStyles title={`${client.company_name} - ${blog.title}`} />
      <div style={{ minHeight: '100vh', background: '#fafaf9' }}>
        <header className="blog-header">
          <a href={client.website} target="_blank" rel="noopener noreferrer" className="blog-header-brand">
            {client.company_name}
          </a>
          <a href="/" className="blog-header-back">
            <span>←</span> All posts
          </a>
        </header>

        <div className="blog-hero">
          <div className="blog-hero-inner">
            <div className="blog-meta">
              <span className="blog-meta-date">{date}</span>
              <span className="blog-meta-dot" />
              <span className="blog-meta-read">{readingTime} min read</span>
            </div>
            <h1 className="blog-title">{blog.title}</h1>
          </div>
        </div>

        <div className="blog-body">
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        <SharedFooter />
      </div>
    </>
  );
}

function SharedStyles({ title }: { title?: string }) {
  return (
    <>
    {title && <title>{title}</title>}
    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #fafaf9; }
      .blog-header { background:#fff;border-bottom:1px solid #e7e5e4;padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10; }
      .blog-header-brand { font-family:-apple-system,sans-serif;font-weight:700;font-size:16px;color:#1c1917;text-decoration:none; }
      .blog-header-back { font-family:-apple-system,sans-serif;font-size:13px;color:#78716c;text-decoration:none;display:flex;align-items:center;gap:6px; }
      .blog-header-back:hover { color:#1c1917; }
      .blog-card-link { text-decoration: none; }
      .blog-card { background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:28px;cursor:pointer;transition:box-shadow 0.15s; }
      .blog-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.08); }
      .blog-hero { background:#fff;border-bottom:1px solid #e7e5e4;padding:56px 24px 48px; }
      .blog-hero-inner { max-width:720px;margin:0 auto; }
      .blog-meta { display:flex;align-items:center;gap:12px;margin-bottom:20px; }
      .blog-meta-date,.blog-meta-read { font-family:-apple-system,sans-serif;font-size:13px;color:#78716c; }
      .blog-meta-dot { width:3px;height:3px;border-radius:50%;background:#d6d3d1; }
      .blog-title { font-family:Georgia,serif;font-size:clamp(28px,5vw,42px);font-weight:700;color:#1c1917;line-height:1.2;letter-spacing:-0.02em; }
      .blog-body { max-width:720px;margin:0 auto;padding:48px 24px 80px; }
      .blog-content { font-family:Georgia,serif;font-size:19px;color:#292524;line-height:1.85; }
      .blog-content h2 { font-family:-apple-system,sans-serif;font-size:24px;font-weight:700;color:#1c1917;margin-top:48px;margin-bottom:16px;line-height:1.3; }
      .blog-content h3 { font-family:-apple-system,sans-serif;font-size:20px;font-weight:600;color:#1c1917;margin-top:36px;margin-bottom:12px; }
      .blog-content p { margin-bottom:24px; }
      .blog-content ul,
      .blog-content ol { padding-left:28px;margin-bottom:24px; }
      .blog-content li { margin-bottom:10px; }
      .blog-content strong { color:#1c1917;font-weight:700; }
      .blog-content blockquote { border-left:3px solid #d6d3d1;padding:4px 0 4px 20px;margin:32px 0;color:#57534e;font-style:italic; }
      @media(max-width:640px) { .blog-hero{padding:36px 20px 32px;} .blog-body{padding:32px 20px 60px;} .blog-content{font-size:17px;} }
    `}</style>
    </>
  );
}

function SharedFooter() {
  return null;
}
