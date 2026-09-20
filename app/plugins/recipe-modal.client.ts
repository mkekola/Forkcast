import { useRecipeModalStore } from "~/stores/recipeModal";

// Wires the recipe modal's history.pushState-based URL to actual browser
// navigation: any real route change (a NuxtLink to another page) closes the
// modal, and the back/forward buttons open or close it in step with the
// history entry recipeModalStore.open() pushed.
export default defineNuxtPlugin(() => {
  const recipeModalStore = useRecipeModalStore();
  const router = useRouter();

  router.beforeEach(() => {
    recipeModalStore.close();
  });

  window.addEventListener("popstate", (event) => {
    const state = event.state as { recipeModalId?: string } | null;

    if (state?.recipeModalId) {
      recipeModalStore.openRecipeId = state.recipeModalId;
    } else {
      recipeModalStore.close();
    }
  });
});
