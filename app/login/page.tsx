"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
const router = useRouter();

const [error, setError] = useState("");
const [busy, setBusy] = useState(false);
const [passwordFocused, setPasswordFocused] = useState(false);

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
    throw new Error(
      "ورود انجام شد، اما ذخیره نشست ناموفق بود. دوباره تلاش کن."
    );
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

return ( <main className="page-shell lc-login-page"> <style jsx>{`
  .lc-login-page .panel.narrow{position:relative;overflow:hidden;border-color:#363636;background:radial-gradient(ellipse at 50% 0%,#222222 0%,#101018 48%);box-shadow:0 24px 80px #0006,0 0 0 1px #ffffff10;animation:lc-login-enter .65s cubic-bezier(.2,.8,.2,1) both}
  .lc-login-page .panel.narrow:before{content:"";position:absolute;inset:0 18% auto;height:1px;background:linear-gradient(90deg,transparent,#f2f2f2,transparent);opacity:.8}
  .lc-login-page .panel.narrow h1{letter-spacing:-.4px}
  .lc-password-scene{height:145px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;margin:-3px 0 13px;position:relative}
  .lc-password-mascot{width:96px;height:96px;position:relative;filter:drop-shadow(0 10px 22px #ffffff18);transition:transform .32s cubic-bezier(.2,.8,.2,1)}
  .lc-password-mascot:after{content:"";position:absolute;z-index:-1;left:15px;right:15px;bottom:-7px;height:16px;border-radius:50%;background:#ffffff18;filter:blur(10px)}
  .lc-mascot-face{position:absolute;inset:13px 8px 4px;border:1px solid #f0f0f0;border-radius:43% 43% 46% 46%;background:linear-gradient(145deg,#f5f5f5 0%,#bdbdbd 45%,#666666 100%);box-shadow:inset 0 -7px 12px #33333355,0 0 0 4px #ffffff18;overflow:hidden}
  .lc-mascot-ear{position:absolute;top:2px;width:29px;height:34px;background:linear-gradient(145deg,#eeeeee,#777777);border:1px solid #f0f0f0;border-radius:80% 20% 55% 25%;z-index:0}
  .lc-ear-left{left:11px;transform:rotate(-24deg)}.lc-ear-right{right:11px;transform:scaleX(-1) rotate(-24deg)}
  .lc-mascot-eye{position:absolute;top:36px;width:7px;height:11px;background:#222222;border-radius:50%;transition:all .22s ease}
  .lc-eye-left{left:23px}.lc-eye-right{right:23px}
  .lc-mascot-blush{position:absolute;top:51px;width:13px;height:7px;border-radius:50%;background:#dedede;opacity:.8;filter:blur(1px)}.lc-blush-left{left:12px}.lc-blush-right{right:12px}
  .lc-mascot-mouth{position:absolute;top:51px;left:calc(50% - 4px);width:8px;height:5px;border-bottom:2px solid #222222;border-radius:0 0 8px 8px}
  .lc-mascot-arm{position:absolute;z-index:2;top:42px;width:32px;height:13px;border:1px solid #ffffff;border-radius:12px;background:linear-gradient(180deg,#eeeeee,#777777);box-shadow:0 3px 8px #33333355;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
  .lc-arm-left{left:0;transform:rotate(24deg);transform-origin:right center}.lc-arm-right{right:0;transform:rotate(-24deg);transform-origin:left center}
  .lc-password-scene.is-covering .lc-mascot-arm.lc-arm-left{transform:translate(17px,-9px) rotate(-36deg)}.lc-password-scene.is-covering .lc-mascot-arm.lc-arm-right{transform:translate(-17px,-9px) rotate(36deg)}
  .lc-password-scene.is-covering .lc-mascot-eye{opacity:0;transform:scale(.3)}.lc-password-scene.is-covering .lc-password-mascot{transform:translateY(-2px) scale(1.03)}
  .lc-mascot-caption{font-size:11px;color:#c8c8c8;margin:3px 0 0;transition:opacity .2s ease}
  .lc-login-page .field input{transition:border-color .2s,box-shadow .2s,background .2s}.lc-login-page .field input:focus{background:#0b0b0b}
  @keyframes lc-login-enter{from{opacity:0;transform:translateY(12px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
  @media(prefers-reduced-motion:reduce){.lc-login-page .panel.narrow{animation:none}.lc-password-mascot,.lc-mascot-arm,.lc-mascot-eye,.lc-mascot-caption{transition:none}}
`}</style> <div className="container subnav"> <Link className="brand" href="/">
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
          minLength={3}
          maxLength={24}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          dir="ltr"
          placeholder="samiyar"
        />
      </div>

      <div className={`lc-password-scene${passwordFocused ? " is-covering" : ""}`} aria-hidden="true">
        <div className="lc-password-mascot">
          <span className="lc-mascot-ear lc-ear-left" />
          <span className="lc-mascot-ear lc-ear-right" />
          <span className="lc-mascot-face">
            <span className="lc-mascot-eye lc-eye-left" />
            <span className="lc-mascot-eye lc-eye-right" />
            <span className="lc-mascot-blush lc-blush-left" />
            <span className="lc-mascot-blush lc-blush-right" />
            <span className="lc-mascot-mouth" />
          </span>
          <span className="lc-mascot-arm lc-arm-left" />
          <span className="lc-mascot-arm lc-arm-right" />
        </div>
        <p className="lc-mascot-caption">{passwordFocused ? "رازت پیش خودم می‌مونه 🙈" : "رمزتو وارد کن؛ حواسمو جمع می‌کنم!"}</p>
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
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
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
