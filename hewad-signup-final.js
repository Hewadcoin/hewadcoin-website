/* HEWAD COIN — final authoritative signup layout.
   Keeps the existing Supabase signup handler and its field IDs intact. */
(function () {
  'use strict';

  function buildSignupLayout() {
    const signup = document.getElementById('signup');
    const form = document.getElementById('signupForm');
    if (!signup || !form) return false;
    if (form.dataset.hwcFinalLayout === '1') return true;

    const byId = id => form.querySelector('#' + id) || document.getElementById(id);
    const first = byId('firstName');
    const last = byId('lastName');
    const mobile = byId('phone');
    const referral = byId('referral');
    const email = byId('email');
    const password = byId('password');
    const confirm = byId('confirmPassword');
    if (!first || !mobile || !referral || !email || !password || !confirm) return false;

    function fieldOf(input) {
      const content = input.closest('.password-input-wrap') || input;
      let field = input.closest('.field');
      if (field && field.contains(content)) return field;
      const label = Array.from(form.querySelectorAll('label')).find(node =>
        node.htmlFor === input.id || node.contains(input)
      );
      field = label && label.closest('.field');
      if (field) {
        if (!field.contains(content)) field.appendChild(content);
        return field;
      }
      field = document.createElement('div');
      field.className = 'field';
      if (label) field.appendChild(label);
      field.appendChild(content);
      return field;
    }
    const firstField = fieldOf(first);
    const referralField = fieldOf(referral);
    const mobileField = fieldOf(mobile);
    const emailField = fieldOf(email);
    const passwordField = fieldOf(password);
    const confirmField = fieldOf(confirm);
    if (![firstField, referralField, mobileField, emailField, passwordField, confirmField].every(Boolean)) return false;

    // Preserve the legacy signup handler's lastName reference without showing a surname field.
    if (last) {
      last.value = '';
      last.required = false;
      last.disabled = false;
      last.type = 'hidden';
      const oldLastField = last.closest('.field');
      if (oldLastField && oldLastField !== firstField && oldLastField !== referralField) oldLastField.remove();
      if (last.parentElement !== form) form.appendChild(last);
    } else {
      const hiddenLast = document.createElement('input');
      hiddenLast.type = 'hidden';
      hiddenLast.id = 'lastName';
      hiddenLast.name = 'lastName';
      hiddenLast.value = '';
      form.appendChild(hiddenLast);
    }

    function setLabel(input, text) {
      let label = Array.from(form.querySelectorAll('label')).find(node =>
        node.htmlFor === input.id || node.contains(input)
      );
      if (!label) {
        label = document.createElement('label');
        label.htmlFor = input.id;
        fieldOf(input).insertBefore(label, input);
      }
      label.textContent = text;
    }

    setLabel(first, 'First Name');
    setLabel(referral, 'Referral Code');
    setLabel(mobile, 'Mobile Number');
    // Remove legacy duplicate phone labels left by earlier signup scripts.
    const phoneLabels = Array.from(mobileField.querySelectorAll('label')).filter(label =>
      label.htmlFor === mobile.id || label.contains(mobile) || /mobile number/i.test(label.textContent || '')
    );
    phoneLabels.forEach((label, index) => {
      if (index > 0) label.remove();
      else { label.htmlFor = mobile.id; label.textContent = 'Mobile Number'; }
    });
    setLabel(email, 'Email Address');
    setLabel(password, 'Password');
    setLabel(confirm, 'Confirm Password');

    first.placeholder = 'Enter first name';
    first.setAttribute('aria-label', 'First Name');
    referral.placeholder = 'Enter referral code';
    mobile.placeholder = 'Enter mobile number';
    email.placeholder = 'Enter your email address';
    password.placeholder = 'Enter password';
    confirm.placeholder = 'Confirm your password';

    let code = document.getElementById('hwcCountryCallingCode');
    let flag = document.getElementById('hwcCountryDetected');
    const previousCountryWrap = code && code.closest('.hwc-country-field,.hwc-exact-country');
    if (!code) {
      code = document.createElement('input');
      code.id = 'hwcCountryCallingCode';
      code.name = 'country_calling_code';
      code.value = '+93';
    }
    if (!flag) {
      flag = document.createElement('span');
      flag.id = 'hwcCountryDetected';
    }
    code.type = 'text';
    code.required = true;
    code.maxLength = 5;
    code.inputMode = 'tel';
    code.autocomplete = 'off';
    code.placeholder = '+93';
    code.setAttribute('aria-label', 'Country calling code, for example +93');
    code.value = '+93';
    mobile.type = 'tel';
    mobile.required = true;
    mobile.setAttribute('inputmode', 'tel');
    mobile.setAttribute('autocomplete', 'tel-national');

    const countryWrap = document.createElement('div');
    countryWrap.className = 'hwc-final-country';
    const countryLabel = document.createElement('label');
    countryLabel.htmlFor = code.id;
    countryLabel.textContent = 'Country Code';
    countryWrap.appendChild(countryLabel);
    countryWrap.appendChild(code);
    countryWrap.appendChild(flag);

    const countries = {
      '+93':['🇦🇫','Afghanistan'], '+92':['🇵🇰','Pakistan'], '+91':['🇮🇳','India'],
      '+98':['🇮🇷','Iran'], '+971':['🇦🇪','United Arab Emirates'], '+966':['🇸🇦','Saudi Arabia'],
      '+90':['🇹🇷','Turkey'], '+1':['🇺🇸','United States / Canada'], '+44':['🇬🇧','United Kingdom'],
      '+49':['🇩🇪','Germany'], '+33':['🇫🇷','France'], '+86':['🇨🇳','China'],
      '+880':['🇧🇩','Bangladesh'], '+998':['🇺🇿','Uzbekistan'], '+992':['🇹🇯','Tajikistan']
    };
    function updateCountryFlag() {
      let value = (code.value || '').trim().replace(/[^\d+]/g, '');
      if (value && value.charAt(0) !== '+') value = '+' + value;
      if (code.value !== value) code.value = value;
      const country = countries[value];
      flag.textContent = country ? country[0] : (value ? '❓' : '');
      flag.title = country ? country[1] : 'Enter a supported country calling code';
      flag.setAttribute('aria-label', flag.title);
    }
    if (code.dataset.hwcFinalCountryListener !== '1') {
      code.addEventListener('input', updateCountryFlag);
      code.dataset.hwcFinalCountryListener = '1';
    }
    updateCountryFlag();

    // Earlier scripts wrapped the phone input in their own row. Restore it to
    // its original .field so this final layout owns the complete phone row.
    const oldMobileContainer = mobile.closest('.hwc-phone-row');
    if (mobile.parentElement !== mobileField) mobileField.appendChild(mobile);
    if (oldMobileContainer && oldMobileContainer !== mobileField && !oldMobileContainer.contains(code)) oldMobileContainer.remove();

    const formGrid = form.querySelector('.form-grid') || document.createElement('div');
    if (!formGrid.classList.contains('form-grid')) {
      formGrid.className = 'form-grid';
      form.insertBefore(formGrid, form.firstChild);
    }

    const nameRow = document.createElement('div');
    nameRow.className = 'hwc-final-name-referral';
    const phoneRow = document.createElement('div');
    phoneRow.className = 'hwc-final-phone-row';

    if (previousCountryWrap && previousCountryWrap !== countryWrap) previousCountryWrap.remove();

    formGrid.replaceChildren();
    nameRow.appendChild(firstField);
    nameRow.appendChild(referralField);
    phoneRow.appendChild(mobileField);
    phoneRow.appendChild(countryWrap);
    formGrid.appendChild(nameRow);
    formGrid.appendChild(phoneRow);
    formGrid.appendChild(emailField);
    formGrid.appendChild(passwordField);
    formGrid.appendChild(confirmField);

    const hintTargets = [
      ['hwcReferralOwnerHint', referralField],
      ['hwcMobileValidationHint', mobileField],
      ['hwcEmailValidationHint', emailField],
      ['hwcPasswordValidationHint', passwordField],
      ['hwcConfirmPasswordValidationHint', confirmField]
    ];
    hintTargets.forEach(([id, target]) => {
      const hint = document.getElementById(id);
      if (hint && !target.contains(hint)) target.appendChild(hint);
    });

    const panel = signup.querySelector('.auth-panel');
    const heading = panel && panel.querySelector('.heading');
    if (heading && !panel.querySelector('.hwc-signup-subtitle')) {
      const subtitle = document.createElement('p');
      subtitle.className = 'hwc-signup-subtitle';
      subtitle.textContent = 'Create your HEWAD COIN account';
      heading.insertAdjacentElement('afterend', subtitle);
    }

    const styleId = 'hwc-final-signup-layout-style';
    document.getElementById(styleId)?.remove();
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '#signup{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;align-items:center!important;justify-content:center!important;padding:12px!important;box-sizing:border-box!important}',
      '#signup .auth-panel{width:min(100%,590px)!important;max-width:590px!important;max-height:calc(100dvh - 24px)!important;overflow-y:auto!important;overflow-x:hidden!important;padding:20px!important;box-sizing:border-box!important}',
      '#signup .brand{margin:0 0 5px!important}',
      '#signup .heading{margin:0 0 4px!important}',
      '#signup .hwc-signup-subtitle{margin:0 0 15px!important;text-align:center!important;color:#e8d6a4!important;font-size:13px!important;line-height:1.4!important}',
      '#signup form{display:block!important;width:100%!important;max-height:none!important;overflow:visible!important;margin:0!important;padding:0!important;box-sizing:border-box!important}',
      '#signup .form-grid{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:11px!important;width:100%!important;min-width:0!important;margin:0!important}',
      '#signup .hwc-final-name-referral,#signup .hwc-final-phone-row{display:grid!important;align-items:start!important;gap:9px!important;width:100%!important;min-width:0!important;margin:0!important;box-sizing:border-box!important}',
      '#signup .hwc-final-name-referral>*,#signup .hwc-final-phone-row>*{align-self:start!important;justify-self:stretch!important;position:relative!important;top:0!important;transform:none!important;margin-top:0!important;padding-top:0!important;vertical-align:top!important}',
      '#signup .hwc-final-name-referral>.field,#signup .hwc-final-phone-row>.field{align-self:start!important;justify-self:stretch!important;top:0!important;margin-block-start:0!important}',
      '#signup .hwc-final-name-referral{grid-template-columns:minmax(0,7fr) minmax(0,3fr)!important;grid-auto-flow:column!important}',
      '#signup .hwc-final-name-referral>.field:nth-child(1){grid-column:1!important;grid-row:1!important;width:100%!important;min-width:0!important;max-width:100%!important}',
      '#signup .hwc-final-name-referral>.field:nth-child(2){grid-column:2!important;grid-row:1!important;width:100%!important;min-width:0!important;max-width:100%!important}',
      '#signup .hwc-final-name-referral>.field:nth-child(1) input,#signup .hwc-final-name-referral>.field:nth-child(2) input{width:100%!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important}',
      '#signup .hwc-final-phone-row{grid-template-columns:minmax(0,7fr) minmax(0,3fr)!important;grid-auto-flow:column!important}',
      '#signup .field{display:flex!important;flex-direction:column!important;gap:5px!important;width:100%!important;min-width:0!important;margin:0!important;box-sizing:border-box!important}',
      '#signup .field label,#signup .hwc-final-country label{display:block!important;margin:0!important;color:#ffe08a!important;font-size:13px!important;font-weight:700!important;line-height:1.25!important}',
      '#signup .field input,#signup .hwc-final-country input{display:block!important;width:100%!important;min-width:0!important;max-width:100%!important;height:43px!important;min-height:43px!important;margin:0!important;padding:0 11px!important;border:1px solid rgba(255,205,70,.72)!important;border-radius:10px!important;background:#fff!important;color:#17120a!important;font-size:15px!important;line-height:normal!important;box-sizing:border-box!important}',
      '#signup .hwc-final-country{position:relative!important;display:flex!important;flex-direction:column!important;gap:5px!important;width:100%!important;min-width:0!important;margin:0!important;box-sizing:border-box!important}',
      '#signup .hwc-final-country label{font-size:clamp(9px,2.8vw,11px)!important;white-space:nowrap!important}',
      '#signup .hwc-final-country input{padding-right:35px!important;text-align:center!important;direction:ltr!important}',
      '#signup #hwcCountryDetected{position:absolute!important;right:9px!important;top:31px!important;display:block!important;min-width:18px!important;font-size:16px!important;line-height:1!important;pointer-events:none!important}',
      '#signup #phone{display:block!important;width:100%!important;min-width:0!important;max-width:100%!important;padding:0 7px!important;font-size:clamp(11px,3.8vw,15px)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:clip!important;direction:ltr!important;text-align:left!important;font-variant-numeric:tabular-nums!important;letter-spacing:-.2px!important;box-sizing:border-box!important}',
      '#signup .password-input-wrap{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:5px!important;width:100%!important;min-width:0!important;margin:0!important;overflow:visible!important}',
      '#signup .password-input-wrap>input{flex:1 1 auto!important;width:0!important;min-width:0!important}',
      '#signup .password-visibility-toggle{flex:0 0 42px!important;width:42px!important;height:43px!important;min-width:42px!important;margin:0!important}',
      '#signup .hwc-field-hint{display:block!important;width:100%!important;min-height:0!important;margin:3px 0 0!important;font-size:11px!important;line-height:1.35!important;white-space:normal!important}',
      '#signup .primary{width:100%!important;height:48px!important;min-height:48px!important;margin:14px 0 0!important}',
      '#signup .back{margin:9px auto 0!important}',
      '@media(max-width:390px){#signup{padding:7px!important}#signup .auth-panel{padding:14px!important}#signup .form-grid{gap:9px!important}#signup .hwc-final-name-referral,#signup .hwc-final-phone-row{gap:6px!important}#signup .field label,#signup .hwc-final-country label{font-size:12px!important}#signup .field input,#signup .hwc-final-country input{height:40px!important;min-height:40px!important;padding-left:8px!important;padding-right:8px!important;font-size:13px!important}#signup .password-visibility-toggle{height:40px!important}}',
      '@media(max-height:650px){#signup .auth-panel{max-height:calc(100dvh - 12px)!important;padding-top:12px!important;padding-bottom:12px!important}#signup .form-grid{gap:7px!important}#signup .field input,#signup .hwc-final-country input{height:37px!important;min-height:37px!important}#signup .primary{height:41px!important;min-height:41px!important;margin-top:9px!important}}'
    ].join('');
    document.head.appendChild(style);
    form.dataset.hwcFinalLayout = '1';
    return true;
  }

  if (!buildSignupLayout()) {
    const observer = new MutationObserver(() => {
      if (buildSignupLayout()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();