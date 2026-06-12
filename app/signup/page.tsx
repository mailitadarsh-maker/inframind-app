'use client';
import { supabase } from "@/lib/supabase";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!firstName || !email || !password) {
    setToast({ type: 'error', message: 'Please fill all required fields.' });
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        company: company,
      },
      emailRedirectTo: 'https://www.inframindhq.online/login',
    },
  });

  setLoading(false);

  if (error) {
    setToast({ type: 'error', message: error.message });
    return;
  }

  setToast({
    type: 'success',
    message: "Account created! We've sent a confirmation link to your email — please verify before signing in.",
  });

  console.log(data);

  setTimeout(() => {
    router.push("/login");
  }, 2500);
};

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      {/* Glow background */}
      <div
        className="absolute w-96 h-96 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(29,219,120,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Toast */}
      {toast && (
        <>
        <div
          onClick={() => setToast(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 49,
          }}
        />
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            maxWidth: '92vw',
            width: '460px',
            padding: '16px 18px',
            borderRadius: '14px',
            background: '#0d1117',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              background: toast.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: toast.type === 'success' ? '#4ade80' : '#f87171',
            }}
          >
            {toast.type === 'success' ? '✓' : '!'}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: toast.type === 'success' ? '#4ade80' : '#f87171',
                marginBottom: '2px',
              }}
            >
              {toast.type === 'success' ? 'Account created' : 'Something went wrong'}
            </div>
            <div style={{ fontSize: '12.5px', color: '#9ca3af', lineHeight: 1.5 }}>
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              flexShrink: 0,
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
        </>
      )}
      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      {/* Auth box */}
      <div className="bg-[#0d1117] border border-white/[0.1] rounded-[18px] p-9 w-full max-w-sm relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <div className="w-7 h-7 bg-[#1ddb78] rounded-[7px] flex items-center justify-center">
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <path
                d="M2 7L6 11L12 3"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-[-0.3px]">InfraMind</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl tracking-[-0.5px] mb-1.5 text-center">Create your account</h1>
        <p className="text-sm text-[#8a95a3] text-center mb-7">Free forever · No credit card needed</p>

        {/* Form */}
        <form onSubmit={handleSignup}>
          {/* First Name */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">First name</label>
            <input
              type="text"
              placeholder="Arjun"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-[#131920] border border-white/[0.1] rounded-lg py-2.75 px-3.5 text-sm text-white font-sans outline-none focus:border-[#1ddb78] placeholder:text-[#3d4f63]"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#131920] border border-white/[0.1] rounded-lg py-2.75 px-3.5 text-sm text-white font-sans outline-none focus:border-[#1ddb78] placeholder:text-[#3d4f63]"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#131920] border border-white/[0.1] rounded-lg py-2.75 px-3.5 text-sm text-white font-sans outline-none focus:border-[#1ddb78] placeholder:text-[#3d4f63]"
            />
          </div>

          {/* Company */}
          <div className="mb-1">
            <label className="block text-xs font-medium text-[#8a95a3] mb-1.5">Company name</label>
            <input
              type="text"
              placeholder="Your company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-[#131920] border border-white/[0.1] rounded-lg py-2.75 px-3.5 text-sm text-white font-sans outline-none focus:border-[#1ddb78] placeholder:text-[#3d4f63]"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary mt-1 justify-center py-2.75"
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        {/* Links */}
        <div className="text-sm text-[#8a95a3] text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[#1ddb78] no-underline cursor-pointer font-medium">
            Sign in
          </Link>
        </div>

        <div className="text-sm text-[#8a95a3] text-center mt-2">
          <Link href="/" className="text-[#3d4f63] no-underline cursor-pointer hover:text-[#8a95a3]">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
