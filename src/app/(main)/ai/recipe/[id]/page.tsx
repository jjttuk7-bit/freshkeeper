'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAddShoppingItem } from '@/hooks/useShopping'
import { Button } from '@/components/ui/button'
import type { Recipe } from '@/types/recipe'
import { useChefStore } from '@/stores/chefStore'
import {
  ArrowLeft,
  Clock,
  Users,
  Flame,
  ChefHat,
  ShoppingCart,
  CheckCircle,
  PlayCircle,
} from 'lucide-react'

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' } as const
const DIFFICULTY_COLOR = {
  easy: 'bg-freshness-fresh/10 text-freshness-fresh',
  medium: 'bg-freshness-caution/10 text-freshness-caution',
  hard: 'bg-freshness-urgent/10 text-freshness-urgent',
} as const

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const addShoppingItem = useAddShoppingItem()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [cookingMode, setCookingMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const cached = useChefStore.getState().getRecipe(params.id as string)
    if (cached) {
      setRecipe(cached)
      setLoading(false)
      return
    }
    fetch(`/api/recipes/${params.id}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setRecipe(json.data) })
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <p className="text-base font-semibold text-navy">레시피를 찾을 수 없어요</p>
        <Button onClick={() => router.back()} className="mt-4 rounded-2xl bg-mint px-8 py-3 text-white shadow-lg shadow-mint/20 hover:bg-mint-dark active:scale-[0.98] transition-transform">
          돌아가기
        </Button>
      </div>
    )
  }

  const missingIngredients = recipe.ingredients.filter((i) => !i.inFridge && i.required)

  const handleAddToShopping = async (name: string) => {
    await addShoppingItem.mutateAsync({ name, quantity: 1, unit: '개', sourceRecipeId: recipe.id })
    setAddedItems((prev) => new Set(prev).add(name))
  }

  const handleAddAllMissing = () =>
    Promise.all(missingIngredients.map((i) => handleAddToShopping(i.name)))

  if (cookingMode) {
    const step = recipe.steps[currentStep]
    return (
      <div className="mx-auto flex max-w-md flex-col" style={{ minHeight: 'calc(100vh - 96px)' }}>
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => setCookingMode(false)} className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-card">
            <ArrowLeft className="h-5 w-5 text-navy" />
          </button>
          <span className="text-sm font-medium text-gray-400">
            {currentStep + 1} / {recipe.steps.length}
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-mint text-2xl font-bold text-white shadow-lg shadow-mint/20">
            {currentStep + 1}
          </div>
          <p className="mb-2 text-sm text-gray-400">{recipe.name}</p>
          <p className="text-xl font-bold leading-relaxed text-navy">{step.instruction}</p>
          {step.time && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-mint/10 px-5 py-2.5">
              <Clock className="h-4 w-4 text-mint" />
              <span className="text-sm font-semibold text-mint">{step.time}분 소요</span>
            </div>
          )}
        </div>
        <div className="px-5 pb-6">
          <div className="mb-3 flex gap-2.5">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep((s) => s - 1)} className="flex-1 rounded-2xl bg-gray-50 py-4 text-sm font-medium text-gray-500 active:scale-[0.98] transition-transform">
                이전
              </button>
            )}
            {currentStep < recipe.steps.length - 1 ? (
              <button onClick={() => setCurrentStep((s) => s + 1)} className="flex-1 rounded-2xl bg-mint py-4 text-sm font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform">
                다음 단계
              </button>
            ) : (
              <button onClick={() => setCookingMode(false)} className="flex-1 rounded-2xl bg-freshness-fresh py-4 text-sm font-semibold text-white active:scale-[0.98] transition-transform">
                <CheckCircle className="mr-2 inline h-5 w-5" /> 요리 완성!
              </button>
            )}
          </div>
          <div className="flex justify-center gap-1">
            {recipe.steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-6 bg-mint' : i < currentStep ? 'w-1.5 bg-mint/40' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-card">
          <ArrowLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="font-bold text-navy">레시피</h1>
        <div className="h-9 w-9" />
      </div>

      <div className="px-5 pb-6">
        {/* Hero */}
        <div className="mb-4 rounded-3xl bg-navy p-6 text-white">
          <div className="mb-3 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-mint" />
            <span className="text-xs font-medium text-mint">AI 셰프 추천</span>
          </div>
          <h2 className="mb-2 text-2xl font-bold">{recipe.name}</h2>
          {recipe.description && <p className="mb-4 text-sm text-white/60">{recipe.description}</p>}
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${DIFFICULTY_COLOR[recipe.difficulty]}`}>
              {DIFFICULTY_LABEL[recipe.difficulty]}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
              <Clock className="h-3 w-3" /> {recipe.cookTime}분
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
              <Users className="h-3 w-3" /> {recipe.servings}인분
            </span>
            {recipe.calories && (
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
                <Flame className="h-3 w-3" /> {recipe.calories}kcal
              </span>
            )}
          </div>
        </div>

        {/* Nutrition */}
        {recipe.nutrition && (
          <div className="mb-4 rounded-3xl bg-white p-5 shadow-card">
            <p className="mb-3 text-sm font-bold text-navy">영양 정보 (1인분)</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '단백질', value: recipe.nutrition.protein, unit: 'g', color: 'text-accent-blue' },
                { label: '탄수화물', value: recipe.nutrition.carbs, unit: 'g', color: 'text-accent-orange' },
                { label: '지방', value: recipe.nutrition.fat, unit: 'g', color: 'text-accent-yellow' },
                { label: '나트륨', value: recipe.nutrition.sodium, unit: 'mg', color: 'text-accent-purple' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="flex flex-col items-center rounded-2xl bg-gray-50 p-3">
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-gray-400">{unit}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div className="mb-4 rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-navy">재료 ({recipe.ingredients.length}개)</p>
            {missingIngredients.length > 0 && (
              <button onClick={handleAddAllMissing} className="flex items-center gap-1 rounded-2xl bg-accent-blue/10 px-3 py-1.5 text-xs font-medium text-accent-blue">
                <ShoppingCart className="h-3 w-3" /> {missingIngredients.length}개 장보기 추가
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {recipe.ingredients.map((ing) => (
              <div key={ing.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${ing.inFridge ? 'bg-freshness-fresh' : 'bg-gray-200'}`} />
                  <span className={`text-sm ${ing.inFridge ? 'text-navy' : 'text-gray-400'}`}>{ing.name}</span>
                  {ing.inFridge && <span className="rounded-full bg-mint/10 px-2 py-0.5 text-[10px] font-medium text-mint">냉장고</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{ing.amount} {ing.unit}</span>
                  {!ing.inFridge && ing.required && (
                    <button
                      onClick={() => handleAddToShopping(ing.name)}
                      disabled={addedItems.has(ing.name)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${addedItems.has(ing.name) ? 'bg-mint/10 text-mint' : 'bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20'}`}
                    >
                      {addedItems.has(ing.name) ? '✓ 추가됨' : '+ 장보기'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="mb-4 rounded-3xl bg-white p-5 shadow-card">
          <p className="mb-4 text-sm font-bold text-navy">조리 순서</p>
          <div className="flex flex-col gap-5">
            {recipe.steps.map((step) => (
              <div key={step.order} className="flex gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-mint text-sm font-bold text-white">
                  {step.order}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm leading-relaxed text-navy">{step.instruction}</p>
                  {step.time && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" /> {step.time}분
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <span key={tag} className="rounded-2xl bg-gray-50 px-3.5 py-1.5 text-sm text-gray-400">#{tag}</span>
          ))}
        </div>

        <Button
          onClick={() => { setCookingMode(true); setCurrentStep(0) }}
          className="w-full rounded-2xl bg-mint py-4 text-[15px] font-semibold text-white shadow-lg shadow-mint/20 hover:bg-mint-dark active:scale-[0.98] transition-transform"
        >
          <PlayCircle className="mr-2 h-5 w-5" /> 요리 시작하기
        </Button>
      </div>
    </div>
  )
}
