import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

const adminId = process.env.ADMIN_USER_ID;

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !serviceKey || !adminId) {
      console.error("Admin API environment variables are missing.");

      return NextResponse.json(
        { error: "تنظیمات سرور ادمین کامل نیست." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "لطفاً دوباره وارد حساب کاربری شو." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authData, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || authData.user?.id !== adminId) {
      return NextResponse.json(
        { error: "این حساب دسترسی ادمین ندارد." },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin users query error:", error.message);

      return NextResponse.json(
        { error: "بارگذاری کاربران از دیتابیس ناموفق بود." },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: data ?? [] });
  } catch (error) {
    console.error("Admin users API error:", error);

    return NextResponse.json(
      { error: "خطای داخلی هنگام بارگذاری کاربران." },
      { status: 500 }
    );
  }
}
