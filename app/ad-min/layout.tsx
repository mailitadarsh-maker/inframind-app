'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
  .admin-shell { font-family: 'DM Sans', system-ui, sans-serif; background: #09090f; color: #e2e6f0; min-height: 100vh; display: flex; }
  .admin-sidebar { width: 220px; flex-shrink: 0; background: #0d0f16; border-right: 1px solid rgba(255,255,255,0.06); padding: 24px 16px; position: sticky; top: 0; height: 100vh; }
  .admin-logo { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 500; color: #34d399; letter-spacing: 0.04em; margin-bottom: 28px; padding: 0 8px; }
  .admin-nav-link { display: block; padding: 10px 12px; border-radius: 8px; color: #8a95a3; text-decoration: none; font-size: 13.5px; font-weight: 500; margin-bottom: 2px; transition: background 0.15s, color 0.15s; }
  .admin-nav-link:hover { background: rgba(255,255,255,0.04); color: #e2e6f0; }
  .admin-main { flex: 1; padding: 32px 40px; max-width: 1100px; }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authed by hitting a protected endpoint
    fetch('/api/admin/accounts')
      .then(r => { setAuthed(r.ok); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

  async function login() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setError('Incorrect password');
    }
    setLoading(false);
  }

  if (checking) return (
    <div style={{ background: '#09090f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#8a95a3', fontFamily: 'system-ui' }}>Loading…</p>
    </div>
  );

  if (!authed) return (
    <div style={{ background: '#09090f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px 36px', width: 340 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: 8 }}>InfraMind</p>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#eef1f6', marginBottom: 24 }}>Admin Access</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', background: '#11141d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#eef1f6', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 12 }}
        />
        {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 10 }}>{error}</p>}
        <button
          onClick={login}
          disabled={loading}
          style={{ width: '100%', background: '#34d399', color: '#000', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Checking…' : 'Login'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-shell">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="admin-sidebar">
        <div className="admin-logo">INFRAMIND · ADMIN</div>
        <Link href="/ad-min" className="admin-nav-link">Overview</Link>
        <Link href="/ad-min/clients" className="admin-nav-link">Clients</Link>
        <Link href="/ad-min/blog" className="admin-nav-link">Blog Posts</Link>
        <Link href="/ad-min/linkedin-rewards" className="admin-nav-link">LinkedIn Rewards</Link>
        <Link href="/ad-min/social-proof" className="admin-nav-link">Social Proof</Link>
      </div>
      <div className="admin-main">{children}</div>
    </div>
  );
}
