import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Appearance = {
  template?: string;
  accent?: string;
  background?: string;
  backgroundType?: "solid" | "gradient" | "image" | "texture";
  gradientStart?: string;
  gradientEnd?: string;
  backgroundImage?: string;
  backgroundPreset?: string;
  radius?: number;

  // پشتیبانی از تنظیمات نسخه‌های قبلی
  backgroundMode?: "solid" | "gradient" | "texture";
  backgroundColor?: string;
  backgroundColor2?: string;
  texture?: string;

  textColor?: string;
  buttonColor?: string;
  iconColor?: string;
};

type PhoneItem = {
  id?: string;
  title?: string;
  number?: string;
};

type CustomLink = {
  id?: string;
  title?: string;
  url?: string;
};

type Profile = {
  id?: string;
  username: string;
  full_name: string;
  job?: string;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
  avatar_url?: string;
  social_links?: Record<string, unknown>;
  appearance?: Appearance;
  trial_started_at?: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  subscription_status?: string;
  subscription_plan?: string;
  is_unlimited?: boolean;
};

const labels: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  website: "Website",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X",
  facebook: "Facebook",
  snapchat: "Snapchat",
  twitch: "Twitch",
  discord: "Discord",
  github: "GitHub",
  aparat: "آپارات",
  rubika: "روبیکا",
  eitaa: "ایتا",
  bale: "بله",
  soroush: "سروش پلاس",
  virasty: "ویراستی",
  digikala: "دیجی‌کالا",
  torob: "ترب",
  basalam: "باسلام",
  filimo: "فیلیمو",
  namava: "نماوا",
  filmnet: "فیلم‌نت",
  taaghche: "طاقچه",
  fidibo: "فیدیبو",
  snapp: "اسنپ",
  tapsi: "تپسی",
  divar: "دیوار",
  sheypoor: "شیپور",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  behance: "Behance",
  dribbble: "Dribbble",
  pinterest: "Pinterest",
  threads: "Threads",
  reddit: "Reddit",
  tiktokshop: "TikTok Shop",
  telegramchannel: "Telegram Channel",
  whatsappchannel: "WhatsApp Channel",
  telegramgroup: "Telegram Group",
  youtubechannel: "YouTube Channel",
  linkedincompany: "LinkedIn Company",
  whatsappbusiness: "WhatsApp Business",
  email: "Email",
  phone: "Phone",
  sms: "SMS",
  maps: "Google Maps",
  calendly: "Calendly",
  linktree: "Linktree",
  beacons: "Beacons",
  notion: "Notion",
  portfolio: "Portfolio",
  limo: "لینک دلخواه",
  website2: "وب‌سایت دوم",
};

function safeHref(raw: string): string {
  const value = raw.trim();

  if (!value) return "";

  if (/^(javascript|data|vbscript):/i.test(value)) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);

      if (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      ) {
        return parsed.href;
      }
    } catch {
      return "";
    }

    return "";
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }

  return "";
}

function validColor(
  value: string | undefined,
  fallback: string
): string {
  return value && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback;
}

function hasAccess(profile: Profile): boolean {
  if (profile.is_unlimited === true) return true;

  const now = Date.now();

  if (
    profile.subscription_status === "active" &&
    profile.subscription_plan === "annual" &&
    profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at).getTime() > now
  ) {
    return true;
  }

  if (
    profile.subscription_status === "trial" &&
    profile.trial_started_at
  ) {
    const startedAt = new Date(
      profile.trial_started_at
    ).getTime();

    if (
      Number.isFinite(startedAt) &&
      now >= startedAt &&
      now < startedAt + 48 * 60 * 60 * 1000
    ) {
      return true;
    }
  }

  return false;
}

function getCardBackground(appearance: Appearance): string {
  const backgroundType =
    appearance.backgroundType ||
    appearance.backgroundMode ||
    "solid";

  const first = validColor(
    appearance.background ||
      appearance.backgroundColor,
    "#10071f"
  );

  const second = validColor(
    appearance.gradientEnd ||
      appearance.backgroundColor2,
    "#28133e"
  );

  const gradientStart = validColor(
    appearance.gradientStart ||
      appearance.backgroundColor,
    first
  );

  const gradientEnd = validColor(
    appearance.gradientEnd ||
      appearance.backgroundColor2,
    second
  );

  if (backgroundType === "image") {
    const raw = appearance.backgroundImage || "";

    const imageUrl = safeHref(raw);

    if (imageUrl) {
      return `linear-gradient(#0004,#0007),url("${imageUrl}") center/cover`;
    }

    return first;
  }

  if (backgroundType === "gradient") {
    return `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;
  }

  if (backgroundType === "texture") {
    const texture =
      appearance.backgroundPreset ||
      appearance.texture ||
      "galaxy";

    switch (texture) {
      case "marble":
        return `
          radial-gradient(ellipse at 20% 20%, transparent 0%, #ffffff16 20%, transparent 32%),
          radial-gradient(ellipse at 80% 65%, transparent 0%, #ffffff12 18%, transparent 30%),
          repeating-linear-gradient(125deg, transparent 0px, transparent 28px, #ffffff09 30px, transparent 33px),
          ${first}
        `;

      case "black-gold-stone":
        return `
          radial-gradient(ellipse at 15% 25%, #d4a64b33, transparent 28%),
          repeating-linear-gradient(125deg, transparent 0px, transparent 45px, #d4a64b45 46px, transparent 48px, transparent 90px),
          repeating-linear-gradient(35deg, #ffffff06 0px, transparent 2px, transparent 60px),
          #090909
        `;

      case "galaxy":
      case "stars":
        return `
          radial-gradient(circle at 15% 20%, #ffffff99 1px, transparent 2px),
          radial-gradient(circle at 75% 35%, #ffffff99 1px, transparent 2px),
          radial-gradient(circle at 40% 80%, #ffffff88 1px, transparent 2px),
          radial-gradient(circle at 90% 85%, #ffffff77 1px, transparent 2px),
          radial-gradient(ellipse at 25% 15%, #9333ea88, transparent 45%),
          radial-gradient(ellipse at 85% 80%, #2563eb66, transparent 45%),
          #08051a
        `;

      case "purple-smoke":
        return `
          radial-gradient(ellipse at 20% 25%, #a855f799, transparent 40%),
          radial-gradient(ellipse at 75% 35%, #6d28d999, transparent 38%),
          radial-gradient(ellipse at 50% 100%, #c084fc66, transparent 50%),
          #100719
        `;

      case "wood":
        return `
          repeating-linear-gradient(2deg, transparent 0px, #ffffff08 3px, transparent 7px, #00000025 11px),
          repeating-linear-gradient(90deg, #00000012 0px, transparent 35px, #00000020 60px),
          linear-gradient(135deg, #684126, #2f1a10)
        `;

      case "crystal":
        return `
          linear-gradient(135deg, transparent 35%, #ffffff12 36%, transparent 55%),
          linear-gradient(35deg, transparent 45%, #c084fc35 46%, transparent 65%),
          linear-gradient(150deg, #17132d, #4c1d95 55%, #10101a)
        `;

      case "cyberpunk":
        return `
          linear-gradient(#ff00ff15 1px, transparent 1px),
          linear-gradient(90deg, #00e5ff15 1px, transparent 1px),
          radial-gradient(ellipse at top right, #ec489955, transparent 45%),
          #090817
        `;

      case "sand":
        return `
          radial-gradient(ellipse at 20% 30%, #fff7d633, transparent 40%),
          repeating-linear-gradient(160deg, transparent 0px, #79552b10 3px, transparent 7px),
          linear-gradient(135deg, #e6cda1, #9e7b4f)
        `;

      case "emerald":
        return `
          radial-gradient(ellipse at 20% 20%, #34d39977, transparent 45%),
          radial-gradient(ellipse at 85% 80%, #04785799, transparent 45%),
          #041c17
        `;

      case "noise":
        return `
          repeating-linear-gradient(45deg, ${first}, ${first} 3px, ${second} 4px, ${first} 6px)
        `;

      default:
        return `
          radial-gradient(ellipse at top, ${second}, ${first} 75%)
        `;
    }
  }

  return validColor(
    appearance.background ||
      appearance.backgroundColor,
    "#10071f"
  );
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

export default async function PublicCard({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing public Supabase environment variables"
    );
  }

  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await client
    .from("profiles")
    .select(
      [
        "username",
        "full_name",
        "job",
        "bio",
        "phone",
        "website",
        "location",
        "avatar_url",
        "social_links",
        "appearance",
        "trial_started_at",
        "subscription_started_at",
        "subscription_expires_at",
        "subscription_status",
        "subscription_plan",
        "is_unlimited",
      ].join(",")
    )
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const profile = data as Profile;

  if (!hasAccess(profile)) {
    notFound();
  }

  const appearance = profile.appearance || {};

  const accent = validColor(
    appearance.accent,
    "#c084fc"
  );

  const textColor = validColor(
    appearance.textColor,
    "#ffffff"
  );

  const buttonColor = validColor(
    appearance.buttonColor,
    "#252538"
  );

  const iconColor = validColor(
    appearance.iconColor,
    accent
  );

  const cardBackground = getCardBackground(appearance);

  const socialLinks = profile.social_links || {};

  const phones = Array.isArray(socialLinks.phones)
    ? (socialLinks.phones as PhoneItem[]).filter(
        (phone) => Boolean(phone?.number?.trim())
      )
    : [];

  const customLinks = Array.isArray(socialLinks.customLinks)
    ? (socialLinks.customLinks as CustomLink[]).filter(
        (item) =>
          Boolean(item?.title?.trim()) &&
          Boolean(item?.url?.trim())
      )
    : [];

const links = Object.entries(socialLinks)
  .filter(
    ([key]) =>
      key !== "phones" &&
      key !== "customLinks" &&
      key !== "email"
  )

    .map(([key, value]) => {
      let href = "";

      if (typeof value === "string") {
        if (key === "email") {
          const email = value.trim();

          if (
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ) {
            href = `mailto:${email}`;
          }
        } else if (key === "phone" || key === "sms") {
          const number = normalizePhone(value);

          if (number) {
            href =
              key === "sms"
                ? `sms:${number}`
                : `tel:${number}`;
          }
        } else {
          href = safeHref(value);
        }
      }

      return {
        key,
        label: labels[key] || key,
        url: href,
      };
    })
    .filter((item) => item.url);

  const websiteHref = profile.website
    ? safeHref(profile.website)
    : "";

  if (
    websiteHref &&
    !links.some((link) => link.url === websiteHref)
  ) {
    links.push({
      key: "profile-website",
      label: "Website",
      url: websiteHref,
    });
  }

  const radius =
    typeof appearance.radius === "number"
      ? Math.min(32, Math.max(0, appearance.radius))
      : 18;

  return (
    <main className="public-page" dir="rtl">
      <article
        className="public-profile"
        style={{
          background: cardBackground,
          color: textColor,
          borderColor: `${accent}99`,
          borderRadius: `${radius}px`,
          ["--card-accent" as string]: accent,
          ["--card-button" as string]: buttonColor,
        }}
      >
        <div className="preview-top">
          <Link className="brand" href="/">
            ϟ Lumo<span>Card</span>
          </Link>

          <span className="pill">
            {(appearance.template || "personal").toUpperCase()}
          </span>
        </div>

        <div
          className="public-avatar"
          style={{
            borderColor: accent,
            color: accent,
          }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`تصویر ${profile.full_name || profile.username}`}
            />
          ) : (
            (profile.full_name || profile.username)
              .slice(0, 2)
              .toUpperCase()
          )}
        </div>

        <h1>{profile.full_name || profile.username}</h1>

        {profile.job && (
          <p className="public-job">{profile.job}</p>
        )}

        {profile.bio && (
          <p className="public-bio">{profile.bio}</p>
        )}

        {profile.location && (
          <p className="muted">
            ⌖ {profile.location}
          </p>
        )}

        {phones.length > 0 ? (
          <div className="contact-list">
            {phones.map((phone, index) => (
              <a
                key={phone.id || `${phone.number}-${index}`}
                className="social-link"
                href={`tel:${normalizePhone(phone.number || "")}`}
              >
                <span>
                  📞 {phone.title || "شماره تماس"}
                </span>
                <span className="contact-value" dir="ltr">
                  {phone.number}
                </span>
              </a>
            ))}
          </div>
        ) : profile.phone ? (
          <a
            className="social-link"
            href={`tel:${normalizePhone(profile.phone)}`}
          >
            <span>📞 شماره تماس</span>
            <span className="contact-value" dir="ltr">
              {profile.phone}
            </span>
          </a>
        ) : null}

        {profile.email && (
          <a
            className="social-link"
            href={`mailto:${profile.email}`}
          >
            ✉️ ارسال ایمیل
            <span className="arrow">↗</span>
          </a>
        )}

        <div className="social-list">
          {links.map((link) => (
            <a
              className="social-link"
              key={link.key}
              href={link.url}
              target={
                link.url.startsWith("http")
                  ? "_blank"
                  : undefined
              }
              rel={
                link.url.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              <span>{link.label}</span>
              <span
                className="arrow"
                style={{ color: iconColor }}
              >
                ↗
              </span>
            </a>
          ))}

          {customLinks.map((item, index) => {
            const href = safeHref(item.url || "");

            if (!href) return null;

            return (
              <a
                className="social-link"
                key={item.id || `${item.title}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>🔗 {item.title}</span>
                <span
                  className="arrow"
                  style={{ color: iconColor }}
                >
                  ↗
                </span>
              </a>
            );
          })}
        </div>

        <p className="powered">
          Made with{" "}
          <Link href="/" style={{ color: accent }}>
            ϟ LumoCard
          </Link>
        </p>
      </article>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .public-page {
          min-height: 100vh;
          padding: 30px 16px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          background:
            radial-gradient(ellipse at top, #241238, transparent 60%),
            #08070d;
          font-family: Arial, sans-serif;
        }

        .public-profile {
          width: 100%;
          max-width: 440px;
          min-width: 0;
          padding: 24px;
          border: 1px solid;
          box-shadow: 0 25px 80px #0005;
          overflow-wrap: anywhere;
        }

        .preview-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 32px;
        }

        .brand {
          color: inherit;
          font-size: 18px;
          font-weight: 800;
          text-decoration: none;
        }

        .brand span {
          color: var(--card-accent);
        }

        .pill {
          padding: 7px 9px;
          border: 1px solid #ffffff35;
          border-radius: 8px;
          background: #00000015;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .public-avatar {
          width: 100px;
          height: 100px;
          margin: 0 auto 18px;
          border: 2px solid;
          border-radius: 30px;
          background: #00000025;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          font-weight: 800;
          overflow: hidden;
        }

        .public-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .public-profile h1 {
          margin: 0;
          text-align: center;
          font-size: 25px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .public-job {
          margin: 7px 0 0;
          text-align: center;
          opacity: .8;
          font-size: 13px;
        }

        .public-bio {
          margin: 17px 0;
          text-align: center;
          font-size: 13px;
          line-height: 2;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .muted {
          margin: 12px 0;
          text-align: center;
          font-size: 12px;
          opacity: .8;
          overflow-wrap: anywhere;
        }

        .social-list,
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 15px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          min-width: 0;
          padding: 14px;
          border: 1px solid #ffffff20;
          border-radius: 12px;
          background: var(--card-button, #252538);
          color: inherit;
          text-decoration: none;
          font-size: 13px;
          transition: transform .18s, filter .18s;
        }

        .social-link:hover {
          transform: translateY(-2px);
          filter: brightness(1.12);
        }

        .contact-value {
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .arrow {
          flex-shrink: 0;
          font-size: 16px;
        }

        .powered {
          margin: 30px 0 0;
          text-align: center;
          font-size: 11px;
          opacity: .8;
        }

        .powered a {
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .public-page {
            padding: 14px 10px;
          }

          .public-profile {
            padding: 19px;
          }

          .public-profile h1 {
            font-size: 22px;
          }
        }
      `}</style>
    </main>
  );
}
