/* HEWAD COIN — site-wide inline form validation.
   Adds clear, accessible red messages without changing existing form layouts or handlers. */
(function () {
  'use strict';
  if (window.__HWC_GLOBAL_FORM_VALIDATION__) return;
  window.__HWC_GLOBAL_FORM_VALIDATION__ = true;

  const style = document.createElement('style');
  style.id = 'hwc-global-validation-styles';
  style.textContent = [
    '.hwc-validation-error{display:block!important;width:100%!important;box-sizing:border-box!important;margin:5px 0 0!important;padding:0!important;color:#ff5555!important;font-size:11px!important;font-weight:700!important;line-height:1.45!important;text-align:start!important;white-space:normal!important}',
    '.hwc-validation-invalid{border-color:#ff4545!important;outline:1px solid #ff4545!important;outline-offset:1px!important}',
    'label.hwc-validation-invalid,.hwc-validation-invalid.hwc-kyc-confirm{border:1px solid #ff4545!important;border-radius:9px!important}',
    '.hwc-validation-invalid:focus{box-shadow:0 0 0 2px #ff454544!important}',
    '[aria-invalid="true"]{border-color:#ff4545!important}'
  ].join('');
  document.head.appendChild(style);

  const messages = {
    en: {required:'Please fill out this field.', check:'Please check this box.', select:'Please select an option.', email:'Please enter a valid email address.', phone:'Please enter a valid phone number.', file:'Please choose a file.', invalid:'Please enter a valid value.'},
    ps: {required:'مهرباني وکړئ دا خانه ډکه کړئ.', check:'مهرباني وکړئ دا خانه ټیک کړئ.', select:'مهرباني وکړئ یو انتخاب وکړئ.', email:'مهرباني وکړئ سم برېښنالیک ولیکئ.', phone:'مهرباني وکړئ سمه شمېره ولیکئ.', file:'مهرباني وکړئ فایل وټاکئ.', invalid:'مهرباني وکړئ سم معلومات ولیکئ.'},
    fa: {required:'لطفاً این خانه را تکمیل کنید.', check:'لطفاً این گزینه را علامت بزنید.', select:'لطفاً یک گزینه انتخاب کنید.', email:'لطفاً نشانی ایمیل معتبر وارد کنید.', phone:'لطفاً شماره معتبر وارد کنید.', file:'لطفاً یک فایل انتخاب کنید.', invalid:'لطفاً مقدار معتبر وارد کنید.'}
  };
  function lang() {
    const value = String(document.documentElement.lang || 'en').slice(0,2).toLowerCase();
    return messages[value] ? value : 'en';
  }
  function messageFor(field) {
    const m = messages[lang()];
    if (field.type === 'checkbox' || field.type === 'radio') return m.check;
    if (field.tagName === 'SELECT') return m.select;
    if (field.type === 'file') return m.file;
    if (field.validity && field.validity.valueMissing) return m.required;
    if (field.validity && field.validity.typeMismatch && field.type === 'email') return m.email;
    if (field.validity && field.validity.typeMismatch && field.type === 'tel') return m.phone;
    return m.invalid;
  }
  function visible(field) {
    if (!field || field.disabled || field.type === 'hidden') return false;
    if (field.closest('[hidden],[aria-hidden="true"]')) return false;
    return !!(field.getClientRects().length);
  }
  function errorHost(field) {
    if (field.type === 'checkbox' || field.type === 'radio') {
      return field.closest('label') || field.closest('.hwc-kyc-confirm') || field.parentElement || field;
    }
    return field.closest('.field,.form-group,.form-field,.input-group,.form-control-wrap') || field.parentElement || field;
  }
  function clearError(field) {
    if (!field) return;
    field.classList.remove('hwc-validation-invalid');
    field.removeAttribute('aria-invalid');
    const id = field.dataset.hwcValidationError;
    if (id) {
      const node = document.getElementById(id);
      if (node) node.remove();
      delete field.dataset.hwcValidationError;
    }
    const host = errorHost(field);
    if (host && host.classList) host.classList.remove('hwc-validation-invalid');
  }
  function showError(field) {
    clearError(field);
    const id = 'hwc-validation-' + Math.random().toString(36).slice(2,10);
    const error = document.createElement('small');
    error.id = id;
    error.className = 'hwc-validation-error';
    error.setAttribute('role','alert');
    error.textContent = messageFor(field);
    const host = errorHost(field);
    field.classList.add('hwc-validation-invalid');
    field.setAttribute('aria-invalid','true');
    field.dataset.hwcValidationError = id;
    if (field.type === 'checkbox' || field.type === 'radio') {
      if (host && host.insertAdjacentElement) host.insertAdjacentElement('afterend', error);
      else field.insertAdjacentElement('afterend', error);
      if (host && host.classList) host.classList.add('hwc-validation-invalid');
    } else {
      field.insertAdjacentElement('afterend', error);
    }
  }
  function candidates(form) {
    return Array.from(form.querySelectorAll('input[required],select[required],textarea[required]')).filter(visible);
  }
  function validate(form) {
    if (!form || form.dataset.skipGlobalValidation === 'true') return true;
    const fields = candidates(form);
    const radioGroups = new Set();
    const invalid = [];
    fields.forEach(field => {
      if (field.type === 'radio' && field.name) {
        if (radioGroups.has(field.name)) return;
        radioGroups.add(field.name);
        const group = fields.filter(item => item.type === 'radio' && item.name === field.name);
        if (!group.some(item => item.checked)) {
          showError(group[0]);
          invalid.push(group[0]);
        } else group.forEach(clearError);
        return;
      }
      if (!field.checkValidity()) {
        showError(field);
        invalid.push(field);
      } else clearError(field);
    });
    if (invalid.length) {
      const first = invalid[0];
      try { first.scrollIntoView({behavior:'smooth',block:'center'}); } catch (_) {}
      try { first.focus({preventScroll:true}); } catch (_) { try { first.focus(); } catch (_) {} }
      return false;
    }
    return true;
  }

  // Capture regular form submits (including Enter-key submissions).
  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (form && form.tagName === 'FORM' && !validate(form)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  // Also cover custom buttons implemented as type="button", including KYC.
  // This listener is loaded before the KYC module so validation runs first.
  document.addEventListener('click', function (event) {
    const button = event.target && event.target.closest && event.target.closest(
      'button[type="submit"],input[type="submit"],button:not([type]),[data-kyc-submit],[data-validation-submit]'
    );
    if (!button || button.disabled) return;
    const form = button.closest('form');
    if (!form) return;
    if (!validate(form)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener('input', function (event) {
    const field = event.target;
    if (field && field.matches && field.matches('input,select,textarea') && field.dataset.hwcValidationError) {
      if (field.checkValidity()) clearError(field);
    }
  }, true);
  document.addEventListener('change', function (event) {
    const field = event.target;
    if (field && field.matches && field.matches('input,select,textarea') && field.dataset.hwcValidationError) {
      if (field.checkValidity()) clearError(field);
    }
  }, true);
})();