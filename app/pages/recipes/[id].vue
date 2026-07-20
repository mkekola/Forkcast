<template>
  <main class="min-h-screen bg-stone-50 px-6 py-10 text-stone-950">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <div v-if="pending" class="py-20">
        <div
          class="h-[420px] animate-pulse rounded-[2rem] bg-white ring-1 ring-stone-200"
        />
        <div
          class="mt-8 h-10 max-w-lg animate-pulse rounded-full bg-white ring-1 ring-stone-200"
        />
      </div>

      <div
        v-else-if="error || !recipe"
        class="mt-14 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
      >
        Reseptin lataaminen epäonnistui.
      </div>

      <article v-else class="py-14">
        <NuxtLink
          to="/"
          class="mb-8 inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
        >
          ← Takaisin resepteihin
        </NuxtLink>

        <section class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div
            class="overflow-hidden rounded-[2rem] bg-white p-4 shadow-xl shadow-stone-200"
          >
            <img
              :src="recipe.strMealThumb"
              :alt="recipe.strMeal"
              class="h-[420px] w-full rounded-[1.5rem] object-cover"
            />
          </div>

          <div>
            <div class="mb-4 flex flex-wrap gap-2">
              <span
                class="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700"
              >
                {{ translatedCategory }}
              </span>

              <span
                class="rounded-full bg-stone-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-700"
              >
                {{ translatedArea }}
              </span>
            </div>

            <h1
              class="text-4xl font-black leading-tight tracking-tight md:text-5xl"
            >
              {{ recipe.strMeal }}
            </h1>

            <div class="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold shadow-sm transition hover:scale-105"
                :class="
                  isFavorite
                    ? 'border-rose-500 bg-rose-500 text-white shadow-rose-200'
                    : 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50'
                "
                @click="toggleFavorite"
              >
                <svg
                  v-if="isFavorite"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
                  />
                </svg>

                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>

                {{ isFavorite ? "Suosikeissa" : "Lisää suosikkeihin" }}
              </button>

              <NuxtLink
                v-if="youtubeLink"
                :to="youtubeLink"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>

                Katso valmistusvideo
              </NuxtLink>

              <a
                v-if="sourceLink"
                :href="sourceLink"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:border-stone-950 hover:text-stone-950"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>

                Avaa alkuperäinen resepti
              </a>
            </div>

            <p class="mt-5 leading-7 text-stone-600">
              Lisää tämä resepti viikkosuunnitelmaan tai selaa ainesosat ja
              valmistusohjeet rauhassa läpi.
            </p>

            <div
              class="mt-8 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-stone-200"
            >
              <h2 class="text-lg font-black">Lisää viikkosuunnitelmaan</h2>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <label class="grid gap-2 text-sm font-bold text-stone-700">
                  Päivä
                  <select
                    v-model="selectedDay"
                    class="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-950"
                  >
                    <option
                      v-for="day in days"
                      :key="day.value"
                      :value="day.value"
                    >
                      {{ day.label }}
                    </option>
                  </select>
                </label>

                <label class="grid gap-2 text-sm font-bold text-stone-700">
                  Ateria
                  <select
                    v-model="selectedMeal"
                    class="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-950"
                  >
                    <option
                      v-for="meal in mealOptions"
                      :key="meal.value"
                      :value="meal.value"
                    >
                      {{ meal.label }}
                    </option>
                  </select>
                </label>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
                  @click="addRecipeToPlanner"
                >
                  Lisää viikkoon
                </button>

                <NuxtLink
                  v-if="wasAdded"
                  to="/planner"
                  class="rounded-full border border-stone-300 px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                >
                  Näytä suunnitelma
                </NuxtLink>
              </div>

              <p
                v-if="wasAdded"
                class="mt-4 text-sm font-semibold text-orange-700"
              >
                Lisätty viikkosuunnitelmaan!
              </p>
            </div>
          </div>
        </section>

        <section class="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside
            class="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200"
          >
            <h2 class="text-2xl font-black">Ainesosat</h2>

            <ul class="mt-5 space-y-3">
              <li
                v-for="ingredient in ingredients"
                :key="ingredient.name"
                class="flex items-start justify-between gap-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm"
              >
                <span class="font-semibold text-stone-800">
                  {{ ingredient.name }}
                </span>

                <span class="text-right text-stone-500">
                  {{ ingredient.measure }}
                </span>
              </li>
            </ul>
          </aside>

          <section
            class="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200"
          >
            <h2 class="text-2xl font-black">Valmistusohjeet</h2>

            <div class="mt-5 space-y-4">
              <p
                v-for="(step, index) in instructionSteps"
                :key="step"
                class="rounded-2xl bg-stone-50 p-4 leading-7 text-stone-700"
              >
                <span class="mr-2 font-black text-orange-600">
                  {{ index + 1 }}.
                </span>
                {{ step }}
              </p>
            </div>
          </section>
        </section>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType } from "~/stores/planner";
import { useFavoritesStore } from "~/stores/favorites";
import { translateArea, translateCategory } from "~/utils/translations";

type MealDbRecipe = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string;
  strYoutube: string | null;
  strSource: string | null;
  [key: string]: string | null;
};

const route = useRoute();

const plannerStore = usePlannerStore();

const favoritesStore = useFavoritesStore();

const selectedDay = ref("monday");
const selectedMeal = ref<MealType>("dinner");
const wasAdded = ref(false);

const days = [
  { value: "monday", label: "Maanantai" },
  { value: "tuesday", label: "Tiistai" },
  { value: "wednesday", label: "Keskiviikko" },
  { value: "thursday", label: "Torstai" },
  { value: "friday", label: "Perjantai" },
  { value: "saturday", label: "Lauantai" },
  { value: "sunday", label: "Sunnuntai" },
];

const mealOptions: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Aamupala" },
  { value: "lunch", label: "Lounas" },
  { value: "dinner", label: "Päivällinen" },
];

const { data, pending, error } = await useFetch<{
  meals: MealDbRecipe[] | null;
}>(
  () =>
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${route.params.id}`,
);

const recipe = computed(() => data.value?.meals?.[0] ?? null);

const youtubeLink = computed(() => {
  return recipe.value?.strYoutube || null;
});

const sourceLink = computed(() => {
  return recipe.value?.strSource || null;
});

const ingredients = computed(() => {
  if (!recipe.value) {
    return [];
  }

  return Array.from({ length: 20 }, (_, index) => {
    const number = index + 1;
    const name = recipe.value?.[`strIngredient${number}`]?.trim();
    const measure = recipe.value?.[`strMeasure${number}`]?.trim();

    return {
      name,
      measure,
    };
  }).filter((ingredient): ingredient is { name: string; measure: string } => {
    return Boolean(ingredient.name);
  });
});

const instructionSteps = computed(() => {
  if (!recipe.value?.strInstructions) {
    return [];
  }

  return recipe.value.strInstructions
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter(Boolean);
});

const isFavorite = computed(() => {
  if (!recipe.value) {
    return false;
  }

  return favoritesStore.isFavorite(recipe.value.idMeal);
});

const translatedCategory = computed(() => {
  return translateCategory(recipe.value?.strCategory);
});

const translatedArea = computed(() => {
  return translateArea(recipe.value?.strArea);
});

onMounted(() => {
  plannerStore.loadFromStorage();
  favoritesStore.loadFromStorage();
});

function addRecipeToPlanner() {
  if (!recipe.value) {
    return;
  }

  plannerStore.addMeal({
    day: selectedDay.value,
    meal: selectedMeal.value,
    recipeId: recipe.value.idMeal,
    recipeName: recipe.value.strMeal,
    recipeImage: recipe.value.strMealThumb,
    category: translatedCategory.value,
    ingredients: ingredients.value,
  });

  wasAdded.value = true;
}

function toggleFavorite() {
  if (!recipe.value) {
    return;
  }

  favoritesStore.toggleFavorite({
    id: recipe.value.idMeal,
    title: recipe.value.strMeal,
    category: translatedCategory.value,
    area: translatedArea.value,
    time: "30–45 min",
    description: recipe.value.strInstructions
      ? `${recipe.value.strInstructions.slice(0, 120)}...`
      : "Herkullinen resepti viikon suunnitteluun.",
    image: recipe.value.strMealThumb,
  });
}
</script>
