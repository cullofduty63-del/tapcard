import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(req:Request){
  try{
    const form=await req.formData();
    const full_name=String(form.get("full_name")||"").trim();
    const username=String(form.get("username")||"").trim().toLowerCase();
    const email=String(form.get("email")||"").trim().toLowerCase();
    const password=String(form.get("password")||"");
    const job=String(form.get("job")||"").trim();
    const template=String(form.get("template")||"personal");
    if(full_name.length<2||!/^[a-z0-9_-]{3,24}$/.test(username)||!email||password.length<8)return NextResponse.json({error:"اطلاعات واردشده معتبر نیست."},{status:400});
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
    if(!url||!key)return NextResponse.json({error:"تنظیمات سرور Supabase کامل نیست."},{status:500});
    const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:existing,error:checkError}=await admin.from("profiles").select("id").eq("username",username).maybeSingle();
    if(checkError)return NextResponse.json({error:"بررسی نام کاربری ناموفق بود؛ جدول profiles را بررسی کن."},{status:500});
    if(existing)return NextResponse.json({error:"این نام کاربری قبلاً گرفته شده است."},{status:409});
    const {data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name,username}});
    if(createError||!created.user)return NextResponse.json({error:createError?.message||"ساخت حساب انجام نشد."},{status:400});
    const {error:profileError}=await admin.from("profiles").upsert({id:created.user.id,username,full_name,email,job:job||null,bio:"",social_links:{},appearance:{template,accent:"#8b20ff"},created_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"id"});
    if(profileError){await admin.auth.admin.deleteUser(created.user.id);return NextResponse.json({error:"حساب ساخته نشد چون ساخت پروفایل ناموفق بود: "+profileError.message},{status:500});}
    return NextResponse.redirect(new URL("/login?created=1",req.url),303);
  }catch{return NextResponse.json({error:"خطای غیرمنتظره هنگام ثبت‌نام."},{status:500});}
}
