'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminHomePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiBlogs, setAiBlogs] = useState<'nvidia' | 'openai'>('nvidia');
  const [aiSocial, setAiSocial] = useState<'nvidia' | 'openai'>('nvidia');
  const [aiIncidents, setAiIncidents] = useState<'nvidia' | 'openai'>('nvidia');
  const [savingProvider, setSavingProvider] = useState(false);
  const [providerMsg, setProviderMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.ai_provider_blogs) setAiBlogs(d.ai_provider_blogs as any);
      if (d.ai_provider_social) setAiSocial(d.ai_provider_social as any);
    });
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(d => { setClients(d.clients || []); setLoading(false); });
  }, []);

  const total = clients.length;
  const trial = clients.filter(c => c.payment_status === 'trial').length;
  const paid = clients.filter(c => c.payment_status === 'paid').length;
  const totalBlogs = clients.reduce((sum, c) => sum + (c.blog_stats?.total || 0), 0);
  const pendingReview = clients.reduce((sum, c) => sum + (c.blog_stats?.pending || 0), 0);

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: 6 }}>
        Admin
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 28 }}>Overview</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Total Clients', value: total },
          { label: 'On Trial', value: trial },
          { label: 'Paid', value: paid },
          { label: 'Blogs Pending Review', value: pendingReview },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 18px' }}>
            <p style={{ fontSize: 11, color: '#8a95a3', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: loading ? '#444' : '#eef1f6' }}>{loading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <Link href="/ad-min/clients" style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', color: '#e2e6f0' }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Clients</p>
          <p style={{ fontSize: 12.5, color: '#8a95a3' }}>Manage plans, billing & blog limits</p>
        </Link>
        <Link href="/ad-min/blog" style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', color: '#e2e6f0' }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Blog Posts</p>
          <p style={{ fontSize: 12.5, color: '#8a95a3' }}>InfraMind's own blog content</p>
        </Link>
        <Link href="/ad-min/linkedin-rewards" style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', color: '#e2e6f0' }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>LinkedIn Rewards</p>
          <p style={{ fontSize: 12.5, color: '#8a95a3' }}>Review referral submissions</p>
        </Link>
        <Link href="/ad-min/monitoring" style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', color: '#e2e6f0' }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>⚡ Monitoring</p>
          <p style={{ fontSize: 12.5, color: '#8a95a3' }}>Cron logs, errors & job health</p>
        </Link>
      </div>

      {/* AI Provider Settings */}
      <div style={{ marginTop: 24, background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a95a3', marginBottom: 4 }}>AI Provider — Global Defaults</p>
        <p style={{ fontSize: 12.5, color: '#555f6e', marginBottom: 20 }}>Set the default AI for each service. Individual clients can override this.</p>

        {([
          { key: 'blogs', label: '📝 Blog Generation', value: aiBlogs, set: setAiBlogs },
          { key: 'social', label: '✦ Social Posts', value: aiSocial, set: setAiSocial },
          { key: 'incidents', label: '🔴 Incident AI Diagnosis', value: aiIncidents, set: setAiIncidents },
        ] as const).map(svc => (
          <div key={svc.key} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#8a95a3', marginBottom: 8, fontWeight: 600 }}>{svc.label}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { id: 'nvidia', label: '⚡ NVIDIA (Llama 4)', desc: 'Free · Fast' },
                { id: 'openai', label: '🤖 OpenAI (GPT-4o)', desc: 'Paid · Higher quality' },
              ] as const).map(p => (
                <button key={p.id} onClick={() => svc.set(p.id)} style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  border: `1px solid ${svc.value === p.id ? '#34d399' : 'rgba(255,255,255,0.08)'}`,
                  background: svc.value === p.id ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.02)',
                  color: svc.value === p.id ? '#34d399' : '#8a95a3', cursor: 'pointer', textAlign: 'left' as const,
                }}>
                  <p style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{p.label}</p>
                  <p style={{ fontSize: 11, opacity: 0.7 }}>{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <button
            disabled={savingProvider}
            onClick={async () => {
              setSavingProvider(true);
              setProviderMsg('');
              await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ai_provider_blogs: aiBlogs, ai_provider_social: aiSocial, ai_provider_incidents: aiIncidents }),
              });
              setProviderMsg('Global defaults saved!');
              setSavingProvider(false);
            }}
            style={{ padding: '8px 20px', borderRadius: 8, background: '#34d399', color: '#000', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', opacity: savingProvider ? 0.5 : 1 }}
          >
            {savingProvider ? 'Saving...' : 'Save Defaults'}
          </button>
          {providerMsg && <p style={{ fontSize: 12, color: '#34d399' }}>{providerMsg}</p>}
        </div>
      </div>
    </div>
  );
}
