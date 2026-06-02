import Link from 'next/link';

export default function Testimonials() {
  return (
    <section className="py-24 px-[5%] text-center relative overflow-hidden">
      {/* Glow */}
      <div
        className="absolute w-[500px] h-[250px] rounded-full bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(29,219,120,0.09) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        <div className="section-subtitle mb-4.5">Get started today</div>
        <h2 className="font-serif text-5xl md:text-6xl lg:text-[54px] tracking-[-1px] leading-[1.15] mb-4.5">
          Your apps deserve someone <br />
          watching — <em className="text-[#1ddb78] italic not-italic">always.</em>
        </h2>
        <p className="text-base text-[#8a95a3] max-w-lg mx-auto mb-8 leading-relaxed">
          Connect your first app free. No credit card. No commitment.
        </p>
        <Link href="/signup" className="btn btn-primary btn-lg text-base px-8.5 py-3.5">
          Start monitoring free →
        </Link>
      </div>
    </section>
  );
}
