import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(req:Request){
 try{
  const form=await req.formData();
  const full_name=String(form.get("full_name")||"").trim();
  const username=String(form.get("username")||"").trim().toLowerCase();
  const password=String(form.get("password")||"");
  const job=String(form.get("job")||"").trim();
  const allowedTemplates=["personal","business","designer","developer","creator","shop","cafe"];
  const requestedTemplate=String(form.get("template")||"personal");
  const template=allowedTemplates.includes(requestedTemplate)?requestedTemplate:"personal";
  if(full_name.length<2||!/^[a-z0-9_-]{3,24}$/.test(username)||password.length<8)return NextResponse.json({error:"نام، نام کاربری یا رمز عبور معتبر نیست."},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
  if(!url||!key)return NextResponse.json({error:"تنظیمات سرور Supabase کامل نیست."},{status:500});
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:existing,error:checkError}=await admin.from("profiles").select("id").eq("username",username).maybeSingle();
  if(checkError)return NextResponse.json({error:"بررسی نام کاربری ناموفق بود؛ جدول profiles را بررسی کن."},{status:500});
  if(existing)return NextResponse.json({error:"این نام کاربری قبلاً گرفته شده است."},{status:409});
  // Supabase Auth requires an email. Create a deterministic internal address so the public form does not ask for one.
  const internalEmail=`${username}@accounts.lumocard.ir`;
  const {data:created,error:createError}=await admin.auth.admin.createUser({email:internalEmail,password,email_confirm:true,user_metadata:{full_name,username}});
  if(createError||!created.user)return NextResponse.json({error:createError?.message||"ساخت حساب انجام نشد."},{status:400});
  const now=new Date().toISOString();
  const {error:profileError}=await admin.from("profiles").upsert({id:created.user.id,username,full_name,email:internalEmail,job:job||null,bio:"",social_links:{},appearance:{template,accent:"#8b20ff"},created_at:now,updated_at:now},{onConflict:"id"});
  if(profileError){await admin.auth.admin.deleteUser(created.user.id);return NextResponse.json({error:"حساب ساخته نشد چون ساخت پروفایل ناموفق بود: "+profileError.message},{status:500});}
  return NextResponse.json({success:true,trialStarted:true,redirect:"/login?created=1"},{status:201});
 }catch{return NextResponse.json({error:"خطای غیرمنتظره هنگام ثبت‌نام."},{status:500});}
}
