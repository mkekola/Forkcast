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

const PANTRY_STAPLE_KEYWORDS = [
  "salt",
  "pepper",
  "paprika",
  "cumin",
  "coriander",
  "turmeric",
  "cinnamon",
  "nutmeg",
  "clove",
  "allspice",
  "cardamom",
  "chili powder",
  "chilli powder",
  "chili flakes",
  "chilli flakes",
  "pepper flakes",
  "oregano",
  "basil",
  "thyme",
  "rosemary",
  "bay leaf",
  "bay leaves",
  "sage",
  "tarragon",
  "mustard seed",
  "mustard powder",
  "fennel seed",
  "fenugreek",
  "saffron",
  "vanilla extract",
  "vanilla essence",
  "baking powder",
  "baking soda",
  "bicarbonate of soda",
  "yeast",
  "cornstarch",
  "corn starch",
  "cornflour",
  "sugar",
  "curry powder",
  "garam masala",
  "five spice",
  "seasoning",
  "cocoa powder",
  "cacao powder",
  "stock cube",
  "stock powder",
  "bouillon",
  "ground ginger",
  "smoked paprika",
  "flour",
  "vegetable oil",
  "olive oil",
  "sesame oil",
  "soy sauce",
  "vinegar",
  "honey",
];

/**
 * Best-effort check for whether an ingredient is a spice or dry pantry
 * staple, i.e. something a household is likely to already have on hand and
 * rarely needs to restock. Based on a curated keyword list rather than any
 * data from the recipe source, so it won't catch everything.
 */
export function isPantryStaple(name: string): boolean {
  const normalized = name.toLowerCase();

  return PANTRY_STAPLE_KEYWORDS.some((keyword) => normalized.includes(keyword));
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
