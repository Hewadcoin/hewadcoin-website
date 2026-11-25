/* HEWAD COIN — secure Send Hewad production module. */
(function () {
'use strict';
if (window.__HWC_SEND_HEWAD_LOADED) return;
window.__HWC_SEND_HEWAD_LOADED = true;
var db = typeof hwcSupabase !== 'undefined' ? hwcSupabase : window.hwcSupabase;
if (!db || !db.auth || !db.rpc) { console.error('Send Hewad: Supabase client unavailable.'); return; }
var s={user:null,available:0,senderAllowed:false,method:'email',eligible:false,name:'',code:'',seq:0,timer:null,requestId:null,sending:false,walletReady:false};
var $=function(id){return document.getElementById(id);};
var fmt=function(n){return Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:8});};
var round8=function(n){return Math.round((Number(n)+Number.EPSILON)*1e8)/1e8;};
var style=document.createElement('style');
style.id='hwc-send-hewad-style';
style.textContent = `
#hwcSendHewadModal{display:none;position:fixed;inset:0;z-index:100005;align-items:center;justify-content:center;padding:14px;background:rgba(0,0,0,.78);backdrop-filter:blur(7px);box-sizing:border-box;color:#f4f6f8;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
#hwcSendHewadModal.open{display:flex}#hwcSendHewadModal *{box-sizing:border-box}
#hwcSendHewadModal .card{position:relative;width:min(100%,500px);max-height:94vh;overflow:auto;padding:21px;border:1px solid #665226;border-radius:20px;background:radial-gradient(ellipse at 50% -20%,#25231b 0,#15171b 55%);box-shadow:0 25px 90px #000c}
#hwcSendHewadModal .head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
#hwcSendHewadModal .brand{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:900;letter-spacing:1.4px}
#hwcSendHewadModal .logo{display:grid;place-items:center;width:35px;height:35px;border-radius:11px;background:linear-gradient(145deg,#ffe58a,#c18a1c);color:#241a05;font-size:19px;font-weight:950}
#hwcSendHewadModal .close{width:34px;height:34px;border:1px solid #393b40;border-radius:10px;background:#202228;color:#d7d9de;font-size:21px;cursor:pointer}
#hwcSendHewadModal h2{margin:0 0 5px;font-size:25px;letter-spacing:-.7px}
#hwcSendHewadModal .sub{margin:0 0 16px;color:#9da4af;font-size:12px}
#hwcSendHewadModal .balance{padding:15px 17px;border:1px solid #4d492f;border-radius:15px;background:linear-gradient(120deg,#292415,#171b19);margin-bottom:15px}
#hwcSendHewadModal .eyebrow{color:#c8b77d;font-size:9px;font-weight:850;letter-spacing:1.7px}
#hwcSendHewadModal .balance strong{display:block;margin-top:5px;color:#f3d67b;font-size:27px;font-variant-numeric:tabular-nums}
#hwcSendHewadModal .balance small{color:#b8ad8c;font-size:11px}
#hwcSendHewadModal .section{margin:13px 0;padding:15px;border:1px solid #30343b;border-radius:15px;background:#11151a}
#hwcSendHewadModal .section-title{margin-bottom:11px;color:#aeb6c2;font-size:10px;font-weight:850;letter-spacing:1.4px}
#hwcSendHewadModal .methods{display:grid;grid-template-columns:1fr 1fr;gap:9px}
#hwcSendHewadModal .method{padding:12px;border:1px solid #45403a;border-radius:12px;background:#1a1a19;color:#f2e5bf;text-align:left;cursor:pointer}
#hwcSendHewadModal .method.active{border-color:#e2b94a;background:linear-gradient(145deg,#342b16,#242017);box-shadow:inset 0 0 0 1px #e2b94a44}
#hwcSendHewadModal .method b{display:block;font-size:12px}#hwcSendHewadModal .method span{display:block;margin-top:4px;color:#aaa08a;font-size:10px}
#hwcSendHewadModal label{display:block;margin:13px 0 6px;color:#c5cbd3;font-size:11px;font-weight:750}
#hwcSendHewadModal .field{display:flex;align-items:center;gap:9px;min-height:47px;padding:0 12px;border:1px solid #3a424b;border-radius:11px;background:#090d11}
#hwcSendHewadModal .field:focus-within{border-color:#c9a13b;box-shadow:0 0 0 3px #d8ad3520}
#hwcSendHewadModal input{width:100%;min-width:0;padding:12px 0;border:0;outline:0;background:transparent;color:#f5f6f7;font:inherit;font-size:14px}
#hwcSendHewadModal input::placeholder{color:#69727d}
#hwcSendHewadModal #hwcSendRecipient:-webkit-autofill,
#hwcSendHewadModal #hwcSendRecipient:-webkit-autofill:hover,
#hwcSendHewadModal #hwcSendRecipient:-webkit-autofill:focus,
#hwcSendHewadModal #hwcSendRecipient:autofill{ -webkit-box-shadow:0 0 0 1000px #090d11 inset !important;box-shadow:0 0 0 1000px #090d11 inset !important;-webkit-text-fill-color:#f5f6f7 !important;caret-color:#f5f6f7;color-scheme:dark; }
#hwcSendHewadModal #hwcSendRecipient{color-scheme:dark}
#hwcSendHewadModal .amount-field{min-height:48px;padding:0 10px;gap:8px}
#hwcSendHewadModal .amount-field input#hwcSendAmount{flex:1 1 0;width:1%;min-width:0;padding:12px 0;border:0!important;border-radius:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;color:#f5f6f7!important}
#hwcSendHewadModal .amount-field input#hwcSendAmount:focus{border:0!important;outline:0!important;box-shadow:none!important}
#hwcSendHewadModal .amount-field .amount-max{flex:0 0 auto;margin:0;padding:8px 11px}
#hwcSendHewadModal .amount-field .unit{flex:0 0 auto}

#hwcSendHewadModal .max{padding:7px 9px;border:1px solid #695522;border-radius:8px;background:#2b2414;color:#f0cf70;font-size:9px;font-weight:900;cursor:pointer}
#hwcSendHewadModal .unit{color:#a9b0bb;font-size:10px;font-weight:800}
#hwcSendHewadModal .hint{margin:6px 2px 0;color:#818b98;font-size:10px;line-height:1.45}
#hwcSendHewadModal .recipient{display:none;margin-top:10px;padding:12px;border:1px solid #3d493d;border-radius:11px;background:#151f19}
#hwcSendHewadModal .recipient.show{display:block}
#hwcSendHewadModal .recipient-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
#hwcSendHewadModal .recipient-name{font-size:12px;font-weight:850}
#hwcSendHewadModal .recipient-detail{margin-top:3px;color:#8d9b91;font-size:10px}
#hwcSendHewadModal .verified{color:#57dfa3;font-size:10px;font-weight:900;white-space:nowrap}
#hwcSendHewadModal .unverified{color:#ff9b85;font-size:10px;font-weight:900;white-space:nowrap}
#hwcSendHewadModal .calcs{margin-top:14px;padding-top:12px;border-top:1px solid #30343b}
#hwcSendHewadModal .row{display:flex;justify-content:space-between;gap:12px;margin:9px 0;font-size:11px}
#hwcSendHewadModal .row span{color:#929ba7}
#hwcSendHewadModal .row b{text-align:right;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
#hwcSendHewadModal .net{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:13px;padding:13px;border:1px solid #27674c;border-radius:12px;background:linear-gradient(100deg,#102d20,#14241d)}
#hwcSendHewadModal .net span{color:#a8c9b7;font-size:10px;font-weight:850;letter-spacing:1px}
#hwcSendHewadModal .net strong{color:#5be0a4;font-size:21px;font-variant-numeric:tabular-nums}
#hwcSendHewadModal .submit{width:100%;margin-top:14px;padding:14px;border:0;border-radius:11px;background:linear-gradient(105deg,#f0d071,#d2a331);color:#211805;font-size:12px;font-weight:950;letter-spacing:.5px;cursor:pointer}
#hwcSendHewadModal .submit:disabled{opacity:.45;cursor:not-allowed;filter:grayscale(.5)}
#hwcSendHewadModal .status{margin-top:11px;padding:10px 11px;border:1px solid #343a40;border-radius:10px;background:#171c20;color:#aeb9c3;font-size:11px;line-height:1.5}
#hwcSendHewadModal .status.good{border-color:#286347;background:#10251b;color:#91e0b9}
#hwcSendHewadModal .status.error{border-color:#78413a;background:#2b1b19;color:#ffc2ad}
#hwcSendHewadModal .foot{margin:11px 2px 0;color:#737e8a;font-size:9px;line-height:1.5;text-align:center}
@media(max-width:390px){#hwcSendHewadModal{padding:8px}#hwcSendHewadModal .card{padding:15px;border-radius:16px}#hwcSendHewadModal h2{font-size:22px}#hwcSendHewadModal .balance strong{font-size:24px}}
`;
document.head.appendChild(style);
var root=document.createElement('div');
root.id='hwcSendHewadModal';
root.innerHTML = `
<div class="card" role="dialog" aria-modal="true" aria-labelledby="hwcSendTitle">
 <div class="head"><div class="brand"><span class="logo">H</span><span>HEWAD COIN</span></div><button type="button" class="close" id="hwcSendClose" aria-label="Close">×</button></div>
 <h2 id="hwcSendTitle">Send Hewad</h2><p class="sub">Send HDC securely to another verified HEWAD COIN member.</p>
 <section class="balance"><div class="eyebrow">YOUR AVAILABLE BALANCE</div><strong id="hwcSendBalance">— HDC</strong><small>Reserved and staked HDC are excluded.</small></section>
 <section class="section">
  <div class="section-title">CHOOSE TRANSFER METHOD</div>
  <div class="methods">
   <button type="button" class="method active" data-method="email"><b>✉ Email Address</b><span>Send to a verified email</span></button>
   <button type="button" class="method" data-method="card"><b>▤ Card Number</b><span>Send to an HDC card</span></button>
  </div>
  <label id="hwcSendLabel" for="hwcSendRecipient">Recipient Email Address</label>
  <div class="field"><input id="hwcSendRecipient" type="email" autocomplete="off" maxlength="254" placeholder="Enter recipient's email"></div>
  <div class="hint" id="hwcSendHint">Recipient account is checked securely before sending.</div>
  <div class="recipient" id="hwcSendRecipientCard"><div class="recipient-row"><div><div class="recipient-name" id="hwcSendRecipientName">Recipient account</div><div class="recipient-detail" id="hwcSendRecipientDetail">Checking account</div></div><span id="hwcSendVerification" class="unverified">CHECKING…</span></div></div>
  <label for="hwcSendAmount">Amount to Send</label>
  <div class="field amount-field"><input id="hwcSendAmount" type="number" min="0.00000001" step="0.00000001" inputmode="decimal" placeholder="Enter HDC amount"><button type="button" class="max amount-max" id="hwcSendMax">MAX</button><span class="unit">HDC</span></div>
  <div class="calcs">
   <div class="section-title">TRANSFER DETAILS</div>
   <div class="row"><span id="hwcSendRecipientKey">Recipient Email</span><b id="hwcSendCalcRecipient">—</b></div>
   <div class="row"><span>Account Verification</span><b id="hwcSendCalcVerify">—</b></div>
   <div class="row"><span>Recipient Name</span><b id="hwcSendCalcName">—</b></div>
   <div class="row"><span>Amount to Send</span><b id="hwcSendCalcAmount">0.00 HDC</b></div>
   <div class="row"><span>Transfer Fee (1%)</span><b id="hwcSendCalcFee">0.00 HDC</b></div>
   <div class="net"><span>RECIPIENT RECEIVES</span><strong id="hwcSendCalcNet">0.00 HDC</strong></div>
  </div>
  <button type="button" class="submit" id="hwcSendConfirm" disabled>CONFIRM TRANSFER</button>
  <div class="status" id="hwcSendStatus">Connecting to your secure HEWAD COIN wallet…</div>
  <p class="foot">Transfers are processed securely on the server. The 1% fee is included in the amount entered. Recipients must have an active account, verified email and approved KYC.</p>
 </section>
</div>`;
document.body.appendChild(root);

function setStatus(message,type){var el=$('hwcSendStatus');el.textContent=message;el.className='status'+(type?' '+type:'');}
function amountValues(){var a=round8($('hwcSendAmount').value);if(!Number.isFinite(a)||a<=0)a=0;var f=round8(a*.01);return{amount:a,fee:f,net:round8(a-f)};}
function update(){
 var v=amountValues(),id=$('hwcSendRecipient').value.trim();
 $('hwcSendCalcRecipient').textContent=id||'—';
 $('hwcSendCalcVerify').textContent=s.code==='VERIFIED'?'✓ Verified':s.lookupBusy?'Checking…':id?'✕ Not Verified':'—';
 $('hwcSendCalcVerify').style.color=s.eligible?'#57dfa3':(id?'#ff9b85':'');
 $('hwcSendCalcName').textContent=s.name||'—';
 $('hwcSendCalcAmount').textContent=fmt(v.amount)+' HDC';
 $('hwcSendCalcFee').textContent=fmt(v.fee)+' HDC';
 $('hwcSendCalcNet').textContent=fmt(v.net)+' HDC';
 $('hwcSendConfirm').disabled=!(s.walletReady&&s.senderAllowed&&s.eligible&&v.amount>0&&v.amount<=s.available+1e-8&&!s.sending);
}
function resetRecipient(){
 s.eligible=false;s.name='';s.code='';s.lookupBusy=false;
 $('hwcSendRecipientCard').classList.remove('show');update();
}
function detail(id){return s.method==='email'?id:'Card ending '+id.slice(-4);}
function renderRecipient(id,row){
 s.lookupBusy=false;
 s.code=row.verification_status||'NOT_FOUND';s.eligible=row.eligible===true&&s.code==='VERIFIED';s.name=s.eligible?(row.display_name||'HEWAD COIN Member'):'';
 var map={
  VERIFIED:['✓ VERIFIED','verified',s.name,'Recipient account verified.'],
  NOT_VERIFIED:['✕ NOT VERIFIED','unverified','Recipient account','Recipient Email Not Verified — no funds will be deducted.'],
  ACCOUNT_INACTIVE:['✕ INACTIVE','unverified','Recipient account','This recipient account is not active.'],
  KYC_REQUIRED:['✕ KYC REQUIRED','unverified','Recipient account','Recipient KYC verification is not approved.'],
  SELF_TRANSFER:['✕ YOUR ACCOUNT','unverified','Your own account','You cannot send HDC to your own account.'],
  NOT_FOUND:['✕ NOT FOUND','unverified','Recipient account','No HEWAD COIN account was found.']
 };
 var x=map[s.code]||map.NOT_FOUND;
 $('hwcSendRecipientName').textContent=x[2];$('hwcSendRecipientDetail').textContent=detail(id);
 $('hwcSendVerification').textContent=x[0];$('hwcSendVerification').className=x[1];
 $('hwcSendRecipientCard').classList.add('show');setStatus(x[3],s.eligible?'good':'error');update();
}
function valid(id){return s.method==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id):/^\d{6,20}$/.test(id);}
async function lookup(){
 var id=$('hwcSendRecipient').value.trim(),seq=++s.seq;s.requestId=null;resetRecipient();
 if(!id||!valid(id))return;
 s.lookupBusy=true;$('hwcSendRecipientCard').classList.add('show');
 $('hwcSendRecipientName').textContent='Checking recipient…';$('hwcSendRecipientDetail').textContent=detail(id);
 $('hwcSendVerification').textContent='CHECKING…';$('hwcSendVerification').className='unverified';update();
 try{
  var r=await db.rpc('hdc_lookup_hewad_recipient',{p_identifier:id});
  if(seq!==s.seq)return;if(r.error)throw r.error;
  var row=Array.isArray(r.data)?r.data[0]:r.data;
  renderRecipient(id,row||{eligible:false,verification_status:'NOT_FOUND'});
 }catch(e){
  if(seq!==s.seq)return;s.lookupBusy=false;s.eligible=false;s.code='LOOKUP_ERROR';
  $('hwcSendRecipientName').textContent='Verification unavailable';$('hwcSendRecipientDetail').textContent=detail(id);
  $('hwcSendVerification').textContent='⚠ CHECK FAILED';$('hwcSendVerification').className='unverified';
  $('hwcSendRecipientCard').classList.add('show');setStatus('Could not verify this recipient. Please try again. No funds will be deducted.','error');update();
 }
}
function scheduleLookup(){if(s.sending)return;s.seq++;if(s.timer)clearTimeout(s.timer);s.timer=setTimeout(lookup,450);}
function switchMethod(next){
 s.method=next;s.seq++;s.requestId=null;if(s.timer)clearTimeout(s.timer);
 document.querySelectorAll('#hwcSendHewadModal .method').forEach(function(b){b.classList.toggle('active',b.dataset.method===next);});
 $('hwcSendLabel').textContent=next==='email'?'Recipient Email Address':'Recipient Card Number';
 $('hwcSendRecipientKey').textContent=next==='email'?'Recipient Email':'Recipient Card Number';
 $('hwcSendRecipient').value='';$('hwcSendRecipient').type=next==='email'?'email':'text';
 $('hwcSendRecipient').inputMode=next==='email'?'email':'numeric';
 $('hwcSendRecipient').placeholder=next==='email'?"Enter recipient's email":"Enter recipient's card number";
 $('hwcSendHint').textContent=next==='email'?'Enter the email linked to the recipient’s HEWAD COIN account.':'Enter the recipient’s HDC card number.';
 resetRecipient();
}
async function refreshWallet(){
 var r=await db.from('wallets').select('balance_hwc,reserved_hwc,staked_hwc').eq('user_id',s.user.id).maybeSingle();
 if(r.error)throw r.error;var w=r.data||{};
 s.available=Math.max(0,Number(w.balance_hwc||0)-Number(w.reserved_hwc||0)-Number(w.staked_hwc||0));
 $('hwcSendBalance').textContent=fmt(s.available)+' HDC';s.walletReady=true;update();
}
async function connect(){
 try{
  var a=await db.auth.getUser();if(a.error||!a.data||!a.data.user)throw new Error('Please sign in to your HEWAD COIN account first.');
  s.user=a.data.user;
  var p=await db.from('profiles').select('account_status,kyc_status').eq('id',s.user.id).maybeSingle();
  if(p.error)throw p.error;
  s.senderAllowed=!!p.data&&p.data.account_status==='active'&&p.data.kyc_status==='approved';
  await refreshWallet();
  setStatus(s.senderAllowed?'Wallet connected. Enter an email or card number to verify the recipient.':'Your account must be active and KYC-approved before sending HDC.',s.senderAllowed?'good':'error');
 }catch(e){s.walletReady=false;s.senderAllowed=false;$('hwcSendBalance').textContent='Unavailable';setStatus(e&&e.message?e.message:'Could not connect to your wallet.','error');}
}
function lockInputs(lock){$('hwcSendRecipient').disabled=lock;$('hwcSendAmount').disabled=lock;$('hwcSendMax').disabled=lock;document.querySelectorAll('#hwcSendHewadModal .method').forEach(function(b){b.disabled=lock;});}
function openModal(){root.classList.add('open');document.body.style.overflow='hidden';if(!s.walletReady)connect();setTimeout(function(){$('hwcSendRecipient').focus();},0);}
function closeModal(){if(s.sending)return;root.classList.remove('open');document.body.style.overflow='';}
async function send(){
 var id=$('hwcSendRecipient').value.trim(),v=amountValues();
 if(!s.walletReady||!s.senderAllowed){setStatus('Your wallet or account verification is not ready.','error');return;}
 if(!s.eligible||s.code!=='VERIFIED'){setStatus(s.code==='NOT_VERIFIED'?'Recipient Email Not Verified. No funds have been deducted.':'Only verified, active, KYC-approved recipients can receive HDC.','error');return;}
 if(!(v.amount>0)){setStatus('Enter an amount greater than zero.','error');return;}
 if(v.amount>s.available+1e-8){setStatus('Insufficient available HDC balance, including the transfer fee.','error');return;}
 if(!s.requestId)s.requestId=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():(Date.now().toString(16)+'-'+Math.random().toString(16).slice(2)+'-'+Math.random().toString(16).slice(2));
 s.sending=true;lockInputs(true);$('hwcSendConfirm').disabled=true;$('hwcSendConfirm').textContent='PROCESSING SECURELY…';$('hwcSendClose').disabled=true;
 setStatus('Processing your HDC transfer securely. Please wait…','');
 try{
  var r=await db.rpc('hdc_send_hewad_v2',{p_recipient_code:id,p_amount:v.amount,p_request_id:s.requestId,p_note:null});
  if(r.error)throw r.error;
  var tx=typeof r.data==='string'?r.data:(Array.isArray(r.data)&&r.data[0]?r.data[0]:'Completed');
  s.requestId=null;$('hwcSendRecipient').value='';$('hwcSendAmount').value='';s.seq++;resetRecipient();
  await refreshWallet();
  setStatus('Transfer successful. '+fmt(v.net)+' HDC was sent. Transaction: '+tx,'good');
 }catch(e){
  var m=e&&e.message?e.message:'Transfer could not be completed.';
  if(/Recipient Email Not Verified/i.test(m))m='Recipient Email Not Verified. No funds have been deducted.';
  else if(/Insufficient available HDC/i.test(m))m='Insufficient available HDC balance. No funds have been deducted.';
  else if(/cannot send HDC to your own/i.test(m))m='You cannot send HDC to your own account. No funds have been deducted.';
  setStatus(m,'error');
 }finally{
  s.sending=false;lockInputs(false);$('hwcSendConfirm').textContent='CONFIRM TRANSFER';$('hwcSendClose').disabled=false;update();
 }
}
document.addEventListener('click',function(e){
 var b=e.target&&e.target.closest?e.target.closest('.dash-tile[data-action="Send Hewad"]'):null;
 if(!b)return;e.preventDefault();e.stopImmediatePropagation();openModal();
},true);
root.addEventListener('click',function(e){if(e.target===root)closeModal();});
$('hwcSendClose').addEventListener('click',closeModal);
$('hwcSendRecipient').addEventListener('input',scheduleLookup);
$('hwcSendAmount').addEventListener('input',function(){s.requestId=null;update();});
$('hwcSendMax').addEventListener('click',function(){$('hwcSendAmount').value=s.available.toFixed(8);s.requestId=null;update();});
$('hwcSendConfirm').addEventListener('click',send);
document.querySelectorAll('#hwcSendHewadModal .method').forEach(function(b){b.addEventListener('click',function(){switchMethod(b.dataset.method);});});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&root.classList.contains('open'))closeModal();});
})();