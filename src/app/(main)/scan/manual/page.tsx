'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateIngredient } from '@/hooks/useIngredients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CATEGORY_OPTIONS } from '@/constants/categories'
import { ArrowLeft, Plus } from 'lucide-react'

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

  const {
    register,
    handleSubmit,
    control,
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

  const onSubmit = async (data: ManualFormData) => {
    await createIngredient.mutateAsync({
      name: data.name,
      category: data.category,
      storageType: data.storageType,
      expiryDate: new Date(data.expiryDate).toISOString(),
      quantity: data.quantity,
      unit: data.unit,
      memo: data.memo,
      purchasePrice: data.purchasePrice,
    })
    router.push('/fridge')
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="font-bold text-navy">직접 입력</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-6">
        <div className="flex flex-col gap-4">

          {/* Name */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <Label className="mb-2 block text-sm font-semibold text-navy">
              식재료 이름 <span className="text-accent-red">*</span>
            </Label>
            <Input
              placeholder="예: 당근, 소고기, 우유"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-accent-red">{errors.name.message}</p>
            )}
          </div>

          {/* Category + Storage */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-4">
              <Label className="mb-2 block text-sm font-semibold text-navy">
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
                        className={`flex flex-col items-center rounded-xl border p-2 text-xs transition-colors ${
                          field.value === opt.value
                            ? 'border-mint bg-mint-light text-mint font-semibold'
                            : 'border-gray-100 text-gray-500 hover:border-mint/40'
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
              <Label className="mb-2 block text-sm font-semibold text-navy">
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
                        className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                          field.value === opt.value
                            ? 'border-mint bg-mint text-white'
                            : 'border-gray-100 text-gray-500 hover:border-mint/40'
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
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <Label className="mb-2 block text-sm font-semibold text-navy">
              유통기한 <span className="text-accent-red">*</span>
            </Label>
            <Input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('expiryDate')}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-xs text-accent-red">{errors.expiryDate.message}</p>
            )}
          </div>

          {/* Quantity + Unit */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <Label className="mb-2 block text-sm font-semibold text-navy">수량</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                className="flex-1"
                {...register('quantity')}
              />
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-navy"
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
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-4">
              <Label className="mb-2 block text-sm font-semibold text-navy">메모 (선택)</Label>
              <Input placeholder="예: 국내산, 유기농" {...register('memo')} />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-semibold text-navy">구매 금액 (선택)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="pr-8"
                  {...register('purchasePrice')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-mint py-5 text-base font-bold text-white hover:bg-mint-dark disabled:opacity-50"
          >
            <Plus className="mr-2 h-5 w-5" />
            {isSubmitting ? '등록 중...' : '냉장고에 추가'}
          </Button>
        </div>
      </form>
    </div>
  )
}
