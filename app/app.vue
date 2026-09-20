<template>
  <div>
    <NuxtPage />
    <BackToTopButton />
    <TrashDropButton />

    <button
      type="button"
      class="fixed left-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1.5 rounded-r-2xl border border-l-0 border-fork-line bg-fork-card py-3 pl-2 pr-3 text-fork-clay shadow-md transition hover:bg-fork-bg"
      aria-label="Avaa luonnokset"
      @click="plannerStore.isDraftsOpen = true"
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
        <path d="M6 3.75h12a.75.75 0 01.75.75v16.5l-6.75-4-6.75 4V4.5a.75.75 0 01.75-.75z" />
      </svg>
      <span
        v-if="draftsCount > 0"
        class="flex h-6 min-w-6 items-center justify-center rounded-full bg-fork-clay px-1 text-[11px] font-semibold leading-none text-white [font-variant-numeric:lining-nums_tabular-nums]"
      >
        {{ draftsBadgeLabel }}
      </span>
    </button>

    <button
      type="button"
      class="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1.5 rounded-l-2xl border border-r-0 border-fork-line bg-fork-card py-3 pl-3 pr-2 text-fork-clay shadow-md transition hover:bg-fork-bg"
      aria-label="Avaa ostoslista"
      @click="plannerStore.isShoppingListOpen = true"
    >
      <span
        v-if="shoppingListCount > 0"
        class="flex h-6 min-w-6 items-center justify-center rounded-full bg-fork-clay px-1 text-[11px] font-semibold leading-none text-white [font-variant-numeric:lining-nums_tabular-nums]"
      >
        {{ shoppingListBadgeLabel }}
      </span>
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
        <path d="M4 4h2l1.6 10.6a2 2 0 002 1.7h7.6a2 2 0 002-1.7L20 8H7" />
        <circle cx="10" cy="20" r="1.3" />
        <circle cx="17" cy="20" r="1.3" />
      </svg>
    </button>

    <ShoppingListDrawer v-model:open="plannerStore.isShoppingListOpen" />
    <DraftsDrawer v-model:open="plannerStore.isDraftsOpen" />
    <RecipeModal />
  </div>
</template>

<script setup lang="ts">
import { usePlannerStore } from "~/stores/planner";

const plannerStore = usePlannerStore();

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

const draftsCount = computed(() => plannerStore.getDrafts().length);
const shoppingListCount = computed(() => plannerStore.shoppingList.length);
const draftsBadgeLabel = computed(() => formatBadgeCount(draftsCount.value));
const shoppingListBadgeLabel = computed(() => formatBadgeCount(shoppingListCount.value));

onMounted(() => {
  plannerStore.loadFromStorage();
});
</script>
