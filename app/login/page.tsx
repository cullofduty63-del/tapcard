"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Login() {
  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [m, setM] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function go(x: React.FormEvent<HTMLFormElement>) {
    x.preventDefault();
    if (busy) return;
    setBusy(true);
    setM("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: e.trim(),
        password: p,
      });

      if (error) {
        setM(error.message);
        return;
      }

      if (!data.session) {
        setM("ورود کامل نشد؛ نشست کاربر ساخته نشد. تنظیمات Supabase را بررسی کن.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setM(err instanceof Error ? err.message : "خطای ناشناخته هنگام ورود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <div className="box">
        <Link className="logo" href="/">Lumo<span>Card</span></Link>
        <h1>ورود</h1>
        <form onSubmit={go}>
          <input type="email" placeholder="ایمیل" autoComplete="email" value={e} onChange={x => setE(x.target.value)} required />
          <input type="password" placeholder="رمز عبور" autoComplete="current-password" value={p} onChange={x => setP(x.target.value)} required />
          <button className="button" type="submit" disabled={busy}>
            {busy ? "در حال ورود..." : "ورود"}
          </button>
        </form>
        {m && <p role="alert">{m}</p>}
        <Link href="/register">ساخت حساب</Link>
      </div>
    </main>
  );
}
