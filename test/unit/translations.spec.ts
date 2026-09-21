import { describe, expect, it } from "vitest";
import {
  translateCategory,
  translateArea,
  detectSearchIntent,
  reverseTranslateCategory,
  toRecipe,
  getSearchWordSuggestions,
} from "../../app/utils/translations";

describe("translateCategory", () => {
  it("translates a known MealDB category to Finnish", () => {
    expect(translateCategory("Chicken")).toBe("Kana");
  });

  it("falls back to the original value for an unknown category", () => {
    expect(translateCategory("Mystery")).toBe("Mystery");
  });

  it("falls back to a generic label when no category is given", () => {
    expect(translateCategory(null)).toBe("Resepti");
    expect(translateCategory(undefined)).toBe("Resepti");
  });
});

describe("translateArea", () => {
  it("translates a known MealDB area to Finnish", () => {
    expect(translateArea("Italian")).toBe("Italialainen");
  });

  it("falls back to 'Tuntematon' when no area is given", () => {
    expect(translateArea(null)).toBe("Tuntematon");
  });
});

describe("detectSearchIntent", () => {
  it("maps a known Finnish search term to a category search", () => {
    expect(detectSearchIntent("kana")).toEqual({
      type: "category",
      query: "Chicken",
    });
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(detectSearchIntent("  KANA  ")).toEqual({
      type: "category",
      query: "Chicken",
    });
  });

  it("falls back to a name search for an unmapped term", () => {
    expect(detectSearchIntent("lasagne")).toEqual({
      type: "name",
      query: "lasagne",
    });
  });
});

describe("reverseTranslateCategory", () => {
  it("maps a Finnish category label back to the raw MealDB key", () => {
    expect(reverseTranslateCategory("Kana")).toBe("Chicken");
  });

  it("returns null for a label that isn't a known translation", () => {
    expect(reverseTranslateCategory("Mystery")).toBeNull();
  });
});

describe("toRecipe", () => {
  const baseSource = {
    id: "1",
    title: "Kana-currypata",
    category: "Chicken",
    area: "Indian",
    image: "https://example.com/curry.jpg",
  };

  it("strips 'STEP N' labels from the description preview", () => {
    const recipe = toRecipe({
      ...baseSource,
      instructions: "STEP 1\nSilppua sipuli.\nSTEP 2\nKuumenna öljy pannussa.",
    });

    expect(recipe.description).not.toContain("STEP");
    expect(recipe.description.startsWith("Silppua sipuli.")).toBe(true);
  });

  it("truncates a long description to the preview length", () => {
    const longSentence = "Sana ".repeat(40).trim();
    const recipe = toRecipe({ ...baseSource, instructions: longSentence });

    expect(recipe.description.endsWith("...")).toBe(true);
    expect(recipe.description.length).toBe(123); // 120 chars + "..."
  });

  it("falls back to a default description when there are no instructions", () => {
    const recipe = toRecipe({ ...baseSource, instructions: null });

    expect(recipe.description).toBe("Herkullinen resepti viikon suunnitteluun.");
  });

  it("translates the category and area", () => {
    const recipe = toRecipe({ ...baseSource, instructions: "Tee jotain." });

    expect(recipe.category).toBe("Kana");
    expect(recipe.area).toBe("Intialainen");
  });
});

describe("getSearchWordSuggestions", () => {
  it("suggests words starting with the prefix, excluding an exact match", () => {
    expect(getSearchWordSuggestions("kana")).toEqual(["Kanadalainen", "Kanaruoka"]);
  });

  it("sorts multiple matches alphabetically", () => {
    expect(getSearchWordSuggestions("veg")).toEqual(["Vegaani", "Vegaaninen"]);
  });

  it("respects the limit", () => {
    expect(getSearchWordSuggestions("veg", 1)).toEqual(["Vegaani"]);
  });

  it("returns an empty array for an empty or whitespace-only prefix", () => {
    expect(getSearchWordSuggestions("")).toEqual([]);
    expect(getSearchWordSuggestions("   ")).toEqual([]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(getSearchWordSuggestions("xyz")).toEqual([]);
  });
});