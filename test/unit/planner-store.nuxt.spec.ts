import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { usePlannerStore } from "~/stores/planner";

// These tests only exercise the store's synchronous local-state logic
// (shopping list merging, draft filtering), so the Supabase calls that
// now fire alongside every mutation are stubbed out with a chainable mock
// rather than hitting the real backend from a unit test.
function createChainableSupabaseMock(): unknown {
  return new Proxy(() => undefined, {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (value: { data: unknown[]; error: null }) => void) =>
          resolve({ data: [], error: null });
      }

      return () => createChainableSupabaseMock();
    },
    apply() {
      return createChainableSupabaseMock();
    },
  });
}

mockNuxtImport("useSupabaseClient", () => {
  return () => ({
    from: () => createChainableSupabaseMock(),
  });
});

mockNuxtImport("useCurrentUserId", () => {
  return () => Promise.resolve("test-user-id");
});

describe("planner store: shoppingList", () => {
  let plannerStore: ReturnType<typeof usePlannerStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    plannerStore = usePlannerStore();
  });

  it("returns an empty list when nothing is planned", () => {
    expect(plannerStore.shoppingList).toEqual([]);
  });

  it("merges the same ingredient across multiple meals into one entry", () => {
    plannerStore.addMeal({
      day: "monday",
      meal: "dinner",
      recipeId: "1",
      recipeName: "Pasta Bolognese",
      recipeImage: "https://example.com/pasta.jpg",
      category: "Pasta",
      ingredients: [{ name: "Valkosipuli", measure: "2 kynsi" }],
    });

    plannerStore.addMeal({
      day: "tuesday",
      meal: "dinner",
      recipeId: "2",
      recipeName: "Valkosipulivoikana",
      recipeImage: "https://example.com/chicken.jpg",
      category: "Chicken",
      ingredients: [{ name: "valkosipuli", measure: "3 kynsi" }],
    });

    expect(plannerStore.shoppingList).toEqual([
      {
        key: "valkosipuli",
        name: "Valkosipuli",
        measure: "5 kynttä",
        category: "hedelmat-vihannekset",
      },
    ]);
  });

  it("categorizes ingredients so they can be shown in separate sections", () => {
    plannerStore.addMeal({
      day: "monday",
      meal: "dinner",
      recipeId: "1",
      recipeName: "Curry",
      recipeImage: "https://example.com/curry.jpg",
      category: "Curry",
      ingredients: [
        { name: "Juustokuminajauhe", measure: "1 tl" },
        { name: "Kananrinta", measure: "500 g" },
      ],
    });

    expect(
      plannerStore.shoppingList.map((item) => [item.name, item.category]),
    ).toEqual([
      ["Juustokuminajauhe", "mausteet"],
      ["Kananrinta", "proteiinit"],
    ]);
  });

  it("sorts the shopping list alphabetically by ingredient name", () => {
    plannerStore.addMeal({
      day: "monday",
      meal: "breakfast",
      recipeId: "1",
      recipeName: "Omelette",
      recipeImage: "https://example.com/omelette.jpg",
      category: "Breakfast",
      ingredients: [
        { name: "Kesäkurpitsa", measure: "1" },
        { name: "Omena", measure: "2" },
      ],
    });

    expect(plannerStore.shoppingList.map((item) => item.name)).toEqual([
      "Kesäkurpitsa",
      "Omena",
    ]);
  });
});

describe("planner store: drafts", () => {
  let plannerStore: ReturnType<typeof usePlannerStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    plannerStore = usePlannerStore();
  });

  it("adds a draft with no day or meal assigned", () => {
    plannerStore.addDraft({
      recipeId: "1",
      recipeName: "Pasta Bolognese",
      recipeImage: "https://example.com/pasta.jpg",
      category: "Pasta",
      ingredients: [],
    });

    expect(plannerStore.plannedMeals).toEqual([
      expect.objectContaining({ day: null, meal: null, recipeName: "Pasta Bolognese" }),
    ]);
  });

  it("lists drafts separately from meals assigned to a slot", () => {
    plannerStore.addDraft({
      recipeId: "1",
      recipeName: "Draft Recipe",
      recipeImage: "https://example.com/draft.jpg",
      category: "Test",
      ingredients: [],
    });

    plannerStore.addMeal({
      day: "monday",
      meal: "dinner",
      recipeId: "2",
      recipeName: "Assigned Recipe",
      recipeImage: "https://example.com/assigned.jpg",
      category: "Test",
      ingredients: [],
    });

    expect(plannerStore.drafts.map((item) => item.recipeName)).toEqual([
      "Draft Recipe",
    ]);
    expect(plannerStore.getMeals("monday", "dinner").map((item) => item.recipeName)).toEqual([
      "Assigned Recipe",
    ]);
  });

  it("assigning a draft to a day and meal moves it out of the drafts list", () => {
    plannerStore.addDraft({
      recipeId: "1",
      recipeName: "Draft Recipe",
      recipeImage: "https://example.com/draft.jpg",
      category: "Test",
      ingredients: [],
    });

    const draftId = plannerStore.drafts[0].id;
    plannerStore.assignMeal(draftId, "tuesday", "lunch");

    expect(plannerStore.drafts).toEqual([]);
    expect(plannerStore.getMeals("tuesday", "lunch").map((item) => item.recipeName)).toEqual([
      "Draft Recipe",
    ]);
  });

  it("excludes draft ingredients from the shopping list until assigned to a slot", () => {
    plannerStore.addDraft({
      recipeId: "1",
      recipeName: "Draft Recipe",
      recipeImage: "https://example.com/draft.jpg",
      category: "Test",
      ingredients: [{ name: "Sipuli", measure: "1" }],
    });

    expect(plannerStore.shoppingList).toEqual([]);

    const draftId = plannerStore.drafts[0].id;
    plannerStore.assignMeal(draftId, "wednesday", "dinner");

    expect(plannerStore.shoppingList.map((item) => item.name)).toEqual(["Sipuli"]);
  });
});