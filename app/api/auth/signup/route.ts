import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedTemplates = [
  "personal",
  "business",
  "designer",
  "developer",
  "creator",
  "shop",
  "cafe",
];

export async function POST(req: Request) {
  let createdUserId: string | null = null;

  try {
    const form = await req.formData();

    const full_name = String(form.get("full_name") || "").trim();
    const username = String(form.get("username") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");
    const job = String(form.get("job") || "").trim();

    const requestedTemplate = String(form.get("template") || "personal");
    const template = allowedTemplates.includes(requestedTemplate)
      ? requestedTemplate
      : "personal";

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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !secret || !publicKey) {
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

    const { data: existing, error: checkError } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (checkError) {
      console.error("SIGNUP PROFILE CHECK:", checkError.message);
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

    const internalEmail = `${username}@accounts.lumocard.ir`;

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: internalEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name, username },
      });

    if (createError || !created.user) {
      console.error("SIGNUP AUTH CREATE:", createError?.message);
      return NextResponse.json(
        { error: "ساخت حساب ناموفق بود. نام کاربری دیگری امتحان کن." },
        { status: 400 }
      );
    }

    createdUserId = created.user.id;

    const now = new Date().toISOString();

    const { error: profileError } = await admin.from("profiles").insert({
      id: created.user.id,
      username,
      full_name,
      email: internalEmail,
      job: job || null,
      bio: "",
      social_links: {},
      appearance: {
        template,
        accent: "#8b20ff",
      },
      created_at: now,
      updated_at: now,
    });

    if (profileError) {
      console.error("SIGNUP PROFILE CREATE:", profileError.message);

      const { error: cleanupError } =
        await admin.auth.admin.deleteUser(created.user.id);

      if (cleanupError) {
        console.error("SIGNUP CLEANUP:", cleanupError.message);
      }

      return NextResponse.json(
        { error: "ساخت پروفایل ناموفق بود. دوباره تلاش کن." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        redirect: "/login?created=1",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "SIGNUP UNEXPECTED:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "خطای غیرمنتظره هنگام ثبت‌نام." },
      { status: 500 }
    );
  }
}
