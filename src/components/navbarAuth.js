// ============================================================
// MENZO GLOBAL NAVBAR AUTH STATUS COMPONENT
// Automatically updates the header navigation across all pages
// with the active user avatar, restaurant name, and sign out dropdown.
// ============================================================

import { onAuthChange, logoutUser, getCurrentUser } from '../services/authService.js';

export function initNavbarAuth() {
  const ctaButtons = document.querySelectorAll('.nav-cta-btn, .mobile-nav-cta');
  if (!ctaButtons.length) return;

  // Add styles for user avatar badge and dropdown if not already injected
  if (!document.getElementById('menzo-nav-auth-styles')) {
    const style = document.createElement('style');
    style.id = 'menzo-nav-auth-styles';
    style.textContent = `
      .nav-user-menu-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .nav-user-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px 5px 6px;
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 9999px;
        cursor: pointer;
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 600;
        color: #0F172A;
        transition: all 0.2s ease;
      }
      .nav-user-badge:hover {
        background-color: #F1F5F9;
        border-color: #CBD5E1;
      }
      .nav-user-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
        background-color: #F4512A;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
      }
      .nav-user-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 210px;
        background-color: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        padding: 6px;
        display: none;
        flex-direction: column;
        z-index: 1000;
        animation: navDropdownFade 0.15s ease-out;
      }
      .nav-user-dropdown.show {
        display: flex;
      }
      @keyframes navDropdownFade {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .nav-dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        color: #334155;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s ease;
      }
      .nav-dropdown-item:hover {
        background-color: #F8FAFC;
        color: #0F172A;
      }
      .nav-dropdown-item.danger {
        color: #EF4444;
      }
      .nav-dropdown-item.danger:hover {
        background-color: #FEF2F2;
      }
      .nav-dropdown-divider {
        height: 1px;
        background-color: #F1F5F9;
        margin: 4px 0;
      }
    `;
    document.head.appendChild(style);
  }

  // Render auth state
  function renderUserState(user) {
    const navCta = document.querySelector('.nav-cta-btn');
    if (!navCta) return;

    if (!user) {
      // Not logged in: ensure standard button
      const wrapper = navCta.closest('.nav-user-menu-wrapper');
      if (wrapper) {
        wrapper.replaceWith(navCta);
      }
      navCta.textContent = 'Get Started';
      navCta.href = '/get-started.html';
      return;
    }

    // Logged in
    const displayName = user.displayName || localStorage.getItem('menzo_owner_name') || localStorage.getItem('menzo_restaurant_name') || user.email?.split('@')[0] || 'My Account';
    const initial = displayName.charAt(0).toUpperCase();
    const photoURL = user.photoURL || localStorage.getItem('menzo_user_avatar');

    const wrapper = document.createElement('div');
    wrapper.className = 'nav-user-menu-wrapper';

    wrapper.innerHTML = `
      <button type="button" class="nav-user-badge" id="nav-user-badge-btn" aria-expanded="false">
        ${photoURL ? `<img src="${photoURL}" class="nav-user-avatar" alt="${displayName}"/>` : `<div class="nav-user-avatar">${initial}</div>`}
        <span>${displayName}</span>
        <svg width="12" height="8" viewBox="0 0 10 6" fill="none" style="margin-left:2px">
          <path d="M1 1L5 5L9 1" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="nav-user-dropdown" id="nav-user-dropdown-menu">
        <a href="/dashboard.html" class="nav-dropdown-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Dashboard
        </a>
        <a href="/generator.html" class="nav-dropdown-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          QR Studio
        </a>
        <a href="/preview-golive.html" class="nav-dropdown-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
          Live Preview
        </a>
        <div class="nav-dropdown-divider"></div>
        <button type="button" class="nav-dropdown-item danger" id="nav-logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Log Out
        </button>
      </div>
    `;

    navCta.replaceWith(wrapper);

    // Dropdown toggle
    const badgeBtn = wrapper.querySelector('#nav-user-badge-btn');
    const dropdown = wrapper.querySelector('#nav-user-dropdown-menu');
    const logoutBtn = wrapper.querySelector('#nav-logout-btn');

    badgeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown?.classList.toggle('show');
      badgeBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', () => {
      dropdown?.classList.remove('show');
      badgeBtn?.setAttribute('aria-expanded', 'false');
    });

    logoutBtn?.addEventListener('click', async () => {
      await logoutUser();
      window.location.reload();
    });
  }

  onAuthChange(renderUserState);
}

// Auto-run if document is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbarAuth);
  } else {
    initNavbarAuth();
  }
}
