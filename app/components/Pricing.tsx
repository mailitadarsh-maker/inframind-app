'use client';

import { useEffect, useRef, useState } from 'react';

const monitoringPlans = [
  {
    id: 'm-starter',
    name: 'Starter',
    price: '₹0',
    period: '/mo',
    description: 'For founders getting started.',
    highlight: false,
    badge: null,
    blogCount: null,
    features: [
      '3 monitors',
      '30-min check intervals',
      'Email alerts',
      'Public status page',
    ],
    cta: 'Get started free',
    ctaHref: '/signup',
  },
  {
    id: 'm-growth',
    name: 'Growth',
    price: '₹999',
    period: '/mo',
    description: 'For growing SaaS & agencies.',
    highlight: true,
    badge: 'Most popular',
    blogCount: null,
    features: [
      '25 monitors',
      '30-second check intervals',
      'AI incident reports',
      'Blog service — 3 clients',
      'SSL monitoring',
    ],
    cta: 'Start Growth plan',
    ctaHref: '/signup?plan=growth',
  },
  {
    id: 'm-pro',
    name: 'Pro',
    price: '₹2,499',
    period: '/mo',
    description: 'For established teams.',
    highlight: false,
    badge: null,
    blogCount: null,
    features: [
      '100 monitors',
      '15-second intervals',
      'AI reports + Slack alerts',
      'Blog service — 15 clients',
      'Priority support',
    ],
    cta: 'Start Pro plan',
    ctaHref: '/signup?plan=pro',
  },
  {
    id: 'm-agency',
    name: 'Agency',
    price: '₹4,999',
    period: '/mo',
    description: 'For digital agencies.',
    highlight: false,
    badge: null,
    blogCount: null,
    features: [
      'Unlimited monitors',
      '5-second intervals',
      'White-label status pages',
      'Blog service — unlimited',
      'Dedicated onboarding',
    ],
    cta: 'Contact us',
    ctaHref: '/contact',
  },
];

const blogPlans = [
  {
    id: 'b-starter',
    name: 'Starter',
    price: '₹999',
    period: '/month',
    description: 'Best for small businesses.',
    highlight: false,
    badge: null,
    blogCount: '15 blogs/mo',
    blogSub: 'Auto + manual',
    features: [
      '15 blogs per month',
      'Daily auto-generation',
      'Manual generation anytime',
      'SEO keyword targeting',
      'Approve & publish flow',
      'Embed script delivery',
      'Email support',
    ],
    cta: 'Get Started',
    ctaHref: '/signup?plan=blog-starter',
    ctaFilled: false,
  },
  {
    id: 'b-growth',
    name: 'Growth',
    price: '₹1,899',
    period: '/month',
    description: 'Most popular plan.',
    highlight: true,
    badge: 'Most Popular',
    blogCount: '30 blogs/mo',
    blogSub: 'Daily auto + manual',
    features: [
      '30 blogs per month',
      'Daily auto-generation',
      'Manual generation anytime',
      'Advanced SEO strategy',
      'Approve & publish flow',
      'Embed script delivery',
      'Priority support',
      'Content performance insights',
    ],
    cta: 'Get Started',
    ctaHref: '/signup?plan=blog-growth',
    ctaFilled: true,
  },
  {
    id: 'b-pro',
    name: 'Pro',
    price: '₹2,499',
    period: '/month',
    description: 'For growing brands.',
    highlight: false,
    badge: null,
    blogCount: '60 blogs/mo',
    blogSub: '2 blogs/day auto + manual',
    features: [
      '60 blogs per month',
      'Manual generation anytime',
      'Embed + WordPress delivery',
      'Content calendar',
      '2 auto-generated blogs per day',
      'Advanced SEO strategy',
      'Dedicated support',
      'Custom tone & style',
    ],
    cta: 'Get Started',
    ctaHref: '/signup?plan=blog-pro',
    ctaFilled: false,
  },
  {
    id: 'b-enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'on request',
    description: 'For agencies & large teams.',
    highlight: false,
    badge: null,
    blogCount: 'Unlimited',
    blogSub: 'Custom schedule',
    features: [
      'Unlimited blogs',
      'Multiple company profiles',
      'API access',
      'Custom integrations',
      'Custom generation schedule',
      'White label option',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Us',
    ctaHref: '/contact',
    ctaFilled: false,
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
      <circle cx="7" cy="7" r="7" fill={`${color}20`} />
      <path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'blog'>('monitoring');
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const isMonitoring = activeTab === 'monitoring';
  const accent = isMonitoring ? '#4ade80' : '#a5b4fc';
  const accentDim = isMonitoring ? 'rgba(74,222,128,0.1)' : 'rgba(165,180,252,0.1)';
  const accentBorder = isMonitoring ? 'rgba(74,222,128,0.25)' : 'rgba(165,180,252,0.25)';
  const plans = isMonitoring ? monitoringPlans : blogPlans;

  return (
    <section id="pricing" ref={ref} style={{ padding: '96px 40px', background: '#13151a' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          textAlign: 'center', marginBottom: '44px',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s, transform 0.6s',
        }}>
          <p style={{ fontSize: '11px', fontFamily: '"SF Mono","Fira Code",monospace', letterSpacing: '0.18em', color: '#4b5563', textTransform: 'uppercase', marginBottom: '18px' }}>
            PRICING
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0f0', margin: '0 0 12px', lineHeight: 1.05 }}>
            One platform, two products.
          </h2>
          <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
            Start free. Upgrade when you're ready.
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            {(['monitoring', 'blog'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const tabAccent = tab === 'monitoring' ? '#4ade80' : '#a5b4fc';
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em',
                    transition: 'all 0.2s',
                    background: isActive ? tabAccent : 'transparent',
                    color: isActive ? '#000' : '#6b7280',
                  }}
                >
                  {tab === 'monitoring' ? 'App Monitoring' : 'Blog as a Service'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 14-day trial banner - monitoring only */}
        {isMonitoring && <div style={{
          background: accentDim, border: `1px solid ${accentBorder}`, borderRadius: '12px',
          padding: '18px 28px', marginBottom: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px', transition: 'all 0.3s',
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: accent, marginBottom: '4px' }}>
              Get 14 Extra Trial Days — Free
            </div>
            <div style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>
              Share InfraMind on LinkedIn and unlock 14 extra trial days + 10 monitors instantly. No card needed.
            </div>
          </div>
          <a href="/signup?redirect=/dashboard/linkedin-reward" style={{
            background: accentDim, border: `1px solid ${accentBorder}`, color: accent,
            fontWeight: 600, textDecoration: 'none', fontSize: '13px',
            padding: '10px 20px', borderRadius: '8px', whiteSpace: 'nowrap', transition: 'all 0.3s',
          }}>
            Claim Free Reward →
          </a>
        </div>}

        {/* Blog free trial note */}
        {!isMonitoring && (
          <div style={{
            background: 'rgba(165,180,252,0.07)', border: '1px solid rgba(165,180,252,0.2)',
            borderRadius: '12px', padding: '14px 24px', marginBottom: '28px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a5b4fc', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 600 }}>
              All plans start with a 7-day free trial — 4 AI blogs included. No credit card needed.
            </span>
          </div>
        )}

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          alignItems: 'start',
        }}>
          {plans.map((plan, i) => {
            const isHovered = hovered === plan.id;
            const isFilled = 'ctaFilled' in plan ? plan.ctaFilled : plan.highlight;
            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHovered(plan.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative',
                  background: plan.highlight ? `linear-gradient(160deg, ${accentDim} 0%, #1a1d24 70%)` : '#1a1d24',
                  border: plan.highlight ? `1px solid ${accentBorder}` : '1px solid #2a2d35',
                  borderRadius: '16px', padding: '26px 22px',
                  transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.5s',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: plan.highlight
                    ? isHovered ? `0 20px 48px ${accentDim}` : `0 6px 20px ${accentDim}`
                    : isHovered ? '0 20px 48px rgba(0,0,0,0.35)' : 'none',
                  opacity: visible ? 1 : 0,
                  transitionDelay: `${0.05 * i}s`,
                  marginTop: plan.highlight ? '-10px' : '0',
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                    background: accent, color: '#000', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan name row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: plan.highlight ? accent : '#4b5563',
                    fontFamily: '"SF Mono","Fira Code",monospace',
                  }}>
                    {plan.name}
                  </span>
                  {plan.highlight && (
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}`, display: 'inline-block' }} />
                  )}
                </div>

                {/* Blog count pill */}
                {'blogCount' in plan && plan.blogCount && (
                  <div style={{
                    background: '#22252c', border: '1px solid #2a2d35', borderRadius: '8px',
                    padding: '10px 14px', marginBottom: '16px', float: 'right',
                    textAlign: 'right',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#e6edf3' }}>{plan.blogCount}</div>
                    {'blogSub' in plan && <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>{plan.blogSub}</div>}
                  </div>
                )}

                {/* Price */}
                <div style={{ marginBottom: '6px', clear: 'both' }}>
                  <span style={{ fontSize: plan.price === 'Custom' ? '2rem' : '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#f0f0f0', lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '13px', color: '#4b5563', marginLeft: '4px' }}>
                    {plan.period}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.5, margin: '0 0 18px', fontFamily: '"SF Mono","Fira Code",monospace' }}>
                  {plan.description}
                </p>

                <div style={{ height: '1px', background: plan.highlight ? accentBorder : '#2a2d35', marginBottom: '18px' }} />

                <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '13px', color: '#9ca3af' }}>
                      <CheckIcon color={accent} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a href={plan.ctaHref} style={{
                  display: 'block', width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box',
                  background: isFilled ? accent : 'transparent',
                  color: isFilled ? '#000' : '#6b7280',
                  border: isFilled ? 'none' : '1px solid #2a2d35',
                  fontSize: '13px', fontWeight: 600, textAlign: 'center',
                  textDecoration: 'none', transition: 'opacity 0.2s',
                }}>
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        {/* Blog bottom note */}
        {!isMonitoring && (
          <p style={{ textAlign: 'center', marginTop: '32px', color: '#4b5563', fontSize: '13px' }}>
            All plans include AI-powered blog generation, SEO optimization, and embed delivery.{' '}
            <a href="mailto:hello@inframindhq.online" style={{ color: accent, textDecoration: 'none' }}>
              hello@inframindhq.online
            </a>
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#2d3139', fontSize: '12px', fontFamily: '"SF Mono","Fira Code",monospace' }}>
          Paid plans launching soon. You're on the free beta — enjoy it while it lasts.
        </p>

      </div>
    </section>
  );
}
