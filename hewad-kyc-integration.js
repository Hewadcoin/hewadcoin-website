/* HEWAD COIN — legacy-site production KYC integration. Signup scripts remain untouched. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const notify=m=>{if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
const esc=v=>String(v==null?'':v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));
const adminStyle=document.createElement('style');adminStyle.textContent='#memberCard{box-sizing:border-box!important;width:calc(100% - 24px)!important;max-width:560px!important;margin:10px auto!important;padding:14px!important}#memberCard h1,#memberCard h2,#memberCard h3{font-size:clamp(14px,3.5vw,20px)!important;line-height:1.2!important}#memberCard .hwc-card-title{font-size:clamp(14px,3.6vw,19px)!important}#memberDialCode{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;min-width:44px!important;min-height:28px!important;padding:3px 8px!important;box-sizing:border-box!important;font-size:14px!important;line-height:1!important;white-space:nowrap!important}#addCardBtn[hidden]{display:none!important}.hwc-kyc-admin-card{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;margin:12px 0;padding:14px;border:1px solid #8d6d2b;border-radius:15px;background:linear-gradient(145deg,#1b1a17,#101216);color:#f4f1e9}.hwc-kyc-admin-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.hwc-kyc-admin-heading strong{font-size:15px;color:#f3d477}.hwc-kyc-admin-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.hwc-kyc-admin-field{min-width:0;padding:9px;border:1px solid #393b40;border-radius:9px;background:#11151a}.hwc-kyc-admin-field small{display:block;margin-bottom:4px;color:#c2a45d;font-size:10px}.hwc-kyc-admin-field b{display:block;overflow-wrap:anywhere;font-size:12px;font-weight:700}.hwc-kyc-admin-docs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hwc-kyc-admin-doc{min-width:0;padding:6px;border:1px solid #6f5829;border-radius:10px;background:#11151a;color:#f3d477;font-size:10px;text-align:center}.hwc-kyc-admin-doc img{display:block;width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:6px;background:#090b0f}.hwc-kyc-admin-actions{display:flex;gap:8px}.hwc-kyc-admin-actions button{flex:1;min-height:40px;border:0;border-radius:9px;font-weight:800}.hwc-kyc-admin-actions [data-kyc-review=approved]{background:#218653;color:#fff}.hwc-kyc-admin-actions [data-kyc-review=rejected]{background:#a83a3a;color:#fff}.hwc-kyc-admin-meta{color:#aeb3bc;font-size:10px;overflow-wrap:anywhere}@media(max-width:380px){.hwc-kyc-admin-fields{grid-template-columns:1fr}.hwc-kyc-admin-doc img{height:82px}}';document.head.appendChild(adminStyle);
const originalLoad=window.loadHwcProfile;
if(typeof originalLoad==='function'){
 window.loadHwcProfile=async function(user){
  await originalLoad.apply(this,arguments);
  if(!user)return;
  window.__HWC_USER=user;
  const [p,w,r]=await Promise.all([
   hwcSupabase.from('profiles').select('first_name,last_name,mobile_number,referral_code,card_number,country,kyc_country,kyc_status,account_status,created_at,card_created_at,avatar_url').eq('id',user.id).maybeSingle(),
   hwcSupabase.from('wallets').select('balance_hwc,balance_usd,balance_afn').eq('user_id',user.id).maybeSingle(),
   hwcSupabase.from('user_roles').select('role').eq('user_id',user.id)
  ]);
  if(p.error)console.warn('KYC profile:',p.error.message);
  const profile=p.data||{},wallet=w.data||{},status=profile.kyc_status||'not_verified';
  window.HEWAD_KYC_STATUS=status;
  window.HEWAD_USER_ROLE=(r.data||[]).some(x=>x.role==='admin')?'admin':'member';
  const put=(id,v)=>{const el=$(id);if(el)el.textContent=v==null?'':String(v);};
  put('memberName',[profile.first_name,profile.last_name].filter(Boolean).join(' ')||user.email||'MEMBER');
  put('memberCountry',status==='approved'?(profile.kyc_country||profile.country||'—'):'—');
  const cardDate=profile.card_created_at||null;
  const cardDateText=status==='approved'&&cardDate?new Date(cardDate).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'}):'—';
  const cardDateEl=$('memberCardCreatedAt')||$('cardCreatedAt')||document.querySelector('[data-card-created-at]');
  if(cardDateEl)cardDateEl.textContent=cardDateText;
  const cardRoot=$('memberCard');
  if(cardRoot){
    for(const el of cardRoot.querySelectorAll('*')){
      if(el.children.length===0&&/CARD CREATED/i.test(el.textContent||'')){
        el.textContent='CARD CREATED: '+cardDateText;
        break;
      }
    }
  }
  put('memberCardNumber',profile.card_number||'—');
  put('profileKycStatus',status==='approved'?'Verified':status==='pending'?'Pending':status==='rejected'?'Rejected':'Unverified');
  put('cardKycStatus',status==='approved'?'ACTIVE':status==='pending'?'KYC PENDING':status==='rejected'?'KYC REJECTED':'KYC NOT VERIFIED');
  const dial={Afghanistan:'+93',Pakistan:'+92',India:'+91',Iran:'+98','United Arab Emirates':'+971','Saudi Arabia':'+966',Turkey:'+90','United States':'+1','United Kingdom':'+44',Canada:'+1',Australia:'+61',Germany:'+49',France:'+33',China:'+86'};
  const flags={Afghanistan:'🇦🇫',Pakistan:'🇵🇰',India:'🇮🇳',Iran:'🇮🇷','United Arab Emirates':'🇦🇪','Saudi Arabia':'🇸🇦',Turkey:'🇹🇷','United States':'🇺🇸','United Kingdom':'🇬🇧',Canada:'🇨🇦',Australia:'🇦🇺',Germany:'🇩🇪',France:'🇫🇷',China:'🇨🇳'};
  const verifiedCountry=status==='approved'?(profile.kyc_country||profile.country||''):'';
  const iso=verifiedCountry?new Intl.DisplayNames(['en'],{type:'region'}):null;
  const codes='AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
  const region=verifiedCountry?codes.find(code=>{try{return iso.of(code).toLowerCase()===verifiedCountry.toLowerCase();}catch(e){return false;}}):null;
  const flag=region?String.fromCodePoint(...[...region].map(ch=>127397+ch.charCodeAt(0))):'';
  put('memberDialCode',status==='approved'?(flag||'🌐')+' '+(dial[verifiedCountry]||''):'');
  const addCard=$('addCardBtn');if(addCard)addCard.hidden=status==='approved';
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
 const {data,error}=await hwcSupabase.from('kyc_applications').select('id,user_id,first_name,last_name,country,province,district,mobile_number,document_type,national_id_number,date_of_birth,passport_expiry_date,status,rejection_reason,created_at,front_document_path,back_document_path,selfie_document_path').eq('status',status).order('created_at',{ascending:false}).limit(40);
 if(error){host.textContent=error.message;return;}
 if(!data||!data.length){host.innerHTML='<div class="hwc-kyc-admin-card"><strong>No KYC applications</strong></div>';return;}
 const cards=await Promise.all(data.map(async x=>{
  const docs=[['front_document_path',x.document_type==='Passport'?'د پاسپورټ پاڼه':'د تذکرې مخ'],['back_document_path','د تذکرې شا'],['selfie_document_path','سلفي']].filter(([key])=>x[key]);
  const previews=await Promise.all(docs.map(async ([key,label])=>{
   const path=x[key];let url='';
   try{const signed=await hwcSupabase.storage.from('kyc-documents').createSignedUrl(path,600);if(!signed.error)url=signed.data.signedUrl;}catch(_){}
   return '<button type="button" class="hwc-kyc-admin-doc" data-kyc-file="'+esc(path)+'">'+(url?'<img src="'+esc(url)+'" alt="'+esc(label)+'">':'<span style="display:block;padding:25px 0">📄</span>')+esc(label)+'</button>';
  }));
  const field=(label,value)=>'<div class="hwc-kyc-admin-field"><small>'+label+'</small><b>'+esc(value||'—')+'</b></div>';
  return '<article class="hwc-kyc-admin-card"><div class="hwc-kyc-admin-heading"><strong>'+esc([x.first_name,x.last_name].filter(Boolean).join(' ')||'غړی')+'</strong>'+statusBadge(x.status)+'</div><div class="hwc-kyc-admin-fields">'+field('د سند ډول',x.document_type)+field('ID / د سند شمېره',x.national_id_number)+field('نوم',x.first_name)+field('تخلص',x.last_name)+field('د زېږېدو نېټه',x.date_of_birth)+field('هېواد',x.country)+field('ولایت',x.province)+field('ولسوالۍ',x.district)+field('د اړیکې شمېره',x.mobile_number)+'</div><div class="hwc-kyc-admin-docs">'+previews.join('')+'</div><div class="hwc-kyc-admin-meta">د غوښتنې نېټه: '+esc(new Date(x.created_at).toLocaleString())+' · د غړي ID: '+esc(x.user_id)+'</div>'+(x.rejection_reason?'<div class="hwc-kyc-admin-meta">د رد دلیل: '+esc(x.rejection_reason)+'</div>':'')+(x.status==='pending'?'<div class="hwc-kyc-admin-actions"><button type="button" data-kyc-review="approved" data-kyc-id="'+esc(x.id)+'">تایید</button><button type="button" data-kyc-review="rejected" data-kyc-id="'+esc(x.id)+'">رد</button></div>':'')+'</article>';
 }));
 host.innerHTML=cards.join('');
}
document.querySelectorAll('[data-kyc-category]').forEach(b=>b.addEventListener('click',()=>loadKyc(b.dataset.kycCategory).catch(e=>notify(e.message))));
adminList?.addEventListener('click',async e=>{
 const file=e.target.closest('[data-kyc-file]');if(file){try{const {data,error}=await hwcSupabase.storage.from('kyc-documents').createSignedUrl(file.dataset.kycFile,120);if(error)throw error;window.open(data.signedUrl,'_blank','noopener');}catch(err){notify(err.message);}return;}
 const review=e.target.closest('[data-kyc-review]');if(review){
  let reason=null;
  if(review.dataset.kycReview==='rejected'){reason=prompt('Write the rejection reason. This message will be sent to the member:')||'';if(!reason.trim())return notify('A rejection reason is required.');}
  review.disabled=true;
  try{
   const {data,error}=await hwcSupabase.from('kyc_applications')
    .update({status:review.dataset.kycReview,rejection_reason:reason})
    .eq('id',review.dataset.kycId).select('id,status').single();
   if(error)throw error;
   if(!data)throw new Error('The review could not be confirmed.');
   notify(review.dataset.kycReview==='approved'?'KYC approved. The member card is now activated.':'KYC rejected. The reason was sent to the member.');
   await loadKyc(window.currentAdminKycCategory||'requests');
   if(window.__HWC_USER)await window.loadHwcProfile(window.__HWC_USER);
  }catch(err){console.error('HEWAD admin KYC review:',err);notify(err.message||'KYC review failed.');review.disabled=false;}
 }
});
const nav=$('.admin-nav-btn');if(nav)nav.addEventListener('click',()=>{if(window.HEWAD_USER_ROLE==='admin')setTimeout(()=>{const v=$('adminKyc');if(v&&!v.hidden)loadKyc('requests');},0);});
window.hwcLoadAdminKyc=loadKyc;
if(window.hwcSessionRestorePromise)window.hwcSessionRestorePromise.then(()=>{if(window.__HWC_USER&&window.loadHwcProfile)window.loadHwcProfile(window.__HWC_USER).catch(e=>console.warn(e));});
})();
