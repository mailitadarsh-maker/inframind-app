'use client';

import { useState, useEffect } from 'react';

interface EditMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  monitor: any;
}

export default function EditMonitorModal({ isOpen, onClose, onSuccess, monitor }: EditMonitorModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [type, setType] = useState('website');
  const [expectedStatus, setExpectedStatus] = useState(200);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill the form whenever the modal opens with a selected monitor
  useEffect(() => {
    if (monitor) {
      setName(monitor.name || '');
      setUrl(monitor.target_url || '');
      setAlertEmail(monitor.alert_email || '');
      setType(monitor.type?.toLowerCase() || 'website');
      setExpectedStatus(monitor.expected_status || 200);
      setError(null);
    }
  }, [monitor, isOpen]);

  if (!isOpen || !monitor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !url || !alertEmail) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/monitors/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: monitor.id,
          name,
          target_url: url,
          alert_email: alertEmail,
          type,
          expected_status: type === 'api' ? expectedStatus : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update monitor');
      }

      // Smoothly refresh dashboard data and close modal
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while updating.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#2b3039] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#eef1f6] tracking-tight mb-1">Edit Monitor</h2>
          <p className="text-xs text-[#8a95a3] mb-6">Update the configuration for {monitor.name}.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Monitor Name */}
            <div>
              <label htmlFor="edit-name" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Monitor Name</label>
              <input
                id="edit-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#2e333d] px-4 py-2.5 text-sm text-[#eef1f6] outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50"
              />
            </div>

            {/* Type & URL */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-1/3">
                <label htmlFor="edit-type" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Type</label>
                <select
                  id="edit-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#2e333d] px-3 py-2.5 text-sm text-[#eef1f6] outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50 appearance-none"
                >
                  <option value="website">Website</option>
                  <option value="api">API</option>
                  <option value="ssl">SSL</option>
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="edit-url" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Target URL</label>
                <input
                  id="edit-url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#2e333d] px-4 py-2.5 text-sm text-[#eef1f6] outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50"
                />
              </div>
            </div>

            {/* Conditional Expected Status */}
            {type === 'api' && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label htmlFor="edit-status" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Expected Status Code</label>
                <input
                  id="edit-status"
                  type="number"
                  required
                  value={expectedStatus}
                  onChange={(e) => setExpectedStatus(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-[#2e333d] px-4 py-2.5 text-sm text-[#eef1f6] outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50"
                />
              </div>
            )}

            {/* Alert Email */}
            <div>
              <label htmlFor="edit-email" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Alert Email</label>
              <input
                id="edit-email"
                type="email"
                required
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#2e333d] px-4 py-2.5 text-sm text-[#eef1f6] outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50"
              />
            </div>

            {/* Inline Error Display */}
            {error && (
              <div className="rounded-lg bg-[#ff5c5c]/10 border border-[#ff5c5c]/20 p-3 flex items-start gap-2">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-xs text-[#ff5c5c]">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#8a95a3] hover:text-[#eef1f6] hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-[#1ddb78] px-5 py-2 text-sm font-semibold text-[#07090d] hover:bg-[#22f585] hover:shadow-[0_0_15px_rgba(29,219,120,0.3)] hover:-translate-y-0.5 focus:outline-none disabled:opacity-50 transition-all"
              >
                {isLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}