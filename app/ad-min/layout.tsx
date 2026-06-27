'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; }

  .admin-shell {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #09090f;
    color: #e2e6f0;
    min-height: 100vh;
    display: flex;
  }

  /* ── Sidebar ── */
  .admin-sidebar {
    width: 210px;
    flex-shrink: 0;
    background: #0d0f16;
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 24px 14px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    z-index: 100;
  }
  .admin-logo {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    color: #34d399;
    letter-spacing: 0.04em;
    margin-bottom: 28px;
    padding: 0 8px;
  }
  .admin-nav-link {
    display: block;
    padding: 10px 12px;
    border-radius: 8px;
    color: #8a95a3;
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    margin-bottom: 2px;
    transition: background 0.15s, color 0.15s;
  }
  .admin-nav-link:hover { background: rgba(255,255,255,0.04); color: #e2e6f0; }

  /* ── Main ── */
  .admin-main {
    flex: 1;
    min-width: 0;
    padding: 32px 36px;
    max-width: 1100px;
    overflow-x: hidden;
  }

  /* ── Mobile top bar (hidden on desktop) ── */
  .admin-topbar {
    display: none;
  }

  /* ── Mobile drawer overlay ── */
  .admin-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 90;
  }

  /* ── Mobile hamburger ── */
  .admin-hamburger {
    background: none;
    border: none;
    color: #e2e6f0;
    font-size: 22px;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
  }

  @media (max-width: 680px) {
    .admin-shell { flex-direction: column; }

    /* hide sticky sidebar, show as drawer */
    .admin-sidebar {
      position: fixed;
      top: 0; left: 0;
      height: 100vh;
      transform: translateX(-100%);
      transition: transform 0.22s ease;
      width: 220px;
    }
    .admin-sidebar.open {
      transform: translateX(0);
    }

    .admin-overlay.open { display: block; }

    /* top bar */
    .admin-topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: #0d0f16;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      position: sticky;
      top: 0;
      z-index: 80;
    }
    .admin-topbar-logo {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      color: #34d399;
      letter-spacing: 0.04em;
    }

    .admin-main {
      padding: 20px 16px;
    }
  }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/accounts')
      .then(r => { setAuthed(r.ok); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

  async function login() {
    setLoading(true); setError('');
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) { setAuthed(true); } else { setError('Incorrect password'); }
    setLoading(false);
  }

  if (checking) return (
    <div style={{ background: '#09090f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#8a95a3', fontFamily: 'system-ui' }}>Loading…</p>
    </div>
  );

  if (!authed) return (
    <div style={{ background: '#09090f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', padding: '20px' }}>
      <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '36px 28px', width: '100%', maxWidth: 340 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: 8 }}>InfraMind</p>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#eef1f6', marginBottom: 24 }}>Admin Access</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', background: '#11141d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#eef1f6', outline: 'none', fontFamily: 'inherit', marginBottom: 12 }}
        />
        {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 10 }}>{error}</p>}
        <button onClick={login} disabled={loading}
          style={{ width: '100%', background: '#34d399', color: '#000', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Checking…' : 'Login'}
        </button>
      </div>
    </div>
  );

  const navLinks = [
    { href: '/ad-min',                label: 'Overview' },
    { href: '/ad-min/clients',        label: 'Clients' },
    { href: '/ad-min/monitoring',     label: 'Monitoring' },
    { href: '/ad-min/blog',           label: 'Blog Posts' },
    { href: '/ad-min/linkedin-rewards', label: 'LinkedIn Rewards' },
    { href: '/ad-min/social-proof',   label: 'Social Proof' },
  ];

  return (
    <div className="admin-shell">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Mobile overlay */}
      <div className={`admin-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Sidebar (sticky desktop / drawer mobile) */}
      <div className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-logo">INFRAMIND · ADMIN</div>
        {navLinks.map(l => (
          <Link key={l.href} href={l.href} className="admin-nav-link" onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Mobile top bar */}
      <div className="admin-topbar">
        <button className="admin-hamburger" onClick={() => setMenuOpen(o => !o)}>☰</button>
        <span className="admin-topbar-logo">INFRAMIND · ADMIN</span>
      </div>

      {/* Main content */}
      <div className="admin-main">{children}</div>
    </div>
  );
}
