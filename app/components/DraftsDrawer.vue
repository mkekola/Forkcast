<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-fork-ink/40"
        :class="{ 'pointer-events-none': plannerStore.isDragging }"
        @click="open = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="open"
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drafts-heading"
        tabindex="-1"
        class="fixed inset-y-0 left-0 z-50 flex w-full flex-col bg-fork-card shadow-2xl sm:max-w-md sm:rounded-r-[2rem]"
        @keydown.esc="open = false"
      >
        <div class="flex items-center justify-between border-b border-fork-line px-6 py-5">
          <h2 id="drafts-heading" class="text-xl font-black">Luonnokset</h2>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-fork-muted transition hover:bg-fork-bg hover:text-fork-ink"
            aria-label="Sulje luonnokset"
            @click="open = false"
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
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          v-if="plannerStore.getDrafts().length > 0"
          class="border-b border-fork-line px-6 py-3"
        >
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Hae luonnoksista…"
            class="w-full rounded-full border border-fork-line bg-fork-bg px-4 py-2 text-sm outline-none placeholder:text-fork-muted focus:border-fork-ink"
          >
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div
            v-if="plannerStore.getDrafts().length === 0"
            class="rounded-2xl bg-fork-bg p-5 text-sm text-fork-muted"
          >
            Ei luonnoksia. Lisää resepti luonnoksiin sen omalta sivulta, niin
            se ilmestyy tänne odottamaan sijoittamista.
          </div>

          <div
            v-else-if="filteredDrafts.length === 0"
            class="rounded-2xl bg-fork-bg p-5 text-sm text-fork-muted"
          >
            Ei luonnoksia haulla "{{ searchQuery }}".
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="draft in filteredDrafts"
              :key="draft.id"
              draggable="true"
              class="cursor-grab overflow-hidden rounded-2xl bg-fork-bg shadow-sm ring-1 ring-fork-line active:cursor-grabbing"
              @dragstart="handleDragStart($event, draft)"
              @dragend="handleDragEnd"
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
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType, type PlannedMeal } from "~/stores/planner";

const open = defineModel<boolean>("open", { default: false });

const plannerStore = usePlannerStore();

function handleDragStart(event: DragEvent, draft: PlannedMeal) {
  if (!event.dataTransfer) {
    return;
  }

  event.dataTransfer.effectAllowed = "copyMove";
  event.dataTransfer.setData("application/json", JSON.stringify(draft));
  plannerStore.isDragging = true;
}

function handleDragEnd() {
  plannerStore.isDragging = false;
}

const panelRef = ref<HTMLElement | null>(null);
const pendingRemovalId = ref<string | null>(null);
const searchQuery = ref("");

const filteredDrafts = computed(() => {
  const drafts = plannerStore.getDrafts();
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) {
    return drafts;
  }

  return drafts.filter((draft) => draft.recipeName.toLowerCase().includes(query));
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

watch(open, (isOpen) => {
  if (!import.meta.client) {
    return;
  }

  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    nextTick(() => panelRef.value?.focus());
  } else {
    searchQuery.value = "";
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
  }
});
</script>
