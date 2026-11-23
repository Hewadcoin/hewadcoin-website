/* HEWAD COIN — legacy-site production KYC integration. Signup scripts remain untouched. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const notify=m=>{if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
const originalLoad=window.loadHwcProfile;
if(typeof originalLoad==='function'){
 window.loadHwcProfile=async function(user){
  await originalLoad.apply(this,arguments);
  if(!user)return;
  window.__HWC_USER=user;
  const [p,w,r]=await Promise.all([
   hwcSupabase.from('profiles').select('first_name,last_name,mobile_number,referral_code,card_number,country,kyc_country,kyc_status,account_status,created_at,avatar_url').eq('id',user.id).maybeSingle(),
   hwcSupabase.from('wallets').select('balance_hwc,balance_usd,balance_afn').eq('user_id',user.id).maybeSingle(),
   hwcSupabase.from('user_roles').select('role').eq('user_id',user.id)
  ]);
  if(p.error)console.warn('KYC profile:',p.error.message);
  const profile=p.data||{},wallet=w.data||{},status=profile.kyc_status||'not_verified';
  window.HEWAD_KYC_STATUS=status;
  window.HEWAD_USER_ROLE=(r.data||[]).some(x=>x.role==='admin')?'admin':'member';
  const put=(id,v)=>{const el=$(id);if(el)el.textContent=v==null?'':String(v);};
  put('memberName',[profile.first_name,profile.last_name].filter(Boolean).join(' ')||user.email||'MEMBER');
  put('memberCountry',profile.kyc_country||profile.country||'—');
  put('memberCardNumber',profile.card_number||'—');
  put('profileKycStatus',status==='approved'?'Verified':status==='pending'?'Pending':status==='rejected'?'Rejected':'Unverified');
  put('cardKycStatus',status==='approved'?'ACTIVE':status==='pending'?'KYC PENDING':status==='rejected'?'KYC REJECTED':'KYC NOT VERIFIED');
  const addCardButton=$('addCardBtn');if(addCardButton)addCardButton.hidden=status==='approved';
  const dial={Afghanistan:'+93',Pakistan:'+92',India:'+91',Iran:'+98','United Arab Emirates':'+971','Saudi Arabia':'+966',Turkey:'+90','United States':'+1','United Kingdom':'+44',Canada:'+1',Australia:'+61',Germany:'+49',France:'+33',China:'+86'};
  const flags={Afghanistan:'🇦🇫',Pakistan:'🇵🇰',India:'🇮🇳',Iran:'🇮🇷','United Arab Emirates':'🇦🇪','Saudi Arabia':'🇸🇦',Turkey:'🇹🇷','United States':'🇺🇸','United Kingdom':'🇬🇧',Canada:'🇨🇦',Australia:'🇦🇺',Germany:'🇩🇪',France:'🇫🇷',China:'🇨🇳'};
  put('memberDialCode',(flags[profile.kyc_country||profile.country]||'🌐')+' '+(dial[profile.kyc_country||profile.country]||''));
  const admin=$('.admin-nav-btn');if(admin)admin.hidden=window.HEWAD_USER_ROLE!=='admin';
  const card=$('memberCardNumber'),copy=$('copyCardNumber');
  if(status!=='approved'){if(card)card.textContent='KYC REQUIRED';if(copy)copy.hidden=true;}
  else if(copy)copy.hidden=false;
  const fmt=(v,a)=>Number(v||0).toLocaleString(undefined,{maximumFractionDigits:8})+' '+a;
  put('hwcBalance',fmt(wallet.balance_hwc,'HDC'));put('usdBalance',fmt(wallet.balance_usd,'USDT'));put('afnBalance',fmt(wallet.balance_afn,'AFN'));
  put('walletHwcBalance',fmt(wallet.balance_hwc,'HDC'));put('walletUsdBalance',fmt(wallet.balance_usd,'USDT'));put('walletAfnBalance',fmt(wallet.balance_afn,'AFN'));
 };
}
const adminList=$('adminKycList');
function statusBadge(s){return '<strong class="hwc-kyc-status-badge">'+(s==='approved'?'Approved':s==='rejected'?'Rejected':'Pending')+'</strong>';}
function ensureHost(){if(!adminList)return null;let h=$('adminKycRecords');if(!h){h=document.createElement('div');h.id='adminKycRecords';h.className='admin-empty';adminList.appendChild(h);}return h;}
async function loadKyc(category){
 const host=ensureHost();if(!host)return;
 const status=category==='requests'?'pending':category;window.currentAdminKycCategory=category;
 host.innerHTML='<p>Loading…</p>';
 const {data,error}=await hwcSupabase.from('kyc_applications').select('id,user_id,first_name,last_name,country,province,mobile_number,document_type,national_id_number,date_of_birth,passport_expiry_date,status,created_at,front_document_path,back_document_path,selfie_document_path').eq('status',status).order('created_at',{ascending:false}).limit(40);
 if(error){host.textContent=error.message;return;}
 if(!data||!data.length){host.textContent='No KYC applications';return;}
 host.innerHTML=data.map(x=>'<article class="hwc-record"><div><strong>'+[x.first_name,x.last_name].filter(Boolean).join(' ')+'</strong><small>'+[x.country,x.province,x.mobile_number||'',new Date(x.created_at).toLocaleString()].join(' · ')+'</small><small>'+x.document_type+': '+x.national_id_number+'</small><small>Birth date: '+(x.date_of_birth||'—')+(x.passport_expiry_date?' · Passport expiry: '+x.passport_expiry_date:'')+'</small><small>Member: '+x.user_id+'</small><div class="hwc-admin-actions"><button data-kyc-file="'+x.front_document_path+'">'+(x.document_type==='Passport'?'Passport page':'Front ID')+'</button>'+(x.back_document_path?'<button data-kyc-file="'+x.back_document_path+'">Back ID</button>':'')+'<button data-kyc-file="'+x.selfie_document_path+'">Selfie</button></div></div><div>'+statusBadge(x.status)+(x.status==='pending'?'<div class="hwc-admin-actions"><button data-kyc-review="approved" data-kyc-id="'+x.id+'">Approve</button><button data-kyc-review="rejected" data-kyc-id="'+x.id+'">Reject</button></div>':'')+'</div></article>').join('');
}
document.querySelectorAll('[data-kyc-category]').forEach(b=>b.addEventListener('click',()=>loadKyc(b.dataset.kycCategory).catch(e=>notify(e.message))));
adminList?.addEventListener('click',async e=>{
 const file=e.target.closest('[data-kyc-file]');if(file){try{const {data,error}=await hwcSupabase.storage.from('kyc-documents').createSignedUrl(file.dataset.kycFile,120);if(error)throw error;window.open(data.signedUrl,'_blank','noopener');}catch(err){notify(err.message);}return;}
 const review=e.target.closest('[data-kyc-review]');if(review){let reason=null;if(review.dataset.kycReview==='rejected'){reason=prompt('Reason for rejection (required):')||'';if(!reason.trim())return notify('A rejection reason is required.');}review.disabled=true;const {error}=await hwcSupabase.from('kyc_applications').update({status:review.dataset.kycReview,rejection_reason:reason}).eq('id',review.dataset.kycId);if(error){notify(error.message);review.disabled=false;}else{notify('KYC application reviewed.');await loadKyc(window.currentAdminKycCategory||'requests');if(window.__HWC_USER)await window.loadHwcProfile(window.__HWC_USER);}}
});
const nav=$('.admin-nav-btn');if(nav)nav.addEventListener('click',()=>{if(window.HEWAD_USER_ROLE==='admin')setTimeout(()=>{const v=$('adminKyc');if(v&&!v.hidden)loadKyc('requests');},0);});
window.hwcLoadAdminKyc=loadKyc;
if(window.hwcSessionRestorePromise)window.hwcSessionRestorePromise.then(()=>{if(window.__HWC_USER&&window.loadHwcProfile)window.loadHwcProfile(window.__HWC_USER).catch(e=>console.warn(e));});
})();
