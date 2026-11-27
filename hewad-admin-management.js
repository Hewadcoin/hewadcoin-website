/* HEWAD COIN — Owner-controlled Admin Management UI. Isolated module; existing business modules are untouched. */
(function(){
'use strict';
var db=window.hwcSupabase || (typeof hwcSupabase !== 'undefined' ? hwcSupabase : null), doc=document, ownerId='2d92f1b7-5134-4026-837f-fb3056923a04';
if(!db){console.error('Admin Management: Supabase client unavailable.');return;}
var perms=[
 ['dashboard','Dashboard'],['all_users','All Users'],['user_management','User Management'],
 ['balance_management','Balance Management'],['deposit_management','Deposit Management'],
 ['withdraw_management','Withdraw Management'],['send_hdc','Send HDC'],
 ['staking_management','Staking Management'],['position_management','Position Management'],
 ['mining_management','Mining Management'],['gift_management','Gift Management'],
 ['referral_management','Referral Management'],['kyc_management','KYC Management'],
 ['transaction_history','Transaction History'],['admin_list','Admin List'],['settings','Settings']
];
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var note=function(m){if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
var owner=false,canList=false,ready=false,currentRows=[],myPermissions=[],homeObserver=null;
var css=doc.createElement('style');css.id='hwc-admin-management-style';
css.textContent=`
#hwcAdminManagement{padding:4px 0 22px;color:#f5f2e8;font-family:inherit}
#hwcAdminManagement .hm-hero{padding:17px;border:1px solid #665126;border-radius:16px;background:radial-gradient(circle at 90% 0%,#55421d 0,transparent 48%),linear-gradient(135deg,#20232a,#111319);margin:10px 0}
#hwcAdminManagement .hm-kicker{font-size:9px;letter-spacing:2px;color:#e8c66e;font-weight:800}
#hwcAdminManagement h2{color:#f0cf78;font-size:19px;margin:8px 0 13px}
#hwcAdminManagement h3{color:#f0cf78;font-size:14px;margin:4px 0 10px}
#hwcAdminManagement .hm-muted{color:#aeb0b8;font-size:11px;line-height:1.5}
#hwcAdminManagement .hm-card{padding:13px;margin:10px 0;border:1px solid #3b3932;border-radius:14px;background:#15171c}
#hwcAdminManagement input,#hwcAdminManagement select{box-sizing:border-box;width:100%;padding:11px;border:1px solid #484b53;border-radius:9px;background:#0c0e12;color:#fff;margin:5px 0 10px}
#hwcAdminManagement button{cursor:pointer}
#hwcAdminManagement .hm-btn{border:0;border-radius:9px;padding:10px 13px;background:#d8ad3e;color:#241900;font-weight:800}
#hwcAdminManagement .hm-btn.alt{background:#343840;color:#fff}
#hwcAdminManagement .hm-btn.danger{background:#702d2d;color:#fff}
#hwcAdminManagement .hm-back{border:0;background:transparent;color:#edc75d;padding:8px 0;font-weight:800}
#hwcAdminManagement .hm-grid{display:grid;grid-template-columns:1fr;gap:9px}
#hwcAdminManagement .hm-option{display:flex;align-items:center;gap:12px;width:100%;padding:14px;border:1px solid #51452d;border-radius:13px;background:linear-gradient(135deg,#1b1d23,#121419);color:#f7f3e8;text-align:left}
#hwcAdminManagement .hm-option .hm-ico{width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;border-radius:11px;background:#352a18;color:#f1ce70;font-size:19px}
#hwcAdminManagement .hm-option b{display:block;font-size:13px}
#hwcAdminManagement .hm-option small{display:block;color:#aeb0b8;font-size:10px;margin-top:4px}
#hwcAdminManagement .hm-record{padding:12px 0;border-bottom:1px solid #303239}
#hwcAdminManagement .hm-record:last-child{border-bottom:0}
#hwcAdminManagement .hm-row{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}
#hwcAdminManagement .hm-row strong{font-size:12px;overflow-wrap:anywhere}
#hwcAdminManagement .hm-tag{font-size:9px;padding:4px 8px;border-radius:20px;background:#39301d;color:#f0d07a}
#hwcAdminManagement .hm-fields{display:grid;grid-template-columns:1fr;gap:6px;margin:10px 0}
#hwcAdminManagement .hm-field{display:flex;justify-content:space-between;gap:10px;padding:8px;background:#101217;border:1px solid #2b2e35;border-radius:8px;font-size:10px}
#hwcAdminManagement .hm-field span{color:#aeb0b8}
#hwcAdminManagement .hm-field b{text-align:right;overflow-wrap:anywhere}
#hwcAdminManagement .hm-perms{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}
#hwcAdminManagement .hm-perm{display:flex;align-items:center;gap:7px;padding:9px;border:1px solid #383a40;border-radius:8px;background:#101217;font-size:10px}
#hwcAdminManagement .hm-perm input{width:auto;margin:0;accent-color:#d8ad3e}
#hwcAdminManagement .hm-empty{padding:18px;text-align:center;color:#aaa;font-size:11px}
@media(min-width:620px){#hwcAdminManagement .hm-grid{grid-template-columns:1fr 1fr}#hwcAdminManagement .hm-fields{grid-template-columns:1fr 1fr}#hwcAdminManagement .hm-perms{grid-template-columns:repeat(3,1fr)}}
`;
doc.head.appendChild(css);
function show(id){['adminHome','adminUsers','adminKyc','adminKycList','adminNotifications','hwcAdminRates','hwcAdminRequests','hwcAdminBalance','hwcAdminGift','hwcAdminManagement'].forEach(function(k){var e=doc.getElementById(k);if(e){e.hidden=k!==id;e.style.display=k===id?'block':'none';}});}
function host(){var h=doc.getElementById('hwcAdminManagement');if(!h){h=doc.createElement('section');h.id='hwcAdminManagement';h.className='admin-view';var p=doc.getElementById('adminPanel');if(p)p.appendChild(h);}return h;}
function back(){return '<button class="hm-back" data-hm="home">‹ Control Panel</button>';}
function shell(title,sub,body){var h=host();h.innerHTML=back()+'<div class="hm-hero"><div class="hm-kicker">HEWAD COIN · OWNER AUTHORITY</div><h2>'+esc(title)+'</h2><div class="hm-muted">'+esc(sub||'')+'</div></div>'+body;show('hwcAdminManagement');return h;}
function profile(u){var items=[['First Name',u.first_name],['Last Name',u.last_name],['Email',u.email],['Referral Code',u.referral_code],['Card Number',u.card_number],['Identity Verification',u.identity_verification],['Account Verification',u.account_verification?'Verified':'Not verified'],['KYC Status',u.kyc_status],['Active Positions',u.active_positions],['Total Staked HDC',Number(u.total_staked_hdc||0).toLocaleString()+' HDC'],['Referral Earnings',Number(u.referral_earnings||0).toLocaleString()+' HDC'],['Account Status',u.account_status]];
return '<div class="hm-fields">'+items.map(function(x){return '<div class="hm-field"><span>'+esc(x[0])+'</span><b>'+esc(x[1]==null||x[1]===''?'—':x[1])+'</b></div>';}).join('')+'</div>';}
function permissionChecks(selected){selected=selected||[];return '<div class="hm-perms">'+perms.map(function(p){return '<label class="hm-perm"><input type="checkbox" value="'+p[0]+'" '+(selected.indexOf(p[0])>=0?'checked':'')+'> '+esc(p[1])+'</label>';}).join('')+'</div>';}
function selectedPermissions(root){return Array.from(root.querySelectorAll('.hm-perms input:checked')).map(function(x){return x.value;});}
async function rpc(name,args){var r=await db.rpc(name,args||{});if(r.error)throw r.error;return r.data;}
async function init(userOverride){
 try{
  var user;
  if(arguments.length){user=userOverride||null;}
  else{var u=await db.auth.getUser();user=u.data&&u.data.user||null;}
  if(!user){owner=false;canList=false;ready=false;myPermissions=[];var old=doc.getElementById('hwcAdminManagementEntry');if(old)old.remove();return;}
  owner=user.id===ownerId && String(user.email||'').toLowerCase()==='hewadcoin@gmail.com';
  myPermissions=owner?perms.map(function(p){return p[0];}):(await rpc('admin_mgmt_my_permissions'))||[];
  canList=owner||myPermissions.indexOf('admin_list')>=0;
  ready=true;
  if(owner||myPermissions.length){window.HEWAD_USER_ROLE='admin';doc.querySelectorAll('.admin-nav-btn').forEach(function(b){b.hidden=false;});window.dispatchEvent(new CustomEvent('hewad-admin-authorized'));}
  installHomeButton();
 }catch(e){ready=false;console.warn('Admin Management access check:',e.message||e);}
}
function installHomeButton(){
 var home=doc.getElementById('adminHome');if(!home)return;
 function inject(){
  if(!ready)return;
  var grid=home.querySelector('.hwc-admin-grid');if(!grid)return;
  grid.querySelectorAll('[data-hwc-page]').forEach(function(item){var key=item.getAttribute('data-hwc-page');var needed={users:['all_users','user_management'],balance:['balance_management'],kyc:['kyc_management'],requests:['dashboard','deposit_management','withdraw_management','kyc_management'],rates:['settings'],gift:['gift_management']}[key]||[];item.style.display=owner||needed.some(function(p){return myPermissions.indexOf(p)>=0;})?'':'none';});
  if(!canList){var old=doc.getElementById('hwcAdminManagementEntry');if(old)old.remove();return;}\n  if(doc.getElementById('hwcAdminManagementEntry'))return;
  var b=doc.createElement('button');b.id='hwcAdminManagementEntry';b.type='button';b.className='hwc-admin-option';
  b.innerHTML='<span class="ico">♛</span><span><strong>Admin Management</strong><small>Owner-controlled administrator accounts, permissions and audit history</small></span><span class="arrow">›</span>';
  b.addEventListener('click',openHome);grid.appendChild(b);
 }
 inject();if(!homeObserver){homeObserver=new MutationObserver(inject);homeObserver.observe(home,{childList:true,subtree:true});}
}
function openList(){listPage(false);}\nfunction openHome(){if(!owner){openList();return;}shell('ADMIN MANAGEMENT','Only the verified Super Admin can create, delete or control staff administrators.','<div class="hm-grid"><button class="hm-option" data-hm="active"><span class="hm-ico">＋</span><span><b>Active Admin</b><small>Search users, review full profile and add administrators</small></span></button><button class="hm-option" data-hm="deleted"><span class="hm-ico">▣</span><span><b>Delete Admin</b><small>Deleted administrator history and Restore</small></span></button><button class="hm-option" data-hm="list"><span class="hm-ico">♙</span><span><b>Admin List</b><small>All active and suspended administrators</small></span></button><button class="hm-option" data-hm="control"><span class="hm-ico">⚙</span><span><b>Admin Control</b><small>Permissions, suspend and activate</small></span></button></div><div class="hm-card"><b>OWNER AUTHORITY</b><div class="hm-muted">hewadcoin@gmail.com · Super Admin · Fixed Owner ID verified by Supabase</div></div><div class="hm-card"><button class="hm-btn alt" data-hm="audit">View Admin Audit Log</button></div>');}
async function activePage(){
 shell('Active Admin','Find a registered user using one of four search methods.','<div class="hm-card"><label>Search User</label><select id="hmSearchType"><option value="name">Full Name</option><option value="email">Email Address</option><option value="referral">Referral Code</option><option value="card">Card Number</option></select><input id="hmSearchValue" placeholder="Search Here..."><button class="hm-btn" id="hmSearchBtn">Search User</button></div><div id="hmSearchResults" class="hm-card"><div class="hm-empty">Enter a search value to find a user.</div></div>');
 doc.getElementById('hmSearchBtn').onclick=searchUsers;doc.getElementById('hmSearchValue').addEventListener('keydown',function(e){if(e.key==='Enter')searchUsers();});
}
async function searchUsers(){
 var box=doc.getElementById('hmSearchResults'),term=doc.getElementById('hmSearchValue').value.trim(),type=doc.getElementById('hmSearchType').value;
 if(!term){box.innerHTML='<div class="hm-empty">Enter a search value.</div>';return;}
 box.textContent='Searching securely…';
 try{var rows=await rpc('admin_mgmt_search_users',{p_search_type:type,p_search_value:term});box.innerHTML=rows.length?rows.map(function(u){return '<div class="hm-record"><div class="hm-row"><strong>'+esc((u.first_name||'')+' '+(u.last_name||''))+'</strong><span class="hm-tag">'+esc(u.account_status)+'</span></div><div class="hm-muted">'+esc(u.email)+'</div>'+profile(u)+(u.is_already_admin?'<p class="hm-muted">This account is already enrolled as an administrator.</p>':'<button class="hm-btn" data-hm-add="'+esc(u.user_id)+'">Add Admin</button>')+'</div>';}).join(''):'<div class="hm-empty">No matching user found.</div>';
 box.querySelectorAll('[data-hm-add]').forEach(function(b){b.onclick=function(){var u=rows.find(function(x){return x.user_id===b.getAttribute('data-hm-add');});confirmAdd(u);};});
 }catch(e){box.innerHTML='<div class="hm-empty">Search failed: '+esc(e.message)+'</div>';}
}
function confirmAdd(u){
 if(!u)return;
 if(!confirm('Are you sure you want to appoint '+u.email+' as a HEWAD COIN administrator?'))return;
 shell('Assign Permissions','Select only the permissions this administrator needs. Owner-only powers are never assignable.','<div class="hm-card"><b>'+esc((u.first_name||'')+' '+(u.last_name||''))+'</b><div class="hm-muted">'+esc(u.email)+'</div>'+permissionChecks([])+'<button class="hm-btn" id="hmSavePerms">Save Permissions & Add Admin</button> <button class="hm-btn alt" data-hm="active">Cancel</button></div>');
 doc.getElementById('hmSavePerms').onclick=async function(){var p=selectedPermissions(host());if(!confirm('Confirm adding this user with '+p.length+' selected permission(s)?'))return;try{await rpc('admin_mgmt_add_admin',{p_user_id:u.user_id,p_permissions:p});note('Administrator added and permissions saved.');openHome();}catch(e){note(e.message||'Could not add administrator.');}};
}
async function listPage(deleted){
 var rows;try{rows=await rpc('admin_mgmt_list_admins',{p_include_deleted:!!deleted});}catch(e){shell(deleted?'Delete Admin':'Admin List','', '<div class="hm-card hm-empty">'+esc(e.message)+'</div>');return;}
 currentRows=rows||[];
 shell(deleted?'Delete Admin — History':'Admin List','Total '+currentRows.length+' administrator(s). Search by name or email.','<div class="hm-card"><input id="hmFilter" placeholder="Search name or email"><div id="hmAdminRows"></div></div>');
 renderRows(currentRows,deleted);doc.getElementById('hmFilter').addEventListener('input',function(){var q=this.value.toLowerCase();renderRows(currentRows.filter(function(x){return (x.full_name+' '+x.email).toLowerCase().includes(q);}),deleted);});
}
function renderRows(rows,deleted){
 var el=doc.getElementById('hmAdminRows');if(!el)return;
 el.innerHTML=rows.length?rows.map(function(a){return '<div class="hm-record"><div class="hm-row"><strong>'+esc(a.full_name||'Admin')+'</strong><span class="hm-tag">'+esc(a.status)+'</span></div><div class="hm-muted">'+esc(a.email)+'<br>Admin ID: '+esc(a.user_id)+'<br>Created: '+new Date(a.created_at).toLocaleString()+(a.deleted_at?'<br>Deleted: '+new Date(a.deleted_at).toLocaleString()+'<br>Deleted by: '+esc(a.deleted_by_email||'—'):'')+'</div><div class="hm-muted">Permissions: '+esc((a.permissions||[]).join(', ')||'None')+'</div>'+(deleted?'<button class="hm-btn" data-hm-restore="'+esc(a.user_id)+'">Restore Admin</button>' :(!owner?'':'<button class="hm-btn alt" data-hm-edit="'+esc(a.user_id)+'">Manage</button>'))+'</div>';}).join(''):'<div class="hm-empty">No administrators found.</div>';
 el.querySelectorAll('[data-hm-restore]').forEach(function(b){b.onclick=async function(){if(!confirm('Restore this administrator? Permissions will be empty and must be assigned again.'))return;try{await rpc('admin_mgmt_restore_admin',{p_user_id:b.dataset.hmRestore});note('Administrator restored. Reassign permissions from Admin Control.');listPage(true);}catch(e){note(e.message);}};});
 el.querySelectorAll('[data-hm-edit]').forEach(function(b){b.onclick=function(){manageAdmin(rows.find(function(x){return x.user_id===b.dataset.hmEdit;}));};});
}
function manageAdmin(a){
 if(!a||!owner)return;
 shell('Admin Control','Update permissions or suspend/activate this administrator.','<div class="hm-card"><b>'+esc(a.full_name||'Admin')+'</b><div class="hm-muted">'+esc(a.email)+' · '+esc(a.status)+'</div>'+permissionChecks(a.permissions||[])+'<button class="hm-btn" id="hmUpdatePermissions">Save Permissions</button> <button class="hm-btn alt" id="hmToggleStatus">'+(a.status==='suspended'?'Activate Admin':'Suspend Admin')+'</button> <button class="hm-btn danger" id="hmDeleteAdmin">Delete Admin</button></div>');
 doc.getElementById('hmUpdatePermissions').onclick=async function(){var p=selectedPermissions(host());if(!confirm('Save the selected permissions for this administrator?'))return;try{await rpc('admin_mgmt_update_permissions',{p_user_id:a.user_id,p_permissions:p});note('Permissions updated and audited.');listPage(false);}catch(e){note(e.message);}};
 doc.getElementById('hmToggleStatus').onclick=async function(){var status=a.status==='suspended'?'active':'suspended';if(!confirm('Confirm '+status+' this administrator?'))return;try{await rpc('admin_mgmt_set_status',{p_user_id:a.user_id,p_status:status});note('Administrator status updated.');listPage(false);}catch(e){note(e.message);}};
 doc.getElementById('hmDeleteAdmin').onclick=async function(){if(!confirm('Delete this administrator? Their audit history will be retained.'))return;try{await rpc('admin_mgmt_delete_admin',{p_user_id:a.user_id});note('Administrator deleted.');listPage(false);}catch(e){note(e.message);}};
}
async function auditPage(){
 try{var rows=await rpc('admin_mgmt_get_audit',{p_user_id:null});shell('Admin Audit Log','Recent administrator changes are retained, including deletion history.','<div class="hm-card">'+(rows.length?rows.map(function(x){return '<div class="hm-record"><b>'+esc(x.action)+'</b><div class="hm-muted">Actor: '+esc(x.actor_email)+' · Target: '+esc(x.target_email||'—')+'<br>'+new Date(x.created_at).toLocaleString()+'<br>'+esc(JSON.stringify(x.details))+'</div></div>';}).join(''):'<div class="hm-empty">No audit events yet.</div>')+'</div>');}catch(e){shell('Admin Audit Log','', '<div class="hm-card hm-empty">'+esc(e.message)+'</div>');}
}
doc.addEventListener('click',function(e){var b=e.target.closest('[data-hm]');if(!b)return;var a=b.getAttribute('data-hm');if(a==='home')openHome();else if(a==='active')activePage();else if(a==='deleted')listPage(true);else if(a==='list')listPage(false);else if(a==='control')listPage(false);else if(a==='audit')auditPage();});
if(db.auth&&db.auth.onAuthStateChange)db.auth.onAuthStateChange(function(_event,session){setTimeout(function(){init(session&&session.user||null);},0);});
init();
})();