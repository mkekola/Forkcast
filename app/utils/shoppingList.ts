// Recognizes the Finnish measure vocabulary the ingredient-translation
// pass left in recipe_ingredients.measure - metric units (g/kg/ml/dl/l are
// already correct Finnish) plus countable units (kynsi, tölkki, etc).
// Imperial units (cup/oz/lb) were converted to metric at the data level
// rather than recognized here, so they never reach this parser. Maps each
// recognized form to one canonical singular key, which combineMeasures
// uses to sum quantities and displayUnit/PLURAL_UNITS below uses to pick
// the right form to show.
const UNIT_ALIASES: Record<string, string> = {
  g: "g",
  kg: "kg",
  ml: "ml",
  dl: "dl",
  l: "l",
  rkl: "rkl",
  tl: "tl",
  ripaus: "ripaus",
  tilkka: "tilkka",
  kourallinen: "kourallinen",
  nokare: "nokare",
  pötkö: "pötkö",
  kynsi: "kynsi",
  viipale: "viipale",
  tölkki: "tölkki",
  purkki: "purkki",
  pussi: "pussi",
  nippu: "nippu",
  oksa: "oksa",
  tippa: "tippa",
  mukula: "mukula",
  pää: "pää",
  varsi: "varsi",
  pala: "pala",
  suikale: "suikale",
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
    "omena", "banaani", "appelsiini", "sitruuna", "lime", "viinirypäle",
    "mansikka", "mustikka", "vadelma", "karhunvatukka", "mango", "ananas",
    "persikka", "päärynä", "luumu", "kirsikka", "vesimeloni", "meloni",
    "kiivi", "aprikoosi", "viikuna", "taateli", "granaattiomena", "avokado",
    "tomaatti", "sipuli", "valkosipuli", "peruna", "bataatti", "porkkana",
    "selleri", "kurkku", "salaatti", "pinaatti", "lehtikaali", "parsakaali",
    "kukkakaali", "kaali", "punainen paprika", "vihreä paprika",
    "keltainen paprika", "paprika", "kesäkurpitsa", "munakoiso", "sien",
    "maissi", "herne", "vihreät pavut", "purjo", "retiisi", "punajuuri", "kurpitsa",
    "palsternakka", "artisokka", "parsa", "rucola", "vesikrassi",
    "chili", "inkivääri",
  ],
  proteiinit: [
    "kana", "naudanliha", "sianliha", "lampaanliha", "kalkkuna", "ankka",
    "pekoni", "makkara", "jauheliha", "pihvi", "fileepihvi", "kala",
    "lohi", "tonnikala", "turska", "kampela", "makrilli", "katkarapu",
    "rapu", "hummeri", "simpukka", "kalmari", "muna", "tofu", "kikherne",
    "linssi", "kidneypavut", "mustat pavut", "voipavut", "cannellini-pavut",
    "riista", "kinkku", "chorizo", "salami", "pepperoni", "anjovis",
    "viiriäinen", "kani",
  ],
  maitotuotteet: [
    "maito", "kerma", "voi", "juusto", "jogurtti", "mozzarella",
    "cheddarjuusto", "parmesan", "fetajuusto", "ricotta", "mascarpone",
    "smetana", "creme fraiche", "kirnupiimä", "ghee-voi", "halloumi",
    "paneer",
  ],
  viljatuotteet: [
    "riisi", "pasta", "spagetti", "makaroni", "nuudeli", "leipä",
    "tortilla", "kaurahiutale", "kaurapuuro", "kvinoa", "couscous", "ohra",
    "bulguri", "korppujauho", "mysli", "sämpylä", "patonki", "pita",
    "naan-leipä", "penne", "fettuccine", "lasagnelevy", "vehnäjauho",
    "jauho",
  ],
  mausteet: [
    "suola", "mustapippuri", "valkopippuri", "cayennepippuri", "pippuri",
    "paprikajauhe", "savupaprikajauhe", "chilijauhe", "chilihiutale",
    "juustokumina", "korianteri",
    "kurkuma", "kaneli", "muskotti", "mausteneilikka", "maustepippuri",
    "kardemumma", "oregano", "basilika", "timjami", "rosmariini",
    "laakerinlehti", "salvia", "rakuuna", "sinapinsiemen", "sinappijauhe",
    "fenkolinsiemen", "sarviapila", "sahrami", "vaniljauute", "leivinjauhe",
    "ruokasooda", "hiiva", "maissitärkkelys", "sokeri", "curryjauhe",
    "garam masala", "viiden mausteen", "mauste", "kaakaojauhe",
    "liemikuutio", "liemijauhe", "inkiväärijauhe", "kasviöljy",
    "oliiviöljy", "seesamiöljy", "soijakastike", "kalakastike",
    "osterikastike", "hoisinkastike", "etikka", "hunaja", "kookosmaito",
    "kookoskerma", "kanaliemi", "naudanliemi", "kalaliemi", "kasvisliemi",
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

// Finnish numeral agreement uses partitive singular after any count other
// than one ("2 tölkkiä", not "2 tölkki"), unlike English's plain "-s"
// plural - so this maps each countable unit to the form shown when
// quantity !== 1. Units left out (rkl, tl, g/kg/ml/dl/l) are already
// quantity-invariant in Finnish, so they fall through to the unchanged
// `unit` value in displayUnit() below.
const PLURAL_UNITS: Record<string, string> = {
  ripaus: "ripausta",
  tilkka: "tilkkaa",
  kourallinen: "kourallista",
  nippu: "nippua",
  oksa: "oksaa",
  tölkki: "tölkkiä",
  purkki: "purkkia",
  pussi: "pussia",
  nokare: "nokaretta",
  pötkö: "pötköä",
  viipale: "viipaletta",
  mukula: "mukulaa",
  pää: "päätä",
  pala: "palaa",
  suikale: "suikaletta",
  tippa: "tippaa",
  kynsi: "kynttä",
  varsi: "vartta",
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
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)\s*([a-zA-ZäöåÄÖÅ]+)?$/,
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
