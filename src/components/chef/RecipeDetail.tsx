'use client'

import { Clock, Users, Flame, CheckCircle2, Circle, ShoppingCart, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Recipe, RecipeIngredient } from '@/types/recipe'

interface RecipeDetailProps {
  recipe: Recipe
  onAddToShopping?: (ingredient: RecipeIngredient) => void
  onStartCooking?: () => void
  className?: string
}

const DIFFICULTY_LABELS = { easy: '쉬움', medium: '보통', hard: '어려움' }

const DIFFICULTY_COLORS = {
  easy: 'text-freshness-fresh bg-freshness-fresh/10',
  medium: 'text-freshness-caution bg-freshness-caution/10',
  hard: 'text-freshness-urgent bg-freshness-urgent/10',
}

export const RecipeDetail = ({
  recipe,
  onAddToShopping,
  onStartCooking,
  className,
}: RecipeDetailProps) => {
  const inFridgeIngredients = recipe.ingredients.filter((i) => i.inFridge)
  const missingIngredients = recipe.ingredients.filter((i) => !i.inFridge && i.required)

  return (
    <div className={cn('flex flex-col gap-0', className)}>
      {/* Hero */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-mint/20 to-mint/5 flex items-center justify-center text-6xl">
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          '🍳'
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                DIFFICULTY_COLORS[recipe.difficulty]
              )}
            >
              {DIFFICULTY_LABELS[recipe.difficulty]}
            </span>
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-white">{recipe.name}</h1>
          {recipe.description && (
            <p className="text-sm text-white/80 mt-1">{recipe.description}</p>
          )}
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Clock, label: '조리', value: `${recipe.cookTime}분` },
            { icon: Clock, label: '준비', value: `${recipe.prepTime}분` },
            { icon: Users, label: '인분', value: `${recipe.servings}인` },
            { icon: Flame, label: '칼로리', value: recipe.calories ? `${recipe.calories}kcal` : '-' },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl"
            >
              <Icon size={16} className="text-mint" />
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-bold text-navy leading-none">{value}</p>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-navy">재료</h2>
            <span className="text-xs text-gray-400">
              냉장고 {inFridgeIngredients.length}/{recipe.ingredients.length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {recipe.ingredients.map((ingredient, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  ingredient.inFridge ? 'bg-mint/5' : 'bg-gray-50'
                )}
              >
                {ingredient.inFridge ? (
                  <CheckCircle2 size={16} className="flex-shrink-0 text-mint" />
                ) : (
                  <Circle size={16} className="flex-shrink-0 text-gray-300" />
                )}
                <span
                  className={cn(
                    'flex-1 text-sm font-medium',
                    ingredient.inFridge ? 'text-navy' : 'text-gray-400'
                  )}
                >
                  {ingredient.name}
                </span>
                <span className="text-sm text-gray-400">
                  {ingredient.amount} {ingredient.unit}
                </span>
                {!ingredient.inFridge && ingredient.required && onAddToShopping && (
                  <button
                    onClick={() => onAddToShopping(ingredient)}
                    className="ml-1 text-accent-blue hover:text-blue-600 transition-colors"
                    aria-label="장보기에 추가"
                  >
                    <ShoppingCart size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {missingIngredients.length > 0 && onAddToShopping && (
            <button
              onClick={() => missingIngredients.forEach(onAddToShopping)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-accent-blue/30 text-accent-blue rounded-xl text-sm font-medium hover:bg-accent-blue/5 transition-colors"
            >
              <ShoppingCart size={14} />
              부족한 재료 {missingIngredients.length}개 장보기에 추가
            </button>
          )}
        </div>

        {/* Steps */}
        <div>
          <h2 className="text-base font-bold text-navy mb-3">조리 순서</h2>
          <div className="flex flex-col gap-4">
            {recipe.steps.map((step) => (
              <div key={step.order} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-mint text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {step.order}
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                  <p className="text-sm text-navy leading-relaxed">{step.instruction}</p>
                  {step.time && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-mint font-medium bg-mint/10 px-2 py-0.5 rounded-full">
                      <Clock size={10} />
                      {step.time}분
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition */}
        {recipe.nutrition && (
          <div>
            <h2 className="text-base font-bold text-navy mb-3">영양 정보</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '단백질', value: `${recipe.nutrition.protein}g` },
                { label: '탄수화물', value: `${recipe.nutrition.carbs}g` },
                { label: '지방', value: `${recipe.nutrition.fat}g` },
                { label: '나트륨', value: `${recipe.nutrition.sodium}mg` },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-bold text-navy">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        {onStartCooking && (
          <button
            onClick={onStartCooking}
            className="w-full py-4 bg-mint text-white rounded-2xl font-bold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Star size={18} />
            요리 시작하기
          </button>
        )}
      </div>
    </div>
  )
}
