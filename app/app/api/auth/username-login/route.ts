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

    if (!/^[a-z0-9_-]{3,24}$/.test(username) || !password) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
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
      .select("id, email, username")
      .eq("username", username)
      .maybeSingle();

    if (profileError) {
      console.error("LOGIN PROFILE ERROR:", profileError.message);

      return NextResponse.json(
        { error: "بررسی حساب ناموفق بود." },
        { status: 500 }
      );
    }

    if (!profile?.id) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    // ایمیل اصلی حساب را از Auth می‌گیریم تا به مقدار profiles وابسته نباشیم.
    const { data: authUser, error: authUserError } =
      await admin.auth.admin.getUserById(profile.id);

    if (authUserError || !authUser.user?.email) {
      console.error(
        "LOGIN AUTH USER ERROR:",
        authUserError?.message || "User or email not found"
      );

      return NextResponse.json(
        { error: "حساب کاربری پیدا نشد یا ایمیل آن معتبر نیست." },
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
      email: authUser.user.email,
      password,
    });

    if (error || !data.session) {
      console.error("LOGIN AUTH ERROR:", error?.message || "No session");

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
      "LOGIN UNEXPECTED:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "درخواست ورود نامعتبر است." },
      { status: 400 }
    );
  }
}
