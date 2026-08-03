# Forkcast

**Forkcast — Viikkosi, katettuna.**

Forkcast on viikkosuunnitteluun tarkoitettu resepti- ja ateriasuunnittelusovellus. Sovelluksessa voi hakea reseptejä, tallentaa suosikkeja, suunnitella viikon ateriat ja muodostaa ostoslistan suunniteltujen reseptien aineksista.

**[Kokeile sovellusta täällä →](https://forkcast.kekola.fi)**

## Kuvakaappaukset

| Etusivu | Reseptin tiedot | Viikkosuunnitelma |
| --- | --- | --- |
| <img src="docs/screenshots/forkcast-fp.png" width="400"> | <img src="docs/screenshots/forkcast-recipe.png" width="380"> | <img src="docs/screenshots/forkcast-planner.png" width="360"> |

## Ominaisuudet

- Reseptien haku TheMealDB-rajapinnasta
- Suomenkieliset hakusanat ja pikahaut
- Reseptien kategorioiden ja alueiden käännökset suomeksi
- Reseptin tarkempi näkymä aineksilla ja valmistusohjeilla
- Reseptien tallentaminen suosikkeihin
- Reseptien lisääminen viikkosuunnitelmaan
- Useamman reseptin lisääminen samaan ateriaslottiin
- Ostoslistan muodostaminen suunnitelluista resepteistä
- Ostoslistan tuotteiden merkitseminen tehdyksi
- Suosikkien, viikkosuunnitelman ja ostoslistan tilan tallennus selaimen localStorageen
- Satunnainen resepti inspiraatiokortista

## Teknologiat

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia
- TheMealDB API
- Vitest
- ESLint

## Arkkitehtuuri

Koodi on jaoteltu vastuualueittain, jotta sivut pysyvät kevyinä ja logiikka on testattavissa erillään käyttöliittymästä:

- `app/composables/` — `useMealDbApi` kokoaa kaiken TheMealDB-rajapinnan tuntemisen yhteen paikkaan, jotta sivut eivät rakenna API-osoitteita itse
- `app/types/` — jaetut TypeScript-tyypit sekä rajapinnan datalle (`mealdb.ts`) että sovelluksen omalle näyttömallille (`recipe.ts`)
- `app/stores/` — Pinia-storet (`favorites`, `planner`), jotka sisältävät myös niistä johdetun tilan, kuten ostoslistan kokoamisen
- `test/` — Vitest-testit puhtaalle logiikalle (käännökset, ostoslistan koostaminen)

## Käyttöönotto

Asenna riippuvuudet:

```bash
npm install
```

Käynnistä kehityspalvelin:

```bash
npm run dev
```

Sovellus on nyt käytettävissä osoitteessa `http://localhost:3000`.

### Testaus ja koodin laatu

```bash
npm run lint    # ESLint
npm run test    # Vitest
```

### Rajapinta

Reseptidata haetaan [TheMealDB](https://www.themealdb.com/api.php) -rajapinnasta.