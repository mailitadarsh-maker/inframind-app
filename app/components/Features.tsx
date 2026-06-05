'use client';

import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" style={{ opacity: 0.4 }} /><circle cx="12" cy="12" r="12" style={{ opacity: 0.15 }} />
      </svg>
    ),
    iconBg: 'bg-green-bg border-green-border text-green',
    title: 'Live uptime monitoring',
    desc: 'Monitor websites and APIs with automatic health checks and real-time status updates around the clock.',
    accent: 'group-hover:border-green/25',
    bar: 'from-green/0 via-green/20 to-green/0',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    iconBg: 'bg-purple-bg border-purple-border text-purple',
    title: 'Incident tracking',
    desc: 'Automatically record outages, recovery times, and downtime duration for every monitor you add.',
    accent: 'group-hover:border-purple/25',
    bar: 'from-purple/0 via-purple/20 to-purple/0',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    iconBg: 'bg-blue-bg border-blue-border text-blue',
    title: 'SSL certificate monitoring',
    desc: 'Track SSL expiry dates and receive renewal warnings before certificates expire and break your site.',
    accent: 'group-hover:border-blue/25',
    bar: 'from-blue/0 via-blue/20 to-blue/0',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    iconBg: 'bg-yellow-bg border-yellow-border text-yellow',
    title: 'Public status pages',
    desc: 'Share real-time service health and incident history with your customers and internal teams.',
    accent: 'group-hover:border-yellow/25',
    bar: 'from-yellow/0 via-yellow/20 to-yellow/0',
  },
];

export default function Features() {
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
    <section id="features" ref={ref} className="py-28 px-6 bg-[#0a0d12]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <p className="section-subtitle mb-3">Features</p>
          <h2 className="section-title text-text">
            Everything to keep your apps{' '}
            <em className="text-green not-italic">healthy</em>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className={`relative p-7 rounded-xl border border-white/[0.06] bg-[#0d1117] ${f.accent} transition-all duration-300 group overflow-hidden hover:-translate-y-1`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : `translateY(${i < 2 ? '-20px' : '20px'})`,
                transitionDelay: `${0.1 + i * 0.1}s`,
                transitionDuration: '0.6s',
              }}
            >
              {/* Bottom sweep line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${f.bar} scale-x-0 group-hover:scale-x-100 transition-transform duration-400`}
              />

              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border ${f.iconBg} mb-6`}>
                {f.icon}
              </div>

              <h3 className="font-sans font-semibold text-text text-[15px] mb-2.5">{f.title}</h3>
              <p className="text-text-2 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}