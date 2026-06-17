'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .al-wrap {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #09090f;
    color: #e2e6f0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .al-card {
    width: 100%;
    max-width: 380px;
    background: #0d0f16;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 32px 28px;
  }

  .al-tag {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #34d399;
    margin-bottom: 10px;
  }

  .al-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 22px;
    font-weight: 500;
    color: #eef1f6;
    margin-bottom: 24px;
  }

  .al-label {
    display: block;
    font-size: 12px;
    color: #8a95a3;
    margin-bottom: 8px;
  }

  .al-input {
    width: 100%;
    background: #11141d;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    color: #eef1f6;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }

  .al-input:focus { border-color: #34d399; }

  .al-btn {
    width: 100%;
    margin-top: 18px;
    background: #34d399;
    color: #06140f;
    border: none;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .al-btn:hover { opacity: 0.9; }
  .al-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .al-error {
    margin-top: 14px;
    font-size: 13px;
    color: #f87171;
    text-align: center;
  }
`;

function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Incorrect password');
        setLoading(false);
        return;
      }

      const next = searchParams.get('next') || '/ad-min';
      router.replace(next);
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="al-wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="al-card">
        <div className="al-tag">Admin Panel</div>
        <div className="al-title">Sign in</div>

        <form onSubmit={handleSubmit}>
          <label className="al-label" htmlFor="al-password">Password</label>
          <input
            id="al-password"
            type="password"
            className="al-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />

          <button type="submit" className="al-btn" disabled={loading}>
            {loading ? 'Checking…' : 'Enter'}
          </button>

          {error && <div className="al-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
