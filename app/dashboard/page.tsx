"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PhoneItem = {
  id: string;
  title: string;
  number: string;
};

type CustomLink = {
  id: string;
  title: string;
  url: string;
};

type Appearance = {
  template: string;
  backgroundType: "solid" | "gradient" | "image";
  background: string;
  gradientStart: string;
  gradientEnd: string;
  backgroundImage: string;
  accent: string;
  textColor: string;
  buttonColor: string;
  radius: number;
};

type Profile = {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  job?: string;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
  avatar_url?: string;
  social_links?: Record<string, any>;
  appearance?: Partial<Appearance>;
};

const DEFAULT_APPEARANCE: Appearance = {
  template: "business",
  backgroundType: "gradient",
  background: "#10101A",
  gradientStart: "#17172B",
  gradientEnd: "#43216D",
  backgroundImage: "",
  accent: "#C084FC",
  textColor: "#FFFFFF",
  buttonColor: "#252538",
  radius: 18,
};

const APPS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    placeholder: "samiyar.bornaei",
    base: "https://instagram.com/",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "✈️",
    placeholder: "username",
    base: "https://t.me/",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
    placeholder: "989121234567",
    base: "https://wa.me/",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶️",
    placeholder: "لینک کانال یا ویدئو",
    base: "",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    placeholder: "username",
    base: "https://tiktok.com/@",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    placeholder: "لینک پروفایل",
    base: "",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "💻",
    placeholder: "username",
    base: "https://github.com/",
  },
  {
    id: "website",
    name: "Website",
    icon: "🌐",
    placeholder: "https://example.com",
    base: "",
  },
  {
    id: "email",
    name: "Email",
    icon: "✉️",
    placeholder: "name@example.com",
    base: "",
  },
  {
    id: "location",
    name: "Location",
    icon: "📍",
    placeholder: "لینک Google Maps",
    base: "",
  },
];

const TEMPLATES = [
  { id: "personal", name: "شخصی", icon: "👤" },
  { id: "business", name: "کاری", icon: "💼" },
  { id: "creator", name: "تولیدکننده محتوا", icon: "🎬" },
  { id: "developer", name: "برنامه‌نویس", icon: "💻" },
];

const PRESETS = [
  {
    name: "Midnight",
    background: "#10101A",
    start: "#17172B",
    end: "#43216D",
    accent: "#C084FC",
  },
  {
    name: "Ocean",
    background: "#071A2B",
    start: "#071A2B",
    end: "#075985",
    accent: "#38BDF8",
  },
  {
    name: "Emerald",
    background: "#071D17",
    start: "#071D17",
    end: "#065F46",
    accent: "#34D399",
  },
  {
    name: "Rose",
    background: "#27101C",
    start: "#27101C",
    end: "#881337",
    accent: "#FDA4AF",
  },
  {
    name: "Minimal",
    background: "#FFFFFF",
    start: "#FFFFFF",
    end: "#E5E7EB",
    accent: "#111827",
  },
  {
    name: "Gold",
    background: "#17130B",
    start: "#17130B",
    end: "#574018",
    accent: "#FBBF24",
  },
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function validColor(value: unknown, fallback: string) {
  return typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getAppearance(
  value?: Partial<Appearance> | null
): Appearance {
  const saved = value || {};

  return {
    ...DEFAULT_APPEARANCE,
    ...saved,
    background: validColor(
      saved.background,
      DEFAULT_APPEARANCE.background
    ),
    gradientStart: validColor(
      saved.gradientStart,
      DEFAULT_APPEARANCE.gradientStart
    ),
    gradientEnd: validColor(
      saved.gradientEnd,
      DEFAULT_APPEARANCE.gradientEnd
    ),
    accent: validColor(
      saved.accent,
      DEFAULT_APPEARANCE.accent
    ),
    textColor: validColor(
      saved.textColor,
      DEFAULT_APPEARANCE.textColor
    ),
    buttonColor: validColor(
      saved.buttonColor,
      DEFAULT_APPEARANCE.buttonColor
    ),
    radius:
      typeof saved.radius === "number"
        ? Math.min(32, Math.max(0, saved.radius))
        : DEFAULT_APPEARANCE.radius,
    backgroundType:
      saved.backgroundType === "solid" ||
      saved.backgroundType === "image"
        ? saved.backgroundType
        : "gradient",
  };
}

function getCardBackground(appearance: Appearance) {
  if (
    appearance.backgroundType === "image" &&
    appearance.backgroundImage.trim()
  ) {
    const imageUrl = normalizeUrl(
      appearance.backgroundImage
    );

    try {
      const parsed = new URL(imageUrl);

      if (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:"
      ) {
        return `linear-gradient(#0005,#0008),url("${imageUrl}") center/cover`;
      }
    } catch {
      // اگر آدرس معتبر نباشد، پس‌زمینه جایگزین نمایش داده می‌شود.
    }
  }

  if (appearance.backgroundType === "solid") {
    return appearance.background;
  }

  return `linear-gradient(135deg, ${appearance.gradientStart}, ${appearance.gradientEnd})`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [appearance, setAppearance] =
    useState<Appearance>(DEFAULT_APPEARANCE);

  const [phones, setPhones] = useState<PhoneItem[]>([]);
  const [customLinks, setCustomLinks] =
    useState<CustomLink[]>([]);

  const [phoneTitle, setPhoneTitle] = useState("شماره اصلی");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [customTitle, setCustomTitle] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const [appValues, setAppValues] =
    useState<Record<string, string>>({});

  const [activeSection, setActiveSection] =
    useState("profile");

  const [appSearch, setAppSearch] = useState("");

  const [profileForm, setProfileForm] = useState({
    username: "",
    full_name: "",
    job: "",
    bio: "",
    email: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!data) {
          throw new Error(
            "پروفایل پیدا نشد. ابتدا پروفایل خودت را ایجاد کن."
          );
        }

        if (cancelled) return;

        const currentProfile = data as Profile;
        const links = currentProfile.social_links || {};

        setProfile(currentProfile);

        setProfileForm({
          username: currentProfile.username || "",
          full_name: currentProfile.full_name || "",
          job: currentProfile.job || "",
          bio: currentProfile.bio || "",
          email: currentProfile.email || "",
          website: currentProfile.website || "",
          location: currentProfile.location || "",
        });

        setAppearance(
          getAppearance(currentProfile.appearance)
        );

        const savedPhones = Array.isArray(links.phones)
          ? links.phones
          : [];

        setPhones(
          savedPhones.map((item: any) => ({
            id: String(item.id || createId()),
            title: String(item.title || "شماره تلفن"),
            number: String(item.number || ""),
          }))
        );

        const savedCustomLinks = Array.isArray(
          links.customLinks
        )
          ? links.customLinks
          : [];

        setCustomLinks(
          savedCustomLinks.map((item: any) => ({
            id: String(item.id || createId()),
            title: String(item.title || "لینک"),
            url: String(item.url || ""),
          }))
        );

        const values: Record<string, string> = {};

        for (const app of APPS) {
          values[app.id] = String(links[app.id] || "");
        }

        setAppValues(values);
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.message || "بارگذاری داشبورد با خطا مواجه شد."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const filteredApps = useMemo(() => {
    const query = appSearch.trim().toLowerCase();

    return APPS.filter((app) => {
      const matchesSearch =
        !query ||
        app.name.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query);

      const hasValue = Boolean(
        appValues[app.id]?.trim()
      );

      return matchesSearch || hasValue;
    });
  }, [appSearch, appValues]);

  const cardBackground = useMemo(
    () => getCardBackground(appearance),
    [appearance]
  );

  function updateProfileField(
    field: keyof typeof profileForm,
    value: string
  ) {
    setProfileForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateAppearance(
    field: keyof Appearance,
    value: string | number
  ) {
    setAppearance((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function addPhone() {
    setError("");
    setMessage("");

    if (!phoneNumber.trim()) {
      setError("شماره تلفن را وارد کن.");
      return;
    }

    setPhones((previous) => [
      ...previous,
      {
        id: createId(),
        title: phoneTitle.trim() || "شماره تلفن",
        number: phoneNumber.trim(),
      },
    ]);

    setPhoneTitle("شماره دیگر");
    setPhoneNumber("");
  }

  function updatePhone(
    id: string,
    field: "title" | "number",
    value: string
  ) {
    setPhones((previous) =>
      previous.map((phone) =>
        phone.id === id
          ? { ...phone, [field]: value }
          : phone
      )
    );
  }

  function deletePhone(id: string) {
    setPhones((previous) =>
      previous.filter((phone) => phone.id !== id)
    );
  }

  function addCustomLink() {
    setError("");
    setMessage("");

    if (!customTitle.trim() || !customUrl.trim()) {
      setError("عنوان و آدرس لینک را وارد کن.");
      return;
    }

    setCustomLinks((previous) => [
      ...previous,
      {
        id: createId(),
        title: customTitle.trim(),
        url: normalizeUrl(customUrl),
      },
    ]);

    setCustomTitle("");
    setCustomUrl("");
  }

  function deleteCustomLink(id: string) {
    setCustomLinks((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  function movePhone(index: number, direction: -1 | 1) {
    const next = [...phones];
    const target = index + direction;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [
      next[target],
      next[index],
    ];

    setPhones(next);
  }

  function moveCustomLink(
    index: number,
    direction: -1 | 1
  ) {
    const next = [...customLinks];
    const target = index + direction;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [
      next[target],
      next[index],
    ];

    setCustomLinks(next);
  }

  async function saveDashboard(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!profile) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const username = profileForm.username
        .trim()
        .replace(/^@/, "");

      if (!username) {
        throw new Error("نام کاربری نمی‌تواند خالی باشد.");
      }

      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        throw new Error(
          "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد."
        );
      }

      const { data: existing, error: usernameError } =
        await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", profile.id)
          .maybeSingle();

      if (usernameError) throw usernameError;

      if (existing) {
        throw new Error(
          "این نام کاربری قبلاً توسط شخص دیگری انتخاب شده است."
        );
      }

      const socialLinks: Record<string, any> = {
        ...(profile.social_links || {}),
      };

      for (const app of APPS) {
        const value = appValues[app.id]?.trim() || "";

        if (value) {
          socialLinks[app.id] = value;
        } else {
          delete socialLinks[app.id];
        }
      }

      socialLinks.phones = phones;
      socialLinks.customLinks = customLinks;

      const updatedProfile = {
        id: profile.id,
        username,
        full_name: profileForm.full_name.trim(),
        job: profileForm.job.trim(),
        bio: profileForm.bio.trim(),
        email: profileForm.email.trim(),
        website: profileForm.website.trim(),
        location: profileForm.location.trim(),
        phone: phones[0]?.number || "",
        social_links: socialLinks,
        appearance,
      };

      const { data, error: saveError } = await supabase
        .from("profiles")
        .upsert(updatedProfile, {
          onConflict: "id",
        })
        .select("*")
        .single();

      if (saveError) throw saveError;

      setProfile(data as Profile);

      setMessage("تغییرات با موفقیت ذخیره شد! 💜");
    } catch (e: any) {
      setError(
        e?.message || "ذخیره تغییرات با خطا مواجه شد."
      );
    } finally {
      setSaving(false);
    }
  }
    if (loading) {
    return (
      <main className="lc-loading" dir="rtl">
        <div className="lc-spinner" />
        <p>داریم داشبوردت رو آماده می‌کنیم...</p>

        <style jsx>{`
          .lc-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0b0b12;
            color: white;
            font-family: sans-serif;
          }

          .lc-spinner {
            width: 38px;
            height: 38px;
            border: 3px solid #343044;
            border-top-color: #c084fc;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="lc-page" dir="rtl">
      <header className="lc-topbar">
        <Link href="/" className="lc-brand">
          <span className="lc-logo">L</span>
          <span>
            Lumo<span className="lc-purple">Card</span>
          </span>
        </Link>

        <div className="lc-top-actions">
          {profile && (
            <a
              className="lc-public-link"
              href={`/${encodeURIComponent(profile.username)}`}
              target="_blank"
              rel="noreferrer"
            >
              مشاهده کارت ↗
            </a>
          )}

          <button
            className="lc-save"
            form="lc-form"
            type="submit"
            disabled={saving || !profile}
          >
            {saving ? "در حال ذخیره..." : "💾 ذخیره تغییرات"}
          </button>
        </div>
      </header>

      <div className="lc-layout">
        <aside className="lc-sidebar">
          <div className="lc-sidebar-heading">
            <span className="lc-avatar">
              {(profileForm.full_name || "L")
                .charAt(0)
                .toUpperCase()}
            </span>

            <div>
              <strong>
                {profileForm.full_name || "کارت من"}
              </strong>
              <small>
                @{profileForm.username || "username"}
              </small>
            </div>
          </div>

          <p className="lc-nav-title">مدیریت کارت</p>

          {[
            ["profile", "👤", "اطلاعات پروفایل"],
            ["phones", "📞", "شماره‌های تماس"],
            ["apps", "🔗", "شبکه‌های اجتماعی"],
            ["custom", "➕", "لینک‌های دلخواه"],
            ["design", "🎨", "طراحی کارت"],
          ].map(([id, icon, label]) => (
            <button
              type="button"
              key={id}
              className={`lc-nav-item ${
                activeSection === id ? "active" : ""
              }`}
              onClick={() => setActiveSection(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}

          <div className="lc-sidebar-bottom">
            <div className="lc-tip">
              <span>✨</span>
              <strong>کارتت رو خاص کن!</strong>
              <p>
                اطلاعاتت رو کامل کن تا افراد راحت‌تر باهات
                ارتباط بگیرن.
              </p>
            </div>

            <Link href="/" className="lc-home-link">
              ← بازگشت به سایت
            </Link>
          </div>
        </aside>

        <section className="lc-main">
          <div className="lc-heading">
            <div>
              <p className="lc-eyebrow">LUMOCARD STUDIO</p>
              <h1>داشبورد کارت من</h1>
              <p>
                اطلاعات و ظاهر کارت دیجیتالت رو مدیریت کن.
              </p>
            </div>

            <span className="lc-status">● فضای ویرایش</span>
          </div>

          {error && (
            <div className="lc-alert error">
              ⚠️ {error}
            </div>
          )}

          {message && (
            <div className="lc-alert success">
              ✓ {message}
            </div>
          )}

          <form id="lc-form" onSubmit={saveDashboard}>
            {activeSection === "profile" && (
              <section className="lc-panel">
                <div className="lc-panel-heading">
                  <div>
                    <h2>اطلاعات پروفایل</h2>
                    <p>
                      اطلاعات اصلی کارت دیجیتالت رو وارد کن.
                    </p>
                  </div>
                  <span>👤</span>
                </div>

                <div className="lc-grid">
                  <label className="lc-field">
                    نام و نام خانوادگی
                    <input
                      value={profileForm.full_name}
                      onChange={(e) =>
                        updateProfileField(
                          "full_name",
                          e.target.value
                        )
                      }
                      placeholder="مثلاً سامیار برنایی"
                    />
                  </label>

                  <label className="lc-field">
                    نام کاربری کارت
                    <input
                      value={profileForm.username}
                      onChange={(e) =>
                        updateProfileField(
                          "username",
                          e.target.value
                        )
                      }
                      placeholder="samiyar"
                      dir="ltr"
                    />
                    <small>
                      آدرس کارت: lumocard.ir/
                      {profileForm.username || "username"}
                    </small>
                  </label>

                  <label className="lc-field">
                    عنوان شغلی
                    <input
                      value={profileForm.job}
                      onChange={(e) =>
                        updateProfileField("job", e.target.value)
                      }
                      placeholder="مثلاً طراح گرافیک"
                    />
                  </label>

                  <label className="lc-field">
                    ایمیل
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        updateProfileField(
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="you@example.com"
                      dir="ltr"
                    />
                  </label>

                  <label className="lc-field">
                    وب‌سایت
                    <input
                      value={profileForm.website}
                      onChange={(e) =>
                        updateProfileField(
                          "website",
                          e.target.value
                        )
                      }
                      placeholder="https://example.com"
                      dir="ltr"
                    />
                  </label>

                  <label className="lc-field">
                    موقعیت مکانی
                    <input
                      value={profileForm.location}
                      onChange={(e) =>
                        updateProfileField(
                          "location",
                          e.target.value
                        )
                      }
                      placeholder="مثلاً تهران"
                    />
                  </label>

                  <label className="lc-field lc-full">
                    درباره من
                    <textarea
                      rows={5}
                      value={profileForm.bio}
                      onChange={(e) =>
                        updateProfileField("bio", e.target.value)
                      }
                      placeholder="کمی درباره خودت بنویس..."
                    />
                  </label>
                </div>

                <div className="lc-info-box">
                  💡 برای اضافه کردن چند شماره تلفن، از بخش
                  «شماره‌های تماس» استفاده کن.
                </div>
              </section>
            )}

            {activeSection === "phones" && (
              <section className="lc-panel">
                <div className="lc-panel-heading">
                  <div>
                    <h2>شماره‌های تماس</h2>
                    <p>
                      چند شماره با عنوان‌های مختلف اضافه کن.
                    </p>
                  </div>
                  <span>📞</span>
                </div>

                <div className="lc-add-box">
                  <div className="lc-grid">
                    <label className="lc-field">
                      عنوان شماره
                      <input
                        value={phoneTitle}
                        onChange={(e) =>
                          setPhoneTitle(e.target.value)
                        }
                        placeholder="مثلاً شماره کاری"
                      />
                    </label>

                    <label className="lc-field">
                      شماره تلفن
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value)
                        }
                        placeholder="+989121234567"
                        dir="ltr"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="lc-primary"
                    onClick={addPhone}
                  >
                    ＋ افزودن شماره
                  </button>
                </div>

                <div className="lc-list">
                  {phones.map((phone, index) => (
                    <div className="lc-list-item" key={phone.id}>
                      <span className="lc-list-icon">📱</span>

                      <div className="lc-list-content">
                        <input
                          aria-label="عنوان شماره"
                          value={phone.title}
                          onChange={(e) =>
                            updatePhone(
                              phone.id,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="عنوان شماره"
                        />

                        <input
                          aria-label="شماره تلفن"
                          value={phone.number}
                          onChange={(e) =>
                            updatePhone(
                              phone.id,
                              "number",
                              e.target.value
                            )
                          }
                          placeholder="شماره تلفن"
                          dir="ltr"
                        />
                      </div>

                      <div className="lc-item-actions">
                        <button
                          type="button"
                          onClick={() => movePhone(index, -1)}
                          disabled={index === 0}
                          aria-label="انتقال به بالا"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() => movePhone(index, 1)}
                          disabled={index === phones.length - 1}
                          aria-label="انتقال به پایین"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className="lc-delete"
                          onClick={() => deletePhone(phone.id)}
                          aria-label="حذف شماره"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  {phones.length === 0 && (
                    <div className="lc-empty">
                      هنوز شماره‌ای اضافه نکردی.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeSection === "apps" && (
              <section className="lc-panel">
                <div className="lc-panel-heading">
                  <div>
                    <h2>شبکه‌های اجتماعی</h2>
                    <p>
                      فقط لینک‌هایی رو وارد کن که می‌خوای روی
                      کارتت نمایش داده بشن.
                    </p>
                  </div>
                  <span>🔗</span>
                </div>

                <input
                  className="lc-search"
                  value={appSearch}
                  onChange={(e) =>
                    setAppSearch(e.target.value)
                  }
                  placeholder="🔍 جست‌وجوی شبکه اجتماعی..."
                />

                <div className="lc-app-grid">
                  {filteredApps.map((app) => (
                    <div className="lc-app-card" key={app.id}>
                      <div className="lc-app-title">
                        <span>{app.icon}</span>
                        <strong>{app.name}</strong>
                      </div>

                      <input
                        value={appValues[app.id] || ""}
                        onChange={(e) =>
                          setAppValues((previous) => ({
                            ...previous,
                            [app.id]: e.target.value,
                          }))
                        }
                        placeholder={app.placeholder}
                        dir="ltr"
                      />

                      {appValues[app.id]?.trim() && (
                        <button
                          type="button"
                          className="lc-clear"
                          onClick={() =>
                            setAppValues((previous) => ({
                              ...previous,
                              [app.id]: "",
                            }))
                          }
                        >
                          حذف لینک
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="lc-info-box">
                  برای اپ‌هایی که آدرس اختصاصی دارند، لینک کامل
                  را وارد کن. برای مثال:
                  <br />
                  <code>https://youtube.com/@yourchannel</code>
                </div>
              </section>
            )}

            {activeSection === "custom" && (
              <section className="lc-panel">
                <div className="lc-panel-heading">
                  <div>
                    <h2>لینک‌های دلخواه</h2>
                    <p>
                      هر لینک دیگری که نیاز داری به کارت اضافه
                      کن.
                    </p>
                  </div>
                  <span>➕</span>
                </div>

                <div className="lc-add-box">
                  <div className="lc-grid">
                    <label className="lc-field">
                      عنوان لینک
                      <input
                        value={customTitle}
                        onChange={(e) =>
                          setCustomTitle(e.target.value)
                        }
                        placeholder="مثلاً نمونه‌کارهای من"
                      />
                    </label>

                    <label className="lc-field">
                      آدرس لینک
                      <input
                        value={customUrl}
                        onChange={(e) =>
                          setCustomUrl(e.target.value)
                        }
                        placeholder="https://example.com"
                        dir="ltr"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="lc-primary"
                    onClick={addCustomLink}
                  >
                    ＋ افزودن لینک
                  </button>
                </div>

                <div className="lc-list">
                  {customLinks.map((item, index) => (
                    <div className="lc-list-item" key={item.id}>
                      <span className="lc-list-icon">🌐</span>

                      <div className="lc-list-content">
                        <input
                          aria-label="عنوان لینک"
                          value={item.title}
                          onChange={(e) =>
                            setCustomLinks((previous) =>
                              previous.map((link) =>
                                link.id === item.id
                                  ? {
                                      ...link,
                                      title: e.target.value,
                                    }
                                  : link
                              )
                            )
                          }
                          placeholder="عنوان لینک"
                        />

                        <input
                          aria-label="آدرس لینک"
                          value={item.url}
                          onChange={(e) =>
                            setCustomLinks((previous) =>
                              previous.map((link) =>
                                link.id === item.id
                                  ? {
                                      ...link,
                                      url: e.target.value,
                                    }
                                  : link
                              )
                            )
                          }
                          placeholder="https://example.com"
                          dir="ltr"
                        />
                      </div>

                      <div className="lc-item-actions">
                        <button
                          type="button"
                          onClick={() =>
                            moveCustomLink(index, -1)
                          }
                          disabled={index === 0}
                          aria-label="انتقال به بالا"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveCustomLink(index, 1)
                          }
                          disabled={
                            index === customLinks.length - 1
                          }
                          aria-label="انتقال به پایین"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className="lc-delete"
                          onClick={() =>
                            deleteCustomLink(item.id)
                          }
                          aria-label="حذف لینک"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  {customLinks.length === 0 && (
                    <div className="lc-empty">
                      هنوز لینک دلخواهی اضافه نکردی.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeSection === "design" && (
              <section className="lc-panel">
                <div className="lc-panel-heading">
                  <div>
                    <h2>طراحی کارت</h2>
                    <p>
                      ظاهر کارتت رو همین‌جا تغییر بده.
                    </p>
                  </div>
                  <span>🎨</span>
                </div>

                <h3 className="lc-subheading">قالب آماده</h3>

                <div className="lc-template-grid">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className={`lc-template ${
                        appearance.template === template.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateAppearance(
                          "template",
                          template.id
                        )
                      }
                    >
                      <span>{template.icon}</span>
                      {template.name}
                      {appearance.template === template.id && (
                        <b>✓</b>
                      )}
                    </button>
                  ))}
                </div>

                <h3 className="lc-subheading">
                  ترکیب‌های رنگی
                </h3>

                <div className="lc-preset-grid">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className="lc-preset"
                      onClick={() => {
                        setAppearance((previous) => ({
                          ...previous,
                          background: preset.background,
                          gradientStart: preset.start,
                          gradientEnd: preset.end,
                          accent: preset.accent,
                        }));
                      }}
                    >
                      <span
                        className="lc-preset-swatch"
                        style={{
                          background: `linear-gradient(135deg, ${preset.start}, ${preset.end})`,
                        }}
                      />
                      {preset.name}
                    </button>
                  ))}
                </div>

                <h3 className="lc-subheading">
                  نوع پس‌زمینه
                </h3>

                <div className="lc-choice-row">
                  {[
                    ["solid", "رنگ ساده"],
                    ["gradient", "گرادینت"],
                    ["image", "تصویر"],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      className={`lc-choice ${
                        appearance.backgroundType === value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateAppearance(
                          "backgroundType",
                          value
                        )
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {appearance.backgroundType === "solid" && (
                  <label className="lc-color-field">
                    رنگ پس‌زمینه
                    <input
                      type="color"
                      value={appearance.background}
                      onChange={(e) =>
                        updateAppearance(
                          "background",
                          e.target.value
                        )
                      }
                    />
                  </label>
                )}

                {appearance.backgroundType === "gradient" && (
                  <div className="lc-grid">
                    <label className="lc-color-field">
                      رنگ اول
                      <input
                        type="color"
                        value={appearance.gradientStart}
                        onChange={(e) =>
                          updateAppearance(
                            "gradientStart",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label className="lc-color-field">
                      رنگ دوم
                      <input
                        type="color"
                        value={appearance.gradientEnd}
                        onChange={(e) =>
                          updateAppearance(
                            "gradientEnd",
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                )}

                {appearance.backgroundType === "image" && (
                  <label className="lc-field">
                    آدرس تصویر پس‌زمینه
                    <input
                      value={appearance.backgroundImage}
                      onChange={(e) =>
                        updateAppearance(
                          "backgroundImage",
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/image.jpg"
                      dir="ltr"
                    />
                  </label>
                )}

                <div className="lc-grid lc-design-controls">
                  <label className="lc-color-field">
                    رنگ اصلی کارت
                    <input
                      type="color"
                      value={appearance.accent}
                      onChange={(e) =>
                        updateAppearance(
                          "accent",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="lc-color-field">
                    رنگ نوشته
                    <input
                      type="color"
                      value={appearance.textColor}
                      onChange={(e) =>
                        updateAppearance(
                          "textColor",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="lc-color-field">
                    رنگ دکمه‌ها
                    <input
                      type="color"
                      value={appearance.buttonColor}
                      onChange={(e) =>
                        updateAppearance(
                          "buttonColor",
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <label className="lc-field lc-radius">
                  گردی گوشه‌ها: {appearance.radius}px
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={appearance.radius}
                    onChange={(e) =>
                      updateAppearance(
                        "radius",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>
              </section>
            )}

            <div className="lc-form-footer">
              <span>
                {saving
                  ? "در حال ذخیره اطلاعات..."
                  : "تغییراتت رو فراموش نکن ذخیره کنی."}
              </span>

              <button
                type="submit"
                className="lc-save"
                disabled={saving || !profile}
              >
                {saving ? "در حال ذخیره..." : "💾 ذخیره تغییرات"}
              </button>
            </div>
          </form>
        </section>

        <aside className="lc-preview-column">
          <div className="lc-preview-sticky">
            <div className="lc-preview-heading">
              <div>
                <strong>پیش‌نمایش زنده</strong>
                <p>تغییرات رو همین‌جا ببین.</p>
              </div>
              <span>👁️</span>
            </div>

            <div
              className="lc-card-preview"
              style={{
                background: cardBackground,
                color: appearance.textColor,
                borderRadius: `${appearance.radius}px`,
              }}
            >
              <div
                className="lc-card-orb"
                style={{
                  background: appearance.accent,
                }}
              />

              <div className="lc-card-content">
                <div
                  className="lc-card-avatar"
                  style={{
                    borderColor: appearance.accent,
                    color: appearance.accent,
                  }}
                >
                  {(profileForm.full_name || "L")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h2>
                  {profileForm.full_name || "نام شما"}
                </h2>

                <p className="lc-card-job">
                  {profileForm.job || "عنوان شغلی"}
                </p>

                <div className="lc-card-divider" />

                <p className="lc-card-bio">
                  {profileForm.bio ||
                    "اینجا توضیح کوتاهی درباره خودت نمایش داده می‌شود."}
                </p>

                {phones.map((phone) => (
                  <a
                    key={phone.id}
                    className="lc-preview-contact"
                    href={`tel:${phone.number.replace(/[^\d+]/g, "")}`}
                    style={{
                      background: appearance.buttonColor,
                      borderRadius: Math.max(
                        8,
                        appearance.radius - 6
                      ),
                    }}
                  >
                    <span>📞</span>
                    <span>
                      {phone.title || "شماره تماس"}
                    </span>
                  </a>
                ))}

                {profileForm.email && (
                  <div
                    className="lc-preview-contact"
                    style={{
                      background: appearance.buttonColor,
                    }}
                  >
                    ✉️ {profileForm.email}
                  </div>
                )}

                {profileForm.website && (
                  <div
                    className="lc-preview-contact"
                    style={{
                      background: appearance.buttonColor,
                    }}
                  >
                    🌐 وب‌سایت
                  </div>
                )}

                {APPS.filter((app) =>
                  appValues[app.id]?.trim()
                ).map((app) => (
                  <div
                    key={app.id}
                    className="lc-preview-contact"
                    style={{
                      background: appearance.buttonColor,
                    }}
                  >
                    <span>{app.icon}</span>
                    <span>{app.name}</span>
                  </div>
                ))}

                {customLinks.map((item) => (
                  <div
                    key={item.id}
                    className="lc-preview-contact"
                    style={{
                      background: appearance.buttonColor,
                    }}
                  >
                    🔗 {item.title}
                  </div>
                ))}

                {profileForm.location && (
                  <div
                    className="lc-preview-contact"
                    style={{
                      background: appearance.buttonColor,
                    }}
                  >
                    📍 {profileForm.location}
                  </div>
                )}

                <div
                  className="lc-card-brand"
                  style={{ color: appearance.accent }}
                >
                  LumoCard
                </div>
              </div>
            </div>

            <div className="lc-preview-note">
              ✨ این پیش‌نمایش برای بررسی ظاهر کارت است. صفحه
              عمومی باید اطلاعات ذخیره‌شده را نیز نمایش دهد.
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .lc-page {
          min-height: 100vh;
          background: #0b0b12;
          color: #f4f1fa;
          font-family: Arial, sans-serif;
          direction: rtl;
        }

        .lc-topbar {
          height: 76px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #101019;
          border-bottom: 1px solid #262333;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .lc-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          text-decoration: none;
          font-size: 21px;
          font-weight: 800;
        }

        .lc-logo {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #a855f7, #6d28d9);
          color: white;
        }

        .lc-purple {
          color: #c084fc;
        }

        .lc-top-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lc-public-link {
          color: #d8c3fa;
          text-decoration: none;
          font-size: 13px;
        }

        .lc-save,
        .lc-primary {
          border: 0;
          border-radius: 11px;
          padding: 12px 17px;
          color: white;
          font-weight: 700;
          background: linear-gradient(135deg, #9333ea, #6d28d9);
          cursor: pointer;
          transition: 0.2s;
        }

        .lc-save:hover,
        .lc-primary:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }

        .lc-save:disabled {
          opacity: 0.6;
          cursor: wait;
          transform: none;
        }

        .lc-layout {
          max-width: 1700px;
          margin: auto;
          padding: 25px;
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr) 300px;
          gap: 24px;
          align-items: start;
        }

        .lc-sidebar {
          position: sticky;
          top: 100px;
          min-width: 0;
          padding: 16px;
          border: 1px solid #272334;
          background: #111019;
          border-radius: 17px;
        }

        .lc-sidebar-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 19px;
          border-bottom: 1px solid #292536;
          overflow: hidden;
        }

        .lc-avatar {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #332048;
          color: #e9d5ff;
          font-weight: 800;
        }

        .lc-sidebar-heading strong,
        .lc-sidebar-heading small {
          display: block;
          overflow-wrap: anywhere;
        }

        .lc-sidebar-heading strong {
          font-size: 13px;
        }

        .lc-sidebar-heading small {
          margin-top: 5px;
          color: #a89db9;
          font-size: 11px;
          direction: ltr;
          text-align: right;
        }

        .lc-nav-title {
          margin: 23px 0 10px;
          color: #82768f;
          font-size: 11px;
        }

        .lc-nav-item {
          width: 100%;
          border: 1px solid transparent;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 10px;
          margin-bottom: 5px;
          background: transparent;
          color: #c7bfd3;
          text-align: right;
          cursor: pointer;
          font-size: 12px;
        }

        .lc-nav-item.active {
          background: #29183b;
          border-color: #59337a;
          color: #e9d5ff;
        }

        .lc-nav-item:hover {
          background: #21182c;
        }

        .lc-sidebar-bottom {
          margin-top: 25px;
        }

        .lc-tip {
          padding: 13px;
          background: #191325;
          border: 1px solid #352544;
          border-radius: 12px;
        }

        .lc-tip > span {
          font-size: 20px;
        }

        .lc-tip strong {
          display: block;
          margin-top: 9px;
          font-size: 12px;
        }

        .lc-tip p {
          color: #a99db8;
          font-size: 11px;
          line-height: 1.9;
          margin-bottom: 0;
        }

        .lc-home-link {
          display: block;
          color: #a99db8;
          text-decoration: none;
          margin-top: 17px;
          font-size: 12px;
        }

        .lc-main {
          min-width: 0;
        }

        .lc-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin: 4px 0 22px;
        }

        .lc-eyebrow {
          color: #c084fc !important;
          letter-spacing: 2px;
          font-size: 10px !important;
          font-weight: 800;
          margin-bottom: 8px !important;
        }

        .lc-heading h1 {
          margin: 0 0 8px;
          font-size: 26px;
        }

        .lc-heading p {
          color: #9f95ac;
          font-size: 12px;
          margin: 0;
          line-height: 1.8;
        }

        .lc-status {
          flex-shrink: 0;
          border: 1px solid #284a3d;
          color: #86efac;
          background: #10251c;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 10px;
        }

        .lc-panel {
          background: #111019;
          border: 1px solid #292536;
          border-radius: 16px;
          padding: 23px;
          margin-bottom: 20px;
          min-width: 0;
        }

        .lc-panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 24px;
        }

        .lc-panel-heading h2 {
          margin: 0 0 7px;
          font-size: 18px;
        }

        .lc-panel-heading p {
          color: #988ea7;
          font-size: 12px;
          margin: 0;
          line-height: 1.8;
        }

        .lc-panel-heading > span {
          font-size: 25px;
        }

        .lc-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .lc-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          color: #dcd4e6;
          font-size: 12px;
          min-width: 0;
        }

        .lc-full {
          grid-column: 1 / -1;
        }

        .lc-field input,
        .lc-field textarea,
        .lc-list-content input,
        .lc-app-card input,
        .lc-search {
          width: 100%;
          min-width: 0;
          background: #0c0b12;
          color: white;
          border: 1px solid #342d40;
          border-radius: 9px;
          padding: 12px;
          outline: none;
          font: inherit;
          font-size: 12px;
        }

        .lc-field textarea {
          resize: vertical;
          line-height: 1.9;
        }

        .lc-field input:focus,
        .lc-field textarea:focus,
        .lc-list-content input:focus,
        .lc-app-card input:focus,
        .lc-search:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 3px #a855f719;
        }

        .lc-field small {
          color: #91849f;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .lc-info-box {
          margin-top: 22px;
          border: 1px solid #392849;
          background: #191223;
          color: #c9b5df;
          padding: 14px;
          border-radius: 11px;
          font-size: 12px;
          line-height: 2;
          overflow-wrap: anywhere;
        }

        .lc-info-box code {
          direction: ltr;
          display: inline-block;
          color: #d8b4fe;
        }

        .lc-add-box {
          border: 1px solid #30283b;
          background: #15121d;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .lc-add-box .lc-primary {
          margin-top: 17px;
        }

        .lc-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .lc-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          border: 1px solid #302a3a;
          background: #15131d;
          border-radius: 11px;
          padding: 12px;
        }

        .lc-list-icon {
          font-size: 23px;
          flex-shrink: 0;
        }

        .lc-list-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .lc-list-content input {
          padding: 9px;
        }

        .lc-item-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-shrink: 0;
        }

        .lc-item-actions button {
          width: 29px;
          height: 27px;
          border: 1px solid #393044;
          background: #211a2b;
          color: white;
          border-radius: 7px;
          cursor: pointer;
        }

        .lc-item-actions button:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .lc-item-actions .lc-delete {
          color: #fca5a5;
          border-color: #643039;
          background: #30171e;
          font-size: 17px;
        }

        .lc-empty {
          padding: 25px;
          text-align: center;
          color: #8e849c;
          background: #15131d;
          border: 1px dashed #393044;
          border-radius: 11px;
          font-size: 12px;
        }

        .lc-search {
          margin-bottom: 17px;
        }

        .lc-app-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .lc-app-card {
          border: 1px solid #302a3a;
          border-radius: 11px;
          background: #15131d;
          padding: 12px;
          min-width: 0;
        }

        .lc-app-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 11px;
          font-size: 12px;
        }

        .lc-app-title > span {
          font-size: 19px;
        }

        .lc-app-card input {
          padding: 10px;
        }

        .lc-clear {
          border: 0;
          padding: 6px 0 0;
          background: transparent;
          color: #fca5a5;
          font-size: 10px;
          cursor: pointer;
        }

        .lc-subheading {
          font-size: 13px;
          margin: 24px 0 13px;
        }

        .lc-template-grid,
        .lc-preset-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .lc-template,
        .lc-preset {
          position: relative;
          border: 1px solid #342d40;
          border-radius: 11px;
          padding: 12px;
          background: #17141f;
          color: #ddd4e9;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-align: right;
          font-size: 11px;
          min-width: 0;
        }

        .lc-template > span {
          font-size: 20px;
        }

        .lc-template.selected,
        .lc-choice.selected {
          border-color: #a855f7;
          background: #29183b;
          color: #f3e8ff;
        }

        .lc-template b {
          margin-right: auto;
          color: #d8b4fe;
        }

        .lc-preset-swatch {
          width: 31px;
          height: 31px;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .lc-choice-row {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .lc-choice {
          flex: 1;
          min-width: 90px;
          padding: 12px 8px;
          border-radius: 9px;
          border: 1px solid #342d40;
          background: #17141f;
          color: #d4cadf;
          cursor: pointer;
          font-size: 11px;
        }

        .lc-color-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 17px;
          border: 1px solid #342d40;
          background: #15131d;
          border-radius: 10px;
          padding: 12px;
          color: #dcd4e6;
          font-size: 12px;
        }

        .lc-color-field input {
          width: 42px;
          height: 31px;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
        }

        .lc-design-controls {
          margin-top: 16px;
        }

        .lc-radius {
          margin-top: 20px;
        }

        .lc-radius input {
          accent-color: #a855f7;
        }

        .lc-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 15px 0 35px;
          color: #958ba2;
          font-size: 11px;
        }

        .lc-preview-column {
          min-width: 0;
        }

        .lc-preview-sticky {
          position: sticky;
          top: 100px;
        }

        .lc-preview-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 4px 0 17px;
        }

        .lc-preview-heading strong {
          font-size: 14px;
        }

        .lc-preview-heading p {
          color: #92889f;
          font-size: 11px;
          margin: 7px 0 0;
        }

        .lc-preview-heading > span {
          font-size: 22px;
        }

        .lc-card-preview {
          position: relative;
          overflow: hidden;
          min-height: 340px;
          padding: 23px 17px;
          border: 1px solid #ffffff20;
          box-shadow: 0 15px 40px #0004;
          transition:
            background 0.2s,
            border-radius 0.2s;
          overflow-wrap: anywhere;
        }

        .lc-card-orb {
          position: absolute;
          width: 160px;
          height: 160px;
          top: -90px;
          left: -65px;
          border-radius: 50%;
          opacity: 0.15;
          filter: blur(10px);
          pointer-events: none;
        }

        .lc-card-content {
          position: relative;
          z-index: 1;
        }

        .lc-card-avatar {
          width: 64px;
          height: 64px;
          margin: 0 auto 13px;
          border: 2px solid;
          border-radius: 22px;
          background: #0003;
          display: grid;
          place-items: center;
          font-size: 28px;
          font-weight: 800;
        }

        .lc-card-preview h2 {
          text-align: center;
          margin: 0 0 7px;
          font-size: 18px;
          overflow-wrap: anywhere;
        }

        .lc-card-job {
          text-align: center;
          font-size: 11px;
          opacity: 0.75;
          margin: 0;
        }

        .lc-card-divider {
          height: 1px;
          background: #ffffff25;
          margin: 18px 0;
        }

        .lc-card-bio {
          text-align: center;
          font-size: 11px;
          line-height: 1.9;
          margin-bottom: 17px;
          opacity: 0.85;
        }

        .lc-preview-contact {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px;
          margin-top: 8px;
          border: 1px solid #ffffff10;
          border-radius: 10px;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .lc-card-brand {
          margin-top: 24px;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .lc-preview-note {
          margin-top: 13px;
          padding: 12px;
          border-radius: 10px;
          background: #15111f;
          border: 1px solid #30213f;
          color: #ad9bbd;
          font-size: 10px;
          line-height: 1.9;
        }

        .lc-alert {
          padding: 13px 15px;
          border-radius: 10px;
          margin-bottom: 15px;
          font-size: 12px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .lc-alert.error {
          color: #fecaca;
          border: 1px solid #71343c;
          background: #32171d;
        }

        .lc-alert.success {
          color: #bbf7d0;
          border: 1px solid #285a40;
          background: #11271b;
        }

        @media (max-width: 1200px) {
          .lc-layout {
            grid-template-columns: 190px minmax(0, 1fr);
          }

          .lc-preview-column {
            grid-column: 2;
          }

          .lc-preview-sticky {
            position: static;
          }

          .lc-card-preview {
            max-width: 400px;
            margin: auto;
          }
        }

        @media (max-width: 760px) {
          .lc-topbar {
            height: auto;
            min-height: 68px;
            padding: 12px 15px;
          }

          .lc-brand {
            font-size: 17px;
          }

          .lc-logo {
            width: 32px;
            height: 32px;
          }

          .lc-top-actions {
            gap: 9px;
          }

          .lc-public-link {
            font-size: 11px;
          }

          .lc-save {
            padding: 10px;
            font-size: 10px;
          }

          .lc-layout {
            display: flex;
            flex-direction: column;
            padding: 14px;
            gap: 18px;
          }

          .lc-sidebar,
          .lc-main,
          .lc-preview-column {
            width: 100%;
          }

          .lc-sidebar {
            position: static;
          }

          .lc-sidebar-bottom {
            display: none;
          }

          .lc-sidebar-heading {
            padding-bottom: 12px;
          }

          .lc-nav-title {
            margin-top: 14px;
          }

          .lc-nav-item {
            display: inline-flex;
            width: auto;
            margin: 4px 0 0 4px;
            padding: 10px;
          }

          .lc-heading {
            align-items: flex-start;
          }

          .lc-heading h1 {
            font-size: 22px;
          }

          .lc-status {
            display: none;
          }

          .lc-panel {
            padding: 16px;
          }

          .lc-grid,
          .lc-app-grid {
            grid-template-columns: 1fr;
          }

          .lc-form-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .lc-form-footer .lc-save {
            width: 100%;
          }

          .lc-list-item {
            gap: 8px;
            padding: 9px;
          }

          .lc-list-icon {
            font-size: 19px;
          }

          .lc-item-actions button {
            width: 26px;
            height: 25px;
          }

          .lc-template-grid,
          .lc-preset-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .lc-preview-column {
            grid-column: auto;
          }

          .lc-card-preview {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
