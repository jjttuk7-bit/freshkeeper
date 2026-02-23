import type { IngredientCategory, StorageType } from '@/types/ingredient'
import { findFoodByPartialName, CATEGORY_TIPS, type FoodEntry } from '@/constants/food-database'

export interface FoodClassification {
  name: string
  category: IngredientCategory
  defaultStorage: StorageType
  shelfLife: { fridge: number; freezer: number; room: number }
}

/**
 * 식재료 이름으로 분류 정보를 조회한다.
 * 정확 매칭 → includes 부분 매칭 → 별칭 매칭 순서로 탐색.
 * Prisma 미사용 — 클라이언트/서버 양쪽에서 사용 가능.
 */
export function classifyFood(name: string): FoodClassification | null {
  const entry = findFoodByPartialName(name)
  if (!entry) return null
  return toClassification(entry)
}

/** 기본 보관방법 추천 */
export function getRecommendedStorage(name: string): StorageType {
  const entry = findFoodByPartialName(name)
  return entry?.defaultStorage ?? 'fridge'
}

/** 보관방법별 유통기한 일수 추천 */
export function getRecommendedShelfLife(name: string, storage: StorageType): number {
  const entry = findFoodByPartialName(name)
  if (!entry) return 7
  return entry.shelfLife[storage] ?? 7
}

/** 식재료 이름으로 보관/활용 팁 1개를 반환한다. 미매칭 시 카테고리 기본 팁. */
export function getFoodTip(name: string): string | null {
  const entry = findFoodByPartialName(name)
  if (entry && entry.tips.length > 0) {
    return entry.tips[Math.floor(Math.random() * entry.tips.length)]
  }
  // 분류 결과가 있으면 카테고리 기본 팁
  if (entry) {
    const categoryTips = CATEGORY_TIPS[entry.category]
    return categoryTips[Math.floor(Math.random() * categoryTips.length)]
  }
  return null
}

function toClassification(entry: FoodEntry): FoodClassification {
  return {
    name: entry.name,
    category: entry.category,
    defaultStorage: entry.defaultStorage,
    shelfLife: entry.shelfLife,
  }
}
