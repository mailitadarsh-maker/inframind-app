'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'What is InfraMind?',
    a: 'InfraMind is an AI-powered uptime, API, and SSL monitoring platform built for growing teams and agencies. It checks your websites, APIs, and SSL certificates every 30 seconds — 24/7 — and uses AI to explain exactly what broke and how to fix it, in plain English. No DevOps experience needed.',
  },
  {
    q: 'How do I check if my website is down?',
    a: 'Add your website URL to InfraMind in under 3 minutes. InfraMind immediately starts sending HTTP checks every 30 seconds. The moment your site goes down, you get an email alert with the status code, response time, and timestamp — before your customers notice.',
  },
  {
    q: 'What types of monitoring does InfraMind support?',
    a: 'InfraMind supports uptime monitoring (HTTP/HTTPS), API endpoint monitoring, SSL certificate monitoring with expiry warnings, and public status pages. Every monitor runs checks every 15–30 seconds depending on your plan, around the clock.',
  },
  {
    q: 'How does InfraMind\'s AI incident analysis work?',
    a: 'When an outage or slowdown is detected, InfraMind\'s AI reads the error, identifies the root cause — whether it\'s a server crash, DNS failure, SSL expiry, or API timeout — and gives you a clear, step-by-step fix in plain English. No log-diving, no guesswork.',
  },
  {
    q: 'Is InfraMind free to use?',
    a: 'Yes. InfraMind has a free Starter plan that includes 3 monitors with 30-minute check intervals, email alerts, and a public status page — no credit card required. Paid plans start at ₹999/month and unlock faster checks, more monitors, AI reports, and Blog as a Service.',
  },
  {
    q: 'How quickly does InfraMind detect downtime?',
    a: 'InfraMind detects downtime in as little as 15 seconds on Pro and Agency plans, and within 30 seconds on Growth plans. The free Starter plan checks every 30 minutes. You\'ll receive an alert the moment an incident is confirmed — typically within one check cycle.',
  },
  {
    q: 'Can I share a public status page with my customers?',
    a: 'Yes. Every InfraMind account includes a public status page you can share with customers and internal teams. It shows real-time service health, current incidents, and historical uptime — all updated automatically. No coding required to set it up.',
  },
  {
    q: 'Do I need technical or DevOps knowledge to use InfraMind?',
    a: 'No. InfraMind is built for founders, agencies, and small teams who don\'t have a full-time DevOps engineer. You just paste a URL and InfraMind handles the rest — monitoring, alerting, and AI-powered incident reports all in plain English.',
  },
  {
    q: 'What is Blog as a Service in InfraMind?',
    a: 'Blog as a Service lets you publish AI-generated SEO blog posts directly to your clients\' subdomains (e.g. blog.theirclient.com) from one InfraMind dashboard. You enter a topic or keyword, InfraMind writes the full article with a Pexels cover image, adds meta tags, canonical URLs, and Open Graph — then you publish in one click. No CMS, no deployment, no DNS headaches.',
  },
  {
    q: 'How does InfraMind help with SEO for my clients?',
    a: 'InfraMind\'s Blog as a Service generates SEO-ready content with proper meta titles, descriptions, canonical URLs, Open Graph tags, and keyword targeting built in. Each post is published to a client-owned subdomain, building their domain authority over time — all managed from your InfraMind dashboard.',
  },
  {
    q: 'How is InfraMind different from other uptime monitoring tools?',
    a: 'Most uptime tools just tell you something is down. InfraMind tells you what broke, why it broke, and how to fix it — using AI. It also combines uptime monitoring with Blog as a Service in a single dashboard, making it the only tool that helps agencies both keep clients\' apps running and grow their organic traffic.',
  },
  {
    q: 'How do I get extra trial days or more monitors on InfraMind?',
    a: 'Share InfraMind on LinkedIn and claim your free reward to unlock 14 extra trial days and 10 additional monitors instantly — no credit card needed. You can claim this from the Pricing section or directly inside your dashboard after signing up.',
  },
  {
    q: 'Does InfraMind work for agencies managing multiple clients?',
    a: 'Yes. InfraMind is built with agencies in mind. You can manage monitors for multiple client websites and publish blog content to multiple client subdomains — all from one dashboard. Agency and Pro plans support unlimited monitors and unlimited client blogs.',
  },
  {
    q: 'What happens when my SSL certificate is about to expire?',
    a: 'InfraMind tracks SSL expiry dates for every domain you monitor and sends you a warning email before your certificate expires. This prevents unexpected site outages and broken padlock warnings that hurt customer trust and SEO rankings.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      style={{ padding: '96px 40px', background: '#13151a', borderTop: '1px solid #1f2229' }}
    >
      {/* JSON-LD structured data for SEO */}
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

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{
            fontSize: '11px', fontFamily: '"SF Mono","Fira Code",monospace',
            letterSpacing: '0.18em', color: '#4b5563', textTransform: 'uppercase', marginBottom: '18px',
          }}>
            FAQ
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 800,
            letterSpacing: '-0.03em', color: '#f0f0f0', margin: '0 0 12px', lineHeight: 1.05,
          }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
            Everything you need to know about InfraMind monitoring and Blog as a Service.
          </p>
        </div>

        {/* Two-column accordion */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px', maxWidth: '1100px', margin: '0 auto' }}>
          {[faqs.slice(0, Math.ceil(faqs.length / 2)), faqs.slice(Math.ceil(faqs.length / 2))].map((col, colIdx) => (
            <div key={colIdx} style={{ display: 'flex', flexDirection: 'column' }}>
              {col.map((faq, rowIdx) => {
                const i = colIdx === 0 ? rowIdx : Math.ceil(faqs.length / 2) + rowIdx;
                const isOpen = open === i;
                return (
                  <div
                    key={i}
                    style={{
                      borderBottom: '1px solid #1f2229',
                      borderTop: rowIdx === 0 ? '1px solid #1f2229' : 'none',
                    }}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      style={{
                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                        padding: '20px 0', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', gap: '16px', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        fontSize: '0.95rem', fontWeight: 600,
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
                        fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.75,
                        margin: '0 0 20px', paddingRight: '8px',
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

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '56px' }}>
          <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '16px' }}>
            Still have questions?
          </p>
          <a
            href="mailto:support@inframindhq.online"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: '10px',
              border: '1px solid #2a2d35', color: '#9ca3af', fontSize: '14px',
              fontWeight: 600, textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(74,222,128,0.4)';
              (e.currentTarget as HTMLAnchorElement).style.color = '#4ade80';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2a2d35';
              (e.currentTarget as HTMLAnchorElement).style.color = '#9ca3af';
            }}
          >
            Contact support →
          </a>
        </div>
      </div>
    </section>
  );
}
