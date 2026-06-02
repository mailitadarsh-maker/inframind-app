export default function ProofBar() {
  return (
    <div className="px-[5%] py-4.5 border-t border-b border-white/[0.05] bg-[#0d1117] flex items-center justify-center gap-8 flex-wrap">
      <div className="flex items-center gap-1.75 text-sm text-[#3d4f63]">
        🛡️ <strong className="text-[#8a95a3]">99.9%</strong> avg uptime
      </div>
      <div className="w-px h-4.5 bg-white/[0.1]" />
      <div className="flex items-center gap-1.75 text-sm text-[#3d4f63]">
        ⚡ <strong className="text-[#8a95a3]">3 minutes</strong> to connect
      </div>
      <div className="w-px h-4.5 bg-white/[0.1]" />
      <div className="flex items-center gap-1.75 text-sm text-[#3d4f63]">
        ✦ <strong className="text-[#8a95a3]">AI reports</strong> in plain English
      </div>
    </div>
  );
}
