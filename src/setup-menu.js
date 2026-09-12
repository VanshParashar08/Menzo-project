/**
 * Menzo Onboarding — Step 3: Setup Menu Logic
 * Powered by 1,000+ Trained Indian Dishes, Editable Custom Pricing,
 * Live Search & Filters, and Real-Time Customer Phone Preview.
 */

import { ALL_TRAINED_DISHES, TRAINED_CATEGORIES, POPULAR_DISH_NAMES } from './data/trainedDishes.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sync restaurant name from Step 1
  const savedRestName = localStorage.getItem('menzo_restaurant_name');
  const restNameEl = document.getElementById('preview-rest-name');
  if (savedRestName && restNameEl) {
    restNameEl.textContent = savedRestName;
  }

  // 2. Elements
  const dishesGrid = document.getElementById('dishes-grid');
  const phoneDishesList = document.getElementById('phone-dishes-list');
  const searchInput = document.getElementById('dishes-search-input');
  const clearSearchBtn = document.getElementById('btn-clear-search');
  const filterCountEl = document.getElementById('dishes-filter-count');
  const navSelectionSummary = document.getElementById('nav-selection-summary');
  const btnNextPreview = document.getElementById('btn-next-preview');
  const categoryPillsRow = document.getElementById('category-pills-row');
  const btnAllCategories = document.getElementById('btn-all-categories');
  const allCategoriesPopover = document.getElementById('all-categories-popover');
  const popoverCategoriesList = document.getElementById('popover-categories-list');

  // Modals
  const modalAddCustom = document.getElementById('modal-add-custom');
  const btnAddCustom = document.getElementById('btn-add-custom');
  const btnCloseCustom = document.getElementById('btn-close-custom-modal');
  const btnCancelCustom = document.getElementById('btn-cancel-custom-modal');
  const formAddCustom = document.getElementById('form-add-custom-dish');
  const customCatSelect = document.getElementById('custom-dish-category');

  const modalBulkUpload = document.getElementById('modal-bulk-upload');
  const btnBulkUpload = document.getElementById('btn-bulk-upload');
  const btnCloseBulk = document.getElementById('btn-close-bulk-modal');
  const btnCancelBulk = document.getElementById('btn-cancel-bulk-modal');
  const bulkDropzone = document.getElementById('bulk-dropzone');
  const bulkFileInput = document.getElementById('bulk-file-input');

  // Toast
  const toastEl = document.getElementById('setup-toast');
  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // 3. State
  let activeCategory = 'Popular';
  let searchQuery = '';
  const customPrices = new Map(); // id -> price
  const selectedDishes = new Map(); // id -> dishObject

  // Populate Custom Category Dropdown in modal
  if (customCatSelect) {
    customCatSelect.innerHTML = TRAINED_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }

  // Populate Popover with all 22 categories
  if (popoverCategoriesList) {
    popoverCategoriesList.innerHTML = TRAINED_CATEGORIES.map(cat => {
      const count = ALL_TRAINED_DISHES.filter(d => d.category === cat).length;
      return `<button type="button" class="popover-cat-btn" data-category="${cat}">
        <span>${cat}</span>
        <span style="color: #9CA3AF; font-size: 10px;">${count}</span>
      </button>`;
    }).join('');
  }

  // Initialize selected dishes from localStorage or defaults
  const savedDishesJson = localStorage.getItem('menzo_selected_dishes');
  if (savedDishesJson) {
    try {
      const saved = JSON.parse(savedDishesJson);
      if (Array.isArray(saved) && saved.length > 0) {
        saved.forEach(d => {
          selectedDishes.set(d.id, d);
          customPrices.set(d.id, Number(d.price));
        });
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // If no dishes selected yet, set 4 popular defaults
  if (selectedDishes.size === 0) {
    const defaults = [
      { id: 'paneer-tikka', name: 'Paneer Tikka', price: 280, isVeg: true, img: '/images/paneer_tikka.jpg', category: 'North Indian' },
      { id: 'butter-chicken', name: 'Butter Chicken', price: 320, isVeg: false, img: '/images/butter_chicken.jpg', category: 'Punjabi & Mughlai' },
      { id: 'masala-dosa', name: 'Masala Dosa', price: 110, isVeg: true, img: '/images/masala_dosa.jpg', category: 'South Indian' },
      { id: 'veg-burger', name: 'Veg Burger', price: 180, isVeg: true, img: '/images/burger.jpg', category: 'Chaats & Snacks' }
    ];
    defaults.forEach(d => {
      selectedDishes.set(d.id, d);
      customPrices.set(d.id, d.price);
    });
  }

  // 4. Filter & Search Logic
  function getFilteredDishes() {
    let list = ALL_TRAINED_DISHES;

    // Filter by search query first if present
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      return list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.category.toLowerCase().includes(q) ||
        (q === 'veg' && d.isVeg) ||
        (q === 'non veg' && !d.isVeg) ||
        (q === 'non-veg' && !d.isVeg)
      );
    }

    // Filter by category
    if (activeCategory === 'Popular') {
      const popularSet = new Set(POPULAR_DISH_NAMES.map(n => n.toLowerCase()));
      const popDishes = list.filter(d => popularSet.has(d.name.toLowerCase()));
      return popDishes.length > 0 ? popDishes : list.slice(0, 12);
    } else {
      return list.filter(d => d.category.toLowerCase() === activeCategory.toLowerCase());
    }
  }

  // 5. Render Dishes Grid
  function renderDishesGrid() {
    if (!dishesGrid) return;
    const filtered = getFilteredDishes();

    // Update count indicator
    if (filterCountEl) {
      if (searchQuery.trim()) {
        filterCountEl.textContent = `Found ${filtered.length} dishes`;
      } else {
        filterCountEl.textContent = `${activeCategory} (${filtered.length})`;
      }
    }

    if (filtered.length === 0) {
      dishesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #F9FAFB; border-radius: 12px; border: 1.5px dashed #E5E7EB;">
          <p style="font-size: 15px; font-weight: 700; color: #111820; margin: 0 0 6px 0;">No dishes found matching "${searchQuery}"</p>
          <p style="font-size: 13px; color: #6B7280; margin: 0 0 16px 0;">You can add your own custom dish with custom pricing anytime.</p>
          <button type="button" class="modal-submit-btn" id="btn-empty-add-custom" style="display: inline-block;">+ Add "${searchQuery}" as Custom Dish</button>
        </div>
      `;

      document.getElementById('btn-empty-add-custom')?.addEventListener('click', () => {
        openAddCustomModal(searchQuery);
      });
      return;
    }

    // Render up to 60 cards for performance
    const renderList = filtered.slice(0, 60);

    dishesGrid.innerHTML = renderList.map(dish => {
      const isSelected = selectedDishes.has(dish.id);
      const currentPrice = customPrices.has(dish.id) ? customPrices.get(dish.id) : dish.price;

      return `
        <div class="dish-card ${isSelected ? 'is-added' : ''}" data-id="${dish.id}" data-name="${dish.name}" data-price="${currentPrice}" data-veg="${dish.isVeg}" data-img="${dish.img}" data-category="${dish.category}">
          <div class="dish-img-wrap">
            <img src="${dish.img}" alt="${dish.name}" class="dish-photo" loading="lazy" onerror="this.src='/images/paneer_tikka.jpg';" />
            <span class="dish-cat-tag">${dish.category}</span>
          </div>
          <div class="dish-body">
            <div class="dish-name-row">
              <span class="dish-title" title="${dish.name}">${dish.name}</span>
              <span class="diet-icon ${dish.isVeg ? 'veg-icon' : 'non-veg-icon'}" title="${dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
                ${dish.isVeg ? '<span class="dot"></span>' : '<span class="triangle"></span>'}
              </span>
            </div>

            <!-- User Editable Price Box -->
            <div class="dish-price-edit-box" title="Click to customize price">
              <span class="price-currency">₹</span>
              <input type="number" class="dish-price-input" data-id="${dish.id}" value="${currentPrice}" min="1" step="5" aria-label="Set price in ₹" />
              <span class="price-edit-pencil" aria-hidden="true">✏️</span>
            </div>

            <!-- Add / Added Toggle Button -->
            <button type="button" class="dish-add-btn ${isSelected ? 'added-state' : ''}" data-action="toggle">
              ${isSelected ? '<span class="check-icon">✓</span> <span class="add-text">Added</span>' : '<span class="add-icon">+</span> <span class="add-text">Add</span>'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 6. Sync Phone Preview
  function syncPhonePreview() {
    if (!phoneDishesList) return;

    if (selectedDishes.size === 0) {
      phoneDishesList.innerHTML = `
        <div style="text-align: center; padding: 36px 12px; color: #9CA3AF; font-size: 11px;">
          <p>No dishes added yet.<br/>Click <strong>+ Add</strong> to populate your live menu.</p>
        </div>
      `;
      if (navSelectionSummary) navSelectionSummary.textContent = '0 dishes selected';
      return;
    }

    let totalPrice = 0;
    phoneDishesList.innerHTML = '';

    selectedDishes.forEach(dish => {
      totalPrice += Number(dish.price || 0);

      const item = document.createElement('div');
      item.className = 'phone-dish-item';
      item.dataset.id = dish.id;
      item.innerHTML = `
        <img src="${dish.img}" alt="${dish.name}" class="phone-dish-thumb" onerror="this.src='/images/paneer_tikka.jpg';" />
        <div class="phone-dish-details">
          <span class="phone-dish-name">${dish.name}</span>
          <span class="phone-dish-price">₹${dish.price}</span>
        </div>
        <span class="diet-icon ${dish.isVeg ? 'veg-icon' : 'non-veg-icon'} sm">
          ${dish.isVeg ? '<span class="dot"></span>' : '<span class="triangle"></span>'}
        </span>
        <button type="button" class="phone-dish-remove-btn" title="Remove from menu" data-remove-id="${dish.id}">&times;</button>
      `;
      phoneDishesList.appendChild(item);
    });

    // Update bottom navigation summary
    if (navSelectionSummary) {
      navSelectionSummary.textContent = `${selectedDishes.size} dishes selected (₹${totalPrice})`;
    }

    // Save state to localStorage
    localStorage.setItem('menzo_selected_dishes', JSON.stringify(Array.from(selectedDishes.values())));
  }

  // 7. Event Delegation for Dish Grid (Add/Remove + Price Edit)
  dishesGrid?.addEventListener('click', (e) => {
    // If click is on or inside price input, don't trigger card add/remove
    if (e.target.closest('.dish-price-edit-box')) {
      return;
    }

    const btn = e.target.closest('.dish-add-btn');
    if (!btn) return;

    const card = btn.closest('.dish-card');
    if (!card) return;

    const id = card.dataset.id;
    const name = card.dataset.name;
    const priceInput = card.querySelector('.dish-price-input');
    const price = Number(priceInput?.value || card.dataset.price || 200);
    const isVeg = card.dataset.veg === 'true';
    const img = card.dataset.img;
    const category = card.dataset.category || 'Special';

    if (selectedDishes.has(id)) {
      // Remove
      selectedDishes.delete(id);
      card.classList.remove('is-added');
      btn.classList.remove('added-state');
      btn.innerHTML = `<span class="add-icon">+</span> <span class="add-text">Add</span>`;
      showToast(`Removed "${name}" from menu`);
    } else {
      // Add
      selectedDishes.set(id, { id, name, price, isVeg, img, category });
      card.classList.add('is-added');
      btn.classList.add('added-state');
      btn.innerHTML = `<span class="check-icon">✓</span> <span class="add-text">Added</span>`;
      showToast(`Added "${name}" for ₹${price}`);
    }

    syncPhonePreview();
  });

  // Handle User Price Input Edits
  dishesGrid?.addEventListener('input', (e) => {
    const input = e.target.closest('.dish-price-input');
    if (!input) return;

    const id = input.dataset.id;
    const newPrice = Math.max(0, Number(input.value) || 0);

    // Update custom price map
    customPrices.set(id, newPrice);

    // Update card dataset
    const card = input.closest('.dish-card');
    if (card) {
      card.dataset.price = newPrice;
    }

    // If already in selected dishes, update price in real-time
    if (selectedDishes.has(id)) {
      const dish = selectedDishes.get(id);
      dish.price = newPrice;
      selectedDishes.set(id, dish);
      syncPhonePreview();
    }
  });

  // Handle phone preview item removal (from phone's remove 'x' button)
  phoneDishesList?.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.phone-dish-remove-btn');
    if (!removeBtn) return;

    const id = removeBtn.dataset.removeId;
    if (selectedDishes.has(id)) {
      const dish = selectedDishes.get(id);
      selectedDishes.delete(id);
      showToast(`Removed "${dish.name}"`);

      // Uncheck card in grid if visible
      const card = document.querySelector(`.dish-card[data-id="${id}"]`);
      if (card) {
        card.classList.remove('is-added');
        const btn = card.querySelector('.dish-add-btn');
        if (btn) {
          btn.classList.remove('added-state');
          btn.innerHTML = `<span class="add-icon">+</span> <span class="add-text">Add</span>`;
        }
      }

      syncPhonePreview();
    }
  });

  // 8. Search Input Handling
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    if (clearSearchBtn) {
      clearSearchBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
    }
    renderDishesGrid();
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderDishesGrid();
    searchInput.focus();
  });

  // 9. Category Pill Switching
  categoryPillsRow?.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;

    if (pill.id === 'btn-all-categories') {
      // Toggle popover
      const isVisible = allCategoriesPopover.style.display === 'block';
      allCategoriesPopover.style.display = isVisible ? 'none' : 'block';
      return;
    }

    // Close popover if open
    if (allCategoriesPopover) allCategoriesPopover.style.display = 'none';

    document.querySelectorAll('.category-pill').forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-selected', 'false');
    });
    pill.classList.add('active');
    pill.setAttribute('aria-selected', 'true');

    activeCategory = pill.dataset.category || 'Popular';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';

    renderDishesGrid();
  });

  // Popover category select
  allCategoriesPopover?.addEventListener('click', (e) => {
    const btn = e.target.closest('.popover-cat-btn');
    if (!btn) return;

    activeCategory = btn.dataset.category;
    allCategoriesPopover.style.display = 'none';

    // Highlight more button
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    if (btnAllCategories) {
      btnAllCategories.classList.add('active');
      btnAllCategories.textContent = `${activeCategory} ▾`;
    }

    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';

    renderDishesGrid();
  });

  // Close popover when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.all-categories-popover') && !e.target.closest('#btn-all-categories')) {
      if (allCategoriesPopover) allCategoriesPopover.style.display = 'none';
    }
  });

  // 10. Add Custom Dish Modal Handlers
  function openAddCustomModal(prefillName = '') {
    if (modalAddCustom) {
      modalAddCustom.style.display = 'flex';
      const nameInput = document.getElementById('custom-dish-name');
      if (nameInput) {
        nameInput.value = prefillName;
        nameInput.focus();
      }
    }
  }

  btnAddCustom?.addEventListener('click', () => openAddCustomModal());
  btnCloseCustom?.addEventListener('click', () => { modalAddCustom.style.display = 'none'; });
  btnCancelCustom?.addEventListener('click', () => { modalAddCustom.style.display = 'none'; });

  formAddCustom?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('custom-dish-name').value.trim();
    const category = customCatSelect.value || 'Specialties';
    const price = Number(document.getElementById('custom-dish-price').value) || 200;
    const isVeg = document.querySelector('input[name="custom-diet"]:checked').value === 'veg';

    if (!name) return;

    const id = 'custom-' + Date.now();
    let img = isVeg ? '/images/paneer_tikka.jpg' : '/images/butter_chicken.jpg';

    const newDish = { id, name, category, price, isVeg, img };

    // Prepend to catalog so it appears in search
    ALL_TRAINED_DISHES.unshift(newDish);
    customPrices.set(id, price);
    selectedDishes.set(id, newDish);

    modalAddCustom.style.display = 'none';
    formAddCustom.reset();

    showToast(`Added custom dish "${name}" for ₹${price}!`);
    renderDishesGrid();
    syncPhonePreview();
  });

  // 11. Bulk Upload Modal Handlers
  btnBulkUpload?.addEventListener('click', () => {
    if (modalBulkUpload) modalBulkUpload.style.display = 'flex';
  });
  btnCloseBulk?.addEventListener('click', () => { modalBulkUpload.style.display = 'none'; });
  btnCancelBulk?.addEventListener('click', () => { modalBulkUpload.style.display = 'none'; });

  bulkDropzone?.addEventListener('click', () => bulkFileInput?.click());

  bulkFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseAndImportCsv(text, file.name);
    };
    reader.readAsText(file);
  });

  function parseAndImportCsv(text, filename) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let addedCount = 0;

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('dish')) return; // header row
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        const name = parts[0];
        const category = parts[1] || 'Specials';
        const price = Number(parts[2]) || (category.includes('Breads') ? 60 : 220);
        const id = 'bulk-' + Date.now() + '-' + index;
        const isVeg = !name.toLowerCase().match(/chicken|mutton|fish|egg|prawn|beef|pork/);
        const img = isVeg ? '/images/paneer_tikka.jpg' : '/images/butter_chicken.jpg';

        const dish = { id, name, category, price, isVeg, img };
        ALL_TRAINED_DISHES.push(dish);
        selectedDishes.set(id, dish);
        customPrices.set(id, price);
        addedCount++;
      }
    });

    if (modalBulkUpload) modalBulkUpload.style.display = 'none';
    showToast(`Imported ${addedCount} dishes from "${filename}"!`);
    renderDishesGrid();
    syncPhonePreview();
  }

  // Quick Preset Imports
  document.querySelectorAll('.quick-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      let targetCat = '';
      if (preset === 'street-food') targetCat = 'Indian Street Food';
      else if (preset === 'north-indian') targetCat = 'North Indian';
      else if (preset === 'south-indian') targetCat = 'South Indian';
      else if (preset === 'beverages') targetCat = 'Beverages';

      const presetDishes = ALL_TRAINED_DISHES.filter(d => d.category === targetCat).slice(0, 12);
      presetDishes.forEach(d => {
        const price = customPrices.get(d.id) || d.price;
        selectedDishes.set(d.id, { ...d, price });
      });

      if (modalBulkUpload) modalBulkUpload.style.display = 'none';
      showToast(`Added ${presetDishes.length} ${targetCat} dishes to menu!`);
      renderDishesGrid();
      syncPhonePreview();
    });
  });

  // 12. Next: Preview Button Click
  btnNextPreview?.addEventListener('click', (e) => {
    if (selectedDishes.size === 0) {
      e.preventDefault();
      alert('Please add at least 1 dish to your menu before continuing to preview.');
      return;
    }
    // Dishes are already synced to localStorage
  });

  // Initial Rendering
  renderDishesGrid();
  syncPhonePreview();
});
