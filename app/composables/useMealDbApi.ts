import type { MealDbMeal } from "~/types/mealdb";
import type { MealDbSearch } from "~/utils/translations";

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
  function getSearchUrl(search: MealDbSearch) {
    if (search.type === "category") {
      return `${MEALDB_BASE_URL}/filter.php?c=${search.query}`;
    }

    if (search.type === "area") {
      return `${MEALDB_BASE_URL}/filter.php?a=${search.query}`;
    }

    return `${MEALDB_BASE_URL}/search.php?s=${search.query}`;
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
