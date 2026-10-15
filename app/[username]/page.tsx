import Link from "next/link";
import {notFound} from "next/navigation";
import {createClient} from "@supabase/supabase-js";
type Profile={username:string;full_name:string;job?:string;bio?:string;phone?:string;website?:string;location?:string;avatar_url?:string;social_links?:Record<string,string>;appearance?:{template?:string;accent?:string;background?:string}};
const labels:Record<string,string>={instagram:"Instagram",telegram:"Telegram",youtube:"YouTube",whatsapp:"WhatsApp",website:"Website"};
function safeHref(raw:string){if(/^https?:\/\//i.test(raw))return raw;if(/^[\w.-]+\.[a-z]{2,}/i.test(raw))return "https://"+raw;return ""}
export default async function PublicCard({params}:{params:Promise<{username:string}>}) {
 const {username}=await params;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error("Missing public Supabase environment variables");
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.from("profiles").select("username,full_name,job,bio,phone,website,location,avatar_url,social_links,appearance").eq("username",username.toLowerCase()).maybeSingle();
 if(error||!data)notFound();
 const p=data as Profile;const links=Object.entries(p.social_links||{}).map(([k,v])=>({key:k,label:labels[k]||k,url:typeof v==="string"?safeHref(v):""})).filter(x=>x.url);
 if(p.website&&safeHref(p.website)&&!links.some(l=>l.url===safeHref(p.website!)))links.push({key:"website",label:"Website",url:safeHref(p.website)});
 const accent=p.appearance?.accent||"#8b20ff";
 const template=p.appearance?.template||"personal";
 const theme:Record<string,{background:string;card:string;borderRadius:string;shadow:string;label:string}>={
  personal:{background:"radial-gradient(ellipse at top,#1b1030,#07070c 60%)",card:"rgba(12,10,20,.92)",borderRadius:"28px",shadow:"0 20px 70px #0008",label:"PERSONAL"},
  business:{background:"linear-gradient(145deg,#07111f,#101c2c 55%,#05080d)",card:"#0d1725",borderRadius:"14px",shadow:"0 18px 50px #0008",label:"BUSINESS"},
  designer:{background:"linear-gradient(135deg,#21132b,#0b0b12 60%,#321b35)",card:"linear-gradient(145deg,#17101f,#0d0b12)",borderRadius:"36px 12px 36px 12px",shadow:"0 20px 70px #0009",label:"DESIGNER"},
  developer:{background:"radial-gradient(circle at top,#102a2b,#05090d 65%)",card:"#071214",borderRadius:"12px",shadow:"0 0 0 1px #20c99722,0 20px 60px #0009",label:"DEVELOPER"},
  creator:{background:"linear-gradient(135deg,#260c20,#110a1e 55%,#25102c)",card:"linear-gradient(150deg,#1c1022,#100b16)",borderRadius:"30px",shadow:"0 20px 70px #0009",label:"CREATOR"},
  shop:{background:"linear-gradient(145deg,#20170a,#0b0a08 65%)",card:"#15110b",borderRadius:"18px",shadow:"0 18px 55px #0009",label:"SHOP"},
  cafe:{background:"linear-gradient(145deg,#2c1c13,#0c0907 65%)",card:"#19110d",borderRadius:"24px",shadow:"0 18px 55px #0009",label:"CAFE"}
 };
 const selectedTheme=theme[template]||theme.personal;
 return <main style={{minHeight:"100vh",padding:"1px 0",background:selectedTheme.background,["--card-accent" as string]:accent}}><article className={`public-profile template-${template}`} style={{borderColor:accent+"99",background:selectedTheme.card,borderRadius:selectedTheme.borderRadius,boxShadow:selectedTheme.shadow}} ><div className="preview-top"><Link className="brand" href="/">ϟ Lumo<span>Card</span></Link><span className="pill">{selectedTheme.label}</span></div><div className="public-avatar" style={{border:`2px solid ${accent}`}}>{p.avatar_url?<img src={p.avatar_url} alt="تصویر پروفایل"/>:(p.full_name||p.username).slice(0,2)}</div><h1>{p.full_name||p.username}</h1>{p.job&&<p className="public-job">{p.job}</p>}{p.bio&&<p className="public-bio">{p.bio}</p>}{p.location&&<p className="muted">⌖ {p.location}</p>}{p.phone&&<p className="muted" dir="ltr">{p.phone}</p>}<div className="social-list">{links.map(l=><a className="social-link" key={l.key} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} <span style={{float:"left",color:accent}}>↗</span></a>)}</div><p className="powered">Made with <span style={{color:accent}}>ϟ LumoCard</span></p></article></main>;
}
