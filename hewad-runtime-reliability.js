(function(){
'use strict';
var doc=document,queued=false;
var tileSelector='[data-action="Deposit" i],[data-action="Withdraw" i],[data-action="Mining" i],[data-action*="gift" i],.dash-tile,.menu-item,.dashboard-item,.dash-card,.menu-card,button,a,[role="button"]';
function approved(){
 var status=String(window.HEWAD_KYC_STATUS||'').trim().toLowerCase().replace(/[ -]+/g,'_');
 return ['approved','verified','active','kyc_verified','accepted','completed','complete'].includes(status);
}
function isFeatureTile(tile){
 var action=String(tile.getAttribute('data-action')||'').trim().toLowerCase();
 var label=(tile.innerText||tile.textContent||'').replace(/\s+/g,' ').trim();
 return ['deposit','withdraw','mining','gift'].includes(action) ||
  /^(?:usdt\s+)?deposit(?:\s+usdt)?$/i.test(label) ||
  /^withdraw(?:al)?$/i.test(label) ||
  /^mining$/i.test(label) ||
  /^(?:daily\s+)?gift$/i.test(label);
}
function unlockTiles(){
 queued=false;
 var root=doc.getElementById('dashboard');
 if(!root)return;
 /* Remove lock presentation for every member; the central click router still enforces KYC. */
 root.querySelectorAll(tileSelector).forEach(function(tile){
  if(!tile||tile.closest('#adminPanel,#hwcAdminGift')||!isFeatureTile(tile))return;
  /* Detach legacy per-tile capture listeners that re-apply stale localStorage KYC locks.
     The central KYC router is delegated from the document and remains in force. */
  if(tile.dataset.hwcKycLegacyDetached!=='1'){var clean=tile.cloneNode(true);clean.dataset.hwcKycLegacyDetached='1';tile.replaceWith(clean);tile=clean;}
  ['locked','is-locked','feature-locked','kyc-locked','is-disabled','disabled'].forEach(function(c){tile.classList.remove(c);});
  tile.removeAttribute('aria-disabled');
  tile.removeAttribute('data-locked');
  if('disabled' in tile)tile.disabled=false;
  tile.style.pointerEvents='auto';
  tile.classList.add('hwc-feature-unlocked');
  tile.querySelectorAll('.lock-icon,.locked-icon,.feature-lock,.lock-badge,.locked-badge,[data-lock],[data-locked],[aria-label*="lock" i],[title*="lock" i],[data-icon="lock"],[data-lucide="lock"],svg.lucide-lock').forEach(function(n){n.remove();});
  var walker=doc.createTreeWalker(tile,NodeFilter.SHOW_TEXT),textNodes=[];
  while(walker.nextNode())textNodes.push(walker.currentNode);
  textNodes.forEach(function(n){n.nodeValue=n.nodeValue.replace(/[🔒🔐🔓]/g,'').replace(/\s{2,}/g,' ');});
  ['::before','::after'].forEach(function(pseudo){
   try{var value=window.getComputedStyle(tile,pseudo).content||'';if(/[🔒🔐🔓]|lock/i.test(value))tile.classList.add('hwc-feature-no-lock');}catch(e){}
  });
 });
}
function addWithdrawAdminOptions(){
 if(window.HEWAD_USER_ROLE!=='admin')return;
 var home=doc.getElementById('adminHome'),grid=home&&(home.querySelector('.hwc-admin-grid')||home.querySelector('.admin-menu'));
 if(!grid)return;
 function add(key,icon,title,desc){
  if(grid.querySelector('[data-hwc-withdraw-admin="'+key+'"]'))return;
  var legacy=grid.classList.contains('hwc-admin-grid');var b=doc.createElement('button');b.type='button';b.className=legacy?'hwc-admin-option':'admin-menu-card';b.dataset.hwcWithdrawAdmin=key;
  b.innerHTML=legacy?'<span class="ico">'+icon+'</span><span><strong>'+title+'</strong><small>'+desc+'</small></span><span class="arrow">›</span>':'<span class="admin-menu-icon">'+icon+'</span><span class="admin-menu-copy"><strong>'+title+'</strong><small>'+desc+'</small></span><span class="admin-chevron">›</span>';
  grid.appendChild(b);
 }
 add('settings','⚙','Withdraw Management','USDT BEP20 fee, minimum and rolling 24-hour maximum controls');
 add('requests','⬇','Withdraw Requests','Review member details, accept or reject requests and record payout TX Hash');
}
function run(){queued=false;unlockTiles();addWithdrawAdminOptions();}
function schedule(){if(queued)return;queued=true;if(window.requestAnimationFrame)window.requestAnimationFrame(run);else window.setTimeout(run,0);}
function hasRelevantNode(node){
 if(!node||node.nodeType!==1)return false;
 if(node.matches&&node.matches(tileSelector))return isFeatureTile(node);
 if(node.querySelector){var found=node.querySelector(tileSelector);if(found&&isFeatureTile(found))return true;}
 return false;
}
function observeDashboard(){
 var root=doc.getElementById('dashboard');
 if(!root||!window.MutationObserver)return false;
 var observer=new MutationObserver(function(records){
  for(var i=0;i<records.length;i++){
   var record=records[i];
   if(record.target&&record.target.nodeType===1&&record.target.closest&&record.target.closest(tileSelector+',#adminHome,.hwc-admin-grid')){schedule();return;}
   for(var n=0;n<record.addedNodes.length;n++){if(hasRelevantNode(record.addedNodes[n])){schedule();return;}}
  }
 });
 observer.observe(root,{childList:true,subtree:true});
 return true;
}
var style=doc.createElement('style');
style.id='hwc-runtime-reliability-style';
style.textContent='.hwc-feature-no-lock::before,.hwc-feature-no-lock::after{content:none!important;display:none!important}.hwc-feature-unlocked{pointer-events:auto!important;filter:none!important;opacity:1!important}';
(doc.head||doc.documentElement).appendChild(style);
window.addEventListener('hewad-admin-authorized',function(){schedule();addWithdrawAdminOptions();});
window.addEventListener('hewad-kyc-status-updated',schedule);
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',function(){schedule();observeDashboard();},{once:true});
else{schedule();observeDashboard();}
})();