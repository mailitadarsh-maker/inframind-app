'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AddMonitorModal from '../components/AddMonitorModal';
import EditMonitorModal from '../components/EditMonitorModal';
import { supabase } from '@/lib/supabase';

const navItems = [
  { label: 'Monitors', href: '/dashboard', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg> },
  { label: 'Incidents', href: '/incidents', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
  { label: 'Settings', href: '/settings', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
];

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const fetchMonitors = async () => {
    const { data } = await supabase.from('monitors').select('*').order('created_at', { ascending: false });
    if (data) {
      setMonitors(data.map(m => ({
        ...m,
        type: (m.type || 'WEB').toUpperCase(),
        icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>)
      })));
    }
  };

  useEffect(() => { fetchMonitors(); }, []);

  return (
    <div className="min-h-screen bg-[#07090d] flex font-sans text-[#eef1f6] overflow-hidden" onClick={() => setOpenDropdown(null)}>
      <aside className="hidden md:flex w-60 flex-col border-r border-white/[0.05] bg-[#0d1117]">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.05] font-semibold text-sm">InfraMind</div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8a95a3] hover:text-[#eef1f6] hover:bg-white/[0.04] transition-all">
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-8 h-16 border-b border-white/[0.05] bg-[#07090d]/80 backdrop-blur-xl">
          <div>
            <h1 className="font-serif text-xl">Live Monitors</h1>
            <p className="text-xs text-[#8a95a3]">Real-time status of your connected applications.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded-lg bg-[#1ddb78] text-[#07090d] text-sm font-semibold hover:bg-[#22f585] transition-all">Add Monitor</button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Overall Uptime', 'Active Monitors', 'Recent Incidents'].map((label, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#0d1117] border border-white/[0.06]">
                <div className="text-xs text-[#8a95a3] mb-1">{label}</div>
                <div className="font-serif text-2xl">{i === 0 ? '100%' : i === 1 ? monitors.length : '0'}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-[#0d1117] border border-white/[0.06] divide-y divide-white/[0.04]">
            {monitors.map((m) => (
              <div key={m.id} className="relative flex items-center gap-4 px-5 py-6 hover:bg-white/[0.02] transition-all">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.07] text-[#8a95a3]">{m.icon}</div>
                
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {m.name}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-[#8a95a3]">{m.target_url}</span>
                  </div>
                  
                  {m.type === 'SSL' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[11px] text-[#8a95a3]">
                      <div>Expires: <span className="text-[#eef1f6]">{m.ssl_expiry_date ? new Date(m.ssl_expiry_date).toLocaleDateString() : 'N/A'}</span></div>
                      <div>Remaining: <span className="text-[#eef1f6]">{m.ssl_days_remaining} Days</span></div>
                      <div>Health: <span className="text-[#1ddb78]">100% Health</span></div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#8a95a3]">{m.type}</div>
                  )}
                </div>

                <div className="text-xs px-2.5 py-1 rounded-full bg-[#1ddb78]/[0.08] border border-[#1ddb78]/[0.2] text-[#1ddb78]">Operational</div>
                
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === m.id ? null : m.id); }} className="p-2 text-[#8a95a3] hover:text-white">...</button>
                  {openDropdown === m.id && (
                    <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[#1a2330] border border-white/10 shadow-2xl z-50 py-1.5 overflow-hidden">
                      <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); setSelectedMonitor(m); setIsEditModalOpen(true); }} className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 transition-colors">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); navigator.clipboard.writeText(`${window.location.origin}/status/${m.id}`); alert('Public link copied!'); }} className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 transition-colors">Copy Public Link</button>
                      <button onClick={async () => { await supabase.from('monitors').delete().eq('id', m.id); fetchMonitors(); }} className="w-full text-left px-4 py-2 text-xs text-[#ff5c5c] hover:bg-[#ff5c5c]/10 transition-colors">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AddMonitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMonitors} />
      <EditMonitorModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedMonitor(null); }} onSuccess={() => { setIsEditModalOpen(false); fetchMonitors(); }} monitor={selectedMonitor} />
    </div>
  );
}