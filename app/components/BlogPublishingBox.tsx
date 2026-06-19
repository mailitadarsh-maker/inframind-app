"use client";

import { useEffect, useState } from "react";

const TITLE = "10 Ways to Reduce API Latency in 2026";
const LINES = [
  "Cache responses at the edge",
  "Trim unused middleware",
  "Use HTTP/2 + connection pooling",
];

const TICK_MS = 35; // ms per character
const LINE_PAUSE_TICKS = 10; // pause between lines, in ticks
const HOLD_AFTER_DONE_TICKS = 65; // hold finished card before restart, in ticks

export default function BlogPublishingBox() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  // Work out, from the raw tick count, how many characters of each
  // segment should be visible right now. Derived state — no chained
  // timeouts, so nothing can get stuck mid-animation.
  let remaining = tick;

  const titleCount = Math.min(remaining, TITLE.length);
  remaining = Math.max(0, remaining - TITLE.length - LINE_PAUSE_TICKS);

  const lineCounts: number[] = [];
  LINES.forEach((line) => {
    const count = Math.min(remaining, line.length);
    lineCounts.push(count);
    remaining = Math.max(0, remaining - line.length - LINE_PAUSE_TICKS);
  });

  const showSeo = remaining > 2;
  const showPublished = remaining > 10;
  const totalTicks =
    TITLE.length +
    LINE_PAUSE_TICKS +
    LINES.reduce((sum, l) => sum + l.length + LINE_PAUSE_TICKS, 0) +
    HOLD_AFTER_DONE_TICKS;

  // loop back to the start once the whole sequence has finished
  useEffect(() => {
    if (tick > totalTicks) {
      setTick(0);
    }
  }, [tick, totalTicks]);

  const titleText = TITLE.slice(0, titleCount);
  const titleDone = titleCount === TITLE.length;

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          background: "#222330",
          border: "1px solid #3a3b44",
          borderRadius: "10px",
          padding: "18px 20px",
          minHeight: "168px",
        }}
      >
        {/* Status row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "#a78bfa",
            marginBottom: "10px",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }} />
          {showPublished ? "POST PUBLISHED TO YOUR BLOG" : "AI WRITING NEW POST…"}
        </div>

        {/* Title — typewriter */}
        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f0f0f0", marginBottom: "10px", minHeight: "1.3em" }}>
          {titleText}
          {!titleDone && <Cursor />}
        </div>

        {/* Outline lines — typewriter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
          {LINES.map((line, i) => {
            const count = lineCounts[i];
            const text = line.slice(0, count);
            const lineActive = count > 0 && count < line.length;
            return (
              <div
                key={line}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.82rem",
                  color: "#9a9ba8",
                  minHeight: "1.2em",
                }}
              >
                {count > 0 && (
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", flexShrink: 0 }} />
                )}
                {text}
                {lineActive && <Cursor />}
              </div>
            );
          })}
        </div>

        {/* SEO + Published badges */}
        <div style={{ display: "flex", gap: "8px" }}>
          <Badge show={showSeo} color="#a78bfa" bg="rgba(167,139,250,0.15)" label="SEO OPTIMIZED" />
          <Badge show={showPublished} color="#4ade80" bg="rgba(74,222,128,0.15)" label="PUBLISHED" dot />
        </div>
      </div>
    </div>
  );
}

function Cursor() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "2px",
        height: "0.9em",
        background: "#a78bfa",
        marginLeft: "2px",
        animation: "blogCursorBlink 0.8s step-end infinite",
      }}
    >
      <style>{`@keyframes blogCursorBlink { 50% { opacity: 0; } }`}</style>
    </span>
  );
}

function Badge({ show, color, bg, label, dot }: { show: boolean; color: string; bg: string; label: string; dot?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "3px 10px",
        borderRadius: "6px",
        background: bg,
        color,
        opacity: show ? 1 : 0,
        transform: show ? "scale(1)" : "scale(0.9)",
        transition: "opacity 0.3s, transform 0.3s",
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />}
      {label}
    </div>
  );
}
