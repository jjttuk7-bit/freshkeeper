'use client'

import { useState } from 'react'
import { Plus, ShoppingBag, CheckCircle2 } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { useShoppingLists, useAddShoppingItem, useToggleShoppingItem, useDeleteShoppingItem } from '@/hooks/useShopping'
import { ShoppingItem } from './ShoppingItem'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'

export const ShoppingList = () => {
  const { data: lists = [], isLoading } = useShoppingLists()
  const addItem = useAddShoppingItem()
  const toggleItem = useToggleShoppingItem()
  const deleteItem = useDeleteShoppingItem()

  const [newItemName, setNewItemName] = useState('')

  // Use the first active list or derive a virtual list from all items
  const activeList = lists.find((l) => l.status === 'active') ?? lists[0]
  const items = activeList?.items ?? []

  const checkedItems = items.filter((i) => i.checked)
  const uncheckedItems = items.filter((i) => !i.checked)
  const totalPrice = uncheckedItems.reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0)
  const checkedPrice = checkedItems.reduce((sum, i) => sum + (i.estimatedPrice ?? 0), 0)

  const handleAddItem = () => {
    const name = newItemName.trim()
    if (!name) return
    addItem.mutate({
      name,
      quantity: 1,
      unit: '개',
      listId: activeList?.id,
    })
    setNewItemName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddItem()
  }

  if (isLoading) {
    return <LoadingSpinner text="장보기 목록을 불러오는 중..." />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Add item input */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="추가할 항목 입력..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
          />
          <button
            onClick={handleAddItem}
            disabled={!newItemName.trim() || addItem.isPending}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-mint text-white rounded-xl shadow-sm shadow-mint/30 hover:bg-mint-dark active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {items.length > 0 && (
        <div className="mx-4 mb-3 flex items-center justify-between px-4 py-2.5 bg-mint/5 border border-mint/20 rounded-xl">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-mint" />
            <span className="text-xs font-medium text-navy">
              {uncheckedItems.length}개 남음
              {checkedItems.length > 0 && ` · ${checkedItems.length}개 완료`}
            </span>
          </div>
          {totalPrice > 0 && (
            <span className="text-xs font-bold text-navy">{formatPrice(totalPrice)}</span>
          )}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4">
        {items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="장보기 목록이 비어있어요"
            description="위에서 항목을 추가해보세요!"
          />
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {/* Unchecked items */}
            {uncheckedItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {uncheckedItems.map((item) => (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onToggle={(id, checked) => toggleItem.mutate({ id, checked })}
                    onDelete={(id) => deleteItem.mutate(id)}
                  />
                ))}
              </div>
            )}

            {/* Checked items */}
            {checkedItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <CheckCircle2 size={14} className="text-mint" />
                  <p className="text-xs font-medium text-gray-400">
                    완료 {checkedItems.length}개
                    {checkedPrice > 0 && ` · ${formatPrice(checkedPrice)}`}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-70">
                  {checkedItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onToggle={(id, checked) => toggleItem.mutate({ id, checked })}
                      onDelete={(id) => deleteItem.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
