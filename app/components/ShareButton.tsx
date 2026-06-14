'use client';

import { useState } from 'react';

export default function ShareButton({ title, text, url }: { title: string; text?: string; url: string }) {
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullText = `${title}\n\n${text ? text + '\n\n' : ''}${url}`;

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: text ? `${text}\n` : undefined,
          url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // user cancelled, do nothing
      }
    } else {
      await navigator.clipboard.writeText(fullText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs font-semibold text-green border border-green/30 rounded-full px-3 py-1.5 hover:bg-green/10 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        {shared ? 'Shared ✓' : 'Share'}
      </button>

      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-2 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/5 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
        </svg>
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  );
}
