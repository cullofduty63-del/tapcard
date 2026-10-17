import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const adminId = process.env.ADMIN_USER_ID;
const COLORS = ["#4B5BA8", "#111111", "#7416A6", "#888888", "#7A2B20"];

async function getAdmin(request: NextRequest) {
  if (!url || !publicKey || !serviceKey || !adminId) {
    return { db: null, error: NextResponse.json({ error: "تنظیمات امنیتی ادمین در Cloudflare کامل نیست." }, { status: 500 }) };
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { db: null, error: NextResponse.json({ error: "ابتدا وارد حساب ادمین شو." }, { status: 401 }) };
  const auth = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await auth.auth.getUser(token);
  if (error || data.user?.id !== adminId) return { db: null, error: NextResponse.json({ error: "دسترسی ادمین لازم است." }, { status: 403 }) };
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return { db, error: null };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAdmin(request);
    if (auth.error || !auth.db) return auth.error!;
    const { data: orders, error } = await auth.db.from("card_orders").select("id,user_id,requested_color,phone_number,status,assigned_color,physical_card_number,created_at,updated_at").order("created_at", { ascending: false });
    if (error) {
      console.error("Admin card orders GET:", error.message);
      return NextResponse.json({ error: "بارگذاری درخواست‌های کارت ناموفق بود. جدول card_orders را ایجاد کن." }, { status: 500 });
    }
    const ids = [...new Set((orders || []).map((item: any) => item.user_id))];
    let profiles: any[] = [];
    if (ids.length) {
      const { data, error: profileError } = await auth.db.from("profiles").select("id,username,full_name,email").in("id", ids);
      if (profileError) console.error("Admin card order profile lookup:", profileError.message);
      profiles = data || [];
    }
    const byId = new Map(profiles.map((p) => [p.id, p]));
    return NextResponse.json({ orders: (orders || []).map((order: any) => ({ ...order, customer: byId.get(order.user_id) || null })) });
  } catch (error) {
    console.error("Admin card orders GET error:", error);
    return NextResponse.json({ error: "خطای داخلی هنگام بارگذاری سفارش‌ها." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAdmin(request);
    if (auth.error || !auth.db) return auth.error!;
    const body = await request.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    const status = body?.status;
    const assignedColor = typeof body?.assigned_color === "string" ? body.assigned_color.toUpperCase() : "";
    const cardNumber = typeof body?.physical_card_number === "string" ? body.physical_card_number.trim() : "";
    if (!id || !["approved", "rejected", "activated"].includes(status)) return NextResponse.json({ error: "اطلاعات عملیات معتبر نیست." }, { status: 400 });
    if (assignedColor && !COLORS.includes(assignedColor)) return NextResponse.json({ error: "رنگ کارت معتبر نیست." }, { status: 400 });
    if (status === "activated" && (!assignedColor || cardNumber.length < 3 || cardNumber.length > 60)) {
      return NextResponse.json({ error: "برای فعال‌سازی، رنگ نهایی و شناسه کارت (حداقل ۳ کاراکتر) را وارد کن." }, { status: 400 });
    }
    const { data: existing, error: lookupError } = await auth.db.from("card_orders").select("id,status").eq("id", id).maybeSingle();
    if (lookupError || !existing) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (assignedColor) updates.assigned_color = assignedColor;
    if (cardNumber) updates.physical_card_number = cardNumber;
    const { data, error } = await auth.db.from("card_orders").update(updates).eq("id", id).select("id,status,assigned_color,physical_card_number").single();
    if (error) {
      console.error("Admin card order update:", error.message);
      return NextResponse.json({ error: "ذخیره تغییرات سفارش ناموفق بود." }, { status: 500 });
    }
    return NextResponse.json({ success: true, order: data, message: status === "activated" ? "کارت فعال شد و در داشبورد مشتری نمایش داده می‌شود." : status === "approved" ? "سفارش تأیید شد." : "درخواست رد شد." });
  } catch (error) {
    console.error("Admin card order PATCH error:", error);
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }
}
