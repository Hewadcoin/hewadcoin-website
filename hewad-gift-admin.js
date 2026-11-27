/* HEWAD COIN — Gift Management: dedicated menu + working daily/special pages. */
(function(){
'use strict';
var db=hwcSupabase,adminPanel=document.getElementById('adminPanel');
if(!db||!adminPanel){console.error('HEWAD Gift Management: required dashboard elements are unavailable.');return;}
var $=function(id){return document.getElementById(id);};
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var fmt=function(v){return Number(v||0).toLocaleString(undefined,{maximumFractionDigits:8});};
var notice=function(m){if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
var isAdmin=function(){return window.HEWAD_USER_ROLE==='admin';};
var page=document.getElementById('hwcAdminGift');
if(!page){page=document.createElement('section');page.id='hwcAdminGift';page.className='admin-view hwc-admin-page';adminPanel.appendChild(page);}
page.hidden=true;page.style.display='none';
var style=document.getElementById('hwc-gift-management-style');
if(!style){style=document.createElement('style');style.id='hwc-gift-management-style';style.textContent=
'#hwcAdminGift{padding:4px 0 24px;color:#f5f2e9}#hwcAdminGift .gift-back{border:0;background:transparent;color:#e8bd4a;padding:9px 0;font-weight:800}#hwcAdminGift h2{color:#e8bd4a;font-size:19px;margin:10px 0}#hwcAdminGift .gift-muted{color:#a9abb4;font-size:11px;line-height:1.55}#hwcAdminGift .gift-card{background:#15171c;border:1px solid #39332a;border-radius:15px;padding:15px;margin:12px 0}#hwcAdminGift .gift-choice{display:flex;align-items:center;gap:13px;width:100%;padding:17px;margin:12px 0;text-align:left;border:1px solid #51401f;border-radius:14px;background:linear-gradient(135deg,#1b1c20,#121317);color:#f7f2e5}#hwcAdminGift .gift-choice .ico{width:44px;height:44px;display:grid;place-items:center;flex:0 0 44px;border-radius:12px;background:#302718;color:#f1c75c;font-size:23px}#hwcAdminGift .gift-choice strong{display:block;font-size:14px}#hwcAdminGift .gift-choice small{display:block;color:#aeb0b8;font-size:11px;margin-top:5px;line-height:1.45}#hwcAdminGift .gift-choice .arrow{margin-left:auto;color:#d9b24f;font-size:22px}#hwcAdminGift label{display:block;color:#d5d5da;font-size:12px;font-weight:700;margin:13px 0 6px}#hwcAdminGift input:not([type=checkbox]){box-sizing:border-box;width:100%;padding:12px;border-radius:9px;border:1px solid #494b51;background:#0c0e12;color:#fff;margin:0}#hwcAdminGift .gift-row{display:flex;gap:8px;align-items:center}#hwcAdminGift .gift-row>*{flex:1;min-width:0}#hwcAdminGift .gift-btn{border:0;border-radius:9px;padding:12px 14px;background:#d8ad3e;color:#241900;font-weight:900;margin-top:12px;width:100%}#hwcAdminGift .gift-btn.secondary{background:#353840;color:#fff;width:auto;margin:0}#hwcAdminGift .gift-btn:disabled{opacity:.5}#hwcAdminGift .gift-check{display:flex;align-items:center;gap:9px;margin:14px 0;color:#f0d58c}#hwcAdminGift .gift-check input{width:18px;height:18px;accent-color:#d8ad3e}#hwcAdminGift .gift-result{padding:13px;border:1px dashed #96722c;border-radius:10px;color:#f0d17a;overflow-wrap:anywhere;font-weight:800;margin-top:12px}#hwcAdminGift .gift-result-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}#hwcAdminGift .gift-copy{border:1px solid #d8ad3e;border-radius:8px;background:#282116;color:#f4d477;padding:9px 13px;font-weight:800}#hwcAdminGift .gift-record{padding:11px 0;border-bottom:1px solid #34363d}#hwcAdminGift .gift-record:last-child{border-bottom:0}#hwcAdminGift details summary{cursor:pointer;line-height:1.6}#hwcAdminGift .gift-claim{padding:8px;margin:6px 0;background:#101216;border-radius:8px;font-size:11px;line-height:1.5}#hwcAdminGift .gift-success{position:relative;overflow:hidden;padding:18px;border:1px solid #80632c;border-radius:17px;background:radial-gradient(circle at 90% 0%,#59431c 0,transparent 42%),linear-gradient(145deg,#242016,#111318 72%);box-shadow:0 12px 30px #0007;margin-top:14px}#hwcAdminGift .gift-success-head{text-align:center;color:#f5d477;font-size:19px;font-weight:900;margin:2px 0 12px}#hwcAdminGift .gift-code-display{padding:15px 12px;text-align:center;border:1px dashed #c69b42;background:#0d0e11;border-radius:12px;color:#ffe08a;font-size:22px;letter-spacing:2px;font-weight:900;overflow-wrap:anywhere}#hwcAdminGift .gift-success-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}#hwcAdminGift .gift-success-meta>div{padding:10px;border-radius:10px;background:#ffffff0b;text-align:center}#hwcAdminGift .gift-success-meta small{display:block;color:#b9b5a8;font-size:10px;margin-bottom:5px}#hwcAdminGift .gift-success-meta strong{color:#f5d477;font-size:14px}#hwcAdminGift .gift-copy{min-width:120px}';
document.head.appendChild(style);}
function hideOtherViews(){adminPanel.querySelectorAll('.admin-view').forEach(function(el){el.hidden=el!==page;el.style.display=el===page?'block':'none';});page.hidden=false;page.style.display='block';}
function backButton(target){return '<button class="gift-back" type="button" data-gift-nav="'+target+'">‹ '+(target==='home'?'Control Panel':'Gift Management')+'</button>';}
function openHome(){
if(!isAdmin()){notice('Administrator access required.');return;}
hideOtherViews();
page.innerHTML=backButton('control')+'<h2>🎁 Gift Management</h2><p class="gift-muted">د ډالۍ د مدیریت لپاره لاندې له دوو برخو څخه یوه وټاکئ.</p><button class="gift-choice" type="button" data-gift-nav="daily"><span class="ico">🎁</span><span><strong>Daily Gift Amount</strong><small>د ورځنۍ ډالۍ د HDC مقدار بدلول او خوندي کول</small></span><span class="arrow">›</span></button><button class="gift-choice" type="button" data-gift-nav="special"><span class="ico">🎟️</span><span><strong>Special Gift Code</strong><small>ځانګړی کوډ جوړول، د انعام اندازه او د کاروونکو شمېر ټاکل</small></span><span class="arrow">›</span></button><div class="gift-card"><h3>Gift Code Activity</h3><div id="hwcGiftCodeList" class="gift-muted">Loading gift codes…</div></div>';
loadCodes();
}
async function loadDaily(){
var host=$('hwcCurrentDailyAmount');if(!host)return;
host.textContent='Loading saved amount…';
var q=await db.rpc('hwc_admin_get_daily_gift_amount');
if(q.error){host.textContent='Could not load: '+q.error.message;return;}
host.textContent='Current saved amount: '+fmt(q.data)+' HDC';
var input=$('hwcDailyAmount');if(input)input.value=String(q.data==null?'':q.data);
}
async function openDaily(){
if(!isAdmin()){notice('Administrator access required.');return;}
hideOtherViews();
page.innerHTML=backButton('home')+'<h2>🎁 Daily Gift Amount</h2><div class="gift-card"><p class="gift-muted">دلته د ورځنۍ ډالۍ د انعام اندازه ولیکئ. دا مقدار به تر هغه ثابت وي چې اډمین یې بیا بدل کړي.</p><div id="hwcCurrentDailyAmount" class="gift-muted">Loading…</div><label for="hwcDailyAmount">Daily Gift Reward (HDC)</label><input id="hwcDailyAmount" type="number" min="0.00000001" step="0.00000001" placeholder="د HDC مقدار ولیکئ"><button id="hwcSaveDailyAmount" class="gift-btn" type="button">SAVE DAILY AMOUNT</button></div>';
await loadDaily();
}
async function loadCodes(){
var host=$('hwcGiftCodeList');if(!host)return;
var q=await db.rpc('hwc_admin_list_gift_codes');
if(q.error){host.textContent='Could not load gift codes: '+q.error.message;return;}
var rows=Array.isArray(q.data)?q.data:[];
host.innerHTML=rows.length?rows.map(function(x){
var claims=Array.isArray(x.claims)?x.claims:[];
var count=Number(x.claims_count||0),limit=x.max_claims==null?'ټول کاروونکي':fmt(x.max_claims);
var details=claims.length?claims.map(function(u,i){var who=u.name||(u.username?'@'+u.username:'User');var tg=u.telegram_username?'@'+u.telegram_username:(u.telegram_user_id?'Telegram ID: '+u.telegram_user_id:'Telegram not linked');return '<div class="gift-claim"><b>'+(i+1)+'. '+esc(who)+'</b><br>'+esc(tg)+' · '+fmt(u.amount)+' HDC · '+esc(new Date(u.claimed_at).toLocaleString())+'</div>';}).join(''):'<p class="gift-muted">تر اوسه چا نه دی استعمال کړی.</p>';
return '<details class="gift-record"><summary><b>'+esc(x.code)+'</b> · '+fmt(x.reward_amount)+' HDC<br><span class="gift-muted">'+count+' / '+limit+' claims · '+(x.gift_type==='daily'?'Daily':'Special')+' · '+(x.active?'Active':'Inactive')+'</span></summary><div><b>Claim recipients ('+claims.length+')</b>'+details+'</div></details>';
}).join(''):'No gift codes found.';
}
async function loadEligibleUsers(){
var wrap=$('hwcEligibleUsersWrap'),list=$('hwcEligibleUsers'),count=$('hwcEligibleUsersCount');
if(!wrap||!list||!count)return;
wrap.hidden=false;list.value='د مستحقو کاروونکو لېست لوډ کېږي…';count.textContent='';
try{
var q=await db.from('profiles').select('first_name,last_name,username,referral_code').eq('kyc_status','approved').eq('account_status','active').order('first_name',{ascending:true}).limit(1000);
if(q.error)throw q.error;
var users=Array.isArray(q.data)?q.data:[];
list.value=users.length?users.map(function(u,n){var name=[u.first_name,u.last_name].filter(Boolean).join(' ')||u.username||'Member';return (n+1)+'. '+name+(u.username?' (@'+u.username+')':'')+(u.referral_code?' · '+u.referral_code:'');}).join('\n'):'اوس مهال مستحق فعال کاروونکي ونه موندل شول.';
count.textContent='ټول مستحق فعال کاروونکي: '+users.length;
}catch(err){list.value='د کاروونکو لېست لوډ نه شو: '+(err.message||'Unknown error');count.textContent='';}
}
async function openSpecial(){
if(!isAdmin()){notice('Administrator access required.');return;}
hideOtherViews();
page.innerHTML=backButton('home')+'<h2>🎟️ Create Special Gift Code</h2><div class="gift-card"><p class="gift-muted">کوډ، د HDC انعام او د استعمالوونکو شمېر وټاکئ. که «ټول کاروونکي» انتخاب کړئ، هر کاروونکی دغه کوډ یو ځل کارولی شي.</p><label for="hwcSpecialCode">1. Gift Code</label><div class="gift-row"><input id="hwcSpecialCode" maxlength="32" placeholder="لکه: HEWAD2026"><button type="button" id="hwcMakeRandom" class="gift-btn secondary">Generate</button></div><label for="hwcSpecialAmount">2. Reward Amount (HDC)</label><input id="hwcSpecialAmount" type="number" min="0.00000001" step="0.00000001" placeholder="د HDC مقدار ولیکئ"><label for="hwcSpecialLimit">3. Allowed Users</label><input id="hwcSpecialLimit" type="number" min="1" step="1" placeholder="د کاروونکو شمېر، لکه 100"><label class="gift-check"><input id="hwcSpecialAll" type="checkbox"> ټول کاروونکي (All Users)</label><div id="hwcEligibleUsersWrap" class="gift-card" hidden><label for="hwcEligibleUsers">Eligible Users</label><textarea id="hwcEligibleUsers" rows="5" readonly style="box-sizing:border-box;width:100%;padding:11px;border:1px solid #494b51;border-radius:9px;background:#0c0e12;color:#e8d18c;resize:vertical"></textarea><p id="hwcEligibleUsersCount" class="gift-muted"></p></div><p class="gift-muted">محدود کوډ به لومړیو ټاکل شویو ځانګړو کاروونکو ته انعام ورکړي. هر کاروونکی هر کوډ یوازې یو ځل کارولی شي. ځانګړي کوډونه په خپله نه ختمېږي.</p><button id="hwcCreateSpecialGift" class="gift-btn" type="button">CREATE GIFT CODE</button><div id="hwcSpecialResult" class="gift-result" hidden></div></div><div class="gift-card"><h3>Created Gift Codes & Claims</h3><div id="hwcGiftCodeList" class="gift-muted">Loading…</div></div>';
loadCodes();
}
function backToControl(){
var home=document.getElementById('adminHome');
adminPanel.querySelectorAll('.admin-view').forEach(function(el){el.hidden=el!==home;el.style.display=el===home?'block':'none';});
if(home){home.hidden=false;home.style.display='block';}
}
page.addEventListener('click',async function(e){
var nav=e.target.closest('[data-gift-nav]');
if(nav){e.preventDefault();e.stopPropagation();var target=nav.getAttribute('data-gift-nav');if(target==='control')backToControl();else if(target==='home')openHome();else if(target==='daily')openDaily();else if(target==='special')openSpecial();return;}
if(e.target.closest('#hwcCopySpecialGift')){var copyCode=$('hwcSpecialCode').value.trim().toUpperCase();try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(copyCode);}else{var ta=document.createElement('textarea');ta.value=copyCode;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();if(!document.execCommand('copy'))throw new Error('Copy is not supported by this browser.');ta.remove();}notice('Gift Code copied: '+copyCode);}catch(err){notice('Copy failed. Select and copy the code manually.');}return;}
if(e.target.closest('#hwcMakeRandom')){var chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',v='HDC-';for(var i=0;i<8;i++)v+=chars[Math.floor(Math.random()*chars.length)];$('hwcSpecialCode').value=v;return;}
if(e.target.closest('#hwcSpecialAll')){var allChecked=$('hwcSpecialAll').checked,field=$('hwcSpecialLimit'),wrap=$('hwcEligibleUsersWrap');if(wrap)wrap.hidden=!allChecked;if(allChecked){loadEligibleUsers();}return;}
if(e.target.closest('#hwcCreateSpecialGift')){
if(!isAdmin())return notice('Administrator access required.');
var code=$('hwcSpecialCode').value.trim().toUpperCase(),amount=Number($('hwcSpecialAmount').value),limitText=$('hwcSpecialLimit').value.trim(),all=$('hwcSpecialAll').checked,limit=all?null:(limitText?Number(limitText):null);
if(!/^[A-Z0-9-]{4,32}$/.test(code)||!Number.isFinite(amount)||amount<=0||(!all&&(!limitText||!Number.isInteger(limit)||limit<=0)))return notice('Valid Gift Code, HDC reward and user limit are required. Select All Users to remove the limit.');
var b=$('hwcCreateSpecialGift');b.disabled=true;b.textContent='CREATING…';
try{var q=await db.rpc('hwc_admin_create_gift_code_v2',{p_code:code,p_reward_amount:amount,p_max_claims:limit});if(q.error)throw q.error;if(!q.data)throw new Error('The server did not confirm Gift Code creation.');
var result=$('hwcSpecialResult');result.hidden=false;result.innerHTML='<div class="gift-success"><div class="gift-success-head">🎉 SPECIAL GIFT CODE CREATED!</div><div class="gift-code-display">'+esc(code)+'</div><div class="gift-success-meta"><div><small>🎁 REWARD</small><strong>'+fmt(amount)+' HDC</strong></div><div><small>👥 AVAILABLE CLAIMS</small><strong>'+(all?'All users':fmt(limit)+' users')+'</strong></div></div><button type="button" id="hwcCopySpecialGift" class="gift-btn" style="margin-top:14px">📋 COPY GIFT CODE</button><p class="gift-muted" style="text-align:center;margin:10px 0 0">دا کوډ کاپي او له خپلو کاروونکو سره شریک کړئ.</p></div>';
try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(code);notice('Special Gift Code created and copied successfully.');}else{notice('Special Gift Code created successfully. Use COPY CODE to copy it.');}}catch(_){notice('Special Gift Code created successfully. Use COPY CODE to copy it.');}await loadCodes();
}catch(err){notice(err.message||'Could not create Gift Code.');}
finally{b.disabled=false;b.textContent='CREATE GIFT CODE';}
return;
}
if(e.target.closest('#hwcSaveDailyAmount')){
if(!isAdmin())return notice('Administrator access required.');
var amount=Number($('hwcDailyAmount').value);if(!Number.isFinite(amount)||amount<=0)return notice('Enter a valid HDC amount greater than zero.');
var b=$('hwcSaveDailyAmount');b.disabled=true;b.textContent='SAVING…';
try{var q=await db.rpc('hwc_admin_set_daily_gift_amount',{p_amount:amount});if(q.error)throw q.error;await loadDaily();notice('Daily Gift amount updated and saved.');}
catch(err){notice(err.message||'Could not update Daily Gift amount.');}
finally{b.disabled=false;b.textContent='SAVE DAILY AMOUNT';}
}
});
document.addEventListener('hwc-admin-open-gift',openHome);
window.openHwcGiftManagement=openHome;
console.info('HEWAD Gift Management initialized: restored classic special-code form with eligible-user list.');
})();