(function(){
'use strict';
var doc=document, queued=false;
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
   try{var value=window.getComputedStyle(tile,pseudo).content||'';if(/[🔒🔐🔓]|lock/i.test(value)){tile.classList.add('hwc-gift-no-lock');}}catch(e){}
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
function run(){queued=false;giftTiles();addWithdrawAdminOptions();}
function schedule(){if(queued)return;queued=true;if(window.requestAnimationFrame)window.requestAnimationFrame(run);else window.setTimeout(run,0);}
function hasRelevantNode(node){
 if(!node||node.nodeType!==1)return false;
 if(node.matches&&node.matches('[data-action*="gift" i],#adminHome,.hwc-admin-grid'))return true;
 if(node.querySelector&&node.querySelector('[data-action*="gift" i],#adminHome,.hwc-admin-grid'))return true;
 var label=(node.innerText||node.textContent||'').replace(/\\s+/g,' ').trim();
 return /^(daily\\s+)?gift$/i.test(label);
}
function observeDashboard(){
 var root=doc.getElementById('dashboard');
 if(!root||!window.MutationObserver)return false;
 var observer=new MutationObserver(function(records){
  for(var i=0;i<records.length;i++){
   var record=records[i];
   if(record.target&&record.target.nodeType===1&&record.target.closest&&record.target.closest('[data-action*="gift" i],#adminHome,.hwc-admin-grid')){schedule();return;}
   for(var n=0;n<record.addedNodes.length;n++){if(hasRelevantNode(record.addedNodes[n])){schedule();return;}}
  }
 });
 /* Watch only dashboard child additions. Avoid global body/attribute observation:
    normal navigation and module updates must not trigger repeated full-dashboard scans. */
 observer.observe(root,{childList:true,subtree:true});
 return true;
}
var style=doc.createElement('style');
style.id='hwc-runtime-reliability-style';
style.textContent='.hwc-gift-no-lock::before,.hwc-gift-no-lock::after{content:none!important;display:none!important}';
(doc.head||doc.documentElement).appendChild(style);
window.addEventListener('hewad-admin-authorized',schedule);
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',function(){schedule();observeDashboard();},{once:true});
else{schedule();observeDashboard();}
})();
