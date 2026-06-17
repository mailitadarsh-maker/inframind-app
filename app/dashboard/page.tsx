'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else { setUser(session.user); setChecking(false); }
    });
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-[#4ade80] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e2128]">

      {/* Top bar */}
      <div className="border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#4ade80] flex items-center justify-center">
            <span className="text-black text-xs font-black">I</span>
          </div>
          <span className="text-white font-semibold text-sm">InfraMind</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-xs">{user?.email}</span>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="text-xs text-white/30 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-black text-white mb-3">Welcome back 👋</h1>
          <p className="text-white/40 text-base">What would you like to work on today?</p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* Blog-as-a-Service */}
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-8 flex flex-col hover:border-[#4ade80]/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#4ade80]/10 flex items-center justify-center text-3xl group-hover:bg-[#4ade80]/20 transition-colors">
                ✍️
              </div>
              <span className="text-xs bg-[#4ade80]/10 text-[#4ade80] px-3 py-1 rounded-full border border-[#4ade80]/20">Active</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Blog-as-a-Service</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-6 flex-1">
              Auto-generate SEO-optimized blogs for your company. Review, approve and publish — all in one place.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="w-1 h-1 rounded-full bg-[#4ade80]" />
                AI-powered blog generation
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="w-1 h-1 rounded-full bg-[#4ade80]" />
                SEO keyword targeting
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="w-1 h-1 rounded-full bg-[#4ade80]" />
                Approve before publishing
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/client')}
              className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold rounded-xl py-3 text-sm transition-colors"
            >
              Go to Blog Portal
            </button>
          </div>

          {/* Uptime Monitoring */}
          <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl p-8 flex flex-col hover:border-blue-400/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-400/10 flex items-center justify-center text-3xl group-hover:bg-blue-400/20 transition-colors">
                📡
              </div>
              <span className="text-xs bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full border border-blue-400/20">Active</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Uptime Monitoring</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-6 flex-1">
              Monitor your services 24/7, track incidents and get instantly alerted when something goes down.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                Real-time uptime checks
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                Incident tracking
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                Instant alerts
              </div>
            </div>
            <button
              onClick={() => window.open('https://inframindhq.online/dashboard', '_blank')}
              className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold rounded-xl py-3 text-sm transition-colors"
            >
              Go to Monitoring
            </button>
          </div>

        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/settings')}
            className="bg-[#26292f] border border-white/[0.06] hover:border-white/20 rounded-xl px-5 py-4 text-left transition-colors"
          >
            <p className="text-white text-sm font-medium">⚙️ Settings</p>
            <p className="text-white/30 text-xs mt-1">Account & preferences</p>
          </button>
          <button
            onClick={() => router.push('/upgrade')}
            className="bg-[#26292f] border border-white/[0.06] hover:border-white/20 rounded-xl px-5 py-4 text-left transition-colors"
          >
            <p className="text-white text-sm font-medium">⚡ Upgrade</p>
            <p className="text-white/30 text-xs mt-1">View plans & billing</p>
          </button>
          <button
            onClick={() => router.push('/my-apps')}
            className="bg-[#26292f] border border-white/[0.06] hover:border-white/20 rounded-xl px-5 py-4 text-left transition-colors"
          >
            <p className="text-white text-sm font-medium">🔌 My Apps</p>
            <p className="text-white/30 text-xs mt-1">Connected integrations</p>
          </button>
        </div>

      </div>
    </div>
  );
}
