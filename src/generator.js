import confetti from 'canvas-confetti';
import { loadRestaurantData, saveRestaurantData } from './data/defaultMenu.js';
import { renderCustomerMenu } from './components/renderCustomerMenu.js';
import { generateStyledQRCode, downloadCanvasPNG } from './utils/qrHelper.js';
import { onAuthChange, logoutUser } from './services/authService.js';
import { initOrdersDashboard } from './components/ordersDashboard.js';
import { getCurrentPlan, getCurrentPlanConfig, getLiveOrders, ORDER_STATUS, setPlan, PLAN_TIERS } from './services/planService.js';

document.addEventListener('DOMContentLoaded', () => {
  // Load initial data
  let restaurant = loadRestaurantData();

  // Wire User Auth Badge in Header
  const studioUserBadge = document.getElementById('studio-user-badge');
  const studioUserAvatar = document.getElementById('studio-user-avatar');
  const studioLogoutBtn = document.getElementById('studio-logout-btn');

  onAuthChange((user) => {
    if (user && studioUserBadge) {
      studioUserBadge.style.display = 'inline-flex';
      const name = user.displayName || localStorage.getItem('menzo_owner_name') || user.email || 'M';
      if (studioUserAvatar) {
        if (user.photoURL) {
          studioUserAvatar.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="${name}"/>`;
        } else {
          studioUserAvatar.textContent = name.charAt(0).toUpperCase();
        }
      }
    } else if (studioUserBadge) {
      studioUserBadge.style.display = 'none';
    }
  });

  studioLogoutBtn?.addEventListener('click', async () => {
    await logoutUser();
    window.location.href = '/get-started.html?mode=login';
  });

  // Check URL query param for restaurant name (e.g. ?name=...)
  const params = new URLSearchParams(window.location.search);
  if (params.has('name') && params.get('name').trim()) {
    restaurant.name = params.get('name').trim();
    saveRestaurantData(restaurant);
  }

  // Active category in editor
  let activeEditorCatId = restaurant.categories[0]?.id || "";

  // 1. Mount Live Customer Menu Simulator
  const phoneContainer = document.getElementById('simulator-phone-container');
  let menuController = null;
  if (phoneContainer) {
    menuController = renderCustomerMenu(phoneContainer, restaurant, {
      initialCart: [
        { itemId: restaurant.categories[0]?.items[0]?.id || "item-burger", qty: 1 }
      ]
    });
  }

  function syncAndSave() {
    saveRestaurantData(restaurant);
    if (menuController) {
      menuController.updateData(restaurant);
    }
    updateHeader();
    updateStudioQR();
  }

  // Plan Status Badge in Header
  function updatePlanHeaderBadge() {
    const badgeMount = document.getElementById('studio-plan-badge');
    if (!badgeMount) return;

    const plan = getCurrentPlan();

    if (plan === PLAN_TIERS.FREE) {
      badgeMount.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 4px; background: #374151; color: #E5E7EB; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700;">
          Free Plan
        </span>
        <button type="button" class="btn btn-primary" id="btn-upgrade-plan-pill" style="padding: 2px 8px; font-size: 11px; height: 22px; margin-left: 5px; border-radius: 6px; cursor: pointer;">
          Upgrade
        </button>
      `;
      badgeMount.querySelector('#btn-upgrade-plan-pill')?.addEventListener('click', () => {
        window.location.href = '/choose-plan.html';
      });
    } else if (plan === PLAN_TIERS.PRO) {
      badgeMount.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(244, 81, 42, 0.15); color: #F4512A; border: 1px solid rgba(244, 81, 42, 0.4); padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 800;">
          ⭐ Pro Member
        </span>
      `;
    } else if (plan === PLAN_TIERS.BUSINESS) {
      let branches = ['Main Outlet'];
      try {
        branches = JSON.parse(localStorage.getItem('menzo_registered_branches') || '["Main Outlet"]');
      } catch (e) {}

      badgeMount.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 4px; background: #111820; color: #60A5FA; border: 1px solid #3B82F6; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 800;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>
          <span>Business Enterprise</span>
        </span>
        <select id="select-active-branch" style="background: var(--bg-surface-elevated); color: var(--text-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 2px 6px; font-size: 11px; font-weight: 600; margin-left: 6px;">
          ${branches.map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
      `;

      badgeMount.querySelector('#select-active-branch')?.addEventListener('change', (e) => {
        localStorage.setItem('menzo_active_branch', e.target.value);
        window.dispatchEvent(new CustomEvent('menzo_orders_updated'));
      });
    }

    // Update order counter badge in tab
    const counterEl = document.getElementById('order-counter-badge');
    if (counterEl) {
      const activeOrders = getLiveOrders().filter(o => o.status !== ORDER_STATUS.COMPLETED);
      if (activeOrders.length > 0) {
        counterEl.style.display = 'inline-flex';
        counterEl.textContent = activeOrders.length;
      } else {
        counterEl.style.display = 'none';
      }
    }
  }

  updatePlanHeaderBadge();
  window.addEventListener('menzo_orders_updated', updatePlanHeaderBadge);
  window.addEventListener('menzo_plan_changed', updatePlanHeaderBadge);

  // 2. Header and Branding sync
  const headerName = document.getElementById('header-restaurant-name');
  const inputBrandName = document.getElementById('input-brand-name');
  const inputTagline = document.getElementById('input-brand-tagline');
  const selectCurrency = document.getElementById('select-currency');
  const inputTableNumber = document.getElementById('input-table-number');
  const inputWifi = document.getElementById('input-wifi');

  function updateHeader() {
    if (headerName) headerName.textContent = restaurant.name || "Menu QR Bistro";
  }

  function initBrandingFields() {
    updateHeader();
    if (inputBrandName) inputBrandName.value = restaurant.name || "";
    if (inputTagline) inputTagline.value = restaurant.tagline || "";
    if (selectCurrency) selectCurrency.value = restaurant.currency || "$";
    if (inputTableNumber) inputTableNumber.value = restaurant.tableNumber || "Table 01";
    if (inputWifi) inputWifi.value = restaurant.wifi || "";
  }

  initBrandingFields();

  if (inputBrandName) {
    inputBrandName.addEventListener('input', (e) => {
      restaurant.name = e.target.value;
      syncAndSave();
    });
  }

  if (inputTagline) {
    inputTagline.addEventListener('input', (e) => {
      restaurant.tagline = e.target.value;
      syncAndSave();
    });
  }

  if (selectCurrency) {
    selectCurrency.addEventListener('change', (e) => {
      restaurant.currency = e.target.value;
      syncAndSave();
    });
  }

  if (inputTableNumber) {
    inputTableNumber.addEventListener('input', (e) => {
      restaurant.tableNumber = e.target.value;
      syncAndSave();
    });
  }

  if (inputWifi) {
    inputWifi.addEventListener('input', (e) => {
      restaurant.wifi = e.target.value;
      syncAndSave();
    });
  }

  // Color theme swatches
  const colorSwatches = document.querySelectorAll('.color-swatch');
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      restaurant.themeColor = swatch.dataset.color;
      syncAndSave();
    });
  });

  // 3. Tab navigation in left panel
  const editorTabs = document.querySelectorAll('.editor-tab-btn');
  const tabContents = {
    'tab-menu': document.getElementById('tab-menu'),
    'tab-branding': document.getElementById('tab-branding'),
    'tab-qr': document.getElementById('tab-qr'),
    'tab-orders': document.getElementById('tab-orders')
  };

  // Mount Orders Dashboard
  const ordersMount = document.getElementById('orders-dashboard-mount');
  if (ordersMount) {
    initOrdersDashboard(ordersMount);
  }

  editorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      editorTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = tab.dataset.tab;
      Object.keys(tabContents).forEach(id => {
        if (tabContents[id]) {
          tabContents[id].style.display = (id === targetId) ? 'block' : 'none';
        }
      });

      if (targetId === 'tab-qr') {
        updateStudioQR();
      }
    });
  });

  // 4. Mobile View Switcher (for mobile screens)
  const mobileViewBtns = document.querySelectorAll('.mobile-view-btn');
  const workspace = document.getElementById('studio-workspace');

  mobileViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mobileViewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      if (view === 'preview') {
        workspace.classList.add('show-preview');
      } else {
        workspace.classList.remove('show-preview');
      }
    });
  });

  // 5. Category & Dishes Manager
  const editorCatChipsContainer = document.getElementById('editor-cat-chips');
  const editorDishesListContainer = document.getElementById('editor-dishes-list');
  const dishFormCatSelect = document.getElementById('dish-form-category');

  function renderCategoryChips() {
    if (!editorCatChipsContainer) return;
    editorCatChipsContainer.innerHTML = restaurant.categories.map(cat => `
      <button class="cat-pill ${cat.id === activeEditorCatId ? 'active' : ''}" data-cat-id="${cat.id}">
        <span>${cat.name}</span>
        <span style="font-size: 0.72rem; opacity: 0.8;">(${cat.items.length})</span>
      </button>
    `).join('');

    editorCatChipsContainer.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeEditorCatId = pill.dataset.catId;
        renderCategoryChips();
        renderDishesList();
      });
    });

    // Populate category dropdown inside dish modal
    if (dishFormCatSelect) {
      dishFormCatSelect.innerHTML = restaurant.categories.map(cat => `
        <option value="${cat.id}" ${cat.id === activeEditorCatId ? 'selected' : ''}>
          ${cat.name}
        </option>
      `).join('');
    }
  }

  function renderDishesList() {
    if (!editorDishesListContainer) return;
    const currentCat = restaurant.categories.find(c => c.id === activeEditorCatId) || restaurant.categories[0];
    if (!currentCat) {
      editorDishesListContainer.innerHTML = `<p style="color: var(--text-muted);">No categories available.</p>`;
      return;
    }

    if (currentCat.items.length === 0) {
      editorDishesListContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: var(--bg-surface-subtle); border-radius: var(--radius-md);">
          <p style="color: var(--text-muted); font-size: 0.9rem;">No dishes in this category yet.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 0.75rem;" id="btn-empty-add-dish">
            + Add First Dish
          </button>
        </div>
      `;
      const emptyAdd = editorDishesListContainer.querySelector('#btn-empty-add-dish');
      if (emptyAdd) {
        emptyAdd.addEventListener('click', () => openDishModal());
      }
      return;
    }

    editorDishesListContainer.innerHTML = currentCat.items.map(dish => `
      <div class="dish-editor-card" data-id="${dish.id}">
        <div class="dish-editor-top">
          <div>
            <strong style="font-size: 0.95rem; color: #FFFFFF;">${dish.name}</strong>
            <span style="font-weight: 700; color: var(--brand-primary); margin-left: 0.5rem;">${restaurant.currency || '₹'}${dish.price}</span>
          </div>
          <div class="dish-editor-actions">
            <button class="icon-action-btn edit-dish-btn" data-id="${dish.id}" title="Edit Dish">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-action-btn delete delete-dish-btn" data-id="${dish.id}" title="Delete Dish">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.5rem;">
          ${dish.description || 'No description provided.'}
        </p>
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          ${(dish.badges || []).map(b => `<span class="dish-tag-pill chef">${b}</span>`).join('')}
          ${(dish.dietary || []).map(d => `<span class="dish-tag-pill veg">${d}</span>`).join('')}
          ${dish.image ? `<span class="dish-tag-pill" style="color: #60A5FA;">Photo Attached</span>` : ''}
        </div>
      </div>
    `).join('');

    // Attach edit and delete events
    editorDishesListContainer.querySelectorAll('.edit-dish-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openDishModal(btn.dataset.id);
      });
    });

    editorDishesListContainer.querySelectorAll('.delete-dish-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dishId = btn.dataset.id;
        if (confirm("Are you sure you want to delete this dish?")) {
          deleteDish(dishId);
        }
      });
    });
  }

  function deleteDish(dishId) {
    restaurant.categories.forEach(cat => {
      cat.items = cat.items.filter(i => i.id !== dishId);
    });
    syncAndSave();
    renderCategoryChips();
    renderDishesList();
  }

  renderCategoryChips();
  renderDishesList();

  // 6. Dish Add/Edit Modal
  const dishModal = document.getElementById('dish-modal');
  const dishModalTitle = document.getElementById('dish-modal-title');
  const dishForm = document.getElementById('dish-edit-form');
  const editDishIdInput = document.getElementById('edit-dish-id');
  const dishNameInput = document.getElementById('dish-form-name');
  const dishPriceInput = document.getElementById('dish-form-price');
  const dishDescInput = document.getElementById('dish-form-desc');
  const dishBadgeInput = document.getElementById('dish-form-badge');
  const dishCaloriesInput = document.getElementById('dish-form-calories');
  const dishImageSelect = document.getElementById('dish-form-image');
  const dietVegCheck = document.getElementById('diet-veg');
  const dietVeganCheck = document.getElementById('diet-vegan');
  const dietGfCheck = document.getElementById('diet-gf');
  const dietHalalCheck = document.getElementById('diet-halal');

  const btnAddDishTrigger = document.getElementById('btn-add-dish-trigger');
  const btnCloseDishModal = document.getElementById('btn-close-dish-modal');
  const btnCancelDish = document.getElementById('btn-cancel-dish');

  function openDishModal(dishId = null) {
    dishForm.reset();
    if (dishId) {
      dishModalTitle.textContent = "Edit Menu Dish";
      editDishIdInput.value = dishId;
      
      let found = null;
      let foundCatId = "";
      restaurant.categories.forEach(cat => {
        const d = cat.items.find(i => i.id === dishId);
        if (d) {
          found = d;
          foundCatId = cat.id;
        }
      });

      if (found) {
        dishFormCatSelect.value = foundCatId;
        dishNameInput.value = found.name;
        dishPriceInput.value = found.price;
        dishDescInput.value = found.description || "";
        dishBadgeInput.value = (found.badges || []).join(", ");
        dishCaloriesInput.value = found.calories || "";
        dishImageSelect.value = found.image || "";
        dietVegCheck.checked = found.dietary?.includes("vegetarian") || false;
        dietVeganCheck.checked = found.dietary?.includes("vegan") || false;
        dietGfCheck.checked = found.dietary?.includes("gluten-free") || false;
        dietHalalCheck.checked = found.dietary?.includes("halal") || false;
      }
    } else {
      dishModalTitle.textContent = "Add New Menu Dish";
      editDishIdInput.value = "";
      dishFormCatSelect.value = activeEditorCatId;
    }
    dishModal.classList.add('open');
  }

  function closeDishModal() {
    dishModal.classList.remove('open');
  }

  if (btnAddDishTrigger) btnAddDishTrigger.addEventListener('click', () => openDishModal());
  if (btnCloseDishModal) btnCloseDishModal.addEventListener('click', closeDishModal);
  if (btnCancelDish) btnCancelDish.addEventListener('click', closeDishModal);

  dishModal.addEventListener('click', (e) => {
    if (e.target === dishModal) closeDishModal();
  });

  if (dishForm) {
    dishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const targetCatId = dishFormCatSelect.value;
      const dishId = editDishIdInput.value;

      const dietary = [];
      if (dietVegCheck.checked) dietary.push("vegetarian");
      if (dietVeganCheck.checked) dietary.push("vegan");
      if (dietGfCheck.checked) dietary.push("gluten-free");
      if (dietHalalCheck.checked) dietary.push("halal");

      const badges = dishBadgeInput.value
        .split(",")
        .map(b => b.trim())
        .filter(Boolean);

      const dishObj = {
        id: dishId || `dish-${Date.now()}`,
        name: dishNameInput.value.trim(),
        price: parseFloat(dishPriceInput.value) || 10,
        description: dishDescInput.value.trim(),
        badges: badges,
        dietary: dietary,
        calories: dishCaloriesInput.value.trim(),
        image: dishImageSelect.value,
        allergens: []
      };

      if (dishId) {
        // Remove from previous category in case category changed
        restaurant.categories.forEach(c => {
          c.items = c.items.filter(i => i.id !== dishId);
        });
        const targetCat = restaurant.categories.find(c => c.id === targetCatId);
        if (targetCat) targetCat.items.push(dishObj);
      } else {
        // Add new dish
        const targetCat = restaurant.categories.find(c => c.id === targetCatId);
        if (targetCat) targetCat.items.unshift(dishObj);

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      syncAndSave();
      renderCategoryChips();
      renderDishesList();
      closeDishModal();
    });
  }

  // 7. QR Code Studio in Tab 3
  const studioQrCanvas = document.getElementById('studio-qr-canvas');
  const inputQrFg = document.getElementById('input-qr-fg');
  const inputQrBg = document.getElementById('input-qr-bg');
  const inputQrFrameText = document.getElementById('input-qr-frame-text');
  const selectQrLogo = document.getElementById('select-qr-logo');
  const studioFrameTitle = document.getElementById('studio-frame-title-display');
  const btnSaveQrPng = document.getElementById('btn-save-qr-png');
  const btnHeaderDownloadQr = document.getElementById('btn-header-download-qr');

  async function updateStudioQR() {
    if (!studioQrCanvas) return;
    const fg = inputQrFg?.value || restaurant.qrSettings?.fgColor || "#0F172A";
    const bg = inputQrBg?.value || restaurant.qrSettings?.bgColor || "#FFFFFF";
    const logo = selectQrLogo?.value || restaurant.qrSettings?.logo || "utensils";
    const frameText = inputQrFrameText?.value || restaurant.qrSettings?.frameText || "SCAN FOR DIGITAL MENU";

    if (studioFrameTitle) {
      studioFrameTitle.textContent = frameText;
      studioFrameTitle.style.color = fg;
    }

    const targetUrl = window.location.origin + "/generator.html";
    await generateStyledQRCode(studioQrCanvas, targetUrl, {
      fgColor: fg,
      bgColor: bg,
      size: 200,
      logo: logo,
      showLogo: true
    });
  }

  if (inputQrFg) inputQrFg.addEventListener('input', updateStudioQR);
  if (inputQrBg) inputQrBg.addEventListener('input', updateStudioQR);
  if (inputQrFrameText) inputQrFrameText.addEventListener('input', updateStudioQR);
  if (selectQrLogo) selectQrLogo.addEventListener('change', updateStudioQR);

  function triggerDownloadQR() {
    if (studioQrCanvas) {
      downloadCanvasPNG(studioQrCanvas, `${restaurant.name.toLowerCase().replace(/\s+/g, '-')}-qr.png`);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  }

  if (btnSaveQrPng) btnSaveQrPng.addEventListener('click', triggerDownloadQR);
  if (btnHeaderDownloadQr) btnHeaderDownloadQr.addEventListener('click', triggerDownloadQR);

  // 8. Device View Switcher (Mobile vs Desktop)
  const btnViewMobile = document.getElementById('btn-view-mobile');
  const btnViewDesktop = document.getElementById('btn-view-desktop');
  const deviceContainer = document.getElementById('device-container');

  if (btnViewMobile && btnViewDesktop && deviceContainer) {
    btnViewMobile.addEventListener('click', () => {
      btnViewMobile.classList.add('active');
      btnViewDesktop.classList.remove('active');
      deviceContainer.classList.remove('mode-desktop');
      deviceContainer.classList.add('mode-mobile');
    });

    btnViewDesktop.addEventListener('click', () => {
      btnViewDesktop.classList.add('active');
      btnViewMobile.classList.remove('active');
      deviceContainer.classList.remove('mode-mobile');
      deviceContainer.classList.add('mode-desktop');
    });
  }

  // 9. Printable Table Stand Modal
  const printModal = document.getElementById('print-modal');
  const btnOpenPrintModal = document.getElementById('btn-open-print-modal');
  const btnPrintTentDirect = document.getElementById('btn-print-tent-direct');
  const btnClosePrintModal = document.getElementById('btn-close-print-modal');
  const btnClosePrintBtn = document.getElementById('btn-close-print-btn');
  const btnTriggerBrowserPrint = document.getElementById('btn-trigger-browser-print');
  const printQrCanvas = document.getElementById('print-qr-canvas');
  const printRestaurantName = document.getElementById('print-restaurant-name');
  const printTableBadge = document.getElementById('print-table-badge');

  async function openPrintStandModal() {
    if (printRestaurantName) printRestaurantName.textContent = (restaurant.name || "Menu QR Bistro").toUpperCase();
    if (printTableBadge) printTableBadge.textContent = (restaurant.tableNumber || "TABLE 01").toUpperCase();

    if (printQrCanvas) {
      const targetUrl = window.location.origin + "/generator.html";
      await generateStyledQRCode(printQrCanvas, targetUrl, {
        fgColor: "#0F172A",
        bgColor: "#FFFFFF",
        size: 180,
        logo: "utensils",
        showLogo: true
      });
    }

    if (printModal) printModal.classList.add('open');
  }

  function closePrintModal() {
    if (printModal) printModal.classList.remove('open');
  }

  if (btnOpenPrintModal) btnOpenPrintModal.addEventListener('click', openPrintStandModal);
  if (btnPrintTentDirect) btnPrintTentDirect.addEventListener('click', openPrintStandModal);
  if (btnClosePrintModal) btnClosePrintModal.addEventListener('click', closePrintModal);
  if (btnClosePrintBtn) btnClosePrintBtn.addEventListener('click', closePrintModal);

  if (printModal) {
    printModal.addEventListener('click', (e) => {
      if (e.target === printModal) closePrintModal();
    });
  }

  if (btnTriggerBrowserPrint) {
    btnTriggerBrowserPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial QR render
  updateStudioQR();
});
