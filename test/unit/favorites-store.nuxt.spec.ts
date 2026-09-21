import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useFavoritesStore } from "~/stores/favorites";
import type { Recipe } from "~/types/recipe";

const { fromSpy } = vi.hoisted(() => ({ fromSpy: vi.fn() }));

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
    from: (...args: unknown[]) => {
      fromSpy(...args);
      return createChainableSupabaseMock();
    },
  });
});

mockNuxtImport("useCurrentUserId", () => {
  return () => Promise.resolve("test-user-id");
});

const recipe: Recipe = {
  id: "1",
  title: "Kana-currypata",
  category: "Kana",
  area: "Intialainen",
  description: "Tulinen ja tuoksuva currypata.",
  image: "https://example.com/curry.jpg",
};

describe("favorites store", () => {
  let favoritesStore: ReturnType<typeof useFavoritesStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    favoritesStore = useFavoritesStore();
    fromSpy.mockClear();
  });

  it("reports a recipe as not favorited when the list is empty", () => {
    expect(favoritesStore.isFavorite(recipe.id)).toBe(false);
  });

  it("adds a recipe that isn't favorited yet", async () => {
    await favoritesStore.toggleFavorite(recipe);

    expect(favoritesStore.isFavorite(recipe.id)).toBe(true);
    expect(favoritesStore.favorites).toEqual([recipe]);
  });

  it("removes a recipe that's already favorited", async () => {
    favoritesStore.favorites = [recipe];

    await favoritesStore.toggleFavorite(recipe);

    expect(favoritesStore.isFavorite(recipe.id)).toBe(false);
    expect(favoritesStore.favorites).toEqual([]);
  });

  it("only fetches once when loadFavorites is called multiple times concurrently", async () => {
    await Promise.all([
      favoritesStore.loadFavorites(),
      favoritesStore.loadFavorites(),
      favoritesStore.loadFavorites(),
    ]);

    expect(fromSpy).toHaveBeenCalledTimes(1);
  });
});
