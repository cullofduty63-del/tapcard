"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_ID = "46b6757c-9b3c-4b69-aaa0-5865ef9347a2";

type Customer = {
  id: string;
  username: string;
  full_name: string | null;
  email: string | null;
  job: string | null;
  bio: string | null;
  created_at: string | null;
  phone?: string | null;
  website?: string | null;
  avatar_url?: string | null;
};

const navItems = [
  { id: "overview", icon: "◫", label: "Overview" },
  { id: "customers", icon: "♙", label: "Customers" },
  { id: "cards", icon: "▤", label: "Digital Cards" },
  { id: "appearance", icon: "◈", label: "Appearance" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

function initials(name?: string | null) {
  return (name || "LC")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [activePage, setActivePage] = useState("overview");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [job, setJob] = useState("");

  const isAdmin = session?.user?.id === ADMIN_ID;

  const loadCustomers = useCallback(async () => {
    setLoadingCustomers(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, email, job, bio, created_at, phone, website, avatar_url"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setNotice("Couldn't load customers. Check your Supabase profiles read policy.");
      setNoticeError(true);
    } else {
      setCustomers((data || []) as Customer[]);
    }

    setLoadingCustomers(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAdmin) loadCustomers();
  }, [isAdmin, loadCustomers]);

  function notify(message: string, error = false) {
    setNotice(message);
    setNoticeError(error);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    notify("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      notify("Login failed. Check your email and password.", true);
    } else if (data.user?.id !== ADMIN_ID) {
      await supabase.auth.signOut();
      notify("This account doesn't have administrator access.", true);
    } else {
      setSession(data.session);
      notify("Welcome back.");
    }

    setLoading(false);
  }

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.access_token) {
      notify("Your session expired. Please sign in again.", true);
      return;
    }

    setLoading(true);
    notify("");

    try {
      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: customerEmail.trim().toLowerCase(),
          password: customerPassword,
          job: job.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        notify(result.error || "Couldn't create customer.", true);
        return;
      }

      setFullName("");
      setUsername("");
      setCustomerEmail("");
      setCustomerPassword("");
      setJob("");
      setShowCreate(false);

      notify(`Customer created successfully: lumocard.ir/${result.customer.username}`);
      await loadCustomers();
    } catch {
      notify("Couldn't connect to the server.", true);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setCustomers([]);
  }

  async function copyCardLink(username: string) {
    try {
      await navigator.clipboard.writeText(
        `https://lumocard.ir/${username}`
      );
      notify("Card link copied to clipboard.");
    } catch {
      notify("Couldn't copy the link. Open the card and copy its address.", true);
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const term = search.toLowerCase().trim();

    if (!term) return true;

    return [
      customer.full_name,
      customer.username,
      customer.email,
      customer.job,
    ].some((value) => value?.toLowerCase().includes(term));
  });

  const stats = [
    {
      label: "Total customers",
      value: customers.length.toLocaleString(),
      icon: "♙",
      color: "violet",
      foot: "All profiles in the database",
    },
    {
      label: "Digital cards",
      value: customers.length.toLocaleString(),
      icon: "▤",
      color: "blue",
      foot: "Cards linked to profiles",
    },
    {
      label: "With a job title",
      value: customers.filter((c) => Boolean(c.job?.trim())).length.toLocaleString(),
      icon: "✳",
      color: "green",
      foot: "Profiles with professional details",
    },
    {
      label: "With a website",
      value: customers.filter((c) => Boolean(c.website?.trim())).length.toLocaleString(),
      icon: "↗",
      color: "orange",
      foot: "Profiles with a website",
    },
  ];

  if (checking) {
    return (
      <main className="loadingScreen">
        <div className="loadingLogo">L<span>.</span></div>
        <div className="loadingText">Preparing your workspace...</div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (!session || !isAdmin) {
    return (
      <main className="loginScreen">
        <div className="loginGlow glowOne" />
        <div className="loginGlow glowTwo" />

        <form className="loginCard" onSubmit={login}>
          <a href="/" className="brand loginBrand">
            <span className="brandMark">L</span>
            <span>LUMO<span className="brandLight">CARD</span></span>
          </a>

          <div className="loginEyebrow">
            <span className="liveDot" /> SECURE ADMIN ACCESS
          </div>

          <h1>Welcome<br />back.</h1>
          <p className="loginDescription">
            Sign in to manage your digital card platform.
          </p>

          <label htmlFor="loginEmail">Email address</label>
          <input
            id="loginEmail"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />

          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />

          <button className="primaryButton loginButton" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to dashboard"} <span>↗</span>
          </button>

          {notice && (
            <div className={`notice ${noticeError ? "noticeError" : ""}`}>
              {notice}
            </div>
          )}

          <div className="loginFooter">
            <span>Protected workspace</span>
            <span>● LUMOCARD SYSTEMS</span>
          </div>
        </form>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="appShell">
      <aside className={`sidebar ${mobileMenu ? "sidebarOpen" : ""}`}>
        <a href="/" className="brand sidebarBrand">
          <span className="brandMark">L</span>
          <span>LUMO<span className="brandLight">CARD</span></span>
        </a>

        <div className="workspaceLabel">WORKSPACE</div>

        <div className="workspaceCard">
          <div className="workspaceIcon">L</div>
          <div className="workspaceInfo">
            <strong>LumoCard Studio</strong>
            <span>Administrator</span>
          </div>
          <span className="workspaceDots">···</span>
        </div>

        <div className="navLabel">MAIN MENU</div>

        <nav className="navList">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`navItem ${activePage === item.id ? "navActive" : ""}`}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenu(false);
              }}
            >
              <span className="navIcon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "customers" && customers.length > 0 && (
                <span className="navCount">{customers.length}</span>
              )}
              {activePage === item.id && <span className="navIndicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebarBottom">
          <div className="helpCard">
            <div className="helpIcon">✦</div>
            <strong>Need a hand?</strong>
            <p>Keep your digital presence looking its best.</p>
            <a href="mailto:support@lumocard.ir">Contact support ↗</a>
          </div>

          <div className="sidebarUser">
            <div className="avatar adminAvatar">
              {initials(session.user.email)}
            </div>
            <div className="sidebarUserInfo">
              <strong>Administrator</strong>
              <span>{session.user.email}</span>
            </div>
            <button className="logoutIcon" onClick={logout} title="Sign out">
              ↗
            </button>
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="mobileBackdrop"
          onClick={() => setMobileMenu(false)}
          aria-label="Close menu"
        />
      )}

      <section className="mainArea">
        <header className="topbar">
          <div className="topbarLeft">
            <button
              className="mobileMenuButton"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <div className="breadcrumb">
              <span>Workspace</span><b>/</b>
              <strong>
                {navItems.find((item) => item.id === activePage)?.label}
              </strong>
            </div>
          </div>

          <div className="topbarRight">
            <div className="systemStatus"><span /> All systems operational</div>
            <a href="/" className="viewSiteButton">View website ↗</a>
            <div className="avatar topAvatar">{initials(session.user.email)}</div>
          </div>
        </header>

        <div className="pageContent">
          {activePage === "overview" && (
            <>
              <div className="pageHeading">
                <div>
                  <div className="eyebrow">YOUR WORKSPACE</div>
                  <h1>Dashboard <span className="headingPeriod">.</span></h1>
                  <p>Everything happening across your digital card platform.</p>
                </div>
                <button className="primaryButton" onClick={() => setShowCreate(true)}>
                  <span className="buttonPlus">＋</span> New customer
                </button>
              </div>

              {notice && (
                <div className={`notice pageNotice ${noticeError ? "noticeError" : ""}`}>
                  <span>{noticeError ? "!" : "✓"}</span> {notice}
                  <button onClick={() => notify("")}>×</button>
                </div>
              )}

              <div className="welcomeBanner">
                <div className="bannerOrb orbOne" />
                <div className="bannerOrb orbTwo" />
                <div className="bannerContent">
                  <div className="bannerTag"><span /> ADMIN WORKSPACE</div>
                  <h2>Your cards.<br /><span>Your connections.</span></h2>
                  <p>Manage customer profiles and keep every digital identity in one place.</p>
                  <button onClick={() => setActivePage("customers")} className="bannerButton">
                    Explore customers <span>→</span>
                  </button>
                </div>
                <div className="bannerVisual">
                  <div className="floatingCard cardBack" />
                  <div className="floatingCard cardFront">
                    <div className="miniCardTop"><span className="miniBrand">L.</span><span> DIGITAL IDENTITY</span></div>
                    <div className="miniProfile">
                      <div className="miniAvatar">L</div>
                      <div><strong>LumoCard</strong><span>Smart business cards</span></div>
                    </div>
                    <div className="miniCardLine" />
                    <div className="miniCardBottom"><span>lumocard.ir</span><span>↗</span></div>
                  </div>
                  <div className="visualSparkle sparkleOne">✦</div>
                  <div className="visualSparkle sparkleTwo">✧</div>
                </div>
              </div>

              <div className="sectionHeading">
                <div><h2>Platform overview</h2><p>A live snapshot of your profiles.</p></div>
                <button className="textButton" onClick={loadCustomers}>
                  ↻ Refresh data
                </button>
              </div>

              <div className="statsGrid">
                {stats.map((stat, index) => (
                  <div className="statCard" key={stat.label} style={{ animationDelay: `${index * 70}ms` }}>
                    <div className="statTop">
                      <div className={`statIcon ${stat.color}`}>{stat.icon}</div>
                      <span className="statMenu">···</span>
                    </div>
                    <div className="statLabel">{stat.label}</div>
                    <div className="statValue">
                      {loadingCustomers ? <span className="skeleton" /> : stat.value}
                    </div>
                    <div className="statFoot"><span className="footDot" />{stat.foot}</div>
                  </div>
                ))}
              </div>

              <div className="contentGrid">
                <section className="dataPanel customerPanel">
                  <div className="panelHeader">
                    <div><h2>Recent customers</h2><p>Your latest digital card profiles.</p></div>
                    <button className="textButton" onClick={() => setActivePage("customers")}>
                      View all <span>→</span>
                    </button>
                  </div>

                  <CustomerTable
                    customers={customers.slice(0, 5)}
                    loading={loadingCustomers}
                    onCopy={copyCardLink}
                    emptyMessage="No customer profiles found yet."
                  />
                </section>

                <section className="dataPanel quickPanel">
                  <div className="panelHeader">
                    <div><h2>Quick actions</h2><p>Shortcuts for your workflow.</p></div>
                  </div>

                  <button className="quickAction" onClick={() => setShowCreate(true)}>
                    <span className="quickIcon quickPurple">＋</span>
                    <span className="quickText"><strong>Create customer</strong><small>Set up a new digital identity</small></span>
                    <span className="quickArrow">↗</span>
                  </button>
                  <button className="quickAction" onClick={() => setActivePage("customers")}>
                    <span className="quickIcon quickBlue">♙</span>
                    <span className="quickText"><strong>Manage customers</strong><small>Search existing profiles</small></span>
                    <span className="quickArrow">↗</span>
                  </button>
                  <a className="quickAction" href="/" target="_blank" rel="noreferrer">
                    <span className="quickIcon quickGreen">↗</span>
                    <span className="quickText"><strong>Visit public website</strong><small>Preview your platform</small></span>
                    <span className="quickArrow">↗</span>
                  </a>

                  <div className="quickFooter"><span className="liveDot" /> Your workspace is ready</div>
                </section>
              </div>
            </>
          )}

          {activePage === "customers" && (
            <>
              <div className="pageHeading">
                <div>
                  <div className="eyebrow">CUSTOMER DIRECTORY</div>
                  <h1>Customers <span className="headingPeriod">.</span></h1>
                  <p>Search, review, and manage digital card profiles.</p>
                </div>
                <button className="primaryButton" onClick={() => setShowCreate(true)}>
                  <span className="buttonPlus">＋</span> New customer
                </button>
              </div>

              {notice && (
                <div className={`notice pageNotice ${noticeError ? "noticeError" : ""}`}>
                  <span>{noticeError ? "!" : "✓"}</span> {notice}
                  <button onClick={() => notify("")}>×</button>
                </div>
              )}

              <div className="customerSummary">
                <div><span>Total profiles</span><strong>{customers.length}</strong></div>
                <div><span>Matching results</span><strong>{filteredCustomers.length}</strong></div>
                <div><span>Recently added</span><strong>{customers.filter(c => c.created_at && Date.now() - new Date(c.created_at).getTime() < 7 * 86400000).length}</strong></div>
              </div>

              <section className="dataPanel fullTablePanel">
                <div className="tableToolbar">
                  <div><h2>All customers</h2><p>Customer data from your profiles table.</p></div>
                  <div className="toolbarActions">
                    <div className="searchBox"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." /></div>
                    <button className="refreshButton" onClick={loadCustomers} title="Refresh">↻</button>
                  </div>
                </div>
                <CustomerTable
                  customers={filteredCustomers}
                  loading={loadingCustomers}
                  onCopy={copyCardLink}
                  emptyMessage={search ? "No customers match your search." : "No customers found yet."}
                />
              </section>
            </>
          )}

          {activePage === "cards" && (
            <PlaceholderPage
              eyebrow="DIGITAL IDENTITY"
              title="Digital cards"
              description="Every customer's public digital profile."
              icon="▤"
              body="Card profiles are currently loaded from Supabase. Choose a customer below to preview their public card."
            >
              <div className="simpleCardGrid">
                {customers.map((customer) => (
                  <a
                    key={customer.id}
                    className="simpleCard"
                    href={`/${encodeURIComponent(customer.username)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="simpleCardTop"><span className="brandMark">L</span><span className="cardStatus"><i /> PROFILE</span></div>
                    <div className="avatar cardAvatar">{initials(customer.full_name)}</div>
                    <strong>{customer.full_name || customer.username}</strong>
                    <span>{customer.job || "Professional profile"}</span>
                    <div className="simpleCardLink">@{customer.username} <b>↗</b></div>
                  </a>
                ))}
              </div>
            </PlaceholderPage>
          )}

          {activePage === "appearance" && (
            <PlaceholderPage
              eyebrow="BRAND SETTINGS"
              title="Appearance"
              description="The visual identity of your digital card platform."
              icon="◈"
              body="Brand-wide customization can be configured here. Per-customer card colors and social links require additional profile fields and save APIs before they can be edited safely."
            >
              <div className="appearancePreview">
                <div className="appearancePreviewHeader"><span className="brandMark">L</span><span>LIVE BRAND PREVIEW</span></div>
                <div className="appearanceSwatches"><span /><span /><span /><span /></div>
                <h3>LumoCard</h3>
                <p>Make every connection count.</p>
                <div className="appearanceColorLabel"><span>Primary accent</span><strong>#A78BFA</strong></div>
              </div>
            </PlaceholderPage>
          )}

          {activePage === "settings" && (
            <PlaceholderPage
              eyebrow="WORKSPACE CONTROL"
              title="Settings"
              description="Manage your workspace and account."
              icon="⚙"
              body="Your administrator account is authenticated with Supabase. Privileged customer operations should remain on the server and never expose your secret key in browser code."
            >
              <div className="settingsCard">
                <div className="settingsAvatar">{initials(session.user.email)}</div>
                <div className="settingsDetails"><strong>Administrator account</strong><span>{session.user.email}</span><small>Authenticated with Supabase</small></div>
                <span className="settingsBadge"><i /> Signed in</span>
              </div>
              <button className="secondaryButton settingsLogout" onClick={logout}>Sign out of dashboard ↗</button>
            </PlaceholderPage>
          )}

          <footer className="appFooter">
            <span>© {new Date().getFullYear()} LumoCard Studio</span>
            <span><i /> Built for better connections</span>
          </footer>
        </div>
      </section>

      {showCreate && (
        <div className="modalBackdrop" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setShowCreate(false);
        }}>
          <section className="createModal">
            <div className="modalTop">
              <div><div className="eyebrow">NEW DIGITAL IDENTITY</div><h2>Create customer</h2><p>Set up a customer account and personalized card URL.</p></div>
              <button className="modalClose" onClick={() => setShowCreate(false)} aria-label="Close">×</button>
            </div>

            <form onSubmit={createCustomer}>
              <div className="formSectionLabel"><span>01</span> PERSONAL DETAILS</div>
              <div className="formGrid">
                <div className="field"><label>Full name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Morgan" required /></div>
                <div className="field"><label>Username</label><input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} placeholder="alexmorgan" minLength={3} maxLength={30} pattern="[a-z0-9_-]{3,30}" required /><small>lumocard.ir/{username || "username"}</small></div>
                <div className="field fieldFull"><label>Email address</label><input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="alex@example.com" required /></div>
                <div className="field fieldFull"><label>Initial password</label><input type="password" value={customerPassword} onChange={(e) => setCustomerPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} autoComplete="new-password" required /></div>
                <div className="field fieldFull"><label>Job title <span className="optional">OPTIONAL</span></label><input value={job} onChange={(e) => setJob(e.target.value)} placeholder="Creative Director, Founder..." /></div>
              </div>

              <div className="modalInfo"><span>✦</span><p>Creating a customer will create an authentication account and a public card profile.</p></div>

              {notice && <div className={`notice modalNotice ${noticeError ? "noticeError" : ""}`}>{notice}</div>}

              <div className="modalActions">
                <button type="button" className="secondaryButton" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="primaryButton" disabled={loading}>{loading ? "Creating..." : "Create customer"} <span>↗</span></button>
              </div>
            </form>
          </section>
        </div>
      )}

      <style jsx>{styles}</style>
    </main>
  );
}

function CustomerTable({
  customers,
  loading,
  onCopy,
  emptyMessage,
}: {
  customers: Customer[];
  loading: boolean;
  onCopy: (username: string) => void;
  emptyMessage: string;
}) {
  return (
    <div className="tableScroll">
      <table className="customerTable">
        <thead><tr><th>CUSTOMER</th><th>JOB TITLE</th><th>CREATED</th><th>PROFILE</th><th /></tr></thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="tableEmpty"><span className="tableSpinner" /> Loading customer data...</td></tr>
          ) : customers.length === 0 ? (
            <tr><td colSpan={5} className="tableEmpty"><div className="emptyIcon">♙</div>{emptyMessage}</td></tr>
          ) : customers.map((customer) => (
            <tr key={customer.id}>
              <td><div className="tableCustomer">
                {customer.avatar_url ? <img className="avatar" src={customer.avatar_url} alt="" /> : <div className="avatar">{initials(customer.full_name)}</div>}
                <div className="tableCustomerInfo"><strong>{customer.full_name || customer.username}</strong><span>{customer.email || "No email recorded"}</span></div>
              </div></td>
              <td><span className="jobTitle">{customer.job || "—"}</span></td>
              <td><span className="dateText">{formatDate(customer.created_at)}</span></td>
              <td><span className="profileBadge"><i /> Profile</span></td>
              <td><div className="rowActions">
                <a href={`/${encodeURIComponent(customer.username)}`} target="_blank" rel="noreferrer" title="View card">↗</a>
                <button onClick={() => onCopy(customer.username)} title="Copy card link">▢</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="pageHeading">
        <div><div className="eyebrow">{eyebrow}</div><h1>{title}<span className="headingPeriod">.</span></h1><p>{description}</p></div>
        <div className="placeholderHeadingIcon">{icon}</div>
      </div>
      <div className="placeholderNotice"><span>✦</span><p>{body}</p></div>
      {children}
    </>
  );
}

const styles = `
  :global(*) { box-sizing: border-box; }
  :global(html) { background: #09090d; }
  :global(body) { margin: 0; background: #09090d; }
  :global(button), :global(input) { font: inherit; }
  :global(button), :global(a) { -webkit-tap-highlight-color: transparent; }

  .appShell { min-height: 100vh; background: #0b0a10; color: #f4f0fb; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; --purple: #a78bfa; --muted: #8d879b; --border: #24212d; }
  .sidebar { width: 254px; position: fixed; inset: 0 auto 0 0; background: #0e0d13; border-right: 1px solid #211e29; display: flex; flex-direction: column; padding: 26px 15px 14px; z-index: 20; }
  .brand { display: flex; align-items: center; gap: 10px; color: #f8f5ff; font-weight: 900; letter-spacing: 1.7px; font-size: 17px; text-decoration: none; }
  .sidebarBrand { padding: 0 10px 32px; }
  .brandMark { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 10px; background: linear-gradient(140deg,#c4b5fd,#7c3aed); color: #160c28; font-size: 19px; font-weight: 950; box-shadow: 0 5px 20px #8b5cf633; }
  .brandLight { color: #a78bfa; font-weight: 500; }
  .workspaceLabel,.navLabel { padding: 0 11px; color: #615c6d; font-size: 9px; font-weight: 800; letter-spacing: 1.8px; }
  .workspaceLabel { margin-bottom: 12px; }
  .workspaceCard { display: flex; align-items: center; gap: 10px; border: 1px solid #292533; background: #15131c; border-radius: 12px; padding: 11px 10px; margin-bottom: 29px; }
  .workspaceIcon { display: grid; place-items: center; width: 33px; height: 33px; border-radius: 9px; background: #2a1d40; color: #c4b5fd; font-weight: 900; }
  .workspaceInfo,.sidebarUserInfo { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .workspaceInfo strong { font-size: 11px; font-weight: 700; }
  .workspaceInfo span,.sidebarUserInfo span { font-size: 10px; color: #827c90; }
  .workspaceDots { color: #827b90; letter-spacing: 2px; }
  .navLabel { margin-bottom: 11px; }
  .navList { display: grid; gap: 5px; }
  .navItem { width: 100%; position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 13px; border: 1px solid transparent; border-radius: 10px; color: #918b9f; background: transparent; cursor: pointer; text-align: left; font-size: 12px; transition: background .2s,border .2s,color .2s; }
  .navItem:hover { color: #f4f0fb; background: #17141f; }
  .navActive { background: linear-gradient(90deg,#281d3d,#1b1625); color: #e8dcff; border-color: #39284f; }
  .navIcon { width: 19px; text-align: center; font-size: 17px; color: #a9a1b8; }
  .navActive .navIcon { color: #c4b5fd; }
  .navCount { margin-left: auto; background: #312343; color: #c4b5fd; padding: 3px 7px; border-radius: 6px; font-size: 10px; }
  .navIndicator { position: absolute; width: 3px; height: 22px; border-radius: 5px; background: #b69aff; left: -1px; top: 50%; transform: translateY(-50%); }
  .sidebarBottom { margin-top: auto; }
  .helpCard { margin: 18px 0; padding: 16px 14px; border: 1px solid #2a2337; background: radial-gradient(ellipse at 100% 0%,#2b1c40 0%,#17131f 55%); border-radius: 13px; }
  .helpIcon { display: grid; place-items: center; width: 27px; height: 27px; background: #34234b; color: #c4b5fd; border-radius: 8px; margin-bottom: 12px; }
  .helpCard strong { font-size: 12px; }
  .helpCard p { color: #91899f; font-size: 10px; line-height: 1.7; margin: 7px 0 11px; }
  .helpCard a { font-size: 10px; color: #c4b5fd; text-decoration: none; }
  .sidebarUser { display: flex; align-items: center; gap: 10px; padding: 14px 5px 4px; border-top: 1px solid #272330; }
  .avatar { flex: 0 0 auto; width: 35px; height: 35px; display: grid; place-items: center; border-radius: 11px; background: linear-gradient(140deg,#4c3768,#2c2240); color: #e2d3ff; font-weight: 800; font-size: 11px; object-fit: cover; }
  .adminAvatar { width: 34px; height: 34px; }
  .sidebarUserInfo strong { font-size: 10px; }
  .sidebarUserInfo span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 140px; }
  .logoutIcon { border: 0; background: transparent; color: #a69db6; cursor: pointer; font-size: 16px; }
  .mainArea { min-height: 100vh; margin-left: 254px; }
  .topbar { height: 73px; position: sticky; top: 0; z-index: 10; background: #0b0a10eF; backdrop-filter: blur(20px); border-bottom: 1px solid #211e29; padding: 0 36px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
  .topbarLeft,.topbarRight { display: flex; align-items: center; gap: 19px; }
  .breadcrumb { display: flex; align-items: center; gap: 12px; color: #716b7e; font-size: 11px; }
  .breadcrumb b { color: #494352; font-weight: 400; }
  .breadcrumb strong { color: #e6e0f0; font-weight: 600; }
  .topbarRight { gap: 18px; }
  .systemStatus { display: flex; align-items: center; gap: 8px; color: #9993a5; font-size: 10px; }
  .systemStatus span,.liveDot { width: 6px; height: 6px; border-radius: 50%; background: #6ee7b7; box-shadow: 0 0 10px #6ee7b755; }
  .viewSiteButton { border: 1px solid #302a3b; color: #d2c9e2; padding: 9px 12px; border-radius: 8px; font-size: 10px; text-decoration: none; transition: border .2s,background .2s; }
  .viewSiteButton:hover { background: #1b1724; border-color: #5b477a; }
  .topAvatar { width: 32px; height: 32px; border-radius: 10px; }
  .mobileMenuButton { display: none; border: 1px solid #302a3b; border-radius: 8px; padding: 7px 10px; background: #17141e; color: white; }
  .pageContent { max-width: 1500px; padding: 33px 36px 20px; margin: 0 auto; }
  .pageHeading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 27px; }
  .eyebrow { color: #a78bfa; font-size: 9px; letter-spacing: 2px; font-weight: 800; margin-bottom: 10px; }
  .pageHeading h1 { margin: 0; font-size: clamp(27px,3vw,35px); line-height: 1.2; letter-spacing: -1.4px; font-weight: 760; }
  .headingPeriod { color: #a78bfa; }
  .pageHeading p { margin: 9px 0 0; color: #898295; font-size: 12px; line-height: 1.7; }
  .primaryButton { display: inline-flex; justify-content: center; align-items: center; gap: 9px; padding: 12px 16px; background: linear-gradient(110deg,#a78bfa,#8b5cf6); color: #160d26; border: 1px solid #b8a0ff; border-radius: 9px; font-size: 11px; font-weight: 800; cursor: pointer; box-shadow: 0 5px 20px #8b5cf622; transition: transform .2s,filter .2s; white-space: nowrap; }
  .primaryButton:hover { transform: translateY(-1px); filter: brightness(1.08); }
  .primaryButton:disabled { opacity: .6; cursor: wait; transform: none; }
  .buttonPlus { font-size: 17px; line-height: 12px; }
  .welcomeBanner { position: relative; min-height: 265px; overflow: hidden; border: 1px solid #362746; border-radius: 17px; background: radial-gradient(ellipse at 80% 35%,#2c1b45 0%,#17111f 42%,#121019 75%); margin-bottom: 31px; }
  .bannerContent { position: relative; z-index: 2; padding: 29px 32px; max-width: 58%; }
  .bannerTag { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #45305e; background: #21182e; color: #c5b3e8; padding: 6px 9px; border-radius: 6px; font-size: 8px; letter-spacing: 1.5px; }
  .bannerTag span { width: 5px; height: 5px; border-radius: 50%; background: #c4b5fd; }
  .bannerContent h2 { font-size: clamp(25px,3vw,36px); line-height: 1.12; letter-spacing: -1px; margin: 16px 0 10px; }
  .bannerContent h2 span { color: #bba0ff; }
  .bannerContent p { max-width: 365px; color: #a49aae; font-size: 11px; line-height: 1.8; margin: 0 0 18px; }
  .bannerButton { display: inline-flex; gap: 22px; align-items: center; border: 0; border-radius: 7px; background: #ede5ff; color: #26173c; font-size: 10px; font-weight: 800; padding: 10px 13px; cursor: pointer; }
  .bannerVisual { position: absolute; width: 43%; height: 100%; right: 0; top: 0; }
  .bannerOrb { position: absolute; border: 1px solid #a78bfa1c; border-radius: 50%; }
  .orbOne { width: 290px; height: 290px; top: -50px; right: -10px; }
  .orbTwo { width: 220px; height: 220px; top: -15px; right: 25px; }
  .floatingCard { position: absolute; width: 220px; height: 139px; border-radius: 13px; border: 1px solid #8d6cbd66; }
  .cardBack { right: 48px; top: 73px; transform: rotate(13deg); background: linear-gradient(130deg,#4d2d70,#251c38); opacity: .7; }
  .cardFront { right: 70px; top: 58px; transform: rotate(-7deg); background: linear-gradient(140deg,#24202f,#15131d); padding: 13px; box-shadow: 0 20px 60px #0006; }
  .miniCardTop { display: flex; align-items: center; justify-content: space-between; color: #9f94b1; font-size: 6px; letter-spacing: 1px; }
  .miniBrand { font-size: 22px; color: #c4b5fd; font-weight: 900; }
  .miniProfile { display: flex; align-items: center; gap: 9px; margin-top: 15px; }
  .miniAvatar { display: grid; place-items: center; width: 31px; height: 31px; border-radius: 9px; background: #493364; color: #e7d9ff; font-weight: 800; }
  .miniProfile div:last-child { display: grid; gap: 4px; }
  .miniProfile strong { font-size: 10px; }
  .miniProfile span { color: #9b93a8; font-size: 7px; }
  .miniCardLine { height: 1px; background: #3c334a; margin-top: 15px; }
  .miniCardBottom { display: flex; justify-content: space-between; margin-top: 8px; color: #b8a4db; font-size: 8px; }
  .visualSparkle { position: absolute; color: #c4b5fd; text-shadow: 0 0 15px #c4b5fd; }
  .sparkleOne { right: 36px; top: 45px; font-size: 24px; }
  .sparkleTwo { right: 270px; top: 194px; font-size: 18px; }
  .sectionHeading,.panelHeader { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
  .sectionHeading { margin-bottom: 16px; }
  .sectionHeading h2,.panelHeader h2,.tableToolbar h2 { margin: 0; font-size: 14px; font-weight: 700; letter-spacing: -.2px; }
  .sectionHeading p,.panelHeader p,.tableToolbar p { color: #827b90; font-size: 10px; margin: 6px 0 0; line-height: 1.6; }
  .textButton { display: inline-flex; gap: 8px; align-items: center; border: 0; background: transparent; color: #b9a0ef; font-size: 10px; cursor: pointer; white-space: nowrap; }
  .statsGrid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; margin-bottom: 24px; }
  .statCard { min-width: 0; padding: 17px 17px 15px; background: linear-gradient(145deg,#15131c,#111017); border: 1px solid #282331; border-radius: 13px; animation: riseIn .45s both; transition: border .2s,transform .2s; }
  .statCard:hover { border-color: #514064; transform: translateY(-2px); }
  .statTop { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .statIcon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; font-size: 17px; }
  .statIcon.violet { background: #322344; color: #c4b5fd; }
  .statIcon.blue { background: #1b2c3d; color: #93c5fd; }
  .statIcon.green { background: #1a332a; color: #86efac; }
  .statIcon.orange { background: #38281e; color: #fdba74; }
  .statMenu { color: #746d81; letter-spacing: 2px; }
  .statLabel { color: #a39caf; font-size: 10px; }
  .statValue { font-size: 29px; letter-spacing: -1px; font-weight: 750; margin: 5px 0 8px; }
  .statFoot { display: flex; align-items: center; gap: 6px; color: #777183; font-size: 9px; line-height: 1.5; }
  .footDot { width: 5px; height: 5px; border-radius: 50%; background: #a78bfa; }
  .skeleton { display: block; width: 62px; height: 29px; background: #292432; border-radius: 5px; animation: pulse 1s infinite alternate; }
  .contentGrid { display: grid; grid-template-columns: minmax(0,1.7fr) minmax(250px,1fr); gap: 17px; }
  .dataPanel { min-width: 0; border: 1px solid #282431; border-radius: 14px; background: #111017; overflow: hidden; }
  .panelHeader { padding: 20px 20px 17px; }
  .tableScroll { width: 100%; overflow-x: auto; }
  .customerTable { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
  .customerTable th { background: #15131b; padding: 12px 15px; color: #706a7c; font-size: 8px; letter-spacing: 1.1px; font-weight: 800; border-top: 1px solid #25212e; border-bottom: 1px solid #25212e; }
  .customerTable th:first-child,.customerTable td:first-child { padding-left: 20px; }
  .customerTable td { padding: 13px 15px; border-bottom: 1px solid #211e29; font-size: 10px; }
  .customerTable tbody tr:last-child td { border-bottom: 0; }
  .customerTable tbody tr { transition: background .2s; }
  .customerTable tbody tr:hover { background: #191621; }
  .tableCustomer { display: flex; align-items: center; gap: 10px; min-width: 170px; }
  .tableCustomerInfo { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .tableCustomerInfo strong { color: #e8e2f1; font-size: 10px; font-weight: 650; }
  .tableCustomerInfo span { color: #817a8d; font-size: 9px; }
  .jobTitle { color: #aaa2b8; }
  .dateText { color: #898294; }
  .profileBadge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 7px; border: 1px solid #294337; background: #15251e; color: #8fe0b2; border-radius: 6px; font-size: 8px; }
  .profileBadge i,.settingsBadge i { width: 5px; height: 5px; background: #6ee7b7; border-radius: 50%; }
  .rowActions { display: flex; gap: 5px; justify-content: flex-end; }
  .rowActions a,.rowActions button { width: 26px; height: 26px; display: grid; place-items: center; border: 1px solid #302a3a; border-radius: 7px; color: #a99bbf; background: #191620; cursor: pointer; text-decoration: none; font-size: 12px; }
  .rowActions a:hover,.rowActions button:hover { color: white; border-color: #76609a; }
  .tableEmpty { text-align: center; color: #817a8e; padding: 35px 20px !important; white-space: normal; }
  .emptyIcon { font-size: 25px; margin-bottom: 10px; color: #716183; }
  .tableSpinner { display: inline-block; width: 12px; height: 12px; border: 2px solid #443454; border-top-color: #c4b5fd; border-radius: 50%; margin-right: 9px; vertical-align: middle; animation: spin .8s linear infinite; }
  .quickPanel { padding-bottom: 7px; }
  .quickAction { width: 100%; display: flex; align-items: center; gap: 11px; padding: 13px 18px; background: transparent; border: 0; border-top: 1px solid #211e29; text-align: left; text-decoration: none; cursor: pointer; color: inherit; transition: background .2s; }
  .quickAction:hover { background: #1a1722; }
  .quickIcon { width: 35px; height: 35px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 10px; font-size: 16px; }
  .quickPurple { color: #c4b5fd; background: #30203f; }
  .quickBlue { color: #93c5fd; background: #1d2b3b; }
  .quickGreen { color: #86efac; background: #1b3229; }
  .quickText { flex: 1; display: grid; gap: 5px; min-width: 0; }
  .quickText strong { font-size: 10px; font-weight: 650; }
  .quickText small { color: #837c90; font-size: 9px; }
  .quickArrow { color: #797187; font-size: 13px; }
  .quickFooter { display: flex; align-items: center; gap: 8px; margin: 14px 18px 8px; padding: 11px; background: #17221d; border: 1px solid #25382e; border-radius: 8px; color: #91c8a9; font-size: 9px; }
  .appFooter { display: flex; justify-content: space-between; gap: 15px; padding: 24px 0 5px; color: #5e586b; font-size: 9px; }
  .appFooter span:last-child { display: flex; align-items: center; gap: 7px; }
  .appFooter i { display: inline-block; width: 5px; height: 5px; background: #9b83e5; border-radius: 50%; }
  .notice { display: flex; align-items: flex-start; gap: 8px; padding: 11px 12px; border-radius: 8px; background: #1c2d24; border: 1px solid #31533e; color: #a8e7bf; font-size: 11px; line-height: 1.6; overflow-wrap: anywhere; }
  .noticeError { background: #301c25; border-color: #58303e; color: #ffb4c2; }
  .pageNotice { margin: -10px 0 20px; }
  .pageNotice button { margin-left: auto; color: inherit; background: transparent; border: 0; font-size: 16px; cursor: pointer; }
  .customerSummary { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 13px; margin-bottom: 19px; }
  .customerSummary > div { display: flex; flex-direction: column; gap: 9px; background: #121019; border: 1px solid #292431; border-radius: 12px; padding: 17px; }
  .customerSummary span { color: #8f879d; font-size: 10px; }
  .customerSummary strong { font-size: 25px; }
  .fullTablePanel { overflow: hidden; }
  .tableToolbar { padding: 20px; display: flex; justify-content: space-between; align-items: center; gap: 15px; }
  .toolbarActions { display: flex; align-items: center; gap: 8px; }
  .searchBox { width: 230px; display: flex; align-items: center; gap: 9px; border: 1px solid #302a3a; border-radius: 8px; background: #0d0c12; padding: 0 10px; }
  .searchBox > span { color: #8f849f; font-size: 19px; }
  .searchBox input { width: 100%; min-width: 0; background: transparent; border: 0; outline: 0; padding: 11px 0; color: #f4f0fb; font-size: 10px; }
  .searchBox input::placeholder { color: #655e71; }
  .refreshButton { width: 35px; height: 35px; border: 1px solid #302a3a; border-radius: 8px; color: #b9a5e7; background: #191520; cursor: pointer; font-size: 17px; }
  .placeholderHeadingIcon { display: grid; place-items: center; width: 55px; height: 55px; border: 1px solid #3d3052; border-radius: 15px; background: #20182b; color: #c4b5fd; font-size: 24px; }
  .placeholderNotice { display: flex; align-items: flex-start; gap: 12px; padding: 17px; margin-bottom: 20px; border: 1px solid #332943; background: #17131f; border-radius: 12px; color: #a69bb8; font-size: 11px; line-height: 1.8; }
  .placeholderNotice > span { color: #c4b5fd; font-size: 16px; }
  .placeholderNotice p { margin: 0; }
  .simpleCardGrid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; }
  .simpleCard { padding: 19px; border: 1px solid #30283b; border-radius: 15px; background: radial-gradient(ellipse at top right,#261a38,#121019 70%); text-decoration: none; color: #f3edf9; transition: transform .2s,border .2s; }
  .simpleCard:hover { transform: translateY(-3px); border-color: #75569c; }
  .simpleCardTop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
  .cardStatus { display: flex; align-items: center; gap: 5px; color: #8fe0b2; font-size: 8px; letter-spacing: 1px; }
  .cardStatus i { width: 5px; height: 5px; border-radius: 50%; background: #6ee7b7; }
  .cardAvatar { width: 46px; height: 46px; border-radius: 14px; margin-bottom: 13px; }
  .simpleCard > strong,.simpleCard > span { display: block; }
  .simpleCard > strong { font-size: 13px; }
  .simpleCard > span { color: #958b9f; font-size: 10px; margin-top: 5px; }
  .simpleCardLink { display: flex; justify-content: space-between; margin-top: 18px; padding-top: 13px; border-top: 1px solid #30263c; color: #c4b5fd; font-size: 10px; }
  .simpleCardLink b { font-weight: 400; }
  .appearancePreview { max-width: 420px; border: 1px solid #3a2c4d; border-radius: 19px; padding: 22px; background: radial-gradient(ellipse at 100% 0%,#342044,#15121d 65%); }
  .appearancePreviewHeader { display: flex; justify-content: space-between; align-items: center; color: #a69ab9; font-size: 8px; letter-spacing: 1.5px; }
  .appearanceSwatches { display: flex; gap: 8px; margin: 24px 0; }
  .appearanceSwatches span { height: 25px; flex: 1; border-radius: 7px; border: 1px solid #ffffff20; }
  .appearanceSwatches span:nth-child(1) { background: #0b0a10; }
  .appearanceSwatches span:nth-child(2) { background: #a78bfa; }
  .appearanceSwatches span:nth-child(3) { background: #6d4aff; }
  .appearanceSwatches span:nth-child(4) { background: #e9d5ff; }
  .appearancePreview h3 { font-size: 25px; margin: 0; }
  .appearancePreview > p { color: #a69bb8; font-size: 11px; }
  .appearanceColorLabel { display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #493755; margin-top: 22px; color: #aaa0b8; font-size: 10px; }
  .appearanceColorLabel strong { color: #d8c7ff; }
  .settingsCard { display: flex; align-items: center; gap: 14px; max-width: 650px; padding: 19px; background: #13111a; border: 1px solid #302a3a; border-radius: 13px; }
  .settingsAvatar { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; background: #38254f; color: #e3d2ff; font-weight: 800; }
  .settingsDetails { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
  .settingsDetails strong { font-size: 12px; }
  .settingsDetails span { color: #b1a7c0; font-size: 10px; overflow-wrap: anywhere; }
  .settingsDetails small { color: #797186; font-size: 9px; }
  .settingsBadge { display: flex; align-items: center; gap: 6px; padding: 7px 9px; background: #17271f; color: #9fe2b7; border-radius: 7px; font-size: 9px; }
  .secondaryButton { border: 1px solid #3a3345; border-radius: 9px; background: #1a1722; color: #d1c8df; padding: 11px 14px; font-size: 11px; cursor: pointer; }
  .settingsLogout { margin-top: 17px; }
  .modalBackdrop { position: fixed; z-index: 50; inset: 0; display: grid; place-items: center; padding: 20px; background: #050408c9; backdrop-filter: blur(9px); animation: fadeIn .2s; }
  .createModal { width: min(100%,570px); max-height: calc(100vh - 40px); overflow-y: auto; border: 1px solid #40334f; border-radius: 17px; background: #121019; box-shadow: 0 30px 100px #0009; padding: 25px; animation: modalIn .25s; }
  .modalTop { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 23px; }
  .modalTop h2 { margin: 0; font-size: 24px; letter-spacing: -.7px; }
  .modalTop p { margin: 7px 0 0; color: #938a9f; font-size: 10px; line-height: 1.7; }
  .modalClose { align-self: flex-start; width: 32px; height: 32px; border: 1px solid #332c3d; border-radius: 9px; background: #1a1722; color: #c3b9d1; cursor: pointer; font-size: 20px; }
  .formSectionLabel { display: flex; align-items: center; gap: 9px; color: #b6a8ca; font-size: 9px; font-weight: 800; letter-spacing: 1.5px; padding-bottom: 13px; border-bottom: 1px solid #2b2534; }
  .formSectionLabel span { color: #a78bfa; }
  .formGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 13px; }
  .field { min-width: 0; display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
  .fieldFull { grid-column: 1 / -1; }
  .field label { color: #b9b0c6; font-size: 10px; }
  .field input { width: 100%; min-width: 0; background: #0c0b11; color: #f3edf9; border: 1px solid #332c3e; border-radius: 8px; padding: 12px; font-size: 11px; outline: none; transition: border .2s,box-shadow .2s; }
  .field input:focus { border-color: #a78bfa; box-shadow: 0 0 0 3px #a78bfa17; }
  .field input::placeholder { color: #5e586b; }
  .field small { color: #bda4f0; font-size: 9px; overflow-wrap: anywhere; }
  .optional { color: #756c83; font-size: 8px; margin-left: 5px; letter-spacing: 1px; }
  .modalInfo { display: flex; gap: 10px; align-items: flex-start; margin-top: 20px; padding: 12px; border: 1px solid #332844; border-radius: 9px; background: #1a1523; }
  .modalInfo > span { color: #c4b5fd; }
  .modalInfo p { margin: 0; color: #a59ab5; font-size: 10px; line-height: 1.7; }
  .modalNotice { margin-top: 14px; }
  .modalActions { display: flex; justify-content: flex-end; gap: 9px; padding-top: 20px; margin-top: 20px; border-top: 1px solid #2a2532; }
  .loadingScreen,.loginScreen { min-height: 100vh; background: #0b0a10; color: #f4f0fb; font-family: Inter,ui-sans-serif,system-ui,sans-serif; display: grid; place-items: center; }
  .loadingScreen { align-content: center; gap: 15px; }
  .loadingLogo { font-size: 48px; font-weight: 900; color: #c4b5fd; animation: pulse 1s infinite alternate; }
  .loadingLogo span { color: white; }
  .loadingText { color: #8b8399; font-size: 11px; }
  .loginScreen { position: relative; overflow: hidden; padding: 25px; }
  .loginGlow { position: absolute; width: 450px; height: 450px; border-radius: 50%; filter: blur(100px); opacity: .16; pointer-events: none; }
  .glowOne { background: #7c3aed; top: -180px; right: -80px; }
  .glowTwo { background: #6d28d9; bottom: -250px; left: -100px; }
  .loginCard { position: relative; z-index: 1; width: min(100%,405px); padding: 34px; border: 1px solid #30273c; border-radius: 19px; background: #121019ed; box-shadow: 0 30px 100px #0006; }
  .loginBrand { margin-bottom: 37px; }
  .loginEyebrow { display: flex; align-items: center; gap: 8px; color: #bca8e6; font-size: 8px; letter-spacing: 1.5px; }
  .loginCard h1 { margin: 17px 0 10px; font-size: 42px; line-height: 1.05; letter-spacing: -1.7px; }
  .loginDescription { color: #968da3; font-size: 11px; line-height: 1.7; margin: 0 0 25px; }
  .loginCard label { display: block; color: #c5bbd2; font-size: 10px; margin: 16px 0 8px; }
  .loginCard input { width: 100%; padding: 13px; border-radius: 8px; border: 1px solid #342c3e; outline: none; background: #0b0a10; color: #f4f0fb; font-size: 11px; }
  .loginCard input:focus { border-color: #a78bfa; }
  .loginCard input::placeholder { color: #625a70; }
  .loginButton { width: 100%; margin-top: 23px; justify-content: space-between; padding: 14px; }
  .loginFooter { display: flex; justify-content: space-between; gap: 10px; color: #655d71; font-size: 7px; letter-spacing: .6px; margin-top: 27px; }
  .mobileBackdrop { display: none; }
  @keyframes riseIn { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalIn { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes pulse { from { opacity: .5; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (min-width: 1500px) {
    .pageContent { padding-left: 48px; padding-right: 48px; }
    .topbar { padding-left: 48px; padding-right: 48px; }
  }

  @media (max-width: 1200px) {
    .sidebar { width: 225px; }
    .mainArea { margin-left: 225px; }
    .pageContent { padding-left: 24px; padding-right: 24px; }
    .topbar { padding: 0 24px; }
    .statsGrid { grid-template-columns: repeat(2,minmax(0,1fr)); }
    .contentGrid { grid-template-columns: 1fr; }
    .bannerContent { max-width: 62%; }
    .bannerVisual { width: 40%; }
    .cardFront { right: 25px; }
    .cardBack { right: 10px; }
  }

  @media (max-width: 760px) {
    .sidebar { transform: translateX(-100%); transition: transform .25s; width: 265px; }
    .sidebarOpen { transform: translateX(0); }
    .mobileBackdrop { display: block; position: fixed; z-index: 19; inset: 0; border: 0; background: #0009; }
    .mainArea { margin-left: 0; }
    .topbar { height: 62px; padding: 0 15px; }
    .mobileMenuButton { display: inline-block; }
    .topbarLeft { gap: 10px; }
    .topbarRight { gap: 10px; }
    .systemStatus { display: none; }
    .viewSiteButton { padding: 8px; font-size: 9px; }
    .topAvatar { width: 29px; height: 29px; }
    .pageContent { padding: 25px 15px 18px; }
    .pageHeading { align-items: flex-start; }
    .pageHeading > .primaryButton { padding: 10px; font-size: 10px; }
    .pageHeading p { max-width: 330px; }
    .welcomeBanner { min-height: 255px; }
    .bannerContent { max-width: 75%; padding: 22px 20px; }
    .bannerVisual { opacity: .36; width: 58%; right: -25px; }
    .bannerContent h2 { font-size: 29px; }
    .bannerContent p { max-width: 270px; }
    .statsGrid { gap: 10px; }
    .statCard { padding: 13px; }
    .statValue { font-size: 25px; }
    .statFoot { font-size: 8px; }
    .customerSummary { gap: 8px; }
    .customerSummary > div { padding: 12px; }
    .customerSummary strong { font-size: 21px; }
    .tableToolbar { flex-direction: column; align-items: stretch; }
    .toolbarActions { width: 100%; }
    .searchBox { flex: 1; width: auto; }
    .simpleCardGrid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  }

  @media (max-width: 460px) {
    .breadcrumb { font-size: 10px; gap: 7px; }
    .topbarRight { gap: 7px; }
    .viewSiteButton { font-size: 0; }
    .viewSiteButton:first-letter { font-size: 13px; }
    .pageHeading { gap: 10px; }
    .pageHeading h1 { font-size: 27px; }
    .pageHeading p { font-size: 10px; }
    .pageHeading > .primaryButton { white-space: normal; max-width: 120px; }
    .welcomeBanner { min-height: 270px; }
    .bannerContent { max-width: 100%; padding: 20px; }
    .bannerVisual { opacity: .15; width: 80%; }
    .statsGrid { grid-template-columns: repeat(2,minmax(0,1fr)); }
    .statFoot { align-items: flex-start; }
    .sectionHeading h2 { font-size: 13px; }
    .panelHeader { padding: 16px; }
    .customerSummary span { font-size: 9px; }
    .customerSummary strong { font-size: 19px; }
    .simpleCardGrid { grid-template-columns: 1fr; }
    .formGrid { grid-template-columns: 1fr; }
    .fieldFull { grid-column: auto; }
    .createModal { padding: 19px; }
    .modalTop h2 { font-size: 21px; }
    .loginCard { padding: 25px; }
    .appFooter { font-size: 8px; }
  }
`;
