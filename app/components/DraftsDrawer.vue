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
        class="fixed inset-0 z-50 bg-fork-ink/40 transition-opacity"
        :class="{ 'pointer-events-none opacity-0': plannerStore.isDragging }"
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
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="removedToast"
            class="absolute inset-x-6 bottom-5 z-10 rounded-2xl bg-fork-ink px-4 py-3 text-center text-sm font-bold text-white shadow-lg"
          >
            {{ removedToast }}
          </div>
        </Transition>

        <div class="flex items-center justify-between border-b border-fork-line px-6 py-5">
          <h2 id="drafts-heading" class="text-xl font-black">Luonnokset</h2>

          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-fork-muted transition hover:bg-fork-bg hover:text-fork-ink"
            aria-label="Sulje luonnokset"
            @click="open = false"
          >
            <CloseIcon />
          </button>
        </div>

        <div class="border-b border-fork-line px-6 py-4">
          <label class="mb-2 block text-xs font-bold uppercase tracking-wide text-fork-muted">
            Lisää resepti luonnoksiin
          </label>

          <input
            v-model="recipeSearchQuery"
            type="search"
            placeholder="Hae kaikista resepteistä…"
            class="w-full rounded-full border border-fork-line bg-fork-bg px-4 py-2 text-sm outline-none placeholder:text-fork-muted focus:border-fork-ink"
          >

          <div v-if="recipeSearchQuery.trim()" class="mt-3 max-h-64 space-y-2 overflow-y-auto">
            <p v-if="isSearchingRecipes" class="text-sm text-fork-muted">
              Haetaan…
            </p>

            <p
              v-else-if="recipeSearchResults.length === 0"
              class="text-sm text-fork-muted"
            >
              Ei reseptejä haulla "{{ recipeSearchQuery }}".
            </p>

            <NuxtLink
              v-for="result in recipeSearchResults"
              v-slot="{ href }"
              :key="result.id"
              :to="`/recipes/${result.id}`"
              custom
            >
              <a
                :href="href"
                class="flex items-center gap-3 rounded-2xl bg-fork-bg p-2 transition hover:bg-fork-card"
                @click="(event) => openOnClick(event, result.id)"
              >
                <img
                  :src="result.image"
                  :alt="result.title"
                  class="h-12 w-12 shrink-0 rounded-xl object-cover"
                >

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold text-fork-ink">
                    {{ result.title }}
                  </p>

                  <p class="text-xs text-fork-muted">
                    {{ translateCategory(result.category) }}
                  </p>
                </div>

                <button
                  type="button"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition"
                  :class="
                    isRecipeDraft(result.id)
                      ? 'border-fork-clay bg-fork-clay text-white'
                      : 'border-fork-line bg-fork-card text-fork-clay hover:bg-fork-clay-soft'
                  "
                  :aria-label="
                    isRecipeDraft(result.id)
                      ? `Poista ${result.title} luonnoksista`
                      : `Lisää ${result.title} luonnoksiin`
                  "
                  @click.prevent.stop="toggleRecipeDraft(result)"
                >
                  <svg
                    v-if="isRecipeDraft(result.id)"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="h-4 w-4"
                  >
                    <path d="M6 3.75h12a.75.75 0 01.75.75v16.5l-6.75-4-6.75 4V4.5a.75.75 0 01.75-.75z" />
                  </svg>

                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                  >
                    <path d="M6 3.75h12a.75.75 0 01.75.75v16.5l-6.75-4-6.75 4V4.5a.75.75 0 01.75-.75z" />
                  </svg>
                </button>
              </a>
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="plannerStore.drafts.length > 0"
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
            v-if="plannerStore.drafts.length === 0"
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
              <NuxtLink
                v-slot="{ href }"
                :to="`/recipes/${draft.recipeId}`"
                custom
              >
              <a
                :href="href"
                data-drag-preview
                class="block"
                @click="(event) => openOnClick(event, draft.recipeId)"
              >
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
                    @click.prevent.stop="removeDraft(draft)"
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
              </a>
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
                    <ChevronDownIcon
                      class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fork-muted"
                    />
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
                    <ChevronDownIcon
                      class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fork-muted"
                    />
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
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType, type PlannedMeal } from "~/stores/planner";
import { useRecipeModal } from "~/composables/useRecipeModal";
import { useRecipesApi, type RecipeSearchResult } from "~/composables/useRecipesApi";
import { translateCategory } from "~/utils/translations";
import { setWholeCardAsDragImage } from "~/utils/dragImage";
import { DAYS as days, MEAL_OPTIONS as meals } from "~/utils/planner";

const open = defineModel<boolean>("open", { default: false });

const plannerStore = usePlannerStore();
const recipesApi = useRecipesApi();
const { openOnClick } = useRecipeModal();

function handleDragStart(event: DragEvent, draft: PlannedMeal) {
  if (!event.dataTransfer) {
    return;
  }

  event.dataTransfer.effectAllowed = "copyMove";
  event.dataTransfer.setData("application/json", JSON.stringify(draft));
  plannerStore.isDragging = true;

  const card = event.currentTarget as HTMLElement;
  const preview = card.querySelector<HTMLElement>("[data-drag-preview]") ?? card;
  setWholeCardAsDragImage(event, preview);
}

function handleDragEnd() {
  plannerStore.isDragging = false;
}

const panelRef = ref<HTMLElement | null>(null);
const searchQuery = ref("");

// Removing a draft used to ask for confirmation first; now that it doesn't,
// a brief toast makes it obvious the click actually removed something
// instead of the card just silently vanishing.
const REMOVED_TOAST_DURATION_MS = 2000;
const removedToast = ref<string | null>(null);
let removedToastTimeoutId: ReturnType<typeof setTimeout> | null = null;

function removeDraft(draft: PlannedMeal) {
  plannerStore.removeMeal(draft.id);

  if (removedToastTimeoutId !== null) {
    clearTimeout(removedToastTimeoutId);
  }

  removedToast.value = `${draft.recipeName} poistettu luonnoksista`;
  removedToastTimeoutId = setTimeout(() => {
    removedToast.value = null;
  }, REMOVED_TOAST_DURATION_MS);
}

// Searches every recipe, not just existing drafts, so a recipe can be added
// straight from here instead of having to browse to its page first.
const recipeSearchQuery = ref("");
const recipeSearchResults = ref<RecipeSearchResult[]>([]);
const isSearchingRecipes = ref(false);
const RECIPE_SEARCH_RESULT_LIMIT = 30;
let recipeSearchDebounceId: ReturnType<typeof setTimeout> | null = null;

watch(recipeSearchQuery, (query) => {
  if (recipeSearchDebounceId !== null) {
    clearTimeout(recipeSearchDebounceId);
  }

  const trimmed = query.trim();

  if (!trimmed) {
    recipeSearchResults.value = [];
    isSearchingRecipes.value = false;
    return;
  }

  isSearchingRecipes.value = true;

  recipeSearchDebounceId = setTimeout(async () => {
    try {
      const { results } = await recipesApi.searchRecipes({
        text: trimmed,
        pageSize: RECIPE_SEARCH_RESULT_LIMIT,
      });
      recipeSearchResults.value = results;
    } finally {
      isSearchingRecipes.value = false;
    }
  }, 300);
});

function isRecipeDraft(recipeId: string) {
  return plannerStore.drafts.some((draft) => draft.recipeId === recipeId);
}

async function toggleRecipeDraft(result: RecipeSearchResult) {
  const existingDraft = plannerStore.drafts.find((draft) => draft.recipeId === result.id);

  if (existingDraft) {
    plannerStore.removeMeal(existingDraft.id);
    return;
  }

  const details = await recipesApi.getRecipeById(result.id);

  plannerStore.addDraft({
    recipeId: result.id,
    recipeName: result.title,
    recipeImage: result.image,
    category: translateCategory(result.category),
    ingredients: details?.recipe_ingredients.map((ingredient) => ({
      name: ingredient.name,
      measure: ingredient.measure ?? "",
    })),
  });
}

const filteredDrafts = computed(() => {
  const drafts = plannerStore.drafts;
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) {
    return drafts;
  }

  return drafts.filter((draft) => draft.recipeName.toLowerCase().includes(query));
});

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

watch(open, (isOpen) => {
  if (!import.meta.client) {
    return;
  }

  if (isOpen) {
    nextTick(() => panelRef.value?.focus());
  } else {
    searchQuery.value = "";
    recipeSearchQuery.value = "";
    removedToast.value = null;
  }
});

// Body scroll is locked while the drawer is open, except mid-drag - the
// planner page underneath can be taller than the viewport, and locking
// scroll would make a day below the fold impossible to drag a draft to.
const shouldLockBodyScroll = computed(() => open.value && !plannerStore.isDragging);

watch(
  shouldLockBodyScroll,
  (locked) => {
    if (import.meta.client) {
      document.body.style.overflow = locked ? "hidden" : "";
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
  }

  if (removedToastTimeoutId !== null) {
    clearTimeout(removedToastTimeoutId);
  }
});
</script>
