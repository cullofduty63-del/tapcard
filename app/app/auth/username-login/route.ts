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
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  return NextResponse.json(
    { error: "تنظیمات سرور کامل نیست." },
    { status: 500 }
  );
}

const admin = createClient(url, key, {
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

if (profileError || !profile?.email) {
  return NextResponse.json(
    { error: "نام کاربری یا رمز عبور اشتباه است." },
    { status: 401 }
  );
}

const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!publicKey) {
  return NextResponse.json(
    { error: "تنظیمات ورود کامل نیست." },
    { status: 500 }
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


} catch {
return NextResponse.json(
{ error: "درخواست ورود نامعتبر است." },
{ status: 400 }
);
}
}
