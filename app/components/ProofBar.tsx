"use client";

export default function ProofBar() {
  const stats = [
    { value: "99.9%",        label: "uptime tracked" },
    { value: "<30s",         label: "alert latency" },
    { value: "Asko",         label: "plain-english diagnosis" },
    { value: "1-click",      label: "blog publishing" },
    { value: "Multi-client", label: "from one dashboard" },
  ];

  return (
    <>
      <style>{`
        .proofbar-wrap {
          background: #1e1f26;
          border-top: 1px solid #3a3b44;
          border-bottom: 1px solid #3a3b44;
          padding: 28px 24px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow: hidden;
        }
        .proofbar-value {
          font-size: 1.9rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
          line-height: 1;
          white-space: nowrap;
        }
        .proofbar-label {
          font-size: 0.72rem;
          color: #6b7280;
          font-family: "SF Mono", "Fira Code", "Courier New", monospace;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        /* Desktop */
        .proofbar-desktop {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .proofbar-desktop-item {
          flex: 1;
          text-align: center;
          padding: 0 16px;
        }
        .proofbar-mobile { display: none; }

        /* Mobile */
        @media (max-width: 640px) {
          .proofbar-wrap { padding: 20px 0; }
          .proofbar-desktop { display: none; }
          .proofbar-mobile {
            display: flex;
            width: max-content;
            animation: proofScroll 14s linear infinite;
          }
          .proofbar-mobile-item {
            flex: none;
            width: 150px;
            text-align: center;
            border-right: 1px solid #3a3b44;
            padding: 0 16px;
          }
          .proofbar-value { font-size: 1.3rem; }
          .proofbar-label { font-size: 0.65rem; }
          @keyframes proofScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        }
      `}</style>
      <div className="proofbar-wrap">
        {/* Desktop: static row */}
        <div className="proofbar-desktop">
          {stats.map((s, i) => (
            <div key={i} className="proofbar-desktop-item"
              style={{ borderRight: i < stats.length - 1 ? "1px solid #3a3b44" : "none" }}>
              <div className="proofbar-value">{s.value}</div>
              <div className="proofbar-label">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Mobile: auto-scrolling ticker */}
        <div className="proofbar-mobile">
          {[...stats, ...stats].map((s, i) => (
            <div key={i} className="proofbar-mobile-item">
              <div className="proofbar-value">{s.value}</div>
              <div className="proofbar-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
