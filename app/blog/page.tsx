import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Blog | InfraMind',
  description: 'Tips, guides, and updates on uptime monitoring, API health, SSL certificates, and keeping your apps running.',
  alternates: { canonical: 'https://inframindhq.online/blog' },
};

export const revalidate = 60;

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  cover_image: string | null;
  created_at: string;
}

const FEATURES = [
  {
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" fill="#34d399"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
    title: '24/7 uptime monitoring',
    desc: 'Checks every 30 seconds. First to know when anything goes wrong.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10h2l2-6 3 12 2-8 2 4h3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
    title: 'AI incident reports',
    desc: 'Plain-English explanations of what broke and exactly how to fix it.',
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="6" width="14" height="10" rx="2" stroke="#34d399" strokeWidth="1.5"/><path d="M7 6V5a3 3 0 016 0v1" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/></svg>`,
    title: 'SSL & API monitoring',
    desc: 'Track certificate expiry and API health in one dashboard.',
  },
];

const BG_DARKS = ['#071c14', '#0a0720', '#1a0a00'];
const BG_LIGHTS = ['#0d3324', '#160d3a', '#2d1500'];
const GLOWS = ['#34d399', '#a78bfa', '#fb923c'];

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <main style={{ background: '#0d0f14', minHeight: '100vh' }}>

      {/* Sticky nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,15,20,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1ddb78', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polyline points="12 3 5.5 10 2 6.5" stroke="#07090d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>InfraMind</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginLeft: 2 }}>/ Blog</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              Log in
            </Link>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, color: '#071c14', background: '#34d399', textDecoration: 'none', padding: '7px 18px', borderRadius: 8 }}>
              Start free →
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px 80px' }}>
        {/* Page header */}
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 9999, padding: '4px 14px', marginBottom: 18 }}>
          Blog
        </span>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
          Insights on uptime, APIs &amp; SSL
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, lineHeight: 1.7, margin: '0 0 48px' }}>
          Practical guides to keep your apps running — written in plain English, no oncall engineer needed.
        </p>

        {/* Feature strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 40 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.025)', padding: '22px 24px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                dangerouslySetInnerHTML={{ __html: f.icon }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo CTA */}
        <div style={{ borderRadius: 14, border: '1px solid rgba(52,211,153,0.15)', background: 'rgba(52,211,153,0.04)', padding: '26px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 56 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 5 }}>See InfraMind catch a real outage</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', maxWidth: 440, lineHeight: 1.6 }}>
              Watch how AI detects downtime, diagnoses the root cause, and sends a plain-English alert — in under 60 seconds.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 8, background: '#34d399', color: '#071c14', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Try it free →
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Log in
            </Link>
          </div>
        </div>

        {/* Post grid */}
        {(!posts || posts.length === 0) && (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No posts yet. Check back soon.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {posts?.map((post: BlogPost, i: number) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}
            >
              {post.cover_image ? (
                <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ height: 120, background: `linear-gradient(145deg, ${BG_DARKS[i % 3]} 0%, ${BG_LIGHTS[i % 3]} 100%)`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, borderRadius: '50%', background: GLOWS[i % 3], opacity: 0.12, filter: 'blur(25px)' }} />
                </div>
              )}
              <div style={{ padding: '16px 20px 20px' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.4 }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, margin: '0 0 14px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                  {post.description}
                </p>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Read more
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
