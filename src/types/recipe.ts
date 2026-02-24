export interface RecipeIngredient {
  name: string
  amount: string
  unit: string
  required: boolean
  inFridge?: boolean
}

export interface RecipeStep {
  order: number
  instruction: string
  time?: number
}

export interface RecipeNutrition {
  protein: number
  carbs: number
  fat: number
  sodium: number
}

export interface UserPreference {
  id: string
  recipeId: string
  rating: number | null
  liked: boolean
  cooked: boolean
}

export interface Recipe {
  id: string
  name: string
  description: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  cookTime: number
  prepTime: number
  servings: number
  calories: number | null
  nutrition: RecipeNutrition | null
  steps: RecipeStep[]
  ingredients: RecipeIngredient[]
  imageUrl: string | null
  tags: string[]
  source: string | null
  userPreference?: UserPreference
  createdAt: string
  updatedAt: string
}

export interface ChefMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  recipes?: Recipe[]
  timestamp: string
}
