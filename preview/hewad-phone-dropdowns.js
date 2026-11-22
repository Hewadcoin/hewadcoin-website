/* HEWAD COIN: international country picker and strict phone validation */
(function () {
  'use strict';
  if (window.__HWC_PHONE_DROPDOWNS_V2) return;
  const lib = window.libphonenumber || window.libphonenumberJs || window.libphonenumberjs;
  if (!lib || !lib.getCountries || !lib.parsePhoneNumberFromString) {
    console.error('HEWAD phone metadata unavailable');
    return;
  }
  const $ = id => document.getElementById(id);
  const form = $('signupForm') || ($('referral') && $('referral').closest('form')) || document.querySelector('#signup form');
  const code = $('hwcCountryCallingCode');
  const phone = $('phone') || document.querySelector('#signup input[type=tel]');
  const flag = $('hwcCountryDetected');
  if (!form || !code || !phone) return;

  const names = new Intl.DisplayNames(['en'], { type: 'region' });
  const countries = lib.getCountries().map(iso => ({
    iso,
    calling: '+' + lib.getCountryCallingCode(iso),
    flag: Array.from(iso).map(ch => String.fromCodePoint(ch.charCodeAt(0) + 127397)).join(''),
    name: names.of(iso) || iso
  })).sort((a, b) => a.name.localeCompare(b.name));

  const field = code.closest('.hwc-final-country,.hwc-country-field,.hwc-exact-country') || code.parentElement;
  if (!field) return;
  let selected = countries.find(c => c.iso === 'AF');
  let hint = $('hwcMobileValidationHint');
  if (!hint) {
    hint = document.createElement('small');
    hint.id = 'hwcMobileValidationHint';
    hint.className = 'hwc-field-hint';
    phone.insertAdjacentElement('afterend', hint);
  }
  let nameLine = field.querySelector('.hwc-selected-country-name');
  if (!nameLine) {
    nameLine = document.createElement('small');
    nameLine.className = 'hwc-selected-country-name';
    nameLine.setAttribute('aria-live', 'polite');
    code.insertAdjacentElement('afterend', nameLine);
  }

  const style = document.createElement('style');
  style.id = 'hwc-phone-dropdown-style-v2';
  style.textContent = `
    #signup .hwc-final-country{position:relative!important;display:flex!important;flex-direction:column!important;gap:3px!important}
    #signup .hwc-final-country #hwcCountryCallingCode{position:relative!important;display:block!important;opacity:1!important;pointer-events:auto!important;width:100%!important;height:43px!important;min-height:43px!important;padding:0 34px 0 8px!important;border:1px solid #d0ad4d!important;border-radius:9px!important;background:#fff!important;color:#17120a!important;text-align:center!important;direction:ltr!important;font-size:14px!important;box-sizing:border-box!important}
    #signup .hwc-selected-country-name{display:block!important;width:100%!important;min-height:14px!important;margin:0!important;text-align:center!important;font-size:10px!important;line-height:1.3!important;font-weight:700!important}
    #signup .hwc-country-trigger{position:absolute!important;right:4px!important;top:24px!important;width:28px!important;height:34px!important;padding:0!important;border:0!important;background:transparent!important;color:#8b681c!important;font-size:16px!important;cursor:pointer!important}
    #signup .hwc-country-menu{position:absolute!important;z-index:100800!important;right:0!important;top:65px!important;width:min(280px,82vw)!important;max-height:260px!important;overflow:auto!important;padding:6px!important;border:1px solid #8b6a25!important;border-radius:12px!important;background:#111319!important;box-shadow:0 14px 38px #000b!important}
    #signup .hwc-country-menu[hidden]{display:none!important}
    #signup .hwc-country-search{display:block!important;width:100%!important;height:36px!important;padding:0 9px!important;margin:0 0 5px!important;box-sizing:border-box!important}
    #signup .hwc-country-option{display:flex!important;align-items:center!important;gap:9px!important;width:100%!important;min-height:36px!important;padding:6px 9px!important;border:0!important;border-radius:7px!important;background:transparent!important;color:#fff!important;text-align:left!important;font-size:13px!important}
    #signup .hwc-country-option[aria-selected=true],#signup .hwc-country-option:hover{background:#3a2d13!important;color:#f5d77f!important}
    #signup .hwc-country-option[hidden]{display:none!important}
    #signup #hwcMobileValidationHint{display:block!important;min-height:14px!important;margin:4px 0 7px!important;font-size:11px!important;line-height:1.35!important}
    #signup .hwc-field-invalid{border-color:#ff4545!important;box-shadow:0 0 0 1px #ff4545!important}
  `;
  document.head.appendChild(style);

  let trigger = field.querySelector('.hwc-country-trigger');
  if (!trigger) {
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'hwc-country-trigger';
    trigger.setAttribute('aria-label', 'Choose country');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.textContent = '⌄';
    field.appendChild(trigger);
  }
  let menu = field.querySelector('.hwc-country-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.className = 'hwc-country-menu';
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;
    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'hwc-country-search';
    search.placeholder = 'Search country or calling code…';
    search.setAttribute('aria-label', 'Search country or calling code');
    const list = document.createElement('div');
    list.className = 'hwc-country-options';
    menu.append(search, list);
    field.appendChild(menu);
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      list.querySelectorAll('button').forEach(b => { b.hidden = !!q && !b.dataset.search.includes(q); });
    });
    countries.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hwc-country-option';
      b.setAttribute('role', 'option');
      b.dataset.search = (c.name + ' ' + c.iso + ' ' + c.calling).toLowerCase();
      b.innerHTML = '<span>' + c.flag + '</span><span style="flex:1">' + c.name + '</span><span>' + c.calling + '</span>';
      b.addEventListener('click', () => {
        selected = c;
        code.value = c.calling;
        code.dispatchEvent(new Event('input', { bubbles: true }));
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        list.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
        updateCountry();
        validate();
      });
      list.appendChild(b);
    });
  }
  const searchBox = menu.querySelector('.hwc-country-search');
  trigger.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    trigger.setAttribute('aria-expanded', String(!menu.hidden));
    if (!menu.hidden) {
      searchBox.value = '';
      menu.querySelectorAll('.hwc-country-option').forEach(b => { b.hidden = false; });
      searchBox.focus();
    }
  });
  document.addEventListener('click', e => {
    if (!field.contains(e.target)) {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  function updateCountry() {
    let value = (code.value || '').trim().replace(/[^+0-9]/g, '');
    if (value && value.charAt(0) !== '+') value = '+' + value;
    if (code.value !== value) code.value = value;
    const match = countries.filter(c => c.calling === value);
    const exact = selected && selected.calling === value ? selected : (match.length === 1 ? match[0] : null);
    selected = exact;
    if (exact) {
      nameLine.textContent = exact.name;
      nameLine.style.color = '#25c878';
      nameLine.dataset.detected = 'true';
      if (flag) flag.textContent = exact.flag;
    } else {
      nameLine.textContent = value ? 'Country not detected' : 'Select a country';
      nameLine.style.color = '#ff4545';
      nameLine.dataset.detected = 'false';
      if (flag) flag.textContent = '❓';
    }
    if (flag) flag.setAttribute('aria-label', exact ? exact.name : 'Country not detected');
  }

  function normalizedNational() {
    let value = (phone.value || '').replace(/[^0-9]/g, '');
    if (selected && selected.iso === 'AF' && value.length === 10 && value.startsWith('0')) value = value.slice(1);
    return value;
  }
  function validate() {
    const raw = normalizedNational();
    let parsed = null;
    let valid = false;
    if (selected) {
      try {
        parsed = lib.parsePhoneNumberFromString(raw, selected.iso);
        valid = !!(parsed && parsed.isValid() && parsed.country === selected.iso);
      } catch (_) {}
    }
    if (valid) {
      hint.textContent = '✓ Mobile number is complete and valid.';
      hint.style.color = '#25c878';
      phone.classList.remove('hwc-field-invalid');
      phone.classList.add('hwc-field-valid');
      return true;
    }
    phone.classList.remove('hwc-field-valid');
    phone.classList.add('hwc-field-invalid');
    hint.style.color = '#ff4545';
    if (!selected) hint.textContent = '✕ Enter a valid country calling code or choose a country.';
    else if (!raw) hint.textContent = '✕ Enter your mobile number.';
    else if (selected.iso === 'AF') hint.textContent = '✕ Enter all 9 digits for Afghanistan (' + raw.length + '/9).';
    else hint.textContent = '✕ The number is incomplete or invalid for ' + selected.name + '.';
    return false;
  }

  code.addEventListener('input', () => { updateCountry(); validate(); });
  phone.addEventListener('input', validate);
  phone.addEventListener('blur', validate);
  form.addEventListener('submit', e => {
    if (!validate()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      phone.focus();
    }
  }, true);
  window.__HWC_STRICT_PHONE_VALIDATOR = () => ({ valid: validate(), message: hint.textContent });
  const db = window.hwcSupabase || (typeof hwcSupabase !== 'undefined' ? hwcSupabase : null);
  if (db && db.auth && typeof db.auth.signUp === 'function' && !db.auth.__hwcStrictInternationalPhone) {
    const previous = db.auth.signUp.bind(db.auth);
    db.auth.signUp = async function (credentials) {
      if (!validate()) return { data: { user: null, session: null }, error: { message: hint.textContent } };
      return previous(credentials);
    };
    db.auth.__hwcStrictInternationalPhone = true;
  }

  const initialValue = (code.value || '+93').trim();
  const initialMatches = countries.filter(c => c.calling === initialValue);
  selected = initialMatches.find(c => c.iso === 'AF') || (initialMatches.length === 1 ? initialMatches[0] : null);
  if (selected) code.value = selected.calling;
  updateCountry();
  validate();
  window.__HWC_PHONE_DROPDOWNS_V2 = true;
})();
