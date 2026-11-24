/* HEWAD COIN — admin user details and notification center enhancements.
   Loaded after the existing KYC integration. Does not replace or alter KYC workflows. */
(function(){
'use strict';
var db=window.hwcSupabase;
var $=function(id){return document.getElementById(id)};
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var fmt=function(v,d){return Number(v||0).toLocaleString(undefined,{minimumFractionDigits:d||0,maximumFractionDigits:d||0})};
var date=function(v){return v?new Date(v).toLocaleString():'—'};
var isAdmin=function(){return !!window.hwcCurrentUser && window.HEWAD_USER_ROLE==='admin'};
var activeDetail=null,notificationBusy=false,lastNotificationLoad=0,channel=null;
if(!db)return;

var css=document.createElement('style');
css.textContent=`
.hwc-admin-extra{color:#f4f1e9}
.hwc-admin-extra .hwc-admin-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}
.hwc-admin-extra .hwc-admin-btn{border:1px solid #806329;border-radius:10px;background:#1b1a17;color:#f5d987;padding:9px 12px;font-weight:700}
.hwc-admin-extra .hwc-admin-btn.primary{background:#d8ad3e;color:#201806;border-color:#d8ad3e}
.hwc-admin-extra .hwc-admin-btn.danger{border-color:#a84949;color:#ffbaba}
.hwc-admin-extra .hwc-admin-card{background:linear-gradient(145deg,#191b20,#101216);border:1px solid #49402d;border-radius:13px;padding:12px;margin:10px 0}
.hwc-admin-extra .hwc-admin-card h3{font-size:14px;color:#e8c66f;margin:0 0 10px}
.hwc-admin-extra .hwc-admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.hwc-admin-extra .hwc-admin-field{background:#0c0e12;border:1px solid #30333a;border-radius:9px;padding:9px;min-width:0}
.hwc-admin-extra .hwc-admin-field small{display:block;color:#aeb0b8;font-size:10px;margin-bottom:4px}
.hwc-admin-extra .hwc-admin-field b{font-size:12px;overflow-wrap:anywhere}
.hwc-admin-extra input,.hwc-admin-extra textarea,.hwc-admin-extra select{box-sizing:border-box;width:100%;background:#0c0e12;color:#fff;border:1px solid #484b52;border-radius:9px;padding:10px;margin:5px 0 10px}
.hwc-admin-extra .hwc-admin-row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #33363d;font-size:12px}
.hwc-admin-extra .hwc-admin-muted{color:#aeb0b8;font-size:11px;line-height:1.5}
.hwc-admin-extra .hwc-admin-photo{width:100%;max-height:220px;object-fit:contain;background:#050607;border:1px solid #655020;border-radius:8px}
.hwc-admin-extra .hwc-admin-pill{display:inline-block;padding:4px 8px;border-radius:20px;background:#39301d;color:#f3d37d;font-size:10px}
@media(max-width:390px){.hwc-admin-extra .hwc-admin-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(css);

function field(label,value){return '<div class="hwc-admin-field"><small>'+esc(label)+'</small><b>'+esc(value==null||value===''?'—':value)+'</b></div>'}
function card(title,body){return '<section class="hwc-admin-card"><h3>'+esc(title)+'</h3>'+body+'</section>'}
function ensureDetailHost(){
 var view=$('adminUsers');if(!view)return null;
 var host=$('hwcAdminUserDetails');
 if(!host){host=document.createElement('div');host.id='hwcAdminUserDetails';host.className='hwc-admin-extra';host.hidden=true;view.appendChild(host)}
 return host;
}
function decorateUserCards(){
 if(!isAdmin())return;
 var host=$('hwcAdminUsersList');if(!host)return;
 var detail=$('hwcAdminUserDetails');if(detail)detail.hidden=true;
 host.querySelectorAll('article.admin-status-card').forEach(function(article){
  var select=article.querySelector('[data-user-status]');if(!select||article.querySelector('[data-hwc-user-details]'))return;
  var b=document.createElement('button');b.type='button';b.className='hwc-admin-btn';b.textContent='View Details';b.dataset.hwcUserDetails=select.getAttribute('data-user-status');
  b.style.marginTop='8px';article.appendChild(b);
  b.addEventListener('click',function(){openUserDetails(b.dataset.hwcUserDetails,article)});
 });
 var list=$('hwcAdminUsersList');if(list)list.hidden=false;
 var detail=$('hwcAdminUserDetails');if(detail)detail.hidden=true;
}
async function signedPhoto(path,label){
 if(!path)return '<div class="hwc-admin-muted">'+esc(label)+': Not uploaded</div>';
 var r=await db.storage.from('kyc-documents').createSignedUrl(path,600);
 if(r.error)return '<div class="hwc-admin-muted">'+esc(label)+': Image unavailable</div>';
 return '<div><div class="hwc-admin-muted">'+esc(label)+'</div><a href="'+esc(r.data.signedUrl)+'" target="_blank" rel="noopener"><img class="hwc-admin-photo" src="'+esc(r.data.signedUrl)+'" alt="'+esc(label)+'"></a></div>';
}
async function openUserDetails(id,article){
 if(!isAdmin()||!id)return;
 activeDetail=id;
 var list=$('hwcAdminUsersList'),host=ensureDetailHost();if(!host)return;
 if(list)list.hidden=true;host.hidden=false;host.innerHTML='<p>Loading user details…</p>';
 var results=await Promise.all([
  db.from('profiles').select('id,first_name,last_name,username,mobile_number,country,province,card_number,account_status,kyc_status,email_verified,created_at,referral_code,referred_by,avatar_url').eq('id',id).maybeSingle(),
  db.from('wallets').select('balance_hwc,balance_usd,balance_afn,reserved_hwc,staked_hwc').eq('user_id',id).maybeSingle(),
  db.from('kyc_applications').select('id,document_type,national_id_number,date_of_birth,country,province,district,mobile_number,passport_expiry_date,front_document_path,back_document_path,selfie_document_path,status,rejection_reason,created_at,reviewed_at').eq('user_id',id).order('created_at',{ascending:false}).limit(1).maybeSingle(),
  db.from('wallet_transactions').select('id,asset,amount,transaction_type,status,description,reference,created_at').eq('user_id',id).order('created_at',{ascending:false}).limit(25),
  db.from('profiles').select('id,first_name,last_name,kyc_status,created_at').eq('referred_by',id).order('created_at',{ascending:false}).limit(30),
  db.rpc('admin_get_user_balance_history',{p_user_id:id})
 ]);
 var p=results[0].data,w=results[1].data||{},k=results[2].data,tx=results[3].data||[],refs=results[4].data||[],hist=results[5].data||[];
 if(results[0].error||!p){host.innerHTML='<p class="hwc-admin-muted">Could not load this user. '+esc(results[0].error?.message||'User not found')+'</p><button class="hwc-admin-btn" id="hwcUserBack">Back to users</button>';host.querySelector('#hwcUserBack').onclick=decorateUserCards;return}
 var fullName=[p.first_name,p.last_name].filter(Boolean).join(' ')||p.username||'Member';
 var emailText=article?((article.querySelector('p')?.innerText||'').split('·')[0].trim()):'';
 var kycPhotos='';
 if(k){kycPhotos='<div class="hwc-admin-grid">'+await signedPhoto(k.front_document_path,'Front document')+await signedPhoto(k.back_document_path,'Back document')+await signedPhoto(k.selfie_document_path,'Selfie')+'</div>'}
 var statusOptions=['pending','active','suspended'].map(function(s){return '<option value="'+s+'" '+(p.account_status===s?'selected':'')+'>'+s+'</option>'}).join('');
 host.innerHTML=
 '<div class="hwc-admin-toolbar"><button class="hwc-admin-btn" id="hwcUserBack">← Back to users</button><span class="hwc-admin-pill">User details</span></div>'+
 card('Personal Information','<div class="hwc-admin-grid">'+field('Full name',fullName)+field('Email',emailText||'See user list')+field('Mobile',p.mobile_number)+field('Country',p.country)+field('Province',p.province)+field('User ID',p.id)+field('Registered',date(p.created_at))+field('Referral code',p.referral_code)+field('Member card',p.card_number)+'</div>')+
 card('Account Management','<div class="hwc-admin-grid">'+field('Account status',p.account_status)+field('KYC status',p.kyc_status)+'</div><label class="hwc-admin-muted">Change account status</label><select id="hwcDetailStatus">'+statusOptions+'</select><button class="hwc-admin-btn primary" id="hwcSaveStatus">Save status</button>')+
 card('Security Information','<div class="hwc-admin-grid">'+field('Email verified',p.email_verified?'Yes':'No')+field('Account created',date(p.created_at))+field('Account status',p.account_status)+field('KYC status',p.kyc_status)+'</div>')+
 card('Wallet Balances','<div class="hwc-admin-grid">'+field('HWC',fmt(w.balance_hwc,4))+field('USDT',fmt(w.balance_usd,2))+field('AFN',fmt(w.balance_afn,2))+field('Reserved / staked HWC',fmt(Number(w.reserved_hwc||0)+Number(w.staked_hwc||0),4))+'</div><div class="hwc-admin-toolbar"><button class="hwc-admin-btn primary" id="hwcLoadBalance">Load HWC</button><button class="hwc-admin-btn danger" id="hwcDeductBalance">Deduct HWC</button></div><div id="hwcBalanceForm"></div>')+
 card('KYC Information',k?'<div class="hwc-admin-grid">'+field('Document type',k.document_type)+field('Document / Passport ID',k.national_id_number)+field('Date of birth',k.date_of_birth)+field('Country',k.country)+field('Province',k.province)+field('District',k.district)+field('Mobile',k.mobile_number)+field('Passport expiry',k.passport_expiry_date)+field('KYC status',k.status)+field('Submitted',date(k.created_at))+field('Reviewed',date(k.reviewed_at))+field('Rejection reason',k.rejection_reason)+'</div>'+kycPhotos:'<p class="hwc-admin-muted">No KYC application found.</p>')+
 card('Invited Users ('+refs.length+')',refs.length?refs.map(function(x){return '<div class="hwc-admin-row"><span>'+esc([x.first_name,x.last_name].filter(Boolean).join(' ')||'Member')+'</span><span>'+esc(x.kyc_status)+' · '+date(x.created_at)+'</span></div>'}).join(''):'<p class="hwc-admin-muted">No invited users.</p>')+
 card('Transaction History',tx.length?tx.map(function(t){return '<div class="hwc-admin-row"><span><b>'+esc(t.description||t.transaction_type)+'</b><br><span class="hwc-admin-muted">'+esc(t.transaction_type)+' · '+esc(t.status)+' · '+date(t.created_at)+'</span></span><b>'+(Number(t.amount)>0?'+':'')+fmt(t.amount,4)+' '+esc(t.asset)+'</b></div>'}).join(''):'<p class="hwc-admin-muted">No transactions found.</p>')+
 card('Balance Adjustment History',hist.length?hist.map(function(h){return '<div class="hwc-admin-row"><span>'+esc(h.direction)+' '+fmt(h.amount,4)+' '+esc(h.asset)+'<br><span class="hwc-admin-muted">'+esc(h.note)+' · '+date(h.created_at)+'</span></span><b>'+fmt(h.balance_before,4)+' → '+fmt(h.balance_after,4)+'</b></div>'}).join(''):'<p class="hwc-admin-muted">No balance adjustments yet.</p>')+
 card('Admin Notes','<div id="hwcAdminNotesList"><p class="hwc-admin-muted">Loading notes…</p></div><textarea id="hwcAdminNoteInput" rows="3" maxlength="2000" placeholder="Internal note for administrators only"></textarea><button class="hwc-admin-btn primary" id="hwcAddAdminNote">Add note</button>');
 async function refreshAdminNotes(){
  var noteHost=host.querySelector('#hwcAdminNotesList');if(!noteHost)return;
  var nr=await db.rpc('admin_get_user_notes',{p_user_id:id});
  noteHost.innerHTML=nr.error?'<p class="hwc-admin-muted">Notes unavailable until the admin-notes database migration is applied.</p>':(nr.data||[]).length?nr.data.map(function(n){return '<div class="hwc-admin-row"><span>'+esc(n.note)+'<br><span class="hwc-admin-muted">'+esc(n.admin_id)+' · '+date(n.created_at)+'</span></span></div>'}).join(''):'<p class="hwc-admin-muted">No admin notes yet.</p>';
 }
 host.querySelector('#hwcAddAdminNote').onclick=async function(){
  var input=host.querySelector('#hwcAdminNoteInput'),note=input.value.trim();if(!note){window.showNotice?.('Write a note first.');return}
  var b=this;b.disabled=true;var nr=await db.rpc('admin_add_user_note',{p_user_id:id,p_note:note});b.disabled=false;
  if(nr.error){window.showNotice?.(nr.error.message);return}
  input.value='';refreshAdminNotes();
 };
 refreshAdminNotes();
 host.querySelector('#hwcUserBack').onclick=function(){host.hidden=true;if(list)list.hidden=false;activeDetail=null};
 host.querySelector('#hwcSaveStatus').onclick=async function(){
  var b=this;b.disabled=true;var q=await db.rpc('admin_set_account_status',{p_user_id:id,p_status:host.querySelector('#hwcDetailStatus').value});
  window.showNotice?.(q.error?q.error.message:'Account status updated.');b.disabled=false;if(!q.error)openUserDetails(id,article);
 };
 function showBalanceForm(direction){
  var f=host.querySelector('#hwcBalanceForm');
  f.innerHTML='<label class="hwc-admin-muted">Amount (HWC)</label><input id="hwcBalanceAmount" type="number" min="0.00000001" step="0.00000001" placeholder="Enter amount"><label class="hwc-admin-muted">Reason (required)</label><textarea id="hwcBalanceReason" rows="2" maxlength="500" placeholder="Enter reason"></textarea><button class="hwc-admin-btn primary" id="hwcBalanceConfirm">Confirm '+(direction==='add'?'load':'deduction')+'</button>';
  f.querySelector('#hwcBalanceConfirm').onclick=async function(){
   var amount=Number(f.querySelector('#hwcBalanceAmount').value),note=f.querySelector('#hwcBalanceReason').value.trim();
   if(!Number.isFinite(amount)||amount<=0||!note){window.showNotice?.('Enter a valid amount and reason.');return}
   if(!confirm((direction==='add'?'Add ':'Deduct ')+fmt(amount,8)+' HWC '+(direction==='add'?'to':'from')+' this account?'))return;
   var b=this;b.disabled=true;
   var q=await db.rpc('admin_adjust_user_balance',{p_user_id:id,p_asset:'HDC',p_direction:direction,p_amount:amount,p_note:note});
   if(q.error){window.showNotice?.(q.error.message);b.disabled=false;return}
   window.showNotice?.('Balance updated: '+fmt(q.data?.balance_before,4)+' → '+fmt(q.data?.balance_after,4)+' HWC');
   openUserDetails(id,article);
  };
 }
 host.querySelector('#hwcLoadBalance').onclick=function(){showBalanceForm('add')};
 host.querySelector('#hwcDeductBalance').onclick=function(){showBalanceForm('subtract')};
}

async function loadAdminNotifications(){
 if(!isAdmin()||notificationBusy)return;
 notificationBusy=true;lastNotificationLoad=Date.now();
 var view=$('adminNotifications');if(!view){notificationBusy=false;return}
 var host=$('hwcAdminNotifications');if(!host){host=document.createElement('div');host.id='hwcAdminNotifications';view.appendChild(host)}
 host.classList.add('hwc-admin-extra');host.innerHTML='<p>Loading notifications…</p>';
 var r=await db.from('notifications').select('id,title,body,notification_type,is_read,created_at').eq('user_id',window.hwcCurrentUser.id).order('created_at',{ascending:false}).limit(100);
 if(r.error){host.innerHTML='<p class="hwc-admin-muted">Could not load notifications: '+esc(r.error.message)+'</p>';notificationBusy=false;return}
 var rows=r.data||[],unread=rows.filter(function(n){return !n.is_read}).length;
 host.innerHTML='<div class="hwc-admin-toolbar"><span class="hwc-admin-pill">'+unread+' unread</span><button class="hwc-admin-btn" id="hwcMarkAllRead">Mark all as read</button><button class="hwc-admin-btn" id="hwcRefreshNotifications">Refresh</button></div>'+
 (rows.length?rows.map(function(n){return '<article class="hwc-admin-card" data-notification="'+esc(n.id)+'"><div class="hwc-admin-row"><b>'+esc(n.title)+'</b><span class="hwc-admin-pill">'+(n.is_read?'Read':'New')+'</span></div><p>'+esc(n.body)+'</p><div class="hwc-admin-toolbar"><span class="hwc-admin-muted">'+esc(n.notification_type)+' · '+date(n.created_at)+'</span>'+(n.is_read?'':'<button class="hwc-admin-btn" data-mark-read="'+esc(n.id)+'">Mark read</button>')+'</div></article>'}).join(''):'<p class="hwc-admin-muted">No notifications yet.</p>')+
 '<p class="hwc-admin-muted">In-app notification history is stored in your admin account. Background mobile push requires the secure push-server keys and service worker setup.</p>';
 host.querySelector('#hwcRefreshNotifications').onclick=loadAdminNotifications;
 host.querySelector('#hwcMarkAllRead').onclick=async function(){var b=this;b.disabled=true;var q=await db.from('notifications').update({is_read:true}).eq('user_id',window.hwcCurrentUser.id).eq('is_read',false);b.disabled=false;if(q.error)window.showNotice?.(q.error.message);else loadAdminNotifications()};
 host.querySelectorAll('[data-mark-read]').forEach(function(b){b.onclick=async function(){var q=await db.from('notifications').update({is_read:true}).eq('id',b.dataset.markRead).eq('user_id',window.hwcCurrentUser.id);if(q.error)window.showNotice?.(q.error.message);else loadAdminNotifications()}});
 notificationBusy=false;
}
function watchAdminViews(){
 var users=$('adminUsers');
 if(users){var mo=new MutationObserver(function(mutations){if(!users.hidden&&mutations.some(function(m){return m.target.closest&&m.target.closest('#hwcAdminUsersList')}))decorateUserCards()});mo.observe(users,{childList:true,subtree:true});}
 var notes=$('adminNotifications');
 if(notes){var no=new MutationObserver(function(){if(!notes.hidden&&Date.now()-lastNotificationLoad>1200)loadAdminNotifications()});no.observe(notes,{attributes:true,attributeFilter:['hidden']});}
}
function start(){
 if(!isAdmin())return;
 watchAdminViews();
 var notes=$('adminNotifications');if(notes&&!notes.hidden)loadAdminNotifications();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('focus',function(){if(isAdmin()&&$('adminNotifications')&&!$('adminNotifications').hidden)loadAdminNotifications()});
})();