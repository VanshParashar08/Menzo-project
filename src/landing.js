// Menzo Landing Page Client Scripts
import './components/navbarAuth.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking any link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Interactive Category Tabs on the Mockup Phone
  const catPills = document.querySelectorAll('.mockup-cat-pill');
  const menuRows = document.querySelectorAll('.mockup-dish-row');

  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const cat = pill.dataset.cat;
      menuRows.forEach(row => {
        if (!cat || cat === 'all' || row.dataset.cat === cat) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // 3. Smooth scrolling for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
