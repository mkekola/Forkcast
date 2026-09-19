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
    baseCategory?: string | null;
    narrowingCategories?: string[];
    area?: string | string[] | null;
    text?: string;
  }) {
    const { baseCategory, narrowingCategories = [], area, text } = options;

    let query = supabase
      .from("recipes")
      .select("id, title, category, area, image, instructions, recipe_ingredients(name)");

    if (baseCategory) {
      query = query.eq("category", baseCategory);
    }

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

    let results = (data ?? []) as unknown as RecipeSearchResult[];

    for (const category of narrowingCategories) {
      const keyword = category.toLowerCase();

      results = results.filter((recipe) =>
        recipe.recipe_ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(keyword),
        ),
      );
    }

    return results;
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
