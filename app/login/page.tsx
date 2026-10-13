tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const router = useRouter();

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage("ایمیل یا رمز عبور اشتباه است.");
        return;
      }

      if (!data.session) {
        setMessage("ورود انجام نشد. لطفاً دوباره تلاش کن.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage("خطایی رخ داد. اتصال اینترنتت رو بررسی کن.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page" dir="rtl">
      <div className="auth-glow" />

      <section className="auth-box">
        <Link href="/" className="brand">
          <span className="brand-icon">L</span>
          <span>
            Lumo<span className="brand-light">Card</span>
          </span>
        </Link>

        <div className="welcome-icon">✦</div>

        <h1>خوش برگشتی!</h1>

        <p className="subtitle">
          وارد حساب کاربری خودت شو و کارت دیجیتالت رو مدیریت کن.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">ایمیل حساب</label>

          <input
            id="email"
            type="email"
            placeholder="ایمیل ثبت‌شده در حساب"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={busy}
          />

          <label htmlFor="password">رمز عبور</label>

          <input
            id="password"
            type="password"
            placeholder="رمز عبور"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={busy}
          />

          {message && (
            <div className="message" role="alert">
              {message}
            </div>
          )}

          <button className="submit-button" type="submit" disabled={busy}>
            {busy ? "در حال ورود..." : "ورود به حساب"}
            {!busy && <span>↗</span>}
          </button>
        </form>

        <div className="bottom-note">
          حساب کاربری توسط مدیریت LumoCard ساخته می‌شود.
        </div>

        <Link href="/" className="back-link">
          ← بازگشت به صفحه اصلی
        </Link>
      </section>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px 16px;
          position: relative;
          overflow: hidden;
          background: #09090b;
          color: #f7f7fa;
          font-family: "Vazirmatn", Tahoma, Arial, sans-serif;
        }

        .auth-page * {
          box-sizing: border-box;
        }

        .auth-glow {
          position: absolute;
          top: 15%;
          left: 50%;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: rgba(124, 58, 237, 0.16);
          filter: blur(100px);
          transform: translateX(-50%);
          pointer-events: none;
        }

        .auth-box {
          width: 100%;
          max-width: 420px;
          padding: 38px;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 25px;
          background: rgba(17, 17, 20, 0.94);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
          animation: appear 0.6s ease both;
        }

        .brand {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          direction: ltr;
          color: #fff;
          text-decoration: none;
          font-family: Arial, sans-serif;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .brand-icon {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          border-radius: 12px;
          background: linear-gradient(135deg, #c4b5fd, #7c3aed);
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.25);
        }

        .brand-light {
          color: #a1a1aa;
          font-weight: 400;
        }

        .welcome-icon {
          display: grid;
          place-items: center;
          width: 54px;
          height: 54px;
          margin: 35px auto 15px;
          border: 1px solid rgba(196, 181, 253, 0.2);
          border-radius: 17px;
          background: rgba(139, 92, 246, 0.1);
          color: #c4b5fd;
          font-size: 27px;
        }

        h1 {
          margin: 0;
          text-align: center;
          font-size: 27px;
          font-weight: 900;
        }

        .subtitle {
          margin: 12px 0 28px;
          color: #a1a1aa;
          text-align: center;
          font-size: 12px;
          line-height: 2.1;
        }

        form {
          display: flex;
          flex-direction: column;
        }

        label {
          margin: 0 0 9px;
          color: #e4e4e7;
          font-size: 12px;
        }

        input {
          width: 100%;
          height: 49px;
          margin-bottom: 20px;
          padding: 0 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          outline: none;
          background: #0c0c0f;
          color: #fff;
          font-family: inherit;
          font-size: 12px;
          transition: border-color 0.2s ease;
        }

        input:focus {
          border-color: #a78bfa;
        }

        input::placeholder {
          color: #71717a;
        }

        input:disabled {
          opacity: 0.65;
        }

        .submit-button {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-height: 49px;
          margin-top: 3px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(110deg, #a78bfa, #7c3aed);
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            filter 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .submit-button span {
          font-size: 17px;
        }

        .message {
          margin: 0 0 15px;
          padding: 12px;
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 10px;
          background: rgba(127, 29, 29, 0.15);
          color: #fca5a5;
          font-size: 12px;
          line-height: 1.8;
        }

        .bottom-note {
          margin-top: 23px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #a1a1aa;
          text-align: center;
          font-size: 11px;
          line-height: 2;
        }

        .back-link {
          display: block;
          margin-top: 18px;
          color: #c4b5fd;
          text-align: center;
          text-decoration: none;
          font-size: 12px;
        }

        .back-link:hover {
          color: #fff;
        }

        @keyframes appear {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .auth-box {
            padding: 28px 22px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-box {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
