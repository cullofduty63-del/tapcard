"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  job?: string;
  subscription_status?: string;
  subscription_plan?: string;
  trial_started_at?: string | null;
  subscription_expires_at?: string | null;
  is_unlimited?: boolean;
};

export default function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [authorized, setAuthorized] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError("ابتدا وارد حساب کاربری خودت شو.");
        setAuthorized(false);
        return;
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "دسترسی به پنل امکان‌پذیر نیست.");
        setAuthorized(false);
        return;
      }

      setUsers(result.users || []);
      setAuthorized(true);
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      (user.full_name || "").toLowerCase().includes(value) ||
      (user.username || "").toLowerCase().includes(value) ||
      (user.email || "").toLowerCase().includes(value)
    );
  });

  function getStatus(user: Profile) {
    if (user.is_unlimited || user.subscription_plan === "unlimited") {
      return { label: "نامحدود", color: "#c084fc" };
    }

    if (
      user.subscription_status === "active" &&
      user.subscription_expires_at &&
      new Date(user.subscription_expires_at).getTime() > Date.now()
    ) {
      return { label: "اشتراک فعال", color: "#4ade80" };
    }

    if (user.subscription_status === "trial" && user.trial_started_at) {
      const elapsed =
        Date.now() - new Date(user.trial_started_at).getTime();

      if (elapsed >= 0 && elapsed < 48 * 60 * 60 * 1000) {
        return { label: "دوره آزمایشی", color: "#facc15" };
      }
    }

    return { label: "منقضی‌شده", color: "#fb7185" };
  }

  const stats = [
    { title: "کل کاربران", value: users.length, icon: "👥" },
    {
      title: "اشتراک فعال",
      value: users.filter((u) => getStatus(u).label === "اشتراک فعال").length,
      icon: "💎",
    },
    {
      title: "دوره آزمایشی",
      value: users.filter((u) => getStatus(u).label === "دوره آزمایشی").length,
      icon: "⏳",
    },
    {
      title: "اشتراک نامحدود",
      value: users.filter(
        (u) => u.is_unlimited || u.subscription_plan === "unlimited"
      ).length,
      icon: "♾️",
    },
  ];

  return (
    <main dir="rtl" className="admin-page">
      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 32px;
          background:
            radial-gradient(ellipse at top right, #28113d 0%, transparent 38%),
            #08080d;
          color: #f5f3ff;
          font-family: inherit;
        }

        .container {
          max-width: 1400px;
          margin: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .brand {
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .brand span {
          color: #b66aff;
        }

        .subtitle {
          color: #a1a1aa;
          font-size: 13px;
          margin-top: 8px;
        }

        .button {
          border: 1px solid #633c83;
          border-radius: 12px;
          padding: 11px 18px;
          background: #21132e;
          color: white;
          cursor: pointer;
          font: inherit;
          transition: 0.2s;
        }

        .button:hover {
          background: #39204d;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 26px;
        }

        .stat,
        .panel {
          border: 1px solid #29212f;
          border-radius: 18px;
          background: #111015;
        }

        .stat {
          padding: 22px;
        }

        .stat-icon {
          font-size: 25px;
        }

        .stat-title {
          color: #a1a1aa;
          font-size: 13px;
          margin-top: 14px;
        }

        .stat-value {
          font-size: 30px;
          font-weight: 800;
          margin-top: 8px;
        }

        .panel {
          overflow: hidden;
        }

        .panel-header {
          padding: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          border-bottom: 1px solid #29212f;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 800;
        }

        .search {
          background: #09090d;
          border: 1px solid #39303f;
          border-radius: 11px;
          padding: 12px 15px;
          color: white;
          outline: none;
          width: min(100%, 320px);
          font: inherit;
        }

        .search:focus {
          border-color: #a855f7;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
          min-width: 760px;
        }

        th,
        td {
          padding: 17px 20px;
          border-bottom: 1px solid #211d27;
          font-size: 13px;
        }

        th {
          color: #a1a1aa;
          background: #151319;
          font-weight: 600;
        }

        td {
          color: #e4e4e7;
        }

        .username {
          color: #c084fc;
          direction: ltr;
          display: inline-block;
        }

        .badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          background: #201a27;
          font-size: 12px;
          white-space: nowrap;
        }

        .message {
          margin: 22px;
          padding: 15px;
          border-radius: 12px;
          background: #19151f;
          color: #d4d4d8;
          line-height: 1.9;
        }

        .error {
          color: #fda4af;
          border: 1px solid #632b39;
        }

        .empty {
          text-align: center;
          color: #a1a1aa;
          padding: 40px 20px;
        }

        .footer {
          text-align: center;
          color: #71717a;
          font-size: 12px;
          margin-top: 28px;
        }

        @media (max-width: 850px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-page {
            padding: 18px 12px;
          }

          .stat {
            padding: 16px;
          }
        }

        @media (max-width: 380px) {
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="container">
        <header className="header">
          <div>
            <div className="brand">
              ϟ Lumo<span>Card</span>
            </div>
            <div className="subtitle">پنل مدیریت و کنترل اشتراک‌ها</div>
          </div>

          <button className="button" onClick={() => void loadUsers()}>
            ↻ به‌روزرسانی اطلاعات
          </button>
        </header>

        {error && <div className="message error">{error}</div>}

        {authorized && (
          <>
            <section className="stats">
              {stats.map((stat) => (
                <div className="stat" key={stat.title}>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              ))}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div className="panel-title">مدیریت کاربران</div>

                <input
                  className="search"
                  placeholder="جست‌وجوی نام، ایمیل یا نام کاربری..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {loading ? (
                <div className="empty">در حال دریافت اطلاعات کاربران...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="empty">کاربری پیدا نشد.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>کاربر</th>
                        <th>نام کاربری</th>
                        <th>ایمیل</th>
                        <th>وضعیت اشتراک</th>
                        <th>پلن</th>
                        <th>تاریخ انقضا</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => {
                        const status = getStatus(user);

                        return (
                          <tr key={user.id}>
                            <td>{user.full_name || "بدون نام"}</td>
                            <td>
                              <span className="username">
                                @{user.username}
                              </span>
                            </td>
                            <td>{user.email || "—"}</td>
                            <td>
                              <span
                                className="badge"
                                style={{ color: status.color }}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td>{user.subscription_plan || "free"}</td>
                            <td>
                              {user.subscription_expires_at
                                ? new Date(
                                    user.subscription_expires_at
                                  ).toLocaleDateString("fa-IR")
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        <footer className="footer">
          LumoCard Admin · مدیریت هوشمند کارت‌های دیجیتال
        </footer>
      </div>
    </main>
  );
}
