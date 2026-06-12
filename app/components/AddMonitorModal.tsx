'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  atLimit?: boolean;
}

export default function AddMonitorModal({ isOpen, onClose, onSuccess, atLimit }: AddMonitorModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [type, setType] = useState('website');
  
  const [requestMethod, setRequestMethod] = useState('GET');
  const [authType, setAuthType] = useState('none');
  const [authValue, setAuthValue] = useState('');
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [customHeaders, setCustomHeaders] = useState('{}');
  const [requestBody, setRequestBody] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setUrl('');
    setAlertEmail('');
    setType('website');
    setRequestMethod('GET');
    setAuthType('none');
    setAuthValue('');
    setExpectedStatus(200);
    setCustomHeaders('{}');
    setRequestBody('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (atLimit) {
      window.location.href = '/upgrade';
      return;
    }

    if (type === 'api') {
      try {
        JSON.parse(customHeaders);
        if (requestBody && requestMethod !== 'GET') {
          JSON.parse(requestBody);
        }
      } catch {
        setError('Invalid JSON in Headers or Request Body');
        return;
      }
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expired. Please log in.');

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
          custom_headers: customHeaders,
          request_body: requestBody,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.code === 'MONITOR_LIMIT_REACHED') {
          window.location.href = '/upgrade';
          return;
        }
        throw new Error(result.error || 'Failed to create monitor');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-[#2e333d] px-4 py-2.5 text-sm text-[#eef1f6] placeholder-[#8a95a3]/50 outline-none transition-all focus:border-[#1ddb78]/50 focus:ring-1 focus:ring-[#1ddb78]/50";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#2b3039] shadow-2xl p-6">
        <h2 className="text-xl font-semibold text-[#eef1f6] mb-1">Add New Monitor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Monitor Name</label>
            <input
              required
              value={name}
              placeholder="My Website"
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Type</label>
              <select 
                value={type} 
                onChange={(e) => {
                  const newType = e.target.value;
                  setType(newType);
                  if (newType !== 'api') {
                    setRequestMethod('GET');
                    setAuthType('none');
                    setAuthValue('');
                    setExpectedStatus(200);
                    setCustomHeaders('{}');
                    setRequestBody('');
                  }
                }} 
                className={inputClass}
              >
                <option value="website">Website</option>
                <option value="api">API</option>
                <option value="ssl">SSL Certificate</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Target URL</label>
              <input
                type="url"
                required
                value={url}
                placeholder="https://example.com"
                onChange={(e) => setUrl(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {type === 'api' && (
            <div className="space-y-4 border-t border-white/10 pt-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Method</label>
                <select value={requestMethod} onChange={(e) => setRequestMethod(e.target.value)} className={inputClass}>
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Authentication</label>
                <select value={authType} onChange={(e) => setAuthType(e.target.value)} className={inputClass}>
                  <option value="none">None</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="apikey">API Key</option>
                </select>
              </div>

              {authType !== 'none' && (
                <input
                  type="password"
                  placeholder="Enter token or API key"
                  value={authValue}
                  onChange={(e) => setAuthValue(e.target.value)}
                  className={inputClass}
                />
              )}

              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Expected Status Code</label>
                <input
                  type="number"
                  placeholder="200"
                  value={expectedStatus}
                  onChange={(e) => setExpectedStatus(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Custom Headers (JSON)</label>
                <textarea
                  rows={3}
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  className={inputClass}
                  placeholder='{"Content-Type": "application/json"}'
                />
              </div>

              {requestMethod !== 'GET' && (
                <div>
                  <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Request Body (JSON)</label>
                  <textarea
                    rows={4}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className={inputClass}
                    placeholder='{"email":"demo@test.com"}'
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Alert Email</label>
            <input
              type="email"
              required
              value={alertEmail}
              placeholder="alerts@example.com"
              onChange={(e) => setAlertEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && <p className="text-xs text-[#ff5c5c]">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="text-sm text-[#8a95a3]">Cancel</button>
            <button type="submit" disabled={isLoading} className="rounded-lg bg-[#1ddb78] px-5 py-2 text-sm font-semibold text-black">
              {isLoading ? 'Saving...' : atLimit ? 'Upgrade Plan' : 'Save Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}