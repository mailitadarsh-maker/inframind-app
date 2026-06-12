'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'checking' | 'form' | 'done' | 'invalid'>('checking');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setView('form');
      } else {
        setView('invalid');
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      await supabase.auth.signOut();
      setView('done');
    }
  };

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

        {/* CHECKING SESSION */}
        {view === 'checking' && (
          <div className="flex flex-col items-center text-center py-8">
            <Logo />
            <p className="text-sm text-[#8a95a3]">Verifying your reset link...</p>
          </div>
        )}

        {/* INVALID / EXPIRED LINK */}
        {view === 'invalid' && (
          <div className="flex flex-col items-center text-center py-4">
            <div
              className="w-12 h-12 mb-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-[#eef1f6] mb-2">Link expired</h1>
            <p className="text-sm text-[#8a95a3] mb-8">
              This password reset link is invalid or has expired. Please request a new one from the login page.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 text-sm rounded-lg font-semibold transition-all"
              style={{ background: '#1ddb78', color: '#07090d' }}
            >
              Go to login →
            </button>
          </div>
        )}

        {/* RESET PASSWORD FORM */}
        {view === 'form' && (
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
              <h1 className="text-2xl font-serif text-[#eef1f6] mb-2">Set a new password</h1>
              <p className="text-sm text-[#8a95a3] text-center">Choose a new password for your account.</p>
            </div>

            {error && (
              <div
                className="mb-4 px-4 py-2.5 rounded-lg text-xs text-red-400 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleResetPassword}>
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
          </>
        )}

        {/* SUCCESS */}
        {view === 'done' && (
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
              onClick={() => router.push('/login')}
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
