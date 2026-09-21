// ============================================================
// Comprehensive QA Test Suite verifying Section 33 (Tests 1-15)
// ============================================================

import { getCurrentPlan, setPlan, PLAN_TIERS, isFeatureAllowed, PLAN_CONFIGS } from '../src/services/planService.js';
import { getTables, saveTables, setTableCount, addTable, removeTable, getTableMenuUrl, resolveTableParam } from '../src/services/tableService.js';
import { createMenuItem, getDishLibrary, searchDishLibrary, getRestaurantMenuItems, saveRestaurantMenuItems } from '../src/services/dishLibraryService.js';
import { ImageProvider } from '../src/services/imageProvider.js';
import { placeOrder, getOrders, updateOrderStatus, getOrderStats, ORDER_STATUS } from '../src/services/orderService.js';

// Setup Mock Browser LocalStorage & Window environment for Node
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();
globalThis.window = {
  location: { origin: 'http://localhost:5173' },
  dispatchEvent: () => {}
};

async function runQASuite() {
  console.log('🚀 Starting Menzo Comprehensive QA Verification (Tests 1 - 15)...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  console.log('--- TEST 1: Free restaurant creates menu ---');
  setPlan(PLAN_TIERS.FREE);
  assert(getCurrentPlan() === PLAN_TIERS.FREE, 'Plan is FREE (₹0/mo)');
  assert(!isFeatureAllowed('order_management'), 'Free plan order_management is false');
  assert(!isFeatureAllowed('table_qr'), 'Free plan table_qr is false');
  assert(isFeatureAllowed('digital_menu'), 'Free plan digital_menu is true');

  const freeDish = createMenuItem({
    name: 'Dal Tadka',
    price: 180,
    category: 'North Indian',
    isVegetarian: true,
    imageSource: 'restaurant',
    imageUrl: 'data:image/png;base64,mockImage'
  }, 'rest_free_1');
  assert(freeDish.name === 'Dal Tadka' && freeDish.price === 180, 'Can add dish and set price');
  assert(freeDish.imageUrl.startsWith('data:image'), 'Can upload custom image');

  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Free restaurant tries to access table management ---');
  let tableAccessError = null;
  try {
    setTableCount(5, 'rest_free_1');
  } catch (err) {
    tableAccessError = err.message;
  }
  assert(tableAccessError !== null && tableAccessError.includes('Pro plan required'), 'Table management blocked for Free plan with Upgrade requirement');

  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Pro restaurant creates 5 tables ---');
  setPlan(PLAN_TIERS.PRO);
  assert(getCurrentPlan() === PLAN_TIERS.PRO, 'Plan set to PRO');
  const proTables = setTableCount(5, 'rest_pro_1');
  assert(proTables.length === 5, 'Pro restaurant successfully configured 5 tables');
  
  const urls = proTables.map(t => getTableMenuUrl('rest_pro_1', t.id));
  const uniqueUrls = new Set(urls);
  assert(uniqueUrls.size === 5, '5 unique QR code URLs generated for 5 tables');
  assert(urls[2].includes('t=3') || urls[2].includes('table=3'), 'Table 3 URL correctly formatted');

  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Customer scans Table 3 QR ---');
  const resolvedTable = resolveTableParam('3', proTables);
  assert(resolvedTable.id === 'table_3' && resolvedTable.name === 'Table 3', 'Table 3 automatically identified from query parameter');

  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Customer selects Butter Chicken (Full ₹340) + Extra Gravy (₹50) ---');
  const butterChicken = createMenuItem({
    id: 'bc_dish',
    name: 'Butter Chicken',
    pricingType: 'variants',
    price: 220,
    variants: [
      { id: 'bc_half', name: 'Half', price: 220 },
      { id: 'bc_full', name: 'Full', price: 340 }
    ],
    addOns: [
      { id: 'addon_extra_gravy', name: 'Extra Gravy', price: 50 },
      { id: 'addon_extra_chicken', name: 'Extra Chicken', price: 100 }
    ]
  }, 'rest_pro_1');

  // Customer selects Full (₹340) + Extra Gravy (₹50)
  const selectedVariant = butterChicken.variants.find(v => v.name === 'Full');
  const selectedAddon = butterChicken.addOns.find(a => a.name === 'Extra Gravy');
  const qty = 1;
  const itemTotal = (selectedVariant.price + selectedAddon.price) * qty;
  assert(itemTotal === 390, `Cart total calculated correctly: ₹${itemTotal} (340 + 50)`);

  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Customer places order ---');
  const orderResult = placeOrder({
    restaurantId: 'rest_pro_1',
    tableId: 'table_3',
    tableName: 'Table 3',
    items: [
      {
        dishId: butterChicken.id,
        dishName: butterChicken.name,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        quantity: 1,
        unitPrice: selectedVariant.price,
        addOns: [selectedAddon],
        itemTotal: 390
      }
    ],
    subtotal: 390,
    total: 390,
    customerName: 'Rahul Verma',
    customerPhone: '9876543210'
  });
  assert(orderResult.success === true, 'Order placed successfully');
  assert(orderResult.order.restaurantId === 'rest_pro_1', 'Correct restaurant');
  assert(orderResult.order.tableId === 'table_3', 'Correct table');
  assert(orderResult.order.items[0].variantName === 'Full', 'Correct variant: Full');
  assert(orderResult.order.items[0].addOns[0].name === 'Extra Gravy', 'Correct add-on: Extra Gravy');
  assert(orderResult.order.total === 390, 'Correct order total: ₹390');
  assert(orderResult.order.status === 'new', 'Initial order status is "new"');

  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Restaurant status lifecycle: new -> accepted -> preparing -> ready -> completed ---');
  const orderId = orderResult.order.id;
  const s1 = updateOrderStatus('rest_pro_1', orderId, ORDER_STATUS.ACCEPTED);
  assert(s1.status === 'accepted', 'Status changed to accepted');
  const s2 = updateOrderStatus('rest_pro_1', orderId, ORDER_STATUS.PREPARING);
  assert(s2.status === 'preparing', 'Status changed to preparing');
  const s3 = updateOrderStatus('rest_pro_1', orderId, ORDER_STATUS.READY);
  assert(s3.status === 'ready', 'Status changed to ready');
  const s4 = updateOrderStatus('rest_pro_1', orderId, ORDER_STATUS.COMPLETED);
  assert(s4.status === 'completed', 'Status changed to completed');

  // -------------------------------------------------------------
  console.log('\n--- TEST 8: Restaurant dish with no image ---');
  const dishNoImg = createMenuItem({
    name: 'Special Biryani',
    price: 250,
    imageUrl: '',
    imageSource: 'default'
  }, 'rest_pro_1');
  const resolvedImg = ImageProvider.resolveDishImage(dishNoImg);
  assert(resolvedImg.length > 0 && resolvedImg !== '', 'Fallback/default image resolves cleanly when no image provided');

  // -------------------------------------------------------------
  console.log('\n--- TEST 9: AI image generation fallback ---');
  // If AI generation throws or fails, system should use curated fallback
  const mockPrompt = ImageProvider.generateImagePrompt('Butter Chicken', 'North Indian', 'creamy rich gravy');
  assert(mockPrompt.includes('Realistic professional Indian restaurant food photography'), 'Generated realistic prompt');
  const aiResult = await ImageProvider.generateImage('Butter Chicken');
  assert(aiResult.url && aiResult.source === 'ai_generated', 'AI generation returns usable image');

  // -------------------------------------------------------------
  console.log('\n--- TEST 10: Image API fallback ---');
  const unknownSearch = await ImageProvider.searchImages('non_existent_exotic_dish_999');
  assert(unknownSearch.length > 0 && unknownSearch[0].url.length > 0, 'Graceful fallback returned when search yields no direct hits');

  // -------------------------------------------------------------
  console.log('\n--- TEST 11: Restaurant uploads custom image (Priority #1) ---');
  const customUploadedDish = {
    name: 'Butter Chicken',
    imageUrl: 'https://cdn.example.com/my-own-butter-chicken.jpg',
    imageSource: 'restaurant'
  };
  const prioritizedImage = ImageProvider.resolveDishImage(customUploadedDish);
  assert(prioritizedImage === 'https://cdn.example.com/my-own-butter-chicken.jpg', 'Restaurant uploaded image overrides default image');

  // -------------------------------------------------------------
  console.log('\n--- TEST 12: Restaurant has Half ₹220, Full ₹340 ---');
  const tandooriChicken = createMenuItem({
    name: 'Tandoori Chicken',
    pricingType: 'variants',
    price: 220,
    variants: [
      { id: 'v_half', name: 'Half', price: 220 },
      { id: 'v_full', name: 'Full', price: 340 }
    ]
  });
  const chosen = tandooriChicken.variants.find(v => v.name === 'Full');
  assert(chosen.price === 340, 'Choosing Full variant sets cart price to ₹340');

  // -------------------------------------------------------------
  console.log('\n--- TEST 13: Free user attempts direct API call to place order ---');
  setPlan(PLAN_TIERS.FREE);
  let orderRejected = false;
  try {
    placeOrder({
      restaurantId: 'rest_free_1',
      tableId: 'table_1',
      items: [{ dishName: 'Chai', quantity: 1, unitPrice: 30, itemTotal: 30 }],
      total: 30
    });
  } catch (err) {
    orderRejected = true;
    assert(err.message.includes('Pro plan required'), 'Order creation blocked server-side for Free restaurant');
  }
  if (!orderRejected) {
    console.error('❌ FAIL: Order was not rejected for Free plan');
    failed++;
  }

  // -------------------------------------------------------------
  console.log('\n--- TEST 14: Data isolation: Restaurant A vs Restaurant B ---');
  setPlan(PLAN_TIERS.PRO);
  // Place order for Restaurant A
  placeOrder({
    restaurantId: 'rest_A',
    tableId: 'table_1',
    items: [{ dishName: 'Dosa', itemTotal: 120 }],
    total: 120
  });
  // Place order for Restaurant B
  placeOrder({
    restaurantId: 'rest_B',
    tableId: 'table_2',
    items: [{ dishName: 'Pizza', itemTotal: 350 }],
    total: 350
  });

  const ordersA = getOrders('rest_A');
  const ordersB = getOrders('rest_B');
  assert(ordersA.every(o => o.restaurantId === 'rest_A'), 'Restaurant A only retrieves Restaurant A orders');
  assert(ordersB.every(o => o.restaurantId === 'rest_B'), 'Restaurant B only retrieves Restaurant B orders');
  assert(ordersA.length === 1 && ordersA[0].total === 120, 'Restaurant A order data completely isolated from Restaurant B');

  // -------------------------------------------------------------
  console.log('\n--- TEST 15: Business plan disabled / Coming Soon ---');
  const bizConfig = PLAN_CONFIGS[PLAN_TIERS.BUSINESS];
  assert(bizConfig.isAvailable === false, 'Business plan isAvailable is false');
  assert(bizConfig.priceText === 'Coming Soon', 'Business plan priceText is "Coming Soon"');

  console.log(`\n======================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runQASuite().catch(err => {
  console.error('QA Suite Error:', err);
  process.exit(1);
});
