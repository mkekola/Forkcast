<template>
  <main class="min-h-screen bg-stone-50 text-stone-950">
    <section class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
      <AppHeader />

      <section class="grid flex-1 items-center gap-12 py-20 md:grid-cols-2">
        <div>
          <p class="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-orange-600">
            Viikkosi, katettuna.
          </p>

          <h1 class="max-w-xl text-5xl font-black leading-tight tracking-tight md:text-6xl">
            Suunnittele viikon ruoat ennen kuin nälkä tekee päätökset.
          </h1>

          <p class="mt-6 max-w-lg text-lg leading-8 text-stone-600">
            Forkcast auttaa löytämään reseptejä, kokoamaan viikon ateriat
            ja muuttamaan suunnitelman käytännölliseksi ostoslistaksi.
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
              <p class="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
                Tänään
              </p>

              <h2 class="mt-3 text-2xl font-black">
                Sitruunainen kanapasta
              </h2>

              <p class="mt-2 text-sm leading-6 text-stone-600">
                Nopea arkiruoka, jonka voi lisätä suoraan viikon suunnitelmaan.
              </p>

              <div class="mt-5 grid gap-3">
                <div class="rounded-2xl bg-stone-100 p-4">
                  <p class="text-xs font-bold uppercase tracking-wide text-stone-500">
                    Aika
                  </p>
                  <p class="mt-1 font-bold">30 min</p>
                </div>

                <div class="rounded-2xl bg-stone-100 p-4">
                  <p class="text-xs font-bold uppercase tracking-wide text-stone-500">
                    Sopii
                  </p>
                  <p class="mt-1 font-bold">Arki-iltaan</p>
                </div>

                <div class="rounded-2xl bg-stone-950 p-4 text-white">
                  <p class="text-xs font-bold uppercase tracking-wide text-stone-300">
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
        <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.22em] text-orange-600">
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

        <div class="grid gap-6 md:grid-cols-3">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
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

const recipes = [
  {
    id: 1,
    title: 'Kasviscurry',
    category: 'Päivällinen',
    area: 'Intialainen',
    time: '35 min',
    description:
      'Lämmin ja mausteinen arkiruoka, joka pelastaa maanantain ilman suurempaa säätöä.',
    image:
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Halloumisalaatti',
    category: 'Lounas',
    area: 'Välimeri',
    time: '20 min',
    description:
      'Raikas, suolainen ja nopea lounas silloin kun haluat jotain kevyttä mutta täyttävää.',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Tomaattipasta',
    category: 'Nopea',
    area: 'Italialainen',
    time: '25 min',
    description:
      'Kun jääkaapissa ei ole paljoa, mutta nälkä on todellinen. Klassikko syystä.',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
  },
]
</script>