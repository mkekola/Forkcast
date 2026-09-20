---
name: run-forkcast
description: Build, run, and drive the forkcast Nuxt app. Use when asked to start forkcast, run its dev server, take a screenshot of a page (recipe detail, planner, favorites, home), or verify a UI change actually renders.
---

forkcast is a Nuxt 3 app backed by Supabase. Drive it by starting the
dev server, then running `.claude/skills/run-forkcast/driver.mjs`, a
small headless-Chromium (Playwright) script — `chromium-cli` is not
available in this environment, so this driver is the harness.

## Prerequisites

Playwright is a devDependency (`npm install` pulls it in). The Chromium
binary is downloaded separately and cached at `~/.cache/ms-playwright`
(not part of the repo):

```bash
npx playwright install chromium
```

Do **not** pass `--with-deps` — it re-execs as root via `sudo` and
fails non-interactively in this container. The plain `install chromium`
downloads a self-contained binary with no system deps needed.

## Setup

```bash
npm install
```

A local `.env` (gitignored, see `.env.example` for the two Supabase
keys it needs) must already exist — the dev server serves real data
from Supabase, not fixtures.

## Run (agent path)

Start the dev server in the background and wait for it to serve:

```bash
npm run dev > /tmp/forkcast-dev.log 2>&1 &
timeout 40 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done'
```

Drive it with the script:

```bash
node .claude/skills/run-forkcast/driver.mjs <path> <screenshot.png> [--first-recipe]
```

- `<path>` — route to load: `/` (recipe grid), `/planner`, `/favorites`,
  or a specific recipe like `/recipes/53013`.
- `<screenshot.png>` — full-page screenshot output path.
- `--first-recipe` — after loading `<path>`, click the first
  `a[href^="/recipes/"]` found on the page and screenshot the recipe
  detail page instead. **There is no `/recipes` index route** — recipe
  links only exist on pages that list them, so this is how you reach an
  arbitrary recipe detail page without knowing an id up front.

Example — verify a recipe detail page renders:

```bash
node .claude/skills/run-forkcast/driver.mjs / /tmp/recipe.png --first-recipe
```

Prints `NAVIGATED_TO <url>` and `CONSOLE_ERRORS <json>` to stdout, and
exits non-zero if any browser console error or page error was captured
— check both, not just the screenshot, since a page can render its
shell while a fetch fails silently.

Stop the server when done:

```bash
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill
```

## Run (human path)

```bash
npm run dev   # -> http://localhost:3000, Ctrl-C to stop
```

## Test

```bash
npm run lint
npm run test
```

`npm run test` prints two `[@nuxt/supabase] Missing NUXT_PUBLIC_SUPABASE_...`
warnings before the suite runs — harmless, the unit tests don't hit
Supabase. Expect 4 test files / 41 tests passing.

## Gotchas

- **`/recipes` 404s.** There is no recipes index route — only
  `/recipes/[id].vue`. The recipe grid lives on `/` (home). Use
  `--first-recipe` on the driver rather than guessing a path.
- **`npx playwright install --with-deps` fails here.** It needs `sudo`
  with a TTY for the apt step, which this container doesn't have. Skip
  `--with-deps`; the plain chromium download works standalone and the
  app itself doesn't need the extra system libs headless-shell would
  otherwise want.
- **`npm run dev &` alone doesn't make the port killable via `$!`.**
  npm doesn't forward signals to the Nuxt process it spawns. Kill by
  port (`lsof -ti:3000 ... | xargs kill`), not by the backgrounded PID.
- **Killing the port-3000 listener isn't always enough to free Nuxt's
  dev lock.** A second `npm run dev` can still fail with `Another Nuxt
  dev server is already running` naming a stale PID (it may have moved
  to port 3001 instead of dying). If that happens, `kill <PID>` from
  the error message, then retry — or set `NUXT_IGNORE_LOCK=1`.
