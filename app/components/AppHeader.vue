<template>
  <header
    class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
  >
    <NuxtLink
      to="/"
      class="flex items-center gap-2.5 font-display text-3xl font-black tracking-tight text-fork-ink"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="h-8 w-8 text-fork-clay"
        aria-hidden="true"
      >
        <g transform="translate(-2.5,0) scale(0.88,1)">
          <path d="M6.5 2a1 1 0 011 1v4.2a1 1 0 102 0V3a1 1 0 112 0v4.2a1 1 0 102 0V3a1 1 0 112 0v5a4.5 4.5 0 01-3.5 4.39V21a1 1 0 11-2 0v-8.6A4.5 4.5 0 015.5 8V3a1 1 0 011-1z" />
        </g>
        <g transform="translate(2.2,0) scale(0.88,1)">
          <path d="M17 2c2.5 0 3.5 3 3.5 5s-1 5-3.5 5-3.5-3-3.5-5 1-5 3.5-5z" />
          <path d="M16.15 12.8h1.7V21a.85.85 0 01-1.7 0v-8.2z" />
        </g>
      </svg>
      Forkcast
    </NuxtLink>

    <nav class="hidden items-center gap-2 text-sm font-bold sm:flex">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-full px-4 py-2 transition"
        :class="
          isActiveLink(link.to)
            ? 'bg-fork-clay text-white'
            : 'text-fork-muted hover:bg-stone-200 hover:text-fork-ink'
        "
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </header>

  <nav
    class="fixed inset-x-0 bottom-0 z-40 flex border-t border-fork-line bg-fork-card/95 backdrop-blur sm:hidden"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
  >
    <NuxtLink
      to="/"
      class="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-bold"
      :class="isActiveLink('/') ? 'text-fork-clay' : 'text-fork-muted'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      Reseptit
    </NuxtLink>

    <NuxtLink
      to="/favorites"
      class="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-bold"
      :class="isActiveLink('/favorites') ? 'text-fork-clay' : 'text-fork-muted'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      Suosikit
    </NuxtLink>

    <NuxtLink
      to="/planner"
      class="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-bold"
      :class="isActiveLink('/planner') ? 'text-fork-clay' : 'text-fork-muted'"
    >
      <span class="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5"
          aria-hidden="true"
        >
          <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
          <path d="M3.5 9.5h17M8 3v3M16 3v3" />
        </svg>
        <span
          v-if="plannedCount > 0"
          class="absolute -right-2 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-fork-clay px-0.5 text-[10px] font-semibold leading-none text-white [font-variant-numeric:lining-nums_tabular-nums]"
        >
          {{ plannedCountLabel }}
        </span>
      </span>
      Viikko
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { usePlannerStore } from "~/stores/planner";

const route = useRoute();
const plannerStore = usePlannerStore();

const links = [
  { label: "Reseptit", to: "/" },
  { label: "Suosikit", to: "/favorites" },
  { label: "Viikko", to: "/planner" },
];

const plannedCount = computed(() => plannerStore.plannedMeals.length);
const plannedCountLabel = computed(() => (plannedCount.value > 99 ? "99+" : String(plannedCount.value)));

function isActiveLink(path: string) {
  if (path === "/") {
    return route.path === "/" || route.path.startsWith("/recipes");
  }

  return route.path.startsWith(path);
}

onMounted(() => {
  plannerStore.loadFromStorage();
});
</script>
