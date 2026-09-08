/**
 * TECTORA - Authentication Guard & Session Controller
 * Enforces authentication-first access control across protected platform pages,
 * redirects unauthenticated users to login, and synchronizes navbar session status.
 */

(function () {
  const AUTH_KEY = 'tectora_authenticated';
  const USER_KEY = 'tectora_user';
  const TOKEN_KEY = 'tectora_token';

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

    getToken: function () {
      return localStorage.getItem(TOKEN_KEY) || '';
    },

    requireAuth: function () {
      if (!this.isAuthenticated()) {
        const currentPath = window.location.pathname + window.location.search + window.location.hash;
        const redirectParam = encodeURIComponent(currentPath);
        window.location.replace('/login.html?redirect=' + redirectParam);
      } else {
        // Asynchronously confirm session validity with backend
        this.verifySession();
      }
    },

    requireGuest: function () {
      if (this.isAuthenticated()) {
        const params = new URLSearchParams(window.location.search);
        const destination = params.get('redirect') || '/index.html';
        window.location.replace(destination);
      }
    },

    setAuthenticated: function (userData, token) {
      localStorage.setItem(AUTH_KEY, 'true');
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      if (userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
    },

    signOut: async function () {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.warn('Logout API error:', err);
      }
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('tectora_user_role');
      window.location.replace('/login.html');
    },

    verifySession: async function () {
      try {
        const token = this.getToken();
        const headers = {};
        if (token) {
          headers['Authorization'] = 'Bearer ' + token;
        }
        const res = await fetch('/api/auth/me', { headers });
        if (res.status === 401) {
          // Session expired or invalid
          localStorage.removeItem(AUTH_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
          const currentPath = window.location.pathname + window.location.search + window.location.hash;
          window.location.replace('/login.html?redirect=' + encodeURIComponent(currentPath));
        } else if (res.ok) {
          const data = await res.json();
          if (data.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }
        }
      } catch (err) {
        // Network or offline, rely on existing valid client state
        console.warn('[TECTORA Auth] Session verification error:', err);
      }
    }
  };

  // Synchronize Navbar Auth State on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // If on an auth page (login/signup), skip navbar sync
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
      return;
    }

    const authLink = document.querySelector('.nav-auth-link');
    if (!authLink) return;

    if (window.TectoraAuth.isAuthenticated()) {
      const user = window.TectoraAuth.getUser();
      const rawName = user.fullName || user.name || user.email || 'Account';
      const displayName = rawName.split(' ')[0].replace(/@.*/, '');

      // Create a user menu container matching design system
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
