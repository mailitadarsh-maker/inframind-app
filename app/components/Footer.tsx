import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 mt-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1ddb78] rounded-md flex items-center justify-center">
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <path 
                d="M2 7L6 11L12 3" 
                stroke="#000" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            InfraMind
          </span>
        </Link>

        {/* Middle: Standard Links */}
        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>

        {/* Right: Contact & Copyright */}
        <div className="flex flex-col items-center md:items-end text-sm text-zinc-400 gap-1.5">
          <a
            href="tel:+919633474645"
            className="hover:text-white transition flex items-center gap-1.5"
          >
            <span>📞</span> +91 9633474645
          </a>
          <p>© 2026 InfraMind. Made in India 🇮🇳</p>
        </div>

      </div>
    </footer>
  );
}