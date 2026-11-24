/* HEWAD COIN: Dashboard-native Convert panel.
   Opens Convert over the existing dashboard without navigating away.
   Only the Convert menu item is intercepted. */
(function () {
  'use strict';
  if (window.__HWC_CONVERT_NAV_BOUND__) return;
  window.__HWC_CONVERT_NAV_BOUND__ = true;

  var convertUrl = new URL('preview/convert-preview.html', document.baseURI).href;
  /* Expose the already-authenticated client to the same-origin Convert iframe. */
  try {
    if (typeof hwcSupabase !== 'undefined' && hwcSupabase && hwcSupabase.auth) {
      window.__HWC_CONVERT_DB__ = hwcSupabase;
    }
  } catch (error) {
    console.warn('Convert wallet bridge is unavailable:', error);
  }
  var overlayId = 'hwc-convert-overlay';

  function isConvertControl(node) {
    if (!node || node.nodeType !== 1) return false;
    var text = (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
    var aria = (node.getAttribute('aria-label') || '').trim();
    var title = (node.getAttribute('title') || '').trim();
    var dataPage = (node.getAttribute('data-page') || '').trim();
    var dataAction = (node.getAttribute('data-action') || '').trim();
    /* Dashboard tiles include a decorative ⇅ icon, so their visible text is
       not exactly "Convert". Match the semantic action before the generic
       dashboard handler can show its disabled-feature notice. */
    return /^convert$/i.test(dataAction) ||
      /^convert$/i.test(text) ||
      /^convert$/i.test(aria) ||
      /^convert$/i.test(title) ||
      /^convert$/i.test(dataPage);
  }

  window.openHwcConvertPanel = openConvertPanel;

  function openConvertPanel() {
    /* Refresh the authenticated client bridge every time Convert is opened. */
    try {
      var activeClient = (typeof hwcSupabase !== 'undefined' && hwcSupabase) ||
        window.hwcSupabase || window.__HWC_CONVERT_DB__;
      if (activeClient && activeClient.auth) window.__HWC_CONVERT_DB__ = activeClient;
    } catch (error) {
      console.warn('Convert wallet bridge is unavailable:', error);
    }

    /* Always create a fresh iframe/session view. A hidden stale iframe can
       retain an expired auth state after returning to the Dashboard. */
    var existing = document.getElementById(overlayId);
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'HEWAD COIN Convert');
    overlay.style.cssText = [
      'position:fixed','inset:0','z-index:2147483000','display:block',
      'width:100%','height:100%','height:100dvh','background:#08090c',
      'overflow:hidden'
    ].join(';');

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Back to Dashboard');
    close.textContent = '← Dashboard';
    close.style.cssText = [
      'position:absolute','top:calc(env(safe-area-inset-top,0px) + 10px)',
      'left:12px','z-index:3','padding:9px 13px','border:1px solid #383d46',
      'border-radius:10px','background:#15191f','color:#f1f3f6',
      'font:600 12px system-ui,sans-serif','cursor:pointer',
      'box-shadow:0 4px 18px #0008'
    ].join(';');
    close.addEventListener('click', function () {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.remove();
    });

    var frame = document.createElement('iframe');
    frame.title = 'HEWAD COIN Convert';
    frame.src = convertUrl;
    frame.setAttribute('allow', 'clipboard-read; clipboard-write');
    frame.style.cssText = 'display:block;width:100%;height:100%;border:0;background:#08090c';

    frame.addEventListener('load', function () {
      try {
        var doc = frame.contentDocument;
        if (!doc || !doc.head) return;
        var style = doc.createElement('style');
        style.textContent =
          '.topbar{padding-left:112px!important}' +
          '.topbar .back,.topbar .preview-pill{display:none!important}' +
          'html,body{min-height:100%;overscroll-behavior:contain}' +
          'body{padding-top:calc(env(safe-area-inset-top) + 8px)!important}';
        doc.head.appendChild(style);
      } catch (error) {
        console.warn('Convert panel styling could not be applied:', error);
      }
    });

    overlay.appendChild(frame);
    overlay.appendChild(close);
    document.body.appendChild(overlay);
    overlay.setAttribute('aria-hidden', 'false');
  }

  document.addEventListener('click', function (event) {
    var node = event.target;
    for (var i = 0; node && i < 8; i++, node = node.parentElement) {
      if (!isConvertControl(node)) continue;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      openConvertPanel();
      return;
    }
  }, true);
})();
