export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#22252c] px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[6px] bg-green flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <polyline points="12 3 5.5 10 2 6.5" stroke="#07090d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-sans font-semibold text-sm text-text">InfraMind</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-text-2">
          {['Privacy', 'Terms', 'Contact'].map((l) => (
            <a key={l} href={`/${l.toLowerCase()}`} className="hover:text-text transition-colors duration-200">
              {l}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 9.63a19.75 19.75 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <a href="tel:+919633474645" className="text-green font-semibold text-sm hover:text-green/80 transition-colors">
              +91 9633474645
            </a>
          </div>
          <p className="text-text-2 text-xs">© 2026 InfraMind · Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}