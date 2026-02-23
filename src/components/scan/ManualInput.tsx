'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_OPTIONS } from '@/constants/categories'
import { STORAGE_OPTIONS } from '@/constants/storage-types'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { IngredientCreateInput } from '@/types/ingredient'

const UNITS = ['개', 'g', 'kg', 'ml', 'L', '팩', '봉', '단', '마리', '병']

const schema = z.object({
  name: z.string().min(1, '식재료 이름을 입력해주세요'),
  category: z.enum(['vegetable', 'meat', 'seafood', 'dairy', 'grain', 'sauce', 'fruit', 'other']),
  storageType: z.enum(['fridge', 'freezer', 'room']),
  expiryDate: z.string().min(1, '유통기한을 입력해주세요'),
  quantity: z.coerce.number().positive('수량은 0보다 커야 해요').default(1),
  unit: z.string().default('개'),
  memo: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
})

type FormValues = z.infer<typeof schema>

interface ManualInputProps {
  onSubmit: (data: IngredientCreateInput) => void
  isSubmitting?: boolean
  defaultValues?: Partial<FormValues>
}

const Field = ({
  label,
  error,
  children,
  required,
}: {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-navy">
      {label}
      {required && <span className="text-freshness-urgent ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-freshness-urgent">{error}</p>}
  </div>
)

const inputClass =
  'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all'

const selectClass = cn(inputClass, 'appearance-none pr-8')

const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}
    <ChevronDown
      size={14}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  </div>
)

export const ManualInput = ({
  onSubmit,
  isSubmitting = false,
  defaultValues,
}: ManualInputProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'vegetable',
      storageType: 'fridge',
      quantity: 1,
      unit: '개',
      ...defaultValues,
    },
  })

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      category: values.category,
      storageType: values.storageType,
      expiryDate: values.expiryDate,
      quantity: values.quantity,
      unit: values.unit,
      memo: values.memo,
      purchasePrice: values.purchasePrice,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5 pb-6">
      {/* Name */}
      <Field label="식재료 이름" error={errors.name?.message} required>
        <input
          {...register('name')}
          type="text"
          placeholder="예: 배추, 소고기, 우유"
          className={inputClass}
        />
      </Field>

      {/* Category + Storage */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="카테고리" error={errors.category?.message} required>
          <SelectWrapper>
            <select {...register('category')} className={selectClass}>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </Field>

        <Field label="보관 위치" error={errors.storageType?.message} required>
          <SelectWrapper>
            <select {...register('storageType')} className={selectClass}>
              {STORAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </Field>
      </div>

      {/* Expiry date */}
      <Field label="유통기한" error={errors.expiryDate?.message} required>
        <input
          {...register('expiryDate')}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className={inputClass}
        />
      </Field>

      {/* Quantity + Unit */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="수량" error={errors.quantity?.message} required>
          <input
            {...register('quantity')}
            type="number"
            min={0.1}
            step={0.1}
            placeholder="1"
            className={inputClass}
          />
        </Field>

        <Field label="단위" error={errors.unit?.message}>
          <SelectWrapper>
            <select {...register('unit')} className={selectClass}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </Field>
      </div>

      {/* Purchase price */}
      <Field label="구매 가격 (선택)" error={errors.purchasePrice?.message}>
        <div className="relative">
          <input
            {...register('purchasePrice')}
            type="number"
            min={0}
            step={100}
            placeholder="0"
            className={cn(inputClass, 'pr-8')}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            원
          </span>
        </div>
      </Field>

      {/* Memo */}
      <Field label="메모 (선택)" error={errors.memo?.message}>
        <textarea
          {...register('memo')}
          placeholder="예: 마트에서 구매, 열기 전까지 실온보관"
          rows={3}
          className={cn(inputClass, 'resize-none')}
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-mint text-white rounded-2xl font-semibold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            등록 중...
          </span>
        ) : (
          '냉장고에 추가'
        )}
      </button>
    </form>
  )
}
