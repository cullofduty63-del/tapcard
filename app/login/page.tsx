"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setError("");
    setBusy(true);

    const formData = new FormData(e.currentTarget);

    const username = String(formData.get("username") || "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") || "");

    try {
      const response = await fetch("/api/auth/username-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : `ورود انجام نشد. خطای ${response.status}`
        );
      }

      const accessToken = result?.session?.access_token;
      const refreshToken = result?.session?.refresh_token;

      if (
        typeof accessToken !== "string" ||
        typeof refreshToken !== "string" ||
        !accessToken ||
        !refreshToken
      ) {
        throw new Error("پاسخ ورود از سرور معتبر نیست.");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error("LOGIN SET SESSION ERROR:", sessionError.message);
        throw new Error("ورود انجام شد، اما ذخیره نشست ناموفق بود. دوباره تلاش کن.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ارتباط با سرور برقرار نشد. دوباره تلاش کن."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="container subnav">
        <Link className="brand" href="/">
          ϟ Lumo<span>Card</span>
        </Link>

        <Link className="nav-link" href="/">
          صفحه اصلی
        </Link>
      </div>

      <section className="panel narrow">
        <h1>خوش برگشتی 👋</h1>

        <p className="panel-intro">
          برای مدیریت کارتت وارد حساب شو.
        </p>

        {searchParams.get("created") === "1" && (
          <div className="notice success" role="status">
            ثبت‌نامت موفق بود! حالا با نام کاربری و رمز عبورت وارد شو. 💜
          </div>
        )}

        {error && (
          <div className="notice" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="login-username">نام کاربری</label>

            <input
              id="login-username"
              name="username"
              required
              minLength={3}
              maxLength={24}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              dir="ltr"
              placeholder="samiyar"
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">رمز عبور</label>

            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              dir="ltr"
            />
          </div>

          <button
            className="button form-submit"
            type="submit"
            disabled={busy}
          >
            {busy ? "در حال ورود..." : "ورود به حساب"}
          </button>
        </form>

        <p className="under-form">
          حساب نداری؟ <Link href="/register">ثبت‌نام کن</Link>
        </p>
      </section>
    </main>
  );
}
