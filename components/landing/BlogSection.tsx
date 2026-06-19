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
  { bg: 'linear-gradient(145deg, #1a0a00 0%, #2d1500 100%)', glow: '#fb923c', tag: '#fb923c' },
  { bg: 'linear-gradient(145deg, #00111f 0%, #001e38 100%)', glow: '#38bdf8', tag: '#38bdf8' },
  { bg: 'linear-gradient(145deg, #130020 0%, #220038 100%)', glow: '#e879f9', tag: '#e879f9' },
]

function readTime(desc: string) {
  const words = desc?.split(' ').length ?? 0
  return `${Math.max(2, Math.ceil(words / 200))} min read`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CardCoverArt({ accent, size = 'lg' }: { accent: typeof ACCENTS[0]; size?: 'lg' | 'sm' }) {
  return (
    <div style={{ height: size === 'lg' ? 220 : 120, position: 'relative', overflow: 'hidden', background: accent.bg, flexShrink: 0 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`grid-${size}-${accent.glow.replace('#','')}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke={accent.glow} strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${size}-${accent.glow.replace('#','')})`}/>
      </svg>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: accent.glow, opacity: 0.12, filter: 'blur(35px)' }} />
      <div style={{ position: 'absolute', top: 12, left: 14, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${accent.glow}44`, borderRadius: 20, padding: '3px 10px 3px 7px' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent.glow, boxShadow: `0 0 6px ${accent.glow}` }} />
        <span style={{ fontSize: 9, fontWeight: 800, color: accent.glow, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Article</span>
      </div>
    </div>
  )
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

  if (loading) return <div style={{ height: 480, background: '#09090f' }} />
  if (posts.length === 0) return null

  const [featured, ...rest] = posts
  const sideCards = rest.slice(0, 2)
  const fa = ACCENTS[0]

  return (
    <section id="blog" style={{ background: '#09090f', padding: '80px 0 72px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 9999, padding: '4px 14px', marginBottom: 14 }}>
              Blog
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff' }}>
              Know before your{' '}
              <span style={{ background: 'linear-gradient(90deg, #34d399, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                customers do.
              </span>
            </h2>
          </div>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: 13, fontWeight: 600, textDecoration: 'none', background: 'rgba(52,211,153,0.05)', flexShrink: 0 }}>
            View all articles →
          </Link>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: sideCards.length > 0 ? '1fr 1fr' : '1fr', gap: 20 }}>
          {/* Featured */}
          <Link
            href={`/blog/${featured.slug}`}
            style={{ display: 'block', textDecoration: 'none', borderRadius: 18, border: `1px solid ${fa.glow}33`, background: fa.bg, overflow: 'hidden', transition: 'transform 0.22s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            {featured.cover_image ? (
              <div style={{ height: 220, overflow: 'hidden' }}>
                <img src={featured.cover_image} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : <CardCoverArt accent={fa} size="lg" />}
            <div style={{ padding: '24px 28px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: fa.tag, background: `${fa.tag}15`, border: `1px solid ${fa.tag}30`, borderRadius: 4, padding: '2px 8px' }}>Featured</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{formatDate(featured.created_at)}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{readTime(featured.description)}</span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: '0 0 12px', letterSpacing: '-0.02em' }}>{featured.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 22px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{featured.description}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: fa.tag }}>
                Read article
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </Link>

          {/* Side cards */}
          {sideCards.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sideCards.map((post, i) => {
                const a = ACCENTS[(i + 1) % ACCENTS.length]
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden', flex: 1, transition: 'transform 0.2s ease, border-color 0.2s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = `${a.glow}33` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
                  >
                    {post.cover_image ? (
                      <div style={{ height: 120, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : <CardCoverArt accent={a} size="sm" />}
                    <div style={{ padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: a.tag, background: `${a.tag}15`, border: `1px solid ${a.tag}30`, borderRadius: 4, padding: '2px 7px' }}>Monitoring</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{readTime(post.description)}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.4, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{post.title}</h3>
                      <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 } as React.CSSProperties}>{post.description}</p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: a.tag }}>
                        Read more
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {posts.length > 3 && (
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/blog" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              See all {posts.length} articles →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
