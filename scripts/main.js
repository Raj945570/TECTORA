/**
 * TECTORA - Light Theme Main Application Controller
 * Federal Land Aesthetic: Sticky navbar, real estate gallery slider, floating inquiry
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initPropertySlider();
  initForms();
});

/* --------------------------------------------------------------------------
   1. NAVBAR CONTROLLER
   -------------------------------------------------------------------------- */
function initNavbar() {
  const header = document.getElementById('tectoraHeader');
  const navMobileToggle = document.getElementById('navMobileToggle');
  const navCenter = document.getElementById('navCenter');
  const navLinks = document.querySelectorAll('.nav-link');
  const searchInput = document.getElementById('navSearchInput');

  function handleScroll() {
    if (window.scrollY > 15) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (navMobileToggle && navCenter) {
    navMobileToggle.addEventListener('click', () => {
      const isOpen = navCenter.classList.toggle('is-open');
      navMobileToggle.classList.toggle('is-open', isOpen);
      navMobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    const allNavLinks = navCenter.querySelectorAll('a');
    allNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        navCenter.classList.remove('is-open');
        navMobileToggle.classList.remove('is-open');
        navMobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Search keyboard shortcut (Cmd/Ctrl + K)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  // Active link tracking
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.forEach(l => l.classList.remove('is-active'));
      this.classList.add('is-active');
    });
  });
}

/* --------------------------------------------------------------------------
   2. PROPERTY / PROJECT SHOWCASE SLIDER
   -------------------------------------------------------------------------- */
const showcaseImages = [
  {
    src: 'assets/images/property-living.jpg',
    title: 'Cyber City Commercial Hub — Executive Floor',
    pill: 'Executive Floor'
  },
  {
    src: 'assets/images/property-kitchen.jpg',
    title: 'Cafeteria & Collaborative Lounge',
    pill: 'Lounge Area'
  },
  {
    src: 'assets/images/property-structural.jpg',
    title: 'Grade-A RCC Monolithic Shear Shell',
    pill: 'Structural Shell'
  },
  {
    src: 'assets/images/property-land.jpg',
    title: 'Financial District Masterplan Development Parcel',
    pill: 'Masterplan Site'
  }
];

function initPropertySlider() {
  const mainImg = document.getElementById('showcaseMainImg');
  const statusPill = document.getElementById('sliderStatusPill');
  const thumbs = document.querySelectorAll('.slider-thumb-item');

  if (!mainImg || !thumbs.length) return;

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');

      const data = showcaseImages[index];
      if (!data) return;

      mainImg.classList.add('fading');
      setTimeout(() => {
        mainImg.src = data.src;
        mainImg.alt = data.title;
        if (statusPill) statusPill.textContent = data.pill;
        mainImg.classList.remove('fading');
      }, 180);
    });
  });
}

/* --------------------------------------------------------------------------
   3. FORMS HANDLERS (HERO FLOATING INQUIRY & CONTACT)
   -------------------------------------------------------------------------- */
function initForms() {
  const heroInquiryForm = document.getElementById('heroInquiryForm');
  const inquiryFeedback = document.getElementById('inquiryFeedback');
  const contactForm = document.getElementById('contactForm');

  if (heroInquiryForm) {
    heroInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = heroInquiryForm.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;

      submitBtn.innerHTML = 'Transmitting Parameters...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = origText;
        submitBtn.disabled = false;
        heroInquiryForm.reset();

        if (inquiryFeedback) {
          inquiryFeedback.classList.add('show');
          setTimeout(() => inquiryFeedback.classList.remove('show'), 6000);
        }

        showToast('Inquiry registered with TECTORA Advisory. An executive liaison will connect shortly.');
      }, 700);
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;

      btn.innerHTML = 'Sending Message...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '✓ Message Transmitted';
        btn.style.backgroundColor = '#0B1F3A';
        contactForm.reset();

        setTimeout(() => {
          btn.innerHTML = orig;
          btn.disabled = false;
        }, 4000);

        showToast('Your message has been received by our executive team.');
      }, 700);
    });
  }
}

/* --------------------------------------------------------------------------
   4. TOAST NOTIFICATION
   -------------------------------------------------------------------------- */
function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast-box';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#C8A45D">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    <span>${msg}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}
