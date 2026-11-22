/* HEWAD COIN signup and language polish */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const supportedLanguages = ['en', 'ps', 'fa'];
  const languageSelect = $('languageSelect');

  const home = $('home');
  if (home) {
    home.style.position = 'fixed';
    home.style.inset = '0';
    home.style.width = '100vw';
    home.style.height = '100vh';
    home.style.height = '100dvh';
    home.style.minHeight = '0';
    home.style.overflow = 'hidden';
    const stage = home.querySelector('.home-stage');
    if (stage && !$('hewadHomeBrand')) {
      const brand = document.createElement('div');
      brand.id = 'hewadHomeBrand';
      brand.className = 'hewad-home-brand';
      brand.innerHTML =
        '<span class="hewad-home-brand-mark" aria-hidden="true">H</span>' +
        '<span class="hewad-home-brand-copy"><strong>HEWAD</strong><small>COIN NETWORK</small></span>';
      const languageWrap = stage.querySelector('.language-wrap');
      stage.insertBefore(brand, languageWrap || stage.firstChild);
    }
  }

  const style = document.createElement('style');
  style.id = 'hewad-signup-polish-styles';
  style.textContent = [
    '#home{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;min-height:0!important;overflow:hidden!important}',
    '#home .home-stage{width:100%!important;height:100%!important;min-height:0!important;max-width:none!important}',
    '.hewad-home-brand{position:absolute;z-index:5;top:14px;left:14px;display:flex;align-items:center;gap:9px;padding:8px 12px;border:1px solid rgba(255,211,77,.5);border-radius:14px;background:rgba(7,7,8,.72);box-shadow:0 8px 24px rgba(0,0,0,.28);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);pointer-events:none}',
    '.hewad-home-brand-mark{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;border:2px solid #f4c54c;background:radial-gradient(circle at 35% 30%,#fff0b4,#d69a20 62%,#714707);color:#241600;font:900 19px Georgia,serif;box-shadow:0 0 0 3px rgba(244,197,76,.14),inset 0 1px 4px #fff8}',
    '.hewad-home-brand-copy{display:flex;flex-direction:column;gap:1px;line-height:1}',
    '.hewad-home-brand-copy strong{font-size:12px;letter-spacing:1.6px;color:#ffe39a}',
    '.hewad-home-brand-copy small{font-size:8px;letter-spacing:1.25px;color:#d7c18c}',
    '.language-wrap{top:14px!important;right:14px!important;z-index:6!important}',
    '.language-select{min-width:104px!important;height:38px!important;border-radius:12px!important;padding:0 11px!important;font-weight:800!important}',
    '.hwc-field-hint{display:block!important;position:static!important;width:100%!important;box-sizing:border-box!important;margin:7px 0 0!important;padding:0 2px!important;min-height:15px!important;font-size:12px!important;line-height:1.45!important;white-space:normal!important}',
    '.hwc-field-invalid,.hwc-field-valid{border-color:rgba(255,205,70,.72)!important;box-shadow:none!important}',
    '.password-input-wrap{overflow:visible!important}',
    '.password-input-wrap>.hwc-field-hint{position:static!important;display:block!important}',
    '@media(max-width:420px){.hewad-home-brand{top:10px;left:10px;padding:6px 9px;gap:7px}.hewad-home-brand-mark{width:30px;height:30px;font-size:17px}.hewad-home-brand-copy strong{font-size:10px}.hewad-home-brand-copy small{font-size:7px}.language-wrap{top:10px!important;right:10px!important}.language-select{height:34px!important;min-width:94px!important;font-size:11px!important}}'
  ].join('');
  document.head.appendChild(style);

  if (languageSelect) {
    languageSelect.innerHTML =
      '<option value="en">🌐 English</option>' +
      '<option value="ps">پښتو</option>' +
      '<option value="fa">دری</option>';
    languageSelect.setAttribute('aria-label', 'Choose language');
  }

  const hintMessages = {
    en: {
      emailValid: '✓ Email format is valid.',
      emailInvalid: '✕ Enter a valid email address.',
      emailDuplicate: '✕ This email address is already registered.',
      emailAvailable: '✓ Email format is valid.',
      passwordValid: '✓ Password meets the requirements.',
      passwordInvalid: '✕ Use at least 8 characters, including letters and numbers.',
      confirmValid: '✓ Passwords match.',
      confirmInvalid: '✕ Passwords do not match.'
    },
    ps: {
      emailValid: '✓ د ایمیل بڼه سمه ده.',
      emailInvalid: '✕ مهرباني وکړئ سم ایمیل ولیکئ.',
      emailDuplicate: '✕ دا ایمیل مخکې ثبت شوی دی.',
      emailAvailable: '✓ د ایمیل بڼه سمه ده.',
      passwordValid: '✓ پاسورډ شرایط پوره کوي.',
      passwordInvalid: '✕ لږ تر لږه ۸ توري او شمېرې وکاروئ.',
      confirmValid: '✓ پاسورډونه سره برابر دي.',
      confirmInvalid: '✕ پاسورډونه سره برابر نه دي.'
    },
    fa: {
      emailValid: '✓ قالب ایمیل درست است.',
      emailInvalid: '✕ لطفاً یک آدرس ایمیل معتبر وارد کنید.',
      emailDuplicate: '✕ این ایمیل قبلاً ثبت شده است.',
      emailAvailable: '✓ قالب ایمیل درست است.',
      passwordValid: '✓ رمز عبور شرایط را دارد.',
      passwordInvalid: '✕ حداقل ۸ نویسه شامل حروف و اعداد وارد کنید.',
      confirmValid: '✓ رمزهای عبور مطابقت دارند.',
      confirmInvalid: '✕ رمزهای عبور یکسان نیستند.'
    }
  };
  const hintKeyByEnglish = {
    '✓ Email format is valid.': 'emailValid',
    '✕ Enter a valid email address.': 'emailInvalid',
    '✕ This email address is already registered.': 'emailDuplicate',
    '✓ Email is available. Check your inbox if confirmation is required.': 'emailAvailable',
    '✓ Password meets the requirements.': 'passwordValid',
    '✕ Use at least 8 characters, including letters and numbers.': 'passwordInvalid',
    '✓ Passwords match.': 'confirmValid',
    '✕ Passwords do not match.': 'confirmInvalid'
  };
  function localizeValidationHints() {
    const lang = supportedLanguages.includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
    ['hwcEmailValidationHint', 'hwcPasswordValidationHint', 'hwcConfirmPasswordValidationHint'].forEach((id) => {
      const node = $(id);
      if (!node) return;
      const detectedKey = hintKeyByEnglish[node.textContent.trim()];
      if (detectedKey) node.dataset.hwcMessageKey = detectedKey;
      const key = node.dataset.hwcMessageKey || '';
      if (key && hintMessages[lang][key] && node.textContent !== hintMessages[lang][key]) {
        node.textContent = hintMessages[lang][key];
      }
    });
  }
  const hintObserver = new MutationObserver(localizeValidationHints);
  ['hwcEmailValidationHint', 'hwcPasswordValidationHint', 'hwcConfirmPasswordValidationHint'].forEach((id) => {
    const node = $(id);
    if (node) hintObserver.observe(node, { childList: true, characterData: true, subtree: true });
  });

  const originalApplyLanguage = window.applyLanguage;
  if (typeof originalApplyLanguage === 'function') {
    window.applyLanguage = function (language) {
      const selected = supportedLanguages.includes(language) ? language : 'en';
      originalApplyLanguage(selected);
      document.documentElement.lang = selected;
      document.documentElement.dir = selected === 'en' ? 'ltr' : 'rtl';
      const resetPlaceholders = {
        en: ['Email address', '000000', 'Enter new password', 'Confirm new password'],
        ps: ['ایمیل ادرس', '۰۰۰۰۰۰', 'نوی پاسورډ ولیکئ', 'نوی پاسورډ بیا ولیکئ'],
        fa: ['آدرس ایمیل', '۰۰۰۰۰۰', 'رمز عبور جدید را وارد کنید', 'رمز عبور جدید را تأیید کنید']
      };
      ['resetEmail', 'resetCode', 'newResetPassword', 'confirmResetPassword'].forEach((id, index) => {
        const field = $(id);
        if (field) field.placeholder = resetPlaceholders[selected][index];
      });
      if (languageSelect) languageSelect.value = selected;
      localizeValidationHints();
      try { localStorage.setItem('hewad-coin-language', selected); } catch (_) {}
    };
  }

  let savedLanguage = 'en';
  try {
    const saved = localStorage.getItem('hewad-coin-language');
    if (supportedLanguages.includes(saved)) savedLanguage = saved;
  } catch (_) {}
  if (typeof window.applyLanguage === 'function') window.applyLanguage(savedLanguage);

  ['hwcPasswordValidationHint', 'hwcConfirmPasswordValidationHint'].forEach((id) => {
    const hint = $(id);
    if (!hint) return;
    const wrapper = hint.closest('.password-input-wrap');
    if (wrapper && wrapper.parentElement) wrapper.insertAdjacentElement('afterend', hint);
    hint.setAttribute('aria-live', 'polite');
  });
  const emailHint = $('hwcEmailValidationHint');
  if (emailHint) emailHint.setAttribute('aria-live', 'polite');
  localizeValidationHints();

  const email = $('email');
  if (email) {
    email.setAttribute('autocomplete', 'email');
    email.setAttribute('inputmode', 'email');
    email.setAttribute('spellcheck', 'false');
  }
})();