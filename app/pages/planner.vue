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
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <section
              class="rounded-[2rem] p-6 shadow-sm ring-1 transition-colors"
              :class="isDraftsDropTarget ? 'bg-fork-clay-soft ring-fork-clay' : 'bg-fork-card ring-fork-line'"
              @dragover.prevent="handleDraftsDragOver"
              @dragleave="handleDraftsDragLeave"
              @drop.prevent="handleDraftsDrop"
            >
              <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <p class="text-sm font-bold uppercase tracking-[0.22em] text-fork-clay-dark">
                    Luonnokset
                  </p>

                  <h2 class="mt-2 text-2xl font-black tracking-tight">
                    {{ draftsSummary }}
                  </h2>

                  <div v-if="visibleDraftThumbnails.length > 0" class="mt-3 flex items-center gap-1.5">
                    <div
                      v-for="draft in visibleDraftThumbnails"
                      :key="draft.id"
                      class="group relative"
                    >
                      <NuxtLink
                        v-slot="{ href }"
                        :to="`/recipes/${draft.recipeId}`"
                        custom
                      >
                        <a
                          :href="href"
                          draggable="true"
                          class="block cursor-grab transition active:cursor-grabbing"
                          :class="{ 'opacity-30 grayscale': draggingMealId === draft.id }"
                          @click="(event) => openOnClick(event, draft.recipeId)"
                          @dragstart="handleDragStart($event, draft)"
                          @dragend="handleDragEnd"
                        >
                          <img
                            :src="draft.recipeImage"
                            :alt="draft.recipeName"
                            class="h-9 w-9 rounded-full border-2 border-fork-card object-cover shadow-sm"
                          >
                        </a>
                      </NuxtLink>

                      <div
                        class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-40 -translate-x-1/2 rounded-2xl bg-fork-ink p-2 opacity-0 shadow-xl transition duration-150 group-hover:opacity-100"
                      >
                        <img
                          :src="draft.recipeImage"
                          :alt="draft.recipeName"
                          class="h-20 w-full rounded-xl object-cover"
                        >

                        <p class="mt-1.5 line-clamp-2 text-xs font-bold text-white">
                          {{ draft.recipeName }}
                        </p>
                      </div>
                    </div>

                    <span
                      v-if="hiddenDraftsCount > 0"
                      class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-fork-card bg-fork-bg text-xs font-bold text-fork-muted shadow-sm"
                    >
                      +{{ hiddenDraftsCount }}
                    </span>
                  </div>

                  <p v-else class="mt-1 text-sm text-fork-muted">
                    Lisää reseptejä luonnoksiin sijoittaaksesi ne viikkoon myöhemmin.
                  </p>
                </div>

                <button
                  type="button"
                  class="inline-flex shrink-0 items-center gap-2 rounded-full bg-fork-clay px-6 py-3 text-sm font-bold text-white transition hover:bg-fork-clay-dark"
                  @click="plannerStore.isDraftsOpen = true"
                >
                  Avaa luonnokset
                </button>
              </div>
            </section>

            <section class="rounded-[2rem] bg-fork-card p-6 shadow-sm ring-1 ring-fork-line">
              <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
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
                  Avaa ostoslista
                </button>
              </div>
            </section>
          </div>
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
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="inline-flex rounded-full border border-fork-line bg-fork-card p-1">
            <button
              type="button"
              class="rounded-full px-4 py-2 text-sm font-bold transition"
              :class="
                viewMode === 'week'
                  ? 'bg-fork-clay text-white'
                  : 'text-stone-700 hover:text-fork-ink'
              "
              @click="setViewMode('week')"
            >
              Viikko
            </button>

            <button
              type="button"
              class="rounded-full px-4 py-2 text-sm font-bold transition"
              :class="
                viewMode === 'day'
                  ? 'bg-fork-clay text-white'
                  : 'text-stone-700 hover:text-fork-ink'
              "
              @click="setViewMode('day')"
            >
              Päivä
            </button>
          </div>

          <div v-if="viewMode === 'day'" class="flex items-center gap-3">
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fork-muted transition hover:bg-fork-card hover:text-fork-ink"
              aria-label="Edellinen päivä"
              @click="goToPreviousDay"
              @dragover.prevent="handleCarouselNavDragOver('previous')"
              @dragleave="handleCarouselNavDragLeave"
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
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div class="flex items-center gap-1.5">
              <button
                v-for="(day, index) in days"
                :key="day.value"
                type="button"
                :aria-label="`Näytä ${day.label}`"
                :aria-current="index === currentDayIndex ? 'true' : undefined"
                class="h-2 rounded-full transition-all"
                :class="index === currentDayIndex ? 'w-5 bg-fork-clay' : 'w-2 bg-fork-line'"
                @click="goToDay(index)"
              />
            </div>

            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fork-muted transition hover:bg-fork-card hover:text-fork-ink"
              aria-label="Seuraava päivä"
              @click="goToNextDay"
              @dragover.prevent="handleCarouselNavDragOver('next')"
              @dragleave="handleCarouselNavDragLeave"
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
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div ref="dayCardWrapperRef" @wheel="handleDayWheel">
          <TransitionGroup :name="dayTransitionName" tag="div" class="relative space-y-4">
            <article
              v-for="day in visibleDays"
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
                <div
                  v-for="plannedMeal in getDayPlannedMeals(day.value)"
                  :key="plannedMeal.id"
                  class="group relative"
                >
                  <NuxtLink
                    v-slot="{ href }"
                    :to="`/recipes/${plannedMeal.recipeId}`"
                    custom
                  >
                    <a
                      :href="href"
                      class="block"
                      @click="(event) => openOnClick(event, plannedMeal.recipeId)"
                    >
                      <img
                        :src="plannedMeal.recipeImage"
                        :alt="plannedMeal.recipeName"
                        class="h-10 w-10 rounded-full border-2 border-fork-card object-cover shadow-sm"
                      >
                    </a>
                  </NuxtLink>

                  <div
                    class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-40 -translate-x-1/2 rounded-2xl bg-fork-ink p-2 opacity-0 shadow-xl transition duration-150 group-hover:opacity-100"
                  >
                    <img
                      :src="plannedMeal.recipeImage"
                      :alt="plannedMeal.recipeName"
                      class="h-20 w-full rounded-xl object-cover"
                    >

                    <p class="mt-1.5 line-clamp-2 text-xs font-bold text-white">
                      {{ plannedMeal.recipeName }}
                    </p>
                  </div>
                </div>

                <span
                  v-if="getDayPlannedMeals(day.value).length === 0"
                  class="text-sm text-fork-muted"
                >
                  Ei suunniteltu
                </span>
              </div>
            </div>

            <button
              v-if="viewMode === 'week'"
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
                  class="relative cursor-grab overflow-hidden rounded-2xl bg-fork-card shadow-sm transition active:cursor-grabbing"
                  :class="{ 'opacity-30 grayscale': draggingMealId === plannedMeal.id }"
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
                          :aria-label="`Kopioi ${plannedMeal.recipeName} samaan kohtaan`"
                          @click.prevent.stop="copyMeal(plannedMeal)"
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
                            <rect x="9" y="9" width="12" height="12" rx="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        </button>

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
          </TransitionGroup>
        </div>
      </section>

      <div v-if="hasPlannedMeals" class="mt-6 flex flex-col items-end">
        <button
          type="button"
          class="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
          @click="askToClearWeek"
        >
          Tyhjennä viikko
        </button>

        <ConfirmInline
          v-if="pendingClearWeek"
          ref="clearWeekConfirmRef"
          class="mt-3 max-w-md"
          title="Tyhjennetäänkö koko viikko?"
          description="Tämä poistaa kaikki viikkosuunnitelmaan lisätyt reseptit."
          confirm-label="Tyhjennä"
          @confirm="confirmClearWeek"
          @cancel="cancelClearWeek"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType, type PlannedMeal } from "~/stores/planner";
import { useRecipeModal } from "~/composables/useRecipeModal";
import { setWholeCardAsDragImage } from "~/utils/dragImage";

const plannerStore = usePlannerStore();
const { openOnClick } = useRecipeModal();

useSeoMeta({
  title: "Viikkosuunnitelma · Forkcast",
  description: "Suunnittele viikon ateriat ja muodosta ostoslista Forkcastissa.",
});

const pendingClearWeek = ref(false);
const clearWeekConfirmRef = ref<{ el?: HTMLElement | null } | null>(null);

const pendingRemovalId = ref<string | null>(null);

const movingMealId = ref<string | null>(null);
const moveSelections = reactive<Record<string, { day: string; meal: MealType }>>({});

function getMoveSelection(plannedMealId: string, currentDay: string, currentMeal: MealType) {
  if (!moveSelections[plannedMealId]) {
    moveSelections[plannedMealId] = { day: currentDay, meal: currentMeal };
  }

  return moveSelections[plannedMealId];
}

// A copy button next to the drag handle, since holding ctrl/cmd while
// dropping (the drag-and-drop way to copy instead of move) isn't something
// most people would think to try. Copies into the same slot so it can then
// be dragged wherever it should actually go.
function copyMeal(plannedMeal: PlannedMeal) {
  plannerStore.addMeal({
    day: plannedMeal.day,
    meal: plannedMeal.meal,
    recipeId: plannedMeal.recipeId,
    recipeName: plannedMeal.recipeName,
    recipeImage: plannedMeal.recipeImage,
    category: plannedMeal.category,
    ingredients: plannedMeal.ingredients,
  });
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

const draftsSummary = computed(() => {
  const count = plannerStore.drafts.length;
  return count === 1 ? "1 luonnos" : `${count} luonnosta`;
});

// Enough thumbnails to fill roughly one row - the rest collapse into a
// "+N" badge instead of wrapping onto more rows.
const DRAFT_THUMBNAIL_LIMIT = 8;

const visibleDraftThumbnails = computed(() => plannerStore.drafts.slice(0, DRAFT_THUMBNAIL_LIMIT));

const hiddenDraftsCount = computed(() =>
  Math.max(0, plannerStore.drafts.length - DRAFT_THUMBNAIL_LIMIT),
);

onMounted(async () => {
  await plannerStore.loadFromStorage();

  collapsedDays.value = new Set(
    days
      .filter((day) => getDayPlannedMeals(day.value).length === 0)
      .map((day) => day.value),
  );

  const storedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);

  if (storedViewMode === "week" || storedViewMode === "day") {
    viewMode.value = storedViewMode;
  }

  currentDayIndex.value = todayDayIndex();
});

// Auto-scrolls the page while dragging near the top/bottom edge of the
// viewport, since the day list is often taller than the screen and native
// drag'n'drop doesn't scroll the page for you. Speed ramps up the closer
// the cursor gets to the edge.
const AUTO_SCROLL_EDGE_PX = 100;
const AUTO_SCROLL_MAX_SPEED = 16;
let autoScrollSpeed = 0;
let autoScrollFrameId: number | null = null;

function runAutoScroll() {
  if (autoScrollSpeed === 0) {
    autoScrollFrameId = null;
    return;
  }

  window.scrollBy(0, autoScrollSpeed);
  autoScrollFrameId = requestAnimationFrame(runAutoScroll);
}

function stopAutoScroll() {
  autoScrollSpeed = 0;

  if (autoScrollFrameId !== null) {
    cancelAnimationFrame(autoScrollFrameId);
    autoScrollFrameId = null;
  }
}

function handleWindowDragOver(event: DragEvent) {
  if (!plannerStore.isDragging) {
    return;
  }

  const distanceFromTop = event.clientY;
  const distanceFromBottom = window.innerHeight - event.clientY;

  if (distanceFromTop < AUTO_SCROLL_EDGE_PX) {
    autoScrollSpeed = -AUTO_SCROLL_MAX_SPEED * (1 - distanceFromTop / AUTO_SCROLL_EDGE_PX);
  } else if (distanceFromBottom < AUTO_SCROLL_EDGE_PX) {
    autoScrollSpeed = AUTO_SCROLL_MAX_SPEED * (1 - distanceFromBottom / AUTO_SCROLL_EDGE_PX);
  } else {
    autoScrollSpeed = 0;
  }

  if (autoScrollSpeed !== 0 && autoScrollFrameId === null) {
    runAutoScroll();
  }
}

onMounted(() => {
  window.addEventListener("dragover", handleWindowDragOver);
  window.addEventListener("dragend", stopAutoScroll);
  window.addEventListener("drop", stopAutoScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("dragover", handleWindowDragOver);
  window.removeEventListener("dragend", stopAutoScroll);
  window.removeEventListener("drop", stopAutoScroll);
  stopAutoScroll();
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

// Whether the week renders as one long list or one day at a time in a
// carousel - a personal preference, so it's remembered across visits.
const VIEW_MODE_STORAGE_KEY = "forkcast-planner-view-mode";
const viewMode = ref<"week" | "day">("week");

function setViewMode(mode: "week" | "day") {
  viewMode.value = mode;

  if (import.meta.client) {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }
}

function todayDayIndex() {
  // Date#getDay() is 0 (Sunday) .. 6 (Saturday); `days` above starts on
  // Monday, so Sunday needs to wrap around to the last index instead of
  // the first.
  const jsDay = new Date().getDay();
  return (jsDay + 6) % 7;
}

const currentDayIndex = ref(0);

const visibleDays = computed(() => {
  return viewMode.value === "day" ? [days[currentDayIndex.value]] : days;
});

// Which way the day card should slide - set right before currentDayIndex
// changes, so the TransitionGroup below already has the right enter/leave
// classes picked by the time the DOM update happens.
const dayTransitionDirection = ref<"next" | "previous">("next");

const dayTransitionName = computed(() => {
  if (viewMode.value !== "day") {
    return undefined;
  }

  return dayTransitionDirection.value === "next" ? "day-slide-next" : "day-slide-prev";
});

// Days have wildly different amounts of stuff in their meal slots, so
// swapping straight to the new day's natural height made the page jump -
// the outgoing card leaves the document flow (see the CSS) the moment the
// transition starts, so the wrapper's height would otherwise snap straight
// to the incoming card's height instead of easing between the two. Lock it
// to the old height, then animate to the new one once it's known.
const dayCardWrapperRef = ref<HTMLElement | null>(null);
const HEIGHT_TRANSITION_MS = 250;

function withHeightTransition(changeDay: () => void) {
  const wrapper = dayCardWrapperRef.value;

  if (!wrapper) {
    changeDay();
    return;
  }

  const startHeight = wrapper.offsetHeight;
  changeDay();

  nextTick(() => {
    const endHeight = wrapper.offsetHeight;

    wrapper.style.transition = "none";
    wrapper.style.overflow = "hidden";
    wrapper.style.height = `${startHeight}px`;

    // Force a reflow so the browser registers the starting height as its
    // own layout before the next frame animates away from it, rather than
    // collapsing both changes into a single instantaneous jump.
    void wrapper.offsetHeight;

    requestAnimationFrame(() => {
      wrapper.style.transition = `height ${HEIGHT_TRANSITION_MS}ms ease`;
      wrapper.style.height = `${endHeight}px`;
    });

    setTimeout(() => {
      wrapper.style.height = "";
      wrapper.style.overflow = "";
      wrapper.style.transition = "";
    }, HEIGHT_TRANSITION_MS);
  });
}

function goToPreviousDay() {
  dayTransitionDirection.value = "previous";
  withHeightTransition(() => {
    currentDayIndex.value = (currentDayIndex.value - 1 + days.length) % days.length;
  });
}

function goToNextDay() {
  dayTransitionDirection.value = "next";
  withHeightTransition(() => {
    currentDayIndex.value = (currentDayIndex.value + 1) % days.length;
  });
}

// Jumping straight to a day (the dot indicators) still needs a direction to
// slide in from - infer it from which side of the current day it's on.
function goToDay(index: number) {
  dayTransitionDirection.value = index >= currentDayIndex.value ? "next" : "previous";
  withHeightTransition(() => {
    currentDayIndex.value = index;
  });
}

// Hovering a drag over the prev/next arrow for a moment pages the carousel
// to that day, the same pattern used to expand a collapsed day below.
const dragHoverNavDirection = ref<"previous" | "next" | null>(null);
let dragHoverNavTimeoutId: ReturnType<typeof setTimeout> | null = null;

function clearDragHoverNavTimer() {
  if (dragHoverNavTimeoutId !== null) {
    clearTimeout(dragHoverNavTimeoutId);
    dragHoverNavTimeoutId = null;
  }

  dragHoverNavDirection.value = null;
}

function handleCarouselNavDragOver(direction: "previous" | "next") {
  if (dragHoverNavDirection.value === direction) {
    return;
  }

  clearDragHoverNavTimer();
  dragHoverNavDirection.value = direction;

  dragHoverNavTimeoutId = setTimeout(() => {
    if (direction === "previous") {
      goToPreviousDay();
    } else {
      goToNextDay();
    }

    clearDragHoverNavTimer();
  }, DRAG_HOVER_DELAY_MS);
}

function handleCarouselNavDragLeave() {
  clearDragHoverNavTimer();
}

// Scrolling over the day card pages the carousel instead of the page - one
// day per gesture, not one per wheel tick (a single trackpad swipe fires
// many of those), and small enough deltas (a barely-moved mouse wheel) are
// ignored so it doesn't trigger on an almost-still cursor.
const WHEEL_NAV_COOLDOWN_MS = 400;
const WHEEL_NAV_THRESHOLD = 10;
let wheelNavOnCooldown = false;

function handleDayWheel(event: WheelEvent) {
  if (viewMode.value !== "day") {
    return;
  }

  event.preventDefault();

  if (wheelNavOnCooldown || Math.abs(event.deltaY) < WHEEL_NAV_THRESHOLD) {
    return;
  }

  wheelNavOnCooldown = true;

  if (event.deltaY > 0) {
    goToNextDay();
  } else {
    goToPreviousDay();
  }

  setTimeout(() => {
    wheelNavOnCooldown = false;
  }, WHEEL_NAV_COOLDOWN_MS);
}

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
// Also used by the day-carousel's prev/next arrows, above.
const DRAG_HOVER_DELAY_MS = 500;
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
  }, DRAG_HOVER_DELAY_MS);
}

function handleDayDragLeave(day: string) {
  if (dayDragOver.value === day) {
    clearDayExpandTimer();
  }
}

// Faded out in its original slot/thumbnail while being dragged, so it's
// clear at a glance what's being moved and where it's moving from.
const draggingMealId = ref<string | null>(null);

function handleDragStart(event: DragEvent, plannedMeal: PlannedMeal) {
  if (!event.dataTransfer) {
    return;
  }

  event.dataTransfer.effectAllowed = "copyMove";
  event.dataTransfer.setData("application/json", JSON.stringify(plannedMeal));
  plannerStore.isDragging = true;
  draggingMealId.value = plannedMeal.id;
  setWholeCardAsDragImage(event);
}

function handleDragEnd() {
  plannerStore.isDragging = false;
  dragOverSlot.value = null;
  draggingMealId.value = null;
  clearDayExpandTimer();
  clearDragHoverNavTimer();
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
  } else if (dragged.day !== day || dragged.meal !== meal) {
    plannerStore.assignMeal(dragged.id, day, meal);
  }
}

// Dragging an already-planned meal onto the drafts card unassigns it (its
// day/meal go back to null), the reverse of dragging a draft into a slot.
const isDraftsDropTarget = ref(false);

function handleDraftsDragOver() {
  isDraftsDropTarget.value = true;
}

function handleDraftsDragLeave() {
  isDraftsDropTarget.value = false;
}

function handleDraftsDrop(event: DragEvent) {
  isDraftsDropTarget.value = false;
  plannerStore.isDragging = false;

  const payload = event.dataTransfer?.getData("application/json");

  if (!payload) {
    return;
  }

  try {
    const dragged: PlannedMeal = JSON.parse(payload);

    if (dragged.day || dragged.meal) {
      plannerStore.unassignMeal(dragged.id);
    }
  } catch {
    // ignore malformed payloads
  }
}

const collapsedDays = ref<Set<string>>(new Set());

function isDayCollapsed(day: string) {
  // The day carousel only ever renders one day at a time - collapsing it
  // too would leave nothing to look at (or drop a meal onto).
  if (viewMode.value === "day") {
    return false;
  }

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

  nextTick(() => {
    clearWeekConfirmRef.value?.el?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function cancelClearWeek() {
  pendingClearWeek.value = false;
}

function confirmClearWeek() {
  plannerStore.clearPlanner();
  pendingClearWeek.value = false;
}
</script>
