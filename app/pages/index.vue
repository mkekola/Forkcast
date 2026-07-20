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
        <p class="text-sm font-bold uppercase tracking-[0.22em] text-orange-600">
          Reseptit
        </p>

        <h2 class="mt-3 text-3xl font-black tracking-tight">
          Pian oikealla reseptidatalla
        </h2>
      </section>
    </section>
  </main>
</template>