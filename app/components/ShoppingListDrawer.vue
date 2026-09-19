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

        <div
          v-if="plannerStore.shoppingList.length > 0"
          class="flex items-center gap-2 border-b border-fork-line px-6 py-3"
        >
          <button
            type="button"
            class="rounded-full border border-fork-line px-4 py-2 text-xs font-bold text-fork-ink transition hover:border-fork-ink"
            @click="copyList"
          >
            {{ copyLabel }}
          </button>

          <button
            type="button"
            class="rounded-full border border-fork-line px-4 py-2 text-xs font-bold text-fork-ink transition hover:border-fork-ink"
            @click="downloadList"
          >
            Lataa tiedostona
          </button>
        </div>

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
const copyLabel = ref("Kopioi");

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
    copyLabel.value = "Kopioitu!";
    setTimeout(() => {
      copyLabel.value = "Kopioi";
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
