'use client';

import { useEffect, useRef, useState } from "react";

const POSTS = [
  {
    id: "1",
    name: "Farhathullah Najeeb",
    initials: "FN",
    photo: "",
    avatarBg: "#0077B5",
    avatarText: "#fff",
    role: "Senior Flutter Developer @ Pips Technology | Dart · Riverpod · Fintech SDK",
    post_text: "Hey, I've been using InfraMindHQ to monitor my apps and websites — it alerts me the moment something goes down and even tells me what's wrong in plain English. If you run an app without a dev team, check it out",
    linkedin_url: "https://www.linkedin.com/posts/farhathullah-najeeb-954a0b238_hey-ive-been-using-inframindhq-to-monitor-share-7470816777627922433-HV2e/",
    likes: 3,
    comments: 1,
    time_ago: "3d",
  },
  {
    id: "2",
    name: "Abhijith T",
    initials: "AT",
    photo: "",
    avatarBg: "#1a1a2e",
    avatarText: "#4ade80",
    role: "Full-Stack Developer | MERN Stack | React.js | Node.js | Express.js | MongoDB",
    post_text: "Hey, I've been using InfraMindHQ to monitor my apps and websites — it alerts me the moment something goes down and even tells me what's wrong in plain English. If you run an app without a dev team, check it out",
    linkedin_url: "https://www.linkedin.com/feed/update/urn:li:activity:7470819217626398720",
    likes: 2,
    comments: 1,
    time_ago: "4d",

  },
];

export default function ReviewsCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (POSTS.length < 2) return;
    const timer = setInterval(() => setCur((c) => (c + 1) % POSTS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const p = POSTS[cur];

  return (
    <section ref={ref} className="py-28 px-6 bg-[#2b3039]">
      <style>{`
        @keyframes blurFade {
          0% { opacity: 0; filter: blur(10px); transform: scale(0.98) translateY(12px); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1) translateY(0); }
        }
      `}</style>
      <div
        className="max-w-5xl mx-auto transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Left */}
          <div className="md:w-[220px] flex-shrink-0 flex flex-col gap-4">
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-text-2">Social Proof</p>
            <h2 className="font-serif text-3xl leading-tight text-text">
              Real users.<br />
              <span className="text-green">Real posts.</span>
            </h2>

            <div className="mt-8 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-green/40 animate-pulse inline-block" style={{ animationDelay: "0.3s" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-green/20 animate-pulse inline-block" style={{ animationDelay: "0.6s" }} />
                <p className="text-[11px] text-text-2 ml-1">people are reading this right now</p>
              </div>
              <p className="text-[13px] text-text-2 leading-relaxed border-l-2 border-green/40 pl-3">
                Every post here is from a real person who chose to share InfraMind publicly — no incentives, no edits.
              </p>
            </div>

            {POSTS.length > 1 && (
              <div className="flex items-center gap-2 mt-2">
                {POSTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCur(i)}
                    className={"h-2 rounded-full transition-all duration-300 " + (i === cur ? "bg-green w-5" : "bg-white/20 w-2")}
                    aria-label={"Go to post " + (i + 1)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — post card */}
          <div key={cur} className="flex-1 rounded-2xl border border-white/[0.08] bg-[#1e2128] p-6" style={{ animation: "blurFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards", willChange: "transform, opacity, filter" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden" style={{ background: p.avatarBg || "#3b82f6" }}>
                  {p.photo ? (
                    <img src={p.photo} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-semibold text-sm" style={{ color: p.avatarText || "#fff" }}>{p.initials}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text">{p.name}</p>
                    <span className="w-4 h-4 rounded-sm bg-[#0077B5] inline-flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><path d="M1 1h2.5v7.5H1V1zm1.25-1a1.25 1.25 0 110 2.5A1.25 1.25 0 012.25 0zM5 1h2.4v1.02h.03C7.77 1.4 8.5 1 9.5 1 11.5 1 12 2.2 12 4v4.5H9.5V4.5c0-.9-.02-2-1.25-2S6.9 3.65 6.9 4.43V8.5H5V1z"/></svg>
                    </span>
                  </div>
                  <p className="text-xs text-text-2 mt-0.5 leading-snug">{p.role}</p>
                  <p className="text-xs text-text-2 mt-0.5">{p.time_ago} · 🌐</p>
                </div>
              </div>
              <span className="text-text-2 text-lg">···</span>
            </div>

            <p className="text-[15px] text-text leading-relaxed mb-4">
              {p.post_text.split("InfraMindHQ").map((part, i, arr) => (
                <span key={i}>{part}{i < arr.length - 1 && <span className="text-green font-medium">InfraMindHQ</span>}</span>
              ))}
            </p>

            
            {p.link_preview && (
              
                <a
                href={p.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-4 rounded-xl border border-white/[0.08] overflow-hidden hover:border-white/20 transition-colors"
              >
                <img src={p.link_preview.image} alt={p.link_preview.title} className="w-full h-[140px] object-cover block bg-[#1e2025]" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div className="px-3 py-2 bg-[#26292f]">
                  <p className="text-sm font-semibold text-text leading-snug">{p.link_preview.title}</p>
                  <p className="text-xs text-text-2 mt-0.5">{p.link_preview.domain}</p>
                </div>
              </a>
            )}

            <a href={p.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-green hover:underline mb-4 block cursor-pointer"
            >
              View on LinkedIn ↗
            </a>

            <div className="border-t border-white/[0.06] pt-3 flex items-center gap-5 text-xs text-text-2">
              {p.likes > 0 && <span>👍 {p.likes}</span>}
              {p.comments > 0 && <span>💬 {p.comments}</span>}
              <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="ml-auto hover:text-green transition-colors">Repost</a>
              <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-green transition-colors">Send</a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
