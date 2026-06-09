'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AddMonitorModal from '../components/AddMonitorModal';
import EditMonitorModal from '../components/EditMonitorModal';
import AIDiagnosisBox from '../components/AIDiagnosisBox';
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
  text-decoration: none; cursor: pointer; border: none; background: none;
  width: 100%; text-align: left;
  transition: background 0.12s, color 0.12s;
}
.im-sb-link:hover { background: rgba(255,255,255,0.04); color: #c4c9d8; }
.im-sb-link.on { background: rgba(52,211,153,0.08) !important; color: #34d399 !important; }
.im-sb-link svg { width: 15px; height: 15px; flex-shrink: 0; opacity: 0.7; }
.im-sb-link.on svg { opacity: 1; }
.im-sb-link.danger { color: #f87171; }
.im-sb-link.danger:hover { background: rgba(248,113,113,0.08); }
.im-sb-footer { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; margin-top: 12px; }

/* ── Main ────────────────────────────────────────────────────── */
.im-main { flex: 1; margin-left: 216px; padding: 32px 40px 64px; max-width: 100%; }

/* ── Topbar ──────────────────────────────────────────────────── */
.im-topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; }
.im-topbar-title { font-size: 20px; font-weight: 600; color: #e2e6f0; letter-spacing: -0.02em; margin-bottom: 3px; }
.im-topbar-sub { font-size: 12px; color: #3f4459; font-family: 'IBM Plex Mono', monospace; }

.im-add-btn {
  display: inline-flex !important; align-items: center; gap: 7px;
  background: #34d399 !important; color: #09090f !important; border: none !important;
  border-radius: 9px; padding: 9px 16px;
  font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
  cursor: pointer; letter-spacing: -0.01em; white-space: nowrap; flex-shrink: 0;
  transition: background 0.15s, box-shadow 0.15s;
}
.im-add-btn:hover { background: #4aeaaa !important; box-shadow: 0 4px 16px rgba(52,211,153,0.28); }
.im-add-btn svg { width: 14px; height: 14px; }

/* ── Alert ───────────────────────────────────────────────────── */
.im-alert {
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.14);
  border-left: 3px solid #f59e0b;
  border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;
}
.im-alert-body strong { display: block; font-size: 12px; font-weight: 600; color: #fbbf24; margin-bottom: 2px; letter-spacing: 0.02em; }
.im-alert-body span { font-size: 12px; color: #6b7280; line-height: 1.5; }

/* ── Stats ───────────────────────────────────────────────────── */
.im-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
.im-stat {
  background: #0d0f16; border: 1px solid rgba(255,255,255,0.055);
  border-radius: 12px; padding: 16px 18px; transition: border-color 0.2s;
}
.im-stat:hover { border-color: rgba(255,255,255,0.1); }
.im-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #3a3f52; margin-bottom: 8px; }
.im-stat-val { font-size: 28px; font-weight: 600; letter-spacing: -0.03em; line-height: 1; margin-bottom: 4px; }
.im-stat-hint { font-size: 11px; color: #3a3f52; font-family: 'IBM Plex Mono', monospace; }
.im-stat-val.c-green { color: #34d399; }
.im-stat-val.c-red { color: #f87171; }
.im-stat-val.c-white { color: #e2e6f0; }
.im-stat-val.c-amber { color: #fbbf24; }
.im-stat-bar { height: 3px; background: rgba(255,255,255,0.06); border-radius: 999px; margin-top: 10px; overflow: hidden; }
.im-stat-bar-fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(.4,0,.2,1); }
.im-stat-bar-fill.c-green { background: #34d399; }
.im-stat-bar-fill.c-amber { background: #fbbf24; }
.im-stat-bar-fill.c-red { background: #f87171; }

/* ── Monitor list ────────────────────────────────────────────── */
.im-list-header { display: flex; align-items: center; padding: 0 4px; margin-bottom: 10px; }
.im-list-header span { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #3a3f52; }
.im-list { display: flex; flex-direction: column; gap: 8px; }

/* ── Monitor Card ────────────────────────────────────────────── */
.im-card {
  background: #0d0f16;
  border: 1px solid rgba(255,255,255,0.055);
  border-left: 3px solid transparent;
  border-radius: 12px; overflow: hidden;
  transition: border-color 0.18s, transform 0.15s, box-shadow 0.15s;
}
.im-card:hover { border-color: rgba(255,255,255,0.1); border-left-color: inherit; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
.im-card.is-online { border-left-color: #34d399; }
.im-card.is-offline { border-left-color: #f87171 !important; background: linear-gradient(100deg, #0d0f16 0%, rgba(248,113,113,0.025) 100%); border-color: rgba(248,113,113,0.15); }
.im-card.is-offline:hover { border-color: rgba(248,113,113,0.28); }

.im-card-main { padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px; }

/* pulse dot */
.im-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; position: relative; }
.im-dot.online { background: #34d399; color: #34d399; }
.im-dot.offline { background: #f87171; color: #f87171; }
.im-dot.online::after, .im-dot.offline::after {
  content: ''; position: absolute; inset: -3px; border-radius: 50%;
  border: 1.5px solid currentColor; opacity: 0; animation: ripple 2s ease-out infinite;
}
.im-dot.offline::after { animation-duration: 1.4s; }
@keyframes ripple {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 0; transform: scale(2.5); }
}

.im-card-info { flex: 1; min-width: 0; overflow: hidden; }
.im-spark-wrap { flex-shrink: 0; }
.im-card-row1 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 3px; }
.im-card-name { font-size: 14px; font-weight: 600; color: #e2e6f0; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
.im-card-url { font-size: 11px; color: #3f4459; font-family: 'IBM Plex Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.im-badge {
  display: inline-flex; align-items: center;
  padding: 2px 7px; border-radius: 5px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  font-family: 'IBM Plex Mono', monospace; flex-shrink: 0;
}
.im-badge.website { background: rgba(52,211,153,0.08); color: #5dd8a8; border: 1px solid rgba(52,211,153,0.15); }
.im-badge.api     { background: rgba(167,139,250,0.08); color: #b59ffd; border: 1px solid rgba(167,139,250,0.15); }
.im-badge.ssl     { background: rgba(251,191,36,0.08);  color: #fcd34d; border: 1px solid rgba(251,191,36,0.15); }

.im-ssl-info { display: flex; align-items: center; gap: 5px; font-size: 10px; margin-top: 5px; font-family: 'IBM Plex Mono', monospace; }
.im-ssl-info.ok { color: #3a3f52; }
.im-ssl-info.warn { color: #fca5a5; }

/* card footer */
.im-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; border-top: 1px solid rgba(255,255,255,0.04); }

.im-status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.im-status-pill.online  { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); color: #34d399; }
.im-status-pill.offline { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.22); color: #f87171; }
.im-status-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

.im-actions { display: flex; align-items: center; gap: 5px; }

.im-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 7px;
  font-size: 11px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  cursor: pointer; text-decoration: none; white-space: nowrap;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  color: #6b7280;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.im-btn:hover { background: rgba(255,255,255,0.07); color: #c4c9d8; border-color: rgba(255,255,255,0.12); }
.im-btn.copied { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2); color: #34d399; }
.im-btn svg { width: 11px; height: 11px; flex-shrink: 0; }

.im-icon-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 7px; cursor: pointer; color: #6b7280; font-size: 13px; letter-spacing: 1px; transition: background 0.12s, color 0.12s; }
.im-icon-btn:hover { background: rgba(255,255,255,0.07); color: #c4c9d8; }

.im-drop-wrap { position: relative; }
.im-drop { position: absolute; right: 0; bottom: calc(100% + 6px); width: 156px; background: #12141e; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; z-index: 60; padding: 5px; box-shadow: 0 16px 40px rgba(0,0,0,0.6); }
.im-drop-item { width: 100%; text-align: left; padding: 8px 10px; font-size: 12px; font-weight: 500; font-family: 'DM Sans', sans-serif; border-radius: 6px; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: background 0.1s; }
.im-drop-item.edit { color: #c4c9d8; }
.im-drop-item.edit:hover { background: rgba(255,255,255,0.06); }
.im-drop-item.del { color: #f87171; }
.im-drop-item.del:hover { background: rgba(248,113,113,0.08); }
.im-drop-item svg { width: 12px; height: 12px; opacity: 0.7; }

.im-empty { padding: 72px 24px; text-align: center; }
.im-empty-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
.im-empty-icon svg { width: 24px; height: 24px; opacity: 0.25; }
.im-empty h3 { font-size: 14px; font-weight: 600; color: #c4c9d8; margin-bottom: 6px; }
.im-empty p { font-size: 12px; color: #3a3f52; margin-bottom: 22px; }

/* ── Mobile nav ──────────────────────────────────────────────── */
.im-mob-nav {
  display: none;
  background: #0d0f16;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 0 12px;
  align-items: center;
  gap: 2px;
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  height: 50px;
}
.im-mob-logo { display: flex; align-items: center; gap: 8px; margin-right: auto; flex-shrink: 0; }
.im-mob-logo-mark { width: 26px; height: 26px; border-radius: 7px; background: #34d399 !important; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.im-mob-logo-mark svg { width: 13px; height: 13px; }
.im-mob-logo span { font-size: 13px; font-weight: 600; color: #e2e6f0; }
.im-mob-link { padding: 6px 8px; border-radius: 7px; font-size: 12px; font-weight: 500; color: #6b7280; text-decoration: none; font-family: 'DM Sans', sans-serif; white-space: nowrap; flex-shrink: 0; }
.im-mob-link.on { color: #34d399 !important; background: rgba(52,211,153,0.08); }
.im-mob-logout { font-size: 12px; color: #f87171; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 6px 8px; flex-shrink: 0; margin-left: 2px; }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .im { flex-direction: column; }
  .im-sb { display: none !important; }
  .im-mob-nav { display: flex; }

  .im-main {
    margin-left: 0 !important;
    margin-top: 50px;
    padding: 20px 14px 60px;
    max-width: 100%;
    width: 100%;
  }

  .im-topbar { margin-bottom: 16px; align-items: center; }
  .im-topbar-title { font-size: 17px; }
  .im-topbar-sub { display: none; }
  .im-add-btn { padding: 8px 13px; font-size: 12px; }

  .im-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
  .im-stat { padding: 12px 14px; }
  .im-stat-val { font-size: 24px; }

  .im-alert { padding: 10px 12px; margin-bottom: 16px; }

  /* card main: wrap so sparkline drops to its own row */
  .im-card-main { padding: 12px 12px 6px; gap: 8px; flex-wrap: wrap; }
  .im-card-info { width: calc(100% - 20px); flex: unset; }
  .im-card-name { font-size: 13px; max-width: 100%; }
  .im-card-url { font-size: 10px; }
  .im-card-row1 { gap: 6px; flex-wrap: nowrap; }

  /* sparkline: always visible, full-width row at bottom of card-main */
  .im-spark-wrap {
    display: flex !important;
    width: 100%;
    justify-content: flex-end;
    padding-bottom: 4px;
  }

  /* footer stays on one row */
  .im-card-footer { padding: 8px 12px; flex-wrap: nowrap; gap: 4px; overflow: hidden; }
  .im-actions { gap: 3px; flex-shrink: 0; }

  .im-btn { padding: 5px 8px; font-size: 10px; gap: 4px; }
  .im-btn svg { width: 10px; height: 10px; }
  .im-icon-btn { width: 26px; height: 26px; font-size: 12px; }
  .im-status-pill { padding: 3px 8px; font-size: 9px; }
}

@media (max-width: 400px) {
  .im-main { padding: 18px 10px 60px; }
  .im-spark-wrap { display: flex !important; }
  .im-btn { padding: 5px 7px; font-size: 10px; }
  .im-mob-link { font-size: 11px; padding: 5px 6px; }
}
`;

// Live animating sparkline
function Spark({ isOffline }: { isOffline: boolean }) {
  const COUNT = 8;
  const MIN = 4; const MAX = 16;
  const rand = () => MIN + Math.random() * (MAX - MIN);
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: COUNT }, (_, i) => (isOffline && i === COUNT - 1 ? MIN + 2 : rand()))
  );

  useEffect(() => {
    if (isOffline) {
      const id = setInterval(() => {
        setHeights(prev => {
          const next = [...prev];
          next[COUNT - 1] = 3 + Math.random() * 4;
          return next;
        });
      }, 1200);
      return () => clearInterval(id);
    }
    const id = setInterval(() => {
      setHeights(prev => prev.map(h => Math.random() > 0.45 ? rand() : h));
    }, 550 + Math.random() * 200);
    return () => clearInterval(id);
  }, [isOffline]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, height: 18, flexShrink: 0, marginTop: 2 }}>
      {heights.map((h, i) => {
        const isLastAndOffline = isOffline && i === COUNT - 1;
        const dimmed = isOffline && i !== COUNT - 1;
        return (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 2,
            background: isLastAndOffline
              ? 'rgba(248,113,113,0.55)'
              : dimmed
                ? 'rgba(52,211,153,0.12)'
                : `rgba(52,211,153,${0.28 + (h / MAX) * 0.72})`,
            transition: 'height 0.38s cubic-bezier(0.4,0,0.2,1)',
          }} />
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState('');

  const fetchMonitors = async () => {
    const { data: monitorData, error: monitorError } = await supabase
      .from('monitors').select('*').order('created_at', { ascending: false });
    if (monitorError) { console.error(monitorError); return; }
    if (monitorData) setMonitors(monitorData);

    const { data: incidentData, error: incidentError } = await supabase
      .from('incidents')
      .select('monitor_id, ai_cause, ai_action, ai_severity, resolved_at, failed_ip, raw_error, started_at')
      .is('resolved_at', null);
    if (!incidentError && incidentData) setIncidents(incidentData);
  };

  useEffect(() => {
    fetchMonitors();
    const fetchInterval = setInterval(fetchMonitors, 30000);
    const clockInterval = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    setTimeStr(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    return () => { clearInterval(fetchInterval); clearInterval(clockInterval); };
  }, []);

  const handleEdit = (m: any) => { setSelectedMonitor(m); setOpenDropdown(null); setTimeout(() => setIsEditModalOpen(true), 50); };
  const handleDelete = async (id: string) => { setOpenDropdown(null); await supabase.from('monitors').delete().eq('id', id); fetchMonitors(); };
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/login'; };
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/status/${id}`);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const onlineCount = monitors.filter(m => m.status !== 'offline').length;
  const offlineCount = monitors.filter(m => m.status === 'offline').length;
  const uptimePct = monitors.length > 0 ? Math.round((onlineCount / monitors.length) * 100) : 100;
  const barCol = uptimePct === 100 ? 'c-green' : uptimePct >= 80 ? 'c-amber' : 'c-red';

  const NAV = [
    { href: '/dashboard', label: 'Monitors', active: true,
      icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> },
    { href: '/incidents', label: 'Incidents', active: false,
      icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M8 2L14 13H2L8 2Z"/><line x1="8" y1="7" x2="8" y2="10"/><circle cx="8" cy="12" r=".6" fill="currentColor"/></svg> },
    { href: '/settings', label: 'Settings', active: false,
      icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="15" height="15"><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.6 3.6l.7.7M11.7 11.7l.7.7M12.4 3.6l-.7.7M4.3 11.7l-.7.7"/></svg> },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="im" onClick={() => setOpenDropdown(null)}>

        {/* Sidebar */}
        <aside className="im-sb">
          <div className="im-sb-logo">
            <div className="im-sb-logo-mark">
              <svg viewBox="0 0 15 15" fill="#09090f" width="15" height="15"><path d="M7.5 1l2 4.5H14l-3.5 3 1.5 4.5L7.5 11 3.5 13 5 8.5 1.5 5.5H5.5L7.5 1Z"/></svg>
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
            <button onClick={handleLogout} className="im-sb-link danger">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="15" height="15"><path d="M10 8H2M7 5l-3 3 3 3"/><path d="M6 3H13V13H6"/></svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile nav — FIX: z-index 200 so no avatar overlaps */}
        <nav className="im-mob-nav">
          <div className="im-mob-logo">
            <div className="im-mob-logo-mark">
              <svg viewBox="0 0 15 15" fill="#09090f" width="13" height="13"><path d="M7.5 1l2 4.5H14l-3.5 3 1.5 4.5L7.5 11 3.5 13 5 8.5 1.5 5.5H5.5L7.5 1Z"/></svg>
            </div>
            <span>InfraMind</span>
          </div>
          <Link href="/dashboard" className="im-mob-link on">Monitors</Link>
          <Link href="/incidents" className="im-mob-link">Incidents</Link>
          <Link href="/settings" className="im-mob-link">Settings</Link>
          <button onClick={handleLogout} className="im-mob-logout">↩</button>
        </nav>

        {/* Main */}
        <main className="im-main">

          {/* Topbar */}
          <div className="im-topbar">
            <div>
              <div className="im-topbar-title">Live Monitors</div>
              <div className="im-topbar-sub">↻ refreshes every 30s · {timeStr}</div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="im-add-btn">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="14" height="14"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
              Add Monitor
            </button>
          </div>

          {/* Alert */}
          {monitors.length > 0 && (
            <div className="im-alert">
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠</span>
              <div className="im-alert-body">
                <strong>Test Mode Active</strong>
                <span>Monitoring is running, but email alerts are off. Go to Settings to enable outage notifications.</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="im-stats">
            <div className="im-stat">
              <div className="im-stat-label">Operational</div>
              <div className="im-stat-val c-green">{onlineCount}</div>
              <div className="im-stat-hint">services up</div>
            </div>
            <div className="im-stat">
              <div className="im-stat-label">Offline</div>
              <div className="im-stat-val c-red">{offlineCount}</div>
              <div className="im-stat-hint">need attention</div>
            </div>
            <div className="im-stat">
              <div className="im-stat-label">Total</div>
              <div className="im-stat-val c-white">{monitors.length}</div>
              <div className="im-stat-hint">monitored</div>
            </div>
            <div className="im-stat">
              <div className="im-stat-label">Uptime</div>
              <div className={`im-stat-val ${barCol}`}>{uptimePct}%</div>
              <div className="im-stat-bar">
                <div className={`im-stat-bar-fill ${barCol}`} style={{ width: `${uptimePct}%` }} />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="im-list-header">
            <span>{monitors.length} monitor{monitors.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="im-list">
            {monitors.length === 0 && (
              <div className="im-empty" style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 12 }}>
                <div className="im-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M12 8v8M8 12h8" strokeLinecap="round"/></svg>
                </div>
                <h3>No monitors yet</h3>
                <p>Add your first monitor to start tracking uptime.</p>
                <button onClick={() => setIsModalOpen(true)} className="im-add-btn" style={{ margin: '0 auto' }}>
                  + Add Monitor
                </button>
              </div>
            )}

            {monitors.map((m) => {
              const isOffline = m.status === 'offline';
              const isSSL = m.type === 'ssl';
              const sslWarn = isSSL && m.ssl_days_remaining != null && m.ssl_days_remaining < 30;
              const activeIncident = isOffline ? incidents.find(i => i.monitor_id === m.id) : null;
              const mtype = (m.type || 'website').toLowerCase();

              return (
                <div key={m.id} className={`im-card ${isOffline ? 'is-offline' : 'is-online'}`}>
                  <div className="im-card-main">
                    <div className={`im-dot ${isOffline ? 'offline' : 'online'}`} />
                    <div className="im-card-info">
                      <div className="im-card-row1">
                        <span className="im-card-name">{m.name}</span>
                        <span className={`im-badge ${mtype}`}>{mtype.toUpperCase()}</span>
                      </div>
                      <div className="im-card-url">{m.target_url}</div>
                      {isSSL && m.ssl_expiry_date && (
                        <div className={`im-ssl-info ${sslWarn ? 'warn' : 'ok'}`}>
                          {sslWarn && <span>⚠</span>}
                          <span>SSL: {m.ssl_days_remaining}d left · expires {new Date(m.ssl_expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                      {activeIncident && (
                        <AIDiagnosisBox
                          ai_cause={activeIncident.ai_cause}
                          ai_action={activeIncident.ai_action}
                          ai_severity={activeIncident.ai_severity}
                          failed_ip={activeIncident.failed_ip}
                          raw_error={activeIncident.raw_error}
                          started_at={activeIncident.started_at}
                        />
                      )}
                    </div>
                    {/* FIX: sparkline always rendered; CSS controls visibility by breakpoint */}
                    <div className="im-spark-wrap"><Spark isOffline={isOffline} /></div>
                  </div>

                  <div className="im-card-footer">
                    <div className={`im-status-pill ${isOffline ? 'offline' : 'online'}`}>
                      <div className="im-status-pill-dot" />
                      {isOffline ? 'Offline' : 'Online'}
                    </div>
                    <div className="im-actions">
                      <button onClick={() => handleCopy(m.id)} className={`im-btn${copiedId === m.id ? ' copied' : ''}`}>
                        {copiedId === m.id
                          ? <><svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width="11" height="11"><path d="M1.5 5.5l3 3 5-5"/></svg><span className="im-btn-label">Copied</span></>
                          : <><svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="11" height="11"><rect x="3.5" y="3.5" width="6" height="6" rx="1.2"/><path d="M7.5 3.5V2.2A1.2 1.2 0 006.3 1H2.2A1.2 1.2 0 001 2.2v4.1a1.2 1.2 0 001.2 1.2H3.5"/></svg><span className="im-btn-label">Copy</span></>
                        }
                      </button>
                      <Link href={`/status/${m.id}`} className="im-btn">
                        <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="11" height="11"><path d="M4.5 2H2A1 1 0 001 3v6a1 1 0 001 1h6a1 1 0 001-1V6.5M6.5 1H10m0 0v3.5M10 1L5 6"/></svg>
                        <span className="im-btn-label">Status</span>
                      </Link>
                      <div className="im-drop-wrap">
                        <div className="im-icon-btn" onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === m.id ? null : m.id); }}>···</div>
                        {openDropdown === m.id && (
                          <div className="im-drop" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleEdit(m)} className="im-drop-item edit">
                              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="12" height="12"><path d="M8 2l2 2-6 6H2V8l6-6z"/></svg>
                              Edit monitor
                            </button>
                            <button onClick={() => handleDelete(m.id)} className="im-drop-item del">
                              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="12" height="12"><path d="M1.5 3.5h9M4 3.5V2.5h4v1M5 6v3M7 6v3M2.5 3.5l.5 7h6l.5-7"/></svg>
                              Delete
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
    </>
  );
}