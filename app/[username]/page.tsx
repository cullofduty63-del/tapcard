"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  full_name: string;
  job?: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  bg_color?: string | null;
  button_color?: string | null;
};

export default function CustomerProfile() {
  const params = useParams<{ username: string }>();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", params.username)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
      }

      setLoading(false);
    }

    if (params.username) {
      loadProfile();
    }
  }, [params.username]);

  async function shareProfile() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.full_name || "LumoCard",
          text: "کارت دیجیتال من",
          url,
        });
      } catch {
        // کاربر ممکن است پنجره اشتراک‌گذاری را ببندد.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        window.prompt("لینک کارت:", url);
      }
    }
  }

  function saveContact() {
    if (!profile) return;

    const escapeVCard = (value: string) =>
      value
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCard(profile.full_name || "")}`,
      `N:${escapeVCard(profile.full_name || "")};;;;`,
    ];

    if (profile.phone) {
      lines.push(`TEL;TYPE=CELL:${escapeVCard(profile.phone)}`);
    }

    if (profile.email) {
      lines.push(`EMAIL:${escapeVCard(profile.email)}`);
    }

    if (profile.website) {
      lines.push(`URL:${escapeVCard(profile.website)}`);
    }

    lines.push("END:VCARD");

    const blob = new Blob(
      [lines.join("\r\n")],
      { type: "text/vcard;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${profile.username}.vcf`;
    link.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loader" />
        <p>در حال آماده‌سازی کارت شما...</p>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            background: #09090d;
            color: #fff;
            font-family: Vazirmatn, Tahoma, sans-serif;
          }

          .loader {
            width: 42px;
            height: 42px;
            border: 3px solid #ffffff20;
            border-top-color: #bd91ff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="notFound">
        <div className="notFoundCard">
          <span className="notFoundIcon">✦</span>
          <h1>این کارت پیدا نشد!</h1>
          <p>
            ممکن است نام کاربری اشتباه باشد یا هنوز کارتی با این نام
            ساخته نشده باشد.
          </p>
          <a href="/">بازگشت به LumoCard</a>
        </div>

        <style jsx>{`
          .notFound {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #09090d;
            color: white;
            font-family: Vazirmatn, Tahoma, sans-serif;
            direction: rtl;
          }

          .notFoundCard {
            width: 100%;
            max-width: 420px;
            padding: 40px 28px;
            text-align: center;
            border: 1px solid #ffffff16;
            border-radius: 28px;
            background: #ffffff08;
          }

          .notFoundIcon {
            font-size: 44px;
            color: #bd91ff;
          }

          h1 {
            font-size: 25px;
          }

          p {
            color: #aaaaba;
            line-height: 2;
          }

          a {
            display: inline-block;
            margin-top: 20px;
            padding: 13px 20px;
            border-radius: 14px;
            background: #bd91ff;
            color: #171020;
            font-weight: 800;
            text-decoration: none;
          }
        `}</style>
      </main>
    );
  }

  const buttonColor = profile.button_color || "#a879ff";
  const pageColor = profile.bg_color || "#0b0b12";

  const website = profile.website
    ? /^https?:\/\//i.test(profile.website)
      ? profile.website
      : `https://${profile.website}`
    : "";

  const actions = [
    {
      label: "تماس با من",
      subtitle: "برای ارتباط مستقیم",
      icon: "☎",
      href: profile.phone ? `tel:${profile.phone}` : "",
    },
    {
      label: "ارسال ایمیل",
      subtitle: "برای پیام‌های کاری",
      icon: "✉",
      href: profile.email ? `mailto:${profile.email}` : "",
    },
    {
      label: "وب‌سایت من",
      subtitle: "مشاهده وب‌سایت",
      icon: "↗",
      href: website,
    },
  ].filter((item) => item.href);

  return (
    <main
      className="profilePage"
      style={
        {
          "--page-bg": pageColor,
          "--accent": buttonColor,
        } as React.CSSProperties
      }
    >
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <header className="topbar">
        <a className="brand" href="/">
          <span className="brandIcon">L</span>
          <span>
            Lumo<span className="brandLight">Card</span>
          </span>
        </a>

        <span className="liveBadge">
          <span className="liveDot" />
          کارت دیجیتال
        </span>
      </header>

      <section className="profileContainer">
        <article className="profileCard">
          <div className="cover">
            <div className="coverGrid" />
            <div className="coverOrb orbOne" />
            <div className="coverOrb orbTwo" />

            <div className="coverLabel">
              <span>✦</span>
              DIGITAL IDENTITY
            </div>

            <div className="coverNumber">
              LUMO / {profile.username.toUpperCase()}
            </div>
          </div>

          <div className="profileContent">
            <div className="avatarRow">
              <div className="avatarFrame">
                {profile.avatar_url ? (
                  <img
                    className="avatarImage"
                    src={profile.avatar_url}
                    alt={profile.full_name}
                  />
                ) : (
                  <div className="avatarPlaceholder">
                    {(profile.full_name || "L")[0]}
                  </div>
                )}

                <span className="avatarStatus" />
              </div>

              <button
                className="shareIconButton"
                onClick={shareProfile}
                aria-label="اشتراک‌گذاری کارت"
                title="اشتراک‌گذاری کارت"
              >
                ↗
              </button>
            </div>

            <div className="identity">
              <span className="eyebrow">
                <span className="eyebrowLine" />
                DIGITAL BUSINESS CARD
              </span>

              <h1>{profile.full_name}</h1>

              {profile.job && (
                <p className="jobTitle">{profile.job}</p>
              )}

              <p className="username">@{profile.username}</p>
            </div>

            {profile.bio && (
              <div className="bioBox">
                <span className="bioQuote">“</span>
                <p>{profile.bio}</p>
              </div>
            )}

            {profile.location && (
              <div className="location">
                <span>⌖</span>
                {profile.location}
              </div>
            )}

            <div className="sectionHeading">
              <span>راه‌های ارتباطی</span>
              <span className="sectionLine" />
            </div>

            <div className="actionList">
              {actions.map((action, index) => (
                <a
                  className="actionItem"
                  href={action.href}
                  key={action.label}
                  target={
                    action.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    action.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  style={
                    {
                      animationDelay: `${index * 80}ms`,
                    } as React.CSSProperties
                  }
                >
                  <span className="actionIcon">{action.icon}</span>

                  <span className="actionText">
                    <strong>{action.label}</strong>
                    <small>{action.subtitle}</small>
                  </span>

                  <span className="actionArrow">↗</span>
                </a>
              ))}

              {actions.length === 0 && (
                <div className="emptyActions">
                  راه‌های ارتباطی هنوز اضافه نشده‌اند.
                </div>
              )}
            </div>

            <div className="bottomActions">
              <button className="saveButton" onClick={saveContact}>
                <span>＋</span>
                ذخیره مخاطب
              </button>

              <button className="shareButton" onClick={shareProfile}>
                {copied ? "لینک کپی شد ✓" : "اشتراک‌گذاری ↗"}
              </button>
            </div>

            <div className="cardFooter">
              <div className="footerBrand">
                <span className="footerLogo">L</span>
                <span>LumoCard</span>
              </div>

              <span className="footerCaption">
                YOUR IDENTITY, DIGITALLY.
              </span>
            </div>
          </div>
        </article>

        <p className="belowCard">
          ساخته‌شده با <span>♥</span> توسط LumoCard
        </p>
      </section>

      <style jsx>{`
        .profilePage {
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              ellipse at 50% 20%,
              color-mix(in srgb, var(--accent) 12%, transparent),
              transparent 48%
            ),
            var(--page-bg);
          color: #f8f7fc;
          font-family: Vazirmatn, Tahoma, sans-serif;
          direction: rtl;
          padding: 0 20px 35px;
        }

        .ambient {
          position: absolute;
          z-index: -1;
          width: 330px;
          height: 330px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.13;
          pointer-events: none;
        }

        .ambientOne {
          top: 200px;
          left: -180px;
          background: var(--accent);
        }

        .ambientTwo {
          top: 600px;
          right: -190px;
          background: #635bff;
        }

        .topbar {
          width: 100%;
          max-width: 1080px;
          min-height: 86px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          text-decoration: none;
          direction: ltr;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: -0.7px;
        }

        .brandIcon,
        .footerLogo {
          display: grid;
          place-items: center;
          background: var(--accent);
          color: #15101e;
          font-weight: 1000;
          border-radius: 11px;
        }

        .brandIcon {
          width: 35px;
          height: 35px;
          font-size: 22px;
        }

        .brandLight {
          color: var(--accent);
        }

        .liveBadge {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #ffffff16;
          border-radius: 30px;
          padding: 9px 13px;
          background: #ffffff06;
          color: #c4c2d0;
          font-size: 12px;
        }

        .liveDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #7ee0ad;
          box-shadow: 0 0 12px #7ee0ad80;
        }

        .profileContainer {
          width: 100%;
          max-width: 465px;
          margin: 32px auto 0;
        }

        .profileCard {
          overflow: hidden;
          border: 1px solid #ffffff18;
          border-radius: 30px;
          background: linear-gradient(
            155deg,
            #181820,
            #101016 48%,
            #14111b
          );
          box-shadow:
            0 40px 100px #00000045,
            inset 0 1px 0 #ffffff08;
          animation: cardEnter 0.7s ease both;
        }

        .cover {
          position: relative;
          height: 175px;
          overflow: hidden;
          background:
            radial-gradient(
              ellipse at 80% 10%,
              color-mix(in srgb, var(--accent) 70%, #30204f),
              transparent 58%
            ),
            linear-gradient(130deg, #1a1825, #30203c 55%, #111018);
        }

        .coverGrid {
          position: absolute;
          inset: 0;
          opacity: 0.22;
          background-image:
            linear-gradient(#ffffff18 1px, transparent 1px),
            linear-gradient(90deg, #ffffff18 1px, transparent 1px);
          background-size: 27px 27px;
          mask-image: linear-gradient(to bottom, black, transparent);
        }

        .coverOrb {
          position: absolute;
          border: 1px solid #ffffff24;
          border-radius: 50%;
        }

        .orbOne {
          width: 250px;
          height: 250px;
          top: -135px;
          right: -25px;
          box-shadow:
            0 0 0 22px #ffffff05,
            0 0 0 45px #ffffff04;
        }

        .orbTwo {
          width: 160px;
          height: 160px;
          bottom: -120px;
          left: 25px;
          box-shadow: 0 0 0 25px #ffffff04;
        }

        .coverLabel,
        .coverNumber {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 8px;
          direction: ltr;
          font-size: 10px;
          letter-spacing: 1.6px;
          color: #ffffffbd;
        }

        .coverLabel {
          top: 23px;
          left: 23px;
        }

        .coverLabel span {
          color: var(--accent);
          font-size: 17px;
        }

        .coverNumber {
          bottom: 20px;
          left: 23px;
          color: #ffffff80;
          font-size: 9px;
        }

        .profileContent {
          padding: 0 27px 25px;
        }

        .avatarRow {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: -57px;
        }

        .avatarFrame {
          position: relative;
          width: 112px;
          height: 112px;
          padding: 5px;
          border: 1px solid #ffffff25;
          border-radius: 29px;
          background: #17151e;
          box-shadow: 0 10px 30px #00000045;
        }

        .avatarImage,
        .avatarPlaceholder {
          width: 100%;
          height: 100%;
          border-radius: 23px;
          object-fit: cover;
        }

        .avatarPlaceholder {
          display: grid;
          place-items: center;
          color: #171020;
          background: linear-gradient(
            135deg,
            var(--accent),
            #e2ceff
          );
          font-size: 43px;
          font-weight: 900;
        }

        .avatarStatus {
          position: absolute;
          width: 15px;
          height: 15px;
          bottom: 5px;
          left: 5px;
          border: 3px solid #17151e;
          border-radius: 50%;
          background: #7ee0ad;
        }

        .shareIconButton {
          width: 42px;
          height: 42px;
          margin-bottom: 5px;
          border: 1px solid #ffffff18;
          border-radius: 14px;
          background: #ffffff08;
          color: white;
          font-size: 22px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .shareIconButton:hover {
          background: var(--accent);
          color: #171020;
          transform: translateY(-2px);
        }

        .identity {
          margin-top: 24px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent);
          font-size: 9px;
          letter-spacing: 1.4px;
          direction: ltr;
          justify-content: flex-end;
        }

        .eyebrowLine {
          display: inline-block;
          width: 24px;
          height: 1px;
          background: var(--accent);
        }

        .identity h1 {
          margin: 10px 0 0;
          color: #fff;
          font-size: clamp(27px, 7vw, 35px);
          font-weight: 900;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .jobTitle {
          margin: 0;
          color: #d4c4ed;
          font-size: 15px;
          font-weight: 600;
        }

        .username {
          direction: ltr;
          text-align: right;
          color: #858394;
          font-size: 12px;
          margin: 5px 0 0;
        }

        .bioBox {
          position: relative;
          margin-top: 23px;
          padding: 16px 18px;
          border: 1px solid #ffffff0d;
          border-radius: 17px;
          background: #ffffff05;
        }

        .bioBox p {
          margin: 0;
          color: #c6c3d1;
          font-size: 13px;
          line-height: 2.1;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .bioQuote {
          position: absolute;
          top: -11px;
          right: 13px;
          color: var(--accent);
          font-size: 33px;
          line-height: 1;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
          color: #aaa6b8;
          font-size: 12px;
        }

        .location span {
          color: var(--accent);
          font-size: 18px;
        }

        .sectionHeading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 27px 0 13px;
          color: #eeecf5;
          font-size: 13px;
          font-weight: 800;
        }

        .sectionLine {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #ffffff1a
          );
        }

        .actionList {
          display: grid;
          gap: 9px;
        }

        .actionItem {
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 70px;
          padding: 12px 13px;
          border: 1px solid #ffffff10;
          border-radius: 17px;
          background: #ffffff05;
          color: white;
          text-decoration: none;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
          animation: itemEnter 0.45s ease both;
        }

        .actionItem:hover {
          transform: translateY(-2px);
          border-color: color-mix(
            in srgb,
            var(--accent) 55%,
            transparent
          );
          background: #ffffff0a;
        }

        .actionIcon {
          flex: 0 0 43px;
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border: 1px solid
            color-mix(in srgb, var(--accent) 25%, transparent);
          border-radius: 14px;
          background: color-mix(
            in srgb,
            var(--accent) 13%,
            transparent
          );
          color: var(--accent);
          font-size: 22px;
        }

        .actionText {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .actionText strong {
          font-size: 13px;
          font-weight: 800;
        }

        .actionText small {
          color: #898698;
          font-size: 10px;
        }

        .actionArrow {
          margin-right: auto;
          color: #777486;
          font-size: 18px;
          direction: ltr;
          transition: color 0.2s ease;
        }

        .actionItem:hover .actionArrow {
          color: var(--accent);
        }

        .emptyActions {
          padding: 22px 15px;
          border: 1px dashed #ffffff20;
          border-radius: 16px;
          color: #aaa6b8;
          text-align: center;
          font-size: 13px;
        }

        .bottomActions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 21px;
        }

        .saveButton,
        .shareButton {
          min-height: 48px;
          padding: 11px;
          border-radius: 14px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .saveButton:hover,
        .shareButton:hover {
          transform: translateY(-2px);
        }

        .saveButton {
          border: 0;
          background: var(--accent);
          color: #171020;
        }

        .saveButton span {
          margin-left: 5px;
          font-size: 17px;
        }

        .shareButton {
          border: 1px solid #ffffff1b;
          background: #ffffff08;
          color: white;
        }

        .cardFooter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 26px;
          padding-top: 19px;
          border-top: 1px solid #ffffff12;
        }

        .footerBrand {
          display: flex;
          align-items: center;
          gap: 7px;
          direction: ltr;
          color: #aaa6b8;
          font-size: 12px;
          font-weight: 800;
        }

        .footerLogo {
          width: 23px;
          height: 23px;
          border-radius: 7px;
          font-size: 14px;
        }

        .footerCaption {
          direction: ltr;
          color: #777486;
          font-size: 8px;
          letter-spacing: 1px;
        }

        .belowCard {
          margin: 20px 0 0;
          color: #797687;
          font-size: 11px;
          text-align: center;
        }

        .belowCard span {
          color: #e89cb9;
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes itemEnter {
          from {
            opacity: 0;
            transform: translateY(7px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .profilePage {
            padding: 0 12px 25px;
          }

          .topbar {
            min-height: 72px;
          }

          .brand {
            font-size: 19px;
          }

          .profileContainer {
            margin-top: 18px;
          }

          .profileCard {
            border-radius: 25px;
          }

          .cover {
            height: 150px;
          }

          .profileContent {
            padding-right: 20px;
            padding-left: 20px;
          }

          .avatarFrame {
            width: 100px;
            height: 100px;
          }

          .bottomActions {
            grid-template-columns: 1fr;
          }

          .saveButton,
          .shareButton {
            min-height: 47px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .profileCard,
          .actionItem {
            animation: none;
          }

          .actionItem,
          .saveButton,
          .shareButton,
          .shareIconButton {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
