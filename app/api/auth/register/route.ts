import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(request: Request) {
try {
const { email, password, full_name, username } = await request.json();


if (
  typeof email !== "string" ||
  typeof password !== "string" ||
  password.length < 8 ||
  typeof username !== "string" ||
  typeof full_name !== "string"
) {
  return NextResponse.json(
    { error: "اطلاعات ثبت‌نام معتبر نیست یا رمز عبور کمتر از ۸ کاراکتر است." },
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
  email: email.trim(),
  password,
  options: {
    data: {
      full_name: full_name.trim(),
      username: username.trim(),
    },
  },
});

if (error) {
  return NextResponse.json({ error: error.message }, { status: 400 });
}

return NextResponse.json(
  {
    success: true,
    message: data.session
      ? "حساب ساخته شد."
      : "حساب ساخته شد؛ ایمیلت را برای تأیید بررسی کن.",
  },
  { status: 200 }
);


} catch {
return NextResponse.json(
{ error: "درخواست ثبت‌نام نامعتبر است." },
{ status: 400 }
);
}
}
