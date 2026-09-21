// ============================================================
// MENZO LIVE ORDERS DASHBOARD COMPONENT
// Renders the real-time KOT order management board for Pro,
// Kitchen Display System (KDS) for Business, and upgrade CTA for Free.
// ============================================================

import {
  getCurrentPlan,
  getCurrentPlanConfig,
  getLiveOrders,
  updateOrderStatus,
  ORDER_STATUS,
  PLAN_TIERS,
  setPlan,
  playOrderChime
} from '../services/planService.js';
import confetti from 'canvas-confetti';

export function initOrdersDashboard(mountEl, options = {}) {
  if (!mountEl) return;

  let activeFilter = 'all'; // 'all', 'new', 'preparing', 'ready', 'completed'
  let stationFilter = 'all'; // 'all', 'kitchen', 'bar'
  let soundEnabled = true;

  function render() {
    const plan = getCurrentPlan();
    const planConfig = getCurrentPlanConfig();
    const orders = getLiveOrders();

    // 1. FREE TIER: Preview & Upgrade Card
    if (plan === PLAN_TIERS.FREE) {
      mountEl.innerHTML = `
        <div style="padding: 24px 16px; max-width: 600px; margin: 0 auto; text-align: center;">
          <div style="
            width: 64px;
            height: 64px;
            border-radius: 20px;
            background: #FFE8E0;
            color: #F4512A;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
            box-shadow: 0 8px 24px rgba(244, 81, 42, 0.2);
          ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>

          <div style="display: inline-block; background: #FFE8E0; color: #F4512A; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 999px; margin-bottom: 12px; text-transform: uppercase;">
            Available on Pro &amp; Business
          </div>

          <h3 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px;">Live Table Order Management</h3>
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 24px;">
            Allow guests to order directly from their table QR code. Orders stream straight to your kitchen with real-time audio chimes and status tracking.
          </p>

          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px; text-align: left; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span style="font-size: 13.5px; color: var(--text-primary);"><strong>Table-Wise Carts:</strong> Guests add dishes with cooking notes (*"extra spicy"*).</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span style="font-size: 13.5px; color: var(--text-primary);"><strong>Instant Audio Bell:</strong> Alerts staff immediately when an order is placed.</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span style="font-size: 13.5px; color: var(--text-primary);"><strong>Kitchen Order Ticket (KOT):</strong> Track <em>New</em> &rarr; <em>Preparing</em> &rarr; <em>Served</em>.</span>
            </div>
          </div>

          <button type="button" class="btn btn-primary" id="btn-upgrade-pro-orders" style="width: 100%; height: 46px; font-size: 15px; font-weight: 700; border-radius: 12px; box-shadow: 0 6px 20px rgba(244, 81, 42, 0.35);">
            Upgrade to Pro (Start 14-Day Free Trial)
          </button>
        </div>
      `;

      mountEl.querySelector('#btn-upgrade-pro-orders')?.addEventListener('click', () => {
        try {
          confetti({ particleCount: 70, spread: 60 });
        } catch (e) {}
        setPlan(PLAN_TIERS.PRO, { isTrial: true });
        render();
      });
      return;
    }

    // 2. PRO & BUSINESS TIERS: Full Live Orders Dashboard
    const newCount = orders.filter(o => o.status === ORDER_STATUS.NEW).length;
    const prepCount = orders.filter(o => o.status === ORDER_STATUS.PREPARING).length;
    const readyCount = orders.filter(o => o.status === ORDER_STATUS.READY).length;
    const isBusiness = plan === PLAN_TIERS.BUSINESS;

    // Filtered orders
    let displayedOrders = orders;
    if (activeFilter !== 'all') {
      displayedOrders = displayedOrders.filter(o => o.status === activeFilter);
    }
    if (isBusiness && stationFilter !== 'all') {
      displayedOrders = displayedOrders.filter(o => (o.station || 'Kitchen').toLowerCase() === stationFilter.toLowerCase());
    }

    mountEl.innerHTML = `
      <div class="orders-dashboard-wrapper" style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Header & Toolbar -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-size: 1.15rem; margin: 0; color: var(--text-primary);">Live Table Orders</h3>
              <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(34, 197, 94, 0.15); color: #22C55E; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #22C55E; box-shadow: 0 0 6px #22C55E;"></span>
                Live Sync
              </span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0;">
              Real-time kitchen order tickets placed from customer table QR codes
            </p>
          </div>

            <button type="button" class="btn btn-secondary btn-sm" id="btn-toggle-sound" title="Toggle audio chime" style="font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
              ${soundEnabled ? `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>Sound On</span>
              ` : `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                </svg>
                <span>Sound Muted</span>
              `}
            </button>

            ${isBusiness ? `
              <button type="button" class="btn btn-primary btn-sm" id="btn-kds-fullscreen" style="background: #111820; font-size: 12px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <span>Fullscreen KDS</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Filter Chips Row -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px;">
            <button type="button" class="chip-btn ${activeFilter === 'all' ? 'active' : ''}" data-order-filter="all">
              All (${orders.length})
            </button>
            <button type="button" class="chip-btn ${activeFilter === 'new' ? 'active' : ''}" data-order-filter="new" style="${newCount > 0 ? 'border-color: #F4512A;' : ''}">
              New (${newCount})
            </button>
            <button type="button" class="chip-btn ${activeFilter === 'preparing' ? 'active' : ''}" data-order-filter="preparing">
              Preparing (${prepCount})
            </button>
            <button type="button" class="chip-btn ${activeFilter === 'ready' ? 'active' : ''}" data-order-filter="ready">
              Ready (${readyCount})
            </button>
            <button type="button" class="chip-btn ${activeFilter === 'completed' ? 'active' : ''}" data-order-filter="completed">
              Completed
            </button>
          </div>

          ${isBusiness ? `
            <!-- Station Filter for Business -->
            <div style="display: flex; gap: 4px; font-size: 12px; background: var(--bg-surface-elevated); padding: 3px; border-radius: 8px;">
              <button type="button" class="chip-btn ${stationFilter === 'all' ? 'active' : ''}" data-station="all" style="padding: 3px 8px; font-size: 11.5px;">All</button>
              <button type="button" class="chip-btn ${stationFilter === 'kitchen' ? 'active' : ''}" data-station="kitchen" style="padding: 3px 8px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 0-5 5c0 1.5.7 2.8 1.7 3.7A4.97 4.97 0 0 0 5 15v2h14v-2c0-1.8-1-3.4-2.7-4.3A5.02 5.02 0 0 0 17 7a5 5 0 0 0-5-5z"></path></svg>
                <span>Kitchen</span>
              </button>
              <button type="button" class="chip-btn ${stationFilter === 'bar' ? 'active' : ''}" data-station="bar" style="padding: 3px 8px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 3 12 13 12 21"></polygon><line x1="8" y1="21" x2="16" y2="21"></line></svg>
                <span>Bar</span>
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Orders Grid -->
        ${displayedOrders.length === 0 ? `
          <div style="text-align: center; padding: 48px 16px; background: var(--bg-surface-elevated); border-radius: 16px; border: 1px dashed var(--border-subtle);">
            <p style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px;">No orders in this view</p>
            <p style="font-size: 13px; color: var(--text-muted); margin: 0;">Scan the table QR code in Live Preview to place a test order!</p>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
            ${displayedOrders.map(order => renderOrderCard(order, isBusiness)).join('')}
          </div>
        `}

      </div>
    `;

    attachDashboardEvents();
  }

  function renderOrderCard(order, isBusiness) {
    const isNew = order.status === ORDER_STATUS.NEW;
    const isPrep = order.status === ORDER_STATUS.PREPARING;
    const isReady = order.status === ORDER_STATUS.READY;

    let statusColor = '#22C55E';
    let statusLabel = 'Completed';
    let badgeBg = 'rgba(34, 197, 94, 0.15)';

    if (isNew) {
      statusColor = '#EF4444';
      statusLabel = 'NEW ORDER';
      badgeBg = 'rgba(239, 68, 68, 0.15)';
    } else if (isPrep) {
      statusColor = '#F59E0B';
      statusLabel = 'PREPARING';
      badgeBg = 'rgba(245, 158, 11, 0.15)';
    } else if (isReady) {
      statusColor = '#3B82F6';
      statusLabel = 'READY TO SERVE';
      badgeBg = 'rgba(59, 130, 246, 0.15)';
    }

    return `
      <div class="live-order-card" data-order-id="${order.id}" style="
        background: var(--bg-surface);
        border: 1.5px solid ${isNew ? '#F4512A' : 'var(--border-subtle)'};
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: ${isNew ? '0 4px 16px rgba(244, 81, 42, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)'};
        position: relative;
      ">
        <!-- Top Row: Order # and Status -->
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <span style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${order.orderNumber}</span>
              <span style="font-size: 12px; color: var(--text-muted); margin-left: 6px;">${order.placedTime || 'Just now'}</span>
            </div>
            <span style="
              font-size: 10.5px;
              font-weight: 800;
              letter-spacing: 0.5px;
              color: ${statusColor};
              background: ${badgeBg};
              padding: 3px 8px;
              border-radius: 999px;
            ">
              ${statusLabel}
            </span>
          </div>

          <!-- Table Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-elevated); padding: 8px 10px; border-radius: 8px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">🪑</span>
              <strong style="font-size: 13.5px; color: var(--text-primary);">${order.tableNumber}</strong>
            </div>
            ${order.station ? `<span style="font-size: 11px; color: var(--text-muted);">${order.station}</span>` : ''}
          </div>

          <!-- Cooking Notes (If any) -->
          ${order.notes ? `
            <div style="background: #FEF3C7; border: 1px solid #FDE68A; color: #92400E; font-size: 12px; padding: 6px 10px; border-radius: 8px; margin-bottom: 12px;">
              <strong>Note:</strong> ${order.notes}
            </div>
          ` : ''}

          <!-- Items List -->
          <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            ${(order.items || []).map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px;">
                <div>
                  <span style="font-weight: 700; color: #F4512A; margin-right: 4px;">${item.qty}&times;</span>
                  <span style="color: var(--text-primary);">${item.name}</span>
                </div>
                <span style="color: var(--text-muted); font-size: 12px;">₹${(item.price * item.qty).toFixed(0)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 12px; color: var(--text-muted);">Total Bill</span>
            <strong style="font-size: 14px; color: var(--brand-primary);">₹${Number(order.totalAmount || 0).toFixed(0)}</strong>
          </div>

          <div style="display: flex; gap: 8px;">
            ${isNew ? `
              <button type="button" class="btn btn-primary btn-sm btn-advance-order" data-id="${order.id}" data-next="${ORDER_STATUS.PREPARING}" style="flex: 1; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                <span>Accept &amp; Cook</span>
              </button>
            ` : ''}

            ${isPrep ? `
              <button type="button" class="btn btn-primary btn-sm btn-advance-order" data-id="${order.id}" data-next="${ORDER_STATUS.READY}" style="flex: 1; background: #3B82F6; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                <span>Ready to Serve</span>
              </button>
            ` : ''}

            ${isReady ? `
              <button type="button" class="btn btn-primary btn-sm btn-advance-order" data-id="${order.id}" data-next="${ORDER_STATUS.COMPLETED}" style="flex: 1; background: #22C55E; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Mark Served</span>
              </button>
            ` : ''}

            <button type="button" class="btn btn-secondary btn-sm btn-print-kot" data-id="${order.id}" title="Print Kitchen Order Ticket" style="padding: 4px 8px; display: flex; align-items: center; justify-content: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachDashboardEvents() {
    // Sound toggle
    mountEl.querySelector('#btn-toggle-sound')?.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      render();
    });

    // Status filter chips
    mountEl.querySelectorAll('[data-order-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.orderFilter;
        render();
      });
    });

    // Station filter chips (Business)
    mountEl.querySelectorAll('[data-station]').forEach(btn => {
      btn.addEventListener('click', () => {
        stationFilter = btn.dataset.station;
        render();
      });
    });

    // Advance order status (New -> Preparing -> Ready -> Completed)
    mountEl.querySelectorAll('.btn-advance-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const next = btn.dataset.next;
        updateOrderStatus(id, next);
        render();
      });
    });

    // Print KOT
    mountEl.querySelectorAll('.btn-print-kot').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const orders = getLiveOrders();
        const ord = orders.find(o => o.id === id);
        if (ord) {
          window.print();
        }
      });
    });

    // Fullscreen KDS mode
    mountEl.querySelector('#btn-kds-fullscreen')?.addEventListener('click', () => {
      openKdsFullscreen();
    });
  }

  // Fullscreen KDS for Business
  function openKdsFullscreen() {
    const orders = getLiveOrders().filter(o => o.status !== ORDER_STATUS.COMPLETED);
    const kdsEl = document.createElement('div');
    kdsEl.id = 'kds-fullscreen-overlay';
    kdsEl.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0B0F17;
      color: #FFFFFF;
      z-index: 9999999;
      padding: 24px;
      overflow-y: auto;
      font-family: -apple-system, system-ui, sans-serif;
    `;

    kdsEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid #1F2937; padding-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #FFFFFF;">Kitchen Display System (KDS)</h1>
          <span style="background: #22C55E; color: #000; font-size: 12px; font-weight: 800; padding: 2px 10px; border-radius: 999px;">LIVE</span>
        </div>
        <button type="button" id="btn-close-kds" style="background: #374151; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;">
          Exit Fullscreen &times;
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px;">
        ${orders.map(o => `
          <div style="background: #111827; border: 2px solid ${o.status === 'new' ? '#EF4444' : '#F59E0B'}; border-radius: 16px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 20px; font-weight: 900; color: #FFFFFF;">${o.orderNumber}</span>
              <span style="font-size: 16px; font-weight: 800; color: #F59E0B;">${o.tableNumber}</span>
            </div>
            ${o.notes ? `<div style="background: #78350F; color: #FEF3C7; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 12px;">Note: ${o.notes}</div>` : ''}
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
              ${(o.items || []).map(i => `
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #F3F4F6;">
                  <span>${i.qty} &times; ${i.name}</span>
                </div>
              `).join('')}
            </div>
            <button type="button" class="btn-kds-bump" data-id="${o.id}" style="width: 100%; height: 44px; background: #22C55E; color: #000; font-size: 15px; font-weight: 800; border: none; border-radius: 10px; cursor: pointer;">
              BUMP TICKET
            </button>
          </div>
        `).join('')}
      </div>
    `;

    document.body.appendChild(kdsEl);

    kdsEl.querySelector('#btn-close-kds')?.addEventListener('click', () => {
      kdsEl.remove();
      render();
    });

    kdsEl.querySelectorAll('.btn-kds-bump').forEach(btn => {
      btn.addEventListener('click', () => {
        updateOrderStatus(btn.dataset.id, ORDER_STATUS.COMPLETED);
        btn.closest('div').style.opacity = '0.3';
        btn.textContent = 'BUMPED';
        btn.disabled = true;
      });
    });
  }

  // Listen for real-time order updates
  window.addEventListener('menzo_orders_updated', () => {
    if (soundEnabled) {
      playOrderChime();
    }
    render();
  });

  window.addEventListener('menzo_plan_changed', () => {
    render();
  });

  // Initial render
  render();

  return {
    refresh: render
  };
}
