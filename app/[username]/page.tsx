import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Appearance = {
  template?: string;
  accent?: string;
  background?: string;
  backgroundMode?: "solid" | "gradient" | "texture";
  backgroundColor?: string;
  backgroundColor2?: string;
  texture?: string;
  textColor?: string;
  buttonColor?: string;
  iconColor?: string;
};

type Profile = {
  username: string;
  full_name: string;
  job?: string;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
  avatar_url?: string;
  social_links?: Record<string, string>;
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

function safeHref(raw: string) {
  const value = raw.trim();

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return "https://" + value;
  }

  return "";
}

function validColor(value: string | undefined, fallback: string) {
  return value && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback;
}

function hasAccess(profile: Profile) {
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

function getCardBackground(appearance: Appearance) {
  const first = validColor(
    appearance.backgroundColor,
    "#10071f"
  );

  const second = validColor(
    appearance.backgroundColor2,
    "#28133e"
  );

  const mode =
    appearance.backgroundMode ||
    "solid";

  if (mode === "gradient") {
    return `linear-gradient(135deg, ${first} 0%, ${second} 100%)`;
  }

  if (mode === "texture") {
    switch (appearance.texture) {
      case "marble":
        return `
          radial-gradient(
            ellipse at 20% 20%,
            transparent 0%,
            rgba(255,255,255,0.09) 20%,
            transparent 32%
          ),
          radial-gradient(
            ellipse at 80% 65%,
            transparent 0%,
            rgba(255,255,255,0.07) 18%,
            transparent 30%
          ),
          repeating-linear-gradient(
            125deg,
            transparent 0px,
            transparent 28px,
            rgba(255,255,255,0.035) 30px,
            transparent 33px
          ),
          ${first}
        `;

      case "stars":
        return `
          radial-gradient(circle at 15% 20%, #ffffff55 1px, transparent 2px),
          radial-gradient(circle at 75% 35%, #ffffff66 1px, transparent 2px),
          radial-gradient(circle at 40% 80%, #ffffff44 1px, transparent 2px),
          radial-gradient(circle at 90% 85%, #ffffff55 1px, transparent 2px),
          ${first}
        `;

      case "noise":
        return `
          repeating-linear-gradient(
            45deg,
            ${first},
            ${first} 3px,
            ${second} 4px,
            ${first} 6px
          )
        `;

      default:
        return `
          radial-gradient(
            ellipse at top,
            ${second},
            ${first} 75%
          )
        `;
    }
  }

  return first;
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
      "username,full_name,job,bio,phone,website,location,avatar_url,social_links,appearance,trial_started_at,subscription_started_at,subscription_expires_at,subscription_status,subscription_plan,is_unlimited"
    )
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const p = data as Profile;

  if (!hasAccess(p)) {
    notFound();
  }

  const appearance = p.appearance || {};

  const accent = validColor(
    appearance.accent,
    "#8b20ff"
  );

  const textColor = validColor(
    appearance.textColor,
    "#ffffff"
  );

  const buttonColor = validColor(
    appearance.buttonColor,
    "#28133e"
  );

  const iconColor = validColor(
    appearance.iconColor,
    accent
  );

  const cardBackground =
    getCardBackground(appearance);

  const links = Object.entries(
    p.social_links || {}
  )
    .map(([key, value]) => ({
      key,
      label: labels[key] || key,
      url:
        typeof value === "string"
          ? safeHref(value)
          : "",
    }))
    .filter((item) => item.url);

  if (
    p.website &&
    safeHref(p.website) &&
    !links.some(
      (link) =>
        link.url === safeHref(p.website!)
    )
  ) {
    links.push({
      key: "website",
      label: "Website",
      url: safeHref(p.website),
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "1px 0",
        background:
          "radial-gradient(ellipse at top,#1b1030,#07070c 60%)",
        ["--card-accent" as string]: accent,
      }}
    >
      <article
        className="public-profile"
        style={{
          background: cardBackground,
          color: textColor,
          borderColor: accent + "99",
        }}
      >
        <div className="preview-top">
          <Link className="brand" href="/">
            ϟ Lumo<span>Card</span>
          </Link>

          <span className="pill">
            {(
              appearance.template || "personal"
            ).toUpperCase()}
          </span>
        </div>

        <div
          className="public-avatar"
          style={{
            border: `2px solid ${accent}`,
            color: accent,
          }}
        >
          {p.avatar_url ? (
            <img
              src={p.avatar_url}
              alt="تصویر پروفایل"
            />
          ) : (
            (p.full_name || p.username).slice(0, 2)
          )}
        </div>

        <h1 style={{ color: textColor }}>
          {p.full_name || p.username}
        </h1>

        {p.job && (
          <p
            className="public-job"
            style={{ color: textColor }}
          >
            {p.job}
          </p>
        )}

        {p.bio && (
          <p
            className="public-bio"
            style={{ color: textColor }}
          >
            {p.bio}
          </p>
        )}

        {p.location && (
          <p
            className="muted"
            style={{ color: textColor }}
          >
            ⌖ {p.location}
          </p>
        )}

        {p.phone && (
          <p
            className="muted"
            dir="ltr"
            style={{ color: textColor }}
          >
            {p.phone}
          </p>
        )}

        <div className="social-list">
          {links.map((link) => (
            <a
              className="social-link"
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: buttonColor,
                color: textColor,
                borderColor: accent + "66",
              }}
            >
              {link.label}

              <span
                style={{
                  float: "left",
                  color: iconColor,
                }}
              >
                ↗
              </span>
            </a>
          ))}
        </div>

        <p
          className="powered"
          style={{ color: textColor }}
        >
          Made with{" "}
          <span style={{ color: accent }}>
            ϟ LumoCard
          </span>
        </p>
      </article>
    </main>
  );
}
