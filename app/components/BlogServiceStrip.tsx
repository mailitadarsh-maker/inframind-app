'use client';

import React, { useEffect, useRef, useState } from 'react';

const monitoringFeatures = [
  { title: 'Uptime monitoring', desc: 'HTTP, API, and SSL checks every 30 seconds, 24/7' },
  { title: 'AI incident reports', desc: 'What broke, why it broke, how to fix it — in plain English' },
  { title: 'SSL expiry warnings', desc: 'Tracks your certificates and warns you before they expire' },
  { title: 'Public status pages', desc: 'Share a live health page with your customers — no coding' },
  { title: 'Incident history', desc: 'Auto-recorded outage and recovery timeline, forever' },
];

const blogFeatures = [
  { title: 'Client subdomain blog', desc: 'blog.theirclient.com — their brand, your control' },
  { title: 'Auto domain setup', desc: 'Client saves subdomain → Vercel adds it automatically' },
  { title: 'AI blog generation', desc: 'One prompt → full post with Pexels cover image, published live' },
  { title: 'SEO-ready out of the box', desc: 'Meta tags, canonical URLs, Open Graph — all auto-generated' },
  { title: 'Multi-client from one place', desc: "Manage all your clients' blogs from your InfraMind dashboard" },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
      <rect width="16" height="16" rx="4" fill={color} fillOpacity="0.15" />
      <path d="M4.5 8L7 10.5L11.5 5.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface PanelContentProps {
  eyebrow: string;
  headline: string;
  subtext: string;
  features: { title: string; desc: string }[];
  accentColor: string;
  borderColor: string;
}

function PanelContent({ eyebrow, headline, subtext, features, accentColor, borderColor }: PanelContentProps) {
  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <span style={{
          border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '4px 10px',
          fontSize: '11px', fontFamily: '"SF Mono","Fira Code","Courier New",monospace',
          letterSpacing: '0.12em', color: accentColor, textTransform: 'uppercase',
          background: `${accentColor}0d`,
        }}>{eyebrow}</span>
      </div>
      <h2 style={{
        fontSize: 'clamp(1.5rem, 6vw, 2.6rem)', fontWeight: 800, lineHeight: 1.1,
        color: '#f5f5f5', margin: '0 0 16px 0', letterSpacing: '-0.02em', whiteSpace: 'pre-line',
      }}>{headline}</h2>
      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#8b949e', margin: '0 0 28px 0', maxWidth: '480px' }}>{subtext}</p>
      <div style={{ width: '40px', height: '2px', background: accentColor, borderRadius: '2px', marginBottom: '24px', opacity: 0.6 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <CheckIcon color={accentColor} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e6edf3', marginBottom: '2px', letterSpacing: '-0.01em' }}>{f.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function BlogServiceStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 = panel1 fully visible, 1 = panel2 fully visible

  useEffect(() => {
    function onScroll() {
      const track = trackRef.current;
      if (!track) return;
      if (window.innerWidth > 760) return; // crossfade only on mobile

      const rect = track.getBoundingClientRect();
      const trackHeight = track.offsetHeight - window.innerHeight;
      if (trackHeight <= 0) return;

      // How far we've scrolled into the pinned track, 0 to 1
      const scrolled = -rect.top;
      const p = Math.min(1, Math.max(0, scrolled / trackHeight));
      setProgress(p);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section style={{ background: '#16181d' }}>
      <style>{`
        .bss-row {
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
        }
        .bss-panel {
          flex: 1;
          padding: 72px 56px;
          display: flex;
          flex-direction: column;
        }
        .bss-crossfade-track { display: none; }

        @media (max-width: 760px) {
          .bss-row { display: none; }
          .bss-crossfade-track {
            display: block;
            position: relative;
            height: 220vh; /* scroll distance for the crossfade to play out */
          }
          .bss-crossfade-pin {
            position: sticky;
            top: 0;
            height: 100vh;
            overflow: hidden;
          }
          .bss-crossfade-card {
            position: absolute;
            inset: 0;
            padding: 28px 22px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow-y: auto;
          }
        }
      `}</style>

      {/* Desktop: side-by-side, unchanged */}
      <div className="bss-row">
        <div className="bss-panel" style={{ borderRight: '1px solid #2a2d35' }}>
          <PanelContent
            eyebrow="Product 1 — App Monitoring"
            headline={`Know the moment\nsomething breaks.`}
            subtext="Your site goes down at 3am. Your customer notices before you do. InfraMind ends that. Every endpoint, checked every 30 seconds. Every alert, in your inbox before damage is done."
            features={monitoringFeatures}
            accentColor="#4ade80"
            borderColor="#2a2d35"
          />
        </div>
        <div className="bss-panel">
          <PanelContent
            eyebrow="Product 2 — Blog as a Service"
            headline={`Fresh content,\nzero effort.`}
            subtext="Your clients need SEO content. You need a scalable product. InfraMind generates AI blog posts, publishes them to your client's subdomain, and tracks the organic growth — all from one dashboard."
            features={blogFeatures}
            accentColor="#818cf8"
            borderColor="#2d3148"
          />
        </div>
      </div>

      {/* Mobile: pinned crossfade */}
      <div className="bss-crossfade-track" ref={trackRef}>
        <div className="bss-crossfade-pin">
          <div style={{
            position: 'fixed', top: 8, right: 8, zIndex: 999,
            background: 'red', color: 'white', padding: '4px 8px',
            fontSize: '12px', fontFamily: 'monospace'
          }}>
            progress: {progress.toFixed(2)}
          </div>
          <div
            className="bss-crossfade-card"
            style={{
              background: '#16181d',
              opacity: 1 - progress,
              pointerEvents: progress > 0.5 ? 'none' : 'auto',
            }}
          >
            <PanelContent
              eyebrow="Product 1 — App Monitoring"
              headline={`Know the moment\nsomething breaks.`}
              subtext="Your site goes down at 3am. Your customer notices before you do. InfraMind ends that. Every endpoint, checked every 30 seconds. Every alert, in your inbox before damage is done."
              features={monitoringFeatures}
              accentColor="#4ade80"
              borderColor="#2a2d35"
            />
          </div>
          <div
            className="bss-crossfade-card"
            style={{
              background: '#12141a',
              opacity: progress,
              pointerEvents: progress > 0.5 ? 'auto' : 'none',
            }}
          >
            <PanelContent
              eyebrow="Product 2 — Blog as a Service"
              headline={`Fresh content,\nzero effort.`}
              subtext="Your clients need SEO content. You need a scalable product. InfraMind generates AI blog posts, publishes them to your client's subdomain, and tracks the organic growth — all from one dashboard."
              features={blogFeatures}
              accentColor="#818cf8"
              borderColor="#2d3148"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
