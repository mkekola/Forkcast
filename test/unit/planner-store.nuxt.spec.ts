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
      { key: "garlic", name: "Garlic", measures: ["2 cloves", "3 cloves"] },
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