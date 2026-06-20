'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'What is InfraMind?',
    a: 'InfraMind is an AI-powered uptime monitoring and Blog as a Service platform. It monitors your websites, APIs, and SSL certificates 24/7, sends instant alerts when something breaks, and uses AI to explain what went wrong and how to fix it — in plain English.',
  },
  {
    q: 'Who is Asko?',
    a: 'Asko is the AI agent that powers InfraMind. Asko Watch monitors your uptime, APIs, and SSL certificates around the clock and explains incidents in plain English. Asko Write generates and publishes SEO-ready blog posts to your clients\' subdomains. One agent, two jobs, available in every InfraMind plan.',
  },
  {
    q: 'How do I check if my website is down?',
    a: 'Just paste your URL into InfraMind. It starts checking every 30 seconds and emails you the moment your site goes down — with response time, status code, and timestamp included.',
  },
  {
    q: 'What types of monitoring does InfraMind support?',
    a: 'InfraMind supports HTTP/HTTPS uptime monitoring, API endpoint checks, SSL certificate expiry tracking, and public status pages — all from one dashboard.',
  },
  {
    q: 'How does the AI incident report work?',
    a: 'When downtime is detected, Asko identifies the root cause — server crash, DNS failure, SSL expiry, or API timeout — and gives you a clear step-by-step fix in plain English. No log-diving, no guesswork.',
  },
  {
    q: 'Is InfraMind free to use?',
    a: 'Yes. The free Starter plan includes 3 monitors, 30-minute check intervals, email alerts, and a public status page — no credit card required. Paid plans start at ₹999/month.',
  },
  {
    q: 'How quickly does InfraMind detect downtime?',
    a: 'As little as 15 seconds on Pro and Agency plans, 30 seconds on Growth. You\'ll receive an alert the moment an incident is confirmed.',
  },
  {
    q: 'Can I share a public status page with my customers?',
    a: 'Yes. Every account includes a public status page showing real-time service health, current incidents, and historical uptime — updated automatically. No coding required.',
  },
  {
    q: 'Do I need technical or DevOps knowledge to use InfraMind?',
    a: 'No. InfraMind is built for founders, agencies, and small teams without a full-time DevOps engineer. Paste a URL and InfraMind handles the rest.',
  },
  {
    q: 'What is Blog as a Service in InfraMind?',
    a: 'It lets you publish AI-generated SEO blog posts directly to your clients\' subdomains from one dashboard. Enter a topic, Asko writes the article with a cover image, meta tags, and Open Graph — publish in one click.',
  },
  {
    q: 'How does InfraMind help with SEO for my clients?',
    a: 'InfraMind generates SEO-ready content with proper meta titles, descriptions, canonical URLs, and keyword targeting. Each post is published to a client-owned subdomain, building their domain authority over time.',
  },
  {
    q: 'How is InfraMind different from other uptime monitoring tools?',
    a: 'Most tools just tell you something is down. InfraMind tells you what broke, why it broke, and how to fix it — using AI. It also combines uptime monitoring with Blog as a Service in a single dashboard.',
  },
  {
    q: 'Does InfraMind work for agencies managing multiple clients?',
    a: 'Yes. You can manage monitors for multiple client websites and publish blog content to multiple client subdomains — all from one dashboard. Agency and Pro plans support unlimited monitors and client blogs.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: '96px 40px', background: '#13151a', borderTop: '1px solid #1f2229' }}>
      <style>{`
        @media (max-width: 760px) {
          .faq-section { padding: 48px 16px !important; }
          .faq-header {
            position: sticky;
            top: 0;
            z-index: 40;
            background: #13151a;
            padding: 16px 16px 12px;
            margin: 0 -16px 24px;
            border-bottom: 1px solid #1f2229;
          }
          .faq-header h2 { font-size: 1.4rem !important; margin: 0 0 4px !important; }
          .faq-header p { font-size: 0.82rem !important; margin: 0 !important; }
          .faq-header .faq-eyebrow { display: none; }
          .faq-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .faq-col:last-child .faq-item:first-child { border-top: none !important; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      <div className="faq-section" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Sticky Header */}
        <div className="faq-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            fontSize: '11px', fontFamily: '"SF Mono","Fira Code",monospace',
            letterSpacing: '0.18em', color: '#4b5563', textTransform: 'uppercase', marginBottom: '10px',
          }}>FAQ</p>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 800,
            letterSpacing: '-0.03em', color: '#f0f0f0', margin: '0 0 10px', lineHeight: 1.05,
          }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
            Everything you need to know about InfraMind.
          </p>
        </div>

        {/* Accordion grid */}
        <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }}>
          {[faqs.slice(0, Math.ceil(faqs.length / 2)), faqs.slice(Math.ceil(faqs.length / 2))].map((col, colIdx) => (
            <div key={colIdx} className="faq-col" style={{ display: 'flex', flexDirection: 'column' }}>
              {col.map((faq, rowIdx) => {
                const i = colIdx === 0 ? rowIdx : Math.ceil(faqs.length / 2) + rowIdx;
                const isOpen = open === i;
                return (
                  <div
                    key={i}
                    className="faq-item"
                    style={{
                      borderBottom: '1px solid #1f2229',
                      borderTop: rowIdx === 0 ? '1px solid #1f2229' : 'none',
                    }}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      style={{
                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                        padding: '18px 0', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', gap: '12px', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        fontSize: '0.92rem', fontWeight: 600,
                        color: isOpen ? '#f0f0f0' : '#c9d1d9',
                        lineHeight: 1.4, transition: 'color 0.2s',
                      }}>
                        {faq.q}
                      </span>
                      <span style={{
                        flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px',
                        border: `1px solid ${isOpen ? 'rgba(74,222,128,0.4)' : '#2a2d35'}`,
                        background: isOpen ? 'rgba(74,222,128,0.08)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                          style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                          <line x1="6" y1="1" x2="6" y2="11" stroke={isOpen ? '#4ade80' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="1" y1="6" x2="11" y2="6" stroke={isOpen ? '#4ade80' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    <div style={{
                      overflow: 'hidden',
                      maxHeight: isOpen ? '400px' : '0',
                      transition: 'max-height 0.35s ease',
                    }}>
                      <p style={{
                        fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.75,
                        margin: '0 0 18px', paddingRight: '8px',
                      }}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '16px' }}>
            Still have questions?
          </p>
          <a href="mailto:support@inframindhq.online" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: '10px',
            border: '1px solid #2a2d35', color: '#9ca3af', fontSize: '14px',
            fontWeight: 600, textDecoration: 'none',
          }}>
            Contact support →
          </a>
        </div>
      </div>
    </section>
  );
}
