'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getDaysLeft } from '@/lib/utils'
import { CATEGORIES } from '@/constants/categories'
import { FRESHNESS_CONFIG } from '@/constants/freshness'
import { STORAGE_TYPES } from '@/constants/storage-types'
import { FreshnessBadge } from './FreshnessBadge'
import type { Ingredient } from '@/types/ingredient'

interface IngredientCardProps {
  ingredient: Ingredient
  className?: string
}

export const IngredientCard = ({ ingredient, className }: IngredientCardProps) => {
  const router = useRouter()
  const daysLeft = getDaysLeft(ingredient.expiryDate)
  const category = CATEGORIES[ingredient.category]
  const storage = STORAGE_TYPES[ingredient.storageType]
  const freshnessConfig = FRESHNESS_CONFIG[ingredient.freshnessStatus]

  return (
    <button
      onClick={() => router.push(`/fridge/${ingredient.id}`)}
      className={cn(
        'group w-full flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-mint/30 active:scale-95 transition-all duration-200',
        ingredient.freshnessStatus === 'urgent' && 'border-freshness-urgent/30 bg-red-50/30',
        ingredient.freshnessStatus === 'expired' && 'opacity-60',
        className
      )}
    >
      {/* Emoji */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
          'bg-gradient-to-br from-gray-50 to-gray-100',
          freshnessConfig.color + '/10'
        )}
      >
        {category?.emoji ?? '📦'}
      </div>

      {/* Name */}
      <p className="text-[13px] font-semibold text-navy leading-tight text-center line-clamp-1 w-full">
        {ingredient.name}
      </p>

      {/* Quantity */}
      <p className="text-[11px] text-gray-400 leading-none">
        {ingredient.quantity}
        {ingredient.unit}
      </p>

      {/* D-day badge */}
      <FreshnessBadge status={ingredient.freshnessStatus} daysLeft={daysLeft} />

      {/* Storage badge */}
      <span className={cn('text-[10px] font-medium', storage.color)}>
        {storage.emoji} {storage.label}
      </span>
    </button>
  )
}
