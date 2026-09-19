import { describe, expect, it } from "vitest";
import { combineMeasures, isPantryStaple } from "../../app/utils/shoppingList";

describe("combineMeasures", () => {
  it("sums measures that share a recognized unit", () => {
    expect(combineMeasures(["500 g", "300 g"])).toBe("800 g");
    expect(combineMeasures(["1 dl", "2 dl", "1 dl"])).toBe("4 dl");
  });

  it("sums bare counts with no unit word", () => {
    expect(combineMeasures(["2", "1", "1"])).toBe("4");
  });

  it("handles simple and mixed fractions", () => {
    expect(combineMeasures(["1/2 cup", "1/2 cup"])).toBe("1 cup");
    expect(combineMeasures(["1 1/2 tsp", "1/2 tsp"])).toBe("2 tsp");
  });

  it("normalizes unit spelling and casing before summing", () => {
    expect(combineMeasures(["2 Cloves", "1 clove"])).toBe("3 cloves");
    expect(combineMeasures(["500g", "1 kilogram"])).toBe("500 g, 1 kg");
  });

  it("pluralizes countable units for sums other than one, keeping singular for one", () => {
    expect(combineMeasures(["1 clove"])).toBe("1 clove");
    expect(combineMeasures(["1 clove", "1 clove"])).toBe("2 cloves");
    expect(combineMeasures(["1 can", "1 can"])).toBe("2 cans");
  });

  it("keeps different units as separate segments instead of summing across them", () => {
    expect(combineMeasures(["2", "200 g"])).toBe("2, 200 g");
  });

  it("falls back to listing measures it can't confidently parse", () => {
    expect(combineMeasures(["a pinch", "to taste"])).toBe("a pinch, to taste");
  });

  it("mixes parsed and unparsed measures without losing either", () => {
    expect(combineMeasures(["500 g", "a pinch"])).toBe("500 g, a pinch");
  });

  it("ignores empty measures", () => {
    expect(combineMeasures(["500 g", "", "  "])).toBe("500 g");
  });

  it("returns an empty string for no measures", () => {
    expect(combineMeasures([])).toBe("");
  });
});

describe("isPantryStaple", () => {
  it("recognizes common spices and dried herbs", () => {
    expect(isPantryStaple("Ground Cumin")).toBe(true);
    expect(isPantryStaple("Salt")).toBe(true);
    expect(isPantryStaple("dried oregano")).toBe(true);
    expect(isPantryStaple("Smoked Paprika")).toBe(true);
  });

  it("recognizes common dry/liquid pantry staples beyond spices", () => {
    expect(isPantryStaple("Plain Flour")).toBe(true);
    expect(isPantryStaple("Olive Oil")).toBe(true);
    expect(isPantryStaple("Soy Sauce")).toBe(true);
  });

  it("does not flag fresh ingredients as pantry staples", () => {
    expect(isPantryStaple("Chicken breast")).toBe(false);
    expect(isPantryStaple("Onion")).toBe(false);
    expect(isPantryStaple("Fresh spinach")).toBe(false);
  });
});
