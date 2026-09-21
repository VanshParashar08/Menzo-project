// ============================================================
// MENZO DISH LIBRARY & MENU ITEM SERVICE
// Centralized dish catalog (1,000+ authentic items) and MenuItem data model
// supporting single pricing, variants, add-ons, and image priority.
// ============================================================

import { ALL_TRAINED_DISHES, TRAINED_CATEGORIES } from '../data/trainedDishes.js';

const STORAGE_KEY_MENU = 'menzo_restaurant_menu_items';

/**
 * Standard templates for popular variants
 */
export const VARIANT_PRESETS = [
  {
    name: 'Half / Full',
    variants: [
      { id: 'var_half', name: 'Half', priceOffset: 0, isAvailable: true },
      { id: 'var_full', name: 'Full', priceOffset: 120, isAvailable: true }
    ]
  },
  {
    name: 'Portions (4 / 8 Pcs)',
    variants: [
      { id: 'var_4pc', name: '4 Pieces', priceOffset: 0, isAvailable: true },
      { id: 'var_8pc', name: '8 Pieces', priceOffset: 240, isAvailable: true }
    ]
  },
  {
    name: 'Volume (250ml / 500ml)',
    variants: [
      { id: 'var_250ml', name: '250 ml', priceOffset: 0, isAvailable: true },
      { id: 'var_500ml', name: '500 ml', priceOffset: 50, isAvailable: true }
    ]
  },
  {
    name: 'Size (Small / Medium / Large)',
    variants: [
      { id: 'var_sm', name: 'Small', priceOffset: 0, isAvailable: true },
      { id: 'var_med', name: 'Medium', priceOffset: 80, isAvailable: true },
      { id: 'var_lg', name: 'Large', priceOffset: 150, isAvailable: true }
    ]
  }
];

/**
 * Standard add-on suggestions by category
 */
export const CATEGORY_ADDON_SUGGESTIONS = {
  'North Indian': [
    { id: 'addon_extra_gravy', name: 'Extra Gravy', price: 50, isAvailable: true },
    { id: 'addon_extra_chicken', name: 'Extra Chicken', price: 100, isAvailable: true },
    { id: 'addon_butter_naan', name: 'Butter Naan (1 pc)', price: 40, isAvailable: true },
    { id: 'addon_garlic_naan', name: 'Garlic Naan (1 pc)', price: 50, isAvailable: true }
  ],
  'Punjabi & Mughlai': [
    { id: 'addon_extra_gravy', name: 'Extra Gravy', price: 50, isAvailable: true },
    { id: 'addon_extra_meat', name: 'Extra Meat', price: 120, isAvailable: true },
    { id: 'addon_butter_roti', name: 'Butter Roti (2 pcs)', price: 40, isAvailable: true },
    { id: 'addon_sirka_onion', name: 'Extra Sirka Onions', price: 20, isAvailable: true }
  ],
  'Biryani & Rice': [
    { id: 'addon_extra_salan', name: 'Mirchi Ka Salan', price: 40, isAvailable: true },
    { id: 'addon_extra_raita', name: 'Boondi Raita', price: 40, isAvailable: true },
    { id: 'addon_boiled_egg', name: 'Boiled Egg (1 pc)', price: 30, isAvailable: true }
  ],
  'Indian Street Food': [
    { id: 'addon_extra_pav', name: 'Extra Pav (Pair)', price: 30, isAvailable: true },
    { id: 'addon_extra_bhatura', name: 'Extra Bhatura (1 pc)', price: 50, isAvailable: true },
    { id: 'addon_extra_cheese', name: 'Extra Grated Cheese', price: 40, isAvailable: true }
  ],
  'Beverages': [
    { id: 'addon_ice_cream_scoop', name: 'Vanilla Ice Cream Scoop', price: 50, isAvailable: true },
    { id: 'addon_extra_shot', name: 'Extra Espresso Shot', price: 40, isAvailable: true }
  ]
};

/**
 * Normalized Dish Library access
 */
import { FALLBACK_DEFAULT_IMAGE } from './imageProvider.js';

export function getDishLibrary() {
  return ALL_TRAINED_DISHES.map(d => ({
    dishLibraryId: d.id,
    name: d.name,
    category: d.category || 'North Indian',
    price: d.price || 220,
    isVegetarian: d.isVeg !== false,
    defaultImage: d.img || FALLBACK_DEFAULT_IMAGE,
    description: d.desc || `Authentic ${d.name} prepared fresh with traditional spices.`
  }));
}

/**
 * Search the dish library by query and category
 */
export function searchDishLibrary(query = '', category = '') {
  const library = getDishLibrary();
  const q = query.trim().toLowerCase();

  return library.filter(dish => {
    if (category && category !== 'All' && category !== 'Popular') {
      if (dish.category.toLowerCase() !== category.toLowerCase()) return false;
    }

    if (!q) return true;

    // Name match
    if (dish.name.toLowerCase().includes(q)) return true;
    // Category match
    if (dish.category.toLowerCase().includes(q)) return true;
    // Description match
    if (dish.description.toLowerCase().includes(q)) return true;

    return false;
  });
}

/**
 * Build a canonical MenuItem object with sensible defaults
 */
export function createMenuItem(data = {}, restaurantId = 'default') {
  const isVariants = data.pricingType === 'variants' && Array.isArray(data.variants) && data.variants.length > 0;
  const basePrice = Number(data.price) || 200;

  return {
    id: data.id || `dish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    restaurantId: data.restaurantId || restaurantId,
    dishLibraryId: data.dishLibraryId || null,
    name: data.name || 'Untitled Dish',
    description: data.description || '',
    category: data.category || 'Starters',
    imageUrl: data.imageUrl || data.defaultImage || FALLBACK_DEFAULT_IMAGE,
    imageSource: data.imageSource || 'default', // 'default' | 'restaurant' | 'ai_generated'
    pricingType: isVariants ? 'variants' : 'single',
    price: basePrice,
    variants: isVariants ? data.variants.map((v, i) => ({
      id: v.id || `var_${i + 1}`,
      name: v.name || `Option ${i + 1}`,
      price: Number(v.price) || basePrice,
      isAvailable: v.isAvailable !== false
    })) : [],
    addOns: Array.isArray(data.addOns) ? data.addOns.map((a, i) => ({
      id: a.id || `addon_${i + 1}`,
      name: a.name || `Add-on ${i + 1}`,
      price: Number(a.price) || 0,
      isAvailable: a.isAvailable !== false
    })) : (CATEGORY_ADDON_SUGGESTIONS[data.category] || []),
    isAvailable: data.isAvailable !== false,
    isVegetarian: data.isVegetarian !== false,
    isBestseller: Boolean(data.isBestseller),
    isSpicy: Boolean(data.isSpicy),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Load all menu items for a restaurant with fallback seed
 */
export function getRestaurantMenuItems(restaurantId = 'default') {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_MENU}_${restaurantId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[DishLibrary] Error loading menu items:', e);
  }

  return [];
}

/**
 * Save menu items list to localStorage
 */
export function saveRestaurantMenuItems(restaurantId = 'default', items = []) {
  try {
    localStorage.setItem(`${STORAGE_KEY_MENU}_${restaurantId}`, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('menzo_menu_updated', { detail: { restaurantId, items } }));
  } catch (e) {
    console.error('[DishLibrary] Error saving menu items:', e);
  }
}
