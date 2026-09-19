const UNIT_ALIASES: Record<string, string> = {
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  millilitres: "ml",
  dl: "dl",
  deciliter: "dl",
  deciliters: "dl",
  decilitre: "dl",
  decilitres: "dl",
  l: "l",
  liter: "l",
  liters: "l",
  litre: "l",
  litres: "l",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  cup: "cup",
  cups: "cup",
  clove: "clove",
  cloves: "clove",
  can: "can",
  cans: "can",
};

const BARE_COUNT_UNIT = "kpl";

export type ShoppingCategory =
  | "hedelmat-vihannekset"
  | "proteiinit"
  | "maitotuotteet"
  | "viljatuotteet"
  | "mausteet"
  | "muu";

export const SHOPPING_CATEGORY_ORDER: ShoppingCategory[] = [
  "hedelmat-vihannekset",
  "proteiinit",
  "maitotuotteet",
  "viljatuotteet",
  "mausteet",
  "muu",
];

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  "hedelmat-vihannekset": "Hedelmät & vihannekset",
  proteiinit: "Proteiinit",
  maitotuotteet: "Maitotuotteet",
  viljatuotteet: "Viljatuotteet",
  mausteet: "Mausteet & kuivatavarat",
  muu: "Muut",
};

const CATEGORY_KEYWORDS: Record<Exclude<ShoppingCategory, "muu">, string[]> = {
  "hedelmat-vihannekset": [
    "apple", "banana", "orange", "lemon", "lime", "grape", "strawberry",
    "strawberries", "blueberry", "blueberries", "raspberry", "raspberries",
    "blackberry", "blackberries", "mango", "pineapple", "peach", "pear",
    "plum", "cherry", "cherries", "watermelon", "melon", "kiwi", "apricot",
    "fig", "date", "pomegranate", "avocado", "tomato", "onion", "garlic",
    "potato", "sweet potato", "carrot", "celery", "cucumber", "lettuce",
    "spinach", "kale", "broccoli", "cauliflower", "cabbage", "red pepper",
    "green pepper", "yellow pepper", "orange pepper", "bell pepper",
    "courgette", "zucchini", "aubergine", "eggplant", "mushroom",
    "sweetcorn", "sweet corn", "corn", "green bean", "green beans", "peas",
    "leek", "radish", "beetroot", "squash", "pumpkin", "parsnip",
    "artichoke", "asparagus", "chard", "rocket", "watercress", "chili",
    "chilli", "ginger",
  ],
  proteiinit: [
    "chicken", "beef", "pork", "lamb", "turkey", "duck", "bacon", "sausage",
    "mince", "steak", "fish", "salmon", "tuna", "cod", "haddock", "mackerel",
    "shrimp", "prawn", "crab", "lobster", "mussel", "clam", "squid", "egg",
    "eggs", "tofu", "chickpea", "chickpeas", "lentil", "lentils",
    "kidney bean", "black bean", "butter bean", "cannellini bean",
    "edamame", "venison", "mutton", "ham", "chorizo", "salami", "pepperoni",
    "anchovy", "quail", "rabbit",
  ],
  maitotuotteet: [
    "milk", "cream", "butter", "cheese", "yogurt", "yoghurt", "mozzarella",
    "cheddar", "parmesan", "feta", "ricotta", "mascarpone", "sour cream",
    "creme fraiche", "buttermilk", "ghee", "halloumi", "paneer",
  ],
  viljatuotteet: [
    "rice", "pasta", "spaghetti", "macaroni", "noodle", "noodles", "bread",
    "tortilla", "oats", "oatmeal", "quinoa", "couscous", "barley", "bulgur",
    "breadcrumb", "breadcrumbs", "cereal", "bun", "baguette", "pita", "naan",
    "penne", "fusilli", "linguine", "tagliatelle", "lasagne", "lasagna",
    "flour",
  ],
  mausteet: [
    "salt", "black pepper", "white pepper", "cayenne pepper",
    "pepper flakes", "peppercorn", "pepper", "paprika", "cumin",
    "coriander", "turmeric", "cinnamon", "nutmeg", "clove", "allspice",
    "cardamom", "chili powder", "chilli powder", "chili flakes",
    "chilli flakes", "oregano", "basil", "thyme", "rosemary", "bay leaf",
    "bay leaves", "sage", "tarragon", "mustard seed", "mustard powder",
    "fennel seed", "fenugreek", "saffron", "vanilla extract",
    "vanilla essence", "baking powder", "baking soda",
    "bicarbonate of soda", "yeast", "cornstarch", "corn starch",
    "cornflour", "sugar", "curry powder", "garam masala", "five spice",
    "seasoning", "cocoa powder", "cacao powder", "stock cube",
    "stock powder", "bouillon", "ground ginger", "smoked paprika",
    "vegetable oil", "olive oil", "sesame oil", "soy sauce", "vinegar",
    "honey",
  ],
};

const SORTED_CATEGORY_KEYWORDS: { keyword: string; category: ShoppingCategory }[] =
  Object.entries(CATEGORY_KEYWORDS)
    .flatMap(([category, keywords]) =>
      keywords.map((keyword) => ({ keyword, category: category as ShoppingCategory })),
    )
    .sort((a, b) => b.keyword.length - a.keyword.length);

/**
 * Best-effort classification of an ingredient into a shopping list
 * category, based on curated keyword lists rather than any data from the
 * recipe source. Longer, more specific keywords (e.g. "red pepper") are
 * matched before shorter generic ones (e.g. "pepper") so a vegetable isn't
 * mistaken for a spice, but this still won't catch everything.
 */
export function categorizeIngredient(name: string): ShoppingCategory {
  const normalized = name.toLowerCase();
  const match = SORTED_CATEGORY_KEYWORDS.find(({ keyword }) =>
    normalized.includes(keyword),
  );

  return match?.category ?? "muu";
}

const PLURAL_UNITS: Record<string, string> = {
  clove: "cloves",
  can: "cans",
  cup: "cups",
};

function displayUnit(unit: string, quantity: number): string {
  if (quantity === 1) {
    return unit;
  }

  return PLURAL_UNITS[unit] ?? unit;
}

type ParsedMeasure = {
  quantity: number;
  unit: string;
};

function parseFraction(token: string): number | null {
  const [numerator, denominator] = token.split("/").map(Number);

  if (!denominator || Number.isNaN(numerator)) {
    return null;
  }

  return numerator / denominator;
}

function parseQuantityToken(token: string): number | null {
  if (token.includes(" ")) {
    const [whole, fraction] = token.split(" ");
    const fractionValue = parseFraction(fraction);

    if (fractionValue === null || Number.isNaN(Number(whole))) {
      return null;
    }

    return Number(whole) + fractionValue;
  }

  if (token.includes("/")) {
    return parseFraction(token);
  }

  const normalized = Number(token.replace(",", "."));

  return Number.isNaN(normalized) ? null : normalized;
}

function parseMeasure(rawMeasure: string): ParsedMeasure | null {
  const trimmed = rawMeasure.trim();
  const match = trimmed.match(
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?$/,
  );

  if (!match) {
    return null;
  }

  const quantity = parseQuantityToken(match[1]);

  if (quantity === null) {
    return null;
  }

  const unitToken = match[2]?.toLowerCase();

  if (!unitToken) {
    return { quantity, unit: BARE_COUNT_UNIT };
  }

  const unit = UNIT_ALIASES[unitToken];

  return unit ? { quantity, unit } : null;
}

function formatQuantity(quantity: number): string {
  return String(Math.round(quantity * 100) / 100);
}

/**
 * Combines a list of free-text measures (e.g. from several recipes needing
 * the same ingredient) into a single display string, summing quantities
 * that share a recognized unit. Measures that can't be parsed confidently
 * are kept as-is rather than dropped or guessed at.
 */
export function combineMeasures(measures: string[]): string {
  const totalsByUnit = new Map<string, number>();
  const unparsed: string[] = [];

  measures.forEach((measure) => {
    if (!measure.trim()) {
      return;
    }

    const parsed = parseMeasure(measure);

    if (!parsed) {
      unparsed.push(measure.trim());
      return;
    }

    totalsByUnit.set(
      parsed.unit,
      (totalsByUnit.get(parsed.unit) ?? 0) + parsed.quantity,
    );
  });

  const summedParts = Array.from(totalsByUnit.entries()).map(
    ([unit, quantity]) =>
      unit === BARE_COUNT_UNIT
        ? formatQuantity(quantity)
        : `${formatQuantity(quantity)} ${displayUnit(unit, quantity)}`,
  );

  return [...summedParts, ...unparsed].join(", ");
}
