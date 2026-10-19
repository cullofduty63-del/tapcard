import PhysicalCardShowcase from "./card-showcase";
import Link from "next/link";
import AppInstallActions from "./app-install-actions";
const features = [
  ["کارت اختصاصی", "یک لینک کوتاه برای معرفی حرفه‌ای خودت."],
  ["شبکه‌های اجتماعی", "اینستاگرام، تلگرام، واتساپ، یوتیوب و وب‌سایت در یک جا."],
  ["قالب‌های متناسب با شغل", "شخصی، کسب‌وکار، طراح، برنامه‌نویس، تولیدکننده محتوا و فروشگاه."],
];
export default function HomePage() {
  return <main className="landing">
    <nav className="nav container"><Link className="brand" href="/">ϟ Lumo<span>Card</span></Link><div className="nav-actions"><Link className="button button-small" href="/app-access">حساب کاربری</Link></div></nav>
    <section className="hero container"><div className="eyebrow"><span className="dot"/> کارت دیجیتال، ساده و حرفه‌ای</div><h1>همه‌ی راه‌های ارتباطی‌ات،<br/><span className="gradient-text">در یک کارت زیبا.</span></h1><p className="hero-copy">پروفایل دیجیتال خودت را بساز، قالب مناسب شغلت را انتخاب کن و یک لینک اختصاصی برای معرفی خودت یا کسب‌وکارت داشته باش.</p><div className="hero-actions"><Link className="button" href="/app-access">ورود یا ثبت‌نام ←</Link><a className="button button-ghost" href="#download-app">دریافت اپلیکیشن</a></div>
    <div className="preview-wrap card-showcase-wrap"><PhysicalCardShowcase /><div className="glow glow-one"/><div className="glow glow-two"/></div></section>
    <section id="download-app" className="features container"><div className="section-heading"><p className="eyebrow">LumoCard App</p><h2>همراهت، روی موبایل.</h2><p>اندروید: نصب وب‌اپ یا دانلود APK پس از آماده‌شدن فایل نهایی. آیفون: افزودن به صفحه اصلی از Safari.</p></div><AppInstallActions /></section>
    <section className="features container"><div className="section-heading"><p className="eyebrow">چرا LumoCard؟</p><h2>حرفه‌ای معرفی شو.</h2></div><div className="feature-grid">{features.map(([title,desc],i)=><article className="feature" key={title}><div className="feature-number">0{i+1}</div><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
    <section className="cta container"><h2>کارت دیجیتالت رو بساز.</h2><p>برای ورود یا ساخت حساب، وارد بخش حساب کاربری شو.</p><Link className="button" href="/app-access">ورود یا ساخت حساب ←</Link></section>
    <footer className="footer container"><Link className="brand" href="/">ϟ Lumo<span>Card</span></Link><span>© LumoCard — Smart Business Cards</span></footer>
  </main>;
}
