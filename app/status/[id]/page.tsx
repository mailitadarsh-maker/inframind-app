import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StatusPage({ params }: PageProps) {
  const { id } = await params;

  const { data: monitor } = await supabase
    .from('monitors')
    .select('*')
    .eq('id', id)
    .single();

  const { data: incidents } = await supabase
    .from('incidents')
    .select('*')
    .eq('monitor_id', id)
    .order('started_at', { ascending: false })
    .limit(10);

  const isOnline = monitor?.status === 'online';

  if (!monitor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#a0a0b0' }}>Monitor Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0f;
          font-family: 'DM Sans', sans-serif;
        }

        .page-wrapper {
          min-height: 100vh;
          background: #0a0a0f;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 120, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(56, 100, 255, 0.05) 0%, transparent 50%);
          padding: 3rem 1.5rem;
          color: #e2e2ea;
        }

        .container {
          max-width: 760px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 2.5rem;
        }

        .header-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a4a6a;
          margin-bottom: 0.5rem;
        }

        .header-title {
          font-size: 1.75rem;
          font-weight: 300;
          color: #e2e2ea;
          letter-spacing: -0.02em;
        }

        .header-title span {
          font-weight: 600;
          color: #fff;
        }

        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.75rem 2rem;
          margin-bottom: 1.25rem;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }

        .monitor-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .monitor-name {
          font-size: 1.3rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .monitor-url {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: #5a5a7a;
          margin-top: 0.25rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }

        .status-badge.online {
          background: rgba(56, 189, 120, 0.12);
          border: 1px solid rgba(56, 189, 120, 0.25);
          color: #38bd78;
        }

        .status-badge.offline {
          background: rgba(255, 80, 80, 0.12);
          border: 1px solid rgba(255, 80, 80, 0.25);
          color: #ff5050;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-dot.pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 0.9rem 1rem;
        }

        .stat-label {
          font-size: 0.68rem;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a4a6a;
          margin-bottom: 0.4rem;
        }

        .stat-value {
          font-size: 1.05rem;
          font-weight: 500;
          color: #c8c8d8;
        }

        .stat-value.green { color: #38bd78; }

        .section-title {
          font-size: 0.7rem;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a4a6a;
          margin-bottom: 1.25rem;
        }

        .incident-row {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 1rem;
          align-items: center;
          padding: 0.9rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .incident-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .incident-row:first-child {
          padding-top: 0;
        }

        .incident-time-label {
          font-size: 0.65rem;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4a4a6a;
          margin-bottom: 0.2rem;
        }

        .incident-time-value {
          font-size: 0.8rem;
          color: #8a8a9a;
        }

        .incident-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .incident-badge.resolved {
          background: rgba(56, 189, 120, 0.1);
          border: 1px solid rgba(56, 189, 120, 0.2);
          color: #38bd78;
        }

        .incident-badge.open {
          background: rgba(255, 160, 50, 0.1);
          border: 1px solid rgba(255, 160, 50, 0.2);
          color: #ffa032;
        }

        .empty-state {
          text-align: center;
          padding: 2rem 0;
          color: #3a3a5a;
          font-size: 0.875rem;
        }

        .divider-line {
          width: 32px;
          height: 2px;
          background: linear-gradient(90deg, rgba(56,189,120,0.5), transparent);
          border-radius: 1px;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 560px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .incident-row { grid-template-columns: 1fr; gap: 0.5rem; }
          .monitor-header { flex-direction: column; }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="container">

          {/* Header */}
          <div className="header">
            <div className="header-eyebrow">InfraMind</div>
            <h1 className="header-title">
              <span>Status</span> Dashboard
            </h1>
          </div>

          {/* Monitor Card */}
          <div className="card">
            <div className="monitor-header">
              <div>
                <div className="monitor-name">{monitor.name}</div>
                <div className="monitor-url">{monitor.target_url}</div>
              </div>
              <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
                <span className={`status-dot ${isOnline ? 'pulse' : ''}`} />
                {isOnline ? 'Operational' : 'Outage'}
              </div>
            </div>

            <div className="divider-line" />

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Response</div>
                <div className="stat-value">{monitor.response_time} <span style={{ fontSize: '0.7rem', color: '#4a4a6a' }}>ms</span></div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Uptime</div>
                <div className="stat-value green">99.99<span style={{ fontSize: '0.7rem' }}>%</span></div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Last Check</div>
                <div className="stat-value" style={{ fontSize: '0.78rem', color: '#6a6a8a' }}>
                  {new Date(monitor.last_checked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Incidents Card */}
          <div className="card">
            <div className="section-title">Recent Incidents</div>

            {incidents?.length ? (
              <div>
                {incidents.map((incident) => (
                  <div key={incident.id} className="incident-row">
                    <div>
                      <div className="incident-time-label">Started</div>
                      <div className="incident-time-value">
                        {new Date(incident.started_at).toLocaleString([], {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="incident-time-label">Resolved</div>
                      <div className="incident-time-value">
                        {incident.resolved_at
                          ? new Date(incident.resolved_at).toLocaleString([], {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })
                          : '—'}
                      </div>
                    </div>
                    <div className={`incident-badge ${incident.resolved_at ? 'resolved' : 'open'}`}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {incident.resolved_at ? 'Resolved' : 'Open'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✦</div>
                No incidents recorded
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}