'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminHomePage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      </div>
    </div>
  );
}
