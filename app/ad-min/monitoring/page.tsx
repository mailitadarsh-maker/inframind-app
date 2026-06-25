'use client';
import { useEffect, useState } from 'react';

const STATUS_COLOR: Record<string, string> = {
  success: '#34d399', failed: '#f87171', skipped: '#fbbf24',
  pending: '#fbbf24', approved: '#34d399', published: '#a78bfa', rejected: '#f87171',
};

const JOB_LABEL: Record<string, string> = {
  'generate-client-blogs': '📝 Blog Cron',
  'special-day-posts': '✦ Special Day Cron',
};

const PROVIDER_COLOR: Record<string, string> = {
  nvidia_flux: '#34d399', pollinations: '#fbbf24', '': '#f87171',
};

const fmt = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

function StatCard({ label, value, color, loading }: any) {
  return (
    <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
      <p style={{ fontSize: 11, color: '#8a95a3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: loading ? '#444' : (color || '#eef1f6') }}>{loading ? '—' : (value ?? '—')}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }: any) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
      background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
      color: active ? '#a78bfa' : '#555f6e',
      borderBottom: active ? '2px solid #a78bfa' : '2px solid transparent',
    }}>{children}</button>
  );
}

function CronTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/cron-logs').then(r => r.json()).then(d => {
      setLogs(d.logs || []); setSummary(d.summary); setLoading(false);
    });
  }, []);

  const filtered = logs.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (jobFilter !== 'all' && l.cron_job !== jobFilter) return false;
    return true;
  });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Runs" value={summary?.total} loading={loading} />
        <StatCard label="Successful" value={summary?.success} color="#34d399" loading={loading} />
        <StatCard label="Failed" value={summary?.failed} color="#f87171" loading={loading} />
        <StatCard label="Skipped" value={summary?.skipped} color="#fbbf24" loading={loading} />
      </div>
      {summary?.last_run && <p style={{ fontSize: 12, color: '#555f6e', marginBottom: 20 }}>Last activity: {fmt(summary.last_run)}</p>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'success', 'failed', 'skipped'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === s ? (STATUS_COLOR[s] || '#34d399') : 'rgba(255,255,255,0.06)',
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
      <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>Loading logs…</p>
          : filtered.length === 0 ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>No logs found.</p>
          : filtered.map((log, i) => (
            <div key={log.id}>
              <div onClick={() => setExpanded(expanded === log.id ? null : log.id)} style={{
                display: 'grid', gridTemplateColumns: '90px 140px 1fr 120px 80px',
                gap: 12, padding: '12px 16px', cursor: 'pointer', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: expanded === log.id ? 'rgba(255,255,255,0.03)' : 'transparent',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${STATUS_COLOR[log.status]}18`, color: STATUS_COLOR[log.status], textAlign: 'center' }}>{log.status.toUpperCase()}</span>
                <span style={{ fontSize: 11, color: '#555f6e' }}>{fmt(log.created_at)}</span>
                <span style={{ fontSize: 12, color: '#eef1f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</span>
                <span style={{ fontSize: 11, color: '#8a95a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.client_name || '—'}</span>
                <span style={{ fontSize: 10, color: '#555f6e', textAlign: 'right' }}>{JOB_LABEL[log.cron_job] || log.cron_job}</span>
              </div>
              {expanded === log.id && log.details && (
                <div style={{ padding: '10px 16px 14px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: 'rgba(0,0,0,0.2)' }}>
                  <pre style={{ fontSize: 11, color: '#8a95a3', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
}

function SocialTab({ posts, summary, loading }: any) {
  const [filter, setFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  const filtered = posts.filter((p: any) => {
    if (filter === 'no_image' && p.image_url) return false;
    if (filter === 'error' && !p.generation_error) return false;
    if (providerFilter !== 'all' && p.image_provider !== providerFilter) return false;
    return true;
  });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Posts" value={summary?.total} loading={loading} />
        <StatCard label="With Image" value={summary?.with_image} color="#34d399" loading={loading} />
        <StatCard label="No Image" value={summary?.no_image} color="#f87171" loading={loading} />
        <StatCard label="NVIDIA" value={summary?.nvidia} color="#34d399" loading={loading} />
        <StatCard label="Pollinations" value={summary?.pollinations} color="#fbbf24" loading={loading} />
        <StatCard label="Errors" value={summary?.errors} color="#f87171" loading={loading} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all','All'],['no_image','No Image'],['error','Has Error']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === v ? '#34d399' : 'rgba(255,255,255,0.06)', color: filter === v ? '#000' : '#8a95a3',
          }}>{l}</button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {[['all','All Providers'],['nvidia_flux','NVIDIA'],['pollinations','Pollinations']].map(([v,l]) => (
          <button key={v} onClick={() => setProviderFilter(v)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: providerFilter === v ? '#a78bfa' : 'rgba(255,255,255,0.06)', color: providerFilter === v ? '#000' : '#8a95a3',
          }}>{l}</button>
        ))}
      </div>
      <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 130px 1fr 110px 100px 90px', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['Platform','Date','Caption','Client','Provider','Image'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#555f6e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>
        {loading ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>Loading…</p>
          : filtered.length === 0 ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>No posts match.</p>
          : filtered.map((p: any, i: number) => (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '100px 130px 1fr 110px 100px 90px',
              gap: 12, padding: '12px 16px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa' }}>{p.platform} · {p.format}</span>
              <span style={{ fontSize: 11, color: '#555f6e' }}>{fmt(p.created_at)}</span>
              <span style={{ fontSize: 12, color: p.generation_error ? '#f87171' : '#eef1f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.generation_error ? `⚠ ${p.generation_error}` : (p.caption?.slice(0, 80) || '—')}
              </span>
              <span style={{ fontSize: 11, color: '#8a95a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.client_name || '—'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: PROVIDER_COLOR[p.image_provider || ''] }}>
                {p.image_provider === 'nvidia_flux' ? '⚡ NVIDIA' : p.image_provider === 'pollinations' ? '🌸 Pollinations' : '✗ None'}
              </span>
              <span>{p.image_url
                ? <a href={p.image_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#34d399' }}>View ↗</a>
                : <span style={{ fontSize: 11, color: '#f87171' }}>Missing</span>}
              </span>
            </div>
          ))}
      </div>
    </>
  );
}

function BlogsTab({ blogs, summary, loading }: any) {
  const [filter, setFilter] = useState('all');

  const filtered = blogs.filter((b: any) => {
    if (filter === 'no_image' && b.cover_image) return false;
    if (filter !== 'all' && filter !== 'no_image' && b.status !== filter) return false;
    return true;
  });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Blogs" value={summary?.total} loading={loading} />
        <StatCard label="With Image" value={summary?.with_image} color="#34d399" loading={loading} />
        <StatCard label="No Image" value={summary?.no_image} color="#f87171" loading={loading} />
        <StatCard label="Pending" value={summary?.pending} color="#fbbf24" loading={loading} />
        <StatCard label="Approved" value={summary?.approved} color="#34d399" loading={loading} />
        <StatCard label="Published" value={summary?.published} color="#a78bfa" loading={loading} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all','All'],['no_image','No Image'],['pending','Pending'],['approved','Approved'],['published','Published']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === v ? '#34d399' : 'rgba(255,255,255,0.06)', color: filter === v ? '#000' : '#8a95a3',
          }}>{l}</button>
        ))}
      </div>
      <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 130px 1fr 130px 90px', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['Status','Date','Title','Client','Cover'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#555f6e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>
        {loading ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>Loading…</p>
          : filtered.length === 0 ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>No blogs match.</p>
          : filtered.map((b: any, i: number) => (
            <div key={b.id} style={{
              display: 'grid', gridTemplateColumns: '100px 130px 1fr 130px 90px',
              gap: 12, padding: '12px 16px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${STATUS_COLOR[b.status] || '#555'}18`, color: STATUS_COLOR[b.status] || '#8a95a3', textAlign: 'center' }}>
                {b.status?.toUpperCase()}
              </span>
              <span style={{ fontSize: 11, color: '#555f6e' }}>{fmt(b.created_at)}</span>
              <span style={{ fontSize: 12, color: '#eef1f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
              <span style={{ fontSize: 11, color: '#8a95a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.client_name || '—'}</span>
              <span>{b.cover_image
                ? <a href={b.cover_image} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#34d399' }}>View ↗</a>
                : <span style={{ fontSize: 11, color: '#f87171' }}>Missing</span>}
              </span>
            </div>
          ))}
      </div>
    </>
  );
}

export default function MonitoringPage() {
  const [tab, setTab] = useState<'cron' | 'social' | 'blogs'>('cron');
  const [contentData, setContentData] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/content-health').then(r => r.json()).then(d => {
      setContentData(d); setContentLoading(false);
    });
  }, []);

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: 6 }}>Admin</p>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 20 }}>Monitoring</h1>
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
        <TabBtn active={tab === 'cron'} onClick={() => setTab('cron')}>📋 Cron Logs</TabBtn>
        <TabBtn active={tab === 'social'} onClick={() => setTab('social')}>📱 Social Posts</TabBtn>
        <TabBtn active={tab === 'blogs'} onClick={() => setTab('blogs')}>📝 Blogs</TabBtn>
      </div>
      {tab === 'cron' && <CronTab />}
      {tab === 'social' && <SocialTab posts={contentData?.posts || []} summary={contentData?.postSummary} loading={contentLoading} />}
      {tab === 'blogs' && <BlogsTab blogs={contentData?.blogs || []} summary={contentData?.blogSummary} loading={contentLoading} />}
    </div>
  );
}
