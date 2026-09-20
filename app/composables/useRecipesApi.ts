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
    page?: number;
    pageSize?: number;
  }) {
    const { categories = [], area, text, page = 1, pageSize = 24 } = options;

    const select = "id, title, category, area, image, instructions, recipe_ingredients(name)";

    // Several selected category chips must all match the same recipe (e.g.
    // "Pasta" + "Chicken"), which recipe_categories' precomputed tags make
    // a real intersection via this RPC, rather than a title/ingredient
    // guess over just the most recently picked category.
    //
    // The exact-count request has to go through rpc()'s own third argument:
    // .rpc(fn, args).select(cols, { count }) silently drops the count
    // option, since that overload of .select() only exists on the plain
    // .from(table).select() builder, not the one .rpc() returns.
    let query =
      categories.length > 0
        ? supabase
            .rpc("search_recipes_by_categories", { categories }, { count: "exact" })
            .select(select)
        : supabase.from("recipes").select(select, { count: "exact" });

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

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.order("title").range(from, to);

    if (error) {
      console.error("Recipe search failed", error);
      return { results: [] as RecipeSearchResult[], totalCount: 0 };
    }

    return {
      results: (data ?? []) as unknown as RecipeSearchResult[],
      totalCount: count ?? 0,
    };
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
