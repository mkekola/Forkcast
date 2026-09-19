import {
  categorizeIngredient,
  combineMeasures,
  type ShoppingCategory,
} from "~/utils/shoppingList";

export type MealType = "breakfast" | "lunch" | "dinner" | "supper";

export type Ingredient = {
  name: string;
  measure: string;
};

export type PlannedMeal = {
  id: string;
  day: string | null;
  meal: MealType | null;
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

type PlannedMealRow = {
  id: string;
  day: string | null;
  meal: string | null;
  recipe_id: string;
  recipe_name: string;
  recipe_image: string;
  category: string;
  ingredients: Ingredient[] | null;
};

function toPlannedMeal(row: PlannedMealRow): PlannedMeal {
  return {
    id: row.id,
    day: row.day,
    meal: row.meal as MealType | null,
    recipeId: row.recipe_id,
    recipeName: row.recipe_name,
    recipeImage: row.recipe_image,
    category: row.category,
    ingredients: row.ingredients ?? undefined,
  };
}

export const usePlannerStore = defineStore("planner", () => {
  const plannedMeals = ref<PlannedMeal[]>([]);
  const checkedShoppingItems = ref<string[]>([]);
  const isShoppingListOpen = ref(false);
  const isDraftsOpen = ref(false);
  const isDragging = ref(false);

  async function loadFromStorage() {
    if (!import.meta.client) {
      return;
    }

    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    const [mealsResult, checkedResult] = await Promise.all([
      supabase
        .from("planned_meals")
        .select("id, day, meal, recipe_id, recipe_name, recipe_image, category, ingredients")
        .eq("user_id", userId),
      supabase
        .from("checked_shopping_items")
        .select("item_key")
        .eq("user_id", userId),
    ]);

    if (mealsResult.error) {
      console.error("Failed to load planned meals", mealsResult.error);
    } else {
      plannedMeals.value = (mealsResult.data as PlannedMealRow[]).map(toPlannedMeal);
    }

    if (checkedResult.error) {
      console.error("Failed to load checked shopping items", checkedResult.error);
    } else {
      checkedShoppingItems.value = checkedResult.data.map((row) => row.item_key as string);
    }
  }

  async function addMeal(meal: Omit<PlannedMeal, "id">) {
    const id = crypto.randomUUID();

    plannedMeals.value.push({ ...meal, id });

    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    const { error } = await supabase.from("planned_meals").insert({
      id,
      user_id: userId,
      day: meal.day,
      meal: meal.meal,
      recipe_id: meal.recipeId,
      recipe_name: meal.recipeName,
      recipe_image: meal.recipeImage,
      category: meal.category,
      ingredients: meal.ingredients ?? null,
    });

    if (error) {
      console.error("Failed to add meal", error);
    }
  }

  async function addDraft(meal: Omit<PlannedMeal, "id" | "day" | "meal">) {
    await addMeal({ ...meal, day: null, meal: null });
  }

  async function assignMeal(plannedMealId: string, day: string, meal: MealType) {
    const target = plannedMeals.value.find(
      (plannedMeal) => plannedMeal.id === plannedMealId,
    );

    if (!target) {
      return;
    }

    target.day = day;
    target.meal = meal;

    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    const { error } = await supabase
      .from("planned_meals")
      .update({ day, meal })
      .eq("id", plannedMealId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to assign meal", error);
    }
  }

  function getDrafts() {
    return plannedMeals.value.filter(
      (plannedMeal) => !plannedMeal.day || !plannedMeal.meal,
    );
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

  async function removeMeal(plannedMealId: string) {
    plannedMeals.value = plannedMeals.value.filter(
      (plannedMeal) => plannedMeal.id !== plannedMealId,
    );

    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    const { error } = await supabase
      .from("planned_meals")
      .delete()
      .eq("id", plannedMealId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to remove meal", error);
    }
  }

  function getMeals(day: string, meal: MealType) {
    return plannedMeals.value.filter(
      (plannedMeal) => plannedMeal.day === day && plannedMeal.meal === meal,
    );
  }

  function isShoppingItemChecked(itemKey: string) {
    return checkedShoppingItems.value.includes(itemKey);
  }

  async function toggleShoppingItem(itemKey: string) {
    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    if (isShoppingItemChecked(itemKey)) {
      checkedShoppingItems.value = checkedShoppingItems.value.filter(
        (checkedItem) => checkedItem !== itemKey,
      );

      const { error } = await supabase
        .from("checked_shopping_items")
        .delete()
        .eq("user_id", userId)
        .eq("item_key", itemKey);

      if (error) {
        console.error("Failed to uncheck shopping item", error);
      }

      return;
    }

    checkedShoppingItems.value.push(itemKey);

    const { error } = await supabase
      .from("checked_shopping_items")
      .insert({ user_id: userId, item_key: itemKey });

    if (error) {
      console.error("Failed to check shopping item", error);
    }
  }

  async function clearPlanner() {
    plannedMeals.value = [];
    checkedShoppingItems.value = [];

    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    const [mealsResult, checkedResult] = await Promise.all([
      supabase.from("planned_meals").delete().eq("user_id", userId),
      supabase.from("checked_shopping_items").delete().eq("user_id", userId),
    ]);

    if (mealsResult.error) {
      console.error("Failed to clear planned meals", mealsResult.error);
    }

    if (checkedResult.error) {
      console.error("Failed to clear checked shopping items", checkedResult.error);
    }
  }

  return {
    plannedMeals,
    checkedShoppingItems,
    isShoppingListOpen,
    isDraftsOpen,
    isDragging,
    loadFromStorage,
    addMeal,
    addDraft,
    assignMeal,
    getDrafts,
    removeMeal,
    getMeals,
    isShoppingItemChecked,
    toggleShoppingItem,
    clearPlanner,
    shoppingList,
  };
});
