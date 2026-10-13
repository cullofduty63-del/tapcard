"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ADMIN_ID = "46b6757c-9b3c-4b69-aaa0-5865ef9347a2";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setMessage("ایمیل یا رمز عبور اشتباه است.");
      setLoading(false);
      return;
    }

    if (data.user.id === ADMIN_ID) {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }

    router.refresh();
  }

  return (
    <main className="auth">
      <div className="box">
        <Link className="logo" href="/">
          Lumo<span>Card</span>
        </Link>

        <h1>ورود به حساب</h1>

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

          <button className="button" type="submit" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        {message && <p role="alert">{message}</p>}

        <Link href="/register">ساخت حساب</Link>
      </div>
    </main>
  );
}
