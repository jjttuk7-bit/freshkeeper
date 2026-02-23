'use client'

import { Clock, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  onClick?: () => void
  className?: string
}

const DIFFICULTY_CONFIG = {
  easy: { label: '쉬움', className: 'bg-freshness-fresh/10 text-freshness-fresh border-freshness-fresh/20' },
  medium: { label: '보통', className: 'bg-freshness-caution/10 text-freshness-caution border-freshness-caution/20' },
  hard: { label: '어려움', className: 'bg-freshness-urgent/10 text-freshness-urgent border-freshness-urgent/20' },
}

export const RecipeCard = ({ recipe, onClick, className }: RecipeCardProps) => {
  const difficulty = DIFFICULTY_CONFIG[recipe.difficulty]
  const inFridgeCount = recipe.ingredients.filter((i) => i.inFridge).length
  const totalCount = recipe.ingredients.length

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-mint/30 active:scale-[0.98] transition-all group',
        className
      )}
    >
      {/* Emoji placeholder or image */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-mint/10 to-mint/20 flex items-center justify-center text-2xl">
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          '🍳'
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + difficulty */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-navy text-sm truncate">{recipe.name}</h3>
          <span
            className={cn(
              'flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
              difficulty.className
            )}
          >
            {difficulty.label}
          </span>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-2">{recipe.description}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />
            {recipe.cookTime}분
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Users size={11} />
            {recipe.servings}인분
          </span>
          {totalCount > 0 && (
            <span
              className={cn(
                'text-xs font-medium',
                inFridgeCount === totalCount ? 'text-freshness-fresh' : 'text-gray-400'
              )}
            >
              냉장고 {inFridgeCount}/{totalCount}
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        size={16}
        className="flex-shrink-0 text-gray-300 group-hover:text-mint transition-colors"
      />
    </button>
  )
}
