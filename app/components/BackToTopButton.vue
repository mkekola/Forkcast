<script setup lang="ts">
const isVisible = ref(false);

function updateVisibility() {
  isVisible.value = window.scrollY > 400;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

onMounted(() => {
  updateVisibility();
  window.addEventListener("scroll", updateVisibility);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateVisibility);
});
</script>

<template>
  <button
    v-show="isVisible"
    type="button"
    class="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-950 text-white shadow-xl shadow-stone-300 transition hover:-translate-y-1 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
    aria-label="Takaisin sivun alkuun"
    @click="scrollToTop"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  </button>
</template>
