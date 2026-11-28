/* HEWAD COIN — Withdraw workflow and admin controls. */
(function(){
'use strict';
if(window.__HWC_WITHDRAW_MODULE__)return;window.__HWC_WITHDRAW_MODULE__=true;
var db=typeof hwcSupabase!=='undefined'?hwcSupabase:window.hwcSupabase,$=function(id){return document.getElementById(id);};
if(!db&&window.supabase&&typeof window.supabase.createClient==='function'){
 db=window.supabase.createClient('https://qjclffmzkqfgqbbawhaz.supabase.co','sb_publishable_Sx7vXgrUAvdlWbjfwY6FVQ_DPEfEuPS',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
}
if(!db){console.error('HEWAD Withdraw: Supabase client unavailable.');return;}
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var fmt=function(v,d){return Number(v||0).toLocaleString(undefined,{maximumFractionDigits:d==null?4:d});};
var dt=function(v){return v?new Date(v).toLocaleString():'—';};
var say=function(m){if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
var me=async function(){if(window.hwcCurrentUser&&window.hwcCurrentUser.id)return window.hwcCurrentUser;var a=await db.auth.getUser();if(a.error)throw a.error;if(!a.data||!a.data.user)throw new Error('Please sign in first.');return a.data.user;};
var css=document.createElement('style');css.id='hwc-withdraw-production-style';
css.textContent=' .hwc-withdraw-dashboard-tile{display:flex;align-items:center;gap:12px;min-height:72px;padding:14px;border:1px solid #7c622d;border-radius:15px;background:linear-gradient(145deg,#24221c,#11151c);color:#f5dfaa;font-weight:800;cursor:pointer}.hwc-withdraw{max-width:850px;margin:0 auto;color:#f5f3ea}.hwc-withdraw .wd-hero{padding:19px;border:1px solid #80642e;border-radius:20px;background:radial-gradient(circle at 90% 0%,#4b3a1d 0,transparent 48%),linear-gradient(140deg,#22232a,#101319);margin:10px 0 14px}.hwc-withdraw .wd-kicker{font-size:9px;letter-spacing:2px;color:#e5c16c;font-
…[1 chars truncated — re-run with head/grep/tail for full output]…
Menu(){
 if(!isAdmin()||!home)return;
 var grid=home.querySelector('.hwc-admin-grid')||home.querySelector('.admin-menu');if(!grid)return;
 var legacy=grid.classList.contains('hwc-admin-grid');
 function add(key,icon,title,desc){
  if(grid.querySelector('[data-hwc-withdraw-admin="'+key+'"]'))return;
  var b=document.createElement('button');b.type='button';b.className=legacy?'hwc-admin-option':'admin-menu-card';b.dataset.hwcWithdrawAdmin=key;
  b.innerHTML=legacy?'<span class="ico">'+icon+'</span><span><strong>'+title+'</strong><small>'+desc+'</small></span><span class="arrow">›</span>':'<span class="admin-menu-icon">'+icon+'</span><span class="admin-menu-copy"><strong>'+title+'</strong><small>'+desc+'</small></span><span class="admin-chevron">›</span>';
  grid.appendChild(b);
 }
 add('requests','⬇','Withdraw Request','Review member details, accept or reject requests and record payout TX Hash');
 add('settings','⚙','Withdraw Management','USDT withdrawal fee, minimum and rolling 24-hour maximum controls');
 var future=home.querySelector('.admin-future-space');if(future)future.hidden=true;
}
function showAdmin(html){var v=ensureAdminView();if(!v)return;if(home){home.hidden=true;home.style.display='none';}panel.querySelectorAll('.admin-view').forEach(function(x){x.hidden=true;x.style.display='none';});v.hidden=false;v.style.display='block';v.innerHTML='<div class="hwc-withdraw">'+html+'</div>';window.scrollTo(0,0);}
function adminBack(){if(adminView){adminView.hidden=true;adminView.style.display='none';}panel.querySelectorAll('.admin-view').forEach(function(x){x.hidden=true;x.style.display='none';});if(home){home.hidden=false;home.style.display='block';}}
function backHtml(){return '<button type="button" class="hwc-admin-back" data-wd-back>‹ Control Center</button>';}
function switchHtml(id,label,checked){return '<div class="wd-switch-row"><span>'+esc(label)+'</span><label class="wd-switch"><input type="checkbox" id="'+id+'" '+(checked?'checked':'')+'><i></i></label></div>';}
async function loadSettings(){
 showAdmin(backHtml()+'<div class="wd-hero"><div class="wd-kicker">HEWAD COIN · ADMIN FINANCE</div><h3>Withdraw Management</h3><p class="wd-muted">Configure USDT withdrawal fees, minimums and rolling 24-hour maximums. Every ON/OFF switch is below its value box.</p></div><div id="hwcWithdrawSettings">Loading settings…</div>');
 var host=$('hwcWithdrawSettings'),assets=['USD'];var rows=await Promise.all(assets.map(function(a){return db.rpc('hwc_get_withdrawal_policy',{p_asset:a});}));
 var bad=rows.find(function(x){return x.error;});if(bad){host.innerHTML='<div class="wd-card wd-note">'+esc(bad.error.message)+'</div>';return;}
 host.innerHTML=assets.map(function(a,i){var p=rows[i].data||{},sym=a==='USD'?'USDT':a;
 return '<section class="wd-setting"><h4>'+sym+' · '+(a==='USD'?'US Dollar':a==='HDC'?'Hewad Coin':'Afghan Afghani')+'</h4>'+
 '<div class="wd-field"><label>Withdrawal Fee (%)</label><input id="wdFee-'+a+'" type="number" min="0" max="100" step="0.01" value="'+esc(p.fee_percent)+'">'+switchHtml('wdNoFee-'+a,'No Fees',p.no_fee)+'</div>'+
 '<div class="wd-field"><label>'+sym+' Minimum</label><input id="wdMin-'+a+'" type="number" min="0" step="0.00000001" value="'+esc(p.min_amount)+'">'+switchHtml('wdNoMin-'+a,'No Minimum Limit',p.no_minimum)+'</div>'+
 '<div class="wd-field"><label>'+sym+' Maximum (Rolling 24 Hours)</label><input id="wdMax-'+a+'" type="number" min="0" step="0.00000001" value="'+esc(p.max_24h_amount)+'">'+switchHtml('wdNoMax-'+a,'No Maximum Limit',p.no_maximum)+'</div>'+
 '<button class="wd-primary" type="button" data-wd-save="'+a+'">Save '+sym+' Settings</button></section>';}).join('');
 assets.forEach(function(a){[['Fee','NoFee'],['Min','NoMin'],['Max','NoMax']].forEach(function(x){var t=$('wd'+x[1]+'-'+a),inp=$('wd'+x[0]+'-'+a);if(t&&inp){inp.disabled=t.checked;t.addEventListener('change',function(){inp.disabled=t.checked;});}});});
}
async function saveSettings(a){
 var fee=Number($('wdFee-'+a).value),mn=Number($('wdMin-'+a).value),mx=Number($('wdMax-'+a).value);
 if(!Number.isFinite(fee)||fee<0||fee>100||!Number.isFinite(mn)||mn<0||!Number.isFinite(mx)||mx<0)return say('Enter valid fee and limit values.');
 var b=document.querySelector('[data-wd-save="'+a+'"]');if(b){b.disabled=true;b.textContent='Saving…';}
 try{var q=await db.rpc('hwc_admin_update_withdrawal_policy',{p_asset:a,p_fee_percent:fee,p_no_fee:$('wdNoFee-'+a).checked,p_min_amount:mn,p_no_minimum:$('wdNoMin-'+a).checked,p_max_24h_amount:mx,p_no_maximum:$('wdNoMax-'+a).checked});if(q.error)throw q.error;say(a+' withdrawal settings saved.');}
 catch(e){say(e.message||'Could not save withdrawal settings.');}
 finally{if(b){b.disabled=false;b.textContent='Save '+(a==='USD'?'USDT':a)+' Settings';}}
}
async function loadRequests(){
 showAdmin(backHtml()+'<div class="wd-hero"><div class="wd-kicker">HEWAD COIN · ADMIN REVIEW</div><h3>Withdraw Request</h3><p class="wd-muted">Open a request to review the member’s identity, KYC, staking, balances and withdrawal history before accepting or rejecting it.</p></div><div id="hwcWithdrawRequestList">Loading requests…</div><div id="hwcWithdrawRequestDetail"></div>');
 var host=$('hwcWithdrawRequestList'),q=await db.from('withdrawal_requests').select('id,user_id,asset,amount,withdrawal_method,destination,status,admin_note,created_at,network,fee_rate,fee_amount,net_amount,tx_hash,reviewed_at,completed_at').order('created_at',{ascending:false}).limit(100);
 if(q.error){host.innerHTML='<div class="wd-card wd-note">'+esc(q.error.message)+'</div>';return;}
 var rows=q.data||[],ids=[...new Set(rows.map(function(x){return x.user_id;}))],pr=ids.length?await db.from('profiles').select('id,first_name,last_name,account_status,kyc_status').in('id',ids):{data:[]},people={};
 (pr.data||[]).forEach(function(x){people[x.id]=x;});
 host.innerHTML=rows.length?rows.map(function(x){var p=people[x.user_id]||{},name=[p.first_name,p.last_name].filter(Boolean).join(' ')||'Member';return '<button type="button" class="wd-request-item" data-wd-open="'+esc(x.id)+'"><b>'+esc(name)+' · '+fmt(x.amount,4)+' '+esc(x.asset==='USD'?'USDT':x.asset)+'</b><small>ID: '+esc(x.id)+'<br>'+esc(x.network||x.withdrawal_method||'—')+' · '+esc(x.status.toUpperCase())+'<br>'+dt(x.created_at)+'</small></button>';}).join(''):'<div class="wd-card wd-muted">No withdrawal requests found.</div>';
}
async function openRequest(id){
 var host=$('hwcWithdrawRequestDetail');if(!host)return;host.innerHTML='<div class="wd-card">Loading member and withdrawal details…</div>';
 var rq=await db.from('withdrawal_requests').select('id,user_id,asset,amount,withdrawal_method,destination,status,admin_note,created_at,network,fee_rate,fee_amount,net_amount,tx_hash,reviewed_by,reviewed_at,completed_at').eq('id',id).maybeSingle();
 if(rq.error||!rq.data){host.innerHTML='<div class="wd-card wd-note">'+esc(rq.error?rq.error.message:'Request not found.')+'</div>';return;}var w=rq.data;
 var rs=await Promise.all([
  db.from('profiles').select('id,first_name,last_name,account_status,kyc_status,card_number,referral_code,created_at').eq('id',w.user_id).maybeSingle(),
  db.from('wallets').select('balance_hwc,balance_usd,balance_afn,reserved_hwc,reserved_usd,reserved_afn,staked_hwc').eq('user_id',w.user_id).maybeSingle(),
  db.from('staking_positions').select('id,plan_name,principal,original_principal,status,started_at,matures_at').eq('user_id',w.user_id).neq('status','reset').order('started_at',{ascending:false}).limit(100),
  db.from('withdrawal_requests').select('id,asset,amount,status,created_at,network,fee_amount,net_amount,tx_hash').eq('user_id',w.user_id).order('created_at',{ascending:false}).limit(100),
  db.rpc('hwc_admin_withdrawal_user_email',{p_user_id:w.user_id})
 ]);
 var bad=rs.find(function(x){return x.error;});if(bad){host.innerHTML='<div class="wd-card wd-note">'+esc(bad.error.message)+'</div>';return;}
 var p=rs[0].data||{},bal=rs[1].data||{},pos=rs[2].data||[],hist=rs[3].data||[],users=rs[4].data||[];
 var email=users||'—',name=[p.first_name,p.last_name].filter(Boolean).join(' ')||'Member';
 var staked=pos.reduce(function(n,x){return n+Number(x.original_principal||x.principal||0);},0);
 var approved=hist.filter(function(x){return x.status==='approved'||x.status==='completed';}).length,rejected=hist.filter(function(x){return x.status==='rejected';}).length,first=hist.length?hist[hist.length-1].created_at:null;
 var positions=pos.length?pos.map(function(x){return '<div class="wd-history"><b>'+esc(x.plan_name||'HDC Position')+' · '+fmt(x.original_principal||x.principal,4)+' HDC</b><small class="wd-muted">'+esc(x.status)+' · '+dt(x.started_at)+' → '+dt(x.matures_at)+'</small></div>';}).join(''):'<p class="wd-muted">No staking positions.</p>';
 var history=hist.length?hist.map(function(x){return '<div class="wd-history"><b>'+fmt(x.amount,4)+' '+esc(x.asset==='USD'?'USDT':x.asset)+' · '+esc(x.status.toUpperCase())+'</b><small class="wd-muted">'+dt(x.created_at)+(x.tx_hash?' · TX: '+esc(x.tx_hash):'')+'</small></div>';}).join(''):'<p class="wd-muted">No withdrawal history.</p>';
 host.innerHTML='<section class="wd-card"><h3>1. Personal Information</h3><div class="wd-detail-grid"><div><span>Full Name</span><b>'+esc(name)+'</b></div><div><span>Email Address</span><b>'+esc(email)+'</b></div><div><span>KYC Status</span><b>'+esc(p.kyc_status||'unknown')+'</b></div><div><span>Account Status</span><b>'+esc(p.account_status||'unknown')+'</b></div><div><span>Card Number</span><b>'+esc(p.card_number||'—')+'</b></div><div><span>Referral Code</span><b>'+esc(p.referral_code||'—')+'</b></div></div></section>'+
 '<section class="wd-card"><h3>2. Staking Information</h3><div class="wd-detail-grid"><div><span>Total Staked HDC</span><b>'+fmt(staked,8)+' HDC</b></div><div><span>Positions Count</span><b>'+pos.length+'</b></div></div><h4>Position Details</h4>'+positions+'</section>'+
 '<section class="wd-card"><h3>3. Account Balances</h3><div class="wd-detail-grid"><div><span>HDC Balance</span><b>'+fmt(bal.balance_hwc,8)+' HDC</b></div><div><span>AFN Balance</span><b>'+fmt(bal.balance_afn,2)+' AFN</b></div><div><span>USD Balance</span><b>$'+fmt(bal.balance_usd,8)+'</b></div><div><span>Reserved USD</span><b>$'+fmt(bal.reserved_usd,8)+'</b></div></div></section>'+
 '<section class="wd-card"><h3>4. Withdrawal History</h3><div class="wd-detail-grid"><div><span>First Withdrawal Date</span><b>'+dt(first)+'</b></div><div><span>Total Requests</span><b>'+hist.length+'</b></div><div><span>Approved Requests</span><b>'+approved+'</b></div><div><span>Rejected Requests</span><b>'+rejected+'</b></div></div>'+history+'</section>'+
 '<section class="wd-card"><h3>5. Current Withdrawal Request</h3><div class="wd-detail-grid"><div><span>Request ID</span><b>'+esc(w.id)+'</b></div><div><span>Status</span><b>'+esc(w.status.toUpperCase())+'</b></div><div><span>Amount</span><b>'+fmt(w.amount,8)+' '+esc(w.asset==='USD'?'USDT':w.asset)+'</b></div><div><span>Network</span><b>'+esc(w.network||w.withdrawal_method)+'</b></div></div>'+
 (w.status==='pending'?'<div class="wd-actions"><button type="button" class="wd-secondary" data-wd-ok="'+esc(w.id)+'">OK · View Withdraw Details</button><button type="button" class="wd-danger" data-wd-reject="'+esc(w.id)+'">Reject</button></div>':'')+
 (w.status==='approved'?'<div class="wd-note">Accepted for manual payout. Do not mark completed until the transfer is made and its reference is recorded.</div><label>TX Hash / Payment Reference</label><input id="wdTxHash" type="text" maxlength="160" placeholder="'+(w.network==='BEP20'?'0x + 64 hexadecimal characters':'Enter payment reference')+'"><button type="button" class="wd-primary" data-wd-complete="'+esc(w.id)+'">Submit TX Hash & Complete</button>':'')+
 (w.status==='completed'?'<div class="wd-note">Completed · Reference: '+esc(w.tx_hash||'—')+' · '+dt(w.completed_at)+'</div>':'')+
 (w.status==='rejected'?'<div class="wd-note">Rejected · '+esc(w.admin_note||'No reason provided')+'</div>':'')+'</section>';
}
async function showRequestApproval(id){
 var host=$('hwcWithdrawRequestDetail'),q=await db.from('withdrawal_requests').select('id,asset,amount,network,destination,fee_amount,net_amount,status,withdrawal_method').eq('id',id).maybeSingle();
 if(q.error||!q.data)return say(q.error?q.error.message:'Request not found.');var w=q.data;if(w.status!=='pending')return say('This request has already been reviewed.');
 host.insertAdjacentHTML('beforeend','<section class="wd-card"><h3>Withdraw Details · OK</h3><div class="wd-detail-grid"><div><span>Network</span><b>'+esc(w.network||w.withdrawal_method)+'</b></div><div><span>Wallet Address</span><b>'+esc(w.destination)+'</b></div><div><span>Withdrawal Amount</span><b>'+fmt(w.amount,8)+' '+esc(w.asset==='USD'?'USDT':w.asset)+'</b></div><div><span>Withdrawal Fee</span><b>'+fmt(w.fee_amount,8)+'</b></div><div><span>Net Amount</span><b>'+fmt(w.net_amount,8)+'</b></div></div><div class="wd-actions"><button class="wd-secondary" type="button" data-wd-copy="'+esc(w.destination)+'">Copy Address</button><button class="wd-primary" type="button" data-wd-accept="'+esc(w.id)+'">Accept for Manual Transfer</button></div></section>');
}
async function rejectRequest(id){var reason=prompt('Enter the reason for rejecting this withdrawal request:');if(reason===null)return;if(!reason.trim())return say('A rejection reason is required.');var q=await db.rpc('hwc_review_financial_request',{p_request_type:'withdrawal',p_request_id:id,p_decision:'rejected',p_admin_note:reason.trim()});if(q.error)return say(q.error.message);say('Request rejected. Reserved funds were released.');await loadRequests();}
async function acceptRequest(id){if(!confirm('Accept for manual payout? It will not be marked paid until the TX Hash is submitted.'))return;var q=await db.rpc('hwc_review_financial_request',{p_request_type:'withdrawal',p_request_id:id,p_decision:'approved',p_admin_note:'Accepted for manual payout; waiting for transaction reference.'});if(q.error)return say(q.error.message);say('Accepted. Make the payout manually, then submit its TX Hash.');await loadRequests();await openRequest(id);}
async function completeRequest(id){var tx=$('wdTxHash').value.trim();if(!tx)return say('TX Hash / payment reference is required.');var q=await db.rpc('hwc_admin_complete_withdrawal',{p_request_id:id,p_tx_hash:tx});if(q.error)return say(q.error.message);say('Withdrawal completed after the payout reference was recorded.');await loadRequests();await openRequest(id);}
function findWithdrawTile(){
 var dash=$('dashboard');if(!dash)return;var nodes=dash.querySelectorAll('button,a,[role="button"],.dash-tile,.menu-item,.dashboard-item,.dash-card,.menu-card'),found=null;
 nodes.forEach(function(el){if(found||el.closest('#adminPanel'))return;var a=(el.getAttribute('data-action')||'').trim().toLowerCase(),t=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();if(a==='withdraw'||a==='withdrawal'||/^withdraw(?:al)?(?:\\s|$)/i.test(t))found=el;});
 if(found){found.setAttribute('data-hwc-withdraw-open','1');return;}
 var grid=dash.querySelector('.dash-grid,.dashboard-grid,.menu-grid,.dash-cards')||dash.querySelector('.dash-shell')||$('dashboardMain');
 if(grid&&!grid.querySelector('[data-hwc-withdraw-open]')){var b=document.createElement('button');b.type='button';b.className='dash-tile hwc-withdraw-dashboard-tile';b.dataset.hwcWithdrawOpen='1';b.innerHTML='<span aria-hidden="true">⬇</span><span>Withdraw</span>';grid.appendChild(b);}
}
window.openHwcWithdrawPage=renderWithdraw;
document.addEventListener('click',function(e){
 var el=e.target&&e.target.closest?e.target.closest('[data-hwc-withdraw-open]'):null;if(el){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();renderWithdraw().catch(function(err){console.error('HEWAD Withdraw failed to render:',err);showUserPage('Withdraw','<div class="wd-card wd-note">Withdraw could not be opened. Please refresh and try again. '+esc(err&&err.message||'')+'</div>');});return;}
 el=e.target.closest('[data-hwc-withdraw-admin]');if(el){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(!isAdmin())return say('Withdraw Management permission required.');el.dataset.hwcWithdrawAdmin==='settings'?loadSettings():loadRequests();return;}
 el=e.target.closest('[data-wd-back]');if(el){e.preventDefault();e.stopImmediatePropagation();adminBack();return;}
 el=e.target.closest('[data-wd-save]');if(el){e.preventDefault();e.stopImmediatePropagation();saveSettings(el.dataset.wdSave);return;}
 el=e.target.closest('[data-wd-open]');if(el){e.preventDefault();e.stopImmediatePropagation();openRequest(el.dataset.wdOpen);return;}
 el=e.target.closest('[data-wd-ok]');if(el){e.preventDefault();e.stopImmediatePropagation();showRequestApproval(el.dataset.wdOk);return;}
 el=e.target.closest('[data-wd-reject]');if(el){e.preventDefault();e.stopImmediatePropagation();rejectRequest(el.dataset.wdReject);return;}
 el=e.target.closest('[data-wd-accept]');if(el){e.preventDefault();e.stopImmediatePropagation();acceptRequest(el.dataset.wdAccept);return;}
 el=e.target.closest('[data-wd-complete]');if(el){e.preventDefault();e.stopImmediatePropagation();completeRequest(el.dataset.wdComplete);return;}
 el=e.target.closest('[data-wd-copy]');if(el){e.preventDefault();e.stopImmediatePropagation();var t=el.dataset.wdCopy;if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){say('Wallet address copied.');}).catch(function(){say('Copy failed. Please copy manually.');});else say('Copy is unavailable in this browser.');return;}
},true);
if(home&&window.MutationObserver)new MutationObserver(addAdminMenu).observe(home,{childList:true,subtree:true});
window.addEventListener('hewad-admin-authorized',addAdminMenu);
window.addEventListener('load',addAdminMenu);
if(window.MutationObserver&&$('dashboard'))new MutationObserver(findWithdrawTile).observe($('dashboard'),{childList:true,subtree:true});
findWithdrawTile();addAdminMenu();
})();