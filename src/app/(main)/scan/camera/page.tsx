'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateIngredient, useIngredients } from '@/hooks/useIngredients'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/constants/categories'
import type { IngredientCreateInput, IngredientCategory } from '@/types/ingredient'
import { classifyFood, getFoodTip } from '@/lib/food-classifier'
import { getIngredientAdvice, type IngredientAdvice } from '@/lib/ai/ingredient-advisor'
import IngredientInsightPopup from '@/components/ai/IngredientInsightPopup'
import { useUiStore } from '@/stores/uiStore'
import {
  ArrowLeft,
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  RefreshCw,
  Plus,
} from 'lucide-react'

interface RecognizedItem {
  name: string
  category: IngredientCategory
  quantity: number
  unit: string
  freshness: string
  confidence: number
  storageType: 'fridge' | 'freezer' | 'room'
  shelfLifeDays: number
  tip: string | null
  selected: boolean
}

export default function CameraPage() {
  const router = useRouter()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const createIngredient = useCreateIngredient()
  const { data: existingIngredients } = useIngredients()
  const addToast = useUiStore((s) => s.addToast)

  const [preview, setPreview] = useState<string | null>(null)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognized, setRecognized] = useState<RecognizedItem[]>([])
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

    await recognizeIngredients(file)
  }

  const recognizeIngredients = async (file: File) => {
    setIsRecognizing(true)
    setError(null)
    setRecognized([])

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/ai/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })
      const json = await res.json()

      if (!json.success) throw new Error(json.error?.message)

      const data = Array.isArray(json.data) ? json.data : (json.data?.ingredients ?? [])
      const items: RecognizedItem[] = data.map(
        (item: Omit<RecognizedItem, 'selected'>) => {
          const classification = classifyFood(item.name)
          const tip = getFoodTip(item.name)
          if (classification) {
            return {
              ...item,
              category: classification.category,
              storageType: classification.defaultStorage,
              shelfLifeDays: classification.shelfLife[classification.defaultStorage],
              tip,
              selected: true,
            }
          }
          return {
            ...item,
            storageType: item.storageType || 'fridge',
            shelfLifeDays: item.shelfLifeDays || 7,
            tip,
            selected: true,
          }
        }
      )
      setRecognized(items)
      if (items.length > 0) {
        showAdviceForItem(items[0].name)
      }
    } catch (err) {
      setError('AI 인식에 실패했어요. 다시 시도하거나 직접 입력해주세요')
    } finally {
      setIsRecognizing(false)
    }
  }

  const toggleItem = (idx: number) => {
    setRecognized((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
    )
  }

  const handleSave = async () => {
    const toSave = recognized.filter((i) => i.selected)
    if (!toSave.length) return

    setIsSaving(true)
    try {
      await Promise.all(
        toSave.map((item) => {
          const expiry = new Date()
          expiry.setDate(expiry.getDate() + item.shelfLifeDays)
          const payload: IngredientCreateInput = {
            name: item.name,
            category: item.category,
            storageType: item.storageType,
            expiryDate: expiry.toISOString(),
            quantity: item.quantity,
            unit: item.unit,
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

  const selectedCount = recognized.filter((i) => i.selected).length

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-card"
        >
          <ArrowLeft className="h-5 w-5 text-navy" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-navy">사진으로 등록</h1>
      </div>

      <div className="px-5 pb-6">
        {/* Upload area */}
        <div
          className={`mb-4 flex min-h-56 flex-col items-center justify-center rounded-3xl transition-colors ${
            preview ? 'bg-mint/5 shadow-card' : 'bg-white shadow-card'
          }`}
        >
          {preview ? (
            <div className="relative w-full">
              <img src={preview} alt="미리보기" className="max-h-64 w-full rounded-3xl object-contain p-2" />
              {isRecognizing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-black/50">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
                  <p className="text-sm font-medium text-white">AI 인식 중...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/10">
                <Camera className="h-8 w-8 text-mint" />
              </div>
              <p className="font-semibold text-navy">사진을 선택하거나 촬영하세요</p>
              <p className="mt-1 text-sm text-gray-400">여러 식재료를 한 번에 인식해요</p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-2xl bg-mint px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform"
                >
                  <Camera className="h-4 w-4" /> 촬영
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-navy shadow-card active:scale-[0.98] transition-transform"
                >
                  <Upload className="h-4 w-4" /> 갤러리
                </button>
              </div>
            </div>
          )}
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-accent-red">{error}</div>
        )}

        {/* Retry button */}
        {preview && !isRecognizing && (
          <button
            onClick={() => galleryRef.current?.click()}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm text-gray-400 shadow-card active:scale-[0.98] transition-transform"
          >
            <RefreshCw className="h-4 w-4" /> 다른 사진 선택
          </button>
        )}

        {/* Recognized results */}
        {recognized.length > 0 && (
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-navy">인식된 식재료 ({recognized.length}개)</p>
              <p className="text-xs text-gray-400">{selectedCount}개 선택됨</p>
            </div>
            <div className="flex flex-col gap-2.5 animate-stagger">
              {recognized.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleItem(idx)}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl p-4 transition-all ${
                    item.selected ? 'bg-white shadow-card' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 text-xl">
                    {CATEGORIES[item.category]?.emoji ?? '📦'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-navy">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.quantity}{item.unit} · {{ fridge: '냉장', freezer: '냉동', room: '실온' }[item.storageType]} · D-{item.shelfLifeDays}
                    </p>
                    {item.tip && (
                      <p className="mt-0.5 text-xs text-mint-dark">💡 {item.tip}</p>
                    )}
                  </div>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    item.selected ? 'bg-mint' : 'border-2 border-gray-200'
                  }`}>
                    {item.selected && <CheckCircle className="h-4 w-4 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save button */}
        {recognized.length > 0 && (
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedCount === 0}
            className="w-full rounded-2xl bg-mint py-4 text-[15px] font-semibold text-white shadow-lg shadow-mint/20 hover:bg-mint-dark active:scale-[0.98] transition-transform disabled:opacity-50"
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
