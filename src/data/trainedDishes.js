// ============================================================
// MENZO TRAINED DISHES CATALOG
// Preloaded Top 50+ Most Ordered Dishes in Indian Restaurants & Cafés
// Covers Starters, Mains, Biryani, South Indian, Street Food,
// Café Beverages, Breads, and Desserts with realistic pricing & photos.
// ============================================================

export const TRAINED_CATEGORIES = [
  'Popular',
  'Starters & Tandoori',
  'Main Course',
  'Biryani & Rice',
  'Indian Breads',
  'South Indian',
  'Street Food & Chaat',
  'Indo-Chinese',
  'Café & Beverages',
  'Desserts'
];

export const POPULAR_DISH_NAMES = [
  'Butter Chicken',
  'Dal Makhani',
  'Paneer Butter Masala',
  'Hyderabadi Chicken Dum Biryani',
  'Masala Dosa',
  'Pav Bhaji',
  'Chole Bhature',
  'Paneer Tikka',
  'Tandoori Chicken',
  'Cold Coffee',
  'Masala Chai',
  'Gulab Jamun'
];

export const ALL_TRAINED_DISHES = [
  // ------------------------------------------------------------
  // 1. STARTERS & TANDOORI
  // ------------------------------------------------------------
  {
    id: 'dish-paneer-tikka',
    name: 'Paneer Tikka',
    category: 'Starters & Tandoori',
    price: 299,
    isVeg: true,
    img: '/images/dishes/paneer_tikka.jpg',
    tag: 'BESTSELLER',
    desc: 'Cubes of fresh cottage cheese marinated in spiced yogurt and grilled to smoky perfection in clay oven.'
  },
  {
    id: 'dish-tandoori-chicken',
    name: 'Tandoori Chicken',
    category: 'Starters & Tandoori',
    price: 340,
    isVeg: false,
    img: '/images/dishes/tandoori_chicken.jpg',
    tag: 'BESTSELLER',
    desc: 'Classic bone-in chicken marinated with Kashmiri chilies, mustard oil, and spices, roasted in tandoor.'
  },
  {
    id: 'dish-chicken-tikka',
    name: 'Chicken Tikka',
    category: 'Starters & Tandoori',
    price: 320,
    isVeg: false,
    img: '/images/dishes/tandoori_chicken.jpg',
    tag: 'BESTSELLER',
    desc: 'Boneless tender chicken chunks marinated in hung curd and aromatic tandoori spices.'
  },
  {
    id: 'dish-malai-paneer-tikka',
    name: 'Malai Paneer Tikka',
    category: 'Starters & Tandoori',
    price: 310,
    isVeg: true,
    img: '/images/dishes/paneer_tikka.jpg',
    tag: 'CHEF SPECIAL',
    desc: 'Velvety soft paneer cubes marinated in rich cashew cream, green cardamom, and mild cheese.'
  },
  {
    id: 'dish-chicken-malai-tikka',
    name: 'Chicken Malai Tikka',
    category: 'Starters & Tandoori',
    price: 340,
    isVeg: false,
    img: '/images/dishes/tandoori_chicken.jpg',
    tag: 'POPULAR',
    desc: 'Succulent chicken morsels infused with royal cream, processed cheese, and crushed white peppercorns.'
  },
  {
    id: 'dish-crispy-corn',
    name: 'Crispy Pepper Corn',
    category: 'Starters & Tandoori',
    price: 199,
    isVeg: true,
    img: '/images/dishes/paneer_tikka.jpg',
    tag: 'POPULAR',
    desc: 'Golden fried sweet corn kernels tossed with freshly cracked pepper, chaat masala, and spring onions.'
  },
  {
    id: 'dish-hara-bhara-kebab',
    name: 'Hara Bhara Kebab',
    category: 'Starters & Tandoori',
    price: 220,
    isVeg: true,
    img: '/images/dishes/paneer_tikka.jpg',
    tag: 'VEG SPECIAL',
    desc: 'Pan-seared spinach, green pea, and cottage cheese patties flavored with aromatic herbs and cashews.'
  },
  {
    id: 'dish-dahi-kebab',
    name: 'Dahi Ke Kebab',
    category: 'Starters & Tandoori',
    price: 240,
    isVeg: true,
    img: '/images/dishes/paneer_tikka.jpg',
    tag: 'CHEF SPECIAL',
    desc: 'Crisp golden croquettes filled with hung curd, bell peppers, fresh mint, and coriander.'
  },

  // ------------------------------------------------------------
  // 2. MAIN COURSE (GRAVIES & CURRIES)
  // ------------------------------------------------------------
  {
    id: 'dish-butter-chicken',
    name: 'Butter Chicken (Murgh Makhani)',
    category: 'Main Course',
    price: 360,
    isVeg: false,
    img: '/images/dishes/butter_chicken.jpg',
    tag: 'BESTSELLER',
    desc: 'Tender roasted chicken simmered in a rich, buttery tomato cream gravy finished with kasuri methi.'
  },
  {
    id: 'dish-dal-makhani',
    name: 'Dal Makhani',
    category: 'Main Course',
    price: 260,
    isVeg: true,
    img: '/images/dishes/dal_makhani.jpg',
    tag: 'BESTSELLER',
    desc: 'Black lentils slow-cooked overnight on charcoal with creamy white butter, fresh puree, and mild spices.'
  },
  {
    id: 'dish-paneer-butter-masala',
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    price: 290,
    isVeg: true,
    img: '/images/dishes/paneer_butter_masala.jpg',
    tag: 'BESTSELLER',
    desc: 'Soft cottage cheese cubes in rich, mildly sweet, and velvety spiced tomato and cashew butter gravy.'
  },
  {
    id: 'dish-kadai-paneer',
    name: 'Kadai Paneer',
    category: 'Main Course',
    price: 280,
    isVeg: true,
    img: '/images/dishes/paneer_butter_masala.jpg',
    tag: 'POPULAR',
    desc: 'Fresh paneer tossed with crunchy bell peppers, onions, and freshly ground kadai coriander-cumin masala.'
  },
  {
    id: 'dish-palak-paneer',
    name: 'Palak Paneer',
    category: 'Main Course',
    price: 270,
    isVeg: true,
    img: '/images/dishes/paneer_butter_masala.jpg',
    tag: 'CLASSIC',
    desc: 'Fresh cottage cheese chunks cooked in a smooth, garlicky spiced spinach puree tempered with cumin.'
  },
  {
    id: 'dish-dal-tadka',
    name: 'Yellow Dal Tadka',
    category: 'Main Course',
    price: 190,
    isVeg: true,
    img: '/images/dishes/dal_makhani.jpg',
    tag: 'COMFORT FOOD',
    desc: 'Arhar dal cooked homestyle, tempered with desi ghee, cumin seeds, minced garlic, and red chili.'
  },
  {
    id: 'dish-chicken-tikka-masala',
    name: 'Chicken Tikka Masala',
    category: 'Main Course',
    price: 350,
    isVeg: false,
    img: '/images/dishes/butter_chicken.jpg',
    tag: 'POPULAR',
    desc: 'Char-grilled tandoori chicken tikka cooked in a spicy, aromatic onion-tomato masala gravy.'
  },
  {
    id: 'dish-mutton-rogan-josh',
    name: 'Mutton Rogan Josh',
    category: 'Main Course',
    price: 420,
    isVeg: false,
    img: '/images/dishes/butter_chicken.jpg',
    tag: 'ROYAL FEAST',
    desc: 'Kashmiri delicacy of tender braised goat meat cooked with whole spices, fennel, and ratan jot.'
  },
  {
    id: 'dish-malai-kofta',
    name: 'Malai Kofta',
    category: 'Main Course',
    price: 299,
    isVeg: true,
    img: '/images/dishes/paneer_butter_masala.jpg',
    tag: 'ROYAL FEAST',
    desc: 'Melt-in-mouth potato and cottage cheese dumplings drenched in a velvety cashew-saffron gravy.'
  },
  {
    id: 'dish-shahi-paneer',
    name: 'Shahi Paneer',
    category: 'Main Course',
    price: 290,
    isVeg: true,
    img: '/images/dishes/paneer_butter_masala.jpg',
    tag: 'POPULAR',
    desc: 'Mughlai preparation of paneer cooked in a rich, mild almond, cashew nut, and cardamom cream sauce.'
  },
  {
    id: 'dish-amritsari-chole',
    name: 'Amritsari Chole Masala',
    category: 'Main Course',
    price: 220,
    isVeg: true,
    img: '/images/dishes/chole_bhature.jpg',
    tag: 'PUNJABI SPECIAL',
    desc: 'Dark spiced chickpeas slow-cooked with whole spices, pomegranate seeds, and ginger juliennes.'
  },
  {
    id: 'dish-rajma-masala',
    name: 'Jammu Rajma Masala',
    category: 'Main Course',
    price: 210,
    isVeg: true,
    img: '/images/dishes/dal_makhani.jpg',
    tag: 'HOMESTYLE',
    desc: 'Slow-simmered red kidney beans in thick, spicy onion-tomato gravy with roasted spices.'
  },
  {
    id: 'dish-aloo-gobi',
    name: 'Aloo Gobi Adraki',
    category: 'Main Course',
    price: 180,
    isVeg: true,
    img: '/images/dishes/paneer_butter_masala.jpg',
    tag: 'HOMESTYLE',
    desc: 'Farm-fresh cauliflower florets and baby potatoes tossed with fresh ginger, turmeric, and cumin.'
  },

  // ------------------------------------------------------------
  // 3. BIRYANI & RICE
  // ------------------------------------------------------------
  {
    id: 'dish-chicken-biryani',
    name: 'Hyderabadi Chicken Dum Biryani',
    category: 'Biryani & Rice',
    price: 320,
    isVeg: false,
    img: '/images/dishes/chicken_biryani.jpg',
    tag: 'BESTSELLER',
    desc: 'Aged long-grain basmati rice and marinated chicken cooked on dum with mint, saffron, and fried onions.'
  },
  {
    id: 'dish-mutton-biryani',
    name: 'Lucknowi Mutton Dum Biryani',
    category: 'Biryani & Rice',
    price: 410,
    isVeg: false,
    img: '/images/dishes/chicken_biryani.jpg',
    tag: 'ROYAL FEAST',
    desc: 'Awadhi dum biryani made with fragrant basmati and tender meat cuts infused with kewra and brown onions.'
  },
  {
    id: 'dish-veg-biryani',
    name: 'Vegetable Dum Biryani',
    category: 'Biryani & Rice',
    price: 240,
    isVeg: true,
    img: '/images/dishes/chicken_biryani.jpg',
    tag: 'POPULAR',
    desc: 'Layered basmati rice with farm vegetables, paneer cubes, saffron milk, and aromatic whole spices.'
  },
  {
    id: 'dish-jeera-rice',
    name: 'Jeera Rice',
    category: 'Biryani & Rice',
    price: 140,
    isVeg: true,
    img: '/images/dishes/chicken_biryani.jpg',
    tag: 'CLASSIC',
    desc: 'Fragrant basmati rice gently tossed with roasted cumin seeds and desi cow ghee.'
  },
  {
    id: 'dish-steamed-basmati-rice',
    name: 'Steamed Basmati Rice',
    category: 'Biryani & Rice',
    price: 120,
    isVeg: true,
    img: '/images/dishes/chicken_biryani.jpg',
    tag: 'CLASSIC',
    desc: 'Aged long-grain Himalayan basmati rice steamed to soft, fluffy grains.'
  },
  {
    id: 'dish-kashmiri-pulao',
    name: 'Kashmiri Pulao',
    category: 'Biryani & Rice',
    price: 190,
    isVeg: true,
    img: '/images/dishes/chicken_biryani.jpg',
    tag: 'SPECIAL',
    desc: 'Aromatic basmati rice cooked with saffron, garnished with roasted cashews, almonds, and fresh fruits.'
  },

  // ------------------------------------------------------------
  // 4. INDIAN BREADS & SIDES
  // ------------------------------------------------------------
  {
    id: 'dish-butter-naan',
    name: 'Butter Naan',
    category: 'Indian Breads',
    price: 50,
    isVeg: true,
    img: '/images/dishes/butter_naan.jpg',
    tag: 'BESTSELLER',
    desc: 'Classic leavened flatbread baked against the piping hot walls of tandoor, brushed with butter.'
  },
  {
    id: 'dish-garlic-naan',
    name: 'Garlic Naan',
    category: 'Indian Breads',
    price: 65,
    isVeg: true,
    img: '/images/dishes/butter_naan.jpg',
    tag: 'POPULAR',
    desc: 'Tandoori naan crusted with roasted garlic chunks, fresh coriander leaves, and generous butter.'
  },
  {
    id: 'dish-cheese-garlic-naan',
    name: 'Cheese Garlic Naan',
    category: 'Indian Breads',
    price: 95,
    isVeg: true,
    img: '/images/dishes/butter_naan.jpg',
    tag: 'CHEF SPECIAL',
    desc: 'Stuffed with melted mozzarella and cheddar cheese, sprinkled with garlic and chili butter.'
  },
  {
    id: 'dish-laccha-paratha',
    name: 'Tandoori Laccha Paratha',
    category: 'Indian Breads',
    price: 55,
    isVeg: true,
    img: '/images/dishes/butter_naan.jpg',
    tag: 'CLASSIC',
    desc: 'Crisp and multi-layered flaky whole wheat bread baked in tandoor with pure ghee.'
  },
  {
    id: 'dish-tandoori-roti',
    name: 'Tandoori Roti (Butter)',
    category: 'Indian Breads',
    price: 30,
    isVeg: true,
    img: '/images/dishes/butter_naan.jpg',
    tag: 'STAPLE',
    desc: 'Healthy whole wheat flatbread roasted crisp in the clay oven, finished with a dab of butter.'
  },
  {
    id: 'dish-boondi-raita',
    name: 'Boondi Raita',
    category: 'Indian Breads',
    price: 70,
    isVeg: true,
    img: '/images/dishes/butter_naan.jpg',
    tag: 'ACCOMPANIMENT',
    desc: 'Chilled spiced yogurt whipped with crispy chickpea pearls, roasted cumin, and mint.'
  },

  // ------------------------------------------------------------
  // 5. SOUTH INDIAN SPECIALTIES
  // ------------------------------------------------------------
  {
    id: 'dish-masala-dosa',
    name: 'Crispy Masala Dosa',
    category: 'South Indian',
    price: 160,
    isVeg: true,
    img: '/images/dishes/masala_dosa.jpg',
    tag: 'BESTSELLER',
    desc: 'Thin crispy golden crepe folded around savory mustard-spiced potato and onion masala, with coconut chutney & sambhar.'
  },
  {
    id: 'dish-mysore-masala-dosa',
    name: 'Mysore Masala Dosa',
    category: 'South Indian',
    price: 180,
    isVeg: true,
    img: '/images/dishes/masala_dosa.jpg',
    tag: 'POPULAR',
    desc: 'Crisp crepe coated inside with fiery roasted red chili garlic chutney, filled with potato mash.'
  },
  {
    id: 'dish-plain-dosa',
    name: 'Classic Ghee Roast Dosa',
    category: 'South Indian',
    price: 130,
    isVeg: true,
    img: '/images/dishes/masala_dosa.jpg',
    tag: 'CLASSIC',
    desc: 'Paper-thin, golden brown roasted crepe brushed generously with aromatic desi cow ghee.'
  },
  {
    id: 'dish-idli-sambhar',
    name: 'Steamed Idli (2 Pcs) with Sambhar',
    category: 'South Indian',
    price: 99,
    isVeg: true,
    img: '/images/dishes/masala_dosa.jpg',
    tag: 'HEALTHY',
    desc: 'Pillowy soft fermented steamed rice cakes served alongside drumstick lentil sambhar and fresh chutneys.'
  },
  {
    id: 'dish-medu-vada',
    name: 'Medu Vada (2 Pcs)',
    category: 'South Indian',
    price: 110,
    isVeg: true,
    img: '/images/dishes/masala_dosa.jpg',
    tag: 'CRISPY',
    desc: 'Deep-fried golden lentil fritters spiced with whole black pepper, ginger, and curry leaves.'
  },
  {
    id: 'dish-onion-tomato-uttapam',
    name: 'Onion Tomato Uttapam',
    category: 'South Indian',
    price: 150,
    isVeg: true,
    img: '/images/dishes/masala_dosa.jpg',
    tag: 'HOMESTYLE',
    desc: 'Thick, fluffy savory pancake topped with diced red onions, ripe tomatoes, and green chilies.'
  },

  // ------------------------------------------------------------
  // 6. STREET FOOD & CHAAT
  // ------------------------------------------------------------
  {
    id: 'dish-pav-bhaji',
    name: 'Mumbai Butter Pav Bhaji',
    category: 'Street Food & Chaat',
    price: 180,
    isVeg: true,
    img: '/images/dishes/pav_bhaji.jpg',
    tag: 'BESTSELLER',
    desc: 'Mashed spicy mixed vegetable curry crowned with dollops of butter, served with 2 warm toasted pavs.'
  },
  {
    id: 'dish-chole-bhature',
    name: 'Delhi Special Chole Bhature',
    category: 'Street Food & Chaat',
    price: 199,
    isVeg: true,
    img: '/images/dishes/chole_bhature.jpg',
    tag: 'BESTSELLER',
    desc: 'Spicy pindi chickpeas paired with two oversized puffy fried bhature, pickled carrots, and green chili.'
  },
  {
    id: 'dish-vada-pav',
    name: 'Mumbai Vada Pav (Pair)',
    category: 'Street Food & Chaat',
    price: 80,
    isVeg: true,
    img: '/images/dishes/pav_bhaji.jpg',
    tag: 'POPULAR',
    desc: 'Crispy spiced potato dumpling encased in soft bakery bun with dry garlic chutney and salted green chilies.'
  },
  {
    id: 'dish-aloo-tikki-chaat',
    name: 'Crispy Aloo Tikki Chaat',
    category: 'Street Food & Chaat',
    price: 120,
    isVeg: true,
    img: '/images/dishes/chole_bhature.jpg',
    tag: 'STREET CLASSIC',
    desc: 'Shallow-fried potato croquettes dressed with whisked sweet curd, saunth, spicy mint dip, and sev.'
  },
  {
    id: 'dish-pani-puri',
    name: 'Pani Puri (Gol Gappa - 6 Pcs)',
    category: 'Street Food & Chaat',
    price: 80,
    isVeg: true,
    img: '/images/dishes/chole_bhature.jpg',
    tag: 'BESTSELLER',
    desc: 'Crispy hollow semolina puris stuffed with potato-chickpea mix, served with ice-cold tangy mint-hing water.'
  },
  {
    id: 'dish-samosa',
    name: 'Punjabi Samosa (2 Pcs)',
    category: 'Street Food & Chaat',
    price: 60,
    isVeg: true,
    img: '/images/dishes/chole_bhature.jpg',
    tag: 'ALL-TIME FAV',
    desc: 'Flaky pastry cones filled with spiced potatoes, green peas, and whole coriander seeds, with chutneys.'
  },

  // ------------------------------------------------------------
  // 7. CAFÉ, SHAKES & BEVERAGES
  // ------------------------------------------------------------
  {
    id: 'dish-masala-chai',
    name: 'Masala Chai',
    category: 'Café & Beverages',
    price: 60,
    isVeg: true,
    img: '/images/dishes/masala_chai.jpg',
    tag: 'BESTSELLER',
    desc: 'Freshly brewed Assam tea simmered with milk, crushed ginger, green cardamom, cloves, and cinnamon.'
  },
  {
    id: 'dish-cold-coffee',
    name: 'Classic Iced Cold Coffee',
    category: 'Café & Beverages',
    price: 150,
    isVeg: true,
    img: '/images/dishes/cold_coffee.jpg',
    tag: 'BESTSELLER',
    desc: 'Rich, thick blended cold coffee made with dairy milk, espresso shot, and chocolate syrup drizzle.'
  },
  {
    id: 'dish-filter-coffee',
    name: 'South Indian Filter Coffee',
    category: 'Café & Beverages',
    price: 80,
    isVeg: true,
    img: '/images/dishes/masala_chai.jpg',
    tag: 'AUTHENTIC',
    desc: 'Dark roasted chicory-infused coffee decoction blended with frothy boiled milk in a traditional dabarah.'
  },
  {
    id: 'dish-mango-lassi',
    name: 'Alphonso Mango Lassi',
    category: 'Café & Beverages',
    price: 120,
    isVeg: true,
    img: '/images/dishes/cold_coffee.jpg',
    tag: 'POPULAR',
    desc: 'Chilled thick sweet curd blended with authentic Ratnagiri Alphonso mango pulp and cardamom.'
  },
  {
    id: 'dish-punjabi-sweet-lassi',
    name: 'Punjabi Sweet Lassi (Kulhad)',
    category: 'Café & Beverages',
    price: 90,
    isVeg: true,
    img: '/images/dishes/cold_coffee.jpg',
    tag: 'SPECIAL',
    desc: 'Traditional hand-churned yogurt beverage sweetened to perfection, crowned with thick clotted cream.'
  },
  {
    id: 'dish-fresh-lime-soda',
    name: 'Fresh Lime Soda (Sweet & Salt)',
    category: 'Café & Beverages',
    price: 80,
    isVeg: true,
    img: '/images/dishes/cold_coffee.jpg',
    tag: 'REFRESHING',
    desc: 'Sparkling soda water infused with freshly squeezed lime juice, rock salt, mint leaves, and cane syrup.'
  },
  {
    id: 'dish-belgian-chocolate-shake',
    name: 'Belgian Chocolate Thickshake',
    category: 'Café & Beverages',
    price: 180,
    isVeg: true,
    img: '/images/dishes/cold_coffee.jpg',
    tag: 'CAFÉ FAVOURITE',
    desc: 'Indulgent thick milkshake blended with pure dark Belgian chocolate, fudge, and chocolate chips.'
  },
  {
    id: 'dish-kulhad-chai',
    name: 'Kulhad Adrak Elaichi Chai',
    category: 'Café & Beverages',
    price: 70,
    isVeg: true,
    img: '/images/dishes/masala_chai.jpg',
    tag: 'COMFORT',
    desc: 'Earthen clay cup chai brewed with robust ginger and fragrant elaichi for a rustic aroma.'
  },

  // ------------------------------------------------------------
  // 8. DESSERTS
  // ------------------------------------------------------------
  {
    id: 'dish-gulab-jamun',
    name: 'Gulab Jamun (2 Pcs)',
    category: 'Desserts',
    price: 99,
    isVeg: true,
    img: '/images/dishes/malai_kofta.jpg',
    tag: 'BESTSELLER',
    desc: 'Golden khoya dumplings fried gently in desi ghee and steeped in rose-cardamom sugar syrup.'
  },
  {
    id: 'dish-rasmalai',
    name: 'Kesar Rasmalai (2 Pcs)',
    category: 'Desserts',
    price: 130,
    isVeg: true,
    img: '/images/dishes/gulab_jamun.jpg',
    tag: 'ROYAL DESSERT',
    desc: 'Delicate poached cottage cheese patties floating in chilled, thickened saffron and pistachio rabdi.'
  },
  {
    id: 'dish-kulfi-falooda',
    name: 'Royal Kulfi Falooda',
    category: 'Desserts',
    price: 150,
    isVeg: true,
    img: '/images/dishes/gulab_jamun.jpg',
    tag: 'POPULAR',
    desc: 'Rich malai kulfi slice served on a bed of chilled rose falooda, sabja seeds, and crushed nuts.'
  },
  {
    id: 'dish-moong-dal-halwa',
    name: 'Moong Dal Halwa (Desi Ghee)',
    category: 'Desserts',
    price: 140,
    isVeg: true,
    img: '/images/dishes/gulab_jamun.jpg',
    tag: 'WINTER SPECIAL',
    desc: 'Rich Rajasthani halwa roasted patiently in pure desi ghee with yellow lentils and slivered almonds.'
  },

  // ------------------------------------------------------------
  // 9. INDO-CHINESE (CAFÉ & RESTAURANT HITS)
  // ------------------------------------------------------------
  {
    id: 'dish-chilli-paneer',
    name: 'Chilli Paneer Dry',
    category: 'Indo-Chinese',
    price: 260,
    isVeg: true,
    img: '/images/dishes/paneer_tikka.jpg',
    tag: 'BESTSELLER',
    desc: 'Wok-tossed paneer cubes with bell peppers, green chilies, garlic, and dark soya sauce glaze.'
  },
  {
    id: 'dish-chilli-chicken',
    name: 'Chilli Chicken Gravy',
    category: 'Indo-Chinese',
    price: 320,
    isVeg: false,
    img: '/images/dishes/tandoori_chicken.jpg',
    tag: 'BESTSELLER',
    desc: 'Crispy marinated chicken bites cooked in spicy garlic-ginger sauce with spring onions.'
  },
  {
    id: 'dish-veg-hakka-noodles',
    name: 'Veg Hakka Noodles',
    category: 'Indo-Chinese',
    price: 199,
    isVeg: true,
    img: '/images/dishes/chicken_biryani.jpg',
    tag: 'POPULAR',
    desc: 'Stir-fried noodles with crunchy cabbage, capsicum, carrots, and aromatic Chinese seasoning.'
  },
  {
    id: 'dish-veg-manchurian',
    name: 'Veg Manchurian Gravy',
    category: 'Indo-Chinese',
    price: 230,
    isVeg: true,
    img: '/images/dishes/paneer_butter_masala.jpg',
    tag: 'POPULAR',
    desc: 'Golden vegetable dumplings simmered in savory coriander-garlic Manchurian gravy.'
  },

  // ------------------------------------------------------------
  // 10. COASTAL & REGIONAL SPECIALTIES
  // ------------------------------------------------------------
  {
    id: 'dish-fish-curry',
    name: 'Goan Fish Curry',
    category: 'Main Course',
    price: 390,
    isVeg: false,
    img: '/images/dishes/butter_chicken.jpg',
    tag: 'COASTAL SPECIAL',
    desc: 'Fresh sea fish simmered in tangy coconut milk gravy infused with kokum and red chilies.'
  },
  {
    id: 'dish-prawn-masala',
    name: 'Kolhapuri Prawn Masala',
    category: 'Main Course',
    price: 430,
    isVeg: false,
    img: '/images/dishes/butter_chicken.jpg',
    tag: 'CHEF SPECIAL',
    desc: 'Juicy tiger prawns cooked in a fiery roasted whole spice and coconut onion masala.'
  },
  {
    id: 'dish-nihari',
    name: 'Old Delhi Mutton Nihari',
    category: 'Main Course',
    price: 440,
    isVeg: false,
    img: '/images/dishes/butter_chicken.jpg',
    tag: 'ROYAL FEAST',
    desc: 'Slow-cooked shank meat stew simmered overnight with royal Awadhi spices and bone marrow essence.'
  },
  {
    id: 'dish-tariwala-mutton',
    name: 'Punjabi Tariwala Mutton Curry',
    category: 'Main Course',
    price: 410,
    isVeg: false,
    img: '/images/dishes/butter_chicken.jpg',
    tag: 'POPULAR',
    desc: 'Succulent mutton pieces braised in thin, spicy homestyle onion-tomato gravy.'
  },
  {
    id: 'dish-rasam',
    name: 'Tomato Pepper Rasam',
    category: 'South Indian',
    price: 80,
    isVeg: true,
    img: '/images/dishes/masala_dosa.jpg',
    tag: 'CLASSIC',
    desc: 'Zesty, warming South Indian soup made with tamarind, crushed black pepper, tomatoes, and hing.'
  },
  {
    id: 'dish-mix-pakora',
    name: 'Crispy Mix Veg Pakora',
    category: 'Street Food & Chaat',
    price: 130,
    isVeg: true,
    img: '/images/dishes/chole_bhature.jpg',
    tag: 'MONSOON FAVOURITE',
    desc: 'Assorted onion, potato, and spinach fritters in spiced gram flour batter served with mint chutney.'
  }
];
