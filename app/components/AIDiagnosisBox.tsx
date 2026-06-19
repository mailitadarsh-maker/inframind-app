"use client";

import { useEffect, useState, useRef } from "react";

const FULL_TEXT = "Payment gateway latency spiked to 891ms at 14:32 UTC. Root cause: upstream DNS resolution delay from your payment provider's CDN edge node. ";
const HIGHLIGHT_TEXT = "Recommended: Switch DNS resolver to 1.1.1.1 and contact Stripe support about their SGP-1 edge incident.";
const ALL_TEXT = FULL_TEXT + HIGHLIGHT_TEXT;

export default function AIDiagnosisBox() {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Start typing when box scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!started) return;
    if (displayed.length >= ALL_TEXT.length) return;
    const timeout = setTimeout(() => {
      setDisplayed(ALL_TEXT.slice(0, displayed.length + 1));
    }, 18);
    return () => clearTimeout(timeout);
  }, [started, displayed]);

  const normalPart = displayed.slice(0, Math.min(displayed.length, FULL_TEXT.length));
  const highlightPart = displayed.length > FULL_TEXT.length
    ? displayed.slice(FULL_TEXT.length)
    : "";
  const isDone = displayed.length >= ALL_TEXT.length;

  return (
    <div
      ref={boxRef}
      style={{
        margin: "8px 12px 12px",
        background: "#1c2218",
        border: "1px solid rgba(74,222,128,0.2)",
        borderRadius: "10px",
        padding: "16px 18px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#4ade80",
            fontFamily: "monospace",
          }}
        >
          ✦ AI DIAGNOSIS
        </span>
        {/* Animated thinking dots while typing */}
        {!isDone && (
          <span style={{ display: "flex", gap: "3px", alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                  opacity: 0.7,
                }}
              />
            ))}
          </span>
        )}
      </div>

      {/* Typed text */}
      <div
        style={{
          fontSize: "0.82rem",
          color: "#9a9ba8",
          lineHeight: 1.6,
          fontFamily: "monospace",
          minHeight: "80px",
        }}
      >
        <span>{normalPart}</span>
        {highlightPart && (
          <span style={{ color: "#4ade80" }}>{highlightPart}</span>
        )}
        {/* Blinking cursor */}
        {!isDone && (
          <span
            style={{
              display: "inline-block",
              width: "2px",
              height: "14px",
              background: "#4ade80",
              marginLeft: "2px",
              verticalAlign: "middle",
              animation: "blink 0.7s step-end infinite",
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
