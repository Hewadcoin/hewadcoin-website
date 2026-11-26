import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BOT_USERNAME = "Hewadcoinbot";
const API = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : "";
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/hewad-telegram-link`;

function json(data: unknown, status=200) {
  return new Response(JSON.stringify(data), {status, headers: {"content-type":"application/json"}});
}
async function telegram(method: string, body: unknown) {
  const r = await fetch(`${API}/${method}`, {
    method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(body)
  });
  const data = await r.json();
  if (!r.ok || !data.ok) throw new Error(data.description || "Telegram API error");
  return data;
}
async function send(chatId:number, text:string, keyboard=true) {
  return telegram("sendMessage", {
    chat_id:chatId, text, disable_web_page_preview:true,
    ...(keyboard ? {reply_markup:{keyboard:[
      [{text:"💰 Balance"},{text:"👤 Profile"}],
      [{text:"👥 Referral"},{text:"📊 Transactions"}],
      [{text:"🔒 Staking"},{text:"🎁 Daily Gift"}],
      [{text:"🆘 Support"},{text:"🌐 Change Language"}]
    ],resize_keyboard:true,is_persistent:true}} : {})
  });
}
function fmt(value:unknown, digits=4) {
  const n=Number(value ?? 0);
  return Number.isFinite(n) ? n.toLocaleString("en-US",{maximumFractionDigits:digits}) : "0";
}
const website = "https://hewadcoin.github.io/hewadcoin-website/";
const menuText = "🏦 HEWAD COIN\nستاسو حساب په بریالیتوب سره ونښلول شو.\n\nله لاندې مینو څخه خپل خدمت وټاکئ.";
const supabase = () => createClient(SUPABASE_URL,SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});

async function ensureWebhook() {
  const identity=await telegram("getMe",{});
  if ((identity.result?.username || "").toLowerCase() !== BOT_USERNAME.toLowerCase()) {
    throw new Error("TELEGRAM_BOT_TOKEN does not belong to @"+BOT_USERNAME);
  }
  await telegram("setMyCommands",{commands:[
    {command:"start",description:"Start HEWAD COIN Bot"},
    {command:"menu",description:"Open account menu"},
    {command:"help",description:"Get help"}
  ]});
  const info=await telegram("getWebhookInfo",{});
  if (info.result?.url !== WEBHOOK_URL) {
    await telegram("setWebhook",{url:WEBHOOK_URL,secret_token:WEBHOOK_SECRET,allowed_updates:["message"],drop_pending_updates:false});
  }
  return true;
}
async function linkedUser(db:any, telegramId:number) {
  const {data,error}=await db.from("telegram_account_links").select("user_id,language").eq("telegram_user_id",telegramId).maybeSingle();
  if(error) throw error;
  return data;
}

Deno.serve(async (req:Request) => {
  if (!BOT_TOKEN || !WEBHOOK_SECRET || !SUPABASE_URL || !SERVICE_ROLE_KEY)
    return json({error:"Bot secrets or Supabase environment are not configured"},503);

  if (req.method==="GET") {
    try { await ensureWebhook(); return json({service:"HEWAD COIN Telegram Bot",bot:"@"+BOT_USERNAME,webhook:"configured",ready:true}); }
    catch(e) { return json({service:"HEWAD COIN Telegram Bot",bot:"@"+BOT_USERNAME,ready:false,error:String(e)},502); }
  }
  if(req.method!=="POST") return json({error:"Method not allowed"},405);
  if(req.headers.get("x-telegram-bot-api-secret-token")!==WEBHOOK_SECRET) return json({error:"Unauthorized"},401);

  try {
    const update=await req.json();
    const message=update?.message, from=message?.from, chat=message?.chat;
    const text=typeof message?.text==="string"?message.text.trim():"";
    if(!from?.id || chat?.type!=="private" || !text) return json({ok:true});
    const db=supabase();

    const linkMatch=text.match(/^(?:\/(?:start|link)(?:@Hewadcoinbot)?\s+)?([0-9]{4})$/i);
    if(linkMatch) {
      const {error}=await db.rpc("hwc_telegram_link_account",{
        p_code:linkMatch[1],p_telegram_user_id:from.id,p_telegram_username:from.username??null
      });
      if(error) {
        const msg=/already linked/i.test(error.message)
          ?"دا Telegram حساب یا HEWAD COIN حساب له مخکې تړل شوی دی."
          :"کوډ ناسم، ختم شوی، یا له ۶۰ ثانیو وروسته پای ته رسېدلی. په وېب‌سایټ کې نوی کوډ جوړ کړئ.";
        await send(chat.id,msg,false);
      } else {
        await send(chat.id,"✅ ستاسو Telegram حساب په بریالیتوب سره ونښلول شو.\n\n"+menuText,true);
      }
      return json({ok:true});
    }

    const link=await linkedUser(db,from.id);
    if(/^\/(start|menu)(?:@Hewadcoinbot)?$/i.test(text)) {
      if(!link) await send(chat.id,"السلام علیکم! د HEWAD COIN حساب د نښلولو لپاره وېب‌سایټ ته لاړ شئ:\nProfile → Telegram Bot → Copy Code\n\n۴ رقمي کوډ دلته راولېږئ. کوډ ۶۰ ثانیې اعتبار لري.",false);
      else await send(chat.id,menuText,true);
      return json({ok:true});
    }
    if(!link) {
      await send(chat.id,"ستاسو Telegram لا له وېب‌سایټ حساب سره نه دی تړل شوی.\nProfile → Telegram Bot → Copy Code\nبیا ۴ رقمي کوډ دلته راولېږئ.",false);
      return json({ok:true});
    }

    const uid=link.user_id;
    const lang=link.language||"ps";
    const isEn=lang==="en";
    const t=text.toLowerCase();

    if(text==="💰 Balance" || t==="balance") {
      const {data,error}=await db.from("wallets").select("balance_hwc,balance_usd,balance_afn,reserved_hwc,staked_hwc").eq("user_id",uid).maybeSingle();
      if(error) throw error;
      const w=data||{};
      await send(chat.id,`💰 HEWAD COIN BALANCE\nHDC: ${fmt(w.balance_hwc,8)}\nUSDT: ${fmt(w.balance_usd,4)}\nAFN: ${fmt(w.balance_afn,2)}\nReserved HDC: ${fmt(w.reserved_hwc,8)}\nStaked HDC: ${fmt(w.staked_hwc,8)}`);
    } else if(text==="👤 Profile" || t==="profile") {
      const {data,error}=await db.from("profiles").select("first_name,last_name,username,referral_code,account_status,kyc_status,created_at").eq("id",uid).maybeSingle();
      if(error) throw error;
      const p=data||{};
      await send(chat.id,`👤 PROFILE\nName: ${[p.first_name,p.last_name].filter(Boolean).join(" ")||"—"}\nUsername: ${p.username||"—"}\nReferral Code: ${p.referral_code||"—"}\nAccount: ${p.account_status||"—"}\nKYC: ${p.kyc_status||"—"}`);
    } else if(text==="👥 Referral" || t==="referral") {
      const [{data:p,error:pe},{count,error:ce}]=await Promise.all([
        db.from("profiles").select("referral_code").eq("id",uid).maybeSingle(),
        db.from("profiles").select("id",{count:"exact",head:true}).eq("referred_by",uid)
      ]);
      if(pe||ce) throw pe||ce;
      await send(chat.id,`👥 REFERRAL\nYour code: ${p?.referral_code||"—"}\nInvited members: ${count??0}\n\nWebsite: ${website}`);
    } else if(text==="📊 Transactions" || t==="transactions") {
      const {data,error}=await db.from("wallet_transactions").select("asset,amount,transaction_type,status,description,created_at").eq("user_id",uid).order("created_at",{ascending:false}).limit(7);
      if(error) throw error;
      const rows=data||[];
      await send(chat.id,rows.length?"📊 LAST TRANSACTIONS\n\n"+rows.map((x:any)=>`• ${x.transaction_type} ${fmt(x.amount,8)} ${x.asset} — ${x.status}\n  ${x.description||""}\n  ${new Date(x.created_at).toLocaleString("en-GB",{timeZone:"Asia/Kabul"})}`).join("\n\n"):"تراوسه کومه معامله نه لرئ.");
    } else if(text==="🔒 Staking" || t==="staking") {
      const {data,error}=await db.from("staking_positions").select("plan_name,asset,principal,status,apr_percent,started_at,matures_at").eq("user_id",uid).order("started_at",{ascending:false}).limit(10);
      if(error) throw error;
      const rows=data||[];
      await send(chat.id,rows.length?"🔒 STAKING\n\n"+rows.map((x:any)=>`• ${x.plan_name||"Staking"}: ${fmt(x.principal,8)} ${x.asset}\n  Status: ${x.status} · APR: ${fmt(x.apr_percent,2)}%\n  Started: ${new Date(x.started_at).toLocaleDateString("en-GB",{timeZone:"Asia/Kabul"})}`).join("\n\n"):"تاسو اوس مهال فعال سټيکینګ نه لرئ.");
    } else if(text==="🎁 Daily Gift" || t==="daily gift") {
      const {data,error}=await db.rpc("hwc_bot_get_daily_gift");
      if(error) throw error;
      await send(chat.id,`🎁 HEWAD DAILY GIFT\n\nستاسو د نن ورځې Gift Code:\n\n${data.code}\n\nدا کوډ کاپي او د وېب‌سایټ Gift برخه کې یې داخل کړئ. هر کاروونکی دا کوډ یوازې یو ځل کارولی شي.\n\n${website}`);
    } else if(text==="🆘 Support" || t==="support") {
      await send(chat.id,"🆘 Support\n\nد ملاتړ ټیم ته د پیغام لېږلو لپاره خپل پیغام داسې راولېږئ:\n#support ستاسو پیغام\n\nموږ به یې د ملاتړ په سیستم کې ثبت کړو.",false);
    } else if(text.startsWith("#support") || text.toLowerCase().startsWith("support:")) {
      const body=text.replace(/^#support\s*/i,"").replace(/^support:\s*/i,"").trim();
      if(body.length<4 || body.length>4000) await send(chat.id,"مهرباني وکړئ د ملاتړ پیغام لږ تر لږه ۴ او تر ۴۰۰۰ تورو پورې ولیکئ.",false);
      else {
        const {data:ticket,error}=await db.from("support_tickets").insert({user_id:uid,subject:"Telegram Support",message:body,category:"Technical",status:"open"}).select("id").single();
        if(error) throw error;
        await send(chat.id,"✅ ستاسو د ملاتړ غوښتنه ثبت شوه.\nTicket: "+ticket.id,false);
      }
    } else if(text==="🌐 Change Language" || t==="language") {
      const next=lang==="ps"?"en":"ps";
      const {error}=await db.from("telegram_account_links").update({language:next}).eq("user_id",uid);
      if(error) throw error;
      await send(chat.id,next==="en"?"Language changed to English.":"ژبه پښتو ته بدله شوه.");
    } else {
      await send(chat.id,isEn?"Please choose an option from the menu.":"مهرباني وکړئ له مینو څخه یو انتخاب وکړئ.");
    }
    return json({ok:true});
  } catch(error) {
    console.error("HEWAD Telegram bot error:",error);
    return json({ok:true});
  }
});
