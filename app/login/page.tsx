'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#07090d] relative overflow-hidden">
      {/* Background Grid Animation */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'gridDrift 8s linear infinite'
        }}
      />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#0d1117] border border-white/[0.05] rounded-2xl shadow-2xl animate-fade-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 mb-4 bg-green rounded-[10px] flex items-center justify-center shadow-[0_0_15px_rgba(29,219,120,0.4)]">
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
              <polyline points="12 3 5.5 10 2 6.5" stroke="#07090d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-text mb-2">Welcome back</h1>
          <p className="text-sm text-text-2">Log in to your InfraMind dashboard</p>
        </div>

        <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-medium text-text-2 mb-1.5">Email address</label>
            <input 
              type="email" 
              placeholder="you@company.com" 
              className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-green transition-colors"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-text-2">Password</label>
              <a href="#" className="text-xs text-green hover:underline">Forgot?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-[#131920] border border-white/[0.09] rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-green transition-colors"
            />
          </div>
          
          <Link href="/dashboard">
            <button type="submit" className="w-full btn-primary py-3 mt-6 text-sm rounded-lg flex items-center justify-center gap-2">
              Log in →
            </button>
          </Link>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.05] text-center">
          <p className="text-xs text-text-2">
            Don't have an account? <Link href="/login" className="text-green hover:underline font-medium">Start for free</Link>
          </p>
        </div>
      </div>
    </main>
  );
}