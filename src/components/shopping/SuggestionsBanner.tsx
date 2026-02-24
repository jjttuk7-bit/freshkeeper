'use client'

import { Plus } from 'lucide-react'
import { useShoppingSuggestions, useAddShoppingItem } from '@/hooks/useShopping'
import { useState } from 'react'

interface Suggestion {
  name: string
  category: string
  reason: string
}

export default function SuggestionsBanner() {
  const { data: suggestions } = useShoppingSuggestions()
  const addItem = useAddShoppingItem()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = (suggestions ?? []).filter((s: Suggestion) => !dismissed.has(s.name))

  if (!visible.length) return null

  const handleAdd = async (suggestion: Suggestion) => {
    setDismissed((prev) => new Set(prev).add(suggestion.name))
    await addItem.mutateAsync({
      name: suggestion.name,
      category: suggestion.category,
    })
  }

  return (
    <div className="mx-5 mb-4 rounded-2xl bg-white p-4 shadow-card">
      <p className="mb-3 text-xs font-semibold text-gray-500">추천 항목</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {visible.map((s: Suggestion) => (
          <button
            key={s.name}
            onClick={() => handleAdd(s)}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3.5 py-2 text-sm transition-colors hover:border-mint/30 hover:bg-mint/5 active:scale-[0.97]"
          >
            <span className="font-medium text-navy">{s.name}</span>
            <Plus className="h-3.5 w-3.5 text-mint" />
            <span className="sr-only">추가</span>
          </button>
        ))}
      </div>
      {visible.some((s: Suggestion) => s.reason) && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {visible.map((s: Suggestion) => (
            <span
              key={`reason-${s.name}`}
              className="flex-shrink-0 text-[10px] text-gray-400"
            >
              {s.name}: {s.reason}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
