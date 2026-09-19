<template>
  <main class="min-h-screen bg-fork-bg px-6 pb-24 pt-10 text-fork-ink sm:pb-10">
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
            <button
              type="button"
              class="rounded-full bg-fork-clay px-5 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
              @click="isShoppingListOpen = true"
            >
              Ostoslistaan
            </button>

            <button
              type="button"
              class="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
              @click="askToClearWeek"
            >
              Tyhjennä viikko
            </button>
          </div>

          <ConfirmInline
            v-if="pendingClearWeek"
            class="mt-3 max-w-md"
            title="Tyhjennetäänkö koko viikko?"
            description="Tämä poistaa kaikki viikkosuunnitelmaan lisätyt reseptit."
            confirm-label="Tyhjennä"
            @confirm="confirmClearWeek"
            @cancel="cancelClearWeek"
          />
        </div>
      </section>

      <div
        v-if="!hasPlannedMeals"
        class="rounded-[2rem] border border-dashed border-fork-line bg-fork-card p-8 text-center shadow-sm"
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
          aamupalaksi, lounaaksi, päivälliseksi tai illalliseksi.
        </p>

        <NuxtLink
          to="/"
          class="mt-6 inline-flex rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
        >
          Selaa reseptejä
        </NuxtLink>
      </div>

      <section
        v-if="plannerStore.getDrafts().length > 0"
        class="mt-10 rounded-[2rem] border border-fork-line bg-fork-card p-5 shadow-sm"
      >
        <p class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay">
          Luonnokset
        </p>

        <h2 class="mt-2 text-2xl font-black tracking-tight">
          Ei vielä sijoitettu viikkoon
        </h2>

        <p class="mt-1 text-sm text-fork-muted">
          Valitse päivä ja ateria, kun olet valmis sijoittamaan reseptin.
        </p>

        <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="draft in plannerStore.getDrafts()"
            :key="draft.id"
            class="overflow-hidden rounded-2xl bg-fork-bg shadow-sm ring-1 ring-fork-line"
          >
            <NuxtLink :to="`/recipes/${draft.recipeId}`" class="block">
              <div class="relative">
                <img
                  :src="draft.recipeImage"
                  :alt="draft.recipeName"
                  class="h-28 w-full object-cover"
                >

                <button
                  type="button"
                  class="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-fork-card/90 text-red-600 shadow-sm backdrop-blur transition hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                  :aria-label="`Poista ${draft.recipeName} luonnoksista`"
                  @click.prevent.stop="askToRemoveMeal(draft.id)"
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
              </div>

              <div class="p-3">
                <p class="font-black leading-snug text-fork-ink">
                  {{ draft.recipeName }}
                </p>

                <span
                  class="mt-3 inline-flex rounded-full bg-fork-sage px-3 py-1 text-xs font-bold text-fork-olive"
                >
                  {{ draft.category }}
                </span>
              </div>
            </NuxtLink>

            <div class="border-t border-fork-line bg-fork-card p-3">
              <div class="grid grid-cols-2 gap-2">
                <div class="relative">
                  <select
                    v-model="getDraftSelection(draft.id).day"
                    class="w-full appearance-none rounded-2xl border border-fork-line bg-fork-card px-3 py-2 pr-8 text-xs outline-none focus:border-fork-ink"
                  >
                    <option
                      v-for="day in days"
                      :key="day.value"
                      :value="day.value"
                    >
                      {{ day.shortLabel }}
                    </option>
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fork-muted"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                <div class="relative">
                  <select
                    v-model="getDraftSelection(draft.id).meal"
                    class="w-full appearance-none rounded-2xl border border-fork-line bg-fork-card px-3 py-2 pr-8 text-xs outline-none focus:border-fork-ink"
                  >
                    <option
                      v-for="meal in meals"
                      :key="meal.value"
                      :value="meal.value"
                    >
                      {{ meal.label }}
                    </option>
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fork-muted"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              <button
                type="button"
                class="mt-2 w-full rounded-full bg-fork-clay px-4 py-2 text-xs font-bold text-white transition hover:bg-fork-clay-dark"
                @click="assignDraft(draft.id)"
              >
                Sijoita viikkoon
              </button>
            </div>

            <ConfirmInline
              v-if="pendingRemovalId === draft.id"
              class="m-3"
              title="Poistetaanko tämä luonnos?"
              description="Resepti poistetaan luonnoksista."
              confirm-label="Poista"
              @confirm="confirmRemoveMeal(draft.id)"
              @cancel="cancelRemoveMeal"
            />
          </div>
        </div>
      </section>

      <section v-if="hasPlannedMeals" class="space-y-4">
        <article
          v-for="day in days"
          :key="day.value"
          class="rounded-[2rem] border border-fork-line bg-fork-card p-5 shadow-sm"
        >
          <div class="mb-5 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-black text-fork-ink">
                {{ day.label }}
              </h2>

              <div
                v-if="isDayCollapsed(day.value)"
                class="flex items-center gap-1.5"
              >
                <NuxtLink
                  v-for="plannedMeal in getDayPlannedMeals(day.value)"
                  :key="plannedMeal.id"
                  :to="`/recipes/${plannedMeal.recipeId}`"
                  :title="plannedMeal.recipeName"
                >
                  <img
                    :src="plannedMeal.recipeImage"
                    :alt="plannedMeal.recipeName"
                    class="h-10 w-10 rounded-full border-2 border-fork-card object-cover shadow-sm"
                  >
                </NuxtLink>

                <span
                  v-if="getDayPlannedMeals(day.value).length === 0"
                  class="text-sm text-fork-muted"
                >
                  Ei suunniteltu
                </span>
              </div>
            </div>

            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fork-muted transition hover:bg-fork-bg hover:text-fork-ink"
              :aria-label="isDayCollapsed(day.value) ? `Näytä ${day.label} kokonaan` : `Pienennä ${day.label}`"
              :aria-expanded="!isDayCollapsed(day.value)"
              @click="toggleDayCollapsed(day.value)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5 transition-transform"
                :class="{ '-rotate-90': isDayCollapsed(day.value) }"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          <div v-if="!isDayCollapsed(day.value)" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <section
              v-for="meal in meals"
              :key="meal.value"
              class="rounded-3xl border bg-fork-bg p-4"
              :class="
                getPlannedMeals(day.value, meal.value).length > 0
                  ? 'border-fork-line'
                  : 'border-dashed border-fork-line'
              "
            >
              <h3
                class="text-xs font-black uppercase tracking-wide text-fork-muted"
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
                  <NuxtLink
                    :to="`/recipes/${plannedMeal.recipeId}`"
                    class="block rounded-2xl transition hover:bg-fork-bg"
                  >
                    <div class="relative">
                      <img
                        :src="plannedMeal.recipeImage"
                        :alt="plannedMeal.recipeName"
                        class="h-28 w-full rounded-t-2xl object-cover"
                      >

                      <button
                        type="button"
                        class="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-fork-card/90 text-red-600 shadow-sm backdrop-blur transition hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                        :aria-label="`Poista ${plannedMeal.recipeName} suunnitelmasta`"
                        @click.prevent.stop="askToRemoveMeal(plannedMeal.id)"
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
                    </div>

                    <div class="p-3">
                      <p class="font-black leading-snug text-fork-ink">
                        {{ plannedMeal.recipeName }}
                      </p>

                      <span
                        class="mt-3 inline-flex rounded-full bg-fork-sage px-3 py-1 text-xs font-bold text-fork-olive"
                      >
                        {{ plannedMeal.category }}
                      </span>
                    </div>
                  </NuxtLink>

                  <ConfirmInline
                    v-if="pendingRemovalId === plannedMeal.id"
                    class="mt-2"
                    title="Poistetaanko tämä resepti?"
                    description="Resepti poistetaan viikkosuunnitelmasta."
                    confirm-label="Poista"
                    @confirm="confirmRemoveMeal(plannedMeal.id)"
                    @cancel="cancelRemoveMeal"
                  />
                </div>
              </div>

              <div
                v-else
                class="mt-3 rounded-2xl border border-dashed border-fork-line p-5 text-center text-sm text-fork-muted"
              >
                Tyhjä
              </div>
            </section>
          </div>
        </article>
      </section>
      <section
        v-if="hasPlannedMeals"
        class="mt-10 rounded-[2rem] bg-fork-card p-6 shadow-sm ring-1 ring-fork-line"
      >
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay">
              Ostoslista
            </p>

            <h2 class="mt-2 text-2xl font-black tracking-tight">
              {{ shoppingListSummary }}
            </h2>

            <p class="mt-1 text-sm text-fork-muted">
              Koostettu viikkosuunnitelmaan lisättyjen reseptien ainesosista.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-2 rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
            @click="isShoppingListOpen = true"
          >
            Avaa ostoslista →
          </button>
        </div>
      </section>
    </section>

    <ShoppingListDrawer v-model:open="isShoppingListOpen" />
  </main>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType } from "~/stores/planner";

const plannerStore = usePlannerStore();

useSeoMeta({
  title: "Viikkosuunnitelma · Forkcast",
  description: "Suunnittele viikon ateriat ja muodosta ostoslista Forkcastissa.",
});

const route = useRoute();
const router = useRouter();

const pendingClearWeek = ref(false);

const pendingRemovalId = ref<string | null>(null);

const isShoppingListOpen = ref(false);

const hasPlannedMeals = computed(() => plannerStore.plannedMeals.length > 0);

const shoppingListSummary = computed(() => {
  const count = plannerStore.shoppingList.length;
  return count === 1 ? "1 tuote" : `${count} tuotetta`;
});

onMounted(() => {
  plannerStore.loadFromStorage();

  if (route.query.openShoppingList) {
    isShoppingListOpen.value = true;
    router.replace({ query: {} });
  }
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
  { value: "supper", label: "Illallinen" },
];

function getPlannedMeals(day: string, meal: MealType) {
  return plannerStore.getMeals(day, meal);
}

function getDayPlannedMeals(day: string) {
  return plannerStore.plannedMeals.filter((plannedMeal) => plannedMeal.day === day);
}

const collapsedDays = ref<Set<string>>(new Set());

function isDayCollapsed(day: string) {
  return collapsedDays.value.has(day);
}

function toggleDayCollapsed(day: string) {
  const next = new Set(collapsedDays.value);

  if (next.has(day)) {
    next.delete(day);
  } else {
    next.add(day);
  }

  collapsedDays.value = next;
}

const draftSelections = reactive<Record<string, { day: string; meal: MealType }>>({});

function getDraftSelection(draftId: string) {
  if (!draftSelections[draftId]) {
    draftSelections[draftId] = { day: "monday", meal: "dinner" };
  }

  return draftSelections[draftId];
}

function assignDraft(draftId: string) {
  const selection = getDraftSelection(draftId);
  plannerStore.assignMeal(draftId, selection.day, selection.meal);
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
