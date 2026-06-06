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

  const onlineCount = monitors.filter(m => m.status !== 'offline').length;
  const offlineCount = monitors.filter(m => m.status === 'offline').length;

  return (
    <div
      className="min-h-screen flex font-sans"
      style={{ background: '#07090d', color: '#eef1f6' }}
      onClick={() => setOpenDropdown(null)}
    >
      {/* Sidebar */}
      <aside style={{ width: 208, background: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.05)' }} className="p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>InfraMind</span>
        </div>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, fontSize: 13, color: '#eef1f6', background: 'rgba(255,255,255,0.06)', fontWeight: 500, textDecoration: 'none' }}>
            Monitors
          </Link>
          <Link href="/incidents" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, fontSize: 13, color: '#8a95a3', textDecoration: 'none' }}>
            Incidents
          </Link>
          <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, fontSize: 13, color: '#8a95a3', textDecoration: 'none' }}>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-7">
          <h1 style={{ fontSize: 16, fontWeight: 600, color: '#eef1f6' }}>Live Monitors</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            + Add Monitor
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 10, color: '#8a95a3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Operational</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: '#22c55e' }}>{onlineCount}</div>
          </div>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 10, color: '#8a95a3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Offline</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: '#ef4444' }}>{offlineCount}</div>
          </div>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 10, color: '#8a95a3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Total</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: '#eef1f6' }}>{monitors.length}</div>
          </div>
        </div>

        {/* Monitor List */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          {monitors.map((m, idx) => {
            const isOffline = m.status === 'offline';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: idx < monitors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                {/* Left: Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: isOffline ? '#ef4444' : '#22c55e', boxShadow: isOffline ? '0 0 0 3px rgba(239,68,68,0.18)' : '0 0 0 3px rgba(34,197,94,0.18)' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#eef1f6' }}>{m.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#8a95a3', marginLeft: 17 }}>{m.target_url}</span>
                  {m.type === 'ssl' && m.ssl_days_remaining !== null && (
                    <span style={{ fontSize: 10, color: m.ssl_days_remaining < 30 ? '#f87171' : '#8a95a3', marginLeft: 17, marginTop: 2, fontWeight: 500 }}>
                      {m.ssl_days_remaining} days remaining • Exp: {new Date(m.ssl_expiry_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {/* Status and Copy Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700, border: `1px solid ${isOffline ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`, background: isOffline ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: isOffline ? '#f87171' : '#4ade80' }}>
                      {isOffline ? '✕ Offline' : '✓ Online'}
                    </span>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/status/${m.id}`); alert('Link copied!'); }} style={{ fontSize: 10, color: '#8a95a3', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Copy Link</button>
                  </div>

                  <Link href={`/status/${m.id}`} style={{ fontSize: 11, color: '#8a95a3', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>View Status ↗</Link>

                  <div style={{ position: 'relative' }}>
                    <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === m.id ? null : m.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a95a3', fontSize: 18 }}>···</button>
                    {openDropdown === m.id && (
                      <div style={{ position: 'absolute', right: 0, top: '110%', width: 140, background: '#1a2330', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, zIndex: 50, padding: '6px 0' }}>
                        <button onClick={() => { setSelectedMonitor(m); setIsEditModalOpen(true); setOpenDropdown(null); }} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 12, color: '#eef1f6', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                        <button onClick={async () => { await supabase.from('monitors').delete().eq('id', m.id); fetchMonitors(); setOpenDropdown(null); }} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 12, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                      </div>
                    )}
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