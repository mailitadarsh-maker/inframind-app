'use client';

import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Free Trial',
    price: '₹0',
    period: '7 days',
    tagline: 'No credit card needed',
    blogs: '4 blogs',
    generation: '1 blog every alternate day',
    cta: 'Start Free Trial',
    ctaStyle: 'solid',
    popular: false,
    features: [
      '4 blogs over 7 days',
      'Auto-generation every alternate day',
      'Manual generation anytime',
      'AI content strategy',
      'Approve & publish flow',
      'Embed script included',
    ],
  },
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    tagline: 'Best for small businesses',
    blogs: '15 blogs/mo',
    generation: 'Auto + manual',
    cta: 'Get Started',
    ctaStyle: 'outline',
    popular: false,
    features: [
      '15 blogs per month',
      'Daily auto-generation',
      'Manual generation anytime',
      'SEO keyword targeting',
      'Approve & publish flow',
      'Embed script delivery',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: '₹1,899',
    period: '/month',
    tagline: 'Most popular plan',
    blogs: '30 blogs/mo',
    generation: 'Daily auto + manual',
    cta: 'Get Started',
    ctaStyle: 'solid',
    popular: true,
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
  },
  {
    name: 'Pro',
    price: '₹2,499',
    period: '/month',
    tagline: 'For growing brands',
    blogs: '60 blogs/mo',
    generation: '2 blogs/day auto + manual',
    cta: 'Get Started',
    ctaStyle: 'outline',
    popular: false,
    features: [
      '60 blogs per month',
      '2 auto-generated blogs per day',
      'Manual generation anytime',
      'Advanced SEO strategy',
      'Embed + WordPress delivery',
      'Dedicated support',
      'Content calendar',
      'Custom tone & style',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'on request',
    tagline: 'For agencies & large teams',
    blogs: 'Unlimited',
    generation: 'Custom schedule',
    cta: 'Contact Us',
    ctaStyle: 'outline',
    popular: false,
    features: [
      'Unlimited blogs',
      'Custom generation schedule',
      'Multiple company profiles',
      'White label option',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#1e2128]">

      {/* Back button */}
      <div className="px-6 pt-6 max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M10 8H3M6 5l-3 3 3 3" />
          </svg>
          Back
        </button>
      </div>

      {/* Header */}
      <div className="px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
          <span className="text-xs text-[#4ade80] font-medium">Simple Pricing</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Start free.<br />Scale as you grow.
        </h1>
        <p className="text-white/40 text-base max-w-lg mx-auto">
          7 days free, no credit card needed. Upgrade anytime. Cancel anytime.
        </p>
      </div>

      {/* Plans */}
      <div className="px-4 md:px-6 pb-20 max-w-6xl mx-auto">

        {/* Top row - 3 plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {plans.slice(0, 3).map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col border ${
                plan.popular
                  ? 'bg-[#4ade80]/[0.06] border-[#4ade80]/40'
                  : 'bg-[#26292f] border-white/[0.08]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="bg-[#4ade80] text-black text-xs font-bold px-4 py-1 rounded-full">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#4ade80]">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-white/30 text-sm mb-1.5">{plan.period}</span>
                </div>
                <p className="text-white/30 text-xs">{plan.tagline}</p>
              </div>

              <div className="rounded-xl px-4 py-3 mb-5 bg-[#1e2128] border border-white/[0.06]">
                <p className="text-white font-semibold text-sm">{plan.blogs}</p>
                <p className="text-white/30 text-xs mt-0.5">{plan.generation}</p>
              </div>

              <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-0.5 text-xs flex-shrink-0 text-[#4ade80]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.name === 'Enterprise'
                  ? window.location.href = 'mailto:hello@inframindhq.online?subject=Enterprise Plan'
                  : router.push('/signup')}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                  plan.ctaStyle === 'solid'
                    ? 'bg-[#4ade80] hover:bg-[#22c55e] text-black'
                    : 'bg-transparent border border-white/20 hover:border-[#4ade80]/50 hover:text-[#4ade80] text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom row - 2 plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.slice(3).map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-6 flex flex-col bg-[#26292f] border border-white/[0.08]"
            >
              <div className="flex items-start justify-between mb-5 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#4ade80]">
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-white/30 text-sm mb-1.5">{plan.period}</span>
                  </div>
                  <p className="text-white/30 text-xs">{plan.tagline}</p>
                </div>
                <div className="rounded-xl px-4 py-3 text-right bg-[#1e2128] border border-white/[0.06] flex-shrink-0">
                  <p className="text-white font-semibold text-sm">{plan.blogs}</p>
                  <p className="text-white/30 text-xs mt-0.5">{plan.generation}</p>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-0.5 text-xs flex-shrink-0 text-[#4ade80]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.name === 'Enterprise'
                  ? window.location.href = 'mailto:hello@inframindhq.online?subject=Enterprise Plan'
                  : router.push('/signup')}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                  plan.ctaStyle === 'solid'
                    ? 'bg-[#4ade80] hover:bg-[#22c55e] text-black'
                    : 'bg-transparent border border-white/20 hover:border-[#4ade80]/50 hover:text-[#4ade80] text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs mt-10">
          All plans include AI-powered blog generation, SEO optimization, and embed delivery. · Questions?{' '}
          <a href="mailto:hello@inframindhq.online" className="text-[#4ade80] hover:underline">
            hello@inframindhq.online
          </a>
        </p>
      </div>
    </div>
  );
}
