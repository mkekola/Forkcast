<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
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
      enter-active-class="transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="recipeId"
        class="fixed inset-0 z-50 overflow-y-auto p-5 py-8 sm:p-6 sm:py-14"
        @click.self="close"
      >
        <div
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="relative mx-auto w-full max-w-5xl rounded-[1.5rem] bg-fork-bg p-4 shadow-2xl sm:rounded-[2rem] sm:p-10"
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
