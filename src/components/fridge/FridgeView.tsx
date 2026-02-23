'use client'

import { useMemo } from 'react'
import { Search, Bell, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDaysLeft } from '@/lib/utils'
import { useIngredients } from '@/hooks/useIngredients'
import { useFridgeStore } from '@/stores/fridgeStore'
import { StorageFilter } from './StorageFilter'
import { CategoryFilter } from './CategoryFilter'
import { IngredientCard } from './IngredientCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import type { Ingredient } from '@/types/ingredient'

export const FridgeView = () => {
  const { data: ingredients = [], isLoading, error } = useIngredients()
  const { storageFilter, categoryFilter, searchQuery, sortBy, setSearchQuery, setSortBy } =
    useFridgeStore()

  const urgentItems = useMemo(
    () =>
      ingredients.filter(
        (i) =>
          !i.isConsumed &&
          !i.isWasted &&
          (i.freshnessStatus === 'urgent' || i.freshnessStatus === 'caution')
      ),
    [ingredients]
  )

  const filtered = useMemo(() => {
    let list = ingredients.filter((i) => !i.isConsumed && !i.isWasted)

    if (storageFilter !== 'all') {
      list = list.filter((i) => i.storageType === storageFilter)
    }
    if (categoryFilter !== 'all') {
      list = list.filter((i) => i.category === categoryFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((i) => i.name.toLowerCase().includes(q))
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'expiry') return getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate)
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko')
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    })

    return list
  }, [ingredients, storageFilter, categoryFilter, searchQuery, sortBy])

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="식재료 검색..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'expiry' | 'name' | 'category' | 'registered')
            }
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint appearance-none"
            aria-label="정렬 기준"
          >
            <option value="expiry">유통기한순</option>
            <option value="name">이름순</option>
            <option value="category">카테고리순</option>
            <option value="registered">등록순</option>
          </select>
        </div>
      </div>

      {/* Storage filter */}
      <StorageFilter />

      {/* Category filter */}
      <CategoryFilter />

      {/* Urgent banner */}
      {urgentItems.length > 0 && (
        <div className="mx-4 mb-3 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <Bell size={16} className="text-freshness-urgent flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            유통기한 임박 재료가{' '}
            <span className="font-bold">{urgentItems.length}개</span> 있어요!
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <LoadingSpinner text="냉장고를 불러오는 중..." />
        ) : error ? (
          <EmptyState
            icon="⚠️"
            title="불러오기 실패"
            description="식재료 목록을 불러오지 못했어요."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🧊"
            title={searchQuery ? '검색 결과가 없어요' : '냉장고가 비어있어요'}
            description={
              searchQuery
                ? `"${searchQuery}"에 해당하는 식재료가 없어요.`
                : '+ 버튼을 눌러 식재료를 등록해보세요!'
            }
          />
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              총 <span className="font-semibold text-navy">{filtered.length}개</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((ingredient: Ingredient) => (
                <IngredientCard key={ingredient.id} ingredient={ingredient} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
