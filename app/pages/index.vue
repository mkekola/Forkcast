<template>
  <main class="min-h-screen bg-fork-bg px-6 pb-24 pt-10 text-fork-ink sm:pb-10">
    <section class="mx-auto max-w-6xl">
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
              @mouseenter="stopAutoAdvance"
              @mouseleave="startAutoAdvance"
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
                  v-slot="{ href }"
                  :to="`/recipes/${currentInspiration?.id}`"
                  custom
                >
                  <a
                    :href="href"
                    class="group relative block h-full w-full"
                    @click="handleInspirationClick"
                  >
                    <Transition
                      mode="out-in"
                      enter-active-class="transition duration-700 ease-out"
                      enter-from-class="opacity-0"
                      enter-to-class="opacity-100"
                      leave-active-class="transition duration-500 ease-in"
                      leave-from-class="opacity-100"
                      leave-to-class="opacity-0"
                    >
                      <div :key="currentInspiration?.id" class="absolute inset-0">
                        <img
                          :src="currentInspiration?.image"
                          :alt="currentInspiration?.title"
                          class="h-full w-full object-cover [filter:saturate(1.1)_contrast(1.05)] transition duration-500 group-hover:scale-105"
                        >

                        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

                        <div class="absolute inset-x-0 bottom-0 p-5 md:p-6">
                          <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-white/80">
                            Inspiraatio
                          </p>

                          <h2 class="mt-1 text-lg font-black leading-snug text-white md:text-xl">
                            {{ currentInspiration?.title }}
                          </h2>
                        </div>
                      </div>
                    </Transition>
                  </a>
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
                    :key="recipe.id"
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
          <div
            ref="searchContainerRef"
            class="relative max-w-2xl"
            @focusout="handleSearchContainerFocusOut"
          >
            <div class="flex gap-3">
              <input
                v-model="searchInput"
                type="search"
                placeholder="Hae reseptejä, esim. pasta, kana tai italialainen..."
                class="w-full rounded-full border border-fork-line bg-fork-card px-5 py-3 text-sm font-medium outline-none transition placeholder:text-stone-400 focus:border-fork-ink"
                autocomplete="off"
                @focus="showSuggestions = true"
                @keydown="handleSearchKeydown"
              >

              <button
                type="button"
                class="rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
                @click="searchRecipes"
              >
                Hae
              </button>
            </div>

            <div
              v-if="showSuggestions && hasSuggestions"
              class="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl bg-fork-card p-2 shadow-xl ring-1 ring-fork-line"
            >
              <div v-if="wordSuggestions.length" class="space-y-1">
                <button
                  v-for="(word, index) in wordSuggestions"
                  :key="word"
                  type="button"
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition"
                  :class="
                    activeSuggestionIndex === index
                      ? 'bg-fork-clay-soft text-fork-clay'
                      : 'text-fork-ink hover:bg-fork-bg'
                  "
                  @click="selectWordSuggestion(word)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4 shrink-0 text-fork-muted"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  {{ word }}
                </button>
              </div>

              <div
                v-if="recipeSuggestions.length"
                class="space-y-1"
                :class="{ 'mt-2 border-t border-fork-line pt-2': wordSuggestions.length }"
              >
                <NuxtLink
                  v-for="(recipe, recipeIndex) in recipeSuggestions"
                  v-slot="{ href }"
                  :key="recipe.id"
                  :to="`/recipes/${recipe.id}`"
                  custom
                >
                  <a
                    :href="href"
                    class="flex items-center gap-3 rounded-xl p-2 transition"
                    :class="
                      activeSuggestionIndex === wordSuggestions.length + recipeIndex
                        ? 'bg-fork-clay-soft'
                        : 'hover:bg-fork-bg'
                    "
                    @click="(event) => selectRecipeSuggestion(event, recipe)"
                  >
                    <img
                      :src="recipe.image"
                      :alt="recipe.title"
                      class="h-10 w-10 shrink-0 rounded-lg object-cover"
                    >

                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-bold text-fork-ink">
                        {{ recipe.title }}
                      </p>

                      <p class="text-xs text-fork-muted">
                        {{ translateCategory(recipe.category) }}
                      </p>
                    </div>
                  </a>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="mt-4 flex max-w-xl flex-wrap gap-2">
            <button
              v-for="quickSearch in quickSearches"
              :key="quickSearch.category"
              type="button"
              class="rounded-full border px-4 py-2 text-sm font-bold transition"
              :class="
                selectedCategories.includes(quickSearch.category)
                  ? 'border-fork-clay bg-fork-clay text-white'
                  : 'border-fork-line bg-fork-card text-stone-700 hover:border-fork-ink hover:text-fork-ink'
              "
              @click="toggleCategory(quickSearch.category)"
            >
              {{ quickSearch.label }}
            </button>

            <button
              v-if="selectedCategories.length > 0"
              type="button"
              class="rounded-full border border-fork-line bg-fork-card px-4 py-2 text-sm font-bold text-fork-muted transition hover:border-fork-ink hover:text-fork-ink"
              @click="clearCategories"
            >
              Tyhjennä valinnat ✕
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
            v-if="!pending && !error"
            class="mt-3 text-sm font-bold text-fork-clay"
          >
            {{ totalCount }} reseptiä
            <template v-if="categoryLabels.length"> kategorioissa {{ categoryLabels.join(" + ") }}</template>
            <template v-if="searchQuery"> haulla “{{ searchQuery }}”</template>
          </p>
        </div>

        <div v-if="pending" class="grid gap-6 md:grid-cols-3">
          <div
            v-for="item in 6"
            :key="item"
            class="h-80 animate-pulse rounded-[1.75rem] bg-fork-card ring-1 ring-fork-line"
          />
        </div>

        <div
          v-else-if="error"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
          Reseptien haku epäonnistui. Kokeile hetken päästä uudelleen.
        </div>

        <div
          v-else-if="recipes.length === 0"
          class="rounded-3xl border border-fork-line bg-fork-card p-8 text-fork-muted"
        >
          <template v-if="searchQuery">
            Ei reseptejä hakusanalla “{{ searchQuery }}”<template v-if="categoryLabels.length"> kategorioissa {{ categoryLabels.join(" + ") }}</template>.
            Kokeile esimerkiksi hakua <strong>pasta</strong>, <strong>chicken</strong> tai
            <strong>beef</strong>.
          </template>
          <template v-else-if="categoryLabels.length">
            Ei reseptejä kategorioissa {{ categoryLabels.join(" + ") }}.
          </template>
          <template v-else>
            Ei reseptejä.
          </template>
        </div>

        <template v-else>
          <div class="grid gap-6 md:grid-cols-3">
            <RecipeCard
              v-for="recipe in recipes"
              :key="recipe.id"
              :recipe="recipe"
            />
          </div>

          <div
            v-if="totalPages > 1"
            class="mt-10 flex items-center justify-center gap-4"
          >
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-fork-line bg-fork-card text-fork-ink transition hover:border-fork-ink disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage <= 1"
              aria-label="Edellinen sivu"
              @click="goToPage(currentPage - 1)"
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

            <span class="text-sm font-bold text-fork-muted [font-variant-numeric:tabular-nums]">
              Sivu {{ currentPage }} / {{ totalPages }}
            </span>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-fork-line bg-fork-card text-fork-ink transition hover:border-fork-ink disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentPage >= totalPages"
              aria-label="Seuraava sivu"
              @click="goToPage(currentPage + 1)"
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
          </div>
        </template>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import RecipeCard from "~/components/RecipeCard.vue";
import {
  translateArea,
  translateCategory,
  detectSearchIntent,
  getSearchWordSuggestions,
} from "~/utils/translations";

import type { Recipe } from "~/types/recipe";
import {
  useRecipesApi,
  type RecipeRow,
  type RecipeSearchResult,
} from "~/composables/useRecipesApi";
import { usePlannerStore } from "~/stores/planner";
import { useRecipeModal } from "~/composables/useRecipeModal";

const route = useRoute();
const router = useRouter();
const plannerStore = usePlannerStore();

const initialSearchQuery =
  typeof route.query.q === "string" ? route.query.q : "";

const searchInput = ref(initialSearchQuery);

const searchQuery = computed(() => {
  return typeof route.query.q === "string" ? route.query.q.trim() : "";
});

// Multiple category chips can be active at once (comma-separated in the
// URL). recipe_categories carries precomputed tags per recipe (its
// original category plus any protein/dish tag a real ingredient
// justifies), so "Kana + Pasta" is a genuine intersection via
// search_recipes_by_categories - not just the most recently picked
// category narrowed by title/ingredient guesses.
const selectedCategories = computed<string[]>(() => {
  const raw = route.query.cat;

  if (typeof raw !== "string" || !raw) {
    return [];
  }

  return raw.split(",");
});

// The search box is Finnish, so free text is run through the same
// dictionary the old quick-search chips used: a typed word like "kana" or
// "italialainen" becomes a category/area filter, anything else becomes a
// literal full-text search term.
const searchIntent = computed(() => detectSearchIntent(searchQuery.value));

const effectiveCategories = computed<string[]>(() => {
  if (selectedCategories.value.length > 0) {
    return selectedCategories.value;
  }

  if (!searchQuery.value) {
    return [];
  }

  return searchIntent.value.type === "category" ? [searchIntent.value.query] : [];
});

// An area word (e.g. "kiinalainen") always filters by area, chip or no
// chip - otherwise "Naudanliha" + "kiinalainen" would run a literal text
// search for the Finnish word against our English data and find nothing,
// even though Chinese-area beef recipes exist.
const effectiveArea = computed<string[] | null>(() => {
  if (!searchQuery.value) {
    return null;
  }

  return searchIntent.value.type === "area" ? searchIntent.value.query : null;
});

// Free text only runs as a literal search term once it's confirmed not to
// be a recognised category/area word, since those are consumed above.
const effectiveText = computed(() => {
  if (!searchQuery.value) {
    return null;
  }

  return searchIntent.value.type === "name" ? searchQuery.value : null;
});

const categoryLabels = computed(() =>
  effectiveCategories.value.map((category) => translateCategory(category)),
);

const PAGE_SIZE = 24;

// Our own database has no reason to require a search before showing
// anything - the recipe grid always shows a paginated slice of whatever
// currently matches (the whole catalog, by default).
const currentPage = computed(() => {
  const raw = route.query.page;
  const parsed = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
});

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

const recipesApi = useRecipesApi();

const INSPIRATION_RECIPE_COUNT = 5;
// Bumped to v2 because the recipe shape changed (image/title instead of
// TheMealDB's strMealThumb/strMeal) when search moved to our own database -
// otherwise anyone with today's cache already set would see broken images.
const INSPIRATION_STORAGE_KEY = "forkcast-inspiration-of-day-v2";

const inspirationRecipes = ref<RecipeRow[]>([]);
const inspirationIndex = ref(0);

const currentInspiration = computed(
  () => inspirationRecipes.value[inspirationIndex.value] ?? null,
);

const { open: openRecipeModal, openOnClick } = useRecipeModal();

function handleInspirationClick(event: MouseEvent) {
  if (currentInspiration.value) {
    openOnClick(event, currentInspiration.value.id);
  }
}

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
    const parsed = JSON.parse(stored) as { date: string; meals: RecipeRow[] };

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

  const recipes = await recipesApi.getRandomRecipes(INSPIRATION_RECIPE_COUNT);

  inspirationRecipes.value = recipes;
  inspirationIndex.value = 0;

  if (import.meta.client && recipes.length > 0) {
    localStorage.setItem(
      INSPIRATION_STORAGE_KEY,
      JSON.stringify({ date: todayKey(), meals: recipes }),
    );
  }
}

function showNextInspiration() {
  if (inspirationRecipes.value.length === 0) {
    return;
  }

  inspirationIndex.value = (inspirationIndex.value + 1) % inspirationRecipes.value.length;
  startAutoAdvance();
}

function showPreviousInspiration() {
  if (inspirationRecipes.value.length === 0) {
    return;
  }

  inspirationIndex.value =
    (inspirationIndex.value - 1 + inspirationRecipes.value.length) %
    inspirationRecipes.value.length;
  startAutoAdvance();
}

// Auto-advances the carousel on its own, pausing while the pointer is over
// it (see @mouseenter/@mouseleave in the template) and restarting from
// zero whenever the visitor manually steps through it.
const AUTO_ADVANCE_INTERVAL_MS = 6000;
let autoAdvanceIntervalId: ReturnType<typeof setInterval> | null = null;

function startAutoAdvance() {
  stopAutoAdvance();

  if (inspirationRecipes.value.length <= 1) {
    return;
  }

  autoAdvanceIntervalId = setInterval(() => {
    inspirationIndex.value = (inspirationIndex.value + 1) % inspirationRecipes.value.length;
  }, AUTO_ADVANCE_INTERVAL_MS);
}

function stopAutoAdvance() {
  if (autoAdvanceIntervalId !== null) {
    clearInterval(autoAdvanceIntervalId);
    autoAdvanceIntervalId = null;
  }
}

onMounted(async () => {
  plannerStore.loadFromStorage();
  await loadInspirationRecipes();
  startAutoAdvance();
});

onBeforeUnmount(() => {
  stopAutoAdvance();
});

const { data, pending, error } = await useAsyncData(
  "recipe-search",
  () => {
    return recipesApi.searchRecipes({
      categories: effectiveCategories.value,
      area: effectiveArea.value,
      text: effectiveText.value ?? undefined,
      page: currentPage.value,
      pageSize: PAGE_SIZE,
    });
  },
  {
    watch: [effectiveCategories, effectiveArea, effectiveText, currentPage],
  },
);

function updateSearchQuery(query: string) {
  const trimmedQuery = query.trim();

  router.push({
    path: "/",
    query: {
      ...(trimmedQuery ? { q: trimmedQuery } : {}),
      ...(selectedCategories.value.length ? { cat: selectedCategories.value.join(",") } : {}),
    },
  });
}

function searchRecipes() {
  showSuggestions.value = false;
  updateSearchQuery(searchInput.value);
}

// Predictive suggestions for the search box: dictionary word completions
// are instant (plain array filtering), matching recipe titles are fetched
// live, debounced like DraftsDrawer's recipe search.
const showSuggestions = ref(false);
const activeSuggestionIndex = ref(-1);
const searchContainerRef = ref<HTMLElement | null>(null);

const wordSuggestions = computed(() => getSearchWordSuggestions(searchInput.value));

const recipeSuggestions = ref<RecipeSearchResult[]>([]);
const RECIPE_SUGGESTION_LIMIT = 4;
const RECIPE_SUGGESTION_MIN_LENGTH = 2;
let suggestionsDebounceId: ReturnType<typeof setTimeout> | null = null;

const hasSuggestions = computed(
  () => wordSuggestions.value.length > 0 || recipeSuggestions.value.length > 0,
);
const suggestionCount = computed(
  () => wordSuggestions.value.length + recipeSuggestions.value.length,
);

watch([wordSuggestions, recipeSuggestions], () => {
  activeSuggestionIndex.value = -1;
});

watch(searchInput, (value) => {
  if (suggestionsDebounceId !== null) {
    clearTimeout(suggestionsDebounceId);
  }

  const trimmed = value.trim();

  if (trimmed.length < RECIPE_SUGGESTION_MIN_LENGTH) {
    recipeSuggestions.value = [];
    return;
  }

  suggestionsDebounceId = setTimeout(async () => {
    const { results } = await recipesApi.searchRecipes({
      text: trimmed,
      pageSize: RECIPE_SUGGESTION_LIMIT,
    });
    recipeSuggestions.value = results;
  }, 250);
});

function selectWordSuggestion(word: string) {
  searchInput.value = word;
  searchRecipes();
}

function selectRecipeSuggestion(event: MouseEvent, recipe: RecipeSearchResult) {
  showSuggestions.value = false;
  openOnClick(event, recipe.id);
}

function handleSearchContainerFocusOut(event: FocusEvent) {
  const nextFocusTarget = event.relatedTarget as Node | null;

  if (!searchContainerRef.value?.contains(nextFocusTarget)) {
    showSuggestions.value = false;
  }
}

function handleSearchKeydown(event: KeyboardEvent) {
  const suggestionsActive = showSuggestions.value && suggestionCount.value > 0;

  if (event.key === "Enter") {
    event.preventDefault();

    if (suggestionsActive && activeSuggestionIndex.value >= 0) {
      if (activeSuggestionIndex.value < wordSuggestions.value.length) {
        selectWordSuggestion(wordSuggestions.value[activeSuggestionIndex.value]);
        return;
      }

      const recipe =
        recipeSuggestions.value[activeSuggestionIndex.value - wordSuggestions.value.length];

      if (recipe) {
        showSuggestions.value = false;
        openRecipeModal(recipe.id);
      }

      return;
    }

    searchRecipes();
    return;
  }

  if (!suggestionsActive) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % suggestionCount.value;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeSuggestionIndex.value =
      activeSuggestionIndex.value <= 0
        ? suggestionCount.value - 1
        : activeSuggestionIndex.value - 1;
  } else if (event.key === "Escape") {
    showSuggestions.value = false;
  }
}

function toggleCategory(category: string) {
  const current = selectedCategories.value;
  const nextCategories = current.includes(category)
    ? current.filter((selected) => selected !== category)
    : [...current, category];

  router.push({
    path: "/",
    query: {
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
      ...(nextCategories.length ? { cat: nextCategories.join(",") } : {}),
    },
  });
}

function clearCategories() {
  router.push({
    path: "/",
    query: {
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
    },
  });
}

function goToPage(page: number) {
  router.push({
    path: "/",
    query: {
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
      ...(selectedCategories.value.length ? { cat: selectedCategories.value.join(",") } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
    },
  });
}

watch(
  () => route.query.q,
  (newQuery) => {
    searchInput.value = typeof newQuery === "string" ? newQuery : "";
  },
);

const totalCount = computed(() => data.value?.totalCount ?? 0);
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)));

const recipes = computed<Recipe[]>(() => {
  return (data.value?.results ?? []).map((result) => ({
    id: result.id,
    title: result.title,
    category: translateCategory(result.category),
    area: translateArea(result.area),
    description: result.instructions
      ? `${result.instructions.slice(0, 120)}...`
      : "Herkullinen resepti viikon suunnitteluun.",
    image: result.image,
  }));
});
</script>
