<template>
  <main class="min-h-screen bg-fork-bg text-fork-ink">
    <section class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-24 pt-10 sm:pb-10">
      <AppHeader />

      <section class="py-14 md:py-20">
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch md:gap-5"
        >
          <div
            class="flex flex-col justify-center gap-4 rounded-[2rem] bg-fork-card p-7 ring-1 ring-fork-line shadow-sm md:p-9"
          >
            <p class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark">
              Viikkosi, katettuna.
            </p>

            <h1 class="text-balance text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Suunnittele viikon ruoat ennen kuin nälkä tekee päätökset.
            </h1>

            <p class="max-w-lg text-base leading-7 text-fork-muted md:text-lg md:leading-8">
              Forkcast auttaa löytämään reseptejä, kokoamaan viikon ateriat ja
              muuttamaan suunnitelman käytännölliseksi ostoslistaksi.
            </p>

            <div>
              <NuxtLink
                to="#reseptit"
                class="rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
              >
                Selaa reseptejä
              </NuxtLink>
            </div>
          </div>

          <div class="relative h-72 md:h-auto">
            <img
              src="/images/inspiroidu-doodle.png"
              alt=""
              aria-hidden="true"
              class="pointer-events-none absolute -top-1 right-1 z-20 h-16 w-16 md:-top-2 md:right-0 md:h-20 md:w-20 2xl:-top-4 2xl:-right-36 2xl:h-28 2xl:w-28"
            >

            <div
              class="relative h-full overflow-hidden rounded-[2rem] bg-fork-card ring-1 ring-fork-line shadow-sm"
            >
              <div
                v-if="inspirationRecipes.length === 0"
                class="flex h-full w-full flex-col items-center justify-center gap-3 bg-fork-bg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  class="h-6 w-6 animate-spin text-fork-clay"
                  aria-hidden="true"
                >
                  <path d="M12 3a9 9 0 1 0 9 9" />
                </svg>

                <p class="text-xs font-bold uppercase tracking-[0.1em] text-fork-muted">
                  Haetaan inspiraatiota…
                </p>
              </div>

              <template v-else>
                <NuxtLink
                  :to="`/recipes/${currentInspiration?.idMeal}`"
                  class="group block h-full w-full"
                >
                  <img
                    :src="currentInspiration?.strMealThumb"
                    :alt="currentInspiration?.strMeal"
                    class="h-full w-full object-cover [filter:saturate(1.1)_contrast(1.05)] transition duration-500 group-hover:scale-105"
                  >

                  <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

                  <div class="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-white/80">
                      Inspiraatio
                    </p>

                    <h2 class="mt-1 text-lg font-black leading-snug text-white md:text-xl">
                      {{ currentInspiration?.strMeal }}
                    </h2>
                  </div>
                </NuxtLink>

                <button
                  type="button"
                  class="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-fork-card/90 text-fork-ink shadow-sm backdrop-blur transition hover:bg-fork-card"
                  aria-label="Edellinen inspiraatioresepti"
                  @click.prevent.stop="showPreviousInspiration"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <button
                  type="button"
                  class="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-fork-card/90 text-fork-ink shadow-sm backdrop-blur transition hover:bg-fork-card"
                  aria-label="Seuraava inspiraatioresepti"
                  @click.prevent.stop="showNextInspiration"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>

                <div class="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-1.5">
                  <span
                    v-for="(recipe, index) in inspirationRecipes"
                    :key="recipe.idMeal"
                    class="h-1.5 w-1.5 rounded-full transition"
                    :class="index === inspirationIndex ? 'bg-white' : 'bg-white/40'"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </section>

      <section id="reseptit" class="pb-20">
        <div class="mb-8">
          <div class="flex max-w-2xl gap-3">
            <input
              v-model="searchInput"
              type="search"
              placeholder="Hae reseptejä, esim. pasta, kana tai italialainen..."
              class="w-full rounded-full border border-fork-line bg-fork-card px-5 py-3 text-sm font-medium outline-none transition placeholder:text-stone-400 focus:border-fork-ink"
              @keyup.enter="searchRecipes"
            >

            <button
              type="button"
              class="rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
              @click="searchRecipes"
            >
              Hae
            </button>
          </div>

          <div class="mt-4 flex max-w-xl flex-wrap gap-2">
            <button
              v-for="quickSearch in quickSearches"
              :key="quickSearch.category"
              type="button"
              class="rounded-full border px-4 py-2 text-sm font-bold transition"
              :class="
                selectedCategory === quickSearch.category
                  ? 'border-fork-clay bg-fork-clay text-white'
                  : 'border-fork-line bg-fork-card text-stone-700 hover:border-fork-ink hover:text-fork-ink'
              "
              @click="toggleCategory(quickSearch.category)"
            >
              {{ quickSearch.label }}
            </button>
          </div>
        </div>
        <div
          class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div class="flex items-center gap-4">
            <div>
              <p
                class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark"
              >
                Reseptit
              </p>

              <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                Mitä tänään tekisi mieli?
              </h2>
            </div>

            <img
              src="/images/cooking-doodle.png"
              alt=""
              aria-hidden="true"
              class="hidden w-20 shrink-0 opacity-90 lg:block"
            >
          </div>

          <p
            v-if="hasSearched && !pending && !error"
            class="mt-3 text-sm font-bold text-fork-clay"
          >
            {{ recipes.length }} reseptiä
            <template v-if="selectedCategoryLabel"> kategoriassa {{ selectedCategoryLabel }}</template>
            <template v-if="searchQuery"> haulla “{{ searchQuery }}”</template>
          </p>
        </div>

        <div v-if="hasSearched && pending" class="grid gap-6 md:grid-cols-3">
          <div
            v-for="item in 6"
            :key="item"
            class="h-80 animate-pulse rounded-[1.75rem] bg-fork-card ring-1 ring-fork-line"
          />
        </div>

        <div
          v-else-if="hasSearched && error"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
          Reseptien haku epäonnistui. Kokeile hetken päästä uudelleen.
        </div>

        <div
          v-else-if="!hasSearched"
          class="rounded-3xl border border-dashed border-fork-line bg-fork-card p-8 text-fork-muted"
        >
          Hae reseptejä yllä olevalla haulla tai valitse pikahaku
          aloittaaksesi.
        </div>

        <div
          v-else-if="recipes.length === 0"
          class="rounded-3xl border border-fork-line bg-fork-card p-8 text-fork-muted"
        >
          <template v-if="searchQuery">
            Ei reseptejä hakusanalla “{{ searchQuery }}”<template v-if="selectedCategoryLabel"> kategoriassa {{ selectedCategoryLabel }}</template>.
            Kokeile esimerkiksi hakua <strong>pasta</strong>, <strong>chicken</strong> tai
            <strong>beef</strong>.
          </template>
          <template v-else>
            Ei reseptejä kategoriassa {{ selectedCategoryLabel }}.
          </template>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-3">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import RecipeCard from "~/components/RecipeCard.vue";
import {
  translateArea,
  translateCategory,
  getMealDbSearch,
} from "~/utils/translations";

import type { MealDbSearchResponse, MealDbMeal } from "~/types/mealdb";
import { useMealDbApi } from "~/composables/useMealDbApi";
import { usePlannerStore } from "~/stores/planner";

const route = useRoute();
const router = useRouter();
const plannerStore = usePlannerStore();

const initialSearchQuery =
  typeof route.query.q === "string" ? route.query.q : "";

const searchInput = ref(initialSearchQuery);

const searchQuery = computed(() => {
  return typeof route.query.q === "string" ? route.query.q.trim() : "";
});

const selectedCategory = computed(() => {
  return typeof route.query.cat === "string" ? route.query.cat : null;
});

const selectedCategoryLabel = computed(() =>
  selectedCategory.value ? translateCategory(selectedCategory.value) : null,
);

// A quick-search chip always narrows by category. When free text is also
// present, that text is used to filter the category results by title
// client-side (TheMealDB has no "category + text" endpoint) instead of
// being interpreted as its own name/area/category search.
const mealDbSearch = computed(() => {
  if (selectedCategory.value) {
    return { type: "category" as const, query: selectedCategory.value };
  }

  return getMealDbSearch(searchQuery.value);
});

const isCombinedFilter = computed(
  () => Boolean(selectedCategory.value) && searchQuery.value.length > 0,
);

const hasSearched = computed(
  () => searchQuery.value.length > 0 || Boolean(selectedCategory.value),
);

const quickSearches = [
  { label: "Kana", category: "Chicken" },
  { label: "Naudanliha", category: "Beef" },
  { label: "Possu", category: "Pork" },
  { label: "Lammas", category: "Lamb" },
  { label: "Kasvis", category: "Vegetarian" },
  { label: "Vegaaninen", category: "Vegan" },
  { label: "Pasta", category: "Pasta" },
  { label: "Merenelävät", category: "Seafood" },
  { label: "Aamupala", category: "Breakfast" },
  { label: "Lisukkeet", category: "Side" },
  { label: "Jälkiruoka", category: "Dessert" },
];

const mealDbApi = useMealDbApi();

const INSPIRATION_RECIPE_COUNT = 5;
const INSPIRATION_STORAGE_KEY = "forkcast-inspiration-of-day";
const INSPIRATION_BATCH_SIZE = INSPIRATION_RECIPE_COUNT + 2;
const INSPIRATION_MAX_ROUNDS = 4;

const inspirationRecipes = ref<MealDbMeal[]>([]);
const inspirationIndex = ref(0);

const currentInspiration = computed(
  () => inspirationRecipes.value[inspirationIndex.value] ?? null,
);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadCachedInspiration() {
  if (!import.meta.client) {
    return false;
  }

  const stored = localStorage.getItem(INSPIRATION_STORAGE_KEY);

  if (!stored) {
    return false;
  }

  try {
    const parsed = JSON.parse(stored) as { date: string; meals: MealDbMeal[] };

    if (parsed.date === todayKey() && parsed.meals?.length) {
      inspirationRecipes.value = parsed.meals;
      inspirationIndex.value = 0;
      return true;
    }
  } catch {
    // corrupt cache entry, fall through and fetch a fresh set
  }

  return false;
}

async function loadInspirationRecipes() {
  if (loadCachedInspiration()) {
    return;
  }

  // Recipes with a tagged country (strArea) tend to come from TheMealDB's
  // curated older set and have noticeably better photos than the newer
  // bulk-added ones, so keep re-rolling random.php until we have enough.
  const seenIds = new Set<string>();
  const uniqueMeals: MealDbMeal[] = [];

  for (
    let round = 0;
    round < INSPIRATION_MAX_ROUNDS && uniqueMeals.length < INSPIRATION_RECIPE_COUNT;
    round++
  ) {
    const batch = await Promise.all(
      Array.from({ length: INSPIRATION_BATCH_SIZE }, () => mealDbApi.fetchRandomMeal()),
    );

    for (const meal of batch) {
      if (uniqueMeals.length >= INSPIRATION_RECIPE_COUNT) {
        break;
      }

      if (meal?.strArea && !seenIds.has(meal.idMeal)) {
        seenIds.add(meal.idMeal);
        uniqueMeals.push(meal);
      }
    }
  }

  inspirationRecipes.value = uniqueMeals;
  inspirationIndex.value = 0;

  if (import.meta.client && uniqueMeals.length > 0) {
    localStorage.setItem(
      INSPIRATION_STORAGE_KEY,
      JSON.stringify({ date: todayKey(), meals: uniqueMeals }),
    );
  }
}

function showNextInspiration() {
  if (inspirationRecipes.value.length === 0) {
    return;
  }

  inspirationIndex.value = (inspirationIndex.value + 1) % inspirationRecipes.value.length;
}

function showPreviousInspiration() {
  if (inspirationRecipes.value.length === 0) {
    return;
  }

  inspirationIndex.value =
    (inspirationIndex.value - 1 + inspirationRecipes.value.length) %
    inspirationRecipes.value.length;
}

onMounted(() => {
  plannerStore.loadFromStorage();
  loadInspirationRecipes();
});

const { data, pending, error } = await useAsyncData<MealDbSearchResponse | null>(
  "recipe-search",
  () => {
    if (!hasSearched.value) {
      return Promise.resolve(null);
    }

    return $fetch<MealDbSearchResponse>(mealDbApi.getSearchUrl(mealDbSearch.value));
  },
  {
    watch: [mealDbSearch],
  },
);

function updateSearchQuery(query: string) {
  const trimmedQuery = query.trim();

  router.push({
    path: "/",
    query: {
      ...(trimmedQuery ? { q: trimmedQuery } : {}),
      ...(selectedCategory.value ? { cat: selectedCategory.value } : {}),
    },
  });
}

function searchRecipes() {
  updateSearchQuery(searchInput.value);
}

function toggleCategory(category: string) {
  const nextCategory = selectedCategory.value === category ? null : category;

  router.push({
    path: "/",
    query: {
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
      ...(nextCategory ? { cat: nextCategory } : {}),
    },
  });
}

watch(
  () => route.query.q,
  (newQuery) => {
    searchInput.value = typeof newQuery === "string" ? newQuery : "";
  },
);

// When a category chip and free text are both active, TheMealDB has no
// "category + text" endpoint, so the category's results are narrowed by
// title client-side instead.
const filteredMeals = computed(() => {
  const meals = data.value?.meals ?? [];

  if (!isCombinedFilter.value) {
    return meals;
  }

  const text = searchQuery.value.toLowerCase();

  return meals.filter((meal) => meal.strMeal.toLowerCase().includes(text));
});

// TheMealDB's free tier starts failing unrelated requests too if we fetch
// details for every result in a large category/area (some have 100+), so
// only the cards visible without scrolling get the real country/category.
const DETAIL_LOOKUP_LIMIT = 12;

const mealDetails = ref(new Map<string, MealDbMeal>());

watch(
  filteredMeals,
  (meals) => {
    const search = mealDbSearch.value;

    if (!meals || (search.type !== "category" && search.type !== "area")) {
      return;
    }

    for (const meal of meals.slice(0, DETAIL_LOOKUP_LIMIT)) {
      if (mealDetails.value.has(meal.idMeal)) {
        continue;
      }

      mealDbApi.fetchMealDetails(meal.idMeal).then((details) => {
        if (details) {
          mealDetails.value.set(meal.idMeal, details);
          mealDetails.value = new Map(mealDetails.value);
        }
      });
    }
  },
  { immediate: true },
);

const recipes = computed(() => {
  if (!hasSearched.value) {
    return [];
  }

  const search = mealDbSearch.value;

  return filteredMeals.value.map((meal, mealIndex) => {
    const fullMeal = meal as MealDbMeal;

    if (search.type === "category") {
      const details = mealDetails.value.get(meal.idMeal);
      const isLookedUp = mealIndex < DETAIL_LOOKUP_LIMIT;

      return {
        id: meal.idMeal,
        title: meal.strMeal,
        category: translateCategory(search.query),
        area: details
          ? translateArea(details.strArea ?? details.strCountry)
          : isLookedUp
            ? "Ladataan…"
            : "Lisätiedot reseptissä",
        image: meal.strMealThumb,
      };
    }

    if (search.type === "area") {
      const details = mealDetails.value.get(meal.idMeal);
      const isLookedUp = mealIndex < DETAIL_LOOKUP_LIMIT;

      return {
        id: meal.idMeal,
        title: meal.strMeal,
        category: details
          ? translateCategory(details.strCategory)
          : isLookedUp
            ? "Ladataan…"
            : "Lisätiedot reseptissä",
        area: translateArea(search.query),
        image: meal.strMealThumb,
      };
    }

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      category: translateCategory(fullMeal.strCategory),
      area: translateArea(fullMeal.strArea ?? fullMeal.strCountry),
      description: fullMeal.strInstructions
        ? `${fullMeal.strInstructions.slice(0, 120)}...`
        : "Herkullinen resepti viikon suunnitteluun.",
      image: meal.strMealThumb,
    };
  });
});
</script>
