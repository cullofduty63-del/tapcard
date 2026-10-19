"use client";
import { useEffect, useState } from "react";
export default function AppInstallActions(){
 const [prompt,setPrompt]=useState<any>(null); const [ios,setIos]=useState(false);
 useEffect(()=>{const ua=navigator.userAgent;setIos(/iphone|ipad|ipod/i.test(ua));const h=(e:any)=>{e.preventDefault();setPrompt(e)};window.addEventListener("beforeinstallprompt",h);return()=>window.removeEventListener("beforeinstallprompt",h)},[]);
 async function install(){if(prompt){await prompt.prompt();setPrompt(null)}else{document.getElementById("install-help")?.scrollIntoView({behavior:"smooth",block:"center"})}}
 return <div className="app-install-card"><div className="app-install-actions"><button className="button" onClick={install}>{prompt?"نصب وب‌اپ اندروید":"نصب وب‌اپ"}</button><button className="button button-ghost" disabled title="فایل APK هنوز ساخته و امضا نشده است">دانلود APK اندروید · به‌زودی</button><a className="button button-ghost" href="/app-access">ورود / ثبت‌نام</a></div><p id="install-help" className="install-help">{ios?"در Safari دکمه Share را بزن و گزینه Add to Home Screen را انتخاب کن.":"در Chrome منوی سه‌نقطه را باز کن و Install app یا Add to Home screen را بزن. فایل APK مستقل باید پس از ساخت و امضای نسخه نهایی در همین سایت قرار بگیرد."}</p></div>
}
