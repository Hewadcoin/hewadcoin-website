(function(){
'use strict';
var doc=document;

function giftTiles(){
 var root=doc.getElementById('dashboard');
 if(!root)return;
 var nodes=root.querySelectorAll('[data-action*="gift" i],.dash-tile,.menu-item,.dashboard-item,.dash-card,.menu-card,button,a,[role="button"]');
 nodes.forEach(function(tile){
  if(!tile||tile.closest('#adminPanel,#hwcAdminGift'))return;
  var label=(tile.innerText||tile.textContent||'').replace(/\\s+/g,' ').trim();
  if(!/(^|\\s)(daily\\s+)?gift(\\s|$)/i.test(label))return;
  ['locked','is-locked','feature-locked','kyc-locked','is-disabled'].forEach(function(c){tile.classList.remove(c);});
  tile.removeAttribute('aria-disabled');
  tile.removeAttribute('data-locked');
  if('disabled' in tile)tile.disabled=false;
  tile.style.pointerEvents='auto';
  tile.querySelectorAll('.lock-icon,.locked-icon,.feature-lock,.lock-badge,.locked-badge,[data-lock],[data-locked],[aria-label*="lock" i],[title*="lock" i],[data-icon="lock"],[data-lucide="lock"],svg.lucide-lock').forEach(function(n){n.remove();});
  var walker=doc.createTreeWalker(tile,NodeFilter.SHOW_TEXT),textNodes=[];
  while(walker.nextNode())textNodes.push(walker.currentNode);
  textNodes.forEach(function(n){if(/[🔒🔐🔓]/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/[🔒🔐🔓]/g,'').replace(/\\s{2,}/g,' ');});
  ['::before','::after'].forEach(function(pseudo){
   try{var value=window.getComputedStyle(tile,pseudo).content||'';if(/[🔒🔐🔓]|lock/i.test(value))tile.classList.add('hwc-gift-no-lock');}catch(e){}
  });
 });
}

function addWithdrawAdminOptions(){
 if(window.HEWAD_USER_ROLE!=='admin')return;
 var home=doc.getElementById('adminHome'),grid=home&&home.querySelector('.hwc-admin-grid');
 if(!grid)return;
 function add(key,icon,title,desc){
  if(grid.querySelector('[data-hwc-withdraw-admin="'+key+'"]'))return;
  var b=doc.createElement('button');b.type='button';b.className='hwc-admin-option';b.dataset.hwcWithdrawAdmin=key;
  b.innerHTML='<span class="ico">'+icon+'</span><span><strong>'+title+'</strong><small>'+desc+'</small></span><span class="arrow">›</span>';
  grid.appendChild(b);
 }
 add('settings','⚙','Withdraw Management','USDT BEP20 fee, minimum and rolling 24-hour maximum controls');
 add('requests','⬇','Withdraw Requests','Review member details, accept or reject requests and record payout TX Hash');
}

function runOnce(){
 giftTiles();
 addWithdrawAdminOptions();
}

/* Run once for the static dashboard. Re-run only when the authenticated
   admin role is confirmed; do not observe the whole document. */
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',runOnce,{once:true});
else runOnce();
window.addEventListener('hewad-admin-authorized',addWithdrawAdminOptions);
})();
