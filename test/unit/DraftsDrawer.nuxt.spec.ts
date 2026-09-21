import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import DraftsDrawer from "~/components/DraftsDrawer.vue";
import { usePlannerStore } from "~/stores/planner";

function createChainableSupabaseMock(): unknown {
  return new Proxy(() => undefined, {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (value: { data: unknown[]; error: null }) => void) =>
          resolve({ data: [], error: null });
      }

      return () => createChainableSupabaseMock();
    },
    apply() {
      return createChainableSupabaseMock();
    },
  });
}

mockNuxtImport("useSupabaseClient", () => {
  return () => ({ from: () => createChainableSupabaseMock() });
});

mockNuxtImport("useCurrentUserId", () => {
  return () => Promise.resolve("test-user-id");
});

// DraftsDrawer calls useRecipesApi() unconditionally on setup for its
// "search all recipes" box, even though these tests never type into it.
mockNuxtImport("useRecipesApi", () => {
  return () => ({
    searchRecipes: vi.fn().mockResolvedValue({ results: [], totalCount: 0 }),
    getRecipeById: vi.fn(),
    getRandomRecipes: vi.fn(),
  });
});

// Teleport's real target (document.body) is outside the mounted wrapper's
// tree, so it's stubbed to keep the drawer's content queryable via wrapper.
const mountOptions = { global: { stubs: { teleport: true } } };

async function addDraft(plannerStore: ReturnType<typeof usePlannerStore>, recipeName: string) {
  await plannerStore.addDraft({
    recipeId: recipeName,
    recipeName,
    recipeImage: `https://example.com/${recipeName}.jpg`,
    category: "Kana",
    ingredients: [],
  });
}

describe("DraftsDrawer", () => {
  let plannerStore: ReturnType<typeof usePlannerStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    plannerStore = usePlannerStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the empty state when there are no drafts", () => {
    const wrapper = mount(DraftsDrawer, { props: { open: true }, ...mountOptions });

    expect(wrapper.text()).toContain("Ei luonnoksia");
  });

  it("filters drafts by the search box", async () => {
    await addDraft(plannerStore, "Kana-currypata");
    await addDraft(plannerStore, "Lohikeitto");

    const wrapper = mount(DraftsDrawer, { props: { open: true }, ...mountOptions });
    await wrapper.get('input[placeholder="Hae luonnoksista…"]').setValue("lohi");

    expect(wrapper.text()).toContain("Lohikeitto");
    expect(wrapper.text()).not.toContain("Kana-currypata");
  });

  it("removes a draft and shows a toast that clears itself", async () => {
    vi.useFakeTimers();
    await addDraft(plannerStore, "Kana-currypata");

    const wrapper = mount(DraftsDrawer, { props: { open: true }, ...mountOptions });
    await wrapper.get('[aria-label="Poista Kana-currypata luonnoksista"]').trigger("click");

    expect(plannerStore.drafts).toHaveLength(0);
    expect(wrapper.text()).toContain("Kana-currypata poistettu luonnoksista");

    await vi.advanceTimersByTimeAsync(2000);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain("poistettu luonnoksista");
  });

  it("assigns a draft to the default day and meal when placed on the week", async () => {
    await addDraft(plannerStore, "Kana-currypata");

    const wrapper = mount(DraftsDrawer, { props: { open: true }, ...mountOptions });
    const assignButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Sijoita viikkoon");
    await assignButton?.trigger("click");

    expect(plannerStore.drafts).toHaveLength(0);
    expect(plannerStore.getMeals("monday", "dinner").map((item) => item.recipeName)).toEqual([
      "Kana-currypata",
    ]);
  });
});
