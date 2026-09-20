import { useRecipeModalStore } from "~/stores/recipeModal";

// Recipe links stay real <NuxtLink>s (crawlable, right-click "open in new
// tab", ctrl/cmd-click still works) - a plain left-click is the only case
// intercepted to open the popup instead of navigating.
export function useRecipeModal() {
  const store = useRecipeModalStore();

  function openOnClick(event: MouseEvent, recipeId: string) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    store.open(recipeId);
  }

  return {
    open: store.open,
    openOnClick,
    close: store.close,
    closeAndGoBack: store.closeAndGoBack,
  };
}
