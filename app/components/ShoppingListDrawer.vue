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
        @click="open = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="open"
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shopping-list-heading"
        tabindex="-1"
        class="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-fork-card shadow-2xl sm:max-w-md sm:rounded-l-[2rem]"
        @keydown.esc="open = false"
      >
        <div class="flex items-center justify-between border-b border-fork-line px-6 py-5">
          <h2 id="shopping-list-heading" class="text-xl font-black">Ostoslista</h2>

          <div class="flex items-center gap-1">
            <button
              v-if="plannerStore.shoppingList.length > 0"
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full text-fork-muted transition hover:bg-fork-bg hover:text-fork-ink"
              :aria-label="justCopied ? 'Kopioitu ostoslistalle' : 'Kopioi ostoslista'"
              :title="justCopied ? 'Kopioitu!' : 'Kopioi'"
              @click="copyList"
            >
              <svg
                v-if="justCopied"
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
                <path d="M5 12l5 5L19 7" />
              </svg>
              <svg
                v-else
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
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 012-2h10" />
              </svg>
            </button>

            <button
              v-if="plannerStore.shoppingList.length > 0"
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full text-fork-muted transition hover:bg-fork-bg hover:text-fork-ink"
              aria-label="Lataa ostoslista tiedostona"
              title="Lataa tiedostona"
              @click="downloadList"
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
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
            </button>

            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full text-fork-muted transition hover:bg-fork-bg hover:text-fork-ink"
              aria-label="Sulje ostoslista"
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
        </div>

        <span class="sr-only" role="status">{{ justCopied ? "Ostoslista kopioitu leikepöydälle" : "" }}</span>

        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div
            v-if="plannerStore.shoppingList.length === 0"
            class="rounded-2xl bg-fork-bg p-5 text-sm text-fork-muted"
          >
            Ostoslistaa ei voitu vielä muodostaa. Lisää resepti
            viikkosuunnitelmaan, jotta sen ainesosat tallentuvat mukaan.
          </div>

          <template v-else>
            <ul class="space-y-3">
              <li
                v-for="item in freshItems"
                :key="item.key"
                class="flex items-start justify-between gap-4 rounded-2xl bg-fork-bg px-4 py-3 transition-opacity"
                :class="{ 'opacity-45': plannerStore.isShoppingItemChecked(item.key) }"
              >
                <div>
                  <p
                    class="font-bold text-fork-ink"
                    :class="{ 'line-through': plannerStore.isShoppingItemChecked(item.key) }"
                  >
                    {{ item.name }}
                  </p>

                  <p class="mt-1 text-sm text-stone-500">
                    {{ item.measure }}
                  </p>
                </div>

                <input
                  type="checkbox"
                  class="mt-1 h-5 w-5 rounded border-fork-line accent-fork-green"
                  :checked="plannerStore.isShoppingItemChecked(item.key)"
                  @change="plannerStore.toggleShoppingItem(item.key)"
                >
              </li>
            </ul>

            <div v-if="pantryItems.length > 0" class="mt-6">
              <p class="text-xs font-bold uppercase tracking-wide text-fork-muted">
                Mausteet &amp; kuivatavarat
              </p>
              <p class="mt-1 text-xs text-fork-muted">
                Näitä on usein jo kaapissa — tarkista ennen kauppaan lähtöä.
              </p>

              <ul class="mt-3 space-y-3">
                <li
                  v-for="item in pantryItems"
                  :key="item.key"
                  class="flex items-start justify-between gap-4 rounded-2xl bg-fork-bg px-4 py-3 transition-opacity"
                  :class="{ 'opacity-45': plannerStore.isShoppingItemChecked(item.key) }"
                >
                  <div>
                    <p
                      class="font-bold text-fork-ink"
                      :class="{ 'line-through': plannerStore.isShoppingItemChecked(item.key) }"
                    >
                      {{ item.name }}
                    </p>

                    <p class="mt-1 text-sm text-stone-500">
                      {{ item.measure }}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    class="mt-1 h-5 w-5 rounded border-fork-line accent-fork-green"
                    :checked="plannerStore.isShoppingItemChecked(item.key)"
                    @change="plannerStore.toggleShoppingItem(item.key)"
                  >
                </li>
              </ul>
            </div>
          </template>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { usePlannerStore } from "~/stores/planner";

const open = defineModel<boolean>("open", { default: false });

const plannerStore = usePlannerStore();

const freshItems = computed(() =>
  plannerStore.shoppingList.filter((item) => !item.isPantryStaple),
);

const pantryItems = computed(() =>
  plannerStore.shoppingList.filter((item) => item.isPantryStaple),
);

const panelRef = ref<HTMLElement | null>(null);
const justCopied = ref(false);

function formatItemLine(item: { key: string; name: string; measure: string }) {
  const checkbox = plannerStore.isShoppingItemChecked(item.key) ? "[x]" : "[ ]";
  const measure = item.measure ? ` (${item.measure})` : "";

  return `${checkbox} ${item.name}${measure}`;
}

function buildListText() {
  const lines = ["Ostoslista", ""];

  freshItems.value.forEach((item) => lines.push(formatItemLine(item)));

  if (pantryItems.value.length > 0) {
    lines.push("", "Mausteet & kuivatavarat");
    pantryItems.value.forEach((item) => lines.push(formatItemLine(item)));
  }

  return lines.join("\n");
}

async function copyList() {
  try {
    await navigator.clipboard.writeText(buildListText());
    justCopied.value = true;
    setTimeout(() => {
      justCopied.value = false;
    }, 1500);
  } catch {
    // Clipboard access can fail (permissions, insecure context); nothing to recover.
  }
}

function downloadList() {
  const blob = new Blob([buildListText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "ostoslista.txt";
  link.click();

  URL.revokeObjectURL(url);
}

watch(open, (isOpen) => {
  if (!import.meta.client) {
    return;
  }

  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    nextTick(() => panelRef.value?.focus());
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
  }
});
</script>
