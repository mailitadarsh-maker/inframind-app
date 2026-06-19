'use client';

import React from 'react';

const monitoringFeatures = [
  {
    title: 'Uptime monitoring',
    desc: 'HTTP, API, and SSL checks every 30 seconds, 24/7',
  },
  {
    title: 'AI incident reports',
    desc: 'What broke, why it broke, how to fix it — in plain English',
  },
  {
    title: 'SSL expiry warnings',
    desc: 'Tracks your certificates and warns you before they expire',
  },
  {
    title: 'Public status pages',
    desc: 'Share a live health page with your customers — no coding',
  },
  {
    title: 'Incident history',
    desc: 'Auto-recorded outage and recovery timeline, forever',
  },
];

const blogFeatures = [
  {
    title: 'Client subdomain blog',
    desc: 'blog.theirclient.com — their brand, your control',
  },
  {
    title: 'Auto domain setup',
    desc: 'Client saves subdomain → Vercel adds it automatically',
  },
  {
    title: 'AI blog generation',
    desc: 'One prompt → full post with Pexels cover image, published live',
  },
  {
    title: 'SEO-ready out of the box',
    desc: 'Meta tags, canonical URLs, Open Graph — all auto-generated',
  },
  {
    title: 'Multi-client from one place',
    desc: "Manage all your clients' blogs from your InfraMind dashboard",
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ flexShrink: 0, marginTop: '2px' }}
    >
      <rect width="16" height="16" rx="4" fill={color} fillOpacity="0.15" />
      <path
        d="M4.5 8L7 10.5L11.5 5.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PanelProps {
  eyebrow: string;
  headline: string;
  subtext: string;
  features: { title: string; desc: string }[];
  accentColor: string;
  borderColor: string;
  isRight?: boolean;
}

function Panel({
  eyebrow,
  headline,
  subtext,
  features,
  accentColor,
  borderColor,
  isRight,
}: PanelProps) {
  return (
    <div
      style={{
        flex: 1,
        padding: '72px 56px',
        borderRight: isRight ? 'none' : `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '28px',
        }}
      >
        <span
          style={{
            border: `1px solid ${borderColor}`,
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
            letterSpacing: '0.12em',
            color: accentColor,
            textTransform: 'uppercase' as const,
            background: `${accentColor}0d`,
          }}
        >
          {eyebrow}
        </span>
      </div>

      {/* Headline */}
      <h2
        style={{
          fontSize: '2.6rem',
          fontWeight: 800,
          lineHeight: 1.08,
          color: '#f5f5f5',
          margin: '0 0 20px 0',
          letterSpacing: '-0.02em',
        }}
      >
        {headline}
      </h2>

      {/* Subtext */}
      <p
        style={{
          fontSize: '1rem',
          lineHeight: 1.7,
          color: '#8b949e',
          margin: '0 0 44px 0',
          maxWidth: '480px',
        }}
      >
        {subtext}
      </p>

      {/* Divider */}
      <div
        style={{
          width: '40px',
          height: '2px',
          background: accentColor,
          borderRadius: '2px',
          marginBottom: '36px',
          opacity: 0.6,
        }}
      />

      {/* Feature list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {features.map((f, i) => (
          <div
            key={i}
            style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}
          >
            <CheckIcon color={accentColor} />
            <div>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#e6edf3',
                  marginBottom: '3px',
                  letterSpacing: '-0.01em',
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: 1.55,
                }}
              >
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogServiceStrip() {
  return (
    <section
      style={{
        background: '#16181d',
        borderTop: '1px solid #2a2d35',
        borderBottom: '1px solid #2a2d35',
      }}
    >
      <div
        style={{
          display: 'flex',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <Panel
          eyebrow="Product 1 — App Monitoring"
          headline={`Know the moment\nsomething breaks.`}
          subtext="Your site goes down at 3am. Your customer notices before you do. InfraMind ends that. Every endpoint, checked every 30 seconds. Every alert, in your inbox before damage is done."
          features={monitoringFeatures}
          accentColor="#4ade80"
          borderColor="#2a2d35"
        />
        <Panel
          eyebrow="Product 2 — Blog as a Service"
          headline={`Fresh content,\nzero effort.`}
          subtext="Your clients need SEO content. You need a scalable product. InfraMind generates AI blog posts, publishes them to your client's subdomain, and tracks the organic growth — all from one dashboard."
          features={blogFeatures}
          accentColor="#818cf8"
          borderColor="#2a2d35"
          isRight
        />
      </div>
    </section>
  );
}
