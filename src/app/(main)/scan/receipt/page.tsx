'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateIngredient, useIngredients } from '@/hooks/useIngredients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { IngredientCreateInput, IngredientCategory, StorageType } from '@/types/ingredient'
import { classifyFood, getFoodTip } from '@/lib/food-classifier'
import { getIngredientAdvice, type IngredientAdvice } from '@/lib/ai/ingredient-advisor'
import IngredientInsightPopup from '@/components/ai/IngredientInsightPopup'
import { useUiStore } from '@/stores/uiStore'
import { ArrowLeft, Upload, Loader2, CheckCircle, Plus, Receipt } from 'lucide-react'

interface ParsedItem {
  name: string
  quantity: number
  unit: string
  estimatedPrice: number
  category: IngredientCategory
  storageType: StorageType
  shelfLifeDays: number
  tip: string | null
  selected: boolean
}

export default function ReceiptScanPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const createIngredient = useCreateIngredient()
  const { data: existingIngredients } = useIngredients()
  const addToast = useUiStore((s) => s.addToast)

  const [preview, setPreview] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [items, setItems] = useState<ParsedItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advice, setAdvice] = useState<{ name: string; advice: IngredientAdvice } | null>(null)

  const showAdviceForItem = useCallback(
    (itemName: string) => {
      const existingNames = existingIngredients?.map((i) => i.name) ?? []
      const result = getIngredientAdvice(itemName, existingNames)
      setAdvice({ name: itemName, advice: result })
    },
    [existingIngredients]
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setIsParsing(true)
    setError(null)
    setItems([])

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve((r.result as string).split(',')[1])
        r.onerror = reject
        r.readAsDataURL(file)
      })

      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message)

      const ocrItems = json.data?.items ?? []
      const parsed: ParsedItem[] = ocrItems.map(
        (item: { name: string; price: number; quantity: number }) => {
          const classification = classifyFood(item.name)
          return {
            name: item.name,
            quantity: item.quantity,
            unit: '개',
            estimatedPrice: item.price,
            category: classification?.category ?? 'other',
            storageType: classification?.defaultStorage ?? 'fridge',
            shelfLifeDays: classification
              ? classification.shelfLife[classification.defaultStorage]
              : 7,
            tip: getFoodTip(item.name),
            selected: true,
          }
        }
      )
      setItems(parsed)
      if (parsed.length > 0) {
        showAdviceForItem(parsed[0].name)
      }
    } catch {
      setError('영수증 인식에 실패했어요. 더 선명한 사진으로 다시 시도해주세요')
    } finally {
      setIsParsing(false)
    }
  }

  const toggleItem = (idx: number) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item)))

  const updateItem = (idx: number, field: keyof ParsedItem, value: string | number | boolean) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))

  const handleSave = async () => {
    const toSave = items.filter((i) => i.selected)
    if (!toSave.length) return

    setIsSaving(true)
    try {
      await Promise.all(
        toSave.map((item) => {
          const expiryDate = new Date()
          expiryDate.setDate(expiryDate.getDate() + item.shelfLifeDays)
          const payload: IngredientCreateInput = {
            name: item.name,
            category: item.category,
            storageType: item.storageType,
            expiryDate: expiryDate.toISOString(),
            quantity: item.quantity,
            unit: item.unit,
            purchasePrice: item.estimatedPrice,
          }
          return createIngredient.mutateAsync(payload)
        })
      )
      const tipItem = toSave.find((i) => i.tip)
      if (tipItem?.tip) {
        addToast(`💡 ${tipItem.name}: ${tipItem.tip}`, 'info')
      }
      router.push('/fridge')
    } catch {
      setError('저장 중 오류가 발생했어요')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedCount = items.filter((i) => i.selected).length

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-card">
          <ArrowLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-navy">영수증 스캔</h1>
      </div>

      <div className="px-5 pb-6">
        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`mb-4 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-3xl transition-all ${
            preview ? 'bg-accent-purple/5 shadow-card' : 'bg-white shadow-card hover:shadow-card-hover'
          }`}
        >
          {preview ? (
            <div className="relative w-full">
              <img src={preview} alt="영수증 미리보기" className="max-h-48 w-full rounded-3xl object-contain p-2" />
              {isParsing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-black/50">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
                  <p className="text-sm font-medium text-white">영수증 분석 중...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-purple/10">
                <Receipt className="h-8 w-8 text-accent-purple" />
              </div>
              <p className="font-semibold text-navy">영수증을 촬영하거나 업로드하세요</p>
              <p className="mt-1 text-sm text-gray-400">구매 목록을 한 번에 등록해요</p>
              <button className="mt-4 flex items-center gap-1.5 rounded-2xl bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/20 active:scale-[0.98] transition-transform">
                <Upload className="h-4 w-4" /> 사진 선택
              </button>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-accent-red">{error}</div>
        )}

        {/* Parsed items */}
        {items.length > 0 && (
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-navy">인식된 항목 ({items.length}개)</p>
              <p className="text-xs text-gray-400">{selectedCount}개 선택</p>
            </div>
            <div className="flex flex-col gap-2.5 animate-stagger">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-4 transition-all ${
                    item.selected ? 'bg-white shadow-card' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItem(idx)}
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        item.selected ? 'bg-accent-purple' : 'border-2 border-gray-200'
                      }`}
                    >
                      {item.selected && <CheckCircle className="h-4 w-4 text-white" />}
                    </button>
                    <div className="flex flex-1 gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        className="flex-1 rounded-2xl border-0 bg-gray-50 text-sm focus:ring-2 focus:ring-accent-purple/20"
                        disabled={!item.selected}
                      />
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        className="w-16 rounded-2xl border-0 bg-gray-50 text-sm focus:ring-2 focus:ring-accent-purple/20"
                        disabled={!item.selected}
                      />
                      <span className="flex items-center text-sm text-gray-400">{item.unit}</span>
                    </div>
                  </div>
                  {item.tip && (
                    <p className="mt-1.5 pl-9 text-xs text-accent-purple">💡 {item.tip}</p>
                  )}
                  {item.estimatedPrice > 0 && (
                    <p className="mt-1 pl-9 text-xs text-gray-400">
                      {item.estimatedPrice.toLocaleString()}원
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedCount === 0}
            className="w-full rounded-2xl bg-accent-purple py-4 text-[15px] font-semibold text-white shadow-lg shadow-accent-purple/20 hover:bg-accent-purple/90 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />저장 중...</>
            ) : (
              <><Plus className="mr-2 h-5 w-5" />{selectedCount}개 냉장고에 추가</>
            )}
          </Button>
        )}
      </div>

      {/* AI Insight Popup */}
      {advice && (
        <IngredientInsightPopup
          advice={advice.advice}
          ingredientName={advice.name}
          onClose={() => setAdvice(null)}
        />
      )}
    </div>
  )
}
