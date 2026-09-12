export const defaultRestaurant = {
  name: "The Burger House",
  tagline: "Good food, good mood",
  cuisine: "Gourmet Burgers, Pizza & Craft Shakes",
  address: "42 Park Street, Gourmet Quarter",
  phone: "+1 (555) 345-6789",
  wifi: "BurgerHouse_Guest / burgers2026",
  currency: "₹",
  tableNumber: "Table 04",
  themeColor: "#FF4D2D",
  fontStyle: "Plus Jakarta Sans",
  qrSettings: {
    fgColor: "#111827",
    bgColor: "#FFFFFF",
    frameText: "SCAN FOR DIGITAL MENU",
    frameStyle: "badge-top",
    logo: "utensils",
    showLogo: true,
  },
  categories: [
    {
      id: "cat-starters",
      name: "Starters",
      icon: "",
      items: [
        {
          id: "item-paneer-tikka",
          name: "Sizzling Paneer Tikka",
          price: 220,
          description: "Charred cottage cheese cubes marinated in spiced tandoori masala with bell peppers, onions, and mint chutney.",
          image: "/images/paneer_tikka.jpg",
          badges: ["Bestseller", "Chef Special"],
          dietary: ["vegetarian", "gluten-free"],
          calories: "380 kcal",
          allergens: ["Dairy"],
          spicyLevel: 2
        }
      ]
    },
    {
      id: "cat-pizza",
      name: "Pizza",
      icon: "",
      items: [
        {
          id: "item-margherita-pizza",
          name: "Neapolitan Buffalo Margherita",
          price: 299,
          description: "72-hour slow fermented sourdough, San Marzano plum tomatoes, fresh buffalo mozzarella, fragrant basil, cold-pressed olive oil.",
          image: "/images/pizza.jpg",
          badges: ["Popular"],
          dietary: ["vegetarian"],
          calories: "720 kcal",
          allergens: ["Dairy", "Gluten"],
          spicyLevel: 0
        }
      ]
    },
    {
      id: "cat-pasta",
      name: "Pasta",
      icon: "",
      items: [
        {
          id: "item-pasta-alfredo",
          name: "Creamy Pasta Alfredo",
          price: 299,
          description: "Fettuccine pasta in rich velvety parmesan garlic cream sauce, tossed with cracked black pepper and fresh Italian parsley.",
          image: "/images/pasta.jpg",
          badges: ["Bestseller"],
          dietary: ["vegetarian"],
          calories: "640 kcal",
          allergens: ["Dairy", "Gluten"],
          spicyLevel: 0
        }
      ]
    },
    {
      id: "cat-desserts",
      name: "Desserts",
      icon: "",
      items: [
        {
          id: "item-choco-lava-cake",
          name: "Decadent Choco Lava Cake",
          price: 250,
          description: "Warm molten chocolate lava cake with rich dark chocolate flowing from the center, served with vanilla bean ice cream.",
          image: "/images/choco_lava_cake.jpg",
          badges: ["Signature"],
          dietary: ["vegetarian"],
          calories: "490 kcal",
          allergens: ["Dairy", "Gluten", "Eggs"],
          spicyLevel: 0
        }
      ]
    },
    {
      id: "cat-burgers",
      name: "Burgers",
      icon: "",
      items: [
        {
          id: "item-classic-chicken-burger",
          name: "Classic Chicken Burger",
          price: 249,
          description: "Juicy crispy chicken patty, fresh lettuce, aged cheddar cheese and our special house sauce on toasted brioche.",
          image: "/images/burger.jpg",
          badges: ["Bestseller"],
          dietary: ["halal"],
          calories: "580 kcal",
          allergens: ["Gluten", "Dairy"],
          spicyLevel: 1
        }
      ]
    },
    {
      id: "cat-drinks",
      name: "Drinks",
      icon: "",
      items: [
        {
          id: "item-craft-cocktail",
          name: "Ember Citrus Fizz",
          price: 180,
          description: "Fresh blood orange, rosemary infusion, sparkling tonic and sweet agave nectar.",
          image: "/images/cocktail.jpg",
          badges: ["Signature"],
          dietary: ["vegan"],
          calories: "140 kcal",
          allergens: [],
          spicyLevel: 0
        }
      ]
    }
  ]
};

export const STORAGE_KEY = "menu_qr_restaurant_data";

export function loadRestaurantData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Could not load stored data, using defaults", e);
  }
  return defaultRestaurant;
}

export function saveRestaurantData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}
