/* HEWAD COIN staking production module. Isolated from existing dashboard modules. */
(function(){
'use strict';
var db=hwcSupabase, $=function(id){return document.getElementById(id);};
if(!db){console.error('HEWAD staking: Supabase client unavailable.');return;}
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var fmt=function(v,d){return Number(v||0).toLocaleString(undefined,{maximumFractionDigits:d==null?8:d});};
var dt=function(v){return v?new Date(v).toLocaleString():'—';};
var money=function(v){return fmt(v,8)+' HDC';};
var say=function(m){if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
var me=async function(){
 if(typeof hwcCurrentUser!=='undefined'&&hwcCurrentUser&&hwcCurrentUser.id)return hwcCurrentUser;
 if(!db.auth||typeof db.auth.getUser!=='function')throw new Error('Secure account session is unavailable. Please sign in again.');
 var auth=await db.auth.getUser();
 if(auth.error)throw auth.error;
 if(!auth.data||!auth.data.user)throw new Error('Please sign in to your HEWAD COIN account first.');
 return auth.data.user;
};
var admin=function(){return window.HEWAD_USER_ROLE==='admin';};
var stakeCss=document.createElement('style');stakeCss.id='hwc-staking-production-style';
stakeCss.textContent=`
.hwc-staking-live{max-width:900px;margin:0 auto;color:#f5f7f8}
.hwc-staking-live .hwc-stake-hero{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border:1px solid #168c6d;border-radius:25px;background:linear-gradient(110deg,#102a27,#0d211f);margin:0 0 20px}
.hwc-staking-live .hwc-stake-hero h3{margin:0 0 5px;color:#fff;font-size:19px}.hwc-staking-live .hwc-stake-hero p{margin:0;color:#aeb9c1}
.hwc-staking-live .hwc-stake-orb{display:inline-grid;place-items:center;width:52px;height:52px;margin-right:12px;border-radius:17px;background:linear-gradient(145deg,#31d7a5,#07936f);font-size:29px;vertical-align:middle}
.hwc-staking-live .hwc-stake-tag{padding:7px 12px;border:1px solid #176d59;border-radius:20px;color:#50d9ae;background:#0c473a;font-size:12px;font-weight:800;white-space:nowrap}
.hwc-staking-live .hwc-stake-notice{padding:17px 19px;margin-bottom:20px;border:1px solid #78602c;border-radius:19px;background:linear-gradient(115deg,#292619,#1c211d);color:#f0e5bd}
.hwc-staking-live .hwc-stake-notice strong{color:#f4cf59}.hwc-staking-live .hwc-stake-notice p{margin:7px 0 0;line-height:1.55}
.hwc-staking-live .hwc-stake-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 20px}
.hwc-staking-live .hwc-stake-stats>div{padding:17px;border:1px solid #28453e;border-radius:19px;background:linear-gradient(145deg,#12302a,#0e1d1c);min-width:0}
.hwc-staking-live .hwc-stake-stats>div:nth-child(2){border-color:#64532d;background:linear-gradient(145deg,#29271d,#20231f)}
.hwc-staking-live .hwc-stake-stats small{display:block;color:#c3d1ca;font-size:12px;text-transform:uppercase;margin-bottom:8px}
.hwc-staking-live .hwc-stake-stats b{display:block;color:#42dca9;font-size:17px;overflow-wrap:anywhere}
.hwc-staking-live .hwc-stake-transparency,.hwc-staking-live .dash-subpage-card{padding:19px;margin:0 0 20px;border:1px solid #263d3d;border-radius:21px;background:#151a27;color:#f5f7f8}
.hwc-staking-live .dash-subpage-card h3,.hwc-staking-live .hwc-stake-transparency h3{margin:0 0 15px;font-size:17px}
.hwc-staking-live .hwc-stake-pool-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.hwc-staking-live .hwc-stake-pool-grid>div{padding:12px;border-radius:14px;background:#1c202e;min-width:0}
.hwc-staking-live .hwc-stake-pool-grid small{display:block;color:#aab3bf;margin-bottom:5px}.hwc-staking-live .hwc-stake-pool-grid b{overflow-wrap:anywhere}
.hwc-staking-live .hwc-plan{display:flex;align-items:center;gap:12px;padding:13px;margin:0 0 10px;border:1px solid #24433e;border-radius:15px;background:#0d211f}
.hwc-staking-live .hwc-plan input{accent-color:#28d0a0}.hwc-staking-live .hwc-plan span{display:grid;gap:3px}.hwc-staking-live .hwc-plan small,.hwc-staking-live .hwc-muted{color:#aeb9c1}
.hwc-staking-live .hwc-form label,.hwc-staking-live label{display:block;color:#cbd4d1;font-weight:600}
.hwc-staking-live .hwc-form input:not([type=radio]){display:block;width:100%;margin-top:7px;padding:14px;border:1px solid #294b45;border-radius:13px;background:#0b171c;color:#fff}
.hwc-staking-live .hwc-primary{display:inline-block;margin-top:13px;padding:13px 19px;border:0;border-radius:15px;background:linear-gradient(100deg,#087d62,#07936e);color:#fff;font-weight:800;cursor:pointer}
.hwc-staking-live .hwc-primary:disabled{opacity:.45;cursor:not-allowed}
.hwc-staking-live .hwc-record{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:15px;margin:0 0 11px;border:1px solid #226b59;border-radius:17px;background:linear-gradient(145deg,#102b29,#111b27)}
.hwc-staking-live .hwc-record>div{min-width:0}.hwc-staking-live .hwc-record strong{display:block}.hwc-staking-live .hwc-record small{display:block;margin-top:5px;color:#aebbc2;overflow-wrap:anywhere}
.hwc-staking-live .hwc-stake-profit{color:#45d7aa}.hwc-staking-live .hwc-stake-loss{color:#ef7d8a}
.hwc-staking-live .hwc-stake-progress{height:7px;margin-top:13px;border-radius:10px;background:#26353a;overflow:hidden}.hwc-staking-live .hwc-stake-progress span{display:block;height:100%;background:linear-gradient(90deg,#087d62,#31d7a5)}
.hwc-staking-live .hwc-status-pill{display:inline-block;margin-top:10px;padding:6px 10px;border-radius:20px;font-size:12px;background:#293041;color:#f5f7f8}
.hwc-staking-live .hwc-status-pill.pending{color:#f1c74c}.hwc-staking-live .hwc-status-pill.rejected{color:#ef7d8a}.hwc-staking-live .hwc-status-pill.approved{color:#45d7aa}
.hwc-staking-live .hwc-empty,.hwc-staking-live .hwc-muted{color:#aeb9c1}
.hwc-admin-page{color:#f5f7f8}.hwc-admin-page .hwc-admin-card{margin:14px 0;padding:18px;border:1px solid #51401f;border-radius:15px;background:linear-gradient(135deg,#1b1c20,#121317)}
.hwc-admin-page .hwc-user-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.hwc-admin-page .hwc-user-summary>div{padding:11px;border:1px solid #303747;border-radius:11px;background:#171c25;min-width:0}
.hwc-admin-page .hwc-user-summary span{display:block;color:#aeb7c2;font-size:12px;margin-bottom:5px}.hwc-admin-page .hwc-user-summary b{display:block;overflow-wrap:anywhere;color:#f5f7f8}
.hwc-admin-page table{width:100%;border-collapse:collapse;min-width:650px}.hwc-admin-page th,.hwc-admin-page td{padding:11px;border-bottom:1px solid #303747;text-align:left;vertical-align:top}.hwc-admin-page th{color:#f2c64f}
.hwc-admin-page .hwc-inline{display:flex;gap:10px;flex-wrap:wrap}.hwc-admin-page input,.hwc-admin-page select,.hwc-admin-page textarea{max-width:100%;padding:11px;border:1px solid #51401f;border-radius:10px;background:#10151d;color:#fff}
@media(max-width:560px){.hwc-staking-live .hwc-stake-hero{padding:15px}.hwc-staking-live .hwc-stake-stats{gap:9px}.hwc-staking-live .hwc-stake-stats>div{padding:13px}.hwc-staking-live .hwc-stake-stats b{font-size:14px}.hwc-staking-live .hwc-stake-pool-grid{grid-template-columns:1fr}.hwc-admin-page .hwc-user-summary{grid-template-columns:1fr}}
`;
document.head.appendChild(stakeCss);
stakeCss.textContent += "\n/* Gold premium position cards — isolated to the member staking page. */\n.hwc-staking-live .hwc-position-card{position:relative;overflow:hidden;margin:0 0 16px;padding:18px;border:1px solid #8d6b30;border-radius:22px;background:radial-gradient(ellipse at 95% 0%,rgba(211,169,76,.16),transparent 42%),linear-gradient(145deg,#24221c 0%,#151820 58%,#101319 100%);box-shadow:inset 0 1px 0 rgba(255,240,190,.12),0 12px 28px rgba(0,0,0,.28);color:#f5f2e9}\n.hwc-staking-live .hwc-position-card:before{content:\"\";position:absolute;inset:0 0 auto;height:2px;background:linear-gradient(90deg,transparent,#f4d88d,#b47c27,transparent)}\n.hwc-staking-live .hwc-position-top,.hwc-staking-live .hwc-position-id-row,.hwc-staking-live .hwc-position-progress-head,.hwc-staking-live .hwc-position-footer{display:flex;align-items:center;justify-content:space-between;gap:10px}\n.hwc-staking-live .hwc-position-kicker{display:block;margin-bottom:5px;color:#c9a85c;font-size:9px;font-weight:900;letter-spacing:1.5px}\n.hwc-staking-live .hwc-position-title{display:block;color:#fff0c2;font-size:14px;letter-spacing:.4px}\n.hwc-staking-live .hwc-position-status{flex:0 0 auto;padding:7px 10px;border:1px solid #4b936c;border-radius:20px;background:#173426;color:#7fe0a6;font-size:9px;font-weight:900;letter-spacing:.5px}\n.hwc-staking-live .hwc-position-status.pending{border-color:#9a7938;background:#352b18;color:#f2ce79}\n.hwc-staking-live .hwc-position-status.blocked{border-color:#98515a;background:#351d24;color:#ff9ba5}\n.hwc-staking-live .hwc-position-status.completed{border-color:#8d6b30;background:#332918;color:#f4d58d}\n.hwc-staking-live .hwc-position-id-row{justify-content:flex-start;flex-wrap:wrap;margin:15px 0 13px;padding:10px 11px;border:1px solid rgba(196,157,77,.27);border-radius:12px;background:rgba(8,10,14,.35)}\n.hwc-staking-live .hwc-position-id-row>span:first-child,.hwc-staking-live .hwc-position-id-row>b{color:#d8c99f;font-size:10px;letter-spacing:.6px}\n.hwc-staking-live .hwc-position-id-row>b{color:#f3d58b;font-variant-numeric:tabular-nums}\n.hwc-staking-live .hwc-position-plan{margin-left:auto;padding:5px 8px;border-radius:9px;background:linear-gradient(135deg,#6f5120,#342613);color:#ffe4a0;font-size:9px;font-weight:900;white-space:nowrap}\n.hwc-staking-live .hwc-position-principal-label{color:#b8ae95;font-size:9px;font-weight:800;letter-spacing:1.4px}\n.hwc-staking-live .hwc-position-principal{margin:5px 0 15px;color:#f1d28a;font-size:clamp(21px,5vw,29px);font-weight:900;letter-spacing:-.5px;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}\n.hwc-staking-live .hwc-position-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}\n.hwc-staking-live .hwc-position-results>div{min-width:0;padding:12px;border:1px solid rgba(195,157,81,.24);border-radius:13px;background:rgba(8,10,14,.35)}\n.hwc-staking-live .hwc-position-results small,.hwc-staking-live .hwc-position-dates small{display:block;margin-bottom:6px;color:#b8ad91;font-size:9px;font-weight:800;letter-spacing:.55px}\n.hwc-staking-live .hwc-position-results b{display:block;font-size:clamp(12px,3.2vw,15px);overflow-wrap:anywhere}\n.hwc-staking-live .hwc-position-progress-head{margin:17px 0 8px;color:#c6b98f;font-size:9px;font-weight:900;letter-spacing:.7px}\n.hwc-staking-live .hwc-position-progress-head b{color:#f0d58f;font-size:10px}\n.hwc-staking-live .hwc-position-progress{height:9px;overflow:hidden;border:1px solid #5f4a27;border-radius:20px;background:#28251e}\n.hwc-staking-live .hwc-position-progress span{display:block;height:100%;border-radius:20px;background:linear-gradient(90deg,#8f641f,#d8ae51,#fff0ad);box-shadow:0 0 12px rgba(225,184,88,.35)}\n.hwc-staking-live .hwc-position-dates{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 10px;margin:17px 0 13px}\n.hwc-staking-live .hwc-position-dates>div{min-width:0}\n.hwc-staking-live .hwc-position-dates b{display:block;color:#eee6d1;font-size:11px;line-height:1.45;overflow-wrap:anywhere}\n.hwc-staking-live .hwc-position-footer{padding-top:12px;border-top:1px solid rgba(196,157,77,.2);color:#b9ad91;font-size:9px;font-weight:800;letter-spacing:.6px}\n.hwc-staking-live .hwc-position-footer b{color:#e9d49e;font-size:10px;text-align:right;letter-spacing:0}\n.hwc-staking-live .hwc-position-unlock{width:100%;margin-top:14px;border:1px solid #d7b15e;background:linear-gradient(110deg,#9a6b22,#e0b84e,#9b7029);color:#18130a;box-shadow:inset 0 1px rgba(255,255,255,.3),0 7px 16px rgba(0,0,0,.25)}\n.hwc-staking-live .hwc-position-note{display:block;margin-top:12px;padding:10px 12px;border:1px solid rgba(196,157,77,.25);border-radius:11px;background:rgba(8,10,14,.32);color:#d7c79d;font-size:11px;line-height:1.5}\n.hwc-staking-live .hwc-position-usd{margin-top:10px;color:#a9a08c;font-size:10px}\n.hwc-staking-live .hwc-position-empty{display:grid;justify-items:center;gap:7px;padding:28px 16px;border:1px dashed #735b30;border-radius:18px;background:rgba(29,26,20,.55);text-align:center}\n.hwc-staking-live .hwc-position-empty>span{color:#dcb75f;font-size:30px}\n.hwc-staking-live .hwc-position-empty strong{color:#f0d795}\n.hwc-staking-live .hwc-position-empty p{margin:0;color:#aaa18e;font-size:12px;line-height:1.5}\n@media(max-width:420px){.hwc-staking-live .hwc-position-card{padding:14px}.hwc-staking-live .hwc-position-title{font-size:12px}.hwc-staking-live .hwc-position-id-row{gap:7px}.hwc-staking-live .hwc-position-results>div{padding:10px}}\n";
stakeCss.textContent += ".hwc-staking-live .hwc-stake-app{max-width:940px;margin:0 auto;padding-bottom:10px}\n.hwc-staking-live .hwc-stake-sticky{position:sticky;top:0;z-index:30;padding:16px 14px 14px;margin:-2px -2px 16px;background:rgba(9,13,17,.94);backdrop-filter:blur(18px);border:1px solid rgba(218,177,79,.25);border-radius:22px;box-shadow:0 14px 35px #0008}\n.hwc-staking-live .hwc-stake-overview-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}\n.hwc-staking-live .hwc-stake-overview-head h2{margin:4px 0;color:#f7e6b2;font-size:20px}\n.hwc-staking-live .hwc-stake-overview-head p{margin:0;color:#aeb9c1;font-size:12px}\n.hwc-staking-live .hwc-stake-kicker{font-size:9px;letter-spacing:2px;color:#dcb95e;font-weight:900}\n.hwc-staking-live .hwc-stake-share{display:grid;place-items:center;min-width:76px;padding:10px 12px;border:1px solid #8d6a2c;border-radius:15px;background:linear-gradient(145deg,#4d3a19,#17130c);color:#ffe8a0;font-size:18px;font-weight:900;box-shadow:inset 0 1px #fff5,0 8px 16px #0008}\n.hwc-staking-live .hwc-stake-share small{font-size:8px;letter-spacing:1.5px;color:#c9a44e}\n.hwc-staking-live .hwc-stake-premium-stats{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0}\n.hwc-staking-live .hwc-stake-premium-stats>div{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:112px;padding:11px 9px 10px;border:1px solid #725b2e;border-radius:15px;background:linear-gradient(145deg,#2b2a24,#11151a 72%);box-shadow:inset 0 1px #fff2,0 8px 18px #0007;overflow:hidden}\n.hwc-staking-live .hwc-stake-premium-stats>div:after{content:'';position:absolute;inset:0;background:linear-gradient(125deg,#fff1,transparent 42%);pointer-events:none}\n.hwc-staking-live .hwc-stake-premium-stats small{font-size:8px;letter-spacing:.5px;color:#c7b989;margin:8px 0 5px}\n.hwc-staking-live .hwc-stake-premium-stats b{font-size:clamp(10px,2.5vw,14px);line-height:1.3;color:#f4df9f}\n.hwc-staking-live .hwc-stake-stat-icon{width:39px;height:39px;display:grid;place-items:center;filter:drop-shadow(0 5px 5px #000b)}\n.hwc-staking-live .hwc-stake-stat-icon svg{width:100%;height:100%}\n.hwc-staking-live .hwc-stake-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px}\n.hwc-staking-live .hwc-stake-section-head h3{margin:0 0 14px}\n.hwc-staking-live .hwc-live-dot{margin-bottom:14px;color:#56d7a7;font-size:9px;letter-spacing:1.5px;font-weight:900}\n.hwc-staking-live .hwc-live-dot:before{content:'';display:inline-block;width:6px;height:6px;margin-right:5px;border-radius:50%;background:#48d6a0;box-shadow:0 0 10px #48d6a0}\n.hwc-staking-live .hwc-stake-tabs{position:sticky;top:176px;z-index:20;display:flex;gap:7px;overflow-x:auto;padding:8px;margin:0 0 14px;border:1px solid #3d3527;border-radius:15px;background:rgba(17,20,27,.96);backdrop-filter:blur(14px)}\n.hwc-staking-live .hwc-stake-tab{flex:1;min-width:max-content;padding:10px 12px;border:1px solid #3c4148;border-radius:11px;background:#171b22;color:#c9cbd0;font-size:11px;font-weight:800}\n.hwc-staking-live .hwc-stake-tab.active{border-color:#d6ae4b;background:linear-gradient(145deg,#73541f,#302515);color:#ffe9a7;box-shadow:inset 0 1px #fff4,0 4px 12px #0008}\n.hwc-staking-live .hwc-stake-bottom{position:sticky;bottom:0;z-index:25;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:18px;padding:9px 6px;border:1px solid #3b3325;border-radius:17px;background:rgba(12,15,20,.97);backdrop-filter:blur(16px);box-shadow:0 -8px 25px #0007}\n.hwc-staking-live .hwc-stake-bottom button{display:grid;justify-items:center;gap:3px;border:0;background:transparent;color:#aeb4bd;font-size:9px;font-weight:700}\n.hwc-staking-live .hwc-stake-bottom button span{font-size:19px;color:#e2bd62}\n@media(max-width:560px){.hwc-staking-live .hwc-stake-sticky{padding:12px 9px 10px}.hwc-staking-live .hwc-stake-premium-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.hwc-staking-live .hwc-stake-premium-stats>div{min-height:105px;padding:10px}.hwc-staking-live .hwc-stake-tabs{top:230px}.hwc-staking-live .hwc-stake-share{min-width:66px;font-size:16px}.hwc-staking-live .hwc-stake-overview-head h2{font-size:18px}}";

/* Staking page refinements */
stakeCss.textContent += "\n.hwc-staking-live .hwc-stake-balance-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0 10px;padding:12px 14px;border:1px solid #80652e;border-radius:13px;background:linear-gradient(110deg,#29251b,#151a1c)}.hwc-staking-live .hwc-stake-balance-row span{color:#c9b989;font-size:10px;font-weight:900;letter-spacing:.8px}.hwc-staking-live .hwc-stake-balance-row strong{color:#f3d58b;font-size:14px;text-align:right;overflow-wrap:anywhere}.hwc-staking-live .hwc-stake-amount-row{display:flex;align-items:end;gap:9px}.hwc-staking-live .hwc-stake-amount-row label{flex:1;min-width:0}.hwc-staking-live .hwc-stake-max{flex:0 0 76px;height:46px;margin:7px 0 0;border:1px solid #c49a42;border-radius:12px;background:linear-gradient(145deg,#6b501e,#342712);color:#ffe5a0;font-weight:900;letter-spacing:1px}.hwc-staking-live .hwc-stake-max:disabled{opacity:.45}.hwc-staking-live .hwc-stake-submit{display:block;width:100%;min-height:52px;margin:14px 0 0;padding:15px 20px;border-radius:14px;font-size:16px}.hwc-staking-live .hwc-position-progress-head{margin:17px 0 8px}.hwc-staking-live .hwc-position-progress{height:11px;border-color:#9a7834;background:#28251e}.hwc-staking-live .hwc-position-progress span{background:linear-gradient(90deg,#9a6b20,#e6bb4d,#fff0a5);box-shadow:0 0 13px rgba(230,187,77,.42)}@media(max-width:420px){.hwc-staking-live .hwc-stake-max{flex-basis:68px}.hwc-staking-live .hwc-stake-balance-row strong{font-size:12px}}";

function showUserPage(title,html){
 var dash=$('dashboard'),page=$('modulePage'),card=$('memberCard');
 if(!dash||!page){say('Staking page is not available.');return;}
 dash.querySelectorAll('.dash-subpage').forEach(function(x){x.classList.remove('active');});
 var memberCards=Array.prototype.slice.call(dash.querySelectorAll('#memberCard,#member-card,[id*="memberCard"],[id*="member-card"],[class*="member-card"],[class*="gold-member-card"]'));
 memberCards.forEach(function(el){if(!el.hidden){el.setAttribute('data-hwc-staking-card-hidden','1');el.hidden=true;}});
 if(card)card.hidden=true;page.hidden=false;page.classList.add('active');
 page.innerHTML='<button class="dash-back-home" id="hwcStakeBack" type="button">← Dashboard</button><h2>'+esc(title)+'</h2><div class="hwc-module-content"><div class="hwc-staking-live">'+html+'</div></div>';
 $('hwcStakeBack').onclick=function(){page.classList.remove('active');page.hidden=true;if($('dashboardMain'))$('dashboardMain').classList.add('active');memberCards.forEach(function(el){if(el.getAttribute('data-hwc-staking-card-hidden')==='1'){el.hidden=false;el.removeAttribute('data-hwc-staking-card-hidden');}});if(card)card.hidden=false;window.scrollTo(0,0);};
 window.scrollTo(0,0);
}
async function renderStaking(){
 var u;try{u=await me();}catch(authError){say(authError.message||'Please sign in first.');return;}
 showUserPage('Digital Staking','<div class="dash-subpage-card">Loading your staking account…</div>');
 var rs=await Promise.all([
  db.from('staking_plans').select('id,name,min_amount,max_amount,duration_days').eq('active',true).eq('asset','HDC').eq('duration_days',360).order('min_amount'),
  db.from('staking_positions').select('id,plan_name,principal,original_principal,status,started_at,matures_at,usd_value_at_stake,unlock_requested_at,unlock_notified_at,paid_at').eq('user_id',u.id).neq('status','reset').order('started_at',{ascending:false}).limit(100),
  db.from('wallets').select('balance_hwc,reserved_hwc,staked_hwc').eq('user_id',u.id).maybeSingle(),
  db.from('staking_daily_results').select('id,position_id,result_type,percent,amount,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(1000),
  db.rpc('hwc_member_staking_overview')
 ]);
 var err=rs.find(function(x){return x.error;});
 if(err){showUserPage('Digital Staking','<div class="dash-subpage-card hwc-error">'+esc(err.error.message)+'</div>');return;}
 var plans=rs[0].data||[],positions=rs[1].data||[],wallet=rs[2].data||{},history=rs[3].data||[],overview=rs[4].data||{};
 var cutoff=Date.now()-3*86400000,recent=history.filter(function(x){return new Date(x.created_at).getTime()>=cutoff;}),sums={};
 history.forEach(function(x){var z=sums[x.position_id]||(sums[x.position_id]={profit:0,loss:0});z[x.result_type==='profit'?'profit':'loss']+=Number(x.amount||0);});
 var profit=Number(overview.my_profit||0),loss=Number(overview.my_loss||0);
 var available=Math.max(0,Number(wallet.balance_hwc||0)-Number(wallet.reserved_hwc||0));
 var staked=Number(wallet.staked_hwc||overview.my_staked||0);
 var activeCount=positions.filter(function(p){return p.status==='active';}).length;
 var plan=plans[0]||null;
 var icon=function(type){
  var paths={
   coin:'<ellipse cx="24" cy="34" rx="15" ry="6" fill="url(#g)" opacity=".75"/><path d="M9 14c0-4 7-7 15-7s15 3 15 7v17c0 4-7 7-15 7S9 35 9 31V14Z" fill="url(#g)" stroke="#fff0b1" stroke-width="1.4"/><ellipse cx="24" cy="14" rx="15" ry="7" fill="url(#g2)" stroke="#fff0b1" stroke-width="1.4"/><path d="M17 18c2-3 12-3 14 0M17 26c2 3 12 3 14 0" fill="none" stroke="#805719" stroke-width="2" stroke-linecap="round"/>',
   active:'<path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11L24 5Z" fill="url(#g)" stroke="#fff0b1" stroke-width="1.5"/><path d="m16 24 5 5 11-12" fill="none" stroke="#78521b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
   return:'<path d="M24 5 29 17 42 18 32 27 35 41 24 34 13 41 16 27 6 18 19 17 24 5Z" fill="url(#g)" stroke="#fff0b1" stroke-width="1.4"/><circle cx="24" cy="24" r="5" fill="url(#g2)"/>',
   people:'<circle cx="18" cy="16" r="7" fill="url(#g)" stroke="#fff0b1"/><circle cx="32" cy="18" r="6" fill="url(#g2)" stroke="#fff0b1"/><path d="M5 39c0-8 5-13 13-13s13 5 13 13v2H5v-2Z" fill="url(#g)" stroke="#fff0b1"/><path d="M28 29c7-2 14 2 15 9v3H32" fill="none" stroke="#e5bd65" stroke-width="4" stroke-linecap="round"/>'
  };
  return '<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4c3"/><stop offset=".35" stop-color="#e4b84e"/><stop offset=".7" stop-color="#95621b"/><stop offset="1" stop-color="#ffe9a0"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff9db"/><stop offset=".55" stop-color="#dba83d"/><stop offset="1" stop-color="#8c5c18"/></linearGradient></defs>'+paths[type]+'</svg>';
 };
 var planHtml=plans.length?plans.map(function(p,i){
  return '<label class="hwc-plan"><input type="radio" name="plan_id" value="'+esc(p.id)+'" '+(i===0?'checked':'')+' required><span><strong>'+esc(p.name)+'</strong><small>HDC · Fixed 360 days</small><small>Minimum: '+money(p.min_amount)+' · Maximum: your available balance</small></span></label>';
 }).join(''):'<p class="hwc-empty">No active 360-day HDC plan is available.</p>';
 var positionHtml=positions.length?positions.map(function(p){
  var z=sums[p.id]||{profit:0,loss:0},remaining=Math.max(0,Math.ceil((new Date(p.matures_at).getTime()-Date.now())/86400000));
  var status=p.status==='active'?(remaining===0?'Matured · unlock available':'Active'):p.status==='unlock_pending'?'Pending admin approval':p.status==='blocked'?'Blocked by admin':p.status==='completed'?'Unlocked':p.status;
  var statusClass=p.status==='active'?'active':p.status==='unlock_pending'?'pending':p.status==='blocked'?'blocked':'completed';
  var action=p.status==='active'&&remaining===0?'<button type="button" class="hwc-primary hwc-position-unlock" data-stake-unlock="'+esc(p.id)+'">REQUEST UNLOCK</button>':p.status==='active'?'<span class="hwc-position-note">Your original principal will return to your available HDC balance at maturity.</span>':p.status==='unlock_pending'?'<span class="hwc-position-note">Your request is waiting for administrator approval.</span>':p.status==='blocked'?'<span class="hwc-position-note">This position is currently blocked by the administrator.</span>':p.status==='completed'?'<span class="hwc-position-note">The original principal has been returned to your HDC balance.</span>':'';
  var elapsed=Math.max(0,Math.min(360,360-remaining)),progress=p.status==='completed'?100:elapsed/360*100;
  return '<article class="hwc-position-card">'+
   '<div class="hwc-position-top"><div><span class="hwc-position-kicker">HEWAD COIN · DIGITAL STAKING</span><strong class="hwc-position-title">HDC STAKING POSITION</strong></div><span class="hwc-position-status '+statusClass+'">'+esc(status).toUpperCase()+'</span></div>'+
   '<div class="hwc-position-id-row"><span>POSITION ID</span><b>HDC-'+esc(String(p.id).replace(/-/g,'').slice(0,8).toUpperCase())+'</b><span class="hwc-position-plan">360 DAY PLAN</span></div>'+
   '<div class="hwc-position-principal-label">STAKED AMOUNT</div><div class="hwc-position-principal">'+money(p.original_principal||p.principal)+'</div>'+
   '<div class="hwc-position-results"><div><small>TOTAL PROFIT</small><b class="hwc-stake-profit">+'+fmt(z.profit)+' HDC</b></div><div><small>TOTAL LOSS</small><b class="hwc-stake-loss">−'+fmt(z.loss)+' HDC</b></div></div>'+
   '<div class="hwc-position-dates"><div><small>START DATE</small><b>'+esc(dt(p.started_at))+'</b></div><div><small>MATURITY DATE</small><b>'+esc(dt(p.matures_at))+'</b></div><div><small>DURATION</small><b>360 Days</b></div><div><small>REMAINING</small><b>'+remaining+' Days</b></div></div>'+
   '<div class="hwc-position-footer"><span>POSITION STATUS</span><b>'+esc(status)+'</b></div>'+action+
   '<button type="button" class="hwc-primary hwc-position-unlock" data-stake-details="'+esc(p.id)+'">VIEW POSITION DETAILS</button><div class="hwc-position-extra" data-stake-extra="'+esc(p.id)+'" hidden><p>Original principal: '+money(p.original_principal||p.principal)+'</p><p>360-day lock. The original principal returns to your available HDC balance only after maturity and administrator approval.</p>'+(p.usd_value_at_stake==null?'':'<p>USD value at stake: '+fmt(p.usd_value_at_stake,8)+'</p>')+'</div>'+
   '<div class="hwc-position-progress-head"><span>STAKING COMPLETION</span><b>'+fmt(progress,1)+'%</b></div><div class="hwc-position-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+fmt(progress,1)+'"><span style="width:'+progress+'%"></span></div>'+
  '</article>';
 }).join(''):'<div class="hwc-position-empty"><span>✧</span><strong>No Active Positions</strong><p>Your staking positions will appear here after starting a stake.</p></div>';
 var historyHtml=recent.length?recent.map(function(x){
  return '<article class="hwc-record"><div><strong>'+esc(x.result_type==='profit'?'Daily Profit':'Daily Loss')+'</strong><small>'+esc(dt(x.created_at))+' · '+fmt(x.percent,4)+'%</small></div><b class="'+(x.result_type==='profit'?'hwc-stake-profit':'hwc-stake-loss')+'">'+(x.result_type==='profit'?'+':'−')+fmt(x.amount)+' HDC</b></article>';
 }).join(''):'<p class="hwc-empty">No daily staking results yet.</p>';
 var poolContent='<section class="dash-subpage-card"><div class="hwc-stake-section-head"><h3>Start a 360-Day Position</h3><span class="hwc-stake-tag">360 DAY PLAN</span></div>'+(plans.length?'<form id="hwcStakeProductionForm" class="hwc-form">'+planHtml+'<div class="hwc-stake-balance-row"><span>AVAILABLE BALANCE</span><strong>'+money(available)+'</strong></div><div class="hwc-stake-amount-row"><label>Stake Amount (HDC)<input id="hwcStakeAmountInput" name="amount" type="number" min="'+esc(plan.min_amount)+'" max="'+Math.min(available,Number(plan.max_amount))+'" step="0.00000001" placeholder="Minimum '+fmt(plan.min_amount)+' HDC" required></label><button class="hwc-stake-max" id="hwcStakeMax" type="button" '+(available<Number(plan.min_amount)?'disabled':'')+'>MAX</button></div><p class="hwc-muted">Your HDC will be locked for exactly 360 days. At maturity, the original principal becomes eligible to return to your available HDC balance after administrator approval.</p><button class="hwc-primary hwc-stake-submit" type="submit" '+(available<Number(plan.min_amount)?'disabled':'')+'>🔒 Stake HDC</button></form>':'<p class="hwc-empty">No staking pool is currently available.</p>')+'</section>';
 var html='<div class="hwc-stake-app">'+
  '<header class="hwc-stake-hero"><div><h3>Digital Staking</h3><p>Stake HDC and follow your daily results</p></div><span class="hwc-stake-tag">360 DAY PLAN</span></header>'+
  '<section class="hwc-stake-notice"><strong>⚠ Variable Profit &amp; Loss</strong><p>Daily results may be positive or negative. No fixed percentage or guaranteed return is promised. Results depend on system performance.</p></section>'+
  '<section class="dash-subpage-card"><h3>My Staking Overview</h3><div class="hwc-stake-stats">'+
  '<div><small>MY STAKED HDC</small><b>'+fmt(staked)+' HDC</b></div>'+
  '<div><small>AVAILABLE HDC</small><b>'+fmt(available)+' HDC</b></div>'+
  '<div><small>TOTAL PROFIT</small><b class="hwc-stake-profit">+'+fmt(profit)+' HDC</b></div>'+
  '<div><small>TOTAL LOSS</small><b class="hwc-stake-loss">−'+fmt(loss)+' HDC</b></div></div></section>'+
  '<section class="dash-subpage-card"><h3>Global Staking Statistics</h3><div class="hwc-stake-stats">'+
  '<div><small>TOTAL STAKERS</small><b>'+fmt(overview.participants||0)+'</b></div>'+
  '<div><small>TOTAL STAKED HDC</small><b>'+fmt(overview.pool_total||0)+' HDC</b></div></div></section>'+
  poolContent+
  '<section class="dash-subpage-card"><h3>My Positions ('+positions.length+')</h3>'+positionHtml+'</section>'+
  '<section class="dash-subpage-card"><h3>Daily Profit &amp; Loss History</h3>'+historyHtml+'</section>'+
  '</div>';
 showUserPage('Digital Staking',html);
 function bindPoolForm(){
  var form=$('hwcStakeProductionForm');if(!form)return;
  var amountInput=$('hwcStakeAmountInput'),maxButton=$('hwcStakeMax');
  if(maxButton&&amountInput)maxButton.addEventListener('click',function(){amountInput.value=String(Math.min(available,Number(plan.max_amount)));amountInput.dispatchEvent(new Event('input',{bubbles:true}));});
  form.addEventListener('submit',async function(e){
   e.preventDefault();var fd=new FormData(form),btn=form.querySelector('button[type=submit]'),amount=Number(fd.get('amount')),selected=plans.find(function(p){return p.id===fd.get('plan_id');})||plan;
   if(!selected||!Number.isFinite(amount)||amount<Number(selected.min_amount)||amount>available||amount>Number(selected.max_amount)){say('Please enter a valid amount within the available balance and plan limits.');return;}
   btn.disabled=true;
   try{
    var q=await db.rpc('hwc_start_staking',{p_plan_id:selected.id,p_amount:amount});if(q.error)throw q.error;
    var lang=String(window.currentLang||document.documentElement.lang||'en').toLowerCase();
    var success=lang.indexOf('ps')===0?'🎉 مبارک دې وي! ستاسې '+fmt(amount)+' HDC د ۳۶۰ ورځو لپاره په بریالیتوب سټیک شول.':lang.indexOf('fa')===0?'🎉 تبریک! '+fmt(amount)+' HDC شما با موفقیت برای ۳۶۰ روز استیک شد.':'🎉 Congratulations! '+fmt(amount)+' HDC has been successfully staked for 360 days.';
    say(success);await renderStaking();
   }catch(ex){say(ex.message||'Could not start staking.');if(btn.isConnected)btn.disabled=false;}
  });
 }
 bindPoolForm();
}
window.openHwcStakingPage=renderStaking;
document.addEventListener('click',function(e){
 var detail=e.target.closest('[data-stake-details]');
 if(detail){e.preventDefault();e.stopImmediatePropagation();var extra=Array.from(document.querySelectorAll('[data-stake-extra]')).find(function(x){return x.dataset.stakeExtra===detail.dataset.stakeDetails;});if(extra){extra.hidden=!extra.hidden;detail.textContent=extra.hidden?'VIEW POSITION DETAILS':'HIDE POSITION DETAILS';}return;}
 var tile=e.target.closest('[data-action="Staking" i], [data-action*="staking" i], .dash-tile');
 if(tile&&(/staking/i.test(tile.dataset.action||'')||/digital\s+staking/i.test(tile.textContent||''))){e.preventDefault();e.stopImmediatePropagation();Promise.resolve(renderStaking()).catch(function(ex){console.error('HEWAD staking page failed to open:',ex);say('Could not open the staking page. Please refresh and try again.');});return;}
 var un=e.target.closest('[data-stake-unlock]');
 if(un){e.preventDefault();e.stopImmediatePropagation();if(!confirm('Submit an unlock request? Your HDC will return only after administrator approval.'))return;un.disabled=true;db.rpc('hwc_request_staking_unlock',{p_position_id:un.dataset.stakeUnlock}).then(function(r){if(r.error)throw r.error;say('Unlock request sent to the administrator.');return renderStaking();}).catch(function(ex){say(ex.message||'Unlock request failed.');un.disabled=false;});}
},true);
if(typeof window.openHwcModule==='function'){var oldOpen=window.openHwcModule;window.openHwcModule=async function(action){if(String(action).toLowerCase()==='staking')return renderStaking();return oldOpen.apply(this,arguments);};}

/* Admin: Position Management and Profit Distribution */
var panel=$('adminPanel'),root=null,currentStatus='unlock_pending',resultType='profit';
function adminRoot(){if(!panel)return null;if(!root){root=$('hwcStakingAdminView');if(!root){root=document.createElement('section');root.id='hwcStakingAdminView';root.className='admin-view hwc-admin-page';panel.appendChild(root);}}return root;}
function addMenu(){
 if(!admin())return;var home=$('adminHome'),grid=home&&home.querySelector('.hwc-admin-grid');if(!grid)return;
 if(!grid.querySelector('[data-hwc-staking-admin="positions"]')){var a=document.createElement('button');a.type='button';a.className='hwc-admin-option';a.dataset.hwcStakingAdmin='positions';a.innerHTML='<span class="ico">🔐</span><span><strong>Position Management</strong><small>Pending, blocked, unlocked and reset staking positions</small></span><span class="arrow">›</span>';grid.appendChild(a);}
 if(!grid.querySelector('[data-hwc-staking-admin="distribution"]')){var b=document.createElement('button');b.type='button';b.className='hwc-admin-option';b.dataset.hwcStakingAdmin='distribution';b.innerHTML='<span class="ico">📈</span><span><strong>Profit Distribution</strong><small>Daily HDC profit, loss and transaction records</small></span><span class="arrow">›</span>';grid.appendChild(b);}
}
function showAdmin(html){var r=adminRoot();if(!r)return;var h=$('adminHome');if(h){h.hidden=true;h.style.display='none';}panel.querySelectorAll('.admin-view').forEach(function(x){x.hidden=true;x.style.display='none';});r.hidden=false;r.style.display='block';r.innerHTML=html;window.scrollTo(0,0);}
function backBtn(){return '<button type="button" class="hwc-admin-back" data-hwc-staking-back>‹ Control Panel</button>';}
function kv(k,v){return '<div><span>'+esc(k)+'</span><b>'+esc(v==null||v===''?'—':v)+'</b></div>';}
async function landing(){
 showAdmin(backBtn()+'<h2>Position Management</h2><p class="admin-description">All positions are shown with complete user and financial information. Every administrator action is saved to the audit history.</p><div class="hwc-admin-card"><h3>Minimum Stake Setting</h3><div id="hwcStakeMinSetting">Loading…</div></div><div class="hwc-admin-grid">'+
 '<button class="hwc-admin-option" data-hwc-pos-status="unlock_pending"><span class="ico">◷</span><span><strong>Pending Position</strong><small>Unlock requests awaiting admin decision</small></span><span class="arrow">›</span></button>'+
 '<button class="hwc-admin-option" data-hwc-pos-status="blocked"><span class="ico">🔒</span><span><strong>Blocked Positions</strong><small>Review and unblock positions held by admin</small></span><span class="arrow">›</span></button>'+
 '<button class="hwc-admin-option" data-hwc-pos-status="completed"><span class="ico">✓</span><span><strong>Unlocked Positions</strong><small>Approved positions and returned HDC</small></span><span class="arrow">›</span></button>'+
 '<button class="hwc-admin-option" data-hwc-pos-status="reset"><span class="ico">↺</span><span><strong>Reset Position</strong><small>Archived reset positions</small></span><span class="arrow">›</span></button></div>');
 loadMinSetting();
}
async function loadMinSetting(){
 var host=$('hwcStakeMinSetting');if(!host)return;
 var q=await db.from('staking_plans').select('id,name,min_amount,max_amount').eq('active',true).eq('asset','HDC').eq('duration_days',360).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(q.error){host.innerHTML='<p>'+esc(q.error.message)+'</p>';return;}if(!q.data){host.textContent='No active 360-day HDC plan.';return;}
 host.innerHTML='<form id="hwcStakeMinForm"><input type="hidden" name="plan_id" value="'+esc(q.data.id)+'"><label>Minimum stake (HDC)<input name="min_amount" type="number" min="0.00000001" max="'+esc(q.data.max_amount)+'" step="0.00000001" value="'+esc(q.data.min_amount)+'" required></label><p class="admin-description">The maximum is limited by each member’s available HDC balance. Lock duration is fixed at 360 days.</p><button class="hwc-action" type="submit">Save Minimum Stake</button></form>';
 $('hwcStakeMinForm').onsubmit=async function(e){e.preventDefault();var fd=new FormData(e.currentTarget),btn=e.currentTarget.querySelector('button');btn.disabled=true;try{var r=await db.rpc('hwc_admin_set_minimum_stake',{p_plan_id:fd.get('plan_id'),p_min_amount:Number(fd.get('min_amount'))});if(r.error)throw r.error;say('Minimum stake updated.');await loadMinSetting();}catch(ex){say(ex.message);}finally{btn.disabled=false;}};
}
var labels={unlock_pending:'Pending Position',blocked:'Blocked Position',completed:'Unlocked Position',reset:'Reset Position'};
async function listPositions(status,type,value){
 currentStatus=status;var q=await db.rpc('hwc_admin_list_staking_positions',{p_status:status,p_search_type:type||'all',p_search_value:value||null});
 if(q.error){showAdmin(backBtn()+'<h2>'+labels[status]+'</h2><div class="hwc-admin-card">'+esc(q.error.message)+'</div>');return;}
 var rows=Array.isArray(q.data)?q.data:[];
 var body=rows.map(function(x){return '<tr><td>'+esc(String(x.position_id).slice(0,8))+'</td><td>'+esc(x.full_name)+'</td><td>'+money(x.principal)+'</td><td>'+esc(dt(x.started_at))+'</td><td>'+esc(dt(x.unlock_requested_at||x.reviewed_at||x.blocked_at||x.reset_at))+'</td><td><button class="hwc-action" data-hwc-pos-view="'+esc(x.position_id)+'">View</button></td></tr>';}).join('');
 showAdmin(backBtn()+'<h2>'+labels[status]+'</h2><div class="hwc-admin-card"><h3>Search by</h3><div class="hwc-inline"><select id="hwcPosSearchType"><option value="name">Name</option><option value="email">Email address</option><option value="referral">Referral code</option><option value="card">Card number</option></select><input id="hwcPosSearchValue" type="search" placeholder="Enter search value"></div><button class="hwc-action" id="hwcPosSearchBtn" type="button">Search</button></div><div class="hwc-admin-card"><p class="admin-description">'+rows.length+' record(s)</p>'+(rows.length?'<div style="overflow:auto"><table><thead><tr><th>Position ID</th><th>User Name</th><th>Stake Amount</th><th>Stake Date</th><th>Request / Action Date</th><th>Action</th></tr></thead><tbody>'+body+'</tbody></table></div>':'<p class="admin-description">No records found.</p>')+'</div>');
 $('hwcPosSearchBtn').onclick=function(){listPositions(status,$('hwcPosSearchType').value,$('hwcPosSearchValue').value.trim());};
 $('hwcPosSearchValue').onkeydown=function(e){if(e.key==='Enter')listPositions(status,$('hwcPosSearchType').value,$('hwcPosSearchValue').value.trim());};
}
async function viewPosition(id){
 var q=await db.rpc('hwc_admin_get_staking_position',{p_position_id:id});if(q.error){say(q.error.message);return;}
 var p=(q.data||{}).position||{},h=(q.data||{}).daily_history||[],audit=(q.data||{}).audit_history||[];
 var user=[kv('Full Name',p.full_name),kv('KYC Status',p.kyc_status),kv('Email Address',p.email),kv('Mobile Number',p.mobile_number),kv('Country',p.country),kv('Referral Code',p.referral_code),kv('Card Number',p.card_number),kv('Available HDC Balance',money(p.balance_hwc)),kv('Staked HDC Balance',money(p.staked_hwc))].join('');
  var pos=[kv('Position ID',p.position_id),kv('Status',p.status),kv('Stake Date',dt(p.started_at)),kv('Stake Amount',money(p.original_principal||p.principal)),kv('USD Rate at Stake',p.usd_rate_at_stake==null?'Unavailable':fmt(p.usd_rate_at_stake,8)+' USD/HDC'),kv('USD Value at Stake',p.usd_value_at_stake==null?'Unavailable':'$'+fmt(p.usd_value_at_stake,8)),kv('Lock Duration','360 Days'),kv('Maturity Date',dt(p.matures_at)),kv('Unlock Request Date',dt(p.unlock_requested_at)),kv('Total Profit',money(p.total_profit)),kv('Total Loss',money(p.total_loss)),kv('Net Result',money(p.net_result)),kv('Block Date',dt(p.blocked_at)),kv('Reset Date',dt(p.reset_at)),kv('Admin Action',p.review_action),kv('Admin Action Date',dt(p.reviewed_at)),kv('Admin Note',p.review_note),kv('Principal Return Date',dt(p.paid_at))].join('');
 var hist=h.length?'<div style="overflow:auto"><table><thead><tr><th>Date</th><th>Type</th><th>Percent</th><th>Amount</th></tr></thead><tbody>'+h.map(function(x){return '<tr><td>'+esc(dt(x.created_at))+'</td><td>'+esc(x.result_type)+'</td><td>'+fmt(x.percent,4)+'%</td><td>'+money(x.amount)+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="admin-description">No daily results for this position.</p>';
 var auditHtml=audit.length?'<div style="overflow:auto"><table><thead><tr><th>Date</th><th>Action</th><th>Actor</th><th>Note</th></tr></thead><tbody>'+audit.map(function(x){return '<tr><td>'+esc(dt(x.created_at))+'</td><td>'+esc(x.action)+'</td><td>'+esc(x.actor_id||'—')+'</td><td>'+esc(x.note||'—')+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="admin-description">No audit events recorded yet.</p>';
 var acts=p.status==='unlock_pending'?'<div class="hwc-inline"><button class="hwc-action" data-hwc-pos-action="unlock|'+esc(id)+'">UNLOCK / APPROVE</button><button class="hwc-action" data-hwc-pos-action="block|'+esc(id)+'">BLOCK</button><button class="hwc-action" data-hwc-pos-action="reset|'+esc(id)+'">RESET</button></div>':p.status==='blocked'?'<button class="hwc-action" data-hwc-pos-action="unblock|'+esc(id)+'">UNBLOCK &amp; RETURN HDC</button>':'<p class="admin-description">This record is archived / completed and cannot be processed again.</p>';
 showAdmin(backBtn()+'<h2>Position Details</h2><div class="hwc-admin-card"><h3>User Information</h3><div class="hwc-user-summary">'+user+'</div></div><div class="hwc-admin-card"><h3>Position &amp; Financial Information</h3><div class="hwc-user-summary">'+pos+'</div></div><div class="hwc-admin-card"><h3>Daily Profit &amp; Loss History</h3>'+hist+'</div><div class="hwc-admin-card"><h3>Administrator Audit History</h3>'+auditHtml+'</div><div class="hwc-admin-card"><h3>Administrator Decision</h3><label>Admin note / reason (optional)<textarea id="hwcPosAdminNote" rows="3" maxlength="1000"></textarea></label>'+acts+'</div>');
}
async function profitPage(){
 var a=await db.from('staking_daily_batches').select('id,result_type,percent,distribution_date,published_at,positions_processed,total_amount').order('published_at',{ascending:false}).limit(1).maybeSingle();
 var b=await db.from('staking_daily_batches').select('id,result_type,percent,distribution_date,published_at,positions_processed,total_amount').order('published_at',{ascending:false}).limit(100);
 if(a.error||b.error){showAdmin(backBtn()+'<h2>Profit Distribution</h2><div class="hwc-admin-card">'+esc((a.error||b.error).message)+'</div>');return;}
 var last=a.data,until=last?new Date(last.published_at).getTime()+86400000:0,locked=until>Date.now();
 var rows=(b.data||[]).map(function(x){return '<article class="hwc-record"><div><strong>'+esc(x.result_type.toUpperCase())+' · '+fmt(x.percent,4)+'%</strong><small>'+esc(dt(x.published_at))+' · '+x.positions_processed+' positions · Total '+money(x.total_amount)+'</small><button class="hwc-action" data-hwc-batch="'+esc(x.id)+'">View Position Results</button></div></article>';}).join('');
 showAdmin(backBtn()+'<h2>Profit Distribution</h2><div class="hwc-admin-card"><h3>Daily Profit / Loss</h3><p class="admin-description">Only one profit OR loss distribution is allowed in every rolling 24-hour period. Each position is calculated separately from its original stake. Positions created after the exact submission time are excluded.</p><div class="hwc-inline"><button class="hwc-action" data-hwc-result="profit">Give Profit</button><button class="hwc-action" data-hwc-result="loss">Give Loss</button></div><p class="hwc-safe-note">'+(locked?'Locked until '+esc(dt(new Date(until).toISOString()))+'. Last distribution: '+esc(last.result_type)+' '+fmt(last.percent,4)+'%.':'Available — no distribution in the last 24 hours.')+'</p><form id="hwcProfitForm"><input type="hidden" name="result_type" value="'+resultType+'"><label>Percentage (%)<input name="percent" type="number" min="0.10" max="100" step="0.01" placeholder="0.10 to 100" required></label><p class="admin-description">Profit is credited to HDC balance. Loss is recorded in the position only; it does not reduce wallet balance or principal.</p><button class="hwc-action" type="submit" '+(locked?'disabled':'')+'>Confirm '+(resultType==='profit'?'Profit':'Loss')+' Distribution</button></form></div><div class="hwc-admin-card"><h3>Daily Distribution Transaction Records</h3><p class="admin-description">All records are retained for audit. Member history shows only the last three days.</p><div id="hwcBatchList">'+(rows||'<p class="admin-description">No distribution records yet.</p>')+'</div><div id="hwcBatchDetails"></div></div>');
}
async function batchDetails(id){
 var q=await db.from('staking_daily_results').select('position_id,user_id,result_type,percent,amount,created_at').eq('batch_id',id).order('created_at');
 if(q.error){say(q.error.message);return;}var rows=q.data||[],ids=[...new Set(rows.map(function(x){return x.user_id;}))],p=ids.length?await db.from('profiles').select('id,first_name,last_name,referral_code').in('id',ids):{data:[]};
 if(p.error){say(p.error.message);return;}var map={};(p.data||[]).forEach(function(x){map[x.id]=x;});
 var host=$('hwcBatchDetails');if(!host)return;
 host.innerHTML='<h3>Position Results</h3>'+(rows.length?'<div style="overflow:auto"><table><thead><tr><th>User</th><th>Position</th><th>Type</th><th>Percent</th><th>Amount</th><th>Date</th></tr></thead><tbody>'+rows.map(function(x){var u=map[x.user_id]||{};return '<tr><td>'+esc([u.first_name,u.last_name].filter(Boolean).join(' ')||'Member')+'<small>'+esc(u.referral_code||'')+'</small></td><td>'+esc(String(x.position_id).slice(0,8))+'</td><td>'+esc(x.result_type)+'</td><td>'+fmt(x.percent,4)+'%</td><td>'+money(x.amount)+'</td><td>'+esc(dt(x.created_at))+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="admin-description">No position results in this distribution.</p>');
}
document.addEventListener('submit',function(e){
 var f=e.target;
 if(f&&f.id==='hwcProfitForm'){e.preventDefault();var fd=new FormData(f),btn=f.querySelector('button[type=submit]');btn.disabled=true;db.rpc('hwc_publish_staking_daily_result',{p_result_type:fd.get('result_type'),p_percent:Number(fd.get('percent'))}).then(function(r){if(r.error)throw r.error;say('Distribution completed: '+r.data.positions_processed+' positions · '+money(r.data.total_amount));return profitPage();}).catch(function(ex){say(ex.message||'Distribution failed.');btn.disabled=false;});}
},true);
document.addEventListener('click',function(e){
 var m=e.target.closest('[data-hwc-staking-admin]');if(m){e.preventDefault();e.stopImmediatePropagation();if(m.dataset.hwcStakingAdmin==='positions')landing();else profitPage();return;}
 var back=e.target.closest('[data-hwc-staking-back]');if(back){e.preventDefault();e.stopImmediatePropagation();if(root){root.hidden=true;root.style.display='none';}var h=$('adminHome');if(h){h.hidden=false;h.style.display='block';}return;}
 var s=e.target.closest('[data-hwc-pos-status]');if(s){e.preventDefault();e.stopImmediatePropagation();listPositions(s.dataset.hwcPosStatus,'all','');return;}
 var v=e.target.closest('[data-hwc-pos-view]');if(v){e.preventDefault();e.stopImmediatePropagation();viewPosition(v.dataset.hwcPosView);return;}
 var a=e.target.closest('[data-hwc-pos-action]');if(a){e.preventDefault();e.stopImmediatePropagation();var z=a.dataset.hwcPosAction.split('|'),act=z[0],id=z[1],note=$('hwcPosAdminNote')?$('hwcPosAdminNote').value.trim():'';var question=act==='reset'?'Reset this position? No HDC will be returned.':act==='block'?'Block this position? The HDC will remain locked.':act==='unblock'?'Unblock and return the original HDC to the member balance?':'Approve unlock and return the original HDC to the member balance?';if(!confirm(question))return;a.disabled=true;db.rpc('hwc_admin_review_staking_position',{p_position_id:id,p_action:act,p_note:note||null}).then(function(r){if(r.error)throw r.error;say('Position action completed: '+act+'.');return listPositions(currentStatus,'all','');}).catch(function(ex){say(ex.message||'Position action failed.');a.disabled=false;});return;}
 var t=e.target.closest('[data-hwc-result]');if(t){e.preventDefault();e.stopImmediatePropagation();resultType=t.dataset.hwcResult;var f=$('hwcProfitForm');if(f){f.querySelector('[name=result_type]').value=resultType;f.querySelector('button[type=submit]').textContent='Confirm '+(resultType==='profit'?'Profit':'Loss')+' Distribution';}return;}
 var b=e.target.closest('[data-hwc-batch]');if(b){e.preventDefault();e.stopImmediatePropagation();batchDetails(b.dataset.hwcBatch);return;}
},true);
if(panel){
 var observer=new MutationObserver(function(){addMenu();if(root&&$('adminHome')&&!$('adminHome').hidden){root.hidden=true;root.style.display='none';}});
 var home=$('adminHome');if(home)observer.observe(home,{childList:true,subtree:true});
 addMenu();
}
console.info('HEWAD staking production module loaded.');
})();
