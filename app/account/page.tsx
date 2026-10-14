"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  appearance: Appearance | null;
};

const templates = [
  {
    id: "personal",
    title: "شخصی",
    description: "برای معرفی خودت و ارتباطاتت",
    icon: "👤",
    job: "Personal Profile",
    bg: "#101014",
    end: "#292139",
    accent: "#C084FC",
    text: "#FFFFFF",
  },
  {
    id: "designer",
    title: "طراح گرافیک",
    description: "مناسب طراحان و فعالان برندینگ",
    icon: "🎨",
    job: "Graphic Designer",
    bg: "#1A1028",
    end: "#47216A",
    accent: "#E879F9",
    text: "#FFFFFF",
  },
  {
    id: "developer",
    title: "برنامه‌نویس",
    description: "برای برنامه‌نویسان و متخصصان IT",
    icon: "💻",
    job: "Developer",
    bg: "#071C19",
    end: "#123D35",
    accent: "#34D399",
    text: "#FFFFFF",
  },
  {
    id: "creator",
    title: "تولیدکننده محتوا",
    description: "مناسب گیمرها و تولیدکنندگان محتوا",
    icon: "🎮",
    job: "Content Creator",
    bg: "#1C1028",
    end: "#431B50",
    accent: "#F472B6",
    text: "#FFFFFF",
  },
  {
    id: "business",
    title: "کسب‌وکار",
    description: "برای شرکت‌ها و خدمات حرفه‌ای",
    icon: "💼",
    job: "Business Owner",
    bg: "#101820",
    end: "#26394A",
    accent: "#60A5FA",
    text: "#FFFFFF",
  },
  {
    id: "shop",
    title: "فروشگاه",
    description: "برای فروشگاه‌ها و برندهای تجاری",
    icon: "🛍️",
    job: "Shop Owner",
    bg: "#21150C",
    end: "#50301B",
    accent: "#FBBF24",
    text: "#FFFFFF",
  },
  {
    id: "cafe",
    title: "کافه و رستوران",
    description: "برای معرفی مجموعه و راه‌های تماس",
    icon: "☕",
    job: "Restaurant & Cafe",
    bg: "#20140F",
    end: "#493025",
    accent: "#FDBA74",
    text: "#FFFFFF",
  },
];

function createAppearance(
  template: (typeof templates)[number],
): Appearance {
  return {
    backgroundType: "gradient",
    backgroundColor: template.bg,
    backgroundEndColor: template.end,
    accentColor: template.accent,
    textColor: template.text,
    animation: "glow",
    backgroundImage: "",
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  background: "#111116",
  border: "1px solid #34313D",
  borderRadius: 12,
  color: "#FFFFFF",
  fontSize: 14,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontSize: 13,
  color: "#C9C4D2",
};

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [existingProfile, setExistingProfile] =
    useState<Profile | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState("personal");

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    job: "",
    bio: "",
    avatar_url: "",
    phone: "",
    email: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.replace("/login");
          return;
        }

        if (!active) return;

        const user = authData.user;
        setUserId(user.id);

        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, username, full_name, job, bio, avatar_url, phone, email, website, location, social_links, appearance",
          )
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          setMessage(
            "دریافت اطلاعات حساب انجام نشد. دسترسی جدول profiles در Supabase را بررسی کن.",
          );
          return;
        }

        if (!active) return;

        if (data) {
          const profile = data as Profile;

          setExistingProfile(profile);

          setForm({
            username: profile.username ?? "",
            full_name: profile.full_name ?? "",
            job: profile.job ?? "",
            bio: profile.bio ?? "",
            avatar_url: profile.avatar_url ?? "",
            phone: profile.phone ?? "",
            email: profile.email ?? "",
            website: profile.website ?? "",
            location: profile.location ?? "",
          });

          const matchingTemplate = templates.find(
            (template) =>
              template.bg === profile.appearance?.backgroundColor &&
              template.end === profile.appearance?.backgroundEndColor,
          );

          if (matchingTemplate) {
            setSelectedTemplate(matchingTemplate.id);
          } else if (profile.appearance) {
            setSelectedTemplate("custom");
          }
        }
      } catch {
        if (active) {
          setMessage("اتصال برقرار نشد. دوباره صفحه را باز کن.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [router]);

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function chooseTemplate(templateId: string) {
    const template = templates.find(
      (item) => item.id === templateId,
    );

    if (!template) return;

    setSelectedTemplate(templateId);

    setForm((previous) => ({
      ...previous,
      job: template.job,
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setMessage("");

    const username = form.username.trim().toLowerCase();
    const fullName = form.full_name.trim();

    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      setMessage(
        "نام کاربری باید ۳ تا ۳۰ کاراکتر و شامل حروف انگلیسی، عدد، خط تیره یا زیرخط باشد.",
      );
      return;
    }

    if (!fullName) {
      setMessage("نام و نام خانوادگی را وارد کن.");
      return;
    }

    if (!userId) {
      setMessage("حساب کاربری شناسایی نشد. دوباره وارد شو.");
      return;
    }

    setSaving(true);

    try {
      const currentTemplate = templates.find(
        (template) => template.id === selectedTemplate,
      );

      const appearance: Appearance =
        selectedTemplate === "custom" && existingProfile?.appearance
          ? existingProfile.appearance
          : createAppearance(currentTemplate ?? templates[0]);

      const profileData = {
        id: userId,
        username,
        full_name: fullName,
        job: form.job.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        location: form.location.trim() || null,
        appearance,
        updated_at: new Date().toISOString(),
      };

      // اگر کارت موجود است، همان کارت ویرایش می‌شود.
      // اگر کارت وجود ندارد، یک کارت برای این کاربر ساخته می‌شود.
      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" })
        .select(
          "id, username, full_name, job, bio, avatar_url, phone, email, website, location, social_links, appearance",
        )
        .single();

      if (error) {
        if (error.code === "23505") {
          setMessage(
            "این نام کاربری قبلاً انتخاب شده؛ یک نام دیگر امتحان کن.",
          );
        } else {
          setMessage(
            `ذخیره انجام نشد: ${error.message}`,
          );
        }
        return;
      }

      setExistingProfile(data as Profile);

      router.push(`/${encodeURIComponent(username)}`);
      router.refresh();
    } catch {
      setMessage("مشکلی پیش آمد. دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle} dir="rtl">
        <p>در حال بارگذاری حساب کاربری...</p>
      </main>
    );
  }

  const previewTemplate =
    templates.find((item) => item.id === selectedTemplate) ??
    templates[0];

  return (
    <main style={pageStyle} dir="rtl">
      <div style={containerStyle}>
        <header style={headerStyle}>
          <Link href="/" style={brandStyle}>
            Lumo<span style={{ color: "#C084FC" }}>Card</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
              router.refresh();
            }}
            style={secondaryButtonStyle}
          >
            خروج از حساب
          </button>
        </header>

        <section style={{ margin: "32px 0" }}>
          <div style={eyebrowStyle}>LUMOCARD STUDIO</div>

          <h1 style={{ fontSize: 32, margin: "12px 0" }}>
            {existingProfile
              ? "کارت دیجیتالت رو مدیریت کن"
              : "کارت دیجیتال خودت رو بساز"}
          </h1>

          <p style={{ color: "#AAA4B5", lineHeight: 2 }}>
            یک قالب انتخاب کن، اطلاعاتت رو وارد کن و کارت اختصاصی خودت
            رو بساز.
          </p>
        </section>

        <form onSubmit={handleSave}>
          <section style={sectionStyle}>
            <h2 style={headingStyle}>۱. قالب کارتت رو انتخاب کن</h2>

            <div style={templatesGridStyle}>
              {templates.map((template) => {
                const selected = selectedTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => chooseTemplate(template.id)}
                    style={{
                      ...templateCardStyle,
                      background: `linear-gradient(135deg, ${template.bg}, ${template.end})`,
                      border: selected
                        ? "2px solid #C084FC"
                        : "1px solid #38323F",
                      boxShadow: selected
                        ? "0 0 22px #A855F733"
                        : "none",
                    }}
                  >
                    <span style={{ fontSize: 29 }}>
                      {template.icon}
                    </span>

                    <strong>{template.title}</strong>

                    <span style={{ fontSize: 12, color: "#D4CADD" }}>
                      {template.description}
                    </span>

                    <span
                      style={{
                        color: template.accent,
                        fontSize: 12,
                        marginTop: 8,
                      }}
                    >
                      {selected ? "✓ انتخاب شده" : "انتخاب قالب"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>۲. اطلاعات کارت</h2>

            <div style={fieldsGridStyle}>
              <div>
                <label style={labelStyle} htmlFor="full_name">
                  نام و نام خانوادگی *
                </label>
                <input
                  id="full_name"
                  style={inputStyle}
                  value={form.full_name}
                  onChange={(e) =>
                    updateField("full_name", e.target.value)
                  }
                  placeholder="مثلاً سامیار برنایی"
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="username">
                  نام کاربری و آدرس کارت *
                </label>
                <input
                  id="username"
                  style={inputStyle}
                  value={form.username}
                  onChange={(e) =>
                    updateField(
                      "username",
                      e.target.value.toLowerCase().replace(/\s/g, ""),
                    )
                  }
                  placeholder="samiyar"
                  minLength={3}
                  maxLength={30}
                  pattern="[a-z0-9_-]{3,30}"
                  required
                />
                <small style={hintStyle}>
                  lumocard.ir/{form.username || "username"}
                </small>
              </div>

              <div>
                <label style={labelStyle} htmlFor="job">
                  شغل یا عنوان
                </label>
                <input
                  id="job"
                  style={inputStyle}
                  value={form.job}
                  onChange={(e) => updateField("job", e.target.value)}
                  placeholder="طراح گرافیک"
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="avatar_url">
                  لینک تصویر پروفایل
                </label>
                <input
                  id="avatar_url"
                  type="url"
                  style={inputStyle}
                  value={form.avatar_url}
                  onChange={(e) =>
                    updateField("avatar_url", e.target.value)
                  }
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="phone">
                  شماره تماس
                </label>
                <input
                  id="phone"
                  type="tel"
                  style={inputStyle}
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="شماره تماس"
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="email">
                  ایمیل
                </label>
                <input
                  id="email"
                  type="email"
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="website">
                  وب‌سایت
                </label>
                <input
                  id="website"
                  type="url"
                  style={inputStyle}
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="location">
                  شهر یا موقعیت
                </label>
                <input
                  id="location"
                  style={inputStyle}
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="تهران"
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={labelStyle} htmlFor="bio">
                درباره من
              </label>
              <textarea
                id="bio"
                style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="چند خط درباره خودت یا کسب‌وکارت بنویس..."
                maxLength={500}
              />
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>۳. پیش‌نمایش قالب</h2>

            <div
              style={{
                ...previewStyle,
                background: `linear-gradient(135deg, ${previewTemplate.bg}, ${previewTemplate.end})`,
                color: previewTemplate.text,
                borderColor: previewTemplate.accent,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "#FFFFFF18",
                  border: `2px solid ${previewTemplate.accent}`,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  fontSize: 28,
                  margin: "0 auto 15px",
                }}
              >
                {form.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.avatar_url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  previewTemplate.icon
                )}
              </div>

              <h3 style={{ margin: "8px 0", fontSize: 23 }}>
                {form.full_name || "نام شما"}
              </h3>

              <p style={{ color: previewTemplate.accent, margin: 0 }}>
                {form.job || previewTemplate.job}
              </p>

              <p style={{ color: "#DDD5E7", lineHeight: 1.9 }}>
                {form.bio || "معرفی کوتاه شما در این قسمت نمایش داده می‌شود."}
              </p>

              <span
                style={{
                  display: "inline-block",
                  padding: "9px 14px",
                  borderRadius: 10,
                  background: previewTemplate.accent,
                  color: "#17111F",
                  fontSize: 13,
                }}
              >
                LumoCard
              </span>
            </div>

            <p style={hintStyle}>
              پیش‌نمایش بالا نمونه‌ای از قالب انتخابی است؛ ظاهر صفحه نهایی
              ممکن است با توجه به اجزای پروفایل کمی متفاوت باشد.
            </p>
          </section>

          {message && (
            <div role="alert" style={messageStyle}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              ...primaryButtonStyle,
              opacity: saving ? 0.65 : 1,
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving
              ? "در حال ذخیره..."
              : existingProfile
                ? "ذخیره تغییرات کارت"
                : "ساخت کارت دیجیتال ←"}
          </button>
        </form>

        {existingProfile && (
          <p style={{ textAlign: "center", marginTop: 20 }}>
            <Link
              href={`/${encodeURIComponent(existingProfile.username)}`}
              style={{ color: "#C084FC" }}
            >
              مشاهده کارت فعلی
            </Link>
          </p>
        )}
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #09090d;
          color: #fff;
          font-family: inherit;
        }

        input:focus,
        textarea:focus {
          border-color: #A855F7 !important;
        }

        button {
          font-family: inherit;
        }

        @media (max-width: 600px) {
          .account-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(ellipse at top, #20132D 0%, #0B0A10 45%, #08080B 100%)",
  color: "#FFFFFF",
  padding: "24px 18px 60px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const brandStyle: React.CSSProperties = {
  fontSize: 25,
  fontWeight: 900,
  color: "#FFFFFF",
  textDecoration: "none",
  letterSpacing: -1,
};

const eyebrowStyle: React.CSSProperties = {
  color: "#C084FC",
  letterSpacing: 3,
  fontSize: 11,
  fontWeight: 800,
};

const sectionStyle: React.CSSProperties = {
  background: "#111016",
  border: "1px solid #292530",
  borderRadius: 20,
  padding: 22,
  marginBottom: 22,
};

const headingStyle: React.CSSProperties = {
  fontSize: 19,
  margin: "0 0 20px",
};

const templatesGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
};

const templateCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  textAlign: "right",
  gap: 10,
  minHeight: 180,
  padding: 17,
  borderRadius: 16,
  color: "#FFFFFF",
  cursor: "pointer",
};

const fieldsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: 18,
};

const hintStyle: React.CSSProperties = {
  display: "block",
  color: "#928B9D",
  fontSize: 12,
  marginTop: 8,
  lineHeight: 1.8,
};

const previewStyle: React.CSSProperties = {
  maxWidth: 430,
  margin: "0 auto",
  padding: "30px 22px",
  textAlign: "center",
  borderRadius: 24,
  border: "1px solid",
  boxShadow: "0 15px 45px #00000055",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  borderRadius: 14,
  padding: 16,
  color: "#170E20",
  fontSize: 16,
  fontWeight: 900,
  background: "linear-gradient(100deg, #C084FC, #E9A8FF)",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 15px",
  borderRadius: 10,
  border: "1px solid #393341",
  background: "#15121A",
  color: "#FFFFFF",
  cursor: "pointer",
};

const messageStyle: React.CSSProperties = {
  padding: 14,
  margin: "16px 0",
  borderRadius: 12,
  background: "#391B29",
  border: "1px solid #78364D",
  color: "#FFB8CD",
  lineHeight: 1.8,
};
