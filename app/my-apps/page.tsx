'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function MyAppsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('monitors')
      .select('*')
      .eq('user_id', user?.id);

    if (error) {
      console.error(error);
      return;
    }

    setApps(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-white p-8">

      <h1 className="text-3xl font-bold mb-6">
        My Apps
      </h1>

      {loading && (
        <p>Loading...</p>
      )}

      {!loading && apps.length === 0 && (
        <p>No apps connected yet.</p>
      )}

      <div className="grid gap-4">

        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-[#0d1117] border border-white/10 rounded-xl p-5"
          >
            <h2 className="text-xl font-bold">
              {app.name}
            </h2>

            <p className="text-gray-400">
              {app.type}
            </p>

            <p className="text-[#1ddb78]">
              {app.target_url}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}