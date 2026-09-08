/**
 * TECTORA - Dark Theme Navbar & Interactive Controller
 * Handles sticky elevation, search interaction, mobile menu, and inquiry feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('tectoraHeader');
  const navMobileToggle = document.getElementById('navMobileToggle');
  const navCenter = document.getElementById('navCenter');
  const navLinks = document.querySelectorAll('.nav-link');
  const searchInput = document.getElementById('navSearchInput');
  const inquiryForm = document.getElementById('projectInquiryForm');

  // 1. Sticky navbar scroll shadow & background elevation
  function handleScroll() {
    if (window.scrollY > 15) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile drawer navigation
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

  // 3. Search keyboard shortcut (Cmd/Ctrl + K)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  // 4. Smooth active state tracking
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.forEach(l => l.classList.remove('is-active'));
      this.classList.add('is-active');
    });
  });

  // 5. Inquiry Form submission state
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = 'Transmitting Parameters...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '✓ Parameters Registered Successfully';
        submitBtn.style.backgroundColor = '#10B981';
        submitBtn.style.color = '#FFFFFF';
        inquiryForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.backgroundColor = '';
          submitBtn.style.color = '';
          submitBtn.disabled = false;
        }, 4000);
      }, 750);
    });
  }
});
