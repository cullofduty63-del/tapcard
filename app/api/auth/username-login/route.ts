import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const username =
      typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!/^[a-z0-9_-]{3,30}$/.test(username) || !password) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (!url || !publicKey || !serviceKey) {
      console.error("Username login is missing server Supabase configuration.");
      return NextResponse.json(
        { error: "ورود موقتاً در دسترس نیست. با مدیریت تماس بگیر." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("username", username)
      .maybeSingle();

    // Use the same public error for unknown usernames and wrong passwords.
    if (profileError || !profile?.email) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const authClient = createClient(url, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await authClient.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { session: data.session },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "درخواست ورود قابل پردازش نیست." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
