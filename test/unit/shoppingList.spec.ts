import { describe, expect, it } from "vitest";
import { categorizeIngredient, combineMeasures } from "../../app/utils/shoppingList";

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

describe("categorizeIngredient", () => {
  it("recognizes common spices and dried herbs as mausteet", () => {
    expect(categorizeIngredient("Ground Cumin")).toBe("mausteet");
    expect(categorizeIngredient("Salt")).toBe("mausteet");
    expect(categorizeIngredient("dried oregano")).toBe("mausteet");
    expect(categorizeIngredient("Smoked Paprika")).toBe("mausteet");
  });

  it("recognizes common dry/liquid pantry staples beyond spices as mausteet", () => {
    expect(categorizeIngredient("Olive Oil")).toBe("mausteet");
    expect(categorizeIngredient("Soy Sauce")).toBe("mausteet");
    expect(categorizeIngredient("Sugar")).toBe("mausteet");
  });

  it("recognizes fruits and vegetables", () => {
    expect(categorizeIngredient("Onion")).toBe("hedelmat-vihannekset");
    expect(categorizeIngredient("Fresh Spinach")).toBe("hedelmat-vihannekset");
    expect(categorizeIngredient("Apple")).toBe("hedelmat-vihannekset");
  });

  it("recognizes meat and other proteins", () => {
    expect(categorizeIngredient("Chicken breast")).toBe("proteiinit");
    expect(categorizeIngredient("Salmon fillet")).toBe("proteiinit");
    expect(categorizeIngredient("Chickpeas")).toBe("proteiinit");
  });

  it("recognizes dairy products", () => {
    expect(categorizeIngredient("Milk")).toBe("maitotuotteet");
    expect(categorizeIngredient("Cheddar")).toBe("maitotuotteet");
    expect(categorizeIngredient("Greek Yogurt")).toBe("maitotuotteet");
  });

  it("recognizes grains and cereal products", () => {
    expect(categorizeIngredient("Rice")).toBe("viljatuotteet");
    expect(categorizeIngredient("Spaghetti")).toBe("viljatuotteet");
    expect(categorizeIngredient("Plain Flour")).toBe("viljatuotteet");
  });

  it("prefers longer, more specific matches over generic ones from another category", () => {
    // "Pepper" alone reads as the spice, but a named bell pepper is a vegetable.
    expect(categorizeIngredient("Pepper")).toBe("mausteet");
    expect(categorizeIngredient("Red Pepper")).toBe("hedelmat-vihannekset");

    // "Butter" is dairy, but butter beans are a legume/protein.
    expect(categorizeIngredient("Butter")).toBe("maitotuotteet");
    expect(categorizeIngredient("Butter Beans")).toBe("proteiinit");

    // Ground ginger is a spice-rack item; bare ginger reads as the fresh root.
    expect(categorizeIngredient("Ground Ginger")).toBe("mausteet");
    expect(categorizeIngredient("Ginger")).toBe("hedelmat-vihannekset");

    // Chili powder/flakes are spices; a bare chili is a fresh vegetable.
    expect(categorizeIngredient("Chili Powder")).toBe("mausteet");
    expect(categorizeIngredient("Chili")).toBe("hedelmat-vihannekset");

    // Cornflour/cornstarch are pantry starches, not the vegetable.
    expect(categorizeIngredient("Cornflour")).toBe("mausteet");
    expect(categorizeIngredient("Corn")).toBe("hedelmat-vihannekset");

    // Sauces and liquid stocks are pantry items, not the fresh protein or dairy.
    expect(categorizeIngredient("Fish Sauce")).toBe("mausteet");
    expect(categorizeIngredient("Fish")).toBe("proteiinit");
    expect(categorizeIngredient("Chicken Stock")).toBe("mausteet");
    expect(categorizeIngredient("Chicken breast")).toBe("proteiinit");
    expect(categorizeIngredient("Coconut Milk")).toBe("mausteet");
    expect(categorizeIngredient("Milk")).toBe("maitotuotteet");
  });

  it("falls back to 'muu' for ingredients it doesn't recognize", () => {
    expect(categorizeIngredient("Unobtainium Powder")).toBe("muu");
    expect(categorizeIngredient("Some Unknown Thing")).toBe("muu");
  });
});
