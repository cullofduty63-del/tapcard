import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LumoCard | کارت دیجیتال شما",
  description: "کارت دیجیتال حرفه‌ای با لینک اختصاصی",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
