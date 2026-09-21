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

  // Every page (via AppHeader) and every RecipeCard/RecipeDetailContent
  // instance calls this on mount, so a 24-card grid would otherwise fire 24
  // redundant fetches - cache the in-flight/completed request and hand
  // every caller the same one instead of starting a new one each time.
  let loadPromise: Promise<void> | null = null;

  function loadFromStorage() {
    if (!import.meta.client) {
      return Promise.resolve();
    }

    if (!loadPromise) {
      loadPromise = (async () => {
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
      })();
    }

    return loadPromise;
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

  // Turns an already-planned meal back into a draft, e.g. when it's dragged
  // out of the week onto the drafts card - same as assignMeal in reverse.
  async function unassignMeal(plannedMealId: string) {
    const target = plannedMeals.value.find(
      (plannedMeal) => plannedMeal.id === plannedMealId,
    );

    if (!target) {
      return;
    }

    target.day = null;
    target.meal = null;

    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    const { error } = await supabase
      .from("planned_meals")
      .update({ day: null, meal: null })
      .eq("id", plannedMealId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to unassign meal", error);
    }
  }

  const drafts = computed(() =>
    plannedMeals.value.filter((plannedMeal) => !plannedMeal.day || !plannedMeal.meal),
  );

  const shoppingList = computed<ShoppingListItem[]>(() => {
    const measuresByName = new Map<string, { name: string; measures: string[] }>();

    plannedMeals.value.forEach((plannedMeal) => {
      if (!plannedMeal.day || !plannedMeal.meal) {
        return;
      }

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

  // Only clears assigned meals (day + meal set) - drafts (day/meal still
  // null, not yet placed on a day) are left alone, since "clear the week"
  // shouldn't also throw away recipes someone was still deciding on.
  async function clearPlanner() {
    const assignedMealIds = plannedMeals.value
      .filter((plannedMeal) => plannedMeal.day && plannedMeal.meal)
      .map((plannedMeal) => plannedMeal.id);

    plannedMeals.value = plannedMeals.value.filter(
      (plannedMeal) => !assignedMealIds.includes(plannedMeal.id),
    );
    checkedShoppingItems.value = [];

    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    const mealsResultPromise =
      assignedMealIds.length > 0
        ? supabase.from("planned_meals").delete().eq("user_id", userId).in("id", assignedMealIds)
        : Promise.resolve({ error: null });

    const [mealsResult, checkedResult] = await Promise.all([
      mealsResultPromise,
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
    unassignMeal,
    drafts,
    removeMeal,
    getMeals,
    isShoppingItemChecked,
    toggleShoppingItem,
    clearPlanner,
    shoppingList,
  };
});
