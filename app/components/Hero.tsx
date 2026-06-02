'use client';

import Link from 'next/link';

export default function Hero() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center pt-[100px] pb-20 px-[5%] relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)',
        }}
      />

      {/* Glow */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-r from-[#1ddb7818] to-transparent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Beta badge */}
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1ddb7828] bg-[#1ddb7810] text-sm text-[#1ddb78] font-medium mb-7 animate-fade-up"
        style={{ animationDelay: '0s' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#1ddb78] animate-blink" />
        Now in beta — free to start
      </div>

      {/* Title */}
      <h1
        className="font-serif text-5xl md:text-6xl lg:text-[70px] leading-[1.08] tracking-[-1.5px] mb-6 max-w-3xl animate-fade-up"
        style={{ animationDelay: '0.1s' }}
      >
        Your apps, <em className="text-[#1ddb78] italic not-italic">always running.</em>
        <br />
        Without a full-time developer.
      </h1>

      {/* Subtitle */}
      <p
        className="text-base md:text-lg text-[#8a95a3] max-w-2xl leading-relaxed mb-9 animate-fade-up"
        style={{ animationDelay: '0.2s' }}
      >
        InfraMind monitors your apps, scans for problems, and explains everything in plain English — so you never get
        surprised by downtime again.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-3 justify-center flex-wrap animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Link href="/signup" className="btn btn-primary btn-lg">
          Get started free →
        </Link>
        <button onClick={() => scrollTo('how')} className="btn btn-ghost btn-lg">
          See how it works
        </button>
      </div>
    </section>
  );
}
