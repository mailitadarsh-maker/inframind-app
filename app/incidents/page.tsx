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
    .select('id,name');

  const monitorMap = Object.fromEntries(
    (monitors || []).map((m) => [m.id, m.name])
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Incident History
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3 text-left">Monitor</th>
              <th className="p-3 text-left">Started</th>
              <th className="p-3 text-left">Resolved</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {incidents?.map((incident) => (
              <tr
                key={incident.id}
                className="border-b border-gray-800"
              >
                <td className="p-3">
                  {monitorMap[incident.monitor_id] || 'Unknown'}
                </td>

                <td className="p-3">
                  {new Date(
                    incident.started_at
                  ).toUTCString()}
                </td>

                <td className="p-3">
                  {incident.resolved_at
                    ? new Date(
                        incident.resolved_at
                      ).toUTCString()
                    : '-'}
                </td>

                <td className="p-3">
                  {formatDuration(
                    incident.duration_seconds
                  )}
                </td>

                <td className="p-3">
                  {incident.resolved_at ? (
                    <span className="text-green-500">
                      Resolved
                    </span>
                  ) : (
                    <span className="text-red-500">
                      Open
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}