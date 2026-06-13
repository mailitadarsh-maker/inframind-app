const faqs = [
  {
    q: "What is InfraMind?",
    a: "InfraMind is an AI-powered infrastructure monitoring platform that checks the uptime, performance, and SSL certificate health of your websites and APIs around the clock. When something goes wrong, InfraMind explains the issue in plain English with a step-by-step fix — so you don't need a full-time developer or DevOps engineer to keep your apps running.",
  },
  {
    q: "How do I check if my website is down?",
    a: "Add your website URL to InfraMind and it will run automated health checks every few minutes from our monitoring servers. If your site stops responding or returns an error, InfraMind detects it immediately and sends you an email alert with an AI-generated explanation of what likely went wrong and how to fix it.",
  },
  {
    q: "What types of monitoring does InfraMind support?",
    a: "InfraMind supports three core monitor types: website uptime monitoring, API endpoint monitoring (checking response codes, response times, and availability), and SSL certificate monitoring (tracking expiry dates and warning you before certificates lapse).",
  },
  {
    q: "How does InfraMind's AI incident analysis work?",
    a: "When a monitor detects downtime, an SSL issue, or a slow response, InfraMind's AI analyzes the failure pattern and generates a plain-English root cause explanation along with recommended next steps — written for non-technical founders and business owners, not just engineers.",
  },
  {
    q: "Is InfraMind free to use?",
    a: "Yes. InfraMind is currently in free beta. You can sign up, add monitors, and receive AI-powered incident alerts at no cost. Paid plans with higher monitor limits, team workspaces, and Slack integration are planned for the future.",
  },
  {
    q: "How quickly does InfraMind detect downtime?",
    a: "InfraMind checks your websites, APIs, and SSL certificates at regular intervals — typically every few minutes — and sends an email alert as soon as a check fails, so you're notified close to real time.",
  },
  {
    q: "Can I share a public status page with my customers?",
    a: "Yes. InfraMind lets you create a public status page that displays the real-time health of your services along with a history of past incidents, so your customers and team can see uptime transparency without contacting support.",
  },
  {
    q: "Do I need technical or DevOps knowledge to use InfraMind?",
    a: "No. InfraMind is designed for non-technical founders and small business owners. Setup takes about three minutes — just enter a URL — and the AI-generated incident reports use plain language instead of technical jargon, so you can understand and act on issues without an engineering background.",
  },
  {
    q: "How is InfraMind different from other uptime monitoring tools?",
    a: "Most uptime monitoring tools only tell you that something is down. InfraMind goes further by using AI to diagnose why it's likely down — covering server errors, SSL expiry, DNS issues, and slow response times — and explains the fix in plain English, combining uptime, API, and SSL monitoring in a single dashboard.",
  },
  {
    q: "How do I get extra trial days or more monitors on InfraMind?",
    a: "InfraMind offers a LinkedIn sharing reward: share InfraMind on LinkedIn using the link in your dashboard, and once approved you'll automatically receive 14 extra trial days and 10 additional monitors at no extra cost.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="px-6 py-20 bg-[#1f2128]">
      <div className="max-w-3xl mx-auto">
        <p className="text-green text-xs font-semibold uppercase tracking-wide mb-2 text-center">FAQ</p>
        <h2 className="text-2xl md:text-3xl font-bold text-text text-center mb-12">
          Frequently asked questions
        </h2>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group bg-[#1a1c22] border border-white/[0.05] rounded-xl px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer text-text text-sm font-semibold">
                {item.q}
                <span className="text-green text-lg ml-4 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-text-2 text-sm leading-relaxed mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* FAQPage structured data for SEO / AI answer engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
