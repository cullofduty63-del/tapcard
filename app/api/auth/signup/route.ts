import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
let createdUserId: string | null = null;

try {
const formData = await request.formData();


const full_name = String(formData.get("full_name") ?? "").trim();
const username = String(formData.get("username") ?? "")
  .trim()
  .toLowerCase();
const password = String(formData.get("password") ?? "");
const job = String(formData.get("job") ?? "").trim();
const template = String(formData.get("template") ?? "personal");

if (
  full_name.length < 2 ||
  !/^[a-z0-9_-]{3,24}$/.test(username) ||
  password.length < 8
) {
  return NextResponse.json(
    { error: "نام، نام کاربری یا رمز عبور معتبر نیست." },
    { status: 400 }
  );
}

const allowedTemplates = [
  "personal",
  "business",
  "designer",
  "developer",
  "creator",
  "shop",
  "cafe",
];

if (!allowedTemplates.includes(template)) {
  return NextResponse.json(
    { error: "قالب انتخاب‌شده معتبر نیست." },
    { status: 400 }
  );
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !secret) {
  console.error("SIGNUP CONFIG ERROR: Missing Supabase URL or server secret");

  return NextResponse.json(
    { error: "تنظیمات سمت سرور Supabase کامل نیست." },
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

const { data: existing, error: lookupError } = await admin
  .from("profiles")
  .select("id")
  .eq("username", username)
  .maybeSingle();

if (lookupError) {
  console.error("SIGNUP PROFILE LOOKUP ERROR:", lookupError.message);

  return NextResponse.json(
    { error: "بررسی نام کاربری ناموفق بود." },
    { status: 500 }
  );
}

if (existing) {
  return NextResponse.json(
    { error: "این نام کاربری قبلاً گرفته شده است." },
    { status: 409 }
  );
}

const email = `${username}@accounts.lumocard.ir`;

const { data: authData, error: authError } =
  await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      username,
    },
  });

if (authError || !authData.user) {
  console.error("SIGNUP AUTH ERROR:", authError?.message);

  return NextResponse.json(
    {
      error:
        authError?.message || "ساخت حساب کاربری ناموفق بود.",
    },
    { status: 400 }
  );
}

createdUserId = authData.user.id;

const { error: profileError } = await admin
  .from("profiles")
  .insert({
    id: createdUserId,
    username,
    full_name,
    email,
    job: job || "",
    bio: "",
    social_links: {},
    appearance: {
      template,
      animation: "float",
      textColor: "#ffffff",
      accentColor: "#8b20ff",
      backgroundType: "gradient",
      backgroundColor: "#09090f",
      backgroundEndColor: "#251044",
      backgroundImage: "",
    },
  });

if (profileError) {
  console.error("SIGNUP PROFILE INSERT ERROR:", {
    message: profileError.message,
    code: profileError.code,
    details: profileError.details,
    hint: profileError.hint,
  });

  const { error: cleanupError } =
    await admin.auth.admin.deleteUser(createdUserId);

  if (cleanupError) {
    console.error("SIGNUP CLEANUP ERROR:", cleanupError.message);
  }

  return NextResponse.json(
    {
      error:
        "ساخت پروفایل ناموفق بود. لطفاً لاگ سرور را بررسی کن.",
    },
    { status: 500 }
  );
}

return NextResponse.json(
  {
    success: true,
    message: "حساب و پروفایل با موفقیت ساخته شدند.",
  },
  { status: 201 }
);


} catch (error) {
console.error(
"SIGNUP UNEXPECTED ERROR:",
error instanceof Error ? error.message : error
);


return NextResponse.json(
  { error: "درخواست ثبت‌نام نامعتبر است." },
  { status: 400 }
);


}
}
