export type MealDbMeal = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string;
  strYoutube: string | null;
  strSource: string | null;
  [key: string]: string | null;
};

export type MealDbFilterMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export type MealDbSearchResponse = {
  meals: (MealDbMeal | MealDbFilterMeal)[] | null;
};

export type MealDbLookupResponse = {
  meals: MealDbMeal[] | null;
};