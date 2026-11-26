/* HEWAD COIN — Admin Gift Control */
(function(){
'use strict';
var db=window.hwcSupabase,adminPanel=document.getElementById('adminPanel');
if(!db||!adminPanel)return;
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var fmt=function(v){return Number(v||0).toLocaleString(undefined,{maximumFractionDigits:8});};
var notice=function(m){if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
var page=document.createElement('section');page.id='hwcAdminGift';page.className='admin-view hwc-admin-page';page.style.display='none';page.hidden=true;
page.innerHTML='<style>#hwcAdminGift .gift-card{background:#15171c;border:1px solid #39332a;border-radius:14px;padding:15px;margin:12px 0}#hwcAdminGift label{display:block;color:#c6c7cd;font-size:12px;margin:12px 0 5px}#hwcAdminGift input{box-sizing:border-box;width:100%;padding:11px;border-radius:9px;border:1px solid #494b51;background:#0c0e12;color:#fff}#hwcAdminGift .gift-row{display:flex;gap:8px;align-items:center}#hwcAdminGift .gift-row>*{flex:1}#hwcAdminGift .gift-btn{border:0;border-radius:9px;padding:11px 13px;background:#d8ad3e;color:#241900;font-weight:900;margin-top:10px}#hwcAdminGift .gift-muted{color:#a9abb4;font-size:11px;line-height:1.5}#hwcAdminGift .gift-code-result{padding:13px;border:1px dashed #96722c;border-radius:10px;color:#f0d17a;overflow-wrap:anywhere;font-weight:900;margin-top:12px}</style><button class="hwc-admin-back" type="button" data-hwc-gift-back>‹ Control Panel</button><h2>🎁 Gift Management</h2><p class="gift-muted">Create special gift codes and manage the persistent daily reward amount.</p><div class="gift-card"><h3>1. د ډالۍ کوډ جوړول</h3><label>Gift Code</label><div class="gift-row"><input id="hwcSpecialCode" maxlength="32" placeholder="Example: HEWAD2026"><button type="button" id="hwcMakeRandom" class="gift-btn">Generate</button></div><label>Reward Amount (HDC)</label><input id="hwcSpecialAmount" type="number" min="0.00000001" step="0.00000001" placeholder="Enter HDC amount"><label>Allowed Users</label><input id="hwcSpecialLimit" type="number" min="1" step="1" placeholder="Leave empty for ټول (all users)"><p class="gift-muted">Each user can redeem a special code once. No expiry date is required. The selected limit is the maximum number of different users.</p><button id="hwcCreateSpecialGift" class="gift-btn" type="button">CREATE GIFT CODE</button><div id="hwcSpecialResult" class="gift-code-result" hidden></div></div><div class="gift-card"><h3>2. ورځنۍ ډالۍ مقدار بدلول</h3><p class="gift-muted">This amount remains saved until you change it. It is not shown on the user Gift page.</p><div id="hwcCurrentDailyAmount" class="gift-muted">Loading current amount…</div><label>New Daily Gift Amount (HDC)</label><input id="hwcDailyAmount" type="number" min="0.00000001" step="0.00000001" placeholder="Enter new HDC amount"><button id="hwcSaveDailyAmount" class="gift-btn" type="button">SAVE DAILY AMOUNT</button></div><div class="gift-card"><h3>Recent Special Gift Codes</h3><div id="hwcGiftCodeList" class="gift-muted">Loading…</div></div>';
adminPanel.appendChild(page);
function isAdmin(){return window.HEWAD_USER_ROLE==='admin';}
function showGift(){
if(!isAdmin()){notice('Administrator access required.');return;}
adminPanel.querySelectorAll('.admin-view').forEach(function(el){el.hidden=el!==page;el.style.display=el===page?'block':'none';});
page.hidden=false;page.style.display='block';loadDaily();loadCodes();
}
function addMenu(){
var home=document.getElementById('adminHome'),grid=home&&home.querySelector('.hwc-admin-grid');
if(!grid||grid.querySelector('[data-hwc-gift-open]'))return;
var b=document.createElement('button');b.type='button';b.className='hwc-admin-option';b.setAttribute('data-hwc-gift-open','1');
b.innerHTML='<span class="ico">🎁</span><span><strong>ډالۍ</strong><small>Create special gift codes and change the Daily Gift amount</small></span><span class="arrow">›</span>';
b.addEventListener('click',showGift);grid.appendChild(b);
}
async function loadDaily(){
var host=document.getElementById('hwcCurrentDailyAmount');if(!host)return;
var q=await db.rpc('hwc_admin_get_daily_gift_amount');if(q.error){host.textContent=q.error.message;return;}
host.textContent='Current saved amount: '+fmt(q.data)+' HDC';
}
async function loadCodes(){
var host=document.getElementById('hwcGiftCodeList');if(!host)return;
var q=await db.from('gift_codes').select('code,reward_amount,max_claims,claims_count,active,gift_type,created_at').eq('gift_type','special').order('created_at',{ascending:false}).limit(12);
if(q.error){host.textContent=q.error.message;return;}
var rows=q.data||[];host.innerHTML=rows.length?rows.map(function(x){return '<div style="padding:9px 0;border-bottom:1px solid #333"><b>'+esc(x.code)+'</b> · '+fmt(x.reward_amount)+' HDC<br><small>'+fmt(x.claims_count)+' / '+(x.max_claims==null?'ټول':fmt(x.max_claims))+' claims · '+(x.active?'Active':'Inactive')+'</small></div>';}).join(''):'No special gift codes yet.';
}
document.addEventListener('click',async function(e){
if(e.target.closest('[data-hwc-gift-back]')){e.preventDefault();e.stopPropagation();var home=document.getElementById('adminHome');if(home){adminPanel.querySelectorAll('.admin-view').forEach(function(el){el.hidden=el!==home;el.style.display=el===home?'block':'none';});home.hidden=false;}return;}
},true);
document.getElementById('hwcMakeRandom').addEventListener('click',function(){
var chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',v='HDC-';for(var i=0;i<8;i++)v+=chars[Math.floor(Math.random()*chars.length)];
document.getElementById('hwcSpecialCode').value=v;
});
document.getElementById('hwcCreateSpecialGift').addEventListener('click',async function(){
if(!isAdmin())return notice('Administrator access required.');
var code=document.getElementById('hwcSpecialCode').value.trim().toUpperCase(),amount=Number(document.getElementById('hwcSpecialAmount').value),limitText=document.getElementById('hwcSpecialLimit').value.trim(),limit=limitText?Number(limitText):null;
if(!/^[A-Z0-9-]{4,32}$/.test(code)||!Number.isFinite(amount)||amount<=0||(limit!==null&&(!Number.isInteger(limit)||limit<=0)))return notice('Please enter a valid code, reward amount and user limit.');
var b=this;b.disabled=true;b.textContent='CREATING…';
try{var q=await db.rpc('hwc_admin_create_gift_code_v2',{p_code:code,p_reward_amount:amount,p_max_claims:limit});if(q.error)throw q.error;
var result=document.getElementById('hwcSpecialResult');result.hidden=false;result.textContent='Created: '+code+' — copy and share this code with your chosen Telegram groups or friends.';
try{await navigator.clipboard.writeText(code);result.textContent+=' (Copied to clipboard)';}catch(_){}
document.getElementById('hwcSpecialCode').value='';document.getElementById('hwcSpecialAmount').value='';document.getElementById('hwcSpecialLimit').value='';
await loadCodes();notice('Special Gift Code created successfully.');
}catch(e){notice(e.message||'Could not create Gift Code.');}
finally{b.disabled=false;b.textContent='CREATE GIFT CODE';}
});
document.getElementById('hwcSaveDailyAmount').addEventListener('click',async function(){
if(!isAdmin())return notice('Administrator access required.');
var amount=Number(document.getElementById('hwcDailyAmount').value);if(!Number.isFinite(amount)||amount<=0)return notice('Enter a valid HDC amount.');
var b=this;b.disabled=true;b.textContent='SAVING…';
try{var q=await db.rpc('hwc_admin_set_daily_gift_amount',{p_amount:amount});if(q.error)throw q.error;
document.getElementById('hwcDailyAmount').value='';await loadDaily();notice('Daily Gift amount updated and saved.');}
catch(e){notice(e.message||'Could not update Daily Gift amount.');}
finally{b.disabled=false;b.textContent='SAVE DAILY AMOUNT';}
});
var observer=new MutationObserver(addMenu);observer.observe(adminPanel,{childList:true,subtree:true});
addMenu();
console.info('HEWAD Admin Gift controls initialized.');
})();