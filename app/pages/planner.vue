<template>
  <main class="min-h-screen bg-fork-bg px-6 py-10 text-fork-ink">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <section class="py-14">
        <p
          class="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-fork-clay"
        >
          Viikkosuunnitelma
        </p>

        <h1 class="text-4xl font-black tracking-tight md:text-5xl">
          Mitä syötäisiin tällä viikolla?
        </h1>

        <p class="mt-4 max-w-2xl leading-7 text-fork-muted">
          Lisää reseptejä viikkoon reseptien omilta sivuilta.
        </p>

        <div v-if="hasPlannedMeals" class="mt-6">
          <div class="flex flex-wrap gap-3">
            <a
              href="#ostoslista"
              class="rounded-full bg-fork-green px-5 py-3 text-sm font-bold text-white transition hover:bg-fork-green-dark"
            >
              Ostoslistaan
            </a>

            <button
              type="button"
              class="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
              @click="askToClearWeek"
            >
              Tyhjennä viikko
            </button>
          </div>

          <div
            v-if="pendingClearWeek"
            class="mt-3 max-w-md rounded-2xl border border-red-100 bg-red-50 p-4"
          >
            <p class="text-sm font-black text-red-800">
              Tyhjennetäänkö koko viikko?
            </p>

            <p class="mt-1 text-sm leading-6 text-red-700">
              Tämä poistaa kaikki viikkosuunnitelmaan lisätyt reseptit.
            </p>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                @click="confirmClearWeek"
              >
                Tyhjennä
              </button>

              <button
                type="button"
                class="rounded-full bg-fork-card px-4 py-2 text-xs font-bold text-fork-muted ring-1 ring-fork-line transition hover:bg-fork-bg"
                @click="cancelClearWeek"
              >
                Peruuta
              </button>
            </div>
          </div>
        </div>
      </section>

      <div
        v-if="!hasPlannedMeals"
        class="rounded-[2rem] border border-dashed border-stone-300 bg-fork-card p-8 text-center shadow-sm"
      >
        <p
          class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay"
        >
          Suunnitelma tyhjä
        </p>

        <h2 class="mt-3 text-2xl font-black tracking-tight">
          Viikko kaipaa vielä ensimmäistä ateriaa.
        </h2>

        <p class="mx-auto mt-3 max-w-xl leading-7 text-fork-muted">
          Selaa reseptejä, avaa herkulliselta näyttävä vaihtoehto ja lisää se
          aamiaiseksi, päivälliseksi tai iltapalaksi.
        </p>

        <NuxtLink
          to="/"
          class="mt-6 inline-flex rounded-full bg-fork-green px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-green-dark"
        >
          Selaa reseptejä
        </NuxtLink>
      </div>

      <section v-else class="space-y-4">
        <article
          v-for="day in days"
          :key="day.value"
          class="rounded-[2rem] border border-fork-line bg-fork-card p-5 shadow-sm"
        >
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 class="text-2xl font-black text-fork-ink">
                {{ day.label }}
              </h2>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <section
              v-for="meal in meals"
              :key="meal.value"
              class="rounded-3xl border border-dashed border-stone-300 bg-fork-bg p-4"
            >
              <h3
                class="text-xs font-black uppercase tracking-wide text-stone-500"
              >
                {{ meal.label }}
              </h3>

              <div
                v-if="getPlannedMeals(day.value, meal.value).length > 0"
                class="mt-3 space-y-3"
              >
                <div
                  v-for="plannedMeal in getPlannedMeals(day.value, meal.value)"
                  :key="plannedMeal.id"
                  class="relative overflow-hidden rounded-2xl bg-fork-card shadow-sm"
                >
                  <button
                    type="button"
                    class="absolute right-3 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-sm transition hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                    :aria-label="`Poista ${plannedMeal.recipeName} suunnitelmasta`"
                    @click="askToRemoveMeal(plannedMeal.id)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="h-3.5 w-3.5"
                    >
                      <path
                        d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                      />
                    </svg>
                  </button>

                  <div class="flex gap-3 p-3">
                    <img
                      :src="plannedMeal.recipeImage"
                      :alt="plannedMeal.recipeName"
                      class="h-24 w-24 shrink-0 rounded-xl object-cover"
                    >

                    <div class="min-w-0 flex flex-1 flex-col items-start pr-8">
                      <p class="font-black leading-snug text-fork-ink">
                        {{ plannedMeal.recipeName }}
                      </p>

                      <span
                        class="mt-3 inline-flex rounded-full bg-fork-sage px-3 py-1 text-xs font-bold text-fork-olive"
                      >
                        {{ plannedMeal.category }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="pendingRemovalId === plannedMeal.id"
                    class="border-t border-red-100 bg-red-50 px-3 py-3"
                  >
                    <p class="text-sm font-bold text-red-800">
                      Poistetaanko tämä resepti?
                    </p>

                    <div class="mt-2 flex gap-2">
                      <button
                        type="button"
                        class="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                        @click="confirmRemoveMeal(plannedMeal.id)"
                      >
                        Poista
                      </button>

                      <button
                        type="button"
                        class="rounded-full bg-fork-card px-3 py-1.5 text-xs font-bold text-fork-muted ring-1 ring-fork-line transition hover:bg-fork-bg"
                        @click="cancelRemoveMeal"
                      >
                        Peruuta
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="mt-3 rounded-2xl bg-fork-card p-5 text-sm text-fork-muted"
              >
                Tyhjä
              </div>
            </section>
          </div>
        </article>
      </section>
      <section
        v-if="hasPlannedMeals"
        id="ostoslista"
        class="mt-10 scroll-mt-8 rounded-[2rem] bg-fork-card p-6 shadow-sm ring-1 ring-fork-line"
      >
        <div
          class="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p
              class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay"
            >
              Ostoslista
            </p>

            <h2 class="mt-3 text-3xl font-black tracking-tight">
              Viikon ostokset
            </h2>
          </div>

          <p class="max-w-md text-sm leading-6 text-fork-muted">
            Lista muodostetaan viikkosuunnitelmaan lisättyjen reseptien
            ainesosista.
          </p>
        </div>

        <div
          v-if="plannerStore.shoppingList.length === 0"
          class="mt-6 rounded-2xl bg-fork-bg p-5 text-sm text-fork-muted"
        >
          Ostoslistaa ei voitu vielä muodostaa. Lisää resepti uudelleen
          viikkoon, jotta sen ainesosat tallentuvat mukaan.
        </div>

        <ul v-else class="mt-6 grid gap-3 md:grid-cols-2">
          <li
            v-for="item in plannerStore.shoppingList"
            :key="item.key"
            class="flex items-start justify-between gap-4 rounded-2xl bg-fork-bg px-4 py-3"
          >
            <div>
              <p
                class="font-bold text-fork-ink"
                :class="{
                  'text-stone-400 line-through':
                    plannerStore.isShoppingItemChecked(item.key),
                }"
              >
                {{ item.name }}
              </p>

              <p
                class="mt-1 text-sm text-stone-500"
                :class="{
                  'text-stone-400 line-through':
                    plannerStore.isShoppingItemChecked(item.key),
                }"
              >
                {{ item.measures.join(", ") }}
              </p>
            </div>

            <input
              type="checkbox"
              class="mt-1 h-5 w-5 rounded border-stone-300"
              :checked="plannerStore.isShoppingItemChecked(item.key)"
              @change="plannerStore.toggleShoppingItem(item.key)"
            >
          </li>
        </ul>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType } from "~/stores/planner";

const plannerStore = usePlannerStore();

useSeoMeta({
  title: "Viikkosuunnitelma · Forkcast",
  description: "Suunnittele viikon ateriat ja muodosta ostoslista Forkcastissa.",
});

const pendingClearWeek = ref(false);

const pendingRemovalId = ref<string | null>(null);

const hasPlannedMeals = computed(() => plannerStore.plannedMeals.length > 0);

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

function getPlannedMeals(day: string, meal: MealType) {
  return plannerStore.getMeals(day, meal);
}

function askToRemoveMeal(plannedMealId: string) {
  pendingRemovalId.value = plannedMealId;
}

function cancelRemoveMeal() {
  pendingRemovalId.value = null;
}

function confirmRemoveMeal(plannedMealId: string) {
  plannerStore.removeMeal(plannedMealId);
  pendingRemovalId.value = null;
}

function askToClearWeek() {
  pendingClearWeek.value = true;
}

function cancelClearWeek() {
  pendingClearWeek.value = false;
}

function confirmClearWeek() {
  plannerStore.clearPlanner();
  pendingClearWeek.value = false;
}
</script>
