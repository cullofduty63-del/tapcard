"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "ورود ناموفق بود."
        );
      }

      const accessToken = result?.session?.access_token;
      const refreshToken = result?.session?.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error("اطلاعات نشست ورود معتبر نیست.");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        throw new Error("ذخیره نشست ورود ناموفق بود.");
      }

      const adminResponse = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const adminResult = await adminResponse.json().catch(() => null);

      if (!adminResponse.ok) {
        await supabase.auth.signOut();
        throw new Error(
          typeof adminResult?.error === "string"
            ? adminResult.error
            : "این حساب دسترسی ادمین ندارد."
        );
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ارتباط با سرور برقرار نشد."
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
        <h1>ورود مدیریت 🔐</h1>
        <p className="panel-intro">
          برای ورود به پنل مدیریت LumoCard وارد حساب ادمین شو.
        </p>

        {error && (
          <div className="notice" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="admin-username">نام کاربری ادمین</label>
            <input
              id="admin-username"
              name="username"
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              dir="ltr"
              placeholder="username"
            />
          </div>

          <div className="field">
            <label htmlFor="admin-password">رمز عبور</label>
            <input
              id="admin-password"
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
            {busy ? "در حال بررسی دسترسی..." : "ورود به پنل مدیریت"}
          </button>
        </form>
      </section>
    </main>
  );
}
