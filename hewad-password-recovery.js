(function () {
  'use strict';
  if (window.__hewadPasswordRecoveryLoaded) return;
  window.__hewadPasswordRecoveryLoaded = true;

  const $ = (id) => document.getElementById(id);
  const db = typeof hwcSupabase !== 'undefined' ? hwcSupabase : window.hwcSupabase;
  if (!db || !db.auth) {
    console.error('HEWAD password recovery: Supabase client is unavailable.');
    return;
  }

  const style = document.createElement('style');
  style.id = 'hwc-password-recovery-style';
  style.textContent = `
    #hwcForgotPasswordLink{display:block;width:max-content;max-width:100%;margin:10px 0 4px auto;padding:0;border:0;background:none;color:#e8bd4a;font-family:inherit;font-size:13px;font-weight:600;text-decoration:underline;cursor:pointer}
    #hwcRecoveryModal{display:none;position:fixed;inset:0;z-index:100001;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.78);backdrop-filter:blur(5px);box-sizing:border-box}
    #hwcRecoveryModal.open{display:flex}
    #hwcRecoveryModal .hwc-recovery-card{position:relative;width:min(100%,430px);max-height:90vh;overflow:auto;padding:24px 20px;border:1px solid #765c27;border-radius:18px;background:#111319;color:#f7f7f7;box-shadow:0 20px 70px #000b;box-sizing:border-box}
    #hwcRecoveryModal h2{margin:0 30px 8px 0;color:#e8bd4a;font-size:21px}
    #hwcRecoveryModal p{color:#b9bbc3;font-size:13px;line-height:1.55}
    #hwcRecoveryModal label{display:block;margin:14px 0 6px;color:#e6e6e6;font-size:13px}
    #hwcRecoveryModal input{display:block;width:100%;height:46px;padding:0 12px;border:1px solid #494b51;border-radius:9px;background:#090b0f;color:#fff;font-size:15px;box-sizing:border-box}
    #hwcRecoveryModal input:focus{outline:2px solid #c99e37;border-color:#c99e37}
    #hwcRecoveryModal .hwc-recovery-submit{width:100%;margin-top:18px;padding:13px;border:0;border-radius:9px;background:#d8ad3e;color:#241900;font-weight:800;cursor:pointer}
    #hwcRecoveryModal .hwc-recovery-submit:disabled{opacity:.6;cursor:wait}
    #hwcRecoveryModal .hwc-recovery-close{position:absolute;top:13px;right:15px;border:0;background:none;color:#fff;font-size:27px;cursor:pointer}
    #hwcRecoveryMessage{min-height:18px;margin-top:12px;color:#e8bd4a;font-size:13px}
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.id = 'hwcRecoveryModal';
  modal.innerHTML = '<section class="hwc-recovery-card" role="dialog" aria-modal="true" aria-labelledby="hwcRecoveryTitle"><button type="button" class="hwc-recovery-close" aria-label="Close">×</button><h2 id="hwcRecoveryTitle">Reset Password</h2><p id="hwcRecoveryDescription">Enter the email address linked to your HEWAD COIN account.</p><form id="hwcRecoveryForm" novalidate><div id="hwcRecoveryFields"></div><button class="hwc-recovery-submit" id="hwcRecoverySubmit" type="submit">SEND VERIFICATION CODE</button></form><div id="hwcRecoveryMessage" role="status" aria-live="polite"></div></section>';
  document.body.appendChild(modal);

  let stage = 'email';
  let recoveryEmail = '';
  const fields = $('hwcRecoveryFields');
  const submit = $('hwcRecoverySubmit');
  const message = $('hwcRecoveryMessage');
  const title = $('hwcRecoveryTitle');
  const description = $('hwcRecoveryDescription');

  function setMessage(text, bad) {
    message.textContent = text || '';
    message.style.color = bad ? '#ff7777' : '#e8bd4a';
  }
  function render(nextStage) {
    stage = nextStage;
    setMessage('');
    if (stage === 'email') {
      title.textContent = 'Reset Password';
      description.textContent = 'Enter the email address linked to your HEWAD COIN account. We will send a 6-digit verification code.';
      fields.innerHTML = '<label for="hwcRecoveryEmail">Email Address</label><input id="hwcRecoveryEmail" type="email" autocomplete="email" required maxlength="254" placeholder="Enter your email address">';
      submit.textContent = 'SEND VERIFICATION CODE';
    } else if (stage === 'otp') {
      title.textContent = 'Verify Your Email';
      description.textContent = 'Enter the 6-digit code sent to your email address.';
      fields.innerHTML = '<label for="hwcRecoveryOtp">6-Digit Verification Code</label><input id="hwcRecoveryOtp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required placeholder="000000">';
      submit.textContent = 'VERIFY CODE';
    } else {
      title.textContent = 'Create New Password';
      description.textContent = 'Choose a new password for your existing HEWAD COIN account.';
      fields.innerHTML = '<label for="hwcRecoveryPassword">New Password</label><input id="hwcRecoveryPassword" type="password" autocomplete="new-password" minlength="8" required placeholder="At least 8 characters"><label for="hwcRecoveryConfirm">Confirm New Password</label><input id="hwcRecoveryConfirm" type="password" autocomplete="new-password" minlength="8" required placeholder="Enter the password again">';
      submit.textContent = 'UPDATE PASSWORD';
    }
  }
  function open() {
    recoveryEmail = '';
    render('email');
    modal.classList.add('open');
    setTimeout(() => $('hwcRecoveryEmail')?.focus(), 30);
  }
  function close() {
    modal.classList.remove('open');
    $('hwcRecoveryForm').reset();
    render('email');
  }
  modal.querySelector('.hwc-recovery-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  $('hwcRecoveryForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    if (submit.disabled) return;
    setMessage('');
    submit.disabled = true;
    try {
      if (stage === 'email') {
        const email = $('hwcRecoveryEmail').value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
        const result = await db.auth.resetPasswordForEmail(email);
        if (result.error) throw result.error;
        recoveryEmail = email;
        render('otp');
        setMessage('If this email belongs to an account, a verification code has been sent. Check your inbox and spam folder.');
        $('hwcRecoveryOtp').focus();
      } else if (stage === 'otp') {
        const token = $('hwcRecoveryOtp').value.replace(/\D/g, '');
        if (!/^\d{6}$/.test(token)) throw new Error('Enter the complete 6-digit code.');
        const result = await db.auth.verifyOtp({ email: recoveryEmail, token: token, type: 'recovery' });
        if (result.error) throw result.error;
        if (!result.data || !result.data.session) throw new Error('Code verification did not create a recovery session. Please request a new code.');
        render('password');
        $('hwcRecoveryPassword').focus();
        setMessage('Email verified. You can now set your new password.');
      } else {
        const password = $('hwcRecoveryPassword').value;
        const confirm = $('hwcRecoveryConfirm').value;
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        if (password !== confirm) throw new Error('The passwords do not match.');
        const result = await db.auth.updateUser({ password: password });
        if (result.error) throw result.error;
        setMessage('Your password has been updated successfully. You can now sign in.');
        submit.textContent = 'DONE';
        submit.disabled = true;
        setTimeout(async function () {
          await db.auth.signOut();
          close();
          if (typeof window.showScreen === 'function') window.showScreen('login');
          else document.getElementById('login')?.scrollIntoView();
          if (typeof window.showNotice === 'function') window.showNotice('Password updated. Please sign in with your new password.');
        }, 1300);
      }
    } catch (error) {
      console.error('HEWAD password recovery error:', error);
      setMessage(error && error.message ? error.message : 'Something went wrong. Please try again.', true);
    } finally {
      if (submit.textContent !== 'DONE') submit.disabled = false;
    }
  });

  function findLoginScreen() {
    return $('login') || document.querySelector('[id*="login" i]');
  }
  function addForgotLink() {
    const screen = findLoginScreen();
    if (!screen) return;
    const form = screen.querySelector('form') || screen;
    const controls = Array.from(screen.querySelectorAll('a,button,[role="button"],input[type="button"],input[type="submit"]'));
    const isForgot = el => /forgot\s+password\s*\??/i.test(
      ((el.textContent || '') + ' ' + (el.value || '') + ' ' + (el.getAttribute('aria-label') || '')).trim()
    );
    const matches = controls.filter(isForgot);
    let link = matches[0] || null;
    // Keep the original first Forgot Password control and remove duplicate copies.
    matches.slice(1).forEach(el => el.remove());
    if (!link) {
      const password = form.querySelector('input[type="password"],input[autocomplete="current-password"],input[name*="password" i],input[id*="password" i]');
      link = document.createElement('button');
      link.type = 'button';
      link.textContent = 'Forgot Password?';
      const submitButton = form.querySelector('button[type="submit"],input[type="submit"]');
      if (password) {
        const wrap = password.closest('.field,.form-group,.input-group') || password.parentElement;
        (wrap || form).insertAdjacentElement('afterend', link);
      } else if (submitButton) {
        submitButton.insertAdjacentElement('beforebegin', link);
      } else {
        form.appendChild(link);
      }
    }
    link.id = 'hwcForgotPasswordLink';
    if (link.tagName === 'BUTTON') link.type = 'button';
    if (!link.dataset.hwcRecoveryBound) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        open();
      }, true);
      link.dataset.hwcRecoveryBound = '1';
    }
  }
  addForgotLink();
  const observer = new MutationObserver(addForgotLink);
  observer.observe(document.body, { childList: true, subtree: true });
})();