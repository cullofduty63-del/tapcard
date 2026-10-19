import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LumoCard | کارت دیجیتال شما",
  description: "کارت دیجیتال حرفه‌ای با لینک اختصاصی",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "LumoCard" },
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
