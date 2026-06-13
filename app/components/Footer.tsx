export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#1a1c22] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-[6px] bg-green flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <polyline points="12 3 5.5 10 2 6.5" stroke="#07090d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-sans font-semibold text-sm text-text">InfraMind</span>
            </div>
            <p className="text-text-2 text-xs leading-relaxed">
              AI-powered uptime, API and SSL monitoring for growing teams — without a full-time dev.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-text text-xs font-semibold uppercase tracking-wide mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-text-2">
              <li><a href="/signup" className="hover:text-green transition-colors">Check if a website is down</a></li>
              <li><a href="/signup" className="hover:text-green transition-colors">API uptime monitoring</a></li>
              <li><a href="/signup" className="hover:text-green transition-colors">SSL certificate checker</a></li>
              <li><a href="/signup" className="hover:text-green transition-colors">Public status page</a></li>
              <li><a href="/#pricing" className="hover:text-green transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-text text-xs font-semibold uppercase tracking-wide mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-text-2">
              <li><a href="/blog" className="hover:text-green transition-colors">Blog</a></li>
              <li><a href="/#how-it-works" className="hover:text-green transition-colors">How it works</a></li>
              <li><a href="/#features" className="hover:text-green transition-colors">Features</a></li>
              <li><a href="/login" className="hover:text-green transition-colors">Log in</a></li>
              <li><a href="/signup" className="hover:text-green transition-colors">Start free</a></li>
              <li>
                <a href="https://www.linkedin.com/company/inframind" target="_blank" rel="noopener noreferrer" className="hover:text-green transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-text text-xs font-semibold uppercase tracking-wide mb-4">Legal &amp; Contact</h4>
            <ul className="space-y-2.5 text-xs text-text-2">
              <li><a href="/privacy" className="hover:text-green transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-green transition-colors">Terms of Service</a></li>
              <li><a href="/contact" className="hover:text-green transition-colors">Contact</a></li>
              <li>
                <a href="mailto:support@inframindhq.online" className="hover:text-green transition-colors">
                  support@inframindhq.online
                </a>
              </li>
              <li>
                <a href="tel:+919633474645" className="hover:text-green transition-colors">
                  +91 96334 74645
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-2 text-xs">© 2026 InfraMind · Made in India 🇮🇳</p>
          <p className="text-text-2 text-xs">Uptime monitoring, API monitoring &amp; SSL monitoring for modern teams.</p>
        </div>
      </div>
    </footer>
  );
}
