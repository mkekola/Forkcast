export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          title: string;
          category: string;
          area: string;
          description: string;
          image: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          title: string;
          category: string;
          area: string;
          description: string;
          image: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          title?: string;
          category?: string;
          area?: string;
          description?: string;
          image?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      planned_meals: {
        Row: {
          id: string;
          user_id: string;
          day: string | null;
          meal: string | null;
          recipe_id: string;
          recipe_name: string;
          recipe_image: string;
          category: string;
          ingredients: Json | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          day?: string | null;
          meal?: string | null;
          recipe_id: string;
          recipe_name: string;
          recipe_image: string;
          category: string;
          ingredients?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day?: string | null;
          meal?: string | null;
          recipe_id?: string;
          recipe_name?: string;
          recipe_image?: string;
          category?: string;
          ingredients?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      checked_shopping_items: {
        Row: {
          user_id: string;
          item_key: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          item_key: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          item_key?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          title: string;
          category: string;
          area: string;
          instructions: string | null;
          image: string;
          youtube: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          category: string;
          area: string;
          instructions?: string | null;
          image: string;
          youtube?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          area?: string;
          instructions?: string | null;
          image?: string;
          youtube?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          position: number;
          name: string;
          measure: string | null;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          position: number;
          name: string;
          measure?: string | null;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          position?: number;
          name?: string;
          measure?: string | null;
        };
        Relationships: [];
      };
      recipe_categories: {
        Row: {
          recipe_id: string;
          category: string;
        };
        Insert: {
          recipe_id: string;
          category: string;
        };
        Update: {
          recipe_id?: string;
          category?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_random_recipes: {
        Args: { recipe_count?: number };
        Returns: Database["public"]["Tables"]["recipes"]["Row"][];
      };
      search_recipes_by_categories: {
        Args: { categories: string[] };
        Returns: Database["public"]["Tables"]["recipes"]["Row"][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
