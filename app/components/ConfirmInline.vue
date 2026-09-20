<template>
  <div
    ref="cardRef"
    class="rounded-2xl border border-fork-line bg-fork-card p-4 shadow-sm"
  >
    <div class="flex items-start gap-3">
      <span
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </span>

      <div>
        <p class="text-sm font-black text-fork-ink">{{ title }}</p>
        <p class="mt-1 text-sm leading-6 text-fork-muted">{{ description }}</p>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
        @click="$emit('confirm')"
      >
        {{ confirmLabel }}
      </button>

      <button
        type="button"
        class="rounded-full bg-fork-bg px-4 py-2 text-xs font-bold text-fork-muted ring-1 ring-fork-line transition hover:bg-fork-card"
        @click="$emit('cancel')"
      >
        {{ cancelLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
  }>(),
  { cancelLabel: "Peruuta" },
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const cardRef = ref<HTMLElement | null>(null);

function handleOutsideClick(event: MouseEvent) {
  if (cardRef.value && !cardRef.value.contains(event.target as Node)) {
    emit("cancel");
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("cancel");
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick, true);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick, true);
  document.removeEventListener("keydown", handleKeydown);
});

defineExpose({ el: cardRef });
</script>
