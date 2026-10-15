"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const templates = [
  ["personal", "✦", "شخصی"],
  ["business", "▣", "کسب‌وکار"],
  ["designer", "✎", "طراح"],
  ["developer", "⌘", "برنامه‌نویس"],
  ["creator", "▶", "تولید محتوا"],
  ["shop", "◇", "فروشگاه"],
  ["cafe", "☕", "کافه"],
];

export default function RegisterPage() {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (!success) return;

    if (seconds <= 0) {
      router.replace("/login?created=1");
      return;
    }

    const timer = window.setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [success, seconds, router]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy || success) return;

    setError("");
    setBusy(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : `ثبت‌نام انجام نشد. خطای ${response.status}`
        );
      }

      if (result?.success !== true) {
        throw new Error("پاسخ ثبت‌نام از سرور معتبر نیست.");
      }

      setSuccess(true);
      setSeconds(10);
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

      <section className="panel">
        <h1>کارت دیجیتالت رو بساز ✨</h1>

        <p className="panel-intro">
          حساب بساز، قالب متناسب با کارت رو انتخاب کن و لینک اختصاصی بگیر.
        </p>

        {error && (
          <div className="notice" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div className="notice success" role="status">
            <strong>🎉 ثبت‌نام موفق بود!</strong>

            <p>
              حسابت ساخته شد. تا انتقال به صفحه ورود:
              {" "}
              <strong>{seconds}</strong>
              {" "}ثانیه
            </p>

            <button
              className="button form-submit"
              type="button"
              onClick={() => router.replace("/login?created=1")}
            >
              ورود به حساب ←
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="form-grid">
            <div className="field">
              <label htmlFor="register-full-name">نام نمایشی *</label>

              <input
                id="register-full-name"
                name="full_name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Samiyar Bornaei"
              />
            </div>

            <div className="field">
              <label htmlFor="register-username">آدرس اختصاصی *</label>

              <input
                id="register-username"
                name="username"
                required
                minLength={3}
                maxLength={24}
                pattern="[a-zA-Z0-9_-]+"
                autoComplete="username"
                placeholder="samiyar"
                dir="ltr"
              />

              <small>فقط حروف انگلیسی، عدد، _ و -</small>
            </div>

            <div className="field">
              <label htmlFor="register-password">رمز عبور *</label>

              <input
                id="register-password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
              />
            </div>

            <div className="field">
              <label htmlFor="register-job">عنوان شغلی</label>

              <input
                id="register-job"
                name="job"
                maxLength={100}
                placeholder="مثلاً Developer & Content Creator"
              />
            </div>

            <div className="field full">
              <label>قالب اولیه</label>

              <div className="template-grid">
                {templates.map(([id, icon, title], index) => (
                  <label className="template-option" key={id}>
                    <input
                      type="radio"
                      name="template"
                      value={id}
                      defaultChecked={index === 0}
                    />

                    <span className="template-box">
                      <span className="template-icon">{icon}</span>
                      {title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field full">
              <button
                className="button form-submit"
                type="submit"
                disabled={busy}
              >
                {busy ? "در حال ساخت حساب..." : "ساخت حساب و کارت ←"}
              </button>
            </div>
          </form>
        )}

        {!success && (
          <p className="under-form">
            حساب داری؟ <Link href="/login">وارد شو</Link>
          </p>
        )}
      </section>
    </main>
  );
}
