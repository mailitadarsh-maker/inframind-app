"use client";

import { useState, useEffect } from "react";
import AIDiagnosisBox from "./AIDiagnosisBox";
import BlogPublishingBox from "./BlogPublishingBox";

const askoGradient = {
  backgroundImage: "linear-gradient(90deg, #4ade80 0%, #a78bfa 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
  backgroundClip: "text" as const,
  fontWeight: 800,
};

export default function Hero() {
  const [activeTab, setActiveTab] = useState<"monitoring" | "blog">("monitoring");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((t) => (t === "monitoring" ? "blog" : "monitoring"));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{
        background: "#23242a",
        backgroundImage:
          "linear-gradient(rgba(74,222,128,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#f0f0f0",
        paddingBottom: "80px",
      }}
    >
      {/* BADGE */}
      <div style={{ textAlign: "center", paddingTop: "56px", marginBottom: "24px" }}>
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)",
            borderRadius: "999px", padding: "6px 16px", fontSize: "0.8rem", color: "#9a9ba8",
          }}
        >
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", display: "inline-block" }} />
          Now live ·{" "}
          <a href="https://inframindhq.online" style={{ color: "#4ade80", textDecoration: "none", fontWeight: 500 }}>
            inframindhq.online
          </a>
        </span>
      </div>

      {/* HEADLINE */}
      <div style={{ textAlign: "center", padding: "0 24px", marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "clamp(2.1rem, 8vw, 3.75rem)", fontWeight: 900, lineHeight: 1.08,
            letterSpacing: "-0.03em", margin: "0 auto", maxWidth: "900px",
            
          }}
        >
          Monitor Everything.
          <br />
          <span style={{ color: "#4ade80" }}>Fix it before</span> customers notice.
        </h1>
      </div>

      {/* SUBTEXT */}
      <div style={{ textAlign: "center", padding: "0 24px", marginBottom: "32px" }}>
        <p style={{ fontSize: "1.05rem", color: "#9a9ba8", lineHeight: 1.65, maxWidth: "520px", margin: "0 auto" }}>
          <span style={askoGradient}>Asko</span> watches your uptime, SSL, and APIs 24/7 — then explains exactly what broke and how to fix it, in plain English.
        </p>
      </div>

      {/* TAB SWITCHER */}
      <div style={{ textAlign: "center", marginBottom: "44px" }}>
        <p style={{ fontSize: "0.78rem", color: "#6b7280", marginBottom: "12px", letterSpacing: "0.02em" }}>
          Two AI agents, one dashboard
        </p>
        <div style={{ display: "inline-flex", background: "#2d2e35", border: "1px solid #3a3b44", borderRadius: "12px", padding: "5px", gap: "4px" }}>
          <button
            onClick={() => setActiveTab("monitoring")}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 22px",
              borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600,
              background: activeTab === "monitoring" ? "#3fcf6e" : "transparent",
              color: activeTab === "monitoring" ? "#0d1a0d" : "#9a9ba8", transition: "all 0.2s",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            Asko Watch
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 22px",
              borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600,
              background: activeTab === "blog" ? "#3fcf6e" : "transparent",
              color: activeTab === "blog" ? "#0d1a0d" : "#9a9ba8", transition: "all 0.2s",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
            Asko Write
          </button>
        </div>
      </div>

      {/* DASHBOARD MOCK */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ background: "#1a1b22", border: "1px solid #3a3b44", borderRadius: "14px", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
          {/* Window bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ padding: "12px 18px", background: "#222330", borderBottom: "1px solid #3a3b44" }}>
            <div className="flex items-center gap-2">
              <div style={{ display: "flex", gap: "7px" }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <span key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
              </div>
              <span className="sm:hidden" style={{ fontSize: "0.72rem", color: "#9a9ba8", fontFamily: "monospace" }}>dashboard</span>
            </div>
            <span className="hidden sm:inline" style={{ fontSize: "0.78rem", color: "#9a9ba8", fontFamily: "monospace" }}>inframindhq.online — dashboard</span>
            <span style={{ fontSize: "0.75rem", color: "#4ade80", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", display: "inline-block", flexShrink: 0 }} />
              {activeTab === "monitoring" ? (
                <><span style={askoGradient}>Asko</span>&nbsp;is watching 3 services</>
              ) : (
                <><span style={askoGradient}>Asko</span>&nbsp;is writing...</>
              )}
            </span>
          </div>

          {activeTab === "monitoring" && (
          <>
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { name: "Production API",  url: "api.myapp.com/health", ms: "142 ms", status: "UP",   color: "#4ade80", slow: false },
              { name: "Main Website",    url: "myapp.com",            ms: "68 ms",  status: "UP",   color: "#4ade80", slow: false },
              { name: "Payment Gateway", url: "payments.myapp.com",   ms: "891 ms", status: "SLOW", color: "#f5c542", slow: true  },
            ].map((m) => (
              <div key={m.name} className="flex-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", background: "#222330", border: "1px solid #3a3b44", borderRadius: "10px", padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: m.color, boxShadow: `0 0 6px ${m.color}`, display: "inline-block", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f0f0f0" }}>{m.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#9a9ba8", fontFamily: "monospace" }}>{m.url}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, marginLeft: "auto" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: m.color, whiteSpace: "nowrap" }}>{m.ms}</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", letterSpacing: "0.05em", background: m.slow ? "rgba(245,197,66,0.15)" : "rgba(74,222,128,0.15)", color: m.color, whiteSpace: "nowrap" }}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Diagnosis — animated typewriter */}
          <AIDiagnosisBox />
          </>
          )}

          {activeTab === "blog" && <BlogPublishingBox />}
        </div>
      </div>

      {/* BOTTOM CTAs */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", paddingTop: "48px", flexWrap: "wrap" }}>
        <a href="/signup" style={{ background: "#3fcf6e", color: "#0d1a0d", fontWeight: 700, fontSize: "0.95rem", padding: "13px 28px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          Start monitoring free →
        </a>
        {activeTab === "blog" ? (
          <a href="/signup" style={{ background: "#a78bfa", color: "#1a1330", fontWeight: 700, fontSize: "0.95rem", padding: "13px 28px", borderRadius: "10px", border: "1px solid #a78bfa", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            Start blog free →
          </a>
        ) : (
          <a href="#blog-service" style={{ background: "#2d2e35", color: "#f0f0f0", fontWeight: 600, fontSize: "0.95rem", padding: "13px 28px", borderRadius: "10px", border: "1px solid #3a3b44", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            See blog service
          </a>
        )}
      </div>
    </section>
  );
}
