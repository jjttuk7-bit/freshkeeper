'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useIngredients, useConsumeIngredient, useWasteIngredient } from '@/hooks/useIngredients'
import { useFridgeStore } from '@/stores/fridgeStore'
import { useCheckNotifications } from '@/hooks/useNotifications'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { PushPermissionBanner } from '@/components/notifications/PushPermissionBanner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/constants/categories'
import type { Ingredient, StorageType } from '@/types/ingredient'
import {
  Search,
  Plus,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Trash2,
} from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'

const STORAGE_TABS: { key: StorageType | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'fridge', label: '냉장' },
  { key: 'freezer', label: '냉동' },
  { key: 'room', label: '실온' },
]

function getDaysLeft(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), new Date())
}

function getDayLabel(daysLeft: number): string {
  if (daysLeft < 0) return '만료'
  if (daysLeft === 0) return 'D-Day'
  return `D-${daysLeft}`
}

function getFreshnessDotColor(status: Ingredient['freshnessStatus']): string {
  switch (status) {
    case 'fresh': return 'bg-freshness-fresh'
    case 'caution': return 'bg-freshness-caution'
    case 'urgent': return 'bg-freshness-urgent'
    case 'expired': return 'bg-freshness-expired'
  }
}

function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const consume = useConsumeIngredient()
  const waste = useWasteIngredient()
  const daysLeft = getDaysLeft(ingredient.expiryDate)
  const category = CATEGORIES[ingredient.category]
  const dotColor = getFreshnessDotColor(ingredient.freshnessStatus)

  return (
    <Link href={`/fridge/${ingredient.id}`}>
      <div className="group relative flex flex-col items-center rounded-3xl bg-white p-5 shadow-card transition-all hover:shadow-card-hover active:scale-[0.97]">
        {/* Emoji */}
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl">
          {category?.emoji ?? '📦'}
        </div>

        {/* Name */}
        <p className="mb-1 w-full truncate text-center text-sm font-semibold text-navy">
          {ingredient.name}
        </p>

        {/* Quantity */}
        <p className="mb-2 text-xs text-gray-400">
          {ingredient.quantity}{ingredient.unit}
        </p>

        {/* Freshness dot + D-day */}
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          <span className="text-xs text-gray-400" suppressHydrationWarning>
            {getDayLabel(daysLeft)}
          </span>
        </div>

        {/* Quick actions on hover */}
        <div className="absolute inset-x-2 bottom-2 hidden gap-1.5 group-hover:flex" onClick={(e) => e.preventDefault()}>
          <button
            onClick={(e) => { e.preventDefault(); consume.mutate(ingredient.id) }}
            className="flex flex-1 items-center justify-center gap-0.5 rounded-2xl bg-mint/90 py-1.5 text-[10px] font-medium text-white"
          >
            <CheckCircle className="h-3 w-3" /> 소비
          </button>
          <button
            onClick={(e) => { e.preventDefault(); waste.mutate(ingredient.id) }}
            className="flex flex-1 items-center justify-center gap-0.5 rounded-2xl bg-accent-red/90 py-1.5 text-[10px] font-medium text-white"
          >
            <Trash2 className="h-3 w-3" /> 폐기
          </button>
        </div>
      </div>
    </Link>
  )
}

export default function FridgePage() {
  const { data: ingredients, isLoading, refetch } = useIngredients()
  const { storageFilter, searchQuery, setStorageFilter, setSearchQuery } = useFridgeStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  useCheckNotifications()

  const filtered = useMemo(() => {
    if (!ingredients) return []
    return ingredients
      .filter((i) => !i.isConsumed && !i.isWasted)
      .filter((i) => storageFilter === 'all' || i.storageType === storageFilter)
      .filter((i) =>
        searchQuery ? i.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )
      .sort((a, b) => getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate))
  }, [ingredients, storageFilter, searchQuery])

  const urgentItems = useMemo(
    () => filtered.filter((i) => i.freshnessStatus === 'urgent' || i.freshnessStatus === 'expired'),
    [filtered]
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg px-5 pb-4 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-navy">내 냉장고</h1>
          <div className="flex items-center gap-2">
            <NotificationBell onClick={() => setIsNotifOpen(true)} />
            <button
              onClick={handleRefresh}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-card"
              aria-label="새로고침"
            >
              <RefreshCw className={`h-4 w-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/scan">
              <button className="flex h-9 w-9 items-center justify-center rounded-2xl bg-mint shadow-card">
                <Plus className="h-5 w-5 text-white" />
              </button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
          <Input
            placeholder="식재료 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-2xl border-0 bg-white pl-10 py-3 text-[15px] shadow-card focus:ring-2 focus:ring-mint/20"
          />
        </div>

        {/* Storage filter tabs */}
        <div className="flex gap-2">
          {STORAGE_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStorageFilter(key)}
              className={`flex-1 rounded-2xl py-2 text-[13px] font-medium transition-all ${
                storageFilter === key
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-white text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <PushPermissionBanner />
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      <div className="px-5">
        {/* Urgent alert banner */}
        {urgentItems.length > 0 && (
          <div className="mb-5 flex items-center gap-3 rounded-3xl bg-freshness-urgent/5 p-5 shadow-card">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-freshness-urgent/10">
              <AlertTriangle className="h-5 w-5 text-freshness-urgent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">
                유통기한 임박 {urgentItems.length}개
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {urgentItems.map((i) => i.name).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 text-6xl">🥬</div>
            <p className="text-base font-semibold text-navy">냉장고가 비어있어요</p>
            <p className="mt-1.5 text-sm text-gray-400">
              식재료를 등록해서 관리해보세요
            </p>
            <Link href="/scan">
              <Button className="mt-5 rounded-2xl bg-mint px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-mint/20 hover:bg-mint-dark active:scale-[0.98] transition-transform">
                식재료 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">총 {filtered.length}개</p>
              <p className="text-xs text-gray-300">유통기한 순</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pb-4 animate-stagger">
              {filtered.map((ingredient) => (
                <IngredientCard key={ingredient.id} ingredient={ingredient} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
