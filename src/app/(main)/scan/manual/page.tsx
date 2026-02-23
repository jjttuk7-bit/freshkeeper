'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateIngredient, useIngredients } from '@/hooks/useIngredients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CATEGORY_OPTIONS } from '@/constants/categories'
import { STORAGE_TYPES } from '@/constants/storage-types'
import { classifyFood, getFoodTip, type FoodClassification } from '@/lib/food-classifier'
import { getIngredientAdvice, type IngredientAdvice } from '@/lib/ai/ingredient-advisor'
import IngredientInsightPopup from '@/components/ai/IngredientInsightPopup'
import { ArrowLeft, Plus, Lightbulb } from 'lucide-react'

const UNIT_OPTIONS = ['개', 'g', 'kg', 'ml', 'L', '팩', '봉', '묶음', '장']
const STORAGE_OPTIONS = [
  { value: 'fridge', label: '냉장' },
  { value: 'freezer', label: '냉동' },
  { value: 'room', label: '실온' },
]

const manualSchema = z.object({
  name: z.string().min(1, '식재료 이름을 입력해주세요'),
  category: z.enum(['vegetable', 'meat', 'seafood', 'dairy', 'grain', 'sauce', 'fruit', 'other']),
  storageType: z.enum(['fridge', 'freezer', 'room']),
  expiryDate: z.string().min(1, '유통기한을 선택해주세요'),
  quantity: z.coerce.number().min(0.1, '수량을 입력해주세요'),
  unit: z.string().min(1),
  memo: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
})

type ManualFormData = z.infer<typeof manualSchema>

export default function ManualScanPage() {
  const router = useRouter()
  const createIngredient = useCreateIngredient()
  const { data: existingIngredients } = useIngredients()
  const [todayStr, setTodayStr] = useState('')
  const [recommendation, setRecommendation] = useState<FoodClassification | null>(null)
  const [tip, setTip] = useState<string | null>(null)
  const [advice, setAdvice] = useState<{ name: string; advice: IngredientAdvice } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0])
  }, [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ManualFormData>({
    resolver: zodResolver(manualSchema),
    defaultValues: {
      category: 'vegetable',
      storageType: 'fridge',
      quantity: 1,
      unit: '개',
    },
  })

  const handleNameChange = useCallback(
    (name: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const result = classifyFood(name)
        setRecommendation(result)
        setTip(getFoodTip(name))
        if (result) {
          setValue('category', result.category)
          setValue('storageType', result.defaultStorage)
          const days = result.shelfLife[result.defaultStorage]
          const expiry = new Date()
          expiry.setDate(expiry.getDate() + days)
          setValue('expiryDate', expiry.toISOString().split('T')[0])

          const existingNames = existingIngredients?.map((i) => i.name) ?? []
          const adviceResult = getIngredientAdvice(name, existingNames)
          setAdvice({ name, advice: adviceResult })
        }
      }, 300)
    },
    [setValue, existingIngredients]
  )

  const onSubmit = async (data: ManualFormData) => {
    await createIngredient.mutateAsync({
      name: data.name,
      category: data.category,
      storageType: data.storageType,
      expiryDate: new Date(data.expiryDate).toISOString(),
      quantity: data.quantity,
      unit: data.unit,
      memo: data.memo,
      purchasePrice: data.purchasePrice || undefined,
    })
    router.push('/fridge')
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-card"
        >
          <ArrowLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-navy">직접 입력</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-6">
        <div className="flex flex-col gap-4 animate-stagger">

          {/* Name */}
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <Label className="mb-2.5 block text-sm font-semibold text-navy">
              식재료 이름 <span className="text-accent-red">*</span>
            </Label>
            <Input
              placeholder="예: 당근, 소고기, 우유"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('name', {
                onChange: (e) => handleNameChange(e.target.value),
              })}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-accent-red">{errors.name.message}</p>
            )}
            {recommendation && (
              <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-mint/5 px-4 py-3">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-mint" />
                <div className="text-xs leading-relaxed text-gray-600">
                  <p>
                    <span className="font-semibold text-navy">{recommendation.name}</span>은{' '}
                    {STORAGE_TYPES[recommendation.defaultStorage].label} 보관을 추천해요
                    (약 {recommendation.shelfLife[recommendation.defaultStorage]}일)
                  </p>
                  {tip && <p className="mt-1 text-mint-dark">{tip}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Category + Storage */}
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <div className="mb-5">
              <Label className="mb-2.5 block text-sm font-semibold text-navy">
                카테고리 <span className="text-accent-red">*</span>
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={`flex flex-col items-center rounded-2xl py-2.5 text-xs transition-all ${
                          field.value === opt.value
                            ? 'bg-navy text-white font-semibold shadow-sm'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg">{opt.label.split(' ')[0]}</span>
                        <span>{opt.label.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <div>
              <Label className="mb-2.5 block text-sm font-semibold text-navy">
                보관 위치 <span className="text-accent-red">*</span>
              </Label>
              <Controller
                name="storageType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {STORAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={`rounded-2xl py-3 text-sm font-medium transition-all ${
                          field.value === opt.value
                            ? 'bg-navy text-white shadow-sm'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Expiry date */}
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <Label className="mb-2.5 block text-sm font-semibold text-navy">
              유통기한 <span className="text-accent-red">*</span>
            </Label>
            <Input
              type="date"
              min={todayStr}
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('expiryDate')}
            />
            {errors.expiryDate && (
              <p className="mt-1.5 text-xs text-accent-red">{errors.expiryDate.message}</p>
            )}
          </div>

          {/* Quantity + Unit */}
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <Label className="mb-2.5 block text-sm font-semibold text-navy">수량</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                className="flex-1 rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
                {...register('quantity')}
              />
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    className="rounded-2xl border-0 bg-gray-50 px-4 py-3 text-sm font-medium text-navy focus:ring-2 focus:ring-mint/20"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          {/* Memo + Price */}
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <div className="mb-5">
              <Label className="mb-2.5 block text-sm font-semibold text-navy">메모 (선택)</Label>
              <Input
                placeholder="예: 국내산, 유기농"
                className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
                {...register('memo')}
              />
            </div>
            <div>
              <Label className="mb-2.5 block text-sm font-semibold text-navy">구매 금액 (선택)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 pr-10 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
                  {...register('purchasePrice')}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-mint py-4 text-[15px] font-semibold text-white shadow-lg shadow-mint/20 hover:bg-mint-dark active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Plus className="mr-2 h-5 w-5" />
            {isSubmitting ? '등록 중...' : '냉장고에 추가'}
          </Button>
        </div>
      </form>

      {/* AI Insight Popup */}
      {advice && (
        <IngredientInsightPopup
          advice={advice.advice}
          ingredientName={advice.name}
          onClose={() => setAdvice(null)}
        />
      )}
    </div>
  )
}
