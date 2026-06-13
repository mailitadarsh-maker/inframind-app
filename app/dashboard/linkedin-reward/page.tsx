'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function LinkedInRewardPage() {
  const [url, setUrl] = useState('');
  const [captionCopied, setCaptionCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  async function submitReward() {
    if (!url.trim()) return;
    if (!userId) {
      setStatus('error');
      setMessage('Not signed in. Please log in and try again.');
      return;
    }
    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/linkedin/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, postUrl: url }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || "You've earned 14 extra trial days!");

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090f',
        color: '#fff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#0d1117',
          border: '1px solid #1f2937',
          borderRadius: '20px',
          padding: '40px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            marginBottom: '24px',
          }}
        >
          🎁
        </div>

        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#22c55e',
            marginBottom: '12px',
          }}
        >
          Referral Reward
        </div>

        <h1
          style={{
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            color: '#f9fafb',
            margin: '0 0 12px',
          }}
        >
          Claim{' '}
          <span style={{ color: '#22c55e' }}>14 extra trial days</span>
          <br />
          for sharing InfraMind.
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          Post about InfraMind on LinkedIn, then paste the link below.
          We'll verify it and add 14 days to your trial — instantly.
        </p>

        <div style={{ height: '1px', background: '#1f2937', marginBottom: '28px' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          {[
            { step: '1', text: 'Write a post about InfraMind on LinkedIn' },
            { step: '2', text: 'Copy the post URL from your browser' },
            { step: '3', text: 'Paste it below and submit' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#22c55e',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {step}
              </div>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>{text}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.18)',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Suggested Caption
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.6, margin: 0, flex: 1 }}>
              Hey, I've been using @InfraMindHQ to monitor my apps and websites — it alerts me the moment something goes down and even tells me what's wrong in plain English. If you run an app without a dev team, check it out 👉 https://inframindhq.online
            </p>
          </div>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '8px 0 0', lineHeight: 1.5 }}>
            💡 After pasting, delete and retype <strong style={{ color: '#9ca3af' }}>@InfraMindHQ</strong> so LinkedIn shows the autocomplete and links it to our page.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              onClick={() => {
                const text = "Hey, I've been using @InfraMindHQ to monitor my apps and websites — it alerts me the moment something goes down and even tells me what's wrong in plain English. If you run an app without a dev team, check it out 👉 https://inframindhq.online";
                navigator.clipboard.writeText(text);
                setCaptionCopied(true);
                setTimeout(() => setCaptionCopied(false), 2000);
              }}
              style={{
                flexShrink: 0,
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(34,197,94,0.25)',
                background: 'rgba(34,197,94,0.1)',
                color: '#4ade80',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {captionCopied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>

        <a
          onClick={(e) => {
            e.preventDefault();
            const shareUrl = 'https://inframindhq.online/';
            const webUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            const appUrl = `linkedin://shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`;
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
              const now = Date.now();
              window.location.href = appUrl;
              setTimeout(() => {
                if (Date.now() - now < 2000) {
                  window.location.href = webUrl;
                }
              }, 1200);
            } else {
              window.open(webUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#22c55e',
            color: '#09090f',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            marginBottom: '24px',
            boxSizing: 'border-box',
          }}
        >
          Share on LinkedIn →
        </a>

        <p
          style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '-12px 0 24px',
            textAlign: 'center',
          }}
        >
          This opens LinkedIn with InfraMind pre-attached. Add your own caption, post it, then paste the link below.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            LinkedIn Post URL
          </label>
          <input
            type="url"
            placeholder="https://linkedin.com/posts/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%',
              padding: '13px 16px',
              background: '#09090f',
              border: `1px solid ${
                focused
                  ? 'rgba(34,197,94,0.5)'
                  : status === 'error'
                  ? 'rgba(239,68,68,0.5)'
                  : '#1f2937'
              }`,
              borderRadius: '10px',
              color: '#f9fafb',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              boxShadow: focused ? '0 0 0 3px rgba(34,197,94,0.06)' : 'none',
            }}
          />
        </div>

        {status !== 'idle' && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: 500,
              background: status === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: status === 'success' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
              color: status === 'success' ? '#22c55e' : '#f87171',
            }}
          >
            {status === 'success' ? '✓ ' : '✕ '}
            {message}
            {status === 'success' && (
              <span style={{ color: '#6b7280', marginLeft: '6px' }}>
                Redirecting to dashboard...
              </span>
            )}
          </div>
        )}

        <button
          onClick={submitReward}
          disabled={loading || !url.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: loading || !url.trim() ? 'rgba(34,197,94,0.3)' : '#22c55e',
            color: loading || !url.trim() ? 'rgba(0,0,0,0.4)' : '#000',
            border: 'none',
            cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.01em',
            transition: 'background 0.2s',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(0,0,0,0.3)',
                  borderTopColor: '#000',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              Verifying...
            </span>
          ) : (
            'Claim 14 Days →'
          )}
        </button>

        <p
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#374151',
            marginTop: '16px',
            lineHeight: 1.5,
          }}
        >
          One reward per account. Post must mention InfraMind and be publicly visible.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}