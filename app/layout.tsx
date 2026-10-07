import "./globals.css";

export const metadata = {
  title: "TapCard — کارت ویزیت هوشمند",
  description: "کارت ویزیت هوشمند NFC برای کسب‌وکارها"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
