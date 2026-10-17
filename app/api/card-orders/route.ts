import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const COLORS = ["#4B5BA8", "#111111", "#7416A6", "#888888", "#7A2B20"];

function clients() {
  if (!url || !publicKey || !serviceKey) throw new Error("تنظیمات Supabase سمت سرور کامل نیست.");
  return {
    auth: createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } }),
    db: createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }),
  };
}

async function getUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { user: null, response: NextResponse.json({ error: "ابتدا وارد حساب کاربری شو." }, { status: 401 }) };
  const { auth } = clients();
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) return { user: null, response: NextResponse.json({ error: "نشست ورود معتبر نیست؛ دوباره وارد شو." }, { status: 401 }) };
  return { user: data.user, response: null };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getUser(request);
    if (auth.response || !auth.user) return auth.response!;
    const { db } = clients();
    const { data, error } = await db.from("card_orders").select("id, requested_color, phone_number, status, assigned_color, physical_card_number, created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(10);
    if (error) {
      console.error("Customer card orders GET:", error.message);
      return NextResponse.json({ error: "بارگذاری سفارش‌ها ناموفق بود. بررسی کن جدول card_orders ساخته شده باشد." }, { status: 500 });
    }
    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error("Customer card orders GET error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطای داخلی سرور." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getUser(request);
    if (auth.response || !auth.user) return auth.response!;
    const body = await request.json().catch(() => null);
    const color = typeof body?.requested_color === "string" ? body.requested_color.toUpperCase() : "";
    const phone = typeof body?.phone_number === "string" ? body.phone_number.trim() : "";
    if (!COLORS.includes(color)) return NextResponse.json({ error: "رنگ انتخاب‌شده معتبر نیست." }, { status: 400 });
    if (!/^\+?[0-9۰-۹٠-٩()\-\s]{7,20}$/.test(phone)) return NextResponse.json({ error: "شماره تماس معتبر وارد کن." }, { status: 400 });

    const { db } = clients();
    const { data: existing, error: lookupError } = await db.from("card_orders").select("id,status").eq("user_id", auth.user.id).in("status", ["pending", "approved", "activated"]).limit(1);
    if (lookupError) {
      console.error("Card order lookup:", lookupError.message);
      return NextResponse.json({ error: "بررسی سفارش قبلی ناموفق بود. جدول card_orders را بررسی کن." }, { status: 500 });
    }
    if (existing?.length) return NextResponse.json({ error: "یک درخواست فعال یا در حال بررسی از قبل داری." }, { status: 409 });

    const { data, error } = await db.from("card_orders").insert({
      user_id: auth.user.id,
      requested_color: color,
      phone_number: phone,
      status: "pending",
    }).select("id, requested_color, phone_number, status, assigned_color, physical_card_number, created_at").single();
    if (error) {
      console.error("Card order insert:", error.message);
      return NextResponse.json({ error: "ثبت سفارش انجام نشد. مطمئن شو SQL جدول card_orders را اجرا کرده‌ای." }, { status: 500 });
    }
    return NextResponse.json({ success: true, order: data }, { status: 201 });
  } catch (error) {
    console.error("Customer card orders POST error:", error);
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }
}
