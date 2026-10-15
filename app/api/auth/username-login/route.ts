import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const username =
      typeof body?.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const password =
      typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور را وارد کن." },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !secret || !publicKey) {
      console.error("LOGIN CONFIG: Missing Supabase environment variables");

      return NextResponse.json(
        { error: "تنظیمات Supabase در Cloudflare کامل نیست." },
        { status: 500 }
      );
    }

    const admin = createClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("username", username)
      .maybeSingle();

    if (profileError) {
      console.error("LOGIN PROFILE ERROR:", profileError.message);

      return NextResponse.json(
        { error: "بررسی حساب ناموفق بود." },
        { status: 500 }
      );
    }

    if (!profile?.email) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const authClient = createClient(url, publicKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await authClient.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (error) {
      console.error("LOGIN AUTH ERROR:", error.message);

      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    if (!data.session) {
      console.error("LOGIN SESSION ERROR: Session was not returned");

      return NextResponse.json(
        { error: "ورود انجام نشد. دوباره تلاش کن." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN UNEXPECTED:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "درخواست ورود نامعتبر است." },
      { status: 400 }
    );
  }
}
