'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMonitorModal({ isOpen, onClose, onSuccess }: AddMonitorModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [type, setType] = useState('website');
  const [expectedStatus, setExpectedStatus] = useState(200);

  const [requestMethod, setRequestMethod] = useState('GET');
  const [authType, setAuthType] = useState('none');
  const [authValue, setAuthValue] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !url || !alertEmail) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Your session has expired. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/monitors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          name,
          target_url: url,
          alert_email: alertEmail,
          type,
          expected_status: type === 'api' ? expectedStatus : null,

          request_method: requestMethod,
          auth_type: authType,
          auth_value: authValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create monitor');
      }

      setName('');
      setUrl('');
      setAlertEmail('');
      setType('website');
      setExpectedStatus(200);
      setRequestMethod('GET');
      setAuthType('none');
      setAuthValue('');

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#eef1f6] tracking-tight mb-1">Add New Monitor</h2>
          <p className="text-xs text-[#8a95a3] mb-6">Configure a new endpoint to track its uptime and status.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Monitor Name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g., Production Database"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm text-[#eef1f6] placeholder-[#8a95a3]/50 outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/3">
                <label htmlFor="type" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Type</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#161b22] px-3 py-2.5 text-sm text-[#eef1f6] outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50 appearance-none"
                >
                  <option value="website">Website</option>
                  <option value="api">API</option>
                  <option value="ssl">SSL</option>
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="url" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Target URL</label>
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm text-[#eef1f6] placeholder-[#8a95a3]/50 outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50"
                />
              </div>
            </div>

            {type === 'api' && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">
                    Request Method
                  </label>
                  <select
                    value={requestMethod}
                    onChange={(e) => setRequestMethod(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm text-[#eef1f6]"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">
                    Authentication
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm text-[#eef1f6]"
                  >
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="apikey">API Key</option>
                  </select>
                </div>

                {authType !== 'none' && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">
                      {authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                    </label>
                    <input
                      type="text"
                      value={authValue}
                      onChange={(e) => setAuthValue(e.target.value)}
                      placeholder="Enter authentication value"
                      className="w-full rounded-lg border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm text-[#eef1f6]"
                    />
                  </div>
                )}

                <label htmlFor="status" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Expected Status Code</label>
                <input
                  id="status"
                  type="number"
                  required
                  placeholder="200"
                  value={expectedStatus}
                  onChange={(e) => setExpectedStatus(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm text-[#eef1f6] placeholder-[#8a95a3]/50 outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#8a95a3] mb-1.5">Alert Email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="alerts@yourdomain.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm text-[#eef1f6] placeholder-[#8a95a3]/50 outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-[#ff5c5c]/10 border border-[#ff5c5c]/20 p-3 flex items-start gap-2">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-xs text-[#ff5c5c]">{error}</p>
              </div>
            )}

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
                className="rounded-lg bg-[#1ddb78] px-5 py-2 text-sm font-semibold text-[#07090d] hover:bg-[#22f585] hover:shadow-[0_0_15px_rgba(29,219,120,0.3)] hover:-translate-y-0.5 focus:outline-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all"
              >
                {isLoading ? 'Saving...' : 'Save Monitor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}