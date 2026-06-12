'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWhatsAppHint, setShowWhatsAppHint] = useState(false);
  const [view, setView] = useState<'login' | 'change_password' | 'change_done' | 'forgot_password' | 'forgot_sent'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowWhatsAppHint(false);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setShowWhatsAppHint(true);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (signInError) {
      setError('Current password is incorrect');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      await supabase.auth.signOut();
      setView('change_done');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'https://www.inframindhq.online/reset-password',
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setView('forgot_sent');
    }
  };

  const handleForgotWhatsApp = () => {
    const userEmail = email.trim() || 'not entered yet';
    const msg = `Hi, I forgot my InfraMind password and need a reset.%0AMy registered email: ${encodeURIComponent(userEmail)}`;
    window.open(`https://wa.me/919633474645?text=${msg}`, '_blank');
  };

  const WhatsAppIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1ddb78" className="mt-0.5 flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  const Logo = () => (
    <div
      className="w-10 h-10 mb-4 rounded-[10px] flex items-center justify-center"
      style={{ background: '#1ddb78', boxShadow: '0 0 15px rgba(29,219,120,0.4)' }}
    >
      <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
        <polyline points="12 3 5.5 10 2 6.5" stroke="#07090d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#07090d] relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md p-8 bg-[#0d1117] border border-white/[0.05] rounded-2xl shadow-2xl">

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <>
            <div className="flex flex-col items-center mb-8">
              <Logo />
              <h1 className="text-3xl font-serif text-[#eef1f6] mb-2">Welcome back</h1>
              <p className="text-sm text-[#8a95a3]">Log in to your InfraMind dashboard</p>
            </div>

            {error && (
              <div
                className="mb-4 px-4 py-2.5 rounded-lg text-xs text-red-400 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </div>
            )}

            <form className="space-y-4 text-left" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Email address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setShowWhatsAppHint(false);
                    setError('');
                  }}
                  className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-[#eef1f6] focus:outline-none focus:border-[#1ddb78] transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-[#8a95a3]">Password</label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setShowWhatsAppHint(false); setView('change_password'); }}
                    className="text-xs text-[#8a95a3] hover:text-[#eef1f6] transition-colors"
                  >
                    Change password
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowWhatsAppHint(false);
                    setError('');
                  }}
                  className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-[#eef1f6] focus:outline-none focus:border-[#1ddb78] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 text-sm rounded-lg flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50"
                style={{ background: '#1ddb78', color: '#07090d' }}
              >
                {loading ? 'Logging in...' : 'Log in →'}
              </button>
            </form>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => { setError(''); setShowWhatsAppHint(false); setResetEmail(email); setView('forgot_password'); }}
                className="text-xs text-[#8a95a3] hover:text-[#1ddb78] transition-colors underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            {/* WhatsApp hint — only shows after failed login */}
            {showWhatsAppHint && (
              <div
                className="mt-4 px-4 py-3 rounded-lg flex items-start gap-3 cursor-pointer"
                style={{ background: 'rgba(29,219,120,0.05)', border: '1px solid rgba(29,219,120,0.15)' }}
                onClick={handleForgotWhatsApp}
              >
                <WhatsAppIcon />
                <p className="text-[11px] text-[#8a95a3] leading-relaxed">
                  Still stuck?{' '}
                  <span className="text-[#1ddb78] underline underline-offset-2">
                    Message admin on WhatsApp
                  </span>{' '}
                  for help.
                </p>
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-white/[0.05] text-center">
              <p className="text-xs text-[#8a95a3]">
                Don't have an account?{' '}
                <Link href="/signup" className="text-[#1ddb78] hover:underline font-medium">
                  Start for free
                </Link>
              </p>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {view === 'forgot_password' && (
          <>
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-10 h-10 mb-4 rounded-[10px] flex items-center justify-center"
                style={{ background: 'rgba(29,219,120,0.1)', border: '1px solid rgba(29,219,120,0.3)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1ddb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-[#eef1f6] mb-2">Reset your password</h1>
              <p className="text-sm text-[#8a95a3] text-center">Enter your email and we'll send you a reset link.</p>
            </div>

            {error && (
              <div
                className="mb-4 px-4 py-2.5 rounded-lg text-xs text-red-400 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Email address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-[#eef1f6] focus:outline-none focus:border-[#1ddb78] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm rounded-lg flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50"
                style={{ background: '#1ddb78', color: '#07090d' }}
              >
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/[0.05] text-center">
              <button
                onClick={() => { setError(''); setView('login'); }}
                className="text-xs text-[#8a95a3] hover:text-[#eef1f6] transition-colors"
              >
                ← Back to login
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD: EMAIL SENT ── */}
        {view === 'forgot_sent' && (
          <div className="flex flex-col items-center text-center py-4">
            <div
              className="w-12 h-12 mb-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(29,219,120,0.1)', border: '1px solid rgba(29,219,120,0.3)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1ddb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 6 12 13 2 6" />
                <rect x="2" y="4" width="20" height="16" rx="2" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-[#eef1f6] mb-2">Check your email</h1>
            <p className="text-sm text-[#8a95a3] mb-8">
              We've sent a password reset link to <span className="text-[#eef1f6]">{resetEmail}</span>. Click the link to set a new password.
            </p>
            <button
              onClick={() => { setError(''); setView('login'); }}
              className="w-full py-3 text-sm rounded-lg font-semibold transition-all"
              style={{ background: '#1ddb78', color: '#07090d' }}
            >
              ← Back to login
            </button>
          </div>
        )}

        {/* ── CHANGE PASSWORD ── */}
        {view === 'change_password' && (
          <>
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-10 h-10 mb-4 rounded-[10px] flex items-center justify-center"
                style={{ background: 'rgba(29,219,120,0.1)', border: '1px solid rgba(29,219,120,0.3)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1ddb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-[#eef1f6] mb-2">Change password</h1>
              <p className="text-sm text-[#8a95a3] text-center">Verify your identity then set a new password.</p>
            </div>

            {error && (
              <div
                className="mb-4 px-4 py-2.5 rounded-lg text-xs text-red-400 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Email address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-[#eef1f6] focus:outline-none focus:border-[#1ddb78] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Current password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-[#eef1f6] focus:outline-none focus:border-[#1ddb78] transition-colors"
                  required
                />
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <span className="text-[10px] text-[#8a95a3] uppercase tracking-wider">New password</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">New password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-[#eef1f6] focus:outline-none focus:border-[#1ddb78] transition-colors"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Confirm new password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-[#eef1f6] focus:outline-none focus:border-[#1ddb78] transition-colors"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm rounded-lg flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50"
                style={{ background: '#1ddb78', color: '#07090d' }}
              >
                {loading ? 'Updating...' : 'Update password →'}
              </button>
            </form>

            {/* Can't remember old password */}
            <div
              className="mt-4 px-4 py-3 rounded-lg flex items-start gap-3 cursor-pointer"
              style={{ background: 'rgba(29,219,120,0.05)', border: '1px solid rgba(29,219,120,0.12)' }}
              onClick={handleForgotWhatsApp}
            >
              <WhatsAppIcon />
              <p className="text-[11px] text-[#8a95a3] leading-relaxed">
                Can't remember your current password?{' '}
                <span className="text-[#1ddb78] underline underline-offset-2">
                  Tap here to message admin on WhatsApp
                </span>{' '}
                for a reset.
              </p>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => { setError(''); setResetEmail(email); setView('forgot_password'); }}
                className="text-xs text-[#8a95a3] hover:text-[#1ddb78] transition-colors underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => { setError(''); setResetEmail(email); setView('forgot_password'); }}
                className="text-xs text-[#8a95a3] hover:text-[#1ddb78] transition-colors underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-white/[0.05] text-center">
              <button
                onClick={() => { setError(''); setView('login'); }}
                className="text-xs text-[#8a95a3] hover:text-[#eef1f6] transition-colors"
              >
                ← Back to login
              </button>
            </div>
          </>
        )}

        {/* ── SUCCESS ── */}
        {view === 'change_done' && (
          <div className="flex flex-col items-center text-center py-4">
            <div
              className="w-12 h-12 mb-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(29,219,120,0.1)', border: '1px solid rgba(29,219,120,0.3)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1ddb78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-[#eef1f6] mb-2">Password updated!</h1>
            <p className="text-sm text-[#8a95a3] mb-8">
              Your password has been changed successfully. Log in with your new password.
            </p>
            <button
              onClick={() => {
                setError('');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPassword('');
                setShowWhatsAppHint(false);
                setView('login');
              }}
              className="w-full py-3 text-sm rounded-lg font-semibold transition-all"
              style={{ background: '#1ddb78', color: '#07090d' }}
            >
              Go to login →
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
