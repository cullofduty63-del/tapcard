import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

const adminId = process.env.ADMIN_USER_ID;

function getAdminClient() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or server-side Supabase secret key."
    );
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function verifyAdmin(request: NextRequest) {
  if (!adminId) {
    return {
      client: null,
      error: NextResponse.json(
        { error: "ADMIN_USER_ID is not configured in Cloudflare." },
        { status: 500 }
      ),
    };
  }

  const authorization = request.headers.get("authorization");

  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return {
      client: null,
      error: NextResponse.json(
        { error: "Authentication required. Please sign in again." },
        { status: 401 }
      ),
    };
  }

  const client = getAdminClient();

  const { data, error } = await client.auth.getUser(token);

  if (error || data.user?.id !== adminId) {
    return {
      client: null,
      error: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  return { client, error: null };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);

    if (auth.error || !auth.client) {
      return auth.error!;
    }

    const { data, error } = await auth.client
      .from("profiles")
      .select(
        "id, username, full_name, email, job, bio, created_at, phone, website, avatar_url"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin customer list error:", error.message);

      return NextResponse.json(
        { error: `Couldn't load customers: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ customers: data ?? [] });
  } catch (error) {
    console.error("Admin customer GET error:", error);

    return NextResponse.json(
      {
        error:
          "Server error while loading customers. Check Cloudflare logs.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);

    if (auth.error || !auth.client) {
      return auth.error!;
    }

    const client = auth.client;

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const full_name =
      typeof body.full_name === "string" ? body.full_name.trim() : "";

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const job =
      typeof body.job === "string" ? body.job.trim() : "";

    if (!full_name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Name, username, email and password are required." },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3–30 characters using English letters, numbers, _ or -.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    // Check whether the username is already in use.
    const { data: existingProfile, error: lookupError } = await client
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (lookupError) {
      console.error("Username lookup error:", lookupError.message);

      return NextResponse.json(
        {
          error:
            "Couldn't check username availability. Check the profiles table.",
        },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json(
        { error: "This username is already taken." },
        { status: 409 }
      );
    }

    // Create the authentication user.
    const { data: created, error: createError } =
      await client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          username,
        },
      });

    if (createError || !created.user) {
      console.error("Supabase create user error:", createError?.message);

      return NextResponse.json(
        {
          error:
            createError?.message ||
            "Supabase couldn't create the customer account.",
        },
        { status: 400 }
      );
    }

    const userId = created.user.id;

    // A Supabase trigger may have already created this user's profile.
    // Upsert by the profile primary key to avoid a duplicate-ID error.
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .upsert(
        {
          id: userId,
          username,
          full_name,
          email,
          job: job || null,
        },
        {
          onConflict: "id",
        }
      )
      .select(
        "id, username, full_name, email, job, bio, created_at, phone, website, avatar_url"
      )
      .single();

    if (profileError || !profile) {
      console.error(
        "Profile creation error:",
        profileError?.message
      );

      // Roll back the authentication user if its profile could not be saved.
      const { error: rollbackError } =
        await client.auth.admin.deleteUser(userId);

      if (rollbackError) {
        console.error(
          "User rollback error:",
          rollbackError.message
        );
      }

      return NextResponse.json(
        {
          error:
            profileError?.message ||
            "Account was created, but its profile could not be saved.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        customer: profile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin customer POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error while creating customer.",
      },
      { status: 500 }
    );
  }
}
