import { loadRestaurantData } from './data/defaultMenu.js';
import { renderCustomerMenu } from './components/renderCustomerMenu.js';
import { getRestaurantMenuItems } from './services/dishLibraryService.js';
import { resolveTableParam } from './services/tableService.js';

document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('customer-menu-mount');
  if (!mount) return;

  // 1. Load base restaurant data
  const restaurant = loadRestaurantData();

  // 2. Check URL params or localStorage overrides
  const urlParams = new URLSearchParams(window.location.search);
  const paramRestName = urlParams.get('restaurant');
  const savedRestName = localStorage.getItem('menzo_restaurant_name');
  if (paramRestName) {
    restaurant.name = paramRestName;
  } else if (savedRestName) {
    restaurant.name = savedRestName;
  } else {
    restaurant.name = "Rohan's Café";
  }

  // 3. Resolve table number from query parameter (e.g. ?t=3, ?table=T3)
  const rawTableParam = urlParams.get('t') || urlParams.get('table');
  if (rawTableParam) {
    const resolvedTable = resolveTableParam(rawTableParam);
    restaurant.tableNumber = resolvedTable ? resolvedTable.label : `Table ${rawTableParam}`;
  }

  // Clear any legacy mock dishes from local storage so menu is completely empty
  try {
    localStorage.removeItem('menu_qr_restaurant_data');
    localStorage.removeItem('menzo_selected_dishes');
    ['default', "Rohan's Café", "The Food Club", "The Burger House", restaurant.name].forEach(name => {
      localStorage.removeItem(`menzo_restaurant_menu_items_${name}`);
    });
  } catch (e) {}

  // 4. All dishes removed from menu - starts completely clean
  const fullMenuItems = getRestaurantMenuItems(restaurant.name);

  // Group into categories (empty if no dishes added)
  const catMap = {};
  fullMenuItems.forEach(dish => {
    const catName = dish.category || "Starters";
    if (!catMap[catName]) {
      catMap[catName] = [];
    }
    catMap[catName].push({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      pricingType: dish.pricingType || 'single',
      variants: dish.variants || [],
      addOns: dish.addOns || [],
      description: dish.description || '',
      imageUrl: dish.imageUrl,
      imageSource: dish.imageSource || 'default',
      isVegetarian: dish.isVegetarian !== false,
      isBestseller: Boolean(dish.isBestseller),
      badges: dish.isBestseller ? ["Bestseller"] : []
    });
  });

  restaurant.categories = Object.keys(catMap).map((catName, idx) => ({
    id: `cat-${idx}-${catName.toLowerCase().replace(/\s+/g, '-')}`,
    name: catName,
    items: catMap[catName]
  }));

  document.title = `${restaurant.name} — Contactless Menu`;

  // 5. Mount customer menu
  renderCustomerMenu(mount, restaurant);
});
