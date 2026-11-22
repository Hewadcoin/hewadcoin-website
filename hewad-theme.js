/* HEWAD COIN theme switch — persistent light/dark themes */
(function () {
  'use strict';
  if (window.__hewadThemeReady) return;
  window.__hewadThemeReady = true;

  var KEY = 'hewadcoin-color-mode';
  var root = document.documentElement;
  var saved = '';
  try { saved = localStorage.getItem(KEY) || ''; } catch (e) {}
  var mode = saved === 'light' || saved === 'dark' ? saved : 'dark';

  var css = document.createElement('style');
  css.id = 'hewad-theme-styles';
  css.textContent = [
    ':root{color-scheme:dark;--hwc-bg:#080b12;--hwc-surface:#111722;--hwc-surface-2:#182231;--hwc-text:#f4f6fa;--hwc-muted:#b3bdcb;--hwc-border:#344255;--hwc-input:#0c121c;--hwc-input-text:#f4f6fa;--hwc-shadow:0 12px 35px rgba(0,0,0,.28)}',
    ':root[data-hwc-theme="light"]{color-scheme:light;--hwc-bg:#f3f6fa;--hwc-surface:#ffffff;--hwc-surface-2:#eaf0f6;--hwc-text:#172235;--hwc-muted:#526176;--hwc-border:#d3dce7;--hwc-input:#ffffff;--hwc-input-text:#172235;--hwc-shadow:0 10px 28px rgba(31,48,71,.09)}',
    'html,body{background:var(--hwc-bg)!important;color:var(--hwc-text)}',
    'body,[class*="page"],[class*="screen"],[class*="section"],[class*="panel"],[class*="card"],[class*="modal"],[class*="box"],[class*="container"],[class*="nav"],[class*="header"],[class*="sidebar"],[class*="content"]{color:var(--hwc-text)}',
    ':root[data-hwc-theme="light"] body{background:var(--hwc-bg)!important}',
    ':root[data-hwc-theme="light"] #home,:root[data-hwc-theme="light"] #dashboard,:root[data-hwc-theme="light"] main,:root[data-hwc-theme="light"] .screen,:root[data-hwc-theme="light"] .page{background-color:var(--hwc-bg)}',
    ':root[data-hwc-theme="light"] #dashboard [class*="card"],:root[data-hwc-theme="light"] #dashboard [class*="panel"],:root[data-hwc-theme="light"] #dashboard [class*="box"],:root[data-hwc-theme="light"] .dash-subpage-card,:root[data-hwc-theme="light"] .stat-card,:root[data-hwc-theme="light"] .balance-card{background:var(--hwc-surface)!important;color:var(--hwc-text)!important;border-color:var(--hwc-border)!important;box-shadow:var(--hwc-shadow)}',
    ':root[data-hwc-theme="light"] header,:root[data-hwc-theme="light"] nav,:root[data-hwc-theme="light"] .topbar,:root[data-hwc-theme="light"] .navbar,:root[data-hwc-theme="light"] .sidebar,:root[data-hwc-theme="light"] .dashboard-header{background:var(--hwc-surface)!important;color:var(--hwc-text)!important;border-color:var(--hwc-border)!important}',
    ':root[data-hwc-theme="light"] p,:root[data-hwc-theme="light"] li,:root[data-hwc-theme="light"] label,:root[data-hwc-theme="light"] small,:root[data-hwc-theme="light"] span,:root[data-hwc-theme="light"] h1,:root[data-hwc-theme="light"] h2,:root[data-hwc-theme="light"] h3,:root[data-hwc-theme="light"] h4,:root[data-hwc-theme="light"] h5,:root[data-hwc-theme="light"] h6,:root[data-hwc-theme="light"] td,:root[data-hwc-theme="light"] th{color:var(--hwc-text)}',
    ':root[data-hwc-theme="light"] .muted,:root[data-hwc-theme="light"] .subtitle,:root[data-hwc-theme="light"] .description,:root[data-hwc-theme="light"] .text-muted{color:var(--hwc-muted)!important}',
    ':root[data-hwc-theme="light"] input:not([type="checkbox"]):not([type="radio"]),:root[data-hwc-theme="light"] textarea,:root[data-hwc-theme="light"] select{background:var(--hwc-input)!important;color:var(--hwc-input-text)!important;border-color:var(--hwc-border)!important}',
    ':root[data-hwc-theme="light"] input::placeholder,:root[data-hwc-theme="light"] textarea::placeholder{color:#7b8797!important}',
    ':root[data-hwc-theme="light"] table,:root[data-hwc-theme="light"] th,:root[data-hwc-theme="light"] td{border-color:var(--hwc-border)!important}',
    ':root[data-hwc-theme="light"] .hwc-live-dialog,:root[data-hwc-theme="light"] #hwcRecoveryModal .hwc-recovery-card{background:var(--hwc-surface)!important;color:var(--hwc-text)!important;border-color:var(--hwc-border)!important}',
    ':root[data-hwc-theme="light"] .hwc-live-dialog input,:root[data-hwc-theme="light"] .hwc-live-dialog textarea,:root[data-hwc-theme="light"] .hwc-live-dialog select,:root[data-hwc-theme="light"] #hwcRecoveryModal input{background:var(--hwc-input)!important;color:var(--hwc-input-text)!important;border-color:var(--hwc-border)!important}',
    ':root[data-hwc-theme="light"] .hwc-live-dialog label,:root[data-hwc-theme="light"] #hwcRecoveryModal label{color:var(--hwc-text)!important}',
    '#hewadThemeToggle{position:relative;z-index:10050;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-width:42px;height:40px;padding:0 11px;border:1px solid rgba(216,173,62,.65);border-radius:12px;background:linear-gradient(145deg,#252b35,#111722);color:#ffe39a;font:700 13px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.18);-webkit-tap-highlight-color:transparent}',
    '#hewadThemeToggle:hover{transform:translateY(-1px);filter:brightness(1.08)}#hewadThemeToggle:focus-visible{outline:3px solid #d8ad3e;outline-offset:3px}#hewadThemeToggle .hwc-theme-icon{font-size:17px;line-height:1}',
    ':root[data-hwc-theme="light"] #hewadThemeToggle{background:#fff;color:#26364c;border-color:#c5a04a;box-shadow:0 3px 12px rgba(30,45,65,.12)}',
    '@media(max-width:480px){#hewadThemeToggle{height:36px;min-width:38px;padding:0 9px;border-radius:10px;font-size:12px}}'
  ].join('');
  document.head.appendChild(css);

  function paint() {
    root.setAttribute('data-hwc-theme', mode);
    var button = document.getElementById('hewadThemeToggle');
    if (!button) return;
    var light = mode === 'light';
    button.innerHTML = '<span class="hwc-theme-icon" aria-hidden="true">' + (light ? '☀️' : '🌙') + '</span><span>' + (light ? 'Light' : 'Dark') + '</span>';
    button.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    button.setAttribute('title', light ? 'Switch to dark mode' : 'Switch to light mode');
  }

  function mount() {
    if (document.getElementById('hewadThemeToggle')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.id = 'hewadThemeToggle';
    button.addEventListener('click', function () {
      mode = mode === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, mode); } catch (e) {}
      paint();
    });

    var languageWrap = document.querySelector('.language-wrap');
    var header = document.querySelector('#dashboard header,.dashboard-header,.topbar,.navbar,header nav,header');
    if (languageWrap && languageWrap.parentNode) {
      button.style.position = 'absolute';
      button.style.top = '0';
      button.style.right = 'calc(100% + 8px)';
      languageWrap.style.position = languageWrap.style.position || 'absolute';
      languageWrap.appendChild(button);
    } else if (header) {
      button.style.marginInlineStart = 'auto';
      button.style.flexShrink = '0';
      header.appendChild(button);
    } else {
      button.style.position = 'fixed';
      button.style.top = '12px';
      button.style.right = '12px';
      document.body.appendChild(button);
    }
    paint();
  }

  paint();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
  new MutationObserver(function () {
    if (!document.getElementById('hewadThemeToggle')) mount();
  }).observe(document.body, { childList: true, subtree: true });
})();