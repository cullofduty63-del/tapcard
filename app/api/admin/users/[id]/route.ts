import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY;
    const adminId = process.env.ADMIN_USER_ID;

    if (!url || !publicKey || !serviceKey || !adminId) {
      return NextResponse.json(
        { error: "تنظیمات امنیتی سرور کامل نیست." },
        { status: 500 }
      );
    }

    const token = req.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { error: "ابتدا وارد حساب کاربری شو." },
        { status: 401 }
      );
    }

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
        { error: "دسترسی غیرمجاز است." },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "شناسه کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const action = body.action;

    const admin = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, subscription_expires_at, is_unlimited")
      .eq("id", id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: "بررسی کاربر ناموفق بود." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    const now = new Date();
    let updates: Record<string, unknown>;

    if (action === "activate_annual") {
      const currentExpiry = profile.subscription_expires_at
        ? new Date(profile.subscription_expires_at)
        : null;

      const startDate =
        currentExpiry &&
        Number.isFinite(currentExpiry.getTime()) &&
        currentExpiry.getTime() > now.getTime()
          ? currentExpiry
          : now;

      const expiry = new Date(startDate);
      expiry.setFullYear(expiry.getFullYear() + 1);

      updates = {
        subscription_status: "active",
        subscription_plan: "annual",
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expiry.toISOString(),
        is_unlimited: false,
      };
    } else if (action === "custom_duration") {
      const years = Number(body.years ?? 0);
      const months = Number(body.months ?? 0);
      const days = Number(body.days ?? 0);
      const hours = Number(body.hours ?? 0);
      const minutes = Number(body.minutes ?? 0);

      const values = [years, months, days, hours, minutes];

      if (
        values.some(
          (value) =>
            !Number.isSafeInteger(value) ||
            value < 0
        ) ||
        values.every((value) => value === 0)
      ) {
        return NextResponse.json(
          {
            error:
              "مدت اشتراک نامعتبر است؛ حداقل یکی از واحدهای زمان را بیشتر از صفر وارد کن.",
          },
          { status: 400 }
        );
      }

      if (
        years > 100 ||
        months > 1200 ||
        days > 36500 ||
        hours > 876000 ||
        minutes > 52560000
      ) {
        return NextResponse.json(
          { error: "مدت اشتراک بیش از حد مجاز است." },
          { status: 400 }
        );
      }

      const currentExpiry = profile.subscription_expires_at
        ? new Date(profile.subscription_expires_at)
        : null;

      const startDate =
        !profile.is_unlimited &&
        currentExpiry &&
        Number.isFinite(currentExpiry.getTime()) &&
        currentExpiry.getTime() > now.getTime()
          ? currentExpiry
          : now;

      const expiry = new Date(startDate);

      expiry.setFullYear(expiry.getFullYear() + years);
      expiry.setMonth(expiry.getMonth() + months);
      expiry.setDate(expiry.getDate() + days);
      expiry.setHours(expiry.getHours() + hours);
      expiry.setMinutes(expiry.getMinutes() + minutes);

      updates = {
        subscription_status: "active",
        subscription_plan: "custom",
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expiry.toISOString(),
        is_unlimited: false,
      };
    } else if (action === "unlimited") {
      updates = {
        subscription_status: "active",
        subscription_plan: "unlimited",
        subscription_started_at: now.toISOString(),
        subscription_expires_at: null,
        is_unlimited: true,
      };
    } else if (action === "expire") {
      updates = {
        subscription_status: "expired",
        subscription_plan: "free",
        subscription_expires_at: now.toISOString(),
        is_unlimited: false,
      };
    } else {
      return NextResponse.json(
        { error: "عملیات نامعتبر است." },
        { status: 400 }
      );
    }

    const { error: updateError } = await admin
      .from("profiles")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      console.error("Subscription update failed:", updateError);

      return NextResponse.json(
        { error: "ذخیره تغییرات ناموفق بود." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تغییرات با موفقیت ذخیره شد.",
      expiresAt: updates.subscription_expires_at,
    });
  } catch (error) {
    console.error("Admin subscription API error:", error);

    return NextResponse.json(
      { error: "خطای داخلی سرور." },
      { status: 500 }
    );
  }
}
