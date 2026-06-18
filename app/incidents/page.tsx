'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const sevStyle: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: '#f87171', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)' },
  high:     { text: '#fb923c', bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.2)' },
  medium:   { text: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)' },
  low:      { text: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)' },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.im { font-family: 'DM Sans', system-ui, sans-serif; background: #09090f; color: #e2e6f0; min-height: 100vh; display: flex; }
.im-sb { width: 216px; min-height: 100vh; background: #0d0f16; border-right: 1px solid rgba(255,255,255,0.055); display: flex; flex-direction: column; padding: 24px 12px; position: fixed; top: 0; left: 0; bottom: 0; z-index: 40; }
.im-sb-logo { display: flex; align-items: center; gap: 10px; padding: 4px 8px; margin-bottom: 28px; }
.im-sb-logo-mark { width: 28px; height: 28px; border-radius: 8px; background: #34d399; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.im-sb-logo-name { font-size: 14px; font-weight: 600; color: #e2e6f0; letter-spacing: -0.01em; }
.im-sb-section { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #3a3f52; padding: 0 10px; margin-bottom: 6px; }
.im-sb-nav { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.im-sb-link { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; font-size: 13px; font-weight: 500; color: #6b7280; text-decoration: none; cursor: pointer; border: none; background: none; width: 100%; text-align: left; transition: background 0.12s, color 0.12s; }
.im-sb-link:hover { background: rgba(255,255,255,0.04); color: #c4c9d8; }
.im-sb-link.on { background: rgba(52,211,153,0.08) !important; color: #34d399 !important; }
.im-sb-link svg { width: 15px; height: 15px; flex-shrink: 0; opacity: 0.7; }
.im-sb-link.on svg { opacity: 1; }
.im-sb-link.danger { color: #f87171; }
.im-sb-link.danger:hover { background: rgba(248,113,113,0.08); }
.im-sb-footer { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; margin-top: 12px; }
.im-sb-back { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; color: #6b7280; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); text-decoration: none; margin-bottom: 16px; transition: background 0.12s, color 0.12s; }
.im-sb-back:hover { background: rgba(255,255,255,0.04); color: #6b7280; }
.im-main { flex: 1; margin-left: 216px; padding: 32px 32px 64px; }
`;

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [monitors, setMonitors] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: monData } = await supabase.from('monitors').select('id, name');
      if (monData) {
        const map: Record<string, string> = {};
        monData.forEach((m: any) => { map[m.id] = m.name; });
        setMonitors(map);
      }
      const { data, error } = await supabase
        .from('incidents')
        .select('id, monitor_id, started_at, resolved_at, duration_seconds, ai_cause, ai_action, ai_severity')
        .order('started_at', { ascending: false });
      if (error) console.error('incidents fetch error:', error);
      if (data) setIncidents(data);
    };
    fetchData();
  }, []);

  const activeIncidents = incidents.filter(inc => !inc.resolved_at);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="im">
        {/* Sidebar */}
        <aside className="im-sb">
          <div className="im-sb-logo">
            <div className="im-sb-logo-mark">
              <svg viewBox="0 0 15 15" fill="#09090f" width="15" height="15"><path d="M7.5 1l2 4.5H14l-3.5 3 1.5 4.5L7.5 11 3.5 13 5 8.5 1.5 5.5H5.5L7.5 1Z" /></svg>
            </div>
            <span className="im-sb-logo-name">InfraMind</span>
          </div>

          <Link href="/monitors" className="im-sb-back">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="13" height="13"><path d="M10 8H3M6 5l-3 3 3 3" /></svg>
            Monitors
          </Link>

          <div className="im-sb-section" style={{ marginBottom: 8 }}>Navigation</div>
          <nav className="im-sb-nav">
            <Link href="/monitors" className="im-sb-link">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><rect x="1" y="1" width="6" height="6" rx="1.5" /><rect x="9" y="1" width="6" height="6" rx="1.5" /><rect x="1" y="9" width="6" height="6" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx="1.5" /></svg>
              Monitors
            </Link>
            <Link href="/incidents" className="im-sb-link on">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M8 2L14 13H2L8 2Z" /><line x1="8" y1="7" x2="8" y2="10" /><circle cx="8" cy="12" r=".6" fill="currentColor" /></svg>
              Incidents
            </Link>
            <Link href="/settings" className="im-sb-link">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="15" height="15"><circle cx="8" cy="8" r="2.5" /><path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.6 3.6l.7.7M11.7 11.7l.7.7M12.4 3.6l-.7.7M4.3 11.7l-.7.7" /></svg>
              Settings
            </Link>
          </nav>
          <div className="im-sb-footer">
            <button onClick={handleLogout} className="im-sb-link danger" style={{ width: '100%' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="15" height="15"><path d="M10 8H2M7 5l-3 3 3 3" /><path d="M6 3H13V13H6" /></svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="im-main">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#e2e6f0', letterSpacing: '-0.02em', marginBottom: 4 }}>Incident History</h1>
            <p style={{ fontSize: 12, color: '#3f4459', fontFamily: 'monospace' }}>Status, resolution timeline, and AI diagnosis of all recorded incidents.</p>
          </div>

          {activeIncidents.length > 0 && (
            <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0, boxShadow: '0 0 0 3px rgba(239,68,68,0.2)' }} />
              <span>
                <span style={{ fontWeight: 600, color: '#f87171' }}>Active Issues: </span>
                <span style={{ color: '#eef1f6' }}>
                  {activeIncidents.map(inc => monitors[inc.monitor_id] || 'Unknown').join(', ')} {activeIncidents.length === 1 ? 'is' : 'are'} currently experiencing downtime.
                </span>
              </span>
            </div>
          )}

          {incidents.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#8a95a3', background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
              No incidents recorded yet.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {incidents.map((inc) => {
              const isOpen = !inc.resolved_at;
              const monitorName = monitors[inc.monitor_id] || 'Unknown';
              const hasAI = inc.ai_cause || inc.ai_action;
              const isExpanded = expandedId === inc.id;
              const sev = inc.ai_severity?.toLowerCase() ?? 'medium';
              const ss = sevStyle[sev] ?? sevStyle.medium;

              return (
                <div key={inc.id} style={{ background: '#0d1117', border: `1px solid ${isOpen ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: isOpen ? '#ef4444' : '#22c55e', boxShadow: isOpen ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(34,197,94,0.15)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#eef1f6', marginBottom: 4 }}>{monitorName}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 11, color: '#8a95a3' }}>
                        <span>▶ {formatDate(inc.started_at)}</span>
                        {inc.resolved_at && <span>✓ {formatDate(inc.resolved_at)}</span>}
                        {inc.duration_seconds && <span>⏱ {formatDuration(inc.duration_seconds)}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {hasAI && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.text, letterSpacing: '0.05em' }}>
                          🤖 AI
                        </span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.05em', border: `1px solid ${isOpen ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, background: isOpen ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: isOpen ? '#f87171' : '#4ade80' }}>
                        {isOpen ? '● Open' : '✓ Resolved'}
                      </span>
                      {hasAI && (
                        <button onClick={() => setExpandedId(isExpanded ? null : inc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a95a3', fontSize: 16, padding: '2px 4px', lineHeight: 1 }}>
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      )}
                    </div>
                  </div>
                  {hasAI && isExpanded && (
                    <div style={{ margin: '0 18px 14px', padding: '10px 12px', borderRadius: 8, background: ss.bg, border: `1px solid ${ss.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 11 }}>🤖</span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: ss.text }}>AI DIAGNOSIS</span>
                        {inc.ai_severity && (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: ss.border, color: ss.text, marginLeft: 'auto' }}>
                            {inc.ai_severity.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {inc.ai_cause && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: '#8a95a3', minWidth: 44, paddingTop: 1 }}>Cause</span>
                          <span style={{ fontSize: 12, color: '#eef1f6', lineHeight: 1.5 }}>{inc.ai_cause}</span>
                        </div>
                      )}
                      {inc.ai_action && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontSize: 10, color: '#8a95a3', minWidth: 44, paddingTop: 1 }}>Action</span>
                          <span style={{ fontSize: 12, color: '#eef1f6', lineHeight: 1.5 }}>{inc.ai_action}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
