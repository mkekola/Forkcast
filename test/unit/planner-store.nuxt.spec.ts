import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlannerStore } from "~/stores/planner";

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
      ingredients: [{ name: "Garlic", measure: "2 cloves" }],
    });

    plannerStore.addMeal({
      day: "tuesday",
      meal: "dinner",
      recipeId: "2",
      recipeName: "Garlic Butter Chicken",
      recipeImage: "https://example.com/chicken.jpg",
      category: "Chicken",
      ingredients: [{ name: "garlic", measure: "3 cloves" }],
    });

    expect(plannerStore.shoppingList).toEqual([
      {
        key: "garlic",
        name: "Garlic",
        measure: "5 cloves",
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
        { name: "Ground Cumin", measure: "1 tsp" },
        { name: "Chicken breast", measure: "500 g" },
      ],
    });

    expect(
      plannerStore.shoppingList.map((item) => [item.name, item.category]),
    ).toEqual([
      ["Chicken breast", "proteiinit"],
      ["Ground Cumin", "mausteet"],
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
        { name: "Zucchini", measure: "1" },
        { name: "Apple", measure: "2" },
      ],
    });

    expect(plannerStore.shoppingList.map((item) => item.name)).toEqual([
      "Apple",
      "Zucchini",
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

    expect(plannerStore.getDrafts().map((item) => item.recipeName)).toEqual([
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

    const draftId = plannerStore.getDrafts()[0].id;
    plannerStore.assignMeal(draftId, "tuesday", "lunch");

    expect(plannerStore.getDrafts()).toEqual([]);
    expect(plannerStore.getMeals("tuesday", "lunch").map((item) => item.recipeName)).toEqual([
      "Draft Recipe",
    ]);
  });

  it("still includes draft ingredients in the shopping list", () => {
    plannerStore.addDraft({
      recipeId: "1",
      recipeName: "Draft Recipe",
      recipeImage: "https://example.com/draft.jpg",
      category: "Test",
      ingredients: [{ name: "Onion", measure: "1" }],
    });

    expect(plannerStore.shoppingList.map((item) => item.name)).toEqual(["Onion"]);
  });
});