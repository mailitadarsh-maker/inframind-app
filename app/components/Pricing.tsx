export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: '1 app, forever',
      features: ['1 app monitored', 'Uptime monitoring', '1 AI report/month'],
      cta: 'Get started →',
      primary: false,
    },
    {
      name: 'Pay-per-use',
      price: '₹0+',
      period: 'pay as you go',
      features: ['Monitoring ₹400/app', 'Scan ₹160 each', 'AI report ₹80 each', 'WhatsApp alerts'],
      cta: 'Start free →',
      primary: true,
      featured: true,
    },
    {
      name: 'Business',
      price: '₹8,200',
      period: 'max/month then unlimited',
      features: ['Up to 20 apps', 'Unlimited everything', 'Priority support'],
      cta: 'Upgrade →',
      primary: false,
    },
  ];

  return (
    <section className="py-20 px-[5%] text-center" id="pricing">
      <div className="section-subtitle mb-3.5">Pricing</div>
      <h2 className="section-title mb-3.5">
        Pay only for <em className="text-[#1ddb78] italic not-italic">what you use.</em>
      </h2>
      <p className="text-base text-[#8a95a3] max-w-lg mx-auto mb-12 leading-relaxed">
        No subscriptions. No per-seat fees. Pay only when InfraMind does something.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[14px] p-6.5 text-left relative ${
              plan.featured
                ? 'bg-gradient-to-br from-[#1ddb7810] to-[#0d1117] border-2 border-[#1ddb78]'
                : 'bg-[#0d1117] border border-white/[0.05]'
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1ddb78] text-black text-xs font-bold px-3 py-0.75 rounded-full">
                MOST POPULAR
              </div>
            )}

            <div className="text-xs font-semibold text-[#8a95a3] uppercase mb-2.5">
              {plan.featured && <span className="text-[#1ddb78]">{plan.name} ✓</span>}
              {!plan.featured && plan.name}
            </div>

            <div className="font-serif text-3xl tracking-[-1px] leading-none mb-1">
              <span className={plan.featured ? 'text-[#1ddb78]' : ''}>{plan.price}</span>
            </div>

            <div className="text-xs text-[#3d4f63] mb-4.5">{plan.period}</div>

            <button
              className={`w-full py-2.75 rounded-lg text-sm font-semibold mb-4.5 transition-all ${
                plan.featured
                  ? 'btn btn-primary'
                  : 'bg-[#131920] text-[#8a95a3] border border-white/[0.1] hover:text-[#eef1f6]'
              }`}
            >
              {plan.cta}
            </button>

            <div className="h-px bg-white/[0.05] my-4.5" />

            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-[#8a95a3] py-1">
                <span className="text-[#1ddb78] font-bold">✓</span>
                {feature}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
