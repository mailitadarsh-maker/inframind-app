'use client';

import AddMonitorModal from '../components/AddMonitorModal';
import EditMonitorModal from '../components/EditMonitorModal';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  };

  const deleteMonitor = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this monitor?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/monitors/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        alert('Failed to delete monitor');
        return;
      }

      loadMonitors();
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    }
  };

  const loadMonitors = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('monitors')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setMonitors(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUser();
    loadMonitors();

    const interval = setInterval(() => {
      loadMonitors();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <div className="flex justify-between items-center p-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-400">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddMonitorModal />
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <p className="text-gray-400">Total Monitors</p>
          <h2 className="text-3xl font-bold mt-2">{monitors.length}</h2>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <p className="text-gray-400">Online</p>
          <h2 className="text-3xl font-bold text-green-500 mt-2">
            {monitors.filter((m) => m.status === 'online').length}
          </h2>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
          <p className="text-gray-400">Offline</p>
          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {monitors.filter((m) => m.status === 'offline').length}
          </h2>
        </div>
      </div>

      <div className="px-6 pb-6">
        <h3 className="text-xl font-bold mb-4">Monitors</h3>

        {loading ? (
          <div className="text-gray-400">Loading monitors...</div>
        ) : monitors.length === 0 ? (
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6">
            No monitors found
          </div>
        ) : (
          <div className="space-y-4">
            {monitors.map((monitor) => (
              <div
                key={monitor.id}
                className="bg-[#0d1117] border border-white/10 rounded-xl p-5"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">
                      {monitor.name}
                      <span className="ml-2 text-xs text-gray-400 uppercase">
                        {monitor.type}
                      </span>
                    </h3>

                    <p className="text-gray-400">{monitor.target_url}</p>

                    <div className="mt-2">
                      {monitor.status === 'online' ? (
                        <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                          Operational
                        </span>
                      ) : (
                        <span className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                          Outage
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        monitor.status === 'online'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {monitor.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                    </div>

                    <div className="text-gray-400 text-sm mb-3">
                      {monitor.response_time || 0} ms
                    </div>

                    <div className="text-green-400 text-sm mb-3">
                      99.99% Uptime
                    </div>

                    {monitor.type === 'ssl' && (
                      <div className="mb-3 text-sm">
                        <div className="text-gray-400">SSL Expiry</div>
                        <div className="text-white">
                          {monitor.ssl_expiry_date
                            ? new Date(
                                monitor.ssl_expiry_date
                              ).toLocaleDateString()
                            : 'Checking...'}
                        </div>
                        <div
                          className={`font-semibold ${
                            monitor.ssl_days_remaining <= 15
                              ? 'text-red-400'
                              : monitor.ssl_days_remaining <= 30
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}
                        >
                          {monitor.ssl_days_remaining || 0} Days Remaining
                        </div>
                      </div>
                    )}

                    <a
                      href={`/status/${monitor.id}`}
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      Public Status Page
                    </a>

                    <div className="flex gap-2 justify-end mt-3">
                      <EditMonitorModal monitor={monitor} />
                      <button
                        onClick={() => deleteMonitor(monitor.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}