/**
 * TECTORA - Authentication Form Controller (Login & Signup)
 * Handles client-side validation, password matching, session initialization,
 * Google social sign-in simulation, password reset prompt, and redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginFlow();
  initSignupFlow();
  initRoleSelector();
  initPasswordToggles();
  initSocialAndHelpers();
});

// 1. Password Visibility Toggle
function initPasswordToggles() {
  const setupToggle = (btnId, inputId) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      if (eyeOpen) eyeOpen.style.display = isPassword ? 'none' : 'block';
      if (eyeClosed) eyeClosed.style.display = isPassword ? 'block' : 'none';
    });
  };

  setupToggle('btnToggleLoginPassword', 'loginPassword');
  setupToggle('btnToggleSignupPassword', 'signupPassword');
}

// 2. Login Flow (Supports Email or Phone)
function initLoginFlow() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('btnLoginSubmit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    const identifierVal = emailInput.value.trim();
    const passVal = passwordInput.value.trim();

    // Validate email or phone
    const emailGroup = document.getElementById('groupLoginEmail');
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifierVal);
    const digitsOnly = identifierVal.replace(/\D/g, '');
    const isPhone = digitsOnly.length >= 7;

    if (!identifierVal || (!isEmail && !isPhone && identifierVal.length < 3)) {
      emailInput.classList.add('has-error');
      if (emailGroup) emailGroup.classList.add('has-error');
      valid = false;
    } else {
      emailInput.classList.remove('has-error');
      if (emailGroup) emailGroup.classList.remove('has-error');
    }

    // Validate password
    const passGroup = document.getElementById('groupLoginPassword');
    if (!passVal) {
      passwordInput.classList.add('has-error');
      if (passGroup) passGroup.classList.add('has-error');
      valid = false;
    } else {
      passwordInput.classList.remove('has-error');
      if (passGroup) passGroup.classList.remove('has-error');
    }

    if (!valid) return;

    // Set pending state
    submitBtn.innerHTML = '<span>Signing In...</span>';
    submitBtn.disabled = true;

    // Generate nice display name from email or identifier
    let displayName = 'Director';
    if (isEmail) {
      displayName = identifierVal.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else if (isPhone) {
      displayName = 'Member ' + digitsOnly.slice(-4);
    } else {
      displayName = identifierVal.charAt(0).toUpperCase() + identifierVal.slice(1);
    }

    // Establish authentication session
    const userData = {
      identifier: identifierVal,
      email: isEmail ? identifierVal : (identifierVal + '@tectora.local'),
      name: displayName,
      loggedInAt: new Date().toISOString()
    };

    if (window.TectoraAuth) {
      window.TectoraAuth.setAuthenticated(userData);
    } else {
      localStorage.setItem('tectora_authenticated', 'true');
      localStorage.setItem('tectora_user', JSON.stringify(userData));
    }

    // Redirect to requested page or index.html
    const params = new URLSearchParams(window.location.search);
    const destination = params.get('redirect') || '/index.html';

    setTimeout(() => {
      window.location.replace(destination);
    }, 450);
  });

  // Clear errors on input
  [emailInput, passwordInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        inp.classList.remove('has-error');
        const grp = inp.closest('.auth-field-group');
        if (grp) grp.classList.remove('has-error');
      });
    }
  });
}

// 3. Signup Flow
function initSignupFlow() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const phoneInput = document.getElementById('signupPhone');
  const passwordInput = document.getElementById('signupPassword');
  const confirmPasswordInput = document.getElementById('signupConfirmPassword');
  const submitBtn = document.getElementById('btnSignupSubmit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const phoneVal = phoneInput.value.trim();
    const passVal = passwordInput.value;
    const confirmVal = confirmPasswordInput.value;

    // 1. Full Name
    const nameGroup = document.getElementById('groupSignupName');
    if (!nameVal || nameVal.length < 2) {
      nameInput.classList.add('has-error');
      if (nameGroup) nameGroup.classList.add('has-error');
      valid = false;
    } else {
      nameInput.classList.remove('has-error');
      if (nameGroup) nameGroup.classList.remove('has-error');
    }

    // 2. Email
    const emailGroup = document.getElementById('groupSignupEmail');
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      emailInput.classList.add('has-error');
      if (emailGroup) emailGroup.classList.add('has-error');
      valid = false;
    } else {
      emailInput.classList.remove('has-error');
      if (emailGroup) emailGroup.classList.remove('has-error');
    }

    // 3. Phone (minimum 7 digits)
    const phoneGroup = document.getElementById('groupSignupPhone');
    const digitsOnly = phoneVal.replace(/\D/g, '');
    if (!phoneVal || digitsOnly.length < 7) {
      phoneInput.classList.add('has-error');
      if (phoneGroup) phoneGroup.classList.add('has-error');
      valid = false;
    } else {
      phoneInput.classList.remove('has-error');
      if (phoneGroup) phoneGroup.classList.remove('has-error');
    }

    // 4. Password (min 6 characters)
    const passGroup = document.getElementById('groupSignupPassword');
    if (!passVal || passVal.length < 6) {
      passwordInput.classList.add('has-error');
      if (passGroup) passGroup.classList.add('has-error');
      valid = false;
    } else {
      passwordInput.classList.remove('has-error');
      if (passGroup) passGroup.classList.remove('has-error');
    }

    // 5. Confirm Password (must match)
    const confirmGroup = document.getElementById('groupSignupConfirmPassword');
    if (!confirmVal || confirmVal !== passVal) {
      confirmPasswordInput.classList.add('has-error');
      if (confirmGroup) confirmGroup.classList.add('has-error');
      valid = false;
    } else {
      confirmPasswordInput.classList.remove('has-error');
      if (confirmGroup) confirmGroup.classList.remove('has-error');
    }

    if (!valid) return;

    // Set pending state
    submitBtn.innerHTML = '<span>Creating Account...</span>';
    submitBtn.disabled = true;

    // Read selected role
    const roleInput = document.getElementById('signupRole');
    const selectedRole = roleInput ? roleInput.value : 'client';

    // Establish authenticated session
    const userData = {
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      role: selectedRole,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem('tectora_user_role', selectedRole);

    if (window.TectoraAuth) {
      window.TectoraAuth.setAuthenticated(userData);
    } else {
      localStorage.setItem('tectora_authenticated', 'true');
      localStorage.setItem('tectora_user', JSON.stringify(userData));
    }

    setTimeout(() => {
      window.location.replace('/index.html');
    }, 550);
  });

  // Clear errors on input
  [nameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        inp.classList.remove('has-error');
        const grp = inp.closest('.auth-field-group');
        if (grp) grp.classList.remove('has-error');
      });
    }
  });
}

// 3.1 Role Selector Controller (Client, Seller, Consultant)
function initRoleSelector() {
  const roleCards = document.querySelectorAll('.auth-role-card');
  const roleInput = document.getElementById('signupRole');
  if (!roleCards.length || !roleInput) return;

  const selectRole = (targetCard) => {
    const role = targetCard.getAttribute('data-role');
    if (!role) return;

    roleCards.forEach(card => {
      const isCurrent = card === targetCard;
      card.classList.toggle('is-selected', isCurrent);
      card.setAttribute('aria-checked', isCurrent ? 'true' : 'false');
      card.setAttribute('tabindex', isCurrent ? '0' : '-1');
    });

    roleInput.value = role;
  };

  roleCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      selectRole(card);
    });

    // Keyboard accessibility: Space, Enter, Arrow navigation
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectRole(card);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = card.nextElementSibling || roleCards[0];
        if (next && next.classList.contains('auth-role-card')) {
          selectRole(next);
          next.focus();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = card.previousElementSibling || roleCards[roleCards.length - 1];
        if (prev && prev.classList.contains('auth-role-card')) {
          selectRole(prev);
          prev.focus();
        }
      }
    });
  });
}

// 4. Google Sign In Simulation & Forgot Password Helper
function initSocialAndHelpers() {
  // Google Login on login.html
  const googleLoginBtn = document.getElementById('btnLoginGoogle');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      googleLoginBtn.innerHTML = '<span>Connecting to Google...</span>';
      googleLoginBtn.disabled = true;

      const googleUserData = {
        name: 'Enterprise Director',
        email: 'director@enterprise.com',
        role: 'director',
        provider: 'Google SSO',
        loggedInAt: new Date().toISOString()
      };

      if (window.TectoraAuth) {
        window.TectoraAuth.setAuthenticated(googleUserData);
      } else {
        localStorage.setItem('tectora_authenticated', 'true');
        localStorage.setItem('tectora_user', JSON.stringify(googleUserData));
      }

      const params = new URLSearchParams(window.location.search);
      const destination = params.get('redirect') || '/index.html';
      setTimeout(() => {
        window.location.replace(destination);
      }, 500);
    });
  }

  // Google Signup on signup.html
  const googleSignupBtn = document.getElementById('btnSignupGoogle');
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      googleSignupBtn.innerHTML = '<span>Connecting to Google...</span>';
      googleSignupBtn.disabled = true;

      const roleInput = document.getElementById('signupRole');
      const selectedRole = roleInput ? roleInput.value : 'client';

      const googleUserData = {
        name: 'Enterprise Partner',
        email: 'partner@enterprise.com',
        role: selectedRole,
        provider: 'Google SSO',
        registeredAt: new Date().toISOString()
      };

      localStorage.setItem('tectora_user_role', selectedRole);

      if (window.TectoraAuth) {
        window.TectoraAuth.setAuthenticated(googleUserData);
      } else {
        localStorage.setItem('tectora_authenticated', 'true');
        localStorage.setItem('tectora_user', JSON.stringify(googleUserData));
      }

      setTimeout(() => {
        window.location.replace('/index.html');
      }, 500);
    });
  }

  // Forgot Password Prompt
  const forgotLink = document.getElementById('linkForgotPassword');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      const emailField = document.getElementById('loginEmail');
      const emailVal = emailField ? emailField.value.trim() : '';

      if (emailVal) {
        alert('Password recovery link has been sent to ' + emailVal + '. Please check your inbox.');
      } else {
        const entered = prompt('Please enter your registered Email Address or Phone to reset password:');
        if (entered) {
          alert('Password recovery instructions sent to ' + entered);
        }
      }
    });
  }
}
