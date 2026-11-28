/* HEWAD COIN unified theme controls: dashboard header + Profile */
(function () {
  'use strict';
  if (window.__hewadThemeControlsV2) return;
  window.__hewadThemeControlsV2 = true;
  var KEY = 'hwc_theme';
  var mode = 'dark';
  try { mode = localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; } catch (e) {}

  var css = document.createElement('style');
  css.id = 'hewad-theme-v2-styles';
  css.textContent = [
    'body.theme-light #dashboard.screen{background:radial-gradient(ellipse at 50% 0%,#fff8e8 0%,#f4f5f7 48%,#edf0f4 100%)!important}',
    'body.theme-light .hwc-card{color:#29200d!important;box-shadow:0 12px 28px rgba(38,35,26,.12)!important}',
    'body.theme-light .hwc-card-title,body.theme-light .hwc-balance-main{color:#76530b!important}',
    'body.theme-light .hwc-card-subtitle,body.theme-light .hwc-section-label,body.theme-light .hwc-field-label,body.theme-light .hwc-card-date{color:#725f37!important}',
    'body.theme-light .hwc-field-value{color:#211b10!important}',
    'body.theme-light .dash-top-actions button{background:#fff!important;color:#8b6819!important;border-color:#d8c28b!important;box-shadow:0 2px 8px #0000000c}',
    'body.theme-light .dash-tile-icon{background:radial-gradient(circle,#fff5d7,#f5e9c8 72%)!important;color:#9b7418!important;border-color:#d9c58f!important}',
    'body.theme-light .dash-subpage p{color:#526176!important}',
    'body.theme-light .profile-panel{color:#20232a!important}',
    '#hewadHeaderThemeToggle{width:38px;height:38px;min-width:38px;padding:0;border-radius:50%;display:grid;place-items:center;border:1px solid #70500f;background:#17130b;color:#f5c743;font-size:18px;line-height:1;cursor:pointer;box-shadow:0 0 12px #d59b1520}',
    '#hewadHeaderThemeToggle:focus-visible{outline:3px solid #e8b936;outline-offset:3px}',
    'body.theme-light #hewadHeaderThemeToggle{background:#fff;color:#8b6819;border-color:#d8c28b}',
    '#themeToggle{cursor:pointer}#themeToggle:focus-visible{outline:2px solid #d8ad3e;outline-offset:-2px}'
  ].join('');
  document.head.appendChild(css);

  function apply(next) {
    mode = next === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('theme-light', mode === 'light');
    document.body.classList.toggle('theme-dark', mode === 'dark');
    document.documentElement.setAttribute('data-hwc-theme', mode);
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    var label = document.getElementById('themeLabel');
    if (label) { var nextLabel = mode === 'light' ? 'Light Mode' : 'Dark Mode'; if (label.textContent !== nextLabel) label.textContent = nextLabel; }
    var profileRow = document.getElementById('themeToggle');
    if (profileRow) {
      profileRow.setAttribute('aria-label', 'Switch theme. Current mode: ' + (mode === 'light' ? 'Light' : 'Dark'));
      var title = profileRow.querySelector('span');
      if (title) { var nextTitle = 'Theme (' + (mode === 'light' ? 'Light' : 'Dark') + ')'; if (title.textContent !== nextTitle) title.textContent = nextTitle; }
    }
    var headBtn = document.getElementById('hewadHeaderThemeToggle');
    if (headBtn) {
      var nextIcon = mode === 'light' ? '☀' : '☾';
      if (headBtn.textContent !== nextIcon) headBtn.textContent = nextIcon;
      headBtn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      headBtn.title = mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    }
  }

  function mountHeaderButton() {
    var actions = document.querySelector('#dashboard .dash-top-actions');
    if (!actions) return;
    var button = document.getElementById('hewadHeaderThemeToggle');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.id = 'hewadHeaderThemeToggle';
      button.addEventListener('click', function () { apply(mode === 'dark' ? 'light' : 'dark'); });
    }
    /* Put the theme switch immediately before the hamburger/menu icon. */
    var menu = actions.querySelector('button[aria-label="Menu"]');
    if (menu && menu.previousElementSibling !== button) actions.insertBefore(button, menu);
    else if (!menu && button.parentNode !== actions) actions.appendChild(button);
    apply(mode);
  }

  /* The original Profile row has a legacy click handler; intercept it to avoid double toggles. */
  document.addEventListener('click', function (event) {
    var row = event.target && event.target.closest ? event.target.closest('#themeToggle') : null;
    if (!row) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    apply(mode === 'dark' ? 'light' : 'dark');
  }, true);

  apply(mode);
  mountHeaderButton();
  /* The dashboard header and profile controls already exist when this
     script is loaded. Avoid a document-wide observer: page transitions and
     module rendering can otherwise trigger repeated full-page work. */

})();