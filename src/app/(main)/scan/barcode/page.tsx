'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateIngredient } from '@/hooks/useIngredients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { IngredientCreateInput } from '@/types/ingredient'
import { CATEGORIES } from '@/constants/categories'
import { ArrowLeft, Search, Loader2, Plus, Barcode } from 'lucide-react'

interface FoodDBResult {
  name: string
  category: string
  barcode: string
  avgShelfLife: { fridge: number; freezer: number; room: number }
  nutrition?: { calories: number; protein: number; carbs: number; fat: number }
  imageUrl?: string
}

export default function BarcodePage() {
  const router = useRouter()
  const createIngredient = useCreateIngredient()

  const [barcode, setBarcode] = useState('')
  const [isLooking, setIsLooking] = useState(false)
  const [result, setResult] = useState<FoodDBResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleLookup = async () => {
    if (!barcode.trim()) return

    setIsLooking(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/food-db?barcode=${encodeURIComponent(barcode.trim())}`)
      const json = await res.json()
      if (!json.success || !json.data) {
        setError('해당 바코드의 식품 정보를 찾을 수 없어요')
        return
      }
      setResult(json.data)
    } catch {
      setError('조회 중 오류가 발생했어요. 다시 시도해주세요')
    } finally {
      setIsLooking(false)
    }
  }

  const handleAdd = async () => {
    if (!result) return
    setIsSaving(true)

    try {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + (result.avgShelfLife.fridge ?? 7))

      const payload: IngredientCreateInput = {
        name: result.name,
        category: (result.category as IngredientCreateInput['category']) ?? 'other',
        storageType: 'fridge',
        expiryDate: expiryDate.toISOString(),
        quantity: 1,
        unit: '개',
      }
      await createIngredient.mutateAsync(payload)
      router.push('/fridge')
    } catch {
      setError('저장 중 오류가 발생했어요')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <ArrowLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="font-bold text-navy">바코드 조회</h1>
      </div>

      <div className="px-4 pb-6">
        {/* Barcode icon */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50">
            <Barcode className="h-10 w-10 text-accent-orange" />
          </div>
          <p className="text-center text-sm text-gray-500">
            상품 뒷면의 바코드 번호를 입력하세요
          </p>
        </div>

        {/* Input */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <Label className="mb-2 block text-sm font-semibold text-navy">바코드 번호</Label>
          <div className="flex gap-2">
            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="예: 8801056143398"
              type="number"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
            <Button
              onClick={handleLookup}
              disabled={isLooking || !barcode.trim()}
              className="rounded-xl bg-accent-orange px-4 text-white hover:bg-accent-orange/90 disabled:opacity-50"
            >
              {isLooking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-accent-red">{error}</div>
        )}

        {/* Result */}
        {result && (
          <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-3xl">
                {CATEGORIES[result.category as keyof typeof CATEGORIES]?.emoji ?? '📦'}
              </div>
              <div>
                <p className="font-bold text-navy">{result.name}</p>
                <p className="text-sm text-gray-500">
                  {CATEGORIES[result.category as keyof typeof CATEGORIES]?.label ?? result.category}
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {(['fridge', 'freezer', 'room'] as const).map((type) => (
                <div key={type} className="rounded-xl bg-gray-50 p-2 text-center">
                  <p className="text-xs text-gray-400">
                    {type === 'fridge' ? '냉장' : type === 'freezer' ? '냉동' : '실온'}
                  </p>
                  <p className="font-bold text-navy">{result.avgShelfLife[type]}일</p>
                </div>
              ))}
            </div>

            {result.nutrition && (
              <div className="rounded-xl bg-mint-light p-3">
                <p className="mb-1.5 text-xs font-semibold text-mint">영양 정보 (100g 기준)</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">칼로리</p>
                    <p className="text-sm font-bold text-navy">{result.nutrition.calories}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">단백질</p>
                    <p className="text-sm font-bold text-navy">{result.nutrition.protein}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">탄수화물</p>
                    <p className="text-sm font-bold text-navy">{result.nutrition.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">지방</p>
                    <p className="text-sm font-bold text-navy">{result.nutrition.fat}g</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {result && (
          <Button
            onClick={handleAdd}
            disabled={isSaving}
            className="w-full rounded-xl bg-mint py-5 text-base font-bold text-white hover:bg-mint-dark disabled:opacity-50"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />추가 중...</>
            ) : (
              <><Plus className="mr-2 h-5 w-5" />냉장고에 추가</>
            )}
          </Button>
        )}

        {/* Tips */}
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-500">💡 바코드가 인식 안 되면?</p>
          <p className="mt-1 text-xs text-gray-400">
            숫자 13자리의 바코드 번호를 직접 입력해보세요. 국내 식품은 대부분 880으로 시작해요.
          </p>
        </div>
      </div>
    </div>
  )
}
