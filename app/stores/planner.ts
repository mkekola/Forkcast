export type MealType = 'breakfast' | 'lunch' | 'dinner'

export type PlannedMeal = {
  day: string
  meal: MealType
  recipeId: string
  recipeName: string
  recipeImage: string
  category: string
}

const STORAGE_KEY = 'forkcast-planner'

export const usePlannerStore = defineStore('planner', () => {
  const plannedMeals = ref<PlannedMeal[]>([])

  function loadFromStorage() {
    if (!import.meta.client) {
      return
    }

    const storedMeals = localStorage.getItem(STORAGE_KEY)

    if (!storedMeals) {
      return
    }

    plannedMeals.value = JSON.parse(storedMeals)
  }

  function saveToStorage() {
    if (!import.meta.client) {
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(plannedMeals.value))
  }

  function addMeal(meal: PlannedMeal) {
    plannedMeals.value = plannedMeals.value.filter(
      (plannedMeal) =>
        !(plannedMeal.day === meal.day && plannedMeal.meal === meal.meal),
    )

    plannedMeals.value.push(meal)
    saveToStorage()
  }

  function removeMeal(day: string, meal: MealType) {
    plannedMeals.value = plannedMeals.value.filter(
      (plannedMeal) =>
        !(plannedMeal.day === day && plannedMeal.meal === meal),
    )

    saveToStorage()
  }

  function getMeal(day: string, meal: MealType) {
    return plannedMeals.value.find(
      (plannedMeal) =>
        plannedMeal.day === day && plannedMeal.meal === meal,
    )
  }

  return {
    plannedMeals,
    loadFromStorage,
    addMeal,
    removeMeal,
    getMeal,
  }
})