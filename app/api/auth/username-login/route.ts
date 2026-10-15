import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(req:Request){
  try{
    const {username,password}=await req.json();
    if(typeof username!=="string"||typeof password!=="string"||!username.trim()||!password)return NextResponse.json({error:"نام کاربری و رمز عبور را وارد کن."},{status:400});
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
    const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!service||!publicKey)return NextResponse.json({error:"تنظیمات Supabase در Cloudflare کامل نیست."},{status:500});
    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:profile,error:profileError}=await admin.from("profiles").select("email,username").eq("username",username.trim().toLowerCase()).maybeSingle();
    const loginEmail=profile?.email || `${username.trim().toLowerCase()}@accounts.lumocard.ir`;
    if(profileError||!profile)return NextResponse.json({error:"نام کاربری یا رمز عبور اشتباه است."},{status:401});
    const client=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error}=await client.auth.signInWithPassword({email:loginEmail,password});
    if(error||!data.session)return NextResponse.json({error:"نام کاربری یا رمز عبور اشتباه است."},{status:401});
    return NextResponse.json({session:{access_token:data.session.access_token,refresh_token:data.session.refresh_token}});
  }catch{return NextResponse.json({error:"درخواست ورود نامعتبر است."},{status:400});}
}
