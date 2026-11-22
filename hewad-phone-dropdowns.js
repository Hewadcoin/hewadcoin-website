/* HEWAD COIN: compact option menus + international phone validation */
(function(){
'use strict';
if(window.__HWC_PHONE_DROPDOWNS_V1)return;window.__HWC_PHONE_DROPDOWNS_V1=true;
const lib=window.libphonenumber||window.libphonenumberJs||window.libphonenumberjs;
if(!lib||!lib.getCountries||!lib.parsePhoneNumberFromString){console.error('HEWAD phone metadata unavailable');return;}
const $=id=>document.getElementById(id);
const form=$('signupForm')||(($('referral')&&$('referral').closest('form')))||document.querySelector('#signup form');
const code=$('hwcCountryCallingCode'),phone=$('phone')||document.querySelector('#signup input[type=tel]'),flag=$('hwcCountryDetected');
if(!form||!code||!phone)return;
const countries=lib.getCountries().map(iso=>({iso,calling:'+'+lib.getCountryCallingCode(iso),flag:Array.from(iso).map(c=>String.fromCodePoint(c.charCodeAt(0)+127397)).join('')}));
const byCode={};
countries.forEach(c=>{if(!byCode[c.calling])byCode[c.calling]=[c.flag,c.iso];});
window.__HWC_PHONE_COUNTRIES=byCode;
let selected=(countries.find(c=>c.calling===code.value.trim())||countries.find(c=>c.iso==='AF')||countries[0]);
const style=document.createElement('style');style.id='hwc-phone-dropdown-style';style.textContent=`
#signup .hwc-final-country label{display:none!important}
#signup .hwc-country-field{position:relative!important;display:flex!important;flex-direction:column!important;gap:0!important}
#signup .hwc-country-field #hwcCountryCallingCode{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important;min-height:1px!important;padding:0!important;border:0!important}
.hwc-country-trigger{display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;width:100%!important;height:40px!important;min-height:40px!important;padding:0 5px!important;border:1px solid #d0ad4d!important;border-radius:9px!important;background:#17130b!important;color:#f5d77f!important;font:700 14px inherit!important;cursor:pointer!important;white-space:nowrap!important}
.hwc-country-trigger .hwc-country-flag{font-size:19px!important}
.hwc-country-menu{position:absolute!important;z-index:100800!important;left:0!important;top:calc(100% + 6px)!important;width:min(260px,78vw)!important;max-height:260px!important;overflow:auto!important;padding:6px!important;border:1px solid #8b6a25!important;border-radius:12px!important;background:#111319!important;box-shadow:0 14px 38px #000b!important}
.hwc-country-menu[hidden]{display:none!important}
.hwc-country-option{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:12px!important;width:100%!important;min-height:38px!important;padding:7px 10px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#f7f1e3!important;font:600 14px inherit!important;text-align:left!important;cursor:pointer!important}
.hwc-country-option[aria-selected=true],.hwc-country-option:hover{background:#3a2d13!important;color:#f5d77f!important}
#hwcMobileValidationHint{display:block!important;min-height:14px!important;margin:4px 0 7px!important;font-size:11px!important;line-height:1.35!important}
`;document.head.appendChild(style);
const field=code.closest('.hwc-country-field')||code.parentElement;
let trigger=field.querySelector('.hwc-country-trigger'),menu=field.querySelector('.hwc-country-menu');
if(!trigger){trigger=document.createElement('button');trigger.type='button';trigger.className='hwc-country-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');field.appendChild(trigger);}
if(!menu){menu=document.createElement('div');menu.className='hwc-country-menu';menu.setAttribute('role','listbox');menu.hidden=true;field.appendChild(menu);}
function flagOnly(){if(flag){flag.textContent=selected.flag;flag.title=selected.calling;flag.setAttribute('aria-label',selected.calling);}}
function setSelected(c){selected=c;code.value=c.calling;trigger.innerHTML='<span class="hwc-country-flag">'+c.flag+'</span><span>'+c.calling+'</span><span aria-hidden="true">⌄</span>';flagOnly();code.dispatchEvent(new Event('input',{bubbles:true}));validate(false);}
countries.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='hwc-country-option';b.setAttribute('role','option');b.textContent=c.flag+'   '+c.calling;b.setAttribute('aria-selected',String(c.iso===selected.iso));b.addEventListener('click',()=>{menu.querySelectorAll('[role=option]').forEach(x=>x.setAttribute('aria-selected','false'));b.setAttribute('aria-selected','true');setSelected(c);menu.hidden=true;trigger.setAttribute('aria-expanded','false');});menu.appendChild(b);});
trigger.addEventListener('click',()=>{menu.hidden=!menu.hidden;trigger.setAttribute('aria-expanded',String(!menu.hidden));});
document.addEventListener('click',e=>{if(!field.contains(e.target)){menu.hidden=true;trigger.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;trigger.setAttribute('aria-expanded','false');}});
const initial=countries.find(c=>c.calling===code.value.trim())||countries.find(c=>c.iso==='AF');setSelected(initial);
let hint=$('hwcMobileValidationHint');
if(!hint){hint=document.createElement('small');hint.id='hwcMobileValidationHint';hint.className='hwc-field-hint';phone.insertAdjacentElement('afterend',hint);}
function normalizedNational(){let v=(phone.value||'').replace(/[^0-9]/g,'');if(selected.iso==='AF'&&v.length===10&&v.startsWith('0'))v=v.slice(1);return v;}
function validate(show=true){
 const raw=normalizedNational();
 const afExpected=selected.iso==='AF'?9:null;
 let parsed=null,valid=false;
 try{parsed=lib.parsePhoneNumberFromString(raw,selected.iso);valid=!!(parsed&&parsed.isValid()&&parsed.country===selected.iso);}catch(_){}
 if(valid){hint.textContent='✓ Mobile number is complete and valid.';hint.style.color='#25c878';phone.classList.remove('hwc-field-invalid');phone.classList.add('hwc-field-valid');return true;}
 phone.classList.remove('hwc-field-valid');phone.classList.add('hwc-field-invalid');
 if(!raw){hint.textContent='Enter your mobile number.';}
 else if(afExpected){hint.textContent='Enter all 9 digits for Afghanistan ('+raw.length+'/9).';}
 else{hint.textContent='The number is incomplete or invalid for the selected country.';}
 hint.style.color='#ff6262';return false;
}
phone.addEventListener('input',()=>validate());
phone.addEventListener('blur',()=>validate());
form.addEventListener('submit',e=>{if(!validate()){e.preventDefault();e.stopImmediatePropagation();phone.focus();}},true);
const db=window.hwcSupabase||(typeof hwcSupabase!=='undefined'?hwcSupabase:null);
if(db&&db.auth&&typeof db.auth.signUp==='function'&&!db.auth.__hwcStrictInternationalPhone){
 const previous=db.auth.signUp.bind(db.auth);
 db.auth.signUp=async function(credentials){if(!validate()){return{data:{user:null,session:null},error:{message:hint.textContent}};}return previous(credentials);};
 db.auth.__hwcStrictInternationalPhone=true;
}
setSelected(initial);
})();
