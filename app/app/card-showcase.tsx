"use client";

import { useEffect, useState, type CSSProperties } from "react";

const CARDS = [
  { name: "آبی", image: "/card-designs/card-1.png", color: "#4B5BA8" },
  { name: "مشکی", image: "/card-designs/card-2.png", color: "#111111" },
  { name: "بنفش", image: "/card-designs/card-3.png", color: "#7416A6" },
  { name: "خاکستری", image: "/card-designs/card-4.png", color: "#888888" },
  { name: "زرشکی", image: "/card-designs/card-5.png", color: "#7A2B20" },
];

export default function PhysicalCardShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % CARDS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const card = CARDS[active];

  return (
    <div className="showcase-root" aria-label="مدل‌های کارت فیزیکی LumoCard">
      <style jsx>{`
        .showcase-root { width:100%; max-width:510px; margin:0 auto; position:relative; z-index:1; display:grid; justify-items:center; gap:18px; perspective:1200px; }
        .showcase-stage { width:100%; display:grid; place-items:center; min-height:310px; }
        .showcase-card { width:min(100%,420px); aspect-ratio:338 / 219; position:relative; border-radius:18px; overflow:hidden; background:#fff; border:1px solid rgba(255,255,255,.45); box-shadow:0 32px 85px color-mix(in srgb,var(--card-color) 35%,transparent),0 8px 24px rgba(0,0,0,.2); transform-style:preserve-3d; animation:showcase-float 4.4s ease-in-out infinite; }
        .showcase-card img { display:block; width:100%; height:100%; object-fit:cover; animation:card-reveal .75s ease both; }
        .showcase-card::after { content:""; pointer-events:none; position:absolute; inset:-35% -20%; background:linear-gradient(110deg,transparent 37%,rgba(255,255,255,.55) 49%,transparent 60%); transform:translateX(-100%) rotate(-10deg); animation:shine 5.2s ease-in-out infinite; }
        .showcase-label { color:#d8c9e9; font-size:13px; letter-spacing:.06em; }
        .showcase-dots { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; }
        .showcase-dot { display:flex; align-items:center; gap:8px; border:1px solid #393044; border-radius:999px; background:#13101a; color:#e9ddf8; padding:8px 12px; cursor:pointer; min-height:40px; }
        .showcase-dot[aria-pressed="true"] { border-color:#c084fc; background:#241632; }
        .swatch { width:12px; height:12px; border-radius:50%; border:1px solid rgba(255,255,255,.4); }
        @keyframes card-reveal { from{opacity:.35;transform:rotateY(78deg) scale(.94)} to{opacity:1;transform:rotateY(0deg) scale(1)} }\n        @keyframes showcase-float { 0%,100%{transform:rotateY(-10deg) rotateX(4deg) translateY(0)} 50%{transform:rotateY(10deg) rotateX(-2deg) translateY(-9px)} }
        @keyframes shine { 0%,25%{transform:translateX(-100%) rotate(-10deg)} 75%,100%{transform:translateX(100%) rotate(-10deg)} }
        @media(max-width:640px){.showcase-stage{min-height:220px}.showcase-card{border-radius:14px}}
        @media(prefers-reduced-motion:reduce){.showcase-card,.showcase-card::after,.showcase-card img{animation:none}}
      `}</style>
      <div className="showcase-stage">
        <div className="showcase-card" key={card.image} style={{ "--card-color": card.color } as CSSProperties}>
          <img src={card.image} alt={`کارت فیزیکی LumoCard رنگ ${card.name}`} />
        </div>
      </div>
      <div className="showcase-label">کارت‌های فیزیکی LumoCard · انتخاب رنگ</div>
      <div className="showcase-dots">
        {CARDS.map((item, index) => (
          <button key={item.image} className="showcase-dot" type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
            <span className="swatch" style={{ background: item.color }} />
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
