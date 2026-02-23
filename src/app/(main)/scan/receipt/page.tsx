'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateIngredient } from '@/hooks/useIngredients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { IngredientCreateInput } from '@/types/ingredient'
import { ArrowLeft, Upload, Loader2, CheckCircle, Plus, Receipt } from 'lucide-react'

interface ParsedItem {
  name: string
  quantity: number
  unit: string
  estimatedPrice: number
  selected: boolean
}

export default function ReceiptScanPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const createIngredient = useCreateIngredient()

  const [preview, setPreview] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [items, setItems] = useState<ParsedItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/ai/ocr', { method: 'POST', body: formData })
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message)

      const parsed: ParsedItem[] = (json.data?.items ?? []).map(
        (item: Omit<ParsedItem, 'selected'>) => ({ ...item, selected: true })
      )
      setItems(parsed)
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
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)

      await Promise.all(
        toSave.map((item) => {
          const payload: IngredientCreateInput = {
            name: item.name,
            category: 'other',
            storageType: 'fridge',
            expiryDate: expiryDate.toISOString(),
            quantity: item.quantity,
            unit: item.unit,
            purchasePrice: item.estimatedPrice,
          }
          return createIngredient.mutateAsync(payload)
        })
      )
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
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <ArrowLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="font-bold text-navy">영수증 스캔</h1>
      </div>

      <div className="px-4 pb-6">
        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`mb-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
            preview ? 'border-accent-purple bg-purple-50' : 'border-gray-200 bg-white hover:border-accent-purple/50'
          }`}
        >
          {preview ? (
            <div className="relative w-full">
              <img src={preview} alt="영수증 미리보기" className="max-h-48 w-full rounded-xl object-contain" />
              {isParsing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/50">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
                  <p className="text-sm font-medium text-white">영수증 분석 중...</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <Receipt className="mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-500">영수증을 촬영하거나 업로드하세요</p>
              <p className="mt-1 text-xs text-gray-400">구매 목록을 한 번에 등록해요</p>
              <Button variant="outline" className="mt-3 rounded-xl border-accent-purple text-accent-purple hover:bg-purple-50">
                <Upload className="mr-1.5 h-4 w-4" /> 사진 선택
              </Button>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-accent-red">{error}</div>
        )}

        {/* Parsed items */}
        {items.length > 0 && (
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-navy">인식된 항목 ({items.length}개)</p>
              <p className="text-sm text-gray-400">{selectedCount}개 선택</p>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 transition-colors ${
                    item.selected ? 'border-accent-purple/30 bg-purple-50' : 'border-gray-100 bg-white opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItem(idx)}
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        item.selected ? 'border-accent-purple bg-accent-purple' : 'border-gray-300'
                      }`}
                    >
                      {item.selected && <CheckCircle className="h-4 w-4 text-white" />}
                    </button>
                    <div className="flex flex-1 gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        className="flex-1 text-sm"
                        disabled={!item.selected}
                      />
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        className="w-16 text-sm"
                        disabled={!item.selected}
                      />
                      <span className="flex items-center text-sm text-gray-500">{item.unit}</span>
                    </div>
                  </div>
                  {item.estimatedPrice > 0 && (
                    <p className="mt-1.5 pl-9 text-xs text-gray-400">
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
            className="w-full rounded-xl bg-accent-purple py-5 text-base font-bold text-white hover:bg-accent-purple/90 disabled:opacity-50"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />저장 중...</>
            ) : (
              <><Plus className="mr-2 h-5 w-5" />{selectedCount}개 냉장고에 추가</>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
