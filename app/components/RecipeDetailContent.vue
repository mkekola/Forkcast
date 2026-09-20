<template>
  <div v-if="pending" class="py-20">
    <div
      class="h-64 sm:h-[420px] animate-pulse rounded-[2rem] bg-fork-card ring-1 ring-fork-line"
    />
    <div
      class="mt-8 h-10 max-w-lg animate-pulse rounded-full bg-fork-card ring-1 ring-fork-line"
    />
  </div>

  <div
    v-else-if="error || !recipe"
    class="mt-14 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
  >
    Reseptin lataaminen epäonnistui.
  </div>

  <div v-else>
    <section class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div
        class="overflow-hidden rounded-[2rem] bg-fork-card p-4 shadow-xl shadow-stone-200"
      >
        <div class="relative overflow-hidden rounded-[1.5rem]">
          <img
            :src="recipe.image"
            :alt="recipe.title"
            class="h-64 w-full object-cover sm:h-[420px]"
          >

          <div class="absolute left-4 top-4 flex flex-wrap gap-2">
            <span
              class="rounded-full bg-fork-clay-soft/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-fork-clay backdrop-blur"
            >
              {{ translatedCategory }}
            </span>

            <span
              class="rounded-full bg-fork-card/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-700 backdrop-blur"
            >
              {{ translatedArea }}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h1
          class="text-4xl font-black leading-tight tracking-tight md:text-5xl"
        >
          {{ recipe.title }}
        </h1>

        <div class="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            class="inline-flex min-w-[13rem] items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-bold shadow-sm transition hover:scale-105"
            :class="
              isFavorite
                ? 'border-fork-clay bg-fork-clay text-white shadow-fork-clay/20'
                : 'border-fork-clay-soft bg-fork-card text-fork-clay hover:bg-fork-clay-soft'
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

          <button
            type="button"
            class="inline-flex min-w-[13rem] items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-bold shadow-sm transition hover:scale-105"
            :class="
              isDraft
                ? 'border-fork-clay bg-fork-clay text-white shadow-fork-clay/20'
                : 'border-fork-clay-soft bg-fork-card text-fork-clay hover:bg-fork-clay-soft'
            "
            @click="toggleDraft"
          >
            <svg
              v-if="isDraft"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path d="M6 3.75h12a.75.75 0 01.75.75v16.5l-6.75-4-6.75 4V4.5a.75.75 0 01.75-.75z" />
            </svg>

            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <path d="M6 3.75h12a.75.75 0 01.75.75v16.5l-6.75-4-6.75 4V4.5a.75.75 0 01.75-.75z" />
            </svg>

            {{ isDraft ? "Luonnoksissa" : "Lisää luonnoksiin" }}
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
            class="inline-flex items-center gap-2 rounded-full border border-fork-line bg-fork-card px-5 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:border-fork-ink hover:text-fork-ink"
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

        <p class="mt-5 leading-7 text-fork-muted">
          Lisää tämä resepti viikkosuunnitelmaan tai selaa ainesosat ja
          valmistusohjeet rauhassa läpi.
        </p>

        <div
          class="mt-8 rounded-[1.5rem] bg-fork-bg p-5 shadow-sm ring-1 ring-fork-line"
        >
          <h2 class="text-lg font-black">Lisää viikkosuunnitelmaan</h2>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="grid gap-2 text-sm font-bold text-stone-700">
              Päivä
              <div class="relative">
                <select
                  v-model="selectedDay"
                  class="w-full appearance-none rounded-2xl border border-fork-line bg-fork-card px-4 py-3 pr-10 text-sm outline-none focus:border-fork-ink"
                >
                  <option
                    v-for="day in days"
                    :key="day.value"
                    :value="day.value"
                  >
                    {{ day.label }}
                  </option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fork-muted"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </label>

            <label class="grid gap-2 text-sm font-bold text-stone-700">
              Ateria
              <div class="relative">
                <select
                  v-model="selectedMeal"
                  class="w-full appearance-none rounded-2xl border border-fork-line bg-fork-card px-4 py-3 pr-10 text-sm outline-none focus:border-fork-ink"
                >
                  <option
                    v-for="meal in mealOptions"
                    :key="meal.value"
                    :value="meal.value"
                  >
                    {{ meal.label }}
                  </option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fork-muted"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </label>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
              @click="addRecipeToPlanner"
            >
              Lisää viikkoon
            </button>

            <NuxtLink
              v-if="addedTo"
              to="/planner"
              class="rounded-full border border-fork-line px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-fork-ink hover:text-fork-ink"
            >
              Näytä suunnitelma
            </NuxtLink>
          </div>

          <p
            v-if="addedTo"
            class="mt-4 text-sm font-semibold text-fork-clay"
          >
            Lisätty viikkosuunnitelmaan!
          </p>
        </div>
      </div>
    </section>

    <section class="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <aside
        class="rounded-[2rem] bg-fork-card p-6 shadow-sm ring-1 ring-fork-line"
      >
        <h2 class="text-2xl font-black">Ainesosat</h2>

        <ul class="mt-5 space-y-3">
          <li
            v-for="ingredient in ingredients"
            :key="ingredient.name"
            class="flex items-start justify-between gap-4 rounded-2xl bg-fork-bg px-4 py-3 text-sm"
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
        class="rounded-[2rem] bg-fork-card p-6 shadow-sm ring-1 ring-fork-line"
      >
        <h2 class="text-2xl font-black">Valmistusohjeet</h2>

        <div class="mt-5 space-y-4">
          <p
            v-for="(step, index) in instructionSteps"
            :key="step"
            class="rounded-2xl bg-fork-bg p-4 leading-7 text-stone-700"
          >
            <span class="mr-2 font-black text-fork-clay">
              {{ index + 1 }}.
            </span>
            {{ step }}
          </p>
        </div>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType } from "~/stores/planner";
import { useFavoritesStore } from "~/stores/favorites";
import { translateArea, translateCategory } from "~/utils/translations";
import { parseInstructionSteps } from "~/utils/instructions";
import { useRecipesApi } from "~/composables/useRecipesApi";

const props = defineProps<{
  recipeId: string;
}>();

const plannerStore = usePlannerStore();
const favoritesStore = useFavoritesStore();
const recipesApi = useRecipesApi();

const selectedDay = ref("monday");
const selectedMeal = ref<MealType>("dinner");
const addedTo = ref<"assigned" | "draft" | null>(null);

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
  { value: "supper", label: "Illallinen" },
];

const recipeAsyncData = useAsyncData(
  () => `recipe-detail-${props.recipeId}`,
  () => recipesApi.getRecipeById(props.recipeId),
  { watch: [() => props.recipeId] },
);

const { data: recipe, pending, error } = recipeAsyncData;

const translatedCategory = computed(() => {
  return translateCategory(recipe.value?.category);
});

// Exposed so the standalone /recipes/[id] page can set SEO meta tags from
// the same fetch, without defineExpose landing after the await below
// (which vue/no-expose-after-await disallows).
defineExpose({
  recipe,
  translatedCategory,
});

await recipeAsyncData;

const youtubeLink = computed(() => {
  return recipe.value?.youtube || null;
});

const sourceLink = computed(() => {
  return recipe.value?.source || null;
});

const ingredients = computed(() => {
  if (!recipe.value) {
    return [];
  }

  return recipe.value.recipe_ingredients.map((ingredient) => ({
    name: ingredient.name,
    measure: ingredient.measure ?? "",
  }));
});

const instructionSteps = computed(() =>
  parseInstructionSteps(recipe.value?.instructions),
);

const isFavorite = computed(() => {
  if (!recipe.value) {
    return false;
  }

  return favoritesStore.isFavorite(recipe.value.id);
});

const isDraft = computed(() => {
  if (!recipe.value) {
    return false;
  }

  const recipeId = recipe.value.id;
  return plannerStore.getDrafts().some((draft) => draft.recipeId === recipeId);
});

const translatedArea = computed(() => {
  return translateArea(recipe.value?.area);
});

onMounted(() => {
  plannerStore.loadFromStorage();
  favoritesStore.loadFavorites();
});

function addRecipeToPlanner() {
  if (!recipe.value) {
    return;
  }

  plannerStore.addMeal({
    day: selectedDay.value,
    meal: selectedMeal.value,
    recipeId: recipe.value.id,
    recipeName: recipe.value.title,
    recipeImage: recipe.value.image,
    category: translatedCategory.value,
    ingredients: ingredients.value,
  });

  addedTo.value = "assigned";
}

function toggleDraft() {
  if (!recipe.value) {
    return;
  }

  const recipeId = recipe.value.id;
  const existingDraft = plannerStore.getDrafts().find((draft) => draft.recipeId === recipeId);

  if (existingDraft) {
    plannerStore.removeMeal(existingDraft.id);
    return;
  }

  plannerStore.addDraft({
    recipeId: recipe.value.id,
    recipeName: recipe.value.title,
    recipeImage: recipe.value.image,
    category: translatedCategory.value,
    ingredients: ingredients.value,
  });
}

function toggleFavorite() {
  if (!recipe.value) {
    return;
  }

  favoritesStore.toggleFavorite({
    id: recipe.value.id,
    title: recipe.value.title,
    category: translatedCategory.value,
    area: translatedArea.value,
    description: recipe.value.instructions
      ? `${recipe.value.instructions.slice(0, 120)}...`
      : "Herkullinen resepti viikon suunnitteluun.",
    image: recipe.value.image,
  });
}
</script>
