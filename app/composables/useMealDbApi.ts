import type { MealDbMeal } from "~/types/mealdb";
import { getMealDbSearch } from "~/utils/translations";

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const mealDetailsCache = new Map<string, Promise<MealDbMeal | null>>();

// TheMealDB's free tier starts hard-failing every request (including
// unrelated ones) if too many lookups fire at once, so detail fetches for
// category/area search results are queued through a small shared pool
// instead of firing all in parallel.
const MAX_CONCURRENT_LOOKUPS = 3;
let activeLookups = 0;
const lookupQueue: (() => void)[] = [];

function runNextInQueue() {
  if (activeLookups >= MAX_CONCURRENT_LOOKUPS) {
    return;
  }

  const job = lookupQueue.shift();

  if (!job) {
    return;
  }

  activeLookups++;
  job();
}

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
      cached = new Promise<MealDbMeal | null>((resolve) => {
        lookupQueue.push(() => {
          $fetch<{ meals: MealDbMeal[] | null }>(getLookupUrl(id))
            .then((response) => resolve(response.meals?.[0] ?? null))
            .catch(() => resolve(null))
            .finally(() => {
              activeLookups--;
              runNextInQueue();
            });
        });

        runNextInQueue();
      });

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
