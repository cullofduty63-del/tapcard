"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  full_name: string;
  job: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  location: string | null;
};

export default function ProfilePage() {
  const params = useParams();
  const username = String(params.username);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOwner = !!profile && userId === profile.id;

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, username, full_name, job, bio, avatar_url, phone, email, website, location"
        )
        .eq("username", username)
        .maybeSingle();

      if (profileError) {
        setError("مشکل در دریافت اطلاعات کارت. تنظیمات Supabase را بررسی کن.");
        setProfile(null);
      } else if (data) {
        setProfile(data as Profile);
        setForm(data as Profile);
      } else {
        setProfile(null);
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کن.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, [username]);

  function changeField(key: keyof Profile, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveChanges() {
    if (!profile || !isOwner || saving) return;

    setSaving(true);
    setError("");

    try {
      const updates = {
        full_name: form.full_name?.trim() || "",
        job: form.job?.trim() || null,
        bio: form.bio?.trim() || null,
        avatar_url: form.avatar_url?.trim() || null,
        phone: form.phone?.trim() || null,
        email: form.email?.trim() || null,
        website: form.website?.trim() || null,
        location: form.location?.trim() || null,
      };

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select(
          "id, username, full_name, job, bio, avatar_url, phone, email, website, location"
        )
        .maybeSingle();

      if (updateError || !data) {
        setError(
          "ذخیره انجام نشد. مجوز ویرایش و ستون‌های جدول profiles در Supabase را بررسی کن."
        );
        return;
      }

      setProfile(data as Profile);
      setForm(data as Profile);
      setEditing(false);
    } catch {
      setError("هنگام ذخیره تغییرات مشکلی پیش آمد.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError("خروج انجام نشد. دوباره تلاش کن.");
      return;
    }

    setUserId(null);
    setEditing(false);
    setError("");
  }

  function input(
    key: keyof Profile,
    label: string,
    placeholder: string
  ) {
    return (
      <label className="mb-4 block">
        <span className="mb-2 block text-sm text-zinc-400">{label}</span>
        <input
          className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white outline-none transition focus:border-purple-500"
          value={String(form[key] ?? "")}
          placeholder={placeholder}
          onChange={(e) => changeField(key, e.target.value)}
        />
      </label>
    );
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#09090b] text-white"
      >
        <p className="animate-pulse">در حال بارگذاری کارت...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#09090b] px-4 text-white"
      >
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-3xl">
          ✦
        </div>

        <h1 className="text-3xl font-black">کارت پیدا نشد!</h1>

        <p className="text-center text-zinc-400">
          نام کاربری را بررسی کن یا بعداً دوباره تلاش کن.
        </p>

        {error && (
          <p role="alert" className="text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <Link
          href="/"
          className="rounded-xl bg-purple-600 px-5 py-3 font-bold transition hover:bg-purple-500"
        >
          بازگشت به صفحه اصلی
        </Link>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#09090b] px-4 py-8 text-white"
    >
      <header className="mx-auto mb-10 flex max-w-3xl items-center justify-between gap-3">
        <Link href="/" className="text-2xl font-black tracking-tight">
          Lumo<span className="text-purple-400">Card</span>
        </Link>

        {isOwner && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (editing) {
                  setForm(profile);
                  setEditing(false);
                  setError("");
                } else {
                  setForm(profile);
                  setEditing(true);
                  setError("");
                }
              }}
              className="rounded-xl bg-purple-600 px-4 py-2 font-bold transition hover:bg-purple-500"
            >
              {editing ? "لغو ویرایش" : "✏️ ویرایش کارت"}
            </button>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm transition hover:border-red-400/50 hover:text-red-300"
            >
              خروج
            </button>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-xl">
        {editing && isOwner ? (
          <div className="rounded-3xl border border-white/10 bg-[#121216] p-5 shadow-2xl shadow-purple-950/10 sm:p-7">
            <div className="mb-6">
              <span className="text-sm font-bold text-purple-400">
                LUMOCARD STUDIO
              </span>
              <h1 className="mt-2 text-2xl font-black">ویرایش کارت</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                اطلاعات کارتت رو تغییر بده و در پایان ذخیره کن.
              </p>
            </div>

            {input("full_name", "نام و نام خانوادگی", "مثلاً علی رضایی")}
            {input("job", "شغل", "مثلاً طراح گرافیک")}
            {input("avatar_url", "لینک عکس پروفایل", "https://example.com/photo.jpg")}
            {input("phone", "شماره تماس", "09...")}
            {input("email", "ایمیل عمومی", "name@example.com")}
            {input("website", "وب‌سایت", "https://example.com")}
            {input("location", "موقعیت مکانی", "تهران")}

            <label className="mb-5 block">
              <span className="mb-2 block text-sm text-zinc-400">
                درباره من
              </span>

              <textarea
                className="min-h-28 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none transition focus:border-purple-500"
                value={String(form.bio ?? "")}
                onChange={(e) => changeField("bio", e.target.value)}
                placeholder="کمی درباره خودت بنویس..."
              />
            </label>

            {error && (
              <p role="alert" className="mb-4 text-sm leading-6 text-red-400">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={saveChanges}
              disabled={saving}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121216] shadow-2xl shadow-purple-950/10">
            <div className="h-2 bg-gradient-to-l from-purple-700 via-purple-400 to-fuchsia-500" />

            <div className="p-6 text-center sm:p-8">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                  className="mx-auto mb-5 h-28 w-28 rounded-full border border-white/10 bg-black/40 object-cover"
                />
              ) : (
                <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-purple-400/20 bg-purple-600/15 text-4xl font-black text-purple-300">
                  {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}

              <p className="mb-2 text-xs font-bold tracking-[0.2em] text-purple-400">
                DIGITAL BUSINESS CARD
              </p>

              <h1 className="text-3xl font-black">
                {profile.full_name || profile.username}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                @{profile.username}
              </p>

              {profile.job && (
                <p className="mt-3 font-medium text-purple-300">
                  {profile.job}
                </p>
              )}

              {profile.bio && (
                <p className="mt-5 whitespace-pre-wrap break-words leading-8 text-zinc-300">
                  {profile.bio}
                </p>
              )}

              <div className="mt-7 space-y-3">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="block rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-purple-500/60 hover:bg-purple-500/5"
                  >
                    📞 تماس با من
                  </a>
                )}

                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="block rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-purple-500/60 hover:bg-purple-500/5"
                  >
                    ✉️ ارسال ایمیل
                  </a>
                )}

                {profile.website && (
                  <a
                    href={
                      /^https?:\/\//i.test(profile.website)
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-purple-500/60 hover:bg-purple-500/5"
                  >
                    🌐 مشاهده وب‌سایت
                  </a>
                )}

                {profile.location && (
                  <p className="pt-2 text-sm text-zinc-400">
                    📍 {profile.location}
                  </p>
                )}
              </div>

              {isOwner && (
                <p className="mt-7 text-xs leading-6 text-zinc-500">
                  این کارت به حساب شما متصل است؛ برای تغییر اطلاعات از دکمه
                  ویرایش استفاده کن.
                </p>
              )}
            </div>
          </div>
        )}

        {!isOwner && (
          <p className="mt-6 text-center text-xs text-zinc-600">
            Powered by LumoCard
          </p>
        )}

        {error && !editing && (
          <p role="alert" className="mt-4 text-center text-sm text-red-400">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
