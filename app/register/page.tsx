import Link from "next/link";

const templates = [
  ["personal", "✦", "شخصی"],
  ["business", "▣", "کسب‌وکار"],
  ["designer", "✎", "طراح"],
  ["developer", "⌘", "برنامه‌نویس"],
  ["creator", "▶", "تولید محتوا"],
  ["shop", "◇", "فروشگاه"],
  ["cafe", "☕", "کافه"],
  ["beauty", "✧", "آرایشگر"],
];

export default function RegisterPage() {
  return (
    <main className="page-shell">
      <div className="container subnav">
        <Link className="brand" href="/">
          ϟ Lumo<span>Card</span>
        </Link>

        <Link className="nav-link" href="/">
          صفحه اصلی
        </Link>
      </div>

      <section className="panel">
        <h1>کارت دیجیتالت رو بساز ✨</h1>

        <p className="panel-intro">
          حساب بساز، قالب متناسب با کارت رو انتخاب کن و لینک اختصاصی بگیر.
        </p>

        <form
          action="/api/auth/signup"
          method="post"
          className="form-grid"
        >
          <div className="field">
            <label htmlFor="full_name">نام نمایشی *</label>
            <input
              id="full_name"
              name="full_name"
              required
              minLength={2}
              placeholder="Samiyar Bornaei"
            />
          </div>

          <div className="field">
            <label htmlFor="username">آدرس اختصاصی *</label>
            <input
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_-]+"
              placeholder="samiyar"
              dir="ltr"
            />
            <small>فقط حروف انگلیسی، عدد، _ و -</small>
          </div>

          <div className="field full">
            <label htmlFor="password">رمز عبور *</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="حداقل ۸ کاراکتر"
              dir="ltr"
            />
          </div>

          <div className="field full">
            <label htmlFor="job">عنوان شغلی</label>
            <input
              id="job"
              name="job"
              placeholder="مثلاً Developer & Content Creator"
            />
          </div>

          <div className="field full">
            <label>قالب اولیه</label>

            <div className="template-grid">
              {templates.map(([id, icon, title], index) => (
                <label className="template-option" key={id}>
                  <input
                    type="radio"
                    name="template"
                    value={id}
                    defaultChecked={index === 0}
                  />

                  <span className="template-box">
                    <span className="template-icon">{icon}</span>
                    {title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="field full">
            <button className="button form-submit" type="submit">
              ساخت حساب و کارت ←
            </button>
          </div>
        </form>

        <p className="under-form">
          حساب داری؟ <Link href="/login">وارد شو</Link>
        </p>
      </section>
    </main>
  );
}

