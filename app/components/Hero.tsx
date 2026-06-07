'use client';

import { useEffect, useRef, useState } from 'react';

const monitors = [
  { name: 'api.myapp.com', meta: 'Checked {t}s ago · 142ms', uptime: 99, status: 'up' },
  { name: 'dashboard.myapp.com', meta: 'Checked 1m ago · 89ms', uptime: 100, status: 'up' },
  { name: 'payments.myapp.com', meta: 'SSL expires in 14 days', uptime: 60, status: 'warn' },
];

export default function Hero() {
  const [tick, setTick] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t % 59) + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Animated grid */}
      <div
        ref={gridRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          animation: 'gridDrift 12s linear infinite',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 80%)',
        }}
      />

      {/* Glow blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(29,219,120,0.07) 0%, transparent 70%)',
          animation: 'breathe 5s ease-in-out infinite',
        }}
      />

      {/* Orbit rings */}
      <div className="absolute pointer-events-none" style={{ width: 560, height: 560, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        {[280, 380, 480].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-green/[0.05]"
            style={{
              width: size,
              height: size,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `orbitSpin ${10 + i * 5}s linear infinite ${i % 2 === 1 ? 'reverse' : ''}`,
            }}
          >
            <div
              className="absolute w-1.5 h-1.5 rounded-full bg-green"
              style={{ top: -3, left: '50%', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(29,219,120,0.8)' }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-border bg-green-bg text-green text-xs font-medium mb-8"
          style={{ animation: 'fadeUp 0.5s 0.1s ease both', opacity: 0 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-blink" />
          Now in beta — free to start
        </div>

        {/* Headline */}
        <h1
          className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-1px] mb-5"
          style={{ animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0 }}
        >
          Your apps,{' '}
          <em className="text-green not-italic" style={{ animation: 'textPulse 3s ease-in-out infinite' }}>
            always running.
          </em>
          <br />
          Without a full-time dev.
        </h1>

        {/* Subtext */}
        <p
          className="text-text-2 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-light"
          style={{ animation: 'fadeUp 0.6s 0.35s ease both', opacity: 0 }}
        >
          InfraMind monitors your apps, scans for problems, and explains everything in plain English — so you never get surprised by downtime again.
        </p>

        {/* Buttons */}
        <div
          className="flex items-center justify-center gap-3 mb-14"
          style={{ animation: 'fadeUp 0.6s 0.5s ease both', opacity: 0 }}
        >
          {/* UPDATED: Changed href to /signup */}
          <a
            href="/signup"
            className="btn btn-primary btn-lg relative overflow-hidden group"
          >
            <span className="relative z-10">Get started free →</span>
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
          </a>
          <a href="#how-it-works" className="btn btn-ghost btn-lg">
            See how it works
          </a>
        </div>

        {/* Dashboard preview */}
        <div
          className="relative rounded-xl border border-white/[0.07] bg-[#0d1117] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          style={{ animation: 'fadeUp 0.7s 0.65s ease both', opacity: 0 }}
        >
          {/* Scan beam */}
          <div
            className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-xl"
            style={{ background: 'transparent' }}
          >
            <div
              className="absolute top-0 bottom-0 w-16"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(29,219,120,0.05), transparent)',
                animation: 'scanBeam 3.5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Window bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#131920] border-b border-white/[0.05]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            <span className="ml-3 text-xs text-text-2 font-mono">InfraMind Dashboard — live monitors</span>
          </div>

          {/* Monitor rows */}
          <div className="p-4 space-y-2.5">
            {monitors.map((m, i) => (
              <div
                key={m.name}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#131920] border border-white/[0.05] hover:border-white/[0.1] hover:translate-x-1 transition-all duration-200 group"
                style={{ animation: `slideInLeft 0.4s ${0.7 + i * 0.12}s ease both`, opacity: 0 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text mb-0.5">{m.name}</div>
                  <div className="text-xs text-text-2">
                    {i === 0 ? `Checked ${tick}s ago · 142ms` : m.meta}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-0.5 rounded-full bg-white/[0.06] overflow-hidden w-32">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${m.uptime}%`,
                        background: m.status === 'warn' ? '#f5c542' : '#1ddb78',
                        animation: `progressIn 1.2s ${0.9 + i * 0.12}s ease both`,
                        transformOrigin: 'left',
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ml-4 ${
                    m.status === 'up'
                      ? 'bg-green-bg border border-green-border text-green'
                      : 'bg-yellow-bg border border-yellow-border text-yellow'
                  }`}
                  style={{ animation: `statusPop 0.4s ${0.85 + i * 0.12}s ease both`, opacity: 0 }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${m.status === 'up' ? 'bg-green animate-blink' : 'bg-yellow'}`}
                  />
                  {m.status === 'up' ? 'Operational' : 'Warning'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gridDrift { from { background-position: 0 0; } to { background-position: 48px 48px; } }
        @keyframes breathe { 0%,100%{transform:translateX(-50%) scale(1);opacity:0.6} 50%{transform:translateX(-50%) scale(1.3);opacity:1} }
        @keyframes orbitSpin { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes textPulse { 0%,100%{text-shadow:0 0 20px rgba(29,219,120,0.2)} 50%{text-shadow:0 0 40px rgba(29,219,120,0.5)} }
        @keyframes scanBeam { 0%{left:-80px} 100%{left:110%} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes statusPop { 0%{opacity:0;transform:scale(0.8)} 60%{transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
        @keyframes progressIn { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>
    </section>
  );
}