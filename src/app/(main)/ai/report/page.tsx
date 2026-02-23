'use client'

import { useState } from 'react'
import { useWeeklyReport } from '@/hooks/useAI'
import {
  Trophy,
  TrendingDown,
  TrendingUp,
  Minus,
  UtensilsCrossed,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileBarChart,
  Trash2,
} from 'lucide-react'

function WeekNavigator({
  weekLabel,
  onPrev,
  onNext,
  canNext,
}: {
  weekLabel: string
  onPrev: () => void
  onNext: () => void
  canNext: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
      <button
        onClick={onPrev}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
      >
        <ChevronLeft className="h-4 w-4 text-gray-600" />
      </button>
      <span className="text-sm font-bold text-navy">{weekLabel}</span>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  )
}

function MealPlanAccordion({ mealPlan }: { mealPlan: { day: string; meals: string[] }[] }) {
  const [openDay, setOpenDay] = useState<string | null>(null)

  return (
    <div className="rounded-2xl border border-accent-purple/20 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <UtensilsCrossed className="h-4 w-4 text-accent-purple" />
        <h3 className="text-sm font-bold text-navy">추천 식단</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {mealPlan.map(({ day, meals }) => (
          <div key={day}>
            <button
              onClick={() => setOpenDay(openDay === day ? null : day)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <span className="font-semibold text-navy">{day}요일</span>
              {openDay === day ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {openDay === day && (
              <div className="bg-accent-purple/5 px-4 py-2.5">
                {meals.map((meal, i) => (
                  <p key={i} className="py-0.5 text-xs text-gray-600">
                    {meal}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AIReportPage() {
  const [weekOffset, setWeekOffset] = useState(0)

  const getWeekParam = () => {
    if (weekOffset === 0) return undefined
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return d.toISOString().split('T')[0]
  }

  const { data, isLoading, error, refetch } = useWeeklyReport(getWeekParam())

  const WasteTrendIcon =
    data?.wasteStats.trend === 'up'
      ? TrendingUp
      : data?.wasteStats.trend === 'down'
        ? TrendingDown
        : Minus

  const wasteTrendColor =
    data?.wasteStats.trend === 'up'
      ? 'text-freshness-urgent'
      : data?.wasteStats.trend === 'down'
        ? 'text-freshness-fresh'
        : 'text-gray-400'

  const wasteTrendLabel =
    data?.wasteStats.trend === 'up'
      ? '지난 주보다 증가'
      : data?.wasteStats.trend === 'down'
        ? '지난 주보다 감소'
        : '지난 주와 동일'

  const weekLabel = data ? `${data.period.start} ~ ${data.period.end}` : '이번 주'

  return (
    <div className="px-4 py-5">
      {/* Week Navigator */}
      <WeekNavigator
        weekLabel={weekLabel}
        onPrev={() => setWeekOffset((p) => p - 1)}
        onNext={() => setWeekOffset((p) => p + 1)}
        canNext={weekOffset < 0}
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="relative">
            <FileBarChart className="h-10 w-10 text-accent-purple/30" />
            <Loader2 className="absolute -right-1 -bottom-1 h-5 w-5 animate-spin text-accent-purple" />
          </div>
          <p className="text-sm text-gray-400">AI가 주간 리포트를 생성 중이에요...</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Trash2 className="h-10 w-10 text-freshness-urgent/50" />
          <p className="text-sm text-gray-500">리포트를 불러오지 못했어요</p>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-accent-purple px-4 py-2 text-sm font-semibold text-white hover:bg-accent-purple/90"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Report Content */}
      {data && !isLoading && (
        <div className="mt-3 flex flex-col gap-3">
          {/* Waste Stats Badge */}
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-semibold text-navy">폐기 현황</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-navy">{data.wasteStats.count}개</span>
              <div className={`flex items-center gap-0.5 ${wasteTrendColor}`}>
                <WasteTrendIcon className="h-4 w-4" />
                <span className="text-xs font-medium">{wasteTrendLabel}</span>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="rounded-2xl border border-freshness-fresh/20 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-freshness-fresh" />
              <h3 className="text-sm font-bold text-navy">잘한 점</h3>
            </div>
            <div className="flex flex-col gap-2">
              {data.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-freshness-fresh/10 text-xs text-freshness-fresh">
                    ✓
                  </span>
                  <p className="text-sm text-gray-600">{h}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div className="rounded-2xl border border-freshness-caution/20 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-freshness-caution" />
              <h3 className="text-sm font-bold text-navy">개선 포인트</h3>
            </div>
            <div className="flex flex-col gap-2">
              {data.improvements.map((imp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-freshness-caution/10 text-xs text-freshness-caution">
                    !
                  </span>
                  <p className="text-sm text-gray-600">{imp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Meal Plan */}
          <MealPlanAccordion mealPlan={data.mealPlan} />

          {/* Shopping Suggestions */}
          {data.shoppingSuggestions.length > 0 && (
            <div className="rounded-2xl border border-accent-blue/20 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-accent-blue" />
                <h3 className="text-sm font-bold text-navy">장보기 추천</h3>
              </div>
              <div className="flex flex-col gap-2">
                {data.shoppingSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-accent-blue/5 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
