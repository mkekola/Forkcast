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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
