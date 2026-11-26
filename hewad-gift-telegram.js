/* HEWAD COIN — Gift redemption + Telegram account linking */
(function(){
'use strict';
var db=typeof hwcSupabase!=='undefined'?hwcSupabase:window.hwcSupabase;
if(!db){console.warn('HEWAD Gift/Telegram: Supabase client unavailable.');return;}
var BOT='https://t.me/Hewadcoinbot';
var css=document.createElement('style');
css.textContent='.hwc-feature-modal{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto}.hwc-feature-card{width:min(100%,460px);background:linear-gradient(155deg,#171a20,#0b0d11);border:1px solid #51452c;border-radius:22px;padding:22px;color:#f5f1e6;box-shadow:0 24px 80px #000a}.hwc-feature-close{float:right;border:0;background:#292c33;color:#fff;border-radius:10px;padding:7px 11px}.hwc-feature-title{text-align:center;color:#e8bd4a;font-size:24px;font-weight:900;letter-spacing:2px;margin:12px 0 5px}.hwc-feature-sub{text-align:center;color:#aeb2bc;font-size:12px;margin-bottom:22px}.hwc-feature-card label{display:block;font-size:12px;color:#c9cbd1;margin:12px 0 6px}.hwc-feature-card input{box-sizing:border-box;width:100%;padding:14px;border-radius:12px;background:#090b0f;border:1px solid #484b53;color:white;font-size:16px;letter-spacing:1px}.hwc-feature-primary{width:100%;border:0;border-radius:12px;padding:14px;background:linear-gradient(100deg,#b98727,#f0d17a);color:#17130a;font-weight:900;margin-top:12px}.hwc-feature-help{border-top:1px solid #33353b;margin-top:22px;padding-top:16px;color:#c8cbd2;font-size:12px;line-height:1.8}.hwc-feature-help b{color:#e9c76d}.hwc-feature-note{font-size:12px;color:#d8c58e;line-height:1.6;margin-top:12px}.hwc-feature-code{font-size:26px;letter-spacing:8px;text-align:center;color:#f1d17a;font-weight:900;padding:18px;border:1px dashed #79602b;border-radius:14px;margin:15px 0}.hwc-profile-telegram-card{margin:16px 0;padding:15px;border:1px solid #594829;border-radius:15px;background:linear-gradient(135deg,#1a1c21,#111318);color:#f5f1e6}.hwc-profile-telegram-card button{border:0;border-radius:9px;padding:10px 12px;margin:6px 6px 0 0;background:#d9b44d;color:#17130a;font-weight:800}.hwc-profile-telegram-card .secondary{background:#30343c;color:#fff}';
document.head.appendChild(css);
function currentUser(){return window.hwcCurrentUser||null;}
function notify(msg){if(typeof window.showNotice==='function')window.showNotice(msg);else alert(msg);}
function modal(content){var old=document.getElementById('hwcFeatureModal');if(old)old.remove();var wrap=document.createElement('div');wrap.id='hwcFeatureModal';wrap.className='hwc-feature-modal';wrap.innerHTML='<section class="hwc-feature-card"><button class="hwc-feature-close" type="button" aria-label="Close">✕</button>'+content+'</section>';wrap.addEventListener('click',function(e){if(e.target===wrap||e.target.closest('.hwc-feature-close'))wrap.remove();});document.body.appendChild(wrap);return wrap;}
function openGift(){
var u=currentUser();if(!u){notify('Please sign in to redeem a gift.');return;}
var wrap=modal('<div class="hwc-feature-title">🎁 HEWAD GIFT</div><div class="hwc-feature-sub">Redeem your gift code</div><label for="hwcGiftCode">GIFT CODE</label><input id="hwcGiftCode" maxlength="32" autocomplete="off" placeholder="Enter your gift code"><button id="hwcGiftRedeem" class="hwc-feature-primary" type="button">REDEEM</button><div id="hwcGiftMessage" class="hwc-feature-note" aria-live="polite"></div><div class="hwc-feature-help"><b>How it works</b><br>1. Copy your Gift Code from the Telegram Bot or another source.<br>2. Enter the code in the Gift section of the website.<br>3. Each user can redeem a code only once.<br>4. After successful verification, the reward is added to your Wallet.</div>');
var input=wrap.querySelector('#hwcGiftCode'),button=wrap.querySelector('#hwcGiftRedeem'),message=wrap.querySelector('#hwcGiftMessage');
input.addEventListener('input',function(){input.value=input.value.toUpperCase().replace(/\s+/g,'');});
button.addEventListener('click',async function(){
var code=input.value.trim();if(!/^[A-Z0-9-]{4,32}$/.test(code)){message.textContent='Please enter a valid Gift Code.';return;}
button.disabled=true;button.textContent='VERIFYING…';message.textContent='';
try{var q=await db.rpc('hwc_redeem_gift_code',{p_code:code});if(q.error)throw q.error;
message.textContent='✓ Gift redeemed successfully. Your Wallet has been updated.';input.value='';
setTimeout(function(){var el=document.getElementById('hwcFeatureModal');if(el)el.remove();},1800);
}catch(e){message.textContent=(e&&e.message)||'Could not redeem this Gift Code.';}
finally{button.disabled=false;button.textContent='REDEEM';}
});
}
async function openTelegram(){
var auth=await db.auth.getUser();if(auth.error)throw auth.error;var u=auth.data&&auth.data.user;if(!u){notify('Please sign in first.');return;}
var wrap=modal('<div class="hwc-feature-title">🤖 TELEGRAM BOT</div><div class="hwc-feature-sub">@Hewadcoinbot</div><div id="hwcTelegramState" class="hwc-feature-note">Checking account link…</div><div id="hwcTelegramActions"></div>');
var state=wrap.querySelector('#hwcTelegramState'),actions=wrap.querySelector('#hwcTelegramActions');
try{
var status=await db.rpc('hwc_get_telegram_link_status');
if(status.error)throw status.error;
if(status.data&&status.data.linked){
state.textContent='✓ Your Telegram account is connected.';
actions.innerHTML='<a href="'+BOT+'" target="_blank" rel="noopener" style="display:block;text-align:center;padding:13px;margin-top:14px;border-radius:11px;background:#238bd0;color:white;font-weight:800;text-decoration:none">OPEN TELEGRAM BOT</a>';
return;
}
state.textContent='1. Open the official bot. 2. Copy a new 4-digit code here. 3. Send the code to the bot within 60 seconds.';
actions.innerHTML='<button id="hwcGenerateTelegramCode" class="hwc-feature-primary" type="button">GENERATE 4-DIGIT CODE</button><div id="hwcTelegramCode" class="hwc-feature-code" hidden></div><button id="hwcCopyTelegramCode" class="hwc-feature-primary" type="button" hidden>COPY CODE</button><a href="'+BOT+'" target="_blank" rel="noopener" style="display:block;text-align:center;padding:13px;margin-top:12px;border-radius:11px;background:#238bd0;color:white;font-weight:800;text-decoration:none">OPEN @Hewadcoinbot</a>';
var gen=wrap.querySelector('#hwcGenerateTelegramCode'),codeEl=wrap.querySelector('#hwcTelegramCode'),copy=wrap.querySelector('#hwcCopyTelegramCode'),code='';
gen.addEventListener('click',async function(){gen.disabled=true;gen.textContent='GENERATING…';try{var q=await db.rpc('hwc_create_telegram_link_code');if(q.error)throw q.error;var row=Array.isArray(q.data)?q.data[0]:q.data;code=row.link_code;codeEl.textContent=code;codeEl.hidden=false;copy.hidden=false;gen.textContent='GENERATE NEW CODE';}catch(e){state.textContent=e.message||'Could not generate code.';gen.textContent='TRY AGAIN';}finally{gen.disabled=false;}});
copy.addEventListener('click',async function(){try{await navigator.clipboard.writeText(code);copy.textContent='COPIED ✓';}catch(e){copy.textContent='Copy unavailable — select the code above';}});
}catch(e){state.textContent=e.message||'Could not check Telegram link status.';}
}
function bindTiles(){
document.querySelectorAll('[data-action]').forEach(function(tile){
var action=(tile.getAttribute('data-action')||'').trim().toLowerCase();
if(action==='gift'&&!tile.dataset.hwcGiftBound){tile.dataset.hwcGiftBound='1';tile.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openGift();},false);}
if(action==='telegram bot'&&!tile.dataset.hwcTelegramBound){tile.dataset.hwcTelegramBound='1';tile.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openTelegram();},false);}
});
}
function injectProfileCard(){
var candidates=[].slice.call(document.querySelectorAll('#profilePage,#profileSection,#profile,.profile-section,.profile-card,.profile-page,.profile-content,.profile-container,[data-page="Profile"],[data-page="profile"],.profile-view'));
if(!candidates.length){
candidates=[].slice.call(document.querySelectorAll('#dashboard section,#dashboard .dash-subpage,#dashboard .page-content')).filter(function(el){return el.offsetParent!==null&&/profile/i.test((el.innerText||'').slice(0,500));});
}
var host=candidates.find(function(el){return el&&el.offsetParent!==null;});
if(!host||host.querySelector('.hwc-profile-telegram-card'))return;
var card=document.createElement('div');card.className='hwc-profile-telegram-card';
card.innerHTML='<strong>🤖 Telegram Bot</strong><p style="font-size:12px;color:#b9bbc2;margin:7px 0">Connect your HEWAD COIN account to the official Telegram Bot.</p><button type="button" data-hwc-open-telegram>Telegram Bot</button>';
card.querySelector('button').addEventListener('click',openTelegram);host.appendChild(card);
}
document.addEventListener('click',function(e){
var node=e.target;
for(var depth=0;node&&depth<6;depth++,node=node.parentElement){
var label=(node.innerText||node.textContent||'').replace(/\s+/g,' ').trim();
if(/^Link Telegram(?:\s|$)/i.test(label)&&/Not Linked/i.test(label)){
e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openTelegram();return;
}
}
},true);
document.addEventListener('click',function(e){
var tile=e.target.closest('[data-action]');
if(tile&&(tile.getAttribute('data-action')||'').toLowerCase()==='profile'){setTimeout(injectProfileCard,250);setTimeout(injectProfileCard,900);}
},true);
var observer=new MutationObserver(function(){bindTiles();injectProfileCard();});
observer.observe(document.documentElement,{childList:true,subtree:true});
bindTiles();
console.info('HEWAD Gift and Telegram client features initialized.');
})();