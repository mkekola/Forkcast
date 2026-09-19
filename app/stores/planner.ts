import {
  categorizeIngredient,
  combineMeasures,
  type ShoppingCategory,
} from "~/utils/shoppingList";

export type MealType = "breakfast" | "lunch" | "dinner";

export type Ingredient = {
  name: string;
  measure: string;
};

export type PlannedMeal = {
  id: string;
  day: string;
  meal: MealType;
  recipeId: string;
  recipeName: string;
  recipeImage: string;
  category: string;
  ingredients?: Ingredient[];
};

export type ShoppingListItem = {
  key: string;
  name: string;
  measure: string;
  category: ShoppingCategory;
};

type PlannerStorage = {
  plannedMeals: PlannedMeal[];
  checkedShoppingItems: string[];
};

const STORAGE_KEY = "forkcast-planner";

function createPlannedMealId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizePlannedMeals(meals: PlannedMeal[]) {
  return meals.map((meal) => ({
    ...meal,
    id: meal.id ?? createPlannedMealId(),
  }));
}

export const usePlannerStore = defineStore("planner", () => {
  const plannedMeals = ref<PlannedMeal[]>([]);
  const checkedShoppingItems = ref<string[]>([]);

  function loadFromStorage() {
    if (!import.meta.client) {
      return;
    }

    const storedPlanner = localStorage.getItem(STORAGE_KEY);

    if (!storedPlanner) {
      return;
    }

    try {
      const parsedPlanner = JSON.parse(storedPlanner);

      // Backwards compatibility: old version stored only PlannedMeal[]
      if (Array.isArray(parsedPlanner)) {
        plannedMeals.value = normalizePlannedMeals(parsedPlanner);
        checkedShoppingItems.value = [];
        return;
      }

      const plannerStorage = parsedPlanner as PlannerStorage;

      plannedMeals.value = normalizePlannedMeals(
        plannerStorage.plannedMeals ?? [],
      );
      checkedShoppingItems.value = plannerStorage.checkedShoppingItems ?? [];
    } catch {
      plannedMeals.value = [];
      checkedShoppingItems.value = [];
    }
  }

  function saveToStorage() {
    if (!import.meta.client) {
      return;
    }

    const plannerStorage: PlannerStorage = {
      plannedMeals: plannedMeals.value,
      checkedShoppingItems: checkedShoppingItems.value,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(plannerStorage));
  }

  function addMeal(meal: Omit<PlannedMeal, "id">) {
    plannedMeals.value.push({
      ...meal,
      id: createPlannedMealId(),
    });

    saveToStorage();
  }
  
  const shoppingList = computed<ShoppingListItem[]>(() => {
    const measuresByName = new Map<string, { name: string; measures: string[] }>();

    plannedMeals.value.forEach((plannedMeal) => {
      plannedMeal.ingredients?.forEach((ingredient) => {
        const key = ingredient.name.toLowerCase().trim();
        const existingIngredient = measuresByName.get(key);

        if (existingIngredient) {
          if (ingredient.measure) {
            existingIngredient.measures.push(ingredient.measure);
          }

          return;
        }

        measuresByName.set(key, {
          name: ingredient.name,
          measures: ingredient.measure ? [ingredient.measure] : [],
        });
      });
    });

    return Array.from(measuresByName.entries())
      .map(([key, { name, measures }]) => ({
        key,
        name,
        measure: combineMeasures(measures),
        category: categorizeIngredient(name),
      }))
      .sort((firstItem, secondItem) =>
        firstItem.name.localeCompare(secondItem.name, "fi"),
      );
  });

  function removeMeal(plannedMealId: string) {
    plannedMeals.value = plannedMeals.value.filter(
      (plannedMeal) => plannedMeal.id !== plannedMealId,
    );

    saveToStorage();
  }

  function getMeals(day: string, meal: MealType) {
    return plannedMeals.value.filter(
      (plannedMeal) => plannedMeal.day === day && plannedMeal.meal === meal,
    );
  }

  function isShoppingItemChecked(itemKey: string) {
    return checkedShoppingItems.value.includes(itemKey);
  }

  function toggleShoppingItem(itemKey: string) {
    if (isShoppingItemChecked(itemKey)) {
      checkedShoppingItems.value = checkedShoppingItems.value.filter(
        (checkedItem) => checkedItem !== itemKey,
      );
    } else {
      checkedShoppingItems.value.push(itemKey);
    }

    saveToStorage();
  }

  function clearPlanner() {
    plannedMeals.value = [];
    checkedShoppingItems.value = [];
    saveToStorage();
  }

  return {
    plannedMeals,
    checkedShoppingItems,
    loadFromStorage,
    addMeal,
    removeMeal,
    getMeals,
    isShoppingItemChecked,
    toggleShoppingItem,
    clearPlanner,
    shoppingList,
  };
});
