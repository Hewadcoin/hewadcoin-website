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
      const previousCountry = signupForm.querySelector('#hwcCountryCallingCode');
      const oldCountrySelect = Array.from(signupForm.querySelectorAll('select')).find(sel =>
        /country/i.test((sel.name || '') + ' ' + (sel.id || '') + ' ' + (sel.getAttribute('aria-label') || '') + ' ' + (sel.parentElement?.textContent || '')) ||
        Array.from(sel.options || []).some(opt => /Afghanistan.*\+93|Pakistan.*\+92|India.*\+91|United Arab Emirates.*\+971/i.test(opt.textContent || ''))
      );
      const countryCode = document.createElement('input');
      countryCode.type = 'text';
      countryCode.id = 'hwcCountryCallingCode';
      countryCode.name = 'country_calling_code';
      countryCode.required = true;
      countryCode.placeholder = '+93';
      countryCode.inputMode = 'tel';
      countryCode.autocomplete = 'off';
      countryCode.maxLength = 5;
      countryCode.setAttribute('aria-label', 'Type country calling code, for example +93');
      countryCode.value = previousCountry ? (previousCountry.value || '+93') : '+93';
      if (oldCountrySelect) {
        const oldWrap = oldCountrySelect.closest('.form-group,.input-group,.field-group,.form-field,.input-field') || oldCountrySelect.parentElement;
        oldCountrySelect.replaceWith(countryCode);
        if (oldWrap && oldWrap !== countryCode && !oldWrap.querySelector('input,select,textarea')) oldWrap.remove();
      } else if (previousCountry) previousCountry.replaceWith(countryCode);
      const countryInfo = document.createElement('span');
      countryInfo.id = 'hwcCountryDetected';
      countryInfo.className = 'hwc-country-detected';
      const countryMap = {
        '+93':['🇦🇫','Afghanistan'], '+92':['🇵🇰','Pakistan'], '+91':['🇮🇳','India'],
        '+98':['🇮🇷','Iran'], '+971':['🇦🇪','United Arab Emirates'], '+966':['🇸🇦','Saudi Arabia'],
        '+90':['🇹🇷','Turkey'], '+1':['🇺🇸','United States / Canada'], '+44':['🇬🇧','United Kingdom'],
        '+49':['🇩🇪','Germany'], '+33':['🇫🇷','France'], '+86':['🇨🇳','China'],
        '+880':['🇧🇩','Bangladesh'], '+998':['🇺🇿','Uzbekistan'], '+992':['🇹🇯','Tajikistan']
      };
      function updateDetectedCountry() {
        let code = countryCode.value.trim().replace(/[^+\d]/g, '');
        if (code && code[0] !== '+') code = '+' + code;
        if (countryCode.value !== code) countryCode.value = code;
        const found = countryMap[code];
        countryInfo.textContent = found ? found[0] : (code ? '❓' : '');
        countryInfo.setAttribute('aria-label', found ? found[1] : 'Unknown country code');
        countryInfo.style.color = found ? '#d8ad3e' : '#ff6262';
      }
      const countryField = document.createElement('div');
      countryField.className = 'hwc-country-field';
      countryField.appendChild(countryCode);
      countryField.appendChild(countryInfo);
      countryCode.addEventListener('input', updateDetectedCountry);
      updateDetectedCountry();
      if (!mobile.closest('.hwc-phone-row')) {
        const phoneRow = document.createElement('div');
        phoneRow.className = 'hwc-phone-row';
        mobile.parentNode.insertBefore(phoneRow, mobile);
        phoneRow.appendChild(countryField);
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
        '.hwc-phone-row{display:flex!important;align-items:stretch!important;gap:8px!important;width:100%!important;min-width:0!important;margin:5px 0!important}',
        '.hwc-country-field{position:relative!important;display:flex!important;flex:0 0 25%!important;min-width:0!important;height:44px!important}',
        '.hwc-country-field input#hwcCountryCallingCode{width:100%!important;min-width:0!important;height:44px!important;border:1px solid #c9c9c9!important;border-radius:9px!important;background:#fff!important;color:#171717!important;padding:0 34px 0 8px!important;font-size:14px!important;text-align:center!important;box-sizing:border-box!important;direction:ltr!important}',
        '.hwc-country-detected{position:absolute!important;right:8px!important;top:50%!important;transform:translateY(-50%)!important;min-width:20px!important;color:#d8ad3e!important;font-size:17px!important;font-weight:700!important;line-height:1!important;pointer-events:none!important}',
        '.hwc-phone-row input[type=tel]{flex:1 1 75%!important;min-width:0!important;width:auto!important;height:44px!important;box-sizing:border-box!important}',
        '#hwcMobileValidationHint{display:block!important;width:100%!important;min-height:0!important;margin:5px 0 10px!important;font-size:11px!important;line-height:1.4!important}',
        '@media(max-height:760px){#signup form{gap:6px!important}#signup form input,#signup form select{min-height:37px!important;height:37px!important}#signup form button{min-height:38px!important;padding-top:8px!important;padding-bottom:8px!important}#signup form label{margin-top:3px!important;margin-bottom:3px!important}#signup h1,#signup h2{margin-top:5px!important;margin-bottom:7px!important}}',
        '@media(max-width:480px){.hwc-country-field{flex-basis:25%!important}.hwc-country-field input#hwcCountryCallingCode{font-size:12px!important;padding-right:29px!important}.hwc-country-detected{font-size:15px!important;right:7px!important}}'
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
        if (!countryMap[countryCode.value.trim()]) {
          paintPhone(false, '✕ Enter a valid country calling code, for example +93.', false);
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
      countryCode.addEventListener('input', function(){ updateDetectedCountry(); schedulePhoneCheck(); });
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


  /* Registration form: compact two-column rows and no surname field. */
  if (signupForm) {
    const findField = (terms) => Array.from(signupForm.querySelectorAll('input')).find(input =>
      terms.some(term => ((input.name || '') + ' ' + (input.id || '') + ' ' +
        Array.from(input.labels || []).map(label => label.textContent || '').join(' ')).toLowerCase().includes(term)
      )
    );
    const firstName = findField(['first name','firstname','first_name']);
    const referralField = $('referral');
    let lastName = findField(['last name','lastname','last_name','surname','family name']);
    if (!lastName) {
      const lastLabel = Array.from(signupForm.querySelectorAll('label')).find(label => /last\s*name|surname|family\s*name/i.test(label.textContent || ''));
      if (lastLabel) lastName = lastLabel.querySelector('input') || (lastLabel.htmlFor && $(lastLabel.htmlFor)) || lastLabel.parentElement?.querySelector('input');
    }
    const wrapperFor = (el) => el && (el.closest('.form-group,.input-group,.field-group,.form-field,.input-field') || el.parentElement);
    if (lastName) {
      const lastWrap = wrapperFor(lastName);
      if (lastWrap && lastWrap !== signupForm) lastWrap.remove();
      else { lastName.required = false; lastName.disabled = true; lastName.remove(); }
    }
    function makeCompactRow(a,b,cls) {
      if (!a || !b || a === b) return;
      let wa=wrapperFor(a), wb=wrapperFor(b);
      if (!wa || !wb || wa===wb || wa.parentElement!==wb.parentElement) return;
      let row=wa.parentElement.querySelector(':scope > .' + cls);
      if (!row) { row=document.createElement('div'); row.className=cls; wa.parentElement.insertBefore(row,wa); }
      row.appendChild(wa); row.appendChild(wb);
    }
    makeCompactRow(firstName,referralField,'hwc-name-referral-row');
    const formStyle=document.createElement('style');
    formStyle.id='hwc-registration-layout-style';
    formStyle.textContent=[
      '.hwc-name-referral-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:9px!important;width:100%!important;align-items:start!important}',
      '.hwc-name-referral-row>*{min-width:0!important;width:100%!important;margin:0!important}',
      '#signup form .hwc-name-referral-row input{width:100%!important;min-width:0!important}',
      '#signup form .hwc-phone-row{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:7px!important}',
      '#signup form .hwc-phone-row input[type=tel]{flex:1 1 38%!important;width:auto!important;min-width:0!important}',
      '#signup form input[type=email],#signup form input[type=password]{margin-bottom:4px!important}',
      '#signup form .hwc-field-hint{margin-top:2px!important;margin-bottom:5px!important;min-height:11px!important;font-size:10px!important;line-height:1.25!important}',
      '#signup form .password-input-wrap{margin-bottom:0!important}',
      '#signup form .password-input-wrap+ .hwc-field-hint{margin-top:2px!important;margin-bottom:4px!important}',
      '@media(max-width:390px){.hwc-name-referral-row{gap:6px!important}.hwc-name-referral-row input{font-size:12px!important;padding-left:8px!important;padding-right:8px!important}}'
    ].join('');
    document.head.appendChild(formStyle);
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


  /* Final registration form refinements requested by the site owner. */
  (function refineSignupFields(){
    const form = (document.getElementById('referral') && document.getElementById('referral').closest('form')) || document.querySelector('#signup form');
    if (!form) return;
    const firstName = form.querySelector('input[name*="first" i],input[id*="first" i]');
    if (firstName) {
      firstName.placeholder = 'Name';
      firstName.setAttribute('aria-label','Name');
      Array.from(form.querySelectorAll('label')).forEach(label => {
        const associated = label.contains(firstName) || label.htmlFor === firstName.id;
        if (!associated || !/first\s*name/i.test(label.textContent || '')) return;
        if (label.contains(firstName)) {
          Array.from(label.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && /first\s*name/i.test(node.textContent)) node.textContent = node.textContent.replace(/first\s*name/i,'Name');
          });
        } else {
          label.textContent = 'Name';
        }
      });
    }
    const countryCode = document.getElementById('hwcCountryCallingCode');
    const countryInfo = document.getElementById('hwcCountryDetected');
    if (countryCode && countryInfo) {
      function showCountryName() {
        if (!countryInfo.dataset.flag) {
          const match = countryInfo.textContent.trim().match(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
          countryInfo.dataset.flag = match ? match[0] : '❓';
        }
        const countryName = countryInfo.getAttribute('aria-label') || 'Unknown country';
        countryInfo.textContent = countryInfo.dataset.flag + ' ' + countryName;
        countryInfo.title = countryName;
      }
      showCountryName();
      countryCode.addEventListener('input', showCountryName);
      countryCode.addEventListener('change', showCountryName);
    }
    const compact = document.createElement('style');
    compact.id = 'hwc-signup-final-refinements';
    compact.textContent = [
      '#signup form .hwc-country-field{display:flex!important;flex:0 0 25%!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:3px!important;height:auto!important;min-width:0!important}',
      '#signup form .hwc-country-field input#hwcCountryCallingCode{height:38px!important;min-height:38px!important;padding:0 7px!important;text-align:center!important}',
      '#signup form .hwc-country-detected{position:static!important;display:block!important;transform:none!important;min-width:0!important;width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;text-align:center!important;font-size:10px!important;line-height:13px!important;color:#e4c36c!important}',
      '#signup form .hwc-phone-row{align-items:flex-start!important;gap:8px!important}',
      '#signup form .hwc-phone-row input[type=tel]{height:38px!important;min-height:38px!important;align-self:flex-start!important}',
      '#signup form input[type=email],#signup form input[type=password]{margin-top:2px!important;margin-bottom:1px!important}',
      '#signup form .hwc-field-hint{margin-top:0!important;margin-bottom:2px!important;min-height:10px!important;line-height:1.15!important}',
      '#signup form .password-input-wrap{margin-top:1px!important;margin-bottom:0!important}',
      '#signup form .password-input-wrap+ .hwc-field-hint{margin-top:0!important;margin-bottom:2px!important}',
      '#signup form label{margin-top:2px!important;margin-bottom:2px!important;line-height:1.25!important}',
      '@media(max-width:390px){#signup form .hwc-country-detected{font-size:9px!important}.hwc-name-referral-row{gap:6px!important}}'
    ].join('');
    document.head.appendChild(compact);
  })();


  /* Corrected signup grid: equal overall row width, aligned fields, compact country-code box. */
  (function applyCorrectSignupGrid(){
    const form = document.querySelector('#signup form') || (document.getElementById('referral') && document.getElementById('referral').closest('form'));
    if (!form) return;
    const fieldWrapper = (el) => el && (el.closest('.form-group,.input-group,.field-group,.form-field,.input-field') || el.parentElement);
    const findInput = (terms) => Array.from(form.querySelectorAll('input')).find(el => {
      const meta = ((el.name||'')+' '+(el.id||'')+' '+(el.placeholder||'')+' '+Array.from(el.labels||[]).map(x=>x.textContent||'').join(' ')).toLowerCase();
      return terms.some(t=>meta.includes(t));
    });
    const name = findInput(['first name','firstname','first_name']) || findInput(['name']);
    const referral = document.getElementById('referral');
    const nameWrap = fieldWrapper(name), referralWrap = fieldWrapper(referral);
    if (nameWrap && referralWrap && nameWrap !== referralWrap) {
      const row = document.createElement('div');
      row.className = 'hwc-name-referral-row';
      const anchor = nameWrap.compareDocumentPosition(referralWrap) & Node.DOCUMENT_POSITION_FOLLOWING ? nameWrap : referralWrap;
      anchor.parentNode.insertBefore(row, anchor);
      row.appendChild(nameWrap);
      row.appendChild(referralWrap);
    }
    const phoneRow = form.querySelector('.hwc-phone-row');
    if (phoneRow) {
      phoneRow.style.width = '100%';
      phoneRow.style.boxSizing = 'border-box';
      phoneRow.style.display = 'grid';
      phoneRow.style.gridTemplateColumns = 'minmax(82px, 0.32fr) minmax(0, 0.68fr)';
      phoneRow.style.gap = '8px';
      phoneRow.style.alignItems = 'stretch';
      const country = phoneRow.querySelector('.hwc-country-field');
      const code = phoneRow.querySelector('#hwcCountryCallingCode');
      const flag = phoneRow.querySelector('#hwcCountryDetected');
      const mobile = phoneRow.querySelector('input[type="tel"]');
      if (country) {
        country.style.cssText += ';width:100%;min-width:0;max-width:none;flex:none;position:relative;box-sizing:border-box';
      }
      if (code) {
        code.style.cssText += ';width:100%;min-width:0;box-sizing:border-box;padding:0 30px 0 5px;text-align:center';
      }
      if (flag) {
        flag.style.cssText += ';position:absolute;right:7px;top:50%;transform:translateY(-50%);pointer-events:none';
      }
      if (mobile) mobile.style.cssText += ';width:100%;min-width:0;max-width:none;box-sizing:border-box;flex:none';
    }
    const style = document.createElement('style');
    style.id = 'hwc-signup-grid-correction';
    style.textContent = [
      '#signup form{width:100%!important;box-sizing:border-box!important}',
      '#signup form .hwc-name-referral-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important;width:100%!important;box-sizing:border-box!important;align-items:stretch!important}',
      '#signup form .hwc-name-referral-row>*{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;flex:none!important;box-sizing:border-box!important;margin:0!important}',
      '#signup form .hwc-name-referral-row input{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important}',
      '#signup form .hwc-phone-row{display:grid!important;grid-template-columns:minmax(82px,.32fr) minmax(0,.68fr)!important;gap:8px!important;width:100%!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important;align-items:stretch!important}',
      '#signup form .hwc-country-field{width:100%!important;min-width:0!important;max-width:none!important;flex:none!important;height:40px!important;box-sizing:border-box!important}',
      '#signup form #hwcCountryCallingCode{width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;box-sizing:border-box!important;padding:0 29px 0 5px!important;text-align:center!important}',
      '#signup form #hwcCountryDetected{position:absolute!important;right:6px!important;top:50%!important;transform:translateY(-50%)!important;font-size:16px!important;line-height:1!important}',
      '#signup form .hwc-phone-row input[type=tel]{width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;box-sizing:border-box!important;flex:none!important}',
      '#signup form input[type=email],#signup form input[type=password],#signup form textarea,#signup form select{display:block!important;width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important}',
      '#signup form .hwc-field-hint{width:100%!important;box-sizing:border-box!important}',
      '#signup form .hwc-name-referral-row input,#signup form .hwc-phone-row input{font-size:13px!important}',
      '@media(max-width:360px){#signup form .hwc-name-referral-row,#signup form .hwc-phone-row{gap:6px!important}#signup form .hwc-phone-row{grid-template-columns:minmax(75px,.32fr) minmax(0,.68fr)!important}}'
    ].join('');
    document.getElementById('hwc-signup-grid-correction')?.remove();
    document.head.appendChild(style);
  })();

})();

/* Final owner-requested signup layout: name/referral, compact phone prefix, full-width remaining fields. */
(function finalOwnerSignupLayout(){
  'use strict';
  const form=(document.getElementById('referral')&&document.getElementById('referral').closest('form'))||document.querySelector('#signup form');
  if(!form)return;
  const wrap=el=>el&&(el.closest('.form-group,.input-group,.field-group,.form-field,.input-field')||el.parentElement);
  const find=(terms)=>Array.from(form.querySelectorAll('input')).find(el=>{
    const meta=[el.name,el.id,el.placeholder,...Array.from(el.labels||[]).map(x=>x.textContent)].join(' ').toLowerCase();
    return terms.some(t=>meta.includes(t));
  });
  const name=find(['first name','firstname','first_name'])||find(['name']);
  const referral=document.getElementById('referral');
  const mobile=form.querySelector('input[type="tel"],input[name*="mobile" i],input[id*="mobile" i],input[name*="phone" i],input[id*="phone" i]');
  const phoneRow=mobile&&mobile.closest('.hwc-phone-row');
  function placePair(a,b,className){
    const wa=wrap(a),wb=wrap(b);
    if(!wa||!wb||wa===wb)return;
    let row=form.querySelector(':scope > .'+className);
    if(!row){row=document.createElement('div');row.className=className;const anchor=wa.compareDocumentPosition(wb)&Node.DOCUMENT_POSITION_FOLLOWING?wa:wb;anchor.parentNode.insertBefore(row,anchor);}
    row.append(wa,wb);
  }
  placePair(name,referral,'hwc-name-referral-row');
  if(phoneRow&&phoneRow.parentElement!==form){
    const country=phoneRow.querySelector('.hwc-country-field');
    if(country)country.style.width='100%';
  }
  const detected=document.getElementById('hwcCountryDetected');
  if(detected){
    const updateFlag=()=>{
      const match=(detected.getAttribute('aria-label')||'').trim();
      const emoji=detected.textContent.match(/[\\u{1F1E6}-\\u{1F1FF}]{2}/u);
      const known={
        Afghanistan:'🇦🇫',Pakistan:'🇵🇰',India:'🇮🇳',Iran:'🇮🇷',
        'United Arab Emirates':'🇦🇪','Saudi Arabia':'🇸🇦',Turkey:'🇹🇷',
        'United States / Canada':'🇺🇸','United Kingdom':'🇬🇧',Germany:'🇩🇪',
        France:'🇫🇷',China:'🇨🇳',Bangladesh:'🇧🇩',Uzbekistan:'🇺🇿',Tajikistan:'🇹🇯'
      };
      detected.textContent=known[match]||(emoji?emoji[0]:'❓');
      detected.title=match;
      detected.setAttribute('aria-label',match||'Unknown country');
    };
    updateFlag();
    const code=document.getElementById('hwcCountryCallingCode');
    code&&code.addEventListener('input',updateFlag);
  }
  const style=document.createElement('style');
  style.id='hwc-owner-final-layout';
  style.textContent=[
    '#signup form{display:flex!important;flex-direction:column!important;gap:5px!important;width:100%!important;box-sizing:border-box!important}',
    '#signup form .hwc-name-referral-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important;width:100%!important;align-items:stretch!important}',
    '#signup form .hwc-name-referral-row>*{width:100%!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important;margin:0!important}',
    '#signup form .hwc-name-referral-row input{width:100%!important;min-width:0!important;box-sizing:border-box!important}',
    '#signup form .hwc-phone-row{display:grid!important;grid-template-columns:minmax(0,32fr) minmax(0,68fr)!important;gap:8px!important;width:100%!important;align-items:stretch!important;box-sizing:border-box!important}',
    '#signup form .hwc-country-field{width:100%!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important;position:relative!important}',
    '#signup form #hwcCountryCallingCode{width:100%!important;min-width:0!important;height:40px!important;box-sizing:border-box!important;padding:0 28px 0 5px!important;text-align:center!important;direction:ltr!important}',
    '#signup form #hwcCountryDetected{position:absolute!important;right:7px!important;top:50%!important;transform:translateY(-50%)!important;display:block!important;width:auto!important;font-size:17px!important;line-height:1!important;pointer-events:none!important}',
    '#signup form .hwc-phone-row input[type=tel]{width:100%!important;min-width:0!important;height:40px!important;box-sizing:border-box!important}',
    '#signup form input[type=email],#signup form input[type=password]{width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;margin-top:0!important;margin-bottom:0!important}',
    '#signup form .hwc-field-hint{margin-top:1px!important;margin-bottom:2px!important;min-height:0!important;line-height:1.2!important}',
    '#signup form .password-input-wrap{margin-top:0!important;margin-bottom:0!important}',
    '#signup form .password-input-wrap+.hwc-field-hint{margin-top:1px!important;margin-bottom:2px!important}',
    '#signup form label{margin-top:1px!important;margin-bottom:1px!important}',
    '@media(max-width:360px){#signup form .hwc-name-referral-row,#signup form .hwc-phone-row{gap:6px!important}#signup form .hwc-phone-row{grid-template-columns:minmax(0,30fr) minmax(0,70fr)!important}}'
  ].join('');
  document.getElementById(style.id)?.remove();
  document.head.appendChild(style);
})();


/* Final compact signup alignment: equal row widths and tighter field spacing. */
(function finalCompactSignupAlignment(){
  'use strict';
  const form=(document.getElementById('referral')&&document.getElementById('referral').closest('form'))||document.querySelector('#signup form');
  if(!form)return;
  const getWrap=el=>el&&(el.closest('.form-group,.input-group,.field-group,.form-field,.input-field')||el.parentElement);
  const inputs=Array.from(form.querySelectorAll('input'));
  const find=terms=>inputs.find(el=>{
    const meta=[el.name,el.id,el.placeholder,...Array.from(el.labels||[]).map(x=>x.textContent||'')].join(' ').toLowerCase();
    return terms.some(term=>meta.includes(term));
  });
  const name=find(['first name','firstname','first_name'])||find(['name']);
  const referral=document.getElementById('referral');
  function pair(a,b,className){
    const wa=getWrap(a),wb=getWrap(b);
    if(!wa||!wb||wa===wb)return;
    let row=form.querySelector(':scope > .'+className);
    if(!row){
      row=document.createElement('div');
      row.className=className;
      const anchor=wa.compareDocumentPosition(wb)&Node.DOCUMENT_POSITION_FOLLOWING?wa:wb;
      anchor.parentNode.insertBefore(row,anchor);
    }
    if(wa.parentElement!==row)row.appendChild(wa);
    if(wb.parentElement!==row)row.appendChild(wb);
  }
  pair(name,referral,'hwc-name-referral-row');
  const mobile=form.querySelector('input[type="tel"],input[name*="mobile" i],input[id*="mobile" i],input[name*="phone" i],input[id*="phone" i]');
  const phoneRow=mobile&&mobile.closest('.hwc-phone-row');
  const lastLabel=Array.from(form.querySelectorAll('label')).find(el=>/last\s*name|surname|family\s*name/i.test(el.textContent||''));
  if(lastLabel){
    const lastInput=lastLabel.querySelector('input')||(lastLabel.htmlFor&&document.getElementById(lastLabel.htmlFor));
    const lastWrap=lastInput&&getWrap(lastInput);
    if(lastWrap&&lastWrap!==form)lastWrap.remove();else lastLabel.remove();
  }
  const style=document.createElement('style');
  style.id='hwc-final-equal-row-layout';
  style.textContent=[
    '#signup form{display:flex!important;flex-direction:column!important;gap:4px!important;width:100%!important;box-sizing:border-box!important}',
    '#signup form .hwc-name-referral-row,#signup form .hwc-phone-row{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;margin:0!important;align-items:stretch!important}',
    '#signup form .hwc-name-referral-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important}',
    '#signup form .hwc-name-referral-row>*{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;width:100%!important;min-width:0!important;max-width:none!important;flex:1 1 0!important;box-sizing:border-box!important;margin:0!important}',
    '#signup form .hwc-name-referral-row input{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;min-height:40px!important;box-sizing:border-box!important}',
    '#signup form .hwc-phone-row{display:grid!important;grid-template-columns:minmax(0,32fr) minmax(0,68fr)!important;gap:8px!important}',
    '#signup form .hwc-country-field{display:block!important;position:relative!important;width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;box-sizing:border-box!important}',
    '#signup form #hwcCountryCallingCode,#signup form .hwc-phone-row input[type=tel]{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;min-height:40px!important;box-sizing:border-box!important}',
    '#signup form #hwcCountryCallingCode{padding:0 28px 0 5px!important;text-align:center!important;direction:ltr!important}',
    '#signup form #hwcCountryDetected{position:absolute!important;right:6px!important;top:50%!important;transform:translateY(-50%)!important;display:block!important;width:auto!important;font-size:17px!important;line-height:1!important;pointer-events:none!important}',
    '#signup form input[type=email],#signup form input[type=password]{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;min-height:40px!important;margin-top:0!important;margin-bottom:0!important;box-sizing:border-box!important}',
    '#signup form .password-input-wrap{display:flex!important;flex-wrap:wrap!important;width:100%!important;margin:0!important;gap:0!important}',
    '#signup form .password-input-wrap>input{flex:1 1 100%!important}',
    '#signup form .hwc-field-hint{display:block!important;width:100%!important;min-height:0!important;margin:1px 0 2px!important;line-height:1.2!important;font-size:10px!important;box-sizing:border-box!important}',
    '#signup form .password-input-wrap+.hwc-field-hint{margin-top:1px!important;margin-bottom:2px!important}',
    '#signup form label{margin-top:1px!important;margin-bottom:1px!important;line-height:1.2!important}',
    '#signup form button{margin-top:3px!important}',
    '@media(max-width:360px){#signup form .hwc-name-referral-row,#signup form .hwc-phone-row{gap:6px!important}#signup form .hwc-phone-row{grid-template-columns:minmax(0,30fr) minmax(0,70fr)!important}}'
  ].join('');
  document.getElementById(style.id)?.remove();
  document.head.appendChild(style);
})();


/* Authoritative registration layout: two paired rows, then full-width fields. */
(function enforceRequestedSignupRows(){
  'use strict';
  const form=(document.getElementById('referral')&&document.getElementById('referral').closest('form'))||document.querySelector('#signup form');
  if(!form||form.dataset.hwcRequestedRowsApplied==='1')return;
  form.dataset.hwcRequestedRowsApplied='1';

  const allInputs=()=>Array.from(form.querySelectorAll('input'));
  const meta=el=>[el.name,el.id,el.placeholder,...Array.from(el.labels||[]).map(x=>x.textContent||'')].join(' ').toLowerCase();
  const find=terms=>allInputs().find(el=>terms.some(term=>meta(el).includes(term)));
  const name=find(['first name','firstname','first_name'])||find(['name']);
  const referral=document.getElementById('referral');
  const mobile=form.querySelector('#hwcCountryCallingCode')?.closest('.hwc-phone-row')?.querySelector('input[type="tel"]')
    ||form.querySelector('input[type="tel"],input[name*="mobile" i],input[id*="mobile" i],input[name*="phone" i],input[id*="phone" i]');

  const wrapper=el=>{
    if(!el)return null;
    const candidate=el.closest('.form-group,.input-group,.field-group,.form-field,.input-field');
    if(candidate&&candidate!==form)return candidate;
    return el.parentElement&&el.parentElement!==form?el.parentElement:el;
  };
  const removeSurname=()=>{
    const input=find(['last name','lastname','last_name','surname','family name']);
    const label=Array.from(form.querySelectorAll('label')).find(l=>/last\s*name|surname|family\s*name/i.test(l.textContent||''));
    const box=wrapper(input)||(label&&(label.closest('.form-group,.input-group,.field-group,.form-field,.input-field')||label));
    if(box&&box!==form)box.remove();
    else if(label)label.remove();
  };
  removeSurname();

  const nameBox=wrapper(name),refBox=wrapper(referral);
  let nameRow=form.querySelector(':scope > .hwc-name-referral-row');
  if(nameBox&&refBox&&nameBox!==refBox){
    if(!nameRow){nameRow=document.createElement('div');nameRow.className='hwc-name-referral-row';}
    nameRow.append(nameBox,refBox);
    form.insertBefore(nameRow,form.firstChild);
  }

  let phoneRow=mobile?.closest('.hwc-phone-row');
  if(phoneRow){
    const country=phoneRow.querySelector('.hwc-country-field');
    const code=phoneRow.querySelector('#hwcCountryCallingCode');
    const flag=phoneRow.querySelector('#hwcCountryDetected');
    const mobileLabel=Array.from(form.querySelectorAll('label')).find(l=>l!==mobile.closest('label')&&
      (l.htmlFor===mobile.id||(/mobile number|phone number/i.test(l.textContent||'')&&l.querySelector('input')===mobile)));
    const mobileCell=document.createElement('div');
    mobileCell.className='hwc-mobile-cell';
    if(mobileLabel)mobileCell.appendChild(mobileLabel);
    mobileCell.appendChild(mobile);
    phoneRow.replaceChildren();
    if(country)phoneRow.appendChild(country);
    phoneRow.appendChild(mobileCell);
    const hint=document.getElementById('hwcMobileValidationHint');
    form.insertBefore(phoneRow,nameRow?.nextSibling||form.firstChild);
    if(hint)phoneRow.insertAdjacentElement('afterend',hint);
    if(code){
      const countryMap={
        '+93':['🇦🇫','Afghanistan'],'+92':['🇵🇰','Pakistan'],'+91':['🇮🇳','India'],
        '+98':['🇮🇷','Iran'],'+971':['🇦🇪','United Arab Emirates'],'+966':['🇸🇦','Saudi Arabia'],
        '+90':['🇹🇷','Turkey'],'+1':['🇺🇸','United States / Canada'],'+44':['🇬🇧','United Kingdom'],
        '+49':['🇩🇪','Germany'],'+33':['🇫🇷','France'],'+86':['🇨🇳','China'],
        '+880':['🇧🇩','Bangladesh'],'+998':['🇺🇿','Uzbekistan'],'+992':['🇹🇯','Tajikistan']
      };
      const update=()=>{
        const value=code.value.trim().replace(/[^+\d]/g,'');
        if(code.value!==value)code.value=value;
        const found=countryMap[value];
        if(flag){flag.textContent=found?found[0]:'❓';flag.title=found?found[1]:'Unknown country';flag.setAttribute('aria-label',flag.title);}
      };
      code.addEventListener('input',update);
      update();
    }
  }

  const style=document.createElement('style');
  style.id='hwc-requested-two-row-layout';
  style.textContent=[
    '#signup form{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:7px!important;width:100%!important;box-sizing:border-box!important}',
    '#signup form .hwc-name-referral-row,#signup form .hwc-phone-row{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;margin:0!important;align-items:end!important}',
    '#signup form .hwc-name-referral-row>* ,#signup form .hwc-phone-row>*{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important;margin:0!important}',
    '#signup form .hwc-name-referral-row input,#signup form .hwc-phone-row input{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;min-height:40px!important;box-sizing:border-box!important}',
    '#signup form .hwc-phone-row{grid-template-columns:minmax(0,.38fr) minmax(0,.62fr)!important;align-items:end!important}',
    '#signup form .hwc-country-field{position:relative!important;width:100%!important;height:40px!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important}',
    '#signup form #hwcCountryCallingCode{padding:0 27px 0 5px!important;text-align:center!important;direction:ltr!important}',
    '#signup form #hwcCountryDetected{position:absolute!important;right:6px!important;top:50%!important;transform:translateY(-50%)!important;font-size:16px!important;line-height:1!important;pointer-events:none!important}',
    '#signup form .hwc-mobile-cell{display:flex!important;flex-direction:column!important;gap:2px!important;min-width:0!important;width:100%!important}',
    '#signup form .hwc-mobile-cell label{display:block!important;margin:0 0 2px!important}',
    '#signup form input[type=email],#signup form input[type=password]{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;min-height:40px!important;box-sizing:border-box!important;margin:0!important}',
    '#signup form .password-input-wrap{width:100%!important;margin:0!important}',
    '#signup form .password-input-wrap>input{width:100%!important;min-width:0!important}',
    '#signup form .hwc-field-hint{width:100%!important;min-height:0!important;margin:1px 0 3px!important;line-height:1.2!important;box-sizing:border-box!important}',
    '#signup form label{margin-top:1px!important;margin-bottom:2px!important;line-height:1.2!important}',
    '@media(max-width:380px){#signup form .hwc-name-referral-row,#signup form .hwc-phone-row{gap:6px!important}#signup form .hwc-phone-row{grid-template-columns:minmax(0,.38fr) minmax(0,.62fr)!important}}'
  ].join('');
  document.getElementById(style.id)?.remove();
  document.head.appendChild(style);
})();


/* Hard override: exact owner-requested signup order and country-code entry. */
function hewadExactSignupForm(){
  const form=(document.getElementById('referral')&&document.getElementById('referral').closest('form'))||document.querySelector('#signup form');
  if(!form||form.dataset.hwcExactLayout==='yes')return;

  const inputs=()=>Array.from(form.querySelectorAll('input'));
  const labelText=el=>Array.from(el.labels||[]).map(l=>l.textContent||'').join(' ');
  const meta=el=>[el.id,el.name,el.placeholder,labelText(el)].join(' ').toLowerCase();
  const find=fn=>inputs().find(fn);
  const first=find(el=>/first.?name|firstname/.test(meta(el)))||find(el=>/^name$/.test((el.name||el.id||'').toLowerCase()))||find(el=>/name/.test(meta(el))&&!/last|referral|user/.test(meta(el)));
  const referral=document.getElementById('referral')||find(el=>/referral/.test(meta(el)));
  const mobile=find(el=>el.type==='tel'||/mobile|phone/.test(meta(el)));
  if(!first||!referral||!mobile)return;
  form.dataset.hwcExactLayout='yes';
  const email=find(el=>el.type==='email'||/email/.test(meta(el)));
  const password=find(el=>el.type==='password'&&!/confirm|repeat/.test(meta(el)));
  const confirm=find(el=>el.type==='password'&&(/confirm|repeat/.test(meta(el))||el!==password));
  const fieldBox=el=>{
    if(!el)return null;
    const group=el.closest('.form-group,.input-group,.field-group,.form-field,.input-field');
    if(group&&group!==form)return group;
    const label=el.closest('label');
    if(label&&label.parentElement!==form)return label.parentElement;
    return el.parentElement&&el.parentElement!==form?el.parentElement:el;
  };
  const lastInput=find(el=>/last.?name|surname|family.?name/.test(meta(el)));
  const lastLabel=Array.from(form.querySelectorAll('label')).find(l=>/last\s*name|surname|family\s*name/i.test(l.textContent||''));
  const lastBox=fieldBox(lastInput)||(lastLabel&&(lastLabel.closest('.form-group,.input-group,.field-group,.form-field,.input-field')||lastLabel.parentElement));
  if(lastBox&&lastBox!==form)lastBox.remove(); else if(lastLabel)lastLabel.remove();

  const makeRow=cls=>{
    let row=form.querySelector(':scope > .'+cls);
    if(!row){row=document.createElement('div');row.className=cls;}
    return row;
  };
  const nameRow=makeRow('hwc-exact-name-referral');
  const nameBox=fieldBox(first),refBox=fieldBox(referral);
  if(nameBox&&nameBox!==refBox)nameRow.appendChild(nameBox);
  if(refBox&&refBox!==nameBox)nameRow.appendChild(refBox);

  let phoneRow=makeRow('hwc-exact-phone-row');
  let countryWrap=phoneRow.querySelector('.hwc-exact-country');
  let code=phoneRow.querySelector('#hwcCountryCallingCode');
  let flag=phoneRow.querySelector('#hwcCountryDetected');
  const existingCode=form.querySelector('#hwcCountryCallingCode');
  const existingCountry=form.querySelector('.hwc-country-field');
  const oldSelect=Array.from(form.querySelectorAll('select')).find(el=>/country/i.test((el.name||'')+' '+(el.id||'')+' '+(el.getAttribute('aria-label')||'')));
  if(!countryWrap){
    countryWrap=document.createElement('div');
    countryWrap.className='hwc-exact-country';
    code=existingCode||document.createElement('input');
    code.type='text';code.id='hwcCountryCallingCode';code.name='country_calling_code';
    code.placeholder='+93';code.maxLength=5;code.inputMode='tel';code.autocomplete='off';
    code.setAttribute('aria-label','Country calling code, e.g. +93');
    code.required=true;
    if(existingCountry){
      const oldFlag=existingCountry.querySelector('#hwcCountryDetected');
      if(oldFlag)flag=oldFlag;
      existingCountry.replaceWith(countryWrap);
      countryWrap.appendChild(code);
    }else{
      if(oldSelect)oldSelect.remove();
      countryWrap.appendChild(code);
    }
    flag=flag||document.createElement('span');
    flag.id='hwcCountryDetected';flag.className='hwc-country-detected';
    countryWrap.appendChild(flag);
  }
  const phoneBox=fieldBox(mobile);
  const phoneLabel=Array.from(form.querySelectorAll('label')).find(l=>/mobile number|phone number/i.test(l.textContent||'')&&(l.contains(mobile)||l.htmlFor===mobile?.id));
  if(phoneBox&&phoneBox!==countryWrap){
    phoneRow.appendChild(countryWrap);
    phoneRow.appendChild(phoneBox);
  }else{
    phoneRow.appendChild(countryWrap);
    if(mobile)phoneRow.appendChild(mobile);
  }
  if(phoneLabel&&!phoneRow.contains(phoneLabel)&&mobile&&phoneBox)phoneBox.insertBefore(phoneLabel,mobile);

  const map={
    '+93':['🇦🇫','Afghanistan'],'+92':['🇵🇰','Pakistan'],'+91':['🇮🇳','India'],
    '+98':['🇮🇷','Iran'],'+971':['🇦🇪','United Arab Emirates'],'+966':['🇸🇦','Saudi Arabia'],
    '+90':['🇹🇷','Turkey'],'+1':['🇺🇸','United States / Canada'],'+44':['🇬🇧','United Kingdom'],
    '+49':['🇩🇪','Germany'],'+33':['🇫🇷','France'],'+86':['🇨🇳','China'],
    '+880':['🇧🇩','Bangladesh'],'+998':['🇺🇿','Uzbekistan'],'+992':['🇹🇯','Tajikistan']
  };
  const updateCountry=()=>{
    let v=(code.value||'').replace(/[^+\d]/g,'');
    if(v&&!v.startsWith('+'))v='+'+v;
    if(code.value!==v)code.value=v;
    const hit=map[v];
    flag.textContent=hit?hit[0]:'';
    flag.title=hit?hit[1]:'Enter a supported calling code';
    flag.setAttribute('aria-label',flag.title);
  };
  if(code.dataset.hwcCountryListener!=='1'){
    code.addEventListener('input',updateCountry);
    code.dataset.hwcCountryListener='1';
  }
  updateCountry();

  const emailBox=fieldBox(email),passBox=fieldBox(password),confirmBox=fieldBox(confirm);
  const mobileHint=document.getElementById('hwcMobileValidationHint');
  const emailHint=document.getElementById('hwcEmailValidationHint');
  const passHint=document.getElementById('hwcPasswordValidationHint');
  const confirmHint=document.getElementById('hwcConfirmPasswordValidationHint');
  const ordered=[nameRow,phoneRow,emailBox,emailHint,passBox,passHint,confirmBox,confirmHint];
  ordered.forEach(node=>{if(node&&node!==form)form.appendChild(node);});
  if(mobileHint)phoneRow.insertAdjacentElement('afterend',mobileHint);

  const style=document.createElement('style');
  style.id='hwc-exact-owner-form-style';
  style.textContent=[
    '#signup form{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:7px!important;width:100%!important;box-sizing:border-box!important}',
    '#signup form .hwc-exact-name-referral,#signup form .hwc-exact-phone-row{display:grid!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;gap:8px!important;align-items:end!important;margin:0!important}',
    '#signup form .hwc-exact-name-referral{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}',
    '#signup form .hwc-exact-phone-row{grid-template-columns:minmax(0,25fr) minmax(0,75fr)!important}',
    '#signup form .hwc-exact-name-referral>* ,#signup form .hwc-exact-phone-row>*{display:block!important;width:100%!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important;margin:0!important}',
    '#signup form .hwc-exact-name-referral input,#signup form .hwc-exact-phone-row input{width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;min-height:40px!important;box-sizing:border-box!important}',
    '#signup form .hwc-exact-country{position:relative!important;width:100%!important;height:40px!important;min-width:0!important;box-sizing:border-box!important}',
    '#signup form #hwcCountryCallingCode{padding:0 28px 0 5px!important;text-align:center!important;direction:ltr!important}',
    '#signup form #hwcCountryDetected{position:absolute!important;right:6px!important;top:50%!important;transform:translateY(-50%)!important;font-size:16px!important;line-height:1!important;pointer-events:none!important}',
    '#signup form input[type=email],#signup form input[type=password]{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;height:40px!important;min-height:40px!important;box-sizing:border-box!important;margin:0!important}',
    '#signup form .password-input-wrap{display:flex!important;flex-wrap:wrap!important;width:100%!important;min-width:0!important;margin:0!important}',
    '#signup form .password-input-wrap>input{width:100%!important;min-width:0!important;flex:1 1 100%!important}',
    '#signup form .hwc-field-hint{display:block!important;width:100%!important;min-height:0!important;margin:1px 0 3px!important;line-height:1.2!important;font-size:10px!important}',
    '#signup form label{margin:1px 0 2px!important;line-height:1.2!important}',
    '@media(max-width:360px){#signup form .hwc-exact-name-referral,#signup form .hwc-exact-phone-row{gap:6px!important}}'
  ].join('');
  document.getElementById(style.id)?.remove();
  document.head.appendChild(style);
}

// The signup form is rendered only after the user opens CREATE ACCOUNT.
// Watch for that dynamically-created form instead of running only at page load.
hewadExactSignupForm();
if(!window.hwcExactSignupObserver){
  window.hwcExactSignupObserver=new MutationObserver(()=>hewadExactSignupForm());
  window.hwcExactSignupObserver.observe(document.documentElement,{childList:true,subtree:true});
}

