'use client';

import Link from 'next/link';

export default function Navbar() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-[5%] border-b border-white/[0.05] bg-[#07090d]/95 backdrop-blur-[16px] flex items-center justify-between h-14">
      {/* Logo */}
      <Link href="#" className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-[#1ddb78] rounded-[7px] flex items-center justify-center">
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
            <path d="M2 7L6 11L12 3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-base font-semibold tracking-[-0.3px]">InfraMind</span>
      </Link>

      {/* Links */}
      <div className="flex gap-7">
        <button
          onClick={() => scrollTo('how')}
          className="text-sm text-[#8a95a3] cursor-pointer hover:text-[#eef1f6] transition-colors"
        >
          How it works
        </button>
        <button
          onClick={() => scrollTo('features')}
          className="text-sm text-[#8a95a3] cursor-pointer hover:text-[#eef1f6] transition-colors"
        >
          Features
        </button>
        <button
          onClick={() => scrollTo('pricing')}
          className="text-sm text-[#8a95a3] cursor-pointer hover:text-[#eef1f6] transition-colors"
        >
          Pricing
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-2.5">
        <Link href="/login" className="btn btn-ghost">
          Log in
        </Link>
        <Link href="/signup" className="btn btn-primary">
          Start free →
        </Link>
      </div>
    </nav>
  );
}
