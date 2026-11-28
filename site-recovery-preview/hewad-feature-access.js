/* HEWAD COIN preview-only access and tile recovery.
   Does not bypass KYC: the early gate in site-recovery-preview/index.html
   routes unverified users to the existing KYC form. */
(function(){
 'use strict';
 if(window.__HWC_FEATURE_ACCESS_RECOVERY__)return;
 window.__HWC_FEATURE_ACCESS_RECOVERY__=true;
 var doc=document,queued=false;
 var selector='[data-action="Withdraw" i],[data-action="Gift" i],[data-action="Mining" i]';
 function approved(){
  var status=String(window.HEWAD_KYC_STATUS||'').trim().toLowerCase().replace(/[ -]+/g,'_');
  var badge=String((doc.getElementById('cardKycStatus')||{}).textContent||'').trim().toLowerCase();
  return ['approved','verified','active','kyc_verified','accepted','completed','complete'].includes(status) ||
    /^(kyc verified|active|approved|verified)$/.test(badge);
 }
 function update(){
  queued=false;
  var root=doc.getElementById('dashboard');if(!root)return;
  root.querySelectorAll(selector).forEach(function(tile){
   tile.classList.remove('locked','is-locked','feature-locked','kyc-locked','is-disabled','disabled');
   tile.removeAttribute('aria-disabled');tile.removeAttribute('data-locked');
   if('disabled' in tile)tile.disabled=false;
   tile.style.pointerEvents='auto';
   if(!approved())return;
   tile.classList.add('hwc-feature-unlocked');
   tile.querySelectorAll('.lock-icon,.locked-icon,.feature-lock,.lock-badge,.locked-badge,[data-lock],[data-locked],[aria-label*="lock" i],[title*="lock" i],[data-icon="lock"],[data-lucide="lock"],svg.lucide-lock').forEach(function(n){n.remove();});
   var walker=doc.createTreeWalker(tile,NodeFilter.SHOW_TEXT),nodes=[];
   while(walker.nextNode())nodes.push(walker.currentNode);
   nodes.forEach(function(n){n.nodeValue=n.nodeValue.replace(/[🔒🔐]/g,'').replace(/s{2,}/g,' ');});
  });
 }
 function schedule(){if(queued)return;queued=true;if(window.requestAnimationFrame)window.requestAnimationFrame(update);else window.setTimeout(update,0);}
 var style=doc.createElement('style');
 style.id='hwc-feature-access-recovery-style';
 style.textContent='.hwc-feature-unlocked::before,.hwc-feature-unlocked::after{content:none!important;display:none!important}.hwc-feature-unlocked{pointer-events:auto!important;filter:none!important;opacity:1!important}';
 (doc.head||doc.documentElement).appendChild(style);
 var original=window.loadHwcProfile;
 if(typeof original==='function'&&!original.__hwcAccessWrapped){
  var wrapped=async function(){var result=await original.apply(this,arguments);schedule();return result;};
  wrapped.__hwcAccessWrapped=true;window.loadHwcProfile=wrapped;
 }
 var root=doc.getElementById('dashboard');
 if(root&&window.MutationObserver){
  var observer=new MutationObserver(function(records){
   for(var i=0;i<records.length;i++){
    var r=records[i];
    if(r.target&&r.target.nodeType===1&&r.target.closest&&r.target.closest(selector+',#cardKycStatus')){schedule();return;}
    for(var j=0;j<r.addedNodes.length;j++){
     var n=r.addedNodes[j];
     if(n.nodeType===1&&((n.matches&&n.matches(selector))||(n.querySelector&&n.querySelector(selector)))){schedule();return;}
    }
   }
  });
  observer.observe(root,{childList:true,subtree:true});
 }
 schedule();
 window.addEventListener('hewad-admin-authorized',schedule);
 window.addEventListener('hewad-kyc-status-updated',schedule);
})();