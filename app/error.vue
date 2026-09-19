<template>
  <main class="min-h-screen bg-fork-bg px-6 pb-24 pt-10 text-fork-ink sm:pb-10">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <div class="flex flex-col items-center py-24 text-center">
        <p class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark">
          Virhe {{ error?.statusCode ?? "" }}
        </p>

        <h1 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">
          {{ isNotFound ? "Tätä sivua ei löydy." : "Jokin meni pieleen." }}
        </h1>

        <p class="mx-auto mt-4 max-w-md leading-7 text-fork-muted">
          {{
            isNotFound
              ? "Sivu on saatettu siirtää tai poistaa, tai osoitteessa on kirjoitusvirhe."
              : "Yritä ladata sivu uudelleen hetken kuluttua."
          }}
        </p>

        <button
          type="button"
          class="mt-8 rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
          @click="goHome"
        >
          Takaisin etusivulle
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const isNotFound = computed(() => props.error.statusCode === 404);

useSeoMeta({
  title: `Virhe ${props.error.statusCode ?? ""} · Forkcast`,
});

function goHome() {
  clearError({ redirect: "/" });
}
</script>
