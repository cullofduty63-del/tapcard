import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY;
    const adminId = process.env.ADMIN_USER_ID;

    if (!url || !publicKey || !serviceKey || !adminId) {
      return NextResponse.json(
        { error: "تنظیمات امنیتی ادمین کامل نیست." },
        { status: 500 }
      );
    }

    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "ابتدا وارد حساب کاربری شو." },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);

    const authClient = createClient(url, publicKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user || user.id !== adminId) {
      return NextResponse.json(
        { error: "شما اجازه دسترسی به پنل مدیریت را ندارید." },
        { status: 403 }
      );
    }

    const adminClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: profiles, error } = await adminClient
      .from("profiles")
      .select(
        "id, username, full_name, email, job, subscription_status, subscription_plan, trial_started_at, subscription_expires_at, is_unlimited"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "دریافت کاربران ناموفق بود." },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: profiles || [] });
  } catch {
    return NextResponse.json(
      { error: "خطای داخلی سرور." },
      { status: 500 }
    );
  }
}
