const jobs = [
  "💈 آرایشگر",
  "📸 عکاس",
  "🧑‍🏫 مدرس",
  "💻 برنامه‌نویس",
  "🎨 طراح",
  "🏪 فروشگاه",
  "🍔 رستوران و کافه",
  "🏠 مشاور املاک",
  "🚗 خدمات خودرو",
  "💼 فریلنسر"
];

const features = [
  ["📡", "NFC + QR", "فقط با یک لمس یا اسکن، پروفایل کاری باز می‌شود."],
  ["📇", "ذخیره مخاطب", "اطلاعات تماس را مستقیم در مخاطبین ذخیره کن."],
  ["🧩", "امکانات مخصوص شغل", "رزرو، نمونه‌کار، منو، خدمات و محصولات."],
  ["📊", "آمار", "بازدید و کلیک‌های پروفایل را مشاهده کن."],
  ["🎨", "طراحی اختصاصی", "ظاهر حرفه‌ای متناسب با برند خودت."],
  ["📱", "موبایل‌فرندلی", "برای گوشی و تبلت کاملاً بهینه شده."]
];

export default function Home() {
  return (
    <>
      <header className="navbar">
        <div className="logo">
          Tap<span>Card</span>
        </div>

        <nav>
          <a href="#features">امکانات</a>
          <a href="#jobs">مشاغل</a>
          <a href="/samiyar">نمونه کارت</a>
        </nav>

        <a className="button" href="#start">
          شروع کنید
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="badge">
            کارت ویزیت هوشمند نسل جدید
          </div>

          <h1>
            یک لمس.
            <br />
            <span>یک ارتباط.</span>
          </h1>

          <p>
            با TapCard کارت ویزیتت را به یک پروفایل کاری
            حرفه‌ای تبدیل کن؛ NFC، QR، شبکه‌های اجتماعی
            و ابزارهای مخصوص شغلت در یک صفحه.
          </p>

          <div className="actions">
            <a className="button" href="/samiyar">
              دیدن نمونه کارت
            </a>

            <a className="button secondary" href="#features">
              امکانات
            </a>
          </div>
        </section>

        <section id="features" className="section">
          <h2>همه‌چیز در یک کارت</h2>

          <p className="subtitle">
            ساده برای مشتری، قدرتمند برای کسب‌وکار.
          </p>

          <div className="grid">
            {features.map(([icon, title, text]) => (
              <div className="card" key={title}>
                <div className="icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="jobs" className="section">
          <h2>برای هر شغلی</h2>

          <p className="subtitle">
            امکانات صفحه بر اساس شغل انتخابی فعال می‌شود.
          </p>

          <div className="jobs">
            {jobs.map((job) => (
              <div className="job" key={job}>
                {job}
              </div>
            ))}
          </div>
        </section>

        <section id="start" className="cta">
          <h2>کارت هوشمندت رو بساز</h2>

          <p>
            همه اطلاعات کاری تو، در یک صفحه حرفه‌ای.
          </p>

          <a className="button" href="/samiyar">
            مشاهده نمونه
          </a>
        </section>
      </main>

      <footer>
        © 2026 TapCard — One tap. Connect.
      </footer>
    </>
  );
}
