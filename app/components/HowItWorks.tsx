export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect your app',
      description:
        'Enter a website URL, API endpointor SSL certificate to monitor.',
    },
    {
      number: '02',
      title: 'InfraMind checks availability',
      description:
        'Response times, and SSL health every few minutes.',
    },
    {
      number: '03',
      title: 'Get notified',
      description: "Receive email alerts instantly when services go down or recover.",
    },
  ];

  return (
    <section className="py-20 px-[5%] text-center" id="how">
      <div className="section-subtitle mb-3.5">How it works</div>
      <h2 className="section-title mb-3.5">
        From zero to <em className="text-[#1ddb78] italic not-italic">fully monitored</em> in 3 steps
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-6xl mx-auto">
        {steps.map((step) => (
          <div key={step.number} className="bg-[#0d1117] border border-white/[0.05] rounded-[14px] p-7">
            <div className="font-serif text-6xl text-white/[0.14] leading-none mb-3.5">{step.number}</div>
            <div className="text-lg font-semibold mb-2">{step.title}</div>
            <p className="text-sm text-[#8a95a3] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
