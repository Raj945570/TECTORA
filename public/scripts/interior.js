/**
 * TECTORA — Interior Design Interactive Engine
 * Handles:
 * 1. Single-Image Auto Cross-Fade Sliders (3.5s interval with pause-on-hover)
 * 2. Fullscreen High-Resolution Zoom Modal (Next/Prev, Keyboard navigation, backdrop dismiss)
 * 3. Integrated Category Enquiry Modal (Category pre-fill, validation, confirmation state)
 * 4. Style Pills Quick-Jump navigation with IntersectionObserver
 */

(function () {
  'use strict';

  // Category Gallery Data for Zoom & Navigation
  const interiorGalleries = {
    modern: {
      name: "Modern & Minimalist",
      slides: [
        {
          src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85",
          tag: "Architectural Living",
          title: "Monolithic Architectural Living Space with Glass Courtyard"
        },
        {
          src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
          tag: "Culinary & Dining",
          title: "Fluted Monolithic Kitchen Island & Architectural Pendants"
        },
        {
          src: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=85",
          tag: "Wellness & Bath",
          title: "Microcement Architectural Powder Suite with Floating Stone"
        },
        {
          src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85",
          tag: "Open-Plan Pavilion",
          title: "Seamless Indoor-Outdoor Minimalist Courtyard Residence"
        },
        {
          src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85",
          tag: "Master Suite",
          title: "Sculptural Minimalist Bedroom with Ambient Cove Illumination"
        },
        {
          src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=85",
          tag: "Executive Lounge",
          title: "Warm Monochromatic Lounge with Low-Profile Scandinavian Seating"
        }
      ]
    },
    traditional: {
      name: "Traditional & Classic",
      slides: [
        {
          src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=85",
          tag: "Grand Salon",
          title: "Classic European Living Salon with Ornate Moldings & Parquet"
        },
        {
          src: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=85",
          tag: "Heritage Kitchen",
          title: "Bespoke Shaker Culinary Studio with Brass Accents & Marble"
        },
        {
          src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=85",
          tag: "Executive Library",
          title: "Rich Mahogany Library with Leather Club Seating & Coffered Ceiling"
        },
        {
          src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2000&q=85",
          tag: "Formal Banquet",
          title: "Classical Dining Hall with Crystal Chandelier & Heritage Panelling"
        },
        {
          src: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=2000&q=85",
          tag: "Heritage Suite",
          title: "Four-Poster Architectural Bedstead with Hand-Crafted Wainscoting"
        },
        {
          src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=85",
          tag: "Vestibule Gallery",
          title: "Checkerboard Marble Foyer with Classical Arches & Sconces"
        }
      ]
    },
    expressive: {
      name: "Expressive & Global",
      slides: [
        {
          src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2000&q=85",
          tag: "Mediterranean Earth",
          title: "Terracotta Mediterranean Salon with Sculptural Clay & Woven Fiber"
        },
        {
          src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85",
          tag: "Arched Sanctuary",
          title: "Moroccan Architectural Alcoves with Sunlit Skylights & Palms"
        },
        {
          src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=2000&q=85",
          tag: "Artisanal Living",
          title: "Handcrafted Organic Lounge with Global Ethnographic Textiles"
        },
        {
          src: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=2000&q=85",
          tag: "Maximalist Studio",
          title: "Warm Ochre Drawing Room with Antiqued Brass & Artisanal Vessels"
        },
        {
          src: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=2000&q=85",
          tag: "Tropical Biophilic",
          title: "Sunlit Cane & Tropical Greenery Dining Pavilion"
        },
        {
          src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=2000&q=85",
          tag: "Japandi-Boho Suite",
          title: "Earthy Textured Bedroom with Raw Timber & Woven Wall Hangings"
        }
      ]
    }
  };

  /* --------------------------------------------------------------------------
     1. CROSSFADE SLIDER IMPLEMENTATION
     -------------------------------------------------------------------------- */
  class CategorySlider {
    constructor(containerEl, categoryKey) {
      this.container = containerEl;
      this.categoryKey = categoryKey;
      this.slides = containerEl.querySelectorAll('.interior-slide');
      this.dots = containerEl.querySelectorAll('.interior-dot');
      this.counterEl = containerEl.querySelector('.interior-counter-badge .current-idx');
      this.totalSlides = this.slides.length;
      this.currentIndex = 0;
      this.timer = null;
      this.intervalMs = 3500; // 3.5 seconds auto-fade

      if (!this.totalSlides) return;

      this.init();
    }

    init() {
      // Prev / Next button clicks
      const prevBtn = this.container.querySelector('.interior-arrow-prev');
      const nextBtn = this.container.querySelector('.interior-arrow-next');

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.prevSlide();
          this.resetTimer();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.nextSlide();
          this.resetTimer();
        });
      }

      // Dot navigation
      this.dots.forEach((dot, idx) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goToSlide(idx);
          this.resetTimer();
        });
      });

      // Hover to pause auto-transition
      this.container.addEventListener('mouseenter', () => this.stopTimer());
      this.container.addEventListener('mouseleave', () => this.startTimer());

      // Click on slide to open zoom modal
      this.slides.forEach((slide, idx) => {
        slide.addEventListener('click', () => {
          openZoomModal(this.categoryKey, idx);
        });
      });

      // Start automatic sliding
      this.startTimer();
    }

    goToSlide(index) {
      if (index === this.currentIndex) return;

      this.slides[this.currentIndex].classList.remove('is-active');
      if (this.dots[this.currentIndex]) {
        this.dots[this.currentIndex].classList.remove('is-active');
      }

      this.currentIndex = (index + this.totalSlides) % this.totalSlides;

      this.slides[this.currentIndex].classList.add('is-active');
      if (this.dots[this.currentIndex]) {
        this.dots[this.currentIndex].classList.add('is-active');
      }

      if (this.counterEl) {
        this.counterEl.textContent = String(this.currentIndex + 1).padStart(2, '0');
      }

      // Preload next image
      const nextIdx = (this.currentIndex + 1) % this.totalSlides;
      const nextImg = this.slides[nextIdx]?.querySelector('img');
      if (nextImg && nextImg.dataset.src) {
        nextImg.src = nextImg.dataset.src;
        delete nextImg.dataset.src;
      }
    }

    nextSlide() {
      this.goToSlide(this.currentIndex + 1);
    }

    prevSlide() {
      this.goToSlide(this.currentIndex - 1);
    }

    startTimer() {
      this.stopTimer();
      this.timer = setInterval(() => {
        this.nextSlide();
      }, this.intervalMs);
    }

    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    resetTimer() {
      this.stopTimer();
      this.startTimer();
    }
  }

  /* --------------------------------------------------------------------------
     2. FULLSCREEN ZOOM MODAL
     -------------------------------------------------------------------------- */
  const zoomModal = document.getElementById('interiorZoomModal');
  const zoomImg = document.getElementById('interiorZoomImg');
  const zoomCategoryName = document.getElementById('interiorZoomCategory');
  const zoomCaption = document.getElementById('interiorZoomCaption');
  const zoomCounter = document.getElementById('interiorZoomCounter');
  const zoomCloseBtn = document.getElementById('interiorZoomClose');
  const zoomPrevBtn = document.getElementById('interiorZoomPrev');
  const zoomNextBtn = document.getElementById('interiorZoomNext');

  let activeZoomCategory = 'modern';
  let activeZoomIndex = 0;

  function openZoomModal(categoryKey, slideIndex) {
    if (!interiorGalleries[categoryKey]) return;
    activeZoomCategory = categoryKey;
    activeZoomIndex = slideIndex;
    updateZoomContent();

    zoomModal.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeZoomModal() {
    zoomModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function updateZoomContent() {
    const gallery = interiorGalleries[activeZoomCategory];
    const total = gallery.slides.length;
    activeZoomIndex = (activeZoomIndex + total) % total;
    const item = gallery.slides[activeZoomIndex];

    zoomImg.style.opacity = '0';
    zoomImg.style.transform = 'scale(0.96)';

    setTimeout(() => {
      zoomImg.src = item.src;
      zoomCategoryName.textContent = gallery.name;
      zoomCaption.textContent = item.title;
      zoomCounter.textContent = `${String(activeZoomIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      zoomImg.style.opacity = '1';
      zoomImg.style.transform = 'scale(1)';
    }, 150);
  }

  if (zoomCloseBtn) {
    zoomCloseBtn.addEventListener('click', closeZoomModal);
  }

  if (zoomPrevBtn) {
    zoomPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeZoomIndex--;
      updateZoomContent();
    });
  }

  if (zoomNextBtn) {
    zoomNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeZoomIndex++;
      updateZoomContent();
    });
  }

  // Backdrop click to close
  if (zoomModal) {
    zoomModal.addEventListener('click', (e) => {
      if (e.target === zoomModal || e.target.classList.contains('interior-zoom-stage')) {
        closeZoomModal();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (zoomModal && zoomModal.classList.contains('is-open')) {
      if (e.key === 'Escape') closeZoomModal();
      if (e.key === 'ArrowLeft') {
        activeZoomIndex--;
        updateZoomContent();
      }
      if (e.key === 'ArrowRight') {
        activeZoomIndex++;
        updateZoomContent();
      }
    }
  });

  /* --------------------------------------------------------------------------
     3. INTERACTIVE ENQUIRY MODAL SYSTEM
     -------------------------------------------------------------------------- */
  const enquiryModal = document.getElementById('interiorEnquiryModal');
  const enquiryCloseBtn = document.getElementById('interiorEnquiryClose');
  const enquiryForm = document.getElementById('interiorEnquiryForm');
  const enquiryStyleSelect = document.getElementById('interiorEnquiryStyle');
  const enquirySuccessBlock = document.getElementById('interiorEnquirySuccess');
  const enquirySuccessCloseBtn = document.getElementById('interiorSuccessClose');

  function openEnquiryModal(preselectedStyle) {
    if (!enquiryModal) return;

    if (enquiryStyleSelect && preselectedStyle) {
      enquiryStyleSelect.value = preselectedStyle;
    }

    if (enquirySuccessBlock) {
      enquirySuccessBlock.classList.remove('is-visible');
    }
    if (enquiryForm) {
      enquiryForm.style.display = 'block';
    }

    enquiryModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeEnquiryModal() {
    if (!enquiryModal) return;
    enquiryModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Wire up category "Enquire Now" buttons and global button
  document.querySelectorAll('[data-enquire-style]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const styleName = btn.getAttribute('data-enquire-style') || '';
      openEnquiryModal(styleName);
    });
  });

  if (enquiryCloseBtn) {
    enquiryCloseBtn.addEventListener('click', closeEnquiryModal);
  }

  if (enquirySuccessCloseBtn) {
    enquirySuccessCloseBtn.addEventListener('click', closeEnquiryModal);
  }

  if (enquiryModal) {
    enquiryModal.addEventListener('click', (e) => {
      if (e.target === enquiryModal) {
        closeEnquiryModal();
      }
    });
  }

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = enquiryForm.querySelector('.interior-form-submit-btn');
      const origText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-animation" style="animation: spin 0.8s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        Transmitting Enquiry...
      `;

      // Mock network submission
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
        enquiryForm.reset();
        enquiryForm.style.display = 'none';
        if (enquirySuccessBlock) {
          enquirySuccessBlock.classList.add('is-visible');
        }
      }, 700);
    });
  }

  /* --------------------------------------------------------------------------
     4. CATEGORY PILL NAVIGATION & INITIALIZATION
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize sliders for each category
    const modernSlider = document.getElementById('frameModern');
    if (modernSlider) new CategorySlider(modernSlider, 'modern');

    const traditionalSlider = document.getElementById('frameTraditional');
    if (traditionalSlider) new CategorySlider(traditionalSlider, 'traditional');

    const expressiveSlider = document.getElementById('frameExpressive');
    if (expressiveSlider) new CategorySlider(expressiveSlider, 'expressive');

    // Smooth scroll for category pills
    const pillButtons = document.querySelectorAll('.interior-pill-btn');
    pillButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Highlight active pill on scroll
    const sections = document.querySelectorAll('.interior-category-section');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            pillButtons.forEach(btn => {
              if (btn.getAttribute('href') === `#${id}`) {
                btn.classList.add('is-active');
              } else {
                btn.classList.remove('is-active');
              }
            });
          }
        });
      }, { rootMargin: '-20% 0px -60% 0px' });

      sections.forEach(sec => observer.observe(sec));
    }
  });

  // Export functions to global scope for flexibility
  window.TectoraInterior = {
    openZoom: openZoomModal,
    closeZoom: closeZoomModal,
    openEnquiry: openEnquiryModal,
    closeEnquiry: closeEnquiryModal
  };

})();
