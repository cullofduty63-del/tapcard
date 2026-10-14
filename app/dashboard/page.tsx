"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Appearance = {
  template?: string;
  background?: string;
  backgroundType?: "solid" | "gradient" | "texture" | "image";
  backgroundColor?: string;
  backgroundEndColor?: string;
  backgroundImage?: string;
  texture?: "marble" | "stars" | "noise";
  accent?: string;
  accentColor?: string;
  textColor?: string;
  buttonColor?: string;
  iconColor?: string;
  animation?: "none" | "float" | "glow";
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
  social_links?: Record<string, string>;
  appearance?: Appearance;
};

type AppItem = {
  id: string;
  name: string;
  icon: string;
  base: string;
};

const templates = [
  ["personal", "شخصی"],
  ["business", "کسب‌وکار"],
  ["designer", "طراح گرافیک"],
  ["developer", "برنامه‌نویس"],
  ["creator", "تولید محتوا"],
  ["shop", "فروشگاه"],
  ["cafe", "کافه"],
];

const themes = [
  {
    id: "black",
    name: "مشکی مینیمال",
    backgroundColor: "#080808",
    accent: "#ffffff",
    textColor: "#ffffff",
    buttonColor: "#242424",
    iconColor: "#ffffff",
  },
  {
    id: "gold",
    name: "مشکی طلایی",
    backgroundColor: "#100d08",
    accent: "#d4af37",
    textColor: "#fff8e7",
    buttonColor: "#292013",
    iconColor: "#d4af37",
  },
  {
    id: "white",
    name: "سفید مینیمال",
    backgroundColor: "#f5f5f5",
    accent: "#222222",
    textColor: "#171717",
    buttonColor: "#e5e5e5",
    iconColor: "#222222",
  },
  {
    id: "purple",
    name: "بنفش نئونی",
    backgroundColor: "#10071f",
    accent: "#a855f7",
    textColor: "#ffffff",
    buttonColor: "#28133e",
    iconColor: "#c084fc",
  },
  {
    id: "ocean",
    name: "آبی اقیانوسی",
    backgroundColor: "#071522",
    accent: "#38bdf8",
    textColor: "#f0f9ff",
    buttonColor: "#102b40",
    iconColor: "#38bdf8",
  },
  {
    id: "emerald",
    name: "سبز زمردی",
    backgroundColor: "#07140f",
    accent: "#34d399",
    textColor: "#ecfdf5",
    buttonColor: "#123126",
    iconColor: "#34d399",
  },
  {
    id: "rose",
    name: "صورتی",
    backgroundColor: "#1b0b13",
    accent: "#fb7185",
    textColor: "#fff1f2",
    buttonColor: "#351521",
    iconColor: "#fb7185",
  },
  {
    id: "silver",
    name: "نقره‌ای",
    backgroundColor: "#17191e",
    accent: "#cbd5e1",
    textColor: "#f8fafc",
    buttonColor: "#2c3038",
    iconColor: "#e2e8f0",
  },
];

/*
 * فهرست کامل اپلیکیشن‌ها
 * این آرایه را با نسخه اصلی خودت حفظ کن.
 */
const apps: AppItem[] = [
  { id: "instagram", name: "Instagram", icon: "📸", base: "https://instagram.com/" },
  { id: "telegram", name: "Telegram", icon: "✈️", base: "https://t.me/" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", base: "https://wa.me/" },
  { id: "youtube", name: "YouTube", icon: "▶️", base: "https://youtube.com/@" },
  { id: "tiktok", name: "TikTok", icon: "🎵", base: "https://tiktok.com/@" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", base: "https://linkedin.com/in/" },
  { id: "x", name: "X", icon: "𝕏", base: "https://x.com/" },
  { id: "facebook", name: "Facebook", icon: "📘", base: "https://facebook.com/" },
  { id: "snapchat", name: "Snapchat", icon: "👻", base: "https://snapchat.com/add/" },
  { id: "twitch", name: "Twitch", icon: "🎮", base: "https://twitch.tv/" },
  { id: "discord", name: "Discord", icon: "🎧", base: "" },
  { id: "reddit", name: "Reddit", icon: "🟠", base: "https://reddit.com/u/" },
  { id: "pinterest", name: "Pinterest", icon: "📌", base: "https://pinterest.com/" },
  { id: "threads", name: "Threads", icon: "🧵", base: "https://threads.net/@" },
  { id: "threadsapp", name: "Threads profile", icon: "🧵", base: "https://threads.net/@" },
  { id: "github", name: "GitHub", icon: "💻", base: "https://github.com/" },
  { id: "gitlab", name: "GitLab", icon: "🦊", base: "https://gitlab.com/" },
  { id: "behance", name: "Behance", icon: "🎨", base: "https://behance.net/" },
  { id: "dribbble", name: "Dribbble", icon: "🏀", base: "https://dribbble.com/" },
  { id: "medium", name: "Medium", icon: "📝", base: "https://medium.com/@" },
  { id: "wordpress", name: "WordPress", icon: "🌐", base: "https://wordpress.com/" },
  { id: "tumblr", name: "Tumblr", icon: "📓", base: "https://tumblr.com/" },
  { id: "vimeo", name: "Vimeo", icon: "🎬", base: "https://vimeo.com/" },
  { id: "dailymotion", name: "Dailymotion", icon: "🎞️", base: "https://dailymotion.com/" },
  { id: "spotify", name: "Spotify", icon: "🎧", base: "https://open.spotify.com/user/" },
  { id: "soundcloud", name: "SoundCloud", icon: "🎼", base: "https://soundcloud.com/" },
  { id: "bandcamp", name: "Bandcamp", icon: "🎸", base: "https://bandcamp.com/" },
  { id: "applemusic", name: "Apple Music", icon: "🎵", base: "" },
  { id: "deezer", name: "Deezer", icon: "🎶", base: "https://deezer.com/" },
  { id: "mixcloud", name: "Mixcloud", icon: "🎚️", base: "https://mixcloud.com/" },
  { id: "telegramchannel", name: "Telegram Channel", icon: "📣", base: "https://t.me/" },
  { id: "whatsappchannel", name: "WhatsApp Channel", icon: "📢", base: "" },
  { id: "kick", name: "Kick", icon: "🟢", base: "https://kick.com/" },
  { id: "rumble", name: "Rumble", icon: "🎥", base: "https://rumble.com/" },
  { id: "odysee", name: "Odysee", icon: "📺", base: "https://odysee.com/@" },
  { id: "patreon", name: "Patreon", icon: "❤️", base: "https://patreon.com/" },
  { id: "ko-fi", name: "Ko-fi", icon: "☕", base: "https://ko-fi.com/" },
  { id: "buymeacoffee", name: "Buy Me a Coffee", icon: "☕", base: "https://buymeacoffee.com/" },
  { id: "substack", name: "Substack", icon: "📰", base: "https://substack.com/@" },
  { id: "producthunt", name: "Product Hunt", icon: "🚀", base: "https://producthunt.com/@/" },
  { id: "stackoverflow", name: "Stack Overflow", icon: "🧩", base: "https://stackoverflow.com/users/" },
  { id: "codepen", name: "CodePen", icon: "🖊️", base: "https://codepen.io/" },
  { id: "replit", name: "Replit", icon: "🧑‍💻", base: "https://replit.com/@" },
  { id: "huggingface", name: "Hugging Face", icon: "🤗", base: "https://huggingface.co/" },
  { id: "kaggle", name: "Kaggle", icon: "📊", base: "https://kaggle.com/" },
  { id: "devto", name: "DEV Community", icon: "👨‍💻", base: "https://dev.to/" },
  { id: "hackernoon", name: "HackerNoon", icon: "🟩", base: "https://hackernoon.com/u/" },
  { id: "goodreads", name: "Goodreads", icon: "📚", base: "https://goodreads.com/" },
  { id: "letterboxd", name: "Letterboxd", icon: "🎬", base: "https://letterboxd.com/" },
  { id: "imdb", name: "IMDb", icon: "🎞️", base: "https://imdb.com/name/" },
  { id: "tiktokshop", name: "TikTok Shop", icon: "🛍️", base: "" },
  { id: "etsy", name: "Etsy", icon: "🧶", base: "https://etsy.com/shop/" },
  { id: "amazon", name: "Amazon", icon: "📦", base: "" },
  { id: "ebay", name: "eBay", icon: "🛒", base: "" },
  { id: "shopify", name: "Shopify Store", icon: "🛍️", base: "" },
  { id: "opensea", name: "OpenSea", icon: "🌊", base: "https://opensea.io/" },
  { id: "behanceportfolio", name: "Portfolio", icon: "🗂️", base: "" },
  { id: "flickr", name: "Flickr", icon: "📷", base: "https://flickr.com/people/" },
  { id: "500px", name: "500px", icon: "📸", base: "https://500px.com/p/" },
  { id: "unsplash", name: "Unsplash", icon: "🌄", base: "https://unsplash.com/@" },
  { id: "pexels", name: "Pexels", icon: "📷", base: "https://pexels.com/@" },
  { id: "deviantart", name: "DeviantArt", icon: "🖌️", base: "https://deviantart.com/" },
  { id: "artstation", name: "ArtStation", icon: "🖼️", base: "https://artstation.com/" },
  { id: "figma", name: "Figma", icon: "🎨", base: "https://figma.com/@/" },
  { id: "canva", name: "Canva", icon: "🪄", base: "https://canva.com/" },
  { id: "telegrambot", name: "Telegram Bot", icon: "🤖", base: "https://t.me/" },
  { id: "rubika", name: "روبیکا", icon: "🇮🇷", base: "https://rubika.ir/" },
  { id: "eitaa", name: "ایتا", icon: "🇮🇷", base: "https://eitaa.com/" },
  { id: "bale", name: "بله", icon: "🇮🇷", base: "https://ble.ir/" },
  { id: "soroush", name: "سروش پلاس", icon: "🇮🇷", base: "https://splus.ir/" },
  { id: "igap", name: "آی‌گپ", icon: "🇮🇷", base: "https://igap.net/" },
  { id: "gap", name: "گپ", icon: "🇮🇷", base: "https://gap.im/" },
  { id: "virasty", name: "ویراستی", icon: "🇮🇷", base: "https://virasty.com/" },
  { id: "bisphone", name: "بیسفون", icon: "🇮🇷", base: "" },
  { id: "shad", name: "شاد", icon: "🇮🇷", base: "https://shad.ir/" },
  { id: "taaghche", name: "طاقچه", icon: "📚", base: "https://taaghche.com/" },
  { id: "fidibo", name: "فیدیبو", icon: "📖", base: "https://fidibo.com/" },
  { id: "ketabrah", name: "کتابراه", icon: "📚", base: "https://ketabrah.ir/" },
  { id: "aparat", name: "آپارات", icon: "🇮🇷", base: "https://aparat.com/" },
  { id: "namasha", name: "نماشا", icon: "🇮🇷", base: "https://namasha.com/" },
  { id: "tamasha", name: "تماشا", icon: "🇮🇷", base: "" },
  { id: "filimo", name: "فیلیمو", icon: "🎬", base: "https://filimo.com/" },
  { id: "namava", name: "نماوا", icon: "🎬", base: "https://namava.ir/" },
  { id: "filmnet", name: "فیلم‌نت", icon: "🎥", base: "https://filmnet.ir/" },
  { id: "digikala", name: "دیجی‌کالا", icon: "🛍️", base: "https://digikala.com/" },
  { id: "torob", name: "ترب", icon: "🛒", base: "https://torob.com/" },
  { id: "basalam", name: "باسلام", icon: "🛍️", base: "https://basalam.com/" },
  { id: "snapp", name: "اسنپ", icon: "🚕", base: "https://snapp.ir/" },
  { id: "tapsi", name: "تپسی", icon: "🚖", base: "https://tapsi.ir/" },
  { id: "divar", name: "دیوار", icon: "🧱", base: "https://divar.ir/" },
  { id: "sheypoor", name: "شیپور", icon: "📣", base: "https://sheypoor.com/" },
  { id: "cafebazaar", name: "کافه‌بازار", icon: "🛒", base: "https://cafebazaar.ir/" },
  { id: "myket", name: "مایکت", icon: "📱", base: "https://myket.ir/" },
  { id: "zarinpal", name: "زرین‌پال", icon: "💳", base: "https://zarinpal.com/" },
  { id: "idpay", name: "آیدی‌پی", icon: "💳", base: "https://idpay.ir/" },
  { id: "nextpay", name: "نکست‌پی", icon: "💳", base: "https://nextpay.org/" },
  { id: "zibal", name: "زیبال", icon: "💳", base: "https://zibal.ir/" },
  { id: "neshan", name: "نشان", icon: "🗺️", base: "https://neshan.org/" },
  { id: "balad", name: "بلد", icon: "🧭", base: "https://balad.ir/" },
  { id: "cafebazaarapp", name: "کافه‌بازار توسعه‌دهنده", icon: "📱", base: "" },
  { id: "virgool", name: "ویرگول", icon: "✍️", base: "https://virgool.io/" },
  { id: "virgoolprofile", name: "ویرگول نویسنده", icon: "📝", base: "https://virgool.io/@" },
  { id: "limo", name: "لینک دلخواه", icon: "🔗", base: "" },
  { id: "website2", name: "وب‌سایت دوم", icon: "🌐", base: "" },
  { id: "email", name: "ایمیل", icon: "✉️", base: "mailto:" },
  { id: "phone", name: "تماس تلفنی", icon: "☎️", base: "tel:" },
  { id: "sms", name: "پیامک", icon: "💬", base: "sms:" },
  { id: "maps", name: "Google Maps", icon: "📍", base: "" },
  { id: "calendly", name: "Calendly", icon: "📅", base: "https://calendly.com/" },
  { id: "linktree", name: "Linktree", icon: "🌳", base: "https://linktr.ee/" },
  { id: "beacons", name: "Beacons", icon: "🔗", base: "https://beacons.ai/" },
  { id: "aboutme", name: "About.me", icon: "👤", base: "https://about.me/" },
  { id: "threads2", name: "Threads Creator", icon: "🧵", base: "" },
  { id: "mastodon", name: "Mastodon", icon: "🐘", base: "" },
  { id: "bluesky", name: "Bluesky", icon: "🦋", base: "https://bsky.app/profile/" },
  { id: "truthsocial", name: "Truth Social", icon: "🗣️", base: "https://truthsocial.com/@" },
  { id: "quora", name: "Quora", icon: "❓", base: "https://quora.com/profile/" },
  { id: "researchgate", name: "ResearchGate", icon: "🔬", base: "https://researchgate.net/profile/" },
  { id: "academia", name: "Academia.edu", icon: "🎓", base: "https://independent.academia.edu/" },
  { id: "orcid", name: "ORCID", icon: "🧑‍🔬", base: "https://orcid.org/" },
  { id: "googleplay", name: "Google Play", icon: "▶️", base: "" },
  { id: "appstore", name: "App Store", icon: "🍎", base: "" },
  { id: "telegrammini", name: "Telegram Mini App", icon: "📲", base: "" },
  { id: "line", name: "LINE", icon: "💚", base: "https://line.me/" },
  { id: "kakao", name: "KakaoTalk", icon: "💛", base: "" },
  { id: "wechat", name: "WeChat", icon: "💬", base: "" },
  { id: "viber", name: "Viber", icon: "📞", base: "" },
  { id: "skype", name: "Skype", icon: "📞", base: "https://join.skype.com/" },
  { id: "signal", name: "Signal", icon: "🔐", base: "" },
  { id: "meet", name: "Google Meet", icon: "📹", base: "" },
  { id: "zoom", name: "Zoom", icon: "📹", base: "" },
  { id: "teams", name: "Microsoft Teams", icon: "👥", base: "" },
  { id: "slack", name: "Slack", icon: "💬", base: "" },
  { id: "notion", name: "Notion", icon: "📓", base: "https://notion.site/" },
  { id: "trello", name: "Trello", icon: "📋", base: "https://trello.com/" },
  { id: "figjam", name: "FigJam", icon: "🖍️", base: "" },
  { id: "google", name: "Google", icon: "🔎", base: "" },
  { id: "mediumpub", name: "Medium Publication", icon: "📰", base: "" },
  { id: "kickstarter", name: "Kickstarter", icon: "🚀", base: "https://kickstarter.com/profile/" },
  { id: "indiegogo", name: "Indiegogo", icon: "💡", base: "https://indiegogo.com/" },
  { id: "gofundme", name: "GoFundMe", icon: "❤️", base: "https://gofundme.com/" },
  { id: "paypal", name: "PayPal", icon: "💳", base: "" },
  { id: "cashapp", name: "Cash App", icon: "💵", base: "" },
  { id: "venmo", name: "Venmo", icon: "💸", base: "" },
  { id: "wise", name: "Wise", icon: "💱", base: "" },
  { id: "revolut", name: "Revolut", icon: "💳", base: "" },
  { id: "telegramgroup", name: "Telegram Group", icon: "👥", base: "https://t.me/" },
  { id: "instagrambroadcast", name: "Instagram Channel", icon: "📣", base: "" },
  { id: "facebookpage", name: "Facebook Page", icon: "📘", base: "https://facebook.com/" },
  { id: "linkedincompany", name: "LinkedIn Company", icon: "🏢", base: "https://linkedin.com/company/" },
  { id: "youtubechannel", name: "YouTube Channel", icon: "📺", base: "https://youtube.com/@" },
  { id: "spotifyartist", name: "Spotify Artist", icon: "🎤", base: "" },
  { id: "soundcloudartist", name: "SoundCloud Artist", icon: "🎧", base: "https://soundcloud.com/" },
  { id: "discordserver", name: "Discord Server", icon: "🎮", base: "" },
  { id: "whatsappbusiness", name: "WhatsApp Business", icon: "💼", base: "https://wa.me/" },
];

const knownFields = [
  "instagram",
  "telegram",
  "whatsapp",
  "youtube",
  "website",
];

function validColor(value: string | undefined, fallback: string): string {
  return value && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : fallback;
}

function makeAppUrl(app: AppItem, input: string): string {
  const value = input.trim();

  if (!value) return "";

  if (/^(https?:\/\/|mailto:|tel:|sms:)/i.test(value)) {
    return value;
  }

  if (
    !app.base ||
    app.base.startsWith("mailto:") ||
    app.base.startsWith("tel:") ||
    app.base.startsWith("sms:")
  ) {
    return "";
  }

  return (
    app.base +
    value.replace(/^@/, "").replace(/^\/+/, "")
  );
}

function normalizeLink(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (/^(https?:\/\/|mailto:|tel:|sms:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getInitialAppearance(data: any): Appearance {
  const saved = data?.appearance || {};

  return {
    template: saved.template || "personal",
    background: saved.background || "purple",
    backgroundType: saved.backgroundType || "solid",
    backgroundColor: validColor(
      saved.backgroundColor,
      "#10071f",
    ),
    backgroundEndColor: validColor(
      saved.backgroundEndColor,
      "#28133e",
    ),
    backgroundImage: saved.backgroundImage || "",
    texture: saved.texture || "stars",
    accent: validColor(saved.accent, "#a855f7"),
    textColor: validColor(saved.textColor, "#ffffff"),
    buttonColor: validColor(saved.buttonColor, "#28133e"),
    iconColor: validColor(saved.iconColor, "#c084fc"),
    animation: saved.animation || "none",
  };
}
export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState("instagram");
  const [appInput, setAppInput] = useState("");
  const [appLinks, setAppLinks] = useState<Record<string, string>>({});
  const [appearance, setAppearance] = useState<Appearance>({
    template: "personal",
    background: "purple",
    backgroundType: "solid",
    backgroundColor: "#10071f",
    backgroundEndColor: "#28133e",
    accent: "#a855f7",
    textColor: "#ffffff",
    buttonColor: "#28133e",
    iconColor: "#c084fc",
    texture: "stars",
    animation: "none",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (profileError) {
          setError(
            "خواندن پروفایل ناموفق بود؛ دسترسی جدول profiles را بررسی کن.",
          );
          setBusy(false);
          return;
        }

        if (!data) {
          setError("پروفایل این حساب پیدا نشد.");
          setBusy(false);
          return;
        }

        const loadedAppearance = getInitialAppearance(data);

        setProfile({
          ...data,
          social_links: data.social_links || {},
          appearance: loadedAppearance,
        });

        setAppearance(loadedAppearance);
        setAppLinks(data.social_links || {});
        setBusy(false);
      } catch (err) {
        console.error("Profile loading error:", err);

        if (!cancelled) {
          setError("بارگذاری پروفایل با مشکل مواجه شد.");
          setBusy(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return apps;

    return apps.filter((app) =>
      `${app.name} ${app.id}`.toLowerCase().includes(q),
    );
  }, [search]);

  function applyTheme(themeId: string) {
    const theme = themes.find((item) => item.id === themeId);

    if (!theme) return;

    setAppearance((current) => ({
      ...current,
      template: current.template || "personal",
      background: theme.id,
      backgroundType: "solid",
      backgroundColor: theme.backgroundColor,
      accent: theme.accent,
      textColor: theme.textColor,
      buttonColor: theme.buttonColor,
      iconColor: theme.iconColor,
    }));
  }

  function updateAppearance(patch: Partial<Appearance>) {
    setAppearance((current) => ({
      ...current,
      ...patch,
    }));
  }

  function addApp() {
    const app = apps.find((item) => item.id === selectedApp);

    if (!app) {
      setError("ابتدا یک اپلیکیشن انتخاب کن.");
      return;
    }

    const url = makeAppUrl(app, appInput);

    if (!url) {
      setError(
        "برای این اپ لینک کامل https:// وارد کن؛ یا یوزرنیم معتبر بنویس.",
      );
      return;
    }

    setError("");

    setAppLinks((current) => ({
      ...current,
      [app.id]: url,
    }));

    setAppInput("");
    setMessage(`${app.name} اضافه شد. برای ثبت نهایی، ذخیره تغییرات را بزن.`);
  }

  function removeApp(id: string) {
    setAppLinks((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    setMessage("لینک از فهرست حذف شد؛ برای ثبت نهایی ذخیره تغییرات را بزن.");
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!profile || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const form = new FormData(e.currentTarget);

      const username = String(form.get("username") || "")
        .trim()
        .toLowerCase();

      if (!/^[a-z0-9_-]{3,24}$/.test(username)) {
        setError(
          "آدرس باید ۳ تا ۲۴ کاراکتر انگلیسی، عدد، _ یا - باشد.",
        );
        return;
      }

      const fullName = String(form.get("full_name") || "").trim();

      if (!fullName) {
        setError("لطفاً نام خودت را وارد کن.");
        return;
      }

      const socialLinks: Record<string, string> = {
        ...appLinks,
      };

      for (const key of knownFields) {
        const value = String(form.get(key) || "").trim();

        if (value) {
          socialLinks[key] = normalizeLink(value);
        } else if (key !== "website") {
          delete socialLinks[key];
        }
      }

      const socialWebsite = String(
        form.get("social_website") || "",
      ).trim();

      if (socialWebsite) {
        socialLinks.website = normalizeLink(socialWebsite);
      } else if (!String(form.get("website") || "").trim()) {
        delete socialLinks.website;
      }

      const updatedAppearance: Appearance = {
        ...appearance,
        template: appearance.template || "personal",
        background: appearance.background || "purple",
        backgroundType: appearance.backgroundType || "solid",
        backgroundColor: validColor(
          appearance.backgroundColor,
          "#10071f",
        ),
        backgroundEndColor: validColor(
          appearance.backgroundEndColor,
          "#28133e",
        ),
        accent: validColor(appearance.accent, "#a855f7"),
        textColor: validColor(appearance.textColor, "#ffffff"),
        buttonColor: validColor(
          appearance.buttonColor,
          "#28133e",
        ),
        iconColor: validColor(appearance.iconColor, "#c084fc"),
        animation: appearance.animation || "none",
      };

      const updated = {
        id: profile.id,
        username,
        full_name: fullName,
        job: String(form.get("job") || "").trim(),
        bio: String(form.get("bio") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        website: normalizeLink(
          String(form.get("website") || ""),
        ),
        location: String(form.get("location") || "").trim(),
        social_links: socialLinks,
        appearance: updatedAppearance,
        updated_at: new Date().toISOString(),
      };

      if (username !== profile.username) {
        const {
          data: existing,
          error: checkError,
        } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", profile.id)
          .maybeSingle();

        if (checkError) {
          console.error("Username check error:", checkError);
          setError("بررسی آدرس ناموفق بود؛ دسترسی جدول را بررسی کن.");
          return;
        }

        if (existing) {
          setError("این آدرس قبلاً گرفته شده است.");
          return;
        }
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .upsert(updated, { onConflict: "id" });

      if (saveError) {
        console.error("Profile save error:", saveError);
        setError(
          "ذخیره ناموفق بود؛ ستون‌های جدول profiles و سیاست‌های RLS را بررسی کن.",
        );
        return;
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              ...updated,
              email: current.email,
              social_links: socialLinks,
              appearance: updatedAppearance,
            }
          : current,
      );

      setAppLinks(socialLinks);
      setAppearance(updatedAppearance);
      setMessage("تغییرات با موفقیت ذخیره شد. 💜");
    } catch (err) {
      console.error("Saving profile error:", err);
      setError("هنگام ذخیره اطلاعات خطای غیرمنتظره‌ای رخ داد.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (busy) {
    return (
      <main className="page-shell">
        <p className="loading">در حال بارگذاری کارت...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page-shell">
        <section className="panel narrow">
          <div className="notice">
            {error || "پروفایل بارگذاری نشد."}
          </div>
          <Link className="button" href="/login">
            بازگشت به ورود
          </Link>
        </section>
      </main>
    );
  }

  const publicUrl = `https://lumocard.ir/${profile.username}`;

  const previewBackground =
    appearance.backgroundType === "gradient"
      ? `linear-gradient(135deg, ${validColor(
          appearance.backgroundColor,
          "#10071f",
        )}, ${validColor(
          appearance.backgroundEndColor,
          "#28133e",
        )})`
      : appearance.backgroundType === "image" &&
          appearance.backgroundImage
        ? `linear-gradient(#0004, #0004), url("${appearance.backgroundImage}") center/cover`
        : validColor(appearance.backgroundColor, "#10071f");

  return (
    <main className="page-shell">
      <div className="container subnav">
        <Link className="brand" href="/">
          ϟ Lumo<span>Card</span>
        </Link>

        <div className="inline-actions">
          <Link
            className="nav-link"
            href={`/${profile.username}`}
            target="_blank"
          >
            نمایش کارت ↗
          </Link>

          <button
            type="button"
            className="danger-link"
            onClick={logout}
          >
            خروج
          </button>
        </div>
      </div>

      <section className="panel">
        <div className="dashboard-header">
          <div>
            <h1>مدیریت کارت تو ✨</h1>
            <p>
              اطلاعات، اپلیکیشن‌ها و ظاهر کارتت رو مدیریت کن.
            </p>
          </div>
        </div>

        {error && <div className="notice">{error}</div>}
        {message && (
          <div className="notice success">{message}</div>
        )}

        <div className="url-box">
          <span dir="ltr">{publicUrl}</span>
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noreferrer"
          >
            باز کردن ↗
          </a>
        </div>

        <form onSubmit={save}>
          <div className="section-card">
            <h2>اطلاعات عمومی</h2>

            <div className="form-grid">
              <div className="field">
                <label>نام</label>
                <input
                  name="full_name"
                  required
                  defaultValue={profile.full_name || ""}
                />
              </div>

              <div className="field">
                <label>آدرس کارت</label>
                <input
                  name="username"
                  required
                  defaultValue={profile.username || ""}
                  pattern="[a-zA-Z0-9_-]+"
                  minLength={3}
                  maxLength={24}
                  dir="ltr"
                />
              </div>

              <div className="field">
                <label>عنوان شغلی</label>
                <input
                  name="job"
                  defaultValue={profile.job || ""}
                  placeholder="Developer & Content Creator"
                />
              </div>

              <div className="field">
                <label>شماره تماس</label>
                <input
                  name="phone"
                  defaultValue={profile.phone || ""}
                  dir="ltr"
                />
              </div>

              <div className="field">
                <label>وب‌سایت اصلی</label>
                <input
                  name="website"
                  defaultValue={profile.website || ""}
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>

              <div className="field">
                <label>موقعیت</label>
                <input
                  name="location"
                  defaultValue={profile.location || ""}
                  placeholder="Tehran, Iran"
                />
              </div>

              <div className="field full">
                <label>بیو</label>
                <textarea
                  name="bio"
                  defaultValue={profile.bio || ""}
                  maxLength={500}
                  placeholder="💜 با تکنولوژی، رویاها واقعی می‌شن"
                />
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2>شبکه‌های اجتماعی پایه</h2>

            <div className="form-grid">
              <div className="field">
                <label>Instagram</label>
                <input
                  name="instagram"
                  defaultValue={profile.social_links?.instagram || ""}
                  dir="ltr"
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div className="field">
                <label>Telegram</label>
                <input
                  name="telegram"
                  defaultValue={profile.social_links?.telegram || ""}
                  dir="ltr"
                  placeholder="https://t.me/username"
                />
              </div>

              <div className="field">
                <label>YouTube</label>
                <input
                  name="youtube"
                  defaultValue={profile.social_links?.youtube || ""}
                  dir="ltr"
                  placeholder="https://youtube.com/@username"
                />
              </div>

              <div className="field">
                <label>WhatsApp</label>
                <input
                  name="whatsapp"
                  defaultValue={profile.social_links?.whatsapp || ""}
                  dir="ltr"
                  placeholder="https://wa.me/..."
                />
              </div>

              <div className="field full">
                <label>لینک اجتماعی دیگر</label>
                <input
                  name="social_website"
                  defaultValue={profile.social_links?.website || ""}
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2>کتابخانه اپلیکیشن‌ها 📱</h2>

            <p className="muted">
              اپلیکیشن رو انتخاب کن، یوزرنیم یا لینک کامل رو وارد
              کن و بعد «افزودن» رو بزن.
            </p>

            <div className="form-grid">
              <div className="field full">
                <label>جست‌وجوی اپلیکیشن</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="مثلاً روبیکا، Instagram، GitHub..."
                />
              </div>

              <div className="field">
                <label>
                  انتخاب اپلیکیشن ({filteredApps.length} مورد)
                </label>

                <select
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                >
                  {filteredApps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.icon} {app.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>یوزرنیم یا لینک</label>
                <input
                  value={appInput}
                  onChange={(e) => setAppInput(e.target.value)}
                  dir="ltr"
                  placeholder="@username یا https://..."
                />
              </div>

              <div className="field full">
                <button
                  type="button"
                  className="button"
                  onClick={addApp}
                >
                  افزودن اپلیکیشن +
                </button>
              </div>
            </div>

            <div className="app-list">
              {Object.entries(appLinks)
                .filter(([, url]) => Boolean(url))
                .map(([id, url]) => {
                  const app = apps.find((item) => item.id === id);

                  return (
                    <div key={id} className="app-row">
                      <span className="app-icon">
                        {app?.icon || "🔗"}
                      </span>

                      <div className="app-row-info">
                        <strong>{app?.name || id}</strong>
                        <small dir="ltr">{url}</small>
                      </div>

                      <button
                        type="button"
                        className="danger-link"
                        onClick={() => removeApp(id)}
                      >
                        حذف
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="section-card">
            <h2>ظاهر کارت 🎨</h2>

            <div className="field">
              <label>قالب شغلی</label>

              <select
                value={appearance.template || "personal"}
                onChange={(e) =>
                  updateAppearance({ template: e.target.value })
                }
              >
                {templates.map(([id, title]) => (
                  <option key={id} value={id}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  className={`theme-option ${
                    appearance.background === theme.id ? "selected" : ""
                  }`}
                  onClick={() => applyTheme(theme.id)}
                >
                  <span
                    className="theme-swatch"
                    style={{
                      background: theme.backgroundColor,
                      borderColor: theme.accent,
                    }}
                  >
                    <span style={{ background: theme.accent }} />
                  </span>

                  <span>{theme.name}</span>
                </button>
              ))}
            </div>

            <div className="form-grid color-grid">
              {([
                ["backgroundColor", "رنگ پس‌زمینه", "#10071f"],
                ["textColor", "رنگ نوشته‌ها", "#ffffff"],
                ["accent", "رنگ اصلی و حاشیه‌ها", "#a855f7"],
                ["buttonColor", "رنگ دکمه‌ها", "#28133e"],
                ["iconColor", "رنگ آیکون‌ها", "#c084fc"],
              ] as const).map(([key, title, fallback]) => (
                <div className="field color-field" key={key}>
                  <label>{title}</label>

                  <div className="color-control">
                    <input
                      type="color"
                      value={validColor(appearance[key], fallback)}
                      onChange={(e) =>
                        updateAppearance({
                          [key]: e.target.value,
                          ...(key === "backgroundColor"
                            ? { background: "custom" }
                            : {}),
                        })
                      }
                      aria-label={title}
                    />

                    <input
                      type="text"
                      value={appearance[key] || fallback}
                      onChange={(e) =>
                        updateAppearance({
                          [key]: e.target.value,
                          ...(key === "backgroundColor"
                            ? { background: "custom" }
                            : {}),
                        })
                      }
                      dir="ltr"
                      maxLength={7}
                      aria-label={`${title} به صورت کد رنگ`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="field">
              <label>نوع پس‌زمینه</label>

              <select
                value={appearance.backgroundType || "solid"}
                onChange={(e) =>
                  updateAppearance({
                    backgroundType: e.target.value as Appearance["backgroundType"],
                  })
                }
              >
                <option value="solid">یک‌رنگ</option>
                <option value="gradient">گرادیانت</option>
                <option value="image">تصویر</option>
              </select>
            </div>

            {appearance.backgroundType === "gradient" && (
              <div className="field">
                <label>رنگ دوم گرادیانت</label>

                <input
                  type="color"
                  value={validColor(
                    appearance.backgroundEndColor,
                    "#28133e",
                  )}
                  onChange={(e) =>
                    updateAppearance({
                      backgroundEndColor: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {appearance.backgroundType === "image" && (
              <div className="field">
                <label>آدرس تصویر پس‌زمینه</label>

                <input
                  value={appearance.backgroundImage || ""}
                  onChange={(e) =>
                    updateAppearance({
                      backgroundImage: e.target.value,
                    })
                  }
                  dir="ltr"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            <div className="field">
              <label>انیمیشن کارت</label>

              <select
                value={appearance.animation || "none"}
                onChange={(e) =>
                  updateAppearance({
                    animation: e.target.value as Appearance["animation"],
                  })
                }
              >
                <option value="none">بدون انیمیشن</option>
                <option value="float">شناور</option>
                <option value="glow">درخشش</option>
              </select>
            </div>

            <div className="preview-wrap">
              <h3>پیش‌نمایش کارت</h3>

              <article
                className={`live-preview animation-${appearance.animation || "none"}`}
                style={{
                  background: previewBackground,
                  color: validColor(appearance.textColor, "#ffffff"),
                  borderColor: validColor(appearance.accent, "#a855f7"),
                }}
              >
                <div
                  className="preview-brand"
                  style={{ color: appearance.accent }}
                >
                  ϟ LumoCard
                </div>

                <div
                  className="preview-avatar"
                  style={{
                    borderColor: appearance.accent,
                    color: appearance.accent,
                  }}
                >
                  {(profile.full_name || profile.username).slice(0, 2)}
                </div>

                <strong>{profile.full_name || "نام شما"}</strong>

                <span>{profile.job || "عنوان شغلی شما"}</span>

                <div
                  className="preview-button"
                  style={{
                    background: appearance.buttonColor,
                    borderColor: appearance.accent,
                  }}
                >
                  <span style={{ color: appearance.iconColor }}>📱</span>
                  <span>شبکه‌های اجتماعی</span>
                  <span style={{ color: appearance.accent }}>↗</span>
                </div>
              </article>

              <small className="muted">
                این پیش‌نمایش تنظیمات کارت را نشان می‌دهد. برای اعمال
                همین ظاهر در صفحه عمومی پروفایل، آن صفحه هم باید
                تنظیمات appearance را بخواند.
              </small>
            </div>
          </div>

          <button className="button form-submit" disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </form>
      </section>

      <style jsx>{`
        .muted {
          display: block;
          opacity: 0.72;
          margin: 8px 0 14px;
          line-height: 1.8;
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
          gap: 10px;
          margin: 18px 0;
        }

        .theme-option {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px;
          border: 1px solid #38333f;
          border-radius: 12px;
          background: transparent;
          color: inherit;
          cursor: pointer;
          text-align: right;
          transition: border-color 0.2s, transform 0.2s;
        }

        .theme-option:hover {
          transform: translateY(-2px);
        }

        .theme-option.selected {
          border-color: #a855f7;
          box-shadow: 0 0 0 1px #a855f7;
        }

        .theme-swatch {
          width: 35px;
          height: 35px;
          border: 2px solid;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }

        .theme-swatch span {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .color-grid {
          margin-top: 20px;
        }

        .color-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-control input[type="color"] {
          width: 48px;
          height: 42px;
          padding: 3px;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .color-control input[type="text"] {
          min-width: 0;
          width: 100%;
        }

        .app-list {
          display: grid;
          gap: 8px;
          margin-top: 18px;
        }

        .app-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid rgba(150, 150, 150, 0.25);
          border-radius: 12px;
          min-width: 0;
        }

        .app-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(140, 80, 220, 0.12);
          flex: 0 0 auto;
          font-size: 20px;
        }

        .app-row-info {
          display: grid;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .app-row-info small {
          overflow-wrap: anywhere;
          opacity: 0.7;
        }

        .preview-wrap {
          margin-top: 24px;
        }

        .live-preview {
          max-width: 340px;
          margin: 14px auto;
          border: 1px solid;
          border-radius: 22px;
          padding: 22px;
          display: grid;
          justify-items: center;
          gap: 12px;
          text-align: center;
          transition: background 0.2s, color 0.2s;
        }

        .preview-brand {
          font-weight: 800;
        }

        .preview-avatar {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border: 2px solid;
          border-radius: 50%;
          font-size: 22px;
        }

        .preview-button {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 1px solid;
          border-radius: 12px;
        }

        .animation-float {
          animation: floatCard 3s ease-in-out infinite;
        }

        .animation-glow {
          animation: glowCard 2s ease-in-out infinite alternate;
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes glowCard {
          from {
            box-shadow: 0 0 5px rgba(168, 85, 247, 0.15);
          }

          to {
            box-shadow: 0 0 24px rgba(168, 85, 247, 0.45);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animation-float,
          .animation-glow {
            animation: none;
          }

          .theme-option {
            transition: none;
          }
        }

        @media (max-width: 540px) {
          .app-row {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .app-row-info {
            width: calc(100% - 60px);
          }
        }
      `}</style>
    </main>
  );
}
