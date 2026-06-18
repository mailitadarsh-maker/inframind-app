'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AddMonitorModal from '@/app/components/AddMonitorModal';

export default function MyAppsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadMonitors = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      supabase.from('monitors').select('*').eq('user_id', user.id)
        .then(({ data }) => { setApps(data || []); setLoading(false); });
    });
  };

  useEffect(() => {
    loadMonitors();
  }, []);

  const statusColor: Record<string, string> = {
    online: 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20',
    offline: 'bg-red-400/10 text-red-400 border-red-400/20',
  };

  return (
    <div className="min-h-screen bg-[#1e2128] px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xs text-white/30 hover:text-white/60 mb-3 flex items-center gap-1 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">Uptime Monitoring</h1>
            <p className="text-white/40 text-sm mt-1">Your monitored services</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            + Add Monitor
          </button>
        </div>

        {/* Stats */}
        {!loading && apps.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#26292f] border border-white/[0.08] rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{apps.length}</p>
            </div>
            <div className="bg-[#26292f] border border-white/[0.08] rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Online</p>
              <p className="text-2xl font-bold text-[#4ade80]">{apps.filter(a => a.status === 'online').length}</p>
            </div>
            <div className="bg-[#26292f] border border-white/[0.08] rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Offline</p>
              <p className="text-2xl font-bold text-red-400">{apps.filter(a => a.status === 'offline').length}</p>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-[#26292f] border border-white/[0.08] rounded-2xl overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 rounded-full border-2 border-[#4ade80] border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && apps.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📡</p>
              <p className="text-white font-medium">No monitors yet</p>
              <p className="text-white/30 text-sm mt-1 mb-5">Add your first monitor on the full dashboard</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                + Add Monitor
              </button>
            </div>
          )}

          {!loading && apps.map((app, i) => (
            <div key={app.id} className={`px-6 py-4 flex items-center justify-between ${i !== 0 ? 'border-t border-white/[0.06]' : ''}`}>
              <div>
                <p className="text-white text-sm font-medium">{app.name}</p>
                <p className="text-white/30 text-xs mt-0.5">{app.target_url}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${statusColor[app.status] || 'bg-white/5 text-white/40 border-white/10'}`}>
                  {app.status || 'unknown'}
                </span>
                <span className="text-xs text-white/20 uppercase tracking-widest">{app.type}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      <AddMonitorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setLoading(true); loadMonitors(); }}
      />
    </div>
  );
}
