import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useRecipeModal } from "~/composables/useRecipeModal";
import { useRecipeModalStore } from "~/stores/recipeModal";

function createClickEvent(overrides: Partial<MouseEvent> = {}) {
  return {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as MouseEvent;
}

describe("useRecipeModal: openOnClick", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("opens the modal and prevents navigation on a plain left click", () => {
    const { openOnClick } = useRecipeModal();
    const store = useRecipeModalStore();
    const event = createClickEvent();

    openOnClick(event, "53483");

    expect(event.preventDefault).toHaveBeenCalled();
    expect(store.openRecipeId).toBe("53483");
  });

  it("lets a middle/right click through instead of opening the modal", () => {
    const { openOnClick } = useRecipeModal();
    const store = useRecipeModalStore();
    const event = createClickEvent({ button: 1 });

    openOnClick(event, "53483");

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(store.openRecipeId).toBeNull();
  });

  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"] as const)(
    "lets a click with %s held through instead of opening the modal",
    (modifier) => {
      const { openOnClick } = useRecipeModal();
      const store = useRecipeModalStore();
      const event = createClickEvent({ [modifier]: true });

      openOnClick(event, "53483");

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(store.openRecipeId).toBeNull();
    },
  );

  it("does nothing if the click's default action was already prevented", () => {
    const { openOnClick } = useRecipeModal();
    const store = useRecipeModalStore();
    const event = createClickEvent({ defaultPrevented: true });

    openOnClick(event, "53483");

    expect(store.openRecipeId).toBeNull();
  });
});
