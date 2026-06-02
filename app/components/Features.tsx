export default function Features() {
  const features = [
    {
      icon: '◉',
      iconColor: '#1ddb78',
      bgColor: '#1ddb7810',
      title: 'Live uptime monitoring',
      description: 'Checks every 60 seconds. Instant WhatsApp + email alert the moment your app goes down.',
    },
    {
      icon: '✦',
      iconColor: '#a78bfa',
      bgColor: '#a78bfa12',
      title: 'AI health reports',
      description: 'Plain-English reports after every scan. Understand your app without a developer to explain it.',
    },
    {
      icon: '⊙',
      iconColor: '#4d9fff',
      bgColor: '#4d9fff12',
      title: 'Security scanner',
      description: 'Scans packages for vulnerabilities, missing headers, and exposed endpoints automatically.',
    },
    {
      icon: '↑',
      iconColor: '#f5c542',
      bgColor: '#f5c54212',
      title: 'One-click deployments',
      description: 'Push updates from the dashboard. Auto rollback if the new version causes issues.',
    },
  ];

  return (
    <section className="py-20 bg-[#0d1117] border-t border-b border-white/[0.05] px-[5%] text-center" id="features">
      <div className="section-subtitle mb-3.5">Features</div>
      <h2 className="section-title mb-3.5">
        Everything to keep your apps <em className="text-[#1ddb78] italic not-italic">healthy</em>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-12 max-w-4xl mx-auto">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-[#07090d] border border-white/[0.05] rounded-[14px] p-6 text-left">
            <div
              className="w-9.5 h-9.5 rounded-lg flex items-center justify-center text-lg mb-3.5"
              style={{ backgroundColor: feature.bgColor, color: feature.iconColor }}
            >
              {feature.icon}
            </div>
            <div className="text-base font-semibold mb-1.5">{feature.title}</div>
            <p className="text-sm text-[#8a95a3] leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
