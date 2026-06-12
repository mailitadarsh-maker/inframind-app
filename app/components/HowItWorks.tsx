'use client';

import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    num: '01',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    iconBg: 'bg-green-bg border-green-border text-green',
    title: 'Connect your app',
    desc: 'Enter a website URL, API endpoint or SSL certificate to monitor. Setup takes under 3 minutes.',
  },
  {
    num: '02',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" /><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
      </svg>
    ),
    iconBg: 'bg-blue-bg border-blue-border text-blue',
    title: 'InfraMind checks availability',
    desc: 'Response times, SSL health, and uptime checked every few minutes — automatically, 24/7.',
  },
  {
    num: '03',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    iconBg: 'bg-yellow-bg border-yellow-border text-yellow',
    title: 'Get notified instantly',
    desc: 'Receive email alerts the moment services go down or recover. No more surprise downtime.',
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <p className="section-subtitle mb-3">How it works</p>
          <h2 className="section-title text-text">
            From zero to{' '}
            <em className="text-green not-italic">fully monitored</em>
            <br />in 3 steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-green/20 to-transparent" />

          {steps.map((s, i) => (
            <div
              key={i}
              className="relative p-7 rounded-xl border border-white/[0.06] bg-[#2b3039] hover:border-green/20 hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(28px)',
                transitionDelay: `${0.1 + i * 0.12}s`,
                transitionDuration: '0.6s',
              }}
            >
              {/* Top glow on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <span className="block font-mono text-5xl font-medium text-white/[0.05] leading-none mb-6 select-none">
                {s.num}
              </span>

              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border ${s.iconBg} mb-5`}
                style={{ animation: `float ${3 + i * 0.7}s ease-in-out infinite` }}
              >
                {s.icon}
              </div>

              <h3 className="font-sans font-semibold text-text text-[15px] mb-2.5">{s.title}</h3>
              <p className="text-text-2 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}</style>
    </section>
  );
}