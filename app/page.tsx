import Link from "next/link";
import AppInstallActions from "./app-install-actions";

const features = [
  ["پروفایل اختصاصی", "یک صفحهٔ شخصی برای معرفی تو و مهارت‌هایت."],
  ["لینک‌های اجتماعی", "شبکه‌های اجتماعی و لینک‌های مهمت را یک‌جا نمایش بده."],
  ["طراحی قابل شخصی‌سازی", "رنگ، پس‌زمینه و ظاهر پروفایل را مطابق سلیقه‌ات تغییر بده."],
];

export default function HomePage() {
  return (
    <main className="lc-home-profile" dir="rtl">
      <header className="lc-home-header">
        <Link className="brand" href="/" aria-label="LumoCard">ϟ Lumo<span>Card</span></Link>
        <Link className="button button-small" href="/app-access">حساب کاربری</Link>
      </header>
      <section className="lc-home-hero">
        <div className="lc-home-avatar" aria-hidden="true">L</div>
        <p className="eyebrow"><span className="dot"/> کارت دیجیتال شخصی تو</p>
        <h1>همه‌چیز دربارهٔ تو،<br/><span className="gradient-text">در یک پروفایل زیبا.</span></h1>
        <p className="hero-copy">پروفایل دیجیتال خودت را بساز، لینک‌های مهمت را کنار هم قرار بده و با یک آدرس اختصاصی، حرفه‌ای‌تر معرفی شو.</p>
        <div className="hero-actions">
          <Link className="button" href="/app-access">شروع کن ←</Link>
          <a className="button button-ghost" href="#download-app">دریافت اپلیکیشن</a>
        </div>
        <div className="lc-home-social-preview" aria-label="نمونه لینک‌ها">
          <span>Instagram</span><span>Telegram</span><span>WhatsApp</span><span>Website</span>
        </div>
      </section>
      <section className="lc-home-features">
        <div className="section-heading"><p className="eyebrow">LumoCard</p><h2>پروفایلی که شبیه خودت است.</h2></div>
        <div className="feature-grid">{features.map(([title, desc], i) => <article className="feature" key={title}><div className="feature-number">0{i + 1}</div><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </section>
      <section id="download-app" className="lc-home-download">
        <h2>همراهت، روی موبایل.</h2>
        <p>اندروید: دانلود APK پس از انتشار فایل. آیفون: افزودن وب‌اپ به صفحهٔ اصلی از Safari.</p>
        <AppInstallActions />
      </section>
      <footer className="footer"><Link className="brand" href="/">ϟ Lumo<span>Card</span></Link><span>© LumoCard</span></footer>
    </main>
  );
}
