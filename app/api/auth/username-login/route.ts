import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
      console.error("LOGIN_ENV_CHECK", {
        hasUrl: Boolean(url),
        hasServiceKey: Boolean(serviceKey),
        hasPublicKey: Boolean(publicKey),
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
      console.error("LOGIN_PROFILE_LOOKUP_ERROR", {
        message: profileError.message,
        code: profileError.code,
      });

      return NextResponse.json(
        { error: "خطا در بررسی حساب کاربری. لاگ Cloudflare را بررسی کن." },
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
      // رمز عبور یا جزئیات حساس را در لاگ ثبت نکن
      console.error("LOGIN_AUTH_FAILED", {
        hasError: Boolean(error),
        errorStatus: error?.status ?? null,
      });

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
    console.error("LOGIN_ROUTE_EXCEPTION", {
      message:
        error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return NextResponse.json(
      { error: "خطای داخلی هنگام ورود. لاگ Cloudflare را بررسی کن." },
      { status: 500 }
    );
  }
}
