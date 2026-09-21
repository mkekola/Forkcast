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
    expect(combineMeasures(["1/2 dl", "1/2 dl"])).toBe("1 dl");
    expect(combineMeasures(["1 1/2 tl", "1/2 tl"])).toBe("2 tl");
  });

  it("normalizes unit spelling and casing before summing", () => {
    expect(combineMeasures(["2 Kynsi", "1 kynsi"])).toBe("3 kynttä");
    expect(combineMeasures(["500g", "1 kg"])).toBe("500 g, 1 kg");
  });

  it("pluralizes countable units for sums other than one, keeping singular for one", () => {
    expect(combineMeasures(["1 kynsi"])).toBe("1 kynsi");
    expect(combineMeasures(["1 kynsi", "1 kynsi"])).toBe("2 kynttä");
    expect(combineMeasures(["1 tölkki", "1 tölkki"])).toBe("2 tölkkiä");
  });

  it("keeps different units as separate segments instead of summing across them", () => {
    expect(combineMeasures(["2", "200 g"])).toBe("2, 200 g");
  });

  it("falls back to listing measures it can't confidently parse", () => {
    expect(combineMeasures(["ripaus suolaa", "maun mukaan"])).toBe("ripaus suolaa, maun mukaan");
  });

  it("mixes parsed and unparsed measures without losing either", () => {
    expect(combineMeasures(["500 g", "ripaus suolaa"])).toBe("500 g, ripaus suolaa");
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
    expect(categorizeIngredient("Juustokuminajauhe")).toBe("mausteet");
    expect(categorizeIngredient("Suola")).toBe("mausteet");
    expect(categorizeIngredient("Kuivattu oregano")).toBe("mausteet");
    expect(categorizeIngredient("Savupaprikajauhe")).toBe("mausteet");
  });

  it("recognizes common dry/liquid pantry staples beyond spices as mausteet", () => {
    expect(categorizeIngredient("Oliiviöljy")).toBe("mausteet");
    expect(categorizeIngredient("Soijakastike")).toBe("mausteet");
    expect(categorizeIngredient("Sokeri")).toBe("mausteet");
  });

  it("recognizes fruits and vegetables", () => {
    expect(categorizeIngredient("Sipuli")).toBe("hedelmat-vihannekset");
    expect(categorizeIngredient("Tuore pinaatti")).toBe("hedelmat-vihannekset");
    expect(categorizeIngredient("Omena")).toBe("hedelmat-vihannekset");
  });

  it("recognizes meat and other proteins", () => {
    expect(categorizeIngredient("Kananrinta")).toBe("proteiinit");
    expect(categorizeIngredient("Lohifilee")).toBe("proteiinit");
    expect(categorizeIngredient("Kikherneet")).toBe("proteiinit");
  });

  it("recognizes dairy products", () => {
    expect(categorizeIngredient("Maito")).toBe("maitotuotteet");
    expect(categorizeIngredient("Cheddarjuusto")).toBe("maitotuotteet");
    expect(categorizeIngredient("Kreikkalainen jogurtti")).toBe("maitotuotteet");
  });

  it("recognizes grains and cereal products", () => {
    expect(categorizeIngredient("Riisi")).toBe("viljatuotteet");
    expect(categorizeIngredient("Spagetti")).toBe("viljatuotteet");
    expect(categorizeIngredient("Vehnäjauho")).toBe("viljatuotteet");
  });

  it("prefers longer, more specific matches over generic ones from another category", () => {
    // "Pippuri" alone reads as the spice, but a named bell pepper is a vegetable.
    expect(categorizeIngredient("Pippuri")).toBe("mausteet");
    expect(categorizeIngredient("Punainen paprika")).toBe("hedelmat-vihannekset");

    // "Voi" is dairy, but butter beans are a legume/protein.
    expect(categorizeIngredient("Voi")).toBe("maitotuotteet");
    expect(categorizeIngredient("Voipavut")).toBe("proteiinit");

    // Ground ginger is a spice-rack item; bare ginger reads as the fresh root.
    expect(categorizeIngredient("Inkiväärijauhe")).toBe("mausteet");
    expect(categorizeIngredient("Inkivääri")).toBe("hedelmat-vihannekset");

    // Chili powder/flakes are spices; a bare chili is a fresh vegetable.
    expect(categorizeIngredient("Chilijauhe")).toBe("mausteet");
    expect(categorizeIngredient("Punainen chili")).toBe("hedelmat-vihannekset");

    // Sauces and liquid stocks are pantry items, not the fresh protein or dairy.
    expect(categorizeIngredient("Kalakastike")).toBe("mausteet");
    expect(categorizeIngredient("Kalafilee")).toBe("proteiinit");
    expect(categorizeIngredient("Kanaliemi")).toBe("mausteet");
    expect(categorizeIngredient("Kananrinta")).toBe("proteiinit");
    expect(categorizeIngredient("Kookosmaito")).toBe("mausteet");
    expect(categorizeIngredient("Maito")).toBe("maitotuotteet");
  });

  it("falls back to 'muu' for ingredients it doesn't recognize", () => {
    expect(categorizeIngredient("Unobtainium-jauhe")).toBe("muu");
    expect(categorizeIngredient("Tuntematon aine")).toBe("muu");
  });
});
