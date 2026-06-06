'use client'; 

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          id,
          started_at,
          resolved_at,
          duration_seconds,
          monitors!incidents_monitor_id_fkey (
            name
          )
        `)
        .order('started_at', { ascending: false });

      if (error) {
        console.error("SUPABASE ERROR FULL:", JSON.stringify(error, null, 2));
        return;
      }
      if (data) setIncidents(data);
    };
    fetchData();
  }, []);

  // Filter for ongoing issues
  const activeIncidents = incidents.filter(inc => !inc.resolved_at);

  return (
    <div className="min-h-screen bg-[#07090d] text-[#eef1f6] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-2xl mb-2">Incident History</h1>
        <p className="text-sm text-[#8a95a3] mb-8">View the status and resolution timeline of all recorded incidents.</p>

        {/* New: Active Incident Banner */}
        {activeIncidents.length > 0 && (
          <div className="mb-8 p-5 bg-red-500/[0.05] border border-red-500/[0.2] rounded-xl flex items-center gap-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div className="text-sm">
              <span className="font-semibold text-red-500">Active Issues: </span>
              {activeIncidents.map(inc => inc.monitors?.name).join(', ')} are currently experiencing downtime.
            </div>
          </div>
        )}

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
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-sm font-medium">{incident.monitors?.name || 'Unknown Monitor'}</td>
                    <td className="p-5 text-sm text-[#8a95a3] font-mono">{new Date(incident.started_at).toLocaleString()}</td>
                    <td className="p-5 text-sm text-[#8a95a3] font-mono">{incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : '-'}</td>
                    <td className="p-5 text-sm text-[#8a95a3]">{formatDuration(incident.duration_seconds)}</td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${incident.resolved_at 
                        ? 'bg-[#1ddb78]/[0.08] border-[#1ddb78]/[0.2] text-[#1ddb78]' 
                        : 'bg-red-500/[0.08] border-red-500/[0.2] text-red-500 animate-pulse'}`}>
                        {incident.resolved_at ? 'Resolved' : '● Open Issue'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-[#8a95a3] text-sm">No incidents recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}