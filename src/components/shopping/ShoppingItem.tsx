'use client'

import { Trash2 } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import type { ShoppingItem as ShoppingItemType } from '@/types/shopping'

interface ShoppingItemProps {
  item: ShoppingItemType
  onToggle: (id: string, checked: boolean) => void
  onDelete: (id: string) => void
  className?: string
}

export const ShoppingItem = ({ item, onToggle, onDelete, className }: ShoppingItemProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-50 last:border-0 transition-colors',
        item.checked && 'bg-gray-50/50',
        className
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
          item.checked
            ? 'bg-mint border-mint'
            : 'border-gray-300 hover:border-mint'
        )}
        aria-label={item.checked ? '체크 해제' : '체크'}
      >
        {item.checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Name + quantity */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium text-navy transition-all',
            item.checked && 'line-through text-gray-400'
          )}
        >
          {item.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {item.quantity}
          {item.unit}
          {item.category && ` · ${item.category}`}
        </p>
      </div>

      {/* Price */}
      {item.estimatedPrice != null && (
        <span
          className={cn(
            'text-sm font-semibold text-navy flex-shrink-0 transition-all',
            item.checked && 'text-gray-300 line-through'
          )}
        >
          {formatPrice(item.estimatedPrice)}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-freshness-urgent hover:bg-red-50 transition-colors"
        aria-label="삭제"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
