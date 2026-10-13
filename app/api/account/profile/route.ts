import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

function adminClient() {
  if (!url || !serviceKey) throw new Error("Missing server Supabase configuration.");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const client = adminClient();
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, user: data.user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getUser(request);
    if (!auth) return NextResponse.json({ error: "لطفاً دوباره وارد شو." }, { status: 401 });
    const { data, error } = await auth.client
      .from("profiles")
      .select("id, username, full_name, job, bio, phone, website, avatar_url")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "پروفایل این حساب پیدا نشد." }, { status: 404 });
    return NextResponse.json({ profile: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Account profile GET failed:", error);
    return NextResponse.json({ error: "بارگذاری اطلاعات انجام نشد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getUser(request);
    if (!auth) return NextResponse.json({ error: "لطفاً دوباره وارد شو." }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "اطلاعات ارسالی معتبر نیست." }, { status: 400 });
    }

    const clean = (key: string, max: number) => {
      const value = (body as Record<string, unknown>)[key];
      return typeof value === "string" ? value.trim().slice(0, max) : null;
    };
    const updates = {
      full_name: clean("full_name", 100),
      job: clean("job", 100),
      bio: clean("bio", 500),
      phone: clean("phone", 40),
      website: clean("website", 300),
      avatar_url: clean("avatar_url", 1000),
    };

    for (const field of ["website", "avatar_url"] as const) {
      const value = updates[field];
      if (value && !/^https?:\/\//i.test(value)) {
        return NextResponse.json({ error: "لینک وب‌سایت و عکس باید با https:// یا http:// شروع شود." }, { status: 400 });
      }
    }

    const { data, error } = await auth.client
      .from("profiles")
      .update(updates)
      .eq("id", auth.user.id)
      .select("id, username, full_name, job, bio, phone, website, avatar_url")
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Account profile PATCH failed:", error);
    return NextResponse.json({ error: "ذخیره اطلاعات انجام نشد. تنظیمات جدول profiles را بررسی کن." }, { status: 500 });
  }
}
