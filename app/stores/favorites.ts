export type FavoriteRecipe = {
  id: string;
  title: string;
  category: string;
  area: string;
  time: string;
  description: string;
  image: string;
};

const STORAGE_KEY = "forkcast-favorites";

export const useFavoritesStore = defineStore("favorites", () => {
  const favorites = ref<FavoriteRecipe[]>([]);

  function loadFromStorage() {
    if (!import.meta.client) {
      return;
    }

    const storedFavorites = localStorage.getItem(STORAGE_KEY);

    if (!storedFavorites) {
      return;
    }

    try {
      favorites.value = JSON.parse(storedFavorites);
    } catch {
      favorites.value = [];
    }
  }

  function saveToStorage() {
    if (!import.meta.client) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value));
  }

  function isFavorite(recipeId: string) {
    return favorites.value.some((recipe) => recipe.id === recipeId);
  }

  function toggleFavorite(recipe: FavoriteRecipe) {
    if (isFavorite(recipe.id)) {
      favorites.value = favorites.value.filter(
        (favorite) => favorite.id !== recipe.id,
      );
    } else {
      favorites.value.push(recipe);
    }

    saveToStorage();
  }

  return {
    favorites,
    loadFromStorage,
    isFavorite,
    toggleFavorite,
  };
});
