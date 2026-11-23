(function () {
  'use strict';
  if (window.__HWC_SIGNUP_MOBILE_CHECK_V1) return;

  function initialize() {
    const form = document.getElementById('signupForm');
    const phone = document.getElementById('phone');
    const code = document.getElementById('hwcCountryCallingCode');
    const hint = document.getElementById('hwcMobileValidationHint');
    const db = typeof hwcSupabase !== 'undefined' ? hwcSupabase : null;
    if (!form || !phone || !code || !hint || !db || !db.auth || typeof db.rpc !== 'function') return false;
    if (form.dataset.hwcMobileAvailabilityReady === '1') return true;

    form.dataset.hwcMobileAvailabilityReady = '1';
    let timer = null;
    let requestVersion = 0;

    function fullNumber() {
      const callingCode = (code.value || '').trim().replace(/[^+0-9]/g, '');
      const national = (phone.value || '').replace(/\D/g, '').replace(/^0+/, '');
      return callingCode && national ? callingCode + national : '';
    }

    function show(message, valid, neutral) {
      hint.textContent = message;
      hint.style.color = neutral ? '#b58b2a' : valid ? '#25c878' : '#ff6262';
      hint.setAttribute('aria-live', 'polite');
    }

    async function checkAvailability() {
      const ticket = ++requestVersion;
      const strictValidator = window.__HWC_STRICT_PHONE_VALIDATOR;
      if (typeof strictValidator !== 'function') {
        show('✕ Phone validation is temporarily unavailable. Please try again.', false, false);
        return false;
      }

      const strict = strictValidator();
      if (!strict.valid) {
        show('✕ ' + (strict.message || 'Enter a complete valid mobile number.'), false, false);
        return false;
      }

      const number = fullNumber();
      if (!number) {
        show('✕ Enter your mobile number.', false, false);
        return false;
      }

      show('Checking mobile number availability…', false, true);
      try {
        const result = await db.rpc('is_registration_mobile_registered', { p_mobile: number });
        if (ticket !== requestVersion) return false;
        if (result.error) {
          show('✕ Could not verify this mobile number. Please try again.', false, false);
          return false;
        }
        if (result.data === true) {
          show('✕ This mobile number is already registered.', false, false);
          return false;
        }
        show('✓ Mobile number is available.', true, false);
        return true;
      } catch (error) {
        if (ticket !== requestVersion) return false;
        show('✕ Could not verify this mobile number. Please try again.', false, false);
        console.error('HEWAD mobile availability check:', error);
        return false;
      }
    }

    function scheduleCheck() {
      clearTimeout(timer);
      requestVersion++;
      timer = setTimeout(checkAvailability, 550);
    }

    phone.addEventListener('input', scheduleCheck);
    code.addEventListener('input', scheduleCheck);
    phone.addEventListener('blur', checkAvailability);
    code.addEventListener('blur', checkAvailability);

    if (!db.auth.__hwcInternationalSignupWrapped) {
      const originalSignUp = db.auth.signUp.bind(db.auth);
      db.auth.signUp = async function (credentials) {
        const available = await checkAvailability();
        if (!available) {
          return {
            data: { user: null, session: null },
            error: new Error((hint.textContent || 'Please enter a valid mobile number.').replace(/^✕\s*/, ''))
          };
        }

        const number = fullNumber();
        const args = Object.assign({}, credentials || {});
        args.options = Object.assign({}, args.options || {});
        args.options.data = Object.assign({}, args.options.data || {}, {
          mobile_number: number,
          phone: number
        });

        const result = await originalSignUp(args);
        const errorMessage = result && result.error && result.error.message ? result.error.message : '';
        if (result && result.error && /mobile number is already registered|profiles_mobile_normalized_unique_idx/i.test(errorMessage)) {
          show('✕ This mobile number is already registered.', false, false);
          return { data: { user: null, session: null }, error: new Error('This mobile number is already registered.') };
        }
        return result;
      };
      db.auth.__hwcInternationalSignupWrapped = true;
    }

    window.__HWC_SIGNUP_MOBILE_CHECK_V1 = true;
    return true;
  }

  if (!initialize()) {
    const observer = new MutationObserver(function () {
      if (initialize()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();