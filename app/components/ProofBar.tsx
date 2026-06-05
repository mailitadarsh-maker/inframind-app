'use client';

const stats = [
  { icon: '🛡', num: '99.9%', label: 'avg uptime' },
  { icon: '⚡', num: '3 minutes', label: 'to connect' },
  { icon: '✦', num: 'AI reports', label: 'in plain English' },
];

export default function ProofBar() {
  return (
    <div className="border-y border-white/[0.05] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-6 flex items-center divide-x divide-white/[0.05]">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 group"
            style={{ animation: `fadeUp 0.5s ${0.1 + i * 0.1}s ease both`, opacity: 0 }}
          >
            <span className="text-base">{s.icon}</span>
            <span className="text-sm font-semibold text-green transition-all duration-200 group-hover:text-opacity-80">{s.num}</span>
            <span className="text-xs text-text-2">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}