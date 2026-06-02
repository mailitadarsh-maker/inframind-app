import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="px-[5%] py-6 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-3.5">
      {/* Logo */}
      <Link href="#" className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-[#1ddb78] rounded-[7px] flex items-center justify-center">
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
            <path d="M2 7L6 11L12 3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-[-0.3px]">InfraMind</span>
      </Link>

      {/* Links */}
      <div className="flex gap-5.5">
        <a href="#" className="text-xs text-[#3d4f63]">
          Privacy
        </a>
        <a href="#" className="text-xs text-[#3d4f63]">
          Terms
        </a>
        <a href="#" className="text-xs text-[#3d4f63]">
          Contact
        </a>
      </div>

      {/* Copyright */}
      <div className="text-xs text-[#3d4f63]">© 2026 InfraMind · Made in India 🇮🇳</div>
    </footer>
  );
}
