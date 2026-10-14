import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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
  appearance?: {
    template?: string;
    accent?: string;
    background?: string;
  };
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
};

function safeHref(raw: string) {
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(raw)) return "https://" + raw;
  return "";
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

  if (profile.subscription_status === "trial" && profile.trial_started_at) {
    const startedAt = new Date(profile.trial_started_at).getTime();

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

export default async function PublicCard({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing public Supabase environment variables");
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

  if (error || !data) notFound();

  const p = data as Profile;

  if (!hasAccess(p)) {
    notFound();
  }

  const links = Object.entries(p.social_links || {})
    .map(([k, v]) => ({
      key: k,
      label: labels[k] || k,
      url: typeof v === "string" ? safeHref(v) : "",
    }))
    .filter((x) => x.url);

  if (
    p.website &&
    safeHref(p.website) &&
    !links.some((l) => l.url === safeHref(p.website!))
  ) {
    links.push({
      key: "website",
      label: "Website",
      url: safeHref(p.website),
    });
  }

  const accent = p.appearance?.accent || "#8b20ff";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "1px 0",
        background: "radial-gradient(ellipse at top,#1b1030,#07070c 60%)",
        ["--card-accent" as string]: accent,
      }}
    >
      <article
        className="public-profile"
        style={{ borderColor: accent + "99" }}
      >
        <div className="preview-top">
          <Link className="brand" href="/">
            ϟ Lumo<span>Card</span>
          </Link>
          <span className="pill">
            {(p.appearance?.template || "personal").toUpperCase()}
          </span>
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
        {p.phone && <p className="muted" dir="ltr">{p.phone}</p>}

        <div className="social-list">
          {links.map((l) => (
            <a
              className="social-link"
              key={l.key}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {l.label}
              <span style={{ float: "left", color: accent }}>↗</span>
            </a>
          ))}
        </div>

        <p className="powered">
          Made with <span style={{ color: accent }}>ϟ LumoCard</span>
        </p>
      </article>
    </main>
  );
}
