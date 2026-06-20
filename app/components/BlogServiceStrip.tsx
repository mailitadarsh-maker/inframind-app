'use client';

import React from 'react';

const monitoringFeatures = [
  { title: 'Uptime monitoring', desc: 'HTTP, API, and SSL checks every 30 seconds, 24/7' },
  { title: 'AI incident reports', desc: 'What broke, why it broke, how to fix it in plain English' },
  { title: 'SSL expiry warnings', desc: 'Tracks your certificates and warns you before they expire' },
  { title: 'Public status pages', desc: 'Share a live health page with your customers, no coding' },
  { title: 'Incident history', desc: 'Auto-recorded outage and recovery timeline, forever' },
];

const blogFeatures = [
  { title: 'Client subdomain blog', desc: 'blog.theirclient.com, their brand, your control' },
  { title: 'Auto domain setup', desc: 'Client saves subdomain, Vercel adds it automatically' },
  { title: 'AI blog generation', desc: 'One prompt, full post with Pexels cover image, published live' },
  { title: 'SEO-ready out of the box', desc: 'Meta tags, canonical URLs, Open Graph, all auto-generated' },
  { title: 'Multi-client from one place', desc: 'Manage all your clients blogs from your InfraMind dashboard' },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
      <rect width="16" height="16" rx="4" fill={color} fillOpacity="0.15" />
      <path d="M4.5 8L7 10.5L11.5 5.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Feature = { title: string; desc: string };
function PanelContent({
  eyebrow, headline, subtext, features, accentColor, borderColor
}: {
  eyebrow: string; headline: string; subtext: string;
  features: Feature[]; accentColor: string; borderColor: string;
}) {
  return (
    <>
      <div style={{ marginBottom: '14px' }}>
        <span style={{
          border: '1px solid ' + borderColor, borderRadius: '4px', padding: '3px 8px',
          fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.10em',
          color: accentColor, textTransform: 'uppercase', background: accentColor + '1a',
        }}>{eyebrow}</span>
      </div>
      <h2 style={{
        fontSize: 'clamp(1.5rem, 6vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15,
        color: '#f5f5f5', margin: '0 0 10px 0', letterSpacing: '-0.02em',
      }}>{headline}</h2>
      <p style={{ fontSize: '0.84rem', lineHeight: 1.6, color: '#8b949e', margin: '0 0 14px 0' }}>{subtext}</p>
      <div style={{ width: '32px', height: '2px', background: accentColor, borderRadius: '2px', marginBottom: '14px', opacity: 0.6 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <CheckIcon color={accentColor} />
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#e6edf3', marginBottom: '2px' }}>{f.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function BlogServiceStrip() {
  return (
    <section style={{ background: '#16181d' }}>
      <style>{`
        @keyframes bssUp {
          from { opacity: 0; transform: translateY(56px); }
          to   { opacity: 1; transform: translateY(0px); }
        }
        @media (max-width: 760px) {
          .bss-desk { display: none !important; }
          .bss-mob  { display: flex !important; }
          .bss-c1   { animation: bssUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
          .bss-c2   { animation: bssUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        }
        @media (min-width: 761px) {
          .bss-desk { display: flex; }
          .bss-mob  { display: none !important; }
        }
      `}</style>

      <div className="bss-desk" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ flex: 1, padding: '72px 56px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #2a2d35' }}>
          <PanelContent eyebrow="Asko Watch — App Monitoring" headline="Know the moment something breaks." subtext="Your site goes down at 3am. Your customer notices before you do. Asko ends that. Every endpoint, checked every 30 seconds. Every alert, in your inbox before damage is done." features={monitoringFeatures} accentColor="#4ade80" borderColor="#2a2d35" />
        </div>
        <div style={{ flex: 1, padding: '72px 56px', display: 'flex', flexDirection: 'column' }}>
          <PanelContent eyebrow="Asko Write — Blog as a Service" headline="Fresh content, zero effort." subtext="Your clients need SEO content. You need a scalable product. Asko writes AI blog posts and tracks organic growth from one dashboard." features={blogFeatures} accentColor="#818cf8" borderColor="#2d3148" />
        </div>
      </div>

      <div className="bss-mob" style={{ flexDirection: 'column', gap: '16px', padding: '28px 16px 44px' }}>
        <div className="bss-c1" style={{ background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '18px', padding: '26px 20px 30px' }}>
          <PanelContent eyebrow="Asko Watch — App Monitoring" headline="Know the moment something breaks." subtext="Your site goes down at 3am. Your customer notices before you do. Asko ends that. Every endpoint, checked every 30 seconds. Every alert, in your inbox before damage is done." features={monitoringFeatures} accentColor="#4ade80" borderColor="#2a2d35" />
        </div>
        <div className="bss-c2" style={{ background: '#13152a', border: '1px solid #2d3148', borderRadius: '18px', padding: '26px 20px 30px' }}>
          <PanelContent eyebrow="Asko Write — Blog as a Service" headline="Fresh content, zero effort." subtext="Your clients need SEO content. You need a scalable product. Asko writes AI blog posts and tracks organic growth from one dashboard." features={blogFeatures} accentColor="#818cf8" borderColor="#2d3148" />
        </div>
      </div>
    </section>
  );
}
