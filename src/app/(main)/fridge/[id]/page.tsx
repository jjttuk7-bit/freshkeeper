'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useIngredient, useUpdateIngredient, useConsumeIngredient, useWasteIngredient, useDeleteIngredient } from '@/hooks/useIngredients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES, CATEGORY_OPTIONS } from '@/constants/categories'
import type { IngredientUpdateInput } from '@/types/ingredient'
import {
  ArrowLeft,
  Edit3,
  CheckCircle,
  Trash2,
  Save,
  X,
  Calendar,
  Package,
  Thermometer,
} from 'lucide-react'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ko } from 'date-fns/locale'

const STORAGE_LABELS = { fridge: '냉장', freezer: '냉동', room: '실온' }
const FRESHNESS_LABELS = { fresh: '신선', caution: '주의', urgent: '긴급', expired: '만료' }
const FRESHNESS_COLORS = {
  fresh: 'bg-freshness-fresh/10 text-freshness-fresh border-freshness-fresh/20',
  caution: 'bg-freshness-caution/10 text-freshness-caution border-freshness-caution/20',
  urgent: 'bg-freshness-urgent/10 text-freshness-urgent border-freshness-urgent/20',
  expired: 'bg-freshness-expired/10 text-freshness-expired border-freshness-expired/20',
}
const UNIT_OPTIONS = ['개', 'g', 'kg', 'ml', 'L', '팩', '봉', '묶음', '장']

export default function IngredientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: ingredient, isLoading } = useIngredient(id)
  const updateIngredient = useUpdateIngredient()
  const consumeIngredient = useConsumeIngredient()
  const wasteIngredient = useWasteIngredient()
  const deleteIngredient = useDeleteIngredient()

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<IngredientUpdateInput>({})

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
      </div>
    )
  }

  if (!ingredient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-navy">식재료를 찾을 수 없어요</p>
        <Button onClick={() => router.back()} className="mt-4 bg-mint text-white hover:bg-mint-dark">
          돌아가기
        </Button>
      </div>
    )
  }

  const daysLeft = differenceInDays(parseISO(ingredient.expiryDate), new Date())
  const category = CATEGORIES[ingredient.category]

  const startEdit = () => {
    setEditData({
      name: ingredient.name,
      category: ingredient.category,
      storageType: ingredient.storageType,
      expiryDate: ingredient.expiryDate.split('T')[0],
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      memo: ingredient.memo ?? '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    await updateIngredient.mutateAsync({ id, data: editData })
    setIsEditing(false)
  }

  const handleConsume = async () => {
    await consumeIngredient.mutateAsync(id)
    router.back()
  }

  const handleWaste = async () => {
    await wasteIngredient.mutateAsync(id)
    router.back()
  }

  const handleDelete = async () => {
    if (confirm('이 식재료를 삭제할까요?')) {
      await deleteIngredient.mutateAsync(id)
      router.back()
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-bg px-4 py-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <ArrowLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="font-bold text-navy">식재료 상세</h1>
        {isEditing ? (
          <button onClick={() => setIsEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        ) : (
          <button onClick={startEdit} className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
            <Edit3 className="h-5 w-5 text-navy" />
          </button>
        )}
      </div>

      <div className="px-4 pb-6">
        {/* Hero card */}
        <div className="mb-4 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-4xl">
            {category?.emoji ?? '📦'}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editData.name ?? ''}
                onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                className="mb-1 font-bold"
              />
            ) : (
              <h2 className="text-xl font-bold text-navy">{ingredient.name}</h2>
            )}
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                  FRESHNESS_COLORS[ingredient.freshnessStatus]
                }`}
              >
                {FRESHNESS_LABELS[ingredient.freshnessStatus]}
              </span>
              <span className="text-sm text-gray-500">
                {daysLeft < 0
                  ? `${Math.abs(daysLeft)}일 초과`
                  : daysLeft === 0
                  ? 'D-Day'
                  : `D-${daysLeft}`}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-navy">상세 정보</h3>
          <div className="flex flex-col gap-4">
            {/* Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Package className="h-4 w-4" />
                카테고리
              </div>
              {isEditing ? (
                <select
                  value={editData.category ?? ingredient.category}
                  onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value as typeof ingredient.category }))}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm font-medium text-navy">
                  {category?.emoji} {category?.label}
                </span>
              )}
            </div>

            {/* Storage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Thermometer className="h-4 w-4" />
                보관위치
              </div>
              {isEditing ? (
                <select
                  value={editData.storageType ?? ingredient.storageType}
                  onChange={(e) => setEditData((d) => ({ ...d, storageType: e.target.value as typeof ingredient.storageType }))}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                >
                  <option value="fridge">냉장</option>
                  <option value="freezer">냉동</option>
                  <option value="room">실온</option>
                </select>
              ) : (
                <span className="text-sm font-medium text-navy">
                  {STORAGE_LABELS[ingredient.storageType]}
                </span>
              )}
            </div>

            {/* Expiry */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                유통기한
              </div>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.expiryDate ?? ''}
                  onChange={(e) => setEditData((d) => ({ ...d, expiryDate: e.target.value }))}
                  className="w-40 text-sm"
                />
              ) : (
                <span className="text-sm font-medium text-navy">
                  {format(parseISO(ingredient.expiryDate), 'yyyy년 M월 d일', { locale: ko })}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">수량</span>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editData.quantity ?? 1}
                    onChange={(e) => setEditData((d) => ({ ...d, quantity: Number(e.target.value) }))}
                    className="w-20 text-sm"
                  />
                  <select
                    value={editData.unit ?? ingredient.unit}
                    onChange={(e) => setEditData((d) => ({ ...d, unit: e.target.value }))}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                  >
                    {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              ) : (
                <span className="text-sm font-medium text-navy">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              )}
            </div>

            {/* Memo */}
            {(ingredient.memo || isEditing) && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">메모</span>
                {isEditing ? (
                  <Input
                    value={editData.memo ?? ''}
                    onChange={(e) => setEditData((d) => ({ ...d, memo: e.target.value }))}
                    placeholder="메모 (선택)"
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-navy">{ingredient.memo}</p>
                )}
              </div>
            )}

            {/* Registered at */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">등록일</span>
              <span className="text-sm text-navy">
                {format(parseISO(ingredient.registeredAt), 'yyyy년 M월 d일', { locale: ko })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing ? (
          <Button
            onClick={handleSave}
            disabled={updateIngredient.isPending}
            className="w-full rounded-xl bg-mint py-5 text-base font-bold text-white hover:bg-mint-dark"
          >
            <Save className="mr-2 h-5 w-5" />
            {updateIngredient.isPending ? '저장 중...' : '저장하기'}
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleConsume}
                disabled={consumeIngredient.isPending}
                className="rounded-xl bg-mint py-5 text-base font-bold text-white hover:bg-mint-dark"
              >
                <CheckCircle className="mr-1.5 h-5 w-5" />
                소비 완료
              </Button>
              <Button
                onClick={handleWaste}
                disabled={wasteIngredient.isPending}
                className="rounded-xl bg-accent-orange py-5 text-base font-bold text-white hover:bg-accent-orange/90"
              >
                <Trash2 className="mr-1.5 h-5 w-5" />
                폐기 처리
              </Button>
            </div>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="w-full rounded-xl border-accent-red/30 py-4 text-accent-red hover:bg-accent-red/5"
            >
              삭제하기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
