<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="recipeId"
        class="fixed inset-0 z-50 bg-fork-ink/40"
        @click="close"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="recipeId"
        class="fixed inset-0 z-50 overflow-y-auto p-4 py-10 sm:p-6 sm:py-14"
        @click.self="close"
      >
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="relative mx-auto w-full max-w-3xl rounded-[2rem] bg-fork-bg p-6 shadow-2xl sm:p-10"
          @keydown.esc="close"
        >
          <button
            type="button"
            class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-fork-card text-fork-muted shadow-sm ring-1 ring-fork-line transition hover:text-fork-ink"
            aria-label="Sulje resepti"
            @click="close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <RecipeDetailContent :key="recipeId" :recipe-id="recipeId" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import RecipeDetailContent from "~/components/RecipeDetailContent.vue";
import { useRecipeModalStore } from "~/stores/recipeModal";

const recipeModalStore = useRecipeModalStore();
const recipeId = computed(() => recipeModalStore.openRecipeId);

const panelRef = ref<HTMLElement | null>(null);

function close() {
  recipeModalStore.closeAndGoBack();
}

watch(recipeId, (isOpen) => {
  if (!import.meta.client) {
    return;
  }

  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    nextTick(() => panelRef.value?.focus());
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
  }
});
</script>
