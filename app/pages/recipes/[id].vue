<template>
  <main class="min-h-screen bg-fork-bg px-6 pb-24 pt-10 text-fork-ink sm:pb-10">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <article class="py-14">
        <NuxtLink
          to="/"
          class="mb-8 inline-flex rounded-full border border-fork-line px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-fork-ink hover:text-fork-ink"
        >
          ← Takaisin resepteihin
        </NuxtLink>

        <RecipeDetailContent ref="detailRef" :recipe-id="recipeId" />
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import RecipeDetailContent from "~/components/RecipeDetailContent.vue";

const route = useRoute();

const recipeId = computed(() => route.params.id as string);

const detailRef = useTemplateRef<InstanceType<typeof RecipeDetailContent>>("detailRef");

const seoDescription = computed(() =>
  detailRef.value?.recipe?.instructions
    ? `${detailRef.value.recipe.instructions.slice(0, 150)}...`
    : "Reseptin ainesosat ja valmistusohjeet Forkcastissa.",
);

useSeoMeta({
  title: () =>
    detailRef.value?.recipe?.title ? `${detailRef.value.recipe.title} · Forkcast` : "Forkcast",
  description: () => seoDescription.value,
  ogTitle: () => detailRef.value?.recipe?.title,
  ogDescription: () => seoDescription.value,
  ogImage: () => detailRef.value?.recipe?.image,
});
</script>
