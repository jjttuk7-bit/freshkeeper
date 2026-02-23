'use client'

import { cn } from '@/lib/utils'
import { STORAGE_TYPES } from '@/constants/storage-types'
import { useFridgeStore } from '@/stores/fridgeStore'
import type { StorageType } from '@/types/ingredient'

const TABS: { value: StorageType | 'all'; label: string; emoji?: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'fridge', label: '냉장', emoji: STORAGE_TYPES.fridge.emoji },
  { value: 'freezer', label: '냉동', emoji: STORAGE_TYPES.freezer.emoji },
  { value: 'room', label: '실온', emoji: STORAGE_TYPES.room.emoji },
]

export const StorageFilter = () => {
  const { storageFilter, setStorageFilter } = useFridgeStore()

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
      {TABS.map(({ value, label, emoji }) => {
        const isActive = storageFilter === value
        return (
          <button
            key={value}
            onClick={() => setStorageFilter(value)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all',
              isActive
                ? 'bg-mint text-white border-mint shadow-sm shadow-mint/20'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            )}
          >
            {emoji && <span>{emoji}</span>}
            {label}
          </button>
        )
      })}
    </div>
  )
}
