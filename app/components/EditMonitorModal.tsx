'use client';

import { useState } from 'react';

interface EditMonitorModalProps {
  monitor: any;
}

export default function EditMonitorModal({
  monitor,
}: EditMonitorModalProps) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(monitor.name);
  const [url, setUrl] = useState(monitor.target_url);
  const [alertEmail, setAlertEmail] = useState(
    monitor.alert_email || ''
  );

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !url || !alertEmail) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        '/api/monitors/update',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: monitor.id,
            name,
            target_url: url,
            alert_email: alertEmail,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Failed to update');
        return;
      }

      alert('Monitor Updated');

      setOpen(false);

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
        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-6 w-full max-w-md">

            <h2 className="text-2xl font-bold text-white mb-6">
              Edit Monitor
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-white/10 text-white outline-none"
              />

              <input
                type="url"
                value={url}
                onChange={(e) =>
                  setUrl(e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-white/10 text-white outline-none"
              />

              <input
                type="email"
                value={alertEmail}
                onChange={(e) =>
                  setAlertEmail(e.target.value)
                }
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
                className="px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold"
              >
                {loading
                  ? 'Updating...'
                  : 'Save Changes'}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}