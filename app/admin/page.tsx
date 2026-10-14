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

type Action = "activate_annual" | "unlimited" | "expire";

export default function AdminPage() {
const [users, setUsers] = useState<Profile[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [notice, setNotice] = useState("");
const [search, setSearch] = useState("");
const [authorized, setAuthorized] = useState(false);
const [workingId, setWorkingId] = useState("");

async function loadUsers() {
setLoading(true);
setError("");
setNotice("");

try {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    setAuthorized(false);
    setError("ابتدا وارد حساب کاربری خودت شو.");
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
    setAuthorized(false);
    setError(result.error || "دسترسی به پنل امکان‌پذیر نیست.");
    return;
  }

  setUsers(result.users || []);
  setAuthorized(true);
} catch {
  setAuthorized(false);
  setError("ارتباط با سرور برقرار نشد.");
} finally {
  setLoading(false);
}

}

async function manageUser(userId: string, action: Action) {
const messages: Record<Action, string> = {
activate_annual: "اشتراک سالانه این کاربر فعال یا تمدید شود؟",
unlimited: "اشتراک این کاربر نامحدود شود؟",
expire: "اشتراک این کاربر منقضی شود؟",
};

if (!window.confirm(messages[action])) return;

setWorkingId(userId);
setError("");
setNotice("");

try {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    setError("نشست ورود معتبر نیست. دوباره وارد شو.");
    return;
  }

  const response = await fetch(
    `/api/admin/users/${encodeURIComponent(userId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    setError(result.error || "عملیات ناموفق بود.");
    return;
  }

  setNotice(result.message || "تغییرات با موفقیت ذخیره شد.");
  await loadUsers();
} catch {
  setError("ارتباط با سرور برقرار نشد.");
} finally {
  setWorkingId("");
}

}

useEffect(() => {
void loadUsers();
}, []);

function getStatus(user: Profile) {
if (
user.is_unlimited ||
user.subscription_plan === "unlimited"
) {
return { label: "نامحدود", color: "#c084fc" };
}

if (
  user.subscription_status === "active" &&
  user.subscription_plan === "annual" &&
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

if (user.subscription_status === "pending") {
  return { label: "در انتظار بررسی", color: "#60a5fa" };
}

return { label: "منقضی‌شده", color: "#fb7185" };

}

const filteredUsers = users.filter((user) => {
const value = search.trim().toLowerCase();

return (
  (user.full_name || "").toLowerCase().includes(value) ||
  (user.username || "").toLowerCase().includes(value) ||
  (user.email || "").toLowerCase().includes(value)
);

});

const stats = [
{
title: "کل کاربران",
value: users.length,
icon: "👥",
},
{
title: "اشتراک فعال",
value: users.filter(
(user) => getStatus(user).label === "اشتراک فعال"
).length,
icon: "💎",
},
{
title: "دوره آزمایشی",
value: users.filter(
(user) => getStatus(user).label === "دوره آزمایشی"
).length,
icon: "⏳",
},
{
title: "اشتراک نامحدود",
value: users.filter(
(user) =>
user.is_unlimited ||
user.subscription_plan === "unlimited"
).length,
icon: "♾️",
},
];

return ( <main dir="rtl" className="admin-page"> <style jsx>{`
.admin-page {
min-height: 100vh;
padding: 32px;
color: #f5f3ff;
background:
radial-gradient(
ellipse at top right,
#28113d 0%,
transparent 38%
),
#08080d;
font-family: inherit;
}

    .container {
      max-width: 1450px;
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
      font-size: 28px;
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
      border-radius: 11px;
      padding: 10px 14px;
      background: #21132e;
      color: white;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      transition: 0.2s;
      white-space: nowrap;
    }

    .button:hover:not(:disabled) {
      background: #39204d;
      border-color: #b66aff;
    }

    .button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
      font-size: 13px;
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
      min-width: 1050px;
    }

    th,
    td {
      padding: 16px;
      border-bottom: 1px solid #211d27;
      font-size: 13px;
      vertical-align: middle;
    }

    th {
      color: #a1a1aa;
      background: #151319;
      font-weight: 600;
      white-space: nowrap;
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

    .actions {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      min-width: 330px;
    }

    .message {
      margin: 0 0 20px;
      padding: 15px;
      border-radius: 12px;
      background: #19151f;
      color: #d4d4d8;
      line-height: 1.9;
      font-size: 13px;
    }

    .error {
      color: #fda4af;
      border: 1px solid #632b39;
    }

    .success {
      color: #86efac;
      border: 1px solid #245d3b;
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
        <div className="subtitle">
          پنل مدیریت کاربران و اشتراک‌ها
        </div>
      </div>

      <button
        className="button"
        onClick={() => void loadUsers()}
        disabled={loading || Boolean(workingId)}
      >
        ↻ به‌روزرسانی اطلاعات
      </button>
    </header>

    {error && (
      <div className="message error">{error}</div>
    )}

    {notice && (
      <div className="message success">{notice}</div>
    )}

    {loading ? (
      <div className="panel empty">
        در حال دریافت اطلاعات...
      </div>
    ) : authorized ? (
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
            <div className="panel-title">
              مدیریت کاربران
            </div>

            <input
              className="search"
              placeholder="جست‌وجوی نام، ایمیل یا نام کاربری..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty">
              کاربری پیدا نشد.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>نام کاربر</th>
                    <th>نام کاربری</th>
                    <th>ایمیل</th>
                    <th>وضعیت اشتراک</th>
                    <th>پلن</th>
                    <th>تاریخ انقضا</th>
                    <th>عملیات</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const status = getStatus(user);
                    const busy = workingId === user.id;

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

                        <td>
                          {user.subscription_plan || "free"}
                        </td>

                        <td>
                          {user.subscription_expires_at
                            ? new Date(
                                user.subscription_expires_at
                              ).toLocaleDateString("fa-IR")
                            : "—"}
                        </td>

                        <td>
                          <div className="actions">
                            <button
                              className="button"
                              disabled={busy || Boolean(workingId)}
                              onClick={() =>
                                void manageUser(
                                  user.id,
                                  "activate_annual"
                                )
                              }
                            >
                              💎 تمدید یک‌ساله
                            </button>

                            <button
                              className="button"
                              disabled={busy || Boolean(workingId)}
                              onClick={() =>
                                void manageUser(
                                  user.id,
                                  "unlimited"
                                )
                              }
                            >
                              ♾️ نامحدود
                            </button>

                            <button
                              className="button"
                              disabled={busy || Boolean(workingId)}
                              onClick={() =>
                                void manageUser(
                                  user.id,
                                  "expire"
                                )
                              }
                            >
                              🚫 انقضای اشتراک
                            </button>
                          </div>
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
    ) : (
      <div className="panel empty">
        برای مشاهده کاربران، دسترسی ادمین لازم است.
      </div>
    )}

    <footer className="footer">
      LumoCard Admin · مدیریت کارت‌های دیجیتال
    </footer>
  </div>
</main>

);
}
