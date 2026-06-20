'use client';

import React from 'react';

function IconLink() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconCPU() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="6" height="6" />
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="9" y1="2" x2="9" y2="6" />
      <line x1="15" y1="2" x2="15" y2="6" />
      <line x1="9" y1="18" x2="9" y2="22" />
      <line x1="15" y1="18" x2="15" y2="22" />
      <line x1="2" y1="9" x2="6" y2="9" />
      <line x1="2" y1="15" x2="6" y2="15" />
      <line x1="18" y1="9" x2="22" y2="9" />
      <line x1="18" y1="15" x2="22" y2="15" />
    </svg>
  );
}

const steps = [
  {
    number: '01',
    icon: <IconLink />,
    title: 'Add your URL',
    desc: 'Paste your website, API endpoint, or domain. Asko validates it and starts watching immediately.',
  },
  {
    number: '02',
    icon: <IconBolt />,
    title: 'Get instant alerts',
    desc: "The moment something's wrong, you're emailed. Response time, status code, and timestamp — all included.",
  },
  {
    number: '03',
    icon: <IconCPU />,
    title: 'AI explains the fix',
    desc: "No guessing what went wrong. Asko reads the error, finds the cause, and gives you a step-by-step fix.",
  },
];

export default function HowItWorks() {
  return (
    <section id="monitoring" style={{ background: '#13151a', padding: '72px 20px' }}>
      <style>{`
        @media (max-width: 760px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
          .hiw-step { border-right: none !important; border-bottom: 1px solid #1f2229; padding: 32px 20px !important; }
          .hiw-step:last-child { border-bottom: none; }
          .hiw-headline { font-size: 2.2rem !important; margin-bottom: 40px !important; }
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{
          textAlign: 'center', fontSize: '11px',
          fontFamily: '"SF Mono","Fira Code","Courier New",monospace',
          letterSpacing: '0.18em', color: '#4b5563',
          textTransform: 'uppercase', marginBottom: '20px',
        }}>
          HOW IT WORKS — MONITORING
        </p>

        <h2 className="hiw-headline" style={{
          textAlign: 'center',
          fontSize: 'clamp(2rem, 5vw, 3.6rem)',
          fontWeight: 800, color: '#f0f0f0',
          letterSpacing: '-0.03em', lineHeight: 1.05,
          margin: '0 0 64px 0',
        }}>
          Set up in under 3 minutes.
        </h2>

        <div className="hiw-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0',
          borderTop: '1px solid #1f2229',
        }}>
          {steps.map((step, i) => (
            <div key={i} className="hiw-step" style={{
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
              <div style={{ color: '#86efac', marginBottom: '24px' }}>
                {step.icon}
              </div>
              <h3 style={{
                fontSize: '1.05rem', fontWeight: 700,
                color: '#e6edf3', margin: '0 0 10px 0',
              }}>
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
