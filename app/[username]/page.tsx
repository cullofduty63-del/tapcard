import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type PhoneItem = { id?: string; title?: string; number: string };
type CustomLink = { id?: string; title: string; url: string };
type Profile = {
  username: string;
  full_name: string;
  job?: string | null;
  bio?: string | null;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  social_links?: Record<string, any> | null;
  appearance?: {
    template?: string;
    accent?: string;
    textColor?: string;
    buttonColor?: string;
    backgroundType?: "solid" | "gradient" | "image" | "texture";
    background?: string;
    gradientStart?: string;
    gradientEnd?: string;
    backgroundImage?: string;
    backgroundPreset?: string;
    radius?: number;
    backgroundMode?: string;
    backgroundColor?: string;
    backgroundColor2?: string;
    texture?: string;
  } | null;
};

const labels: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  whatsapp_business: "WhatsApp Business",
  website: "Website",
  email: "Email",
  phone: "Phone",
  sms: "SMS",
  tiktok: "TikTok",
  x: "X / Twitter",
  facebook: "Facebook",
  threads: "Threads",
  discord: "Discord",
  github: "GitHub",
  linkedin: "LinkedIn",
  aparat: "Aparat",
  rubika: "Rubika",
  eitaa: "Eitaa",
  bale: "Bale",
};

const TEXTURES: Record<string, string> = {
  marble:
    "radial-gradient(ellipse at 20% 20%,rgba(255,255,255,.12),transparent 35%),repeating-linear-gradient(125deg,transparent 0 35px,rgba(255,255,255,.04) 36px 38px),linear-gradient(135deg,#111827,#292536)",
  galaxy:
    "radial-gradient(circle at 20% 30%,#a855f7 0 1px,transparent 2px),radial-gradient(circle at 70% 60%,#fff 0 1px,transparent 2px),radial-gradient(ellipse at 70% 20%,#6d28d9,transparent 50%),linear-gradient(135deg,#09051c,#160c36)",
  gold:
    "radial-gradient(ellipse at top right,rgba(212,175,55,.25),transparent 45%),repeating-linear-gradient(135deg,transparent 0 45px,rgba(212,175,55,.08) 46px 48px),linear-gradient(135deg,#050505,#262016)",
  wood:
    "repeating-linear-gradient(5deg,rgba(255,255,255,.025) 0 2px,transparent 3px 12px),linear-gradient(135deg,#24150E,#674329)",
  emerald:
    "radial-gradient(ellipse at 25% 20%,rgba(52,211,153,.24),transparent 50%),repeating-linear-gradient(120deg,transparent 0 40px,rgba(255,255,255,.035) 41px 43px),linear-gradient(135deg,#03150F,#064E3B)",
  cyberpunk:
    "linear-gradient(rgba(217,70,239,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.08) 1px,transparent 1px),linear-gradient(135deg,#10051D,#090F22)",
  crystal:
    "radial-gradient(ellipse at 15% 15%,rgba(165,243,252,.3),transparent 38%),linear-gradient(135deg,transparent 45%,rgba(255,255,255,.08) 46% 47%,transparent 48%),linear-gradient(45deg,transparent 55%,rgba(165,243,252,.1) 56% 57%,transparent 58%),linear-gradient(135deg,#071827,#164e63)",
  neon:
    "radial-gradient(ellipse at 20% 20%,rgba(217,70,239,.35),transparent 40%),radial-gradient(ellipse at 85% 80%,rgba(34,211,238,.25),transparent 40%),linear-gradient(135deg,#090014,#160b2c)",
};

function safeHref(raw: string) {
  const value = raw.trim();
  if (/^(https?:\/\/|mailto:|tel:|sms:)/i.test(value)) return value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  if (/^\+?[0-9()\-\s]{7,}$/.test(value)) {
    return `tel:${value.replace(/[^\d+]/g, "")}`;
  }
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return `https://${value}`;
  return "";
}

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export default async function PublicCard({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) throw new Error("Missing public Supabase environment variables");

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client
    .from("profiles")
    .select(
      "username,full_name,job,bio,phone,website,location,avatar_url,social_links,appearance",
    )
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error || !data) notFound();

  const p = data as Profile;
  const socialLinks = p.social_links || {};
  const phones: PhoneItem[] = Array.isArray(socialLinks.phones)
    ? socialLinks.phones.filter(
        (item: any) =>
          item && typeof item.number === "string" && item.number.trim(),
      )
    : p.phone
      ? [{ title: "تماس با من", number: p.phone }]
      : [];
  const customLinks: CustomLink[] = Array.isArray(socialLinks.customLinks)
    ? socialLinks.customLinks.filter(
        (item: any) =>
          item &&
          typeof item.title === "string" &&
          typeof item.url === "string" &&
          item.url.trim(),
      )
    : [];

  const links = Object.entries(socialLinks)
    .filter(
      ([key, value]) =>
        !["phones", "customLinks"].includes(key) &&
        typeof value === "string" &&
        value.trim(),
    )
    .map(([key, value]) => ({
      key,
      label: labels[key] || key.replace(/[_-]/g, " "),
      url: safeHref(value as string),
    }))
    .filter((item) => item.url);

  if (
    p.website &&
    safeHref(p.website) &&
    !links.some((item) => item.url === safeHref(p.website!))
  ) {
    links.push({
      key: "website",
      label: "Website",
      url: safeHref(p.website),
    });
  }

  const appearance = p.appearance || {};
  const accent = appearance.accent || "#8b20ff";
  const textColor = appearance.textColor || "#FFFFFF";
  const buttonColor = appearance.buttonColor || "#252538";
  const template = appearance.template || "personal";
  const radius = Math.min(32, Math.max(0, appearance.radius ?? 18));

  const theme: Record<
    string,
    { background: string; card: string; label: string }
  > = {
    personal: {
      background: "radial-gradient(ellipse at top,#1b1030,#07070c 60%)",
      card: "rgba(12,10,20,.92)",
      label: "PERSONAL",
    },
    business: {
      background: "linear-gradient(145deg,#07111f,#101c2c 55%,#05080d)",
      card: "#0d1725",
      label: "BUSINESS",
    },
    designer: {
      background: "linear-gradient(135deg,#21132b,#0b0b12 60%,#321b35)",
      card: "linear-gradient(145deg,#17101f,#0d0b12)",
      label: "DESIGNER",
    },
    developer: {
      background: "radial-gradient(circle at top,#102a2b,#05090d 65%)",
      card: "#071214",
      label: "DEVELOPER",
    },
    creator: {
      background: "linear-gradient(135deg,#260c20,#110a1e 55%,#25102c)",
      card: "linear-gradient(150deg,#1c1022,#100b16)",
      label: "CREATOR",
    },
    shop: {
      background: "linear-gradient(145deg,#20170a,#0b0a08 65%)",
      card: "#15110b",
      label: "SHOP",
    },
    cafe: {
      background: "linear-gradient(145deg,#2c1c13,#0c0907 65%)",
      card: "#19110d",
      label: "CAFE",
    },
  };

  const selectedTheme = theme[template] || theme.personal;
  const backgroundType =
    appearance.backgroundType ||
    (appearance.backgroundMode === "texture"
      ? "texture"
      : appearance.backgroundMode === "image"
        ? "image"
        : "gradient");
  const backgroundColor = appearance.background || appearance.backgroundColor || "#10101A";
  const gradientStart =
    appearance.gradientStart || appearance.backgroundColor || "#17172B";
  const gradientEnd =
    appearance.gradientEnd || appearance.backgroundColor2 || "#43216D";
  const backgroundPreset = appearance.backgroundPreset || appearance.texture || "galaxy";

  let cardBackground = selectedTheme.card;
  if (backgroundType === "solid") cardBackground = backgroundColor;
  if (backgroundType === "gradient") {
    cardBackground = `linear-gradient(135deg,${gradientStart},${gradientEnd})`;
  }
  if (backgroundType === "texture") {
    cardBackground = TEXTURES[backgroundPreset] || TEXTURES.galaxy;
  }
  if (backgroundType === "image" && appearance.backgroundImage) {
    cardBackground = `linear-gradient(135deg,rgba(0,0,0,.28),rgba(0,0,0,.58)),url("${appearance.backgroundImage}") center/cover`;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "1px 0",
        background: selectedTheme.background,
        ["--card-accent" as string]: accent,
        ["--card-button" as string]: buttonColor,
      } as CSSProperties}
    >
      <article
        className={`public-profile template-${template}`}
        style={{
          borderColor: `${accent}99`,
          background: cardBackground,
          borderRadius: `${radius}px`,
          color: textColor,
          boxShadow: "0 20px 70px #0008",
        }}
      >
        <div className="preview-top">
          <Link className="brand" href="/">
            ϟ Lumo<span>Card</span>
          </Link>
          <span className="pill">{selectedTheme.label}</span>
        </div>

        <div
          className="public-avatar"
          style={{ border: `2px solid ${accent}` }}
        >
          {p.avatar_url ? (
            <img src={p.avatar_url} alt="تصویر پروفایل" />
          ) : (
            (p.full_name || p.username).slice(0, 2)
          )}
        </div>

        <h1>{p.full_name || p.username}</h1>
        {p.job && <p className="public-job">{p.job}</p>}
        {p.bio && <p className="public-bio">{p.bio}</p>}
        {p.location && <p className="muted">⌖ {p.location}</p>}

        <div className="social-list">
          {phones.map((phone, index) => (
            <a
              className="social-link"
              key={phone.id || `${phone.number}-${index}`}
              href={`tel:${cleanPhone(phone.number)}`}
              style={{ borderColor: `${accent}66` }}
            >
              <span>☎ {phone.title || "تماس با من"}</span>
              <span style={{ float: "left", color: accent }}>↗</span>
            </a>
          ))}

          {links.map((link) => (
            <a
              className="social-link"
              key={link.key}
              href={link.url}
              target={/^(tel:|mailto:|sms:)/i.test(link.url) ? undefined : "_blank"}
              rel={/^(tel:|mailto:|sms:)/i.test(link.url) ? undefined : "noopener noreferrer"}
              style={{ borderColor: `${accent}66` }}
            >
              <span>{link.label}</span>
              <span style={{ float: "left", color: accent }}>↗</span>
            </a>
          ))}

          {customLinks.map((link, index) => {
            const href = safeHref(link.url);
            if (!href) return null;
            return (
              <a
                className="social-link"
                key={link.id || `${link.title}-${index}`}
                href={href}
                target={/^(tel:|mailto:|sms:)/i.test(href) ? undefined : "_blank"}
                rel={/^(tel:|mailto:|sms:)/i.test(href) ? undefined : "noopener noreferrer"}
                style={{ borderColor: `${accent}66` }}
              >
                <span>↗ {link.title}</span>
                <span style={{ float: "left", color: accent }}>↗</span>
              </a>
            );
          })}
        </div>

        <p className="powered">
          Made with <span style={{ color: accent }}>ϟ LumoCard</span>
        </p>
      </article>
    </main>
  );
}
