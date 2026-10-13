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
  social_links: Record<string, string> | null;
};

type Social = {
  id: string;
  name: string;
  category: "iranian" | "international";
  icon: string;
  baseUrl: string;
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
  {
    id: "instagram",
    name: "اینستاگرام",
    category: "international",
    icon: "📸",
    baseUrl: "https://instagram.com/",
  },
  {
    id: "telegram",
    name: "تلگرام",
    category: "international",
    icon: "✈️",
    baseUrl: "https://t.me/",
  },
  {
    id: "whatsapp",
    name: "واتساپ",
    category: "international",
    icon: "💬",
    baseUrl: "https://wa.me/",
  },
  {
    id: "youtube",
    name: "یوتیوب",
    category: "international",
    icon: "▶️",
    baseUrl: "https://youtube.com/",
  },
  {
    id: "tiktok",
    name: "تیک‌تاک",
    category: "international",
    icon: "🎵",
    baseUrl: "https://tiktok.com/@",
  },
  {
    id: "linkedin",
    name: "لینکدین",
    category: "international",
    icon: "💼",
    baseUrl: "https://linkedin.com/in/",
  },
  {
    id: "discord",
    name: "دیسکورد",
    category: "international",
    icon: "🎮",
    baseUrl: "https://discord.com/users/",
  },
  {
    id: "x",
    name: "ایکس (توییتر)",
    category: "international",
    icon: "𝕏",
    baseUrl: "https://x.com/",
  },
  {
    id: "facebook",
    name: "فیسبوک",
    category: "international",
    icon: "📘",
    baseUrl: "https://facebook.com/",
  },
  {
    id: "twitch",
    name: "توییچ",
    category: "international",
    icon: "🟣",
    baseUrl: "https://twitch.tv/",
  },
  {
    id: "github",
    name: "گیت‌هاب",
    category: "international",
    icon: "💻",
    baseUrl: "https://github.com/",
  },
  {
    id: "pinterest",
    name: "پینترست",
    category: "international",
    icon: "📌",
    baseUrl: "https://pinterest.com/",
  },
  {
    id: "snapchat",
    name: "اسنپ‌چت",
    category: "international",
    icon: "👻",
    baseUrl: "https://snapchat.com/add/",
  },
  {
    id: "threads",
    name: "تردز",
    category: "international",
    icon: "🧵",
    baseUrl: "https://threads.net/@",
  },
  {
    id: "website",
    name: "وب‌سایت",
    category: "international",
    icon: "🌐",
    baseUrl: "https://",
  },
  {
    id: "bale",
    name: "بله",
    category: "iranian",
    icon: "🇮🇷",
    baseUrl: "https://ble.ir/",
  },
  {
    id: "eitaa",
    name: "ایتا",
    category: "iranian",
    icon: "🇮🇷",
    baseUrl: "https://eitaa.com/",
  },
  {
    id: "rubika",
    name: "روبیکا",
    category: "iranian",
    icon: "🇮🇷",
    baseUrl: "https://rubika.ir/",
  },
  {
    id: "soroush",
    name: "سروش پلاس",
    category: "iranian",
    icon: "🇮🇷",
    baseUrl: "https://splus.ir/",
  },
  {
    id: "igap",
    name: "آیگپ",
    category: "iranian",
    icon: "🇮🇷",
    baseUrl: "https://igap.net/",
  },
  {
    id: "gap",
    name: "گپ",
    category: "iranian",
    icon: "🇮🇷",
    baseUrl: "https://gap.im/",
  },
  {
    id: "virasty",
    name: "ویراستی",
    category: "iranian",
    icon: "🇮🇷",
    baseUrl: "https://virasty.com/",
  },
];

const jobOptions = Array.from(
  new Set(jobs.flatMap((category) => category.items))
);

function makeSocialUrl(id: string, value: string) {
  const clean = value.trim();

  if (!clean) return "";

  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  const social = socials.find((item) => item.id === id);

  if (!social) return clean;

  if (id === "whatsapp") {
    const number = clean.replace(/[^\d]/g, "");
    return number ? `https://wa.me/${number}` : "";
  }

  if (id === "website") {
    return `https://${clean.replace(/^\/+/, "")}`;
  }

  return social.baseUrl + clean.replace(/^@/, "").replace(/^\/+/, "");
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
          "id, username, full_name, job, bio, avatar_url, phone, email, website, location, social_links"
        )
        .eq("username", username)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
        setError(
          "اطلاعات کارت دریافت نشد. ستون social_links و تنظیمات Supabase را بررسی کن."
        );
        setProfile(null);
        return;
      }

      if (data) {
        const loaded = data as Profile;

        setProfile(loaded);
        setForm(loaded);
        setSocialDraft(loaded.social_links ?? {});
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

  async function saveChanges() {
    if (!profile || !isOwner || saving) return;

    setSaving(true);
    setError("");

    try {
      const socialLinks: Record<string, string> = {};

      for (const social of socials) {
        const value = socialDraft[social.id]?.trim();

        if (value) {
          socialLinks[social.id] = makeSocialUrl(social.id, value);
        }
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
      };

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select(
          "id, username, full_name, job, bio, avatar_url, phone, email, website, location, social_links"
        )
        .maybeSingle();

      if (updateError || !data) {
        console.error(updateError);
        setError(
          "ذخیره انجام نشد. ستون social_links و مجوز ویرایش پروفایل را در Supabase بررسی کن."
        );
        return;
      }

      setProfile(data as Profile);
      setForm(data as Profile);
      setSocialDraft((data as Profile).social_links ?? {});
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

  if (loading) {
    return (
      <main className="profile" dir="rtl">
        <div className="pbox">
          <p>در حال بارگذاری کارت...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile" dir="rtl">
        <div className="pbox">
          <div className="pavatar">✦</div>
          <h1>کارت پیدا نشد!</h1>
          <p>نام کاربری را بررسی کن یا بعداً دوباره تلاش کن.</p>
          {error && <p role="alert">{error}</p>}
          <Link href="/" className="button">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="profile lum-profile" dir="rtl">
      <div className="lum-profile-wrap">
        <header className="lum-profile-header">
          <Link href="/" className="logo">
            Lumo<span>Card</span>
          </Link>

          {isOwner && (
            <div className="lum-header-actions">
              <button
                type="button"
                className="button"
                onClick={() => {
                  if (editing) {
                    setForm(profile);
                    setSocialDraft(profile.social_links ?? {});
                    setCustomJob(false);
                    setEditing(false);
                    setError("");
                  } else {
                    setForm(profile);
                    setSocialDraft(profile.social_links ?? {});
                    setCustomJob(
                      !!profile.job && !jobOptions.includes(profile.job)
                    );
                    setEditing(true);
                    setError("");
                  }
                }}
              >
                {editing ? "لغو ویرایش" : "✏️ ویرایش کارت"}
              </button>

              <button
                type="button"
                className="ghost"
                onClick={logout}
              >
                خروج
              </button>
            </div>
          )}
        </header>

        {editing && isOwner ? (
          <section className="pbox lum-editor">
            <div className="lum-editor-heading">
              <span className="lum-eyebrow">LUMOCARD STUDIO</span>
              <h1>شخصی‌سازی کارت</h1>
              <p>اطلاعاتت رو وارد کن و در پایان ذخیره رو بزن.</p>
            </div>

            {input("full_name", "نام و نام خانوادگی", "مثلاً سامیار")}
            <div className="lum-field">
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
                    {group.items.map((job) => (
                      <option key={job} value={job}>
                        {job}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="__custom__">شغل من در فهرست نیست</option>
              </select>
            </div>

            {customJob &&
              input("job", "شغل دلخواه", "شغل خودت را بنویس")}

            {input(
              "avatar_url",
              "لینک عکس پروفایل",
              "https://example.com/photo.jpg"
            )}

            {input("phone", "شماره تماس", "شماره‌ای که می‌خواهی نمایش داده شود", "tel")}
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

            <div className="lum-social-section">
              <div className="lum-social-heading">
                <span className="lum-eyebrow">SOCIAL MEDIA</span>
                <h2>شبکه‌های اجتماعی</h2>
                <p>
                  نام کاربری یا لینک کامل هر شبکه را وارد کن. هر موردی را
                  خالی بگذاری، روی کارت نمایش داده نمی‌شود.
                </p>
              </div>

              <h3>🇮🇷 شبکه‌های ایرانی</h3>
              <div className="lum-social-form">
                {socials
                  .filter((item) => item.category === "iranian")
                  .map((social) => (
                    <label className="lum-field" key={social.id}>
                      <span>
                        {social.icon} {social.name}
                      </span>
                      <input
                        value={socialDraft[social.id] ?? ""}
                        onChange={(e) =>
                          updateSocial(social.id, e.target.value)
                        }
                        placeholder="نام کاربری یا لینک"
                        dir="ltr"
                      />
                    </label>
                  ))}
              </div>

              <h3>🌍 شبکه‌های بین‌المللی</h3>
              <div className="lum-social-form">
                {socials
                  .filter((item) => item.category === "international")
                  .map((social) => (
                    <label className="lum-field" key={social.id}>
                      <span>
                        {social.icon} {social.name}
                      </span>
                      <input
                        value={socialDraft[social.id] ?? ""}
                        onChange={(e) =>
                          updateSocial(social.id, e.target.value)
                        }
                        placeholder="نام کاربری یا لینک"
                        dir="ltr"
                      />
                    </label>
                  ))}
              </div>
            </div>

            {error && (
              <p role="alert" className="lum-error">
                {error}
              </p>
            )}

            <button
              type="button"
              className="button full"
              onClick={saveChanges}
              disabled={saving}
            >
              {saving ? "در حال ذخیره..." : "💾 ذخیره تغییرات"}
            </button>
          </section>
        ) : (
          <section className="pbox lum-card">
            <div className="lum-card-top" />

            {profile.avatar_url ? (
              <div className="pavatar">
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                />
              </div>
            ) : (
              <div className="pavatar">
                {(profile.full_name || profile.username)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <span className="lum-eyebrow">DIGITAL BUSINESS CARD</span>

            <h1>{profile.full_name || profile.username}</h1>

            <p className="lum-username">@{profile.username}</p>

            {profile.job && <div className="lum-job">{profile.job}</div>}

            {profile.bio && <p className="lum-bio">{profile.bio}</p>}

            <div className="buttons lum-contact-buttons">
              {profile.phone && (
                <a href={`tel:${profile.phone}`}>📞 تماس با من</a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`}>✉️ ارسال ایمیل</a>
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
                >
                  🌐 وب‌سایت
                </a>
              )}
            </div>

            {profile.location && (
              <p className="lum-location">📍 {profile.location}</p>
            )}

            {Object.entries(profile.social_links ?? {}).some(
              ([, url]) => !!url
            ) && (
              <div className="lum-card-socials">
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
                      >
                        <span>{social.icon}</span>
                        {social.name}
                      </a>
                    ))}
                </div>
              </div>
            )}

            {isOwner && (
              <p className="lum-owner-note">
                این کارت متعلق به شماست. برای تغییر اطلاعات، از دکمه ویرایش
                بالای صفحه استفاده کن.
              </p>
            )}

            <footer className="lum-powered">
              Powered by <span>LumoCard</span>
            </footer>
          </section>
        )}

        {error && !editing && (
          <p role="alert" className="lum-error">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
