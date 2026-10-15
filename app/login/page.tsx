"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
const router = useRouter();
const [error, setError] = useState("");
const [busy, setBusy] = useState(false);

async function submit(e: FormEvent<HTMLFormElement>) {
e.preventDefault();
setError("");
setBusy(true);


const form = e.currentTarget;
const formData = new FormData(form);

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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || `ورود انجام نشد. (خطای ${response.status})`
    );
  }

  if (
    typeof data?.session?.access_token !== "string" ||
    typeof data?.session?.refresh_token !== "string" ||
    !data.session.access_token ||
    !data.session.refresh_token
  ) {
    throw new Error("پاسخ ورود از سرور معتبر نیست.");
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  if (sessionError) {
    throw sessionError;
  }

  router.replace("/dashboard");
  router.refresh();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "خطای اتصال به سرور. دوباره تلاش کن."
  );
} finally {
  setBusy(false);
}


}

return ( <main className="page-shell"> <div className="container subnav"> <Link className="brand" href="/">
ϟ Lumo<span>Card</span> </Link>


    <Link className="nav-link" href="/">
      صفحه اصلی
    </Link>
  </div>

  <section className="panel narrow">
    <h1>خوش برگشتی 👋</h1>
    <p className="panel-intro">
      برای مدیریت کارتت وارد حساب شو.
    </p>

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
          autoComplete="username"
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

      <button className="button form-submit" type="submit" disabled={busy}>
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
