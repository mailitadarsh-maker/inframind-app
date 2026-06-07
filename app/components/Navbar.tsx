'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07090d]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-[7px] bg-green flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(29,219,120,0.5)] group-hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="12 3 5.5 10 2 6.5" stroke="#07090d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-sans font-semibold text-[15px] text-text">InfraMind</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {['How it works', 'Features', 'Pricing'].map((link) => (
            <Link
              key={link}
              href={`/#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-text-2 text-sm hover:text-text transition-colors duration-200 relative group"
            >
              {link}
              <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-green scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost text-sm">Log in</Link>
          {/* UPDATED: Changed href from /dashboard to /signup */}
          <Link href="/signup" className="btn btn-primary text-sm">
            Start free <span className="ml-0.5">→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}