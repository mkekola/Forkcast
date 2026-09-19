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
    </section>
  </main>
</template>

<script setup lang="ts">
import RecipeCard from "~/components/RecipeCard.vue";
import { useFavoritesStore } from "~/stores/favorites";

const favoritesStore = useFavoritesStore();

useSeoMeta({
  title: "Suosikit · Forkcast",
  description: "Tallennetut suosikkireseptit Forkcastissa.",
});

onMounted(() => {
  favoritesStore.loadFavorites();
});
</script>
