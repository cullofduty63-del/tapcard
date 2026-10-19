import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "LumoCard", short_name: "LumoCard", description: "کارت ویزیت دیجیتال هوشمند", start_url: "/", display: "standalone", background_color: "#08080b", theme_color: "#111014", lang: "fa", dir: "rtl", icons: [] }; }
