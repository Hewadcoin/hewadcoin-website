/* HEWAD COIN — legacy-site production KYC integration. Signup scripts remain untouched. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const notify=m=>{if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const adminStyle=document.createElement('style');adminStyle.textContent=".dash-shell{width:100%!important;max-width:none!important;padding:10px 8px 24px!important}.dash-top{margin-bottom:8px!important}.hwc-card{width:100%!important;max-width:none!important;margin:0!important;padding:12px 10px 10px!important;border-radius:16px!important}.hwc-card-head{margin-bottom:8px!important}.hwc-coin-logo{width:44px!important;height:44px!important;font-size:27px!important}.hwc-section-label{margin-bottom:5px!important}.hwc-field{margin:5px 0 7px!important}.hwc-card-foot{margin-top:6px!important;padding-top:7px!important}.add-card-btn{margin-top:8px!important;padding:8px!important}#memberCard{display:block!important;position:relative!important;left:auto!important;right:auto!important;box-sizing:border-box!important;width:100%!important;max-width:none!important;min-width:0!important;zoom:1!important;transform:none!important;margin:0 auto 8px!important;padding:12px 10px 10px!important;border-radius:16px!important;overflow:hidden!important}html,body{max-width:100%!important;overflow-x:hidden!important}#memberCard *{max-width:100%;box-sizing:border-box}#memberCard h1,#memberCard h2,#memberCard h3{font-size:clamp(13px,3.2vw,18px)!important;line-height:1.16!important;margin-top:4px!important;margin-bottom:6px!important}#memberCard p{line-height:1.2!important;margin-top:4px!important;margin-bottom:5px!important}#memberCard .hwc-card-title{font-size:clamp(13px,3.3vw,18px)!important}.hwc-add-card-hidden{display:none!important;visibility:hidden!important;pointer-events:none!important} .hwc-country-flag{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:27px!important;min-width:27px!important;height:19px!important;min-height:19px!important;margin-inline-end:5px!important;padding:0!important;border:1px solid #d7b65a!important;border-radius:0!important;background:#fff!important;font-size:19px!important;line-height:1!important;vertical-align:middle!important;overflow:hidden!important;box-sizing:border-box!important}#memberDialCode{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:0!important;width:48px!important;min-width:48px!important;height:32px!important;min-height:32px!important;padding:0!important;box-sizing:border-box!important;border:1px solid #d7b65a!important;border-radius:2px!important;background:#111!important;color:#fff!important;font-size:22px!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;visibility:visible!important;opacity:1!important;clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}#addCardBtn[hidden]{display:none!important}.hwc-kyc-admin-card{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin:12px 0;padding:14px;border:1px solid #8d6d2b;border-radius:15px;background:linear-gradient(145deg,#1b1a17,#101216);color:#f4f1e9}.hwc-kyc-admin-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.hwc-kyc-admin-heading strong{font-size:15px;color:#f3d477}.hwc-kyc-admin-table{width:100%;border-collapse:collapse;border:1px solid #383a3f;border-radius:10px;overflow:hidden}.hwc-kyc-admin-table tr{border-bottom:1px solid #34363b}.hwc-kyc-admin-table tr:last-child{border-bottom:0}.hwc-kyc-admin-table th,.hwc-kyc-admin-table td{padding:9px 10px;text-align:start;vertical-align:top;font-size:12px;line-height:1.5}.hwc-kyc-admin-table th{width:34%;color:#d7b65a;font-weight:700;background:#17191d}.hwc-kyc-admin-table td{color:#f5f2e9;overflow-wrap:anywhere;background:#111419}.hwc-kyc-admin-docs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.hwc-kyc-admin-doc{display:block;min-width:0;padding:7px;border:1px solid #6f5829;border-radius:10px;background:#11151a;color:#f3d477;font-size:11px;text-align:center}.hwc-kyc-admin-doc img{display:block;width:100%;height:135px;object-fit:contain;border-radius:6px;margin-bottom:6px;background:#090b0f}.hwc-kyc-admin-actions{display:flex;gap:8px}.hwc-kyc-admin-actions button{flex:1;min-height:42px;border:0;border-radius:9px;font-weight:800}.hwc-kyc-admin-actions [data-kyc-review=approved]{background:#218653;color:#fff}.hwc-kyc-admin-actions [data-kyc-review=rejected]{background:#a83a3a;color:#fff}.hwc-kyc-admin-meta{color:#aeb3bc;font-size:10px;overflow-wrap:anywhere}.hwc-kyc-duplicate{padding:12px;border:1px solid #ed4d59;border-radius:12px;background:#38171b;color:#ffe8e9}.hwc-kyc-duplicate h4{margin:0 0 8px;color:#ff737d;font-size:14px}.hwc-kyc-duplicate p{margin:5px 0;font-size:11px;line-height:1.5}.hwc-kyc-image-modal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:18px;background:#000e}.hwc-kyc-image-modal[hidden]{display:none}.hwc-kyc-image-modal img{max-width:96vw;max-height:84vh;object-fit:contain;border:1px solid #d3b45d;border-radius:12px}.hwc-kyc-image-modal button{position:absolute;top:18px;right:18px;width:42px;height:42px;border:1px solid #d3b45d;border-radius:50%;background:#171717;color:#fff;font-size:22px}@media(max-width:380px){.hwc-kyc-admin-table th,.hwc-kyc-admin-table td{padding:8px 7px;font-size:11px}.hwc-kyc-admin-doc img{height:105px}}";document.head.appendChild(adminStyle);
let __hwcLatestKycStatus='not_verified';
function applyAddCardVisibility(status){
 __hwcLatestKycStatus=status||__hwcLatestKycStatus;
 const badgeText=($('cardKycStatus')?.textContent||'').trim().toUpperCase();
 const approved=__hwcLatestKycStatus==='approved'||badgeText==='ACTIVE'||badgeText==='KYC VERIFIED';
 if(approved)window.HEWAD_KYC_STATUS='approved';
 const direct=$('addCardBtn');
 if(direct){direct.hidden=approved;direct.style.setProperty('display',approved?'none':'','important');}
 const root=$('memberCard')||document;
 root.querySelectorAll('*').forEach(el=>{
  const label=(el.innerText||el.textContent||'').replace(/[+＋]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  if(label!=='add card')return;
  const target=el.closest('button,a,[role="button"],.add-card,.add-card-btn,[id*="addCard"]')||el;
  if(approved){target.classList.add('hwc-add-card-hidden');target.setAttribute('aria-hidden','true');target.setAttribute('tabindex','-1');}
  else{target.classList.remove('hwc-add-card-hidden');target.removeAttribute('aria-hidden');target.removeAttribute('tabindex');}
 });
}
document.documentElement.style.setProperty('overflow-x','hidden','important');
if(document.body)document.body.style.setProperty('overflow-x','hidden','important');
const addCardObserver=new MutationObserver(()=>applyAddCardVisibility(__hwcLatestKycStatus));
const cardObserverRoot=$('memberCard');
if(cardObserverRoot)addCardObserver.observe(cardObserverRoot,{childList:true,subtree:true,characterData:true});
function syncCardStatusAndCountry(){
 const badge=$('cardKycStatus');
 const label=(badge?.textContent||'').trim().toUpperCase();
 if(label==='KYC VERIFIED'||label==='ACTIVE'){
  window.HEWAD_KYC_STATUS='approved';
  __hwcLatestKycStatus='approved';
 }else if(label==='KYC PENDING'){window.HEWAD_KYC_STATUS='pending';__hwcLatestKycStatus='pending';}
 else if(label==='KYC REJECTED'){window.HEWAD_KYC_STATUS='rejected';__hwcLatestKycStatus='rejected';}
 applyAddCardVisibility(__hwcLatestKycStatus);
 const countryEl=$('memberCountry');
 if(countryEl){
  const country=countryEl.textContent.replace(/[\u{1F1E6}-\u{1F1FF}]/gu,'').trim();
  if(country&&country!=='—'){
   const codes='AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CL CN CO KM CG CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GN GW GY HT HN HU IS IN ID IR IQ IE IL JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
   const names=new Intl.DisplayNames(['en'],{type:'region'});
   const code=codes.find(c=>{try{return names.of(c).toLowerCase()===country.toLowerCase();}catch(_){return false;}});
   const flag=code?String.fromCodePoint(...[...code].map(ch=>127397+ch.charCodeAt(0))):'';
   if(flag&&countryEl.dataset.hwcFlagCountry!==country){
    countryEl.dataset.hwcFlagCountry=country;
    countryEl.innerHTML='<span class="hwc-country-flag" role="img" aria-label="'+esc(country)+'">'+flag+'</span> '+esc(country);
   }
  }
 }
}
const cardStateObserver=new MutationObserver(syncCardStatusAndCountry);
['cardKycStatus','memberCountry'].forEach(id=>{const el=$(id);if(el)cardStateObserver.observe(el,{childList:true,subtree:true,characterData:true});});
syncCardStatusAndCountry();
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
  window.HEWAD_KYC_STATUS=status;applyAddCardVisibility(status);
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
  const countryEl=$('memberCountry');
  if(countryEl){
   const countryText=status==='approved'?verifiedCountry:'';
   countryEl.innerHTML=status==='approved'&&flag?'<span class="hwc-country-flag" role="img" aria-label="'+esc(countryText)+'">'+flag+'</span> '+esc(countryText):esc(countryText||'—');
  }
  put('memberDialCode',status==='approved'?(flag||'🌐'):'');
  applyAddCardVisibility(status);
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
async function signedKycImage(path,label){
 if(!path)return '';
 try{const {data,error}=await hwcSupabase.storage.from('kyc-documents').createSignedUrl(path,600);if(error||!data?.signedUrl)return '';return '<button type="button" class="hwc-kyc-admin-doc" data-kyc-file="'+esc(path)+'"><img src="'+esc(data.signedUrl)+'" alt="'+esc(label)+'">'+esc(label)+'</button>';}catch(_){return '';}
}
async function loadDuplicateDetails(documentId,excludeUserId){
 const {data,error}=await hwcSupabase.rpc('hwc_find_duplicate_kyc_document',{p_document_id:documentId,p_exclude_user_id:excludeUserId});
 if(error)throw error;
 return Array.isArray(data)?data:[];
}
async function loadKyc(category){
 const host=ensureHost();if(!host)return;
 const status=category==='requests'?'pending':category;window.currentAdminKycCategory=category;
 host.innerHTML='<p>Loading…</p>';
 const {data,error}=await hwcSupabase.from('kyc_applications').select('id,user_id,first_name,last_name,country,province,district,mobile_number,document_type,national_id_number,date_of_birth,passport_expiry_date,status,rejection_reason,created_at,front_document_path,back_document_path,selfie_document_path').eq('status',status).order('created_at',{ascending:false}).limit(40);
 if(error){host.textContent=error.message;return;}
 if(!data||!data.length){host.classList.add('hwc-kyc-admin-card');host.innerHTML='<strong>No KYC applications</strong>';return;}
 host.classList.remove('admin-empty','hwc-kyc-admin-card');adminList.querySelectorAll('.admin-empty').forEach(el=>{if(el!==host)el.remove();});
 const cards=await Promise.all(data.map(async x=>{
  const [front,back,selfie,duplicates]=await Promise.all([
   signedKycImage(x.front_document_path,x.document_type==='Passport'?'د پاسپورټ عکس':'د تذکرې مخ عکس'),
   signedKycImage(x.back_document_path,'د تذکرې شاه عکس'),
   signedKycImage(x.selfie_document_path,'د مالک سلفي عکس'),
   loadDuplicateDetails(x.national_id_number,x.user_id).catch(err=>{console.error('Duplicate KYC lookup:',err);return null;})
  ]);
  const field=(label,value)=>'<tr><th>'+label+'</th><td>'+esc(value||'—')+'</td></tr>';
  let duplicateHtml='';
  if(duplicates===null){
   duplicateHtml='<div class="hwc-kyc-duplicate"><h4>⚠️ د سند د تکرار پلټنه بشپړه نه شوه</h4><p>سیستم د ډیټابېس څخه د تکراري سند پایله ترلاسه نه کړه. د امنیت لپاره د تایید تڼۍ بنده ده؛ اډمین دې تر حل کېدو پورې غوښتنه رد یا وځنډوي.</p></div>';
  }else if(duplicates.length){
   const duplicateCards=await Promise.all(duplicates.map(async d=>{
    const [df,db,ds]=await Promise.all([
     signedKycImage(d.front_document_path,'د بل حساب د سند مخ'),
     signedKycImage(d.back_document_path,'د بل حساب د سند شا'),
     signedKycImage(d.selfie_document_path,'د بل حساب سلفي')
    ]);
    const duplicateField=(label,value)=>'<tr><th>'+label+'</th><td>'+esc(value||'—')+'</td></tr>';
    return '<section class="hwc-kyc-duplicate"><h4>⚠️ دا سند له بل حساب سره هم ثبت دی — د بل حساب بشپړ معلومات</h4><table class="hwc-kyc-admin-table"><tbody>'+duplicateField('د حساب مالک',[d.first_name,d.last_name].filter(Boolean).join(' '))+duplicateField('برېښنالیک',d.email)+duplicateField('د سند ډول',d.document_type)+duplicateField('د سند ID',d.national_id_number)+duplicateField('د زېږېدو نېټه',d.date_of_birth)+duplicateField('هېواد',d.country)+duplicateField('ولایت',d.province)+duplicateField('ولسوالۍ',d.district)+duplicateField('موبایل',d.mobile_number)+duplicateField('د کارت نمبر',d.card_number)+duplicateField('د حساب حالت',d.status)+duplicateField('د حساب ID',d.user_id)+'</tbody></table><div class="hwc-kyc-admin-docs">'+df+db+ds+'</div></section>';
   }));
   duplicateHtml=duplicateCards.join('');
  }
  const docs='<div class="hwc-kyc-admin-docs">'+front+back+'</div><div class="hwc-kyc-admin-docs">'+selfie+'<div class="hwc-kyc-admin-field"><small>د اسنادو معلومات</small><b>'+esc(x.document_type||'—')+'</b><p style="font-size:11px;line-height:1.5;margin:7px 0 0">د سند شمېره: '+esc(x.national_id_number||'—')+'<br>د زېږېدو نېټه: '+esc(x.date_of_birth||'—')+'</p></div></div>';
  const duplicateBlocks=duplicateHtml;
  const allowApprove=x.status==='pending'&&duplicates!==null&&duplicates.length===0;
  return '<article class="hwc-kyc-admin-card"><div class="hwc-kyc-admin-heading"><strong>'+esc([x.first_name,x.last_name].filter(Boolean).join(' ')||'غړی')+'</strong>'+statusBadge(x.status)+'</div>'+duplicateBlocks+'<table class="hwc-kyc-admin-table"><tbody>'+field('ای ډي / د سند شمېره',x.national_id_number)+field('نوم',x.first_name)+field('تخلص',x.last_name)+field('د زېږېدو نېټه',x.date_of_birth)+field('هېواد',x.country)+field('ولایت',x.province)+field('ولسوالۍ',x.district)+field('د اړیکې شمېره',x.mobile_number)+field('د اسنادو ډول',x.document_type==='Passport'?'پاسپورټ':'تذکره')+(x.document_type==='Passport'?field('د پاسپورټ د پای نېټه',x.passport_expiry_date):'')+'</tbody></table>'+docs+'<div class="hwc-kyc-admin-meta">د غوښتنې نېټه: '+esc(new Date(x.created_at).toLocaleString())+' · د غړي ID: '+esc(x.user_id)+'</div>'+(x.rejection_reason?'<div class="hwc-kyc-admin-meta">د رد دلیل: '+esc(x.rejection_reason)+'</div>':'')+(x.status==='pending'?'<div class="hwc-kyc-admin-actions">'+(allowApprove?'<button type="button" data-kyc-review="approved" data-kyc-id="'+esc(x.id)+'">تایید</button>':'<button type="button" disabled title="لومړی د تکراري سند پلټنه بشپړه کړئ">تایید بند دی</button>')+'<button type="button" data-kyc-review="rejected" data-kyc-id="'+esc(x.id)+'">رد</button></div>':'')+'</article>';
 }));
 host.innerHTML=cards.join('');
}
document.querySelectorAll('[data-kyc-category]').forEach(b=>b.addEventListener('click',()=>loadKyc(b.dataset.kycCategory).catch(e=>notify(e.message))));
adminList?.addEventListener('click',async e=>{
 const file=e.target.closest('[data-kyc-file]');if(file){const img=file.querySelector('img');if(img){let modal=document.getElementById('hwcKycImageModal');if(!modal){modal=document.createElement('div');modal.id='hwcKycImageModal';modal.className='hwc-kyc-image-modal';modal.hidden=true;modal.innerHTML='<button type="button" aria-label="Close">×</button><img alt="KYC document preview">';document.body.appendChild(modal);modal.addEventListener('click',ev=>{if(ev.target===modal||ev.target.tagName==='BUTTON')modal.hidden=true;});}modal.querySelector('img').src=img.src;modal.querySelector('img').alt=img.alt;modal.hidden=false;}return;}
 const review=e.target.closest('[data-kyc-review]');if(review){
  let reason=null;
  if(review.dataset.kycReview==='rejected'){reason=prompt('Write the rejection reason. This message will be sent to the member:')||'';if(!reason.trim())return notify('A rejection reason is required.');}
  review.disabled=true;
  try{
   if(review.dataset.kycReview==='approved'){
    const {data:current,error:readError}=await hwcSupabase.from('kyc_applications').select('national_id_number,user_id').eq('id',review.dataset.kycId).single();
    if(readError)throw readError;
    const matches=await loadDuplicateDetails(current.national_id_number,current.user_id);
    if(matches.length){notify('دا تذکره/پاسپورټ د بل حساب سره هم ثبت دی. د تکراري حساب بشپړ معلومات په همدې KYC کارت کې وګورئ؛ تایید بند شو.');await loadKyc(window.currentAdminKycCategory||'requests');review.disabled=false;return;}
   }
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
