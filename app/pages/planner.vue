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

        <button
          v-if="hasPlannedMeals"
          type="button"
          class="mt-6 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
          @click="clearWeek"
        >
          Tyhjennä viikko
        </button>
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
      <section
        v-if="hasPlannedMeals"
        class="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200"
      >
        <div
          class="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p
              class="text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
            >
              Ostoslista
            </p>

            <h2 class="mt-3 text-3xl font-black tracking-tight">
              Viikon ostokset
            </h2>
          </div>

          <p class="max-w-md text-sm leading-6 text-stone-600">
            Lista muodostetaan viikkosuunnitelmaan lisättyjen reseptien
            ainesosista.
          </p>
        </div>

        <div
          v-if="shoppingList.length === 0"
          class="mt-6 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600"
        >
          Ostoslistaa ei voitu vielä muodostaa. Lisää resepti uudelleen
          viikkoon, jotta sen ainesosat tallentuvat mukaan.
        </div>

        <ul v-else class="mt-6 grid gap-3 md:grid-cols-2">
          <li
            v-for="item in shoppingList"
            :key="item.key"
            class="flex items-start justify-between gap-4 rounded-2xl bg-stone-50 px-4 py-3"
          >
            <div>
              <p
                class="font-bold text-stone-950"
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
            />
          </li>
        </ul>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { usePlannerStore, type MealType } from "~/stores/planner";

const plannerStore = usePlannerStore();

const hasPlannedMeals = computed(() => plannerStore.plannedMeals.length > 0);

const shoppingList = computed(() => {
  const ingredientsByName = new Map<
    string,
    { key: string; name: string; measures: string[] }
  >();

  plannerStore.plannedMeals.forEach((plannedMeal) => {
    plannedMeal.ingredients?.forEach((ingredient) => {
      const key = ingredient.name.toLowerCase().trim();
      const existingIngredient = ingredientsByName.get(key);

      if (existingIngredient) {
        if (ingredient.measure) {
          existingIngredient.measures.push(ingredient.measure);
        }

        return;
      }

      ingredientsByName.set(key, {
        key,
        name: ingredient.name,
        measures: ingredient.measure ? [ingredient.measure] : [],
      });
    });
  });

  return Array.from(ingredientsByName.values()).sort((firstItem, secondItem) =>
    firstItem.name.localeCompare(secondItem.name, "fi"),
  );
});

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

function clearWeek() {
  const shouldClear = window.confirm(
    "Haluatko varmasti tyhjentää koko viikkosuunnitelman?",
  );

  if (!shouldClear) {
    return;
  }

  plannerStore.clearPlanner();
}
</script>
