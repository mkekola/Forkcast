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

describe("planner store: clearDay", () => {
  let plannerStore: ReturnType<typeof usePlannerStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    plannerStore = usePlannerStore();
  });

  it("removes only the assigned meals for the given day", async () => {
    await plannerStore.addMeal({
      day: "monday",
      meal: "dinner",
      recipeId: "1",
      recipeName: "Monday Dinner",
      recipeImage: "https://example.com/monday.jpg",
      category: "Test",
      ingredients: [],
    });

    await plannerStore.addMeal({
      day: "tuesday",
      meal: "lunch",
      recipeId: "2",
      recipeName: "Tuesday Lunch",
      recipeImage: "https://example.com/tuesday.jpg",
      category: "Test",
      ingredients: [],
    });

    await plannerStore.clearDay("monday");

    expect(plannerStore.getMeals("monday", "dinner")).toEqual([]);
    expect(plannerStore.getMeals("tuesday", "lunch").map((item) => item.recipeName)).toEqual([
      "Tuesday Lunch",
    ]);
  });

  it("leaves drafts untouched, since they aren't assigned to any day", async () => {
    await plannerStore.addDraft({
      recipeId: "1",
      recipeName: "Draft Recipe",
      recipeImage: "https://example.com/draft.jpg",
      category: "Test",
      ingredients: [],
    });

    await plannerStore.clearDay("monday");

    expect(plannerStore.drafts.map((item) => item.recipeName)).toEqual(["Draft Recipe"]);
  });

  it("leaves checked shopping items untouched, unlike clearPlanner", async () => {
    await plannerStore.addMeal({
      day: "monday",
      meal: "dinner",
      recipeId: "1",
      recipeName: "Monday Dinner",
      recipeImage: "https://example.com/monday.jpg",
      category: "Test",
      ingredients: [{ name: "Suola", measure: "1 tl" }],
    });

    await plannerStore.toggleShoppingItem("suola");
    await plannerStore.clearDay("monday");

    expect(plannerStore.isShoppingItemChecked("suola")).toBe(true);
  });

  it("does nothing when the day has no assigned meals", async () => {
    await plannerStore.addDraft({
      recipeId: "1",
      recipeName: "Draft Recipe",
      recipeImage: "https://example.com/draft.jpg",
      category: "Test",
      ingredients: [],
    });

    await expect(plannerStore.clearDay("monday")).resolves.toBeUndefined();
    expect(plannerStore.drafts).toHaveLength(1);
  });
});

describe("planner store: unassignMeal", () => {
  let plannerStore: ReturnType<typeof usePlannerStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    plannerStore = usePlannerStore();
  });

  it("turns an assigned meal back into a draft", async () => {
    await plannerStore.addMeal({
      day: "monday",
      meal: "dinner",
      recipeId: "1",
      recipeName: "Kana-currypata",
      recipeImage: "https://example.com/curry.jpg",
      category: "Kana",
      ingredients: [],
    });

    const mealId = plannerStore.getMeals("monday", "dinner")[0].id;
    await plannerStore.unassignMeal(mealId);

    expect(plannerStore.getMeals("monday", "dinner")).toEqual([]);
    expect(plannerStore.drafts.map((item) => item.recipeName)).toEqual(["Kana-currypata"]);
  });
});

describe("planner store: clearPlanner", () => {
  let plannerStore: ReturnType<typeof usePlannerStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    plannerStore = usePlannerStore();
  });

  it("clears every assigned meal across all days", async () => {
    await plannerStore.addMeal({
      day: "monday",
      meal: "dinner",
      recipeId: "1",
      recipeName: "Monday Dinner",
      recipeImage: "https://example.com/monday.jpg",
      category: "Test",
      ingredients: [],
    });

    await plannerStore.addMeal({
      day: "friday",
      meal: "lunch",
      recipeId: "2",
      recipeName: "Friday Lunch",
      recipeImage: "https://example.com/friday.jpg",
      category: "Test",
      ingredients: [],
    });

    await plannerStore.clearPlanner();

    expect(plannerStore.getMeals("monday", "dinner")).toEqual([]);
    expect(plannerStore.getMeals("friday", "lunch")).toEqual([]);
  });

  it("leaves drafts untouched", async () => {
    await plannerStore.addDraft({
      recipeId: "1",
      recipeName: "Draft Recipe",
      recipeImage: "https://example.com/draft.jpg",
      category: "Test",
      ingredients: [],
    });

    await plannerStore.clearPlanner();

    expect(plannerStore.drafts.map((item) => item.recipeName)).toEqual(["Draft Recipe"]);
  });

  it("also clears checked shopping items, unlike clearDay", async () => {
    await plannerStore.addMeal({
      day: "monday",
      meal: "dinner",
      recipeId: "1",
      recipeName: "Monday Dinner",
      recipeImage: "https://example.com/monday.jpg",
      category: "Test",
      ingredients: [{ name: "Suola", measure: "1 tl" }],
    });

    await plannerStore.toggleShoppingItem("suola");
    await plannerStore.clearPlanner();

    expect(plannerStore.isShoppingItemChecked("suola")).toBe(false);
  });
});

describe("planner store: shopping item checkboxes", () => {
  let plannerStore: ReturnType<typeof usePlannerStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    plannerStore = usePlannerStore();
  });

  it("reports an item as unchecked until it's toggled", () => {
    expect(plannerStore.isShoppingItemChecked("suola")).toBe(false);
  });

  it("checks and unchecks an item on repeated toggles", async () => {
    await plannerStore.toggleShoppingItem("suola");
    expect(plannerStore.isShoppingItemChecked("suola")).toBe(true);

    await plannerStore.toggleShoppingItem("suola");
    expect(plannerStore.isShoppingItemChecked("suola")).toBe(false);
  });

  it("tracks multiple checked items independently", async () => {
    await plannerStore.toggleShoppingItem("suola");
    await plannerStore.toggleShoppingItem("sipuli");

    expect(plannerStore.isShoppingItemChecked("suola")).toBe(true);
    expect(plannerStore.isShoppingItemChecked("sipuli")).toBe(true);
    expect(plannerStore.isShoppingItemChecked("valkosipuli")).toBe(false);
  });
});