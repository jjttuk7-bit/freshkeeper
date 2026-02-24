'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { useBulkCreateIngredients } from '@/hooks/useIngredients'
import { useQueryClient } from '@tanstack/react-query'
import type { ShoppingItem } from '@/types/shopping'
import type { StorageType } from '@/types/ingredient'
import { Refrigerator, Snowflake, Home, Loader2 } from 'lucide-react'

interface CheckoutSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ShoppingItem[]
  onSuccess?: () => void
}

const STORAGE_OPTIONS: { value: StorageType; label: string; icon: typeof Refrigerator }[] = [
  { value: 'fridge', label: '냉장', icon: Refrigerator },
  { value: 'freezer', label: '냉동', icon: Snowflake },
  { value: 'room', label: '실온', icon: Home },
]

export default function CheckoutSheet({
  open,
  onOpenChange,
  items,
  onSuccess,
}: CheckoutSheetProps) {
  const bulkCreate = useBulkCreateIngredients()
  const qc = useQueryClient()

  const [storageMap, setStorageMap] = useState<Record<string, StorageType>>({})

  const getStorage = (id: string): StorageType => storageMap[id] ?? 'fridge'

  const handleStorageChange = (id: string, storage: StorageType) => {
    setStorageMap((prev) => ({ ...prev, [id]: storage }))
  }

  const handleSubmit = async () => {
    const payload = items.map((item) => ({
      name: item.name,
      category: item.category ?? undefined,
      storageType: getStorage(item.id),
      quantity: item.quantity,
      unit: item.unit,
    }))

    await bulkCreate.mutateAsync({ items: payload })
    qc.invalidateQueries({ queryKey: ['shopping'] })
    onOpenChange(false)
    setStorageMap({})
    onSuccess?.()
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="px-5 pb-2">
        <h2 className="text-lg font-bold text-navy">냉장고에 등록</h2>
        <p className="mt-1 text-sm text-gray-400">
          {items.length}개 항목의 보관 위치를 선택하세요
        </p>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy">{item.name}</p>
              <p className="text-xs text-gray-400">
                {item.quantity} {item.unit}
              </p>
            </div>
            <div className="flex gap-1.5">
              {STORAGE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleStorageChange(item.id, value)}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    getStorage(item.id) === value
                      ? 'bg-mint text-white shadow-sm'
                      : 'bg-white text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-6 pt-2">
        <button
          onClick={handleSubmit}
          disabled={bulkCreate.isPending || items.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint py-4 text-base font-semibold text-white shadow-lg shadow-mint/20 transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {bulkCreate.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              등록 중...
            </>
          ) : (
            <>전체 냉장고에 등록</>
          )}
        </button>
      </div>
    </BottomSheet>
  )
}
