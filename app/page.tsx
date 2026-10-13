"use client";

import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/lumocard/";

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
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              اینستاگرام LumoCard
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
          برای سفارش کارت اختصاصی LumoCard از طریق اینستاگرام با ما در ارتباط باش.
        </p>

        <a
          href={INSTAGRAM_URL}
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
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="support-link"
        >
          اینستاگرام LumoCard ↗
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
          box-shadow: 0 8px 35px rgba(124, 58, 237, 0.2);
          transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
        }

        .primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 42px rgba(139, 92, 246, 0.38);
          filter: brightness(1.1);
        }

        .btn-arrow {
          font-family: Arial, sans-serif;
          font-size: 17px;
          direction: ltr;
        }

        .secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 15px 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: #d4d4d8;
          font-size: 12px;
          transition: 0.25s ease;
        }

        .secondary-btn:hover {
          border-color: rgba(196, 181, 253, 0.5);
          background: rgba(255, 255, 255, 0.03);
        }

        .secondary-btn span {
          color: #c4b5fd;
        }

        .hero-note {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 25px;
          color: #71717a;
          font-size: 11px;
        }

        .note-check {
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(167, 139, 250, 0.13);
          color: #c4b5fd;
        }

        .hero-visual {
          position: relative;
          display: grid;
          min-height: 450px;
          place-items: center;
          isolation: isolate;
          animation: fadeUp 1s 0.2s ease both;
        }

        .orb {
          position: absolute;
          z-index: -1;
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
        }

        .orb-one {
          width: 320px;
          height: 320px;
          background: rgba(109, 40, 217, 0.15);
          filter: blur(65px);
          animation: breathe 5s ease-in-out infinite alternate;
        }

        .orb-two {
          width: 170px;
          height: 170px;
          top: 45px;
          right: 15px;
          background: rgba(196, 181, 253, 0.09);
          filter: blur(45px);
          animation: breathe 6s 1s ease-in-out infinite alternate-reverse;
        }

        .business-card {
          position: relative;
          width: min(340px, 85%);
          min-height: 390px;
          padding: 25px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.17);
          border-radius: 27px;
          background: radial-gradient(ellipse at 90% 0%, rgba(139, 92, 246, 0.16), transparent 45%), linear-gradient(145deg, #19191f, #0d0d10 72%);
          box-shadow: 0 35px 90px rgba(0, 0, 0, 0.5), 0 0 65px rgba(124, 58, 237, 0.08), inset 0 1px rgba(255, 255, 255, 0.08);
          transform: rotate(-4deg);
          animation: floatCard 5s ease-in-out infinite;
        }

        .business-card::after {
          position: absolute;
          right: -80px;
          bottom: -100px;
          width: 230px;
          height: 230px;
          border: 1px solid rgba(196, 181, 253, 0.12);
          border-radius: 50%;
          content: "";
          box-shadow: 0 0 0 22px rgba(196, 181, 253, 0.025), 0 0 0 45px rgba(196, 181, 253, 0.02);
          pointer-events: none;
        }

        .card-top,
        .card-brand,
        .card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-brand {
          justify-content: flex-start;
          gap: 9px;
          direction: ltr;
          font-family: Arial, sans-serif;
          font-size: 15px;
          font-weight: 700;
        }

        .mini-logo {
          width: 27px;
          height: 27px;
          border-radius: 8px;
          font-size: 15px;
        }

        .nfc-icon {
          color: #c4b5fd;
          font-family: Arial, sans-serif;
          font-size: 29px;
          transform: rotate(90deg);
        }

        .profile-avatar {
          position: relative;
          display: grid;
          place-items: center;
          width: 76px;
          height: 76px;
          margin-top: 37px;
          border: 1px solid rgba(196, 181, 253, 0.5);
          border-radius: 24px;
          background: linear-gradient(145deg, #8b5cf6, #302044);
          box-shadow: 0 8px 30px rgba(124, 58, 237, 0.2);
          font-size: 35px;
          font-weight: 900;
        }

        .profile-avatar i {
          position: absolute;
          right: -3px;
          bottom: -3px;
          width: 14px;
          height: 14px;
          border: 3px solid #111114;
          border-radius: 50%;
          background: #c4b5fd;
        }

        .profile-name {
          margin-top: 19px;
          font-size: 25px;
          font-weight: 900;
        }

        .profile-job {
          margin-top: 6px;
          color: #a1a1aa;
          font-size: 11px;
        }

        .card-divider {
          height: 1px;
          margin: 22px 0 17px;
          background: rgba(255, 255, 255, 0.1);
        }

        .social-row {
          display: flex;
          gap: 10px;
          direction: ltr;
        }

        .social-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.04);
          color: #d4d4d8;
          font-size: 15px;
        }

        .card-bottom {
          margin-top: 25px;
          color: #71717a;
          font-family: Arial, sans-serif;
          font-size: 8px;
          letter-spacing: 1.4px;
          direction: ltr;
        }

        .card-chip {
          color: #c4b5fd;
          font-size: 17px;
        }

        .floating-label {
          position: absolute;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 14px;
          background: rgba(22, 22, 28, 0.85);
          color: #e4e4e7;
          font-size: 10px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(15px);
        }

        .label-top {
          top: 65px;
          right: 0;
          animation: floatSmall 4s ease-in-out infinite;
        }

        .label-bottom {
          bottom: 55px;
          left: 0;
          animation: floatSmall 4.5s 0.5s ease-in-out infinite;
        }

        .label-spark {
          color: #c4b5fd;
          font-size: 17px;
        }

        .stats-strip {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 55px;
          padding: 27px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.015);
          color: #a1a1aa;
          font-size: 12px;
        }

        .stats-strip > div {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .stat-symbol {
          color: #c4b5fd;
          font-size: 18px;
        }

        .features-section {
          width: min(1100px, calc(100% - 48px));
          margin: auto;
          padding: 110px 0 100px;
          scroll-margin-top: 30px;
        }

        .section-heading {
          max-width: 600px;
          margin: 0 auto 45px;
          text-align: center;
        }

        .section-kicker {
          color: #c4b5fd;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .section-heading h2,
        .cta-section h2 {
          margin: 18px 0;
          font-size: clamp(30px, 4vw, 46px);
          line-height: 1.55;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .section-heading p,
        .cta-section > p {
          color: #a1a1aa;
          font-size: 13px;
          line-height: 2.2;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .feature-card {
          position: relative;
          min-height: 235px;
          padding: 25px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          background: linear-gradient(145deg, #151519, #0e0e11);
          transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-7px);
          border-color: rgba(196, 181, 253, 0.4);
          background: linear-gradient(145deg, #1b1724, #101014);
        }

        .feature-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .feature-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border: 1px solid rgba(196, 181, 253, 0.16);
          border-radius: 15px;
          background: rgba(139, 92, 246, 0.09);
          color: #c4b5fd;
          font-size: 22px;
        }

        .feature-number {
          color: #52525b;
          font-family: Arial, sans-serif;
          font-size: 13px;
        }

        .feature-card h3 {
          margin: 25px 0 10px;
          font-size: 17px;
          font-weight: 800;
        }

        .feature-card p {
          position: relative;
          z-index: 1;
          margin: 0;
          color: #a1a1aa;
          font-size: 12px;
          line-height: 2.2;
        }

        .feature-decoration {
          position: absolute;
          bottom: -25px;
          left: 15px;
          color: rgba(196, 181, 253, 0.04);
          font-size: 95px;
          pointer-events: none;
        }

        .cta-section {
          position: relative;
          margin: 0 24px 70px;
          padding: 75px 20px;
          overflow: hidden;
          border: 1px solid rgba(196, 181, 253, 0.15);
          border-radius: 28px;
          background: linear-gradient(135deg, #17121f, #0e0e12 65%);
          text-align: center;
          scroll-margin-top: 30px;
        }

        .cta-glow {
          position: absolute;
          top: -180px;
          left: 50%;
          width: 400px;
          height: 300px;
          border-radius: 50%;
          background: rgba(124, 58, 237, 0.17);
          filter: blur(90px);
          transform: translateX(-50%);
          pointer-events: none;
        }

        .cta-section > *:not(.cta-glow) {
          position: relative;
        }

        .cta-section h2 {
          margin-bottom: 10px;
        }

        .cta-section > p {
          margin-bottom: 27px;
        }

        .cta-button {
          display: inline-flex;
        }

        .lumo-footer {
          width: min(1160px, calc(100% - 48px));
          min-height: 100px;
          margin: auto;
          padding: 25px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-logo {
          font-size: 18px;
        }

        .footer-logo .logo-icon {
          width: 30px;
          height: 30px;
          font-size: 17px;
        }

        .lumo-footer p,
        .copyright {
          color: #71717a;
          font-size: 11px;
        }

        .support-link {
          color: #c4b5fd !important;
          font-size: 12px;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0) rotate(-4deg);
          }
          50% {
            transform: translateY(-12px) rotate(-2deg);
          }
        }

        @keyframes floatSmall {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes breathe {
          from {
            opacity: 0.6;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1.12);
          }
        }

        @media (max-width: 850px) {
          .hero {
            grid-template-columns: 1fr;
            gap: 15px;
            padding-top: 70px;
          }

          .hero-content {
            text-align: center;
          }

          .hero-actions,
          .hero-note {
            justify-content: center;
          }

          .hero h1 {
            font-size: clamp(43px, 8vw, 65px);
          }

          .hero-visual {
            min-height: 450px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .feature-card {
            min-height: 200px;
          }

          .features-section {
            padding-top: 75px;
          }

          .stats-strip {
            gap: 20px 30px;
          }
        }

        @media (max-width: 520px) {
          .lumo-nav {
            width: calc(100% - 32px);
            height: 72px;
            gap: 10px;
          }

          .lumo-logo {
            gap: 7px;
            font-size: 19px;
          }

          .logo-icon {
            width: 31px;
            height: 31px;
          }

          .nav-links {
            display: none;
          }

          .login-btn {
            padding: 10px 12px;
            font-size: 11px;
          }

          .hero {
            width: calc(100% - 32px);
            padding: 55px 0;
          }

          .hero h1 {
            font-size: 43px;
            letter-spacing: -1.7px;
          }

          .hero-description {
            font-size: 12px;
          }

          .desktop-break {
            display: none;
          }

          .hero-actions {
            gap: 10px;
          }

          .primary-btn,
          .secondary-btn {
            padding: 14px 15px;
            font-size: 11px;
            gap: 10px;
          }

          .hero-visual {
            min-height: 410px;
          }

          .business-card {
            width: 290px;
            min-height: 365px;
            padding: 22px;
          }

          .label-top {
            top: 35px;
            right: -3px;
          }

          .label-bottom {
            bottom: 30px;
            left: -3px;
          }

          .stats-strip {
            font-size: 10px;
            gap: 17px;
          }

          .features-section {
            width: calc(100% - 32px);
            padding: 70px 0;
          }

          .section-heading h2,
          .cta-section h2 {
            font-size: 31px;
          }

          .feature-card {
            padding: 22px;
          }

          .cta-section {
            margin: 0 16px 45px;
            padding: 55px 17px;
          }

          .lumo-footer {
            width: calc(100% - 32px);
            justify-content: center;
            text-align: center;
          }

          .lumo-footer > * {
            width: 100%;
          }

          .footer-logo {
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lumo-home *,
          .lumo-home *::before,
          .lumo-home *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
