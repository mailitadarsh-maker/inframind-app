'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  description: string
  cover_image?: string | null
  published: boolean
  created_at: string
}

const ACCENTS = [
  { bg: 'linear-gradient(145deg, #071c14 0%, #0d3324 100%)', glow: '#34d399', tag: '#34d399' },
  { bg: 'linear-gradient(145deg, #0a0720 0%, #160d3a 100%)', glow: '#a78bfa', tag: '#a78bfa' },
  { bg: 'linear-gradient(145deg, #00111f 0%, #001e38 100%)', glow: '#38bdf8', tag: '#38bdf8' },
  { bg: 'linear-gradient(145deg, #130020 0%, #220038 100%)', glow: '#e879f9', tag: '#e879f9' },
  { bg: 'linear-gradient(145deg, #1a0a00 0%, #2d1500 100%)', glow: '#fb923c', tag: '#fb923c' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ height: 480, background: '#0d0f14' }} />
  if (posts.length === 0) return null

  const featured = posts[0]
  const rest = posts.slice(1, 3)
  const fa = ACCENTS[0]

  return (
    <section id="blog" style={{ background: '#0d0f14', padding: '96px 0 88px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .bs-featured { transition: transform .25s ease, box-shadow .25s ease; }
        .bs-featured:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,0.5) !important; }
        .bs-card { transition: transform .2s ease, border-color .2s ease; }
        .bs-card:hover { transform: translateY(-3px); }
        .bs-card:hover .bs-arrow { gap: 10px; }
        .bs-arrow { display: inline-flex; align-items: center; gap: 6px; transition: gap .18s; }
        @media (max-width: 900px) {
          .bs-grid { flex-direction: column !important; }
          .bs-featured-wrap { width: 100% !important; }
          .bs-side { width: 100% !important; flex-direction: row !important; gap: 12px !important; }
          .bs-side-card { flex: 1 !important; }
        }
        @media (max-width: 600px) {
          .bs-side { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(52,211,153,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: 9999, padding: '4px 14px', marginBottom: 16 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#34d399' }}>From the blog</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff' }}>
              Stay ahead of{' '}
              <span style={{ background: 'linear-gradient(90deg, #34d399, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                every outage.
              </span>
            </h2>
            <p style={{ margin: '10px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
              Guides and insights on monitoring, uptime, and keeping your apps healthy.
            </p>
          </div>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: 13, fontWeight: 600, textDecoration: 'none', background: 'rgba(52,211,153,0.05)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            All articles
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>

        <div className="bs-grid" style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
          <div className="bs-featured-wrap" style={{ width: '55%', flexShrink: 0 }}>
            <Link href={`/blog/${featured.slug}`} className="bs-featured" style={{ display: 'block', textDecoration: 'none', height: '100%', borderRadius: 20, border: `1px solid ${fa.glow}33`, background: fa.bg, overflow: 'hidden', boxShadow: `0 0 50px ${fa.glow}12`, position: 'relative' }}>
              <div style={{ height: 240, position: 'relative', overflow: 'hidden', background: fa.bg }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="bsfg" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke={fa.glow} strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#bsfg)"/>
                </svg>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: fa.glow, opacity: 0.12, filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: -20, left: 60, width: 120, height: 120, borderRadius: '50%', background: fa.glow, opacity: 0.08, filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                  <span style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: `1px solid ${fa.glow}44`, borderRadius: 9999, padding: '4px 12px 4px 9px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: fa.glow, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: fa.glow, boxShadow: `0 0 8px ${fa.glow}` }} />
                    Featured
                  </span>
                </div>
              </div>
              <div style={{ padding: '24px 28px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: fa.tag, background: `${fa.tag}15`, border: `1px solid ${fa.tag}25`, borderRadius: 5, padding: '3px 8px' }}>Monitoring</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{formatDate(featured.created_at)}</span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: '0 0 12px', letterSpacing: '-0.02em' }}>{featured.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, margin: '0 0 22px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{featured.description}</p>
                <span className="bs-arrow" style={{ fontSize: 13, fontWeight: 700, color: fa.tag }}>
                  Read more
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </Link>
          </div>

          <div className="bs-side" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rest.length === 0 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                More posts coming soon
              </div>
            )}
            {rest.map((post, i) => {
              const a = ACCENTS[i + 1]
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="bs-card bs-side-card" style={{ display: 'block', textDecoration: 'none', flex: 1, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: 100, position: 'relative', overflow: 'hidden', background: a.bg }}>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
                      <defs><pattern id={`bss${i}`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke={a.glow} strokeWidth="0.5"/></pattern></defs>
                      <rect width="100%" height="100%" fill={`url(#bss${i})`}/>
                    </svg>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: a.glow, opacity: 0.1, filter: 'blur(30px)' }} />
                  </div>
                  <div style={{ padding: '16px 18px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: a.tag, background: `${a.tag}15`, border: `1px solid ${a.tag}25`, borderRadius: 4, padding: '2px 7px' }}>Monitoring</span>
                      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.2)' }}>{formatDate(post.created_at)}</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.4, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{post.title}</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{post.description}</p>
                    <span className="bs-arrow" style={{ fontSize: 12, fontWeight: 700, color: a.tag }}>
                      Read more
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </div>
                </Link>
              )
            })}
            <div style={{ borderRadius: 16, border: '1px solid rgba(52,211,153,0.15)', background: 'linear-gradient(135deg, rgba(52,211,153,0.05) 0%, rgba(34,197,94,0.03) 100%)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>Get notified when we publish</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>Join hundreds of teams monitoring smarter with InfraMind.</p>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#34d399', textDecoration: 'none', marginTop: 2 }}>
                Start free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
