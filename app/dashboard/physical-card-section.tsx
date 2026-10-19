"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type CardOrder = {
  id: string;
  requested_color: string;
  phone_number: string;
  status: "pending" | "approved" | "rejected" | "activated";
  assigned_color?: string | null;
  physical_card_number?: string | null;
  created_at: string;
};

const COLORS = [
  { value: "#4B5BA8", label: "آبی", text: "#FFFFFF", image: "/card-designs/card-1.png" },
  { value: "#111111", label: "مشکی", text: "#FFFFFF", image: "/card-designs/card-2.png" },
  { value: "#7416A6", label: "بنفش", text: "#FFFFFF", image: "/card-designs/card-3.png" },
  { value: "#888888", label: "خاکستری", text: "#FFFFFF", image: "/card-designs/card-4.png" },
  { value: "#7A2B20", label: "زرشکی", text: "#FFFFFF", image: "/card-designs/card-5.png" },
];

const STATUS: Record<CardOrder["status"], string> = {
  pending: "در انتظار بررسی ادمین",
  approved: "تأیید شده؛ در حال آماده‌سازی",
  rejected: "درخواست رد شده",
  activated: "کارت فعال است",
};

export default function PhysicalCardSection({ customerName }: { customerName: string }) {
  const [orders, setOrders] = useState<CardOrder[]>([]);
  const [color, setColor] = useState(COLORS[0].value);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("نشست ورود پیدا نشد؛ دوباره وارد حساب شو.");
        return;
      }
      const response = await fetch("/api/card-orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "بارگذاری درخواست‌ها ناموفق بود.");
      const loaded: CardOrder[] = result.orders || [];
      setOrders(loaded);
      const current = loaded[0];
      if (current) {
        setColor(current.assigned_color || current.requested_color || COLORS[0].value);
        setPhone(current.phone_number || "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  async function submitRequest() {
    setError("");
    setNotice("");
    if (!/^\+?[0-9۰-۹٠-٩()\-\s]{7,20}$/.test(phone.trim())) {
      setError("شماره تماس معتبر وارد کن تا ادمین بتواند با تو تماس بگیرد.");
      return;
    }
    if (orders.some((item) => item.status === "pending" || item.status === "approved" || item.status === "activated")) {
      setError("در حال حاضر یک درخواست فعال یا در انتظار بررسی داری.");
      return;
    }
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("برای ثبت درخواست دوباره وارد حساب شو.");
      const response = await fetch("/api/card-orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requested_color: color, phone_number: phone.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ثبت درخواست ناموفق بود.");
      setNotice("درخواستت ثبت شد. حتماً برای اطلاع‌رسانی و پیگیری، به ادمین LumoCard هم پیام بده.");
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ارتباط با سرور برقرار نشد.");
    } finally {
      setSending(false);
    }
  }

  const current = orders[0];
  const shownColor = current?.status === "activated"
    ? (current.assigned_color || current.requested_color)
    : color;
  const shownColorMeta = COLORS.find((item) => item.value.toLowerCase() === shownColor.toLowerCase());
  const cardImage = shownColorMeta?.image || COLORS[0].image;
  const textColor = shownColorMeta?.text || "#FFFFFF";

  return (
    <section className="lc-panel physical-card-panel">
      <style jsx>{`
        .physical-card-panel { display:grid; gap:22px; }
        .physical-card-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(260px,.9fr); gap:24px; align-items:center; }
        .physical-card-preview { perspective:1000px; display:grid; place-items:center; padding:24px 8px; min-height:260px; }
        .physical-card { width:min(100%,360px); aspect-ratio:1.544; border-radius:18px; position:relative; overflow:hidden; box-shadow:0 28px 65px color-mix(in srgb,var(--card-color) 32%,transparent); transform-style:preserve-3d; animation:card-float 4.5s ease-in-out infinite; background:#fff; border:1px solid rgba(255,255,255,.4); }
        .physical-card-art { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .physical-card-overlay { position:absolute; right:7%; bottom:10%; max-width:68%; display:grid; gap:3px; color:#161616; text-align:right; text-shadow:0 1px 0 rgba(255,255,255,.6); }
        .physical-card-name { font-size:clamp(10px,1.4vw,14px); font-weight:800; overflow-wrap:anywhere; }
        .physical-card-number { font-size:9px; letter-spacing:.08em; direction:ltr; text-align:right; }
        .physical-card-bottom span:last-child { direction:ltr; }
        .physical-card-controls { display:grid; gap:16px; }
        .physical-card-label { display:block; margin-bottom:8px; color:#d8d1e3; font-size:13px; font-weight:700; }
        .physical-card-select,.physical-card-input { width:100%; min-height:46px; border-radius:12px; border:1px solid #393244; background:#0c0b12; color:#fff; padding:10px 12px; outline:none; }
        .physical-card-select:focus,.physical-card-input:focus { border-color:#c084fc; }
        .physical-card-status { border:1px solid #383044; background:#17131f; padding:13px 15px; border-radius:13px; line-height:1.8; color:#e9ddf8; }
        .physical-card-note { color:#aaa0b8; font-size:12px; line-height:1.9; margin:0; }
        .physical-card-alert { border-radius:12px; padding:12px 14px; line-height:1.8; font-size:13px; background:#20152b; color:#e9d5ff; }
        .physical-card-alert.error { background:#32151c; color:#fecdd3; }
        .physical-card-button { border:0; border-radius:12px; padding:13px 16px; background:linear-gradient(135deg,#a855f7,#7c3aed); color:white; font-weight:800; cursor:pointer; }
        .physical-card-button:disabled { opacity:.55; cursor:not-allowed; }
        @keyframes card-float { 0%,100%{ transform:rotateY(-9deg) rotateX(4deg) translateY(0); } 50%{ transform:rotateY(9deg) rotateX(-2deg) translateY(-9px); } }
        @keyframes card-shine { 0%,35%{transform:translateX(-80%) rotate(-12deg)} 70%,100%{transform:translateX(80%) rotate(-12deg)} }
        @media(max-width:760px){ .physical-card-grid{grid-template-columns:1fr}.physical-card-preview{min-height:220px;padding:8px 0 18px}.physical-card{padding:18px;border-radius:18px}.physical-card-name{margin-top:20px} }
        @media(prefers-reduced-motion:reduce){.physical-card,.physical-card:after{animation:none}}
      `}</style>

      <div className="lc-panel-heading">
        <div>
          <span className="lc-section-number">06 / PHYSICAL CARD</span>
          <h2>خرید کارت فیزیکی</h2>
          <p>رنگ دلخواهت را انتخاب کن و شماره‌ای وارد کن که ادمین بتواند برای هماهنگی سفارش با تو تماس بگیرد.</p>
        </div>
      </div>

      {error && <div className="physical-card-alert error" role="alert">{error}</div>}
      {notice && <div className="physical-card-alert" role="status">{notice}</div>}

      <div className="physical-card-grid">
        <div className="physical-card-preview">
          <div className="physical-card" style={{ "--card-color": shownColor, "--card-text": textColor } as CSSProperties}>
            <img className="physical-card-art" src={cardImage} alt={`طرح کارت فیزیکی LumoCard ${shownColorMeta?.label || ""}`} />
            <div className="physical-card-overlay">
              <span className="physical-card-name">{customerName || "LumoCard Customer"}</span>
              <span className="physical-card-number">{current?.physical_card_number || "LUMO • NFC"}</span>
            </div>
          </div>
        </div>

        <div className="physical-card-controls">
          {current ? (
            <div className="physical-card-status">
              <strong>وضعیت سفارش: {STATUS[current.status]}</strong>
              <div>رنگ درخواستی: {COLORS.find((item) => item.value === current.requested_color)?.label || current.requested_color}</div>
              {current.physical_card_number && <div>شناسه کارت: <b dir="ltr">{current.physical_card_number}</b></div>}
              {current.status === "activated" && <div>کارتت توسط ادمین فعال شده است.</div>}
            </div>
          ) : (
            <div className="physical-card-status">هنوز درخواست خریدی ثبت نکرده‌ای. رنگ موردعلاقه‌ات را انتخاب کن.</div>
          )}

          <div>
            <label className="physical-card-label" htmlFor="physical-card-color">رنگ کارت موردنظر</label>
            <select id="physical-card-color" className="physical-card-select" value={color} onChange={(e) => setColor(e.target.value)} disabled={Boolean(current && current.status !== "rejected")}>
              {COLORS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>

          <div>
            <label className="physical-card-label" htmlFor="physical-card-phone">شماره تماس برای هماهنگی سفارش</label>
            <input id="physical-card-phone" className="physical-card-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+98 912 345 6789" inputMode="tel" autoComplete="tel" maxLength={20} disabled={Boolean(current && current.status !== "rejected")} dir="ltr" />
          </div>

          {!current || current.status === "rejected" ? (
            <button className="physical-card-button" type="button" onClick={() => void submitRequest()} disabled={sending || loading}>
              {sending ? "در حال ثبت درخواست..." : "ثبت درخواست خرید کارت ←"}
            </button>
          ) : null}

          <p className="physical-card-note">ثبت درخواست به معنی فعال‌شدن خودکار کارت نیست. درخواست در پنل ادمین نمایش داده می‌شود؛ برای هماهنگی و اطلاع‌رسانی، حتماً به ادمین هم پیام بده.</p>
          {loading && <p className="physical-card-note">در حال بررسی سفارش‌های قبلی...</p>}
        </div>
      </div>
    </section>
  );
}
