'use client';

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
  { label: 'Monitoring', id: 'monitoring' },
  { label: 'Blog Service', id: 'blog-service' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Blog', id: 'blog' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(19,21,26,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1f2229',
        padding: '0 20px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      className="md:!px-10"
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.7)',
          display: 'inline-block', flexShrink: 0,
        }} />
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.01em' }}>
          InfraMind
        </span>
      </Link>

      {/* Desktop nav links — hidden on mobile */}
      <div className="hidden md:flex" style={{ alignItems: 'center', gap: '32px' }}>
        {navLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => scrollTo(link.id)}
            style={{
              fontSize: '14px', color: '#9ca3af', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, transition: 'color 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f0f0f0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Desktop CTAs — hidden on mobile */}
      <div className="hidden md:flex" style={{ alignItems: 'center', gap: '12px' }}>
        <Link
          href="/login"
          style={{
            fontSize: '14px', fontWeight: 600, color: '#9ca3af',
            textDecoration: 'none', padding: '8px 16px',
            border: '1px solid #2a2d35', borderRadius: '8px',
            transition: 'color 0.15s, border-color 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; e.currentTarget.style.borderColor = '#4b5563'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#2a2d35'; }}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          style={{
            fontSize: '14px', fontWeight: 700, color: '#000',
            textDecoration: 'none', padding: '8px 18px',
            background: '#4ade80', borderRadius: '8px',
            transition: 'opacity 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Start free →
        </Link>
      </div>

      {/* Mobile hamburger button — hidden on desktop */}
      <button
        className="flex md:hidden"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round">
          {menuOpen ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="flex md:hidden"
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            background: '#13151a',
            borderBottom: '1px solid #1f2229',
            flexDirection: 'column',
            padding: '16px 20px 24px',
            gap: '4px',
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.id)}
              style={{
                fontSize: '15px', color: '#d1d5db', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '12px 4px', textAlign: 'left', width: '100%',
                borderBottom: '1px solid #1f2229',
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#9ca3af',
                textDecoration: 'none', padding: '10px 16px',
                border: '1px solid #2a2d35', borderRadius: '8px',
              }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              style={{
                flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#000',
                textDecoration: 'none', padding: '10px 16px',
                background: '#4ade80', borderRadius: '8px',
              }}
            >
              Start free →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
