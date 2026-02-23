'use client'

import { useState } from 'react'
import { Receipt, Trash2, ShoppingBag, Upload } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface ReceiptItem {
  id: string
  name: string
  quantity: number
  unit: string
  price: number
}

interface ReceiptData {
  storeName?: string
  date?: string
  items: ReceiptItem[]
  total?: number
}

interface ReceiptScannerProps {
  onAddItems: (items: ReceiptItem[]) => void
  isProcessing?: boolean
}

const MOCK_RECEIPT: ReceiptData = {
  storeName: '이마트 성수점',
  date: '2026-02-23',
  items: [
    { id: '1', name: '계란 (30구)', quantity: 1, unit: '판', price: 7800 },
    { id: '2', name: '우유 (1L)', quantity: 2, unit: '개', price: 5200 },
    { id: '3', name: '닭가슴살', quantity: 500, unit: 'g', price: 6500 },
    { id: '4', name: '양파', quantity: 3, unit: '개', price: 2900 },
  ],
  total: 22400,
}

export const ReceiptScanner = ({ onAddItems, isProcessing = false }: ReceiptScannerProps) => {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    // Simulate OCR processing — in production this would call /api/ai/ocr
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setReceipt(MOCK_RECEIPT)
    setSelectedIds(new Set(MOCK_RECEIPT.items.map((i) => i.id)))
    setIsUploading(false)
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const removeItem = (id: string) => {
    setReceipt((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => i.id !== id) } : null
    )
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleAddSelected = () => {
    if (!receipt) return
    const selected = receipt.items.filter((i) => selectedIds.has(i.id))
    onAddItems(selected)
  }

  if (!receipt) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="w-16 h-16 rounded-full bg-accent-blue/10 flex items-center justify-center">
            <Receipt size={28} className="text-accent-blue" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-navy">영수증 사진을 업로드하세요</p>
            <p className="text-xs text-gray-400 mt-1">AI OCR이 자동으로 식재료를 인식해요</p>
          </div>
          <label className="flex items-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-blue-600 active:scale-95 transition-all shadow-sm">
            {isUploading ? (
              <>
                <LoadingSpinner />
                인식 중...
              </>
            ) : (
              <>
                <Upload size={16} />
                영수증 업로드
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-xs text-accent-blue font-medium mb-1">사용 팁</p>
          <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
            <li>영수증이 잘 보이도록 밝은 곳에서 찍어주세요</li>
            <li>전체 영수증이 프레임 안에 들어오도록 해주세요</li>
            <li>인식 후 수량과 이름을 직접 수정할 수 있어요</li>
          </ul>
        </div>
      </div>
    )
  }

  const selectedTotal = receipt.items
    .filter((i) => selectedIds.has(i.id))
    .reduce((sum, i) => sum + i.price, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Receipt header */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center">
            <ShoppingBag size={18} className="text-accent-blue" />
          </div>
          <div>
            <p className="font-semibold text-navy text-sm">{receipt.storeName ?? '알 수 없는 매장'}</p>
            <p className="text-xs text-gray-400">{receipt.date}</p>
          </div>
          <button
            onClick={() => setReceipt(null)}
            className="ml-auto text-xs text-gray-400 hover:text-freshness-urgent"
          >
            다시 업로드
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <span>인식된 항목 {receipt.items.length}개</span>
          {receipt.total && (
            <span className="font-semibold text-navy">합계 {formatPrice(receipt.total)}</span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-navy">항목 선택</p>
          <button
            onClick={() =>
              setSelectedIds(
                selectedIds.size === receipt.items.length
                  ? new Set()
                  : new Set(receipt.items.map((i) => i.id))
              )
            }
            className="text-xs text-mint font-medium"
          >
            {selectedIds.size === receipt.items.length ? '전체 해제' : '전체 선택'}
          </button>
        </div>

        {receipt.items.map((item) => {
          const isSelected = selectedIds.has(item.id)
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all',
                isSelected
                  ? 'bg-mint/5 border-mint/30'
                  : 'bg-white border-gray-100'
              )}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                  isSelected ? 'bg-mint border-mint' : 'border-gray-300'
                )}
              >
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <div className="flex-1">
                <p className="text-sm font-medium text-navy">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.quantity}
                  {item.unit}
                </p>
              </div>

              <span className="text-sm font-semibold text-navy">{formatPrice(item.price)}</span>

              <button
                onClick={() => removeItem(item.id)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-freshness-urgent hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom action */}
      <div className="sticky bottom-4 pt-2">
        <button
          onClick={handleAddSelected}
          disabled={selectedIds.size === 0 || isProcessing}
          className="w-full py-4 bg-mint text-white rounded-2xl font-semibold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              추가 중...
            </span>
          ) : (
            `선택한 ${selectedIds.size}개 추가 · ${formatPrice(selectedTotal)}`
          )}
        </button>
      </div>
    </div>
  )
}
