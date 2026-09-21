import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ShoppingListDrawer from "~/components/ShoppingListDrawer.vue";
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

const mountOptions = { global: { stubs: { teleport: true } } };

async function addMealWithIngredients(plannerStore: ReturnType<typeof usePlannerStore>) {
  await plannerStore.addMeal({
    day: "monday",
    meal: "dinner",
    recipeId: "1",
    recipeName: "Kana-currypata",
    recipeImage: "https://example.com/curry.jpg",
    category: "Kana",
    ingredients: [
      { name: "Kananrinta", measure: "500 g" },
      { name: "Suola", measure: "1 tl" },
      { name: "Maito", measure: "2 dl" },
    ],
  });
}

describe("ShoppingListDrawer", () => {
  let plannerStore: ReturnType<typeof usePlannerStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    plannerStore = usePlannerStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the empty state when nothing is planned", () => {
    const wrapper = mount(ShoppingListDrawer, { props: { open: true }, ...mountOptions });

    expect(wrapper.text()).toContain("Ostoslistaa ei voitu vielä muodostaa");
  });

  it("groups items into their categories", async () => {
    await addMealWithIngredients(plannerStore);
    const wrapper = mount(ShoppingListDrawer, { props: { open: true }, ...mountOptions });

    expect(wrapper.text()).toContain("Proteiinit");
    expect(wrapper.text()).toContain("Kananrinta");
    expect(wrapper.text()).toContain("Mausteet");
    expect(wrapper.text()).toContain("Suola");
    expect(wrapper.text()).toContain("Maitotuotteet");
    expect(wrapper.text()).toContain("Maito");
  });

  it("toggles an item's checked state via its checkbox", async () => {
    await addMealWithIngredients(plannerStore);
    const wrapper = mount(ShoppingListDrawer, { props: { open: true }, ...mountOptions });

    expect(plannerStore.isShoppingItemChecked("suola")).toBe(false);

    await wrapper.get('input[type="checkbox"]').trigger("change");

    expect(plannerStore.isShoppingItemChecked("kananrinta")).toBe(true);
  });

  it("copies the formatted list to the clipboard and shows feedback that clears itself", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(navigator, "clipboard", "get").mockReturnValue({ writeText } as unknown as Clipboard);

    await addMealWithIngredients(plannerStore);
    const wrapper = mount(ShoppingListDrawer, { props: { open: true }, ...mountOptions });

    await wrapper.get('[aria-label="Kopioi ostoslista"]').trigger("click");
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());

    const copiedText = writeText.mock.calls[0][0] as string;
    expect(copiedText).toContain("Ostoslista");
    expect(copiedText).toContain("[ ] Kananrinta (500 g)");

    expect(wrapper.find('[aria-label="Kopioitu ostoslistalle"]').exists()).toBe(true);

    await vi.advanceTimersByTimeAsync(1500);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[aria-label="Kopioitu ostoslistalle"]').exists()).toBe(false);

    vi.useRealTimers();
  });
});
