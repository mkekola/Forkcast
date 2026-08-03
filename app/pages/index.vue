<template>
  <main class="min-h-screen bg-fork-bg text-fork-ink">
    <section class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
      <AppHeader />

      <section class="grid flex-1 items-center gap-12 py-20 md:grid-cols-2">
        <div>
          <p
            class="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-fork-clay"
          >
            Viikkosi, katettuna.
          </p>

          <h1
            class="max-w-xl text-5xl font-black leading-tight tracking-tight md:text-6xl"
          >
            Suunnittele viikon ruoat ennen kuin nälkä tekee päätökset.
          </h1>

          <p class="mt-6 max-w-lg text-lg leading-8 text-fork-muted">
            Forkcast auttaa löytämään reseptejä, kokoamaan viikon ateriat ja
            muuttamaan suunnitelman käytännölliseksi ostoslistaksi.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink
              to="#reseptit"
              class="rounded-full bg-fork-green px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-green-dark"
            >
              Selaa reseptejä
            </NuxtLink>

            <NuxtLink
              to="/planner"
              class="rounded-full border border-stone-300 px-6 py-3 text-sm font-bold transition hover:border-stone-950"
            >
              Avaa viikkosuunnitelma
            </NuxtLink>
          </div>
          <p
            v-if="randomRecipeError"
            class="mt-4 text-sm font-semibold text-red-700"
          >
            Satunnaisen reseptin haku epäonnistui. Kokeile hetken päästä
            uudelleen.
          </p>
        </div>

        <button
          type="button"
          class="group rounded-[2rem] bg-fork-card p-4 text-left shadow-xl shadow-stone-200 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300 focus:outline-none focus:ring-2 focus:ring-fork-clay disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="randomRecipePending"
          @click="getRandomRecipe"
        >
          <div class="rounded-[1.5rem] bg-fork-sage p-5">
            <div class="rounded-[1.25rem] bg-fork-card p-5 shadow-sm">
              <p
                class="text-sm font-bold uppercase tracking-[0.18em] text-fork-clay"
              >
                Inspiraatio
              </p>

              <h2 class="mt-3 text-2xl font-black">
                Etkö tiedä mitä tekisi mieli?
              </h2>

              <p class="mt-2 text-sm leading-6 text-fork-muted">
                Klikkaa korttia ja Forkcast arpoo sinulle reseptin
                kokeiltavaksi.
              </p>

              <div class="mt-5 grid gap-3">
                <div class="rounded-2xl bg-stone-100 p-4">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-500"
                  >
                    Tyyli
                  </p>
                  <p class="mt-1 font-bold">Satunnainen resepti</p>
                </div>

                <div class="rounded-2xl bg-stone-100 p-4">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-500"
                  >
                    Sopii
                  </p>
                  <p class="mt-1 font-bold">Kun ideat ovat loppu</p>
                </div>

                <div class="rounded-2xl bg-fork-green p-4 text-white">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-300"
                  >
                    Forkcast ehdottaa
                  </p>

                  <p class="mt-1 font-bold">
                    {{
                      randomRecipePending
                        ? "Arvotaan reseptiä..."
                        : "Yllätä minut reseptillä"
                    }}
                  </p>
                </div>
              </div>

              <p
                class="mt-4 text-sm font-bold text-fork-green transition group-hover:translate-x-1"
              >
                Avaa satunnainen resepti →
              </p>
            </div>
          </div>
        </button>
      </section>

      <section id="reseptit" class="pb-20">
        <div class="mb-8 max-w-2xl">
          <div class="flex gap-3">
            <input
              v-model="searchInput"
              type="search"
              placeholder="Hae reseptejä, esim. pasta, kana, curry..."
              class="w-full rounded-full border border-stone-300 bg-fork-card px-5 py-3 text-sm font-medium outline-none transition placeholder:text-stone-400 focus:border-stone-950"
              @keyup.enter="searchRecipes"
            >

            <button
              type="button"
              class="rounded-full bg-fork-green px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-green-dark"
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
                  ? 'border-fork-green bg-fork-green text-white'
                  : 'border-stone-300 bg-fork-card text-stone-700 hover:border-stone-950 hover:text-fork-ink'
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

const route = useRoute();
const router = useRouter();

const initialSearchQuery =
  typeof route.query.q === "string" ? route.query.q : "";

const searchInput = ref(initialSearchQuery);

const searchQuery = computed(() => {
  return typeof route.query.q === "string" ? route.query.q.trim() : "";
});

const mealDbSearch = computed(() => getMealDbSearch(searchQuery.value));

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

const { data, pending, error } = await useFetch<MealDbSearchResponse>(
  () => mealDbApi.getSearchUrl(searchQuery.value),
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

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      category: isCategoryResult
        ? translateCategory(mealDbSearch.value.query)
        : translateCategory(
            (meal as import("~/types/mealdb").MealDbMeal).strCategory,
          ),
      area: isCategoryResult
        ? "Lisätiedot reseptissä"
        : translateArea((meal as import("~/types/mealdb").MealDbMeal).strArea),
      description: isCategoryResult
        ? "Avaa resepti nähdäksesi ainesosat ja valmistusohjeet."
        : (meal as MealDbMeal).strInstructions
          ? `${(meal as MealDbMeal).strInstructions?.slice(0, 120)}...`
          : "Herkullinen resepti viikon suunnitteluun.",
      image: meal.strMealThumb,
    };
  });
});
</script>
