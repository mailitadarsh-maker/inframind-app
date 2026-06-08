'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [monitors, setMonitors] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch monitors for name lookup
      const { data: monData } = await supabase.from('monitors').select('id, name');
      if (monData) {
        const map: Record<string, string> = {};
        monData.forEach((m: any) => { map[m.id] = m.name; });
        setMonitors(map);
      }

      // Fetch incidents with AI columns
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

  return (
    <div style={{ minHeight: '100vh', background: '#07090d', color: '#eef1f6', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Back */}
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8a95a3', textDecoration: 'none', marginBottom: 24, padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 6px 0' }}>Incident History</h1>
          <p style={{ fontSize: 13, color: '#8a95a3', margin: 0 }}>View the status, resolution timeline, and AI diagnosis of all recorded incidents.</p>
        </div>

        {/* Active Issues Banner */}
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

        {/* Incident Cards */}
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

                {/* Main Row */}
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>

                  {/* Status dot */}
                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: isOpen ? '#ef4444' : '#22c55e', boxShadow: isOpen ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(34,197,94,0.15)' }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#eef1f6', marginBottom: 4 }}>{monitorName}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 11, color: '#8a95a3' }}>
                      <span>▶ {formatDate(inc.started_at)}</span>
                      {inc.resolved_at && <span>✓ {formatDate(inc.resolved_at)}</span>}
                      {inc.duration_seconds && <span>⏱ {formatDuration(inc.duration_seconds)}</span>}
                    </div>
                  </div>

                  {/* Right side: badges + expand */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {/* AI badge */}
                    {hasAI && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.text, letterSpacing: '0.05em' }}>
                        🤖 AI
                      </span>
                    )}

                    {/* Status badge */}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.05em', border: `1px solid ${isOpen ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, background: isOpen ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: isOpen ? '#f87171' : '#4ade80' }}>
                      {isOpen ? '● Open' : '✓ Resolved'}
                    </span>

                    {/* Expand toggle — only if AI data exists */}
                    {hasAI && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a95a3', fontSize: 16, padding: '2px 4px', lineHeight: 1 }}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Diagnostic Expandable Panel */}
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

      </div>
    </div>
  );
}