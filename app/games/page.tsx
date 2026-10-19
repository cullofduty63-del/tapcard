"use client";

import Link from "next/link";
import { useState } from "react";

type GameId = "dice" | "egg" | "wheel" | "box" | "scratch" | "envelope" | "balloon" | "safe" | "coin" | "target" | "slot";
type Prize = { name: string; icon: string };
const prizes: Prize[] = [
  { name: "۵٪ تخفیف", icon: "🏷️" }, { name: "۱۰ امتیاز باشگاه", icon: "⭐" },
  { name: "ارسال رایگان", icon: "🚚" }, { name: "هدیه ویژه", icon: "🎁" },
  { name: "۲۰٪ تخفیف", icon: "💜" }, { name: "این بار شانست رو امتحان کن!", icon: "🍀" },
];
const games: { id: GameId; title: string; icon: string; description: string }[] = [
  { id: "dice", title: "تاس شانس", icon: "🎲", description: "تاس بنداز و نتیجه رو ببین" },
  { id: "egg", title: "تخم‌مرغ شانسی", icon: "🥚", description: "یک تخم‌مرغ را برای جایزه انتخاب کن" },
  { id: "wheel", title: "گردونه شانس", icon: "🎡", description: "گردونه را بچرخان" },
  { id: "box", title: "جعبه جایزه", icon: "🎁", description: "یکی از جعبه‌ها را باز کن" },
  { id: "scratch", title: "کارت خراشیدنی", icon: "🎫", description: "کارت را لمس کن تا جایزه آشکار شود" },
  { id: "envelope", title: "پاکت شانس", icon: "✉️", description: "یک پاکت را انتخاب کن" },
  { id: "balloon", title: "بادکنک جایزه", icon: "🎈", description: "یک بادکنک را بترکان" },
  { id: "safe", title: "صندوق رمزدار", icon: "🔐", description: "یک صندوق را باز کن" },
  { id: "coin", title: "شیر یا خط", icon: "🪙", description: "سکه را بنداز" },
  { id: "target", title: "هدف شانسی", icon: "🎯", description: "یک هدف را انتخاب کن" },
  { id: "slot", title: "ماشین جایزه", icon: "🎰", description: "نمادهای جایزه را بچرخان" },
];

export default function GamesPage() {
  const [selected, setSelected] = useState<GameId>("wheel");
  const [result, setResult] = useState<Prize | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const game = games.find((g) => g.id === selected)!;
  function play(choice?: number) {
    if (busy || result) return;
    setBusy(true);
    setPicked(choice ?? null);
    window.setTimeout(() => {
      setResult(prizes[Math.floor(Math.random() * prizes.length)]);
      setAttempts((n) => n + 1);
      setBusy(false);
    }, selected === "wheel" ? 1150 : 450);
  }
  function reset() { setResult(null); setPicked(null); setBusy(false); }
  function choose(id: GameId) { setSelected(id); reset(); }
  const choices = selected === "egg" ? ["🥚", "🥚", "🥚", "🥚", "🥚"] : selected === "box" ? ["🎁", "🎁", "🎁", "🎁"] : selected === "envelope" ? ["✉️", "✉️", "✉️", "✉️"] : selected === "balloon" ? ["🎈", "🎈", "🎈", "🎈", "🎈"] : selected === "safe" ? ["🔐", "🔐", "🔐"] : selected === "target" ? ["🎯", "🎯", "🎯", "🎯"] : ["✨", "✨", "✨"];
  return <main dir="rtl" className="games-page">
    <style jsx global>{`
      .games-page{min-height:100vh;background:#08080b;color:#f7f7fb;padding:28px 18px 56px;font-family:inherit}
      .games-wrap{max-width:1120px;margin:auto}.games-top{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:26px}
      .games-brand{font-size:24px;font-weight:900;letter-spacing:-.7px}.games-brand span{color:#b9a0ff}.games-back{color:#e9e2ff;text-decoration:none;border:1px solid #34303e;border-radius:12px;padding:10px 14px}
      .games-hero{border:1px solid #292532;background:radial-gradient(ellipse at top right,#29203d 0%,#111015 48%,#0c0c10 100%);border-radius:26px;padding:clamp(22px,5vw,44px);margin-bottom:22px}
      .games-kicker{color:#c9b9ff;font-size:13px;font-weight:800}.games-hero h1{font-size:clamp(28px,5vw,44px);line-height:1.25;margin:12px 0}.games-hero p{color:#c4c0cd;max-width:670px;line-height:1.9;margin:0}
      .games-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,1.05fr);gap:18px}.games-panel{border:1px solid #292631;background:#101014;border-radius:22px;padding:20px;min-width:0}.games-panel h2{font-size:18px;margin:0 0 15px}
      .games-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.game-tile{background:#17171d;color:#f7f7fb;border:1px solid #302d38;border-radius:15px;padding:14px 10px;text-align:right;cursor:pointer;min-height:102px;transition:transform .16s,border-color .16s}.game-tile:hover{transform:translateY(-2px);border-color:#a78bfa}.game-tile.active{border-color:#b5a0ff;background:#241d34}.game-icon{font-size:27px;display:block;margin-bottom:8px}.game-title{display:block;font-weight:800}.game-desc{display:block;color:#a8a4b2;font-size:12px;margin-top:5px;line-height:1.6}
      .play-stage{min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px 0}.stage-icon{font-size:78px;filter:drop-shadow(0 8px 20px #9b7cff22)}.stage-icon.spin{animation:gameSpin 1.1s ease-in-out}.stage-title{font-size:21px;font-weight:900;margin:10px 0 4px}.stage-hint{color:#aaa6b3;font-size:13px;line-height:1.7}.pick-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:18px}.pick-btn{font-size:30px;width:58px;height:58px;background:#1b1921;border:1px solid #3b3548;border-radius:15px;cursor:pointer}.pick-btn:disabled{opacity:.55;cursor:default}.primary-game-btn{background:#f3efff;color:#1a1425;border:0;border-radius:13px;padding:13px 22px;font-weight:900;cursor:pointer;margin-top:18px}.primary-game-btn:disabled{opacity:.55;cursor:wait}.prize-result{margin-top:18px;border:1px solid #554477;background:#211a2c;border-radius:16px;padding:16px;max-width:100%;width:100%;animation:popIn .28s ease}.prize-result strong{display:block;font-size:20px;margin-top:7px}.demo-note{margin-top:18px;background:#17151d;border:1px solid #332b40;color:#bdb5ca;border-radius:14px;padding:13px;font-size:12px;line-height:1.8}.games-stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.games-stat{background:#17171d;border-radius:12px;padding:10px 13px;color:#bcb7c8;font-size:12px}.games-stat b{color:#fff;margin-right:5px}
      @keyframes gameSpin{to{transform:rotate(720deg) scale(1.12)}}@keyframes popIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @media(max-width:760px){.games-layout{grid-template-columns:1fr}.games-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.games-page{padding:16px 12px 36px}.games-panel{padding:15px}.games-hero{border-radius:20px}}
    `}</style>
    <div className="games-wrap">
      <header className="games-top"><div className="games-brand">Lumo<span>Card</span> <small style={{fontSize:12,color:"#999",fontWeight:500}}> / باشگاه مشتریان</small></div><Link className="games-back" href="/dashboard">بازگشت به داشبورد ←</Link></header>
      <section className="games-hero"><div className="games-kicker">LUMOCARD • LOYALTY ARCADE</div><h1>هر بار، یک تجربه‌ی شانسی 🎁</h1><p>بازی موردنظرت رو انتخاب کن، بازی کن و جایزه‌ی نمایشی رو ببین. این صفحه نمونه‌ی تعاملی ظاهر بازی‌هاست و هنوز جایزه واقعی یا امتیاز حساب کاربر ثبت نمی‌کند.</p></section>
      <div className="games-layout">
        <section className="games-panel"><h2>🎮 انتخاب بازی</h2><div className="games-grid">{games.map((g)=><button key={g.id} className={`game-tile ${selected===g.id?"active":""}`} onClick={()=>choose(g.id)}><span className="game-icon">{g.icon}</span><span className="game-title">{g.title}</span><span className="game-desc">{g.description}</span></button>)}</div></section>
        <section className="games-panel"><h2>{game.icon} {game.title}</h2><div className="play-stage"><div className={`stage-icon ${busy?"spin":""}`}>{busy ? (selected==="wheel"?"🎡":"✨") : result ? result.icon : game.icon}</div><div className="stage-title">{result ? "نتیجه بازی" : busy ? "در حال اجرا…" : game.title}</div><div className="stage-hint">{result ? "این نتیجه فقط نمایشی است." : game.description}</div>
          {["egg","box","envelope","balloon","safe","target"].includes(selected) && !result && <div className="pick-row">{choices.map((icon,i)=><button key={`${selected}-${i}`} className="pick-btn" disabled={busy} aria-label={`انتخاب گزینه ${i+1}`} onClick={()=>play(i)}>{icon}</button>)}</div>}
          {selected==="dice"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>🎲 انداختن تاس</button>}
          {selected==="coin"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>🪙 انداختن سکه</button>}
          {selected==="slot"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>🎰 چرخاندن نمادها</button>}
          {selected==="scratch"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>✨ آشکار کردن کارت</button>}
          {selected==="wheel"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>چرخاندن گردونه 🎡</button>}
          {result&&<div className="prize-result"><span>جایزه نمایشی</span><strong>{result.icon} {result.name}</strong><button className="primary-game-btn" onClick={reset}>بازی دوباره</button></div>}
        </div><div className="games-stats"><div className="games-stat">بازی‌های موجود <b>{games.length}</b></div><div className="games-stat">تعداد اجرا در این صفحه <b>{attempts}</b></div></div><div className="demo-note">🔒 حالت نمونه: نتیجه در مرورگر ساخته می‌شود و به حساب یا باشگاه مشتریان اضافه نمی‌شود. برای نسخه واقعی باید جدول‌های Supabase، قوانین محدودیت تلاش، موجودی جایزه و انتخاب نتیجه در سمت سرور پیاده‌سازی شوند.</div></section>
      </div>
    </div>
  </main>;
}

