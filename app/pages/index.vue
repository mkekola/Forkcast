<template>
  <main class="min-h-screen bg-stone-50 text-stone-950">
    <section class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
      <AppHeader />

      <section class="grid flex-1 items-center gap-12 py-20 md:grid-cols-2">
        <div>
          <p
            class="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
          >
            Viikkosi, katettuna.
          </p>

          <h1
            class="max-w-xl text-5xl font-black leading-tight tracking-tight md:text-6xl"
          >
            Suunnittele viikon ruoat ennen kuin nälkä tekee päätökset.
          </h1>

          <p class="mt-6 max-w-lg text-lg leading-8 text-stone-600">
            Forkcast auttaa löytämään reseptejä, kokoamaan viikon ateriat ja
            muuttamaan suunnitelman käytännölliseksi ostoslistaksi.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink
              to="#reseptit"
              class="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              Selaa reseptejä
            </NuxtLink>

            <NuxtLink
              to="/planner"
              class="rounded-full border border-stone-300 px-6 py-3 text-sm font-bold transition hover:border-stone-950"
            >
              Avaa viikkosuunnitelma
            </NuxtLink>

            <button
              type="button"
              class="rounded-full border border-orange-200 bg-orange-50 px-6 py-3 text-sm font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="randomRecipePending"
              @click="getRandomRecipe"
            >
              {{ randomRecipePending ? "Arvotaan..." : "Yllätä minut" }}
            </button>
            <p
              v-if="randomRecipeError"
              class="mt-4 text-sm font-semibold text-red-700"
            >
              Satunnaisen reseptin haku epäonnistui. Kokeile hetken päästä
              uudelleen.
            </p>
          </div>
        </div>

        <div class="rounded-[2rem] bg-white p-4 shadow-xl shadow-stone-200">
          <div class="rounded-[1.5rem] bg-orange-100 p-5">
            <div class="rounded-[1.25rem] bg-white p-5 shadow-sm">
              <p
                class="text-sm font-bold uppercase tracking-[0.18em] text-orange-600"
              >
                Tänään
              </p>

              <h2 class="mt-3 text-2xl font-black">Sitruunainen kanapasta</h2>

              <p class="mt-2 text-sm leading-6 text-stone-600">
                Nopea arkiruoka, jonka voi lisätä suoraan viikon suunnitelmaan.
              </p>

              <div class="mt-5 grid gap-3">
                <div class="rounded-2xl bg-stone-100 p-4">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-500"
                  >
                    Aika
                  </p>
                  <p class="mt-1 font-bold">30 min</p>
                </div>

                <div class="rounded-2xl bg-stone-100 p-4">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-500"
                  >
                    Sopii
                  </p>
                  <p class="mt-1 font-bold">Arki-iltaan</p>
                </div>

                <div class="rounded-2xl bg-stone-950 p-4 text-white">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-300"
                  >
                    Forkcast sanoo
                  </p>
                  <p class="mt-1 font-bold">Lisää tiistain päivälliseksi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reseptit" class="pb-20">
        <div class="mb-8 max-w-2xl">
          <div class="flex gap-3">
            <input
              v-model="searchInput"
              type="search"
              placeholder="Hae reseptejä, esim. pasta, kana, curry..."
              class="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium outline-none transition placeholder:text-stone-400 focus:border-stone-950"
              @keyup.enter="searchRecipes"
            />

            <button
              type="button"
              class="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
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
                  ? 'border-orange-600 bg-orange-600 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-stone-950 hover:text-stone-950'
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
              class="text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
            >
              Reseptit
            </p>

            <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Mitä tänään tekisi mieli?
            </h2>
          </div>

          <p class="max-w-md text-sm leading-6 text-stone-600">
            Hae reseptejä tai valitse pikahaku.
          </p>

          <p
            v-if="searchQuery && !pending && !error"
            class="mt-3 text-sm font-bold text-orange-700"
          >
            {{ recipes.length }} reseptiä haulla “{{ searchQuery }}”
          </p>
        </div>

        <div v-if="pending" class="grid gap-6 md:grid-cols-3">
          <div
            v-for="item in 6"
            :key="item"
            class="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-stone-200"
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
          class="rounded-3xl border border-stone-200 bg-white p-8 text-stone-600"
        >
          Ei reseptejä hakusanalla “{{ searchQuery }}”. Kokeile esimerkiksi
          hakua <strong>pasta</strong>, <strong>chicken</strong> tai
          <strong>beef</strong>.
        </div>

        <div v-else class="grid gap-6 md:grid-cols-3">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :id="recipe.id"
            :title="recipe.title"
            :category="recipe.category"
            :area="recipe.area"
            :time="recipe.time"
            :description="recipe.description"
            :image="recipe.image"
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

type MealDbMeal = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string;
};

type MealDbFilterMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

const searchInput = ref("");
const searchTerm = ref("");

const randomRecipePending = ref(false);
const randomRecipeError = ref(false);

const searchQuery = computed(() => searchTerm.value.trim());
const mealDbSearch = computed(() => getMealDbSearch(searchQuery.value));

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

const { data, pending, error } = await useFetch<{
  meals: (MealDbMeal | MealDbFilterMeal)[] | null;
}>(
  () => {
    if (!searchQuery.value) {
      return "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    }

    if (mealDbSearch.value.type === "category") {
      return `https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealDbSearch.value.query}`;
    }

    return `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealDbSearch.value.query}`;
  },
  {
    watch: [mealDbSearch],
  },
);

function searchRecipes() {
  searchTerm.value = searchInput.value;
}

function selectQuickSearch(query: string) {
  searchInput.value = query;
  searchTerm.value = query;
}

async function getRandomRecipe() {
  randomRecipePending.value = true;
  randomRecipeError.value = false;

  try {
    const response = await $fetch<{ meals: MealDbMeal[] | null }>(
      "https://www.themealdb.com/api/json/v1/1/random.php",
    );

    const randomMeal = response.meals?.[0];

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
        : translateCategory((meal as MealDbMeal).strCategory),
      area: isCategoryResult
        ? "Lisätiedot reseptissä"
        : translateArea((meal as MealDbMeal).strArea),
      time: "30–45 min",
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
