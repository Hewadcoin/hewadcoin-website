/* HEWAD COIN live backend layer. Loaded after the existing homepage script. */
(function(){
'use strict';
var db=hwcSupabase,$=function(id){return document.getElementById(id)},profile=null,wallet=null,isAdmin=false,adminUserPage=0;
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var num=function(v,d){return Number(v||0).toLocaleString(undefined,{minimumFractionDigits:d||0,maximumFractionDigits:d||0})};
var say=function(m){if(typeof showNotice==='function')showNotice(m);else alert(m)};
var user=function(){return hwcCurrentUser||null};
var modal=document.createElement('div');modal.id='hwcLiveModal';modal.innerHTML='<div class="hwc-live-backdrop"></div><section class="hwc-live-dialog" role="dialog" aria-modal="true"><header><h2 id="hwcLiveTitle"></h2><button type="button" id="hwcLiveClose">×</button></header><div id="hwcLiveBody"></div></section>';document.body.appendChild(modal);
var css=document.createElement('style');css.textContent='#hwcLiveModal{display:none;position:fixed;inset:0;z-index:99999}#hwcLiveModal.open{display:block}.hwc-live-backdrop{position:absolute;inset:0;background:#000b;backdrop-filter:blur(4px)}.hwc-live-dialog{position:relative;margin:4vh auto 0;width:min(94vw,620px);max-height:92vh;overflow:auto;background:#111319;color:#f6f6f6;border:1px solid #72551b;border-radius:18px;padding:17px;box-shadow:0 20px 70px #0009}.hwc-live-dialog header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #39332a;padding-bottom:12px;margin-bottom:14px}.hwc-live-dialog h2{font-size:19px;color:#e8bd4a;margin:0}.hwc-live-dialog header button{background:transparent;color:#fff;border:0;font-size:28px}.hwc-live-dialog input,.hwc-live-dialog textarea,.hwc-live-dialog select{width:100%;padding:10px;border-radius:9px;border:1px solid #494b51;background:#0c0e12;color:#fff;margin:6px 0 12px}.hwc-live-dialog button.action{border:0;border-radius:9px;padding:10px 14px;background:#d8ad3e;color:#241900;font-weight:800}.hwc-live-dialog .live-row{padding:12px 0;border-bottom:1px solid #34363d;display:flex;justify-content:space-between;gap:10px;align-items:center}.hwc-live-dialog .muted{color:#a9abb4;font-size:12px;line-height:1.5}.hwc-live-dialog .pill{display:inline-block;border-radius:30px;padding:4px 9px;background:#3a321e;color:#f2d27d;font-size:11px}.hwc-live-dialog .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hwc-live-dialog .balance{padding:13px;border:1px solid #4a3b1d;border-radius:12px;background:#1a1916}.hwc-live-dialog .balance b{display:block;font-size:17px;color:#f3ce69;margin-top:5px}.hwc-live-dialog table{width:100%;border-collapse:collapse;font-size:12px}.hwc-live-dialog th,.hwc-live-dialog td{padding:9px 7px;border-bottom:1px solid #34363d;text-align:left}.hwc-live-dialog .danger{background:#7c2930;color:#fff}@media(max-width:480px){.hwc-live-dialog{margin:2vh auto 0;max-height:96vh}.hwc-live-dialog .grid{grid-template-columns:1fr}}';document.head.appendChild(css);
function openModal(title,html){$('hwcLiveTitle').textContent=title;$('hwcLiveBody').innerHTML=html;modal.classList.add('open')}
function closeModal(){modal.classList.remove('open')}
$('hwcLiveClose').onclick=closeModal;modal.querySelector('.hwc-live-backdrop').onclick=closeModal;
function put(id,value){if($(id))$(id).textContent=value}

function renderWalletEmpty(){var v=$('walletPage');if(!v)return;v.innerHTML='<section class="dash-subpage-card" style="text-align:center;padding:42px 18px"><div style="font-size:42px;margin-bottom:12px">💼</div><h2>WALLET</h2><p class="muted">Your wallet section is being prepared. Details will appear here soon.</p></section>'}
function renderSupportEmpty(){var v=$('supportPage');if(!v)return;v.innerHTML='<section class="dash-subpage-card" style="text-align:center;padding:42px 18px"><div style="font-size:42px;margin-bottom:12px">🛟</div><h2>SUPPORT</h2><p class="muted">The support center is being prepared. You will be able to contact us here soon.</p></section>'}
function setTab(tab){var ids={dashboard:'dashboardMain',wallet:'walletPage',support:'supportPage',profile:'profilePage',control:'adminPanel'};if(tab==='control'&&!isAdmin)return;Object.keys(ids).forEach(function(k){if($(ids[k]))$(ids[k]).classList.toggle('active',k===tab)});document.querySelectorAll('#dashboard [data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tab)});if($('memberCard'))$('memberCard').hidden=tab!=='dashboard';window.scrollTo(0,0);if(tab==='wallet')renderWalletEmpty();if(tab==='support')renderSupportEmpty();if(tab==='control')showAdmin('adminHome')}
function showAdmin(id){if(!isAdmin)return;['adminHome','adminUsers','adminKyc','adminKycList','adminNotifications'].forEach(function(x){if($(x))$(x).hidden=x!==id})}
async function loadWallet(){if(!user())return;var w=await db.from('wallets').select('balance_hwc,balance_usd,balance_afn').eq('user_id',user().id).maybeSingle();if(w.error){console.error(w.error);return}wallet=w.data||{balance_hwc:0,balance_usd:0,balance_afn:0};put('walletHwcBalance',num(wallet.balance_hwc,4)+' HWC');put('walletUsdBalance','$'+num(wallet.balance_usd,2));put('walletAfnBalance',num(wallet.balance_afn)+' AFN');put('hwcBalance',num(wallet.balance_hwc,4)+' HWC');put('usdBalance','$'+num(wallet.balance_usd,2));put('afnBalance',num(wallet.balance_afn)+' AFN');put('profileAfn',num(wallet.balance_afn));put('profileUsd','$'+num(wallet.balance_usd,2));put('profileHwc',num(wallet.balance_hwc,4));var tx=await db.from('wallet_transactions').select('asset,amount,transaction_type,status,description,created_at').eq('user_id',user().id).order('created_at',{ascending:false}).limit(20);var host=$('hwcWalletHistory');if(host)host.innerHTML=tx.error?'<p class="muted">Could not load transactions.</p>':(tx.data||[]).length?tx.data.map(function(t){return '<div class="live-row"><div><b>'+esc(t.description||t.transaction_type)+'</b><div class="muted">'+new Date(t.created_at).toLocaleString()+'</div></div><div><b>'+(t.amount>0?'+':'')+num(t.amount,4)+' '+esc(t.asset)+'</b><div class="muted">'+esc(t.status)+'</div></div></div>'}).join(''):'<p class="muted">No transactions yet.</p>'}
async function loadHwcProfileLive(u){if(!u)return;var rs=await Promise.all([db.from('profiles').select('id,first_name,last_name,mobile_number,referral_code,referred_by,account_status,email_verified,card_number,country,kyc_status,created_at,avatar_url').eq('id',u.id).maybeSingle(),db.from('wallets').select('balance_hwc,balance_usd,balance_afn').eq('user_id',u.id).maybeSingle(),db.from('user_roles').select('role').eq('user_id',u.id),db.rpc('get_my_inviter')]);if(rs[0].error)console.error('Profile:',rs[0].error);profile=rs[0].data||{};wallet=rs[1].data||{balance_hwc:0,balance_usd:0,balance_afn:0};isAdmin=(rs[2].data||[]).some(function(x){return x.role==='admin'});window.HEWAD_USER_ROLE=isAdmin?'admin':'member';var name=[profile.first_name,profile.last_name].filter(Boolean).join(' ')||u.email||'MEMBER';put('memberName',name.toUpperCase());put('profileMemberName',name);put('profileDisplayName',name);put('profileEmail',u.email||'');window.HEWAD_KYC_STATUS=profile.kyc_status||'not_verified';put('memberCountry',profile.kyc_status==='approved'?(profile.kyc_country||profile.country||'—'):'—');put('memberCardNumber',profile.card_number||'PENDING KYC');put('cardKycStatus',profile.kyc_status==='approved'?'KYC VERIFIED':profile.kyc_status==='pending'?'KYC PENDING':profile.kyc_status==='rejected'?'KYC REJECTED':'KYC NOT VERIFIED');put('profileKycStatus',profile.kyc_status||'not_verified');put('cardCreatedDate','—');put('invitedByName',rs[3].data&&rs[3].data[0]?rs[3].data[0].inviter_name||'Not Available':'Not Available');if(profile.avatar_url&&$('profileAvatar')){$('profileAvatar').src=profile.avatar_url;$('profileAvatar').hidden=false;$('profileAvatarFallback').hidden=true}document.querySelectorAll('.admin-nav-btn').forEach(function(b){b.hidden=!isAdmin});await loadWallet()}
loadHwcProfile=loadHwcProfileLive;
async function showReferral(){
  if(!profile)await loadHwcProfileLive(user());
  var r=await db.rpc('get_my_referrals');
  if(r.error){say(r.error.message);return}
  var code=profile.referral_code||'—';
  var url=parent.location.origin+parent.location.pathname+'?ref='+encodeURIComponent(code);
  var list=r.data||[];
  var rows=list.map(function(x){
    var name=[x.first_name,x.last_name].filter(Boolean).join(' ')||'Member';
    return '<div class="live-row"><div><b>'+esc(name)+'</b><div class="muted">'+new Date(x.created_at).toLocaleDateString()+'</div></div><span class="pill">'+esc(x.referral_code)+'</span></div>';
  }).join('');
  var html='<div class="grid"><div class="balance"><span class="muted">Your referral code</span><b>'+esc(code)+'</b></div><div class="balance"><span class="muted">Invited members</span><b>'+list.length+'</b></div></div><p class="muted">Share your personal invitation link.</p><input id="hwcReferralUrl" readonly value="'+esc(url)+'"><button class="action" id="hwcCopyReferral">Copy invitation link</button><h3>Invited members</h3>'+(rows||'<p class="muted">No invited members yet.</p>');
  openModal('REFERRAL PROGRAM',html);
  $('hwcCopyReferral').onclick=async function(){
    try{await navigator.clipboard.writeText(url);say('Referral link copied.')}
    catch(e){$('hwcReferralUrl').select();document.execCommand('copy');say('Referral link copied.')}
  };
}
async function loadSupport(){if(!user())return;var s=$('supportPage');s.innerHTML='<h2>SUPPORT</h2><div class="dash-subpage-card"><form id="hwcSupportForm"><label>Subject<input id="hwcSupportSubject" required maxlength="120" placeholder="What do you need help with?"></label><label>Message<textarea id="hwcSupportMessage" required maxlength="3000" rows="4" placeholder="Describe your issue"></textarea></label><button class="primary" type="submit">SEND MESSAGE</button></form></div><div class="dash-subpage-card" style="margin-top:14px"><h3>MY SUPPORT REQUESTS</h3><div id="hwcSupportList">Loading…</div></div>';var r=await db.from('support_tickets').select('subject,message,status,admin_reply,created_at').eq('user_id',user().id).order('created_at',{ascending:false}).limit(30);$('hwcSupportList').innerHTML=r.error?'<p>Unable to load requests.</p>':(r.data||[]).length?r.data.map(function(t){return '<div class="live-row"><div><b>'+esc(t.subject)+'</b><div class="muted">'+new Date(t.created_at).toLocaleString()+'</div>'+(t.admin_reply?'<p>'+esc(t.admin_reply)+'</p>':'')+'</div><span class="pill">'+esc(t.status)+'</span></div>'}).join(''):'<p class="muted">No support requests yet.</p>';$('hwcSupportForm').onsubmit=async function(e){e.preventDefault();var b=e.currentTarget.querySelector('button');b.disabled=true;var q=await db.from('support_tickets').insert({user_id:user().id,subject:$('hwcSupportSubject').value.trim(),message:$('hwcSupportMessage').value.trim()});b.disabled=false;if(q.error)say(q.error.message);else{say('Your support request has been sent.');loadSupport()}}}
async function showNotifications(){var r=await db.from('notifications').select('id,title,body,is_read,created_at').eq('user_id',user().id).order('created_at',{ascending:false}).limit(30);if(r.error){say(r.error.message);return}openModal('NOTIFICATIONS',(r.data||[]).length?r.data.map(function(n){return '<div class="live-row"><div><b>'+esc(n.title)+'</b><p>'+esc(n.body)+'</p><span class="muted">'+new Date(n.created_at).toLocaleString()+'</span></div><span class="pill">'+(n.is_read?'Read':'New')+'</span></div>'}).join(''):'<p class="muted">No notifications yet.</p>');var ids=(r.data||[]).filter(function(n){return !n.is_read}).map(function(n){return n.id});if(ids.length)await db.from('notifications').update({is_read:true}).in('id',ids)}
async function submitKyc(e){e.preventDefault();e.stopImmediatePropagation();if(!user()){say('Please log in first.');return}var f=e.currentTarget;if(!f.reportValidity())return;if(profile&&profile.kyc_status==='approved'){say('Your KYC is already approved.');$('kycScreen').hidden=true;return}var files={front:$('kycFront').files[0],back:$('kycBack').files[0],selfie:$('kycSelfie').files[0]};if(Object.keys(files).some(function(k){return !files[k]})){say('Please select all three identity documents.');return}var b=f.querySelector('button[type="submit"]'),paths=[];b.disabled=true;try{for(var k of Object.keys(files)){var file=files[k];if(file.size>10485760)throw new Error('Each document must be smaller than 10 MB.');if(['image/jpeg','image/png','image/webp','application/pdf'].indexOf(file.type)<0)throw new Error('Only JPG, PNG, WEBP or PDF files are allowed.');var ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,''),path=user().id+'/'+crypto.randomUUID()+'-'+k+'.'+ext,up=await db.storage.from('kyc-documents').upload(path,file,{upsert:false,contentType:file.type});if(up.error)throw up.error;paths.push(path)}var q=await db.from('kyc_applications').insert({user_id:user().id,first_name:$('kycFirst').value.trim(),last_name:$('kycLast').value.trim(),country:$('kycCountry').value,province:$('kycProvince').value,national_id_number:$('kycIdNumber').value.trim(),date_of_birth:$('kycDob').value,front_document_path:paths[0],back_document_path:paths[1],selfie_document_path:paths[2]});if(q.error)throw q.error;$('kycScreen').hidden=true;say('KYC request submitted. It is waiting for administrator review.');await loadHwcProfileLive(user())}catch(err){if(paths.length)await db.storage.from('kyc-documents').remove(paths);say(err.message||'KYC upload failed.')}finally{b.disabled=false}}
async function adminUsers(){
  showAdmin('adminUsers');
  var view=$('adminUsers');
  view.querySelector('.admin-empty')?.remove();
  view.querySelector('.admin-pagination')?.remove();
  var host=$('hwcAdminUsersList');
  if(!host){host=document.createElement('div');host.id='hwcAdminUsersList';view.appendChild(host)}
  host.innerHTML='<p>Loading users…</p>';
  var r=await db.rpc('admin_search_users',{
    p_search_type:$('adminUserSearchType')?.value||'all',
    p_search_value:$('adminUserSearch')?.value.trim()||'',
    p_limit:11,
    p_offset:adminUserPage*10
  });
  if(r.error){host.innerHTML='<p>'+esc(r.error.message)+'</p>';return}
  var all=r.data||[],rows=all.slice(0,10),hasNext=all.length>10;
  host.innerHTML=rows.length?rows.map(function(u){
    return '<article class="admin-status-card" style="display:block;margin:10px 0"><div style="display:flex;justify-content:space-between"><b>'+esc([u.first_name,u.last_name].filter(Boolean).join(' ')||'Member')+'</b><span class="pill">'+esc(u.referral_code)+'</span></div><p class="muted">'+esc(u.email)+' · '+esc(u.mobile_number||'No phone')+'<br>Card: '+esc(u.card_number||'Not issued')+' · Referrals: '+u.referral_count+'<br>'+num(u.balance_hwc,4)+' HWC · $'+num(u.balance_usd,2)+' · '+num(u.balance_afn)+' AFN</p><select data-user-status="'+u.id+'"><option value="pending" '+(u.account_status==='pending'?'selected':'')+'>Pending</option><option value="active" '+(u.account_status==='active'?'selected':'')+'>Active</option><option value="suspended" '+(u.account_status==='suspended'?'selected':'')+'>Suspended</option></select> <button class="action" data-save-user="'+u.id+'">Save</button></article>';
  }).join(''):'<p>No users found.</p>';
  host.querySelectorAll('[data-save-user]').forEach(function(b){
    b.onclick=async function(){
      var id=b.dataset.saveUser,status=host.querySelector('[data-user-status="'+id+'"]').value;
      var q=await db.rpc('admin_set_account_status',{p_user_id:id,p_status:status});
      say(q.error?q.error.message:'Account status updated.');
      if(!q.error)adminUsers();
    };
  });
  var pager=document.createElement('div');
  pager.className='admin-pagination';
  pager.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;margin:14px 0';
  pager.innerHTML='<button class="action" type="button" id="hwcAdminPrev">← Previous</button><span class="muted">Page '+(adminUserPage+1)+'</span><button class="action" type="button" id="hwcAdminNext">Next →</button>';
  host.appendChild(pager);
  $('hwcAdminPrev').disabled=adminUserPage===0;
  $('hwcAdminNext').disabled=!hasNext;
  $('hwcAdminPrev').onclick=function(){if(adminUserPage>0){adminUserPage--;adminUsers()}};
  $('hwcAdminNext').onclick=function(){if(hasNext){adminUserPage++;adminUsers()}};
}
async function adminKycList(category){showAdmin('adminKycList');$('adminKycListTitle').textContent=({requests:'KYC Requests',approved:'KYC Approved',rejected:'KYC Rejected'})[category]||'KYC Requests';$('hwcAdminKycList')?.remove();var host=document.createElement('div');host.id='hwcAdminKycList';$('adminKycList').appendChild(host);host.innerHTML='<p>Loading applications…</p>';var status=category==='requests'?'pending':category,r=await db.from('kyc_applications').select('*').eq('status',status).order('created_at',{ascending:false}).limit(50);if(r.error){host.innerHTML='<p>'+esc(r.error.message)+'</p>';return}if(!(r.data||[]).length){host.innerHTML='<div class="admin-empty"><strong>No KYC applications</strong></div>';return}var ids=[...new Set(r.data.map(function(x){return x.user_id}))],pr=await db.from('profiles').select('id,first_name,last_name,referral_code').in('id',ids),map=new Map((pr.data||[]).map(function(x){return [x.id,x]}));for(var item of r.data){var person=map.get(item.user_id)||{},links=[];for(var pair of [['Front',item.front_document_path],['Back',item.back_document_path],['Selfie',item.selfie_document_path]]){var s=await db.storage.from('kyc-documents').createSignedUrl(pair[1],600);if(!s.error)links.push('<a href="'+esc(s.data.signedUrl)+'" target="_blank" rel="noopener">'+pair[0]+' document</a>')}var card=document.createElement('article');card.className='admin-status-card';card.style.cssText='display:block;margin:10px 0';card.innerHTML='<b>'+esc([person.first_name,person.last_name].filter(Boolean).join(' ')||'Member')+'</b><p class="muted">'+esc(person.referral_code||'')+' · '+esc(item.country)+' · '+esc(item.province)+'<br>ID: '+esc(item.national_id_number)+' · DOB: '+esc(item.date_of_birth)+'<br>'+new Date(item.created_at).toLocaleString()+'</p><div class="muted">'+links.join(' · ')+'</div>'+(item.rejection_reason?'<p>'+esc(item.rejection_reason)+'</p>':'')+(status==='pending'?'<p><button class="action" data-approve="'+item.id+'">Approve</button> <button class="action danger" data-reject="'+item.id+'">Reject</button></p>':'<span class="pill">'+esc(item.status)+'</span>');host.appendChild(card)}host.querySelectorAll('[data-approve]').forEach(function(b){b.onclick=async function(){var q=await db.from('kyc_applications').update({status:'approved'}).eq('id',b.dataset.approve);say(q.error?q.error.message:'KYC approved; member card number issued.');if(!q.error)adminKycList(category)}});host.querySelectorAll('[data-reject]').forEach(function(b){b.onclick=async function(){var reason=prompt('Enter rejection reason:');if(!reason)return;var q=await db.from('kyc_applications').update({status:'rejected',rejection_reason:reason}).eq('id',b.dataset.reject);say(q.error?q.error.message:'KYC request rejected.');if(!q.error)adminKycList(category)}})}
async function adminNotifications(){showAdmin('adminNotifications');var view=$('adminNotifications'),host=$('hwcAdminNotifications');if(!host){host=document.createElement('div');host.id='hwcAdminNotifications';view.appendChild(host)}host.innerHTML='Loading…';var r=await db.from('notifications').select('title,body,is_read,created_at').eq('user_id',user().id).order('created_at',{ascending:false}).limit(50);host.innerHTML=r.error?'<p>'+esc(r.error.message)+'</p>':(r.data||[]).length?r.data.map(function(n){return '<div class="live-row"><div><b>'+esc(n.title)+'</b><p>'+esc(n.body)+'</p><span class="muted">'+new Date(n.created_at).toLocaleString()+'</span></div><span class="pill">'+(n.is_read?'Read':'New')+'</span></div>'}).join(''):'<p>No notifications yet.</p>'}
function bind(){document.querySelectorAll('#dashboard [data-tab]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();setTab(b.dataset.tab)},true)});document.querySelectorAll('#dashboard [data-nav]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();setTab(b.dataset.nav)},true)});document.querySelectorAll('.admin-nav-btn').forEach(function(b){b.hidden=!isAdmin;b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();setTab('control')},true)});document.querySelectorAll('[data-admin-open]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();var k=b.dataset.adminOpen;if(k==='users')adminUsers();else if(k==='kyc')showAdmin('adminKyc');else adminNotifications()},true)});document.querySelectorAll('[data-admin-home]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();showAdmin('adminHome')},true)});document.querySelectorAll('[data-admin-kyc-back]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();showAdmin('adminKyc')},true)});document.querySelectorAll('[data-kyc-category]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();adminKycList(b.dataset.kycCategory)},true)});$('adminUserSearchBtn')?.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();adminUserPage=0;adminUsers()},true);$('kycForm')?.addEventListener('submit',submitKyc,true);document.querySelectorAll('.dash-tile[data-action="Referral"]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();showReferral()},true)});document.querySelectorAll('.dash-tile[data-action="Transactions"]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();loadWallet().then(function(){openModal('TRANSACTION HISTORY',$('hwcWalletHistory')?.innerHTML||'<p>No transactions.</p>')})},true)});document.querySelectorAll('.dash-tile[data-action="Social Media"]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();openModal('SOCIAL MEDIA','<p class="muted">Official social media links will appear here when configured.</p>')},true)});document.querySelectorAll('.dash-tile[data-action]').forEach(function(b){if(['Referral','Transactions','Social Media'].indexOf(b.dataset.action)>=0)return;b.addEventListener('click',function(e){e.stopImmediatePropagation();say('This feature is not enabled for live transactions yet. Your wallet balance will not be changed.')},true)});document.querySelector('.dash-top-actions button[aria-label="Notifications"]')?.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();showNotifications()},true);$('invitedByRow')?.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();openModal('INVITED BY','<p>'+esc($('invitedByName').textContent)+'</p>')},true);document.querySelectorAll('[data-profile-action]').forEach(function(b){b.addEventListener('click',async function(e){e.preventDefault();e.stopImmediatePropagation();var a=b.dataset.profileAction;if(a==='Logout'){$('hwcLogout')?.click();return}if(a==='Change Password'){var pw=prompt('New password (at least 8 characters):');if(!pw)return;if(pw.length<8){say('Password must be at least 8 characters.');return}var q=await db.auth.updateUser({password:pw});say(q.error?q.error.message:'Password updated.');return}if(a==='Change Email'){var em=prompt('New email address:');if(!em)return;var q2=await db.auth.updateUser({email:em});say(q2.error?q2.error.message:'Confirmation link sent to your new email.');return}if(a==='Change Phone Number'){var ph=prompt('New mobile number:');if(!ph)return;var q3=await db.from('profiles').update({mobile_number:ph}).eq('id',user().id);say(q3.error?q3.error.message:'Mobile number updated.');return}if(a==='About Us')openModal('ABOUT HEWAD COIN','<p>HEWAD COIN member platform.</p>');else if(a==='Privacy Policy')openModal('PRIVACY POLICY','<p class="muted">Identity documents are stored in private storage and are accessible only to the account holder and authorized administrators.</p>');else if(a==='Delete Account')say('Contact platform support for account deletion so identity and financial records are handled safely.')},true)});}
var walletPage=$('walletPage');if(walletPage&&!$('hwcWalletHistory')){var box=document.createElement('div');box.className='dash-subpage-card';box.style.marginTop='14px';box.innerHTML='<h3>RECENT TRANSACTIONS</h3><div id="hwcWalletHistory"><p>No transactions yet.</p></div>';walletPage.appendChild(box)}
var invite=new URLSearchParams(location.search).get('ref');if(invite&&$('referral')){$('referral').value=invite;showScreen('signup')}

function bindReferralExperience(){
  var field=$('referral');
  if(!field)return;
  var hint=$('hwcReferralOwnerHint');
  if(!hint){hint=document.createElement('small');hint.id='hwcReferralOwnerHint';hint.style.cssText='display:block;margin:4px 0 10px;font-size:11px;line-height:1.4;min-height:15px';field.insertAdjacentElement('afterend',hint)}
  var form=field.closest('form')||document;
  var emailField=form.querySelector('input[type="email"],input[name*="email" i],input[id*="email" i]');
  var latest=0,timer=null;
  async function validate(){
    var code=field.value.trim(),ticket=++latest;
    if(!code){hint.textContent='';return}
    if(code.toLowerCase()==='hewadcoin'){
      var isAdmin=emailField&&emailField.value.trim().toLowerCase()==='hewadcoin@gmail.com';
      hint.textContent=isAdmin?'✓ Administrator registration code accepted.':'This special code is reserved for hewadcoin@gmail.com.';
      hint.style.color=isAdmin?'#35d07f':'#ff6262';
      return;
    }
    var result=await db.rpc('lookup_referral_code',{p_code:code});
    if(ticket!==latest)return;
    if(result.error){hint.textContent='Could not verify this referral code. Try again.';hint.style.color='#ff6262';return}
    var row=result.data&&result.data[0];
    if(row){hint.textContent='✓ Referral owner: '+row.owner_name;hint.style.color='#35d07f'}
    else{hint.textContent='✕ Invalid referral code. Please check the code.';hint.style.color='#ff6262'}
  }
  field.addEventListener('input',function(){clearTimeout(timer);timer=setTimeout(validate,350)});
  field.addEventListener('blur',validate);
  if(emailField)emailField.addEventListener('input',function(){if(field.value.trim().toLowerCase()==='hewadcoin')validate()});
  if(!field.value.trim()){
    db.rpc('get_registration_default_referral_code').then(function(result){
      if(!field.value.trim()&&!result.error&&result.data){field.value=result.data;validate()}
    }).catch(function(err){console.warn('Could not load default referral code:',err)});
  }else{validate()}
}
bindReferralExperience();bind();db.auth.onAuthStateChange(function(event,session){if(session&&session.user)setTimeout(function(){loadHwcProfileLive(session.user)},0);else if(event==='SIGNED_OUT'){profile=null;wallet=null;isAdmin=false}});if(user())loadHwcProfileLive(user()).catch(console.error);
/* Live signup field validation: password policy, confirmation and email feedback. */
function bindSignupValidation(){
  var ref=$('referral');
  var form=ref&&(ref.closest('form')||document);
  if(!form)return;
  var email=form.querySelector('input[type="email"],input[name*="email" i],input[id*="email" i]');
  var passwords=Array.from(form.querySelectorAll('input[type="password"]'));
  var password=passwords[0],confirm=passwords[1];
  if(!email||!password)return;
  var style=document.createElement('style');
  style.textContent='.hwc-field-valid{border-color:#25c878!important;box-shadow:0 0 0 1px #25c878!important}.hwc-field-invalid{border-color:#ff555d!important;box-shadow:0 0 0 1px #ff555d!important}.hwc-field-hint{display:block;font-size:11px;line-height:1.45;margin:6px 0 12px;min-height:14px;position:static;display:block;width:100%;box-sizing:border-box}.hwc-field-hint.ok{color:#25c878}.hwc-field-hint.bad{color:#ff6262}';
  document.head.appendChild(style);
  function hint(input,id){var el=$(id);if(!el){el=document.createElement('small');el.id=id;el.className='hwc-field-hint';input.insertAdjacentElement('afterend',el)}return el}
  var emailHint=hint(email,'hwcEmailValidationHint');
  var passHint=hint(password,'hwcPasswordValidationHint');
  var confirmHint=confirm?hint(confirm,'hwcConfirmPasswordValidationHint'):null;
  function paint(input,node,valid,message,neutral){
    input.classList.toggle('hwc-field-valid',!!valid&&!neutral);
    input.classList.toggle('hwc-field-invalid',!valid&&!neutral);
    node.className='hwc-field-hint '+(neutral?'':valid?'ok':'bad');
    node.textContent=message||'';
  }
  function emailValid(){
    var value=email.value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }
  function passwordValid(){
    var value=password.value;
    return value.length>=8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
  }
  function checkEmail(){
    if(!email.value.trim()){paint(email,emailHint,false,'',true);return false}
    var ok=emailValid();
    paint(email,emailHint,ok,ok?'✓ Email format is valid.':'✕ Enter a valid email address.');
    return ok;
  }
  function checkPassword(){
    if(!password.value){paint(password,passHint,false,'',true);return false}
    var ok=passwordValid();
    paint(password,passHint,ok,ok?'✓ Password meets the requirements.':'✕ Use at least 8 characters, including letters and numbers.');
    if(confirm&&confirm.value)checkConfirm();
    return ok;
  }
  function checkConfirm(){
    if(!confirm)return true;
    if(!confirm.value){paint(confirm,confirmHint,false,'',true);return false}
    var ok=confirm.value===password.value;
    paint(confirm,confirmHint,ok,ok?'✓ Passwords match.':'✕ Passwords do not match.');
    return ok;
  }
  email.addEventListener('input',checkEmail);
  password.addEventListener('input',checkPassword);
  if(confirm)confirm.addEventListener('input',checkConfirm);
  form.addEventListener('submit',function(e){
    var eok=checkEmail(),pok=checkPassword(),cok=checkConfirm();
    if(!eok||!pok||!cok){e.preventDefault();e.stopImmediatePropagation();say('Please correct the highlighted registration fields.')}
  },true);
  /* Supabase Auth intentionally avoids revealing registered addresses during typing.
     Its signup response identifies an existing account without querying auth.users. */
  if(!db.auth.__hwcSignupWrapped){
    var originalSignUp=db.auth.signUp.bind(db.auth);
    db.auth.signUp=async function(){
      var result=await originalSignUp.apply(null,arguments);
      var u=result&&result.data&&result.data.user;
      if(u&&Array.isArray(u.identities)&&u.identities.length===0){
        paint(email,emailHint,false,'✕ This email address is already registered.');
        return {data:result.data,error:{message:'This email address is already registered.'}};
      }
      if(!result.error&&u){
        paint(email,emailHint,true,'✓ Email is available. Check your inbox if confirmation is required.');
      }
      if(result.error&&/already registered|already been registered|user exists/i.test(result.error.message||'')){
        paint(email,emailHint,false,'✕ This email address is already registered.');
      }
      return result;
    };
    db.auth.__hwcSignupWrapped=true;
  }
}
bindSignupValidation();

})();