<template>
  <NuxtLink
    :to="`/recipes/${recipe.id}`"
    class="group block overflow-hidden rounded-[1.75rem] bg-fork-card shadow-sm ring-1 ring-fork-line transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200 focus:outline-none focus:ring-2 focus:ring-fork-clay"
  >
    <article>
      <div class="relative h-52 overflow-hidden bg-stone-200">
        <img
          :src="recipe.image"
          :alt="recipe.title"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        >

        <div
          class="absolute left-4 top-4 rounded-full bg-fork-card/90 px-3 py-1 text-xs font-bold text-stone-700 backdrop-blur"
        >
          {{ recipe.category }}
        </div>

        <button
          type="button"
          class="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
          :class="
            isFavorite
              ? 'border-rose-500 bg-rose-500 text-white shadow-rose-200'
              : 'border-white bg-fork-card text-rose-500 shadow-stone-300 hover:bg-rose-50'
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

      <div class="p-5">
        <div
          class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-fork-olive"
        >
          <span>{{ recipe.area }}</span>
          <span class="h-1 w-1 rounded-full bg-fork-sage" />
          <span>{{ recipe.time }}</span>
        </div>

        <h3 class="text-xl font-black tracking-tight text-fork-ink">
          {{ recipe.title }}
        </h3>

        <p class="mt-3 text-sm leading-6 text-fork-muted">
          {{ recipe.description }}
        </p>

        <div class="mt-5 flex items-center justify-between gap-3">
          <span
            class="rounded-full bg-fork-green px-4 py-2 text-sm font-bold text-white"
          >
            Valitse viikkoon
          </span>

          <span
            class="text-sm font-bold text-fork-muted transition group-hover:text-fork-ink"
          >
            Katso resepti →
          </span>
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useFavoritesStore } from "~/stores/favorites";
import type { Recipe } from "~/types/recipe";

const props = defineProps<{
  recipe: Recipe;
}>();

const favoritesStore = useFavoritesStore();

const isFavorite = computed(() => favoritesStore.isFavorite(props.recipe.id));

onMounted(() => {
  favoritesStore.loadFromStorage();
});

function toggleFavorite() {
favoritesStore.toggleFavorite(props.recipe);
}
</script>
