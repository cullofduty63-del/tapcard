"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Appearance = {
  backgroundType: "solid" | "gradient" | "image";
  backgroundColor: string;
  backgroundEndColor: string;
  accentColor: string;
  textColor: string;
  animation: "none" | "float" | "glow";
  backgroundImage: string;
};

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
  social_links: Record<string, string> | null;
  appearance?: Appearance | null;
};

type Social = {
  id: string;
  name: string;
  category: "iranian" | "international";
  icon: string;
  baseUrl: string;
  slug?: string;
};

const defaultAppearance: Appearance = {
  backgroundType: "gradient",
  backgroundColor: "#09090f",
  backgroundEndColor: "#251044",
  accentColor: "#a855f7",
  textColor: "#ffffff",
  animation: "float",
  backgroundImage: "",
};

const jobs: { category: string; items: string[] }[] = [
  {
    category: "فناوری و کامپیوتر",
    items: [
      "برنامه‌نویس",
      "توسعه‌دهنده وب",
      "توسعه‌دهنده اپلیکیشن",
      "طراح رابط کاربری",
      "طراح تجربه کاربری",
      "متخصص هوش مصنوعی",
      "متخصص یادگیری ماشین",
      "متخصص امنیت سایبری",
      "مدیر شبکه",
      "کارشناس IT",
      "تعمیرکار کامپیوتر",
      "تعمیرکار موبایل",
      "مدیر پایگاه داده",
      "مهندس نرم‌افزار",
      "مهندس سخت‌افزار",
      "متخصص رایانش ابری",
      "متخصص سئو",
      "مدیر محصول دیجیتال",
      "توسعه‌دهنده بازی",
      "طراح بازی",
    ],
  },
  {
    category: "هنر و رسانه",
    items: [
      "گرافیست",
      "طراح لوگو",
      "طراح لباس",
      "عکاس",
      "فیلم‌بردار",
      "تدوینگر ویدئو",
      "موشن گرافیست",
      "انیماتور",
      "نقاش",
      "تصویرگر",
      "نویسنده",
      "شاعر",
      "روزنامه‌نگار",
      "خبرنگار",
      "گوینده",
      "مجری",
      "بازیگر",
      "کارگردان",
      "آهنگساز",
      "موسیقی‌دان",
    ],
  },
  {
    category: "تولید محتوا و فضای مجازی",
    items: [
      "تولیدکننده محتوا",
      "یوتیوبر",
      "استریمر",
      "گیمر",
      "اینفلوئنسر",
      "ادمین اینستاگرام",
      "ادمین شبکه‌های اجتماعی",
      "مدیر محتوا",
      "مدیر کانال",
      "پادکستر",
      "مدیر تبلیغات",
      "کارشناس دیجیتال مارکتینگ",
      "کارشناس بازاریابی",
      "متخصص تبلیغات آنلاین",
      "طراح سایت",
    ],
  },
  {
    category: "مدیریت و کسب‌وکار",
    items: [
      "مدیرعامل",
      "کارآفرین",
      "مدیر شرکت",
      "مدیر فروشگاه",
      "مدیر پروژه",
      "مدیر منابع انسانی",
      "مشاور کسب‌وکار",
      "مشاور مدیریت",
      "کارشناس فروش",
      "بازاریاب",
      "فروشنده",
      "تاجر",
      "صادرکننده",
      "واردکننده",
      "مشاور املاک",
      "حسابدار",
      "حسابرس",
      "تحلیلگر مالی",
      "کارشناس بیمه",
      "مشاور سرمایه‌گذاری",
    ],
  },
  {
    category: "پزشکی و سلامت",
    items: [
      "پزشک",
      "دندان‌پزشک",
      "پرستار",
      "داروساز",
      "روان‌شناس",
      "مشاور خانواده",
      "فیزیوتراپیست",
      "کارشناس تغذیه",
      "دامپزشک",
      "مربی ورزشی",
      "ماساژدرمانگر",
      "کارشناس آزمایشگاه",
    ],
  },
  {
    category: "مهندسی و مشاغل فنی",
    items: [
      "مهندس عمران",
      "مهندس معماری",
      "مهندس برق",
      "مهندس مکانیک",
      "مهندس صنایع",
      "مهندس شیمی",
      "مهندس نفت",
      "مهندس کشاورزی",
      "معمار",
      "طراح داخلی",
      "برق‌کار",
      "لوله‌کش",
      "جوشکار",
      "مکانیک خودرو",
      "تکنسین فنی",
    ],
  },
  {
    category: "آموزش و پژوهش",
    items: [
      "معلم",
      "استاد دانشگاه",
      "مدرس خصوصی",
      "مدرس زبان",
      "مترجم",
      "مدرس موسیقی",
      "مدرس هنر",
      "پژوهشگر",
      "دانشجو",
      "مدرس برنامه‌نویسی",
      "مشاور تحصیلی",
      "مربی آموزشی",
    ],
  },
  {
    category: "خدمات و مشاغل آزاد",
    items: [
      "آشپز",
      "قناد",
      "باریستا",
      "رستوران‌دار",
      "آرایشگر",
      "خیاط",
      "طراح جواهرات",
      "گل‌فروش",
      "فروشنده آنلاین",
      "راننده",
      "مترجم آزاد",
      "خدمات کامپیوتری",
      "خدمات چاپ",
      "مشاور سفر",
      "آژانس مسافرتی",
    ],
  },
];

const socials: Social[] = [
  { id: "instagram", name: "اینستاگرام", category: "international", icon: "◎", slug: "instagram", baseUrl: "https://instagram.com/" },
  { id: "telegram", name: "تلگرام", category: "international", icon: "➤", slug: "telegram", baseUrl: "https://t.me/" },
  { id: "whatsapp", name: "واتساپ", category: "international", icon: "◉", slug: "whatsapp", baseUrl: "https://wa.me/" },
  { id: "youtube", name: "یوتیوب", category: "international", icon: "▶", slug: "youtube", baseUrl: "https://youtube.com/" },
  { id: "tiktok", name: "تیک‌تاک", category: "international", icon: "♫", slug: "tiktok", baseUrl: "https://tiktok.com/@" },
  { id: "linkedin", name: "لینکدین", category: "international", icon: "in", slug: "linkedin", baseUrl: "https://linkedin.com/in/" },
  { id: "discord", name: "دیسکورد", category: "international", icon: "◈", slug: "discord", baseUrl: "https://discord.com/users/" },
  { id: "x", name: "ایکس", category: "international", icon: "𝕏", slug: "x", baseUrl: "https://x.com/" },
  { id: "facebook", name: "فیسبوک", category: "international", icon: "f", slug: "facebook", baseUrl: "https://facebook.com/" },
  { id: "twitch", name: "توییچ", category: "international", icon: "▣", slug: "twitch", baseUrl: "https://twitch.tv/" },
  { id: "github", name: "گیت‌هاب", category: "international", icon: "⌘", slug: "github", baseUrl: "https://github.com/" },
  { id: "pinterest", name: "پینترست", category: "international", icon: "P", slug: "pinterest", baseUrl: "https://pinterest.com/" },
  { id: "snapchat", name: "اسنپ‌چت", category: "international", icon: "👻", slug: "snapchat", baseUrl: "https://snapchat.com/add/" },
  { id: "threads", name: "تردز", category: "international", icon: "@", slug: "threads", baseUrl: "https://threads.net/@" },
  { id: "website", name: "وب‌سایت", category: "international", icon: "↗", baseUrl: "https://" },
  { id: "bale", name: "بله", category: "iranian", icon: "ب", baseUrl: "https://ble.ir/" },
  { id: "eitaa", name: "ایتا", category: "iranian", icon: "ا", baseUrl: "https://eitaa.com/" },
  { id: "rubika", name: "روبیکا", category: "iranian", icon: "ر", baseUrl: "https://rubika.ir/" },
  { id: "soroush", name: "سروش پلاس", category: "iranian", icon: "س", baseUrl: "https://splus.ir/" },
  { id: "igap", name: "آیگپ", category: "iranian", icon: "آ", baseUrl: "https://igap.net/" },
  { id: "gap", name: "گپ", category: "iranian", icon: "گ", baseUrl: "https://gap.im/" },
  { id: "virasty", name: "ویراستی", category: "iranian", icon: "و", baseUrl: "https://virasty.com/" },
];

const jobOptions = Array.from(new Set(jobs.flatMap((group) => group.items)));

function makeSocialUrl(id: string, value: string) {
  const clean = value.trim();
  if (!clean) return "";

  if (/^https?:\/\//i.test(clean)) return clean;

  const social = socials.find((item) => item.id === id);
  if (!social) return clean;

  if (id === "whatsapp") {
    const number = clean.replace(/[^\d]/g, "");
    return number ? `https://wa.me/${number}` : "";
  }

  if (id === "website") {
    return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  }

  return social.baseUrl + clean.replace(/^@/, "").replace(/^\/+/, "");
}

function SocialIcon({ social }: { social: Social }) {
  if (social.slug) {
    return (
      <span className="lum-social-icon">
        <img
          src={`https://cdn.simpleicons.org/${social.slug}`}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span>{social.icon}</span>
      </span>
    );
  }

  return <span className="lum-social-icon">{social.icon}</span>;
}

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
  const [socialDraft, setSocialDraft] = useState<Record<string, string>>({});
  const [customJob, setCustomJob] = useState(false);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [selectedSocial, setSelectedSocial] = useState<Record<string, boolean>>({});
  const [socialSearch, setSocialSearch] = useState("");

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
        .select("id, username, full_name, job, bio, avatar_url, phone, email, website, location, social_links, appearance")
        .eq("username", username)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
        setError("اطلاعات کارت دریافت نشد. مطمئن شو ستون‌های social_links و appearance در Supabase ساخته شده‌اند.");
        setProfile(null);
        return;
      }

      if (data) {
        const loaded = data as Profile;
        setProfile(loaded);
        setForm(loaded);
        setSocialDraft(loaded.social_links ?? {});
        setAppearance({ ...defaultAppearance, ...(loaded.appearance ?? {}) });

        const chosen: Record<string, boolean> = {};
        Object.entries(loaded.social_links ?? {}).forEach(([id, value]) => {
          if (value) chosen[id] = true;
        });
        setSelectedSocial(chosen);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error(err);
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

  function updateSocial(id: string, value: string) {
    setSocialDraft((prev) => ({ ...prev, [id]: value }));
  }

  function toggleSocial(id: string) {
    setSelectedSocial((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function saveChanges() {
    if (!profile || !isOwner || saving) return;

    setSaving(true);
    setError("");

    try {
      const socialLinks: Record<string, string> = {};

      for (const social of socials) {
        if (!selectedSocial[social.id]) continue;
        const value = socialDraft[social.id]?.trim();
        if (value) socialLinks[social.id] = makeSocialUrl(social.id, value);
      }

      const updates = {
        full_name: form.full_name?.trim() || "",
        job: form.job?.trim() || null,
        bio: form.bio?.trim() || null,
        avatar_url: form.avatar_url?.trim() || null,
        phone: form.phone?.trim() || null,
        email: form.email?.trim() || null,
        website: form.website?.trim() || null,
        location: form.location?.trim() || null,
        social_links: socialLinks,
        appearance,
      };

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select("id, username, full_name, job, bio, avatar_url, phone, email, website, location, social_links, appearance")
        .maybeSingle();

      if (updateError || !data) {
        console.error(updateError);
        setError("ذخیره انجام نشد. وجود ستون appearance و مجوز ویرایش در Supabase را بررسی کن.");
        return;
      }

      const saved = data as Profile;
      setProfile(saved);
      setForm(saved);
      setSocialDraft(saved.social_links ?? {});
      setAppearance({ ...defaultAppearance, ...(saved.appearance ?? {}) });
      setEditing(false);
    } catch (err) {
      console.error(err);
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
    placeholder: string,
    type = "text"
  ) {
    return (
      <label className="lum-field" key={key}>
        <span>{label}</span>
        <input
          type={type}
          value={String(form[key] ?? "")}
          placeholder={placeholder}
          onChange={(e) => changeField(key, e.target.value)}
        />
      </label>
    );
  }

  function updateAppearance(key: keyof Appearance, value: string) {
    setAppearance((prev) => ({ ...prev, [key]: value }));
  }

  const cardAppearance = {
    ...defaultAppearance,
    ...(profile.appearance ?? {}),
  };

  const cardStyle: React.CSSProperties = {
    color: cardAppearance.textColor,
    borderColor: `${cardAppearance.accentColor}80`,
    background:
      cardAppearance.backgroundType === "image" && cardAppearance.backgroundImage
        ? `linear-gradient(#09090f88, #09090f88), url("${cardAppearance.backgroundImage}") center/cover`
        : cardAppearance.backgroundType === "solid"
          ? cardAppearance.backgroundColor
          : `linear-gradient(145deg, ${cardAppearance.backgroundColor}, ${cardAppearance.backgroundEndColor})`,
    boxShadow: `0 0 35px ${cardAppearance.accentColor}25`,
  };

  if (loading) {
    return (
      <main className="profile lum-profile" dir="rtl">
        <div className="pbox"><p>در حال بارگذاری کارت...</p></div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile lum-profile" dir="rtl">
        <div className="pbox">
          <div className="pavatar">✦</div>
          <h1>کارت پیدا نشد!</h1>
          <p>نام کاربری را بررسی کن یا بعداً دوباره تلاش کن.</p>
          {error && <p role="alert">{error}</p>}
          <Link href="/" className="button">بازگشت به صفحه اصلی</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="profile lum-profile" dir="rtl">
      <div className="lum-profile-wrap">
        <header className="lum-profile-header">
          <Link href="/" className="logo">Lumo<span>Card</span></Link>
          {isOwner && (
            <div className="lum-header-actions">
              <button
                type="button"
                className="button"
                onClick={() => {
                  if (editing) {
                    setForm(profile);
                    setSocialDraft(profile.social_links ?? {});
                    setAppearance({ ...defaultAppearance, ...(profile.appearance ?? {}) });
                    const chosen: Record<string, boolean> = {};
                    Object.entries(profile.social_links ?? {}).forEach(([id, value]) => {
                      if (value) chosen[id] = true;
                    });
                    setSelectedSocial(chosen);
                    setCustomJob(false);
                    setEditing(false);
                    setError("");
                  } else {
                    setForm(profile);
                    setSocialDraft(profile.social_links ?? {});
                    setAppearance({ ...defaultAppearance, ...(profile.appearance ?? {}) });
                    setCustomJob(!!profile.job && !jobOptions.includes(profile.job));
                    setEditing(true);
                    setError("");
                  }
                }}
              >
                {editing ? "لغو ویرایش" : "✏️ ویرایش کارت"}
              </button>
              <button type="button" className="ghost" onClick={logout}>خروج</button>
            </div>
          )}
        </header>

        {editing && isOwner ? (
          <section className="pbox lum-editor">
            <div className="lum-editor-heading">
              <span className="lum-eyebrow">LUMOCARD STUDIO</span>
              <h1>شخصی‌سازی کارت</h1>
              <p>اطلاعات، شبکه‌های اجتماعی و ظاهر کارتت رو تغییر بده.</p>
            </div>

            {input("full_name", "نام و نام خانوادگی", "مثلاً سامیار")}

            <label className="lum-field">
              <span>انتخاب شغل</span>
              <select
                value={customJob ? "__custom__" : String(form.job ?? "")}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setCustomJob(true);
                    changeField("job", "");
                  } else {
                    setCustomJob(false);
                    changeField("job", e.target.value);
                  }
                }}
              >
                <option value="">انتخاب شغل...</option>
                {jobs.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.items.map((job) => <option key={job} value={job}>{job}</option>)}
                  </optgroup>
                ))}
                <option value="__custom__">شغل من در فهرست نیست</option>
              </select>
            </label>

            {customJob && input("job", "شغل دلخواه", "شغل خودت را بنویس")}
            {input("avatar_url", "لینک عکس پروفایل", "https://example.com/photo.jpg")}
            {input("phone", "شماره تماس", "شماره تماس", "tel")}
            {input("email", "ایمیل عمومی", "name@example.com", "email")}
            {input("website", "وب‌سایت", "https://example.com")}
            {input("location", "موقعیت مکانی", "مثلاً تهران")}

            <label className="lum-field">
              <span>درباره من</span>
              <textarea
                value={String(form.bio ?? "")}
                onChange={(e) => changeField("bio", e.target.value)}
                placeholder="کمی درباره خودت یا کسب‌وکارت بنویس..."
                rows={4}
              />
            </label>

            <section className="lum-customizer">
              <span className="lum-eyebrow">CARD DESIGN</span>
              <h2>🎨 طراحی کارت</h2>
              <p>رنگ و پس‌زمینه کارت رو مطابق سلیقه‌ات تغییر بده.</p>

              <label className="lum-field">
                <span>نوع پس‌زمینه</span>
                <select
                  value={appearance.backgroundType}
                  onChange={(e) => updateAppearance("backgroundType", e.target.value)}
                >
                  <option value="gradient">گرادیانت</option>
                  <option value="solid">تک‌رنگ</option>
                  <option value="image">تصویر پس‌زمینه</option>
                </select>
              </label>

              <div className="lum-color-grid">
                <label className="lum-field">
                  <span>رنگ اصلی</span>
                  <input type="color" value={appearance.backgroundColor} onChange={(e) => updateAppearance("backgroundColor", e.target.value)} />
                </label>
                <label className="lum-field">
                  <span>رنگ دوم</span>
                  <input type="color" value={appearance.backgroundEndColor} onChange={(e) => updateAppearance("backgroundEndColor", e.target.value)} />
                </label>
                <label className="lum-field">
                  <span>رنگ تأکیدی</span>
                  <input type="color" value={appearance.accentColor} onChange={(e) => updateAppearance("accentColor", e.target.value)} />
                </label>
                <label className="lum-field">
                  <span>رنگ نوشته‌ها</span>
                  <input type="color" value={appearance.textColor} onChange={(e) => updateAppearance("textColor", e.target.value)} />
                </label>
              </div>

              {appearance.backgroundType === "image" && (
                <label className="lum-field">
                  <span>لینک تصویر پس‌زمینه</span>
                  <input
                    value={appearance.backgroundImage}
                    onChange={(e) => updateAppearance("backgroundImage", e.target.value)}
                    placeholder="https://example.com/background.jpg"
                    dir="ltr"
                  />
                </label>
              )}

              <label className="lum-field">
                <span>انیمیشن</span>
                <select value={appearance.animation} onChange={(e) => updateAppearance("animation", e.target.value)}>
                  <option value="none">بدون انیمیشن</option>
                  <option value="float">حرکت شناور</option>
                  <option value="glow">درخشش نئونی</option>
                </select>
              </label>

              <div
                className={`lum-preview lum-animation-${appearance.animation}`}
                style={{
                  color: appearance.textColor,
                  borderColor: appearance.accentColor,
                  background: appearance.backgroundType === "image" && appearance.backgroundImage
                    ? `linear-gradient(#09090f88,#09090f88),url("${appearance.backgroundImage}") center/cover`
                    : appearance.backgroundType === "solid"
                      ? appearance.backgroundColor
                      : `linear-gradient(145deg,${appearance.backgroundColor},${appearance.backgroundEndColor})`,
                  boxShadow: `0 0 25px ${appearance.accentColor}35`,
                }}
              >
                <div className="lum-preview-avatar" style={{ borderColor: appearance.accentColor }}>✦</div>
                <strong>{form.full_name || "نام شما"}</strong>
                <span>{form.job || "عنوان شغلی"}</span>
                <small>نمونه کارت LumoCard</small>
              </div>
            </section>

            <section className="lum-social-section">
              <div className="lum-social-heading">
                <span className="lum-eyebrow">SOCIAL MEDIA</span>
                <h2>شبکه‌های اجتماعی</h2>
                <p>روی آیکون برنامه‌هایی که می‌خواهی نمایش داده شوند بزن، سپس آیدی آن‌ها را وارد کن.</p>
              </div>

              <input
                className="lum-social-search"
                value={socialSearch}
                onChange={(e) => setSocialSearch(e.target.value)}
                placeholder="🔎 جستجوی شبکه اجتماعی..."
              />

              <div className="lum-app-picker">
                {socials
                  .filter((social) => social.name.includes(socialSearch.trim()))
                  .map((social) => (
                    <button
                      type="button"
                      key={social.id}
                      className={`lum-app-option ${selectedSocial[social.id] ? "selected" : ""}`}
                      onClick={() => toggleSocial(social.id)}
                      aria-pressed={!!selectedSocial[social.id]}
                    >
                      <SocialIcon social={social} />
                      <span>{social.name}</span>
                      <small>{selectedSocial[social.id] ? "✓ انتخاب شد" : "＋ افزودن"}</small>
                    </button>
                  ))}
              </div>

              {socials.filter((social) => selectedSocial[social.id]).length > 0 && (
                <div className="lum-social-inputs">
                  <h3>آیدی شبکه‌های انتخاب‌شده</h3>
                  {socials
                    .filter((social) => selectedSocial[social.id])
                    .map((social) => (
                      <label className="lum-field" key={social.id}>
                        <span><SocialIcon social={social} /> {social.name}</span>
                        <input
                          value={socialDraft[social.id] ?? ""}
                          onChange={(e) => updateSocial(social.id, e.target.value)}
                          placeholder={social.id === "whatsapp" ? "شماره با کد کشور یا لینک" : "آیدی یا لینک کامل"}
                          dir="ltr"
                        />
                      </label>
                    ))}
                </div>
              )}
            </section>

            {error && <p role="alert" className="lum-error">{error}</p>}

            <button type="button" className="button full" onClick={saveChanges} disabled={saving}>
              {saving ? "در حال ذخیره..." : "💾 ذخیره تغییرات"}
            </button>
          </section>
        ) : (
          <section
            className={`pbox lum-card lum-animation-${cardAppearance.animation}`}
            style={cardStyle}
          >
            <div className="lum-card-top" style={{ background: cardAppearance.accentColor }} />

            {profile.avatar_url ? (
              <div className="pavatar" style={{ borderColor: cardAppearance.accentColor }}>
                <img src={profile.avatar_url} alt={profile.full_name || profile.username} />
              </div>
            ) : (
              <div className="pavatar" style={{ borderColor: cardAppearance.accentColor }}>
                {(profile.full_name || profile.username).charAt(0).toUpperCase()}
              </div>
            )}

            <span className="lum-eyebrow" style={{ color: cardAppearance.accentColor }}>DIGITAL BUSINESS CARD</span>
            <h1>{profile.full_name || profile.username}</h1>
            <p className="lum-username">@{profile.username}</p>

            {profile.job && <div className="lum-job" style={{ borderColor: cardAppearance.accentColor }}>{profile.job}</div>}
            {profile.bio && <p className="lum-bio">{profile.bio}</p>}

            <div className="buttons lum-contact-buttons">
              {profile.phone && <a href={`tel:${profile.phone}`} style={{ background: cardAppearance.accentColor }}>📞 تماس با من</a>}
              {profile.email && <a href={`mailto:${profile.email}`} style={{ background: cardAppearance.accentColor }}>✉️ ارسال ایمیل</a>}
              {profile.website && (
                <a
                  href={/^https?:\/\//i.test(profile.website) ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: cardAppearance.accentColor }}
                >
                  🌐 وب‌سایت
                </a>
              )}
            </div>

            {profile.location && <p className="lum-location">📍 {profile.location}</p>}

            {Object.entries(profile.social_links ?? {}).some(([, url]) => !!url) && (
              <div className="lum-card-socials" style={{ borderColor: `${cardAppearance.accentColor}70` }}>
                <h2>شبکه‌های اجتماعی</h2>
                <div className="lum-social-grid">
                  {socials
                    .filter((social) => profile.social_links?.[social.id])
                    .map((social) => (
                      <a
                        key={social.id}
                        href={profile.social_links![social.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lum-social-link"
                        style={{ borderColor: `${cardAppearance.accentColor}80`, color: cardAppearance.textColor }}
                      >
                        <SocialIcon social={social} />
                        {social.name}
                      </a>
                    ))}
                </div>
              </div>
            )}

            {isOwner && <p className="lum-owner-note">این کارت متعلق به شماست. برای تغییر اطلاعات از دکمه ویرایش استفاده کن.</p>}
            <footer className="lum-powered">Powered by <span style={{ color: cardAppearance.accentColor }}>LumoCard</span></footer>
          </section>
        )}

        {error && !editing && <p role="alert" className="lum-error">{error}</p>}
      </div>
    </main>
  );
}
