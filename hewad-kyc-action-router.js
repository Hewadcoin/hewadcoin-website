/* HEWAD COIN — resume the exact member feature after KYC approval. */
(function(){
  'use strict';
  var KEY='hwc_pending_kyc_action', checking=false, resumed=false, timer=null;
  var win=window, doc=document;
  function readPending(){
    try{
      var raw=win.sessionStorage.getItem(KEY);
      if(!raw)return null;
      var value=JSON.parse(raw);
      if(!value||!value.action||!value.createdAt)return null;
      if(Date.now()-Number(value.createdAt)>24*60*60*1000){win.sessionStorage.removeItem(KEY);return null;}
      return value;
    }catch(error){return null;}
  }
  function clearPending(){try{win.sessionStorage.removeItem(KEY);}catch(error){}}
  function openRequestedAction(action){
    var name=String(action||'').trim().toLowerCase();
    try{
      if(name==='withdraw'&&typeof win.openHwcWithdrawPage==='function')return win.openHwcWithdrawPage();
      if(name==='staking'&&typeof win.openHwcStakingPage==='function')return win.openHwcStakingPage();
      if((name==='gift'||name==='gift code'||name==='daily gift')&&typeof win.openHwcGiftPage==='function')return win.openHwcGiftPage();
      if(typeof win.openHwcModule==='function')return win.openHwcModule(action);
      var candidates=Array.from(doc.querySelectorAll('[data-action]'));
      var tile=candidates.find(function(el){return String(el.getAttribute('data-action')||'').trim().toLowerCase()===name;});
      if(!tile&&name==='gift')tile=Array.from(doc.querySelectorAll('.dash-tile,.menu-item,.dashboard-item,.dash-card,.menu-card,button,a,[role="button"]')).find(function(el){return /^(?:daily\\s+)?gift$/i.test(String(el.innerText||el.textContent||'').replace(/\\s+/g,' ').trim())&&!el.closest('#adminPanel,#hwcAdminGift');});
      if(tile){tile.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:win}));return;}
      if(typeof win.showNotice==='function')win.showNotice('KYC is verified. Please select the requested feature again if it did not open.');
    }catch(error){console.error('Could not reopen the requested HEWAD feature:',error);if(typeof win.showNotice==='function')win.showNotice('KYC is verified, but the requested feature could not open. Please select it again.');}
  }
  async function checkAndResume(){
    if(checking||resumed)return;
    var pending=readPending();
    if(!pending)return;
    var user=win.__HWC_USER||win.hwcCurrentUser;
    var client=win.hwcSupabase;
    if(!user||!user.id||!client)return;
    checking=true;
    try{
      var result=await client.from('profiles').select('kyc_status').eq('id',user.id).maybeSingle();
      if(result.error)throw result.error;
      var status=String(result.data&&result.data.kyc_status||'').toLowerCase();
      if(status!=='approved')return;
      win.HEWAD_KYC_STATUS='approved';
      if(typeof win.loadHwcProfile==='function')await win.loadHwcProfile(user);
      var stillPending=readPending();
      if(!stillPending||stillPending.action!==pending.action)return;
      clearPending();
      resumed=true;
      win.setTimeout(function(){openRequestedAction(pending.action);},250);
    }catch(error){console.warn('KYC approval check will retry:',error&&error.message||error);}
    finally{checking=false;}
  }
  function scheduleCheck(){if(readPending())checkAndResume();}
  win.addEventListener('focus',scheduleCheck);
  doc.addEventListener('visibilitychange',function(){if(!doc.hidden)scheduleCheck();});
  win.addEventListener('pageshow',scheduleCheck);
  if(win.hwcSessionRestorePromise&&typeof win.hwcSessionRestorePromise.then==='function')win.hwcSessionRestorePromise.then(scheduleCheck).catch(function(){});
  timer=win.setInterval(scheduleCheck,12000);
  scheduleCheck();
  win.addEventListener('beforeunload',function(){if(timer)win.clearInterval(timer);});
})();