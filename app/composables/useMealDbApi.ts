import type { MealDbMeal } from "~/types/mealdb";
import { getMealDbSearch } from "~/utils/translations";

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const mealDetailsCache = new Map<string, Promise<MealDbMeal | null>>();

export function useMealDbApi() {
  function getSearchUrl(searchQuery: string) {
    if (!searchQuery) {
      return `${MEALDB_BASE_URL}/search.php?s=`;
    }

    const mealDbSearch = getMealDbSearch(searchQuery);

    if (mealDbSearch.type === "category") {
      return `${MEALDB_BASE_URL}/filter.php?c=${mealDbSearch.query}`;
    }

    if (mealDbSearch.type === "area") {
      return `${MEALDB_BASE_URL}/filter.php?a=${mealDbSearch.query}`;
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

  function fetchMealDetails(id: string) {
    let cached = mealDetailsCache.get(id);

    if (!cached) {
      cached = $fetch<{ meals: MealDbMeal[] | null }>(getLookupUrl(id))
        .then((response) => response.meals?.[0] ?? null)
        .catch(() => null);
      mealDetailsCache.set(id, cached);
    }

    return cached;
  }

  return {
    getSearchUrl,
    getLookupUrl,
    fetchRandomMeal,
    fetchMealDetails,
  };
}
