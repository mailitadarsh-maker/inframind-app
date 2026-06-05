'use client';

import { useEffect, useRef, useState } from 'react';

const freePlan = [
  'Website monitoring',
  'API monitoring',
  'SSL monitoring',
  'Email alerts',
  'Incident tracking',
  'Public status pages',
];

const comingSoon = [
  'AI incident analysis',
  'Team workspaces',
  'Slack alerts',
  'Custom branding',
];

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="pricing" ref={ref} className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <p className="section-subtitle mb-3">Pricing</p>
          <h2 className="section-title text-text">
            Pay only for{' '}
            <em className="text-green not-italic">what you use.</em>
          </h2>
          <p className="text-text-2 text-sm mt-3">
            No subscriptions. No per-seat fees. Pay only when InfraMind does something.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free card */}
          <div
            className="relative rounded-2xl border-2 border-green/30 bg-[#0d1117] p-8 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(28px)',
              transitionDelay: '0.15s',
              transitionDuration: '0.6s',
              boxShadow: '0 0 60px rgba(29,219,120,0.06)',
            }}
          >
            {/* Glow top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green/40 to-transparent" />

            {/* Badge */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green text-[#07090d] text-[10px] font-bold px-4 py-1 rounded-full tracking-widest uppercase"
              style={{ animation: 'pulseBadge 2.5s ease-in-out infinite' }}
            >
              Most Popular
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-green uppercase tracking-widest mb-3">Free ✓</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-serif text-5xl text-text leading-none">₹0</span>
              </div>
              <p className="text-text-2 text-xs mt-1">while in beta</p>
            </div>

            <a
              href="/dashboard"
              className="btn btn-primary btn-lg w-full justify-center mb-7 relative overflow-hidden group"
            >
              <span className="relative z-10">Start Free →</span>
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
            </a>

            <ul className="space-y-3">
              {freePlan.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-text-2">
                  <span className="text-green text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Coming soon */}
          <div
            className="relative rounded-2xl border border-white/[0.07] bg-[#0d1117] p-8 hover:-translate-y-1.5 transition-all duration-300"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(28px)',
              transitionDelay: '0.28s',
              transitionDuration: '0.6s',
            }}
          >
            <div className="mb-6">
              <p className="text-xs font-semibold text-text-2 uppercase tracking-widest mb-3">Coming soon</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-serif text-5xl text-text-2 leading-none">—</span>
              </div>
              <p className="text-text-2 text-xs mt-1">future plans</p>
            </div>

            <button className="btn btn-ghost btn-lg w-full justify-center mb-7">
              Join Waitlist →
            </button>

            <ul className="space-y-3">
              {comingSoon.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-text-2/60">
                  <span className="text-text-2/40 text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseBadge { 0%,100%{box-shadow:0 0 0 0 rgba(29,219,120,0.3)} 50%{box-shadow:0 0 0 6px rgba(29,219,120,0)} }
      `}</style>
    </section>
  );
}