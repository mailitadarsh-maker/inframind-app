// components/AIDiagnosisBox.tsx
// Drop-in component — use in both dashboard and incidents page

import React from 'react';

const sevStyle: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: '#f87171', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.22)' },
  high:     { text: '#fb923c', bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.22)' },
  medium:   { text: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.22)' },
  low:      { text: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.22)' },
};

interface Props {
  ai_cause?: string;
  ai_action?: string;
  ai_severity?: string;
}

export default function AIDiagnosisBox({ ai_cause, ai_action, ai_severity }: Props) {
  if (!ai_cause && !ai_action) return null;

  const sev = ai_severity?.toLowerCase() ?? 'high';
  const ss = sevStyle[sev] ?? sevStyle.high;

  // Parse numbered steps from action string
  const steps = ai_action
    ? ai_action
        .split(/\n/)
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div style={{
      marginTop: 10,
      borderRadius: 10,
      background: ss.bg,
      border: `1px solid ${ss.border}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '8px 12px',
        borderBottom: `1px solid ${ss.border}`,
        background: `rgba(0,0,0,0.15)`,
      }}>
        <span style={{ fontSize: 12 }}>🤖</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: ss.text }}>
          AI ROOT CAUSE ANALYSIS
        </span>
        {ai_severity && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '0.08em',
            padding: '2px 8px',
            borderRadius: 99,
            border: `1px solid ${ss.border}`,
            color: ss.text,
            background: 'rgba(0,0,0,0.2)',
          }}>
            {ai_severity.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ padding: '10px 12px' }}>
        {/* Cause */}
        {ai_cause && (
          <div style={{ marginBottom: steps.length ? 10 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ss.text, letterSpacing: '0.06em', marginBottom: 4 }}>
              WHY IT HAPPENED
            </div>
            <div style={{ fontSize: 12, color: '#eef1f6', lineHeight: 1.6 }}>
              {ai_cause}
            </div>
          </div>
        )}

        {/* Action Steps */}
        {steps.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: ss.text, letterSpacing: '0.06em', marginBottom: 6 }}>
              WHAT TO DO NOW
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {steps.map((step, i) => {
                // Strip leading "1." "2." etc if present
                const clean = step.replace(/^\d+\.\s*/, '');
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{
                      flexShrink: 0,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: ss.border,
                      color: ss.text,
                      fontSize: 9,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.55 }}>{clean}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}