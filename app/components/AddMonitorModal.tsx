'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AddMonitorModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('website');
  const [expectedStatus, setExpectedStatus] = useState(200);

  const handleSubmit = async () => {
    if (!name || !url || !alertEmail) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login again');
        return;
      }

      const response = await fetch('/api/monitors/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          name,
          target_url: url,
          alert_email: alertEmail,
          type,
          expected_status: expectedStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Failed to create monitor');
        return;
      }

      alert('Monitor Added Successfully');

      setOpen(false);
      setName('');
      setUrl('');
      setAlertEmail('');

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#1ddb78] text-black px-5 py-2 rounded-lg font-semibold hover:opacity-90"
      >
        + Add Monitor
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6 w-full max-w-md">

            <h2 className="text-2xl font-bold text-white mb-6">
              Add New Monitor
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Website Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-white/10 text-white outline-none"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-white/10 text-white outline-none"
              >
                <option value="website">Website</option>
                <option value="api">API</option>
              </select>

              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-white/10 text-white outline-none"
              />

              {type === 'api' && (
                <input
                  type="number"
                  placeholder="Expected Status Code"
                  value={expectedStatus}
                  onChange={(e) =>
                    setExpectedStatus(Number(e.target.value))
                  }
                  className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-white/10 text-white outline-none"
                />
              )}

              <input
                type="email"
                placeholder="Alert Email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-white/10 text-white outline-none"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-lg bg-gray-700 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-[#1ddb78] text-black font-semibold"
              >
                {loading ? 'Saving...' : 'Save Monitor'}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}