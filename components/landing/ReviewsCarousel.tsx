'use client';

import { useEffect, useRef, useState } from "react";

const POSTS = [
  {
    id: "0",
    name: "Dorababu B",
    initials: "DB",
    photo: "",
    avatarBg: "#0077B5",
    avatarText: "#fff",
    role: "Backend Engineer | Python, FastAPI, MongoDB, PostgreSQL | AWS, Docker",
    post_text: "Hey, I've been using InfraMindHQ to monitor my apps and websites — it alerts me the moment something goes down and even tells me what's wrong in plain English. If you run an app without a dev team, check it out",
    linkedin_url: "https://www.linkedin.com/",
    likes: 2,
    comments: 0,
    time_ago: "1h",
  },
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
  {
    id: "3",
    name: "Ebin Johnson",
    initials: "EJ",
    photo: "",
    avatarBg: "#0077B5",
    avatarText: "#fff",
    role: "3D Artist and Graphic Designer",
    post_text: "Hey, I've been using InfraMindHQ to monitor my apps and websites — it alerts me the moment something goes down and even tells me what's wrong in plain English. If you run an app without a dev team, check it out",
    linkedin_url: "https://www.linkedin.com/posts/ebin-johnson_hey-ive-been-using-inframindhq-to-monitor-share-7472530583869386752-E53V/",
    likes: 1,
    comments: 1,
    time_ago: "31m",
  },
];

function LinkedInBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#0077B5"/>
      <path d="M7.5 9.5H5V19H7.5V9.5Z" fill="white"/>
      <circle cx="6.25" cy="6.75" r="1.5" fill="white"/>
      <path d="M19 19H16.5V14C16.5 12.9 15.85 12 14.75 12C13.65 12 13 12.9 13 14V19H10.5V9.5H13V11C13.5 10 14.75 9.25 16 9.25C17.75 9.25 19 10.5 19 12.75V19Z" fill="white"/>
    </svg>
  );
}

export default function ReviewsCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [cur, setCur] = useState(0);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const animating = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  function goTo(next: number) {
    if (animating.current) return;
    animating.current = true;
    setPhase("exit");
    setTimeout(() => {
      setCur(next);
      setPhase("enter");
      setTimeout(() => {
        setPhase("idle");
        animating.current = false;
      }, 500);
    }, 300);
  }

  useEffect(() => {
    if (POSTS.length < 2) return;
    const timer = setInterval(() => goTo((cur + 1) % POSTS.length), 5000);
    return () => clearInterval(timer);
  }, [cur]);

  const p = POSTS[cur];

  const cardStyle: React.CSSProperties = !visible
    ? { opacity: 0, transform: "translateY(20px)" }
    : phase === "exit"
    ? { opacity: 0, transform: "translateY(-14px) scale(0.98)", transition: "opacity 0.3s ease, transform 0.3s ease" }
    : phase === "enter"
    ? { opacity: 0, transform: "translateY(18px) scale(0.98)" }
    : {
        opacity: 1,
        transform: "translateY(0) scale(1)",
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      };

  return (
    <section ref={ref} className="py-28 px-6 bg-[#2b3039]">
      <style>{`
        @keyframes layerIn {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Left */}
          <div className="md:w-[220px] flex-shrink-0 flex flex-col gap-4">
            <p
              className="text-[11px] font-medium tracking-[0.12em] uppercase text-text-2"
              style={{ animation: visible ? "layerIn 0.6s cubic-bezier(0.16,1,0.3,1) 0s forwards" : "none", opacity: visible ? undefined : 0 }}
            >Social Proof</p>
            <h2
              className="font-serif text-3xl leading-tight text-text"
              style={{ animation: visible ? "layerIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.12s forwards" : "none", opacity: visible ? undefined : 0 }}
            >
              Real users.<br />
              <span className="text-green">Real posts.</span>
            </h2>

            <div className="mt-8 flex flex-col gap-5">
              <div
                className="flex items-center gap-2"
                style={{ animation: visible ? "layerIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.24s forwards" : "none", opacity: visible ? undefined : 0 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-green/40 animate-pulse inline-block" style={{ animationDelay: "0.3s" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-green/20 animate-pulse inline-block" style={{ animationDelay: "0.6s" }} />
                <p className="text-[11px] text-text-2 ml-1">people are reading this right now</p>
              </div>
              <p
                className="text-[13px] text-text-2 leading-relaxed border-l-2 border-green/40 pl-3"
                style={{ animation: visible ? "layerIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.36s forwards" : "none", opacity: visible ? undefined : 0 }}
              >
                Every post here is from a real person who chose to share InfraMind publicly.
              </p>
            </div>

            {POSTS.length > 1 && (
              <div
                className="flex items-center gap-2 mt-2"
                style={{ animation: visible ? "layerIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.48s forwards" : "none", opacity: visible ? undefined : 0 }}
              >
                {POSTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={"h-2 rounded-full transition-all duration-300 " + (i === cur ? "bg-green w-5" : "bg-white/20 w-2")}
                    aria-label={"Go to post " + (i + 1)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — post card */}
          <div
            className="flex-1 rounded-2xl border border-white/[0.08] bg-[#1e2128] p-6"
            style={cardStyle}
          >
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
                    <LinkedInBadge />
                  </div>
                  <p className="text-xs text-text-2 mt-0.5 leading-snug">{p.role}</p>
                  <p className="text-xs text-text-2 mt-0.5">{p.time_ago} · 🌐</p>
                </div>
              </div>
              <span className="text-text-2 text-lg">···</span>
            </div>

            <p className="text-[15px] text-text leading-relaxed mb-4">
              {p.post_text.split("InfraMindHQ").map((part: string, i: number, arr: string[]) => (
                <span key={i}>{part}{i < arr.length - 1 && <span className="text-green font-medium">InfraMindHQ</span>}</span>
              ))}
            </p>

            <a
              href={p.linkedin_url}
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
