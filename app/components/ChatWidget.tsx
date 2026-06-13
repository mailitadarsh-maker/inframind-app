'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [step, setStep] = useState<'greet' | 'form' | 'sent'>('greet');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.15, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + duration);
      };

      playTone(880, 0, 0.15);
      playTone(1320, 0.1, 0.2);
    } catch {}
  };

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('inframind_chat_bubble_shown');
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShowBubble(true);
      playSound();
      sessionStorage.setItem('inframind_chat_bubble_shown', '1');
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setShowBubble(false);
    setStep('greet');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi InfraMind team!%0A%0AName: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0AMessage: ${encodeURIComponent(message)}`;
    setStep('sent');
    setTimeout(() => {
      window.open(`https://wa.me/919633474645?text=${text}`, '_blank');
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Greeting bubble (auto-popup) */}
      {showBubble && !open && (
        <div className="relative animate-fade-in">
          <div
            onClick={handleOpen}
            className="cursor-pointer bg-[#1a1c22] border border-white/[0.08] rounded-2xl rounded-br-sm px-4 py-3 shadow-2xl max-w-[230px] text-sm text-text"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-green flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07090d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <p className="leading-snug">
                👋 Hey there! Need help getting your monitors set up?
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#22252c] border border-white/10 text-text-2 text-xs flex items-center justify-center hover:text-text"
          >
            ×
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="bg-[#1a1c22] border border-white/[0.08] rounded-2xl shadow-2xl w-[310px] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-green/15 to-transparent border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green flex items-center justify-center flex-shrink-0 relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07090d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green border-2 border-[#1a1c22]" />
            </div>
            <div className="flex-1">
              <p className="text-text text-sm font-semibold leading-tight">InfraMind Assistant</p>
              <p className="text-text-2 text-xs">Typically replies in a few minutes</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-text-2 hover:text-text text-lg leading-none">
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {step === 'greet' && (
              <>
                <div className="bg-[#22252c] rounded-xl rounded-tl-sm px-3.5 py-2.5 mb-4 text-sm text-text leading-relaxed">
                  Hi! 👋 I'm here to help with monitoring setup, billing, or anything else. Tell us a bit about what you need and we'll continue on WhatsApp.
                </div>
                <button
                  onClick={() => setStep('form')}
                  className="w-full bg-green text-[#07090d] font-semibold text-sm rounded-lg py-2.5 hover:bg-green/90 transition-colors"
                >
                  Get help →
                </button>
              </>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="bg-[#22252c] rounded-xl rounded-tl-sm px-3.5 py-2.5 mb-2 text-sm text-text leading-relaxed">
                  Great — just a few details so we can pick up the conversation on WhatsApp.
                </div>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#22252c] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-2 focus:outline-none focus:border-green/40 transition-colors"
                />
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#22252c] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-2 focus:outline-none focus:border-green/40 transition-colors"
                />
                <textarea
                  required
                  placeholder="What can we help with?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-[#22252c] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-2 focus:outline-none focus:border-green/40 resize-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-green text-[#07090d] font-semibold text-sm rounded-lg py-2.5 hover:bg-green/90 transition-colors flex items-center justify-center gap-2"
                >
                  Continue on WhatsApp
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 3.5A8.6 8.6 0 0 0 12 1.5a8.6 8.6 0 0 0-7.4 12.9L3 22l7.8-1.5a8.6 8.6 0 0 0 1.2.1A8.6 8.6 0 0 0 20.5 12a8.6 8.6 0 0 0-3-8.5zm-5.5 15.4a7.1 7.1 0 0 1-3.6-1l-.3-.1-2.6.5.5-2.5-.2-.3a7.1 7.1 0 1 1 13.2-3.7 7.1 7.1 0 0 1-7 7.1z" />
                  </svg>
                </button>
              </form>
            )}

            {step === 'sent' && (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green/15 flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-text text-sm font-medium">Opening WhatsApp…</p>
                <p className="text-text-2 text-xs mt-1">We'll be right with you!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="w-14 h-14 rounded-full bg-green flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform relative"
        >
          {showBubble && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#22252c] animate-pulse" />
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#07090d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
