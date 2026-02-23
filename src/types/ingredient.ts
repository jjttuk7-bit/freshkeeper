export type FreshnessStatus = 'fresh' | 'caution' | 'urgent' | 'expired'

export type StorageType = 'fridge' | 'freezer' | 'room'

export type IngredientCategory =
  | 'vegetable'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'grain'
  | 'sauce'
  | 'fruit'
  | 'other'

export interface Ingredient {
  id: string
  userId: string
  name: string
  category: IngredientCategory
  storageType: StorageType
  registeredAt: string
  expiryDate: string
  freshnessStatus: FreshnessStatus
  quantity: number
  unit: string
  memo: string | null
  imageUrl: string | null
  isConsumed: boolean
  isWasted: boolean
  consumedAt: string | null
  purchasePrice: number | null
  createdAt: string
  updatedAt: string
}

export interface IngredientCreateInput {
  name: string
  category: IngredientCategory
  storageType: StorageType
  expiryDate: string
  quantity?: number
  unit?: string
  memo?: string
  imageUrl?: string
  purchasePrice?: number
}

export interface IngredientUpdateInput {
  name?: string
  category?: IngredientCategory
  storageType?: StorageType
  expiryDate?: string
  freshnessStatus?: FreshnessStatus
  quantity?: number
  unit?: string
  memo?: string
}
