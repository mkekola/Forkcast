<template>
  <NuxtLink
    v-slot="{ href }"
    :to="`/recipes/${recipe.id}`"
    custom
  >
    <a
      :href="href"
      class="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-fork-card shadow-sm ring-1 ring-fork-line transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200 focus:outline-none focus:ring-2 focus:ring-fork-clay"
      @click="(event) => openOnClick(event, recipe.id)"
    >
      <article class="flex h-full flex-col">
        <div class="relative h-52 shrink-0 overflow-hidden bg-stone-200">
          <div
            v-if="!isImageLoaded"
            class="absolute inset-0 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              class="h-6 w-6 animate-spin text-stone-400"
              aria-hidden="true"
            >
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
          </div>

          <img
            :src="recipe.image"
            :alt="recipe.title"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            :class="{ 'opacity-0': !isImageLoaded }"
            @load="isImageLoaded = true"
            @error="isImageLoaded = true"
          >

          <div
            class="absolute left-4 top-4 rounded-full bg-fork-card/90 px-3 py-1 text-xs font-bold text-stone-700 backdrop-blur"
          >
            {{ recipe.category }}
          </div>

          <div class="absolute right-4 top-4 z-10 flex gap-2">
            <button
              type="button"
              class="flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-fork-clay focus:ring-offset-2"
              :class="
                isDraft
                  ? 'border-fork-clay bg-fork-clay text-white'
                  : 'border-white bg-fork-card text-fork-clay hover:bg-fork-clay-soft'
              "
              :aria-label="isDraft ? 'Lisätty luonnoksiin' : 'Lisää luonnoksiin'"
              @click.prevent.stop="toggleDraft"
              @mousedown.stop
            >
              <svg
                v-if="isDraft"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="h-6 w-6"
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
                class="h-6 w-6"
              >
                <path d="M6 3.75h12a.75.75 0 01.75.75v16.5l-6.75-4-6.75 4V4.5a.75.75 0 01.75-.75z" />
              </svg>
            </button>

            <button
              type="button"
              class="flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-fork-clay focus:ring-offset-2"
              :class="
                isFavorite
                  ? 'border-fork-clay bg-fork-clay text-white'
                  : 'border-white bg-fork-card text-fork-clay hover:bg-fork-clay-soft'
              "
              :aria-label="isFavorite ? 'Poista suosikeista' : 'Lisää suosikkeihin'"
              @click.prevent.stop="toggleFavorite"
              @mousedown.stop
            >
              <svg
                v-if="isFavorite"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="h-6 w-6"
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
                class="h-6 w-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex flex-1 flex-col p-5">
          <div
            class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-fork-olive"
          >
            {{ recipe.area }}
          </div>

          <h3 class="text-xl font-black tracking-tight text-fork-ink">
            {{ recipe.title }}
          </h3>

          <div class="mt-3 flex-1">
            <p v-if="recipe.description" class="text-sm leading-6 text-fork-muted">
              {{ recipe.description }}
            </p>
          </div>

          <div class="mt-5">
            <span
              class="inline-flex rounded-full bg-fork-clay px-4 py-2 text-sm font-bold text-white transition group-hover:bg-fork-clay-dark"
            >
              Katso resepti
            </span>
          </div>
        </div>
      </article>
    </a>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useFavoritesStore } from "~/stores/favorites";
import { usePlannerStore } from "~/stores/planner";
import { useRecipesApi } from "~/composables/useRecipesApi";
import { useRecipeModal } from "~/composables/useRecipeModal";
import type { Recipe } from "~/types/recipe";

const props = defineProps<{
  recipe: Recipe;
}>();

// Only fires when a favorite is actively removed (not added), so the
// favorites page can show a "removed" toast without needing to diff the
// store's list itself.
const emit = defineEmits<{ "favorite-removed": [recipe: Recipe] }>();

const favoritesStore = useFavoritesStore();
const plannerStore = usePlannerStore();
const recipesApi = useRecipesApi();
const { openOnClick } = useRecipeModal();

const isFavorite = computed(() => favoritesStore.isFavorite(props.recipe.id));
const isDraft = computed(() =>
  plannerStore.drafts.some((draft) => draft.recipeId === props.recipe.id),
);
const isImageLoaded = ref(false);

function toggleFavorite() {
  const wasFavorite = isFavorite.value;
  favoritesStore.toggleFavorite(props.recipe);

  if (wasFavorite) {
    emit("favorite-removed", props.recipe);
  }
}

async function toggleDraft() {
  const existingDraft = plannerStore.drafts.find(
    (draft) => draft.recipeId === props.recipe.id,
  );

  if (existingDraft) {
    plannerStore.removeMeal(existingDraft.id);
    return;
  }

  const details = await recipesApi.getRecipeById(props.recipe.id);

  plannerStore.addDraft({
    recipeId: props.recipe.id,
    recipeName: props.recipe.title,
    recipeImage: props.recipe.image,
    category: props.recipe.category,
    ingredients: details?.recipe_ingredients.map((ingredient) => ({
      name: ingredient.name,
      measure: ingredient.measure ?? "",
    })),
  });
}
</script>
