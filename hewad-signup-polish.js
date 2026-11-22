/* HEWAD COIN signup and language polish */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const supportedLanguages = ['en', 'ps', 'fa'];
  const languageNodes = document.querySelectorAll('#languageSelect');
  languageNodes.forEach((node, index) => { if (index > 0) node.remove(); });
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
    '.hewad-home-brand{position:absolute;z-index:5;top:14px;left:14px;display:flex;align-items:center;gap:10px;padding:9px 14px;border:1px solid rgba(255,211,77,.62);border-radius:16px;background:linear-gradient(135deg,rgba(35,29,15,.94),rgba(7,7,8,.88));box-shadow:0 10px 30px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);pointer-events:none}',
    '.hewad-home-brand-mark{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;border:1px solid #f7d77b;background:linear-gradient(145deg,#fff0b4 0%,#e4b43e 45%,#8e5d0b 100%);color:#241600;font:900 22px Georgia,serif;box-shadow:0 0 0 3px rgba(244,197,76,.14),0 5px 14px rgba(0,0,0,.3),inset 0 1px 4px #fff8}',
    '.hewad-home-brand-copy{display:flex;flex-direction:column;gap:1px;line-height:1}',
    '.hewad-home-brand-copy strong{font-size:13px;letter-spacing:2px;color:#ffe39a;text-shadow:0 1px 8px rgba(244,197,76,.2)}',
    '.hewad-home-brand-copy small{font-size:8px;letter-spacing:1.25px;color:#d7c18c}',
    '.language-wrap{top:14px!important;right:14px!important;z-index:6!important}',
    '.language-select{min-width:104px!important;height:38px!important;border-radius:12px!important;padding:0 11px!important;font-weight:800!important}',
    '.hwc-field-hint{display:block!important;position:static!important;float:none!important;clear:both!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;margin:7px 0 12px!important;padding:0 2px!important;min-height:15px!important;font-size:12px!important;line-height:1.5!important;white-space:normal!important;text-align:start!important}',
    '.hwc-field-invalid,.hwc-field-valid{border-color:rgba(255,205,70,.72)!important;box-shadow:none!important}',
    '#signup input.hwc-field-invalid,#signup input.hwc-field-valid{background:#fff!important}',
    '.password-input-wrap{display:flex!important;flex-wrap:wrap!important;align-items:center!important;overflow:visible!important}',
    '.password-input-wrap>input{flex:1 1 100%!important;min-width:0!important}',
    '.password-input-wrap+.hwc-field-hint{display:block!important;width:100%!important;position:static!important;margin-top:7px!important}',
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
      emailAvailable: '✓ ایمیل د ثبت لپاره چمتو دی.',
      passwordValid: '✓ پاسورډ شرایط پوره کوي.',
      passwordInvalid: '✕ لږ تر لږه ۸ توري او شمېرې وکاروئ.',
      confirmValid: '✓ پاسورډونه سره برابر دي.',
      confirmInvalid: '✕ پاسورډونه سره برابر نه دي.'
    },
    fa: {
      emailValid: '✓ قالب ایمیل درست است.',
      emailInvalid: '✕ لطفاً یک آدرس ایمیل معتبر وارد کنید.',
      emailDuplicate: '✕ این ایمیل قبلاً ثبت شده است.',
      emailAvailable: '✓ ایمیل برای ثبت آماده است.',
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
    '✓ Email is available.': 'emailAvailable',
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
      try { originalApplyLanguage(selected); } catch (error) { console.warn('Language switch fallback:', error); }
      document.documentElement.lang = selected;
      document.documentElement.dir = selected === 'en' ? 'ltr' : 'rtl';
      if (home) { home.style.position = 'fixed'; home.style.inset = '0'; home.style.width = '100vw'; home.style.height = '100dvh'; home.style.overflow = 'hidden'; }
      window.scrollTo(0, 0);
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
  /* Required international mobile number + duplicate check before signup. */
  const signupForm = ($('referral') && $('referral').closest('form')) || document.querySelector('#signup form');
  const signupDb = typeof hwcSupabase !== 'undefined' ? hwcSupabase : null;
  if (signupForm && signupDb && signupDb.auth) {
    let mobile = signupForm.querySelector('input[type="tel"],input[name*="mobile" i],input[id*="mobile" i],input[name*="phone" i],input[id*="phone" i]');
    if (!mobile) {
      const mobileLabel = Array.from(signupForm.querySelectorAll('label')).find(el => /mobile number|phone number/i.test(el.textContent || ''));
      if (mobileLabel) mobile = mobileLabel.querySelector('input');
    }
    if (mobile) {
      mobile.type = 'tel';
      mobile.required = true;
      mobile.setAttribute('autocomplete', 'tel-national');
      mobile.setAttribute('inputmode', 'tel');
      let countryCode = Array.from(signupForm.querySelectorAll('select')).find(sel =>
        Array.from(sel.options).some(opt => /^\+\d{1,4}$/.test(opt.value.trim()) || /^\+\d{1,4}$/.test(opt.textContent.trim()))
      );
      if (!countryCode) {
        countryCode = document.createElement('select');
        countryCode.id = 'hwcCountryCallingCode';
        countryCode.name = 'country_calling_code';
        countryCode.required = true;
        countryCode.setAttribute('aria-label', 'Country calling code');
        countryCode.innerHTML = '<option value="">Country code</option>' +
          [['Afghanistan','+93'],['Pakistan','+92'],['India','+91'],['Iran','+98'],['United Arab Emirates','+971'],['Saudi Arabia','+966'],['Turkey','+90'],['United States','+1'],['United Kingdom','+44'],['Canada','+1'],['Germany','+49'],['France','+33'],['China','+86'],['Bangladesh','+880'],['Uzbekistan','+998'],['Tajikistan','+992']].map(x => '<option value="'+x[1]+'">'+x[0]+' ('+x[1]+')</option>').join('');
        const phoneRow = document.createElement('div');
        phoneRow.className = 'hwc-phone-row';
        mobile.parentNode.insertBefore(phoneRow, mobile);
        phoneRow.appendChild(countryCode);
        phoneRow.appendChild(mobile);
      } else {
        countryCode.required = true;
        countryCode.id = countryCode.id || 'hwcCountryCallingCode';
      }
      if (!mobile.closest('.hwc-phone-row')) {
        const phoneRow = document.createElement('div');
        phoneRow.className = 'hwc-phone-row';
        mobile.parentNode.insertBefore(phoneRow, mobile);
        phoneRow.appendChild(countryCode);
        phoneRow.appendChild(mobile);
      }
      let phoneHint = $('hwcMobileValidationHint');
      if (!phoneHint) {
        phoneHint = document.createElement('small');
        phoneHint.id = 'hwcMobileValidationHint';
        phoneHint.className = 'hwc-field-hint';
        const row = mobile.closest('.hwc-phone-row') || mobile;
        row.insertAdjacentElement('afterend', phoneHint);
      }
      const phoneStyle = document.createElement('style');
      phoneStyle.id = 'hwc-phone-signup-styles';
      phoneStyle.textContent = [
        '.hwc-phone-row{display:flex!important;align-items:stretch!important;gap:7px!important;width:100%!important;min-width:0!important;margin:5px 0!important}',
        '.hwc-phone-row select{flex:0 0 42%!important;min-width:0!important;width:42%!important;height:44px!important;border:1px solid #c9c9c9!important;border-radius:9px!important;background:#fff!important;color:#171717!important;padding:0 8px!important;font-size:13px!important}',
        '.hwc-phone-row input{flex:1 1 58%!important;min-width:0!important;width:58%!important;height:44px!important;box-sizing:border-box!important}',
        '#hwcMobileValidationHint{display:block!important;width:100%!important;min-height:0!important;margin:5px 0 10px!important;font-size:11px!important;line-height:1.4!important}',
        '@media(max-height:760px){#signup form{gap:6px!important}#signup form input,#signup form select{min-height:37px!important;height:37px!important}#signup form button{min-height:38px!important;padding-top:8px!important;padding-bottom:8px!important}#signup form label{margin-top:3px!important;margin-bottom:3px!important}#signup h1,#signup h2{margin-top:5px!important;margin-bottom:7px!important}}',
        '@media(max-width:480px){.hwc-phone-row select{font-size:11px!important;padding:0 5px!important}}'
      ].join('');
      document.head.appendChild(phoneStyle);

      let phoneCheckVersion = 0;
      let phoneCheckTimer = null;
      function normalizedPhone() {
        const code = (countryCode.value || '').trim();
        let digits = (mobile.value || '').replace(/\D/g, '');
        digits = digits.replace(/^0+/, '');
        return code && digits ? code + digits : '';
      }
      function paintPhone(ok, message, neutral) {
        mobile.classList.toggle('hwc-field-invalid', !ok && !neutral);
        mobile.classList.toggle('hwc-field-valid', !!ok && !neutral);
        countryCode.classList.toggle('hwc-field-invalid', !ok && !neutral);
        phoneHint.className = 'hwc-field-hint ' + (neutral ? '' : ok ? 'ok' : 'bad');
        phoneHint.style.color = neutral ? '' : ok ? '#25c878' : '#ff6262';
        phoneHint.textContent = message || '';
      }
      async function validateMobile() {
        const ticket = ++phoneCheckVersion;
        const full = normalizedPhone();
        const localDigits = (mobile.value || '').replace(/\D/g, '').replace(/^0+/, '');
        if (!countryCode.value) {
          paintPhone(false, '✕ Please select your country calling code.', false);
          return false;
        }
        if (localDigits.length < 7 || localDigits.length > 14) {
          paintPhone(false, localDigits ? '✕ Enter a valid mobile number.' : '✕ Mobile number is required.', false);
          return false;
        }
        paintPhone(true, 'Checking mobile number…', true);
        const result = await signupDb.rpc('is_registration_mobile_registered', { p_mobile: full });
        if (ticket !== phoneCheckVersion) return false;
        if (result.error) {
          paintPhone(false, '✕ Could not verify this mobile number. Please try again.', false);
          return false;
        }
        if (result.data === true) {
          paintPhone(false, '✕ This mobile number is already registered.', false);
          return false;
        }
        paintPhone(true, '✓ Mobile number is available.', false);
        return true;
      }
      function schedulePhoneCheck() {
        clearTimeout(phoneCheckTimer);
        phoneCheckVersion++;
        paintPhone(false, '', true);
        phoneCheckTimer = setTimeout(validateMobile, 450);
      }
      mobile.addEventListener('input', schedulePhoneCheck);
      countryCode.addEventListener('change', validateMobile);
      mobile.addEventListener('blur', validateMobile);

      if (!signupDb.auth.__hwcPhoneSignupWrapped) {
        const previousSignUp = signupDb.auth.signUp.bind(signupDb.auth);
        signupDb.auth.signUp = async function (credentials) {
          const valid = await validateMobile();
          if (!valid) {
            return { data: { user: null, session: null }, error: { message: phoneHint.textContent.replace(/^✕\s*/, '') || 'Please enter a valid mobile number.' } };
          }
          const full = normalizedPhone();
          const args = Object.assign({}, credentials || {});
          args.options = Object.assign({}, args.options || {});
          args.options.data = Object.assign({}, args.options.data || {}, { mobile_number: full, phone: full });
          const result = await previousSignUp(args);
          if (result && result.error && /mobile number is already registered/i.test(result.error.message || '')) {
            paintPhone(false, '✕ This mobile number is already registered.', false);
          }
          return result;
        };
        signupDb.auth.__hwcPhoneSignupWrapped = true;
      }
    }
  }

  /* Keep the registration panel compact and fixed on small screens. */
  const signupLayoutStyle = document.createElement('style');
  signupLayoutStyle.id = 'hwc-signup-compact-layout';
  signupLayoutStyle.textContent = [
    '#signup{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;overflow:hidden!important;overscroll-behavior:none!important}',
    '#signup form{box-sizing:border-box!important;max-height:calc(100dvh - 14px)!important;overflow:hidden!important;overscroll-behavior:none!important}',
    '#signup input,#signup select{box-sizing:border-box!important}',
    '@media(max-height:760px){#signup form{padding-top:10px!important;padding-bottom:10px!important}#signup form>*{margin-top:5px!important;margin-bottom:5px!important}#signup form input{height:38px!important;min-height:38px!important}#signup form button{height:39px!important;min-height:39px!important}}'
  ].join('');
  document.head.appendChild(signupLayoutStyle);

})();