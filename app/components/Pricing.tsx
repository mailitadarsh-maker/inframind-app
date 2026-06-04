export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'while in beta',
      features: [
        'Website Monitoring',
        'API Monitoring',
        'SSL Monitoring',
        'Email Alerts',
        'Incident Tracking',
        'Public Status Pages',
      ],
      cta: 'Start Free →',
      primary: true,
      featured: true,
    },
    {
      name: 'Coming Soon',
      price: '—',
      period: 'future plans',
      features: [
        'AI Incident Analysis',
        'Team Workspaces',
        'Slack Alerts',
        'Custom Branding',
      ],
      cta: 'Join Waitlist →',
      primary: false,
      featured: false, // Explicitly defined to prevent undefined behavior
    },
  ];

  return (
    <section className="py-20 px-[5%] text-center" id="pricing">
      <div className="text-sm font-semibold text-[#1ddb78] uppercase tracking-wider mb-4">
        Pricing
      </div>
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        Pay only for <em className="text-[#1ddb78] italic">what you use.</em>
      </h2>
      <p className="text-base text-[#8a95a3] max-w-lg mx-auto mb-12 leading-relaxed">
        No subscriptions. No per-seat fees. Pay only when InfraMind does
        something.
      </p>

      {/* Changed to md:grid-cols-2 since there are only 2 plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 text-left relative ${
              plan.featured
                ? 'bg-gradient-to-br from-[#1ddb7810] to-[#0d1117] border-2 border-[#1ddb78]'
                : 'bg-[#0d1117] border border-white/[0.05]'
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1ddb78] text-black text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}

            <div className="text-xs font-semibold text-[#8a95a3] uppercase mb-2">
              {plan.featured ? (
                <span className="text-[#1ddb78]">{plan.name} ✓</span>
              ) : (
                plan.name
              )}
            </div>

            <div className="font-serif text-4xl tracking-tight leading-none mb-1">
              <span className={plan.featured ? 'text-[#1ddb78]' : 'text-white'}>
                {plan.price}
              </span>
            </div>

            <div className="text-xs text-[#8a95a3] mb-6">{plan.period}</div>

            <button
              className={`w-full py-3 rounded-lg text-sm font-semibold mb-6 transition-all ${
                plan.featured
                  ? 'bg-[#1ddb78] hover:bg-[#19c76b] text-black' // Adjusted to ensure button works without a custom 'btn' class
                  : 'bg-[#131920] text-[#8a95a3] border border-white/[0.1] hover:text-[#eef1f6]'
              }`}
            >
              {plan.cta}
            </button>

            <div className="h-px bg-white/[0.05] my-6" />

            <div className="space-y-3">
              {plan.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-sm text-[#8a95a3]"
                >
                  <span className="text-[#1ddb78] font-bold">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}