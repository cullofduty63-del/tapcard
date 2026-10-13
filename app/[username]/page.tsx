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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      setError("مشکل در دریافت اطلاعات کارت.");
    } else if (data) {
      setProfile(data as Profile);
      setForm(data as Profile);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, [username]);

  function changeField(key: keyof Profile, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveChanges() {
    if (!profile || !isOwner || saving) return;

    setSaving(true);
    setError("");

    const updates = {
      full_name: form.full_name?.trim() || "",
      job: form.job || "",
      bio: form.bio || "",
      avatar_url: form.avatar_url || "",
      phone: form.phone || "",
      email: form.email || "",
      website: form.website || "",
      location: form.location || "",
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id)
      .select()
      .maybeSingle();

    if (error || !data) {
      setError(
        "ذخیره انجام نشد. مجوز ویرایش حساب و تنظیمات Supabase را بررسی کن."
      );
      setSaving(false);
      return;
    }

    setProfile(data as Profile);
    setForm(data as Profile);
    setEditing(false);
    setSaving(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUserId(null);
    setEditing(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        در حال بارگذاری کارت...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">کارت پیدا نشد!</h1>
        <Link href="/" className="text-purple-400">
          بازگشت به صفحه اصلی
        </Link>
      </main>
    );
  }

  function input(
    key: keyof Profile,
    label: string,
    placeholder: string
  ) {
    return (
      <label className="block mb-4">
        <span className="block text-sm text-zinc-400 mb-2">{label}</span>
        <input
          className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white outline-none focus:border-purple-500"
          value={String(form[key] ?? "")}
          placeholder={placeholder}
          onChange={(e) => changeField(key, e.target.value)}
        />
      </label>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#09090b] text-white px-4 py-8"
    >
      <header className="max-w-3xl mx-auto flex items-center justify-between mb-10">
        <Link href="/" className="text-2xl font-black tracking-tight">
          Lumo<span className="text-purple-400">Card</span>
        </Link>

        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setForm(profile);
                setEditing(!editing);
                setError("");
              }}
              className="rounded-xl bg-purple-600 px-4 py-2 font-bold hover:bg-purple-500"
            >
              {editing ? "لغو ویرایش" : "✏️ ویرایش کارت"}
            </button>

            <button
              onClick={logout}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm"
            >
              خروج
            </button>
          </div>
        )}
      </header>

      <section className="max-w-xl mx-auto">
        {editing && isOwner ? (
          <div className="rounded-3xl border border-white/10 bg-[#121216] p-6">
            <h1 className="text-2xl font-black mb-6">ویرایش کارت</h1>

            {input("full_name", "نام و نام خانوادگی", "مثلاً علی رضایی")}
            {input("job", "شغل", "مثلاً طراح گرافیک")}
            {input("avatar_url", "لینک عکس پروفایل", "https://...")}
            {input("phone", "شماره تماس", "09...")}
            {input("email", "ایمیل عمومی", "name@example.com")}
            {input("website", "وب‌سایت", "https://example.com")}
            {input("location", "موقعیت مکانی", "تهران")}

            <label className="block mb-5">
              <span className="block text-sm text-zinc-400 mb-2">
                درباره من
              </span>
              <textarea
                className="w-full min-h-28 rounded-xl border border-white/10 bg-black/40 p-3 text
