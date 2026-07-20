export type MealType = 'breakfast' | 'lunch' | 'dinner'

export type Ingredient = {
  name: string
  measure: string
}

export type PlannedMeal = {
  day: string
  meal: MealType
  recipeId: string
  recipeName: string
  recipeImage: string
  category: string
  ingredients?: Ingredient[]
}

type PlannerStorage = {
  plannedMeals: PlannedMeal[]
  checkedShoppingItems: string[]
}

const STORAGE_KEY = 'forkcast-planner'

export const usePlannerStore = defineStore('planner', () => {
  const plannedMeals = ref<PlannedMeal[]>([])
  const checkedShoppingItems = ref<string[]>([])

  function loadFromStorage() {
    if (!import.meta.client) {
      return
    }

    const storedPlanner = localStorage.getItem(STORAGE_KEY)

    if (!storedPlanner) {
      return
    }

    try {
      const parsedPlanner = JSON.parse(storedPlanner)

      // Backwards compatibility: old version stored only PlannedMeal[]
      if (Array.isArray(parsedPlanner)) {
        plannedMeals.value = parsedPlanner
        checkedShoppingItems.value = []
        return
      }

      const plannerStorage = parsedPlanner as PlannerStorage

      plannedMeals.value = plannerStorage.plannedMeals ?? []
      checkedShoppingItems.value = plannerStorage.checkedShoppingItems ?? []
    } catch {
      plannedMeals.value = []
      checkedShoppingItems.value = []
    }
  }

  function saveToStorage() {
    if (!import.meta.client) {
      return
    }

    const plannerStorage: PlannerStorage = {
      plannedMeals: plannedMeals.value,
      checkedShoppingItems: checkedShoppingItems.value,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(plannerStorage))
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

  function isShoppingItemChecked(itemKey: string) {
    return checkedShoppingItems.value.includes(itemKey)
  }

  function toggleShoppingItem(itemKey: string) {
    if (isShoppingItemChecked(itemKey)) {
      checkedShoppingItems.value = checkedShoppingItems.value.filter(
        (checkedItem) => checkedItem !== itemKey,
      )
    } else {
      checkedShoppingItems.value.push(itemKey)
    }

    saveToStorage()
  }

  return {
    plannedMeals,
    checkedShoppingItems,
    loadFromStorage,
    addMeal,
    removeMeal,
    getMeal,
    isShoppingItemChecked,
    toggleShoppingItem,
  }
})