'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useIngredients, useConsumeIngredient, useWasteIngredient } from '@/hooks/useIngredients'
import { useFridgeStore } from '@/stores/fridgeStore'
import { useCheckNotifications } from '@/hooks/useNotifications'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { PushPermissionBanner } from '@/components/notifications/PushPermissionBanner'
import { Badge } from '@/components/ui/badge'
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

function getFreshnessStyle(status: Ingredient['freshnessStatus']): string {
  switch (status) {
    case 'fresh':
      return 'bg-freshness-fresh/10 text-freshness-fresh border-freshness-fresh/20'
    case 'caution':
      return 'bg-freshness-caution/10 text-freshness-caution border-freshness-caution/20'
    case 'urgent':
      return 'bg-freshness-urgent/10 text-freshness-urgent border-freshness-urgent/20'
    case 'expired':
      return 'bg-freshness-expired/10 text-freshness-expired border-freshness-expired/20'
  }
}

function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const consume = useConsumeIngredient()
  const waste = useWasteIngredient()
  const daysLeft = getDaysLeft(ingredient.expiryDate)
  const category = CATEGORIES[ingredient.category]

  return (
    <Link href={`/fridge/${ingredient.id}`}>
      <div className="group relative flex flex-col items-center rounded-2xl bg-white p-3 shadow-sm transition-all hover:shadow-md active:scale-95">
        {/* Emoji */}
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-2xl">
          {category?.emoji ?? '📦'}
        </div>

        {/* Name */}
        <p className="mb-1 w-full truncate text-center text-xs font-semibold text-navy">
          {ingredient.name}
        </p>

        {/* Quantity */}
        <p className="mb-1.5 text-xs text-gray-400">
          {ingredient.quantity}{ingredient.unit}
        </p>

        {/* D-day badge */}
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getFreshnessStyle(
            ingredient.freshnessStatus
          )}`}
        >
          {getDayLabel(daysLeft)}
        </span>

        {/* Quick actions on hover */}
        <div className="absolute inset-x-1 bottom-1 hidden gap-1 group-hover:flex" onClick={(e) => e.preventDefault()}>
          <button
            onClick={(e) => { e.preventDefault(); consume.mutate(ingredient.id) }}
            className="flex flex-1 items-center justify-center gap-0.5 rounded-lg bg-mint/90 py-1 text-[10px] font-medium text-white"
          >
            <CheckCircle className="h-3 w-3" /> 소비
          </button>
          <button
            onClick={(e) => { e.preventDefault(); waste.mutate(ingredient.id) }}
            className="flex flex-1 items-center justify-center gap-0.5 rounded-lg bg-accent-red/90 py-1 text-[10px] font-medium text-white"
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
      <div className="sticky top-0 z-10 bg-bg px-4 pb-3 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-navy">내 냉장고</h1>
          <div className="flex items-center gap-2">
            <NotificationBell onClick={() => setIsNotifOpen(true)} />
            <button
              onClick={handleRefresh}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="새로고침"
            >
              <RefreshCw className={`h-4 w-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/scan">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-mint shadow-sm">
                <Plus className="h-5 w-5 text-white" />
              </button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="식재료 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border-gray-100 bg-white pl-9 text-sm shadow-sm"
          />
        </div>

        {/* Storage filter tabs */}
        <div className="flex gap-2">
          {STORAGE_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStorageFilter(key)}
              className={`flex-1 rounded-xl py-1.5 text-sm font-medium transition-colors ${
                storageFilter === key
                  ? 'bg-mint text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <PushPermissionBanner />
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      <div className="px-4">
        {/* Urgent alert banner */}
        {urgentItems.length > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-accent-red/10 px-4 py-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-accent-red" />
            <div>
              <p className="text-sm font-semibold text-accent-red">
                유통기한 임박 {urgentItems.length}개
              </p>
              <p className="text-xs text-accent-red/70">
                {urgentItems.map((i) => i.name).join(', ')} 를 빨리 사용하세요
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
            <div className="mb-4 text-5xl">🥬</div>
            <p className="font-semibold text-navy">냉장고가 비어있어요</p>
            <p className="mt-1 text-sm text-gray-400">
              식재료를 등록해서 관리해보세요
            </p>
            <Link href="/scan">
              <Button className="mt-4 rounded-xl bg-mint px-6 text-white hover:bg-mint-dark">
                식재료 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">총 {filtered.length}개</p>
              <p className="text-xs text-gray-400">유통기한 순</p>
            </div>
            <div className="grid grid-cols-3 gap-3 pb-4">
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
