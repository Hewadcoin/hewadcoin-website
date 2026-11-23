/* HEWAD COIN — legacy-site production KYC integration. Signup scripts remain untouched. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const notify=m=>{if(typeof window.showNotice==='function')window.showNotice(m);else alert(m);};
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dashboardPolish=document.createElement('style');
dashboardPolish.id='hwc-dashboard-card-polish';
dashboardPolish.textContent=`
#dashboard.screen{justify-content:flex-start!important;align-items:stretch!important;padding:0 0 82px!important}
#dashboard.screen.active{display:flex!important}
#dashboard .dash-shell{width:100%!important;max-width:none!important;min-height:100vh!important;min-height:100dvh!important;padding:4px 0 calc(92px + env(safe-area-inset-bottom))!important;margin:0!important;box-sizing:border-box!important}
#dashboard .dash-top{margin:0 8px 4px!important;min-height:36px!important}
#dashboard .dash-brand{gap:7px!important;font-size:15px!important;letter-spacing:1px!important}
#dashboard .dash-brand-mark{width:32px!important;height:32px!important;font-size:21px!important}
#dashboard .dash-top-actions{gap:6px!important}
#dashboard .dash-top-actions button{width:32px!important;height:32px!important;font-size:15px!important}
#dashboard #memberCard:not([hidden]){display:block!important;position:relative!important;width:calc(100% - 8px)!important;max-width:none!important;min-width:0!important;margin:0 4px 6px!important;padding:9px 10px 7px!important;border-radius:15px!important;box-sizing:border-box!important;transform:none!important;zoom:1!important}
#dashboard #memberCard[hidden]{display:none!important}
#memberCard .hwc-card-head{margin-bottom:6px!important;gap:6px!important}
#memberCard .hwc-logo-name{gap:7px!important}
#memberCard .hwc-coin-logo{width:35px!important;height:35px!important;font-size:23px!important}
#memberCard .hwc-card-title{font-size:13px!important;letter-spacing:1px!important}
#memberCard .hwc-card-subtitle{font-size:8px!important;letter-spacing:1.4px!important}
#memberCard .hwc-status{font-size:8px!important;letter-spacing:.5px!important;padding:4px 7px!important;white-space:nowrap!important}
#memberCard .hwc-card-columns{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important}
#memberCard .hwc-card-col{min-width:0!important}
#memberCard .hwc-card-col+.hwc-card-col{padding-left:8px!important}
#memberCard .hwc-section-label{font-size:8px!important;letter-spacing:1.1px!important;margin-bottom:4px!important}
#memberCard .hwc-field{margin:3px 0 5px!important}
#memberCard .hwc-field-label{font-size:7px!important;letter-spacing:1px!important;margin-bottom:2px!important}
#memberCard .hwc-field-value{font-size:12px!important;line-height:1.2!important}
#memberCard .hwc-balance-main{font-size:18px!important;line-height:1.05!important}
#memberCard .hwc-number-line{gap:4px!important;flex-wrap:wrap!important}
#memberCard .hwc-copy{font-size:9px!important;padding:4px 6px!important}
#memberCard .hwc-card-foot{margin-top:5px!important;padding-top:5px!important;gap:6px!important}
#memberCard .hwc-card-chip{width:29px!important;height:20px!important;border-radius:5px!important}
#memberCard .hwc-card-chip-group{display:inline-flex!important;align-items:center!important;gap:6px!important;flex:0 0 auto!important}
#memberCard .hwc-card-country-flag{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:29px!important;height:20px!important;min-width:29px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;font-size:17px!important;line-height:1!important;overflow:hidden!important;box-sizing:border-box!important}
#memberCard .hwc-card-country-flag[hidden]{display:none!important}
#memberCard .hwc-card-date{font-size:8px!important;letter-spacing:.7px!important}
#memberCard .add-card-btn{width:100%!important;margin-top:6px!important;padding:7px 8px!important;font-size:12px!important;border-radius:9px!important}
#dashboard .dash-section-title{margin:12px 8px 10px!important;font-size:14px!important;letter-spacing:1.4px!important}
#dashboard .dash-grid{margin:0 8px!important;gap:11px!important}
#dashboard .dash-bottom-nav{left:0!important;transform:none!important;width:100%!important;max-width:none!important}
.hwc-kyc-admin-card{display:block;margin:12px 0;padding:13px;border:1px solid #8d6d2b;border-radius:15px;background:linear-gradient(145deg,#1b1a17,#101216);color:#f4f1e9}
.hwc-kyc-admin-table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:9px}
.hwc-kyc-admin-table tr{border-bottom:1px solid #34363b}
.hwc-kyc-admin-table th,.hwc-kyc-admin-table td{padding:7px 8px;text-align:start;vertical-align:top;font-size:11px;line-height:1.45;overflow-wrap:anywhere}
.hwc-kyc-admin-table th{width:34%;color:#d7b65a;background:#17191d}
.hwc-kyc-admin-table td{color:#f5f2e9;background:#111419}
.hwc-kyc-admin-photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}
.hwc-kyc-admin-photo{min-width:0;padding:7px;border:1px solid #655020;border-radius:10px;background:#0d1015}
.hwc-kyc-admin-photo b{display:block;margin-bottom:6px;color:#e7ca78;font-size:10px}
.hwc-kyc-admin-photo img{display:block;width:100%;height:160px;object-fit:contain;border-radius:6px;background:#050607}
.hwc-kyc-admin-photo-empty{height:160px;display:grid;place-items:center;color:#999;font-size:10px}
.hwc-kyc-admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
@media(max-width:380px){#memberCard .hwc-card-title{font-size:12px!important}#memberCard .hwc-field-value{font-size:11px!important}#memberCard .hwc-balance-main{font-size:16px!important}.hwc-kyc-admin-photos{grid-template-columns:1fr}.hwc-kyc-admin-photo img{height:210px}}
`;
document.head.appendChild(dashboardPolish);
function countryFlag(name){
 const codes='AF AL DZ AD AO AG AR AM AT AU AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CR CI HR CU CY CZ DK DJ DM DO EC SV GQ ER EE SZ ET FJ FI GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL JM JP JO KZ KE KI KP KR KW KG LA LV LB LR LY LI LT LU MG MW MV MH MY MT MA MX FM MD MC MN ME MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB ZA SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
 const names=new Intl.DisplayNames(['en'],{type:'region'});
 const code=codes.find(c=>{try{return names.of(c).toLowerCase()===String(name||'').trim().toLowerCase();}catch(e){return false;}});
 return code?String.fromCodePoint(...[...code].map(ch=>127397+ch.charCodeAt(0))):'';
}
function syncMemberCardChrome(){
 const card=$('memberCard'),chip=card&&card.querySelector('.hwc-card-chip'),countryEl=$('memberCountry');
 if(!card||!chip||!chip.parentNode)return;
 let group=$('memberCardChipGroup');
 if(!group){
  group=document.createElement('span');group.id='memberCardChipGroup';group.className='hwc-card-chip-group';
  chip.parentNode.insertBefore(group,chip);group.appendChild(chip);
  const flag=document.createElement('span');flag.id='memberCardCountryFlag';flag.className='hwc-card-country-flag';flag.setAttribute('aria-label','Country flag');group.appendChild(flag);
 }
 const flag=$('memberCardCountryFlag'),name=(countryEl&&countryEl.textContent||'').trim();
 if(flag){flag.textContent=countryFlag(name);flag.hidden=!name||name==='—';flag.title=name||'Country';}
}
function applyAddCardVisibility(){
 const button=$('addCardBtn'),badge=($('cardKycStatus')&&$('cardKycStatus').textContent||'').trim().toUpperCase();
 const approved=window.HEWAD_KYC_STATUS==='approved'||badge==='ACTIVE'||badge==='KYC VERIFIED';
 if(button){button.hidden=approved;button.style.setProperty('display',approved?'none':'','important');button.setAttribute('aria-hidden',approved?'true':'false');}
}
function findCardNumberElement(){
 let el=$('memberCardNumber');if(el)return el;
 const root=$('memberCard');if(!root)return null;
 const field=Array.from(root.querySelectorAll('.hwc-field')).find(x=>/CARD NUMBER/i.test((x.querySelector('.hwc-field-label')||{}).textContent||''));
 if(!field)return null;
 el=field.querySelector('.hwc-field-value');
 if(!el){el=document.createElement('span');el.className='hwc-field-value';field.appendChild(el);}
 el.id='memberCardNumber';return el;
}
function bindCardNumberCopy(value,approved){
 const card=$('memberCard'),number=findCardNumberElement();if(!card||!number)return;
 const getCopyValue=()=>String(value||number.textContent||'').trim();
 const canCopy=()=>approved&&!/^(KYC REQUIRED|CARD NUMBER PENDING|—|-)$/i.test(getCopyValue());
 let button=$('copyCardNumber');
 const line=number.closest('.hwc-number-line')||number.parentElement||number;
 if(!button){button=document.createElement('button');button.type='button';button.id='copyCardNumber';button.className='hwc-copy';button.textContent='COPY';line.appendChild(button);}
 const copyNow=async function(){
  if(!canCopy())return;
  const text=getCopyValue();
  try{
   if(navigator.clipboard&&window.isSecureContext){
    await navigator.clipboard.writeText(text);
   }else{
    const area=document.createElement('textarea');
    area.value=text;area.setAttribute('readonly','');
    area.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;';
    document.body.appendChild(area);area.focus();area.select();area.setSelectionRange(0,area.value.length);
    const ok=document.execCommand('copy');area.remove();
    if(!ok)throw new Error('Copy command failed');
   }
   notify('Card number copied.');
  }catch(err){
   notify('Copy failed. Please try again.');
  }
 };
 button.hidden=!canCopy();button.style.setProperty('display',button.hidden?'none':'','important');
 button.onclick=copyNow;
 // The card number itself is a one-tap copy target.
 number.style.cursor=canCopy()?'pointer':'';
 number.setAttribute('role',canCopy()?'button':'');
 number.setAttribute('tabindex',canCopy()?'0':'-1');
 number.setAttribute('aria-label',canCopy()?'Copy card number':'Card number');
 number.onclick=copyNow;
 number.onkeydown=function(event){if((event.key==='Enter'||event.key===' ')&&canCopy()){event.preventDefault();copyNow();}};
}
function renderCardNumber(profile,status){
 const value=status==='approved'?String(profile.card_number||''):'';
 const number=findCardNumberElement();
 if(number)number.textContent=value||(status==='approved'?'CARD NUMBER PENDING':'KYC REQUIRED');
 bindCardNumberCopy(value,status==='approved');
}

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
  const profile=p.data||{},wallet=w.data||{},rawStatus=String(profile.kyc_status||'not_verified').trim().toLowerCase().replace(/[ -]+/g,'_'),status=['approved','verified','active','kyc_verified'].includes(rawStatus)?'approved':rawStatus;
  window.HEWAD_KYC_STATUS=status;
  window.HEWAD_USER_ROLE=(r.data||[]).some(x=>x.role==='admin')?'admin':'member';
  const put=(id,v)=>{const el=$(id);if(el)el.textContent=v==null?'':String(v);};
  put('memberName',[profile.first_name,profile.last_name].filter(Boolean).join(' ')||user.email||'MEMBER');
  put('memberCountry',status==='approved'?(profile.kyc_country||profile.country||'—'):'—');
  syncMemberCardChrome();
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
  renderCardNumber(profile,status);
  put('profileKycStatus',status==='approved'?'Verified':status==='pending'?'Pending':status==='rejected'?'Rejected':'Unverified');
  put('cardKycStatus',status==='approved'?'ACTIVE':status==='pending'?'KYC PENDING':status==='rejected'?'KYC REJECTED':'KYC NOT VERIFIED');
  applyAddCardVisibility();
  const dial={Afghanistan:'+93',Pakistan:'+92',India:'+91',Iran:'+98','United Arab Emirates':'+971','Saudi Arabia':'+966',Turkey:'+90','United States':'+1','United Kingdom':'+44',Canada:'+1',Australia:'+61',Germany:'+49',France:'+33',China:'+86'};
  const flags={Afghanistan:'🇦🇫',Pakistan:'🇵🇰',India:'🇮🇳',Iran:'🇮🇷','United Arab Emirates':'🇦🇪','Saudi Arabia':'🇸🇦',Turkey:'🇹🇷','United States':'🇺🇸','United Kingdom':'🇬🇧',Canada:'🇨🇦',Australia:'🇦🇺',Germany:'🇩🇪',France:'🇫🇷',China:'🇨🇳'};
  const verifiedCountry=status==='approved'?(profile.kyc_country||profile.country||''):'';
  const iso=verifiedCountry?new Intl.DisplayNames(['en'],{type:'region'}):null;
  const codes='AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
  const region=verifiedCountry?codes.find(code=>{try{return iso.of(code).toLowerCase()===verifiedCountry.toLowerCase();}catch(e){return false;}}):null;
  const flag=region?String.fromCodePoint(...[...region].map(ch=>127397+ch.charCodeAt(0))):'';
  put('memberDialCode',status==='approved'?(flag||'🌐')+' '+(dial[verifiedCountry]||''):'');
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
 if(!data||!data.length){host.textContent='No KYC applications';return;}
 const allResult=await hwcSupabase.from('kyc_applications').select('id,user_id,first_name,last_name,country,province,district,document_type,national_id_number,date_of_birth,status,created_at').limit(1000);
 if(allResult.error){host.textContent='د ورته اسنادو د پلټنې ستونزه: '+allResult.error.message;return;}
 const normalizeId=v=>String(v||'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g,'');
 const records=await Promise.all(data.map(async x=>{
  const paths=[{label:x.document_type==='Passport'?'Passport information page':'Tazkira front',path:x.front_document_path},{label:'Tazkira back',path:x.back_document_path},{label:'Selfie',path:x.selfie_document_path}].filter(p=>p.path);
  const photos=await Promise.all(paths.map(async p=>{try{const r=await hwcSupabase.storage.from('kyc-documents').createSignedUrl(p.path,600);return {label:p.label,url:r.error?'':r.data.signedUrl};}catch(e){return {label:p.label,url:''};}}));
  const normalized=normalizeId(x.national_id_number);
  const docType=String(x.document_type||'').toLowerCase().includes('passport')?'passport':'tazkira';
  const duplicates=normalized?allResult.data.filter(y=>y.user_id!==x.user_id&&normalizeId(y.national_id_number)===normalized&&(String(y.document_type||'').toLowerCase().includes('passport')?'passport':'tazkira')===docType):[];
  return {record:x,photos,duplicates};
 }));
 host.innerHTML=records.map(({record:x,photos,duplicates})=>'<article class="hwc-kyc-admin-card"><strong>'+esc([x.first_name,x.last_name].filter(Boolean).join(' '))+'</strong> '+statusBadge(x.status)+(duplicates.length?'<div class="hwc-kyc-duplicate-alert" style="margin:12px 0;padding:12px;border:1px solid #ef4444;border-radius:10px;background:#3b111522;color:#ff7777"><b>⚠ ورته تذکره/پاسپورټ په بل حساب کې هم ثبت دی</b><p>د سند شمېره: '+esc(x.national_id_number)+'</p><b>موندل شوي حسابونه: '+duplicates.length+'</b>'+duplicates.map(d=>'<div style="padding:9px;margin-top:7px;border-top:1px solid #ef444455;color:var(--hwc-text,#fff)"><b>'+esc([d.first_name,d.last_name].filter(Boolean).join(' '))+'</b><br>د کاروونکي حساب ID: '+esc(d.user_id)+'<br>د غوښتنلیک ID: '+esc(d.id)+'<br>د سند ډول: '+esc(d.document_type)+'<br>د تذکرې ID / پاسپورټ نمبر: '+esc(d.national_id_number)+'<br>د زېږېدو نېټه: '+esc(d.date_of_birth||'—')+'<br>هېواد: '+esc(d.country||'—')+'<br>ولایت: '+esc(d.province||'—')+'<br>ولسوالۍ: '+esc(d.district||'—')+'<br>حالت: '+esc(d.status)+'<br>نېټه: '+esc(new Date(d.created_at).toLocaleString())+'</div>').join('')+'</div>':'<div style="margin:10px 0;padding:8px;border:1px solid #25a66b;border-radius:8px;color:#39b979">✓ د بل حساب سره د سند شمېره تکرار ونه موندل شو</div>')+'<table class="hwc-kyc-admin-table"><tbody>'+
  [['د غوښتنلیک ID',x.id],['نوم',x.first_name],['تخلص',x.last_name],['د زېږېدو نېټه',x.date_of_birth||'—'],['هېواد',x.country],['ولایت',x.province],['ولسوالۍ',x.district||'—'],['اسناد ډول',x.document_type],[(x.document_type==='Passport'?'د پاسپورټ نمبر':'د تذکرې ID'),x.national_id_number],['موبایل',x.mobile_number||'—'],['د کاروونکي حساب ID',x.user_id],['د غوښتنې نېټه',new Date(x.created_at).toLocaleString()]].map(r=>'<tr><th>'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>').join('')+
  '</tbody></table><div class="hwc-kyc-admin-photos" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">'+photos.map(p=>'<div class="hwc-kyc-admin-photo"><b>'+esc(p.label)+'</b>'+(p.url?'<img src="'+esc(p.url)+'" alt="'+esc(p.label)+'" style="width:100%;max-height:230px;object-fit:contain">':'<div class="hwc-kyc-admin-photo-empty">انځور نه شو پرانیستل کېدای</div>')+'</div>').join('')+'</div>'+
  (x.status==='pending'?'<div class="hwc-kyc-admin-actions"><button data-kyc-review="approved" data-kyc-id="'+esc(x.id)+'" '+(duplicates.length?'disabled title="تکراري سند؛ لومړی یې وڅېړئ"':'')+'>تایید</button><button data-kyc-review="rejected" data-kyc-id="'+esc(x.id)+'">رد</button></div>':'')+'</article>').join('');
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
const cardChromeObserver=new MutationObserver(()=>{syncMemberCardChrome();applyAddCardVisibility();});
['memberCountry','cardKycStatus'].forEach(id=>{const el=$(id);if(el)cardChromeObserver.observe(el,{childList:true,characterData:true,subtree:true});});
syncMemberCardChrome();applyAddCardVisibility();
})();
