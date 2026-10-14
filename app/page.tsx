import Link from "next/link";
const features = [
  ["کارت اختصاصی", "یک لینک کوتاه برای معرفی حرفه‌ای خودت."],
  ["شبکه‌های اجتماعی", "اینستاگرام، تلگرام، واتساپ، یوتیوب و وب‌سایت در یک جا."],
  ["قالب‌های متناسب با شغل", "شخصی، کسب‌وکار، طراح، برنامه‌نویس، تولیدکننده محتوا و فروشگاه."],
];
export default function HomePage() {
  return <main className="landing">
    <nav className="nav container"><Link className="brand" href="/">ϟ Lumo<span>Card</span></Link><div className="nav-actions"><Link className="nav-link" href="/login">ورود</Link><Link className="button button-small" href="/register">ساخت کارت</Link></div></nav>
    <section className="hero container"><div className="eyebrow"><span className="dot"/> کارت دیجیتال، ساده و حرفه‌ای</div><h1>همه‌ی راه‌های ارتباطی‌ات،<br/><span className="gradient-text">در یک کارت زیبا.</span></h1><p className="hero-copy">پروفایل دیجیتال خودت را بساز، قالب مناسب شغلت را انتخاب کن و یک لینک اختصاصی برای معرفی خودت یا کسب‌وکارت داشته باش.</p><div className="hero-actions"><Link className="button" href="/register">شروع کن ←</Link><Link className="button button-ghost" href="/login">از قبل حساب دارم</Link></div>
    <div className="preview-wrap"><div className="preview-card"><div className="preview-top"><span className="preview-logo">ϟ</span><span className="pill">DIGITAL CARD</span></div><div className="avatar-placeholder">LC</div><h2>Samiyar Bornaei</h2><p className="muted">Developer &amp; Content Creator</p><p className="preview-bio">💜 با تکنولوژی، رویاها واقعی می‌شن</p><div className="preview-links"><span>Instagram</span><span>Telegram</span><span>YouTube</span><span>WhatsApp</span></div><div className="preview-url">lumocard.ir/samiyar</div></div><div className="glow glow-one"/><div className="glow glow-two"/></div></section>
    <section className="features container"><div className="section-heading"><p className="eyebrow">چرا LumoCard؟</p><h2>حرفه‌ای معرفی شو.</h2></div><div className="feature-grid">{features.map(([title,desc],i)=><article className="feature" key={title}><div className="feature-number">0{i+1}</div><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
    <section className="cta container"><h2>کارت دیجیتالت رو بساز.</h2><p>ثبت‌نام کن و از داشبورد، کارتت رو ویرایش کن.</p><Link className="button" href="/register">ساخت حساب و کارت ←</Link></section>
    <footer className="footer container"><Link className="brand" href="/">ϟ Lumo<span>Card</span></Link><span>© LumoCard — Smart Business Cards</span></footer>
  </main>;
}
