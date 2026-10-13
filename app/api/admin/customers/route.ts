import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
process.env.SUPABASE_SERVICE_ROLE_KEY ||
process.env.SUPABASE_SECRET_KEY;
const adminId = process.env.ADMIN_USER_ID;

function getAdminClient() {
if (!supabaseUrl || !serviceKey) {
throw new Error("Supabase server environment variables are missing.");
}

return createClient(supabaseUrl, serviceKey, {
auth: {
autoRefreshToken: false,
persistSession: false,
},
});
}

export async function GET(request: NextRequest) {
try {
if (!adminId) {
return NextResponse.json(
{ error: "ADMIN_USER_ID is not configured." },
{ status: 500 }
);
}

const authorization = request.headers.get("authorization");
const token = authorization?.startsWith("Bearer ")
  ? authorization.slice(7)
  : "";

if (!token) {
  return NextResponse.json(
    { error: "Authentication required." },
    { status: 401 }
  );
}

const client = getAdminClient();

const { data: authData, error: authError } =
  await client.auth.getUser(token);

if (authError || authData.user?.id !== adminId) {
  return NextResponse.json(
    { error: "Administrator access required." },
    { status: 403 }
  );
}

const { data, error } = await client
  .from("profiles")
  .select(
    "id, username, full_name, email, job, bio, created_at, phone, website, avatar_url"
  )
  .order("created_at", { ascending: false });

if (error) {
  console.error("Admin customer list error:", error.message);
  return NextResponse.json(
    { error: "Couldn't load customer profiles." },
    { status: 500 }
  );
}

return NextResponse.json({ customers: data ?? [] });
```

} catch (error) {
console.error("Admin customer GET error:", error);

```
return NextResponse.json(
  { error: "Server configuration error. Check your Cloudflare environment variables." },
  { status: 500 }
);

}
}

export async function POST(request: NextRequest) {
let createdUserId: string | null = null;

try {
if (!adminId) {
return NextResponse.json(
{ error: "ADMIN_USER_ID is not configured." },
{ status: 500 }
);
}

const authorization = request.headers.get("authorization");
const token = authorization?.startsWith("Bearer ")
  ? authorization.slice(7)
  : "";

if (!token) {
  return NextResponse.json(
    { error: "Authentication required." },
    { status: 401 }
  );
}

const client = getAdminClient();

const { data: authData, error: authError } =
  await client.auth.getUser(token);

if (authError || authData.user?.id !== adminId) {
  return NextResponse.json(
    { error: "Administrator access required." },
    { status: 403 }
  );
}

const body = await request.json();

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
const job = typeof body.job === "string" ? body.job.trim() : "";

if (!full_name || !username || !email || !password) {
  return NextResponse.json(
    { error: "Name, username, email and password are required." },
    { status: 400 }
  );
}

if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
  return NextResponse.json(
    { error: "Username must be 3–30 characters using English letters, numbers, _ or -." },
    { status: 400 }
  );
}

if (password.length < 8) {
  return NextResponse.json(
    { error: "Password must contain at least 8 characters." },
    { status: 400 }
  );
}

const { data: existingProfile, error: lookupError } = await client
  .from("profiles")
  .select("id")
  .eq("username", username)
  .maybeSingle();

if (lookupError) {
  console.error("Username lookup error:", lookupError.message);
  return NextResponse.json(
    { error: "Couldn't check username availability. Check the profiles table." },
    { status: 500 }
  );
}

if (existingProfile) {
  return NextResponse.json(
    { error: "This username is already taken." },
    { status: 409 }
  );
}

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
        createError?.message || "Supabase couldn't create the customer account.",
    },
    { status: 400 }
  );
