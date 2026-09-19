const categoryTranslations: Record<string, string> = {
  Beef: "Naudanliha",
  Breakfast: "Aamupala",
  Chicken: "Kana",
  Dessert: "Jälkiruoka",
  Goat: "Vuohi",
  Lamb: "Lammas",
  Miscellaneous: "Muut",
  Pasta: "Pasta",
  Pork: "Possu",
  Seafood: "Merenelävät",
  Side: "Lisuke",
  Starter: "Alkuruoka",
  Vegan: "Vegaaninen",
  Vegetarian: "Kasvis",
};

// TheMealDB is inconsistent about whether a recipe's country ends up in
// strArea (sometimes a demonym like "Japanese", sometimes a country name
// like "Norway") or in strCountry (always a country name, e.g. "Cambodia").
// This table covers every raw value actually seen across the whole
// database, so both fields translate to a proper Finnish adjective
// regardless of which form TheMealDB happened to use.
const areaTranslations: Record<string, string> = {
  American: "Amerikkalainen",
  British: "Brittiläinen",
  Canadian: "Kanadalainen",
  Chinese: "Kiinalainen",
  Croatian: "Kroatialainen",
  Dutch: "Hollantilainen",
  Egyptian: "Egyptiläinen",
  Filipino: "Filippiiniläinen",
  French: "Ranskalainen",
  Greek: "Kreikkalainen",
  Indian: "Intialainen",
  Irish: "Irlantilainen",
  Italian: "Italialainen",
  Jamaican: "Jamaikalainen",
  Japanese: "Japanilainen",
  Kenyan: "Kenialainen",
  Malaysian: "Malesialainen",
  Mexican: "Meksikolainen",
  Moroccan: "Marokkolainen",
  Polish: "Puolalainen",
  Portuguese: "Portugalilainen",
  Russian: "Venäläinen",
  Spanish: "Espanjalainen",
  Thai: "Thaimaalainen",
  Tunisian: "Tunisialainen",
  Turkish: "Turkkilainen",
  Ukrainian: "Ukrainalainen",
  Vietnamese: "Vietnamilainen",

  Algerian: "Algerialainen",
  Algeria: "Algerialainen",
  Argentina: "Argentiinalainen",
  Australian: "Australialainen",
  Australia: "Australialainen",
  France: "Ranskalainen",
  India: "Intialainen",
  Netherlands: "Hollantilainen",
  Norway: "Norjalainen",
  "Saudi Arabian": "Saudiarabialainen",
  "Saudi Arabia": "Saudiarabialainen",
  Slovakia: "Slovakialainen",
  Syrian: "Syyrialainen",
  Syria: "Syyrialainen",
  Uruguayan: "Uruguaylainen",
  Uruguay: "Uruguaylainen",
  Venezuela: "Venezuelalainen",
  "United States": "Yhdysvaltalainen",

  Afghanistan: "Afganistanilainen",
  Albania: "Albanialainen",
  Andorra: "Andorralainen",
  Angola: "Angolalainen",
  "Antigua and Barbuda": "Antigualainen",
  Armenia: "Armenialainen",
  Aruba: "Arubalainen",
  Austria: "Itävaltalainen",
  Azerbaijan: "Azerbaidžanilainen",
  Bahamas: "Bahamalainen",
  Bangladesh: "Bangladeshilainen",
  Barbados: "Barbadoslainen",
  Belgium: "Belgialainen",
  Botswana: "Botswanalainen",
  Brazil: "Brasilialainen",
  Bulgaria: "Bulgarialainen",
  Cambodia: "Kambodžalainen",
  Canada: "Kanadalainen",
  "Cayman Islands": "Caymansaarelainen",
  Chile: "Chileläinen",
  China: "Kiinalainen",
  Colombia: "Kolumbialainen",
  "Costa Rica": "Costaricalainen",
  Croatia: "Kroatialainen",
  Cuba: "Kuubalainen",
  Denmark: "Tanskalainen",
  Dominica: "Dominicalainen",
  Egypt: "Egyptiläinen",
  Estonia: "Virolainen",
  Greece: "Kreikkalainen",
  Ireland: "Irlantilainen",
  Italy: "Italialainen",
  Jamaica: "Jamaikalainen",
  Japan: "Japanilainen",
  Kenya: "Kenialainen",
  Laos: "Laosilainen",
  Malaysia: "Malesialainen",
  Mexico: "Meksikolainen",
  Morocco: "Marokkolainen",
  Philippines: "Filippiiniläinen",
  Poland: "Puolalainen",
  Portugal: "Portugalilainen",
  Russia: "Venäläinen",
  Spain: "Espanjalainen",
  Thailand: "Thaimaalainen",
  Tunisia: "Tunisialainen",
  Turkey: "Turkkilainen",
  Ukraine: "Ukrainalainen",
  "United Kingdom": "Brittiläinen",
  Vietnam: "Vietnamilainen",
};

export type SearchIntent =
  | {
      type: "name";
      query: string;
    }
  | {
      type: "category";
      query: string;
    }
  | {
      // Several raw area values can map to the same Finnish word (see the
      // comment on areaTranslations), and only one of them may actually be
      // present in our data for a given country, so a match has to check
      // all of them rather than picking one arbitrarily.
      type: "area";
      query: string[];
    };

const searchTranslations: Record<string, SearchIntent> = {
  kana: { type: "category", query: "Chicken" },
  kanaruoka: { type: "category", query: "Chicken" },
  broileri: { type: "category", query: "Chicken" },

  nauta: { type: "category", query: "Beef" },
  naudanliha: { type: "category", query: "Beef" },

  possu: { type: "category", query: "Pork" },
  sianliha: { type: "category", query: "Pork" },

  lammas: { type: "category", query: "Lamb" },

  kala: { type: "category", query: "Seafood" },
  lohi: { type: "name", query: "salmon" },
  merenelävät: { type: "category", query: "Seafood" },

  kasvis: { type: "category", query: "Vegetarian" },
  kasvisruoka: { type: "category", query: "Vegetarian" },

  vegaani: { type: "category", query: "Vegan" },
  vegaaninen: { type: "category", query: "Vegan" },

  aamupala: { type: "category", query: "Breakfast" },
  aamiainen: { type: "category", query: "Breakfast" },

  lisukkeet: { type: "category", query: "Side" },
  lisuke: { type: "category", query: "Side" },

  alkuruoka: { type: "category", query: "Starter" },
  alkuruoat: { type: "category", query: "Starter" },

  jälkiruoka: { type: "category", query: "Dessert" },
  herkku: { type: "category", query: "Dessert" },
  makea: { type: "category", query: "Dessert" },
  kakku: { type: "name", query: "cake" },

  pasta: { type: "category", query: "Pasta" },
  curry: { type: "name", query: "curry" },
  keitto: { type: "name", query: "soup" },
  salaatti: { type: "name", query: "salad" },
};

for (const [area, finnishArea] of Object.entries(areaTranslations)) {
  const key = finnishArea.toLowerCase();
  const existing = searchTranslations[key];

  if (existing?.type === "area") {
    existing.query.push(area);
  } else {
    searchTranslations[key] = { type: "area", query: [area] };
  }
}

export function translateCategory(category?: string | null) {
  if (!category) {
    return "Resepti";
  }

  return categoryTranslations[category] ?? category;
}

export function translateArea(area?: string | null) {
  if (!area) {
    return "Tuntematon";
  }

  return areaTranslations[area] ?? area;
}

// Our own search box is Finnish but the recipe data is English, so a typed
// word like "kana" or "italialainen" still needs mapping to the matching
// English category/area before it can filter the recipes table.
export function detectSearchIntent(searchTerm: string): SearchIntent {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  return (
    searchTranslations[normalizedSearchTerm] ?? {
      type: "name",
      query: searchTerm.trim(),
    }
  );
}
