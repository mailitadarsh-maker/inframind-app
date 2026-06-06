import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatDuration(seconds: number | null) {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default async function IncidentsPage() {
  const { data: incidents } = await supabase
    .from('incidents')
    .select('*')
    .order('started_at', { ascending: false });

  const { data: monitors } = await supabase
    .from('monitors')
    .select('id, name');

  const monitorMap = Object.fromEntries(
    (monitors || []).map((m) => [m.id, m.name])
  );

  return (
    <div className="min-h-screen bg-[#07090d] text-[#eef1f6] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-2xl mb-2">Incident History</h1>
        <p className="text-sm text-[#8a95a3] mb-8">View the status and resolution timeline of all recorded incidents.</p>

        <div className="rounded-xl bg-[#0d1117] border border-white/[0.06] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] text-[#8a95a3] text-xs uppercase tracking-widest">
                <th className="p-5 font-semibold">Monitor</th>
                <th className="p-5 font-semibold">Started</th>
                <th className="p-5 font-semibold">Resolved</th>
                <th className="p-5 font-semibold">Duration</th>
                <th className="p-5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {incidents && incidents.length > 0 ? (
                incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-sm font-medium">{monitorMap[incident.monitor_id] || 'Unknown'}</td>
                    <td className="p-5 text-sm text-[#8a95a3] font-mono">
                      {new Date(incident.started_at).toLocaleString()}
                    </td>
                    <td className="p-5 text-sm text-[#8a95a3] font-mono">
                      {incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : '-'}
                    </td>
                    <td className="p-5 text-sm text-[#8a95a3]">{formatDuration(incident.duration_seconds)}</td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${incident.resolved_at 
                        ? 'bg-[#1ddb78]/[0.08] border-[#1ddb78]/[0.2] text-[#1ddb78]' 
                        : 'bg-red-500/[0.08] border-red-500/[0.2] text-red-500'}`}>
                        {incident.resolved_at ? 'Resolved' : 'Open'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-[#8a95a3] text-sm">
                    No incidents recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}