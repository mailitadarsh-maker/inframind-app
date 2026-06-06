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
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#07090d] relative overflow-hidden">
      {/* Background Grid Animation */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#0d1117] border border-white/[0.05] rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 mb-4 bg-[#1ddb78] rounded-[10px] flex items-center justify-center shadow-[0_0_15px_rgba(29,219,120,0.4)]">
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
              <polyline points="12 3 5.5 10 2 6.5" stroke="#07090d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-[#eef1f6] mb-2">Welcome back</h1>
          <p className="text-sm text-[#8a95a3]">Log in to your InfraMind dashboard</p>
        </div>

        {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

        <form className="space-y-4 text-left" onSubmit={handleLogin}>
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-[#8a95a3]">Password</label>
              <a href="#" className="text-xs text-[#1ddb78] hover:underline">Forgot?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-[#eef1f6] focus:outline-none focus:border-[#1ddb78] transition-colors"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-6 text-sm rounded-lg flex items-center justify-center gap-2 bg-[#1ddb78] text-[#07090d] font-semibold hover:bg-[#22f585] transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in →'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.05] text-center">
          <p className="text-xs text-[#8a95a3]">
            Don't have an account? <Link href="/signup" className="text-[#1ddb78] hover:underline font-medium">Start for free</Link>
          </p>
        </div>
      </div>
    </main>
  );
}