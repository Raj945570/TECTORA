/**
 * TECTORA - Authentication Guard & Session Controller
 * Enforces authentication-first access control across protected platform pages,
 * redirects unauthenticated users to login, and synchronizes navbar session status.
 */

(function () {
  const AUTH_KEY = 'tectora_authenticated';
  const USER_KEY = 'tectora_user';

  // 1. Instant Route Protection Gatekeeper
  // Call this synchronously in <head> to prevent any flash of unauthenticated content
  window.TectoraAuth = {
    isAuthenticated: function () {
      return localStorage.getItem(AUTH_KEY) === 'true';
    },

    getUser: function () {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      } catch (e) {
        return {};
      }
    },

    requireAuth: function () {
      if (!this.isAuthenticated()) {
        const currentPath = window.location.pathname + window.location.search + window.location.hash;
        const redirectParam = encodeURIComponent(currentPath);
        window.location.replace('/pages/auth/login.html?redirect=' + redirectParam);
      }
    },

    requireGuest: function () {
      if (this.isAuthenticated()) {
        const params = new URLSearchParams(window.location.search);
        const destination = params.get('redirect') || '/index.html';
        window.location.replace(destination);
      }
    },

    setAuthenticated: function (userData) {
      localStorage.setItem(AUTH_KEY, 'true');
      if (userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
    },

    signOut: function () {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace('/pages/auth/login.html');
    }
  };

  // 2. Synchronize Navbar Auth State on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // If on an auth page (login/signup), skip navbar sync
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
      return;
    }

    const authLink = document.querySelector('.nav-auth-link');
    if (!authLink) return;

    if (window.TectoraAuth.isAuthenticated()) {
      const user = window.TectoraAuth.getUser();
      const displayName = user.name ? user.name.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'Account');

      // Create a user menu container
      const userNav = document.createElement('div');
      userNav.className = 'nav-user-cluster';
      userNav.innerHTML = `
        <div class="nav-user-badge">
          <svg class="nav-user-avatar" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="nav-user-name">${displayName}</span>
        </div>
        <button type="button" class="btn-nav-signout" id="btnNavSignOut" title="Sign Out of TECTORA">
          Sign Out
        </button>
      `;

      authLink.parentNode.replaceChild(userNav, authLink);

      const signOutBtn = document.getElementById('btnNavSignOut');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.TectoraAuth.signOut();
        });
      }
    }
  });
})();
