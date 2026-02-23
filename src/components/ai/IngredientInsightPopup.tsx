'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Handshake, UtensilsCrossed, AlertTriangle, Snowflake, X } from 'lucide-react'
import type { IngredientAdvice } from '@/lib/ai/ingredient-advisor'

interface IngredientInsightPopupProps {
  advice: IngredientAdvice
  ingredientName: string
  onClose: () => void
}

export default function IngredientInsightPopup({
  advice,
  ingredientName,
  onClose,
}: IngredientInsightPopupProps) {
  const [progress, setProgress] = useState(100)

  const hasContent =
    advice.storageTip ||
    advice.pairingTip ||
    advice.quickRecipe ||
    advice.duplicateWarning ||
    advice.freezeRecommend

  useEffect(() => {
    if (!hasContent) {
      onClose()
      return
    }

    const duration = 6000
    const interval = 50
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [hasContent, onClose])

  if (!hasContent) return null

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 mx-auto max-w-md px-5 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-3xl bg-white p-5 shadow-card">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-purple/10">
              <Lightbulb className="h-4 w-4 text-accent-purple" />
            </div>
            <span className="text-sm font-bold text-navy">
              {ingredientName} AI 팁
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          {advice.duplicateWarning && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-freshness-caution/5 px-3.5 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-freshness-caution" />
              <p className="text-xs leading-relaxed text-gray-600">{advice.duplicateWarning}</p>
            </div>
          )}

          {advice.storageTip && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-mint/5 px-3.5 py-2.5">
              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-mint" />
              <p className="text-xs leading-relaxed text-gray-600">{advice.storageTip}</p>
            </div>
          )}

          {advice.pairingTip && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-accent-blue/5 px-3.5 py-2.5">
              <Handshake className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-blue" />
              <p className="text-xs leading-relaxed text-gray-600">{advice.pairingTip}</p>
            </div>
          )}

          {advice.quickRecipe && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-accent-purple/5 px-3.5 py-2.5">
              <UtensilsCrossed className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-purple" />
              <p className="text-xs leading-relaxed text-gray-600">{advice.quickRecipe}</p>
            </div>
          )}

          {advice.freezeRecommend && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-accent-blue/5 px-3.5 py-2.5">
              <Snowflake className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-blue" />
              <p className="text-xs leading-relaxed text-gray-600">
                유통기한이 짧은 식재료예요. 바로 쓰지 않으면 냉동 보관을 추천해요!
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-accent-purple/30 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
