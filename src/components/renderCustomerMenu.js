// ============================================================
// MENZO CUSTOMER DIGITAL MENU COMPONENT
// Supports both Free (view-only digital menu) and Pro (interactive table ordering).
// Features: Table auto-detection, variant selection, add-ons, live cart,
// checkout drawer, and real-time kitchen order dispatch.
// ============================================================

import { isFeatureAllowed, getCurrentPlan, PLAN_TIERS } from '../services/planService.js';
import { resolveTableParam } from '../services/tableService.js';
import { placeOrder } from '../services/orderService.js';
import { ImageProvider, FALLBACK_DEFAULT_IMAGE } from '../services/imageProvider.js';

export function renderCustomerMenu(container, restaurantData, options = {}) {
  if (!container) return;

  const plan = getCurrentPlan();
  const isPro = isFeatureAllowed('order_management');
  const showWatermark = !isFeatureAllowed('remove_watermark');

  // Resolve table from URL or options
  const urlParams = new URLSearchParams(window.location.search);
  const rawTableParam = urlParams.get('t') || urlParams.get('table') || options.tableNumber || (isPro ? 'Table 3' : null);
  const tableInfo = resolveTableParam(rawTableParam);
  const activeTableLabel = tableInfo ? tableInfo.label : (isPro ? 'Table 3' : null);
  const activeTableShort = tableInfo ? tableInfo.shortCode : (isPro ? 'T3' : null);

  // State
  let activeCategory = "All";
  let activeFilter = "all";
  let searchQuery = "";
  let activeOrderPlaced = null;

  // Customizer modal state
  let customizerDish = null;
  let customizerQty = 1;
  let customizerSelectedVariant = null;
  let customizerSelectedAddOns = new Set();

  // Cart Drawer state
  let isCartOpen = false;
  let cart = options.initialCart || [];

  function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  function render() {
    const currency = restaurantData.currency || "₹";
    const categories = restaurantData.categories || [];

    // Extract all items flattened
    const allItems = [];
    categories.forEach(cat => {
      (cat.items || []).forEach(it => {
        allItems.push({ ...it, categoryName: cat.name });
      });
    });

    // Categories list for pills
    const categoryNames = ["All", ...categories.map(c => c.name)];

    // Filter items
    const filteredItems = allItems.filter(item => {
      if (activeCategory !== "All" && item.categoryName !== activeCategory) {
        return false;
      }
      if (activeFilter === "veg" && !item.isVegetarian && !item.dietary?.includes('vegetarian')) return false;
      if (activeFilter === "non-veg" && (item.isVegetarian || item.dietary?.includes('vegetarian'))) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });

    // Group items into Popular Picks and Category sections
    const popularPicks = filteredItems.filter(i => i.isBestseller || (i.badges && i.badges.includes('Bestseller'))).slice(0, 4);
    const standardItems = activeCategory === "All" 
      ? filteredItems.filter(i => !popularPicks.some(p => p.id === i.id))
      : filteredItems;

    const cartCount = getCartItemCount();
    const cartTotal = getCartTotal();

    container.innerHTML = `
      <div class="customer-menu-viewport" style="background: #FFFFFF; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
        
        <!-- 1. CAFE AMBIENCE HERO HEADER -->
        <div class="menu-hero-header" style="
          position: relative;
          width: 100%;
          height: 190px;
          background: url('/images/onboarding_cafe.png') center/cover no-repeat;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 16px;
          box-sizing: border-box;
          color: #FFFFFF;
        ">
          <!-- Dark gradient overlay for text legibility -->
          <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.72) 100%); z-index: 1;"></div>

          <!-- Top Action Row (Language & Table Badge) -->
          <div style="position: absolute; top: 12px; left: 16px; right: 16px; display: flex; align-items: center; justify-content: space-between; z-index: 2;">
            ${activeTableLabel ? `
              <div style="background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; color: #FFFFFF; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.2);">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22C55E;"></span>
                <span>${activeTableLabel}</span>
              </div>
            ` : '<div></div>'}

            <div style="background: rgba(255,255,255,0.9); color: #111820; padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; gap: 4px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              <span>EN</span>
              <span style="font-size: 9px;">▼</span>
            </div>
          </div>

          <!-- Restaurant Identity -->
          <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <!-- Circular Avatar with Sprout Icon -->
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 20h10"></path>
                <path d="M10 20c0-4 1.5-7 4-9"></path>
                <path d="M14 11c0-4.5-3-7-7-7 0 4 2.5 7 7 7z"></path>
                <path d="M14 11c4.5 0 7-3 7-7-4 0-7 2.5-7 7z"></path>
              </svg>
            </div>

            <div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #FFFFFF; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">
                ${restaurantData.name || "Rohan's Café"}
              </h2>
              <p style="margin: 2px 0 0 0; font-size: 11.5px; color: #F3F4F6; font-weight: 500;">
                ${restaurantData.tagline || "Good Food. Good People."}
              </p>
            </div>
          </div>

          <!-- Meta Info Pills (Hours & Location) -->
          <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 8px;">
            <div style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); padding: 3px 9px; border-radius: 6px; font-size: 10px; font-weight: 600; color: #FFFFFF; display: flex; align-items: center; gap: 4px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>11 AM – 11 PM</span>
            </div>
            <div style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); padding: 3px 9px; border-radius: 6px; font-size: 10px; font-weight: 600; color: #FFFFFF; display: flex; align-items: center; gap: 4px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${restaurantData.address || "Meerut, UP"}</span>
            </div>
          </div>
        </div>

        <!-- 2. CATEGORY TABS ROW (Only if categories exist) -->
        ${categories.length > 0 ? `
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            overflow-x: auto;
            white-space: nowrap;
            border-bottom: 1px solid #F3F4F6;
            scrollbar-width: none;
          ">
            ${categoryNames.map(cat => `
              <button class="menu-cat-pill" data-cat="${cat}" style="
                background: ${activeCategory === cat ? '#5C3317' : '#F3F4F6'};
                color: ${activeCategory === cat ? '#FFFFFF' : '#374151'};
                border: none;
                padding: 7px 16px;
                border-radius: 999px;
                font-size: 12.5px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.15s ease;
              ">
                ${cat}
              </button>
            `).join('')}
          </div>
        ` : ''}

        <!-- 3. MAIN MENU CONTENT (2-COLUMN CARDS GRID) -->
        <div style="padding: 16px; flex: 1; padding-bottom: ${isPro && cartCount > 0 ? '90px' : '40px'};">
          
          ${filteredItems.length === 0 ? `
            <div style="text-align: center; padding: 48px 16px; background: #FFF8F1; border-radius: 16px; border: 1px dashed #FFE7DC; margin: 16px 0;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F4512A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              <h4 style="margin: 0 0 4px; font-size: 15px; font-weight: 800; color: #111820;">No menu items added yet</h4>
              <p style="margin: 0; font-size: 12.5px; color: #6B7280; line-height: 1.4;">This restaurant has not published any dishes to their digital menu yet.</p>
            </div>
          ` : `
            <!-- Popular Picks Section -->
            ${popularPicks.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                  <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #111820;">Popular Picks</h3>
                  <span style="font-size: 12px; font-weight: 700; color: #5C3317; cursor: pointer;">See all &rarr;</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  ${popularPicks.map(dish => renderDishCard(dish, currency, isPro)).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Category Sections / All Dishes -->
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #111820;">
                  ${activeCategory === 'All' ? 'Starters & Mains' : activeCategory}
                </h3>
                <span style="font-size: 12px; font-weight: 700; color: #5C3317; cursor: pointer;">See all &rarr;</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                ${standardItems.map(dish => renderDishCard(dish, currency, isPro)).join('')}
              </div>
            </div>
          `}

          <!-- Powered by Menzo footer -->
          ${showWatermark ? `
            <div style="text-align: center; margin-top: 32px; padding: 12px; color: #9CA3AF; font-size: 11.5px; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>Powered by</span>
              <img src="/images/menzo-icon.png" alt="Menzo" style="width: 16px; height: 16px; border-radius: 4px;" />
              <strong style="color: #4B5563;">Menzo</strong>
            </div>
          ` : ''}
        </div>

        <!-- 4. ACTIVE KITCHEN ORDER TRACKER (PRO ONLY) -->
        ${activeOrderPlaced ? `
          <div style="
            position: fixed;
            bottom: ${cartCount > 0 ? '70px' : '16px'};
            left: 16px;
            right: 16px;
            max-width: 448px;
            margin: 0 auto;
            background: #111820;
            color: #FFFFFF;
            padding: 12px 16px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 99;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22C55E; box-shadow: 0 0 8px #22C55E;"></span>
              <div>
                <strong style="font-size: 12.5px; display: block;">${activeOrderPlaced.orderNumber} sent to Kitchen</strong>
                <span style="font-size: 11px; color: #9CA3AF;">${activeOrderPlaced.tableNumber} • Preparing</span>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a5 5 0 0 0-5 5c0 1.5.7 2.8 1.7 3.7A4.97 4.97 0 0 0 5 15v2h14v-2c0-1.8-1-3.4-2.7-4.3A5.02 5.02 0 0 0 17 7a5 5 0 0 0-5-5z"></path>
              <line x1="9" y1="21" x2="15" y2="21"></line>
            </svg>
          </div>
        ` : ''}

        <!-- 5. STICKY FLOATING CART BAR (PRO ONLY) -->
        ${isPro && cartCount > 0 ? `
          <div id="btn-open-cart-bar" style="
            position: fixed;
            bottom: 16px;
            left: 16px;
            right: 16px;
            max-width: 448px;
            margin: 0 auto;
            background: #5C3317;
            color: #FFFFFF;
            padding: 12px 18px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 25px rgba(92, 51, 23, 0.4);
            cursor: pointer;
            z-index: 90;
            transition: transform 0.15s ease;
          ">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13.5px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>View Cart • ${cartCount} ${cartCount === 1 ? 'item' : 'items'}</span>
            </div>
            <div style="font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 4px;">
              <span>${currency}${cartTotal}</span>
              <span>&gt;</span>
            </div>
          </div>
        ` : (!isPro ? `
          <div style="
            position: sticky;
            bottom: 0;
            background: #FFF8F1;
            border-top: 1px solid #FFE7DC;
            padding: 10px 16px;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            color: #6B7280;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span>Digital View Menu • Please call server to place your order</span>
          </div>
        ` : '')}

        <!-- 6. DISH DETAILS & ADD-ONS CUSTOMIZER MODAL (SCREEN 2 TOP) -->
        ${customizerDish ? renderCustomizerModal(customizerDish, currency) : ''}

        <!-- 7. 'YOUR CART' BOTTOM DRAWER / CHECKOUT (SCREEN 2 BOTTOM) -->
        ${isCartOpen ? renderCartDrawer(currency, activeTableLabel, cartTotal) : ''}

      </div>
    `;

    attachEventListeners();
  }

  // ------------------------------------------------------------
  // Render Individual 2-Column Dish Card
  // ------------------------------------------------------------
  function renderDishCard(dish, currency, isPro) {
    const isVeg = dish.isVegetarian !== false && !dish.dietary?.includes('non-vegetarian');
    const hasVariants = dish.pricingType === 'variants' && Array.isArray(dish.variants) && dish.variants.length > 0;
    const displayPrice = hasVariants 
      ? `₹${Math.min(...dish.variants.map(v => v.price))}`
      : `${currency}${dish.price || 200}`;

    const isBestseller = dish.isBestseller || (dish.badges && dish.badges.includes('Bestseller'));
    const isChefSpecial = dish.isChefSpecial || (dish.badges && dish.badges.includes('Chef Special'));

    const imgSrc = ImageProvider.resolveDishImage(dish);

    return `
      <div class="dish-card-item" data-dish-id="${dish.id}" style="
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      ">
        <!-- Thumbnail with optional Badge -->
        <div style="position: relative; width: 100%; height: 110px; background: #F3F4F6; overflow: hidden;">
          <img src="${imgSrc || FALLBACK_DEFAULT_IMAGE}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='${FALLBACK_DEFAULT_IMAGE}';" />
          
          ${isBestseller ? `
            <div style="
              position: absolute;
              top: 6px;
              left: 6px;
              background: #FEF3C7;
              color: #92400E;
              font-size: 9.5px;
              font-weight: 700;
              padding: 2px 7px;
              border-radius: 999px;
              display: flex;
              align-items: center;
              gap: 3px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
              </svg>
              <span>Bestseller</span>
            </div>
          ` : (isChefSpecial ? `
            <div style="
              position: absolute;
              top: 6px;
              left: 6px;
              background: #FEF3C7;
              color: #92400E;
              font-size: 9.5px;
              font-weight: 700;
              padding: 2px 7px;
              border-radius: 999px;
              display: flex;
              align-items: center;
              gap: 3px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#92400E" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Chef's Special</span>
            </div>
          ` : '')}

          <!-- Veg / Non-Veg Indicator Icon -->
          <div style="position: absolute; top: 6px; right: 6px;">
            <span class="diet-icon ${isVeg ? 'veg-icon' : 'non-veg-icon'} sm" style="background: rgba(255,255,255,0.9); padding: 1px; border-radius: 3px;">
              ${isVeg ? '<span class="dot"></span>' : '<span class="triangle"></span>'}
            </span>
          </div>
        </div>

        <!-- Dish Meta -->
        <div style="padding: 10px; display: flex; flex-direction: column; flex: 1;">
          <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #111820; line-height: 1.3;">
            ${dish.name}
          </h4>
          <p style="margin: 3px 0 8px 0; font-size: 10.5px; color: #6B7280; line-height: 1.35; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${dish.description || 'Prepared fresh with traditional spices.'}
          </p>

          <!-- Price & Add Row -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 4px;">
            <span style="font-size: 13px; font-weight: 800; color: #111820;">
              ${displayPrice}
            </span>

            ${isPro ? `
              <button class="btn-dish-add-trigger" data-dish-id="${dish.id}" style="
                background: #FFF1EC;
                color: #F4512A;
                border: 1px solid #FFD9CE;
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 11.5px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.15s ease;
              ">
                + Add
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render Dish Customizer Sheet / Modal (Screen 2 Top)
  // ------------------------------------------------------------
  function renderCustomizerModal(dish, currency) {
    const isVeg = dish.isVegetarian !== false && !dish.dietary?.includes('non-vegetarian');
    const variants = dish.variants || [];
    const hasVariants = variants.length > 0;
    const addOns = dish.addOns || [];

    // Calculate dynamic modal total
    const variantPrice = customizerSelectedVariant 
      ? customizerSelectedVariant.price 
      : (hasVariants ? variants[0].price : dish.price);
    
    let addOnsSum = 0;
    customizerSelectedAddOns.forEach(addOnId => {
      const found = addOns.find(a => a.id === addOnId);
      if (found) addOnsSum += found.price;
    });

    const itemSubtotal = (variantPrice + addOnsSum) * customizerQty;

    const imgSrc = ImageProvider.resolveDishImage(dish);

    return `
      <div class="customizer-backdrop" style="
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        z-index: 100;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        animation: fadeIn 0.2s ease;
      ">
        <div class="customizer-sheet" style="
          background: #FFFFFF;
          border-radius: 24px 24px 0 0;
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.3);
          animation: slideUp 0.25s ease;
        ">
          <!-- Hero Food Photo with Close & Share Buttons -->
          <div style="position: relative; width: 100%; height: 210px; background: #1E293B;">
            <img src="${imgSrc}" alt="${dish.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            
            <button id="btn-close-customizer" style="
              position: absolute;
              top: 14px;
              left: 14px;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: rgba(0,0,0,0.5);
              backdrop-filter: blur(4px);
              border: none;
              color: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            <button style="
              position: absolute;
              top: 14px;
              right: 14px;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: rgba(0,0,0,0.5);
              backdrop-filter: blur(4px);
              border: none;
              color: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
          </div>

          <!-- Body Scrollable Content -->
          <div style="padding: 18px 20px; overflow-y: auto; flex: 1;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
              <div>
                <h3 style="margin: 0; font-size: 19px; font-weight: 800; color: #111820;">${dish.name}</h3>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280; line-height: 1.45;">
                  ${dish.description || 'Rich and creamy tomato gravy with tender pieces, served with love.'}
                </p>
              </div>

              <span class="diet-icon ${isVeg ? 'veg-icon' : 'non-veg-icon'} sm" style="margin-top: 4px;">
                ${isVeg ? '<span class="dot"></span>' : '<span class="triangle"></span>'}
              </span>
            </div>

            <!-- Price and Quantity Stepper Row -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px; padding-bottom: 16px; border-bottom: 1px solid #F3F4F6;">
              <span style="font-size: 20px; font-weight: 800; color: #111820;">
                ${currency}${variantPrice}
              </span>

              <!-- Stepper -->
              <div style="display: inline-flex; align-items: center; background: #F3F4F6; border-radius: 999px; padding: 3px 8px; gap: 12px;">
                <button id="btn-customizer-minus" style="border: none; background: none; font-size: 18px; font-weight: 700; color: #374151; cursor: pointer; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">-</button>
                <span style="font-size: 14px; font-weight: 700; color: #111820;">${customizerQty}</span>
                <button id="btn-customizer-plus" style="border: none; background: none; font-size: 18px; font-weight: 700; color: #374151; cursor: pointer; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">+</button>
              </div>
            </div>

            <!-- Variants Section (If variants exist) -->
            ${hasVariants ? `
              <div style="margin-top: 16px; padding-bottom: 16px; border-bottom: 1px solid #F3F4F6;">
                <h4 style="margin: 0 0 8px 0; font-size: 13.5px; font-weight: 800; color: #111820;">Select Portion / Variant</h4>
                <div style="display: flex; gap: 10px;">
                  ${variants.map(v => {
                    const isSelected = customizerSelectedVariant && customizerSelectedVariant.id === v.id;
                    return `
                      <button class="btn-variant-chip" data-var-id="${v.id}" style="
                        flex: 1;
                        padding: 10px;
                        border-radius: 10px;
                        border: 1.5px solid ${isSelected ? '#5C3317' : '#E5E7EB'};
                        background: ${isSelected ? '#FFF8F1' : '#FFFFFF'};
                        color: #111820;
                        font-weight: 700;
                        font-size: 12.5px;
                        cursor: pointer;
                        text-align: center;
                      ">
                        <div>${v.name}</div>
                        <div style="color: ${isSelected ? '#5C3317' : '#6B7280'}; font-size: 11.5px; margin-top: 2px;">${currency}${v.price}</div>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Add-ons Section -->
            ${addOns.length > 0 ? `
              <div style="margin-top: 16px;">
                <div style="margin-bottom: 10px;">
                  <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #111820;">Add-ons</h4>
                  <p style="margin: 2px 0 0 0; font-size: 11px; color: #9CA3AF;">Make it even better</p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${addOns.map(addon => {
                    const isChecked = customizerSelectedAddOns.has(addon.id);
                    return `
                      <label style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 8px 12px;
                        border-radius: 8px;
                        background: #F9FAFB;
                        cursor: pointer;
                        border: 1px solid ${isChecked ? '#5C3317' : 'transparent'};
                      ">
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: #374151;">
                          <input type="checkbox" class="addon-checkbox" data-addon-id="${addon.id}" ${isChecked ? 'checked' : ''} />
                          <span>${addon.name}</span>
                        </div>
                        <span style="font-size: 12.5px; font-weight: 700; color: #111820;">+${currency}${addon.price}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Bottom Action CTA -->
          <div style="padding: 16px 20px; border-top: 1px solid #F3F4F6; background: #FFFFFF;">
            <button id="btn-customizer-confirm-add" style="
              width: 100%;
              background: #5C3317;
              color: #FFFFFF;
              border: none;
              padding: 14px;
              border-radius: 12px;
              font-size: 15px;
              font-weight: 700;
              cursor: pointer;
              box-shadow: 0 4px 14px rgba(92, 51, 23, 0.3);
              transition: background 0.15s ease;
            ">
              Add to Cart • ${currency}${itemSubtotal}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Render "Your Cart" Bottom Drawer / Checkout (Screen 2 Bottom)
  // ------------------------------------------------------------
  function renderCartDrawer(currency, tableLabel, cartTotal) {
    return `
      <div class="cart-drawer-backdrop" style="
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        z-index: 100;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        animation: fadeIn 0.2s ease;
      ">
        <div class="cart-drawer-sheet" style="
          background: #FFFFFF;
          border-radius: 24px 24px 0 0;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.3);
          animation: slideUp 0.25s ease;
        ">
          <!-- Pull Handle Bar -->
          <div style="width: 40px; height: 4px; background: #D1D5DB; border-radius: 999px; margin: 10px auto 4px;"></div>

          <!-- Drawer Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #F3F4F6;">
            <div>
              <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #111820;">Your Cart</h3>
              ${tableLabel ? `<span style="font-size: 11px; color: #6B7280; font-weight: 600;">Ordering for ${tableLabel}</span>` : ''}
            </div>
            
            <button id="btn-clear-cart" style="background: none; border: none; font-size: 12px; font-weight: 700; color: #6B7280; cursor: pointer;">
              Clear
            </button>
          </div>

          <!-- Cart Items Scroll Area -->
          <div style="padding: 16px 20px; overflow-y: auto; flex: 1;">
            ${cart.length === 0 ? `
              <div style="text-align: center; padding: 40px 10px; color: #9CA3AF;">
                <p style="font-size: 14px; font-weight: 700; margin: 0 0 4px 0;">Your cart is empty</p>
                <p style="font-size: 12px; margin: 0;">Add some delicious dishes from the menu.</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 14px;">
                ${cart.map((item, index) => `
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${item.img || FALLBACK_DEFAULT_IMAGE}" alt="${item.dishName}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0;" onerror="this.onerror=null;this.src='${FALLBACK_DEFAULT_IMAGE}';" />
                      <div>
                        <span style="display: block; font-size: 13.5px; font-weight: 700; color: #111820;">${item.dishName}</span>
                        ${item.variantName ? `<span style="font-size: 10.5px; color: #5C3317; font-weight: 600;">${item.variantName}</span>` : ''}
                        ${item.selectedAddOns && item.selectedAddOns.length > 0 ? `
                          <span style="display: block; font-size: 10px; color: #9CA3AF;">+ ${item.selectedAddOns.map(a => a.name).join(', ')}</span>
                        ` : ''}
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 12px;">
                      <!-- Quantity Stepper -->
                      <div style="display: inline-flex; align-items: center; background: #F3F4F6; border-radius: 999px; padding: 2px 6px; gap: 8px;">
                        <button class="btn-cart-minus" data-index="${index}" style="border: none; background: none; font-size: 14px; font-weight: 700; color: #374151; cursor: pointer;">-</button>
                        <span style="font-size: 12.5px; font-weight: 700; color: #111820;">${item.quantity}</span>
                        <button class="btn-cart-plus" data-index="${index}" style="border: none; background: none; font-size: 14px; font-weight: 700; color: #374151; cursor: pointer;">+</button>
                      </div>

                      <span style="font-size: 13.5px; font-weight: 800; color: #111820; min-width: 45px; text-align: right;">
                        ${currency}${item.totalPrice}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Checkout & Order Placement Bar -->
          ${cart.length > 0 ? `
            <div style="padding: 16px 20px; border-top: 1px solid #F3F4F6; background: #FFFFFF; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
              <div>
                <span style="display: block; font-size: 11px; color: #6B7280; font-weight: 600;">Total</span>
                <span style="font-size: 20px; font-weight: 800; color: #111820;">${currency}${cartTotal}</span>
              </div>

              <button id="btn-place-order-confirm" style="
                flex: 1;
                background: #5C3317;
                color: #FFFFFF;
                border: none;
                padding: 13px 20px;
                border-radius: 12px;
                font-size: 14.5px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(92, 51, 23, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              ">
                <span>Place Order</span>
                <span>&rarr;</span>
              </button>
            </div>
          ` : `
            <div style="padding: 16px 20px; border-top: 1px solid #F3F4F6;">
              <button id="btn-close-cart-drawer" style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #D1D5DB; background: #FFFFFF; font-weight: 700; font-size: 13px; cursor: pointer;">
                Close
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // Event Listeners Binding
  // ------------------------------------------------------------
  function attachEventListeners() {
    // Category pills
    container.querySelectorAll('.menu-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeCategory = pill.dataset.cat;
        render();
      });
    });

    // Add Dish Trigger
    container.querySelectorAll('.btn-dish-add-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dishId = btn.dataset.dishId;
        const dish = findDishById(dishId);
        if (dish) {
          openCustomizer(dish);
        }
      });
    });

    // Card click opens customizer if Pro
    container.querySelectorAll('.dish-card-item').forEach(card => {
      card.addEventListener('click', () => {
        if (!isPro) return;
        const dishId = card.dataset.dishId;
        const dish = findDishById(dishId);
        if (dish) {
          openCustomizer(dish);
        }
      });
    });

    // Open Cart Drawer
    const btnOpenCart = container.querySelector('#btn-open-cart-bar');
    btnOpenCart?.addEventListener('click', () => {
      isCartOpen = true;
      render();
    });

    // Close Cart Drawer
    const cartBackdrop = container.querySelector('.cart-drawer-backdrop');
    cartBackdrop?.addEventListener('click', (e) => {
      if (e.target === cartBackdrop) {
        isCartOpen = false;
        render();
      }
    });

    const btnCloseCart = container.querySelector('#btn-close-cart-drawer');
    btnCloseCart?.addEventListener('click', () => {
      isCartOpen = false;
      render();
    });

    // Clear Cart
    const btnClearCart = container.querySelector('#btn-clear-cart');
    btnClearCart?.addEventListener('click', () => {
      cart = [];
      isCartOpen = false;
      render();
    });

    // Cart Steppers
    container.querySelectorAll('.btn-cart-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (cart[idx]) {
          if (cart[idx].quantity > 1) {
            cart[idx].quantity--;
            cart[idx].totalPrice = cart[idx].unitPrice * cart[idx].quantity;
          } else {
            cart.splice(idx, 1);
          }
          render();
        }
      });
    });

    container.querySelectorAll('.btn-cart-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (cart[idx]) {
          cart[idx].quantity++;
          cart[idx].totalPrice = cart[idx].unitPrice * cart[idx].quantity;
          render();
        }
      });
    });

    // Place Order Button (Pro Only)
    const btnPlaceOrder = container.querySelector('#btn-place-order-confirm');
    btnPlaceOrder?.addEventListener('click', () => {
      try {
        const order = placeOrder({
          tableId: tableInfo ? tableInfo.tableId : 'table_3',
          tableNumber: activeTableLabel || 'Table 3',
          items: cart
        }, restaurantData.id || 'default');

        activeOrderPlaced = order;
        cart = [];
        isCartOpen = false;
        render();
      } catch (err) {
        alert(err.message || 'Could not place order. Please try again.');
      }
    });

    // Customizer Modal Handlers
    const customizerBackdrop = container.querySelector('.customizer-backdrop');
    customizerBackdrop?.addEventListener('click', (e) => {
      if (e.target === customizerBackdrop) {
        customizerDish = null;
        render();
      }
    });

    const btnCloseCustomizer = container.querySelector('#btn-close-customizer');
    btnCloseCustomizer?.addEventListener('click', () => {
      customizerDish = null;
      render();
    });

    const btnPlus = container.querySelector('#btn-customizer-plus');
    btnPlus?.addEventListener('click', () => {
      customizerQty++;
      render();
    });

    const btnMinus = container.querySelector('#btn-customizer-minus');
    btnMinus?.addEventListener('click', () => {
      if (customizerQty > 1) {
        customizerQty--;
        render();
      }
    });

    // Variant Select
    container.querySelectorAll('.btn-variant-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const varId = chip.dataset.varId;
        const v = (customizerDish.variants || []).find(v => v.id === varId);
        if (v) {
          customizerSelectedVariant = v;
          render();
        }
      });
    });

    // Addon Checkbox
    container.querySelectorAll('.addon-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const addonId = cb.dataset.addonId;
        if (cb.checked) {
          customizerSelectedAddOns.add(addonId);
        } else {
          customizerSelectedAddOns.delete(addonId);
        }
        render();
      });
    });

    // Confirm Add to Cart
    const btnConfirmAdd = container.querySelector('#btn-customizer-confirm-add');
    btnConfirmAdd?.addEventListener('click', () => {
      const variant = customizerSelectedVariant;
      const unitPrice = variant ? variant.price : customizerDish.price;
      
      const selectedAddOnObjects = [];
      let addOnsTotal = 0;
      customizerSelectedAddOns.forEach(addOnId => {
        const found = (customizerDish.addOns || []).find(a => a.id === addOnId);
        if (found) {
          selectedAddOnObjects.push({ id: found.id, name: found.name, price: found.price });
          addOnsTotal += found.price;
        }
      });

      const lineUnitPrice = unitPrice + addOnsTotal;
      const lineTotalPrice = lineUnitPrice * customizerQty;

      cart.push({
        dishId: customizerDish.id,
        dishName: customizerDish.name,
        variantId: variant ? variant.id : null,
        variantName: variant ? variant.name : null,
        quantity: customizerQty,
        unitPrice: lineUnitPrice,
        totalPrice: lineTotalPrice,
        selectedAddOns: selectedAddOnObjects,
        img: ImageProvider.resolveDishImage(customizerDish)
      });

      customizerDish = null;
      render();
    });
  }

  function findDishById(dishId) {
    for (const cat of (restaurantData.categories || [])) {
      const found = (cat.items || []).find(i => i.id === dishId);
      if (found) return found;
    }
    return null;
  }

  function openCustomizer(dish) {
    customizerDish = dish;
    customizerQty = 1;
    customizerSelectedVariant = (dish.variants && dish.variants.length > 0) ? dish.variants[0] : null;
    customizerSelectedAddOns = new Set();
    render();
  }

  // Initial render
  render();
}
