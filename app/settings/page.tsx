'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.im { font-family: 'DM Sans', system-ui, sans-serif; background: #09090f; color: #e2e6f0; min-height: 100vh; display: flex; }

/* ── Sidebar ─────────────────────────────────────────────────── */
.im-sb {
  width: 216px; min-height: 100vh; background: #0d0f16;
  border-right: 1px solid rgba(255,255,255,0.055);
  display: flex; flex-direction: column;
  padding: 24px 12px; position: fixed; top: 0; left: 0; bottom: 0;
  z-index: 40;
}
.im-sb-logo { display: flex; align-items: center; gap: 10px; padding: 4px 8px; margin-bottom: 28px; }
.im-sb-logo-mark {
  width: 28px; height: 28px; border-radius: 8px;
  background: #34d399 !important;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.im-sb-logo-mark svg { width: 15px; height: 15px; }
.im-sb-logo-name { font-size: 14px; font-weight: 600; color: #e2e6f0; letter-spacing: -0.01em; }

.im-sb-section { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #3a3f52; padding: 0 10px; margin-bottom: 6px; }

.im-sb-nav { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.im-sb-link {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 8px;
  font-size: 13px; font-weight: 500; color: #6b7280;
  text-decoration: none; transition: all 0.15s;
}
.im-sb-link:hover { background: rgba(255,255,255,0.04); color: #c4c9d8; }
.im-sb-link.on { background: rgba(52,211,153,0.08) !important; color: #34d399 !important; }
.im-sb-link svg { width: 15px; height: 15px; flex-shrink: 0; opacity: 0.7; }
.im-sb-link.on svg { opacity: 1; }
.im-sb-link.danger { color: #f87171; border: none; background: none; cursor: pointer; font-family: inherit; }
.im-sb-link.danger:hover { background: rgba(248,113,113,0.08); }
.im-sb-footer { margin-top: auto; }

/* ── Main ─────────────────────────────────────────────────── */
.im-main { flex: 1; margin-left: 216px; padding: 32px 40px 64px; max-width: 100%; }
.im-h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 4px; }
.im-sub { font-size: 13px; color: #6b7280; margin-bottom: 28px; }

.im-card {
  background: #0d0f16; border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 24px; margin-bottom: 20px; max-width: 560px;
}
.im-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.im-card-icon {
  width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(52,211,153,0.08); color: #34d399;
}
.im-card-icon svg { width: 15px; height: 15px; }
.im-card-title { font-size: 15px; font-weight: 600; color: #e2e6f0; }
.im-card-desc { font-size: 12.5px; color: #6b7280; margin: 4px 0 22px 40px; }

.im-label { display: block; font-size: 12px; font-weight: 500; color: #8a95a3; margin-bottom: 6px; }
.im-field { margin-bottom: 16px; }
.im-input {
  width: 100%; background: #131920; border: 1px solid rgba(255,255,255,0.09);
  border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #e2e6f0;
  font-family: inherit; outline: none; transition: border-color 0.15s;
}
.im-input:focus { border-color: #34d399; }
.im-input:disabled { color: #8a95a3; cursor: not-allowed; }

.im-btn-primary {
  background: #34d399; color: #07090d; border: none; border-radius: 10px;
  padding: 11px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: opacity 0.15s; text-decoration: none;
  display: inline-flex; align-items: center; gap: 6px;
}
.im-btn-primary:hover { opacity: 0.9; }
.im-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.im-msg { font-size: 12px; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; }
.im-msg.err { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); color: #f87171; }
.im-msg.ok { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); color: #34d399; }

.im-forgot { font-size: 12px; color: #8a95a3; text-decoration: underline; text-decoration-color: rgba(138,149,163,0.4); background: none; border: none; cursor: pointer; font-family: inherit; padding: 0; }
.im-forgot:hover { color: #34d399; text-decoration-color: #34d399; }

/* Plan card */
.im-plan-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-left: 40px; }
.im-plan-name { font-size: 18px; font-weight: 600; color: #e2e6f0; text-transform: capitalize; }
.im-plan-meta { font-size: 12px; color: #6b7280; margin-top: 4px; }
.im-plan-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2);
  color: #34d399; font-size: 11px; font-weight: 600;
  padding: 4px 10px; border-radius: 100px; margin-left: 8px;
}

/* Avatar */
.im-avatar {
  width: 56px; height: 56px; border-radius: 14px;
  background: linear-gradient(135deg, rgba(52,211,153,0.18), rgba(52,211,153,0.06));
  border: 1px solid rgba(52,211,153,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700; color: #34d399;
  flex-shrink: 0;
}
.im-profile-head { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; }
.im-profile-head-text .im-card-title { font-size: 16px; }
.im-profile-head-text .im-card-desc { margin: 2px 0 0; }

/* Mobile nav (hidden on desktop) */
.im-mob-nav { display: none; }

@media (max-width: 860px) {
  .im-sb { display: none; }
  .im-main { margin-left: 0; padding: 20px 16px 80px; }
  .im-mob-nav {
    display: flex; position: fixed; bottom: 0; left: 0; right: 0;
    background: #0d0f16; border-top: 1px solid rgba(255,255,255,0.06);
    padding: 10px 12px; justify-content: space-around; z-index: 40;
  }
  .im-mob-link { color: #6b7280; text-decoration: none; font-size: 12px; font-weight: 500; }
  .im-mob-link.on { color: #34d399; }
}
`;

export default function SettingsPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setEmail(user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setFirstName(data.first_name || user.user_metadata?.first_name || '');
        setCompany(data.company || user.user_metadata?.company || '');
      } else {
        setFirstName(user.user_metadata?.first_name || '');
        setCompany(user.user_metadata?.company || '');
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMsg({ type: 'err', text: 'Please fill all fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'err', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'err', text: 'New password must be at least 6 characters.' });
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setLoading(false);
      setMsg({ type: 'err', text: 'Current password is incorrect.' });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setMsg({ type: 'err', text: updateError.message });
      return;
    }

    setMsg({ type: 'ok', text: 'Password updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const NAV = [
    {
      href: '/monitors', label: 'Monitors', active: false,
      icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><rect x="1" y="1" width="6" height="6" rx="1.5" /><rect x="9" y="1" width="6" height="6" rx="1.5" /><rect x="1" y="9" width="6" height="6" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx="1.5" /></svg>
    },
    {
      href: '/incidents', label: 'Incidents', active: false,
      icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M8 2L14 13H2L8 2Z" /><line x1="8" y1="7" x2="8" y2="10" /><circle cx="8" cy="12" r=".6" fill="currentColor" /></svg>
    },
    {
      href: '/settings', label: 'Settings', active: true,
      icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="15" height="15"><circle cx="8" cy="8" r="2.5" /><path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.6 3.6l.7.7M11.7 11.7l.7.7M12.4 3.6l-.7.7M4.3 11.7l-.7.7" /></svg>
    },
  ];

  const plan = profile?.plan || 'trial';
  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const initial = (firstName || email || '?').charAt(0).toUpperCase();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="im">
        {/* Sidebar */}
        <aside className="im-sb">
          <div className="im-sb-logo">
            <div className="im-sb-logo-mark">
              <svg viewBox="0 0 15 15" fill="#09090f" width="15" height="15"><path d="M7.5 1l2 4.5H14l-3.5 3 1.5 4.5L7.5 11 3.5 13 5 8.5 1.5 5.5H5.5L7.5 1Z" /></svg>
            </div>
            <span className="im-sb-logo-name">InfraMind</span>
          </div>
          <div className="im-sb-section" style={{ marginBottom: 8 }}>Navigation</div>
          <nav className="im-sb-nav">
            {NAV.map(l => (
              <Link key={l.href} href={l.href} className={`im-sb-link${l.active ? ' on' : ''}`}>
                {l.icon}{l.label}
              </Link>
            ))}
          </nav>
          <div className="im-sb-footer">
            <button onClick={handleLogout} className="im-sb-link danger" style={{ width: '100%' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="15" height="15"><path d="M10 8H2M7 5l-3 3 3 3" /><path d="M6 3H13V13H6" /></svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        <nav className="im-mob-nav">
          <Link href="/monitors" className="im-mob-link">Monitors</Link>
          <Link href="/incidents" className="im-mob-link">Incidents</Link>
          <Link href="/settings" className="im-mob-link on">Settings</Link>
        </nav>

        {/* Main */}
        <main className="im-main">
          <h1 className="im-h1">Settings</h1>
          <p className="im-sub">Manage your monitoring plan and notification preferences.</p>



          {/* Plan */}
          <div className="im-card">
            <div className="im-card-head">
              <div className="im-card-icon">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5l2 4.5H14l-3.5 3 1.5 4.5L8 11 4.5 13.5 6 9 2.5 6H6.5L8 1.5Z" /></svg>
              </div>
              <div className="im-card-title">Plan &amp; billing</div>
            </div>
            <div className="im-card-desc">Your current subscription.</div>

            <div className="im-plan-row">
              <div>
                <span className="im-plan-name">{plan}</span>
                {plan === 'trial' && trialDaysLeft !== null && (
                  <span className="im-plan-badge">{trialDaysLeft}d left</span>
                )}
                {profile?.max_monitors && (
                  <div className="im-plan-meta">{profile.max_monitors} monitor limit</div>
                )}
              </div>
              <Link href="/upgrade" className="im-btn-primary">
                Upgrade plan
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </Link>
            </div>
          </div>


        </main>
      </div>
    </>
  );
}
