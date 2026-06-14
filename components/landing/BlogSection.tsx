'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  description: string
  published: boolean
  created_at: string
}

const ACCENTS = [
  { bg: 'linear-gradient(145deg, #071c14 0%, #0d3324 100%)', glow: '#34d399', wave: '#34d399', tag: '#34d399' },
  { bg: 'linear-gradient(145deg, #0a0720 0%, #160d3a 100%)', glow: '#a78bfa', wave: '#a78bfa', tag: '#a78bfa' },
  { bg: 'linear-gradient(145deg, #1a0a00 0%, #2d1500 100%)', glow: '#fb923c', wave: '#fb923c', tag: '#fb923c' },
  { bg: 'linear-gradient(145deg, #00111f 0%, #001e38 100%)', glow: '#38bdf8', wave: '#38bdf8', tag: '#38bdf8' },
  { bg: 'linear-gradient(145deg, #130020 0%, #220038 100%)', glow: '#e879f9', wave: '#e879f9', tag: '#e879f9' },
  { bg: 'linear-gradient(145deg, #1a1200 0%, #2e1f00 100%)', glow: '#fbbf24', wave: '#fbbf24', tag: '#fbbf24' },
]

const WAVES = [
  "M0,20 C20,20 20,8 40,8 C60,8 60,28 80,28 C100,28 100,4 120,4 C140,4 140,24 160,24 C180,24 180,12 200,12 C220,12 220,26 240,26 C260,26 260,8 280,8 C300,8 300,20 320,20",
  "M0,24 C15,24 15,10 30,10 C45,10 45,28 60,28 C75,28 75,6 90,6 C105,6 105,22 120,22 C135,22 135,14 150,14 C165,14 165,28 180,28 C195,28 195,8 210,8 C225,8 225,20 240,20 C255,20 255,12 270,12 C285,12 285,24 300,24 C315,24 315,16 320,16",
  "M0,16 C10,16 20,28 40,28 C60,28 60,4 80,4 C100,4 100,20 120,20 C140,20 140,10 160,10 C180,10 180,26 200,26 C220,26 220,8 240,8 C260,8 260,22 280,22 C300,22 300,14 320,14",
]

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const autoRef = useRef<NodeJS.Timeout | null>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const scrollTo = (i: number, total: number) => {
    if (!trackRef.current) return
    const card = trackRef.current.children[i] as HTMLElement
    if (card) {
      trackRef.current.scrollTo({ left: card.offsetLeft - (isMobile ? 0 : 32), behavior: 'smooth' })
    }
    setActive(i)
  }

  const startAuto = (total: number) => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => {
      if (pausedRef.current) return
      setActive(prev => {
        const next = prev >= total - 1 ? 0 : prev + 1
        if (trackRef.current) {
          const card = trackRef.current.children[next] as HTMLElement
          if (card) trackRef.current.scrollTo({ left: card.offsetLeft - (window.innerWidth < 768 ? 0 : 32), behavior: 'smooth' })
        }
        return next
      })
    }, 3200)
  }

  const pauseAuto = () => { pausedRef.current = true }
  const resumeAuto = () => { pausedRef.current = false }

  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => {
        const p = d.posts || []
        setPosts(p)
        setLoading(false)
        setTimeout(() => startAuto(p.length), 500)
      })
      .catch(() => setLoading(false))
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [])

  const go = (i: number) => {
    scrollTo(i, posts.length)
    pausedRef.current = true
    setTimeout(() => { pausedRef.current = false }, 6000)
  }

  const onScroll = () => {
    if (!trackRef.current) return
    const cardW = isMobile ? trackRef.current.offsetWidth : 308
    setActive(Math.min(Math.round(trackRef.current.scrollLeft / cardW), posts.length - 1))
  }

  if (loading) return <div style={{ height: 400, background: '#09090f' }} />
  if (posts.length === 0) return null

  const accent = ACCENTS[active % ACCENTS.length]

  return (
    <section
      style={{ background: '#09090f', padding: isMobile ? '60px 0 56px' : '80px 0 72px', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={pauseAuto}
      onMouseLeave={resumeAuto}
    >
      <style>{`
        .bcard { transition: transform .22s ease, box-shadow .22s ease; }
        .bcard:hover { transform: translateY(-5px); }
        .barrow { border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .18s; font-size: 14px; }
        .barrow:hover:not(:disabled) { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.4); color: #34d399; }
        .barrow:disabled { opacity: 0.2; cursor: not-allowed; }
        .bdot { border: none; padding: 0; cursor: pointer; border-radius: 9999px; transition: all .28s ease; }
        .cta-row { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; letter-spacing: .04em; transition: gap .18s; }
        .bcard:hover .cta-row { gap: 10px; }
        .blog-track::-webkit-scrollbar { display: none; }
        @media (max-width: 767px) {
          .blog-track { scroll-snap-type: x mandatory !important; -webkit-overflow-scrolling: touch; }
          .blog-track > a { scroll-snap-align: center !important; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '30%', left: '35%', width: 600, height: 400, borderRadius: '50%', background: `radial-gradient(ellipse, ${accent.glow}0d 0%, transparent 65%)`, filter: 'blur(1px)', transition: 'background 0.6s ease', pointerEvents: 'none' }} />

      {/* HEADER */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 20px 36px' : '0 32px 44px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 9999, padding: '5px 16px' }}>
              Blog
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 'clamp(28px, 4vw, 46px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff' }}>
            Know before your{' '}
            <span style={{ background: 'linear-gradient(90deg, #34d399, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              customers do.
            </span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {!isMobile && (
            <>
              <button className="barrow" onClick={() => go(Math.max(0, active - 1))} disabled={active === 0}>←</button>
              <button className="barrow" onClick={() => go(Math.min(posts.length - 1, active + 1))} disabled={active === posts.length - 1}>→</button>
            </>
          )}
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: 13, fontWeight: 600, textDecoration: 'none', background: 'rgba(52,211,153,0.05)', whiteSpace: 'nowrap' }}>
            All articles →
          </Link>
        </div>
      </div>

      {/* TRACK */}
      <div
        ref={trackRef}
        className="blog-track"
        onScroll={onScroll}
        onTouchStart={pauseAuto}
        onTouchEnd={() => setTimeout(resumeAuto, 4000)}
        style={{
          display: 'flex',
          gap: isMobile ? 0 : 16,
          padding: isMobile ? '4px 0 28px' : '8px 32px 32px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {posts.map((post, i) => {
          const a = ACCENTS[i % ACCENTS.length]
          const isActive = i === active

          // Mobile: full-width single card
          if (isMobile) {
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{
                  flexShrink: 0,
                  width: '100vw',
                  padding: '0 20px',
                  scrollSnapAlign: 'center',
                  display: 'block',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ borderRadius: 16, border: `1px solid ${a.glow}44`, background: a.bg, overflow: 'hidden', boxShadow: `0 0 32px ${a.glow}18` }}>
                  {/* Cover */}
                  <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: a.bg }}>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }} xmlns="http://www.w3.org/2000/svg">
                      <defs><pattern id={`gm${i}`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke={a.glow} strokeWidth="0.5"/></pattern></defs>
                      <rect width="100%" height="100%" fill={`url(#gm${i})`}/>
                    </svg>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: a.glow, opacity: 0.15, filter: 'blur(40px)' }} />
                    <svg style={{ position: 'absolute', bottom: 8, left: 0, right: 0, opacity: 0.55 }} viewBox="0 0 320 32" fill="none" preserveAspectRatio="none" height="32" width="100%">
                      <path d={WAVES[i % WAVES.length]} stroke={a.wave} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${a.glow}44`, borderRadius: 20, padding: '3px 10px 3px 7px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.glow, boxShadow: `0 0 8px ${a.glow}` }} />
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: a.glow, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Live</span>
                    </div>
                    <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)' }}>{String(i + 1).padStart(2, '0')}</div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '18px 20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: a.tag, background: `${a.tag}15`, border: `1px solid ${a.tag}30`, borderRadius: 4, padding: '2px 7px' }}>Monitoring</span>
                      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)' }}>{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.4, margin: '0 0 10px' }}>{post.title}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, margin: '0 0 18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{post.description}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: a.tag }}>
                      Read article <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            )
          }

          // Desktop: expanding active card
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bcard"
              style={{
                flexShrink: 0,
                width: isActive ? 340 : 290,
                scrollSnapAlign: 'start',
                borderRadius: 16,
                border: isActive ? `1px solid ${a.glow}44` : '1px solid rgba(255,255,255,0.06)',
                background: isActive ? a.bg : 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
                textDecoration: 'none',
                display: 'block',
                boxShadow: isActive ? `0 0 40px ${a.glow}18` : 'none',
                transition: 'width 0.35s ease, border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease',
              }}
            >
              <div style={{ height: isActive ? 180 : 140, position: 'relative', overflow: 'hidden', background: a.bg, transition: 'height 0.35s ease' }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: isActive ? 0.2 : 0.08, transition: 'opacity 0.35s' }} xmlns="http://www.w3.org/2000/svg">
                  <defs><pattern id={`g${i}`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke={a.glow} strokeWidth="0.5"/></pattern></defs>
                  <rect width="100%" height="100%" fill={`url(#g${i})`}/>
                </svg>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: a.glow, opacity: isActive ? 0.15 : 0.05, filter: 'blur(40px)', transition: 'opacity 0.35s' }} />
                <svg style={{ position: 'absolute', bottom: 8, left: 0, right: 0, opacity: isActive ? 0.6 : 0.2, transition: 'opacity 0.35s' }} viewBox="0 0 320 32" fill="none" preserveAspectRatio="none" height="32" width="100%">
                  <path d={WAVES[i % WAVES.length]} stroke={a.wave} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${a.glow}44`, borderRadius: 20, padding: '3px 10px 3px 7px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.glow, boxShadow: `0 0 8px ${a.glow}` }} />
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: a.glow, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Live</span>
                </div>
                <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{String(i + 1).padStart(2, '0')}</div>
              </div>
              <div style={{ padding: '16px 18px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: a.tag, background: `${a.tag}15`, border: `1px solid ${a.tag}30`, borderRadius: 4, padding: '2px 7px' }}>Monitoring</span>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.2)' }}>{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <h3 style={{ fontSize: isActive ? 15 : 13.5, fontWeight: 700, color: isActive ? '#fff' : 'rgba(255,255,255,0.7)', lineHeight: 1.4, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'font-size 0.35s, color 0.35s' } as React.CSSProperties}>{post.title}</h3>
                {isActive && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{post.description}</p>}
                <span className="cta-row" style={{ color: a.tag, display: 'inline-flex' }}>
                  Read article <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* DOTS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4 }}>
        {posts.map((_, i) => (
          <button key={i} className="bdot" onClick={() => go(i)}
            style={{ width: i === active ? 28 : 6, height: 6, background: i === active ? ACCENTS[i % ACCENTS.length].glow : 'rgba(255,255,255,0.1)', boxShadow: i === active ? `0 0 8px ${ACCENTS[i % ACCENTS.length].glow}88` : 'none' }} />
        ))}
      </div>

      {/* Mobile swipe hint + arrows */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <button className="barrow" onClick={() => go(Math.max(0, active - 1))} disabled={active === 0}>←</button>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>swipe or tap</span>
          <button className="barrow" onClick={() => go(Math.min(posts.length - 1, active + 1))} disabled={active === posts.length - 1}>→</button>
        </div>
      )}
    </section>
  )
}
