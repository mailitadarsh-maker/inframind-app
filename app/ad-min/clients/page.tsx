'use client';

import { useEffect, useState } from 'react';

const PLAN_OPTIONS = ['free', 'starter', 'growth', 'pro', 'enterprise'];
const STATUS_OPTIONS = ['trial', 'paid', 'unpaid', 'overdue'];
const PAGE_SIZES = [10, 25, 50];

const statusColor: Record<string, { bg: string; text: string; border: string }> = {
  trial:   { bg: 'rgba(250,204,21,0.08)', text: '#facc15', border: 'rgba(250,204,21,0.25)' },
  paid:    { bg: 'rgba(52,211,153,0.08)', text: '#34d399', border: 'rgba(52,211,153,0.25)' },
  unpaid:  { bg: 'rgba(255,255,255,0.04)', text: '#8a95a3', border: 'rgba(255,255,255,0.1)' },
  overdue: { bg: 'rgba(248,113,113,0.08)', text: '#f87171', border: 'rgba(248,113,113,0.25)' },
};

const productTag: Record<string, { bg: string; text: string; label: string }> = {
  blog: { bg: 'rgba(52,211,153,0.08)', text: '#34d399', label: 'Blog' },
  monitoring: { bg: 'rgba(96,165,250,0.08)', text: '#60a5fa', label: 'Monitoring' },
};

function daysLeft(dateStr: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isGmail(email: string) {
  return /@gmail\\.com$/i.test(email || '');
}

export default function AdminClientsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const [productFilter, setProductFilter] = useState<'all' | 'blog' | 'monitoring' | 'neither'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [productFilter, planFilter, statusFilter]);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/accounts');
    const data = await res.json();
    setAccounts(data.accounts || []);
    const drafts: Record<string, string> = {};
    (data.accounts || []).forEach((a: any) => { if (a.client) drafts[a.client.id] = a.client.notes || ''; });
    setNoteDrafts(drafts);
    setLoading(false);
  }

  async function updateClient(clientId: string, userId: string, updates: Record<string, any>) {
    setSavingId(userId);
    await fetch('/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, updates }),
    });
    setAccounts(prev => prev.map(a => a.user_id === userId ? { ...a, client: { ...a.client, ...updates } } : a));
    setSavingId(null);
  }

  const selectStyle: React.CSSProperties = {
    background: '#11141d',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '5px 8px',
    fontSize: 12.5,
    color: '#eef1f6',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12.5, fontWeight: 500, padding: '6px 14px', borderRadius: 999,
    border: active ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(52,211,153,0.08)' : 'transparent',
    color: active ? '#34d399' : '#8a95a3',
    cursor: 'pointer', fontFamily: 'inherit',
  });

  // Apply all filters together
  const filtered = accounts.filter(a => {
    if (productFilter === 'neither' && a.products.length !== 0) return false;
    if (productFilter !== 'all' && productFilter !== 'neither' && !a.products.includes(productFilter)) return false;
    if (planFilter !== 'all' && (!a.client || a.client.plan !== planFilter)) return false;
    if (statusFilter !== 'all' && (!a.client || a.client.payment_status !== statusFilter)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const totalBlog = accounts.filter(a => a.products.includes('blog')).length;
  const totalMonitoring = accounts.filter(a => a.products.includes('monitoring')).length;
  const totalNeither = accounts.filter(a => a.products.length === 0).length;

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: 6 }}>
        Admin
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 4 }}>Clients</h1>
      <p style={{ fontSize: 13, color: '#8a95a3', marginBottom: 22 }}>All signed-up accounts — monitoring users, blog clients, and both.</p>

      {/* Product filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#8a95a3', alignSelf: 'center', marginRight: 4 }}>Product:</span>
        {[
          { key: 'all', label: `All (${accounts.length})` },
          { key: 'blog', label: `Blog (${totalBlog})` },
          { key: 'monitoring', label: `Monitoring (${totalMonitoring})` },
          { key: 'neither', label: `Inactive (${totalNeither})` },
        ].map(f => (
          <button key={f.key} onClick={() => setProductFilter(f.key as any)} style={chipStyle(productFilter === f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Plan filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#8a95a3', alignSelf: 'center', marginRight: 4 }}>Plan:</span>
        <button onClick={() => setPlanFilter('all')} style={chipStyle(planFilter === 'all')}>All</button>
        {PLAN_OPTIONS.map(p => (
          <button key={p} onClick={() => setPlanFilter(p)} style={chipStyle(planFilter === p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#8a95a3', alignSelf: 'center', marginRight: 4 }}>Status:</span>
        <button onClick={() => setStatusFilter('all')} style={chipStyle(statusFilter === 'all')}>All</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={chipStyle(statusFilter === s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#8a95a3', fontSize: 13 }}>Loading accounts…</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#8a95a3' }}>No accounts match these filters.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {paged.map(a => {
          const c = a.client;
          const dleft = c ? daysLeft(c.trial_ends_at) : null;
          const sc = c ? (statusColor[c.payment_status] || statusColor.unpaid) : null;
          const expanded = expandedId === a.user_id;
          const gmail = isGmail(a.email);

          return (
            <div key={a.user_id} style={{ background: '#0d0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>

              {/* Row */}
              <div
                onClick={() => setExpandedId(expanded ? null : a.user_id)}
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 16 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14.5, fontWeight: 600, color: '#eef1f6', marginBottom: 3 }}>
                    {c?.company_name || a.email}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 12, color: '#8a95a3' }}>{a.email}</p>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                      background: gmail ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.05)',
                      color: gmail ? '#34d399' : '#8a95a3',
                    }}>
                      {gmail ? 'Gmail' : 'Other'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {a.products.length === 0 && (
                      <span style={{ fontSize: 11, color: '#8a95a3', fontStyle: 'italic' }}>No product used</span>
                    )}
                    {a.products.map((p: string) => (
                      <span key={p} style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                        background: productTag[p].bg, color: productTag[p].text,
                      }}>
                        {productTag[p].label}
                      </span>
                    ))}
                  </div>

                  {a.monitors.count > 0 && (
                    <span style={{ fontSize: 12, color: '#8a95a3' }}>{a.monitors.count} monitor{a.monitors.count > 1 ? 's' : ''}</span>
                  )}

                  {c && (
                    <>
                      <span style={{ fontSize: 12, color: '#8a95a3' }}>{c.blog_stats?.total || 0} blogs</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                        textTransform: 'capitalize',
                        background: sc!.bg, color: sc!.text, border: `1px solid ${sc!.border}`,
                      }}>
                        {c.payment_status}
                      </span>
                      {c.payment_status === 'trial' && dleft !== null && (
                        <span style={{ fontSize: 11, color: dleft <= 2 ? '#f87171' : '#8a95a3' }}>
                          {dleft > 0 ? `${dleft}d left` : 'expired'}
                        </span>
                      )}
                    </>
                  )}

                  <span style={{ color: '#8a95a3', fontSize: 12, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
                </div>
              </div>

              {/* Expanded panel */}
              {expanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

                  <p style={{ fontSize: 11, color: '#8a95a3', marginTop: 16, marginBottom: 4 }}>
                    Signed up {new Date(a.signed_up_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  {a.monitors.count > 0 && (
                    <div style={{ marginTop: 14, marginBottom: 18 }}>
                      <p style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Monitoring · {a.monitors.online} online / {a.monitors.offline} offline
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {a.monitors.list.map((m: any) => (
                          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '8px 12px', background: '#11141d', borderRadius: 8 }}>
                            <span style={{ color: '#eef1f6' }}>{m.name} <span style={{ color: '#8a95a3' }}>({m.type})</span></span>
                            <span style={{ color: m.status === 'online' ? '#34d399' : '#f87171', textTransform: 'capitalize' }}>{m.status || 'unknown'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {c ? (
                    <>
                      <p style={{ fontSize: 11, color: '#34d399', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Blog-as-a-Service
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 18 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: '#8a95a3', marginBottom: 6 }}>Plan</label>
                          <select
                            value={c.plan || 'free'}
                            onChange={e => updateClient(c.id, a.user_id, { plan: e.target.value })}
                            style={{ ...selectStyle, width: '100%' }}
                          >
                            {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: '#8a95a3', marginBottom: 6 }}>Payment Status</label>
                          <select
                            value={c.payment_status || 'trial'}
                            onChange={e => updateClient(c.id, a.user_id, { payment_status: e.target.value })}
                            style={{ ...selectStyle, width: '100%' }}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: '#8a95a3', marginBottom: 6 }}>Blogs / Month</label>
                          <input
                            type="number"
                            defaultValue={c.blogs_per_month || 0}
                            onBlur={e => updateClient(c.id, a.user_id, { blogs_per_month: parseInt(e.target.value) || 0 })}
                            style={{ ...selectStyle, width: '100%' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 11, color: '#8a95a3', marginBottom: 6 }}>Notes</label>
                        <textarea
                          value={noteDrafts[c.id] ?? ''}
                          onChange={e => setNoteDrafts(prev => ({ ...prev, [c.id]: e.target.value }))}
                          onBlur={e => updateClient(c.id, a.user_id, { notes: e.target.value })}
                          placeholder="e.g. Paid ₹999 via UPI on 17 June"
                          rows={2}
                          style={{ ...selectStyle, width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#8a95a3' }}>
                        <span>Industry: <span style={{ color: '#eef1f6' }}>{c.industry || '—'}</span></span>
                        <span>Slug: <span style={{ color: '#eef1f6' }}>{c.slug || '—'}</span></span>
                        {savingId === a.user_id && <span style={{ color: '#34d399' }}>Saving…</span>}
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: 12.5, color: '#8a95a3', fontStyle: 'italic' }}>
                      Not using Blog-as-a-Service.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#8a95a3' }}>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(parseInt(e.target.value)); setPage(1); }}
              style={selectStyle}
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ fontSize: 12, color: '#8a95a3', marginLeft: 8 }}>
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={{ ...selectStyle, opacity: safePage === 1 ? 0.4 : 1, cursor: safePage === 1 ? 'not-allowed' : 'pointer' }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 12, color: '#8a95a3', padding: '0 8px' }}>Page {safePage} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={{ ...selectStyle, opacity: safePage === totalPages ? 0.4 : 1, cursor: safePage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
