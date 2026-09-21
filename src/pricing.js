/* ============================================================
   MENZO PRICING PAGE LOGIC
   - Monthly / Yearly billing toggle (Save 20%)
   - FAQ accordion toggle
   - Mobile navigation drawer
   ============================================================ */

import './components/navbarAuth.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Billing Toggle Logic
  const btnMonthly = document.getElementById('billing-monthly');
  const btnYearly = document.getElementById('billing-yearly');
  const proPriceEl = document.getElementById('pro-price-val');

  if (btnMonthly && btnYearly && proPriceEl) {
    btnMonthly.addEventListener('click', () => {
      btnMonthly.classList.add('active');
      btnYearly.classList.remove('active');
      proPriceEl.textContent = '499';
    });

    btnYearly.addEventListener('click', () => {
      btnYearly.classList.add('active');
      btnMonthly.classList.remove('active');
      proPriceEl.textContent = '399';
    });
  }

  // 2. FAQ Accordion Logic
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach((card) => {
    const questionBtn = card.querySelector('.faq-question-btn');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        // Close others or allow multiple open: standard behavior closes other for clean accordion
        faqCards.forEach((c) => c.classList.remove('open'));
        if (!isOpen) {
          card.classList.add('open');
        }
      });
    }
  });

  // 3. Mobile Navigation Drawer
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
