'use client';
import { useEffect, useState } from 'react';

const STATUS_COLOR: Record<string, string> = {
  success: '#34d399',
  failed: '#f87171',
  skipped: '#fbbf24',
};

const JOB_LABEL: Record<string, string> = {
  'generate-client-blogs': '📝 Blog Cron',
  'special-day-posts': '✦ Special Day Cron',
};

export default function MonitoringPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'skipped'>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/cron-logs')
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setSummary(d.summary); setLoading(false); });
  }, []);

  const filtered = logs.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (jobFilter !== 'all' && l.cron_job !== jobFilter) return false;
    return true;
  });

  const fmt = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: 6 }}>Admin</p>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 24 }}>Cron Monitoring</h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Runs', value: summary?.total, color: '#eef1f6' },
          { label: 'Successful', value: summary?.success, color: '#34d399' },
          { label: 'Failed', value: summary?.failed, color: '#f87171' },
          { label: 'Skipped', value: summary?.skipped, color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ fontSize: 11, color: '#8a95a3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: loading ? '#444' : s.color }}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {summary?.last_run && (
        <p style={{ fontSize: 12, color: '#555f6e', marginBottom: 20 }}>Last activity: {fmt(summary.last_run)}</p>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'success', 'failed', 'skipped'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === s ? STATUS_COLOR[s] || '#34d399' : 'rgba(255,255,255,0.06)',
            color: filter === s ? '#000' : '#8a95a3',
          }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {(['all', 'generate-client-blogs', 'special-day-posts'] as const).map(j => (
          <button key={j} onClick={() => setJobFilter(j)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: jobFilter === j ? '#a78bfa' : 'rgba(255,255,255,0.06)',
            color: jobFilter === j ? '#000' : '#8a95a3',
          }}>{j === 'all' ? 'All Jobs' : JOB_LABEL[j]}</button>
        ))}
      </div>

      {/* Log table */}
      <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>Loading logs…</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>No logs found. Crons haven't run yet or no matching entries.</p>
        ) : filtered.map((log, i) => (
          <div key={log.id}>
            <div
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
              style={{
                display: 'grid', gridTemplateColumns: '90px 140px 1fr 120px 80px',
                gap: 12, padding: '12px 16px', cursor: 'pointer', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: expanded === log.id ? 'rgba(255,255,255,0.03)' : 'transparent',
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: `${STATUS_COLOR[log.status]}18`,
                color: STATUS_COLOR[log.status], textAlign: 'center',
              }}>{log.status.toUpperCase()}</span>

              <span style={{ fontSize: 11, color: '#555f6e' }}>{fmt(log.created_at)}</span>

              <span style={{ fontSize: 12, color: '#eef1f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.message}
              </span>

              <span style={{ fontSize: 11, color: '#8a95a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.client_name || '—'}
              </span>

              <span style={{ fontSize: 10, color: '#555f6e', textAlign: 'right' }}>
                {JOB_LABEL[log.cron_job] || log.cron_job}
              </span>
            </div>

            {expanded === log.id && log.details && (
              <div style={{ padding: '10px 16px 14px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: 'rgba(0,0,0,0.2)' }}>
                <pre style={{ fontSize: 11, color: '#8a95a3', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
