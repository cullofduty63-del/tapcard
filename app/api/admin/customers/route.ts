import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminUserId = process.env.ADMIN_USER_ID!;

const adminSupabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function verifyAdmin(request: NextRequest) {
  if (!publishableKey || !serviceRoleKey || !adminUserId) {
    return null;
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice(7);

  const authClient = createClient(
    supabaseUrl,
    publishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user || user.id !== adminUserId) {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json(
      { error: "اجازه دسترسی ندارید." },
      { status: 403 }
    );
  }

  const { data, error } = await adminSupabase
    .from("profiles")
    .select(
      "id, username, full_name, job, email, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "دریافت فهرست مشتری‌ها ناموفق بود." },
      { status: 500 }
    );
  }

  return NextResponse.json({ customers: data ?? [] });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json(
      { error: "اجازه دسترسی ندارید." },
      { status: 403 }
    );
  }

  let body: {
    username?: string;
    full_name?: string;
    email?: string;
    password?: string;
    job?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "اطلاعات ارسالی معتبر نیست." },
      { status: 400 }
    );
  }

  const username = body.username?.trim().toLowerCase();
  const fullName = body.full_name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const job = body.job?.trim() || null;

  if (
    !username ||
    !fullName ||
    !email ||
    !password ||
    !/^[a-z0-9_-]{3,30}$/.test(username) ||
    password.length < 8 ||
    password.length > 128
  ) {
    return NextResponse.json(
      {
        error:
          "نام کاربری باید ۳ تا ۳۰ کاراکتر انگلیسی داشته باشد؛ نام کامل، ایمیل و رمز حداقل ۸ کاراکتری هم لازم است.",
      },
      { status: 400 }
    );
  }

  const { data: existing } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "این نام کاربری قبلاً ثبت شده است." },
      { status: 409 }
    );
  }

  const { data: created, error: createError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  if (createError || !created.user) {
    return NextResponse.json(
      {
        error:
          createError?.message ||
          "ساخت حساب مشتری ناموفق بود.",
      },
      { status: 400 }
    );
  }

  const { error: profileError } = await adminSupabase
    .from("profiles")
    .insert({
      id: created.user.id,
      username,
      full_name: fullName,
      job,
      email,
    });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(
      created.user.id
    );

    return NextResponse.json(
      {
        error:
          "حساب ساخته نشد، چون ذخیره کارت ناموفق بود. یکتابودن username و ساختار جدول profiles را بررسی کن.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "مشتری با موفقیت ساخته شد.",
      customer: {
        id: created.user.id,
        username,
        full_name: fullName,
        email,
        url: `https://lumocard.ir/${username}`,
      },
    },
    { status: 201 }
  );
}
