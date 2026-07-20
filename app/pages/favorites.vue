<template>
  <main class="min-h-screen bg-stone-50 px-6 py-10 text-stone-950">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <section class="py-14">
        <p
          class="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
        >
          Suosikit
        </p>

        <h1 class="text-4xl font-black tracking-tight md:text-5xl">
          Reseptit, joihin haluat palata.
        </h1>

        <p class="mt-4 max-w-2xl leading-7 text-stone-600">
          Tallenna kiinnostavat reseptit suosikkeihin ja lisää ne myöhemmin
          viikkosuunnitelmaan.
        </p>
      </section>

      <div
        v-if="favoritesStore.favorites.length === 0"
        class="rounded-[2rem] border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm"
      >
        <p
          class="text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
        >
          Ei suosikkeja vielä
        </p>

        <h2 class="mt-3 text-2xl font-black tracking-tight">
          Sydän kaipaa ensimmäistä reseptiä.
        </h2>

        <p class="mx-auto mt-3 max-w-xl leading-7 text-stone-600">
          Selaa reseptejä ja paina sydäntä tallentaaksesi parhaat ideat talteen.
        </p>

        <NuxtLink
          to="/"
          class="mt-6 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
        >
          Selaa reseptejä
        </NuxtLink>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-3">
        <RecipeCard
          v-for="recipe in favoritesStore.favorites"
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
  </main>
</template>

<script setup lang="ts">
import RecipeCard from "~/components/RecipeCard.vue";
import { useFavoritesStore } from "~/stores/favorites";

const favoritesStore = useFavoritesStore();

onMounted(() => {
  favoritesStore.loadFromStorage();
});
</script>
