"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
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
  backgroundType: "solid" | "gradient" | "image" | "texture";
  background: string;
  gradientStart: string;
  gradientEnd: string;
  backgroundImage: string;
  backgroundPreset: string;
  accent: string;
  textColor: string;
  buttonColor: string;
  radius: number;

  // سازگاری با تنظیمات قدیمی صفحه پروفایل
  backgroundMode?: string;
  backgroundColor?: string;
  backgroundColor2?: string;
  texture?: string;
  iconColor?: string;
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

type AppItem = {
  id: string;
  name: string;
  category: string;
  placeholder: string;
};

const DEFAULT_APPEARANCE: Appearance = {
  template: "business",
  backgroundType: "gradient",
  background: "#10101A",
  gradientStart: "#17172B",
  gradientEnd: "#43216D",
  backgroundImage: "",
  backgroundPreset: "midnight",
  accent: "#C084FC",
  textColor: "#FFFFFF",
  buttonColor: "#252538",
  radius: 18,
};

const APPS: AppItem[] = [
  // شبکه‌های اجتماعی
  { id: "instagram", name: "Instagram", category: "social", placeholder: "https://instagram.com/username" },
  { id: "telegram", name: "Telegram", category: "social", placeholder: "https://t.me/username" },
  { id: "whatsapp", name: "WhatsApp", category: "social", placeholder: "https://wa.me/989123456789" },
  { id: "whatsapp_business", name: "WhatsApp Business", category: "business", placeholder: "https://wa.me/989123456789" },
  { id: "youtube", name: "YouTube", category: "creator", placeholder: "https://youtube.com/@username" },
  { id: "youtube_channel", name: "YouTube Channel", category: "creator", placeholder: "لینک کانال یوتیوب" },
  { id: "tiktok", name: "TikTok", category: "creator", placeholder: "https://tiktok.com/@username" },
  { id: "x", name: "X / Twitter", category: "social", placeholder: "https://x.com/username" },
  { id: "facebook", name: "Facebook", category: "social", placeholder: "https://facebook.com/username" },
  { id: "threads", name: "Threads", category: "social", placeholder: "https://threads.net/@username" },
  { id: "snapchat", name: "Snapchat", category: "social", placeholder: "https://snapchat.com/add/username" },
  { id: "discord", name: "Discord", category: "social", placeholder: "لینک دعوت سرور دیسکورد" },
  { id: "twitch", name: "Twitch", category: "creator", placeholder: "https://twitch.tv/username" },
  { id: "reddit", name: "Reddit", category: "social", placeholder: "https://reddit.com/u/username" },
  { id: "pinterest", name: "Pinterest", category: "social", placeholder: "https://pinterest.com/username" },
  { id: "linkedin", name: "LinkedIn", category: "business", placeholder: "https://linkedin.com/in/username" },
  { id: "linkedin_company", name: "LinkedIn Company", category: "business", placeholder: "لینک صفحه شرکت" },
  { id: "github", name: "GitHub", category: "developer", placeholder: "https://github.com/username" },
  { id: "behance", name: "Behance", category: "creator", placeholder: "https://behance.net/username" },
  { id: "dribbble", name: "Dribbble", category: "creator", placeholder: "https://dribbble.com/username" },
  { id: "spotify", name: "Spotify", category: "creator", placeholder: "لینک پروفایل Spotify" },
  { id: "soundcloud", name: "SoundCloud", category: "creator", placeholder: "لینک SoundCloud" },
  { id: "medium", name: "Medium", category: "creator", placeholder: "لینک پروفایل Medium" },
  { id: "tumblr", name: "Tumblr", category: "social", placeholder: "لینک Tumblr" },

  // پلتفرم‌های ایرانی
  { id: "aparat", name: "Aparat", category: "iran", placeholder: "https://aparat.com/username" },
  { id: "rubika", name: "Rubika", category: "iran", placeholder: "لینک روبیکا" },
  { id: "eitaa", name: "Eitaa", category: "iran", placeholder: "https://eitaa.com/username" },
  { id: "bale", name: "Bale", category: "iran", placeholder: "https://ble.ir/username" },
  { id: "soroush", name: "Soroush Plus", category: "iran", placeholder: "لینک سروش پلاس" },
  { id: "virasty", name: "Virasty", category: "iran", placeholder: "لینک ویراستی" },
  { id: "igap", name: "iGap", category: "iran", placeholder: "لینک آیگپ" },
  { id: "gap", name: "Gap", category: "iran", placeholder: "لینک گپ" },

  // فروشگاه و خدمات
  { id: "digikala", name: "Digikala", category: "business", placeholder: "لینک فروشگاه دیجی‌کالا" },
  { id: "torob", name: "Torob", category: "business", placeholder: "لینک ترب" },
  { id: "basalam", name: "Basalam", category: "business", placeholder: "لینک غرفه باسلام" },
  { id: "divar", name: "Divar", category: "business", placeholder: "لینک آگهی یا پروفایل دیوار" },
  { id: "sheypoor", name: "Sheypoor", category: "business", placeholder: "لینک شیپور" },
  { id: "snapp", name: "Snapp", category: "business", placeholder: "لینک اسنپ" },
  { id: "tapsi", name: "Tapsi", category: "business", placeholder: "لینک تپسی" },
  { id: "digistyle", name: "Digistyle", category: "business", placeholder: "لینک دیجی‌استایل" },

  // فیلم و کتاب
  { id: "filimo", name: "Filimo", category: "creator", placeholder: "لینک فیلیمو" },
  { id: "namava", name: "Namava", category: "creator", placeholder: "لینک نماوا" },
  { id: "filmnet", name: "Filmnet", category: "creator", placeholder: "لینک فیلم‌نت" },
  { id: "taaghche", name: "Taaghche", category: "creator", placeholder: "لینک طاقچه" },
  { id: "fidibo", name: "Fidibo", category: "creator", placeholder: "لینک فیدیبو" },

  // ابزارهای کسب‌وکار
  { id: "website", name: "Website", category: "business", placeholder: "https://example.com" },
  { id: "email", name: "Email", category: "business", placeholder: "name@example.com" },
  { id: "phone", name: "Phone", category: "business", placeholder: "+989123456789" },
  { id: "sms", name: "SMS", category: "business", placeholder: "+989123456789" },
  { id: "maps", name: "Google Maps", category: "business", placeholder: "لینک موقعیت مکانی" },
  { id: "calendly", name: "Calendly", category: "business", placeholder: "لینک رزرو وقت" },
  { id: "linktree", name: "Linktree", category: "business", placeholder: "https://linktr.ee/username" },
  { id: "beacons", name: "Beacons", category: "creator", placeholder: "لینک Beacons" },
  { id: "notion", name: "Notion", category: "business", placeholder: "لینک صفحه Notion" },
  { id: "portfolio", name: "Portfolio", category: "business", placeholder: "لینک نمونه‌کارها" },
  { id: "telegram_channel", name: "Telegram Channel", category: "social", placeholder: "https://t.me/channel" },
  { id: "telegram_group", name: "Telegram Group", category: "social", placeholder: "لینک گروه تلگرام" },
  { id: "whatsapp_channel", name: "WhatsApp Channel", category: "social", placeholder: "لینک کانال واتساپ" },
  { id: "threads_profile", name: "Threads Profile", category: "social", placeholder: "لینک پروفایل Threads" },
  { id: "vimeo", name: "Vimeo", category: "creator", placeholder: "لینک Vimeo" },
  { id: "producthunt", name: "Product Hunt", category: "developer", placeholder: "لینک Product Hunt" },
  { id: "stackoverflow", name: "Stack Overflow", category: "developer", placeholder: "لینک Stack Overflow" },
  { id: "gitlab", name: "GitLab", category: "developer", placeholder: "لینک GitLab" },
  { id: "telegram_bot", name: "Telegram Bot", category: "tools", placeholder: "https://t.me/your_bot" },
  { id: "booking", name: "Booking", category: "business", placeholder: "لینک رزرو یا نوبت‌دهی" },
];

const CATEGORIES = [
  { id: "all", name: "همه" },
  { id: "social", name: "شبکه اجتماعی" },
  { id: "iran", name: "ایرانی" },
  { id: "creator", name: "تولید محتوا" },
  { id: "business", name: "کسب‌وکار" },
  { id: "developer", name: "برنامه‌نویسی" },
  { id: "tools", name: "ابزارها" },
];

const PRESETS = [
  {
    id: "midnight",
    name: "Midnight",
    start: "#10101A",
    end: "#43216D",
    accent: "#C084FC",
    button: "#252538",
  },
  {
    id: "ocean",
    name: "Ocean",
    start: "#071A2E",
    end: "#075985",
    accent: "#38BDF8",
    button: "#102F46",
  },
  {
    id: "emerald",
    name: "Emerald",
    start: "#071F19",
    end: "#065F46",
    accent: "#34D399",
    button: "#123B31",
  },
  {
    id: "rose",
    name: "Rose",
    start: "#2B1021",
    end: "#881337",
    accent: "#FDA4AF",
    button: "#47152B",
  },
  {
    id: "gold",
    name: "Gold",
    start: "#17130B",
    end: "#62451B",
    accent: "#FBBF24",
    button: "#332817",
  },
  {
    id: "minimal",
    name: "Minimal",
    start: "#111111",
    end: "#292929",
    accent: "#FFFFFF",
    button: "#303030",
  },
  {
    id: "purple",
    name: "Purple Smoke",
    start: "#170B2E",
    end: "#7137A8",
    accent: "#E9B7FF",
    button: "#332047",
  },
  {
    id: "crystal",
    name: "Crystal",
    start: "#0D1828",
    end: "#36556E",
    accent: "#A5F3FC",
    button: "#23394A",
  },
];

const TEXTURES = [
  {
    id: "marble",
    name: "سنگ مرمر",
    css: "radial-gradient(ellipse at 20% 20%,rgba(255,255,255,.12),transparent 35%),repeating-linear-gradient(125deg,transparent 0 35px,rgba(255,255,255,.04) 36px 38px),linear-gradient(135deg,#111827,#292536)",
  },
  {
    id: "galaxy",
    name: "کهکشان",
    css: "radial-gradient(circle at 20% 30%,#a855f7 0 1px,transparent 2px),radial-gradient(circle at 70% 60%,#fff 0 1px,transparent 2px),radial-gradient(ellipse at 70% 20%,#6d28d9,transparent 50%),linear-gradient(135deg,#09051c,#160c36)",
  },
  {
    id: "gold",
    name: "مشکی طلایی",
    css: "radial-gradient(ellipse at top right,rgba(212,175,55,.25),transparent 45%),repeating-linear-gradient(135deg,transparent 0 45px,rgba(212,175,55,.08) 46px 48px),linear-gradient(135deg,#050505,#262016)",
  },
  {
    id: "wood",
    name: "چوب",
    css: "repeating-linear-gradient(5deg,rgba(255,255,255,.025) 0 2px,transparent 3px 12px),linear-gradient(135deg,#24150E,#674329)",
  },
  {
    id: "emerald",
    name: "زمرد",
    css: "radial-gradient(ellipse at 25% 20%,rgba(52,211,153,.24),transparent 50%),repeating-linear-gradient(120deg,transparent 0 40px,rgba(255,255,255,.035) 41px 43px),linear-gradient(135deg,#03150F,#064E3B)",
  },
  {
    id: "cyberpunk",
    name: "سایبرپانک",
    css: "linear-gradient(rgba(217,70,239,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.08) 1px,transparent 1px),linear-gradient(135deg,#10051D,#090F22)",
  },
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function validColor(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function getAppearance(value?: Partial<Appearance> | null): Appearance {
  const old = value || {};

  const oldMode = old.backgroundMode;
  const type =
    old.backgroundType ||
    (oldMode === "texture"
      ? "texture"
      : oldMode === "solid"
        ? "solid"
        : oldMode === "image"
          ? "image"
          : "gradient");

  return {
    ...DEFAULT_APPEARANCE,
    ...old,
    backgroundType:
      type === "solid" ||
      type === "gradient" ||
      type === "image" ||
      type === "texture"
        ? type
        : "gradient",
    background: validColor(
      old.background || old.backgroundColor,
      DEFAULT_APPEARANCE.background,
    ),
    gradientStart: validColor(
      old.gradientStart || old.backgroundColor,
      DEFAULT_APPEARANCE.gradientStart,
    ),
    gradientEnd: validColor(
      old.gradientEnd || old.backgroundColor2,
      DEFAULT_APPEARANCE.gradientEnd,
    ),
    accent: validColor(old.accent, DEFAULT_APPEARANCE.accent),
    textColor: validColor(old.textColor, DEFAULT_APPEARANCE.textColor),
    buttonColor: validColor(
      old.buttonColor,
      DEFAULT_APPEARANCE.buttonColor,
    ),
    radius:
      typeof old.radius === "number"
        ? Math.min(32, Math.max(0, old.radius))
        : DEFAULT_APPEARANCE.radius,
  };
}

function getCardBackground(a: Appearance): string {
  if (a.backgroundType === "solid") {
    return a.background;
  }

  if (a.backgroundType === "image" && a.backgroundImage) {
    return `linear-gradient(135deg,rgba(0,0,0,.3),rgba(0,0,0,.6)),url("${a.backgroundImage}") center/cover`;
  }

  if (a.backgroundType === "texture") {
    const texture = TEXTURES.find((item) => item.id === a.backgroundPreset);
    if (texture) return texture.css;
  }

  return `linear-gradient(135deg,${a.gradientStart},${a.gradientEnd})`;
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^(mailto:|tel:|sms:|https?:\/\/)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  if (/^\+?[0-9()\-\s]{7,}$/.test(trimmed)) {
    return `tel:${trimmed.replace(/[()\s-]/g, "")}`;
  }

  return `https://${trimmed}`;
}

function getAppHref(appId: string, value: string): string {
  const input = value.trim();
  if (!input) return "";

  if (/^(https?:\/\/|mailto:|tel:|sms:)/i.test(input)) {
    return input;
  }

  const handle = input.replace(/^@/, "").replace(/^\/+/, "");

  switch (appId) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "telegram":
      return `https://t.me/${handle}`;
    case "telegram_channel":
      return `https://t.me/${handle}`;
    case "telegram_group":
      return `https://t.me/${handle}`;
    case "telegram_bot":
      return `https://t.me/${handle}`;
    case "whatsapp":
    case "whatsapp_business":
      return `https://wa.me/${handle.replace(/\D/g, "")}`;
    case "youtube":
    case "youtube_channel":
      return `https://youtube.com/@${handle}`;
    case "tiktok":
      return `https://tiktok.com/@${handle}`;
    case "x":
      return `https://x.com/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "threads":
    case "threads_profile":
      return `https://threads.net/@${handle}`;
    case "snapchat":
      return `https://snapchat.com/add/${handle}`;
    case "twitch":
      return `https://twitch.tv/${handle}`;
    case "reddit":
      return `https://reddit.com/u/${handle}`;
    case "pinterest":
      return `https://pinterest.com/${handle}`;
    case "linkedin":
      return `https://linkedin.com/in/${handle}`;
    case "github":
      return `https://github.com/${handle}`;
    case "behance":
      return `https://behance.net/${handle}`;
    case "dribbble":
      return `https://dribbble.com/${handle}`;
    case "aparat":
      return `https://aparat.com/${handle}`;
    case "eitaa":
      return `https://eitaa.com/${handle}`;
    case "bale":
      return `https://ble.ir/${handle}`;
    case "rubika":
      return `https://rubika.ir/${handle}`;
    case "linktree":
      return `https://linktr.ee/${handle}`;
    case "email":
      return `mailto:${input}`;
    case "phone":
      return `tel:${input.replace(/[()\s-]/g, "")}`;
    case "sms":
      return `sms:${input.replace(/[()\s-]/g, "")}`;
    case "website":
    case "portfolio":
      return normalizeUrl(input);
    default:
      return normalizeUrl(input);
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("profile");
  const [appSearch, setAppSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const [profileForm, setProfileForm] = useState({
    username: "",
    full_name: "",
    job: "",
    email: "",
    website: "",
    location: "",
    bio: "",
  });

  const [appearance, setAppearance] =
    useState<Appearance>(DEFAULT_APPEARANCE);

  const [phones, setPhones] = useState<PhoneItem[]>([]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [phoneTitle, setPhoneTitle] = useState("شماره تماس");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [appValues, setAppValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.replace("/login");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!data) {
          if (alive) {
            setError(
              "پروفایل شما پیدا نشد. ابتدا پروفایل کاربری را در دیتابیس ایجاد کنید.",
            );
          }
          return;
        }

        const p = data as Profile;
        const links = p.social_links || {};

        if (!alive) return;

        setProfile(p);

        setProfileForm({
          username: p.username || "",
          full_name: p.full_name || "",
          job: p.job || "",
          email: p.email || authData.user.email || "",
          website: p.website || "",
          location: p.location || "",
          bio: p.bio || "",
        });

        setAppearance(getAppearance(p.appearance));

        setPhones(
          Array.isArray(links.phones)
            ? links.phones
            : p.phone
              ? [
                  {
                    id: createId(),
                    title: "شماره تماس",
                    number: p.phone,
                  },
                ]
              : [],
        );

        setCustomLinks(
          Array.isArray(links.customLinks) ? links.customLinks : [],
        );

        const nextApps: Record<string, string> = {};

        for (const app of APPS) {
          const current = links[app.id];
          if (typeof current === "string") {
            nextApps[app.id] = current;
          }
        }

        setAppValues(nextApps);
      } catch (err: any) {
        if (alive) {
          setError(err?.message || "خطا در دریافت اطلاعات داشبورد");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      alive = false;
    };
  }, [router]);

  const filteredApps = useMemo(() => {
    const query = appSearch.trim().toLowerCase();

    return APPS.filter((app) => {
      const matchesCategory =
        activeCategory === "all" || app.category === activeCategory;

      const matchesSearch =
        !query ||
        app.name.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [appSearch, activeCategory]);

  const cardStyle = useMemo(
    () =>
      ({
        background: getCardBackground(appearance),
        color: appearance.textColor,
        borderRadius: `${appearance.radius}px`,
        "--card-accent": appearance.accent,
        "--card-button": appearance.buttonColor,
      }) as CSSProperties,
    [appearance],
  );

  function updateForm(
    field: keyof typeof profileForm,
    value: string,
  ) {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateAppearance(
    field: keyof Appearance,
    value: string | number,
  ) {
    setAppearance((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyPreset(presetId: string) {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setAppearance((current) => ({
      ...current,
      backgroundPreset: preset.id,
      backgroundType: "gradient",
      gradientStart: preset.start,
      gradientEnd: preset.end,
      accent: preset.accent,
      buttonColor: preset.button,
    }));
  }

  function addPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phoneNumber.trim()) {
      setError("شماره تماس را وارد کن.");
      return;
    }

    setPhones((current) => [
      ...current,
      {
        id: createId(),
        title: phoneTitle.trim() || "شماره تماس",
        number: phoneNumber.trim(),
      },
    ]);

    setPhoneTitle("شماره تماس");
    setPhoneNumber("");
    setError("");
    setMessage("شماره اضافه شد؛ برای ذخیره نهایی دکمه ذخیره را بزن.");
  }

  function removePhone(id: string) {
    setPhones((current) => current.filter((item) => item.id !== id));
  }

  function addCustomLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customTitle.trim() || !customUrl.trim()) {
      setError("عنوان و آدرس لینک را کامل وارد کن.");
      return;
    }

    setCustomLinks((current) => [
      ...current,
      {
        id: createId(),
        title: customTitle.trim(),
        url: normalizeUrl(customUrl),
      },
    ]);

    setCustomTitle("");
    setCustomUrl("");
    setError("");
    setMessage("لینک اضافه شد؛ برای ذخیره نهایی دکمه ذخیره را بزن.");
  }

  function removeCustomLink(id: string) {
    setCustomLinks((current) =>
      current.filter((item) => item.id !== id),
    );
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !profile) return;

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("فرمت عکس باید JPG، PNG، WEBP یا AVIF باشد.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم عکس نباید بیشتر از ۵ مگابایت باشد.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-80);

      const path = `${profile.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(path);

      const avatarUrl = publicData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile((current) =>
        current ? { ...current, avatar_url: avatarUrl } : current,
      );

      setMessage("عکس پروفایل با موفقیت تغییر کرد.");
    } catch (err: any) {
      setError(
        err?.message ||
          "آپلود عکس انجام نشد. تنظیمات Storage و دسترسی‌های Supabase را بررسی کن.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveDashboard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const username = profileForm.username
        .trim()
        .replace(/^@/, "")
        .toLowerCase();

      if (!username) {
        setError("نام کاربری را وارد کن.");
        return;
      }

      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        setError(
          "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد.",
        );
        return;
      }

      if (!profileForm.full_name.trim()) {
        setError("نام نمایشی را وارد کن.");
        return;
      }

      const { data: existing, error: usernameError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .neq("id", profile.id)
        .limit(1)
        .maybeSingle();

      if (usernameError) throw usernameError;

      if (existing) {
        setError("این نام کاربری قبلاً استفاده شده است.");
        return;
      }

      const socialLinks: Record<string, any> = {
        ...(profile.social_links || {}),
      };

      for (const app of APPS) {
        const value = (appValues[app.id] || "").trim();

        if (value) {
          socialLinks[app.id] = getAppHref(app.id, value);
        } else {
          delete socialLinks[app.id];
        }
      }

      socialLinks.phones = phones;
      socialLinks.customLinks = customLinks;

      const normalizedAppearance: Appearance = {
        ...appearance,
        backgroundMode:
          appearance.backgroundType === "texture"
            ? "texture"
            : appearance.backgroundType,
        backgroundColor:
          appearance.backgroundType === "solid"
            ? appearance.background
            : appearance.gradientStart,
        backgroundColor2: appearance.gradientEnd,
        texture: appearance.backgroundPreset,
        iconColor: appearance.accent,
      };

      const updatedProfile = {
        username,
        full_name: profileForm.full_name.trim(),
        job: profileForm.job.trim(),
        email: profileForm.email.trim(),
        website: profileForm.website.trim(),
        location: profileForm.location.trim(),
        bio: profileForm.bio.trim(),
        phone: phones[0]?.number || "",
        social_links: socialLinks,
        appearance: normalizedAppearance,
      };

      const { data, error: saveError } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", profile.id)
        .select("*")
        .single();

      if (saveError) throw saveError;

      setProfile(data as Profile);

      setProfileForm((current) => ({
        ...current,
        username,
      }));

      setAppearance(getAppearance(data.appearance));

      setMessage("تغییرات با موفقیت ذخیره شد! 🎉");
    } catch (err: any) {
      setError(err?.message || "ذخیره اطلاعات ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="lc-loading">
        <div className="lc-loader" />
        <p>در حال بارگذاری داشبورد LumoCard...</p>

        <style jsx>{`
          .lc-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 16px;
            background: #09090f;
            color: #fff;
            font-family: Arial, sans-serif;
          }

          .lc-loader {
            width: 44px;
            height: 44px;
            border: 3px solid #30213f;
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

  if (!profile) {
    return (
      <main className="lc-loading">
        <div className="lc-error-box">
          <h2>پروفایل پیدا نشد</h2>
          <p>{error || "اطلاعات پروفایل در دسترس نیست."}</p>
          <Link href="/">بازگشت به صفحه اصلی</Link>
        </div>

        <style jsx>{`
          .lc-loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #09090f;
            color: white;
            font-family: Arial, sans-serif;
          }

          .lc-error-box {
            width: min(100%, 450px);
            padding: 28px;
            border: 1px solid #39274a;
            border-radius: 20px;
            background: #14121b;
            text-align: center;
          }

          .lc-error-box p {
            color: #b8b1c4;
            line-height: 1.8;
            overflow-wrap: anywhere;
          }

          .lc-error-box a {
            display: inline-block;
            margin-top: 12px;
            color: #d8b4fe;
          }
        `}</style>
      </main>
    );
  }

  const navItems = [
    { id: "profile", label: "پروفایل", icon: "👤" },
    { id: "phones", label: "شماره تماس", icon: "☎️" },
    { id: "apps", label: "اپلیکیشن‌ها", icon: "📱" },
    { id: "links", label: "لینک‌های سفارشی", icon: "🔗" },
    { id: "design", label: "طراحی کارت", icon: "🎨" },
  ];

  const filledAppCount = Object.values(appValues).filter(
    (value) => value.trim(),
  ).length;

  const publicProfileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${profileForm.username || profile.username}`
      : `/${profileForm.username || profile.username}`;

  return (
    <main className="lc-dashboard" dir="rtl">
      <aside className="lc-sidebar">
        <Link href="/" className="lc-logo">
          <span className="lc-logo-mark">L</span>
          <span>
            <strong>LumoCard</strong>
            <small>SMART IDENTITY</small>
          </span>
        </Link>

        <div className="lc-user-mini">
          <div className="lc-mini-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="پروفایل" />
            ) : (
              (profile.full_name || "L").charAt(0)
            )}
          </div>

          <div className="lc-mini-details">
            <strong>{profile.full_name || "کاربر LumoCard"}</strong>
            <span>@{profile.username}</span>
          </div>
        </div>

        <div className="lc-nav-label">مدیریت کارت</div>

        <nav className="lc-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                setError("");
                setMessage("");
              }}
              className={`lc-nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>

              {item.id === "apps" && (
                <small className="lc-nav-count">{filledAppCount}</small>
              )}
            </button>
          ))}
        </nav>

        <div className="lc-sidebar-bottom">
          <a
            className="lc-public-link"
            href={publicProfileUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span>↗</span>
            مشاهده کارت عمومی
          </a>

          <button
            className="lc-logout"
            type="button"
            onClick={logout}
          >
            <span>⇥</span>
            خروج از حساب
          </button>
        </div>
      </aside>

      <section className="lc-main">
        <header className="lc-topbar">
          <div>
            <span className="lc-eyebrow">LUMOCARD WORKSPACE</span>
            <h1>
              {navItems.find((item) => item.id === activeSection)?.label ||
                "داشبورد"}
            </h1>
          </div>

          <div className="lc-top-actions">
            <a
              className="lc-view-button"
              href={publicProfileUrl}
              target="_blank"
              rel="noreferrer"
            >
              ↗ مشاهده کارت
            </a>
          </div>
        </header>

        {(error || message) && (
          <div className={`lc-alert ${error ? "is-error" : "is-success"}`}>
            <span>{error ? "⚠️" : "✓"}</span>
            <span>{error || message}</span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
              }}
              aria-label="بستن پیام"
            >
              ×
            </button>
          </div>
        )}

        <div className="lc-workspace">
          <div className="lc-editor">
            <form onSubmit={saveDashboard}>
              {activeSection === "profile" && (
                <section className="lc-panel">
                  <div className="lc-panel-heading">
                    <div>
                      <span className="lc-section-number">01 / PROFILE</span>
                      <h2>اطلاعات کارت تو</h2>
                      <p>اطلاعات اصلی که روی کارت دیجیتال نمایش داده می‌شود.</p>
                    </div>
                  </div>

                  <div className="lc-avatar-editor">
                    <div className="lc-avatar-large">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="عکس پروفایل"
                        />
                      ) : (
                        (profileForm.full_name || "L").charAt(0)
                      )}
                    </div>

                    <div className="lc-avatar-info">
                      <strong>عکس پروفایل</strong>
                      <p>فرمت JPG، PNG، WEBP یا AVIF؛ حداکثر ۵ مگابایت.</p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={uploadAvatar}
                        hidden
                      />

                      <button
                        type="button"
                        className="lc-secondary-button"
                        disabled={uploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingAvatar
                          ? "در حال آپلود..."
                          : "↑ انتخاب عکس"}
                      </button>
                    </div>
                  </div>

                  <div className="lc-form-grid">
                    <label className="lc-field">
                      <span>نام و نام خانوادگی *</span>
                      <input
                        value={profileForm.full_name}
                        onChange={(event) =>
                          updateForm("full_name", event.target.value)
                        }
                        placeholder="مثلاً سامیار برنایی"
                        required
                      />
                    </label>

                    <label className="lc-field">
                      <span>نام کاربری کارت *</span>
                      <div className="lc-username-input">
                        <span>@</span>
                        <input
                          value={profileForm.username}
                          onChange={(event) =>
                            updateForm("username", event.target.value)
                          }
                          placeholder="samiyar"
                          required
                        />
                      </div>
                      <small>
                        آدرس کارت: lumocard.ir/
                        {profileForm.username || "username"}
                      </small>
                    </label>

                    <label className="lc-field">
                      <span>عنوان شغلی</span>
                      <input
                        value={profileForm.job}
                        onChange={(event) =>
                          updateForm("job", event.target.value)
                        }
                        placeholder="مثلاً طراح گرافیک"
                      />
                    </label>

                    <label className="lc-field">
                      <span>ایمیل</span>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(event) =>
                          updateForm("email", event.target.value)
                        }
                        placeholder="name@example.com"
                      />
                    </label>

                    <label className="lc-field">
                      <span>وب‌سایت</span>
                      <input
                        value={profileForm.website}
                        onChange={(event) =>
                          updateForm("website", event.target.value)
                        }
                        placeholder="https://example.com"
                        dir="ltr"
                      />
                    </label>

                    <label className="lc-field">
                      <span>شهر یا موقعیت</span>
                      <input
                        value={profileForm.location}
                        onChange={(event) =>
                          updateForm("location", event.target.value)
                        }
                        placeholder="مثلاً تهران"
                      />
                    </label>

                    <label className="lc-field lc-field-full">
                      <span>درباره من</span>
                      <textarea
                        value={profileForm.bio}
                        onChange={(event) =>
                          updateForm("bio", event.target.value)
                        }
                        placeholder="چند خط درباره خودت یا کسب‌وکارت بنویس..."
                        rows={5}
                      />
                      <small>{profileForm.bio.length} کاراکتر</small>
                    </label>
                  </div>

                  <div className="lc-info-note">
                    <span>✦</span>
                    <div>
                      <strong>کارت دیجیتال تو همیشه در دسترس است.</strong>
                      <p>
                        تغییرات را ذخیره کن تا اطلاعات جدید در صفحه عمومی
                        پروفایلت نمایش داده شود.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === "phones" && (
                <section className="lc-panel">
                  <div className="lc-panel-heading">
                    <div>
                      <span className="lc-section-number">02 / CONTACT</span>
                      <h2>شماره‌های تماس</h2>
                      <p>
                        چند شماره با عنوان‌های متفاوت اضافه کن؛ مثلاً موبایل،
                        دفتر یا پشتیبانی.
                      </p>
                    </div>
                  </div>

                  <form className="lc-inline-form" onSubmit={addPhone}>
                    <label className="lc-field">
                      <span>عنوان شماره</span>
                      <input
                        value={phoneTitle}
                        onChange={(event) => setPhoneTitle(event.target.value)}
                        placeholder="شماره موبایل"
                      />
                    </label>

                    <label className="lc-field">
                      <span>شماره تلفن</span>
                      <input
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value)}
                        placeholder="+989123456789"
                        dir="ltr"
                      />
                    </label>

                    <button className="lc-add-button" type="submit">
                      + افزودن شماره
                    </button>
                  </form>

                  <div className="lc-list">
                    {phones.length === 0 ? (
                      <div className="lc-empty">
                        <span>☎</span>
                        <strong>هنوز شماره‌ای اضافه نکردی</strong>
                        <p>از فرم بالا شماره تماس خودت را اضافه کن.</p>
                      </div>
                    ) : (
                      phones.map((phone) => (
                        <div className="lc-list-item" key={phone.id}>
                          <div className="lc-list-icon">☎</div>
                          <div className="lc-list-text">
                            <strong>{phone.title}</strong>
                            <span dir="ltr">{phone.number}</span>
                          </div>
                          <button
                            className="lc-delete-button"
                            type="button"
                            onClick={() => removePhone(phone.id)}
                          >
                            حذف
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}

              {activeSection === "apps" && (
                <section className="lc-panel">
                  <div className="lc-panel-heading">
                    <div>
                      <span className="lc-section-number">03 / CONNECTIONS</span>
                      <h2>اپلیکیشن‌ها و شبکه‌های اجتماعی</h2>
                      <p>
                        لینک یا شناسه هر اپلیکیشن را وارد کن. فقط مواردی که
                        پر شده‌اند روی کارت نمایش داده می‌شوند.
                      </p>
                    </div>
                    <span className="lc-count-pill">
                      {filledAppCount} فعال
                    </span>
                  </div>

                  <div className="lc-app-toolbar">
                    <div className="lc-search">
                      <span>⌕</span>
                      <input
                        value={appSearch}
                        onChange={(event) => setAppSearch(event.target.value)}
                        placeholder="جستجوی اپلیکیشن..."
                      />
                    </div>
                  </div>

                  <div className="lc-category-list">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        className={
                          activeCategory === category.id ? "active" : ""
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="lc-app-grid">
                    {filteredApps.map((app) => {
                      const isFilled = Boolean(appValues[app.id]?.trim());

                      return (
                        <label
                          key={app.id}
                          className={`lc-app-field ${
                            isFilled ? "is-filled" : ""
                          }`}
                        >
                          <span className="lc-app-field-top">
                            <span className="lc-app-dot">
                              {app.name.charAt(0)}
                            </span>
                            <span className="lc-app-name">{app.name}</span>
                            {isFilled && <span className="lc-app-check">✓</span>}
                          </span>

                          <input
                            value={appValues[app.id] || ""}
                            onChange={(event) =>
                              setAppValues((current) => ({
                                ...current,
                                [app.id]: event.target.value,
                              }))
                            }
                            placeholder={app.placeholder}
                            dir="auto"
                          />
                        </label>
                      );
                    })}
                  </div>

                  {filteredApps.length === 0 && (
                    <div className="lc-empty">
                      <strong>اپلیکیشنی پیدا نشد</strong>
                      <p>نام دیگری جستجو کن.</p>
                    </div>
                  )}
                </section>
              )}

              {activeSection === "links" && (
                <section className="lc-panel">
                  <div className="lc-panel-heading">
                    <div>
                      <span className="lc-section-number">04 / CUSTOM LINKS</span>
                      <h2>لینک‌های سفارشی</h2>
                      <p>
                        برای رزرو، فروشگاه، کاتالوگ، منو یا هر صفحه دیگری لینک
                        بساز.
                      </p>
                    </div>
                  </div>

                  <form className="lc-inline-form" onSubmit={addCustomLink}>
                    <label className="lc-field">
                      <span>عنوان لینک</span>
                      <input
                        value={customTitle}
                        onChange={(event) =>
                          setCustomTitle(event.target.value)
                        }
                        placeholder="مثلاً مشاهده کاتالوگ"
                      />
                    </label>

                    <label className="lc-field">
                      <span>آدرس لینک</span>
                      <input
                        value={customUrl}
                        onChange={(event) => setCustomUrl(event.target.value)}
                        placeholder="https://example.com"
                        dir="ltr"
                      />
                    </label>

                    <button className="lc-add-button" type="submit">
                      + افزودن لینک
                    </button>
                  </form>

                  <div className="lc-list">
                    {customLinks.length === 0 ? (
                      <div className="lc-empty">
                        <span>↗</span>
                        <strong>لینک سفارشی نداری</strong>
                        <p>از فرم بالا اولین لینک را اضافه کن.</p>
                      </div>
                    ) : (
                      customLinks.map((link) => (
                        <div className="lc-list-item" key={link.id}>
                          <div className="lc-list-icon">↗</div>
                          <div className="lc-list-text">
                            <strong>{link.title}</strong>
                            <span dir="ltr">{link.url}</span>
                          </div>
                          <button
                            className="lc-delete-button"
                            type="button"
                            onClick={() => removeCustomLink(link.id)}
                          >
                            حذف
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}

              {activeSection === "design" && (
                <section className="lc-panel">
                  <div className="lc-panel-heading">
                    <div>
                      <span className="lc-section-number">05 / DESIGN STUDIO</span>
                      <h2>طراحی کارت دیجیتال</h2>
                      <p>
                        رنگ‌ها، پس‌زمینه و استایل کارتت را شخصی‌سازی کن.
                      </p>
                    </div>
                  </div>

                  <div className="lc-design-section">
                    <h3>قالب کارت</h3>
                    <div className="lc-template-grid">
                      {[
                        {
                          id: "business",
                          name: "Business",
                          description: "رسمی و حرفه‌ای",
                          symbol: "▤",
                        },
                        {
                          id: "personal",
                          name: "Personal",
                          description: "ساده و شخصی",
                          symbol: "◉",
                        },
                        {
                          id: "creator",
                          name: "Creator",
                          description: "مناسب تولیدکننده محتوا",
                          symbol: "✦",
                        },
                        {
                          id: "developer",
                          name: "Developer",
                          description: "مناسب برنامه‌نویس‌ها",
                          symbol: "</>",
                        },
                      ].map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() =>
                            updateAppearance("template", template.id)
                          }
                          className={`lc-template-card ${
                            appearance.template === template.id ? "active" : ""
                          }`}
                        >
                          <span className="lc-template-symbol">
                            {template.symbol}
                          </span>
                          <strong>{template.name}</strong>
                          <small>{template.description}</small>
                          {appearance.template === template.id && (
                            <span className="lc-template-selected">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lc-design-section">
                    <h3>رنگ‌بندی آماده</h3>
                    <div className="lc-preset-grid">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset.id)}
                          className={`lc-preset-card ${
                            appearance.backgroundPreset === preset.id &&
                            appearance.backgroundType === "gradient"
                              ? "active"
                              : ""
                          }`}
                        >
                          <span
                            className="lc-preset-swatch"
                            style={{
                              background: `linear-gradient(135deg,${preset.start},${preset.end})`,
                            }}
                          >
                            <i style={{ background: preset.accent }} />
                          </span>
                          <strong>{preset.name}</strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lc-design-section">
                    <h3>نوع پس‌زمینه</h3>
                    <div className="lc-background-modes">
                      {[
                        { id: "gradient", name: "گرادیانت", icon: "◒" },
                        { id: "solid", name: "تک‌رنگ", icon: "■" },
                        { id: "texture", name: "بافت‌دار", icon: "▦" },
                        { id: "image", name: "تصویر", icon: "▧" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() =>
                            updateAppearance(
                              "backgroundType",
                              mode.id as Appearance["backgroundType"],
                            )
                          }
                          className={
                            appearance.backgroundType === mode.id ? "active" : ""
                          }
                        >
                          <span>{mode.icon}</span>
                          {mode.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {appearance.backgroundType === "solid" && (
                    <div className="lc-design-section">
                      <h3>رنگ پس‌زمینه</h3>
                      <ColorControl
                        label="رنگ کارت"
                        value={appearance.background}
                        onChange={(value) =>
                          updateAppearance("background", value)
                        }
                      />
                    </div>
                  )}

                  {appearance.backgroundType === "gradient" && (
                    <div className="lc-design-section">
                      <h3>رنگ‌های گرادیانت</h3>
                      <div className="lc-color-grid">
                        <ColorControl
                          label="رنگ اول"
                          value={appearance.gradientStart}
                          onChange={(value) =>
                            updateAppearance("gradientStart", value)
                          }
                        />
                        <ColorControl
                          label="رنگ دوم"
                          value={appearance.gradientEnd}
                          onChange={(value) =>
                            updateAppearance("gradientEnd", value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {appearance.backgroundType === "texture" && (
                    <div className="lc-design-section">
                      <h3>انتخاب بافت</h3>
                      <div className="lc-texture-grid">
                        {TEXTURES.map((texture) => (
                          <button
                            key={texture.id}
                            type="button"
                            onClick={() =>
                              updateAppearance(
                                "backgroundPreset",
                                texture.id,
                              )
                            }
                            className={`lc-texture-card ${
                              appearance.backgroundPreset === texture.id
                                ? "active"
                                : ""
                            }`}
                          >
                            <span
                              className="lc-texture-preview"
                              style={{ background: texture.css }}
                            />
                            <strong>{texture.name}</strong>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {appearance.backgroundType === "image" && (
                    <div className="lc-design-section">
                      <h3>تصویر پس‌زمینه</h3>
                      <label className="lc-field">
                        <span>آدرس مستقیم تصویر</span>
                        <input
                          value={appearance.backgroundImage}
                          onChange={(event) =>
                            updateAppearance(
                              "backgroundImage",
                              event.target.value,
                            )
                          }
                          placeholder="https://example.com/background.jpg"
                          dir="ltr"
                        />
                      </label>
                      <p className="lc-hint">
                        آدرس باید مستقیم به یک تصویر قابل مشاهده در وب اشاره
                        کند.
                      </p>
                    </div>
                  )}

                  <div className="lc-design-section">
                    <h3>رنگ‌های کارت</h3>
                    <div className="lc-color-grid">
                      <ColorControl
                        label="رنگ تأکیدی"
                        value={appearance.accent}
                        onChange={(value) =>
                          updateAppearance("accent", value)
                        }
                      />

                      <ColorControl
                        label="رنگ متن"
                        value={appearance.textColor}
                        onChange={(value) =>
                          updateAppearance("textColor", value)
                        }
                      />

                      <ColorControl
                        label="رنگ دکمه‌ها"
                        value={appearance.buttonColor}
                        onChange={(value) =>
                          updateAppearance("buttonColor", value)
                        }
                      />
                    </div>
                  </div>

                  <div className="lc-design-section">
                    <div className="lc-range-heading">
                      <h3>گردی گوشه‌ها</h3>
                      <span>{appearance.radius}px</span>
                    </div>

                    <input
                      className="lc-range"
                      type="range"
                      min="0"
                      max="32"
                      value={appearance.radius}
                      onChange={(event) =>
                        updateAppearance("radius", Number(event.target.value))
                      }
                    />

                    <div className="lc-range-labels">
                      <span>مربعی</span>
                      <span>گرد</span>
                    </div>
                  </div>

                  <div className="lc-info-note">
                    <span>✦</span>
                    <div>
                      <strong>پیش‌نمایش زنده</strong>
                      <p>
                        تغییرات را در کارت کنار صفحه می‌بینی. برای ثبت نهایی،
                        دکمه ذخیره را بزن.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <div className="lc-save-bar">
                <span>تغییراتت را ذخیره کن تا روی کارت اعمال شوند.</span>
                <button
                  type="submit"
                  className="lc-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="lc-button-spinner" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>✓ ذخیره تغییرات</>
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="lc-preview-column">
            <div className="lc-preview-heading">
              <div>
                <span className="lc-section-number">LIVE PREVIEW</span>
                <h2>پیش‌نمایش کارت</h2>
              </div>
              <span className="lc-live-indicator">
                <i />
                LIVE
              </span>
            </div>

            <div className="lc-preview-stage">
              <div className="lc-preview-card" style={cardStyle}>
                <div className="lc-card-top">
                  <span className="lc-card-brand">
                    <span className="lc-card-brand-icon">L</span>
                    LumoCard
                  </span>
                  <span className="lc-card-chip">DIGITAL ID</span>
                </div>

                <div className="lc-card-person">
                  <div className="lc-card-avatar">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profileForm.full_name}
                      />
                    ) : (
                      (profileForm.full_name || "L").charAt(0)
                    )}
                  </div>

                  <div>
                    <h3>{profileForm.full_name || "نام شما"}</h3>
                    <p>{profileForm.job || "عنوان شغلی شما"}</p>
                  </div>
                </div>

                {profileForm.bio && (
                  <p className="lc-card-bio">{profileForm.bio}</p>
                )}

                {profileForm.location && (
                  <div className="lc-card-location">
                    <span>⌖</span>
                    {profileForm.location}
                  </div>
                )}

                <div className="lc-card-divider" />

                <div className="lc-card-links">
                  {APPS.filter((app) =>
                    Boolean(appValues[app.id]?.trim()),
                  )
                    .slice(0, 8)
                    .map((app) => (
                      <span className="lc-card-social" key={app.id}>
                        {app.name}
                      </span>
                    ))}

                  {phones.length > 0 && (
                    <span className="lc-card-social">☎ تماس</span>
                  )}

                  {customLinks.length > 0 && (
                    <span className="lc-card-social">↗ لینک‌ها</span>
                  )}
                </div>

                <div className="lc-card-bottom">
                  <span>@{profileForm.username || "username"}</span>
                  <span className="lc-card-bottom-mark">L</span>
                </div>
              </div>

              <div className="lc-preview-caption">
                <span>◉</span>
                نمای تقریبی کارت دیجیتال
              </div>
            </div>

            <div className="lc-preview-stats">
              <div className="lc-stat">
                <span className="lc-stat-icon">↗</span>
                <div>
                  <strong>{filledAppCount}</strong>
                  <small>اپلیکیشن فعال</small>
                </div>
              </div>

              <div className="lc-stat">
                <span className="lc-stat-icon">☎</span>
                <div>
                  <strong>{phones.length}</strong>
                  <small>شماره تماس</small>
                </div>
              </div>

              <div className="lc-stat">
                <span className="lc-stat-icon">🔗</span>
                <div>
                  <strong>{customLinks.length}</strong>
                  <small>لینک سفارشی</small>
                </div>
              </div>
            </div>

            <div className="lc-preview-tip">
              <span>✦</span>
              <div>
                <strong>کارت تو، قوانین تو!</strong>
                <p>
                  هر اطلاعاتی را که نمی‌خواهی عمومی باشد، در فیلد مربوطه خالی
                  بگذار.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="lc-footer">
          <span>© LumoCard</span>
          <span>Made for your digital identity ✦</span>
        </footer>
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #09090f;
        }

        .lc-dashboard {
          --purple: #c084fc;
          --purple-bright: #d8b4fe;
          --bg: #09090f;
          --panel: #12111a;
          --border: #272331;
          --muted: #9b95a8;
          display: flex;
          min-height: 100vh;
          color: #f6f3fb;
          background: var(--bg);
          font-family: Arial, Tahoma, sans-serif;
          direction: rtl;
        }

        .lc-sidebar {
          width: 250px;
          min-width: 250px;
          min-height: 100vh;
          position: sticky;
          top: 0;
          align-self: flex-start;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 25px 17px 18px;
          background: #0e0d14;
          border-left: 1px solid #272331;
        }

        .lc-logo {
          display: flex;
          align-items: center;
          gap: 11px;
          color: white;
          text-decoration: none;
          padding: 0 5px 25px;
          border-bottom: 1px solid #24202d;
        }

        .lc-logo-mark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: linear-gradient(135deg, #c084fc, #7e22ce);
          color: #170a25;
          font-size: 25px;
          font-weight: 900;
          box-shadow: 0 5px 25px #a855f733;
        }

        .lc-logo strong,
        .lc-logo small {
          display: block;
        }

        .lc-logo strong {
          font-size: 17px;
          letter-spacing: -0.5px;
        }

        .lc-logo small {
          margin-top: 4px;
          color: #8e849d;
          font-size: 8px;
          letter-spacing: 2px;
        }

        .lc-user-mini {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 21px 3px;
          border-bottom: 1px solid #24202d;
          min-width: 0;
        }

        .lc-mini-avatar,
        .lc-avatar-large {
          overflow: hidden;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #6d28d9, #c084fc);
          color: white;
          font-weight: 800;
        }

        .lc-mini-avatar {
          width: 41px;
          height: 41px;
          border-radius: 14px;
          font-size: 18px;
        }

        .lc-mini-avatar img,
        .lc-avatar-large img,
        .lc-card-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .lc-mini-details {
          min-width: 0;
        }

        .lc-mini-details strong,
        .lc-mini-details span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lc-mini-details strong {
          font-size: 12px;
          color: #f3eafa;
        }

        .lc-mini-details span {
          margin-top: 6px;
          color: #91889f;
          font-size: 11px;
          direction: ltr;
          text-align: right;
        }

        .lc-nav-label {
          margin: 25px 9px 12px;
          font-size: 10px;
          font-weight: 700;
          color: #756c82;
        }

        .lc-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lc-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 12px 13px;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: #aaa2b7;
          font-family: inherit;
          font-size: 12px;
          text-align: right;
          cursor: pointer;
          transition: 0.2s;
        }

        .lc-nav-item > span:first-child {
          width: 22px;
          font-size: 16px;
          text-align: center;
        }

        .lc-nav-item:hover {
          background: #191622;
          color: white;
        }

        .lc-nav-item.active {
          border-color: #5e3679;
          background: linear-gradient(90deg, #29183b, #1c1526);
          color: #e8c8ff;
        }

        .lc-nav-count {
          margin-right: auto;
          padding: 3px 7px;
          border-radius: 7px;
          background: #30203f;
          color: #dfb7ff;
          font-size: 10px;
        }

        .lc-sidebar-bottom {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 20px;
        }

        .lc-public-link,
        .lc-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px;
          border: 1px solid #30263c;
          border-radius: 11px;
          color: #dfc4fa;
          background: #191321;
          text-decoration: none;
          font-size: 11px;
          font-family: inherit;
          cursor: pointer;
        }

        .lc-public-link span,
        .lc-logout span {
          font-size: 16px;
        }

        .lc-logout {
          border-color: transparent;
          background: transparent;
          color: #a49bad;
        }

        .lc-logout:hover {
          background: #21121c;
          color: #fda4af;
        }

        .lc-main {
          flex: 1;
          min-width: 0;
          padding: 29px clamp(17px, 3vw, 42px) 18px;
        }

        .lc-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 25px;
          border-bottom: 1px solid #24202d;
        }

        .lc-eyebrow,
        .lc-section-number {
          color: #a78bc1;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .lc-topbar h1 {
          margin: 8px 0 0;
          font-size: 26px;
          letter-spacing: -0.8px;
        }

        .lc-view-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 15px;
          border: 1px solid #49325d;
          border-radius: 11px;
          background: #191321;
          color: #e5c6ff;
          text-decoration: none;
          font-size: 11px;
          white-space: nowrap;
        }

        .lc-view-button:hover {
          border-color: #a855f7;
        }

        .lc-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          padding: 13px 15px;
          border: 1px solid;
          border-radius: 12px;
          font-size: 12px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .lc-alert.is-error {
          border-color: #6c303e;
          background: #2b151e;
          color: #fda4af;
        }

        .lc-alert.is-success {
          border-color: #285743;
          background: #10251c;
          color: #86efac;
        }

        .lc-alert button {
          margin-right: auto;
          border: 0;
          background: transparent;
          color: inherit;
          font-size: 20px;
          cursor: pointer;
        }

        .lc-workspace {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(270px, 340px);
          gap: 24px;
          align-items: start;
          padding-top: 24px;
        }

        .lc-editor {
          min-width: 0;
        }

        .lc-panel {
          padding: clamp(17px, 2.2vw, 27px);
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--panel);
          box-shadow: 0 15px 50px #00000012;
        }

        .lc-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 25px;
        }

        .lc-panel-heading h2 {
          margin: 9px 0 7px;
          font-size: 21px;
          letter-spacing: -0.5px;
        }

        .lc-panel-heading p {
          max-width: 570px;
          margin: 0;
          color: #9c95a8;
          font-size: 11px;
          line-height: 1.9;
        }

        .lc-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px 16px;
        }

        .lc-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }

        .lc-field > span {
          color: #d5cedf;
          font-size: 11px;
          font-weight: 700;
        }

        .lc-field input,
        .lc-field textarea,
        .lc-search input {
          width: 100%;
          min-width: 0;
          outline: none;
          border: 1px solid #332e3d;
          border-radius: 10px;
          background: #0e0d14;
          color: #f7f2fc;
          font: inherit;
          font-size: 12px;
          transition: 0.2s;
        }

        .lc-field input {
          min-height: 44px;
          padding: 0 13px;
        }

        .lc-field textarea {
          min-height: 120px;
          padding: 13px;
          resize: vertical;
          line-height: 1.9;
        }

        .lc-field input:focus,
        .lc-field textarea:focus,
        .lc-search input:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 3px #a855f71a;
        }

        .lc-field input::placeholder,
        .lc-field textarea::placeholder,
        .lc-search input::placeholder {
          color: #625b6d;
        }

        .lc-field small {
          color: #81798d;
          font-size: 10px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .lc-field-full {
          grid-column: 1 / -1;
        }

        .lc-username-input {
          display: flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid #332e3d;
          border-radius: 10px;
          background: #0e0d14;
        }

        .lc-username-input:focus-within {
          border-color: #a855f7;
          box-shadow: 0 0 0 3px #a855f71a;
        }

        .lc-username-input > span {
          padding: 0 12px;
          color: #bd8be7;
          direction: ltr;
        }

        .lc-username-input input {
          border: 0;
          box-shadow: none !important;
          background: transparent;
          direction: ltr;
          text-align: left;
        }

        .lc-avatar-editor {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 17px;
          margin-bottom: 25px;
          border: 1px solid #30283b;
          border-radius: 14px;
          background: #17141f;
        }

        .lc-avatar-large {
          width: 78px;
          height: 78px;
          border-radius: 23px;
          font-size: 32px;
        }

        .lc-avatar-info {
          min-width: 0;
        }

        .lc-avatar-info strong {
          font-size: 13px;
        }

        .lc-avatar-info p {
          margin: 7px 0 12px;
          color: #91899e;
          font-size: 10px;
          line-height: 1.8;
        }

        .lc-secondary-button,
        .lc-add-button {
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid #704697;
          border-radius: 9px;
          background: #2a1a3b;
          color: #e6c9ff;
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
          transition: 0.2s;
        }

        .lc-secondary-button:hover,
        .lc-add-button:hover {
          background: #412258;
        }

        .lc-secondary-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .lc-info-note {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-top: 23px;
          padding: 15px;
          border: 1px solid #352644;
          border-radius: 12px;
          background: linear-gradient(120deg, #20152d, #15121c);
        }

        .lc-info-note > span {
          color: #d8b4fe;
          font-size: 20px;
        }

        .lc-info-note strong {
          font-size: 11px;
        }

        .lc-info-note p {
          margin: 6px 0 0;
          color: #a59aaf;
          font-size: 10px;
          line-height: 1.9;
        }

        .lc-inline-form {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
          gap: 12px;
          align-items: end;
        }

        .lc-add-button {
          min-height: 44px;
          white-space: nowrap;
        }

        .lc-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 22px;
        }

        .lc-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 13px;
          border: 1px solid #302b39;
          border-radius: 12px;
          background: #17151e;
        }

        .lc-list-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #2b1c3a;
          color: #dfb7ff;
          font-size: 17px;
        }

        .lc-list-text {
          flex: 1;
          min-width: 0;
        }

        .lc-list-text strong,
        .lc-list-text span {
          display: block;
          overflow-wrap: anywhere;
        }

        .lc-list-text strong {
          font-size: 12px;
        }

        .lc-list-text span {
          margin-top: 6px;
          color: #968da4;
          font-size: 10px;
        }

        .lc-delete-button {
          flex-shrink: 0;
          padding: 7px 10px;
          border: 1px solid #55303c;
          border-radius: 8px;
          background: #291820;
          color: #fda4af;
          font-family: inherit;
          font-size: 10px;
          cursor: pointer;
        }

        .lc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 35px 15px;
          border: 1px dashed #383142;
          border-radius: 13px;
          text-align: center;
        }

        .lc-empty > span {
          margin-bottom: 12px;
          color: #d8b4fe;
          font-size: 26px;
        }

        .lc-empty strong {
          font-size: 12px;
        }

        .lc-empty p {
          margin: 8px 0 0;
          color: #958ca3;
          font-size: 11px;
          line-height: 1.8;
        }

        .lc-count-pill {
          padding: 8px 10px;
          border: 1px solid #49305d;
          border-radius: 9px;
          background: #261831;
          color: #e2bfff;
          font-size: 10px;
          white-space: nowrap;
        }

        .lc-app-toolbar {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .lc-search {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .lc-search > span {
          color: #b69acb;
          font-size: 21px;
        }

        .lc-search input {
          min-height: 42px;
          padding: 0 12px;
        }

        .lc-category-list {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-bottom: 19px;
        }

        .lc-category-list button {
          padding: 8px 11px;
          border: 1px solid #342e3d;
          border-radius: 9px;
          background: #15131c;
          color: #a9a0b6;
          font-family: inherit;
          font-size: 10px;
          cursor: pointer;
          transition: 0.2s;
        }

        .lc-category-list button.active {
          border-color: #7e4aa4;
          background: #2b1b3b;
          color: #e4c8ff;
        }

        .lc-app-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .lc-app-field {
          display: block;
          min-width: 0;
          padding: 11px;
          border: 1px solid #302b39;
          border-radius: 11px;
          background: #17151e;
          transition: 0.2s;
        }

        .lc-app-field.is-filled {
          border-color: #67427e;
          background: #201829;
        }

        .lc-app-field-top {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          margin-bottom: 10px;
        }

        .lc-app-dot {
          display: grid;
          place-items: center;
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #30203f;
          color: #e2c0ff;
          font-size: 11px;
          font-weight: 800;
        }

        .lc-app-name {
          min-width: 0;
          color: #ded6e8;
          font-size: 10px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .lc-app-check {
          margin-right: auto;
          color: #86efac;
          font-size: 13px;
        }

        .lc-app-field input {
          width: 100%;
          min-width: 0;
          height: 35px;
          padding: 0 9px;
          border: 1px solid #342e3d;
          border-radius: 8px;
          outline: none;
          background: #0f0e15;
          color: #eee5f8;
          font-family: inherit;
          font-size: 10px;
        }

        .lc-app-field input:focus {
          border-color: #a855f7;
        }

        .lc-app-field input::placeholder {
          color: #625b6d;
        }

        .lc-design-section {
          margin-top: 27px;
          padding-top: 22px;
          border-top: 1px solid #292431;
        }

        .lc-design-section h3 {
          margin: 0 0 15px;
          font-size: 12px;
          color: #e3dbe9;
        }

        .lc-template-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .lc-template-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
          min-height: 112px;
          padding: 14px;
          border: 1px solid #332d3d;
          border-radius: 12px;
          background: #17151e;
          color: #eee7f5;
          text-align: right;
          cursor: pointer;
          transition: 0.2s;
        }

        .lc-template-card.active {
          border-color: #a855f7;
          background: #251832;
          box-shadow: 0 0 0 1px #a855f733;
        }

        .lc-template-symbol {
          color: #d8b4fe;
          font-size: 21px;
          font-weight: 800;
        }

        .lc-template-card strong {
          font-size: 11px;
        }

        .lc-template-card small {
          color: #978ca5;
          font-size: 10px;
          line-height: 1.7;
        }

        .lc-template-selected {
          position: absolute;
          top: 10px;
          left: 10px;
          color: #d8b4fe;
        }

        .lc-preset-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 9px;
        }

        .lc-preset-card {
          min-width: 0;
          padding: 6px;
          border: 1px solid #332d3d;
          border-radius: 10px;
          background: #17151e;
          color: #d9d0e3;
          cursor: pointer;
        }

        .lc-preset-card.active {
          border-color: #c084fc;
          box-shadow: 0 0 0 1px #c084fc44;
        }

        .lc-preset-swatch {
          position: relative;
          display: block;
          height: 48px;
          border-radius: 7px;
          overflow: hidden;
        }

        .lc-preset-swatch i {
          position: absolute;
          top: 9px;
          left: 9px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 0 12px currentColor;
        }

        .lc-preset-card strong {
          display: block;
          padding: 8px 2px 4px;
          font-size: 9px;
          overflow-wrap: anywhere;
        }

        .lc-background-modes {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .lc-background-modes button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 72px;
          border: 1px solid #332d3d;
          border-radius: 10px;
          background: #17151e;
          color: #b4a9c1;
          font-family: inherit;
          font-size: 10px;
          cursor: pointer;
        }

        .lc-background-modes button > span {
          font-size: 20px;
        }

        .lc-background-modes button.active {
          border-color: #a855f7;
          background: #291b38;
          color: #e5c7ff;
        }

        .lc-color-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .lc-color-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
          padding: 12px;
          border: 1px solid #332d3d;
          border-radius: 10px;
          background: #17151e;
        }

        .lc-color-control > span {
          min-width: 0;
          color: #c9bfd4;
          font-size: 11px;
        }

        .lc-color-inputs {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .lc-color-inputs input[type="color"] {
          width: 31px;
          height: 31px;
          padding: 2px;
          border: 1px solid #4b4257;
          border-radius: 8px;
          background: #0d0c12;
          cursor: pointer;
        }

        .lc-color-inputs input[type="text"] {
          width: 78px;
          min-width: 0;
          padding: 7px 5px;
          border: 1px solid #332d3d;
          border-radius: 7px;
          background: #0d0c12;
          color: #e7dff0;
          outline: none;
          font-size: 10px;
          text-align: center;
        }

        .lc-texture-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .lc-texture-card {
          min-width: 0;
          padding: 6px;
          border: 1px solid #332d3d;
          border-radius: 10px;
          background: #17151e;
          color: #e1d7ea;
          cursor: pointer;
        }

        .lc-texture-card.active {
          border-color: #c084fc;
          box-shadow: 0 0 0 1px #c084fc44;
        }

        .lc-texture-preview {
          display: block;
          height: 67px;
          border-radius: 7px;
        }

        .lc-texture-card strong {
          display: block;
          padding: 9px 3px 5px;
          font-size: 10px;
        }

        .lc-hint {
          color: #92889f;
          font-size: 10px;
          line-height: 1.9;
        }

        .lc-range-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .lc-range-heading h3 {
          margin-bottom: 12px;
        }

        .lc-range-heading > span {
          color: #d8b4fe;
          font-size: 11px;
        }

        .lc-range {
          width: 100%;
          accent-color: #c084fc;
          cursor: pointer;
        }

        .lc-range-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          color: #847a91;
          font-size: 10px;
        }

        .lc-save-bar {
          position: sticky;
          bottom: 10px;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 16px;
          padding: 13px 15px;
          border: 1px solid #382c47;
          border-radius: 13px;
          background: #17131eeb;
          backdrop-filter: blur(15px);
          box-shadow: 0 12px 40px #00000030;
        }

        .lc-save-bar > span {
          color: #aaa0b7;
          font-size: 10px;
          line-height: 1.8;
        }

        .lc-save-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 42px;
          padding: 0 18px;
          border: 1px solid #c084fc;
          border-radius: 10px;
          background: linear-gradient(135deg, #d8b4fe, #a855f7);
          color: #210d31;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          transition: 0.2s;
        }

        .lc-save-button:hover {
          filter: brightness(1.08);
          box-shadow: 0 5px 22px #a855f733;
        }

        .lc-save-button:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .lc-button-spinner {
          width: 13px;
          height: 13px;
          border: 2px solid #ffffff70;
          border-top-color: #210d31;
          border-radius: 50%;
          animation: lc-spin 0.7s linear infinite;
        }

        @keyframes lc-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .lc-preview-column {
          position: sticky;
          top: 20px;
          min-width: 0;
        }

        .lc-preview-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .lc-preview-heading h2 {
          margin: 8px 0 0;
          font-size: 17px;
        }

        .lc-live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 9px;
          border: 1px solid #2c4b39;
          border-radius: 8px;
          background: #122319;
          color: #86efac;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .lc-live-indicator i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 9px #4ade80;
        }

        .lc-preview-stage {
          padding: 12px;
          border: 1px solid #292432;
          border-radius: 17px;
          background:
            radial-gradient(ellipse at top, #282033 0, transparent 60%),
            #100e16;
        }

        .lc-preview-card {
          position: relative;
          min-height: 340px;
          padding: 20px;
          overflow: hidden;
          border: 1px solid #ffffff1c;
          box-shadow: 0 25px 50px #00000038;
          transition:
            background 0.2s,
            border-radius 0.2s,
            color 0.2s;
        }

        .lc-preview-card::before {
          content: "";
          position: absolute;
          width: 170px;
          height: 170px;
          top: -100px;
          left: -60px;
          border-radius: 50%;
          background: var(--card-accent);
          opacity: 0.15;
          filter: blur(20px);
          pointer-events: none;
        }

        .lc-card-top,
        .lc-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          position: relative;
        }

        .lc-card-brand {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 800;
          direction: ltr;
        }

        .lc-card-brand-icon,
        .lc-card-bottom-mark {
          display: grid;
          place-items: center;
          width: 23px;
          height: 23px;
          border-radius: 7px;
          background: var(--card-accent);
          color: #180d22;
          font-weight: 900;
        }

        .lc-card-chip {
          color: inherit;
          opacity: 0.7;
          font-size: 7px;
          letter-spacing: 1.2px;
        }

        .lc-card-person {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 34px;
          position: relative;
        }

        .lc-card-avatar {
          width: 67px;
          height: 67px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 2px solid var(--card-accent);
          border-radius: 19px;
          background: #342147;
          color: white;
          font-size: 27px;
          font-weight: 900;
        }

        .lc-card-person h3 {
          margin: 0;
          font-size: 18px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .lc-card-person p {
          margin: 5px 0 0;
          color: inherit;
          opacity: 0.72;
          font-size: 10px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .lc-card-bio {
          margin: 16px 0 0;
          font-size: 10px;
          line-height: 1.9;
          opacity: 0.82;
          overflow-wrap: anywhere;
        }

        .lc-card-location {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 9px;
          opacity: 0.8;
        }

        .lc-card-location span {
          color: var(--card-accent);
        }

        .lc-card-divider {
          height: 1px;
          margin: 20px 0 15px;
          background: currentColor;
          opacity: 0.13;
        }

        .lc-card-links {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .lc-card-social {
          display: inline-flex;
          align-items: center;
          padding: 7px 9px;
          border: 1px solid #ffffff20;
          border-radius: 8px;
          background: var(--card-button);
          color: inherit;
          font-size: 8px;
          overflow-wrap: anywhere;
          max-width: 100%;
        }

        .lc-card-bottom {
          margin-top: 24px;
          padding-top: 12px;
          border-top: 1px solid #ffffff20;
          font-size: 9px;
          opacity: 0.8;
          direction: ltr;
        }

        .lc-card-bottom-mark {
          width: 21px;
          height: 21px;
          font-size: 11px;
        }

        .lc-preview-caption {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 14px;
          color: #a39aaf;
          font-size: 10px;
        }

        .lc-preview-caption span {
          color: #c084fc;
        }

        .lc-preview-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 13px;
        }

        .lc-stat {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
          padding: 12px 9px;
          border: 1px solid #292432;
          border-radius: 12px;
          background: #121019;
        }

        .lc-stat-icon {
          font-size: 16px;
          color: #d8b4fe;
        }

        .lc-stat strong {
          display: block;
          font-size: 17px;
        }

        .lc-stat small {
          display: block;
          margin-top: 5px;
          color: #93899f;
          font-size: 9px;
          line-height: 1.7;
        }

        .lc-preview-tip {
          display: flex;
          gap: 10px;
          margin-top: 13px;
          padding: 13px;
          border: 1px solid #30253c;
          border-radius: 12px;
          background: #17121f;
        }

        .lc-preview-tip > span {
          color: #d8b4fe;
          font-size: 18px;
        }

        .lc-preview-tip strong {
          font-size: 10px;
        }

        .lc-preview-tip p {
          margin: 6px 0 0;
          color: #a39aad;
          font-size: 9px;
          line-height: 1.9;
        }

        .lc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 24px;
          margin-top: 25px;
          border-top: 1px solid #24202d;
          color: #746b81;
          font-size: 9px;
        }

        @media (max-width: 1150px) {
          .lc-workspace {
            grid-template-columns: minmax(0, 1fr);
          }

          .lc-preview-column {
            position: static;
          }

          .lc-preview-card {
            min-height: 310px;
          }

          .lc-preview-stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 780px) {
          .lc-sidebar {
            width: 70px;
            min-width: 70px;
            padding: 16px 8px;
          }

          .lc-logo {
            justify-content: center;
            padding: 0 0 18px;
          }

          .lc-logo > span:last-child,
          .lc-mini-details,
          .lc-nav-label,
          .lc-nav-item > span:nth-child(2),
          .lc-nav-count,
          .lc-public-link,
          .lc-logout {
            display: none;
          }

          .lc-user-mini {
            justify-content: center;
            padding: 17px 0;
          }

          .lc-mini-avatar {
            width: 39px;
            height: 39px;
          }

          .lc-nav {
            margin-top: 18px;
          }

          .lc-nav-item {
            justify-content: center;
            padding: 12px 5px;
          }

          .lc-nav-item > span:first-child {
            font-size: 18px;
          }

          .lc-sidebar-bottom {
            align-items: center;
          }

          .lc-sidebar-bottom::after {
            content: "⇥";
            display: grid;
            place-items: center;
            width: 40px;
            height: 40px;
            border: 1px solid #30263c;
            border-radius: 11px;
            color: #c4b5d6;
          }

          .lc-main {
            padding: 22px 16px;
          }

          .lc-topbar h1 {
            font-size: 22px;
          }

          .lc-workspace {
            gap: 20px;
          }
        }

        @media (max-width: 560px) {
          .lc-dashboard {
            font-size: 14px;
          }

          .lc-main {
            padding: 17px 10px;
          }

          .lc-topbar {
            align-items: flex-start;
          }

          .lc-topbar h1 {
            font-size: 19px;
          }

          .lc-eyebrow {
            font-size: 8px;
          }

          .lc-view-button {
            padding: 10px;
            font-size: 10px;
          }

          .lc-panel {
            padding: 16px 12px;
            border-radius: 14px;
          }

          .lc-panel-heading h2 {
            font-size: 18px;
          }

          .lc-form-grid,
          .lc-app-grid,
          .lc-color-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .lc-inline-form {
            grid-template-columns: minmax(0, 1fr);
          }

          .lc-add-button {
            width: 100%;
          }

          .lc-preset-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .lc-texture-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .lc-background-modes {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .lc-template-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .lc-avatar-editor {
            align-items: flex-start;
            padding: 12px;
          }

          .lc-avatar-large {
            width: 61px;
            height: 61px;
            border-radius: 17px;
          }

          .lc-save-bar {
            align-items: stretch;
            flex-direction: column;
          }

          .lc-save-button {
            width: 100%;
          }

          .lc-preview-card {
            padding: 16px;
          }

          .lc-card-person h3 {
            font-size: 16px;
          }

          .lc-card-avatar {
            width: 57px;
            height: 57px;
          }

          .lc-preview-stats {
            gap: 6px;
          }

          .lc-stat {
            padding: 10px 7px;
          }

          .lc-stat strong {
            font-size: 15px;
          }

          .lc-stat small {
            font-size: 8px;
          }

          .lc-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeValue = validColor(value, "#C084FC");

  return (
    <label className="lc-color-control">
      <span>{label}</span>

      <div className="lc-color-inputs">
        <input
          type="color"
          value={safeValue}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
        />

        <input
          type="text"
          value={safeValue}
          maxLength={7}
          dir="ltr"
          onChange={(event) => {
            const next = event.target.value;
            if (/^#[0-9a-fA-F]{6}$/.test(next)) {
              onChange(next);
            }
          }}
          aria-label={`${label} hex`}
        />
      </div>
    </label>
  );
}
