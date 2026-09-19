import type { Recipe } from "~/types/recipe";

export type FavoriteRecipe = Recipe;

type FavoriteRow = {
  recipe_id: string;
  title: string;
  category: string;
  area: string;
  description: string;
  image: string;
};

export const useFavoritesStore = defineStore("favorites", () => {
  const favorites = ref<FavoriteRecipe[]>([]);

  async function loadFavorites() {
    if (!import.meta.client) {
      return;
    }

    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    const { data, error } = await supabase
      .from("favorites")
      .select("recipe_id, title, category, area, description, image")
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to load favorites", error);
      return;
    }

    favorites.value = (data as FavoriteRow[]).map((row) => ({
      id: row.recipe_id,
      title: row.title,
      category: row.category,
      area: row.area,
      description: row.description,
      image: row.image,
    }));
  }

  function isFavorite(recipeId: string) {
    return favorites.value.some((recipe) => recipe.id === recipeId);
  }

  async function toggleFavorite(recipe: FavoriteRecipe) {
    const supabase = useSupabaseClient();
    const userId = await useCurrentUserId();

    if (isFavorite(recipe.id)) {
      favorites.value = favorites.value.filter(
        (favorite) => favorite.id !== recipe.id,
      );

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", recipe.id);

      if (error) {
        console.error("Failed to remove favorite", error);
      }

      return;
    }

    favorites.value.push(recipe);

    const { error } = await supabase.from("favorites").insert({
      user_id: userId,
      recipe_id: recipe.id,
      title: recipe.title,
      category: recipe.category,
      area: recipe.area,
      description: recipe.description,
      image: recipe.image,
    });

    if (error) {
      console.error("Failed to add favorite", error);
    }
  }

  return {
    favorites,
    loadFavorites,
    isFavorite,
    toggleFavorite,
  };
});
