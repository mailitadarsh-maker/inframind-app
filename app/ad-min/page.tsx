'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const fmt2 = (ts: string) => {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

function StatCard({ label, value, color = '#eef1f6' }: { label: string; value: any; color?: string }) {
  return (
    <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#555f6e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value ?? '—'}</p>
    </div>
  );
}

function HealthCard({ icon, label, status, statusLabel, sub, last }: {
  icon: string; label: string; status: 'ok' | 'error' | 'unknown';
  statusLabel: string; sub?: string; last?: string;
}) {
  const color = status === 'ok' ? '#34d399' : status === 'error' ? '#f87171' : '#fbbf24';
  return (
    <div style={{ background: '#0d0f16', border: `1px solid ${color}30`, borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#8a95a3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${color}18`, color, whiteSpace: 'nowrap' }}>{statusLabel}</span>
      </div>
      {sub && <p style={{ fontSize: 11.5, color: '#eef1f6', marginBottom: 4 }}>{sub}</p>}
      {last && <p style={{ fontSize: 10.5, color: '#555f6e' }}>Last: {last}</p>}
    </div>
  );
}

function SystemHealthStrip() {
  const [health, setHealth] = useState<any>(null);
  useEffect(() => {
    fetch('/api/admin/content-health').then(r => r.json()).then(d => setHealth(d.systemHealth));
  }, []);

  if (!health) return (
    <div style={{ padding: '14px 16px', background: '#0d0f16', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', color: '#555f6e', fontSize: 13 }}>
      Loading system health…
    </div>
  );

  const imgStatus = health.image.last_error ? 'error' : health.image.last_provider ? 'ok' : 'unknown';
  const imgLabel = health.image.last_provider === 'nvidia_flux' ? '⚡ NVIDIA' : health.image.last_provider === 'pollinations' ? '🌸 Pollinations' : 'No data';
  const imgSub = `Today: ${health.image.today_success} ok / ${health.image.today_fail} failed`;
  const blogStatus = health.blogs.last_status === 'success' ? 'ok' : health.blogs.last_status === 'failed' ? 'error' : 'unknown';
  const incStatus = health.incidents.last_status === 'success' ? 'ok' : health.incidents.last_status === 'failed' ? 'error' : 'unknown';

  return (
    <>
      <style>{`
        .health-strip { display: flex; gap: 10px; }
        @media (max-width: 600px) { .health-strip { flex-direction: column; } }
      `}</style>
      <div className="health-strip">
        <HealthCard icon="🖼️" label="Image Gen" status={imgStatus} statusLabel={imgLabel} sub={imgSub} last={fmt2(health.image.last_at)} />
        <HealthCard icon="📝" label="Blog Gen" status={blogStatus} statusLabel={health.blogs.last_status?.toUpperCase() || 'No data'} sub={health.blogs.last_message?.slice(0, 50) || '—'} last={fmt2(health.blogs.last_at)} />
        <HealthCard icon="🔴" label="Incident AI" status={incStatus} statusLabel={health.incidents.last_status?.toUpperCase() || 'No data'} sub={health.incidents.last_message?.slice(0, 50) || '—'} last={fmt2(health.incidents.last_at)} />
      </div>
    </>
  );
}

const NAV_LINKS = [
  { href: '/ad-min/clients',          icon: '👥', label: 'Clients',          desc: 'Manage plans, billing & limits' },
  { href: '/ad-min/monitoring',       icon: '⚡', label: 'Monitoring',        desc: 'Generation logs, engine control' },
  { href: '/ad-min/blog',             icon: '📝', label: 'Blog Posts',        desc: "InfraMind's own blog content" },
  { href: '/ad-min/linkedin-rewards', icon: '🎁', label: 'LinkedIn Rewards',  desc: 'Review referral submissions' },
  { href: '/ad-min/social-proof',     icon: '⭐', label: 'Social Proof',      desc: 'Testimonials & reviews' },
];

const AI_PROVIDERS = [
  { id: 'nvidia',  label: '⚡ NVIDIA (Llama 4)',   desc: 'Free · Fast',           color: '#a78bfa' },
  { id: 'openai',  label: '🤖 OpenAI (GPT-4o)',    desc: 'Paid · High quality',   color: '#34d399' },
  { id: 'claude',  label: '◇ Anthropic Claude',    desc: 'Paid · Best reasoning', color: '#00d4ff' },
] as const;

const styles = `
  .admin-wrap { display: flex; flex-direction: column; gap: 20px; padding: 0; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  @media (max-width: 600px) {
    .nav-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 360px) {
    .nav-grid { grid-template-columns: 1fr; }
  }

  .provider-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 640px) {
    .provider-grid { grid-template-columns: 1fr; gap: 12px; }
  }

  .provider-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: 480px) {
    .provider-header { flex-direction: column; }
    .provider-header button { width: 100%; justify-content: center; }
  }

  .nav-link {
    background: #0d0f16;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 14px 16px;
    text-decoration: none;
    color: #e2e6f0;
    display: block;
    transition: border-color 0.15s;
  }
  .nav-link:hover { border-color: rgba(52,211,153,0.3); }
`;

export default function AdminHomePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiBlogs, setAiBlogs]         = useState<string>('nvidia');
  const [aiSocial, setAiSocial]       = useState<string>('nvidia');
  const [aiIncidents, setAiIncidents] = useState<string>('nvidia');
  const [savingProvider, setSavingProvider] = useState(false);
  const [providerMsg, setProviderMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.ai_provider_blogs)     setAiBlogs(d.ai_provider_blogs);
      if (d.ai_provider_social)    setAiSocial(d.ai_provider_social);
      if (d.ai_provider_incidents) setAiIncidents(d.ai_provider_incidents);
    });
    fetch('/api/admin/clients').then(r => r.json()).then(d => {
      setClients(d.clients || []); setLoading(false);
    });
  }, []);

  const total       = clients.length;
  const trial       = clients.filter(c => c.payment_status === 'trial').length;
  const paid        = clients.filter(c => c.payment_status === 'paid').length;
  const totalBlogs  = clients.reduce((s, c) => s + (c.blog_stats?.total || 0), 0);
  const pending     = clients.reduce((s, c) => s + (c.blog_stats?.pending || 0), 0);
  const totalSocial = clients.reduce((s, c) => s + (c.social_stats?.total || 0), 0);

  const saveDefaults = async () => {
    setSavingProvider(true); setProviderMsg('');
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ai_provider_blogs: aiBlogs, ai_provider_social: aiSocial, ai_provider_incidents: aiIncidents }),
    });
    setProviderMsg('Saved!'); setSavingProvider(false);
    setTimeout(() => setProviderMsg(''), 2000);
  };

  const v = loading ? '—' : undefined;

  return (
    <>
      <style>{styles}</style>
      <div className="admin-wrap">

        {/* Header */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: 4 }}>Admin</p>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Overview</h1>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard label="Total Clients"  value={v ?? total}       />
          <StatCard label="On Trial"       value={v ?? trial}        color="#fbbf24" />
          <StatCard label="Paid"           value={v ?? paid}         color="#34d399" />
          <StatCard label="Total Blogs"    value={v ?? totalBlogs}   color="#a78bfa" />
          <StatCard label="Pending Review" value={v ?? pending}      color="#f87171" />
          <StatCard label="Social Posts"   value={v ?? totalSocial}  color="#60a5fa" />
        </div>

        {/* Nav */}
        <div className="nav-grid">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="nav-link">
              <p style={{ fontSize: 18, marginBottom: 6 }}>{l.icon}</p>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{l.label}</p>
              <p style={{ fontSize: 11, color: '#8a95a3', lineHeight: 1.4 }}>{l.desc}</p>
            </Link>
          ))}
        </div>

        {/* System Health */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#555f6e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>System Health</p>
          <SystemHealthStrip />
        </div>

        {/* AI Provider Defaults */}
        <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px' }}>
          <div className="provider-header">
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a95a3', marginBottom: 3 }}>AI Provider — Global Defaults</p>
              <p style={{ fontSize: 11.5, color: '#555f6e' }}>Set default AI per service. Clients can override.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {providerMsg && <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>✓ {providerMsg}</span>}
              <button onClick={saveDefaults} disabled={savingProvider} style={{
                padding: '7px 16px', borderRadius: 8, background: '#34d399', color: '#000',
                fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', opacity: savingProvider ? 0.5 : 1,
              }}>
                {savingProvider ? 'Saving…' : 'Save Defaults'}
              </button>
            </div>
          </div>

          <div className="provider-grid">
            {([
              { key: 'blogs',     label: '📝 Blog Generation',      value: aiBlogs,     set: setAiBlogs },
              { key: 'social',    label: '✦ Social Posts',           value: aiSocial,    set: setAiSocial },
              { key: 'incidents', label: '🔴 Incident AI Diagnosis', value: aiIncidents, set: setAiIncidents },
            ] as const).map(svc => (
              <div key={svc.key}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#8a95a3', marginBottom: 8 }}>{svc.label}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {AI_PROVIDERS.map(p => {
                    const active = svc.value === p.id;
                    return (
                      <button key={p.id} onClick={() => svc.set(p.id)} style={{
                        padding: '9px 12px', borderRadius: 9, textAlign: 'left',
                        border: `1px solid ${active ? p.color + '55' : 'rgba(255,255,255,0.07)'}`,
                        background: active ? p.color + '12' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}>
                        <p style={{ fontWeight: 600, fontSize: 12, color: active ? p.color : '#8a95a3', marginBottom: 2 }}>{p.label}</p>
                        <p style={{ fontSize: 10, color: '#555f6e' }}>{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
