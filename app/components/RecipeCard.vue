<template>
  <article
    class="group overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200"
  >
    <div class="relative h-52 overflow-hidden bg-stone-200">
      <img
        :src="image"
        :alt="title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div
        class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-stone-700 backdrop-blur"
      >
        {{ category }}
      </div>
    </div>

    <div class="p-5">
      <div
        class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600"
      >
        <span>{{ area }}</span>
        <span class="h-1 w-1 rounded-full bg-orange-300" />
        <span>{{ time }}</span>
      </div>

      <h3 class="text-xl font-black tracking-tight text-stone-950">
        {{ title }}
      </h3>

      <p class="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
        {{ description }}
      </p>

      <div class="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-stone-800"
        >
          Lisää viikkoon
        </button>

        <NuxtLink
          :to="`/recipes/${id}`"
          class="rounded-full border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
        >
          Katso
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  title: string;
  category: string;
  area: string;
  time: string;
  description: string;
  image: string;
}>();
</script>
