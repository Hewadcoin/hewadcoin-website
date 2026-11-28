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
dashboardPolish.textContent+=`
.hwc-kyc-search{margin:12px 0;padding:12px;border:1px solid #4b4028;border-radius:12px;background:#111419}
.hwc-kyc-result-count{margin:8px 0;color:#c9cbd1;font-size:12px}.hwc-kyc-result{display:flex;align-items:center;gap:10px;width:100%;margin:8px 0;padding:12px;text-align:left;border:1px solid #51452c;border-radius:11px;background:#15171c;color:#f4f1e9}.hwc-kyc-result-copy{display:flex;flex:1;min-width:0;flex-direction:column;gap:5px}.hwc-kyc-result-copy strong{font-size:13px}.hwc-kyc-result-copy small{color:#b8bac2;font-size:10px;overflow-wrap:anywhere}.hwc-kyc-result-arrow{color:#e8bd4a;font-size:20px}.hwc-kyc-back-results{border:0;background:transparent;color:#e8bd4a;padding:8px 0;font-weight:700}
.hwc-kyc-search label{display:block;margin-bottom:7px;color:#e7ca78;font-size:12px;font-weight:700}
.hwc-kyc-search>div{display:flex;gap:8px}
.hwc-kyc-search select{width:100%;min-width:0;padding:10px;border:1px solid #555;border-radius:8px;background:#080b10;color:#fff;font-size:13px}
.hwc-kyc-search-controls{flex-wrap:wrap}
.hwc-kyc-search-controls input{flex:1 1 150px;min-width:0;padding:11px;border:1px solid #555;border-radius:8px;background:#080b10;color:#fff;font-size:14px}
.hwc-kyc-search button{padding:8px 12px;border:1px solid #80652d;border-radius:8px;background:#282116;color:#f3d27b}
.hwc-kyc-review-layout{display:grid;grid-template-columns:minmax(150px,220px) minmax(0,1fr);gap:14px;align-items:start}
.hwc-kyc-photo-column{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.hwc-kyc-admin-photo-selfie{grid-column:1/-1}
.hwc-kyc-info-column{min-width:0}
.hwc-kyc-record-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.hwc-kyc-admin-photo img{height:150px!important;max-height:150px!important;cursor:zoom-in;object-fit:contain!important}
.hwc-kyc-admin-photo-empty{height:150px!important}
.hwc-kyc-admin-table{margin-top:10px!important}
.hwc-kyc-admin-actions button{flex:1;min-height:40px}
.hwc-kyc-duplicate-alert{margin-top:10px;padding:10px;border:1px solid #ef4444;border-radius:9px;color:#ff9999}
.hwc-kyc-lightbox{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.94)}
.hwc-kyc-lightbox img{max-width:96vw;max-height:90vh;object-fit:contain}
.hwc-kyc-lightbox button{position:absolute;top:14px;right:14px;width:42px;height:42px;border:1px solid #aaa;border-radius:50%;background:#17191d;color:#fff;font-size:25px}
@media(max-width:650px){.hwc-kyc-review-layout{grid-template-columns:minmax(0,1fr)}.hwc-kyc-photo-column{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.hwc-kyc-admin-photo img{height:190px!important;max-height:190px!important}.hwc-kyc-info-column{width:100%}}
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
  const [p,w,r,rateResult]=await Promise.all([
   hwcSupabase.from('profiles').select('first_name,last_name,mobile_number,referral_code,card_number,country,kyc_country,kyc_status,account_status,created_at,card_created_at,avatar_url').eq('id',user.id).maybeSingle(),
   hwcSupabase.from('wallets').select('balance_hwc,balance_usd,balance_afn').eq('user_id',user.id).maybeSingle(),
   hwcSupabase.from('user_roles').select('role').eq('user_id',user.id),
   hwcSupabase.from('exchange_rates').select('quote_asset,rate').eq('base_asset','HDC').eq('active',true).in('quote_asset',['USD','AFN'])
  ]);
  if(p.error)console.warn('KYC profile:',p.error.message);
  const profile=p.data||{},wallet=w.data||{},rawStatus=String(profile.kyc_status||'not_verified').trim().toLowerCase().replace(/[ -]+/g,'_'),status=['approved','verified','active','kyc_verified'].includes(rawStatus)?'approved':rawStatus;
  window.HEWAD_KYC_STATUS=status;
  window.dispatchEvent(new CustomEvent('hewad-kyc-status-updated',{detail:{status:status}}));
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
  const fmt=(v,d)=>Number(v||0).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});
  const rateMap={};(rateResult.data||[]).forEach(function(x){rateMap[x.quote_asset]=Number(x.rate)||0;});
  const hwcAmount=Number(wallet.balance_hwc||0);
  /* Member card shows the HDC value in USD and AFN; wallet screen keeps separate balances. */
  put('hwcBalance',fmt(hwcAmount,4)+' HDC');
  put('usdBalance','$'+fmt(hwcAmount*(rateMap.USD||0),2));
  put('afnBalance',fmt(hwcAmount*(rateMap.AFN||0),2)+' AFN');
  put('walletHwcBalance',fmt(wallet.balance_hwc,4)+' HDC');
  put('walletUsdBalance',fmt(wallet.balance_usd,2)+' USDT');
  put('walletAfnBalance',fmt(wallet.balance_afn,2)+' AFN');
 };
}
function statusBadge(s){return '<strong class="hwc-kyc-status-badge">'+(s==='approved'?'Approved':s==='rejected'?'Rejected':'Pending')+'</strong>';}
function ensureHost(){
 const list=$('adminKycList');if(!list)return null;
 Array.from(list.children).forEach(el=>{if(el.id!=='adminKycRecords'&&/No KYC applications|KYC application records will appear here after the secure backend is connected/i.test(el.textContent||''))el.remove();});
 let search=$('hwcKycSearch');
 if(!search){
  const wrap=document.createElement('div');wrap.className='hwc-kyc-search';
  wrap.innerHTML='<label for="hwcKycSearch">Search KYC records by</label><div class="hwc-kyc-search-controls"><select id="hwcKycSearchType" aria-label="Choose search field"><option value="name">Full name</option><option value="tazkira_id">Tazkira / Passport ID</option><option value="card">Card number</option><option value="referral">Referral code</option></select><input id="hwcKycSearch" type="search" autocomplete="off" placeholder="Enter search value"><button type="button" id="hwcKycSearchClear">Clear</button></div>';
  const title=$('adminKycListTitle');if(title&&title.parentNode)title.parentNode.insertBefore(wrap,title.nextSibling);else list.appendChild(wrap);
  search=$('hwcKycSearch');
  const type=wrap.querySelector('#hwcKycSearchType');
  const runSearch=()=>{selectedKycId=null;clearTimeout(kycSearchTimer);kycSearchTimer=setTimeout(()=>loadKyc(window.currentAdminKycCategory||'requests',search.value,type.value).catch(err=>notify(err.message||'KYC search failed.')),300);};
  search.addEventListener('input',runSearch);
  type.addEventListener('change',runSearch);
  wrap.querySelector('#hwcKycSearchClear').addEventListener('click',()=>{search.value='';selectedKycId=null;clearTimeout(kycSearchTimer);loadKyc(window.currentAdminKycCategory||'requests','',type.value).catch(err=>notify(err.message||'Could not load KYC applications.'));});
 }
 let h=$('adminKycRecords');if(!h){h=document.createElement('div');h.id='adminKycRecords';h.className='admin-empty';list.appendChild(h);}
 return h;
}
function normalizeKycSearch(v){return String(v||'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g,'');}
let selectedKycId=null;
let kycSearchTimer=null;
function renderKycRecords(){
 const host=$('adminKycRecords'),input=$('hwcKycSearch');if(!host)return;
 const all=window.__HWC_KYC_RECORDS||[],q=normalizeKycSearch(input&&input.value),type=$('hwcKycSearchType')&&$('hwcKycSearchType').value||'name';
 const filtered=q?all.filter(item=>{
  const x=item.record,m=item.member||{};
  const value=type==='tazkira_id'?x.national_id_number:type==='card'?m.card_number:type==='referral'?m.referral_code:[m.first_name||x.first_name,m.last_name||x.last_name].join(' ');
  return normalizeKycSearch(value).includes(q);
 }):all;
 if(selectedKycId&&!filtered.some(x=>String(x.record.id)===String(selectedKycId)))selectedKycId=null;
 if(!filtered.length){const searching=!!q;host.innerHTML='<div class="admin-empty"><strong>'+(searching?'No matching KYC applications':'No KYC applications have been submitted yet')+'</strong><p>'+(searching?'Try another value or choose a different search field.':'New KYC submissions will appear here automatically.')+'</p></div>';return;}
 if(!selectedKycId){
  host.innerHTML='<div class="hwc-kyc-result-count">'+filtered.length+' application(s) found</div>'+filtered.map(({record:x,member})=>{
   const name=[x.first_name,x.last_name].filter(Boolean).join(' ')||'KYC Applicant';
   const extra=member?[member.card_number,member.referral_code,member.email].filter(Boolean).join(' · '):'';
   const submitted=x.created_at?new Date(x.created_at).toLocaleString():'Date unavailable';
   return '<button type="button" class="hwc-kyc-result" data-kyc-open="'+esc(x.id)+'"><span class="hwc-kyc-result-copy"><strong>'+esc(name)+'</strong><small>Submitted: '+esc(submitted)+' · ID: '+esc(x.national_id_number||'—')+' · '+esc(x.country||'—')+' · '+esc(x.province||'—')+(extra?' · '+esc(extra):'')+'</small></span>'+statusBadge(x.status)+'<span class="hwc-kyc-result-arrow">›</span></button>';
  }).join('');
  return;
 }
 const selected=filtered.find(x=>String(x.record.id)===String(selectedKycId));
 if(!selected){selectedKycId=null;renderKycRecords();return;}
 const x=selected.record,photos=selected.photos||[],duplicates=selected.duplicates||[];
 const m=selected.member||{};
 const rows=[['Application ID',x.id],['First name',x.first_name],['Last name',x.last_name],['Full name',[x.first_name,x.last_name].filter(Boolean).join(' ')],['Tazkira / Passport ID',x.national_id_number],['Member card number',m.card_number||'—'],['Referral code',m.referral_code||'—'],['Email address',m.email||'—'],['Document type',x.document_type],['Country',x.country],['Province',x.province],['District',x.district||'—'],['Date of birth',x.date_of_birth||'—'],['Mobile number',x.mobile_number||m.mobile_number||'—'],['Account ID',x.user_id],['Submitted',x.created_at?new Date(x.created_at).toLocaleString():'—'],['Status',x.status],['Rejection reason',x.rejection_reason||'—']];
 const photoHtml=photos.map(p=>'<div class="hwc-kyc-admin-photo '+(p.label==='Selfie'?'hwc-kyc-admin-photo-selfie':'')+'"><b>'+esc(p.label)+'</b>'+(p.url?'<img data-kyc-zoom src="'+esc(p.url)+'" alt="'+esc(p.label)+'" loading="lazy">':'<div class="hwc-kyc-admin-photo-empty">Image unavailable</div>')+'</div>').join('');
 host.innerHTML='<button type="button" class="hwc-kyc-back-results" data-kyc-back-to-results>‹ Back to results</button><article class="hwc-kyc-admin-card"><div class="hwc-kyc-review-layout"><div class="hwc-kyc-photo-column">'+photoHtml+'</div><div class="hwc-kyc-info-column"><div class="hwc-kyc-record-heading"><strong>'+esc([x.first_name,x.last_name].filter(Boolean).join(' ')||'KYC Applicant')+'</strong>'+statusBadge(x.status)+'</div><table class="hwc-kyc-admin-table"><tbody>'+rows.map(r=>'<tr><th>'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>').join('')+'</tbody></table>'+(duplicates.length?'<div class="hwc-kyc-duplicate-alert"><b>⚠ Duplicate document number found</b><p>'+esc(x.national_id_number)+' appears in '+duplicates.length+' other account(s).</p></div>':'')+(x.status==='pending'?'<div class="hwc-kyc-admin-actions"><button data-kyc-review="approved" data-kyc-id="'+esc(x.id)+'">Approve KYC</button><button data-kyc-review="rejected" data-kyc-id="'+esc(x.id)+'">Reject KYC</button></div>':'')+'</div></div></article>';
}
async function loadKyc(category,searchTerm,searchType){
 const host=ensureHost();if(!host)return;
 selectedKycId=null;
 const status=category==='requests'?null:category;window.currentAdminKycCategory=category;
 const applyCategory=q=>q.eq('status',status||'pending');
 const title=$('adminKycListTitle');if(title)title.textContent=category==='requests'?'KYC Requests':category==='approved'?'KYC Approved':'KYC Rejected';
 host.innerHTML='<p>Loading KYC applications…</p>';
 const allStatusRows=[];let offset=0;
 const selectKyc='id,user_id,first_name,last_name,country,province,district,mobile_number,document_type,national_id_number,date_of_birth,passport_expiry_date,status,rejection_reason,created_at,front_document_path,back_document_path,selfie_document_path';
 const term=String(searchTerm||'').trim();
 if(term){
  host.innerHTML='<p>Searching KYC applications...</p>';
  const kind=searchType||'name';
  const matchedMembers=[];let memberOffset=0;
  if(kind!=='tazkira_id'){
   const rpcType=kind==='name'?'name':kind==='card'?'card':'referral';
   while(true){
    const page=await hwcSupabase.rpc('admin_search_users',{p_search_type:rpcType,p_search_value:term,p_limit:50,p_offset:memberOffset});
    if(page.error){host.textContent='Member search failed: '+page.error.message;return;}
    matchedMembers.push(...(page.data||[]));if(!page.data||page.data.length<50)break;memberOffset+=50;
   }
  }
  const memberMap=new Map(matchedMembers.map(m=>[String(m.id),m]));
  const userIds=[...memberMap.keys()];
  const found=[];
  if(userIds.length){
   const byMember=await applyCategory(hwcSupabase.from('kyc_applications').select(selectKyc).in('user_id',userIds)).order('created_at',{ascending:false});
   if(byMember.error){host.textContent=byMember.error.message;return;}
   found.push(...(byMember.data||[]));
  }
  if(kind==='tazkira_id'){
   const byDocument=await applyCategory(hwcSupabase.from('kyc_applications').select(selectKyc).ilike('national_id_number','%'+term+'%')).order('created_at',{ascending:false});
   if(byDocument.error){host.textContent=byDocument.error.message;return;}
   found.push(...(byDocument.data||[]));
  }
  const unique=new Map(found.map(x=>[String(x.id),x]));
  allStatusRows.push(...[...unique.values()].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)));
  window.__HWC_KYC_MEMBER_MATCHES=memberMap;
 }else{
  window.__HWC_KYC_MEMBER_MATCHES=new Map();
  while(true){
   const page=await applyCategory(hwcSupabase.from('kyc_applications').select(selectKyc)).order('created_at',{ascending:false}).range(offset,offset+499);
   if(page.error){host.textContent=page.error.message;return;}
   allStatusRows.push(...(page.data||[]));if(!page.data||page.data.length<500)break;offset+=500;
  }
 }
 if(!allStatusRows.length){window.__HWC_KYC_RECORDS=[];renderKycRecords();return;}
 const allRecords=[];offset=0;
 while(true){
  const page=await hwcSupabase.from('kyc_applications').select('id,user_id,first_name,last_name,country,province,district,mobile_number,document_type,national_id_number,status,created_at').range(offset,offset+999);
  if(page.error){host.textContent='Could not check duplicate documents: '+page.error.message;return;}
  allRecords.push(...(page.data||[]));if(!page.data||page.data.length<1000)break;offset+=1000;
 }
 const normalizeId=v=>normalizeKycSearch(v);
 const records=await Promise.all(allStatusRows.map(async x=>{
  const isPassport=String(x.document_type||'').toLowerCase().includes('passport');
  const photoPaths=isPassport?[
   {label:'Passport page',path:x.front_document_path},
   {label:'Selfie',path:x.selfie_document_path}
  ]:[
   {label:'Tazkira front',path:x.front_document_path},
   {label:'Tazkira back',path:x.back_document_path},
   {label:'Selfie',path:x.selfie_document_path}
  ];
  const photos=await Promise.all(photoPaths.map(async p=>{
   if(!p.path)return {label:p.label,url:''};
   try{const r=await hwcSupabase.storage.from('kyc-documents').createSignedUrl(p.path,1800);return {label:p.label,url:r.error?'':r.data.signedUrl};}
   catch(e){return {label:p.label,url:''};}
  }));
  const normalized=normalizeId(x.national_id_number);
  const docType=String(x.document_type||'').toLowerCase().includes('passport')?'passport':'tazkira';
  const duplicates=normalized?allRecords.filter(y=>y.user_id!==x.user_id&&normalizeId(y.national_id_number)===normalized&&(String(y.document_type||'').toLowerCase().includes('passport')?'passport':'tazkira')===docType):[];
  return {record:x,photos,duplicates,member:(window.__HWC_KYC_MEMBER_MATCHES||new Map()).get(String(x.user_id))||null};
 }));
 window.__HWC_KYC_RECORDS=records;
 renderKycRecords();
}
/* Delegated KYC tabs: also works when the admin panel is inserted after this script loads. */
document.addEventListener('click',function(e){const back=e.target.closest('[data-admin-kyc-back]');if(back){e.preventDefault();e.stopImmediatePropagation();const list=$('adminKycList'),menu=$('adminKyc');if(list){list.hidden=true;list.style.display='none';}if(menu){menu.hidden=false;menu.style.display='block';}return;}const b=e.target.closest('[data-kyc-category]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const menu=$('adminKyc'),list=$('adminKycList');if(menu){menu.hidden=true;menu.style.display='none';}if(list){list.hidden=false;list.style.display='block';}loadKyc(b.dataset.kycCategory).catch(err=>notify(err.message||'Could not load KYC applications.'));},true);
document.addEventListener('click',async e=>{
 if(!e.target.closest('#adminKycList'))return;
 const open=e.target.closest('[data-kyc-open]');if(open){selectedKycId=open.dataset.kycOpen;renderKycRecords();return;}
 const backToResults=e.target.closest('[data-kyc-back-to-results]');if(backToResults){selectedKycId=null;renderKycRecords();return;}
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

document.addEventListener('click',function(e){
 const img=e.target.closest('img[data-kyc-zoom]');if(!img)return;
 let box=document.querySelector('.hwc-kyc-lightbox');
 if(!box){box=document.createElement('div');box.className='hwc-kyc-lightbox';box.innerHTML='<button type="button" aria-label="Close">×</button><img alt="KYC document full screen">';document.body.appendChild(box);box.addEventListener('click',function(ev){if(ev.target===box||ev.target.tagName==='BUTTON')box.remove();});}
 box.querySelector('img').src=img.src;box.querySelector('img').alt=img.alt||'KYC document'; 
});

const nav=$('.admin-nav-btn');if(nav)nav.addEventListener('click',()=>{if(window.HEWAD_USER_ROLE==='admin')setTimeout(()=>{const v=$('adminKyc');if(v&&!v.hidden)loadKyc('requests');},0);});
window.hwcLoadAdminKyc=loadKyc;
if(window.hwcSessionRestorePromise)window.hwcSessionRestorePromise.then(()=>{if(window.__HWC_USER&&window.loadHwcProfile)window.loadHwcProfile(window.__HWC_USER).catch(e=>console.warn(e));});
const cardChromeObserver=new MutationObserver(()=>{syncMemberCardChrome();applyAddCardVisibility();});
['memberCountry','cardKycStatus'].forEach(id=>{const el=$(id);if(el)cardChromeObserver.observe(el,{childList:true,characterData:true,subtree:true});});
syncMemberCardChrome();applyAddCardVisibility();
})();
