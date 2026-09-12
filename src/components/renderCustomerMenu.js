// Component that renders the interactive customer-facing digital menu into any target container

export function renderCustomerMenu(container, restaurantData, options = {}) {
  if (!container) return;

  // Local state inside the menu simulator
  let activeCategory = restaurantData.categories[0]?.id || "";
  let activeFilter = "all";
  let searchQuery = "";
  let cart = options.initialCart || [
    { itemId: "item-special-chole-bhature", qty: 1 },
    { itemId: "item-kulhad-lassi", qty: 1 }
  ];

  function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function getCartTotal() {
    let total = 0;
    cart.forEach(cartItem => {
      restaurantData.categories.forEach(cat => {
        const found = cat.items.find(i => i.id === cartItem.itemId);
        if (found) {
          total += found.price * cartItem.qty;
        }
      });
    });
    return total;
  }

  function render() {
    const currency = restaurantData.currency || "₹";

    // Filter items based on active dietary filter and search query
    const filteredCategories = restaurantData.categories.map(cat => {
      const filteredItems = cat.items.filter(item => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = (item.description || "").toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        // Dietary filter
        if (activeFilter === "veg" && !item.dietary?.includes("vegetarian") && !item.dietary?.includes("vegan")) return false;
        if (activeFilter === "vegan" && !item.dietary?.includes("vegan")) return false;
        if (activeFilter === "gf" && !item.dietary?.includes("gluten-free")) return false;
        if (activeFilter === "chef" && !item.badges?.includes("Chef Special") && !item.badges?.includes("Bestseller")) return false;

        return true;
      });

      return {
        ...cat,
        items: filteredItems
      };
    }).filter(cat => cat.items.length > 0);

    const cartCount = getCartItemCount();
    const cartTotal = getCartTotal();

    container.innerHTML = `
      <div class="customer-menu-viewport">
        <!-- Top Restaurant Banner & Info -->
        <div class="digital-menu-header">
          <div class="restaurant-top-info">
            <div class="restaurant-brand-meta">
              <div class="restaurant-avatar" style="background: linear-gradient(135deg, ${restaurantData.themeColor || '#FF4D2D'}, #E03E1F)">
                ${restaurantData.name ? restaurantData.name.charAt(0).toUpperCase() : "D"}
              </div>
              <div class="restaurant-title-wrap">
                <h4>${restaurantData.name || "Delhi Chole Bhature"}</h4>
                <span class="restaurant-cuisine-tag">${restaurantData.cuisine || "Authentic Street Food"}</span>
              </div>
            </div>
            <div class="table-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${restaurantData.tableNumber || "Table 04"}</span>
            </div>
          </div>

          <!-- Quick Chips Row (WiFi, Waiter, Currency) -->
          <div class="quick-chips-row">
            <button class="chip-btn" id="btn-wifi-chip" title="View Guest WiFi">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
              <span>Free WiFi</span>
            </button>
            <button class="chip-btn" id="btn-waiter-chip" title="Notify Waiter">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>Call Server</span>
            </button>
            <button class="chip-btn filter-chip ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
            <button class="chip-btn filter-chip ${activeFilter === 'chef' ? 'active' : ''}" data-filter="chef">Chef Picks</button>
            <button class="chip-btn filter-chip ${activeFilter === 'veg' ? 'active' : ''}" data-filter="veg">Veg</button>
            <button class="chip-btn filter-chip ${activeFilter === 'vegan' ? 'active' : ''}" data-filter="vegan">Vegan</button>
            <button class="chip-btn filter-chip ${activeFilter === 'gf' ? 'active' : ''}" data-filter="gf">Gluten-Free</button>
          </div>

          <!-- Menu Search Bar -->
          <div class="menu-search-wrapper">
            <span class="search-icon-inside">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" class="menu-search-input" id="menu-search-field" placeholder="Search dishes, lassi, extras..." value="${searchQuery}" />
          </div>
        </div>

        <!-- Sticky Category Navigation Bar -->
        <div class="category-nav-bar" id="category-tabs-container">
          ${restaurantData.categories.map(cat => `
            <button class="cat-pill ${cat.id === activeCategory ? 'active' : ''}" data-cat-id="${cat.id}">
              <span>${cat.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Scrollable Menu Content -->
        <div class="menu-scroll-content" id="menu-items-scroll-area">
          ${filteredCategories.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <p style="font-weight: 600;">No items found</p>
              <p style="font-size: 0.8rem; margin-top: 0.25rem;">Try adjusting your search or filters.</p>
            </div>
          ` : filteredCategories.map(cat => `
            <div class="menu-category-section" id="section-${cat.id}">
              <div class="category-heading">
                <span>${cat.name}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">(${cat.items.length})</span>
              </div>
              <div class="items-grid">
                ${cat.items.map(item => `
                  <div class="dish-card" data-dish-id="${item.id}">
                    <div class="dish-info">
                      <div class="dish-header">
                        <span class="dish-name">${item.name}</span>
                        <span class="dish-price">${currency}${item.price}</span>
                      </div>
                      <p class="dish-desc">${item.description || ''}</p>
                      <div class="dish-footer">
                        <div class="dish-tags">
                          ${(item.badges || []).map(b => `
                            <span class="dish-tag-pill ${b.toLowerCase().includes('chef') ? 'chef' : ''}">${b}</span>
                          `).join('')}
                          ${item.dietary?.includes('vegetarian') ? '<span class="dish-tag-pill veg">Veg</span>' : ''}
                          ${item.dietary?.includes('vegan') ? '<span class="dish-tag-pill veg">Vegan</span>' : ''}
                          ${item.dietary?.includes('gluten-free') ? '<span class="dish-tag-pill">GF</span>' : ''}
                        </div>
                      </div>
                    </div>
                    ${item.image ? `
                      <div class="dish-thumb">
                        <img src="${item.image}" alt="${item.name}" loading="lazy" />
                        <button class="btn-add-item" data-add-id="${item.id}" title="Add to table order">+</button>
                      </div>
                    ` : `
                      <button class="btn-add-item" style="position: static; margin-left: auto; align-self: center;" data-add-id="${item.id}" title="Add to table order">+</button>
                    `}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Floating Table Order / Cart Bottom Drawer -->
        ${cartCount > 0 ? `
          <div class="bottom-order-bar" id="bottom-order-bar-btn">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span class="order-count-badge">${cartCount}</span>
              <div>
                <span class="order-total-text">${currency}${cartTotal.toFixed(2)}</span>
                <span style="display: block; font-size: 0.68rem; color: var(--text-muted);">${restaurantData.tableNumber || 'Table 04'} Bill</span>
              </div>
            </div>
            <button class="btn-view-order" id="btn-open-bill">
              <span>View Order</span>
              <span>&rarr;</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Attach internal event listeners
    attachListeners();
  }

  function attachListeners() {
    // Search input
    const searchInput = container.querySelector('#menu-search-field');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        const inputNow = container.querySelector('#menu-search-field');
        if (inputNow) {
          inputNow.focus();
          inputNow.setSelectionRange(inputNow.value.length, inputNow.value.length);
        }
      });
    }

    // Filter chips
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        render();
      });
    });

    // Category pills smooth scroll
    container.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const catId = pill.dataset.catId;
        activeCategory = catId;
        const targetSection = container.querySelector(`#section-${catId}`);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        container.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Add item to cart button
    container.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.addId;
        const existing = cart.find(i => i.itemId === itemId);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({ itemId, qty: 1 });
        }
        render();
        if (options.onCartChange) {
          options.onCartChange(cart);
        }
      });
    });

    // Open dish detail
    container.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', () => {
        const dishId = card.dataset.dishId;
        showDishDetailModal(dishId);
      });
    });

    // WiFi alert
    const wifiBtn = container.querySelector('#btn-wifi-chip');
    if (wifiBtn) {
      wifiBtn.addEventListener('click', () => {
        alert(`Guest WiFi:\nNetwork: ${restaurantData.wifi?.split('/')[0]?.trim() || "DelhiChole_Guest"}\nPassword: ${restaurantData.wifi?.split('/')[1]?.trim() || "bhature2026"}`);
      });
    }

    // Call Server alert
    const waiterBtn = container.querySelector('#btn-waiter-chip');
    if (waiterBtn) {
      waiterBtn.addEventListener('click', () => {
        alert(`Server Call Sent: A floor waiter has been notified for ${restaurantData.tableNumber || "Table 04"}.`);
      });
    }

    // View Order / Bill modal
    const billBtn = container.querySelector('#bottom-order-bar-btn');
    if (billBtn) {
      billBtn.addEventListener('click', () => {
        showOrderBillModal();
      });
    }
  }

  function showDishDetailModal(dishId) {
    let foundDish = null;
    restaurantData.categories.forEach(cat => {
      const match = cat.items.find(i => i.id === dishId);
      if (match) foundDish = match;
    });

    if (!foundDish) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-content-box" style="max-width: 440px;">
        <div class="modal-header">
          <h3 style="font-size: 1.25rem;">${foundDish.name}</h3>
          <button class="icon-action-btn" id="modal-close-dish" style="font-size: 1.25rem;">&times;</button>
        </div>
        ${foundDish.image ? `
          <div style="border-radius: var(--radius-md); overflow: hidden; height: 200px; margin-bottom: 1rem;">
            <img src="${foundDish.image}" alt="${foundDish.name}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        ` : ''}
        <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary); margin-bottom: 1rem;">
          ${foundDish.description || "Freshly prepared with seasonal ingredients."}
        </p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
          ${foundDish.calories ? `<span class="dish-tag-pill">${foundDish.calories}</span>` : ''}
          ${(foundDish.allergens || []).map(a => `<span class="dish-tag-pill" style="color: #F87171;">Contains ${a}</span>`).join('')}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <span style="font-size: 1.35rem; font-weight: 800; color: var(--brand-primary);">${restaurantData.currency || "₹"}${foundDish.price}</span>
          <button class="btn btn-primary btn-sm" id="btn-modal-add-dish">Add to Table Order</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#modal-close-dish').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelector('#btn-modal-add-dish').addEventListener('click', () => {
      const existing = cart.find(i => i.itemId === foundDish.id);
      if (existing) existing.qty += 1;
      else cart.push({ itemId: foundDish.id, qty: 1 });
      render();
      modal.remove();
    });
  }

  function showOrderBillModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';

    const cartItemsWithDetails = cart.map(ci => {
      let itemDetail = null;
      restaurantData.categories.forEach(cat => {
        const found = cat.items.find(i => i.id === ci.itemId);
        if (found) itemDetail = found;
      });
      return { ...ci, detail: itemDetail };
    }).filter(ci => ci.detail != null);

    const subtotal = getCartTotal();
    const tax = subtotal * 0.05; // 5% GST
    const total = subtotal + tax;

    modal.innerHTML = `
      <div class="modal-content-box" style="max-width: 440px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 1.2rem;">${restaurantData.tableNumber || "Table 04"} - Order Tab</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${restaurantData.name}</span>
          </div>
          <button class="icon-action-btn" id="modal-close-bill" style="font-size: 1.25rem;">&times;</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;">
          ${cartItemsWithDetails.map(ci => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle);">
              <div>
                <strong style="font-size: 0.9rem; color: var(--text-primary); display: block;">${ci.detail.name}</strong>
                <span style="font-size: 0.78rem; color: var(--text-muted);">${restaurantData.currency || "₹"}${ci.detail.price} &times; ${ci.qty}</span>
              </div>
              <span style="font-weight: 700; color: var(--brand-primary);">${restaurantData.currency || "₹"}${(ci.detail.price * ci.qty).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
            <span>Subtotal</span>
            <span>${restaurantData.currency || "₹"}${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem; color: var(--text-muted);">
            <span>Estimated GST (5%)</span>
            <span>${restaurantData.currency || "₹"}${tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
            <span>Total</span>
            <span style="color: var(--brand-primary);">${restaurantData.currency || "₹"}${total.toFixed(2)}</span>
          </div>
        </div>
        <button class="btn btn-primary" style="width: 100%;" id="btn-confirm-order-demo">
          Send Order to Kitchen
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#modal-close-bill').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelector('#btn-confirm-order-demo').addEventListener('click', () => {
      alert(`Order sent to the kitchen for ${restaurantData.tableNumber || "Table 04"}!\nFresh chole bhature are being prepared.`);
      cart = [];
      render();
      modal.remove();
    });
  }

  // Initial render
  render();

  return {
    updateData: (newData) => {
      restaurantData = newData;
      render();
    },
    getCart: () => cart
  };
}
