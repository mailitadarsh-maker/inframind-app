import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog as a Service | InfraMind',
  description: 'Give every client their own blog on their subdomain. You write and publish from InfraMind — it goes live instantly. No code, no deployment.',
  alternates: { canonical: 'https://inframindhq.online/blog-service' },
};

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="#a78bfa" strokeWidth="1.5"/>
        <path d="M7 11h8M11 7v8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Custom subdomain for every client',
    desc: 'Client adds blog.theirdomain.com once. After that, every post you publish appears there automatically.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="13" rx="2" stroke="#a78bfa" strokeWidth="1.5"/>
        <path d="M7 9h8M7 13h5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Write once, publish anywhere',
    desc: 'Use the InfraMind editor to write and publish blog posts. No deployment, no FTP, no developer needed.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L13.5 8.5H19L14.5 12L16.5 18L11 14.5L5.5 18L7.5 12L3 8.5H8.5L11 3Z" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'SEO-ready out of the box',
    desc: 'Every post gets proper meta tags, canonical URLs, and Open Graph images — so Google finds it fast.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11C4 7.13 7.13 4 11 4s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z" stroke="#a78bfa" strokeWidth="1.5"/>
        <path d="M11 8v3l2 2" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Instant publishing — live in seconds',
    desc: 'Hit publish and the post is live on the client\'s domain in under 5 seconds. No build step, no cache to clear.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#a78bfa" strokeWidth="1.5"/>
        <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="#a78bfa" strokeWidth="1.5"/>
        <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="#a78bfa" strokeWidth="1.5"/>
        <rect x="12" y="12" width="7" height="7" rx="1.5" stroke="#a78bfa" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Manage all clients from one dashboard',
    desc: 'Switch between clients, manage their posts, and track performance — all from a single InfraMind login.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 8h16M3 14h16M8 3v16M14 3v16" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Fully branded for the client',
    desc: 'The blog looks like it belongs to the client — their domain, their brand. InfraMind stays invisible.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Client adds a CNAME once',
    desc: 'They point blog.theirdomain.com to InfraMind in their DNS. A 2-minute setup they do once, ever.',
    icon: '🌐',
  },
  {
    num: '02',
    title: 'You write and publish from your dashboard',
    desc: 'Log into InfraMind, pick the client, write the post, hit publish. That\'s it.',
    icon: '✍️',
  },
  {
    num: '03',
    title: 'Post goes live on their domain instantly',
    desc: 'The post appears at blog.theirdomain.com in seconds. No code. No deployment. No back-and-forth.',
    icon: '⚡',
  },
];

export default function BlogServicePage() {
  return (
    <main style={{ background: '#0d0f14', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,15,20,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1ddb78', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polyline points="12 3 5.5 10 2 6.5" stroke="#07090d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>InfraMind</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>Log in</Link>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, color: '#071c14', background: '#34d399', textDecoration: 'none', padding: '7px 18px', borderRadius: 8 }}>Start free →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px 64px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 99, padding: '4px 14px' }}>Blog as a Service</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 99, padding: '4px 14px' }}>by InfraMind</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
            Give every client<br />
            <span style={{ color: '#a78bfa' }}>their own blog.</span><br />
            You manage it all.
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: '0 0 36px', maxWidth: 520 }}>
            Your clients get a professional blog on their own domain. You write and publish from InfraMind. It goes live in seconds — no code, no hosting, no back-and-forth.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, background: '#a78bfa', color: '#1a1035', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Get started free →
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#111318', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              3 steps. That's genuinely it.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: '18%', right: '18%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.2), transparent)' }} />
            {steps.map((s, i) => (
              <div key={i} style={{ background: '#1a1d24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '28px 24px', position: 'relative' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 40, fontWeight: 800, color: 'rgba(255,255,255,0.04)', lineHeight: 1, marginBottom: 12, fontFamily: 'monospace' }}>{s.num}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 12 }}>Features</p>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Everything included. Nothing to configure.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: '#1a1d24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(167,139,250,0.25)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Ready to offer blogs to your clients?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: '0 0 32px' }}>
            Start free. No card required. Your first client blog can be live today.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: '#a78bfa', color: '#1a1035', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Start free — no card needed →
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
