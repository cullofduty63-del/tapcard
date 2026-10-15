import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(request: Request) {
try {
const formData = await request.formData();


const full_name = String(formData.get("full_name") ?? "").trim();
const username = String(formData.get("username") ?? "").trim();
const email = String(formData.get("email") ?? "").trim();
const password = String(formData.get("password") ?? "");
const job = String(formData.get("job") ?? "").trim();
const template = String(formData.get("template") ?? "personal");

if (
  full_name.length < 2 ||
  username.length < 3 ||
  username.length > 24 ||
  !/^[a-zA-Z0-9_-]+$/.test(username) ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  password.length < 8
) {
  return NextResponse.json(
    { error: "اطلاعات واردشده معتبر نیست." },
    { status: 400 }
  );
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  return NextResponse.json(
    { error: "تنظیمات Supabase کامل نیست." },
    { status: 500 }
  );
}

const supabase = createClient(url, key);

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name,
      username,
      job,
      template,
    },
  },
});

if (error) {
  return NextResponse.json(
    { error: error.message },
    { status: 400 }
  );
}

if (!data.user) {
  return NextResponse.json(
    { error: "حساب کاربری ساخته نشد." },
    { status: 500 }
  );
}

return NextResponse.redirect(new URL("/login?registered=1", request.url), 303);


} catch {
return NextResponse.json(
{ error: "در ثبت‌نام خطایی رخ داد. دوباره تلاش کن." },
{ status: 400 }
);
}
}
