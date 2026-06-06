'use client';

const stats = [
  { icon: '🛡', num: '99.9%', label: 'avg uptime' },
  { icon: '⚡', num: '3 minutes', label: 'to connect' },
  { icon: '✦', num: 'AI reports', label: 'in plain English' },
];

export default function ProofBar() {
  return (
    <div className="border-y border-white/[0.05] bg-[#0d1117] w-full">
      {/* flex-col: Stacks items vertically on mobile (Default)
         md:flex-row: Stacks items horizontally on desktop (Preserves your original look)
      */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 animate-fade-up"
            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
          >
            <span className="text-base">{s.icon}</span>
            <span className="text-sm font-semibold text-green">{s.num}</span>
            <span className="text-xs text-text-2">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}