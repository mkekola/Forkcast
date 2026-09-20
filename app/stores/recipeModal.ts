// Holds which recipe (if any) is currently shown in the popup RecipeModal,
// decoupled from Vue Router: opening pushes a history entry so the URL and
// back button behave as expected, but the underlying page never unmounts.
// See app/plugins/recipe-modal.client.ts for the popstate/navigation wiring.
export const useRecipeModalStore = defineStore("recipeModal", () => {
  const openRecipeId = ref<string | null>(null);

  function open(recipeId: string) {
    if (openRecipeId.value === recipeId) {
      return;
    }

    openRecipeId.value = recipeId;

    if (import.meta.client) {
      window.history.pushState({ recipeModalId: recipeId }, "", `/recipes/${recipeId}`);
    }
  }

  function close() {
    openRecipeId.value = null;
  }

  // Used by the modal's own close button/backdrop click, as opposed to the
  // browser's back button (which is handled by the popstate listener).
  function closeAndGoBack() {
    if (openRecipeId.value === null) {
      return;
    }

    if (import.meta.client && window.history.state?.recipeModalId) {
      window.history.back();
    } else {
      close();
    }
  }

  return { openRecipeId, open, close, closeAndGoBack };
});
