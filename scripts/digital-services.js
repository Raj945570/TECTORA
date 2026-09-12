/**
 * TECTORA — Digital Services Interactive Accordion
 * Handles single-active-expansion with smooth slide-down and fade-in animations.
 */
document.addEventListener('DOMContentLoaded', () => {
  const serviceCards = document.querySelectorAll('.service-card-item');
  let activeCard = null;

  /**
   * Close a given card
   */
  function closeCard(card) {
    if (!card) return;
    card.classList.remove('is-expanded');
    card.setAttribute('aria-expanded', 'false');
    const label = card.querySelector('.service-card-expand-label span');
    if (label) label.textContent = 'Explore Solutions';
    if (activeCard === card) {
      activeCard = null;
    }
  }

  /**
   * Open a given card and ensure only one is open at a time
   */
  function openCard(card) {
    if (!card) return;

    // Close any other open card (Only ONE section open at a time)
    if (activeCard && activeCard !== card) {
      closeCard(activeCard);
    }

    card.classList.add('is-expanded');
    card.setAttribute('aria-expanded', 'true');
    const label = card.querySelector('.service-card-expand-label span');
    if (label) label.textContent = 'Collapse Solutions';
    activeCard = card;
  }

  /**
   * Toggle a card's expanded state
   */
  function toggleCard(card) {
    if (card.classList.contains('is-expanded')) {
      closeCard(card);
    } else {
      openCard(card);
    }
  }

  // Attach click and keyboard listeners
  serviceCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicking directly on an enquiry button or link inside drawer, allow link click
      if (e.target.closest('.subservice-tier-btn') || e.target.closest('a[href]')) {
        return;
      }
      e.preventDefault();
      toggleCard(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a[href]')) return;
        e.preventDefault();
        toggleCard(card);
      }
    });
  });

  // Auto-expand if URL has hash (e.g., #website-development)
  if (window.location.hash) {
    const hashId = window.location.hash.replace('#', '');
    const matchedCard = document.querySelector(`.service-card-item[data-service="${hashId}"]`);
    if (matchedCard) {
      setTimeout(() => {
        openCard(matchedCard);
        matchedCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }
});
