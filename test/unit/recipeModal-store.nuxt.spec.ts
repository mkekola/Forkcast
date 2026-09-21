import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useRecipeModalStore } from "~/stores/recipeModal";

describe("recipeModal store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.scrollTo = vi.fn();
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    vi.spyOn(window.history, "back").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens a recipe and pushes a history entry for it", () => {
    const store = useRecipeModalStore();

    store.open("53483");

    expect(store.openRecipeId).toBe("53483");
    expect(window.history.pushState).toHaveBeenCalledWith(
      { recipeModalId: "53483" },
      "",
      "/recipes/53483",
    );
  });

  it("does nothing when opening the recipe that's already open", () => {
    const store = useRecipeModalStore();
    store.open("53483");
    vi.mocked(window.history.pushState).mockClear();

    store.open("53483");

    expect(window.history.pushState).not.toHaveBeenCalled();
  });

  it("switches directly to a different recipe without losing the saved scroll position", () => {
    const store = useRecipeModalStore();
    window.scrollY = 400;

    store.open("53483");
    store.open("53527");
    store.close();

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 400, left: 0, behavior: "instant" });
  });

  it("closes and restores the scroll position from before it opened", () => {
    const store = useRecipeModalStore();
    window.scrollY = 250;

    store.open("53483");
    store.close();

    expect(store.openRecipeId).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 250, left: 0, behavior: "instant" });
  });

  it("closeAndGoBack navigates back through history when it opened one", () => {
    const store = useRecipeModalStore();
    store.open("53483");
    vi.spyOn(window.history, "state", "get").mockReturnValue({ recipeModalId: "53483" });

    store.closeAndGoBack();

    expect(window.history.back).toHaveBeenCalled();
  });

  it("closeAndGoBack just closes when there's no modal history entry to go back to", () => {
    const store = useRecipeModalStore();
    store.open("53483");
    vi.spyOn(window.history, "state", "get").mockReturnValue(null);

    store.closeAndGoBack();

    expect(window.history.back).not.toHaveBeenCalled();
    expect(store.openRecipeId).toBeNull();
  });

  it("closeAndGoBack does nothing when nothing is open", () => {
    const store = useRecipeModalStore();

    store.closeAndGoBack();

    expect(window.history.back).not.toHaveBeenCalled();
  });
});
