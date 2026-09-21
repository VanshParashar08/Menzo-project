// ============================================================
// MENZO GET STARTED / AUTHENTICATION LOGIC
// Real Firebase Authentication: Sign Up, Log In, Google OAuth,
// Password Reset, Field Validation, and Error Handling.
// ============================================================

import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithGoogleRedirect,
  checkRedirectResult,
  sendPasswordReset,
  mapAuthError,
  getCurrentUser
} from './services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  // Current Auth Mode: 'signup' or 'login'
  let currentMode = 'signup';

  // DOM Elements
  const signupForm = document.getElementById('signup-form');
  const submitBtn = document.getElementById('submit-btn');
  const submitBtnText = document.getElementById('submit-btn-text');
  const googleBtn = document.getElementById('google-auth-btn');
  const googleBtnText = document.getElementById('google-auth-text');
  const tabSignup = document.getElementById('tab-signup');
  const tabLogin = document.getElementById('tab-login');
  const toggleAuthModeBtn = document.getElementById('toggle-auth-mode-btn');
  const topAuthPrompt = document.getElementById('top-auth-prompt');
  const formTitle = document.getElementById('form-title');
  const formSubtitle = document.getElementById('form-subtitle');
  const signupExtraFields = document.getElementById('signup-extra-fields');
  const forgotPasswordBtn = document.getElementById('forgot-password-btn');
  const authAlert = document.getElementById('auth-alert');
  const authAlertMessage = document.getElementById('auth-alert-message');
  const authAlertIcon = document.getElementById('auth-alert-icon');
  const termsNotice = document.getElementById('terms-notice');

  // Input Elements
  const restaurantNameInput = document.getElementById('restaurantName');
  const ownerNameInput = document.getElementById('ownerName');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const emailInput = document.getElementById('emailAddress');
  const passwordInput = document.getElementById('accountPassword');
  const passwordToggleBtn = document.getElementById('password-toggle');
  const eyeOpen = passwordToggleBtn?.querySelector('.eye-open');
  const eyeClosed = passwordToggleBtn?.querySelector('.eye-closed');

  // 1. Password Visibility Toggle
  if (passwordToggleBtn && passwordInput) {
    passwordToggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';

      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPassword ? 'none' : 'block';
        eyeClosed.style.display = isPassword ? 'block' : 'none';
      }
    });
  }

  // 2. Alert helpers
  function showAlert(message, type = 'error') {
    if (!authAlert || !authAlertMessage) return;
    authAlert.className = `auth-alert ${type}`;
    authAlertMessage.innerHTML = message;

    if (authAlertIcon) {
      if (type === 'error') {
        authAlertIcon.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        `;
      } else if (type === 'success') {
        authAlertIcon.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        `;
      } else {
        authAlertIcon.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        `;
      }
    }

    authAlert.style.display = 'flex';
    authAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearAlert() {
    if (authAlert) {
      authAlert.style.display = 'none';
      if (authAlertMessage) authAlertMessage.textContent = '';
    }
  }

  // Helper to determine destination after sign-in / sign-up
  function getPostAuthRedirect(mode) {
    const redirectParam = urlParams.get('redirect');
    if (redirectParam) return redirectParam;

    const existingPlan = localStorage.getItem('menzo_selected_plan');
    if (mode === 'login' || existingPlan) {
      return '/dashboard.html';
    }
    return '/choose-plan.html';
  }

  // 3. Mode Switcher (Sign Up <-> Log In)
  function setMode(mode) {
    currentMode = mode;
    clearAlert();
    clearAllFieldErrors();

    if (submitBtn) {
      submitBtn.disabled = false;
    }

    if (mode === 'signup') {
      tabSignup?.classList.add('active');
      tabSignup?.setAttribute('aria-selected', 'true');
      tabLogin?.classList.remove('active');
      tabLogin?.setAttribute('aria-selected', 'false');

      if (formTitle) formTitle.textContent = 'Get Started';
      if (formSubtitle) formSubtitle.textContent = 'Create your restaurant account';
      if (submitBtnText) submitBtnText.textContent = 'Create Account';
      if (topAuthPrompt) topAuthPrompt.textContent = 'Already have an account?';
      if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = 'Log in';

      if (signupExtraFields) signupExtraFields.style.display = 'flex';
      if (forgotPasswordBtn) forgotPasswordBtn.style.display = 'none';
      if (termsNotice) termsNotice.style.display = 'block';

      document.title = 'Get Started — Menzo | Create Your Restaurant Account';
      const targetPath = '/get-started.html';
      if (!window.location.pathname.endsWith('get-started.html')) {
        window.history.replaceState(null, '', targetPath + (window.location.search || ''));
      }
    } else {
      tabLogin?.classList.add('active');
      tabLogin?.setAttribute('aria-selected', 'true');
      tabSignup?.classList.remove('active');
      tabSignup?.setAttribute('aria-selected', 'false');

      if (formTitle) formTitle.textContent = 'Welcome Back';
      if (formSubtitle) formSubtitle.textContent = 'Log in to your restaurant dashboard';
      if (submitBtnText) submitBtnText.textContent = 'Log In';
      if (topAuthPrompt) topAuthPrompt.textContent = "Don't have an account?";
      if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = 'Sign up';

      if (signupExtraFields) signupExtraFields.style.display = 'none';
      if (forgotPasswordBtn) forgotPasswordBtn.style.display = 'inline-block';
      if (termsNotice) termsNotice.style.display = 'none';

      document.title = 'Log In — Menzo | Restaurant Dashboard Access';
      const targetPath = '/login.html';
      if (!window.location.pathname.endsWith('login.html')) {
        window.history.replaceState(null, '', targetPath + (window.location.search || ''));
      }
    }
  }

  tabSignup?.addEventListener('click', () => setMode('signup'));
  tabLogin?.addEventListener('click', () => setMode('login'));
  toggleAuthModeBtn?.addEventListener('click', () => {
    setMode(currentMode === 'signup' ? 'login' : 'signup');
  });

  // Check URL query parameters for ?mode=login or page path
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'login' || window.location.pathname.includes('login')) {
    setMode('login');
  }

  // 4. Real-time Field Error Clearing
  const inputs = document.querySelectorAll('.restaurant-signup-form input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const fieldGroup = input.closest('.form-field-group');
      if (fieldGroup && fieldGroup.classList.contains('has-error')) {
        fieldGroup.classList.remove('has-error');
        const errorMsg = fieldGroup.querySelector('.field-error-msg');
        if (errorMsg) errorMsg.textContent = '';
      }
      clearAlert();
    });
  });

  function clearAllFieldErrors() {
    document.querySelectorAll('.form-field-group.has-error').forEach(group => {
      group.classList.remove('has-error');
      const errorMsg = group.querySelector('.field-error-msg');
      if (errorMsg) errorMsg.textContent = '';
    });
  }

  function setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const group = input?.closest('.form-field-group');
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (group && errorEl) {
      group.classList.add('has-error');
      errorEl.textContent = message;
    }
  }

  // 5. Forgot Password Handling
  forgotPasswordBtn?.addEventListener('click', async () => {
    clearAlert();
    const email = emailInput?.value.trim();

    if (!email) {
      setFieldError('emailAddress', 'Please enter your email to reset password.');
      emailInput?.focus();
      return;
    }

    try {
      forgotPasswordBtn.disabled = true;
      forgotPasswordBtn.textContent = 'Sending...';
      await sendPasswordReset(email);
      showAlert(`Password reset instructions have been sent to ${email}. Check your inbox!`, 'success');
    } catch (err) {
      showAlert(mapAuthError(err), 'error');
    } finally {
      forgotPasswordBtn.disabled = false;
      forgotPasswordBtn.textContent = 'Forgot?';
    }
  });

  // 6. Form Submission (Sign Up / Log In)
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();
      clearAllFieldErrors();

      const email = emailInput?.value.trim() || '';
      const password = passwordInput?.value || '';

      // Validate Email
      if (!email) {
        setFieldError('emailAddress', 'Please enter your email address.');
        return;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError('emailAddress', 'Please enter a valid email address.');
        return;
      }

      // Validate Password
      if (!password) {
        setFieldError('accountPassword', 'Please enter your password.');
        return;
      } else if (password.length < 6) {
        setFieldError('accountPassword', 'Password must be at least 6 characters.');
        return;
      }

      // Sign Up specific validation
      let restaurantName = '';
      let ownerName = '';
      let phoneNumber = '';

      if (currentMode === 'signup') {
        restaurantName = restaurantNameInput?.value.trim() || '';
        ownerName = ownerNameInput?.value.trim() || '';
        phoneNumber = phoneNumberInput?.value.trim() || '';

        let hasExtraErrors = false;
        if (!restaurantName) {
          setFieldError('restaurantName', 'Please enter your restaurant name.');
          hasExtraErrors = true;
        }
        if (!ownerName) {
          setFieldError('ownerName', 'Please enter your name.');
          hasExtraErrors = true;
        }
        if (!phoneNumber) {
          setFieldError('phoneNumber', 'Please enter your phone number.');
          hasExtraErrors = true;
        } else if (!/^[0-9\s-]{7,15}$/.test(phoneNumber)) {
          setFieldError('phoneNumber', 'Please enter a valid phone number.');
          hasExtraErrors = true;
        }

        if (hasExtraErrors) return;
      }

      // Set Loading State
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtnText) {
          submitBtnText.textContent = currentMode === 'signup' ? 'Creating Account...' : 'Logging In...';
        }
      }

      try {
        if (currentMode === 'signup') {
          await signUpWithEmail(email, password, {
            restaurantName,
            ownerName,
            phoneNumber: `+91 ${phoneNumber}`
          });
          showAlert('Account created successfully! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = getPostAuthRedirect('signup');
          }, 450);
        } else {
          await signInWithEmail(email, password);
          showAlert('Logged in successfully! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = getPostAuthRedirect('login');
          }, 450);
        }
      } catch (err) {
        console.error('[Auth] Submit error:', err);
        const errMsg = mapAuthError(err);
        
        if (err.code === 'auth/email-already-in-use') {
          showAlert(`
            <div>
              <span>${errMsg}</span>
              <button type="button" id="btn-err-switch-login" style="margin-left:8px;background:none;border:none;color:#F4512A;font-weight:700;text-decoration:underline;cursor:pointer;padding:0;">
                Log in now &rarr;
              </button>
            </div>
          `, 'error');
          document.getElementById('btn-err-switch-login')?.addEventListener('click', () => setMode('login'));
        } else if (err.code === 'auth/user-not-found') {
          showAlert(`
            <div>
              <span>${errMsg}</span>
              <button type="button" id="btn-err-switch-signup" style="margin-left:8px;background:none;border:none;color:#F4512A;font-weight:700;text-decoration:underline;cursor:pointer;padding:0;">
                Create an account &rarr;
              </button>
            </div>
          `, 'error');
          document.getElementById('btn-err-switch-signup')?.addEventListener('click', () => setMode('signup'));
        } else {
          showAlert(errMsg, 'error');
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtnText) {
            submitBtnText.textContent = currentMode === 'signup' ? 'Create Account' : 'Log In';
          }
        }
      }
    });
  }

  // 7. Check for pending redirect sign-in results on page load
  checkRedirectResult().then(user => {
    if (user) {
      showAlert(`Signed in as ${user.displayName || user.email}! Redirecting...`, 'success');
      setTimeout(() => {
        window.location.href = getPostAuthRedirect(currentMode);
      }, 450);
    }
  }).catch(err => {
    console.error('[Auth] Redirect result error:', err);
    showAlert(mapAuthError(err), 'error');
  });

  // 8. Google One-Click OAuth
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      clearAlert();

      // Ensure proper localhost hostname if opened via 127.0.0.1
      if (window.location.hostname === '127.0.0.1') {
        const fixedUrl = window.location.href.replace('127.0.0.1', 'localhost');
        showAlert(`Google Auth requires localhost. Please open <a href="${fixedUrl}" style="color:#F4512A;font-weight:700;text-decoration:underline;">localhost:5173</a>.`, 'warning');
        return;
      }

      googleBtn.disabled = true;
      if (googleBtnText) googleBtnText.textContent = 'Connecting with Google...';

      try {
        const user = await signInWithGoogle(5000);
        showAlert(`Signed in as ${user.displayName || user.email}! Redirecting...`, 'success');
        setTimeout(() => {
          window.location.href = getPostAuthRedirect(currentMode);
        }, 450);
      } catch (err) {
        console.error('[Auth] Google error:', err);
        const errMsg = mapAuthError(err);
        
        // Show rich error with instant Full-Page fallback button
        showAlert(`
          <div>
            <div style="margin-bottom: 8px;">${errMsg}</div>
            <button type="button" id="btn-fallback-redirect-auth" style="background:#111820;color:#fff;border:none;padding:7px 14px;border-radius:6px;font-size:12px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
              <span>Continue with Full-Page Google Sign-In</span>
              <span>&rarr;</span>
            </button>
          </div>
        `, 'error');

        document.getElementById('btn-fallback-redirect-auth')?.addEventListener('click', async () => {
          showAlert('Redirecting to Google...', 'info');
          await signInWithGoogleRedirect();
        });
      } finally {
        googleBtn.disabled = false;
        if (googleBtnText) googleBtnText.textContent = 'Continue with Google';
      }
    });
  }

  // Direct redirect button (if present)
  const googleRedirectBtn = document.getElementById('google-redirect-btn');
  googleRedirectBtn?.addEventListener('click', async () => {
    clearAlert();
    showAlert('Redirecting to Google...', 'info');
    await signInWithGoogleRedirect();
  });
});
