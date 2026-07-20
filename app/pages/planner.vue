<template>
  <main class="min-h-screen bg-stone-50 px-6 py-10 text-stone-950">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <section class="py-14">
        <p class="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-600">
          Viikkosuunnitelma
        </p>

        <h1 class="text-4xl font-black tracking-tight md:text-5xl">
          Mitä syötäisiin tällä viikolla?
        </h1>

        <p class="mt-4 max-w-2xl leading-7 text-stone-600">
          Pian voit lisätä reseptejä suoraan aamu-, päivä- ja iltaruoiksi.
          Tässä vaiheessa rakennetaan ensin selkeä viikkonäkymä.
        </p>
      </section>

      <section class="grid gap-4 md:grid-cols-7">
        <article
          v-for="day in days"
          :key="day"
          class="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <h2 class="font-black">
            {{ day }}
          </h2>

          <div class="mt-4 space-y-3">
            <div
              v-for="meal in meals"
              :key="meal"
              class="rounded-2xl border border-dashed border-stone-300 p-3 text-sm text-stone-500"
            >
              {{ meal }}
            </div>
          </div>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
const days = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']

const meals = ['Aamupala', 'Lounas', 'Päivällinen']
</script>