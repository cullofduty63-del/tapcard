```tsx
import Link from "next/link";

const features = [
  {
    number: "01",
    icon: "✦",
    title: "کارت دیجیتال اختصاصی",
    description:
      "یک کارت دیجیتال منحصربه‌فرد با نام، عکس، اطلاعات تماس و لینک‌های اختصاصی خودت.",
  },
  {
    number: "02",
    icon: "◈",
    title: "همه ارتباطات، یک‌جا",
    description:
      "اینستاگرام، تلگرام، واتساپ و وب‌سایتت را در یک صفحه شیک جمع کن.",
  },
  {
    number: "03",
    icon: "↗",
    title: "ویرایش آسان",
    description:
      "اطلاعات کارتت را به‌روزرسانی کن تا مخاطب‌ها همیشه به اطلاعات جدیدت دسترسی داشته باشند.",
  },
];

export default function Home() {
  return (
    <main className="lumo-home" dir="rtl">
      <nav className="lumo-nav">
        <Link href="/" className="lumo-logo">
          <span className="logo-icon">L</span>
          <span>
            Lumo<span className="logo-light">Card</span>
          </span>
        </Link>

        <div className="nav-links">
          <a href="#features">امکانات</a>
          <a href="#about">درباره ما</a>
        </div>

        <Link href="/login" className="login-btn">
          ورود به حساب <span>↗</span>
        </Link>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="status-dot" />
            نسل جدید کارت ویزیت دیجیتال
          </div>

          <h1>
            ارتباطاتت رو
            <br />
            <span className="gradient-text">متفاوت بساز.</span>
          </h1>

          <p className="hero-description">
            کارت ویزیت سنتی رو فراموش کن.
            <br />
            با LumoCard، هویت دیجیتال خودت رو
            <br className="desktop-break" />
            به شکلی مدرن و حرفه‌ای معرفی کن.
          </p>

          <div className="hero-actions">
            <a
              href="https://t.me/lumusupport"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              خرید از ما
              <span className="btn-arrow">↗</span>
            </a>

            <a href="#features" className="secondary-btn">
              کشف امکانات <span>↓</span>
            </a>
          </div>

          <div className="hero-note">
            <span className="note-check">✓</span>
            معرفی حرفه‌ای تو، در یک لینک اختصاصی
          </div>
        </div>

        <div className="hero-visual">
          <div className="orb orb-one" />
          <div className="orb orb-two" />

          <div className="floating-label label-top">
            <span className="mini-dot" />
            هویت دیجیتال تو
          </div>

          <div className="business-card">
            <div className="card-top">
              <div className="card-brand">
                <span className="mini-logo">L</span>
                LumoCard
              </div>
              <span className="nfc-icon">⌁</span>
            </div>

            <div className="profile-avatar">
              <span>L</span>
              <i />
            </div>

            <div className="profile-name">نام شما</div>
            <div className="profile-job">متخصص و صاحب کسب‌وکار</div>

            <div className="card-divider" />

            <div className="social-row">
              <span className="social-icon">◎</span>
              <span className="social-icon">◉</span>
              <span className="social-icon">↗</span>
              <span className="social-icon">✉</span>
            </div>

            <div className="card-bottom">
              <span>YOUR DIGITAL IDENTITY</span>
              <span className="card-chip">✦</span>
            </div>
          </div>

          <div className="floating-label label-bottom">
            <span className="label-spark">✦</span>
            ساده، شیک، هوشمند
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div>
          <span className="stat-symbol">✦</span>
          <span>طراحی اختصاصی</span>
        </div>
        <div>
          <span className="stat-symbol">↗</span>
          <span>اشتراک‌گذاری آسان</span>
        </div>
        <div>
          <span className="stat-symbol">◈</span>
          <span>همیشه در دسترس</span>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-kicker">چرا LUMOCARD؟</span>

          <h2>
            فراتر از یک کارت،
            <br />
            <span className="gradient-text">یک تجربه متفاوت.</span>
          </h2>

          <p>
            تمام چیزهایی که برای معرفی حرفه‌ای خودت نیاز داری،
            در یک صفحه زیبا و کاربردی.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <div className="feature-top">
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-number">{feature.number}</span>
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              <span className="feature-decoration">✦</span>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section" id="about">
        <div className="cta-glow" />

        <span className="section-kicker">وقتشه متفاوت باشی</span>

        <h2>
          هویت دیجیتال تو،
          <br />
          <span className="gradient-text">از اینجا شروع می‌شه.</span>
        </h2>

        <p>
          برای سفارش کارت اختصاصی LumoCard با پشتیبانی ما در ارتباط باش.
        </p>

        <a
          href="https://t.me/lumusupport"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-btn cta-button"
        >
          سفارش کارت دیجیتال <span className="btn-arrow">↗</span>
        </a>
      </section>

      <footer className="lumo-footer">
        <Link href="/" className="lumo-logo footer-logo">
          <span className="logo-icon">L</span>
          <span>
            Lumo<span className="logo-light">Card</span>
          </span>
        </Link>

        <p>ارتباطات بهتر، با یک لمس.</p>

        <a
          href="https://t.me/lumusupport"
          target="_blank"
          rel="noopener noreferrer"
          className="support-link"
        >
          پشتیبانی تلگرام ↗
        </a>

        <span className="copyright">
          © {new Date().getFullYear()} LumoCard
        </span>
      </footer>

      <style jsx>{`
        .lumo-home {
          --bg: #09090b;
          --panel: #111114;
          --white: #f7f7fa;
          --muted: #a1a1aa;
          --purple: #a78bfa;
          --purple-bright: #c4b5fd;

          min-height: 100vh;
          overflow: hidden;
          background: var(--bg);
          color: var(--white);
          font-family: "Vazirmatn", Tahoma, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .lumo-home * {
          box-sizing: border-box;
        }

        .lumo-home a {
          color: inherit;
          text-decoration: none;
        }

        .lumo-nav {
          width: min(1160px, calc(100% - 48px));
          height: 88px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          animation: fadeDown 0.7s ease both;
        }

        .lumo-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          direction: ltr;
          font-family: Arial, sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -1px;
          white-space: nowrap;
        }

        .logo-light {
          color: #a1a1aa;
          font-weight: 400;
        }

        .logo-icon,
        .mini-logo {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          border-radius: 12px;
          background: linear-gradient(135deg, #c4b5fd, #7c3aed);
          color: #fff;
          font-size: 20px;
          font-weight: 900;
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.25);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          color: #a1a1aa;
          font-size: 13px;
        }

        .nav-links a,
        .support-link {
          transition: color 0.2s ease;
        }

        .nav-links a:hover,
        .support-link:hover {
          color: var(--purple-bright);
        }

        .login-btn {
          padding: 11px 18px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          font-size: 12px;
          transition: 0.25s ease;
        }

        .login-btn:hover {
          border-color: #a78bfa;
          background: rgba(167, 139, 250, 0.08);
          transform: translateY(-2px);
        }

        .login-btn span {
          margin-right: 8px;
          color: var(--purple-bright);
        }

        .hero {
          width: min(1160px, calc(100% - 48px));
          min-height: 590px;
          margin: auto;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          align-items: center;
          gap: 50px;
          padding: 70px 0 90px;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          animation: fadeUp 0.8s 0.1s ease both;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          border: 1px solid rgba(196, 181, 253, 0.16);
          border-radius: 999px;
          background: rgba(167, 139, 250, 0.06);
          color: #d4d4d8;
          font-size: 11px;
        }

        .status-dot,
        .mini-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 12px #a78bfa;
        }

        .hero h1 {
          margin: 28px 0 22px;
          font-size: clamp(42px, 5.1vw, 70px);
          line-height: 1.35;
          font-weight: 900;
          letter-spacing: -2.5px;
        }

        .gradient-text {
          color: #c4b5fd;
          background: linear-gradient(100deg, #fff 0%, #c4b5fd 38%, #8b5cf6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          color: #a1a1aa;
          font-size: 14px;
          line-height: 2.3;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 13px;
          margin-top: 30px;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 15px 22px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 14px;
          background: linear-gradient(110deg, #a78bfa, #7c3aed);
          color: white;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 8
```
