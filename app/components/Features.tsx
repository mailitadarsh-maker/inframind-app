export default function Features() {
  const features = [
    {
      icon: '◉',
      iconColor: '#1ddb78',
      bgColor: '#1ddb7810',
      title: 'Live uptime monitoring',
      description: 'Monitor websites and APIs with automatic health checks and real-time status updates.',
    },
    {
      icon: '✦',
      iconColor: '#a78bfa',
      bgColor: '#a78bfa12',
      title: 'Incident Tracking',
      description: 'Automatically record outages, recovery times, and downtime duration for every monitor.',
    },
    {
      icon: '⊙',
      iconColor: '#4d9fff',
      bgColor: '#4d9fff12',
      title: 'SSL Certificate Monitoring',
      description: 'Track SSL expiry dates and receive renewal warnings before certificates expire.',
    },
    {
      icon: '↑',
      iconColor: '#f5c542',
      bgColor: '#f5c54212',
      title: 'Public Status Pages',
      description: 'Share real-time service health and incident history with customers and teams.',
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
