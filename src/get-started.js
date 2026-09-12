// ============================================================
// MENZO GET STARTED / SIGNUP JAVASCRIPT
// Handles password toggle, form validation, localStorage persistence,
// and redirection to the menu generator.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Password Visibility Toggle
  const passwordInput = document.getElementById('accountPassword');
  const passwordToggleBtn = document.getElementById('password-toggle');
  const eyeOpen = passwordToggleBtn?.querySelector('.eye-open');
  const eyeClosed = passwordToggleBtn?.querySelector('.eye-closed');

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

  // 2. Real-time Error Clearing on Input
  const inputs = document.querySelectorAll('.restaurant-signup-form input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const fieldGroup = input.closest('.form-field-group');
      if (fieldGroup && fieldGroup.classList.contains('has-error')) {
        fieldGroup.classList.remove('has-error');
        const errorMsg = fieldGroup.querySelector('.field-error-msg');
        if (errorMsg) errorMsg.textContent = '';
      }
    });
  });

  // 3. Form Submission Handling
  const signupForm = document.getElementById('signup-form');
  const submitBtn = document.getElementById('submit-btn');

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasErrors = false;

      // Extract values
      const restaurantName = document.getElementById('restaurantName')?.value.trim() || '';
      const ownerName = document.getElementById('ownerName')?.value.trim() || '';
      const phoneNumber = document.getElementById('phoneNumber')?.value.trim() || '';
      const emailAddress = document.getElementById('emailAddress')?.value.trim() || '';
      const password = document.getElementById('accountPassword')?.value || '';

      // Helper function to set error
      const setError = (fieldId, message) => {
        const input = document.getElementById(fieldId);
        const group = input?.closest('.form-field-group');
        const errorEl = document.getElementById(`error-${fieldId}`);
        if (group && errorEl) {
          group.classList.add('has-error');
          errorEl.textContent = message;
        }
        hasErrors = true;
      };

      // Validate Restaurant Name
      if (!restaurantName) {
        setError('restaurantName', 'Please enter your restaurant name.');
      }

      // Validate Owner Name
      if (!ownerName) {
        setError('ownerName', 'Please enter your name.');
      }

      // Validate Phone Number
      if (!phoneNumber) {
        setError('phoneNumber', 'Please enter your phone number.');
      } else if (!/^[0-9\s-]{7,15}$/.test(phoneNumber)) {
        setError('phoneNumber', 'Please enter a valid phone number.');
      }

      // Validate Email
      if (!emailAddress) {
        setError('emailAddress', 'Please enter your email address.');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
        setError('emailAddress', 'Please enter a valid email address.');
      }

      // Validate Password
      if (!password) {
        setError('accountPassword', 'Please create a password.');
      } else if (password.length < 6) {
        setError('accountPassword', 'Password must be at least 6 characters.');
      }

      if (hasErrors) return;

      // Save restaurant details to localStorage for generator.html to use
      try {
        localStorage.setItem('menzo_restaurant_name', restaurantName);
        localStorage.setItem('menzo_owner_name', ownerName);
        localStorage.setItem('menzo_phone', `+91 ${phoneNumber}`);
        localStorage.setItem('menzo_email', emailAddress);
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      // Visual feedback on button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Creating Account...</span>`;
      }

      // Navigate to Step 2: Choose Plan
      setTimeout(() => {
        window.location.href = '/choose-plan.html';
      }, 350);
    });
  }

  // 4. Social Auth Buttons
  const googleBtn = document.getElementById('google-auth-btn');
  const appleBtn = document.getElementById('apple-auth-btn');

  const handleSocialAuth = (provider) => {
    try {
      localStorage.setItem('menzo_restaurant_name', 'The Food Club');
      localStorage.setItem('menzo_owner_name', 'Rohan Mehta');
      localStorage.setItem('menzo_auth_provider', provider);
    } catch (e) {}

    window.location.href = '/choose-plan.html';
  };

  googleBtn?.addEventListener('click', () => handleSocialAuth('google'));
  appleBtn?.addEventListener('click', () => handleSocialAuth('apple'));
});
