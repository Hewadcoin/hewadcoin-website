/* HEWAD COIN — administrator-managed HWC valuation rates.
   Update-branch feature. Rates affect displayed valuation only, never token balances. */
(function(){
'use strict';
var db=window.hwcSupabase;
if(!db)return;
var $=function(id){return document.getElementById(id)};
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var fmt=function(v,d){return Number(v||0).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d})};
var rates={AFN:null,USD:null},busy=false,ratePage=null,observer=null;
function isAdmin(){return !!window.hwcCurrentUser&&window.HEWAD_USER_ROLE==='admin'}
function notify(m){if(typeof window.showNotice==='function')window.showNotice(m);else if(typeof window.say==='function')window.say(m);else alert(m)}
function style(){
 if($('hwcRateStyles'))return;
 var s=document.createElement('style');s.id='hwcRateStyles';s.textContent=
 '.hwc-rate-admin{color:#f4f1e9;padding:14px}.hwc-rate-admin .hwc-rate-card{background:linear-gradient(145deg,#191b20,#101216);border:1px solid #51452d;border-radius:14px;padding:14px;margin:12px 0}.hwc-rate-admin h2,.hwc-rate-admin h3{color:#e8c66f}.hwc-rate-admin .hwc-rate-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.hwc-rate-admin label{display:block;color:#b9bbc2;font-size:12px;margin:10px 0 5px}.hwc-rate-admin input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #555;border-radius:9px;background:#090b0f;color:#fff;font-size:16px}.hwc-rate-admin button{border:1px solid #8c6b2b;border-radius:9px;background:#1c1a15;color:#f5d987;padding:10px 14px;font-weight:700}.hwc-rate-admin button.primary{background:#d8ad3e;color:#211906}.hwc-rate-admin button:disabled{opacity:.55}.hwc-rate-admin .muted{color:#aeb0b8;font-size:12px;line-height:1.5}.hwc-rate-admin .history-row{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #35373d;padding:9px 0;font-size:12px}.hwc-rate-value{display:block;color:#d9bd72;font-size:11px;margin-top:3px;line-height:1.4}.hwc-rate-open{display:block;width:100%;text-align:left;margin:12px 0;padding:15px!important;background:linear-gradient(135deg,#211d14,#12151b)!important;border:1px solid #8c6b2b!important;border-radius:12px!important;color:#f5d987!important;font-weight:800;font-size:14px}.hwc-rate-back{margin-bottom:10px}@media(max-width:420px){.hwc-rate-admin .hwc-rate-grid{grid-template-columns:1fr}}';
 document.head.appendChild(s);
}
async function loadRates(){
 var r=await db.from('hwc_coin_rates').select('afn_per_hwc,usd_per_hwc,updated_at').eq('id',1).maybeSingle();
 if(r.error){console.warn('HWC rates unavailable:',r.error.message);return false}
 rates.AFN=r.data&&r.data.afn_per_hwc!=null?Number(r.data.afn_per_hwc):null;
 rates.USD=r.data&&r.data.usd_per_hwc!=null?Number(r.data.usd_per_hwc):null;
 window.HWC_COIN_RATES={AFN:rates.AFN,USD:rates.USD,updatedAt:r.data&&r.data.updated_at||null};
 window.dispatchEvent(new CustomEvent('hwc:rates-updated',{detail:window.HWC_COIN_RATES}));
 renderValuations();return true;
}
function valueMarkup(amount){
 var parts=[];
 if(rates.AFN>0)parts.push(fmt(amount*rates.AFN,2)+' AFN');
 if(rates.USD>0)parts.push('$'+fmt(amount*rates.USD,2)+' USD');
 return parts.length?'≈ '+parts.join(' · '):'Rate not set yet';
}
function addValuationAfter(el,amount){
 if(!el||!el.parentNode||!Number.isFinite(amount))return;
 var key=el.id||'wallet';
 var node=document.querySelector('[data-hwc-rate-value="'+key+'"]');
 if(!node){node=document.createElement('small');node.className='hwc-rate-value';node.dataset.hwcRateValue=key;el.insertAdjacentElement('afterend',node)}
 node.textContent=valueMarkup(amount);
}
function renderValuations(){
 ['walletHwcBalance','hwcBalance','profileHwc','memberCardHwcBalance'].forEach(function(id){
  var el=$(id);if(!el)return;
  var amount=null;
  if(id==='walletHwcBalance'||id==='hwcBalance')amount=window.__hwcRateWalletBalance;
  else amount=Number(String(el.textContent||'').replace(/,/g,'').match(/[0-9]+(?:\.[0-9]+)?/)?.[0]);
  if(amount!=null&&Number.isFinite(Number(amount)))addValuationAfter(el,Number(amount));
 });
 document.querySelectorAll('.hwc-admin-extra .hwc-admin-field').forEach(function(f){
  var label=f.querySelector('small'),val=f.querySelector('b');
  if(!label||!val||label.textContent.trim().toUpperCase()!=='HWC'||f.querySelector('.hwc-rate-value'))return;
  var amount=Number(String(val.textContent).replace(/,/g,''));
  if(Number.isFinite(amount)){var n=document.createElement('small');n.className='hwc-rate-value';n.textContent=valueMarkup(amount);val.insertAdjacentElement('afterend',n)}
 });
}
async function loadOwnBalance(){
 if(!window.hwcCurrentUser)return;
 var r=await db.from('wallets').select('balance_hwc').eq('user_id',window.hwcCurrentUser.id).maybeSingle();
 if(r.error)return;
 window.__hwcRateWalletBalance=Number(r.data&&r.data.balance_hwc||0);
 renderValuations();
}
function makeRatePage(){
 var panel=$('adminPanel');if(!panel)return null;
 var p=$('hwcCoinRatePage');
 if(!p){p=document.createElement('section');p.id='hwcCoinRatePage';p.className='hwc-rate-admin';p.hidden=true;panel.appendChild(p)}
 return p;
}
function renderHistory(rows){
 if(!rows||!rows.length)return '<p class="muted">No rate changes recorded yet.</p>';
 return rows.map(function(x){return '<div class="history-row"><span><b>'+esc(x.currency)+'</b><br><span class="muted">'+new Date(x.created_at).toLocaleString()+'</span></span><span>'+ (x.old_rate==null?'—':fmt(x.old_rate,8))+' → <b>'+fmt(x.new_rate,8)+'</b></span></div>'}).join('');
}
async function openRatePage(){
 if(!isAdmin())return;
 var home=$('adminHome'),p=makeRatePage();if(!p)return;
 ['adminHome','adminUsers','adminKyc','adminKycList','adminNotifications'].forEach(function(id){if($(id))$(id).hidden=true});
 if(home)home.hidden=true;p.hidden=false;
 p.innerHTML='<button class="hwc-rate-back" id="hwcRateBack">← Back to Control Panel</button><h2>HWC Coin Rate</h2><p class="muted">Set the value of one HWC coin. A saved rate becomes active immediately for all members. HWC token quantities are never changed by a rate update.</p><div class="hwc-rate-grid"><section class="hwc-rate-card"><h3>🇦🇫 HWC → AFN</h3><div class="muted">Current price: <b id="hwcCurrentAfn">Not set</b></div><label for="hwcAfnRate">Price of 1 HWC in Afghanis</label><input id="hwcAfnRate" type="number" min="0.00000001" max="1000000000000" step="0.00000001" placeholder="Enter AFN price"><button class="primary" id="hwcSaveAfn">Save & Activate AFN</button></section><section class="hwc-rate-card"><h3>🇺🇸 HWC → USD</h3><div class="muted">Current price: <b id="hwcCurrentUsd">Not set</b></div><label for="hwcUsdRate">Price of 1 HWC in US Dollars</label><input id="hwcUsdRate" type="number" min="0.00000001" max="1000000000000" step="0.00000001" placeholder="Enter USD price"><button class="primary" id="hwcSaveUsd">Save & Activate USD</button></section></div><section class="hwc-rate-card"><h3>Live calculation preview</h3><div class="hwc-rate-grid"><div><label>HWC amount</label><input id="hwcRatePreviewAmount" type="number" min="0" step="0.0001" value="10"></div><div><label>Estimated value</label><div id="hwcRatePreview" class="muted" style="padding:12px 0">—</div></div></div></section><section class="hwc-rate-card"><h3>Rate change history</h3><div id="hwcRateHistory" class="muted">Loading…</div></section>';
 p.querySelector('#hwcRateBack').onclick=function(){p.hidden=true;if(home)home.hidden=false};
 await loadRates();
 p.querySelector('#hwcCurrentAfn').textContent=rates.AFN==null?'Not set':fmt(rates.AFN,8)+' AFN';
 p.querySelector('#hwcCurrentUsd').textContent=rates.USD==null?'Not set':'$'+fmt(rates.USD,8)+' USD';
 p.querySelector('#hwcAfnRate').value=rates.AFN==null?'':rates.AFN;
 p.querySelector('#hwcUsdRate').value=rates.USD==null?'':rates.USD;
 function preview(){var n=Number(p.querySelector('#hwcRatePreviewAmount').value);p.querySelector('#hwcRatePreview').textContent=Number.isFinite(n)&&n>=0?valueMarkup(n):'Enter a valid amount'}
 p.querySelector('#hwcRatePreviewAmount').oninput=preview;preview();
 async function save(currency){
  var input=p.querySelector(currency==='AFN'?'#hwcAfnRate':'#hwcUsdRate'),button=p.querySelector(currency==='AFN'?'#hwcSaveAfn':'#hwcSaveUsd');
  var amount=Number(input.value);
  if(!input.value.trim()||!Number.isFinite(amount)||amount<=0||amount>1e12){notify('Enter a valid positive '+currency+' price for one HWC.');return}
  if(!confirm('Activate 1 HWC = '+fmt(amount,8)+' '+currency+' for all members?'))return;
  button.disabled=true;
  var q=await db.rpc('admin_set_hwc_coin_rate',{p_currency:currency,p_rate:amount});
  button.disabled=false;
  if(q.error){notify(q.error.message||'Could not save HWC rate.');return}
  await loadRates();
  p.querySelector('#hwcCurrentAfn').textContent=rates.AFN==null?'Not set':fmt(rates.AFN,8)+' AFN';
  p.querySelector('#hwcCurrentUsd').textContent=rates.USD==null?'Not set':'$'+fmt(rates.USD,8)+' USD';
  preview();await loadHistory();notify('HWC '+currency+' rate updated and activated.');
 }
 p.querySelector('#hwcSaveAfn').onclick=function(){save('AFN')};
 p.querySelector('#hwcSaveUsd').onclick=function(){save('USD')};
 await loadHistory();
}
async function loadHistory(){
 var host=$('hwcRateHistory');if(!host||!isAdmin())return;
 var r=await db.from('hwc_coin_rate_history').select('currency,old_rate,new_rate,created_at').order('created_at',{ascending:false}).limit(30);
 host.innerHTML=r.error?'<p class="muted">Rate history unavailable: '+esc(r.error.message)+'</p>':renderHistory(r.data||[]);
}
function addAdminEntry(){
 if(!isAdmin())return;
 var home=$('adminHome');if(!home)return;
 if($('hwcOpenCoinRates'))return;
 var b=document.createElement('button');b.type='button';b.id='hwcOpenCoinRates';b.className='hwc-rate-open';b.innerHTML='💱 &nbsp; HWC Coin Rate <span style="display:block;font-size:11px;font-weight:400;margin-top:5px;color:#c3b27e">Set HWC price in AFN and USD</span>';
 b.onclick=openRatePage;home.appendChild(b);
}
function start(){
 style();addAdminEntry();loadRates().then(loadOwnBalance);
 if(observer)observer.disconnect();
 observer=new MutationObserver(function(){
  addAdminEntry();
  var p=$('hwcCoinRatePage');
  if(p&&!p.hidden){
   var other=['adminHome','adminUsers','adminKyc','adminKycList','adminNotifications'].some(function(id){var e=$(id);return e&&!e.hidden});
   if(other)p.hidden=true;
  }
  renderValuations();
 });
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
}
document.addEventListener('visibilitychange',function(){if(!document.hidden){loadRates().then(loadOwnBalance)}});
window.addEventListener('focus',function(){loadRates().then(loadOwnBalance)});
window.addEventListener('hwc:wallet-updated',loadOwnBalance);
if(db.auth&&db.auth.onAuthStateChange){db.auth.onAuthStateChange(function(_event,session){if(session){loadRates().then(loadOwnBalance);setTimeout(addAdminEntry,300)}})}
try{db.channel('hwc-coin-rate-live').on('postgres_changes',{event:'*',schema:'public',table:'hwc_coin_rates'},function(){loadRates().then(loadOwnBalance)}).subscribe()}catch(e){console.warn('HWC rate live updates unavailable:',e)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
