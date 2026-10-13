"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Register() {
const [n, setN] = useState("");
const [e, setE] = useState("");
const [p, setP] = useState("");
const [m, setM] = useState("");
const [loading, setLoading] = useState(false);

async function go(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

```
if (loading) return;

setM("");

const username = n.trim().toLowerCase();

if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
  setM("نام کاربری باید ۳ تا ۳۰ کاراکتر انگلیسی، عدد، _ یا - باشد.");
  return;
}

if (p.length < 6) {
  setM("رمز عبور باید حداقل ۶ کاراکتر باشد.");
  return;
}

setLoading(true);

try {
  const { data, error } = await supabase.auth.signUp({
    email: e.trim(),
    password: p,
    options: {
      data: {
        username,
        full_name: n.trim(),
      },
    },
  });

  if (error) {
    setM(error.message);
    return;
  }

  if (!data.user) {
    setM("حساب ساخته نشد. لطفاً دوباره تلاش کن.");
    return;
  }

  setM(
    data.session
      ? "حساب ساخته شد 🎉 حالا می‌تونی وارد داشبورد بشی."
      : "حساب ساخته شد 🎉 ایمیلت رو برای تأیید حساب بررسی کن."
  );
} catch {
  setM("ارتباط با سرور برقرار نشد. دوباره تلاش کن.");
} finally {
  setLoading(false);
}
```

}

return ( <main className="auth"> <div className="box"> <Link className="logo" href="/">
Lumo<span>Card</span> </Link>

```
    <h1>ساخت حساب</h1>

    <form onSubmit={go}>
      <input
        placeholder="نام کاربری انگلیسی"
        value={n}
        onChange={(event) => setN(event.target.value)}
        minLength={3}
        maxLength={30}
        autoComplete="username"
        required
      />

      <input
        type="email"
        placeholder="ایمیل"
        value={e}
        onChange={(event) => setE(event.target.value)}
        autoComplete="email"
        required
      />

      <input
        type="password"
        placeholder="رمز عبور"
        value={p}
        onChange={(event) => setP(event.target.value)}
        minLength={6}
        autoComplete="new-password"
        required
      />

      <button className="button" type="submit" disabled={loading}>
        {loading ? "در حال ساخت حساب..." : "ساخت حساب"}
      </button>
    </form>

    {m && <p role="status">{m}</p>}

    <Link href="/login">ورود</Link>
  </div>
</main>
```

);
}
