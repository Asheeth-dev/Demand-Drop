/**
 * Catalog of common Indian kirana products and brands, compiled from public
 * brand lists (MegaBrands packaged-foods index, FMCG export catalogues, India
 * Food Network's local-brands roundup). Used for:
 *  - autocomplete suggestions on the customer form
 *  - a grounding hint for the AI product extraction so messy speech maps to
 *    the standard retail names the owner actually stocks.
 */

export type CatalogItem = {
  name: string;
  brand: string;
  category: "Dairy" | "Bakery" | "Beverages" | "Snacks" | "Staples" | "Personal Care" | "Household" | "Other";
  keywords: string[];
};

export const CATALOG: CatalogItem[] = [
  // Dairy
  { name: "Amul Butter", brand: "Amul", category: "Dairy", keywords: ["butter", "makhan"] },
  { name: "Amul Milk", brand: "Amul", category: "Dairy", keywords: ["milk", "doodh", "taaza", "gold"] },
  { name: "Mother Dairy Milk", brand: "Mother Dairy", category: "Dairy", keywords: ["milk", "doodh"] },
  { name: "Nandini Milk", brand: "Nandini", category: "Dairy", keywords: ["milk", "doodh"] },
  { name: "Amul Curd", brand: "Amul", category: "Dairy", keywords: ["curd", "dahi", "yogurt"] },
  { name: "Nestle A+ Dahi", brand: "Nestle", category: "Dairy", keywords: ["curd", "dahi"] },
  { name: "Amul Ghee", brand: "Amul", category: "Dairy", keywords: ["ghee", "desi ghee"] },
  { name: "Amul Cheese Slices", brand: "Amul", category: "Dairy", keywords: ["cheese"] },
  { name: "Britannia Cheese Slices", brand: "Britannia", category: "Dairy", keywords: ["cheese"] },
  { name: "Nestle Milkmaid", brand: "Nestle", category: "Dairy", keywords: ["condensed milk", "milkmaid"] },
  { name: "Amul Shrikhand", brand: "Amul", category: "Dairy", keywords: ["shrikhand"] },
  { name: "Amul Paneer", brand: "Amul", category: "Dairy", keywords: ["paneer", "cottage cheese"] },

  // Bakery
  { name: "Brown Bread", brand: "Local", category: "Bakery", keywords: ["brown bread", "atta bread"] },
  { name: "Milk Bread", brand: "Local", category: "Bakery", keywords: ["bread", "white bread"] },
  { name: "Pav", brand: "Local", category: "Bakery", keywords: ["pav", "ladi pav", "bun"] },
  { name: "Parle-G", brand: "Parle", category: "Bakery", keywords: ["biscuit", "glucose biscuit", "parle"] },
  { name: "Britannia Marie Gold", brand: "Britannia", category: "Bakery", keywords: ["biscuit", "marie"] },
  { name: "Britannia Good Day", brand: "Britannia", category: "Bakery", keywords: ["cookies", "good day"] },
  { name: "Britannia Bourbon", brand: "Britannia", category: "Bakery", keywords: ["bourbon", "chocolate biscuit"] },
  { name: "Britannia NutriChoice", brand: "Britannia", category: "Bakery", keywords: ["digestive", "nutrichoice", "healthy biscuit"] },
  { name: "Parle Monaco", brand: "Parle", category: "Bakery", keywords: ["monaco", "salted biscuit"] },
  { name: "Parle KrackJack", brand: "Parle", category: "Bakery", keywords: ["krackjack", "biscuit"] },
  { name: "Hide & Seek", brand: "Parle", category: "Bakery", keywords: ["hide and seek", "choco chips cookies"] },
  { name: "Britannia Rusk", brand: "Britannia", category: "Bakery", keywords: ["rusk", "toast"] },

  // Beverages
  { name: "Thums Up", brand: "Coca-Cola", category: "Beverages", keywords: ["thums up", "cold drink", "cola"] },
  { name: "Coca-Cola", brand: "Coca-Cola", category: "Beverages", keywords: ["coke", "cold drink", "cola"] },
  { name: "Sprite", brand: "Coca-Cola", category: "Beverages", keywords: ["sprite", "cold drink", "lemon drink"] },
  { name: "Fanta", brand: "Coca-Cola", category: "Beverages", keywords: ["fanta", "orange drink", "cold drink"] },
  { name: "Pepsi", brand: "PepsiCo", category: "Beverages", keywords: ["pepsi", "cold drink", "cola"] },
  { name: "7UP", brand: "PepsiCo", category: "Beverages", keywords: ["seven up", "lemon drink", "cold drink"] },
  { name: "Mirinda", brand: "PepsiCo", category: "Beverages", keywords: ["mirinda", "orange drink"] },
  { name: "Maaza", brand: "Coca-Cola", category: "Beverages", keywords: ["maaza", "mango drink"] },
  { name: "Frooti", brand: "Parle Agro", category: "Beverages", keywords: ["frooti", "mango drink"] },
  { name: "Slice", brand: "PepsiCo", category: "Beverages", keywords: ["slice", "mango drink"] },
  { name: "Sting", brand: "PepsiCo", category: "Beverages", keywords: ["sting", "energy drink"] },
  { name: "Red Bull", brand: "Red Bull", category: "Beverages", keywords: ["energy drink"] },
  { name: "Bisleri Water", brand: "Bisleri", category: "Beverages", keywords: ["water", "mineral water", "bisleri"] },
  { name: "Kinley Water", brand: "Coca-Cola", category: "Beverages", keywords: ["water", "kinley"] },
  { name: "Aquafina Water", brand: "PepsiCo", category: "Beverages", keywords: ["water", "aquafina"] },
  { name: "Amul Kool", brand: "Amul", category: "Beverages", keywords: ["kool", "milk drink"] },
  { name: "Amul Lassi", brand: "Amul", category: "Beverages", keywords: ["lassi"] },
  { name: "Amul Buttermilk", brand: "Amul", category: "Beverages", keywords: ["chaas", "buttermilk", "chhachh"] },
  { name: "Dabur Real Juice", brand: "Dabur", category: "Beverages", keywords: ["real", "fruit juice"] },
  { name: "Tropicana Juice", brand: "PepsiCo", category: "Beverages", keywords: ["juice", "tropicana"] },
  { name: "Appy Fizz", brand: "Parle Agro", category: "Beverages", keywords: ["appy", "fizz"] },
  { name: "Tata Tea", brand: "Tata", category: "Beverages", keywords: ["tea", "chai", "chay"] },
  { name: "Tata Tea Gold", brand: "Tata", category: "Beverages", keywords: ["tea", "chai"] },
  { name: "Red Label Tea", brand: "Brooke Bond", category: "Beverages", keywords: ["tea", "chai", "red label"] },
  { name: "Taj Mahal Tea", brand: "Brooke Bond", category: "Beverages", keywords: ["tea", "chai"] },
  { name: "Nescafe Classic", brand: "Nestle", category: "Beverages", keywords: ["coffee", "nescafe", "instant coffee"] },
  { name: "Bru Coffee", brand: "HUL", category: "Beverages", keywords: ["coffee", "bru"] },
  { name: "Bournvita", brand: "Cadbury", category: "Beverages", keywords: ["bournvita", "health drink", "chocolate drink"] },
  { name: "Horlicks", brand: "HUL", category: "Beverages", keywords: ["horlicks", "health drink"] },
  { name: "Boost", brand: "HUL", category: "Beverages", keywords: ["boost", "health drink"] },
  { name: "Complan", brand: "Zydus", category: "Beverages", keywords: ["complan", "health drink"] },

  // Snacks
  { name: "Maggi Noodles", brand: "Nestle", category: "Snacks", keywords: ["maggi", "noodles", "2 minute"] },
  { name: "Yippee Noodles", brand: "ITC Sunfeast", category: "Snacks", keywords: ["yippee", "noodles"] },
  { name: "Top Ramen", brand: "Nissin", category: "Snacks", keywords: ["top ramen", "noodles"] },
  { name: "Ching's Hakka Noodles", brand: "Ching's Secret", category: "Snacks", keywords: ["hakka noodles", "chings"] },
  { name: "Knorr Soup", brand: "HUL", category: "Snacks", keywords: ["soup", "knorr"] },
  { name: "Lay's Classic Salted", brand: "PepsiCo", category: "Snacks", keywords: ["lays", "chips", "wafers"] },
  { name: "Kurkure", brand: "PepsiCo", category: "Snacks", keywords: ["kurkure", "namkeen snack"] },
  { name: "Bingo Mad Angles", brand: "ITC", category: "Snacks", keywords: ["bingo", "mad angles", "chips"] },
  { name: "Haldiram's Aloo Bhujia", brand: "Haldiram's", category: "Snacks", keywords: ["bhujia", "namkeen", "aloo bhujia"] },
  { name: "Haldiram's Moong Dal Namkeen", brand: "Haldiram's", category: "Snacks", keywords: ["moong dal", "namkeen"] },
  { name: "Bikaji Bhujia", brand: "Bikaji", category: "Snacks", keywords: ["bhujia", "namkeen", "bikaji"] },
  { name: "Balaji Wafers", brand: "Balaji", category: "Snacks", keywords: ["balaji", "chips", "wafers"] },
  { name: "Too Yumm Chips", brand: "Marico", category: "Snacks", keywords: ["too yumm", "chips"] },
  { name: "Act II Popcorn", brand: "ConAgra", category: "Snacks", keywords: ["popcorn", "act 2"] },
  { name: "Cadbury Dairy Milk", brand: "Cadbury", category: "Snacks", keywords: ["dairy milk", "chocolate", "cadbury"] },
  { name: "KitKat", brand: "Nestle", category: "Snacks", keywords: ["kitkat", "chocolate"] },
  { name: "Nestle Munch", brand: "Nestle", category: "Snacks", keywords: ["munch", "chocolate"] },
  { name: "Cadbury 5 Star", brand: "Cadbury", category: "Snacks", keywords: ["5 star", "five star", "chocolate"] },
  { name: "Cadbury Perk", brand: "Cadbury", category: "Snacks", keywords: ["perk", "chocolate"] },
  { name: "Amul Dark Chocolate", brand: "Amul", category: "Snacks", keywords: ["dark chocolate"] },
  { name: "Parle Melody", brand: "Parle", category: "Snacks", keywords: ["melody", "chocolate candy", "toffee"] },
  { name: "Alpenliebe", brand: "Perfetti", category: "Snacks", keywords: ["alpenliebe", "caramel candy", "toffee"] },
  { name: "Pulse Candy", brand: "Pass Pass", category: "Snacks", keywords: ["pulse", "raw mango candy"] },
  { name: "Center Fresh", brand: "Perfetti", category: "Snacks", keywords: ["center fresh", "chewing gum"] },
  { name: "Mentos", brand: "Perfetti", category: "Snacks", keywords: ["mentos", "candy"] },
  { name: "Happydent", brand: "Perfetti", category: "Snacks", keywords: ["happydent", "chewing gum"] },

  // Staples
  { name: "Aashirvaad Atta", brand: "ITC", category: "Staples", keywords: ["atta", "wheat flour", "aashirvaad", "ashirvad"] },
  { name: "Pillsbury Atta", brand: "Pillsbury", category: "Staples", keywords: ["atta", "wheat flour"] },
  { name: "Fortune Sunflower Oil", brand: "Fortune", category: "Staples", keywords: ["oil", "sunflower oil", "tel"] },
  { name: "Fortune Mustard Oil", brand: "Fortune", category: "Staples", keywords: ["mustard oil", "sarson tel"] },
  { name: "Saffola Oil", brand: "Marico", category: "Staples", keywords: ["oil", "saffola", "cooking oil"] },
  { name: "Gold Winner Oil", brand: "Gold Winner", category: "Staples", keywords: ["oil", "gold winner"] },
  { name: "Tata Salt", brand: "Tata", category: "Staples", keywords: ["salt", "namak", "tata namak"] },
  { name: "India Gate Basmati Rice", brand: "India Gate", category: "Staples", keywords: ["basmati", "rice", "chawal"] },
  { name: "Daawat Rice", brand: "Daawat", category: "Staples", keywords: ["rice", "chawal", "daawat"] },
  { name: "Sona Masoori Rice", brand: "Local", category: "Staples", keywords: ["rice", "sona masoori", "chawal"] },
  { name: "Toor Dal", brand: "Local", category: "Staples", keywords: ["toor dal", "arhar dal", "tur dal", "pulses", "dal"] },
  { name: "Moong Dal", brand: "Local", category: "Staples", keywords: ["moong dal", "dal"] },
  { name: "Chana Dal", brand: "Local", category: "Staples", keywords: ["chana dal", "dal"] },
  { name: "Urad Dal", brand: "Local", category: "Staples", keywords: ["urad dal", "dal"] },
  { name: "Masoor Dal", brand: "Local", category: "Staples", keywords: ["masoor dal", "dal"] },
  { name: "Rajma", brand: "Local", category: "Staples", keywords: ["rajma", "kidney beans"] },
  { name: "Kabuli Chana", brand: "Local", category: "Staples", keywords: ["chole", "chickpeas", "kabuli chana"] },
  { name: "Besan", brand: "Local", category: "Staples", keywords: ["besan", "gram flour"] },
  { name: "Poha", brand: "Local", category: "Staples", keywords: ["poha", "flattened rice"] },
  { name: "Rava", brand: "Local", category: "Staples", keywords: ["rava", "sooji", "semolina"] },
  { name: "Maida", brand: "Local", category: "Staples", keywords: ["maida", "refined flour"] },
  { name: "Madhur Sugar", brand: "Madhur", category: "Staples", keywords: ["sugar", "cheeni", "sakkhar"] },
  { name: "MDH Garam Masala", brand: "MDH", category: "Staples", keywords: ["garam masala", "masala", "mdh"] },
  { name: "MDH Chana Masala", brand: "MDH", category: "Staples", keywords: ["chana masala", "masala"] },
  { name: "Everest Masala", brand: "Everest", category: "Staples", keywords: ["masala", "everest"] },
  { name: "Catch Masala", brand: "Catch", category: "Staples", keywords: ["masala", "catch"] },
  { name: "Aachi Masala", brand: "Aachi", category: "Staples", keywords: ["masala", "aachi"] },
  { name: "Red Chilli Powder", brand: "Local", category: "Staples", keywords: ["chilli powder", "lal mirch"] },
  { name: "Turmeric Powder", brand: "Local", category: "Staples", keywords: ["turmeric", "haldi"] },
  { name: "Coriander Powder", brand: "Local", category: "Staples", keywords: ["coriander powder", "dhania"] },
  { name: "Tea Powder (Loose)", brand: "Local", category: "Staples", keywords: ["loose tea", "chai patti"] },

  // Personal Care
  { name: "Colgate Toothpaste", brand: "Colgate", category: "Personal Care", keywords: ["toothpaste", "colgate", "manjan"] },
  { name: "Pepsodent Toothpaste", brand: "HUL", category: "Personal Care", keywords: ["pepsodent", "toothpaste"] },
  { name: "Close Up Toothpaste", brand: "HUL", category: "Personal Care", keywords: ["close up", "toothpaste"] },
  { name: "Dabur Red Toothpaste", brand: "Dabur", category: "Personal Care", keywords: ["dabur red", "toothpaste", "ayurvedic"] },
  { name: "Clinic Plus Shampoo", brand: "HUL", category: "Personal Care", keywords: ["shampoo", "clinic plus"] },
  { name: "Sunsilk Shampoo", brand: "HUL", category: "Personal Care", keywords: ["shampoo", "sunsilk"] },
  { name: "Dove Soap", brand: "HUL", category: "Personal Care", keywords: ["soap", "dove"] },
  { name: "Lifebuoy Soap", brand: "HUL", category: "Personal Care", keywords: ["soap", "lifebuoy"] },
  { name: "Cinthol Soap", brand: "Godrej", category: "Personal Care", keywords: ["soap", "cinthol"] },
  { name: "Lux Soap", brand: "HUL", category: "Personal Care", keywords: ["soap", "lux"] },
  { name: "Dettol Soap", brand: "Dettol", category: "Personal Care", keywords: ["soap", "dettol", "antiseptic"] },
  { name: "Savlon Soap", brand: "ITC", category: "Personal Care", keywords: ["soap", "savlon"] },
  { name: "Dettol Handwash", brand: "Dettol", category: "Personal Care", keywords: ["handwash", "hand wash", "dettol"] },
  { name: "Vaseline", brand: "HUL", category: "Personal Care", keywords: ["vaseline", "petroleum jelly", "moisturizer"] },
  { name: "Dabur Honey", brand: "Dabur", category: "Personal Care", keywords: ["honey", "shahad"] },
  { name: "Dabur Chyawanprash", brand: "Dabur", category: "Personal Care", keywords: ["chyawanprash"] },
  { name: "Dabur Amla Hair Oil", brand: "Dabur", category: "Personal Care", keywords: ["hair oil", "amla oil"] },
  { name: "Parachute Coconut Oil", brand: "Marico", category: "Personal Care", keywords: ["coconut oil", "hair oil", "parachute"] },
  { name: "Navratna Hair Oil", brand: "Emami", category: "Personal Care", keywords: ["hair oil", "navratna"] },

  // Household
  { name: "Surf Excel", brand: "HUL", category: "Household", keywords: ["detergent", "surf", "washing powder"] },
  { name: "Ariel Detergent", brand: "P&G", category: "Household", keywords: ["ariel", "detergent"] },
  { name: "Rin Detergent", brand: "HUL", category: "Household", keywords: ["rin", "detergent", "washing powder"] },
  { name: "Ghadi Detergent", brand: "Ghadi", category: "Household", keywords: ["ghadi", "detergent", "washing powder"] },
  { name: "Vim Bar", brand: "HUL", category: "Household", keywords: ["vim", "dishwash", "bartan"] },
  { name: "Pril Dishwash", brand: "HUL", category: "Household", keywords: ["pril", "dishwash liquid"] },
  { name: "Harpic Toilet Cleaner", brand: "Reckitt", category: "Household", keywords: ["harpic", "toilet cleaner"] },
  { name: "Lizol Floor Cleaner", brand: "Reckitt", category: "Household", keywords: ["lizol", "floor cleaner", "phenyl"] },
  { name: "Goodknight Mosquito Repellent", brand: "Godrej", category: "Household", keywords: ["goodknight", "mosquito", "machindani"] },
  { name: "Hit Spray", brand: "Godrej", category: "Household", keywords: ["hit", "insect spray", "mosquito"] },
  { name: "Odonil Air Freshener", brand: "Dabur", category: "Household", keywords: ["odonil", "air freshener"] },
  { name: "Mortein Coil", brand: "Reckitt", category: "Household", keywords: ["mortein", "mosquito coil"] },

  // Other
  { name: "Classmate Notebook", brand: "ITC", category: "Other", keywords: ["notebook", "copy", "classmate", "stationery"] },
  { name: "Homelites Matchbox", brand: "Homelites", category: "Other", keywords: ["matchbox", "matches", "diya"] },
  { name: "Agarbatti", brand: "Cycle Pure", category: "Other", keywords: ["agarbatti", "incense sticks", "pooja"] },
];

/** Case-insensitive lookup: exact product-name matches only. */
export function findExactCatalogMatch(text: string): CatalogItem | null {
  const needle = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!needle) return null;
  return CATALOG.find((item) => item.name.toLowerCase() === needle) ?? null;
}

/** Top suggestions for the customer form: match on name, brand and keywords. */
export function suggestCatalogProducts(query: string, limit = 6): CatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = CATALOG.map((item) => {
    const haystack = `${item.name} ${item.brand} ${item.keywords.join(" ")}`.toLowerCase();
    if (haystack.includes(q)) {
      // Earlier match in the name beats a match in brand/keywords.
      const idx = item.name.toLowerCase().indexOf(q);
      return { item, score: idx === 0 ? 0 : idx > 0 ? 1 : 2 };
    }
    return null;
  }).filter((s): s is { item: CatalogItem; score: number } => s !== null);
  scored.sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name));
  return scored.slice(0, limit).map((s) => s.item);
}
