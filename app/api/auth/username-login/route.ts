import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور را وارد کن." },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !serviceKey || !publicKey) {
      console.error("Login configuration missing", {
        url: Boolean(url),
        serviceKey: Boolean(serviceKey),
        publicKey: Boolean(publicKey),
      });

      return NextResponse.json(
        { error: "تنظیمات سرور ناقص است. لاگ Cloudflare را بررسی کن." },
        { status: 500 }
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("username", username)
      .maybeSingle();

    if (profileError) {
      console.error("Login profile lookup failed", {
        message: profileError.message,
        code: profileError.code,
      });

      return NextResponse.json(
        { error: "خطا در بررسی حساب کاربری؛ لاگ Cloudflare را بررسی کن." },
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
      },
    });

    const { data, error } = await authClient.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
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
      "Login route failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "خطای داخلی هنگام ورود؛ لاگ Cloudflare را بررسی کن." },
      { status: 500 }
    );
  }
}
