"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ADMIN_ID = "46b6757c-9b3c-4b69-aaa0-5865ef9347a2";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/username-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.session) {
        setMessage(result.error || "نام کاربری یا رمز عبور اشتباه است.");
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (error || !data.user) {
        setMessage("ورود کامل نشد؛ دوباره تلاش کن.");
        return;
      }

      if (data.user.id === ADMIN_ID) {
        await supabase.auth.signOut();
        setMessage("برای ورود مدیر، از آدرس admin.lumocard.ir استفاده کن.");
        return;
      }

      router.replace("/account");
      router.refresh();
    } catch {
      setMessage("اتصال برقرار نشد. دوباره تلاش کن.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page" dir="rtl">
      <section className="login-card">
        <Link href="/" className="brand">Lumo<span>Card</span></Link>
        <div className="eyebrow">حساب کاربری LumoCard</div>
        <h1>خوش برگشتی</h1>
        <p className="intro">با نام کاربری و رمز عبورت وارد شو و کارت دیجیتالت رو مدیریت کن.</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="username">نام کاربری</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            placeholder="مثلاً samiyar"
            minLength={3}
            required
          />
          <label htmlFor="password">رمز عبور</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="رمز عبور"
            required
          />
          {message && <p className="message" role="alert">{message}</p>}
          <button disabled={busy}>{busy ? "در حال ورود..." : "ورود به حساب ←"}</button>
        </form>
        <p className="foot">حساب مشتری توسط مدیریت LumoCard ساخته می‌شود.</p>
        <Link href="/" className="back">بازگشت به صفحه اصلی</Link>
      </section>

      <style jsx>{`
        .login-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at top,#241537 0%,#0b0910 48%,#08080b 100%);color:#f8f7fb;font-family:Vazirmatn,Tahoma,Arial,sans-serif}
        .login-card{width:min(100%,440px);padding:clamp(24px,5vw,42px);border:1px solid #30263c;border-radius:24px;background:#111016eF;box-shadow:0 28px 90px #0007}
        .brand{display:block;text-align:center;color:white;font:bold 27px Arial,sans-serif;text-decoration:none;letter-spacing:-1px}.brand span{color:#bba0ff}
        .eyebrow{margin-top:32px;color:#bba0ff;text-align:center;font-size:11px}
        h1{text-align:center;font-size:30px;margin:12px 0}
        .intro{text-align:center;color:#a9a3b5;font-size:13px;line-height:2;margin:0 0 28px}
        form{display:flex;flex-direction:column;gap:9px}
        label{font-size:12px;color:#e6e0ee;margin-top:8px}
        input{width:100%;height:49px;border:1px solid #342d40;border-radius:12px;background:#0a090e;color:white;padding:0 14px;font:inherit;font-size:13px;outline:none}
        input:focus{border-color:#a78bfa;box-shadow:0 0 0 3px #a78bfa20}
        button{margin-top:12px;min-height:49px;border:0;border-radius:12px;background:linear-gradient(110deg,#c4b5fd,#8b5cf6);color:#160d25;font:inherit;font-size:13px;font-weight:900;cursor:pointer}
        button:disabled{opacity:.65;cursor:wait}
        .message{margin:6px 0;padding:12px;border-radius:10px;background:#391c28;color:#fecdd3;font-size:12px;line-height:1.9}
        .foot,.back{display:block;text-align:center;font-size:11px;line-height:2;color:#9992a6;margin-top:22px}
        .back{color:#c4b5fd;text-decoration:none;margin-top:12px}
      `}</style>
    </main>
  );
}
