// ============================================================
// MENZO IMAGE PROVIDER
// Priority: restaurant upload > library match > placeholder
// Graceful fallbacks — missing images never break menu creation.
// ============================================================

const CACHE_KEY_AI_IMAGES = 'menzo_ai_image_cache';
export const FALLBACK_DEFAULT_IMAGE = '/images/dish-placeholder.svg';

// ----------------------------------------------------------------
// Curated Indian dish library — images in public/images/dishes/
// Keys are lowercase search terms (aliases included).
// ----------------------------------------------------------------
const CURATED_CULINARY_PHOTOS = {
  // North Indian
  'butter chicken':         '/images/dishes/butter_chicken.jpg',
  'murgh makhani':          '/images/dishes/butter_chicken.jpg',
  'chicken makhani':        '/images/dishes/butter_chicken.jpg',
  'dal makhani':            '/images/dishes/dal_makhani.jpg',
  'makhani dal':            '/images/dishes/dal_makhani.jpg',
  'paneer tikka':           '/images/dishes/paneer_tikka.jpg',
  'paneer tikka masala':    '/images/dishes/paneer_tikka.jpg',
  'shahi paneer':           '/images/dishes/shahi_paneer.jpg',
  'palak paneer':           '/images/dishes/palak_paneer.jpg',
  'saag paneer':            '/images/dishes/palak_paneer.jpg',
  'kadai paneer':           '/images/dishes/kadai_paneer.jpg',
  'karahi paneer':          '/images/dishes/kadai_paneer.jpg',
  'malai kofta':            '/images/dishes/malai_kofta.jpg',
  'rajma':                  '/images/dishes/rajma_chawal.jpg',
  'rajma chawal':           '/images/dishes/rajma_chawal.jpg',
  'chole':                  '/images/dishes/chole.jpg',
  'chana masala':           '/images/dishes/chole.jpg',
  'chickpea curry':         '/images/dishes/chole.jpg',
  'aloo gobi':              '/images/dishes/aloo_gobi.jpg',
  'potato cauliflower':     '/images/dishes/aloo_gobi.jpg',
  'dal tadka':              '/images/dishes/dal_tadka.jpg',
  'dal fry':                '/images/dishes/dal_tadka.jpg',
  'yellow dal':             '/images/dishes/dal_tadka.jpg',
  'tandoori chicken':       '/images/dishes/tandoori_chicken.jpg',
  'rogan josh':             '/images/dishes/rogan_josh.jpg',
  'nihari':                 '/images/dishes/nihari.jpg',

  // Biryani & Rice
  'chicken biryani':        '/images/dishes/chicken_biryani.jpg',
  'mutton biryani':         '/images/dishes/mutton_biryani.jpg',
  'veg biryani':            '/images/dishes/veg_biryani.jpg',
  'vegetable biryani':      '/images/dishes/veg_biryani.jpg',
  'biryani':                '/images/dishes/chicken_biryani.jpg',
  'jeera rice':             '/images/dishes/jeera_rice.jpg',
  'pulao':                  '/images/dishes/pulao.jpg',
  'pilaf':                  '/images/dishes/pulao.jpg',

  // South Indian
  'masala dosa':            '/images/dishes/masala_dosa.jpg',
  'dosa':                   '/images/dishes/masala_dosa.jpg',
  'plain dosa':             '/images/dishes/plain_dosa.jpg',
  'idli':                   '/images/dishes/idli.jpg',
  'idly':                   '/images/dishes/idli.jpg',
  'idli sambhar':           '/images/dishes/idli.jpg',
  'medu vada':              '/images/dishes/medu_vada.jpg',
  'vada':                   '/images/dishes/medu_vada.jpg',
  'uttapam':                '/images/dishes/uttapam.jpg',
  'rasam':                  '/images/dishes/rasam.jpg',

  // Street Food
  'samosa':                 '/images/dishes/samosa.jpg',
  'pav bhaji':              '/images/dishes/pav_bhaji.jpg',
  'chole bhature':          '/images/dishes/chole_bhature.jpg',
  'bhature':                '/images/dishes/chole_bhature.jpg',
  'pani puri':              '/images/dishes/aloo_tikki.jpg',   // fallback to closest
  'gol gappa':              '/images/dishes/aloo_tikki.jpg',
  'puchka':                 '/images/dishes/aloo_tikki.jpg',
  'aloo tikki':             '/images/dishes/aloo_tikki.jpg',
  'bhel puri':              '/images/dishes/samosa.jpg',       // fallback to closest
  'vada pav':               '/images/dishes/vada_pav.jpg',
  'pakora':                 '/images/dishes/pakora.jpg',
  'pakoda':                 '/images/dishes/pakora.jpg',
  'bhajiya':                '/images/dishes/pakora.jpg',

  // Breads
  'naan':                   '/images/dishes/butter_naan.jpg',
  'butter naan':            '/images/dishes/butter_naan.jpg',
  'garlic naan':            '/images/dishes/butter_naan.jpg',
  'tandoori roti':          '/images/dishes/butter_naan.jpg',
  'roti':                   '/images/dishes/butter_naan.jpg',
  'paratha':                '/images/dishes/butter_naan.jpg',
  'aloo paratha':           '/images/dishes/butter_naan.jpg',

  // Desserts
  'gulab jamun':            '/images/dishes/gulab_jamun.jpg',
  'rasgulla':               '/images/dishes/gulab_jamun.jpg',
  'kheer':                  '/images/dishes/gulab_jamun.jpg',
  'rice pudding':           '/images/dishes/gulab_jamun.jpg',
  'halwa':                  '/images/dishes/gulab_jamun.jpg',
  'sooji halwa':            '/images/dishes/gulab_jamun.jpg',
  'jalebi':                 '/images/dishes/gulab_jamun.jpg',
  'rasmalai':               '/images/dishes/gulab_jamun.jpg',

  // Beverages
  'lassi':                  '/images/dishes/mango_lassi.jpg',
  'mango lassi':            '/images/dishes/mango_lassi.jpg',
  'masala chai':            '/images/dishes/masala_chai.jpg',
  'chai':                   '/images/dishes/masala_chai.jpg',
  'tea':                    '/images/dishes/masala_chai.jpg',
  'cold coffee':            '/images/dishes/cold_coffee.jpg',
  'nimbu pani':             '/images/dishes/nimbu_pani.jpg',
  'lemonade':               '/images/dishes/nimbu_pani.jpg',
  'sharbat':                '/images/dishes/nimbu_pani.jpg',

  // Non-Veg
  'chicken tikka':          '/images/dishes/chicken_tikka.jpg',
  'mutton curry':           '/images/dishes/mutton_curry.jpg',
  'lamb curry':             '/images/dishes/mutton_curry.jpg',
  'fish curry':             '/images/dishes/fish_curry.jpg',
  'fish masala':            '/images/dishes/fish_curry.jpg',
  'prawn masala':           '/images/dishes/prawn_masala.jpg',
  'prawn curry':            '/images/dishes/prawn_masala.jpg',
  'jhinga masala':          '/images/dishes/prawn_masala.jpg',
};

// ----------------------------------------------------------------
// Fuzzy matcher — 3 tiers of match precision
// ----------------------------------------------------------------
function matchLibrary(dishName) {
  if (!dishName) return null;
  const q = dishName.toLowerCase().trim();

  // Tier 1: exact key
  if (CURATED_CULINARY_PHOTOS[q]) return CURATED_CULINARY_PHOTOS[q];

  // Tier 2: query contains a library key  ("stuffed garlic naan" → "naan")
  for (const [key, imgPath] of Object.entries(CURATED_CULINARY_PHOTOS)) {
    if (q.includes(key)) return imgPath;
  }

  // Tier 3: library key contains query  ("biryani" → "chicken biryani")
  for (const [key, imgPath] of Object.entries(CURATED_CULINARY_PHOTOS)) {
    if (key.includes(q)) return imgPath;
  }

  return null;
}

class MenzoImageProvider {
  constructor() {
    this.cache = this._loadCache();
  }

  _loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY_AI_IMAGES);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  _saveCache() {
    try {
      localStorage.setItem(CACHE_KEY_AI_IMAGES, JSON.stringify(this.cache));
    } catch (e) {}
  }

  generateImagePrompt(dishName, category = '', description = '') {
    const dish = dishName ? dishName.trim().toLowerCase() : 'indian dish';
    const cat = category ? ` in ${category.trim()} cuisine` : '';
    const descExtra = description ? `, highlighting ${description.trim().replace(/\.$/, '')}` : '';
    return `Realistic professional Indian restaurant food photography of ${dish}${cat} in a traditional serving dish or bowl${descExtra}, authentic spices and garnishes, natural warm restaurant lighting, appetizing presentation, neutral rustic table background, realistic textures, 8k resolution, commercial culinary shoot, no people, no text, no logos.`;
  }

  async searchImages(query) {
    if (!query) return [];
    const matched = matchLibrary(query);
    if (matched) {
      return [{ id: 'library', title: query, url: matched, source: 'library' }];
    }
    return [{ id: 'default_dish', title: query, url: FALLBACK_DEFAULT_IMAGE, source: 'default' }];
  }

  async generateImage(dishName, options = {}) {
    const normalizedName = dishName ? String(dishName).trim() : '';
    const category = options.category || '';
    const description = options.description || '';

    const prompt = this.generateImagePrompt(normalizedName, category, description);
    const matched = matchLibrary(normalizedName);
    const url = matched || FALLBACK_DEFAULT_IMAGE;
    const result = {
      id: `ai_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      title: normalizedName || 'Generated dish',
      url,
      source: 'ai_generated',
      prompt
    };

    if (normalizedName) {
      this.cache[normalizedName.toLowerCase()] = url;
      this._saveCache();
    }

    return result;
  }

  getImage(dishName, defaultImage = null) {
    return matchLibrary(dishName) || defaultImage || FALLBACK_DEFAULT_IMAGE;
  }

  /**
   * Resolve dish image with full priority chain:
   * 1. Restaurant uploaded image
   * 2. Curated library match
   * 3. Placeholder SVG
   */
  resolveDishImage(dish) {
    if (!dish) return FALLBACK_DEFAULT_IMAGE;

    if (dish.imageSource === 'restaurant' && dish.imageUrl) return dish.imageUrl;
    if (dish.imageSource === 'ai_generated' && dish.imageUrl) return dish.imageUrl;
    if (dish.imageUrl && dish.imageUrl !== FALLBACK_DEFAULT_IMAGE) return dish.imageUrl;

    return this.getImage(dish.name, FALLBACK_DEFAULT_IMAGE);
  }
}

export const ImageProvider = new MenzoImageProvider();
