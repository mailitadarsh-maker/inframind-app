"use client";

export default function ProofBar() {
  const stats = [
    { value: "99.9%",        label: "uptime tracked" },
    { value: "<30s",         label: "alert latency" },
    { value: "AI",           label: "plain-english diagnosis" },
    { value: "1-click",      label: "blog publishing" },
    { value: "Multi-client", label: "from one dashboard" },
  ];

  return (
    <div
      style={{
        background: "#1e1f26",
        borderTop: "1px solid #3a3b44",
        borderBottom: "1px solid #3a3b44",
        padding: "36px 48px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              borderRight: i < stats.length - 1 ? "1px solid #3a3b44" : "none",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                fontSize: "1.9rem",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                marginBottom: "8px",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
