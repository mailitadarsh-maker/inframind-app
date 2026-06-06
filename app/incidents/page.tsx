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
        .select(`id, started_at, resolved_at, duration_seconds, monitors!incidents_monitor_id_fkey (name)`)
        .order('started_at', { ascending: false });
      if (data) setIncidents(data);
    };
    fetchData();
  }, []);

  const activeIncidents = incidents.filter(inc => !inc.resolved_at);

  return (
    <div className="min-h-screen bg-[#07090d] text-[#eef1f6] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-2xl mb-2">Incident History</h1>
        <p className="text-sm text-[#8a95a3] mb-8">View the status and resolution timeline of all recorded incidents.</p>

        {activeIncidents.length > 0 && (
          <div className="mb-8 p-5 bg-red-500/[0.05] border border-red-500/[0.2] rounded-xl flex items-center gap-4 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div className="flex-1">
              <span className="font-semibold text-red-500">Active Issues: </span>
              {activeIncidents.map(inc => inc.monitors?.name).join(', ')} are currently experiencing downtime.
            </div>
          </div>
        )}

        {/* MOBILE: List View */}
        <div className="md:hidden flex flex-col gap-3">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-[#0d1117] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                <span className="text-sm font-semibold">{inc.monitors?.name || 'Unknown'}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${inc.resolved_at ? 'border-[#1ddb78]/20 text-[#1ddb78]' : 'border-red-500/20 text-red-500'}`}>
                  {inc.resolved_at ? 'Resolved' : '● Open Issue'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div><p className="text-[#8a95a3] uppercase">Started</p><p>{new Date(inc.started_at).toLocaleString()}</p></div>
                <div><p className="text-[#8a95a3] uppercase">Resolved</p><p>{inc.resolved_at ? new Date(inc.resolved_at).toLocaleString() : '-'}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP: Table View */}
        <div className="hidden md:block rounded-xl bg-[#0d1117] border border-white/[0.06] overflow-hidden">
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
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-white/[0.02]">
                  <td className="p-5 text-sm font-medium">{inc.monitors?.name}</td>
                  <td className="p-5 text-sm text-[#8a95a3]">{new Date(inc.started_at).toLocaleString()}</td>
                  <td className="p-5 text-sm text-[#8a95a3]">{inc.resolved_at ? new Date(inc.resolved_at).toLocaleString() : '-'}</td>
                  <td className="p-5 text-sm text-[#8a95a3]">{formatDuration(inc.duration_seconds)}</td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${inc.resolved_at ? 'border-[#1ddb78]/20 text-[#1ddb78]' : 'border-red-500/20 text-red-500'}`}>
                      {inc.resolved_at ? 'Resolved' : '● Open Issue'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}