/* HEWAD COIN compact internal menus — preview build */
(function(){
'use strict';
if(window.__hwcCompactMenusV1)return;window.__hwcCompactMenusV1=true;
var css=document.createElement('style');css.id='hwc-compact-menu-styles';
css.textContent=`
/* Existing in-app dialogs stay compact; never paint a full-screen white sheet. */
#hwcLiveModal{position:fixed!important;inset:0!important;display:none;z-index:100500!important;pointer-events:none}
#hwcLiveModal.open{display:block!important}
#hwcLiveModal .hwc-live-backdrop{display:none!important}
#hwcLiveModal .hwc-live-dialog{pointer-events:auto!important;position:fixed!important;left:50%!important;top:78px!important;transform:translateX(-50%)!important;margin:0!important;width:min( min(92vw,560px),560px)!important;max-height:min(78vh,680px)!important;overflow:auto!important;background:#111319!important;color:#f7f3e8!important;border:1px solid #8a6927!important;border-radius:16px!important;box-shadow:0 18px 55px #0009!important}
#hwcLiveModal .hwc-live-dialog header{position:sticky;top:-17px;background:#111319;z-index:2}
.hwc-compact-select{position:relative;display:inline-block;max-width:100%;width:100%}
.hwc-compact-select>select{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:0!important;pointer-events:none!important}
.hwc-compact-select-trigger{width:100%;min-height:42px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 13px;border:1px solid #73551e;border-radius:10px;background:#17140e;color:#f6d47c;font:inherit;text-align:left;cursor:pointer}
.hwc-compact-select-menu{position:absolute;z-index:100600;top:calc(100% + 6px);left:0;right:0;max-height:240px;overflow:auto;padding:5px;border:1px solid #73551e;border-radius:12px;background:#111319;box-shadow:0 14px 34px #0009}
.hwc-compact-select-menu[hidden]{display:none}
.hwc-compact-select-option{display:block;width:100%;padding:10px 12px;border:0;border-radius:8px;background:transparent;color:#f4f0e6;text-align:left;font:inherit;cursor:pointer}
.hwc-compact-select-option[aria-selected=true],.hwc-compact-select-option:hover{background:#3a2d13;color:#f6d47c}
#hwcLiveModal .hwc-live-dialog.hwc-options-dropdown{left:var(--hwc-menu-left,12px)!important;top:var(--hwc-menu-top,78px)!important;transform:none!important;width:max-content!important;min-width:190px!important;max-width:min(88vw,320px)!important;max-height:62vh!important;padding:12px!important;border-radius:13px!important}
#hwcLiveModal .hwc-live-dialog.hwc-options-dropdown button{display:flex!important;width:100%!important;min-height:38px!important;align-items:center!important;justify-content:flex-start!important;margin:3px 0!important;padding:9px 12px!important;border:1px solid #5e4a24!important;border-radius:9px!important;background:#19160f!important;color:#f6e8c4!important;text-align:left!important}
#hwcLiveModal .hwc-live-dialog.hwc-options-dropdown button:hover{background:#3a2d13!important;color:#f6d47c!important}

`;document.head.appendChild(css);
function enhanceSelect(sel){if(sel.dataset.hwcCompact==='1'||sel.multiple||sel.size>1)return;sel.dataset.hwcCompact='1';var wrap=document.createElement('div');wrap.className='hwc-compact-select';sel.parentNode.insertBefore(wrap,sel);wrap.appendChild(sel);var trigger=document.createElement('button');trigger.type='button';trigger.className='hwc-compact-select-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');var label=document.createElement('span'),arrow=document.createElement('span');arrow.textContent='⌄';trigger.append(label,arrow);var menu=document.createElement('div');menu.className='hwc-compact-select-menu';menu.setAttribute('role','listbox');menu.hidden=true;function current(){var o=sel.options[sel.selectedIndex];label.textContent=o?o.textContent:'Select…';Array.from(menu.children).forEach(function(b,i){b.setAttribute('aria-selected',String(i===sel.selectedIndex))})}Array.from(sel.options).forEach(function(o,i){var b=document.createElement('button');b.type='button';b.className='hwc-compact-select-option';b.textContent=o.textContent;b.disabled=o.disabled;b.setAttribute('role','option');b.onclick=function(){sel.selectedIndex=i;sel.dispatchEvent(new Event('change',{bubbles:true}));current();menu.hidden=true;trigger.setAttribute('aria-expanded','false')};menu.appendChild(b)});trigger.onclick=function(){var open=menu.hidden;document.querySelectorAll('.hwc-compact-select-menu').forEach(function(m){m.hidden=true});menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open))};wrap.append(trigger,menu);sel.addEventListener('change',current);current()}
function scan(root){(root||document).querySelectorAll('select').forEach(enhanceSelect)}
scan(document);new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){if(n.matches&&n.matches('select'))enhanceSelect(n);scan(n)}})})}).observe(document.body,{childList:true,subtree:true});

function adaptOptionModal(){
 var modal=document.getElementById('hwcLiveModal'),dialog=modal&&modal.querySelector('.hwc-live-dialog');
 if(!modal||!dialog||!modal.classList.contains('open'))return;
 var controls=dialog.querySelectorAll('input,select,textarea,form,[contenteditable=true]');
 var buttons=dialog.querySelectorAll('button');
 var optionOnly=controls.length===0&&buttons.length>=2;
 dialog.classList.toggle('hwc-options-dropdown',optionOnly);
 if(optionOnly){
   var anchor=document.activeElement,rect=anchor&&anchor!==document.body&&anchor.getBoundingClientRect?anchor.getBoundingClientRect():null;
   var width=Math.min(320,window.innerWidth*.88),left=rect?Math.max(8,Math.min(rect.left,window.innerWidth-width-8)):12;
   var top=rect?Math.min(rect.bottom+6,window.innerHeight-150):78;
   dialog.style.setProperty('--hwc-menu-left',left+'px');
   dialog.style.setProperty('--hwc-menu-top',top+'px');
 }
}
var modalObserver=new MutationObserver(adaptOptionModal);
modalObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
setTimeout(adaptOptionModal,0);

document.addEventListener('click',function(e){if(!e.target.closest('.hwc-compact-select'))document.querySelectorAll('.hwc-compact-select-menu').forEach(function(m){m.hidden=true});});
document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('.hwc-compact-select-menu').forEach(function(m){m.hidden=true})});
})();