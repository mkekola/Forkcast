import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import RecipeModal from "~/components/RecipeModal.vue";
import { useRecipeModalStore } from "~/stores/recipeModal";

// RecipeDetailContent does its own async recipe fetch on setup - stubbed
// out here since RecipeModal's own job (show/hide, close behavior, focus)
// doesn't depend on what it renders.
const mountOptions = {
  global: {
    stubs: { teleport: true, RecipeDetailContent: true },
  },
};

describe("RecipeModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.scrollTo = vi.fn();
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    vi.spyOn(window.history, "back").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when no recipe is open", () => {
    const wrapper = mount(RecipeModal, mountOptions);

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("shows the dialog and passes the open recipe id through", () => {
    const store = useRecipeModalStore();
    store.open("53483");

    const wrapper = mount(RecipeModal, mountOptions);

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: "RecipeDetailContent" }).props("recipeId")).toBe(
      "53483",
    );
  });

  it("closes when the close button is clicked", async () => {
    const store = useRecipeModalStore();
    store.open("53483");
    const wrapper = mount(RecipeModal, mountOptions);

    await wrapper.get('[aria-label="Sulje resepti"]').trigger("click");

    expect(store.openRecipeId).toBeNull();
  });

  it("closes when the backdrop overlay is clicked", async () => {
    const store = useRecipeModalStore();
    store.open("53483");
    const wrapper = mount(RecipeModal, mountOptions);

    await wrapper.get(".bg-fork-ink\\/40").trigger("click");

    expect(store.openRecipeId).toBeNull();
  });

  it("closes on Escape", async () => {
    const store = useRecipeModalStore();
    store.open("53483");
    const wrapper = mount(RecipeModal, mountOptions);

    await wrapper.get('[role="dialog"]').trigger("keydown.esc");

    expect(store.openRecipeId).toBeNull();
  });
});
