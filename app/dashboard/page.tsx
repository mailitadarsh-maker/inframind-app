'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AddMonitorModal from '../components/AddMonitorModal';
import EditMonitorModal from '../components/EditMonitorModal';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchMonitors = async () => {
    const { data } = await supabase.from('monitors').select('*').order('created_at', { ascending: false });
    if (data) setMonitors(data);
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-[#07090d] text-[#eef1f6]" onClick={() => setOpenDropdown(null)}>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 bg-[#0d1117] border-r border-white/[0.05] p-5 flex-col">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="font-semibold text-sm">InfraMind</span>
        </div>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm bg-white/[0.06] font-medium">Monitors</Link>
          <Link href="/incidents" className="px-3 py-2 rounded-lg text-sm text-[#8a95a3]">Incidents</Link>
          <Link href="/settings" className="px-3 py-2 rounded-lg text-sm text-[#8a95a3]">Settings</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        
        {/* Mobile Top Navigation */}
        <nav className="md:hidden flex gap-6 mb-8 border-b border-white/[0.05] pb-4">
          <Link href="/dashboard" className="text-sm font-semibold text-white border-b border-white">Monitors</Link>
          <Link href="/incidents" className="text-sm text-[#8a95a3]">Incidents</Link>
          <Link href="/settings" className="text-sm text-[#8a95a3]">Settings</Link>
        </nav>

        <div className="flex justify-between items-center mb-7">
          <h1 className="text-base font-semibold">Live Monitors</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#22c55e] text-white rounded-lg px-4 py-2 text-xs font-medium">
            + Add Monitor
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 w-full">
          {[
            { icon: '🛡️', val: '99.9%', label: 'Avg Uptime' },
            { icon: '⚡', val: '3 min', label: 'To Connect' },
            { icon: '✦', val: 'AI Reports', label: 'Plain English' }
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-[#0d1117] border border-white/[0.06] rounded-xl w-full">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.03] text-lg">{stat.icon}</div>
              <div className="flex flex-col">
                <span className="text-xl font-medium text-[#1ddb78]">{stat.val}</span>
                <span className="text-[10px] text-[#8a95a3] uppercase tracking-wider">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Monitor List */}
        <div className="bg-[#0d1117] border border-white/[0.06] rounded-xl overflow-hidden">
          {monitors.map((m) => {
            const isOffline = m.status === 'offline';
            return (
              <div key={m.id} className="flex flex-col p-4 border-b border-white/[0.04] gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isOffline ? '#ef4444' : '#22c55e' }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs text-[#8a95a3] truncate">{m.target_url}</div>
                    {m.type === 'ssl' && m.ssl_expiry_date && (
                      <div className={`text-[10px] mt-1 ${m.ssl_days_remaining < 30 ? 'text-red-400' : 'text-[#8a95a3]'}`}>
                        {m.ssl_days_remaining} days left • Exp: {new Date(m.ssl_expiry_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.04]">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${isOffline ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                    {isOffline ? 'OFFLINE' : 'ONLINE'}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/status/${m.id}`); alert('Copied!'); }} className="text-[9px] text-[#8a95a3] underline">Copy</button>
                    <Link href={`/status/${m.id}`} className="text-[11px] border border-white/10 rounded-lg px-3 py-1.5">View ↗</Link>
                    <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === m.id ? null : m.id); }} className="text-[#8a95a3]">···</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AddMonitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMonitors} />
      <EditMonitorModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchMonitors} monitor={selectedMonitor} />
    </div>
  );
}