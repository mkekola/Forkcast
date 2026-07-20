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
                {{ recipe.strCategory }}
              </span>

              <span
                class="rounded-full bg-stone-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-700"
              >
                {{ recipe.strArea }}
              </span>
            </div>

            <h1
              class="text-4xl font-black leading-tight tracking-tight md:text-5xl"
            >
              {{ recipe.strMeal }}
            </h1>

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

type MealDbRecipe = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string;
  [key: string]: string | null;
};

const route = useRoute();

const plannerStore = usePlannerStore();

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
    category: recipe.value.strCategory ?? 'Resepti',
    ingredients: ingredients.value,
  });

  wasAdded.value = true;
}
</script>
