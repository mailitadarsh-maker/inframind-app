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

  const handleEdit = (m: any) => {
    setSelectedMonitor(m);
    setOpenDropdown(null);
    setTimeout(() => setIsEditModalOpen(true), 50);
  };

  const handleDelete = async (id: string) => {
    setOpenDropdown(null);
    await supabase.from('monitors').delete().eq('id', id);
    fetchMonitors();
  };

  const onlineCount = monitors.filter(m => m.status !== 'offline').length;
  const offlineCount = monitors.filter(m => m.status === 'offline').length;

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row font-sans"
      style={{ background: '#07090d', color: '#eef1f6' }}
      onClick={() => setOpenDropdown(null)}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-52 p-5" style={{ background: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 mb-8">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>InfraMind</span>
        </div>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard" style={{ padding: '7px 12px', borderRadius: 8, fontSize: 13, color: '#eef1f6', background: 'rgba(255,255,255,0.06)', fontWeight: 500, textDecoration: 'none' }}>Monitors</Link>
          <Link href="/incidents" style={{ padding: '7px 12px', borderRadius: 8, fontSize: 13, color: '#8a95a3', textDecoration: 'none' }}>Incidents</Link>
          <Link href="/settings" style={{ padding: '7px 12px', borderRadius: 8, fontSize: 13, color: '#8a95a3', textDecoration: 'none' }}>Settings</Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">

        {/* Mobile Top Nav */}
        <nav className="md:hidden flex gap-6 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: '#eef1f6', textDecoration: 'none', borderBottom: '1px solid #eef1f6', paddingBottom: 2 }}>Monitors</Link>
          <Link href="/incidents" style={{ fontSize: 13, color: '#8a95a3', textDecoration: 'none' }}>Incidents</Link>
          <Link href="/settings" style={{ fontSize: 13, color: '#8a95a3', textDecoration: 'none' }}>Settings</Link>
        </nav>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Live Monitors</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            + Add Monitor
          </button>
        </div>

        {/* Test Mode Banner */}
        {monitors.length > 0 && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              ⚠️ Test Mode Active
            </div>
            <div style={{ color: '#d1d5db' }}>
              Monitoring is active, but email incident alerts are disabled.
              Configure email settings to receive outage notifications.
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Operational', value: onlineCount, color: '#22c55e' },
            { label: 'Offline', value: offlineCount, color: '#ef4444' },
            { label: 'Total', value: monitors.length, color: '#eef1f6' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: '#8a95a3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 500, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Monitor List */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          {monitors.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#8a95a3' }}>
              No monitors yet. Click "+ Add Monitor" to get started.
            </div>
          )}

          {monitors.map((m, idx) => {
            const isOffline = m.status === 'offline';
            const isSSL = m.type === 'ssl';
            const sslWarn = isSSL && m.ssl_days_remaining != null && m.ssl_days_remaining < 30;

            return (
              <div
                key={m.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: idx < monitors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                  <span style={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                    background: isOffline ? '#ef4444' : '#22c55e',
                    boxShadow: isOffline ? '0 0 0 3px rgba(239,68,68,0.18)' : '0 0 0 3px rgba(34,197,94,0.18)',
                    display: 'inline-block',
                  }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#eef1f6' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#8a95a3', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.target_url}
                    </div>
                    {isSSL && m.ssl_expiry_date && (
                      <div style={{
                        fontSize: 10,
                        marginTop: 4,
                        color: sslWarn ? '#f87171' : '#8a95a3',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        {sslWarn && <span>⚠️</span>}
                        <span>{m.ssl_days_remaining} days left</span>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span>Exp: {new Date(m.ssl_expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 999,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                    border: `1px solid ${isOffline ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
                    background: isOffline ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                    color: isOffline ? '#f87171' : '#4ade80',
                  }}>
                    {isOffline ? '✕ Offline' : '✓ Online'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/status/${m.id}`); }}
                      style={{ fontSize: 10, color: '#8a95a3', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                    >
                      Copy
                    </button>

                    <Link
                      href={`/status/${m.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, color: '#8a95a3',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8, padding: '5px 12px',
                        textDecoration: 'none', whiteSpace: 'nowrap',
                      }}
                    >
                      View ↗
                    </Link>

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === m.id ? null : m.id);
                        }}
                        style={{
                          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#8a95a3', borderRadius: 6, fontSize: 16,
                        }}
                      >
                        ···
                      </button>

                      {openDropdown === m.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute', right: 0, bottom: '110%',
                            width: 140, background: '#1a2330',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10, zIndex: 50, padding: '6px 0',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          }}
                        >
                          <button
                            onClick={() => handleEdit(m)}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 12, color: '#eef1f6', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 12, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AddMonitorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMonitors} />
      <EditMonitorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => { setIsEditModalOpen(false); fetchMonitors(); }}
        monitor={selectedMonitor}
      />
    </div>
  );
}