'use client'

import { useState, useMemo } from 'react'
import {
  useShoppingLists,
  useAddShoppingItem,
  useToggleShoppingItem,
  useDeleteShoppingItem,
} from '@/hooks/useShopping'
import { Input } from '@/components/ui/input'
import SuggestionsBanner from '@/components/shopping/SuggestionsBanner'
import CheckoutSheet from '@/components/shopping/CheckoutSheet'
import type { ShoppingItem } from '@/types/shopping'
import {
  Plus,
  Trash2,
  ShoppingCart,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Refrigerator,
} from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  vegetable: '🥬 채소',
  meat: '🥩 육류',
  seafood: '🐟 수산물',
  dairy: '🥛 유제품',
  grain: '🌾 곡물',
  sauce: '🧂 양념/소스',
  fruit: '🍎 과일',
  other: '📦 기타',
}

function groupByCategory(items: ShoppingItem[]): Record<string, ShoppingItem[]> {
  return items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const key = item.category ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

function ShoppingItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-4 transition-all ${
        item.checked ? 'bg-gray-50' : 'bg-white shadow-card'
      }`}
    >
      <button onClick={onToggle} className="flex-shrink-0">
        {item.checked ? (
          <CheckCircle className="h-6 w-6 text-mint" />
        ) : (
          <Circle className="h-6 w-6 text-gray-200" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            item.checked ? 'text-gray-400 line-through' : 'text-navy'
          }`}
        >
          {item.name}
        </p>
        <p className="text-xs text-gray-400">
          {item.quantity} {item.unit}
          {item.estimatedPrice ? ` · 약 ${item.estimatedPrice.toLocaleString()}원` : ''}
          {item.sourceRecipeId ? ' · 레시피에서' : ''}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl hover:bg-gray-50 transition-colors"
      >
        <Trash2 className="h-4 w-4 text-gray-300" />
      </button>
    </div>
  )
}

export default function ShoppingPage() {
  const { data: lists, isLoading } = useShoppingLists()
  const addItem = useAddShoppingItem()
  const toggleItem = useToggleShoppingItem()
  const deleteItem = useDeleteShoppingItem()

  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('1')
  const [newItemUnit, setNewItemUnit] = useState('개')
  const [showAddForm, setShowAddForm] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const activeList = lists?.find((l) => l.status === 'active')
  const items = activeList?.items ?? []

  const uncheckedItems = items.filter((i) => !i.checked)
  const checkedItems = items.filter((i) => i.checked)
  const grouped = useMemo(() => groupByCategory(uncheckedItems), [uncheckedItems])

  const totalEstimated = items.reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0)
  const checkedEstimated = checkedItems.reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0)

  const handleAdd = async () => {
    if (!newItemName.trim()) return
    await addItem.mutateAsync({
      name: newItemName.trim(),
      quantity: Number(newItemQty) || 1,
      unit: newItemUnit,
    })
    setNewItemName('')
    setNewItemQty('1')
    setShowAddForm(false)
  }

  const toggleCategory = (cat: string) =>
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">장보기</h1>
            <p className="mt-1 text-sm text-gray-400">
              {uncheckedItems.length}개 남음 · {checkedItems.length}개 완료
            </p>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-2xl bg-mint px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform"
          >
            <Plus className="h-4 w-4" /> 추가
          </button>
        </div>

        {items.length > 0 && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-mint transition-all duration-500"
                style={{ width: `${items.length ? (checkedItems.length / items.length) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1.5 text-right text-xs text-gray-400">
              {Math.round((checkedItems.length / items.length) * 100)}% 완료
            </p>
          </div>
        )}
      </div>

      {/* Smart suggestions */}
      <SuggestionsBanner />

      {/* Add form */}
      {showAddForm && (
        <div className="mx-5 mb-4 rounded-3xl bg-white p-5 shadow-card">
          <p className="mb-3 text-sm font-semibold text-navy">새 항목 추가</p>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="식재료 이름"
            className="mb-2.5 rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div className="mb-3 flex gap-2">
            <Input
              type="number"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="w-24 rounded-2xl border-0 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-mint/20"
              min="1"
            />
            <select
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="flex-1 rounded-2xl border-0 bg-gray-50 px-4 py-3 text-sm text-navy focus:ring-2 focus:ring-mint/20"
            >
              {['개', 'g', 'kg', 'ml', 'L', '팩', '봉', '묶음'].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddForm(false)} className="flex-1 rounded-2xl bg-gray-50 py-3 text-sm font-medium text-gray-500 active:scale-[0.98] transition-transform">
              취소
            </button>
            <button
              onClick={handleAdd}
              disabled={!newItemName.trim() || addItem.isPending}
              className="flex-1 rounded-2xl bg-mint py-3 text-sm font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </div>
      )}

      <div className="px-5 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50">
              <ShoppingCart className="h-8 w-8 text-gray-200" />
            </div>
            <p className="text-base font-semibold text-navy">장보기 목록이 비어있어요</p>
            <p className="mt-1 text-sm text-gray-400">위 추가 버튼을 눌러 항목을 추가하세요</p>
          </div>
        ) : (
          <>
            {/* Unchecked grouped by category */}
            {Object.entries(grouped).map(([category, catItems]) => (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="mb-2.5 flex w-full items-center justify-between"
                >
                  <span className="text-xs font-semibold text-gray-500">
                    {CATEGORY_LABELS[category] ?? category} ({catItems.length})
                  </span>
                  {collapsedCategories.has(category) ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {!collapsedCategories.has(category) && (
                  <div className="flex flex-col gap-2.5">
                    {catItems.map((item) => (
                      <ShoppingItemRow
                        key={item.id}
                        item={item}
                        onToggle={() => toggleItem.mutate({ id: item.id, checked: !item.checked })}
                        onDelete={() => deleteItem.mutate(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Checked items */}
            {checkedItems.length > 0 && (
              <div className="mt-2">
                <p className="mb-2.5 text-xs font-semibold text-gray-400">
                  완료 ({checkedItems.length})
                </p>
                <div className="flex flex-col gap-2">
                  {checkedItems.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => toggleItem.mutate({ id: item.id, checked: !item.checked })}
                      onDelete={() => deleteItem.mutate(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            {totalEstimated > 0 && (
              <div className="mt-6 rounded-3xl bg-navy p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50">예상 총액</p>
                    <p className="text-xl font-bold text-white">
                      {totalEstimated.toLocaleString()}원
                    </p>
                  </div>
                  {checkedEstimated > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-white/50">담은 금액</p>
                      <p className="font-bold text-mint">{checkedEstimated.toLocaleString()}원</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating checkout button */}
      {checkedItems.length > 0 && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2">
          <button
            onClick={() => setCheckoutOpen(true)}
            className="flex items-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-navy/30 transition-transform active:scale-[0.97]"
          >
            <Refrigerator className="h-4 w-4" />
            냉장고에 등록 ({checkedItems.length})
          </button>
        </div>
      )}

      {/* Checkout sheet */}
      <CheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={checkedItems}
      />
    </div>
  )
}
