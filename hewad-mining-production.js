/* HEWAD COIN Mining — fixed 08:00 Afghanistan daily cycle. */
(function(){
'use strict';
var doc=document;
/* The homepage creates hwcSupabase as a top-level lexical const, not window.hwcSupabase.
   Reuse it when exposed; otherwise create a second client with the same project/key.
   Supabase persists the login session in shared browser storage, so auth remains valid. */
var db=window.hwcSupabase;
if(!db&&window.supabase&&typeof window.supabase.createClient==='function'){
 db=window.supabase.createClient(
  'https://qjclffmzkqfgqbbawhaz.supabase.co',
  'sb_publishable_Sx7vXgrUAvdlWbjfwY6FVQ_DPEfEuPS',
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
 );
}
if(!db){console.error('HEWAD Mining: Supabase client unavailable.');return;}
var rootId='modulePage',timer=null,busy=false;
var $=function(id){return doc.getElementById(id);};
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var fmt=function(v,d){return Number(v||0).toLocaleString(undefined,{maximumFractionDigits:d==null?2:d});};
var say=function(m){if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
var user=async function(){
 if(window.hwcCurrentUser&&window.hwcCurrentUser.id)return window.hwcCurrentUser;
 var r=await db.auth.getUser();if(r.error)throw r.error;
 if(!r.data||!r.data.user)throw new Error('Please sign in to your HEWAD COIN account.');
 return r.data.user;
};
var css=doc.createElement('style');css.id='hwc-mining-style';
css.textContent=`
.hwc-mining{max-width:900px;margin:0 auto;color:#f6f4ec}
.hwc-mining .hm-hero{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:20px;border:1px solid #98712e;border-radius:23px;background:radial-gradient(ellipse at 90% 0%,rgba(222,174,72,.18),transparent 45%),linear-gradient(135deg,#282317,#151923);margin-bottom:16px}
.hwc-mining .hm-brand{display:flex;align-items:center;gap:13px}.hwc-mining .hm-logo{display:grid;place-items:center;width:56px;height:56px;border-radius:18px;background:linear-gradient(145deg,#f4d477,#95621e);font-size:30px;box-shadow:0 7px 20px #0006}
.hwc-mining h2,.hwc-mining h3,.hwc-mining p{margin:0}.hwc-mining .hm-hero h2{font-size:20px;color:#ffe3a0}.hwc-mining .hm-hero p{margin-top:5px;color:#c5b995;font-size:12px}
.hwc-mining .hm-tag{padding:7px 10px;border:1px solid #8a6a32;border-radius:20px;color:#f2d27e;background:#342916;font-size:11px;font-weight:800;white-space:nowrap}
.hwc-mining .hm-balance{padding:19px;border:1px solid #3b493f;border-radius:19px;background:linear-gradient(130deg,#142a25,#171c25);margin-bottom:14px}
.hwc-mining .hm-label{color:#aeb9b2;font-size:11px;letter-spacing:1px;text-transform:uppercase}.hwc-mining .hm-big{font-size:26px;font-weight:900;color:#5ce0ae;margin-top:7px}
.hwc-mining .hm-tapbox{text-align:center;padding:22px 15px;border:1px solid #66502b;border-radius:22px;background:radial-gradient(ellipse at center,rgba(202,155,57,.15),transparent 65%),#171a22;margin-bottom:14px}
.hwc-mining .hm-tap{width:142px;height:142px;border:5px solid #b98b39;border-radius:50%;background:radial-gradient(circle at 35% 25%,#f9df8d,#a66e22 70%,#583b18);color:#241b0b;font-size:47px;box-shadow:0 0 0 8px #b98b3920,0 12px 32px #0008;cursor:pointer;transition:transform .12s}
.hwc-mining .hm-tap:active{transform:scale(.94)}.hwc-mining .hm-tap:disabled{opacity:.45;cursor:not-allowed}
.hwc-mining .hm-tapbox h3{margin-top:14px;color:#f4d58a;font-size:17px}.hwc-mining .hm-tapbox p{margin-top:6px;color:#aeb8c4;font-size:12px}
.hwc-mining .hm-progress{height:10px;background:#303541;border-radius:12px;overflow:hidden;margin:12px 0 7px}.hwc-mining .hm-progress span{display:block;height:100%;background:linear-gradient(90deg,#9b6b25,#f5d47c);border-radius:12px;transition:width .2s}
.hwc-mining .hm-progressline{display:flex;justify-content:space-between;gap:8px;color:#c6cbd0;font-size:12px}
.hwc-mining .hm-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:14px}
.hwc-mining .hm-stat{padding:15px;border:1px solid #303b43;border-radius:16px;background:#171d27;min-width:0}
.hwc-mining .hm-stat small{display:block;color:#aeb9c4;font-size:11px;margin-bottom:7px}.hwc-mining .hm-stat b{font-size:17px;color:#f4d58a;overflow-wrap:anywhere}
.hwc-mining .hm-card{padding:17px;border:1px solid #343b46;border-radius:18px;background:#171d27;margin-bottom:14px}
.hwc-mining .hm-card h3{font-size:15px;margin-bottom:13px;color:#f4d58a}
.hwc-mining .hm-goal{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border-radius:13px;background:#222936;font-size:13px;font-weight:800}
.hwc-mining .hm-goal strong{color:#f4d58a;white-space:nowrap}
.hwc-mining .hm-auto{display:flex;align-items:center;gap:9px;margin-top:12px;color:#75dfb4;font-size:12px}
.hwc-mining .hm-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #2c3440;font-size:12px}.hwc-mining .hm-row:last-child{border:0}.hwc-mining .hm-row span{color:#adb7c3}.hwc-mining .hm-row b{text-align:right;overflow-wrap:anywhere}
.hwc-mining .hm-history{display:flex;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid #2c3440;font-size:12px}.hwc-mining .hm-history:last-child{border:0}.hwc-mining .hm-history b{color:#6cdeb0}
.hwc-mining .hm-note{color:#aeb9c4;font-size:11px;line-height:1.5;margin-top:10px}
@media(max-width:520px){.hwc-mining .hm-hero{padding:15px}.hwc-mining .hm-logo{width:48px;height:48px}.hwc-mining .hm-hero h2{font-size:17px}.hwc-mining .hm-tag{font-size:9px}.hwc-mining .hm-stats{gap:8px}.hwc-mining .hm-stat{padding:12px}.hwc-mining .hm-stat b{font-size:15px}.hwc-mining .hm-tap{width:128px;height:128px}}
`;
doc.head.appendChild(css);
function view(s){
 var taps=Number(s.clicks_today||0),max=250,pct=Math.min(100,taps/max*100);
 return '<div class="hwc-mining"><div class="hm-hero"><div class="hm-brand"><div class="hm-logo">⛏️</div><div><h2>Mining</h2><p>Tap to Mine HDC</p></div></div><span class="hm-tag">DAILY MINING</span></div>'+
 '<div class="hm-balance"><div class="hm-label">Your HDC Wallet Balance</div><div class="hm-big" id="hm-balance">'+fmt(s.balance_hdc,8)+' HDC</div></div>'+
 '<div class="hm-tapbox"><button class="hm-tap" id="hm-tap" '+(taps>=max?'disabled':'')+' aria-label="Tap to mine">⛏️</button><h3>Tap to Mine</h3><p>Every tap earns 0.1 HDC instantly in your Wallet</p>'+
 '<div class="hm-progress"><span id="hm-bar" style="width:'+pct+'%"></span></div><div class="hm-progressline"><span id="hm-taps">'+taps+' / 250 Taps</span><span id="hm-earned">'+fmt(s.earned_today,2)+' / 25 HDC</span></div></div>'+
 '<div class="hm-card"><h3>Daily Mining Goal</h3><div class="hm-goal"><span>250 / 250 Taps</span><strong>25 HDC</strong></div><div class="hm-auto">✓ Automatic Wallet Reward — 0.1 HDC per tap</div><p class="hm-note">Daily cycle: 8:00 AM to 8:00 AM Afghanistan time. Your taps and daily limit reset automatically at 8:00 AM.</p></div>'+
 '<div class="hm-card"><h3>Mining Statistics</h3><div class="hm-stats">'+
 '<div class="hm-stat"><small>Total Taps</small><b>'+fmt(s.total_taps,0)+'</b></div><div class="hm-stat"><small>Total Mined</small><b>'+fmt(s.total_mined,2)+' HDC</b></div>'+
 '<div class="hm-stat"><small>Completed Cycles</small><b>'+fmt(s.completed_cycles,0)+'</b></div><div class="hm-stat"><small>Remaining Taps</small><b id="hm-remaining">'+fmt(s.remaining_clicks,0)+'</b></div></div></div>'+
 '<div class="hm-card"><h3>Mining History</h3><div id="hm-history"><div class="hm-note">Loading mining history…</div></div></div></div>';
}
async function history(u){
 var q=await db.from('mining_clicks').select('id,reward,created_at,mining_date').eq('user_id',u.id).order('created_at',{ascending:false}).limit(12);
 if(q.error)throw q.error;
 var el=$('hm-history');if(!el)return;
 if(!q.data||!q.data.length){el.innerHTML='<div class="hm-note">No mining history yet.</div>';return;}
 el.innerHTML=q.data.map(function(x){return '<div class="hm-history"><span>'+esc(new Date(x.created_at).toLocaleString())+'</span><b>+'+fmt(x.reward,2)+' HDC</b></div>';}).join('');
}
async function refresh(){
 var u=await user(),r=await db.rpc('hwc_mining_status');if(r.error)throw r.error;
 var s=r.data||{};var root=$(rootId);if(!root)return;
 root.innerHTML=view(s);await history(u);
 var btn=$('hm-tap');if(btn)btn.addEventListener('click',tap);
}
async function tap(){
 if(busy)return;busy=true;var btn=$('hm-tap');if(btn)btn.disabled=true;
 try{
  var r=await db.rpc('hwc_mining_click');if(r.error)throw r.error;
  await refresh();
  var data=r.data||{};say('+'+fmt(data.reward||0.1,2)+' HDC added to your Wallet.');
 }catch(e){say(e&&e.message?e.message:'Mining tap failed. Please try again.');try{await refresh();}catch(_){}}finally{busy=false;var b=$('hm-tap');if(b&&Number(($('hm-taps')||{}).textContent?.split('/')[0]||0)<250)b.disabled=false;}
}
async function open(){
 if(timer){clearInterval(timer);timer=null;}
 var root=$(rootId);if(!root)return;
 root.innerHTML='<div class="hwc-mining hm-card">Loading Mining…</div>';
 try{await refresh();timer=setInterval(function(){refresh().catch(function(e){console.error('Mining refresh:',e);});},60000);}
 catch(e){root.innerHTML='<div class="hwc-mining hm-card"><h3>Mining unavailable</h3><p class="hm-note">'+esc(e.message||'Please sign in and complete account verification.')+'</p></div>';}
}
doc.addEventListener('click',function(e){
 var tile=e.target.closest('[data-action="Mining" i]');if(!tile)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open();
},true);
window.openHwcMiningPage=open;
})();
