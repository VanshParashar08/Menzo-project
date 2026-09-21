/**
 * Menzo Onboarding — Step 3: Setup Menu Logic
 * Pixel-Perfect Implementation matching User Reference Screenshot
 */

import { ALL_TRAINED_DISHES } from './data/trainedDishes.js';
import confetti from 'canvas-confetti';
import { createMenuItem, saveRestaurantMenuItems, VARIANT_PRESETS } from './services/dishLibraryService.js';
import { ImageProvider, FALLBACK_DEFAULT_IMAGE } from './services/imageProvider.js';

// Dishes Catalog — Preloaded with Top 50+ authentic Indian restaurant & café favorites
export const POPULAR_REFERENCE_DISHES = [...ALL_TRAINED_DISHES].sort((a, b) => {
  const getWeight = (dish) => {
    if (dish.tag === 'BESTSELLER') return 0;
    if (dish.tag === 'POPULAR') return 1;
    if (dish.tag === 'CHEF SPECIAL') return 2;
    return 3;
  };
  return getWeight(a) - getWeight(b);
});

const QUICK_START_SUGGESTIONS = [
  { id: 'dish-butter-chicken', name: 'Butter Chicken', category: 'Main Course', price: 360, isVeg: false, img: '/images/dishes/butter_chicken.jpg', tag: 'BESTSELLER' },
  { id: 'dish-paneer-tikka', name: 'Paneer Tikka', category: 'Starters & Tandoori', price: 299, isVeg: true, img: '/images/dishes/paneer_tikka.jpg', tag: 'BESTSELLER' },
  { id: 'dish-masala-dosa', name: 'Masala Dosa', category: 'South Indian', price: 160, isVeg: true, img: '/images/dishes/masala_dosa.jpg', tag: 'BESTSELLER' },
  { id: 'dish-cold-coffee', name: 'Cold Coffee', category: 'Café & Beverages', price: 150, isVeg: true, img: '/images/dishes/cold_coffee.jpg', tag: 'BESTSELLER' },
  { id: 'dish-masala-chai', name: 'Masala Chai', category: 'Café & Beverages', price: 60, isVeg: true, img: '/images/dishes/masala_chai.jpg', tag: 'BESTSELLER' }
];

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
  // 1. Sync restaurant name & initial avatar
  const savedRestName = localStorage.getItem('menzo_restaurant_name') || 'My Restaurant';
  const headerRestNameEl = document.getElementById('header-rest-name');
  const userAvatarInitialEl = document.getElementById('user-avatar-initial');
  if (headerRestNameEl) headerRestNameEl.textContent = savedRestName;
  if (userAvatarInitialEl) {
    userAvatarInitialEl.textContent = savedRestName.trim().charAt(0).toUpperCase() || 'R';
  }

  // 2. DOM Elements
  const dishesGrid = document.getElementById('dishes-grid');
  const searchInput = document.getElementById('dishes-search-input');
  const clearSearchBtn = document.getElementById('btn-clear-search');
  const categoryPillsRow = document.getElementById('category-pills-row');
  const navSelectionSummary = document.getElementById('nav-selection-summary');
  const btnNextPreview = document.getElementById('btn-next-preview');
  const btnSidebarUpgradePro = document.getElementById('btn-sidebar-upgrade-pro');

  // Modals
  const modalAddCustom = document.getElementById('modal-add-custom');
  const btnAddCustom = document.getElementById('btn-add-custom');
  const btnCloseCustom = document.getElementById('btn-close-custom-modal');
  const btnCancelCustom = document.getElementById('btn-cancel-custom-modal');
  const formAddCustom = document.getElementById('form-add-custom-dish');

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
  const selectedDishes = new Map(); // id -> dishObject

  // Initialize selected dishes from localStorage or seed with iconic bestsellers
  const savedDishesJson = localStorage.getItem('menzo_selected_dishes');
  if (savedDishesJson) {
    try {
      const saved = JSON.parse(savedDishesJson);
      if (Array.isArray(saved) && saved.length > 0) {
        saved.forEach(d => selectedDishes.set(d.id, d));
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // If no saved selection exists yet, preload top 6 most ordered bestsellers
  if (selectedDishes.size === 0) {
    const topBestsellerIds = [
      'dish-butter-chicken',
      'dish-dal-makhani',
      'dish-paneer-butter-masala',
      'dish-chicken-biryani',
      'dish-masala-dosa',
      'dish-cold-coffee'
    ];
    ALL_TRAINED_DISHES.forEach(dish => {
      if (topBestsellerIds.includes(dish.id)) {
        selectedDishes.set(dish.id, dish);
      }
    });
    localStorage.setItem('menzo_selected_dishes', JSON.stringify(Array.from(selectedDishes.values())));
  }

  // 4. Filter & Search Logic
  function getFilteredDishes() {
    // If search query is present
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const combined = [...POPULAR_REFERENCE_DISHES, ...ALL_TRAINED_DISHES];
      // Deduplicate by ID
      const seen = new Set();
      return combined.filter(d => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return (
          d.name.toLowerCase().includes(q) ||
          (d.category && d.category.toLowerCase().includes(q)) ||
          (d.tag && d.tag.toLowerCase().includes(q)) ||
          (d.desc && d.desc.toLowerCase().includes(q))
        );
      });
    }

    // Category filter
    if (activeCategory === 'Popular') {
      return POPULAR_REFERENCE_DISHES;
    }

    const catQuery = activeCategory.toLowerCase();

    // Map pills to matching dishes in catalog
    return ALL_TRAINED_DISHES.filter(d => {
      const dishCat = (d.category || '').toLowerCase();
      const dishName = (d.name || '').toLowerCase();
      const dishTag = (d.tag || '').toLowerCase();

      if (catQuery === 'north indian') {
        return dishCat === 'starters & tandoori' || dishCat === 'main course' || dishCat === 'indian breads';
      }
      if (catQuery === 'south indian') {
        return dishCat === 'south indian' || dishName.includes('dosa') || dishName.includes('idli') || dishName.includes('vada') || dishName.includes('rasam');
      }
      if (catQuery === 'punjabi & mughlai') {
        return dishCat === 'main course' || dishCat === 'starters & tandoori' || dishCat === 'biryani & rice' ||
               dishTag.includes('punjabi') || dishTag.includes('royal') || dishName.includes('butter chicken') ||
               dishName.includes('dal makhani') || dishName.includes('chole') || dishName.includes('naan');
      }
      if (catQuery === 'biryani & rice') {
        return dishCat === 'biryani & rice' || dishName.includes('biryani') || dishName.includes('rice') || dishName.includes('pulao');
      }
      if (catQuery === 'indian street food' || catQuery === 'street food' || catQuery === 'chaats & snacks') {
        return dishCat === 'street food & chaat' || dishName.includes('pav') || dishName.includes('chaat') || dishName.includes('samosa') || dishName.includes('pakora');
      }
      if (catQuery === 'indo-chinese') {
        return dishCat === 'indo-chinese' || dishName.includes('chilli') || dishName.includes('noodles') || dishName.includes('manchurian');
      }
      if (catQuery === 'desserts & mithai' || catQuery === 'desserts') {
        return dishCat === 'desserts' || dishName.includes('jamun') || dishName.includes('rasmalai') || dishName.includes('kulfi') || dishName.includes('halwa');
      }
      if (catQuery === 'beverages' || catQuery === 'café & beverages') {
        return dishCat === 'café & beverages' || dishName.includes('coffee') || dishName.includes('chai') || dishName.includes('tea') || dishName.includes('shake') || dishName.includes('lassi');
      }

      return dishCat.includes(catQuery) || dishTag.includes(catQuery) || dishName.includes(catQuery);
    });
  }

  function addQuickStarterDish(dish) {
    const normalizedDish = {
      ...dish,
      id: dish.id,
      img: dish.img || FALLBACK_DEFAULT_IMAGE,
      tag: dish.tag || 'POPULAR'
    };

    const existingInCatalog = POPULAR_REFERENCE_DISHES.find(item => item.id === normalizedDish.id);
    if (!existingInCatalog) {
      POPULAR_REFERENCE_DISHES.unshift(normalizedDish);
    }

    selectedDishes.set(normalizedDish.id, normalizedDish);
    showToast(`Added "${normalizedDish.name}" to your menu`);
    renderDishesGrid();
    updateSelectionSummary();
  }

  // 5. Render 4-Column Grid
  function renderDishesGrid() {
    if (!dishesGrid) return;
    const dishes = getFilteredDishes();

    if (dishes.length === 0) {
      dishesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: #F9FAFB; border-radius: 14px; border: 1.5px dashed #E5E7EB;">
          <p style="font-size: 15px; font-weight: 700; color: #111820; margin: 0 0 6px 0;">No dishes in menu yet</p>
          <p style="font-size: 13px; color: #6B7280; margin: 0 0 16px 0;">Start with your best sellers, then add more custom dishes as you go.</p>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 16px;">
            ${QUICK_START_SUGGESTIONS.map(dish => `
              <button type="button" class="starter-suggestion-btn" data-quick-dish-id="${dish.id}" style="padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: 999px; background: #fff; color: #111820; font-weight: 600; font-size: 12px; cursor: pointer;">
                ${dish.name}
              </button>
            `).join('')}
          </div>
          <button type="button" class="modal-submit-btn" id="btn-empty-add-custom" style="display: inline-block;">+ Add Custom Dish</button>
        </div>
      `;

      document.getElementById('btn-empty-add-custom')?.addEventListener('click', () => {
        openAddCustomModal(searchQuery);
      });

      dishesGrid.querySelectorAll('[data-quick-dish-id]').forEach(button => {
        button.addEventListener('click', () => {
          const dish = QUICK_START_SUGGESTIONS.find(item => item.id === button.dataset.quickDishId);
          if (dish) addQuickStarterDish(dish);
        });
      });
      return;
    }

    dishesGrid.innerHTML = dishes.map(dish => {
      const isSelected = selectedDishes.has(dish.id);

      return `
        <div class="dish-card ${isSelected ? 'is-added' : ''}" data-id="${dish.id}" data-name="${dish.name}" data-price="${dish.price}" data-veg="${dish.isVeg}" data-img="${dish.img}" data-category="${dish.category}">
          <div class="dish-img-wrap">
            <img src="${dish.img || FALLBACK_DEFAULT_IMAGE}" alt="${dish.name}" class="dish-photo" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_DEFAULT_IMAGE}';" />
          </div>
          <div class="dish-body">
            <div class="dish-name-row">
              <span class="dish-title" title="${dish.name}">${dish.name}</span>
              <span class="diet-icon ${dish.isVeg ? 'veg-icon' : 'non-veg-icon'}" title="${dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
                ${dish.isVeg ? '<span class="dot"></span>' : '<span class="triangle"></span>'}
              </span>
            </div>
            <div class="dish-bottom-row">
              <button type="button" class="dish-add-btn ${isSelected ? 'added-state' : ''}" data-action="toggle">
                ${isSelected ? 'Added' : '+ Add'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 6. Update Selection Summary
  function updateSelectionSummary() {
    if (navSelectionSummary) {
      navSelectionSummary.textContent = selectedDishes.size === 0
        ? '0 dishes selected'
        : `${selectedDishes.size} dishes selected`;
    }

    // Save to localStorage
    localStorage.setItem('menzo_selected_dishes', JSON.stringify(Array.from(selectedDishes.values())));
  }

  // 7. Grid Click Handling (Toggle + Add)
  dishesGrid?.addEventListener('click', (e) => {
    const btn = e.target.closest('.dish-add-btn');
    if (!btn) return;

    const card = btn.closest('.dish-card');
    if (!card) return;

    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = Number(card.dataset.price || 200);
    const isVeg = card.dataset.veg === 'true';
    const img = card.dataset.img;
    const category = card.dataset.category || 'Special';

    if (selectedDishes.has(id)) {
      // Remove
      selectedDishes.delete(id);
      card.classList.remove('is-added');
      btn.classList.remove('added-state');
      btn.textContent = '+ Add';
      showToast(`Removed "${name}" from menu`);
    } else {
      // Add
      selectedDishes.set(id, { id, name, price, isVeg, img, category });
      card.classList.add('is-added');
      btn.classList.add('added-state');
      btn.textContent = 'Added';
      showToast(`Added "${name}"`);
    }

    updateSelectionSummary();
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

  // 10. Sidebar Upgrade to Pro
  btnSidebarUpgradePro?.addEventListener('click', () => {
    try {
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
    } catch (e) {}
    window.location.href = '/choose-plan.html';
  });

  // 11. Add Custom Dish Modal Handlers (2-Column with Upload, AI Photo, Variants & Add-ons)
  let customDishImage = null; // { url: string, source: 'restaurant' | 'ai_generated' | 'default' }
  let customVariants = [];
  let customAddOns = [];
  let customIsVeg = true;
  let customIsSpicy = false;
  let customIsBestseller = false;

  const descInput = document.getElementById('custom-dish-desc');
  const descCounter = document.getElementById('custom-desc-counter');
  descInput?.addEventListener('input', () => {
    if (descCounter) {
      descCounter.textContent = `${descInput.value.length}/200`;
    }
  });

  // Photo Upload Handlers
  const photoInput = document.getElementById('custom-dish-photo-input');
  const btnChooseImage = document.getElementById('btn-choose-image');
  const emptyUploadState = document.getElementById('upload-empty-state');
  const previewUploadState = document.getElementById('upload-preview-state');
  const previewImgEl = document.getElementById('custom-dish-preview-img');
  const previewBadgeEl = document.getElementById('preview-source-badge');
  const btnPreviewRemove = document.getElementById('btn-preview-remove');
  const btnPreviewChange = document.getElementById('btn-preview-change');
  btnChooseImage?.addEventListener('click', () => photoInput?.click());
  btnPreviewChange?.addEventListener('click', () => photoInput?.click());

  photoInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      customDishImage = {
        url: event.target.result,
        source: 'restaurant'
      };
      if (previewImgEl) previewImgEl.src = customDishImage.url;
      if (previewBadgeEl) previewBadgeEl.textContent = 'Custom Photo';
      if (emptyUploadState) emptyUploadState.style.display = 'none';
      if (previewUploadState) previewUploadState.style.display = 'flex';
      showToast('Photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  });

  btnPreviewRemove?.addEventListener('click', () => {
    customDishImage = null;
    if (photoInput) photoInput.value = '';
    if (emptyUploadState) emptyUploadState.style.display = 'flex';
    if (previewUploadState) previewUploadState.style.display = 'none';
    if (previewImgEl) previewImgEl.src = '';
  });

  // Pricing Switch (Single Price vs Multiple Variants)
  const singlePriceRow = document.getElementById('single-price-row');
  const variantsSection = document.getElementById('variants-section');
  const pricingTypeRadios = document.querySelectorAll('input[name="custom-pricing-type"]');

  pricingTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'single') {
        if (singlePriceRow) singlePriceRow.style.display = 'grid';
        if (variantsSection) variantsSection.style.display = 'none';
      } else {
        if (singlePriceRow) singlePriceRow.style.display = 'none';
        if (variantsSection) variantsSection.style.display = 'flex';
        if (customVariants.length === 0) {
          applyVariantPreset('half_full');
        }
      }
    });
  });

  // Variants Manager
  const variantsListContainer = document.getElementById('variants-list-container');
  const btnAddVariantRow = document.getElementById('btn-add-variant-row');

  function renderVariantRows() {
    if (!variantsListContainer) return;
    variantsListContainer.innerHTML = customVariants.map((v, idx) => `
      <div class="variant-builder-row" data-index="${idx}">
        <input type="text" class="var-name-input" value="${v.name}" placeholder="e.g. Half, 4 Pcs" required />
        <input type="number" class="var-price-input" value="${v.price}" placeholder="₹ Price" min="1" step="5" required />
        <button type="button" class="btn-delete-row" data-action="delete-var" aria-label="Delete variant">&times;</button>
      </div>
    `).join('');
  }

  function applyVariantPreset(presetKey) {
    const basePrice = Number(document.getElementById('custom-dish-price')?.value) || 220;
    if (presetKey === 'half_full') {
      customVariants = [
        { id: 'v_half', name: 'Half', price: basePrice },
        { id: 'v_full', name: 'Full', price: basePrice + 120 }
      ];
    } else if (presetKey === 'portions') {
      customVariants = [
        { id: 'v_4pc', name: '4 Pieces', price: basePrice },
        { id: 'v_8pc', name: '8 Pieces', price: basePrice + 240 }
      ];
    } else if (presetKey === 'size') {
      customVariants = [
        { id: 'v_sm', name: 'Small', price: Math.max(80, basePrice - 40) },
        { id: 'v_med', name: 'Medium', price: basePrice },
        { id: 'v_lg', name: 'Large', price: basePrice + 80 }
      ];
    }
    renderVariantRows();
  }

  document.querySelectorAll('.btn-preset-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      applyVariantPreset(btn.dataset.preset);
    });
  });

  btnAddVariantRow?.addEventListener('click', () => {
    customVariants.push({
      id: `v_${Date.now()}`,
      name: `Option ${customVariants.length + 1}`,
      price: 150
    });
    renderVariantRows();
  });

  variantsListContainer?.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-action="delete-var"]');
    if (!delBtn) return;
    const row = delBtn.closest('.variant-builder-row');
    const idx = Number(row?.dataset?.index);
    if (!isNaN(idx)) {
      customVariants.splice(idx, 1);
      renderVariantRows();
    }
  });

  variantsListContainer?.addEventListener('input', (e) => {
    const row = e.target.closest('.variant-builder-row');
    const idx = Number(row?.dataset?.index);
    if (isNaN(idx) || !customVariants[idx]) return;

    if (e.target.classList.contains('var-name-input')) {
      customVariants[idx].name = e.target.value;
    } else if (e.target.classList.contains('var-price-input')) {
      customVariants[idx].price = Number(e.target.value) || 0;
    }
  });

  // Add-ons Manager
  const btnToggleAddons = document.getElementById('btn-toggle-addons');
  const addonsListContainer = document.getElementById('addons-list-container');
  const addonsRowsWrap = document.getElementById('addons-rows-wrap');
  const btnAddAddonRow = document.getElementById('btn-add-addon-row');

  btnToggleAddons?.addEventListener('click', () => {
    const isHidden = addonsListContainer.style.display === 'none';
    addonsListContainer.style.display = isHidden ? 'flex' : 'none';
    if (isHidden && customAddOns.length === 0) {
      customAddOns = [
        { id: 'addon_extra_gravy', name: 'Extra Gravy', price: 50 },
        { id: 'addon_butter_naan', name: 'Butter Naan (1 pc)', price: 40 }
      ];
      renderAddonRows();
    }
  });

  function renderAddonRows() {
    if (!addonsRowsWrap) return;
    addonsRowsWrap.innerHTML = customAddOns.map((a, idx) => `
      <div class="variant-builder-row" data-index="${idx}" style="margin-bottom: 6px;">
        <input type="text" class="addon-name-input" value="${a.name}" placeholder="e.g. Extra Gravy" required />
        <input type="number" class="addon-price-input" value="${a.price}" placeholder="₹ Price" min="0" step="5" required />
        <button type="button" class="btn-delete-row" data-action="delete-addon" aria-label="Delete add-on">&times;</button>
      </div>
    `).join('');
  }

  btnAddAddonRow?.addEventListener('click', () => {
    customAddOns.push({
      id: `a_${Date.now()}`,
      name: '',
      price: 30
    });
    renderAddonRows();
  });

  addonsRowsWrap?.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-action="delete-addon"]');
    if (!delBtn) return;
    const row = delBtn.closest('.variant-builder-row');
    const idx = Number(row?.dataset?.index);
    if (!isNaN(idx)) {
      customAddOns.splice(idx, 1);
      renderAddonRows();
    }
  });

  addonsRowsWrap?.addEventListener('input', (e) => {
    const row = e.target.closest('.variant-builder-row');
    const idx = Number(row?.dataset?.index);
    if (isNaN(idx) || !customAddOns[idx]) return;

    if (e.target.classList.contains('addon-name-input')) {
      customAddOns[idx].name = e.target.value;
    } else if (e.target.classList.contains('addon-price-input')) {
      customAddOns[idx].price = Number(e.target.value) || 0;
    }
  });

  // Dietary & Attribute Pills
  const pillVeg = document.getElementById('pill-veg');
  const pillNonVeg = document.getElementById('pill-nonveg');
  const pillSpicy = document.getElementById('pill-spicy');
  const pillBestseller = document.getElementById('pill-bestseller');

  pillVeg?.addEventListener('click', () => {
    customIsVeg = true;
    pillVeg.classList.add('active');
    pillNonVeg?.classList.remove('active');
  });

  pillNonVeg?.addEventListener('click', () => {
    customIsVeg = false;
    pillNonVeg.classList.add('active');
    pillVeg?.classList.remove('active');
  });

  pillSpicy?.addEventListener('click', () => {
    customIsSpicy = !customIsSpicy;
    pillSpicy.classList.toggle('active', customIsSpicy);
  });

  pillBestseller?.addEventListener('click', () => {
    customIsBestseller = !customIsBestseller;
    pillBestseller.classList.toggle('active', customIsBestseller);
  });

  // Modal Open / Reset
  function openAddCustomModal(prefillName = '') {
    if (modalAddCustom) {
      modalAddCustom.style.display = 'flex';
      const nameInput = document.getElementById('custom-dish-name');
      if (nameInput) {
        nameInput.value = prefillName;
        nameInput.focus();
      }

      // Reset Image state
      customDishImage = null;
      if (photoInput) photoInput.value = '';
      if (emptyUploadState) emptyUploadState.style.display = 'flex';
      if (previewUploadState) previewUploadState.style.display = 'none';

      // Reset Dietary
      customIsVeg = true;
      customIsSpicy = false;
      customIsBestseller = false;
      pillVeg?.classList.add('active');
      pillNonVeg?.classList.remove('active');
      pillSpicy?.classList.remove('active');
      pillBestseller?.classList.remove('active');

      // Reset Description
      if (descInput) descInput.value = '';
      if (descCounter) descCounter.textContent = '0/200';

      // Reset Pricing Type
      const singleRadio = document.querySelector('input[name="custom-pricing-type"][value="single"]');
      if (singleRadio) singleRadio.checked = true;
      if (singlePriceRow) singlePriceRow.style.display = 'grid';
      if (variantsSection) variantsSection.style.display = 'none';
      customVariants = [];
      customAddOns = [];
      if (addonsListContainer) addonsListContainer.style.display = 'none';
    }
  }

  btnAddCustom?.addEventListener('click', () => openAddCustomModal());
  btnCloseCustom?.addEventListener('click', () => { modalAddCustom.style.display = 'none'; });
  btnCancelCustom?.addEventListener('click', () => { modalAddCustom.style.display = 'none'; });

  // Form Submit Handler
  formAddCustom?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('custom-dish-name').value.trim();
    if (!name) return;

    const pricingType = document.querySelector('input[name="custom-pricing-type"]:checked')?.value || 'single';
    let category = 'North Indian';
    let price = 220;
    let variants = [];

    if (pricingType === 'single') {
      category = document.getElementById('custom-dish-category')?.value || 'North Indian';
      price = Number(document.getElementById('custom-dish-price')?.value) || 200;
    } else {
      category = document.getElementById('custom-variants-category')?.value || 'North Indian';
      if (customVariants.length === 0) {
        showToast('Please add at least one variant option');
        return;
      }
      variants = customVariants.map(v => ({
        id: v.id,
        name: v.name.trim() || 'Standard',
        price: Number(v.price) || 200,
        isAvailable: true
      }));
      price = variants[0].price;
    }

    const description = descInput?.value?.trim() || `Freshly prepared ${name} with authentic spices.`;

    // Strict Image Priority:
    // 1. Restaurant uploaded image
    // 2. AI-generated image
    // 3. Default library image
    let imageUrl = '';
    let imageSource = 'default';

    if (customDishImage?.url) {
      imageUrl = customDishImage.url;
      imageSource = customDishImage.source;
    } else {
      imageUrl = ImageProvider.getImage(name);
      imageSource = 'default';
    }

    const addOns = customAddOns.filter(a => a.name.trim().length > 0).map(a => ({
      id: a.id,
      name: a.name.trim(),
      price: Number(a.price) || 0,
      isAvailable: true
    }));

    const newMenuItem = createMenuItem({
      id: `dish-${Date.now()}`,
      restaurantId: savedRestName,
      name,
      description,
      category,
      imageUrl,
      imageSource,
      pricingType,
      price,
      variants,
      addOns,
      isVegetarian: customIsVeg,
      isSpicy: customIsSpicy,
      isBestseller: customIsBestseller,
      isAvailable: true
    }, savedRestName);

    // Format for setup-menu UI cards
    const displayCardItem = {
      id: newMenuItem.id,
      name: newMenuItem.name,
      category: newMenuItem.category,
      price: newMenuItem.price,
      isVeg: newMenuItem.isVegetarian,
      img: newMenuItem.imageUrl,
      tag: newMenuItem.category.toUpperCase(),
      pricingType: newMenuItem.pricingType,
      variants: newMenuItem.variants,
      addOns: newMenuItem.addOns,
      isBestseller: newMenuItem.isBestseller,
      isSpicy: newMenuItem.isSpicy,
      description: newMenuItem.description
    };

    POPULAR_REFERENCE_DISHES.unshift(displayCardItem);
    selectedDishes.set(newMenuItem.id, displayCardItem);

    modalAddCustom.style.display = 'none';

    // Sync menu items in restaurant storage so live menu gets them
    const existingMenuItems = Array.from(selectedDishes.values()).map(d => createMenuItem(d, savedRestName));
    saveRestaurantMenuItems(savedRestName, existingMenuItems);

    showToast(`Added custom dish "${name}" (₹${price})`);
    renderDishesGrid();
    updateSelectionSummary();
  });

  // 12. Next: Preview validation & persist
  btnNextPreview?.addEventListener('click', (e) => {
    if (selectedDishes.size === 0) {
      e.preventDefault();
      alert('Please add at least 1 dish to your menu before continuing to preview.');
      return;
    }
    const menuItems = Array.from(selectedDishes.values()).map(d => createMenuItem(d, savedRestName));
    saveRestaurantMenuItems(savedRestName, menuItems);
    localStorage.setItem('menzo_selected_dishes', JSON.stringify(Array.from(selectedDishes.values())));
  });

  // Initial Rendering
  renderDishesGrid();
  updateSelectionSummary();
});
}
