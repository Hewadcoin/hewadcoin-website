/* HEWAD COIN — country-name hint and strict international phone validation.
   Intentionally preserves every existing signup field, size, position and layout. */
(function () {
  'use strict';
  if (window.__HWC_PHONE_DROPDOWNS_V3) return;
  const lib = window.libphonenumber || window.libphonenumberJs || window.libphonenumberjs;
  if (!lib || !lib.getCountries || !lib.getCountryCallingCode || !lib.parsePhoneNumberFromString) {
    console.error('HEWAD phone metadata unavailable');
    return;
  }

  const $ = id => document.getElementById(id);
  const names = new Intl.DisplayNames(['en'], { type: 'region' });
  const countries = lib.getCountries().map(iso => ({
    iso,
    calling: '+' + lib.getCountryCallingCode(iso),
    name: names.of(iso) || iso
  }));
  let initialized = false;

  function initialize() {
    if (initialized) return true;
    const form = $('signupForm') || ($('referral') && $('referral').closest('form')) || document.querySelector('#signup form');
    const code = $('hwcCountryCallingCode');
    const phone = $('phone') || document.querySelector('#signup input[type="tel"]');
    if (!form || !code || !phone) return false;
    initialized = true;

    const field = code.closest('.hwc-final-country,.hwc-country-field,.hwc-exact-country') || code.parentElement;
    if (!field) return false;
    let hint = $('hwcMobileValidationHint');
    if (!hint) {
      hint = document.createElement('small');
      hint.id = 'hwcMobileValidationHint';
      hint.className = 'hwc-field-hint';
      phone.insertAdjacentElement('afterend', hint);
    }

    // The only visual addition: a small country-name line immediately below the code input.
    let nameLine = field.querySelector('.hwc-selected-country-name');
    if (!nameLine) {
      nameLine = document.createElement('small');
      nameLine.className = 'hwc-selected-country-name';
      nameLine.setAttribute('aria-live', 'polite');
      code.insertAdjacentElement('afterend', nameLine);
    }
    const style = document.createElement('style');
    style.id = 'hwc-country-name-only-style';
    style.textContent = '#signup .hwc-selected-country-name{display:block!important;margin:2px 0 0!important;padding:0!important;width:100%!important;min-height:12px!important;text-align:center!important;font-size:10px!important;line-height:1.2!important;font-weight:600!important;pointer-events:none!important}';
    document.head.appendChild(style);

    function nationalDigits() {
      return (phone.value || '').replace(/\\D/g, '');
    }
    function resolveNumber() {
      const calling = (code.value || '').trim().replace(/[^+0-9]/g, '');
      const digits = nationalDigits();
      const matches = countries.filter(c => c.calling === calling);
      if (!calling || !matches.length) return { country: null, codeValid: false, ambiguous: false };
      if (matches.length === 1) return { country: matches[0], codeValid: true, ambiguous: false };
      if (digits) {
        try {
          const parsed = lib.parsePhoneNumberFromString(calling + digits);
          if (parsed && parsed.country) {
            const exact = countries.find(c => c.iso === parsed.country);
            if (exact && exact.calling === calling) return { country: exact, codeValid: true, ambiguous: false, parsed };
          }
        } catch (_) {}
      }
      return { country: null, codeValid: true, ambiguous: true };
    }
    function paintCountry() {
      let value = (code.value || '').trim().replace(/[^+0-9]/g, '');
      if (value && value.charAt(0) !== '+') value = '+' + value;
      if (code.value !== value) code.value = value;
      const result = resolveNumber();
      if (result.country) {
        nameLine.textContent = result.country.name;
        nameLine.style.color = '#25c878';
        nameLine.dataset.detected = result.country.iso;
      } else if (result.ambiguous) {
        nameLine.textContent = 'Country identified by mobile number';
        nameLine.style.color = '#b58b2a';
        nameLine.dataset.detected = '';
      } else {
        nameLine.textContent = value ? 'Invalid country code' : 'Enter country code';
        nameLine.style.color = '#ff4545';
        nameLine.dataset.detected = '';
      }
      return result;
    }
    function validate() {
      const result = paintCountry();
      const digits = nationalDigits();
      let valid = false;
      let message = 'Enter a complete valid mobile number.';
      if (!result.codeValid) {
        message = 'Enter a valid country calling code.';
      } else if (!digits) {
        message = 'Enter your mobile number.';
      } else if (result.country && result.country.iso === 'AF') {
        valid = digits.length === 9 && !digits.startsWith('0');
        message = valid ? 'Mobile number is valid.' : 'Enter exactly 9 digits for Afghanistan (' + digits.length + '/9).';
        if (valid) {
          try {
            const parsed = lib.parsePhoneNumberFromString('+' + '93' + digits);
            valid = !!(parsed && parsed.isValid() && parsed.country === 'AF');
          } catch (_) { valid = false; }
        }
      } else {
        let parsed = result.parsed || null;
        if (!parsed) {
          try { parsed = lib.parsePhoneNumberFromString((code.value || '').trim() + digits); } catch (_) {}
        }
        valid = !!(parsed && parsed.isValid() && parsed.country && parsed.number);
        if (valid) {
          const exact = countries.find(c => c.iso === parsed.country);
          if (exact) {
            nameLine.textContent = exact.name;
            nameLine.style.color = '#25c878';
            nameLine.dataset.detected = exact.iso;
          }
        }
        message = valid ? 'Mobile number is valid.' : 'The number is incomplete or invalid for this country.';
      }
      phone.classList.toggle('hwc-field-invalid', !valid);
      phone.classList.toggle('hwc-field-valid', valid);
      code.classList.toggle('hwc-field-invalid', !result.codeValid);
      hint.style.color = valid ? '#25c878' : '#ff4545';
      hint.textContent = (valid ? '✓ ' : '✕ ') + message;
      return valid;
    }

    code.addEventListener('input', validate);
    phone.addEventListener('input', validate);
    phone.addEventListener('blur', validate);
    form.addEventListener('submit', event => {
      if (!validate()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        phone.focus();
      }
    }, true);
    window.__HWC_STRICT_PHONE_VALIDATOR = () => ({ valid: validate(), message: hint.textContent });

    const initial = (code.value || '+93').trim();
    if (!initial) code.value = '+93';
    validate();
    window.__HWC_PHONE_DROPDOWNS_V3 = true;
    return true;
  }

  if (!initialize()) {
    const observer = new MutationObserver(() => {
      if (initialize()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
