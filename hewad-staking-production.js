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
var me=function(){return typeof hwcCurrentUser!=='undefined'?hwcCurrentUser:null;};
var admin=function(){return window.HEWAD_USER_ROLE==='admin'&&!!me();};
function showUserPage(title,html){
 var dash=$('dashboard'),page=$('modulePage'),card=$('memberCard');
 if(!dash||!page){say('Staking page is not available.');return;}
 dash.querySelectorAll('.dash-subpage').forEach(function(x){x.classList.remove('active');});
 if(card)card.hidden=true;page.hidden=false;page.classList.add('active');
 page.innerHTML='<button class="dash-back-home" id="hwcStakeBack" type="button">← Dashboard</button><h2>'+esc(title)+'</h2><div class="hwc-module-content"><div class="hwc-staking-live">'+html+'</div></div>';
 $('hwcStakeBack').onclick=function(){page.classList.remove('active');page.hidden=true;if($('dashboardMain'))$('dashboardMain').classList.add('active');if(card)card.hidden=false;window.scrollTo(0,0);};
 window.scrollTo(0,0);
}
async function renderStaking(){
 var u=me();if(!u){say('Please sign in first.');return;}
 showUserPage('Digital Staking','<div class="dash-subpage-card">Loading your staking account…</div>');
 var rs=await Promise.all([
  db.from('staking_plans').select('id,name,min_amount,max_amount,duration_days').eq('active',true).eq('asset','HDC').eq('duration_days',360).order('min_amount'),
  db.from('staking_positions').select('id,plan_name,principal,status,started_at,matures_at,usd_value_at_stake,unlock_requested_at,paid_at').eq('user_id',u.id).neq('status','reset').order('started_at',{ascending:false}).limit(100),
  db.from('wallets').select('balance_hwc,reserved_hwc,staked_hwc').eq('user_id',u.id).maybeSingle(),
  db.from('staking_daily_results').select('id,position_id,result_type,percent,amount,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(1000)
 ]);
 var err=rs.find(function(x){return x.error;});if(err){showUserPage('Digital Staking','<div class="dash-subpage-card hwc-error">'+esc(err.error.message)+'</div>');return;}
 var plans=rs[0].data||[],positions=rs[1].data||[],wallet=rs[2].data||{},history=rs[3].data||[];
 var cutoff=Date.now()-3*86400000,recent=history.filter(function(x){return new Date(x.created_at).getTime()>=cutoff;}),sums={};
 history.forEach(function(x){var s=sums[x.position_id]||(sums[x.position_id]={profit:0,loss:0});s[x.result_type==='profit'?'profit':'loss']+=Number(x.amount||0);});
 var profit=history.filter(function(x){return x.result_type==='profit';}).reduce(function(a,x){return a+Number(x.amount||0);},0);
 var loss=history.filter(function(x){return x.result_type==='loss';}).reduce(function(a,x){return a+Number(x.amount||0);},0);
 var available=Math.max(0,Number(wallet.balance_hwc||0)-Number(wallet.reserved_hwc||0)),plan=plans[0];
 var planHtml=plans.length?plans.map(function(p,i){return '<label class="hwc-plan"><input type="radio" name="plan_id" value="'+esc(p.id)+'" '+(i===0?'checked':'')+' required><span><strong>'+esc(p.name)+'</strong><small>HDC · Fixed 360 days</small><small>Minimum: '+money(p.min_amount)+' · Maximum: '+money(p.max_amount)+'</small></span></label>';}).join(''):'<p class="hwc-empty">No active 360-day HDC plan is available.</p>';
 var posHtml=positions.length?positions.map(function(p){
  var s=sums[p.id]||{profit:0,loss:0},remaining=Math.max(0,Math.ceil((new Date(p.matures_at).getTime()-Date.now())/86400000));
  var status=p.status==='active'?(remaining===0?'Matured':'Active'):p.status==='unlock_pending'?'Pending admin approval':p.status==='blocked'?'Blocked by admin':p.status==='completed'?'Unlocked':p.status;
  var action=p.status==='active'&&remaining===0?'<button type="button" class="hwc-primary" data-stake-unlock="'+esc(p.id)+'">Request Unlock</button>':p.status==='unlock_pending'?'<span class="hwc-status-pill pending">Unlock request pending</span>':p.status==='blocked'?'<span class="hwc-status-pill rejected">Blocked by admin</span>':p.status==='completed'?'<span class="hwc-status-pill approved">Principal returned</span>':'';
  var elapsed=Math.max(0,Math.min(360,360-remaining));
  return '<article class="hwc-record"><div><strong>'+esc(p.plan_name||'360-Day HDC Position')+'</strong><small>'+money(p.principal)+' · '+esc(status)+'</small><small>Started: '+esc(dt(p.started_at))+' · Matures: '+esc(dt(p.matures_at))+'</small><small>USD value at stake: '+(p.usd_value_at_stake==null?'Rate unavailable':'$'+fmt(p.usd_value_at_stake,8))+'</small><small>Profit: <b class="hwc-stake-profit">+'+fmt(s.profit)+' HDC</b> · Loss: <b class="hwc-stake-loss">−'+fmt(s.loss)+' HDC</b> · Net: '+fmt(s.profit-s.loss)+' HDC</small><div class="hwc-stake-progress"><span style="width:'+(p.status==='completed'?100:elapsed/360*100)+'%"></span></div>'+action+'</div></article>';
 }).join(''):'<p class="hwc-empty">You do not have any staking positions yet.</p>';
 var histHtml=recent.length?'<div class="hwc-record-list">'+recent.map(function(x){return '<article class="hwc-record"><div><strong>'+esc(x.result_type==='profit'?'Daily Profit':'Daily Loss')+'</strong><small>'+esc(dt(x.created_at))+' · '+fmt(x.percent,4)+'%</small></div><b class="'+(x.result_type==='profit'?'hwc-stake-profit':'hwc-stake-loss')+'">'+(x.result_type==='profit'?'+':'−')+fmt(x.amount)+' HDC</b></article>';}).join('')+'</div>':'<p class="hwc-empty">No profit or loss records in the last three days.</p>';
 var html='<section class="hwc-stake-hero"><div><span class="hwc-stake-orb">✧</span><div><h3>Digital Staking</h3><p>Stake HDC and follow your daily results</p></div></div><span class="hwc-stake-tag">360 DAY PLAN</span></section>'+
 '<div class="hwc-stake-notice"><strong>Islamic Mudarabah · Variable profit and loss</strong><p>Profit is based on the original position amount. Loss is recorded only in the position history and never deducted from your wallet balance or original principal. Returns are not guaranteed.</p></div>'+
 '<div class="hwc-stake-stats"><div><small>My Staked HDC</small><b>'+fmt(wallet.staked_hwc)+' HDC</b></div><div><small>Available HDC</small><b>'+fmt(available)+' HDC</b></div><div><small>Total Profit</small><b class="hwc-stake-profit">+'+fmt(profit)+' HDC</b></div><div><small>Total Loss</small><b class="hwc-stake-loss">−'+fmt(loss)+' HDC</b></div></div>'+
 '<section class="dash-subpage-card"><h3>Start a New 360-Day Position</h3>'+(plans.length?'<form id="hwcStakeProductionForm" class="hwc-form">'+planHtml+'<label>Amount (HDC)<input name="amount" type="number" min="'+esc(plan.min_amount)+'" max="'+Math.min(available,Number(plan.max_amount))+'" step="0.00000001" placeholder="Minimum '+fmt(plan.min_amount)+' HDC" required></label><p class="hwc-muted">Minimum stake: '+money(plan.min_amount)+'. Each position is locked for exactly 360 days.</p><button class="hwc-primary" type="submit" '+(available<Number(plan.min_amount)?'disabled':'')+'>Start Staking</button></form>':'<p class="hwc-empty">The administrator has not published an active staking plan.</p>')+'</section>'+
 '<section class="dash-subpage-card"><h3>My Positions ('+positions.length+')</h3>'+posHtml+'</section>'+
 '<section class="dash-subpage-card"><h3>Profit &amp; Loss History · Last 3 Days</h3>'+histHtml+'</section>';
 showUserPage('Digital Staking',html);
 var form=$('hwcStakeProductionForm');
 if(form)form.addEventListener('submit',async function(e){e.preventDefault();var fd=new FormData(form),btn=form.querySelector('button[type=submit]');btn.disabled=true;try{var q=await db.rpc('hwc_start_staking',{p_plan_id:fd.get('plan_id'),p_amount:Number(fd.get('amount'))});if(q.error)throw q.error;say('Your 360-day HDC position has been created.');await renderStaking();}catch(ex){say(ex.message||'Could not start staking.');}finally{if(btn.isConnected)btn.disabled=false;}});
}
document.addEventListener('click',function(e){
 var tile=e.target.closest('[data-action="Staking"]');
 if(tile){e.preventDefault();e.stopImmediatePropagation();renderStaking();return;}
 var un=e.target.closest('[data-stake-unlock]');
 if(un){e.preventDefault();e.stopImmediatePropagation();if(!confirm('Submit an unlock request? Your HDC will return only after administrator approval.'))return;un.disabled=true;db.rpc('hwc_request_staking_unlock',{p_position_id:un.dataset.stakeUnlock}).then(function(r){if(r.error)throw r.error;say('Unlock request sent to the administrator.');return renderStaking();}).catch(function(ex){say(ex.message||'Unlock request failed.');un.disabled=false;});}
},true);
if(typeof window.openHwcModule==='function'){var oldOpen=window.openHwcModule;window.openHwcModule=async function(action){if(action==='Staking')return renderStaking();return oldOpen.apply(this,arguments);};}

/* Admin: Position Management and Profit Distribution */
var panel=$('adminPanel'),root=null,currentStatus='unlock_pending',resultType='profit';
function adminRoot(){if(!panel)return null;if(!root){root=$('hwcStakingAdminView');if(!root){root=document.createElement('section');root.id='hwcStakingAdminView';root.className='admin-view hwc-admin-page';panel.appendChild(root);}}return root;}
function addMenu(){
 if(!admin())return;var home=$('adminHome'),grid=home&&home.querySelector('.hwc-admin-grid');if(!grid)return;
 if(!grid.querySelector('[data-hwc-staking-admin="positions"]')){var a=document.createElement('button');a.type='button';a.className='hwc-admin-option';a.dataset.hwcStakingAdmin='positions';a.innerHTML='<span class="ico">🔐</span><span><strong>Position Management</strong><small>Pending, blocked, unlocked and reset staking positions</small></span><span class="arrow">›</span>';grid.appendChild(a);}
 if(!grid.querySelector('[data-hwc-staking-admin="distribution"]')){var b=document.createElement('button');b.type='button';b.className='hwc-admin-option';b.dataset.hwcStakingAdmin='distribution';b.innerHTML='<span class="ico">📈</span><span><strong>Profit Distribution</strong><small>Daily HDC profit, loss and transaction records</small></span><span class="arrow">›</span>';grid.appendChild(b);}
}
function showAdmin(html){var r=adminRoot();if(!r)return;panel.querySelectorAll('.admin-view').forEach(function(x){x.hidden=true;x.style.display='none';});r.hidden=false;r.style.display='block';r.innerHTML=html;window.scrollTo(0,0);}
function backBtn(){return '<button type="button" class="hwc-admin-back" data-hwc-staking-back>‹ Control Panel</button>';}
function kv(k,v){return '<div><span>'+esc(k)+'</span><b>'+esc(v==null||v===''?'—':v)+'</b></div>';}
async function landing(){
 showAdmin(backBtn()+'<h2>Position Management</h2><p class="admin-description">All positions are shown with complete user and financial information. Every administrator action is saved to the audit history.</p><div class="hwc-admin-card"><h3>Minimum Stake Setting</h3><div id="hwcStakeMinSetting">Loading…</div></div><div class="hwc-admin-grid">'+
 '<button class="hwc-admin-option" data-hwc-pos-status="unlock_pending"><span class="ico">◷</span><span><strong>Pending Position</strong><small>Unlock requests awaiting admin decision</small></span><span class="arrow">›</span></button>'+
 '<button class="hwc-admin-option" data-hwc-pos-status="blocked"><span class="ico">🔒</span><span><strong>Block Position</strong><small>Blocked positions</small></span><span class="arrow">›</span></button>'+
 '<button class="hwc-admin-option" data-hwc-pos-status="completed"><span class="ico">✓</span><span><strong>Unblock Position</strong><small>Approved positions and returned HDC</small></span><span class="arrow">›</span></button>'+
 '<button class="hwc-admin-option" data-hwc-pos-status="reset"><span class="ico">↺</span><span><strong>Reset Position</strong><small>Archived reset positions</small></span><span class="arrow">›</span></button></div>');
 loadMinSetting();
}
async function loadMinSetting(){
 var host=$('hwcStakeMinSetting');if(!host)return;
 var q=await db.from('staking_plans').select('id,name,min_amount,max_amount').eq('active',true).eq('asset','HDC').eq('duration_days',360).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(q.error){host.innerHTML='<p>'+esc(q.error.message)+'</p>';return;}if(!q.data){host.textContent='No active 360-day HDC plan.';return;}
 host.innerHTML='<form id="hwcStakeMinForm"><input type="hidden" name="plan_id" value="'+esc(q.data.id)+'"><label>Minimum stake (HDC)<input name="min_amount" type="number" min="0.00000001" max="'+esc(q.data.max_amount)+'" step="0.00000001" value="'+esc(q.data.min_amount)+'" required></label><p class="admin-description">Current maximum: '+money(q.data.max_amount)+'. Lock duration is fixed at 360 days.</p><button class="hwc-action" type="submit">Save Minimum Stake</button></form>';
 $('hwcStakeMinForm').onsubmit=async function(e){e.preventDefault();var fd=new FormData(e.currentTarget),btn=e.currentTarget.querySelector('button');btn.disabled=true;try{var r=await db.rpc('hwc_admin_set_minimum_stake',{p_plan_id:fd.get('plan_id'),p_min_amount:Number(fd.get('min_amount'))});if(r.error)throw r.error;say('Minimum stake updated.');await loadMinSetting();}catch(ex){say(ex.message);}finally{btn.disabled=false;}};
}
var labels={unlock_pending:'Pending Position',blocked:'Block Position',completed:'Unblock Position',reset:'Reset Position'};
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
 var p=(q.data||{}).position||{},h=(q.data||{}).daily_history||[];
 var user=[kv('Full Name',p.full_name),kv('KYC Status',p.kyc_status),kv('Email Address',p.email),kv('Mobile Number',p.mobile_number),kv('Country',p.country),kv('Referral Code',p.referral_code),kv('Card Number',p.card_number),kv('Available HDC Balance',money(p.balance_hwc)),kv('Staked HDC Balance',money(p.staked_hwc))].join('');
 var pos=[kv('Position ID',p.position_id),kv('Status',p.status),kv('Stake Date',dt(p.started_at)),kv('Stake Amount',money(p.principal)),kv('USD Value at Stake',p.usd_value_at_stake==null?'Unavailable':'$'+fmt(p.usd_value_at_stake,8)),kv('Lock Duration','360 Days'),kv('Maturity Date',dt(p.matures_at)),kv('Unlock Request Date',dt(p.unlock_requested_at)),kv('Total Profit',money(p.total_profit)),kv('Total Loss',money(p.total_loss)),kv('Net Result',money(p.net_result)),kv('Block Date',dt(p.blocked_at)),kv('Reset Date',dt(p.reset_at)),kv('Admin Action',p.review_action),kv('Admin Action Date',dt(p.reviewed_at)),kv('Admin Note',p.review_note),kv('Principal Return Date',dt(p.paid_at))].join('');
 var hist=h.length?'<div style="overflow:auto"><table><thead><tr><th>Date</th><th>Type</th><th>Percent</th><th>Amount</th></tr></thead><tbody>'+h.map(function(x){return '<tr><td>'+esc(dt(x.created_at))+'</td><td>'+esc(x.result_type)+'</td><td>'+fmt(x.percent,4)+'%</td><td>'+money(x.amount)+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="admin-description">No daily results for this position.</p>';
 var acts=p.status==='unlock_pending'?'<div class="hwc-inline"><button class="hwc-action" data-hwc-pos-action="unlock|'+esc(id)+'">UNLOCK / APPROVE</button><button class="hwc-action" data-hwc-pos-action="block|'+esc(id)+'">BLOCK</button><button class="hwc-action" data-hwc-pos-action="reset|'+esc(id)+'">RESET</button></div>':p.status==='blocked'?'<button class="hwc-action" data-hwc-pos-action="unblock|'+esc(id)+'">UNBLOCK &amp; RETURN HDC</button>':'<p class="admin-description">This record is archived / completed and cannot be processed again.</p>';
 showAdmin(backBtn()+'<h2>Position Details</h2><div class="hwc-admin-card"><h3>User Information</h3><div class="hwc-user-summary">'+user+'</div></div><div class="hwc-admin-card"><h3>Position &amp; Financial Information</h3><div class="hwc-user-summary">'+pos+'</div></div><div class="hwc-admin-card"><h3>Daily Profit &amp; Loss History</h3>'+hist+'</div><div class="hwc-admin-card"><h3>Administrator Decision</h3><label>Admin note / reason (optional)<textarea id="hwcPosAdminNote" rows="3" maxlength="1000"></textarea></label>'+acts+'</div>');
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