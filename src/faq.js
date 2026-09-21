/* ============================================================
   MENZO DEDICATED FAQ PAGE LOGIC
   - Vertical accordion expand / collapse
   - Mobile navigation drawer
   ============================================================ */

import './components/navbarAuth.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. FAQ Accordion Logic
  const faqCards = document.querySelectorAll('.faq-acc-card');

  faqCards.forEach((card) => {
    const questionBtn = card.querySelector('.faq-acc-question-btn');
    const iconEl = card.querySelector('.faq-acc-icon');

    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');

        // Optional: close other open cards for clean single accordion view
        faqCards.forEach((c) => {
          c.classList.remove('open');
          const otherBtn = c.querySelector('.faq-acc-question-btn');
          const otherIcon = c.querySelector('.faq-acc-icon');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherIcon) otherIcon.textContent = '+';
        });

        if (!isOpen) {
          card.classList.add('open');
          questionBtn.setAttribute('aria-expanded', 'true');
          if (iconEl) iconEl.textContent = '—';
        } else {
          card.classList.remove('open');
          questionBtn.setAttribute('aria-expanded', 'false');
          if (iconEl) iconEl.textContent = '+';
        }
      });
    }
  });

  // 2. Mobile Navigation Drawer
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.classList.toggle('open', !isExpanded);
    });
  }
});
