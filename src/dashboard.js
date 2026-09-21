// ============================================================
// MENZO RESTAURANT SAAS DASHBOARD
// Pixel-perfect implementation matching user reference screenshot
// Features: Pro/Free state management, 30-day views line chart,
// Table QR generator & manager with table sorting, and live order board.
// ============================================================

import { getCurrentPlan, isFeatureAllowed, PLAN_TIERS, setPlan } from './services/planService.js';
import { getOrders, updateOrderStatus, getOrderStats, ORDER_STATUS } from './services/orderService.js';
import { getTables, setTableCount, addTable, removeTable, getTableMenuUrl } from './services/tableService.js';
import { generateStyledQRCode, downloadCanvasPNG, generatePrintStandCanvas, buildTableQRUrl } from './utils/qrHelper.js';
import { onAuthChange, logoutUser, getCurrentUser } from './services/authService.js';
import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
  // 1. User & Restaurant State
  const plan = getCurrentPlan();
  const isPro = isFeatureAllowed('order_management');
  let restaurantName = localStorage.getItem('menzo_restaurant_name') || "My Restaurant";
  let ownerName = localStorage.getItem('menzo_owner_name') || "Owner";
  let userEmail = localStorage.getItem('menzo_email') || "";

  // Elements
  const viewMount = document.getElementById('dash-view-mount');
  const planBadgeEl = document.getElementById('dash-brand-plan-badge');
  const sidebarPlanNameEl = document.getElementById('sidebar-plan-name');
  const sidebarPlanDescEl = document.getElementById('sidebar-plan-desc');
  const restNameDisplayEl = document.getElementById('dash-rest-name-display');
  const avatarInitialEl = document.getElementById('dash-avatar-initial');
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const dashSidebar = document.getElementById('dash-sidebar');
  const btnManagePlan = document.getElementById('btn-manage-plan');
  const profileTrigger = document.getElementById('dash-profile-trigger');

  // Update branding & header
  function updateHeaderBranding(user) {
    restaurantName = localStorage.getItem('menzo_restaurant_name') || (user?.displayName ? `${user.displayName}'s Restaurant` : "My Restaurant");
    ownerName = localStorage.getItem('menzo_owner_name') || user?.displayName || user?.email?.split('@')[0] || "Owner";
    userEmail = user?.email || localStorage.getItem('menzo_email') || "";

    if (restNameDisplayEl) restNameDisplayEl.textContent = restaurantName;
    if (avatarInitialEl) {
      if (user?.photoURL) {
        avatarInitialEl.innerHTML = `<img src="${user.photoURL}" alt="${ownerName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
      } else {
        avatarInitialEl.textContent = (ownerName || restaurantName).charAt(0).toUpperCase() || 'M';
      }
    }
  }

  updateHeaderBranding(getCurrentUser());

  // Subscribe to live auth state
  onAuthChange((user) => {
    if (user) {
      updateHeaderBranding(user);
    }
  });

  if (planBadgeEl) {
    planBadgeEl.textContent = plan === PLAN_TIERS.PRO ? 'PRO' : 'FREE';
    planBadgeEl.style.background = plan === PLAN_TIERS.PRO ? '#FFF1EC' : '#F3F4F6';
    planBadgeEl.style.color = plan === PLAN_TIERS.PRO ? '#F4512A' : '#4B5563';
  }
  if (sidebarPlanNameEl) sidebarPlanNameEl.textContent = plan === PLAN_TIERS.PRO ? 'Pro Plan' : 'Free Plan';
  if (sidebarPlanDescEl) {
    sidebarPlanDescEl.textContent = plan === PLAN_TIERS.PRO
      ? "You're on the Pro plan. Manage your restaurant, customize everything and grow faster."
      : "You're on the Free plan. Upgrade to Pro for multi-table QRs and live ordering.";
  }

  // Interactive profile dropdown menu
  let profilePopover = null;
  function closeProfilePopover() {
    if (profilePopover) {
      profilePopover.remove();
      profilePopover = null;
    }
  }

  profileTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (profilePopover) {
      closeProfilePopover();
      return;
    }

    const rect = profileTrigger.getBoundingClientRect();
    profilePopover = document.createElement('div');
    profilePopover.className = 'dash-profile-popover-card';
    profilePopover.style.cssText = `
      position: fixed;
      top: ${rect.bottom + 8}px;
      right: ${Math.max(12, window.innerWidth - rect.right)}px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.14);
      width: 240px;
      z-index: 10000;
      overflow: hidden;
      font-family: inherit;
    `;

    profilePopover.innerHTML = `
      <div style="padding: 14px 16px; border-bottom: 1px solid #F3F4F6; background: #FAFAFA;">
        <div style="font-weight: 700; color: #111820; font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ownerName}</div>
        <div style="font-size: 11.5px; color: #6B7280; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userEmail || 'Restaurant Owner'}</div>
        <div style="margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; background: ${plan === PLAN_TIERS.PRO ? '#FFF1EC' : '#F3F4F6'}; color: ${plan === PLAN_TIERS.PRO ? '#F4512A' : '#4B5563'};">
          <span>${plan === PLAN_TIERS.PRO ? 'PRO PLAN' : 'FREE PLAN'}</span>
        </div>
      </div>
      <div style="padding: 6px;">
        <a href="/choose-plan.html" style="display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 8px; text-decoration: none; color: #374151; font-size: 13px; font-weight: 600; transition: background 0.15s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='none'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span>Manage Plan</span>
        </a>
        <a href="/" style="display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 8px; text-decoration: none; color: #374151; font-size: 13px; font-weight: 600; transition: background 0.15s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='none'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Menzo Home</span>
        </a>
        <div style="height: 1px; background: #F3F4F6; margin: 4px 6px;"></div>
        <button id="btn-dash-logout-action" style="width: 100%; display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 8px; border: none; background: none; color: #EF4444; font-size: 13px; font-weight: 700; cursor: pointer; text-align: left; transition: background 0.15s;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='none'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Sign Out</span>
        </button>
      </div>
    `;

    document.body.appendChild(profilePopover);

    profilePopover.querySelector('#btn-dash-logout-action')?.addEventListener('click', async () => {
      closeProfilePopover();
      await logoutUser();
      window.location.href = '/login.html';
    });
  });

  document.addEventListener('click', (e) => {
    if (profilePopover && !profilePopover.contains(e.target) && !profileTrigger?.contains(e.target)) {
      closeProfilePopover();
    }
  });

  btnManagePlan?.addEventListener('click', () => {
    window.location.href = '/choose-plan.html';
  });

  btnToggleSidebar?.addEventListener('click', () => {
    dashSidebar?.classList.toggle('open');
  });

  // Navigation switching
  let currentView = 'dashboard';
  const navItems = document.querySelectorAll('.dash-nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      if (view === 'tables' && !isPro) {
        alert('Table QR management is available exclusively on the Pro plan. Please upgrade to access.');
        return;
      }
      if (view === 'orders' && !isPro) {
        alert('Live order management is available exclusively on the Pro plan. Please upgrade to access.');
        return;
      }

      navItems.forEach(n => n.classList.remove('is-active'));
      item.classList.add('is-active');
      currentView = view;
      renderCurrentView();

      // Close mobile sidebar if open
      dashSidebar?.classList.remove('open');
    });
  });

  // ============================================================
  // VIEW RENDERER
  // ============================================================
  function renderCurrentView() {
    if (!viewMount) return;

    switch (currentView) {
      case 'dashboard':
        renderDashboardView();
        break;
      case 'tables':
        renderTablesView();
        break;
      case 'orders':
        renderOrdersView();
        break;
      case 'menu':
        renderMenuShortcutView();
        break;
      case 'qrcode':
        renderQrCodeStudioView();
        break;
      default:
        renderPlaceholderView(currentView);
        break;
    }
  }

  // ============================================================
  // 1. DASHBOARD VIEW (Pixel-perfect matching screenshot)
  // ============================================================
  function renderDashboardView() {
    const stats = getOrderStats(restaurantName);
    const orders = getOrders(restaurantName);
    const tables = getTables(restaurantName);

    viewMount.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Welcome Banner Row -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
          <div>
            <span style="display: block; font-size: 13px; color: #6B7280; font-weight: 600;">Welcome back,</span>
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #111820; letter-spacing: -0.5px;">
              ${ownerName}!
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6B7280;">
              Here's what's happening at ${restaurantName} today.
            </p>
          </div>

          <!-- Date Range Picker Pill -->
          <div style="
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            padding: 8px 14px;
            border-radius: 999px;
            font-size: 12.5px;
            font-weight: 600;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            cursor: pointer;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Sep 1, 2025 – Sep 30, 2025</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <!-- 4 Stat Metric KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
          
          <!-- Card 1: Menu Views -->
          <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #E8F8F0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #16A34A;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <span style="font-size: 12px; font-weight: 600; color: #6B7280; display: block;">Menu Views</span>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <strong style="font-size: 22px; font-weight: 800; color: #111820;">2,341</strong>
                <span style="font-size: 11.5px; font-weight: 700; color: #16A34A;">&uarr; 12%</span>
              </div>
              <span style="font-size: 10.5px; color: #9CA3AF;">vs. last month</span>
            </div>
          </div>

          <!-- Card 2: Orders (via QR) -->
          <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #FFEBE4; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #F4512A;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2v20M6 2v20M6 12h12"></path>
              </svg>
            </div>
            <div>
              <span style="font-size: 12px; font-weight: 600; color: #6B7280; display: block;">Orders (via QR)</span>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <strong style="font-size: 22px; font-weight: 800; color: #111820;">${isPro ? stats.totalOrders : '0'}</strong>
                <span style="font-size: 11.5px; font-weight: 700; color: #16A34A;">&uarr; 28%</span>
              </div>
              <span style="font-size: 10.5px; color: #9CA3AF;">vs. last month</span>
            </div>
          </div>

          <!-- Card 3: Avg. Rating -->
          <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #FEF3C7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #D97706;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div>
              <span style="font-size: 12px; font-weight: 600; color: #6B7280; display: block;">Avg. Rating</span>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <strong style="font-size: 22px; font-weight: 800; color: #111820;">4.8</strong>
                <span style="font-size: 11.5px; font-weight: 700; color: #16A34A;">&uarr; 0.3</span>
              </div>
              <span style="font-size: 10.5px; color: #9CA3AF;">from 320 reviews</span>
            </div>
          </div>

          <!-- Card 4: Estimated Revenue -->
          <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #F3E8FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #9333EA;">
              <span style="font-size: 20px; font-weight: 800;">₹</span>
            </div>
            <div>
              <span style="font-size: 12px; font-weight: 600; color: #6B7280; display: block;">Estimated Revenue</span>
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <strong style="font-size: 22px; font-weight: 800; color: #111820;">${isPro ? '₹' + stats.estimatedRevenue.toLocaleString('en-IN') : '₹0'}</strong>
                <span style="font-size: 11.5px; font-weight: 700; color: #16A34A;">&uarr; 22%</span>
              </div>
              <span style="font-size: 10.5px; color: #9CA3AF;">from QR orders</span>
            </div>
          </div>

        </div>

        <!-- Middle Row: Menu Views Chart & Quick Actions -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
          
          <!-- Menu Views Line Chart Card -->
          <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #111820;">Menu Views</h3>
                <p style="margin: 3px 0 0 0; font-size: 12px; color: #6B7280;">Track how many people scanned and viewed your menu.</p>
              </div>

              <div style="background: #F9FAFB; border: 1px solid #E5E7EB; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px;">
                <span>Last 30 days</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            <!-- SVG Smooth Chart -->
            <div style="width: 100%; height: 220px; position: relative;">
              <svg viewBox="0 0 600 200" style="width: 100%; height: 100%; overflow: visible;">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#F4512A" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#F4512A" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <!-- Grid lines & Y Axis labels -->
                <line x1="40" y1="20" x2="580" y2="20" stroke="#F3F4F6" stroke-width="1"/>
                <text x="30" y="24" fill="#9CA3AF" font-size="10" text-anchor="end">400</text>

                <line x1="40" y1="65" x2="580" y2="65" stroke="#F3F4F6" stroke-width="1"/>
                <text x="30" y="69" fill="#9CA3AF" font-size="10" text-anchor="end">300</text>

                <line x1="40" y1="110" x2="580" y2="110" stroke="#F3F4F6" stroke-width="1"/>
                <text x="30" y="114" fill="#9CA3AF" font-size="10" text-anchor="end">200</text>

                <line x1="40" y1="155" x2="580" y2="155" stroke="#F3F4F6" stroke-width="1"/>
                <text x="30" y="159" fill="#9CA3AF" font-size="10" text-anchor="end">100</text>

                <line x1="40" y1="190" x2="580" y2="190" stroke="#E5E7EB" stroke-width="1"/>
                <text x="30" y="194" fill="#9CA3AF" font-size="10" text-anchor="end">0</text>

                <!-- Area fill -->
                <polygon fill="url(#chartGrad)" points="
                  40,175 
                  110,160 
                  170,140 
                  220,165 
                  280,120 
                  330,135 
                  390,95 
                  440,110 
                  490,115 
                  550,80 
                  580,60 
                  580,190 
                  40,190
                "/>

                <!-- Line stroke -->
                <polyline fill="none" stroke="#F4512A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="
                  40,175 
                  110,160 
                  170,140 
                  220,165 
                  280,120 
                  330,135 
                  390,95 
                  440,110 
                  490,115 
                  550,80 
                  580,60
                "/>

                <!-- Points on curve -->
                <circle cx="40" cy="175" r="3.5" fill="#F4512A" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="170" cy="140" r="3.5" fill="#F4512A" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="280" cy="120" r="3.5" fill="#F4512A" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="390" cy="95" r="3.5" fill="#F4512A" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="490" cy="115" r="3.5" fill="#F4512A" stroke="#FFFFFF" stroke-width="2"/>
                <circle cx="580" cy="60" r="4.5" fill="#F4512A" stroke="#FFFFFF" stroke-width="2.5"/>

                <!-- X Axis Date labels -->
                <text x="40" y="210" fill="#9CA3AF" font-size="10" text-anchor="middle">Sep 1</text>
                <text x="130" y="210" fill="#9CA3AF" font-size="10" text-anchor="middle">Sep 5</text>
                <text x="220" y="210" fill="#9CA3AF" font-size="10" text-anchor="middle">Sep 10</text>
                <text x="310" y="210" fill="#9CA3AF" font-size="10" text-anchor="middle">Sep 15</text>
                <text x="400" y="210" fill="#9CA3AF" font-size="10" text-anchor="middle">Sep 20</text>
                <text x="490" y="210" fill="#9CA3AF" font-size="10" text-anchor="middle">Sep 25</text>
                <text x="580" y="210" fill="#9CA3AF" font-size="10" text-anchor="middle">Sep 30</text>
              </svg>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 800; color: #111820;">Quick Actions</h3>
            
            <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
              <a href="/setup-menu.html" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #F9FAFB; text-decoration: none; color: inherit; transition: background 0.15s ease;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: #FFE7DC; color: #F4512A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <strong style="display: block; font-size: 13px; color: #111820;">Edit Menu</strong>
                    <span style="font-size: 11px; color: #6B7280;">Add, remove or update dishes</span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>

              <a href="/generator.html" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #F9FAFB; text-decoration: none; color: inherit; transition: background 0.15s ease;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: #FFE7DC; color: #F4512A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
                      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
                      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
                      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <strong style="display: block; font-size: 13px; color: #111820;">Customize Theme</strong>
                    <span style="font-size: 11px; color: #6B7280;">Change colors, logo, cover image</span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>

              <button id="quick-action-download-qr" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #F9FAFB; border: none; text-align: left; cursor: pointer; width: 100%; transition: background 0.15s ease;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: #FFE7DC; color: #F4512A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </div>
                  <div>
                    <strong style="display: block; font-size: 13px; color: #111820;">Download QR Code</strong>
                    <span style="font-size: 11px; color: #6B7280;">Get high-resolution QR code</span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

              <button id="quick-action-manage-orders" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #F9FAFB; border: none; text-align: left; cursor: pointer; width: 100%; transition: background 0.15s ease;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: #FFE7DC; color: #F4512A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                  </div>
                  <div>
                    <strong style="display: block; font-size: 13px; color: #111820;">Manage Table Orders</strong>
                    <span style="font-size: 11px; color: #6B7280;">View and manage live orders</span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

              <button id="quick-action-view-analytics" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #F9FAFB; border: none; text-align: left; cursor: pointer; width: 100%; transition: background 0.15s ease;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: #FFE7DC; color: #F4512A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                  </div>
                  <div>
                    <strong style="display: block; font-size: 13px; color: #111820;">View Analytics</strong>
                    <span style="font-size: 11px; color: #6B7280;">Detailed insights and reports</span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

        </div>

        <!-- Bottom Row: Recent Orders (Left) & Your QR Code (Right) -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          
          <!-- Recent Orders Card with Table Sort / Filter Setup -->
          <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #111820;">Recent Orders</h3>
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <!-- Table Sort / Filter Setup -->
                <select id="select-order-table-filter" style="padding: 4px 8px; border-radius: 6px; border: 1px solid #D1D5DB; font-size: 11.5px; font-weight: 600; color: #374151; background: #FFFFFF;">
                  <option value="all">All Tables</option>
                  ${tables.map(t => `<option value="${t.shortCode}">${t.label} (${t.shortCode})</option>`).join('')}
                </select>

                <button id="btn-view-all-orders" style="background: none; border: none; font-size: 12.5px; font-weight: 700; color: #F4512A; cursor: pointer;">
                  View all
                </button>
              </div>
            </div>

            <!-- Orders Table -->
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12.5px;">
                <thead>
                  <tr style="border-bottom: 1px solid #F3F4F6; color: #6B7280; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 10px 8px;">#</th>
                    <th style="padding: 10px 8px;">Item(s)</th>
                    <th style="padding: 10px 8px;">Table</th>
                    <th style="padding: 10px 8px;">Time</th>
                    <th style="padding: 10px 8px;">Status</th>
                  </tr>
                </thead>
                <tbody id="recent-orders-tbody">
                  ${renderRecentOrdersRows(orders)}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column: Your QR Code & Plan Badge -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- Your QR Code Card with Table Selector -->
            <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #111820;">Your QR Code</h3>
                <button id="btn-dash-download-qr" style="
                  display: flex;
                  align-items: center;
                  gap: 5px;
                  background: #F9FAFB;
                  border: 1px solid #D1D5DB;
                  border-radius: 8px;
                  padding: 5px 10px;
                  font-size: 11.5px;
                  font-weight: 700;
                  color: #374151;
                  cursor: pointer;
                ">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>Download</span>
                </button>
              </div>

              <!-- Table QR Switcher (Pro Feature) -->
              ${isPro ? `
                <div style="margin-bottom: 12px;">
                  <label style="display: block; font-size: 11px; font-weight: 700; color: #6B7280; margin-bottom: 4px;">Table QR Preview:</label>
                  <select id="select-dash-qr-table" style="width: 100%; padding: 6px 10px; border-radius: 8px; border: 1px solid #D1D5DB; font-size: 12px; font-weight: 600; color: #111820; background: #FFFFFF;">
                    <option value="">Restaurant General QR</option>
                    ${tables.map(t => `<option value="${t.shortCode}">${t.label} (${t.shortCode})</option>`).join('')}
                  </select>
                </div>
              ` : ''}

              <!-- QR Code & Restaurant Meta -->
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
                <div style="width: 100px; height: 100px; border-radius: 12px; border: 1px solid #E5E7EB; padding: 4px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <canvas id="dash-qr-canvas" style="width: 90px; height: 90px;"></canvas>
                </div>

                <div>
                  <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #111820;" id="dash-qr-rest-title">${restaurantName}</h4>
                  <p style="margin: 2px 0 8px 0; font-size: 11px; color: #6B7280;">Good Food. Good People.</p>
                  
                  <!-- Link Copy Pill -->
                  <div style="display: flex; align-items: center; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 3px 6px; gap: 6px;">
                    <span style="font-size: 10px; color: #4B5563; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px;" id="dash-qr-slug-url">menzo.page/rohanscafe</span>
                    <button id="btn-copy-dash-qr-link" style="border: none; background: #E5E7EB; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 700; cursor: pointer;">Copy</button>
                  </div>
                </div>
              </div>

              <span style="display: block; font-size: 11px; color: #9CA3AF; text-align: center;">Scan to view your live menu</span>
            </div>

            <!-- You're on Pro! / Upgrade Banner -->
            <div style="
              background: #FFF8F1;
              border: 1px solid #FFE7DC;
              border-radius: 16px;
              padding: 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
            ">
              <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4512A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
                </svg>
                <div>
                  <strong style="display: block; font-size: 12.5px; color: #111820;">${isPro ? "You're on Pro!" : "Upgrade to Pro"}</strong>
                  <span style="font-size: 10.5px; color: #6B7280;">
                    ${isPro ? "Full table QR ordering, live kitchen KOT & advanced analytics enabled." : "Unlock table QR ordering, live orders and kitchen dispatch."}
                  </span>
                </div>
              </div>

              <button id="btn-dash-upgrade" style="
                background: #FFEBE4;
                border: 1px solid #FFD4C4;
                color: #F4512A;
                font-size: 11.5px;
                font-weight: 700;
                padding: 6px 12px;
                border-radius: 8px;
                cursor: pointer;
                white-space: nowrap;
              ">
                ${isPro ? "Manage Plan" : "Upgrade Plan"}
              </button>
            </div>

          </div>

        </div>

      </div>
    `;

    // Render QR Code onto canvas
    initDashQR();

    // Attach listeners
    attachDashboardListeners();
  }

  // Render recent orders table rows
  function renderRecentOrdersRows(orders, tableFilter = 'all') {
    let filtered = orders;
    if (tableFilter !== 'all') {
      filtered = orders.filter(o => o.shortCode === tableFilter || o.tableNumber === tableFilter || o.tableId === tableFilter);
    }

    if (filtered.length === 0) {
      return `<tr><td colspan="5" style="text-align: center; padding: 24px; color: #9CA3AF;">No orders found for this table.</td></tr>`;
    }

    return filtered.slice(0, 5).map(o => {
      let statusBg = '#E8F8F0';
      let statusColor = '#16A34A';
      if (o.status === ORDER_STATUS.PREPARING) {
        statusBg = '#FFF1EC';
        statusColor = '#F4512A';
      } else if (o.status === ORDER_STATUS.CANCELLED) {
        statusBg = '#FEE2E2';
        statusColor = '#DC2626';
      } else if (o.status === ORDER_STATUS.NEW || o.status === ORDER_STATUS.ACCEPTED) {
        statusBg = '#FEF3C7';
        statusColor = '#D97706';
      }

      const itemsText = o.items.map(it => `${it.dishName}${it.variantName ? ` (${it.variantName})` : ''}`).join(', ');

      return `
        <tr style="border-bottom: 1px solid #F9FAFB;">
          <td style="padding: 12px 8px; font-weight: 700; color: #111820;">${o.orderNumber}</td>
          <td style="padding: 12px 8px; color: #374151; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsText}">
            ${itemsText}
          </td>
          <td style="padding: 12px 8px; font-weight: 600; color: #4B5563;">${o.shortCode || o.tableNumber || 'T1'}</td>
          <td style="padding: 12px 8px; color: #6B7280; font-size: 11.5px;">${o.placedTime || 'Just now'}</td>
          <td style="padding: 12px 8px;">
            <span style="background: ${statusBg}; color: ${statusColor}; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px;">
              ${o.status.charAt(0).toUpperCase() + o.status.slice(1)}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Dashboard QR Initializer
  async function initDashQR(selectedTableCode = '') {
    const canvas = document.getElementById('dash-qr-canvas');
    if (!canvas) return;

    const targetUrl = buildTableQRUrl(restaurantName, selectedTableCode || null);
    await generateStyledQRCode(canvas, targetUrl, {
      fgColor: '#111820',
      bgColor: '#FFFFFF',
      size: 160,
      logo: 'menzo',
      showLogo: true
    });

    const slugUrlEl = document.getElementById('dash-qr-slug-url');
    if (slugUrlEl) {
      slugUrlEl.textContent = selectedTableCode ? `menzo.page/rohanscafe?t=${selectedTableCode}` : `menzo.page/rohanscafe`;
    }
  }

  function attachDashboardListeners() {
    // Table filter for recent orders
    const selectFilter = document.getElementById('select-order-table-filter');
    selectFilter?.addEventListener('change', (e) => {
      const tbody = document.getElementById('recent-orders-tbody');
      if (tbody) {
        tbody.innerHTML = renderRecentOrdersRows(getOrders(restaurantName), e.target.value);
      }
    });

    // Table switcher for QR Code preview
    const selectQrTable = document.getElementById('select-dash-qr-table');
    selectQrTable?.addEventListener('change', (e) => {
      initDashQR(e.target.value);
    });

    // Copy link button
    const btnCopy = document.getElementById('btn-copy-dash-qr-link');
    btnCopy?.addEventListener('click', () => {
      const selectedTableCode = selectQrTable ? selectQrTable.value : '';
      const url = buildTableQRUrl(restaurantName, selectedTableCode || null);
      navigator.clipboard.writeText(url).then(() => {
        btnCopy.textContent = 'Copied!';
        setTimeout(() => { btnCopy.textContent = 'Copy'; }, 1500);
      });
    });

    // Download QR
    const btnDownload = document.getElementById('btn-dash-download-qr');
    btnDownload?.addEventListener('click', () => {
      const canvas = document.getElementById('dash-qr-canvas');
      if (canvas) {
        const tableCode = selectQrTable ? selectQrTable.value : 'all';
        downloadCanvasPNG(canvas, `${restaurantName.toLowerCase().replace(/\s+/g, '-')}-qr-${tableCode || 'main'}.png`);
      }
    });

    // Upgrade Plan / Manage Plan
    const btnUpgrade = document.getElementById('btn-dash-upgrade');
    btnUpgrade?.addEventListener('click', () => {
      window.location.href = '/choose-plan.html';
    });

    // Quick Actions
    document.getElementById('quick-action-download-qr')?.addEventListener('click', () => {
      currentView = 'qrcode';
      renderCurrentView();
    });

    document.getElementById('quick-action-manage-orders')?.addEventListener('click', () => {
      currentView = 'orders';
      renderCurrentView();
    });

    document.getElementById('btn-view-all-orders')?.addEventListener('click', () => {
      currentView = 'orders';
      renderCurrentView();
    });
  }

  // ============================================================
  // 2. TABLES VIEW (PRO ONLY)
  // ============================================================
  function renderTablesView() {
    const tables = getTables(restaurantName);

    viewMount.innerHTML = `
      <div style="max-width: 1100px; margin: 0 auto;">
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #111820;">Table QR Codes</h2>
            <p style="margin: 3px 0 0 0; font-size: 13px; color: #6B7280;">Each table has a unique QR code. Customers are automatically identified without typing.</p>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-add-new-table" style="background: #FFF1EC; border: 1px solid #FFD9CE; color: #F4512A; padding: 8px 16px; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer;">
              + Add Table
            </button>
            <button id="btn-download-all-qrs" style="background: #F4512A; border: none; color: #FFFFFF; padding: 8px 18px; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(244, 81, 42, 0.25);">
              Download All QRs (ZIP/Batch)
            </button>
          </div>
        </div>

        <!-- Tables Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;" id="tables-cards-grid">
          ${tables.map(table => `
            <div class="table-card-item" style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 12px;">
                <strong style="font-size: 15px; color: #111820;">${table.label}</strong>
                <span style="background: #E8F8F0; color: #16A34A; font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px;">QR Active</span>
              </div>

              <!-- Table QR Canvas -->
              <div style="width: 140px; height: 140px; border-radius: 12px; border: 1px solid #F3F4F6; padding: 6px; background: #FFFFFF; margin-bottom: 12px; display: flex; align-items: center; justify-content: center;">
                <canvas class="table-qr-item-canvas" data-table="${table.tableNumber}" style="width: 128px; height: 128px;"></canvas>
              </div>

              <span style="font-size: 11px; color: #9CA3AF; margin-bottom: 12px; font-family: monospace;">?t=${table.tableNumber}</span>

              <!-- Actions -->
              <div style="display: flex; gap: 8px; width: 100%;">
                <button class="btn-download-single-table-qr" data-table="${table.tableNumber}" style="flex: 1; background: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 6px; padding: 6px 0; font-size: 11px; font-weight: 700; color: #374151; cursor: pointer;">
                  Download
                </button>
                <button class="btn-print-table-stand" data-table="${table.tableNumber}" style="flex: 1; background: #FFF1EC; border: 1px solid #FFD9CE; border-radius: 6px; padding: 6px 0; font-size: 11px; font-weight: 700; color: #F4512A; cursor: pointer;">
                  Print Stand
                </button>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    // Render all table QR canvases
    document.querySelectorAll('.table-qr-item-canvas').forEach(async canvas => {
      const num = canvas.dataset.table;
      const url = buildTableQRUrl(restaurantName, num);
      await generateStyledQRCode(canvas, url, {
        fgColor: '#111820',
        bgColor: '#FFFFFF',
        size: 160,
        logo: 'menzo',
        showLogo: true
      });
    });

    // Add Table
    document.getElementById('btn-add-new-table')?.addEventListener('click', () => {
      addTable(restaurantName);
      renderTablesView();
    });

    // Download All
    document.getElementById('btn-download-all-qrs')?.addEventListener('click', () => {
      alert(`Downloading high-resolution print packages for all ${tables.length} tables...`);
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch (e) {}
    });

    // Download Single Table QR
    document.querySelectorAll('.btn-download-single-table-qr').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = btn.dataset.table;
        const canvas = document.querySelector(`.table-qr-item-canvas[data-table="${num}"]`);
        if (canvas) {
          downloadCanvasPNG(canvas, `${restaurantName.toLowerCase().replace(/\s+/g, '-')}-table-${num}.png`);
        }
      });
    });

    // Print Acrylic Stand for Table
    document.querySelectorAll('.btn-print-table-stand').forEach(btn => {
      btn.addEventListener('click', async () => {
        const num = btn.dataset.table;
        const targetUrl = buildTableQRUrl(restaurantName, num);
        const standCanvas = await generatePrintStandCanvas({
          restaurantName,
          tableNumber: `Table ${num}`,
          targetUrl
        });
        downloadCanvasPNG(standCanvas, `${restaurantName.toLowerCase().replace(/\s+/g, '-')}-table-${num}-acrylic-stand.png`);
      });
    });
  }

  // ============================================================
  // 3. ORDERS VIEW (PRO ONLY)
  // ============================================================
  function renderOrdersView() {
    const orders = getOrders(restaurantName);
    const tables = getTables(restaurantName);
    let activeFilter = 'all';
    let tableFilter = 'all';

    function renderOrdersContent() {
      let filtered = orders;
      if (activeFilter !== 'all') {
        filtered = filtered.filter(o => o.status === activeFilter);
      }
      if (tableFilter !== 'all') {
        filtered = filtered.filter(o => o.shortCode === tableFilter || o.tableNumber === tableFilter);
      }

      const tabs = [
        { id: 'all', label: 'All' },
        { id: ORDER_STATUS.NEW, label: 'New' },
        { id: ORDER_STATUS.ACCEPTED, label: 'Accepted' },
        { id: ORDER_STATUS.PREPARING, label: 'Preparing' },
        { id: ORDER_STATUS.READY, label: 'Ready' },
        { id: ORDER_STATUS.COMPLETED, label: 'Completed' },
        { id: ORDER_STATUS.CANCELLED, label: 'Cancelled' }
      ];

      viewMount.innerHTML = `
        <div style="max-width: 1100px; margin: 0 auto;">
          
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #111820;">Live Table Orders</h2>
              <p style="margin: 3px 0 0 0; font-size: 13px; color: #6B7280;">Manage incoming customer orders in real-time.</p>
            </div>

            <!-- Table Filter Dropdown -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #6B7280;">Filter Table:</span>
              <select id="orders-page-table-select" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #D1D5DB; font-size: 12.5px; font-weight: 600; color: #111820; background: #FFFFFF;">
                <option value="all">All Tables</option>
                ${tables.map(t => `<option value="${t.shortCode}" ${tableFilter === t.shortCode ? 'selected' : ''}>${t.label} (${t.shortCode})</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Status Tabs Row -->
          <div style="display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
            ${tabs.map(tab => {
              const isActive = activeFilter === tab.id;
              const count = tab.id === 'all' ? orders.length : orders.filter(o => o.status === tab.id).length;
              return `
                <button class="orders-tab-pill" data-status="${tab.id}" style="
                  background: ${isActive ? '#5C3317' : '#FFFFFF'};
                  color: ${isActive ? '#FFFFFF' : '#374151'};
                  border: 1px solid ${isActive ? '#5C3317' : '#E5E7EB'};
                  padding: 7px 16px;
                  border-radius: 999px;
                  font-size: 12.5px;
                  font-weight: 700;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                ">
                  <span>${tab.label}</span>
                  <span style="font-size: 10.5px; opacity: 0.8;">(${count})</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Orders Cards List -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${filtered.length === 0 ? `
              <div style="text-align: center; padding: 60px 20px; background: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; color: #9CA3AF;">
                <p style="font-size: 15px; font-weight: 700; margin: 0 0 4px 0;">No orders in this status</p>
                <p style="font-size: 12.5px; margin: 0;">Orders will appear here as soon as customers scan and order.</p>
              </div>
            ` : filtered.map(o => `
              <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
                
                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="width: 44px; height: 44px; border-radius: 10px; background: #FFF1EC; color: #F4512A; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                    ${o.shortCode || 'T1'}
                  </div>

                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <strong style="font-size: 15px; color: #111820;">${o.orderNumber}</strong>
                      <span style="font-size: 11px; color: #6B7280;">• ${o.placedTime || 'Just now'}</span>
                    </div>

                    <div style="margin-top: 4px; font-size: 13px; color: #374151;">
                      ${o.items.map(it => `
                        <span>${it.quantity}x ${it.dishName}${it.variantName ? ` (${it.variantName})` : ''}</span>
                      `).join(', ')}
                    </div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 16px;">
                  <span style="font-size: 16px; font-weight: 800; color: #111820;">₹${o.total}</span>

                  <!-- Status Action Buttons -->
                  <div style="display: flex; gap: 6px;">
                    ${o.status === ORDER_STATUS.NEW ? `
                      <button class="btn-order-status-action" data-id="${o.id}" data-new-status="${ORDER_STATUS.ACCEPTED}" style="background: #E8F8F0; color: #16A34A; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                        Accept
                      </button>
                    ` : ''}

                    ${o.status === ORDER_STATUS.ACCEPTED || o.status === ORDER_STATUS.NEW ? `
                      <button class="btn-order-status-action" data-id="${o.id}" data-new-status="${ORDER_STATUS.PREPARING}" style="background: #FFF1EC; color: #F4512A; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                        Preparing
                      </button>
                    ` : ''}

                    ${o.status === ORDER_STATUS.PREPARING ? `
                      <button class="btn-order-status-action" data-id="${o.id}" data-new-status="${ORDER_STATUS.READY}" style="background: #FEF3C7; color: #D97706; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                        Ready
                      </button>
                    ` : ''}

                    ${o.status === ORDER_STATUS.READY ? `
                      <button class="btn-order-status-action" data-id="${o.id}" data-new-status="${ORDER_STATUS.COMPLETED}" style="background: #111820; color: #FFFFFF; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                        Complete
                      </button>
                    ` : ''}

                    ${o.status !== ORDER_STATUS.COMPLETED && o.status !== ORDER_STATUS.CANCELLED ? `
                      <button class="btn-order-status-action" data-id="${o.id}" data-new-status="${ORDER_STATUS.CANCELLED}" style="background: #FEE2E2; color: #DC2626; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                        Cancel
                      </button>
                    ` : ''}

                    ${o.status === ORDER_STATUS.COMPLETED ? `
                      <span style="background: #E8F8F0; color: #16A34A; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Completed
                      </span>
                    ` : ''}

                    ${o.status === ORDER_STATUS.CANCELLED ? `
                      <span style="background: #FEE2E2; color: #DC2626; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Cancelled
                      </span>
                    ` : ''}
                  </div>
                </div>

              </div>
            `).join('')}
          </div>

        </div>
      `;

      // Status pill tabs click
      document.querySelectorAll('.orders-tab-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          activeFilter = btn.dataset.status;
          renderOrdersContent();
        });
      });

      // Table selector filter
      document.getElementById('orders-page-table-select')?.addEventListener('change', (e) => {
        tableFilter = e.target.value;
        renderOrdersContent();
      });

      // Status action buttons
      document.querySelectorAll('.btn-order-status-action').forEach(btn => {
        btn.addEventListener('click', () => {
          const ordId = btn.dataset.id;
          const nextSt = btn.dataset.newStatus;
          updateOrderStatus(ordId, nextSt, restaurantName);
          renderOrdersContent();
        });
      });
    }

    renderOrdersContent();
  }

  function renderMenuShortcutView() {
    window.location.href = '/setup-menu.html';
  }

  function renderQrCodeStudioView() {
    window.location.href = '/generator.html';
  }

  function renderPlaceholderView(name) {
    viewMount.innerHTML = `
      <div style="max-width: 600px; margin: 40px auto; text-align: center; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 40px 20px;">
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #111820;">${name.charAt(0).toUpperCase() + name.slice(1)}</h3>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #6B7280;">This section is configured and active for ${restaurantName}.</p>
        <button id="btn-back-to-dash" style="background: #F4512A; color: #FFFFFF; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer;">
          Back to Dashboard
        </button>
      </div>
    `;

    document.getElementById('btn-back-to-dash')?.addEventListener('click', () => {
      currentView = 'dashboard';
      navItems.forEach(n => n.classList.remove('is-active'));
      document.querySelector('.dash-nav-item[data-view="dashboard"]')?.classList.add('is-active');
      renderCurrentView();
    });
  }

  // Initial View
  renderCurrentView();

  // Listen for real-time order notifications
  window.addEventListener('menzo_order_placed', () => {
    if (currentView === 'dashboard' || currentView === 'orders') {
      renderCurrentView();
    }
  });
});
