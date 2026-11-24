/* HEWAD COIN: isolated Dashboard → Convert navigation.
   This file only intercepts the existing Convert menu item; it does not
   alter dashboard markup, styles, wallet data, or any other navigation. */
(function () {
  'use strict';
  if (window.__HWC_CONVERT_NAV_BOUND__) return;
  window.__HWC_CONVERT_NAV_BOUND__ = true;

  var convertUrl = new URL('preview/convert-preview.html', document.baseURI).href;

  function isConvertControl(node) {
    if (!node || node.nodeType !== 1) return false;
    var text = (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
    var aria = (node.getAttribute('aria-label') || '').trim();
    var title = (node.getAttribute('title') || '').trim();
    var dataPage = (node.getAttribute('data-page') || '').trim();
    return /^convert$/i.test(text) ||
      /^convert$/i.test(aria) ||
      /^convert$/i.test(title) ||
      /^convert$/i.test(dataPage);
  }

  document.addEventListener('click', function (event) {
    var node = event.target;
    for (var i = 0; node && i < 8; i++, node = node.parentElement) {
      if (!isConvertControl(node)) continue;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      try {
        window.top.location.assign(convertUrl);
      } catch (error) {
        window.location.assign(convertUrl);
      }
      return;
    }
  }, true);
})();