"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_ID = "46b6757c-9b3c-4b69-aaa0-5865ef9347a2";

type Customer = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  job: string;
  card_url: string;
};

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [job, setJob] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = session?.user?.id === ADMIN_ID;

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: loginPassword,
    });

    if (error) {
      setMessage("❌ ورود ناموفق بود. ایمیل و رمز عبورت رو بررسی کن.");
    } else if (data.user?.id !== ADMIN_ID) {
      await supabase.auth.signOut();
      setMessage("⛔ این حساب دسترسی ادمین نداره.");
    } else {
      setSession(data.session);
      setMessage("✅ با موفقیت وارد شدی!");
    }

    setLoading(false);
  }

  async function createCustomer(e: React.FormEvent) {
    e.preventDefault();

    if (!session?.access_token) {
      setMessage("❌ لطفاً دوباره وارد حساب ادمین شو.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username,
          full_name: fullName,
          job,
          email: customerEmail,
          password: customerPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(`❌ ${result.error || "ساخت مشتری ناموفق بود."}`);
        return;
      }

      setCustomers((previous) => [result.customer, ...previous]);

      setMessage(
        `✅ مشتری ساخته شد! لینک کارت: ${result.customer.card_url}`
      );

      setUsername("");
      setFullName("");
      setJob("");
      setCustomerEmail("");
      setCustomerPassword("");
    } catch {
      setMessage("❌ ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setCustomers([]);
    setMessage("");
  }

  if (checking) {
    return (
      <main className="screen">
        <p>در حال بررسی حساب...</p>
        <style jsx>{`
          .screen {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #09090d;
            color: white;
            font-family: Arial, sans-serif;
          }
        `}</style>
      </main>
    );
  }

  if (!session || !isAdmin) {
    return (
      <main className="screen">
        <form className="panel" onSubmit={login}>
          <div className="logo">LUMO<span>CARD</span></div>
          <h1>پنل مدیریت</h1>
          <p>برای ورود به پنل، حساب ادمین رو وارد کن.</p>

          <label>ایمیل ادمین</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />

          <label>رمز عبور</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="رمز عبور"
            required
          />

          <button disabled={loading}>
            {loading ? "در حال ورود..." : "ورود به پنل"}
          </button>

          {message && <div className="message">{message}</div>}
        </form>

        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="screen">
      <header className="topbar">
        <a className="logo" href="/">
          LUMO<span>CARD</span>
        </a>
        <button className="logout" onClick={logout}>
          خروج از حساب
        </button>
      </header>

      <section className="content">
        <div className="welcome">
          <span className="badge">ADMIN PANEL</span>
          <h1>مدیریت مشتری‌ها</h1>
          <p>حساب بساز و برای هر مشتری یک کارت دیجیتال اختصاصی ایجاد کن.</p>
        </div>

        <form className="panel" onSubmit={createCustomer}>
          <h2>＋ ساخت مشتری جدید</h2>
          <p className="muted">
            اطلاعات مشتری رو وارد کن تا حساب و کارت اختصاصی براش ساخته بشه.
          </p>

          <div className="grid">
            <div>
              <label>نام کامل</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثلاً Samiyar Bornaei"
                required
              />
            </div>

            <div>
              <label>نام کاربری کارت</label>
              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                  )
                }
                placeholder="samiyar"
                minLength={3}
                maxLength={30}
                pattern="[a-z0-9_-]{3,30}"
                required
              />
              <small>لینک کارت: lumocard.ir/{username || "username"}</small>
            </div>

            <div>
              <label>ایمیل مشتری</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                required
              />
            </div>

            <div>
              <label>رمز عبور اولیه</label>
              <input
                type="password"
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                placeholder="حداقل ۸ کاراکتر"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="full">
              <label>شغل یا عنوان کاری</label>
              <input
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="مثلاً Designer"
              />
            </div>
          </div>

          <button disabled={loading}>
            {loading ? "در حال ساخت..." : "ساخت حساب و کارت"}
          </button>

          {message && <div className="message">{message}</div>}
        </form>

        <section className="panel">
          <h2>مشتری‌های ساخته‌شده در این نشست</h2>
          <p className="muted">
            این فهرست فعلاً فقط مشتری‌هایی رو نشون می‌ده که از زمان باز بودن
            همین صفحه ساخته شده‌اند.
          </p>

          {customers.length === 0 ? (
            <p className="empty">هنوز مشتری‌ای در این نشست نساختی.</p>
          ) : (
            <div className="customerList">
              {customers.map((customer) => (
                <div className="customer" key={customer.id}>
                  <div>
                    <strong>{customer.full_name}</strong>
                    <p>{customer.email}</p>
                    <a
                      href={`/${encodeURIComponent(customer.username)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      مشاهده کارت ↗
                    </a>
                  </div>
                  <span className="username">@{customer.username}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .screen {
    min-height: 100vh;
    background: #09090d;
    color: #f7f5fb;
    font-family: Arial, sans-serif;
    padding: 28px 18px 70px;
  }

  .topbar {
    max-width: 1050px;
    margin: 0 auto 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .logo {
    color: white;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 1px;
    text-decoration: none;
  }

  .logo span {
    color: #bb86fc;
  }

  .content {
    max-width: 850px;
    margin: auto;
  }

  .welcome {
    margin-bottom: 28px;
  }

  .badge {
    color: #d4b4ff;
    border: 1px solid #51336c;
    background: #1d1428;
    border-radius: 30px;
    padding: 7px 12px;
    font-size: 11px;
    letter-spacing: 2px;
  }

  h1 {
    font-size: clamp(28px, 5vw, 42px);
    margin: 22px 0 12px;
  }

  h2 {
    margin: 0 0 12px;
    font-size: 21px;
  }

  p {
    line-height: 1.8;
  }

  .welcome p, .muted, .empty {
    color: #aaa4b8;
  }

  .panel {
    background: #121118;
    border: 1px solid #292331;
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 22px;
    box-shadow: 0 15px 50px #00000020;
  }

  label {
    display: block;
    margin: 18px 0 8px;
    color: #d9d2e4;
    font-size: 13px;
  }

  input {
    width: 100%;
    padding: 14px;
    background: #0b0a10;
    border: 1px solid #352d40;
    border-radius: 11px;
    color: white;
    outline: none;
    font-size: 14px;
  }

  input:focus {
    border-color: #b57aff;
    box-shadow: 0 0 0 3px #b57aff18;
  }

  small {
    display: block;
    margin-top: 8px;
    color: #bb91ef;
    overflow-wrap: anywhere;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;
  }

  .full {
    grid-column: 1 / -1;
  }

  button {
    border: 0;
    border-radius: 11px;
    padding: 14px 18px;
    background: linear-gradient(110deg, #8748c7, #bd82ff);
    color: white;
    font-weight: 800;
    cursor: pointer;
    margin-top: 22px;
  }

  button:disabled {
    opacity: .6;
    cursor: wait;
  }

  .panel > button {
    width: 100%;
  }

  .logout {
    background: #211b2a;
    border: 1px solid #40334d;
    margin: 0;
  }

  .message {
    margin-top: 18px;
    border-radius: 10px;
    padding: 13px;
    background: #20172a;
    color: #e2cbff;
    overflow-wrap: anywhere;
    line-height: 1.7;
  }

  .customer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;
    border-top: 1px solid #2b2533;
  }

  .customer p {
    color: #aaa4b8;
    margin: 5px 0;
    overflow-wrap: anywhere;
  }

  .customer a {
    color: #c59aff;
    text-decoration: none;
    font-size: 13px;
  }

  .username {
    color: #d9baff;
    background: #251832;
    padding: 7px 10px;
    border-radius: 9px;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .full {
      grid-column: auto;
    }

    .panel {
      padding: 18px;
    }

    .customer {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`;
