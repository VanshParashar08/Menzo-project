// ============================================================
// MENZO DEFAULT RESTAURANT & MENU DATA
// Preloaded with Top 50+ Most Ordered Dishes in Indian Restaurants & Cafes
// ============================================================

import { ALL_TRAINED_DISHES } from './trainedDishes.js';

export function getDefaultIndianCategories() {
  const categoryDefs = [
    {
      id: 'cat-starters',
      name: 'Starters & Tandoori',
      desc: 'Smoky tandoori kebabs, crispy appetizers and chef special platters',
      filter: d => d.category === 'Starters & Tandoori'
    },
    {
      id: 'cat-mains',
      name: 'Main Course (Gravies)',
      desc: 'Rich buttery curries, slow-cooked dal, and royal paneer gravies',
      filter: d => d.category === 'Main Course'
    },
    {
      id: 'cat-biryani',
      name: 'Biryani & Rice',
      desc: 'Authentic dum cooked biryanis and fragrant aged basmati rice',
      filter: d => d.category === 'Biryani & Rice'
    },
    {
      id: 'cat-breads',
      name: 'Indian Breads & Sides',
      desc: 'Freshly baked tandoori naans, flaky parathas and raitas',
      filter: d => d.category === 'Indian Breads'
    },
    {
      id: 'cat-south',
      name: 'South Indian Classics',
      desc: 'Crispy ghee roast dosas, fluffy idlis and steaming sambhar',
      filter: d => d.category === 'South Indian'
    },
    {
      id: 'cat-street',
      name: 'Street Food & Chaats',
      desc: 'Mumbai pav bhaji, Delhi chole bhature and savory chaats',
      filter: d => d.category === 'Street Food & Chaat'
    },
    {
      id: 'cat-chinese',
      name: 'Indo-Chinese Specials',
      desc: 'Wok-tossed noodles, spicy chilli gravies and crispy manchurian',
      filter: d => d.category === 'Indo-Chinese'
    },
    {
      id: 'cat-cafe',
      name: 'Café & Beverages',
      desc: 'Artisan cold brews, masala chai, thick shakes and lassis',
      filter: d => d.category === 'Café & Beverages'
    },
    {
      id: 'cat-desserts',
      name: 'Desserts & Sweets',
      desc: 'Traditional Indian sweet delicacies in desi ghee and saffron',
      filter: d => d.category === 'Desserts'
    }
  ];

  return categoryDefs.map(cat => ({
    id: cat.id,
    name: cat.name,
    desc: cat.desc,
    items: ALL_TRAINED_DISHES.filter(cat.filter).map(dish => ({
      id: dish.id,
      name: dish.name,
      desc: dish.desc,
      price: dish.price,
      img: dish.img,
      isVeg: dish.isVeg,
      bestseller: dish.tag === 'BESTSELLER',
      badge: dish.tag,
      rating: 4.8 + Math.round(Math.random() * 2) / 10,
      votes: Math.floor(120 + Math.random() * 280)
    }))
  }));
}

export const defaultRestaurant = {
  name: "The Food Club",
  tagline: "Authentic Indian Flavours & Café",
  cuisine: "North Indian, South Indian, Tandoori & Café",
  address: "42 Heritage Boulevard, Connaught Place",
  phone: "+91 98765 43210",
  wifi: "MenzoGuest / welcome2026",
  currency: "₹",
  tableNumber: "Table 04",
  themeColor: "#F4512A",
  fontStyle: "Plus Jakarta Sans",
  qrSettings: {
    fgColor: "#111827",
    bgColor: "#FFFFFF",
    frameText: "SCAN FOR DIGITAL MENU",
    frameStyle: "badge-top",
    logo: "utensils",
    showLogo: true,
  },
  categories: getDefaultIndianCategories()
};

export const STORAGE_KEY = "menu_qr_restaurant_data";

export function loadRestaurantData() {
  const storedName = localStorage.getItem('menzo_restaurant_name') || defaultRestaurant.name;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        data.name = storedName;
        return data;
      }
    }
  } catch (e) {
    console.warn("Could not load stored data, using defaults", e);
  }

  const initial = {
    ...defaultRestaurant,
    name: storedName,
    categories: getDefaultIndianCategories()
  };

  // Save to localStorage so studio editor and simulator immediately have data
  saveRestaurantData(initial);
  return initial;
}

export function saveRestaurantData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}
