<template>
  <main class="min-h-screen bg-fork-bg px-6 pb-24 pt-10 text-fork-ink sm:pb-10">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <section class="py-14">
        <p
          class="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark"
        >
          Suosikit
        </p>

        <h1 class="text-4xl font-black tracking-tight md:text-5xl">
          Reseptit, joihin haluat palata.
        </h1>

        <p class="mt-4 max-w-2xl leading-7 text-fork-muted">
          Tallenna kiinnostavat reseptit suosikkeihin ja lisää ne myöhemmin
          viikkosuunnitelmaan.
        </p>
      </section>

      <div
        v-if="favoritesStore.favorites.length === 0"
        class="rounded-[2rem] border border-dashed border-fork-line bg-fork-card p-8 text-center shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="2.5 2.5"
          class="mx-auto h-10 w-10 text-fork-clay"
          aria-hidden="true"
        >
          <path
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>

        <p
          class="mt-4 text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark"
        >
          Ei suosikkeja vielä
        </p>

        <h2 class="mt-3 text-2xl font-black tracking-tight">
          Sydän kaipaa ensimmäistä reseptiä.
        </h2>

        <p class="mx-auto mt-3 max-w-xl leading-7 text-fork-muted">
          Selaa reseptejä ja paina sydäntä tallentaaksesi parhaat ideat talteen.
        </p>

        <NuxtLink
          to="/"
          class="mt-6 inline-flex rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
        >
          Selaa reseptejä
        </NuxtLink>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-3">
        <RecipeCard
          v-for="recipe in favoritesStore.favorites"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>

      <section v-if="suggestedRecipes.length > 0" class="mt-16">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark">
              Sinulle poimittua
            </p>

            <h2 class="text-3xl font-black tracking-tight">
              Koska tykkäät {{ suggestionCategoryLabel }}-resepteistä
            </h2>
          </div>

          <button
            type="button"
            class="flex items-center gap-2 rounded-full border border-fork-line bg-fork-card px-5 py-3 text-sm font-bold text-stone-700 transition hover:border-fork-ink hover:text-fork-ink"
            :disabled="suggestionPool.length <= SUGGESTION_COUNT"
            @click="refreshSuggestions"
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
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Arvo uudet
          </button>
        </div>

        <div class="mt-6 grid gap-6 md:grid-cols-3">
          <RecipeCard
            v-for="recipe in suggestedRecipes"
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
import { useFavoritesStore } from "~/stores/favorites";
import { useRecipesApi } from "~/composables/useRecipesApi";
import {
  translateArea,
  translateCategory,
  reverseTranslateCategory,
} from "~/utils/translations";
import type { Recipe } from "~/types/recipe";

const favoritesStore = useFavoritesStore();
const recipesApi = useRecipesApi();

useSeoMeta({
  title: "Suosikit · Forkcast",
  description: "Tallennetut suosikkireseptit Forkcastissa.",
});

// Fetches more than SUGGESTION_COUNT - some results will usually already be
// favorited (filtered back out below), and the rest form a pool "Arvo
// uudet" reshuffles client-side rather than refetching.
const SUGGESTION_COUNT = 6;
const SUGGESTION_FETCH_SIZE = 24;

const suggestionPool = ref<Recipe[]>([]);
const suggestedRecipes = ref<Recipe[]>([]);
const suggestionCategoryLabel = ref<string | null>(null);

function shuffled<T>(items: T[]) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// The category with the most favorites - the simplest signal that's still
// meaningful with just a handful of saved recipes. Ties go to whichever
// category was favorited first.
const topFavoriteCategory = computed(() => {
  const counts = new Map<string, number>();

  for (const favorite of favoritesStore.favorites) {
    counts.set(favorite.category, (counts.get(favorite.category) ?? 0) + 1);
  }

  let topCategory: string | null = null;
  let topCount = 0;

  for (const [category, count] of counts) {
    if (count > topCount) {
      topCategory = category;
      topCount = count;
    }
  }

  return topCategory;
});

async function loadSuggestions() {
  const finnishCategory = topFavoriteCategory.value;
  // Favorites store the already-translated (Finnish) category, but the
  // search RPC needs the raw English category key back.
  const rawCategory = finnishCategory ? reverseTranslateCategory(finnishCategory) : null;

  if (!rawCategory) {
    suggestionPool.value = [];
    suggestedRecipes.value = [];
    suggestionCategoryLabel.value = null;
    return;
  }

  const { results } = await recipesApi.searchRecipes({
    categories: [rawCategory],
    pageSize: SUGGESTION_FETCH_SIZE,
  });

  const favoriteIds = new Set(favoritesStore.favorites.map((favorite) => favorite.id));

  suggestionPool.value = results
    .filter((result) => !favoriteIds.has(result.id))
    .map((result) => ({
      id: result.id,
      title: result.title,
      category: translateCategory(result.category),
      area: translateArea(result.area),
      description: result.instructions
        ? `${result.instructions.slice(0, 120)}...`
        : "Herkullinen resepti viikon suunnitteluun.",
      image: result.image,
    }));

  suggestionCategoryLabel.value = finnishCategory;
  suggestedRecipes.value = shuffled(suggestionPool.value).slice(0, SUGGESTION_COUNT);
}

function refreshSuggestions() {
  suggestedRecipes.value = shuffled(suggestionPool.value).slice(0, SUGGESTION_COUNT);
}

onMounted(async () => {
  await favoritesStore.loadFavorites();
  await loadSuggestions();
});
</script>
