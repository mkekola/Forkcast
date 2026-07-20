<template>
  <main class="min-h-screen bg-stone-50 px-6 py-10 text-stone-950">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <section class="py-14">
        <p
          class="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
        >
          Viikkosuunnitelma
        </p>

        <h1 class="text-4xl font-black tracking-tight md:text-5xl">
          Mitä syötäisiin tällä viikolla?
        </h1>

        <p class="mt-4 max-w-2xl leading-7 text-stone-600">
          Lisää reseptejä viikkoon reseptien omilta sivuilta. Jokaisessa
          slotissa voi olla yksi ateria kerrallaan.
        </p>
      </section>

      <div
        v-if="!hasPlannedMeals"
        class="rounded-[2rem] border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm"
      >
        <p
          class="text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
        >
          Suunnitelma tyhjä
        </p>

        <h2 class="mt-3 text-2xl font-black tracking-tight">
          Viikko kaipaa vielä ensimmäistä ateriaa.
        </h2>

        <p class="mx-auto mt-3 max-w-xl leading-7 text-stone-600">
          Selaa reseptejä, avaa herkulliselta näyttävä vaihtoehto ja lisää se
          aamiaiseksi, päivälliseksi tai iltapalaksi.
        </p>

        <NuxtLink
          to="/"
          class="mt-6 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
        >
          Selaa reseptejä
        </NuxtLink>
      </div>

      <section v-else class="grid gap-4 md:grid-cols-7">
        <article
          v-for="day in days"
          :key="day.value"
          class="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <h2 class="font-black">
            {{ day.shortLabel }}
          </h2>

          <p class="mt-1 text-xs font-semibold text-stone-500">
            {{ day.label }}
          </p>

          <div class="mt-4 space-y-3">
            <div
              v-for="meal in meals"
              :key="meal.value"
              class="min-h-32 rounded-2xl border border-dashed border-stone-300 p-3 text-sm"
            >
              <p
                class="mb-3 text-xs font-bold uppercase tracking-wide text-stone-500"
              >
                {{ meal.label }}
              </p>

              <div
                v-if="getPlannedMeal(day.value, meal.value)"
                class="overflow-hidden rounded-2xl bg-stone-50"
              >
                <img
                  :src="getPlannedMeal(day.value, meal.value)?.recipeImage"
                  :alt="getPlannedMeal(day.value, meal.value)?.recipeName"
                  class="h-24 w-full object-cover"
                />

                <div class="p-3">
                  <p class="font-black text-stone-950">
                    {{ getPlannedMeal(day.value, meal.value)?.recipeName }}
                  </p>

                  <p class="mt-1 text-xs font-semibold text-orange-700">
                    {{ getPlannedMeal(day.value, meal.value)?.category }}
                  </p>

                  <button
                    type="button"
                    class="mt-3 text-xs font-bold text-stone-500 hover:text-red-700"
                    @click="plannerStore.removeMeal(day.value, meal.value)"
                  >
                    Poista
                  </button>
                </div>
              </div>

              <div v-else class="rounded-2xl bg-stone-50 p-4 text-stone-400">
                Tyhjä
              </div>
            </div>
          </div>
        </article>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType } from "~/stores/planner";

const plannerStore = usePlannerStore();

const hasPlannedMeals = computed(() => plannerStore.plannedMeals.length > 0)

onMounted(() => {
  plannerStore.loadFromStorage();
});

const days = [
  { value: "monday", label: "Maanantai", shortLabel: "Ma" },
  { value: "tuesday", label: "Tiistai", shortLabel: "Ti" },
  { value: "wednesday", label: "Keskiviikko", shortLabel: "Ke" },
  { value: "thursday", label: "Torstai", shortLabel: "To" },
  { value: "friday", label: "Perjantai", shortLabel: "Pe" },
  { value: "saturday", label: "Lauantai", shortLabel: "La" },
  { value: "sunday", label: "Sunnuntai", shortLabel: "Su" },
];

const meals: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Aamupala" },
  { value: "lunch", label: "Lounas" },
  { value: "dinner", label: "Päivällinen" },
];

function getPlannedMeal(day: string, meal: MealType) {
  return plannerStore.getMeal(day, meal);
}
</script>
