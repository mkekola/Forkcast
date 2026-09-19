export type RecipeIngredientRow = {
  position: number;
  name: string;
  measure: string | null;
};

export type RecipeRow = {
  id: string;
  title: string;
  category: string;
  area: string;
  instructions: string | null;
  image: string;
  youtube: string | null;
  source: string | null;
};

export type RecipeSearchResult = {
  id: string;
  title: string;
  category: string;
  area: string;
  image: string;
  instructions: string | null;
  recipe_ingredients: { name: string }[];
};

export type RecipeDetail = RecipeRow & {
  recipe_ingredients: RecipeIngredientRow[];
};

export function useRecipesApi() {
  const supabase = useSupabaseClient();

  async function searchRecipes(options: {
    categories?: string[];
    area?: string | string[] | null;
    text?: string;
  }) {
    const { categories = [], area, text } = options;

    const select = "id, title, category, area, image, instructions, recipe_ingredients(name)";

    // Several selected category chips must all match the same recipe (e.g.
    // "Pasta" + "Chicken"), which recipe_categories' precomputed tags make
    // a real intersection via this RPC, rather than a title/ingredient
    // guess over just the most recently picked category.
    let query =
      categories.length > 0
        ? supabase.rpc("search_recipes_by_categories", { categories }).select(select)
        : supabase.from("recipes").select(select);

    if (Array.isArray(area)) {
      query = query.in("area", area);
    } else if (area) {
      query = query.eq("area", area);
    }

    if (text) {
      query = query.textSearch("search_vector", text, {
        type: "websearch",
        config: "english",
      });
    }

    const { data, error } = await query.order("title");

    if (error) {
      console.error("Recipe search failed", error);
      return [];
    }

    return (data ?? []) as unknown as RecipeSearchResult[];
  }

  async function getRecipeById(id: string) {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, recipe_ingredients(position, name, measure)")
      .eq("id", id)
      .order("position", { referencedTable: "recipe_ingredients" })
      .single();

    if (error) {
      console.error("Failed to load recipe", error);
      return null;
    }

    return data as unknown as RecipeDetail;
  }

  async function getRandomRecipes(count: number) {
    const { data, error } = await supabase.rpc("get_random_recipes", {
      recipe_count: count,
    });

    if (error) {
      console.error("Failed to load random recipes", error);
      return [];
    }

    return (data ?? []) as RecipeRow[];
  }

  return {
    searchRecipes,
    getRecipeById,
    getRandomRecipes,
  };
}
