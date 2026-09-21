// ============================================================
// MENZO PLAN & SUBSCRIPTION SERVICE
// Manages active subscription tiers (Free, Pro, Business),
// feature gating, and real-time live order storage.
// ============================================================

export const PLAN_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business'
};

export const PLAN_CONFIGS = {
  [PLAN_TIERS.FREE]: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceCadence: '/ month',
    formattedPrice: '₹0',
    hasOrderManagement: false,
    orderType: 'none',
    hasTableQR: false,
    hasWatermark: true,
    customQR: false,
    themes: ['default'],
    maxBranches: 1,
    analyticsLevel: 'basic',
    badgeText: 'Free Plan',
    badgeClass: 'badge-free',
    isAvailable: true,
    ctaText: 'Get Started'
  },
  [PLAN_TIERS.PRO]: {
    id: 'pro',
    name: 'Pro',
    price: 0,
    priceCadence: '',
    formattedPrice: 'Coming Soon',
    priceText: 'Coming Soon',
    hasOrderManagement: false,
    orderType: 'none',
    hasTableQR: false,
    hasWatermark: true,
    customQR: false,
    themes: ['default'],
    maxBranches: 1,
    analyticsLevel: 'basic',
    badgeText: 'Coming Soon',
    badgeClass: 'badge-pro',
    isAvailable: false, // Strict: Pro functionality Coming Soon
    ctaText: 'Coming Soon'
  },
  [PLAN_TIERS.BUSINESS]: {
    id: 'business',
    name: 'Business',
    price: 0,
    priceCadence: '',
    formattedPrice: 'Coming Soon',
    priceText: 'Coming Soon',
    hasOrderManagement: false, // Inactive per requirement
    orderType: 'none',
    hasTableQR: false,
    hasWatermark: false,
    customQR: false,
    bulkQR: false,
    themes: [],
    maxBranches: 0,
    analyticsLevel: 'none',
    badgeText: 'Coming Soon',
    badgeClass: 'badge-business',
    isAvailable: false, // Strict: Business functionality must NOT be activated
    ctaText: 'Coming Soon'
  }
};

const STORAGE_KEYS = {
  ACTIVE_PLAN: 'menzo_selected_plan',
  PLAN_META: 'menzo_plan_metadata',
  LIVE_ORDERS: 'menzo_live_orders',
  ACTIVE_BRANCH: 'menzo_active_branch',
  BRANCH_LIST: 'menzo_registered_branches'
};

/**
 * Get currently active plan tier
 */
export function getCurrentPlan() {
  try {
    const storedTier = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
    if (storedTier && PLAN_CONFIGS[storedTier]?.isAvailable) {
      return storedTier;
    }
  } catch (e) {}
  return PLAN_TIERS.FREE; // Default to Free
}

/**
 * Get full config object for current plan
 */
export function getCurrentPlanConfig() {
  const tier = getCurrentPlan();
  return PLAN_CONFIGS[tier] || PLAN_CONFIGS[PLAN_TIERS.FREE];
}

/**
 * Save user selected plan with optional metadata
 */
export function setPlan(tier, meta = {}) {
  // Business tier is Coming Soon and must NOT be activated
  let validTier = PLAN_CONFIGS[tier]?.isAvailable ? tier : PLAN_TIERS.FREE;
  if (tier === PLAN_TIERS.BUSINESS) {
    console.warn('[PlanService] Business tier is coming soon and cannot be activated.');
    validTier = PLAN_TIERS.PRO;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, validTier);
    const planMeta = {
      tier: validTier,
      activatedAt: new Date().toISOString(),
      isTrial: Boolean(meta.isTrial),
      trialEndsAt: meta.isTrial ? new Date(Date.now() + 14 * 86400000).toISOString() : null,
      branches: ['Main Outlet'],
      ...meta
    };
    localStorage.setItem(STORAGE_KEYS.PLAN_META, JSON.stringify(planMeta));



    // Dispatch event so any open components update in real time
    window.dispatchEvent(new CustomEvent('menzo_plan_changed', { detail: planMeta }));
    return planMeta;
  } catch (e) {
    console.error('[PlanService] Error saving plan:', e);
    return null;
  }
}

/**
 * Check if a specific feature key is permitted for current plan
 */
export function isFeatureAllowed(featureKey) {
  const config = getCurrentPlanConfig();
  switch (featureKey) {
    case 'order_management':
      return Boolean(config.hasOrderManagement);
    case 'table_qr':
      return Boolean(config.hasTableQR);
    case 'digital_menu':
      return true; // All restaurants have digital menu
    case 'kds_fullscreen':
      return false; // Business is coming soon
    case 'remove_watermark':
      return !config.hasWatermark;
    case 'custom_qr':
      return Boolean(config.customQR);
    case 'analytics_pro':
      return config.analyticsLevel === 'pro';
    case 'bulk_qr':
      return false; // Pro/Free don't have bulk QR, Business is coming soon
    case 'multi_branch':
      return false; // Multi-branch is coming soon
    default:
      return false;
  }
}

// ============================================================
// LIVE ORDER MANAGEMENT DATA STORE
// ============================================================

export const ORDER_STATUS = {
  NEW: 'new',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed'
};

/**
 * Get all live orders
 */
export function getLiveOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIVE_ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

/**
 * Save live orders array
 */
export function saveLiveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEYS.LIVE_ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('menzo_orders_updated', { detail: orders }));
  } catch (e) {}
}

/**
 * Place a new table order from customer menu
 */
export function placeNewOrder(orderData) {
  const orders = getLiveOrders();
  const orderNumber = 101 + orders.length;
  
  const newOrder = {
    id: 'ord_' + Math.random().toString(36).substring(2, 9),
    orderNumber: '#' + orderNumber,
    tableNumber: orderData.tableNumber || 'Table 1',
    customerName: orderData.customerName || 'Guest',
    customerPhone: orderData.customerPhone || '',
    notes: orderData.notes || '',
    items: orderData.items || [],
    totalAmount: orderData.totalAmount || 0,
    status: ORDER_STATUS.NEW,
    station: orderData.station || 'Kitchen', // Kitchen, Bar
    branch: localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH) || 'Main Outlet',
    createdAt: new Date().toISOString(),
    placedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  orders.unshift(newOrder); // Prepend to top
  saveLiveOrders(orders);
  return newOrder;
}

/**
 * Update the status of an existing order (New -> Preparing -> Ready -> Completed)
 */
export function updateOrderStatus(orderId, newStatus) {
  const orders = getLiveOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = newStatus;
    orders[index].updatedAt = new Date().toISOString();
    saveLiveOrders(orders);
    return orders[index];
  }
  return null;
}



/**
 * Play a high-quality notification chime using Web Audio API
 */
export function playOrderChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    // First Bell Tone (G5 - 784 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second Bell Tone (C6 - 1046.5 Hz)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.15);
    gain2.gain.setValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (err) {
    // Audio context may require user interaction
  }
}
