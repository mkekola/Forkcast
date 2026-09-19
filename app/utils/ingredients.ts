import type { MealDbMeal } from "~/types/mealdb";
import type { Ingredient } from "~/stores/planner";

export function extractIngredients(meal: MealDbMeal): Ingredient[] {
  return Array.from({ length: 20 }, (_, index) => {
    const number = index + 1;
    const name = meal[`strIngredient${number}`]?.trim();
    const measure = meal[`strMeasure${number}`]?.trim();

    return { name, measure };
  }).filter((ingredient): ingredient is Ingredient => Boolean(ingredient.name));
}
