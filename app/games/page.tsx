"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [error, setError] = useState("");
  const game = games.find((g) => g.id === selected)!;
  async function play(choice?: number) {
    if (busy || result) return;
    setBusy(true); setError(""); setPicked(choice ?? null);
    try {
      const { data, error: rpcError } = await supabase.rpc("play_lumocard_game", { p_game_slug: selected });
      if (rpcError) {
        const msg = rpcError.message || "";
        if (/AUTH_REQUIRED|JWT|auth/i.test(msg)) setError("برای بازی واقعی ابتدا وارد حساب LumoCard شو.");
        else if (/GAME_NOT_CONFIGURED/i.test(msg)) setError("این بازی هنوز توسط مدیر فعال و جایزه‌گذاری نشده است.");
        else setError("اجرای بازی انجام نشد. تنظیمات بازی و تابع دیتابیس را بررسی کن.");
        return;
      }
      const outcome = data as { status?: string; prize_name?: string; message?: string } | null;
      setResult({ name: outcome?.status === "won" ? (outcome.prize_name || "جایزه") : "این بار جایزه‌ای برنده نشدی", icon: outcome?.status === "won" ? "🎁" : "🍀" });
      setAttempts(n => n + 1);
    } catch {
      setError("اتصال به سرویس بازی برقرار نشد. تنظیمات Supabase را بررسی کن.");
    } finally { setBusy(false); }
  }
  function reset() { setResult(null); setPicked(null); setBusy(false); setError(""); }
  function choose(id: GameId) { setSelected(id); reset(); }
  const choices = selected === "egg" ? ["🥚", "🥚", "🥚", "🥚", "🥚"] : selected === "box" ? ["🎁", "🎁", "🎁", "🎁"] : selected === "envelope" ? ["✉️", "✉️", "✉️", "✉️"] : selected === "balloon" ? ["🎈", "🎈", "🎈", "🎈", "🎈"] : selected === "safe" ? ["🔐", "🔐", "🔐"] : selected === "target" ? ["🎯", "🎯", "🎯", "🎯"] : ["✨", "✨", "✨"];
  return <main dir="rtl" className="games-page">
    <style jsx global>{`
      .games-page{min-height:100vh;background:#08080b;color:#f7f7fb;padding:28px 18px 56px;font-family:inherit}
      .games-wrap{max-width:1120px;margin:auto}.games-top{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:26px}
      .games-brand{font-size:24px;font-weight:900;letter-spacing:-.7px}.games-brand span{color:#eeeeee}.games-back{color:#eeeeee;text-decoration:none;border:1px solid #343434;border-radius:12px;padding:10px 14px}
      .games-hero{border:1px solid #292929;background:radial-gradient(ellipse at top right,#202020 0%,#111015 48%,#0c0c10 100%);border-radius:26px;padding:clamp(22px,5vw,44px);margin-bottom:22px}
      .games-kicker{color:#dddddd;font-size:13px;font-weight:800}.games-hero h1{font-size:clamp(28px,5vw,44px);line-height:1.25;margin:12px 0}.games-hero p{color:#c4c4c4;max-width:670px;line-height:1.9;margin:0}
      .games-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,1.05fr);gap:18px}.games-panel{border:1px solid #292929;background:#101014;border-radius:22px;padding:20px;min-width:0}.games-panel h2{font-size:18px;margin:0 0 15px}
      .games-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.game-tile{background:#17171d;color:#f7f7fb;border:1px solid #303030;border-radius:15px;padding:14px 10px;text-align:right;cursor:pointer;min-height:102px;transition:transform .16s,border-color .16s}.game-tile:hover{transform:translateY(-2px);border-color:#dddddd}.game-tile.active{border-color:#ffffff;background:#242424}.game-icon{font-size:27px;display:block;margin-bottom:8px}.game-title{display:block;font-weight:800}.game-desc{display:block;color:#aaaaaa;font-size:12px;margin-top:5px;line-height:1.6}
      .play-stage{min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px 0}.stage-icon{font-size:78px;filter:drop-shadow(0 8px 20px #ffffff12)}.stage-icon.spin{animation:gameSpin 1.1s ease-in-out}.stage-title{font-size:21px;font-weight:900;margin:10px 0 4px}.stage-hint{color:#aaa6b3;font-size:13px;line-height:1.7}.pick-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:18px}.pick-btn{font-size:30px;width:58px;height:58px;background:#1b1921;border:1px solid #3b3b3b;border-radius:15px;cursor:pointer}.pick-btn:disabled{opacity:.55;cursor:default}.primary-game-btn{background:#f3efff;color:#1a1425;border:0;border-radius:13px;padding:13px 22px;font-weight:900;cursor:pointer;margin-top:18px}.primary-game-btn:disabled{opacity:.55;cursor:wait}.prize-result{margin-top:18px;border:1px solid #555555;background:#202020;border-radius:16px;padding:16px;max-width:100%;width:100%;animation:popIn .28s ease}.prize-result strong{display:block;font-size:20px;margin-top:7px}.demo-note{margin-top:18px;background:#17151d;border:1px solid #333333;color:#bdbdbd;border-radius:14px;padding:13px;font-size:12px;line-height:1.8}.games-stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.games-stat{background:#17171d;border-radius:12px;padding:10px 13px;color:#bcb7c8;font-size:12px}.games-stat b{color:#fff;margin-right:5px}
      @keyframes gameSpin{to{transform:rotate(720deg) scale(1.12)}}@keyframes popIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @media(max-width:760px){.games-layout{grid-template-columns:1fr}.games-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.games-page{padding:16px 12px 36px}.games-panel{padding:15px}.games-hero{border-radius:20px}}
    `}</style>
    <div className="games-wrap">
      <header className="games-top"><div className="games-brand">Lumo<span>Card</span> <small style={{fontSize:12,color:"#999",fontWeight:500}}> / باشگاه مشتریان</small></div><Link className="games-back" href="/dashboard">بازگشت به داشبورد ←</Link></header>
      <section className="games-hero"><div className="games-kicker">LUMOCARD • LOYALTY ARCADE</div><h1>هر بار، یک تجربه‌ی شانسی 🎁</h1><p>بازی موردنظرت رو انتخاب کن، بازی کن و جایزه‌ی نمایشی رو ببین. نتیجه و موجودی جایزه باید توسط موتور دیتابیس تعیین شود؛ برای فعال‌سازی هر بازی، مدیر باید بازی و جوایز آن را تنظیم کند.</p></section>
      <div className="games-layout">
        <section className="games-panel"><h2>🎮 انتخاب بازی</h2><div className="games-grid">{games.map((g)=><button key={g.id} className={`game-tile ${selected===g.id?"active":""}`} onClick={()=>choose(g.id)}><span className="game-icon">{g.icon}</span><span className="game-title">{g.title}</span><span className="game-desc">{g.description}</span></button>)}</div></section>
        <section className="games-panel"><h2>{game.icon} {game.title}</h2><div className="play-stage"><div className={`stage-icon ${busy?"spin":""}`}>{busy ? (selected==="wheel"?"🎡":"✨") : result ? result.icon : game.icon}</div><div className="stage-title">{result ? "نتیجه بازی" : busy ? "در حال اجرا…" : game.title}</div><div className="stage-hint">{result ? "نتیجه از موتور بازی سمت دیتابیس دریافت شده است." : game.description}</div>
          {["egg","box","envelope","balloon","safe","target"].includes(selected) && !result && <div className="pick-row">{choices.map((icon,i)=><button key={`${selected}-${i}`} className="pick-btn" disabled={busy} aria-label={`انتخاب گزینه ${i+1}`} onClick={()=>play(i)}>{icon}</button>)}</div>}
          {selected==="dice"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>🎲 انداختن تاس</button>}
          {selected==="coin"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>🪙 انداختن سکه</button>}
          {selected==="slot"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>🎰 چرخاندن نمادها</button>}
          {selected==="scratch"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>✨ آشکار کردن کارت</button>}
          {selected==="wheel"&&!result&&!busy&&<button className="primary-game-btn" onClick={()=>play()}>چرخاندن گردونه 🎡</button>}
          {error && <div role="alert" className="demo-note" style={{borderColor:"#777",color:"#fff"}}>{error}</div>}
          {result&&<div className="prize-result"><span>نتیجه بازی</span><strong>{result.icon} {result.name}</strong><button className="primary-game-btn" onClick={reset}>بازی دوباره</button></div>}
        </div><div className="games-stats"><div className="games-stat">بازی‌های موجود <b>{games.length}</b></div><div className="games-stat">تعداد اجرا در این صفحه <b>{attempts}</b></div></div><div className="demo-note">🔒 نتیجه در مرورگر به‌صورت تصادفی ساخته نمی‌شود. بازی فقط با حساب واردشده و تابع امن Supabase اجرا می‌شود؛ قبل از فعال‌سازی عمومی، مدیر باید جوایز، احتمال‌ها و موجودی را تنظیم و تست کند.</div></section>
      </div>
    </div>
  </main>;
}

