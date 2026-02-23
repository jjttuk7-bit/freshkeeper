'use client'

import Link from 'next/link'
import { useAIInsights } from '@/hooks/useAI'
import {
  Bot,
  AlertTriangle,
  Lightbulb,
  UtensilsCrossed,
  BarChart3,
  ShoppingCart,
  ChevronRight,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import type { AIInsightCard } from '@/types/ai'

const CARD_STYLES: Record<string, { icon: string; iconBg: string }> = {
  urgent: {
    icon: 'text-freshness-urgent',
    iconBg: 'bg-freshness-urgent/10',
  },
  tip: {
    icon: 'text-mint',
    iconBg: 'bg-mint/10',
  },
  meal_plan: {
    icon: 'text-accent-purple',
    iconBg: 'bg-accent-purple/10',
  },
  status: {
    icon: 'text-navy',
    iconBg: 'bg-gray-100',
  },
  shopping: {
    icon: 'text-accent-blue',
    iconBg: 'bg-accent-blue/10',
  },
}

const CARD_ICONS: Record<string, typeof AlertTriangle> = {
  urgent: AlertTriangle,
  tip: Lightbulb,
  meal_plan: UtensilsCrossed,
  status: BarChart3,
  shopping: ShoppingCart,
}

function InsightCard({ card }: { card: AIInsightCard }) {
  const style = CARD_STYLES[card.type] ?? CARD_STYLES.status
  const IconComponent = CARD_ICONS[card.type] ?? BarChart3

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="mb-2.5 flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${style.iconBg}`}>
          <IconComponent className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-navy">{card.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">{card.message}</p>
        </div>
      </div>
      {card.actions && card.actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">
          {card.actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  card.type === 'urgent'
                    ? 'bg-freshness-urgent/10 text-freshness-urgent hover:bg-freshness-urgent/20'
                    : card.type === 'shopping'
                      ? 'bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20'
                      : 'bg-mint/10 text-mint hover:bg-mint/20'
                }`}
              >
                {action.label}
                <ChevronRight className="h-3 w-3" />
              </Link>
            ) : (
              <button
                key={action.label}
                className="flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100"
              >
                {action.action === 'freeze' && '❄️ '}
                {action.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

function FridgeStatsBar({
  stats,
}: {
  stats: { total: number; urgent: number; caution: number; expired: number; utilizationPercent: number }
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-navy">냉장고 활용도</span>
        <span className="text-lg font-bold text-mint">{stats.utilizationPercent}%</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-mint transition-all duration-500"
          style={{ width: `${stats.utilizationPercent}%` }}
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-2xl bg-gray-50 py-3 text-center">
          <p className="text-lg font-bold text-navy">{stats.total}</p>
          <p className="text-[11px] text-gray-400">전체</p>
        </div>
        <div className="rounded-2xl bg-freshness-urgent/5 py-3 text-center">
          <p className="text-lg font-bold text-freshness-urgent">{stats.urgent}</p>
          <p className="text-[11px] text-gray-400">긴급</p>
        </div>
        <div className="rounded-2xl bg-freshness-caution/5 py-3 text-center">
          <p className="text-lg font-bold text-freshness-caution">{stats.caution}</p>
          <p className="text-[11px] text-gray-400">주의</p>
        </div>
        <div className="rounded-2xl bg-gray-50 py-3 text-center">
          <p className="text-lg font-bold text-gray-400">{stats.expired}</p>
          <p className="text-[11px] text-gray-400">만료</p>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-5 shadow-card">
      <div className="mb-3 flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-gray-100" />
          <div className="h-3 w-full rounded bg-gray-50" />
          <div className="h-3 w-4/5 rounded bg-gray-50" />
        </div>
      </div>
    </div>
  )
}

export default function AIDashboardPage() {
  const { data, isLoading, error, refetch, isRefetching } = useAIInsights()

  return (
    <div className="px-5 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/10">
            <Bot className="h-6 w-6 text-accent-purple" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-navy">AI 매니저</h1>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-card"
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${isRefetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          <div className="mb-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-accent-purple" />
            <span className="text-sm text-gray-400">AI가 냉장고를 분석 중이에요...</span>
          </div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-freshness-urgent/10">
            <Trash2 className="h-8 w-8 text-freshness-urgent" />
          </div>
          <p className="text-sm text-gray-400">인사이트를 불러오지 못했어요</p>
          <button
            onClick={() => refetch()}
            className="rounded-2xl bg-mint px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Data */}
      {data && !isLoading && (
        <div className="flex flex-col gap-3 animate-stagger">
          {/* Greeting */}
          <div className="rounded-3xl bg-gray-50 p-5">
            <p className="text-sm font-medium leading-relaxed text-navy">{data.greeting}</p>
          </div>

          {/* Fridge Stats */}
          <FridgeStatsBar stats={data.fridgeStats} />

          {/* Insight Cards */}
          {data.cards.map((card) => (
            <InsightCard key={card.id} card={card} />
          ))}

          {/* Empty state */}
          {data.cards.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Bot className="h-12 w-12 text-gray-200" />
              <p className="text-sm text-gray-400">아직 분석할 재료가 없어요</p>
              <Link
                href="/scan"
                className="rounded-2xl bg-mint px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform"
              >
                식재료 등록하기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
