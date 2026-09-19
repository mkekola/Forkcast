<template>
  <main class="min-h-screen bg-fork-bg text-fork-ink">
    <section class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-24 pt-10 sm:pb-10">
      <AppHeader />

      <section class="py-14 md:py-20">
        <div
          class="grid grid-cols-1 gap-4 md:gap-5 md:[grid-template-columns:1.3fr_1.3fr_1fr] md:[grid-template-areas:'hero_hero_a1'_'hero_hero_a3'_'hero_hero_a4']"
        >
          <div
            class="flex flex-col justify-center gap-4 rounded-[2rem] bg-fork-card p-7 ring-1 ring-fork-line shadow-sm md:p-9 md:[grid-area:hero]"
          >
            <p class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay">
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

            <p v-if="randomRecipeError" class="text-sm font-semibold text-red-700">
              Satunnaisen reseptin haku epäonnistui. Kokeile hetken päästä
              uudelleen.
            </p>
          </div>

          <button
            type="button"
            class="flex flex-col justify-center gap-1.5 rounded-[1.5rem] bg-fork-card p-5 text-left ring-1 ring-fork-line shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-fork-clay disabled:cursor-not-allowed disabled:opacity-70 md:[grid-area:a1]"
            :disabled="randomRecipePending"
            @click="getRandomRecipe"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              class="h-6 w-6 text-fork-clay"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3.6" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-[0.1em] text-fork-muted">
              Inspiraatio
            </span>
            <span class="text-base font-black leading-snug">
              {{ randomRecipePending ? "Arvotaan reseptiä…" : "Yllätä minut reseptillä" }}
            </span>
            <span class="text-xs text-fork-muted">Satunnainen resepti</span>
          </button>

          <NuxtLink
            to="/planner"
            class="flex flex-col justify-center gap-1.5 rounded-[1.5rem] bg-fork-card p-5 ring-1 ring-fork-line shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-fork-clay md:[grid-area:a3]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-6 w-6 text-fork-clay"
              aria-hidden="true"
            >
              <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
              <path d="M3.5 9.5h17M8 3v3M16 3v3" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-[0.1em] text-fork-muted">
              Viikko
            </span>
            <span class="text-base font-black leading-snug">Viikkosuunnitelma</span>
            <span class="text-xs text-fork-muted">{{ plannedMealsLabel }}</span>
          </NuxtLink>

          <button
            type="button"
            class="flex flex-col justify-center gap-1.5 rounded-[1.5rem] bg-fork-card p-5 text-left ring-1 ring-fork-line shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-fork-clay md:[grid-area:a4]"
            @click="plannerStore.isShoppingListOpen = true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-6 w-6 text-fork-clay"
              aria-hidden="true"
            >
              <path d="M4 4h2l1.6 10.6a2 2 0 002 1.7h7.6a2 2 0 002-1.7L20 8H7" />
              <circle cx="10" cy="20" r="1.3" />
              <circle cx="17" cy="20" r="1.3" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-[0.1em] text-fork-muted">
              Lista
            </span>
            <span class="text-base font-black leading-snug">Ostoslista</span>
            <span class="text-xs text-fork-muted">{{ shoppingItemsLabel }}</span>
          </button>
        </div>
      </section>

      <section class="pb-14 md:pb-20">
        <div
          v-if="!featuredMeal"
          class="h-72 animate-pulse rounded-[2rem] bg-fork-card ring-1 ring-fork-line md:h-80"
        />

        <NuxtLink
          v-else
          :to="`/recipes/${featuredMeal.idMeal}`"
          class="group relative block h-72 overflow-hidden rounded-[2rem] shadow-lg md:h-80"
        >
          <img
            :src="featuredMeal.strMealThumb"
            :alt="featuredMeal.strMeal"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          >

          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <span
            class="absolute left-6 top-6 rounded-full bg-fork-card/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-fork-clay backdrop-blur"
          >
            Suosituin tänään
          </span>

          <div class="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <p class="text-xs font-bold uppercase tracking-wide text-white/80">
              {{ featuredMealSub }}
            </p>

            <h2 class="mt-2 max-w-xl text-2xl font-black leading-tight text-white md:text-3xl">
              {{ featuredMeal.strMeal }}
            </h2>

            <span
              class="mt-4 inline-flex rounded-full border border-white/70 px-6 py-3 text-sm font-bold text-white backdrop-blur transition group-hover:bg-white group-hover:text-fork-ink"
            >
              Katso resepti →
            </span>
          </div>
        </NuxtLink>
      </section>

      <section id="reseptit" class="pb-20">
        <div class="mb-8 max-w-2xl">
          <div class="flex gap-3">
            <input
              v-model="searchInput"
              type="search"
              placeholder="Hae reseptejä, esim. pasta, kana, curry..."
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

          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="quickSearch in quickSearches"
              :key="quickSearch.query"
              type="button"
              class="rounded-full border px-4 py-2 text-sm font-bold transition"
              :class="
                searchQuery === quickSearch.query
                  ? 'border-fork-clay bg-fork-clay text-white'
                  : 'border-fork-line bg-fork-card text-stone-700 hover:border-fork-ink hover:text-fork-ink'
              "
              @click="selectQuickSearch(quickSearch.query)"
            >
              {{ quickSearch.label }}
            </button>
          </div>
        </div>
        <div
          class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p
              class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay"
            >
              Reseptit
            </p>

            <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Mitä tänään tekisi mieli?
            </h2>
          </div>

          <p class="max-w-md text-sm leading-6 text-fork-muted">
            Hae reseptejä tai valitse pikahaku.
          </p>

          <p
            v-if="searchQuery && !pending && !error"
            class="mt-3 text-sm font-bold text-fork-clay"
          >
            {{ recipes.length }} reseptiä haulla “{{ searchQuery }}”
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
          Ei reseptejä hakusanalla “{{ searchQuery }}”. Kokeile esimerkiksi
          hakua <strong>pasta</strong>, <strong>chicken</strong> tai
          <strong>beef</strong>.
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

const mealDbSearch = computed(() => getMealDbSearch(searchQuery.value));

const hasSearched = computed(() => searchQuery.value.length > 0);

const randomRecipePending = ref(false);
const randomRecipeError = ref(false);

const quickSearches = [
  { label: "Kana", query: "kana" },
  { label: "Naudanliha", query: "naudanliha" },
  { label: "Possu", query: "possu" },
  { label: "Lammas", query: "lammas" },
  { label: "Kasvis", query: "kasvis" },
  { label: "Vegaaninen", query: "vegaaninen" },
  { label: "Pasta", query: "pasta" },
  { label: "Merenelävät", query: "merenelävät" },
  { label: "Aamupala", query: "aamupala" },
  { label: "Lisukkeet", query: "lisukkeet" },
  { label: "Jälkiruoka", query: "jälkiruoka" },
];

const mealDbApi = useMealDbApi();

const FEATURED_STORAGE_KEY = "forkcast-featured-of-day";

const featuredMeal = ref<MealDbMeal | null>(null);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function loadFeaturedMeal() {
  if (import.meta.client) {
    const stored = localStorage.getItem(FEATURED_STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { date: string; meal: MealDbMeal };

        if (parsed.date === todayKey() && parsed.meal) {
          featuredMeal.value = parsed.meal;
          return;
        }
      } catch {
        // corrupt cache entry, fall through and fetch a fresh meal
      }
    }
  }

  const meal = await mealDbApi.fetchRandomMeal();
  featuredMeal.value = meal;

  if (import.meta.client && meal) {
    localStorage.setItem(
      FEATURED_STORAGE_KEY,
      JSON.stringify({ date: todayKey(), meal }),
    );
  }
}

const featuredMealSub = computed(() => {
  if (!featuredMeal.value) {
    return "Haetaan tämän päivän vinkkiä…";
  }

  return `${translateCategory(featuredMeal.value.strCategory)} · ${translateArea(featuredMeal.value.strArea)}`;
});

const plannedMealsLabel = computed(() => {
  const count = plannerStore.plannedMeals.length;
  return count === 1 ? "1 ateria lisätty" : `${count} ateriaa lisätty`;
});

const shoppingItemsLabel = computed(() => {
  const count = plannerStore.shoppingList.length;
  return count === 1 ? "1 tuote" : `${count} tuotetta`;
});

onMounted(() => {
  plannerStore.loadFromStorage();
  loadFeaturedMeal();
});

const { data, pending, error } = await useAsyncData<MealDbSearchResponse | null>(
  "recipe-search",
  () => {
    if (!hasSearched.value) {
      return Promise.resolve(null);
    }

    return $fetch<MealDbSearchResponse>(mealDbApi.getSearchUrl(searchQuery.value));
  },
  {
    watch: [mealDbSearch],
  },
);

function updateSearchQuery(query: string) {
  const trimmedQuery = query.trim();

  router.push({
    path: "/",
    query: trimmedQuery ? { q: trimmedQuery } : {},
  });
}

function searchRecipes() {
  updateSearchQuery(searchInput.value);
}

function selectQuickSearch(query: string) {
  searchInput.value = query;
  updateSearchQuery(query);
}

async function getRandomRecipe() {
  randomRecipePending.value = true;
  randomRecipeError.value = false;

  try {
    const randomMeal = await mealDbApi.fetchRandomMeal();

    if (!randomMeal) {
      randomRecipeError.value = true;
      return;
    }

    await navigateTo(`/recipes/${randomMeal.idMeal}`);
  } catch {
    randomRecipeError.value = true;
  } finally {
    randomRecipePending.value = false;
  }
}

watch(
  () => route.query.q,
  (newQuery) => {
    searchInput.value = typeof newQuery === "string" ? newQuery : "";
  },
);

const recipes = computed(() => {
  if (!searchQuery.value) {
    return [];
  }

  return (data.value?.meals ?? []).map((meal) => {
    const isCategoryResult = mealDbSearch.value.type === "category";
    const fullMeal = meal as MealDbMeal;

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      category: isCategoryResult
        ? translateCategory(mealDbSearch.value.query)
        : translateCategory(fullMeal.strCategory),
      area: isCategoryResult
        ? "Lisätiedot reseptissä"
        : translateArea(fullMeal.strArea),
      description: isCategoryResult
        ? "Avaa resepti nähdäksesi ainesosat ja valmistusohjeet."
        : fullMeal.strInstructions
          ? `${fullMeal.strInstructions.slice(0, 120)}...`
          : "Herkullinen resepti viikon suunnitteluun.",
      image: meal.strMealThumb,
    };
  });
});
</script>
