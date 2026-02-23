'use client'

import { useState } from 'react'
import { Trash2, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_OPTIONS } from '@/constants/categories'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { RecognizedIngredient } from '@/lib/ai/vision'

interface EditableIngredient extends RecognizedIngredient {
  tempId: string
}

interface ScanResultConfirmProps {
  items: RecognizedIngredient[]
  onConfirm: (items: RecognizedIngredient[]) => void
  isSubmitting?: boolean
}

export const ScanResultConfirm = ({
  items,
  onConfirm,
  isSubmitting = false,
}: ScanResultConfirmProps) => {
  const [editableItems, setEditableItems] = useState<EditableIngredient[]>(
    items.map((item, i) => ({ ...item, tempId: `item-${i}` }))
  )

  const updateItem = (tempId: string, field: keyof RecognizedIngredient, value: string | number) => {
    setEditableItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    )
  }

  const removeItem = (tempId: string) => {
    setEditableItems((prev) => prev.filter((item) => item.tempId !== tempId))
  }

  const handleConfirm = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cleaned = editableItems.map(({ tempId, ...rest }) => rest)
    onConfirm(cleaned)
  }

  if (editableItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="text-4xl">🔍</span>
        <p className="text-navy font-semibold">인식된 식재료가 없어요</p>
        <p className="text-sm text-gray-400">다시 촬영하거나 수동으로 입력해주세요.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-navy">
          인식된 식재료{' '}
          <span className="text-mint">{editableItems.length}개</span>
        </p>
        <p className="text-xs text-gray-400">이름과 수량을 확인해주세요</p>
      </div>

      <div className="flex flex-col gap-3">
        {editableItems.map((item) => (
          <div
            key={item.tempId}
            className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-start gap-3">
              {/* Confidence indicator */}
              <div
                className={cn(
                  'flex-shrink-0 w-2 h-2 rounded-full mt-2',
                  item.confidence >= 0.9
                    ? 'bg-freshness-fresh'
                    : item.confidence >= 0.7
                    ? 'bg-freshness-caution'
                    : 'bg-freshness-urgent'
                )}
                title={`인식 정확도 ${Math.round(item.confidence * 100)}%`}
              />

              <div className="flex-1 grid grid-cols-2 gap-2">
                {/* Name */}
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">이름</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.tempId, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">카테고리</label>
                  <div className="relative">
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.tempId, 'category', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint appearance-none pr-7"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">수량</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={item.quantity}
                      min={0.1}
                      step={0.1}
                      onChange={(e) => updateItem(item.tempId, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint"
                    />
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(item.tempId, 'unit', e.target.value)}
                      className="w-14 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy text-center focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.tempId)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-freshness-urgent hover:bg-red-50 transition-colors"
                aria-label="삭제"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={isSubmitting || editableItems.length === 0}
        className="flex items-center justify-center gap-2 w-full py-4 bg-mint text-white rounded-2xl font-semibold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner />
            <span>냉장고에 추가하는 중...</span>
          </>
        ) : (
          <>
            <Check size={18} />
            <span>냉장고에 추가 ({editableItems.length}개)</span>
          </>
        )}
      </button>
    </div>
  )
}
