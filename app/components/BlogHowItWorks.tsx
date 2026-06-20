'use client';

import React from 'react';

function IconGlobe() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m3.29 15 1.42-1.42" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.93.55 3.73 1.5 5.27L9 13l3-3 3 3 3-3 3 3-3 3-3-3-3 3-5.73 5.5C5.27 21.45 7.07 22 9 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
      <path d="M15 9h.01" />
    </svg>
  );
}

const steps = [
  {
    number: '01',
    icon: <IconGlobe />,
    title: 'Client saves their subdomain',
    desc: 'They enter blog.theirdomain.com in settings. Asko provisions it on Vercel automatically — no DNS headaches.',
  },
  {
    number: '02',
    icon: <IconSparkle />,
    title: 'You generate a post',
    desc: 'Enter a topic or keyword. Asko writes the full article, finds a Pexels cover image, and formats it SEO-ready.',
  },
  {
    number: '03',
    icon: <IconRocket />,
    title: 'Live in seconds',
    desc: "Hit publish. The post appears on the client's blog instantly — no deployment, no CMS login, no waiting.",
  },
];

export default function BlogHowItWorks() {
  return (
    <section id="blog-service" style={{ background: '#13151a', padding: '72px 20px', borderTop: '1px solid #1f2229' }}>
      <style>{`
        @media (max-width: 760px) {
          .bhiw-grid { grid-template-columns: 1fr !important; }
          .bhiw-step { border-right: none !important; border-bottom: 1px solid #1f2229; padding: 32px 20px !important; }
          .bhiw-step:last-child { border-bottom: none; }
          .bhiw-headline { font-size: 2rem !important; margin-bottom: 40px !important; }
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{
          textAlign: 'center', fontSize: '11px',
          fontFamily: '"SF Mono","Fira Code","Courier New",monospace',
          letterSpacing: '0.18em', color: '#4b5563',
          textTransform: 'uppercase', marginBottom: '20px',
        }}>
          HOW IT WORKS — BLOG AS A SERVICE
        </p>

        <h2 className="bhiw-headline" style={{
          textAlign: 'center',
          fontSize: 'clamp(2rem, 5vw, 3.4rem)',
          fontWeight: 800, color: '#f0f0f0',
          letterSpacing: '-0.03em', lineHeight: 1.05,
          margin: '0 0 64px 0',
        }}>
          From onboarding to live post{' '}
          <span style={{ color: '#a5b4fc' }}>in minutes.</span>
        </h2>

        <div className="bhiw-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0',
          borderTop: '1px solid #1f2229',
        }}>
          {steps.map((step, i) => (
            <div key={i} className="bhiw-step" style={{
              padding: '40px 40px 48px',
              borderRight: i < 2 ? '1px solid #1f2229' : 'none',
            }}>
              <p style={{
                fontSize: '13px',
                fontFamily: '"SF Mono","Fira Code","Courier New",monospace',
                color: '#2d3139', fontWeight: 600,
                margin: '0 0 32px 0', letterSpacing: '0.05em',
              }}>
                {step.number}
              </p>
              <div style={{ color: '#a5b4fc', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
                {step.icon}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 10px 0' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.65, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
