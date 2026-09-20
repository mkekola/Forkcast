<template>
  <main class="min-h-screen bg-fork-bg px-6 pb-24 pt-10 text-fork-ink sm:pb-10">
    <section class="mx-auto max-w-6xl">
      <AppHeader />

      <section class="py-14">
        <p
          class="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark"
        >
          Viikkosuunnitelma
        </p>

        <h1 class="text-4xl font-black tracking-tight md:text-5xl">
          Mitä syötäisiin tällä viikolla?
        </h1>

        <p class="mt-4 max-w-2xl leading-7 text-fork-muted">
          Lisää reseptejä viikkoon resepteistä tai luonnoksista, ja raahaa ne
          haluamaasi päivään ja ateriaan.
        </p>

        <div v-if="hasPlannedMeals" class="mt-6">
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-full bg-fork-clay px-5 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
              @click="plannerStore.isShoppingListOpen = true"
            >
              Ostoslistaan
            </button>

            <button
              type="button"
              class="rounded-full border border-fork-line bg-fork-card px-5 py-3 text-sm font-bold text-fork-ink transition hover:border-fork-ink"
              @click="plannerStore.isDraftsOpen = true"
            >
              Luonnokset
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
          class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark"
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

      <section v-if="hasPlannedMeals" class="space-y-4">
        <article
          v-for="day in days"
          :key="day.value"
          class="rounded-[2rem] border p-5 shadow-sm transition-colors"
          :class="
            dayDragOver === day.value
              ? 'border-fork-clay bg-fork-clay-soft'
              : 'border-fork-line bg-fork-card'
          "
          @dragover.prevent="handleDayDragOver(day.value)"
          @dragleave="handleDayDragLeave(day.value)"
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
                  v-slot="{ href }"
                  :key="plannedMeal.id"
                  :to="`/recipes/${plannedMeal.recipeId}`"
                  custom
                >
                  <a
                    :href="href"
                    :title="plannedMeal.recipeName"
                    @click="(event) => openOnClick(event, plannedMeal.recipeId)"
                  >
                    <img
                      :src="plannedMeal.recipeImage"
                      :alt="plannedMeal.recipeName"
                      class="h-10 w-10 rounded-full border-2 border-fork-card object-cover shadow-sm"
                    >
                  </a>
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
              class="rounded-3xl border p-4 transition-colors"
              :class="
                dragOverSlot === slotKey(day.value, meal.value)
                  ? 'border-fork-clay bg-fork-clay-soft'
                  : getPlannedMeals(day.value, meal.value).length > 0
                    ? 'border-fork-line bg-fork-bg'
                    : 'border-dashed border-fork-line bg-fork-bg'
              "
              @dragover.prevent="handleDragOver($event, day.value, meal.value)"
              @dragleave="handleDragLeave(day.value, meal.value)"
              @drop.prevent="handleDrop($event, day.value, meal.value)"
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
                  draggable="true"
                  class="relative cursor-grab overflow-hidden rounded-2xl bg-fork-card shadow-sm active:cursor-grabbing"
                  @dragstart="handleDragStart($event, plannedMeal)"
                  @dragend="handleDragEnd"
                >
                  <NuxtLink
                    v-slot="{ href }"
                    :to="`/recipes/${plannedMeal.recipeId}`"
                    custom
                  >
                  <a
                    :href="href"
                    class="block rounded-2xl transition hover:bg-fork-bg"
                    @click="(event) => openOnClick(event, plannedMeal.recipeId)"
                  >
                    <div class="relative">
                      <img
                        :src="plannedMeal.recipeImage"
                        :alt="plannedMeal.recipeName"
                        class="h-28 w-full rounded-t-2xl object-cover"
                      >

                      <div class="absolute right-2 top-2 z-10 flex gap-1.5">
                        <button
                          type="button"
                          class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-fork-card/90 text-fork-clay shadow-sm backdrop-blur transition hover:bg-fork-clay-soft focus:outline-none focus:ring-2 focus:ring-fork-clay"
                          :aria-label="`Siirrä ${plannedMeal.recipeName} toiseen ajankohtaan`"
                          @click.prevent.stop="startMovingMeal(plannedMeal.id)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="h-3.5 w-3.5"
                          >
                            <path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-fork-card/90 text-red-600 shadow-sm backdrop-blur transition hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
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
                  </a>
                  </NuxtLink>

                  <div
                    v-if="movingMealId === plannedMeal.id"
                    class="border-t border-fork-line bg-fork-card p-3"
                  >
                    <div class="grid grid-cols-2 gap-2">
                      <div class="relative">
                        <select
                          v-model="getMoveSelection(plannedMeal.id, day.value, meal.value).day"
                          class="w-full appearance-none rounded-2xl border border-fork-line bg-fork-card px-3 py-2 pr-8 text-xs outline-none focus:border-fork-ink"
                        >
                          <option
                            v-for="dayOption in days"
                            :key="dayOption.value"
                            :value="dayOption.value"
                          >
                            {{ dayOption.shortLabel }}
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
                          v-model="getMoveSelection(plannedMeal.id, day.value, meal.value).meal"
                          class="w-full appearance-none rounded-2xl border border-fork-line bg-fork-card px-3 py-2 pr-8 text-xs outline-none focus:border-fork-ink"
                        >
                          <option
                            v-for="mealOption in meals"
                            :key="mealOption.value"
                            :value="mealOption.value"
                          >
                            {{ mealOption.label }}
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
                      @click="confirmMoveMeal(plannedMeal.id)"
                    >
                      Siirrä
                    </button>
                  </div>

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
                class="mt-3 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-fork-line p-5 text-center text-sm text-fork-muted"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4" />
                </svg>
                Raahaa resepti tähän
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
            <p class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark">
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
            @click="plannerStore.isShoppingListOpen = true"
          >
            Avaa ostoslista →
          </button>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType, type PlannedMeal } from "~/stores/planner";
import { useRecipeModal } from "~/composables/useRecipeModal";

const plannerStore = usePlannerStore();
const { openOnClick } = useRecipeModal();

useSeoMeta({
  title: "Viikkosuunnitelma · Forkcast",
  description: "Suunnittele viikon ateriat ja muodosta ostoslista Forkcastissa.",
});

const pendingClearWeek = ref(false);

const pendingRemovalId = ref<string | null>(null);

const movingMealId = ref<string | null>(null);
const moveSelections = reactive<Record<string, { day: string; meal: MealType }>>({});

function getMoveSelection(plannedMealId: string, currentDay: string, currentMeal: MealType) {
  if (!moveSelections[plannedMealId]) {
    moveSelections[plannedMealId] = { day: currentDay, meal: currentMeal };
  }

  return moveSelections[plannedMealId];
}

function startMovingMeal(plannedMealId: string) {
  movingMealId.value = movingMealId.value === plannedMealId ? null : plannedMealId;
}

function confirmMoveMeal(plannedMealId: string) {
  const selection = moveSelections[plannedMealId];

  if (selection) {
    plannerStore.assignMeal(plannedMealId, selection.day, selection.meal);
  }

  movingMealId.value = null;
}

const hasPlannedMeals = computed(() => plannerStore.plannedMeals.length > 0);

const shoppingListSummary = computed(() => {
  const count = plannerStore.shoppingList.length;
  return count === 1 ? "1 tuote" : `${count} tuotetta`;
});

onMounted(async () => {
  await plannerStore.loadFromStorage();

  collapsedDays.value = new Set(
    days
      .filter((day) => getDayPlannedMeals(day.value).length === 0)
      .map((day) => day.value),
  );
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

function slotKey(day: string, meal: MealType) {
  return `${day}-${meal}`;
}

const dragOverSlot = ref<string | null>(null);

// A collapsed day has no visible meal slots to drop onto, so hovering a
// drag over its (still-visible) header for a moment expands it, instead of
// requiring it to be opened by hand before anything can be dropped there.
const DAY_EXPAND_DELAY_MS = 500;
const dayDragOver = ref<string | null>(null);
let dayExpandTimeoutId: ReturnType<typeof setTimeout> | null = null;

function clearDayExpandTimer() {
  if (dayExpandTimeoutId !== null) {
    clearTimeout(dayExpandTimeoutId);
    dayExpandTimeoutId = null;
  }

  dayDragOver.value = null;
}

function handleDayDragOver(day: string) {
  if (!isDayCollapsed(day) || dayDragOver.value === day) {
    return;
  }

  clearDayExpandTimer();
  dayDragOver.value = day;

  dayExpandTimeoutId = setTimeout(() => {
    toggleDayCollapsed(day);
    clearDayExpandTimer();
  }, DAY_EXPAND_DELAY_MS);
}

function handleDayDragLeave(day: string) {
  if (dayDragOver.value === day) {
    clearDayExpandTimer();
  }
}

function handleDragStart(event: DragEvent, plannedMeal: PlannedMeal) {
  if (!event.dataTransfer) {
    return;
  }

  event.dataTransfer.effectAllowed = "copyMove";
  event.dataTransfer.setData("application/json", JSON.stringify(plannedMeal));
  plannerStore.isDragging = true;
}

function handleDragEnd() {
  plannerStore.isDragging = false;
  dragOverSlot.value = null;
  clearDayExpandTimer();
}

function handleDragOver(event: DragEvent, day: string, meal: MealType) {
  dragOverSlot.value = slotKey(day, meal);

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = event.ctrlKey || event.metaKey ? "copy" : "move";
  }
}

function handleDragLeave(day: string, meal: MealType) {
  if (dragOverSlot.value === slotKey(day, meal)) {
    dragOverSlot.value = null;
  }
}

function handleDrop(event: DragEvent, day: string, meal: MealType) {
  dragOverSlot.value = null;
  plannerStore.isDragging = false;

  const payload = event.dataTransfer?.getData("application/json");

  if (!payload) {
    return;
  }

  let dragged: PlannedMeal;

  try {
    dragged = JSON.parse(payload);
  } catch {
    return;
  }

  if (event.ctrlKey || event.metaKey) {
    plannerStore.addMeal({
      day,
      meal,
      recipeId: dragged.recipeId,
      recipeName: dragged.recipeName,
      recipeImage: dragged.recipeImage,
      category: dragged.category,
      ingredients: dragged.ingredients,
    });
  } else {
    plannerStore.assignMeal(dragged.id, day, meal);
  }
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
