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

function ClientBreakdown({ items, imageKey, statusKey }: { items: any[]; imageKey: string; statusKey?: string }) {
  const [open, setOpen] = useState(false);
  const byClient: Record<string, any> = {};
  for (const item of items) {
    const name = item.client_name || '—';
    if (!byClient[name]) byClient[name] = { total: 0, withImage: 0, pending: 0, approved: 0, published: 0 };
    byClient[name].total++;
    if (item[imageKey]) byClient[name].withImage++;
    if (statusKey) {
      const st = item[statusKey];
      if (st === 'pending') byClient[name].pending++;
      if (st === 'approved') byClient[name].approved++;
      if (st === 'published') byClient[name].published++;
    }
  }
  const clientCount = Object.keys(byClient).length;
  return (
    <div style={{ marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: '#0d0f16', border: 'none', cursor: 'pointer',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#555f6e', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
          PER-CLIENT BREAKDOWN · {clientCount} CLIENT{clientCount !== 1 ? 'S' : ''}
        </span>
        <span style={{ color: '#555f6e', fontSize: 12, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px', background: '#060a0f' }}>
          {Object.entries(byClient).map(([name, s]: [string, any]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#0d0f16', borderRadius: 7 }}>
              <span style={{ fontSize: 12, color: '#eef1f6', fontWeight: 600, minWidth: 160 }}>{name}</span>
              <span style={{ fontSize: 11, color: '#8a95a3', fontFamily: 'monospace' }}>{s.total} total</span>
              <span style={{ fontSize: 11, color: '#34d399', fontFamily: 'monospace' }}>▣ {s.withImage} w/image</span>
              {statusKey && <>
                <span style={{ fontSize: 11, color: '#fbbf24', fontFamily: 'monospace' }}>⏳ {s.pending} pending</span>
                <span style={{ fontSize: 11, color: '#34d399', fontFamily: 'monospace' }}>✓ {s.approved} approved</span>
                <span style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace' }}>↑ {s.published} published</span>
              </>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialTab({ posts, summary, loading }: any) {
  const [filter, setFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [view, setView] = useState<'list'|'grid'>('list');

  const filtered = posts.filter((p: any) => {
    if (filter === 'no_image' && p.image_url) return false;
    if (filter === 'error' && !p.generation_error) return false;
    if (providerFilter !== 'all' && p.image_provider !== providerFilter) return false;
    return true;
  });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Posts" value={summary?.total} loading={loading} />
        <StatCard label="With Image" value={summary?.with_image} color="#34d399" loading={loading} />
        <StatCard label="No Image" value={summary?.no_image} color="#f87171" loading={loading} />
        <StatCard label="NVIDIA" value={summary?.nvidia} color="#a78bfa" loading={loading} />
        <StatCard label="Pollinations" value={summary?.pollinations} color="#60a5fa" loading={loading} />
        <StatCard label="Errors" value={summary?.errors} color="#f87171" loading={loading} />
      </div>

      {!loading && posts.length > 0 && <ClientBreakdown items={posts} imageKey="image_url" />}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[['all','All'],['no_image','No Image'],['error','Has Error']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === v ? '#34d399' : 'rgba(255,255,255,0.06)', color: filter === v ? '#000' : '#8a95a3',
          }}>{l}</button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {[['all','All'],['nvidia_flux','NVIDIA'],['pollinations','Pollinations']].map(([v,l]) => (
          <button key={v} onClick={() => setProviderFilter(v)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: providerFilter === v ? '#a78bfa' : 'rgba(255,255,255,0.06)', color: providerFilter === v ? '#000' : '#8a95a3',
          }}>{l}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {(['list','grid'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, border: 'none', cursor: 'pointer', background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent', color: view === v ? '#eef1f6' : '#555f6e' }}>{v === 'list' ? '☰' : '⊞'}</button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {filtered.map((p: any) => (
            <div key={p.id} style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
              {p.image_url
                ? <img src={p.image_url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', aspectRatio: '1', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: '#f87171' }}>No image</span>
                  </div>
              }
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>{p.platform} · {p.format}</div>
                <div style={{ fontSize: 11, color: '#8a95a3', marginBottom: 4 }}>{p.client_name}</div>
                <div style={{ fontSize: 11, color: '#eef1f6', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any }}>{p.caption?.slice(0, 100) || '—'}</div>
                {p.generation_error && <div style={{ fontSize: 10, color: '#f87171', marginTop: 6 }}>⚠ {p.generation_error.slice(0, 60)}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '64px 100px 120px 1fr 110px 110px', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Image','Platform','Date','Caption','Client','Provider'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#555f6e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>
          {loading ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>Loading…</p>
            : filtered.length === 0 ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>No posts match.</p>
            : filtered.map((p: any, i: number) => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '64px 100px 120px 1fr 110px 110px',
                gap: 12, padding: '10px 16px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                {p.image_url
                  ? <a href={p.image_url} target="_blank" rel="noreferrer">
                      <img src={p.image_url} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, display: 'block', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </a>
                  : <div style={{ width: 52, height: 52, background: '#060a0f', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(248,113,113,0.2)' }}>
                      <span style={{ fontSize: 9, color: '#f87171' }}>✗</span>
                    </div>
                }
                <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa' }}>{p.platform} · {p.format}</span>
                <span style={{ fontSize: 11, color: '#555f6e' }}>{fmt(p.created_at)}</span>
                <span style={{ fontSize: 12, color: p.generation_error ? '#f87171' : '#eef1f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.generation_error ? `⚠ ${p.generation_error}` : (p.caption?.slice(0, 80) || '—')}
                </span>
                <span style={{ fontSize: 11, color: '#8a95a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.client_name || '—'}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: PROVIDER_COLOR[p.image_provider || ''] }}>
                  {p.image_provider === 'nvidia_flux' ? '⚡ NVIDIA' : p.image_provider === 'pollinations' ? '🌸 Pollinations' : '✗ None'}
                </span>
              </div>
            ))}
        </div>
      )}
    </>
  );
}

function BlogsTab({ blogs, summary, loading }: any) {
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'list'|'grid'>('list');

  const filtered = blogs.filter((b: any) => {
    if (filter === 'no_image' && b.cover_image) return false;
    if (filter !== 'all' && filter !== 'no_image' && b.status !== filter) return false;
    return true;
  });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Blogs" value={summary?.total} loading={loading} />
        <StatCard label="With Image" value={summary?.with_image} color="#34d399" loading={loading} />
        <StatCard label="No Image" value={summary?.no_image} color="#f87171" loading={loading} />
        <StatCard label="Pending" value={summary?.pending} color="#fbbf24" loading={loading} />
        <StatCard label="Approved" value={summary?.approved} color="#34d399" loading={loading} />
        <StatCard label="Published" value={summary?.published} color="#a78bfa" loading={loading} />
      </div>

      {!loading && blogs.length > 0 && <ClientBreakdown items={blogs} imageKey="cover_image" statusKey="status" />}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[['all','All'],['no_image','No Image'],['pending','Pending'],['approved','Approved'],['published','Published']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: filter === v ? '#34d399' : 'rgba(255,255,255,0.06)', color: filter === v ? '#000' : '#8a95a3',
          }}>{l}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {(['list','grid'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, border: 'none', cursor: 'pointer', background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent', color: view === v ? '#eef1f6' : '#555f6e' }}>{v === 'list' ? '☰' : '⊞'}</button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {filtered.map((b: any) => (
            <div key={b.id} style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
              {b.cover_image
                ? <a href={b.cover_image} target="_blank" rel="noreferrer">
                    <img src={b.cover_image} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                  </a>
                : <div style={{ width: '100%', aspectRatio: '16/9', background: '#060a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: '#f87171' }}>No cover</span>
                  </div>
              }
              <div style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: `${STATUS_COLOR[b.status] || '#555'}18`, color: STATUS_COLOR[b.status] || '#8a95a3', marginBottom: 6, display: 'inline-block' }}>{b.status?.toUpperCase()}</span>
                <div style={{ fontSize: 12, color: '#eef1f6', fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{b.title}</div>
                <div style={{ fontSize: 11, color: '#555f6e' }}>{b.client_name} · {fmt(b.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 120px 1fr 130px', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Cover','Status','Date','Title','Client'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#555f6e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>
          {loading ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>Loading…</p>
            : filtered.length === 0 ? <p style={{ padding: 24, color: '#555f6e', fontSize: 13 }}>No blogs match.</p>
            : filtered.map((b: any, i: number) => (
              <div key={b.id} style={{
                display: 'grid', gridTemplateColumns: '80px 100px 120px 1fr 130px',
                gap: 12, padding: '10px 16px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                {b.cover_image
                  ? <a href={b.cover_image} target="_blank" rel="noreferrer">
                      <img src={b.cover_image} alt="" style={{ width: 68, height: 42, objectFit: 'cover', borderRadius: 6, display: 'block', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </a>
                  : <div style={{ width: 68, height: 42, background: '#060a0f', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(248,113,113,0.2)' }}>
                      <span style={{ fontSize: 9, color: '#f87171' }}>✗</span>
                    </div>
                }
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${STATUS_COLOR[b.status] || '#555'}18`, color: STATUS_COLOR[b.status] || '#8a95a3', textAlign: 'center' }}>
                  {b.status?.toUpperCase()}
                </span>
                <span style={{ fontSize: 11, color: '#555f6e' }}>{fmt(b.created_at)}</span>
                <span style={{ fontSize: 12, color: '#eef1f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                <span style={{ fontSize: 11, color: '#8a95a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.client_name || '—'}</span>
              </div>
            ))}
        </div>
      )}
    </>
  );
}

// ── ENGINE COLORS ────────────────────────────────────────────────────────────
const ENG_COLOR: Record<string,string> = {
  nvidia_flux: '#a78bfa', flux: '#a78bfa',
  pollinations: '#60a5fa',
  gpt4: '#34d399', openai: '#34d399',
  llama: '#fb923c',
  claude: '#00d4ff', anthropic: '#00d4ff',
  unknown: '#555f6e',
};
const ENG_LABEL: Record<string,string> = {
  nvidia_flux:'FLUX', flux:'FLUX', pollinations:'Pollinations',
  gpt4:'GPT-4o', openai:'GPT-4o', llama:'Llama 3.1',
  claude:'Claude', anthropic:'Claude', unknown:'Unknown',
};
const TYPE_ICON: Record<string,string> = { image:'▣', blog:'≡', social:'◉' };

function ms(v: number) { return v >= 1000 ? `${(v/1000).toFixed(1)}s` : `${v}ms`; }
function fmtCost(v: number) { return v > 0 ? `$${v.toFixed(4)}` : 'free'; }

// ── LOG DRAWER ────────────────────────────────────────────────────────────────
function LogDrawer({ log, onClose }: { log: any; onClose: () => void }) {
  if (!log) return null;
  const sc = STATUS_COLOR[log.status] || '#8a95a3';
  const ec = ENG_COLOR[log.engine] || '#8a95a3';
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }} onClick={onClose}>
      <div style={{ flex:1, background:'rgba(0,0,0,0.55)' }} />
      <div onClick={e => e.stopPropagation()} style={{
        width:500, background:'#0d0f16', borderLeft:'1px solid rgba(255,255,255,0.08)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#eef1f6', marginBottom:4 }}>{log.topic || '—'}</div>
            <div style={{ fontSize:11, color:'#555f6e', fontFamily:'monospace' }}>{log.client_name} · {fmt(log.created_at)}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#555f6e', fontSize:20, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:20 }}>
          {/* badges */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
            {[
              { label: log.status?.toUpperCase(), color: sc },
              { label: ENG_LABEL[log.engine] || log.engine, color: ec },
              { label: log.engine_version, color:'#8a95a3' },
              { label: TYPE_ICON[log.type]+' '+log.type, color:'#8a95a3' },
              log.duration_ms && { label: '⏱ '+ms(log.duration_ms), color:'#555f6e' },
              log.cost_usd > 0 && { label: fmtCost(log.cost_usd), color:'#34d399' },
              log.tokens && { label: `${(log.tokens/1000).toFixed(1)}k tok`, color:'#60a5fa' },
            ].filter(Boolean).map((b: any, i) => (
              <span key={i} style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:5, background:b.color+'18', color:b.color, fontFamily:'monospace' }}>{b.label}</span>
            ))}
          </div>

          {/* error */}
          {log.error_message && (
            <div style={{ background:'#1a0808', border:'1px solid #f8717133', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#f87171', letterSpacing:'0.08em', marginBottom:4 }}>ERROR</div>
              <div style={{ fontSize:12, color:'#ff8090', fontFamily:'monospace', lineHeight:1.6 }}>{log.error_message}</div>
            </div>
          )}

          {/* image */}
          {log.image_url && (
            <div style={{ marginBottom:16 }}>
              <img src={log.image_url} alt="" style={{ width:'100%', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', display:'block' }} />
              <a href={log.image_url} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#34d399', display:'block', marginTop:6 }}>Open full image ↗</a>
            </div>
          )}

          {/* prompt */}
          {log.prompt && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#555f6e', letterSpacing:'0.1em', marginBottom:6 }}>IMAGE PROMPT</div>
              <div style={{ fontSize:12, color:'#8a95a3', lineHeight:1.7, fontFamily:'monospace', background:'#060a0f', borderRadius:8, padding:'10px 12px' }}>{log.prompt}</div>
              {log.brand_suffix && <div style={{ fontSize:11, color:'#a78bfa', fontStyle:'italic', marginTop:6 }}>+ brand: {log.brand_suffix}</div>}
            </div>
          )}

          {/* pipeline */}
          {log.pipeline && Array.isArray(log.pipeline) && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#555f6e', letterSpacing:'0.1em', marginBottom:8 }}>PIPELINE</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
                {log.pipeline.map((step: string, i: number) => (
                  <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:11, padding:'3px 9px', borderRadius:5, fontFamily:'monospace',
                      background: step.includes('✗') ? '#f8717118' : 'rgba(255,255,255,0.06)',
                      color: step.includes('✗') ? '#f87171' : step.includes('✓') ? '#34d399' : '#8a95a3',
                    }}>{step}</span>
                    {i < log.pipeline.length-1 && <span style={{ color:'#333', fontSize:10 }}>→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* post text */}
          {log.post_text && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#555f6e', letterSpacing:'0.1em', marginBottom:6 }}>GENERATED CONTENT</div>
              <div style={{ fontSize:13, color:'#8a95a3', lineHeight:1.7, background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'12px 14px', border:'1px solid rgba(255,255,255,0.06)' }}>{log.post_text}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── GENERATION LOGS TAB ───────────────────────────────────────────────────────
function GenerationLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [fClient, setFClient] = useState('all');
  const [fType, setFType] = useState('all');
  const [fStatus, setFStatus] = useState('all');
  const [fEngine, setFEngine] = useState('all');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (fClient !== 'all') params.set('client_id', fClient);
    if (fType !== 'all') params.set('type', fType);
    if (fStatus !== 'all') params.set('status', fStatus);
    if (fEngine !== 'all') params.set('engine', fEngine);
    fetch(`/api/admin/monitoring?${params}`).then(r => r.json()).then(d => {
      setLogs(d.logs || []);
      setStats(d.stats);
      setClients(d.clients || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [fClient, fType, fStatus, fEngine]);

  const sel: Record<string,string> = {
    background:'#0d0f16', border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:7, color:'#8a95a3', fontSize:12, padding:'6px 12px', outline:'none', cursor:'pointer',
  } as any;

  return (
    <>
      {selectedLog && <LogDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />}

      {/* stat strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:20 }}>
        {[
          { label:'Total', value:stats?.total, color:'#eef1f6' },
          { label:'Success', value:stats?.success, color:'#34d399' },
          { label:'Failed', value:stats?.failed, color:'#f87171' },
          { label:'Skipped', value:stats?.skipped, color:'#fbbf24' },
          { label:'Spend', value:stats?.totalCost != null ? `$${stats.totalCost.toFixed(3)}` : null, color:'#a78bfa' },
          { label:'Logs', value:logs.length, color:'#60a5fa' },
        ].map((s,i) => <StatCard key={i} label={s.label} value={s.value} color={s.color} loading={loading} />)}
      </div>

      {/* filters */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <select value={fClient} onChange={e => setFClient(e.target.value)} style={sel}>
          <option value="all">All Clients</option>
          {clients.map((c:any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
        <select value={fType} onChange={e => setFType(e.target.value)} style={sel}>
          <option value="all">All Types</option>
          <option value="image">▣ Image</option>
          <option value="blog">≡ Blog</option>
          <option value="social">◉ Social</option>
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={sel}>
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </select>
        <select value={fEngine} onChange={e => setFEngine(e.target.value)} style={sel}>
          <option value="all">All Engines</option>
          <option value="nvidia_flux">FLUX</option>
          <option value="pollinations">Pollinations</option>
          <option value="gpt4">GPT-4o</option>
          <option value="llama">Llama</option>
          <option value="claude">Claude</option>
        </select>
        <button onClick={load} style={{ padding:'6px 14px', borderRadius:7, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#8a95a3', fontSize:12, cursor:'pointer' }}>↻ Refresh</button>
        <span style={{ marginLeft:'auto', fontSize:11, color:'#555f6e', fontFamily:'monospace' }}>{logs.length} RESULTS</span>
      </div>

      {/* column headers */}
      <div style={{ display:'grid', gridTemplateColumns:'20px 140px 1fr 100px 110px 60px 55px 55px 14px', gap:10, padding:'0 12px 8px' }}>
        {['','CLIENT','TOPIC','ENGINE','STATUS','TIME','COST','TOKENS',''].map((h,i) => (
          <span key={i} style={{ fontSize:10, color:'#555f6e', fontWeight:700, letterSpacing:'0.1em', fontFamily:'monospace' }}>{h}</span>
        ))}
      </div>

      {/* rows */}
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {loading
          ? <p style={{ padding:24, color:'#555f6e', fontSize:13 }}>Loading…</p>
          : logs.length === 0
            ? <p style={{ padding:24, color:'#555f6e', fontSize:13 }}>No logs found.</p>
            : logs.map((log:any) => {
                const ec = ENG_COLOR[log.engine] || '#8a95a3';
                const sc = STATUS_COLOR[log.status] || '#8a95a3';
                return (
                  <div key={log.id} onClick={() => setSelectedLog(log)} style={{
                    display:'grid', gridTemplateColumns:'20px 140px 1fr 100px 110px 60px 55px 55px 14px',
                    gap:10, padding:'10px 12px', background:'#0d0f16',
                    border:'1px solid rgba(255,255,255,0.05)', borderRadius:9,
                    cursor:'pointer', alignItems:'center',
                    transition:'background 0.1s, border-color 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(167,139,250,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#0d0f16'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.05)'; }}>
                    <span style={{ fontSize:12, color:'#555f6e' }}>{TYPE_ICON[log.type]}</span>
                    <span style={{ fontSize:12, color:'#8a95a3', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.client_name}</span>
                    <span style={{ fontSize:12, color:'#eef1f6', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.topic}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:ec, fontFamily:'monospace' }}>{ENG_LABEL[log.engine] || log.engine}</span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:sc, display:'inline-block', boxShadow: log.status==='success' ? `0 0 5px ${sc}` : 'none' }}></span>
                      <span style={{ fontSize:11, fontWeight:700, color:sc, fontFamily:'monospace' }}>{log.status?.toUpperCase()}</span>
                    </span>
                    <span style={{ fontSize:11, color:'#555f6e', fontFamily:'monospace' }}>{log.duration_ms ? ms(log.duration_ms) : '—'}</span>
                    <span style={{ fontSize:11, fontFamily:'monospace', color: log.cost_usd > 0 ? '#34d399' : '#555f6e' }}>{log.cost_usd != null ? fmtCost(log.cost_usd) : '—'}</span>
                    <span style={{ fontSize:11, color:'#60a5fa', fontFamily:'monospace' }}>{log.tokens ? `${(log.tokens/1000).toFixed(1)}k` : '—'}</span>
                    <span style={{ color:'#333', fontSize:12 }}>›</span>
                  </div>
                );
              })
        }
      </div>
    </>
  );
}

// ── ENGINE CONTROL TAB ────────────────────────────────────────────────────────
function EngineControlTab() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Record<string,boolean>>({});

  useEffect(() => {
    fetch('/api/admin/client-engines').then(r => r.json()).then(d => {
      setClients(d.clients || []); setLoading(false);
    });
  }, []);

  const update = async (clientId: string, field: string, val: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, [field]: val } : c));
    await fetch('/api/admin/client-engines', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ client_id: clientId, [field]: val }),
    });
    setSaved(prev => ({ ...prev, [`${clientId}_${field}`]: true }));
    setTimeout(() => setSaved(prev => { const n={...prev}; delete n[`${clientId}_${field}`]; return n; }), 2000);
  };

  const ToggleGroup = ({ options, value, onChange }: { options:{key:string,label:string}[]; value:string; onChange:(v:string)=>void }) => (
    <div style={{ display:'flex', borderRadius:7, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
      {options.map(opt => {
        const active = value === opt.key;
        const c = ENG_COLOR[opt.key] || '#8a95a3';
        return (
          <button key={opt.key} onClick={() => onChange(opt.key)} style={{
            flex:1, padding:'6px 10px', border:'none', cursor:'pointer',
            fontSize:11, fontWeight:700, fontFamily:'monospace',
            background: active ? c+'22' : '#0d0f16',
            color: active ? c : '#555f6e',
            borderRight:'1px solid rgba(255,255,255,0.06)',
            transition:'all 0.15s',
          }}>{opt.label}</button>
        );
      })}
    </div>
  );

  if (loading) return <p style={{ color:'#555f6e', padding:24 }}>Loading clients…</p>;

  return (
    <>
      <div style={{ background:'#1a1200', border:'1px solid #fbbf2433', borderRadius:9, padding:'10px 16px', marginBottom:20, fontSize:12, color:'#fbbf24', fontFamily:'monospace' }}>
        ⚠ Changes apply immediately to all future generations for that client.
      </div>

      {/* header */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 200px 260px 80px', gap:16, padding:'0 14px 10px' }}>
        {['CLIENT','IMAGE ENGINE','CONTENT ENGINE','STATUS'].map((h,i) => (
          <span key={i} style={{ fontSize:10, color:'#555f6e', fontWeight:700, letterSpacing:'0.1em', fontFamily:'monospace' }}>{h}</span>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {clients.map((c:any) => (
          <div key={c.id} style={{ display:'grid', gridTemplateColumns:'1fr 200px 260px 80px', gap:16, padding:'14px', background:'#0d0f16', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#eef1f6' }}>{c.company_name}</div>
              <div style={{ fontSize:11, color:'#555f6e' }}>{c.industry} · {c.plan}</div>
            </div>

            <div>
              <ToggleGroup
                value={c.image_engine || 'flux'}
                onChange={v => update(c.id, 'image_engine', v)}
                options={[{key:'flux',label:'FLUX'},{key:'pollinations',label:'Pollinations'}]}
              />
              {saved[`${c.id}_image_engine`] && <span style={{ fontSize:10, color:'#34d399', fontFamily:'monospace', display:'block', marginTop:4 }}>✓ saved</span>}
            </div>

            <div>
              <ToggleGroup
                value={c.content_engine || 'llama'}
                onChange={v => update(c.id, 'content_engine', v)}
                options={[{key:'llama',label:'Llama'},{key:'gpt4',label:'GPT-4o'},{key:'claude',label:'Claude'}]}
              />
              {saved[`${c.id}_content_engine`] && <span style={{ fontSize:10, color:'#34d399', fontFamily:'monospace', display:'block', marginTop:4 }}>✓ saved</span>}
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#34d399', display:'inline-block', boxShadow:'0 0 6px #34d399' }}></span>
              <span style={{ fontSize:11, color:'#34d399', fontFamily:'monospace' }}>ACTIVE</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── API STATUS CHECKER ───────────────────────────────────────────────────────
function ApiStatusChecker() {
  const STATUS_COLOR: Record<string, string> = {
    ok: '#34d399', exhausted: '#f87171', invalid_key: '#f87171',
    rate_limited: '#fbbf24', timeout: '#fbbf24', error: '#fbbf24',
  };
  const STATUS_ICON: Record<string, string> = {
    ok: '✅', exhausted: '❌', invalid_key: '🔑', rate_limited: '⚡', timeout: '⏱', error: '⚠️',
  };

  const APIS = [
    { key: 'nvidia',    label: '⬡ NVIDIA FLUX',      endpoint: '/api/admin/check-nvidia',    accent: '#a78bfa' },
    { key: 'openai',    label: '◈ OpenAI / DALL·E',  endpoint: '/api/admin/check-openai',    accent: '#34d399' },
    { key: 'anthropic', label: '◇ Anthropic Claude', endpoint: '/api/admin/check-anthropic', accent: '#00d4ff' },
    { key: 'resend',    label: '✉ Resend (Email)',    endpoint: '/api/admin/check-resend',    accent: '#fb923c' },
    { key: 'pexels',    label: '🖼 Pexels (Images)',  endpoint: '/api/admin/check-pexels',    accent: '#60a5fa' },
    { key: 'unsplash',  label: '📷 Unsplash (Images)',endpoint: '/api/admin/check-unsplash',  accent: '#f472b6' },
    { key: 'vercel',    label: '▲ Vercel (Deploy)',   endpoint: '/api/admin/check-vercel',    accent: '#eef1f6' },
    { key: 'openai',    label: '◈ OpenAI / DALL·E',  endpoint: '/api/admin/check-openai',    accent: '#34d399' },
    { key: 'anthropic', label: '◇ Anthropic Claude', endpoint: '/api/admin/check-anthropic', accent: '#00d4ff' },
    { key: 'resend',    label: '✉ Resend (Email)',    endpoint: '/api/admin/check-resend',    accent: '#fb923c' },
    { key: 'pexels',    label: '🖼 Pexels (Images)',  endpoint: '/api/admin/check-pexels',    accent: '#60a5fa' },
    { key: 'unsplash',  label: '📷 Unsplash (Images)',endpoint: '/api/admin/check-unsplash',  accent: '#f472b6' },
    { key: 'vercel',    label: '▲ Vercel (Deploy)',   endpoint: '/api/admin/check-vercel',    accent: '#eef1f6' },
  ];

  const [statuses, setStatuses] = useState<Record<string, any>>({});
  const [checking, setChecking] = useState<Record<string, boolean>>({});

  const checkOne = async (key: string, endpoint: string) => {
    setChecking(prev => ({ ...prev, [key]: true }));
    setStatuses(prev => ({ ...prev, [key]: null }));
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setStatuses(prev => ({ ...prev, [key]: data }));
    } catch(e) {
      setStatuses(prev => ({ ...prev, [key]: { status: 'error', message: 'Failed to reach server', code: 0 } }));
    }
    setChecking(prev => ({ ...prev, [key]: false }));
  };

  const checkAll = () => APIS.forEach(a => checkOne(a.key, a.endpoint));

  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontSize:10, fontWeight:700, color:'#555f6e', letterSpacing:'0.1em', fontFamily:'monospace' }}>API STATUS</span>
        <button onClick={checkAll} style={{ padding:'5px 12px', borderRadius:7, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#8a95a3', fontSize:11, fontWeight:600, cursor:'pointer' }}>
          ↻ Check All
        </button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {APIS.map(api => {
          const s = statuses[api.key];
          const isChecking = checking[api.key];
          return (
            <div key={api.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', background:'#0d0f16', border:`1px solid ${api.accent}22`, borderRadius:9 }}>
              <span style={{ fontSize:12, fontWeight:600, color:api.accent, minWidth:160 }}>{api.label}</span>
              <button onClick={() => checkOne(api.key, api.endpoint)} disabled={isChecking} style={{
                padding:'4px 12px', borderRadius:6, border:`1px solid ${api.accent}44`,
                background:`${api.accent}11`, color:api.accent, fontSize:11, fontWeight:600,
                cursor: isChecking ? 'wait' : 'pointer', opacity: isChecking ? 0.5 : 1, flexShrink:0,
              }}>
                {isChecking ? '⏳ Checking…' : '↻ Check'}
              </button>
              {s ? (
                <span style={{ fontSize:12, fontWeight:700, color: STATUS_COLOR[s.status] || '#8a95a3', fontFamily:'monospace' }}>
                  {STATUS_ICON[s.status]} {s.message}
                </span>
              ) : (
                <span style={{ fontSize:11, color:'#333f4e', fontFamily:'monospace' }}>not checked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AI USAGE TAB ──────────────────────────────────────────────────────────────
function AIUsageTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string|null>(null);
  const month = new Date().toISOString().slice(0,7);

  useEffect(() => {
    fetch(`/api/admin/ai-usage?month=${month}`).then(r => r.json()).then(d => {
      setData(d); setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ color:'#555f6e', padding:24 }}>Loading usage data…</p>;

  const engines = data?.engines || {};
  const SERVICE_META: Record<string,{name:string,icon:string,type:string}> = {
    nvidia_flux:  { name:'NVIDIA FLUX',      icon:'⬡', type:'Image' },
    flux:         { name:'NVIDIA FLUX',      icon:'⬡', type:'Image' },
    pollinations: { name:'Pollinations',     icon:'◎', type:'Image (Free)' },
    gpt4:         { name:'OpenAI GPT-4o',   icon:'◈', type:'Content' },
    llama:        { name:'Meta Llama 3.1',  icon:'◆', type:'Content' },
    claude:       { name:'Anthropic Claude', icon:'◇', type:'Content' },
  };

  return (
    <>
      {/* totals */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        <StatCard label={`Total Spend — ${month}`} value={data?.totalCost != null ? `$${data.totalCost.toFixed(3)}` : '—'} loading={false} />
        <StatCard label="Pending Credits (NVIDIA)" value={data?.pendingCredits != null ? `$${data.pendingCredits.toFixed(3)}` : '—'} color="#fbbf24" loading={false} />
        <StatCard label="Total Tokens Used" value={data?.totalTokens != null ? `${(data.totalTokens/1000).toFixed(1)}k` : '—'} color="#60a5fa" loading={false} />
      </div>

      {/* NVIDIA credit check */}
      <ApiStatusChecker />
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <a href="https://build.nvidia.com/settings/api-keys" target="_blank" rel="noreferrer" style={{
          display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
          borderRadius:8, border:'1px solid rgba(167,139,250,0.3)', background:'rgba(167,139,250,0.08)',
          color:'#a78bfa', fontSize:12, fontWeight:600, textDecoration:'none',
        }}>⬡ NVIDIA API Keys ↗</a>
        <a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noreferrer" style={{
          display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
          borderRadius:8, border:'1px solid rgba(52,211,153,0.3)', background:'rgba(52,211,153,0.08)',
          color:'#34d399', fontSize:12, fontWeight:600, textDecoration:'none',
        }}>◈ Check OpenAI Credits ↗</a>
        <a href="https://console.anthropic.com/settings/billing" target="_blank" rel="noreferrer" style={{
          display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
          borderRadius:8, border:'1px solid rgba(0,212,255,0.3)', background:'rgba(0,212,255,0.08)',
          color:'#00d4ff', fontSize:12, fontWeight:600, textDecoration:'none',
        }}>◇ Check Anthropic Credits ↗</a>
      </div>

      {/* pending warning */}
      {(data?.pendingCredits || 0) > 0 && (
        <div style={{ background:'#1a1200', border:'1px solid #fbbf2433', borderRadius:9, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#fbbf24', fontFamily:'monospace' }}>
          ⚠ ${data.pendingCredits.toFixed(3)} in NVIDIA credits may take 24–48h to reflect in billing.
        </div>
      )}

      {/* header */}
      <div style={{ display:'grid', gridTemplateColumns:'32px 1fr 80px 70px 60px 80px 70px', gap:12, padding:'0 14px 8px' }}>
        {['','SERVICE','TYPE','CALLS','OK%','COST','TOKENS'].map((h,i) => (
          <span key={i} style={{ fontSize:10, color:'#555f6e', fontWeight:700, letterSpacing:'0.1em', fontFamily:'monospace' }}>{h}</span>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {Object.entries(engines).map(([key, eng]: [string, any]) => {
          const meta = SERVICE_META[key];
          if (!meta) return null;
          const okPct = eng.calls > 0 ? Math.round((eng.success/eng.calls)*100) : 0;
          const isExpanded = expanded === key;
          const ec = ENG_COLOR[key] || '#8a95a3';
          return (
            <div key={key} style={{ border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, overflow:'hidden' }}>
              <button onClick={() => setExpanded(isExpanded ? null : key)} style={{
                width:'100%', display:'grid', gridTemplateColumns:'32px 1fr 80px 70px 60px 80px 70px',
                gap:12, padding:'13px 14px', background:'#0d0f16', border:'none', cursor:'pointer',
                alignItems:'center', textAlign:'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background='#0d0f16')}>
                <span style={{ fontSize:16 }}>{meta.icon}</span>
                <span style={{ fontSize:13, color:'#eef1f6', fontWeight:600 }}>{meta.name}</span>
                <span style={{ fontSize:11, color:'#555f6e', fontFamily:'monospace' }}>{meta.type}</span>
                <span style={{ fontSize:13, color:'#eef1f6', fontFamily:'monospace', fontWeight:600 }}>{eng.calls}</span>
                <span style={{ fontSize:13, fontFamily:'monospace', fontWeight:600, color: okPct>=95?'#34d399':okPct>=80?'#fbbf24':'#f87171' }}>{okPct}%</span>
                <span style={{ fontSize:13, fontFamily:'monospace', fontWeight:700, color: eng.cost>0?'#eef1f6':'#34d399' }}>{eng.cost>0?`$${eng.cost.toFixed(3)}`:'FREE'}</span>
                <span style={{ fontSize:11, color:'#60a5fa', fontFamily:'monospace' }}>{eng.tokens>0?`${(eng.tokens/1000).toFixed(0)}k`:'—'}</span>
              </button>
              {isExpanded && (
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', background:'#060a0f', padding:'12px 14px' }}>
                  <div style={{ fontSize:10, color:'#555f6e', fontWeight:700, letterSpacing:'0.1em', fontFamily:'monospace', marginBottom:10 }}>PER-CLIENT BREAKDOWN</div>
                  {Object.entries(eng.breakdown || {}).map(([client, b]: [string,any]) => (
                    <div key={client} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#0d0f16', borderRadius:7, marginBottom:4 }}>
                      <span style={{ fontSize:12, color:'#8a95a3' }}>{client}</span>
                      <div style={{ display:'flex', gap:20 }}>
                        <span style={{ fontSize:12, color:'#555f6e', fontFamily:'monospace' }}>{b.calls} calls</span>
                        <span style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color: b.cost>0?'#eef1f6':'#34d399' }}>{b.cost>0?`$${b.cost.toFixed(3)}`:'FREE'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {Object.keys(engines).length === 0 && (
          <p style={{ padding:24, color:'#555f6e', fontSize:13 }}>No usage data yet for {month}. Generate some posts first.</p>
        )}
      </div>
    </>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function MonitoringPage() {
  const [tab, setTab] = useState<'cron' | 'social' | 'blogs' | 'genlog' | 'engines' | 'usage'>('genlog');
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
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0, flexWrap:'wrap' }}>
        <TabBtn active={tab === 'genlog'}  onClick={() => setTab('genlog')}>⚡ Generation Logs</TabBtn>
        <TabBtn active={tab === 'engines'} onClick={() => setTab('engines')}>⚙️ Engine Control</TabBtn>
        <TabBtn active={tab === 'usage'}   onClick={() => setTab('usage')}>📊 AI Usage & Spend</TabBtn>
        <div style={{ width:1, background:'rgba(255,255,255,0.08)', margin:'8px 8px' }} />
        <TabBtn active={tab === 'cron'}   onClick={() => setTab('cron')}>📋 Cron Logs</TabBtn>
        <TabBtn active={tab === 'social'} onClick={() => setTab('social')}>📱 Social Posts</TabBtn>
        <TabBtn active={tab === 'blogs'}  onClick={() => setTab('blogs')}>📝 Blogs</TabBtn>
      </div>
      {tab === 'genlog'  && <GenerationLogsTab />}
      {tab === 'engines' && <EngineControlTab />}
      {tab === 'usage'   && <AIUsageTab />}
      {tab === 'cron'    && <CronTab />}
      {tab === 'social'  && <SocialTab posts={contentData?.posts || []} summary={contentData?.postSummary} loading={contentLoading} />}
      {tab === 'blogs'   && <BlogsTab blogs={contentData?.blogs || []} summary={contentData?.blogSummary} loading={contentLoading} />}
    </div>
  );
}
