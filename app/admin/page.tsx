"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  job?: string;
  subscription_status?: string;
  subscription_plan?: string;
  trial_started_at?: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  is_unlimited?: boolean;
};

type Action = "activate_annual" | "unlimited" | "expire";

type CardOrder = {
  id: string;
  user_id: string;
  requested_color: string;
  phone_number: string;
  status: "pending" | "approved" | "rejected" | "activated";
  assigned_color?: string | null;
  physical_card_number?: string | null;
  created_at: string;
  customer?: { username?: string; full_name?: string; email?: string } | null;
};

const CARD_COLORS = [
  { value: "#4B5BA8", label: "آبی" },
  { value: "#111111", label: "مشکی" },
  { value: "#7416A6", label: "بنفش" },
  { value: "#888888", label: "خاکستری" },
  { value: "#7A2B20", label: "زرشکی" },
];

type Duration = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
};

const EMPTY_DURATION: Duration = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
};

function calculateExpiry(start: Date, duration: Duration) {
  const expiry = new Date(start);

  expiry.setFullYear(expiry.getFullYear() + duration.years);
  expiry.setMonth(expiry.getMonth() + duration.months);
  expiry.setDate(expiry.getDate() + duration.days);
  expiry.setHours(expiry.getHours() + duration.hours);
  expiry.setMinutes(expiry.getMinutes() + duration.minutes);

  return expiry;
}

function formatDate(date: Date) {
  return date.toLocaleString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [cardOrders, setCardOrders] = useState<CardOrder[]>([]);
  const [cardOrderEdits, setCardOrderEdits] = useState<Record<string, { color: string; number: string }>>({});
  const [cardOrdersError, setCardOrdersError] = useState("");
  const [cardOrdersNotice, setCardOrdersNotice] = useState("");
  const [workingOrderId, setWorkingOrderId] = useState("");

  const [durationUser, setDurationUser] = useState<Profile | null>(null);
  const [duration, setDuration] = useState<Duration>(EMPTY_DURATION);
  const [savingDuration, setSavingDuration] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setAuthorized(false);
        setError("ابتدا وارد حساب کاربری خودت شو.");
        return;
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        setAuthorized(false);
        setError(result.error || "دسترسی به پنل امکان‌پذیر نیست.");
        return;
      }

      setUsers(result.users || []);
      setAuthorized(true);

      const ordersResponse = await fetch("/api/admin/card-orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const ordersResult = await ordersResponse.json().catch(() => ({}));
      if (!ordersResponse.ok) {
        setCardOrdersError(ordersResult.error || "بارگذاری سفارش‌های کارت ناموفق بود.");
        setCardOrders([]);
      } else {
        const loadedOrders: CardOrder[] = ordersResult.orders || [];
        setCardOrders(loadedOrders);
        setCardOrderEdits(Object.fromEntries(loadedOrders.map((order) => [order.id, {
          color: order.assigned_color || order.requested_color || "#111111",
          number: order.physical_card_number || "",
        }])));
        setCardOrdersError("");
      }
    } catch {
      setAuthorized(false);
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  async function manageUser(userId: string, action: Action) {
    const messages: Record<Action, string> = {
      activate_annual: "اشتراک سالانه این کاربر فعال یا تمدید شود؟",
      unlimited: "اشتراک این کاربر نامحدود شود؟",
      expire: "اشتراک این کاربر منقضی شود؟",
    };

    if (!window.confirm(messages[action])) return;

    setWorkingId(userId);
    setError("");
    setNotice("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError("نشست ورود معتبر نیست. دوباره وارد شو.");
        return;
      }

      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "عملیات ناموفق بود.");
        return;
      }

      setNotice(result.message || "تغییرات با موفقیت ذخیره شد.");
      await loadUsers();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setWorkingId("");
    }
  }

  async function manageCardOrder(order: CardOrder, status: "approved" | "rejected" | "activated") {
    const edit = cardOrderEdits[order.id] || { color: order.assigned_color || order.requested_color, number: order.physical_card_number || "" };
    if (status === "activated" && (!edit.number.trim() || edit.number.trim().length < 3)) {
      setCardOrdersError("برای فعال‌سازی، شناسه کارت فیزیکی را وارد کن.");
      return;
    }
    const label = status === "activated" ? "فعال‌سازی کارت" : status === "approved" ? "تأیید سفارش" : "رد درخواست";
    if (!window.confirm(`${label} برای ${order.customer?.full_name || order.customer?.username || "این مشتری"} انجام شود؟`)) return;

    setWorkingOrderId(order.id);
    setCardOrdersError("");
    setCardOrdersNotice("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) throw new Error("نشست ورود معتبر نیست؛ دوباره وارد شو.");
      const response = await fetch("/api/admin/card-orders", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: order.id,
          status,
          assigned_color: edit.color,
          physical_card_number: edit.number.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "ذخیره سفارش ناموفق بود.");
      setCardOrdersNotice(result.message || "تغییرات سفارش ذخیره شد.");
      await loadUsers();
    } catch (e) {
      setCardOrdersError(e instanceof Error ? e.message : "ارتباط با سرور برقرار نشد.");
    } finally {
      setWorkingOrderId("");
    }
  }

  function openDurationDialog(user: Profile) {
    setDurationUser(user);
    setDuration({ ...EMPTY_DURATION });
    setError("");
    setNotice("");
  }

  async function saveCustomDuration() {
    if (!durationUser) return;

    const values = Object.values(duration);

    if (
      values.some(
        (value) =>
          !Number.isSafeInteger(value) || value < 0
      ) ||
      values.every((value) => value === 0)
    ) {
      setError("حداقل یکی از واحدهای زمان را بیشتر از صفر وارد کن.");
      return;
    }

    if (
      duration.years > 100 ||
      duration.months > 1200 ||
      duration.days > 36500 ||
      duration.hours > 876000 ||
      duration.minutes > 52560000
    ) {
      setError("مدت اشتراک واردشده بیش از حد مجاز است.");
      return;
    }

    const user = durationUser;

    const currentExpiry = user.subscription_expires_at
      ? new Date(user.subscription_expires_at)
      : null;

    const now = new Date();

    const startDate =
      !user.is_unlimited &&
      currentExpiry &&
      Number.isFinite(currentExpiry.getTime()) &&
      currentExpiry.getTime() > now.getTime()
        ? currentExpiry
        : now;

    const previewExpiry = calculateExpiry(startDate, duration);

    if (
      !Number.isFinite(previewExpiry.getTime()) ||
      previewExpiry.getTime() <= now.getTime()
    ) {
      setError("تاریخ پایان اشتراک معتبر نیست.");
      return;
    }

    const summary = [
      duration.years ? `${duration.years} سال` : "",
      duration.months ? `${duration.months} ماه` : "",
      duration.days ? `${duration.days} روز` : "",
      duration.hours ? `${duration.hours} ساعت` : "",
      duration.minutes ? `${duration.minutes} دقیقه` : "",
    ]
      .filter(Boolean)
      .join(" و ");

    if (
      !window.confirm(
        `اشتراک ${user.full_name || user.username} به مدت ${summary} فعال شود؟\n\nتاریخ پایان: ${formatDate(previewExpiry)}`
      )
    ) {
      return;
    }

    setSavingDuration(true);
    setWorkingId(user.id);
    setError("");
    setNotice("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError("نشست ورود معتبر نیست. دوباره وارد شو.");
        return;
      }

      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(user.id)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "custom_duration",
            ...duration,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "ثبت اشتراک ناموفق بود.");
        return;
      }

      setNotice(
        `${result.message || "اشتراک با موفقیت ثبت شد."} تاریخ پایان: ${formatDate(previewExpiry)}`
      );

      setDurationUser(null);
      setDuration({ ...EMPTY_DURATION });

      await loadUsers();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setSavingDuration(false);
      setWorkingId("");
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function getStatus(user: Profile) {
    if (
      user.is_unlimited ||
      user.subscription_plan === "unlimited"
    ) {
      return { label: "نامحدود", color: "#c084fc" };
    }

    if (
      user.subscription_status === "active" &&
      user.subscription_expires_at &&
      new Date(user.subscription_expires_at).getTime() > Date.now()
    ) {
      return {
        label: "اشتراک فعال",
        color: "#4ade80",
      };
    }

    if (
      user.subscription_status === "trial" &&
      user.trial_started_at
    ) {
      const elapsed =
        Date.now() - new Date(user.trial_started_at).getTime();

      if (elapsed >= 0 && elapsed < 48 * 60 * 60 * 1000) {
        return {
          label: "دوره آزمایشی",
          color: "#facc15",
        };
      }
    }

    if (user.subscription_status === "pending") {
      return {
        label: "در انتظار بررسی",
        color: "#60a5fa",
      };
    }

    return { label: "منقضی‌شده", color: "#fb7185" };
  }

  const filteredUsers = users.filter((user) => {
    const value = search.trim().toLowerCase();

    return (
      (user.full_name || "").toLowerCase().includes(value) ||
      (user.username || "").toLowerCase().includes(value) ||
      (user.email || "").toLowerCase().includes(value)
    );
  });

  const stats = [
    {
      title: "کل کاربران",
      value: users.length,
      icon: "👥",
    },
    {
      title: "اشتراک فعال",
      value: users.filter(
        (user) => getStatus(user).label === "اشتراک فعال"
      ).length,
      icon: "💎",
    },
    {
      title: "دوره آزمایشی",
      value: users.filter(
        (user) => getStatus(user).label === "دوره آزمایشی"
      ).length,
      icon: "⏳",
    },
    {
      title: "اشتراک نامحدود",
      value: users.filter(
        (user) =>
          user.is_unlimited ||
          user.subscription_plan === "unlimited"
      ).length,
      icon: "♾️",
    },
  ];

  const previewStart = (() => {
    if (!durationUser) return new Date();

    const now = new Date();
    const expiry = durationUser.subscription_expires_at
      ? new Date(durationUser.subscription_expires_at)
      : null;

    if (
      !durationUser.is_unlimited &&
      expiry &&
      Number.isFinite(expiry.getTime()) &&
      expiry.getTime() > now.getTime()
    ) {
      return expiry;
    }

    return now;
  })();

  const previewExpiry = calculateExpiry(previewStart, duration);

  return (
    <main dir="rtl" className="admin-page">
      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 32px;
          color: #f5f3ff;
          background:
            radial-gradient(ellipse at top right, #28113d 0%, transparent 38%),
            #08080d;
          font-family: inherit;
        }

        .container {
          max-width: 1450px;
          margin: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .brand {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .brand span {
          color: #b66aff;
        }

        .subtitle {
          color: #a1a1aa;
          font-size: 13px;
          margin-top: 8px;
        }

        .button {
          border: 1px solid #633c83;
          border-radius: 11px;
          padding: 10px 14px;
          background: #21132e;
          color: white;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          transition: 0.2s;
          white-space: nowrap;
        }

        .button:hover:not(:disabled) {
          background: #39204d;
          border-color: #b66aff;
        }

        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .primary {
          background: #9333ea;
          border-color: #a855f7;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 26px;
        }

        .stat,
        .panel {
          border: 1px solid #29212f;
          border-radius: 18px;
          background: #111015;
        }

        .stat {
          padding: 22px;
        }

        .stat-icon {
          font-size: 25px;
        }

        .stat-title {
          color: #a1a1aa;
          font-size: 13px;
          margin-top: 14px;
        }

        .stat-value {
          font-size: 30px;
          font-weight: 800;
          margin-top: 8px;
        }

        .panel {
          overflow: hidden;
        }

        .panel-header {
          padding: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          border-bottom: 1px solid #29212f;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 800;
        }

        .search {
          background: #09090d;
          border: 1px solid #39303f;
          border-radius: 11px;
          padding: 12px 15px;
          color: white;
          outline: none;
          width: min(100%, 320px);
          font: inherit;
          font-size: 13px;
        }

        .search:focus,
        .duration-input:focus {
          border-color: #a855f7;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
          min-width: 1150px;
        }

        th,
        td {
          padding: 16px;
          border-bottom: 1px solid #211d27;
          font-size: 13px;
          vertical-align: middle;
        }

        th {
          color: #a1a1aa;
          background: #151319;
          font-weight: 600;
          white-space: nowrap;
        }

        td {
          color: #e4e4e7;
        }

        .username {
          color: #c084fc;
          direction: ltr;
          display: inline-block;
        }

        .badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          background: #201a27;
          font-size: 12px;
          white-space: nowrap;
        }

        .actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          min-width: 360px;
        }

        .message {
          margin: 0 0 20px;
          padding: 15px;
          border-radius: 12px;
          background: #19151f;
          color: #d4d4d8;
          line-height: 1.9;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .error {
          color: #fda4af;
          border: 1px solid #632b39;
        }

        .success {
          color: #86efac;
          border: 1px solid #245d3b;
        }

        .empty {
          text-align: center;
          color: #a1a1aa;
          padding: 40px 20px;
        }

        .footer {
          text-align: center;
          color: #71717a;
          font-size: 12px;
          margin-top: 28px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(8px);
          overflow-y: auto;
        }

        .modal {
          width: 100%;
          max-width: 520px;
          margin: auto;
          padding: 24px;
          border: 1px solid #633c83;
          border-radius: 20px;
          background: #111015;
          box-shadow: 0 25px 90px rgba(0, 0, 0, 0.5);
        }

        .modal-title {
          font-size: 21px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .modal-subtitle {
          color: #a1a1aa;
          font-size: 13px;
          line-height: 1.9;
          margin-bottom: 22px;
          overflow-wrap: anywhere;
        }

        .duration-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .duration-field label {
          display: block;
          color: #d4d4d8;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .duration-input {
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #39303f;
          border-radius: 10px;
          background: #09090d;
          color: white;
          outline: none;
          font: inherit;
          font-size: 16px;
        }

        .preview {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #3d2850;
          border-radius: 12px;
          background: #1a1123;
          line-height: 2;
          font-size: 13px;
        }

        .preview strong {
          color: #d8b4fe;
        }

        .modal-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .modal-actions .button {
          flex: 1;
          min-height: 44px;
        }

        @media (max-width: 850px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-page {
            padding: 18px 12px;
          }

          .stat {
            padding: 16px;
          }
        }

        @media (max-width: 380px) {
          .stats,
          .duration-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 18px;
          }
        }
        .card-orders { margin-bottom: 24px; }
        .card-order-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; margin-top:16px; }
        .card-order { border:1px solid #33283f; background:#111019; border-radius:16px; padding:16px; min-width:0; }
        .card-order-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }
        .card-order-head strong { display:block; overflow-wrap:anywhere; }
        .card-order-meta { color:#b8adc7; font-size:12px; line-height:1.9; overflow-wrap:anywhere; }
        .card-order-fields { display:grid; grid-template-columns:1fr; gap:10px; margin:12px 0; }
        .card-order-fields label { display:grid; gap:6px; color:#d7cce4; font-size:12px; }
        .card-order-fields input,.card-order-fields select { width:100%; min-width:0; border:1px solid #40334d; background:#09080e; color:#fff; border-radius:10px; padding:10px; }
        .card-order-actions { display:flex; flex-wrap:wrap; gap:8px; }
        .card-order-actions .button { flex:1; min-width:100px; }
        .card-color-dot { display:inline-block; width:12px; height:12px; border-radius:50%; border:1px solid #777; vertical-align:middle; margin-left:5px; }
        .card-order-state { display:inline-flex; border-radius:999px; padding:4px 9px; font-size:11px; background:#281b36; color:#e9d5ff; white-space:nowrap; }
        @media(max-width:640px) { .card-order-actions .button { min-width:100%; } }
      `}</style>

      <div className="container">
        <header className="header">
          <div>
            <div className="brand">
              ϟ Lumo<span>Card</span>
            </div>
            <div className="subtitle">
              پنل مدیریت کاربران و اشتراک‌ها
            </div>
          </div>

          <button
            className="button"
            onClick={() => void loadUsers()}
            disabled={loading || Boolean(workingId)}
          >
            ↻ به‌روزرسانی اطلاعات
          </button>
        </header>

        {error && <div className="message error">{error}</div>}
        {notice && <div className="message success">{notice}</div>}

        {loading ? (
          <div className="panel empty">در حال دریافت اطلاعات...</div>
        ) : authorized ? (
          <>
            <section className="stats">
              {stats.map((stat) => (
                <div className="stat" key={stat.title}>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              ))}
            </section>

            <section className="panel card-orders">
              <div className="panel-header">
                <div className="panel-title">💳 درخواست خرید کارت فیزیکی</div>
                <button className="button" onClick={() => void loadUsers()} disabled={loading || Boolean(workingOrderId)}>به‌روزرسانی</button>
              </div>
              <p style={{ color: "#b8adc7", lineHeight: 1.9, marginTop: 0 }}>
                رنگ نهایی و شناسه کارت را تعیین کن؛ بعد از فعال‌سازی، کارت در داشبورد همان مشتری نمایش داده می‌شود.
              </p>
              {cardOrdersError && <div className="message error">{cardOrdersError}</div>}
              {cardOrdersNotice && <div className="message success">{cardOrdersNotice}</div>}
              {cardOrders.length === 0 ? (
                <div className="empty">فعلاً درخواست خریدی ثبت نشده است.</div>
              ) : (
                <div className="card-order-grid">
                  {cardOrders.map((order) => {
                    const edit = cardOrderEdits[order.id] || { color: order.assigned_color || order.requested_color, number: order.physical_card_number || "" };
                    const busyOrder = workingOrderId === order.id;
                    const statusLabel = order.status === "pending" ? "در انتظار بررسی" : order.status === "approved" ? "تأیید شده" : order.status === "activated" ? "فعال" : "رد شده";
                    return (
                      <article className="card-order" key={order.id}>
                        <div className="card-order-head">
                          <div>
                            <strong>{order.customer?.full_name || "بدون نام"}</strong>
                            <div className="card-order-meta">@{order.customer?.username || "—"}</div>
                          </div>
                          <span className="card-order-state">{statusLabel}</span>
                        </div>
                        <div className="card-order-meta">شماره تماس: <b dir="ltr">{order.phone_number}</b></div>
                        <div className="card-order-meta">رنگ درخواستی: <span className="card-color-dot" style={{ background: order.requested_color }} />{CARD_COLORS.find((item) => item.value === order.requested_color)?.label || order.requested_color}</div>
                        <div className="card-order-meta">تاریخ درخواست: {formatDate(new Date(order.created_at))}</div>
                        <div className="card-order-fields">
                          <label>رنگ نهایی کارت
                            <select value={edit.color} onChange={(event) => setCardOrderEdits((old) => ({ ...old, [order.id]: { ...edit, color: event.target.value } }))}>
                              {CARD_COLORS.map((color) => <option key={color.value} value={color.value}>{color.label}</option>)}
                            </select>
                          </label>
                          <label>شناسه کارت فیزیکی
                            <input value={edit.number} onChange={(event) => setCardOrderEdits((old) => ({ ...old, [order.id]: { ...edit, number: event.target.value } }))} placeholder="مثلاً LUMO-000124" maxLength={60} dir="ltr" />
                          </label>
                        </div>
                        <div className="card-order-actions">
                          <button className="button" disabled={busyOrder || Boolean(workingOrderId)} onClick={() => void manageCardOrder(order, "approved")}>تأیید سفارش</button>
                          <button className="button" disabled={busyOrder || Boolean(workingOrderId)} onClick={() => void manageCardOrder(order, "activated")}>فعال‌سازی کارت</button>
                          <button className="button" disabled={busyOrder || Boolean(workingOrderId)} onClick={() => void manageCardOrder(order, "rejected")}>رد درخواست</button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div className="panel-title">مدیریت کاربران</div>

                <input
                  className="search"
                  placeholder="جست‌وجوی نام، ایمیل یا نام کاربری..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="empty">کاربری پیدا نشد.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>نام کاربر</th>
                        <th>نام کاربری</th>
                        <th>ایمیل</th>
                        <th>وضعیت اشتراک</th>
                        <th>پلن</th>
                        <th>تاریخ انقضا</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => {
                        const status = getStatus(user);
                        const busy = workingId === user.id;

                        return (
                          <tr key={user.id}>
                            <td>{user.full_name || "بدون نام"}</td>
                            <td>
                              <span className="username">
                                @{user.username}
                              </span>
                            </td>
                            <td>{user.email || "—"}</td>
                            <td>
                              <span
                                className="badge"
                                style={{ color: status.color }}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td>{user.subscription_plan || "free"}</td>
                            <td>
                              {user.subscription_expires_at
                                ? formatDate(
                                    new Date(user.subscription_expires_at)
                                  )
                                : "—"}
                            </td>
                            <td>
                              <div className="actions">
                                <button
                                  className="button"
                                  disabled={busy || Boolean(workingId)}
                                  onClick={() =>
                                    void manageUser(user.id, "activate_annual")
                                  }
                                >
                                  💎 تمدید یک‌ساله
                                </button>

                                <button
                                  className="button"
                                  disabled={busy || Boolean(workingId)}
                                  onClick={() =>
                                    openDurationDialog(user)
                                  }
                                >
                                  ⏱️ زمان دلخواه
                                </button>

                                <button
                                  className="button"
                                  disabled={busy || Boolean(workingId)}
                                  onClick={() =>
                                    void manageUser(user.id, "unlimited")
                                  }
                                >
                                  ♾️ نامحدود
                                </button>

                                <button
                                  className="button"
                                  disabled={busy || Boolean(workingId)}
                                  onClick={() =>
                                    void manageUser(user.id, "expire")
                                  }
                                >
                                  🚫 انقضای اشتراک
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="panel empty">
            برای مشاهده کاربران، دسترسی ادمین لازم است.
          </div>
        )}

        <footer className="footer">
          LumoCard Admin · مدیریت کارت‌های دیجیتال
        </footer>
      </div>

      {durationUser && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingDuration
            ) {
              setDurationUser(null);
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="duration-title"
          >
            <div className="modal-title" id="duration-title">
              ⏱️ تعیین مدت اشتراک
            </div>

            <div className="modal-subtitle">
              کاربر: {durationUser.full_name || durationUser.username}
              <br />
              هر واحدی لازم نداری روی صفر بذار.
              اگر اشتراک فعلی هنوز فعال باشد، زمان جدید به پایان آن اضافه می‌شود.
            </div>

            <div className="duration-grid">
              {(
                [
                  ["years", "سال"],
                  ["months", "ماه"],
                  ["days", "روز"],
                  ["hours", "ساعت"],
                  ["minutes", "دقیقه"],
                ] as const
              ).map(([key, label]) => (
                <div className="duration-field" key={key}>
                  <label htmlFor={`duration-${key}`}>{label}</label>
                  <input
                    id={`duration-${key}`}
                    className="duration-input"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={duration[key]}
                    onChange={(event) => {
                      const raw = event.target.value;

                      setDuration((previous) => ({
                        ...previous,
                        [key]: raw === "" ? 0 : Number(raw),
                      }));
                    }}
                    disabled={savingDuration}
                  />
                </div>
              ))}
            </div>

            <div className="preview">
              <div>
                <strong>تاریخ پایان تقریبی:</strong>
              </div>
              <div>
                {formatDate(previewExpiry)}
              </div>
              <div>
                <strong>وضعیت:</strong> پس از تأیید، اشتراک فعال می‌شود.
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="button primary"
                onClick={() => void saveCustomDuration()}
                disabled={savingDuration || Boolean(workingId)}
              >
                {savingDuration ? "در حال ذخیره..." : "✓ تأیید و ثبت اشتراک"}
              </button>

              <button
                className="button"
                onClick={() => setDurationUser(null)}
                disabled={savingDuration}
              >
                انصراف
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
