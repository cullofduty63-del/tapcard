"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  job: string | null;
  bio: string | null;
  phone: string | null;
  website: string | null;
  avatar_url: string | null;
};

const emptyProfile: Profile = {
  id: "",
  username: "",
  full_name: "",
  job: "",
  bio: "",
  phone: "",
  website: "",
  avatar_url: "",
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const session = data.session;
      if (!session) {
        router.replace("/login");
        return;
      }
      setToken(session.access_token);
      try {
        const response = await fetch("/api/account/profile", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const result = await response.json();
        if (!active) return;
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error(result.error || "بارگذاری پروفایل ناموفق بود.");
        setProfile({ ...emptyProfile, ...result.profile });
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "خطا در بارگذاری اطلاعات.");
        setErrorMessage(true);
      } finally {
        if (active) setBusy(false);
      }
    });
    return () => { active = false; };
  }, [router]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage(false);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          job: profile.job,
          bio: profile.bio,
          phone: profile.phone,
          website: profile.website,
          avatar_url: profile.avatar_url,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ذخیره اطلاعات ناموفق بود.");
      setProfile({ ...emptyProfile, ...result.profile });
      setMessage("تغییرات ذخیره شد.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "ذخیره اطلاعات ناموفق بود.");
      setErrorMessage(true);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (busy) return <main className="loading">در حال آماده‌سازی داشبورد…</main>;

  return (
    <main className="account" dir="rtl">
      <header className="top">
        <Link href="/" className="brand">Lumo<span>Card</span></Link>
        <div className="topActions">
          {profile.username && <a className="view" href={`/${encodeURIComponent(profile.username)}`} target="_blank" rel="noreferrer">مشاهده کارت ↗</a>}
          <button className="logout" onClick={logout}>خروج</button>
        </div>
      </header>
      <section className="content">
        <div className="heading"><div className="eyebrow">فضای کاری مشتری</div><h1>کارت دیجیتال من</h1><p>اطلاعات کارتت رو ویرایش کن و تغییرات رو ذخیره کن.</p></div>
        <div className="layout">
          <form className="panel" onSubmit={save}>
            <h2>اطلاعات کارت</h2>
            <p className="muted">نام کاربری و لینک کارت توسط مدیریت تعیین می‌شه.</p>
            <label>نام کاربری</label><input value={profile.username || ""} readOnly />
            <label>نام کامل</label><input value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required maxLength={100} />
            <label>عنوان شغلی</label><input value={profile.job || ""} onChange={(e) => setProfile({ ...profile, job: e.target.value })} maxLength={100} />
            <label>معرفی کوتاه</label><textarea value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={4} maxLength={500} />
            <label>شماره تماس</label><input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} maxLength={40} />
            <label>وب‌سایت</label><input type="url" value={profile.website || ""} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="https://example.com" maxLength={300} />
            <label>آدرس عکس پروفایل</label><input type="url" value={profile.avatar_url || ""} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} placeholder="https://..." maxLength={1000} />
            {message && <div className={errorMessage ? "message error" : "message"} role="status">{message}</div>}
            <button className="save" disabled={saving}>{saving ? "در حال ذخیره…" : "ذخیره تغییرات"}</button>
          </form>
          <aside className="preview">
            <div className="previewTag">پیش‌نمایش کارت</div>
            <div className="card">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <div className="avatar">{(profile.full_name || "L").slice(0,1)}</div>}
              <h2>{profile.full_name || "نام شما"}</h2>
              <p className="job">{profile.job || "عنوان شغلی"}</p>
              <p className="bio">{profile.bio || "معرفی کوتاه شما اینجا نمایش داده می‌شه."}</p>
              {profile.phone && <div className="detail">{profile.phone}</div>}
              {profile.website && <div className="detail">{profile.website}</div>}
              <div className="cardFoot">LUMOCARD · @{profile.username || "username"}</div>
            </div>
            <p className="muted">این پیش‌نمایش نمونه است؛ ظاهر عمومی کارت ممکن است بر اساس قالب فعلی سایت کمی متفاوت باشد.</p>
          </aside>
        </div>
      </section>
      <style jsx>{`
        .account{min-height:100vh;background:#0b0910;color:#f7f4fc;font-family:Vazirmatn,Tahoma,Arial,sans-serif;padding:0 20px 50px}
        .top{height:76px;max-width:1180px;margin:auto;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #292332;gap:12px}
        .brand{color:#fff;font:bold 23px Arial,sans-serif;text-decoration:none}.brand span{color:#bba0ff}
        .topActions{display:flex;align-items:center;gap:10px}.view,.logout{border:1px solid #3b304b;border-radius:10px;padding:10px 13px;color:#ded2f6;background:#17121f;text-decoration:none;font:inherit;font-size:12px;cursor:pointer}
        .content{max-width:1180px;margin:34px auto}.eyebrow{color:#bba0ff;font-size:11px;font-weight:800}.heading h1{font-size:clamp(27px,4vw,38px);margin:8px 0}.heading p,.muted{color:#a39bae;font-size:13px;line-height:1.9}
        .layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:20px;margin-top:24px;align-items:start}
        .panel,.preview{border:1px solid #30273b;background:#131019;border-radius:18px;padding:clamp(18px,3vw,28px);min-width:0}
        .panel h2{margin:0;font-size:19px}.panel label{display:block;margin:18px 0 8px;font-size:12px;color:#e8e0f4}
        input,textarea{width:100%;min-width:0;border:1px solid #393043;border-radius:10px;background:#0b0910;color:#fff;padding:12px;font:inherit;font-size:13px;outline:none}
        input:focus,textarea:focus{border-color:#a78bfa}input[readonly]{color:#a9a0b8;background:#17131d}
        .save{width:100%;margin-top:22px;min-height:46px;border:0;border-radius:10px;background:linear-gradient(110deg,#c4b5fd,#8b5cf6);color:#170e27;font:inherit;font-weight:900;cursor:pointer}.save:disabled{opacity:.65}
        .message{padding:12px;margin-top:14px;border-radius:10px;background:#163025;color:#a7f3d0;font-size:12px;line-height:1.8}.error{background:#391c28;color:#fecdd3}
        .previewTag{color:#c4b5fd;font-size:12px;margin-bottom:14px}.card{border:1px solid #514064;border-radius:20px;padding:25px 18px;background:radial-gradient(ellipse at top,#38234e,#17121e 65%);text-align:center;overflow-wrap:anywhere}
        .card img,.avatar{width:76px;height:76px;border-radius:24px;object-fit:cover;margin:4px auto 16px}.avatar{display:grid;place-items:center;background:#4a3265;color:#fff;font-size:27px;font-weight:900}
        .card h2{margin:0;font-size:22px}.job{color:#c4b5fd;font-size:13px}.bio{color:#c9c1d5;font-size:13px;line-height:2}.detail{margin-top:9px;font-size:12px;color:#e5dcf4;overflow-wrap:anywhere}.cardFoot{margin-top:24px;padding-top:14px;border-top:1px solid #514064;color:#9588a9;font:10px Arial,sans-serif;letter-spacing:1px}
        .loading{min-height:100vh;display:grid;place-items:center;background:#0b0910;color:#fff;font-family:Vazirmatn,Tahoma,Arial,sans-serif}
        @media(max-width:760px){.account{padding:0 13px 30px}.layout{grid-template-columns:1fr}.content{margin:24px auto}.top{height:68px}.view,.logout{padding:9px;font-size:11px}.preview{order:-1}}
      `}</style>
    </main>
  );
}
