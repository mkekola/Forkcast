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
  Turkish: "Turkkiläinen",
  Ukrainian: "Ukrainalainen",
  Vietnamese: "Vietnamilainen",
};

type MealDbSearch =
  | {
      type: "name";
      query: string;
    }
  | {
      type: "category";
      query: string;
    };

const searchTranslations: Record<string, MealDbSearch> = {
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

export function getMealDbSearch(searchTerm: string): MealDbSearch {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  return (
    searchTranslations[normalizedSearchTerm] ?? {
      type: "name",
      query: searchTerm.trim(),
    }
  );
}
