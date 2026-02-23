export interface ShoppingItem {
  id: string
  listId: string
  name: string
  quantity: number
  unit: string
  category: string | null
  estimatedPrice: number | null
  checked: boolean
  sourceRecipeId: string | null
  createdAt: string
}

export interface ShoppingList {
  id: string
  userId: string
  familyId: string | null
  title: string
  status: 'active' | 'completed' | 'archived'
  items: ShoppingItem[]
  createdAt: string
  updatedAt: string
}

export interface ShoppingItemCreateInput {
  name: string
  quantity?: number
  unit?: string
  category?: string
  estimatedPrice?: number
  sourceRecipeId?: string
}
