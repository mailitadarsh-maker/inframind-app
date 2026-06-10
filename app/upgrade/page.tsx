'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹499',
    period: '/month',
    description: 'For solo developers and small projects.',
    highlight: false,
    badge: null,
    features: [
      '10 Monitors',
      'Website & API monitoring',
      'SSL monitoring',
      'Email alerts',
      'Incident tracking',
      'Public status page',
    ],
    cta: 'Coming Soon',
    ctaDisabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹1,499',
    period: '/month',
    description: 'For teams that need deeper visibility and AI-powered triage.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      '50 Monitors',
      'Website, API & SSL monitoring',
      'AI incident analysis',
      'Email + Slack alerts',
      'Team workspaces',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Coming Soon',
    ctaDisabled: true,
  },
];

export default function UpgradePage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090f',
        color: '#fff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          padding: '40px 40px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: '#22c55e',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            ✓
          </div>
          <span style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-0.01em' }}>
            InfraMind
          </span>
        </div>
        <a
          href="/dashboard"
          style={{
            color: '#6b7280',
            fontSize: '14px',
            textDecoration: 'none',
            padding: '8px 16px',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            transition: 'border-color 0.2s',
          }}
        >
          ← Back to Dashboard
        </a>
      </div>

      {/* Hero */}
      <div
        style={{
          textAlign: 'center',
          padding: '72px 40px 56px',
          maxWidth: '620px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#22c55e',
            textTransform: 'uppercase',
            marginBottom: '20px',
            padding: '4px 12px',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '100px',
            background: 'rgba(34,197,94,0.05)',
          }}
        >
          Pricing
        </div>
        <h1
          style={{
            fontSize: '42px',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
            color: '#f9fafb',
          }}
        >
          Simple pricing for{' '}
          <span
            style={{
              color: '#22c55e',
              fontStyle: 'italic',
            }}
          >
            growing infrastructure teams.
          </span>
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Monitor websites, APIs, and SSL certificates —
          <br />
          and get AI-powered insights when incidents happen.
        </p>
      </div>

      {/* LinkedIn Reward Banner */}
      {profile?.plan === 'trial' && profile?.linkedin_reward_status === 'not_submitted' && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(234,179,8,0.08))',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '12px',
            padding: '20px 28px',
            marginBottom: '40px',
            maxWidth: '720px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: '#4ade80',
              marginBottom: '6px',
            }}
          >
            🎁 Not ready to pay? Get 14 Extra Trial Days — Free
          </div>
          <div
            style={{
              color: '#94a3b8',
              marginBottom: '14px',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            Share InfraMind on LinkedIn and unlock 14 extra trial days + 10 monitors
            instantly. No card needed.
          </div>
          <a
            href="/dashboard/linkedin-reward"
            style={{
              color: '#4ade80',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Claim Free Reward →
          </a>
        </div>
      )}

      {/* Cards */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '0 40px 80px',
          width: '100%',
          maxWidth: '1100px',
          boxSizing: 'border-box',
        }}
      >
        {plans.map((plan) => {
          const isHovered = hovered === plan.id;

          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHovered(plan.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative',
                width: '340px',
                background: plan.highlight
                  ? 'linear-gradient(160deg, #0d1a12 0%, #0d1117 60%)'
                  : '#0d1117',
                border: plan.highlight
                  ? '1px solid rgba(34,197,94,0.45)'
                  : '1px solid #1f2937',
                borderRadius: '20px',
                padding: '32px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: plan.highlight
                  ? isHovered
                    ? '0 24px 60px rgba(34,197,94,0.15)'
                    : '0 8px 32px rgba(34,197,94,0.08)'
                  : isHovered
                  ? '0 24px 60px rgba(0,0,0,0.5)'
                  : 'none',
              }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#22c55e',
                    color: '#000',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 14px',
                    borderRadius: '100px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: plan.highlight ? '#22c55e' : '#9ca3af',
                  }}
                >
                  {plan.name}
                </span>
                {plan.highlight && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                      display: 'inline-block',
                    }}
                  />
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '48px',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: '#f9fafb',
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginLeft: '4px',
                  }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: 1.5,
                  margin: '0 0 28px',
                }}
              >
                {plan.description}
              </p>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: plan.highlight
                    ? 'rgba(34,197,94,0.15)'
                    : '#1f2937',
                  marginBottom: '24px',
                }}
              />

              {/* Features */}
              <ul
                style={{
                  listStyle: 'none',
                  margin: '0 0 32px',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      color: '#d1d5db',
                    }}
                  >
                    <span
                      style={{
                        color: '#22c55e',
                        fontSize: '13px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                disabled={plan.ctaDisabled}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: plan.highlight ? '#22c55e' : 'transparent',
                  color: plan.highlight ? '#000' : '#6b7280',
                  border: plan.highlight ? 'none' : '1px solid #374151',
                  cursor: 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  opacity: 0.75,
                }}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div
        style={{
          paddingBottom: '60px',
          textAlign: 'center',
          color: '#374151',
          fontSize: '13px',
        }}
      >
        Paid plans launching soon. You're on the free beta — enjoy it while it lasts.
      </div>
    </div>
  );
}