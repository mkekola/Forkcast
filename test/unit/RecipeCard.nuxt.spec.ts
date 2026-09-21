import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import RecipeCard from "~/components/RecipeCard.vue";
import { useFavoritesStore } from "~/stores/favorites";
import { usePlannerStore } from "~/stores/planner";
import type { Recipe } from "~/types/recipe";
import type { RecipeDetail } from "~/composables/useRecipesApi";

// Same chainable-Supabase-mock pattern as planner-store.nuxt.spec.ts - these
// tests only exercise the favorite-toggle logic, so the actual network
// calls the stores fire alongside it are stubbed out.
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
  return () => ({
    from: () => createChainableSupabaseMock(),
  });
});

mockNuxtImport("useCurrentUserId", () => {
  return () => Promise.resolve("test-user-id");
});

const { getRecipeById } = vi.hoisted(() => ({ getRecipeById: vi.fn() }));

mockNuxtImport("useRecipesApi", () => {
  return () => ({ getRecipeById });
});

const recipe: Recipe = {
  id: "1",
  title: "Kana-currypata",
  category: "Kana",
  area: "Intialainen",
  description: "Tulinen ja tuoksuva currypata.",
  image: "https://example.com/curry.jpg",
};

describe("RecipeCard: favorite toggle", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders the recipe's title, category and area", () => {
    const wrapper = mount(RecipeCard, { props: { recipe } });

    expect(wrapper.text()).toContain("Kana-currypata");
    expect(wrapper.text()).toContain("Kana");
    expect(wrapper.text()).toContain("Intialainen");
  });

  it("adds the recipe to favorites without emitting favorite-removed", async () => {
    const wrapper = mount(RecipeCard, { props: { recipe } });
    const favoritesStore = useFavoritesStore();

    await wrapper.get('[aria-label="Lisää suosikkeihin"]').trigger("click");

    expect(favoritesStore.isFavorite(recipe.id)).toBe(true);
    expect(wrapper.emitted("favorite-removed")).toBeUndefined();
  });

  it("removes an already-favorited recipe and emits favorite-removed", async () => {
    const favoritesStore = useFavoritesStore();
    favoritesStore.favorites = [recipe];
    const wrapper = mount(RecipeCard, { props: { recipe } });

    await wrapper.get('[aria-label="Poista suosikeista"]').trigger("click");

    expect(favoritesStore.isFavorite(recipe.id)).toBe(false);
    expect(wrapper.emitted("favorite-removed")).toEqual([[recipe]]);
  });
});

describe("RecipeCard: draft toggle", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getRecipeById.mockReset();
  });

  it("fetches the recipe's ingredients and adds it as a draft", async () => {
    getRecipeById.mockResolvedValue({
      recipe_ingredients: [
        { position: 1, name: "Kananrinta", measure: "500 g" },
        { position: 2, name: "Curryjauhe", measure: "2 tl" },
      ],
    } as unknown as RecipeDetail);

    const plannerStore = usePlannerStore();
    const wrapper = mount(RecipeCard, { props: { recipe } });

    await wrapper.get('[aria-label="Lisää luonnoksiin"]').trigger("click");
    await flushPromises();

    expect(getRecipeById).toHaveBeenCalledWith(recipe.id);
    expect(plannerStore.drafts).toHaveLength(1);
    expect(plannerStore.drafts[0]).toMatchObject({
      recipeId: recipe.id,
      recipeName: recipe.title,
      ingredients: [
        { name: "Kananrinta", measure: "500 g" },
        { name: "Curryjauhe", measure: "2 tl" },
      ],
    });
  });

  it("removes an existing draft without re-fetching the recipe", async () => {
    const plannerStore = usePlannerStore();
    await plannerStore.addDraft({
      recipeId: recipe.id,
      recipeName: recipe.title,
      recipeImage: recipe.image,
      category: recipe.category,
    });

    const wrapper = mount(RecipeCard, { props: { recipe } });

    await wrapper.get('[aria-label="Lisätty luonnoksiin"]').trigger("click");
    await flushPromises();

    expect(plannerStore.drafts).toHaveLength(0);
    expect(getRecipeById).not.toHaveBeenCalled();
  });
});
