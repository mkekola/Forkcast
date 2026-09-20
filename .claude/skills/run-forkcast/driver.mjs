#!/usr/bin/env node
// Headless-Chromium driver for forkcast. Playwright is a devDependency
// (see SKILL.md Setup) - this script is the harness for driving the
// running dev server, since chromium-cli is not available in this
// environment.
//
// Usage:
//   node .claude/skills/run-forkcast/driver.mjs <path> <screenshot.png> [--first-recipe]
//
//   <path>            route to load, e.g. "/", "/planner", "/favorites",
//                     "/recipes/53013". Relative to BASE_URL (default
//                     http://localhost:3000).
//   <screenshot.png>  where to save the full-page screenshot.
//   --first-recipe    after loading <path>, click the first
//                     `a[href^="/recipes/"]` link found on the page and
//                     screenshot the resulting recipe detail page instead
//                     (there's no /recipes index route - recipe links only
//                     exist on pages like "/" that list them).
//
// Prints "NAVIGATED_TO <url>" and "CONSOLE_ERRORS <json>" to stdout.
// Exits non-zero if any console error or page error was captured.

import { chromium } from "playwright";

const [, , routeArg, screenshotArg, ...rest] = process.argv;

if (!routeArg || !screenshotArg) {
  console.error(
    "usage: node driver.mjs <path> <screenshot.png> [--first-recipe]",
  );
  process.exit(1);
}

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const wantFirstRecipe = rest.includes("--first-recipe");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

await page.goto(`${baseUrl}${routeArg}`, { waitUntil: "networkidle" });

if (wantFirstRecipe) {
  const link = await page.waitForSelector('a[href^="/recipes/"]', {
    timeout: 15000,
  });
  const href = await link.getAttribute("href");
  await page.goto(`${baseUrl}${href}`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 15000 });
}

await page.waitForTimeout(500);
await page.screenshot({ path: screenshotArg, fullPage: true });

console.log(`NAVIGATED_TO ${page.url()}`);
console.log(`CONSOLE_ERRORS ${JSON.stringify(consoleErrors)}`);

await browser.close();

process.exit(consoleErrors.length > 0 ? 1 : 0);
