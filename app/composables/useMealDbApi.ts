import type { MealDbMeal } from "~/types/mealdb";
import { getMealDbSearch } from "~/utils/translations";

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export function useMealDbApi() {
  function getSearchUrl(searchQuery: string) {
    if (!searchQuery) {
      return `${MEALDB_BASE_URL}/search.php?s=`;
    }

    const mealDbSearch = getMealDbSearch(searchQuery);

    if (mealDbSearch.type === "category") {
      return `${MEALDB_BASE_URL}/filter.php?c=${mealDbSearch.query}`;
    }

    return `${MEALDB_BASE_URL}/search.php?s=${mealDbSearch.query}`;
  }

  function getLookupUrl(id: string) {
    return `${MEALDB_BASE_URL}/lookup.php?i=${id}`;
  }

  async function fetchRandomMeal() {
    const response = await $fetch<{ meals: MealDbMeal[] | null }>(
      `${MEALDB_BASE_URL}/random.php`,
    );

    return response.meals?.[0] ?? null;
  }

  return {
    getSearchUrl,
    getLookupUrl,
    fetchRandomMeal,
  };
}