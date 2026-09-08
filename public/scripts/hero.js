/**
 * TECTORA - Hero Section Controller
 * Provides interactive toggling between Light Overlay and Dark Overlay,
 * and between City Skyline and Construction Site images.
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('heroSection');
  const toggleOverlayBtn = document.getElementById('toggleOverlayBtn');
  const overlayBtnText = document.getElementById('overlayBtnText');
  const toggleImageBtn = document.getElementById('toggleImageBtn');
  const imageBtnText = document.getElementById('imageBtnText');

  if (!heroSection) return;

  // 1. Overlay Toggle: Option 1 (Light Overlay with #1F2A44 text) vs Option 2 (Dark Overlay with white text)
  if (toggleOverlayBtn) {
    toggleOverlayBtn.addEventListener('click', () => {
      const isDark = heroSection.classList.toggle('overlay-dark');
      if (isDark) {
        overlayBtnText.textContent = 'Light Overlay Mode';
      } else {
        overlayBtnText.textContent = 'Dark Overlay Mode';
      }
    });
  }

  // 2. Image Toggle: City Skyline vs Construction Site
  let currentImage = 'skyline';
  if (toggleImageBtn) {
    toggleImageBtn.addEventListener('click', () => {
      if (currentImage === 'skyline') {
        heroSection.style.setProperty('--hero-bg', "url('assets/images/hero-construction.jpg')");
        heroSection.style.backgroundImage = "url('assets/images/hero-construction.jpg')";
        currentImage = 'construction';
        imageBtnText.textContent = 'View Skyline';
      } else {
        heroSection.style.setProperty('--hero-bg', "url('assets/images/hero-skyline.jpg')");
        heroSection.style.backgroundImage = "url('assets/images/hero-skyline.jpg')";
        currentImage = 'skyline';
        imageBtnText.textContent = 'View Construction Site';
      }
    });
  }
});
