<template>
  <div
    v-show="plannerStore.isDragging"
    class="fixed bottom-24 right-24 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl shadow-stone-300 transition sm:bottom-6"
    :class="isHovering ? 'scale-110 bg-red-700' : 'bg-red-600'"
    aria-label="Raahaa tähän poistaaksesi"
    @dragover.prevent="isHovering = true"
    @dragleave="isHovering = false"
    @drop.prevent="handleDrop"
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
      <path d="M4 7h16M9 7V4.5a1 1 0 011-1h4a1 1 0 011 1V7m-9 0l1 12.5a2 2 0 002 2h6a2 2 0 002-2L18 7" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { usePlannerStore, type PlannedMeal } from "~/stores/planner";

const plannerStore = usePlannerStore();
const isHovering = ref(false);

function handleDrop(event: DragEvent) {
  isHovering.value = false;
  plannerStore.isDragging = false;

  const payload = event.dataTransfer?.getData("application/json");

  if (!payload) {
    return;
  }

  try {
    const dragged: PlannedMeal = JSON.parse(payload);
    plannerStore.removeMeal(dragged.id);
  } catch {
    // ignore malformed payloads
  }
}
</script>
