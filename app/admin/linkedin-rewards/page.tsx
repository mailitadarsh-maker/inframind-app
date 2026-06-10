'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Submission = {
  id: string;
  linkedin_post_url: string;
  linkedin_reward_status: string;
  linkedin_submitted_at: string;
};

export default function LinkedInRewardsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
const [isAdmin, setIsAdmin] = useState(false);
const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
  checkAdmin();
}, []);

async function checkAdmin() {
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    setCheckingAdmin(false);
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (profile?.role === 'admin') {
    setIsAdmin(true);
    fetchSubmissions();
  }

  setCheckingAdmin(false);
}

  async function fetchSubmissions() {
    setLoading(true);

    const res = await fetch('/api/linkedin/pending');
    const result = await res.json();

    console.log(result);

    if (result.error) {
      setError('Failed to load submissions.');
    } else {
      setSubmissions(result.data || []);
      console.log('SUBMISSIONS:', result.data);
    }

    setLoading(false);
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    setActionLoading(userId + action);
    const res = await fetch('/api/linkedin/admin-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== userId));
      showToast(
        action === 'approve'
          ? '14 days added to user account.'
          : 'Submission rejected.',
        'success'
      );
    } else {
      showToast(data.error || 'Action failed.', 'error');
    }
    setActionLoading(null);
  }

  function formatDate(iso: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function shortId(id: string) {
    return id.slice(0, 8) + '…';
  }
if (checkingAdmin) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090f',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Checking access...
    </div>
  );
}

if (!isAdmin) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090f',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 600,
      }}
    >
      Access Denied
    </div>
  );
}
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090f',
        color: '#fff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '48px 40px',
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: toast.type === 'success' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
            color: toast.type === 'success' ? '#22c55e' : '#f87171',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#22c55e',
            marginBottom: '10px',
          }}
        >
          Admin Panel
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#f9fafb',
              margin: 0,
            }}
          >
            LinkedIn Reward Requests
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0d1117',
              border: '1px solid #1f2937',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              color: '#6b7280',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: submissions.length > 0 ? '#22c55e' : '#374151',
                boxShadow: submissions.length > 0 ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
                display: 'inline-block',
              }}
            />
            {loading ? 'Loading…' : `${submissions.length} pending`}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px',
            color: '#f87171',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          ✕ {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 0',
            color: '#374151',
            fontSize: '14px',
            gap: '10px',
          }}
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #1f2937',
              borderTopColor: '#22c55e',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          Loading submissions…
        </div>
      ) : submissions.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: '#374151',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#6b7280' }}>All caught up</div>
          <div style={{ fontSize: '13px', marginTop: '6px' }}>No pending reward submissions.</div>
        </div>
      ) : (
        <div
          style={{
            background: '#0d1117',
            border: '1px solid #1f2937',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.6fr 1.2fr 160px',
              padding: '12px 20px',
              borderBottom: '1px solid #1f2937',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4b5563',
            }}
          >
            <span>User ID</span>
            <span>LinkedIn Post</span>
            <span>Submitted</span>
            <span>Action</span>
          </div>

          {submissions.map((row, i) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.6fr 1.2fr 160px',
                padding: '16px 20px',
                borderBottom: i < submissions.length - 1 ? '1px solid #1f2937' : 'none',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <code
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    background: '#111827',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #1f2937',
                    letterSpacing: '0.03em',
                  }}
                  title={row.id}
                >
                  {shortId(row.id)}
                </code>
              </div>

              <div>
                <a
                  href={row.linkedin_post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#22c55e',
                    fontSize: '13px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  View Post
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>↗</span>
                </a>
              </div>

              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {formatDate(row.linkedin_submitted_at)}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleAction(row.id, 'approve')}
                  disabled={actionLoading !== null}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: actionLoading === row.id + 'approve' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    color: '#22c55e',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                    opacity: actionLoading !== null && actionLoading !== row.id + 'approve' ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {actionLoading === row.id + 'approve' ? '…' : 'Approve'}
                </button>
                <button
                  onClick={() => handleAction(row.id, 'reject')}
                  disabled={actionLoading !== null}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: actionLoading === row.id + 'reject' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                    opacity: actionLoading !== null && actionLoading !== row.id + 'reject' ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {actionLoading === row.id + 'reject' ? '…' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}