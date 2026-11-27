(function(){'use strict';
function sync(){var card=document.getElementById('memberCard');if(!card)return;var dash=document.getElementById('dashboardMain'),module=document.getElementById('modulePage');var dashboardActive=!!(dash&&dash.classList.contains('active'));var moduleActive=!!(module&&module.classList.contains('active'));var otherActive=['walletPage','supportPage','profilePage','adminPanel'].some(function(id){var el=document.getElementById(id);return !!(el&&el.classList.contains('active'));});var show=dashboardActive&&!moduleActive&&!otherActive;var display=show?'block':'none';if(card.hidden===show)card.hidden=!show;if(card.style.getPropertyValue('display')!==display||card.style.getPropertyPriority('display')!=='important')card.style.setProperty('display',display,'important');}
/* Only page activation classes affect this card. Ignore unrelated DOM, style,
   and hidden mutations so this observer cannot amplify rendering work. */
var pageIds={dashboardMain:true,modulePage:true,walletPage:true,supportPage:true,profilePage:true,adminPanel:true};
var obs=new MutationObserver(function(records){if(records.some(function(r){return r.type==='attributes'&&r.attributeName==='class'&&pageIds[r.target.id];}))sync();});
obs.observe(document.body,{subtree:true,childList:false,attributes:true,attributeFilter:['class']});
document.addEventListener('click',function(){if(window.requestAnimationFrame)requestAnimationFrame(sync);else setTimeout(sync,0);},true);sync();
})();