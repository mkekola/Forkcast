<template>
  <main class="min-h-screen bg-stone-50 text-stone-950">
    <section class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
      <AppHeader />

      <section class="grid flex-1 items-center gap-12 py-20 md:grid-cols-2">
        <div>
          <p
            class="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
          >
            Viikkosi, katettuna.
          </p>

          <h1
            class="max-w-xl text-5xl font-black leading-tight tracking-tight md:text-6xl"
          >
            Suunnittele viikon ruoat ennen kuin nälkä tekee päätökset.
          </h1>

          <p class="mt-6 max-w-lg text-lg leading-8 text-stone-600">
            Forkcast auttaa löytämään reseptejä, kokoamaan viikon ateriat ja
            muuttamaan suunnitelman käytännölliseksi ostoslistaksi.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink
              to="#reseptit"
              class="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
            >
              Selaa reseptejä
            </NuxtLink>

            <NuxtLink
              to="/planner"
              class="rounded-full border border-stone-300 px-6 py-3 text-sm font-bold transition hover:border-stone-950"
            >
              Avaa viikkosuunnitelma
            </NuxtLink>
          </div>
        </div>

        <div class="rounded-[2rem] bg-white p-4 shadow-xl shadow-stone-200">
          <div class="rounded-[1.5rem] bg-orange-100 p-5">
            <div class="rounded-[1.25rem] bg-white p-5 shadow-sm">
              <p
                class="text-sm font-bold uppercase tracking-[0.18em] text-orange-600"
              >
                Tänään
              </p>

              <h2 class="mt-3 text-2xl font-black">Sitruunainen kanapasta</h2>

              <p class="mt-2 text-sm leading-6 text-stone-600">
                Nopea arkiruoka, jonka voi lisätä suoraan viikon suunnitelmaan.
              </p>

              <div class="mt-5 grid gap-3">
                <div class="rounded-2xl bg-stone-100 p-4">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-500"
                  >
                    Aika
                  </p>
                  <p class="mt-1 font-bold">30 min</p>
                </div>

                <div class="rounded-2xl bg-stone-100 p-4">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-500"
                  >
                    Sopii
                  </p>
                  <p class="mt-1 font-bold">Arki-iltaan</p>
                </div>

                <div class="rounded-2xl bg-stone-950 p-4 text-white">
                  <p
                    class="text-xs font-bold uppercase tracking-wide text-stone-300"
                  >
                    Forkcast sanoo
                  </p>
                  <p class="mt-1 font-bold">Lisää tiistain päivälliseksi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reseptit" class="pb-20">
        <div class="mb-8 flex max-w-xl gap-3">
          <input
            v-model="searchInput"
            type="search"
            placeholder="Hae reseptejä, esim. pasta, chicken, curry..."
            class="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium outline-none transition placeholder:text-stone-400 focus:border-stone-950"
            @keyup.enter="searchRecipes"
          />

          <button
            type="button"
            class="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
            @click="searchRecipes"
          >
            Hae
          </button>
        </div>
        <div
          class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p
              class="text-sm font-bold uppercase tracking-[0.22em] text-orange-600"
            >
              Reseptit
            </p>

            <h2 class="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Mitä tänään tekisi mieli?
            </h2>
          </div>

          <p class="max-w-md text-sm leading-6 text-stone-600">
            Aloitetaan muutamalla esimerkkireseptillä. Seuraavaksi vaihdetaan
            nämä oikeaan TheMealDB-dataan.
          </p>
        </div>

        <div v-if="pending" class="grid gap-6 md:grid-cols-3">
          <div
            v-for="item in 6"
            :key="item"
            class="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-stone-200"
          />
        </div>

        <div
          v-else-if="error"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
          Reseptien haku epäonnistui. Kokeile hetken päästä uudelleen.
        </div>

        <div
          v-else-if="recipes.length === 0"
          class="rounded-3xl border border-stone-200 bg-white p-8 text-stone-600"
        >
          Ei reseptejä hakusanalla “{{ searchQuery }}”. Kokeile esimerkiksi hakua
          <strong>pasta</strong>, <strong>chicken</strong> tai
          <strong>beef</strong>.
        </div>

        <div v-else class="grid gap-6 md:grid-cols-3">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :id="recipe.id"
            :title="recipe.title"
            :category="recipe.category"
            :area="recipe.area"
            :time="recipe.time"
            :description="recipe.description"
            :image="recipe.image"
          />
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import RecipeCard from "~/components/RecipeCard.vue";

type MealDbMeal = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string;
};

const searchInput = ref("");
const searchTerm = ref("");

const searchQuery = computed(() => searchTerm.value.trim());

const { data, pending, error } = await useFetch<{ meals: MealDbMeal[] | null }>(
  () =>
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery.value}`,
  {
    watch: [searchQuery],
  },
);

function searchRecipes() {
  searchTerm.value = searchInput.value;
}

const recipes = computed(() => {
  return (data.value?.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory ?? "Resepti",
    area: meal.strArea ?? "Tuntematon",
    time: "30–45 min",
    description: meal.strInstructions
      ? `${meal.strInstructions.slice(0, 120)}...`
      : "Herkullinen resepti viikon suunnitteluun.",
    image: meal.strMealThumb,
  }));
});
</script>
