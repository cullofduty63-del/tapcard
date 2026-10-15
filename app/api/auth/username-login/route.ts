import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور را وارد کن." },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !service || !publicKey) {
      return NextResponse.json(
        { error: "تنظیمات Supabase در Cloudflare کامل نیست." },
        { status: 500 }
      );
    }

    const admin = createClient(url, service, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: profile,
      error: profileError,
    } = await admin
      .from("profiles")
      .select("email, username")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (profileError) {
      console.error("LOGIN PROFILE ERROR:", profileError.message);

      return NextResponse.json(
        { error: "بررسی حساب ناموفق بود. دوباره تلاش کن." },
        { status: 500 }
      );
    }

    if (!profile?.email) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const client = createClient(url, publicKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await client.auth.signInWithPassword({
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
      console.error("LOGIN ERROR: No session returned");

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
  } catch {
    return NextResponse.json(
      { error: "درخواست ورود نامعتبر است." },
      { status: 400 }
    );
  }
}
