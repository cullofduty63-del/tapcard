"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("ایمیل یا رمز عبور اشتباه است.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="brand">TapCard</div>
        <h1>خوش برگشتی 👋</h1>
        <p>وارد حساب TapCard خودت شو</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        {message && <div className="auth-message">{message}</div>}

        <p className="auth-link">
          حساب نداری؟ <Link href="/register">ثبت‌نام کن</Link>
        </p>
      </div>
    </main>
  );
}
