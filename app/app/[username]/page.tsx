"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CustomerProfile() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }

      setLoading(false);
    }

    if (username) loadProfile();
  }, [username]);

  if (loading) {
    return <main style={styles.center}>در حال بارگذاری...</main>;
  }

  if (!profile) {
    return (
      <main style={styles.center}>
        <h1>پروفایل پیدا نشد!</h1>
        <p>این کارت وجود ندارد یا هنوز ساخته نشده است.</p>
      </main>
    );
  }

  const bg = profile.bg_color || "#ffffff";
  const button = profile.button_color || "#111111";

  return (
    <main style={{ ...styles.page, background: bg }}>
      <article style={styles.card}>
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || "Profile"}
            style={styles.avatar}
          />
        )}

        <h1 style={styles.name}>{profile.full_name}</h1>

        {profile.job && (
          <p style={styles.job}>{profile.job}</p>
        )}

        {profile.bio && (
          <p style={styles.bio}>{profile.bio}</p>
        )}

        <div style={styles.buttons}>
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              style={{ ...styles.button, background: button }}
            >
              📞 تماس با من
            </a>
          )}

          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              style={{ ...styles.button, background: button }}
            >
              ✉️ ارسال ایمیل
            </a>
          )}

          {profile.website && (
            <a
              href={
                /^https?:\/\//i.test(profile.website)
                  ? profile.website
                  : `https://${profile.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...styles.button, background: button }}
            >
              🌐 وب‌سایت من
            </a>
          )}

          {profile.location && (
            <p style={styles.location}>
              📍 {profile.location}
            </p>
          )}
        </div>

        <footer style={styles.footer}>
          Powered by LumoCard
        </footer>
      </article>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px 16px",
    fontFamily: "Arial, sans-serif",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: "36px 24px",
    borderRadius: 28,
    background: "#ffffff",
    color: "#171717",
    textAlign: "center",
    boxShadow: "0 15px 50px rgba(0,0,0,0.10)",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto 20px",
    display: "block",
  },
  name: {
    fontSize: 28,
    fontWeight: 800,
    margin: "12px 0",
  },
  job: {
    color: "#666666",
    fontSize: 16,
  },
  bio: {
    lineHeight: 1.9,
    whiteSpace: "pre-wrap",
    margin: "20px 0",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 28,
  },
  button: {
    display: "block",
    padding: "15px 20px",
    borderRadius: 14,
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  location: {
    color: "#666666",
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    color: "#999999",
  },
};
