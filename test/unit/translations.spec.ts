import { describe, expect, it } from "vitest";
import {
  translateCategory,
  translateArea,
  detectSearchIntent,
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