import type { MealType } from "~/stores/planner";

// Shared by every day/meal picker in the app (the week/day planner views,
// the drafts drawer's move-to-slot form, and the recipe page's own
// add-to-plan form) so the day and meal labels can't drift between them.
export const DAYS = [
  { value: "monday", label: "Maanantai", shortLabel: "Ma" },
  { value: "tuesday", label: "Tiistai", shortLabel: "Ti" },
  { value: "wednesday", label: "Keskiviikko", shortLabel: "Ke" },
  { value: "thursday", label: "Torstai", shortLabel: "To" },
  { value: "friday", label: "Perjantai", shortLabel: "Pe" },
  { value: "saturday", label: "Lauantai", shortLabel: "La" },
  { value: "sunday", label: "Sunnuntai", shortLabel: "Su" },
];

export const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Aamupala" },
  { value: "lunch", label: "Lounas" },
  { value: "dinner", label: "Päivällinen" },
  { value: "supper", label: "Illallinen" },
];
