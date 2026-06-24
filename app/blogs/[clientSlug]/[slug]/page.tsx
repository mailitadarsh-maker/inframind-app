import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function BlogPage({ params }: { params: Promise<{ clientSlug: string; slug: string }> }) {
  const { clientSlug, slug } = await params;

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, website')
    .eq('slug', clientSlug)
    .single();

  if (!client) notFound();

  const { data: blog } = await supabase
    .from('client_blogs')
    .select('id, title, content, slug, created_at, cover_image')
    .eq('client_id', client.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!blog) notFound();

  const date = new Date(blog.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const readingTime = Math.ceil((blog.content || '').replace(/<[^>]*>/g, '').split(' ').length / 200);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafaf9; }

        .blog-header {
          background: #fff;
          border-bottom: 1px solid #e7e5e4;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .blog-header-brand {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #1c1917;
          text-decoration: none;
          letter-spacing: -0.01em;
        }
        .blog-header-back {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          color: #78716c;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
        }
        .blog-header-back:hover { color: #1c1917; }

        .blog-hero {
          background: #fff;
          border-bottom: 1px solid #e7e5e4;
          padding: 56px 24px 48px;
        }
        .blog-hero-inner {
          max-width: 720px;
          margin: 0 auto;
        }
        .blog-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .blog-meta-date {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          color: #78716c;
        }
        .blog-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #d6d3d1;
        }
        .blog-meta-read {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          color: #78716c;
        }
        .blog-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 700;
          color: #1c1917;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .blog-body {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }
        .blog-content {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 19px;
          color: #292524;
          line-height: 1.85;
        }
        .blog-content h1,
        .blog-content h2,
        .blog-content h3 {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1c1917;
          margin-top: 48px;
          margin-bottom: 16px;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }
        .blog-content h2 { font-size: 24px; font-weight: 700; }
        .blog-content h3 { font-size: 20px; font-weight: 600; }
        .blog-content p { margin-bottom: 24px; }
        .blog-content ul, .blog-content ol {
          padding-left: 28px;
          margin-bottom: 24px;
        }
        .blog-content li { margin-bottom: 10px; }
        .blog-content strong { color: #1c1917; font-weight: 700; }
        .blog-content a { color: #0d9488; text-decoration: underline; }
        .blog-content blockquote {
          border-left: 3px solid #d6d3d1;
          padding: 4px 0 4px 20px;
          margin: 32px 0;
          color: #57534e;
          font-style: italic;
        }

        .blog-footer {
          border-top: 1px solid #e7e5e4;
          padding: 32px 24px;
          text-align: center;
          background: #fff;
        }
        .blog-footer p {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          color: #a8a29e;
        }
        .blog-footer a {
          color: #10b981;
          text-decoration: none;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .blog-hero { padding: 36px 20px 32px; }
          .blog-body { padding: 32px 20px 60px; }
          .blog-content { font-size: 17px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9' }}>

        {/* Header */}
        <header className="blog-header">
          <a href={client.website} target="_blank" rel="noopener noreferrer" className="blog-header-brand">
            {client.company_name}
          </a>
          <a href={client.website} target="_blank" rel="noopener noreferrer" className="blog-header-back">
            <span>←</span> Back to website
          </a>
        </header>

        {/* Hero */}
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

        {/* Cover Image */}
        {blog.cover_image && (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
            <img
              src={blog.cover_image}
              alt={blog.title}
              style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 12, marginTop: 36, display: 'block' }}
            />
          </div>
        )}

        {/* Content */}
        <div className="blog-body">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {/* Footer */}
        <footer className="blog-footer">
          <p>
            Content powered by{' '}
            <a href="https://inframindhq.online" target="_blank" rel="noopener noreferrer">
              InfraMind
            </a>
          </p>
        </footer>

      </div>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ clientSlug: string; slug: string }> }) {
  const { clientSlug, slug } = await params;

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('slug', clientSlug)
    .single();

  if (!client) return {};

  const { data: blog } = await supabase
    .from('client_blogs')
    .select('title, content, cover_image')
    .eq('client_id', client.id)
    .eq('slug', slug)
    .single();

  if (!blog) return {};

  const description = (blog.content || '').replace(/<[^>]*>/g, '').slice(0, 160);

  return {
    title: `${blog.title} | ${client.company_name}`,
    description,
    openGraph: {
      title: blog.title,
      description,
      type: 'article',
    },
  };
}
