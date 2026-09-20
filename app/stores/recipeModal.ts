// Holds which recipe (if any) is currently shown in the popup RecipeModal,
// decoupled from Vue Router: opening pushes a history entry so the URL and
// back button behave as expected, but the underlying page never unmounts.
// See app/plugins/recipe-modal.client.ts for the popstate/navigation wiring.
export const useRecipeModalStore = defineStore("recipeModal", () => {
  const openRecipeId = ref<string | null>(null);

  // Vue Router normally saves the current scroll position into the history
  // entry's state right before it navigates away, so the back button can
  // restore it. Opening the modal navigates via a raw pushState instead (to
  // avoid actually leaving the underlying page/route), which Vue Router
  // never sees - so it never saves that scroll position, and going back
  // lands at the top instead of where the user was. Save and restore it
  // ourselves to work around that.
  let scrollYBeforeOpen: number | null = null;

  function open(recipeId: string) {
    if (openRecipeId.value === recipeId) {
      return;
    }

    if (openRecipeId.value === null && import.meta.client) {
      scrollYBeforeOpen = window.scrollY;
    }

    openRecipeId.value = recipeId;

    if (import.meta.client) {
      window.history.pushState({ recipeModalId: recipeId }, "", `/recipes/${recipeId}`);
    }
  }

  function close() {
    openRecipeId.value = null;
    restoreScroll();
  }

  function restoreScroll() {
    if (!import.meta.client || scrollYBeforeOpen === null) {
      return;
    }

    const targetScrollY = scrollYBeforeOpen;
    scrollYBeforeOpen = null;

    window.scrollTo({ top: targetScrollY, left: 0, behavior: "instant" });
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
