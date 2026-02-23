'use client'

import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/constants/categories'
import { useFridgeStore } from '@/stores/fridgeStore'
import type { IngredientCategory } from '@/types/ingredient'

type CategoryFilterValue = IngredientCategory | 'all'

const ALL_OPTION = { value: 'all' as const, label: '전체', emoji: '🍽️' }

export const CategoryFilter = () => {
  const { categoryFilter, setCategoryFilter } = useFridgeStore()

  const options = [
    ALL_OPTION,
    ...Object.entries(CATEGORIES).map(([key, val]) => ({
      value: key as IngredientCategory,
      label: val.label,
      emoji: val.emoji,
    })),
  ]

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
      {options.map(({ value, label, emoji }) => {
        const isActive = categoryFilter === value
        return (
          <button
            key={value}
            onClick={() => setCategoryFilter(value as CategoryFilterValue)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              isActive
                ? 'bg-mint text-white border-mint'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            )}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
