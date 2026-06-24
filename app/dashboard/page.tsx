'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{type:'ok'|'err', text:string}|null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        setEmail(session.user.email || '');
        setFirstName(session.user.user_metadata?.full_name || session.user.user_metadata?.first_name || '');
        setChecking(false);
      }
    });
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { setPwMsg({type:'err', text:'All fields required.'}); return; }
    if (newPassword !== confirmPassword) { setPwMsg({type:'err', text:'Passwords do not match.'}); return; }
    if (newPassword.length < 6) { setPwMsg({type:'err', text:'Password must be at least 6 characters.'}); return; }
    setPwLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) { setPwMsg({type:'err', text:'Current password is incorrect.'}); setPwLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) { setPwMsg({type:'err', text:error.message}); return; }
    setPwMsg({type:'ok', text:'Password updated successfully.'});
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#09090f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #34d399', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const initial = (firstName || email || '?').charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#09090f', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#e2e6f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .dash-card-hover { transition: border-color 0.2s; }
        .dash-card { padding: 32px; }
        .dash-topbar { padding: 0 32px; }
        .dash-pw-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 6px; }
        input:focus { border-color: rgba(52,211,153,0.4) !important; }
        button { -webkit-tap-highlight-color: transparent; }

        /* Tablet */
        @media (max-width: 860px) {
          .dash-grid { grid-template-columns: 1fr; }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .dash-topbar { padding: 0 18px !important; }
          .dash-topbar-email { display: none !important; }
          .dash-main { padding: 28px 18px 64px !important; }
          .dash-card { padding: 22px !important; }
          .dash-h1 { font-size: 26px !important; }
          .dash-pw-actions { flex-direction: column-reverse; align-items: stretch; gap: 14px; }
          .dash-pw-submit { width: 100%; }
          .dash-forgot { text-align: center; }
        }

        @media (max-width: 380px) {
          .dash-card { padding: 18px !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="dash-topbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.055)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#09090f', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 15 15" fill="#09090f" width="17" height="17"><path d="M7.5 1l2 4.5H14l-3.5 3 1.5 4.5L7.5 11 3.5 13 5 8.5 1.5 5.5H5.5L7.5 1Z" /></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#e2e6f0', letterSpacing: '-0.01em' }}>InfraMind</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#34d399', flexShrink: 0 }}>{initial}</div>
            <span className="dash-topbar-email" style={{ fontSize: 14, color: '#6b7280' }}>{email}</span>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            style={{ fontSize: 13, color: '#6b7280', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s, border-color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e2e6f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            Sign out
          </button>
        </div>
      </div>

      <div className="dash-main" style={{ maxWidth: 960, margin: '0 auto', padding: '56px 32px 88px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3a3f52', marginBottom: 12 }}>Dashboard</p>
          <h1 className="dash-h1" style={{ fontSize: 32, fontWeight: 700, color: '#e2e6f0', letterSpacing: '-0.025em', marginBottom: 10, lineHeight: 1.2 }}>
            {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 15, color: '#4a5068', lineHeight: 1.6 }}>Select a product below to get started.</p>
        </div>

        {/* Product Cards */}
        <div className="dash-grid" style={{ marginBottom: 56 }}>

          {/* Blog */}
          <div className="dash-card dash-card-hover"
            onClick={() => router.push('/dashboard/client')}
            style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                  <path d="M4 4h12M4 8h8M4 12h10M4 16h6" />
                </svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: 99, padding: '5px 13px', letterSpacing: '0.06em' }}>ACTIVE</span>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 600, color: '#e2e6f0', marginBottom: 10, letterSpacing: '-0.01em' }}>Blog-as-a-Service</h2>
            <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>Auto-generate SEO-optimized blogs for your company. Review, approve and publish — all in one place.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
              {['AI-powered blog generation', 'SEO keyword targeting', 'Approve before publishing'].map((f: string) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14, color: '#4a5068' }}>
                  <svg viewBox="0 0 12 12" fill="#34d399" width="9" height="9"><circle cx="6" cy="6" r="3.5" /></svg>{f}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#34d399' }}>
              Go to Blog Portal
              <svg viewBox="0 0 16 16" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </div>
          </div>

          {/* Social Media */}
          <div className="dash-card dash-card-hover"
            onClick={() => router.push('/dashboard/social')}
            style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                  <circle cx="7" cy="10" r="3"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/>
                  <path d="M10 10l3-3.5M10 10l3 3.5"/>
                </svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a855f7', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)', borderRadius: 99, padding: '5px 13px', letterSpacing: '0.06em' }}>NEW</span>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 600, color: '#e2e6f0', marginBottom: 10, letterSpacing: '-0.01em' }}>Social Media AI</h2>
            <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>Generate on-brand posts and stories for Instagram, LinkedIn and Twitter — with AI images matching your brand style.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
              {['AI caption + image generation', 'Instagram, LinkedIn & Twitter', 'Story & post formats'].map((f: string) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14, color: '#4a5068' }}>
                  <svg viewBox="0 0 12 12" fill="#a855f7" width="9" height="9"><circle cx="6" cy="6" r="3.5" /></svg>{f}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#a855f7' }}>
              Go to Social Studio
              <svg viewBox="0 0 16 16" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </div>
          </div>

          {/* Monitoring */}
          <div className="dash-card dash-card-hover"
            onClick={() => router.push('/monitors')}
            style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                  <path d="M2 10h3l3-7 4 14 3-7h3" />
                </svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: 99, padding: '5px 13px', letterSpacing: '0.06em' }}>ACTIVE</span>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 600, color: '#e2e6f0', marginBottom: 10, letterSpacing: '-0.01em' }}>Uptime Monitoring</h2>
            <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>Monitor your services 24/7, track incidents and get instantly alerted when something goes down.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
              {['Real-time uptime checks', 'Incident tracking', 'Instant email alerts'].map((f: string) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14, color: '#4a5068' }}>
                  <svg viewBox="0 0 12 12" fill="#60a5fa" width="9" height="9"><circle cx="6" cy="6" r="3.5" /></svg>{f}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#60a5fa' }}>
              Go to Monitoring
              <svg viewBox="0 0 16 16" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.055)', marginBottom: 40 }} />

        {/* Account */}
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3a3f52', marginBottom: 22 }}>Account</p>

        <div className="dash-grid">

          {/* Profile */}
          <div className="dash-card" style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#34d399', flexShrink: 0 }}>{initial}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e6f0', marginBottom: 3 }}>{firstName || 'Your profile'}</div>
                <div style={{ fontSize: 13, color: '#3f4459' }}>Account information</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[{ label: 'Name', val: firstName || '—' }, { label: 'Email', val: email || '—' }].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a3f52', marginBottom: 8 }}>{label}</div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '13px 16px', fontSize: 15, color: '#6b7280' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div className="dash-card" style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 30 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="17" height="17"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5 7V4.5a3 3 0 0 1 6 0V7" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e6f0', marginBottom: 3 }}>Change Password</div>
                <div style={{ fontSize: 13, color: '#3f4459' }}>Update your login password</div>
              </div>
            </div>
            {pwMsg && (
              <div style={{ fontSize: 14, borderRadius: 10, padding: '11px 15px', marginBottom: 20, background: pwMsg.type === 'ok' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', color: pwMsg.type === 'ok' ? '#34d399' : '#f87171', border: `1px solid ${pwMsg.type === 'ok' ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)'}` }}>
                {pwMsg.text}
              </div>
            )}
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Current password', val: currentPassword, set: setCurrentPassword },
                { label: 'New password', val: newPassword, set: setNewPassword },
                { label: 'Confirm new password', val: confirmPassword, set: setConfirmPassword },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a3f52', marginBottom: 8 }}>{label}</div>
                  <input type="password" value={val} onChange={e => set(e.target.value)} placeholder="••••••••"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', fontSize: 15, color: '#e2e6f0', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              ))}
              <div className="dash-pw-actions">
                <button type="submit" disabled={pwLoading} className="dash-pw-submit"
                  style={{ background: '#34d399', color: '#09090f', border: 'none', borderRadius: 10, padding: '13px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: pwLoading ? 0.6 : 1, fontFamily: 'inherit', minHeight: 46 }}>
                  {pwLoading ? 'Updating...' : 'Update password'}
                </button>
                <button type="button" onClick={() => router.push('/reset-password')} className="dash-forgot"
                  style={{ fontSize: 13, color: '#3f4459', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Forgot password?
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
