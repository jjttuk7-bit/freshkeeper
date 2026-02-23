'use client'

import { useMonthlyAnalytics, useWasteStats } from '@/hooks/useAnalytics'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { TrendingUp, Trash2, Award, BarChart3 } from 'lucide-react'

const PIE_COLORS = ['#00D4AA', '#3A86FF', '#FF6B35', '#FFBE0B', '#8338EC', '#FF006E', '#A0AEC0']

const CATEGORY_LABELS: Record<string, string> = {
  vegetable: '채소',
  meat: '육류',
  seafood: '수산물',
  dairy: '유제품',
  grain: '곡물',
  sauce: '양념',
  fruit: '과일',
  other: '기타',
}

function formatMonth(month: string): string {
  const [, m] = month.split('-')
  return `${parseInt(m)}월`
}

function formatKRW(amount: number): string {
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}만원`
  return `${amount.toLocaleString()}원`
}

export default function AnalyticsPage() {
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyAnalytics(6)
  const { data: waste, isLoading: wasteLoading } = useWasteStats()

  const isLoading = monthlyLoading || wasteLoading
  const latestMonth = monthly?.[monthly.length - 1]

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-navy">식비 분석</h1>
        <p className="mt-0.5 text-sm text-gray-400">최근 6개월 현황</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
        </div>
      ) : (
        <div className="px-4 pb-6 flex flex-col gap-4">
          {/* Savings badge */}
          {waste && (
            <div className="rounded-2xl bg-gradient-to-br from-mint to-mint-dark p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-5 w-5 text-white/80" />
                <span className="text-sm font-medium text-white/80">이번 달 절감 효과</span>
              </div>
              <p className="text-3xl font-bold">{formatKRW(waste.savedAmount)}</p>
              <p className="mt-1 text-sm text-white/70">
                음식물 낭비를 줄여 절약한 금액이에요
              </p>
              <div className="mt-3 flex items-center gap-1">
                <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${Math.max(0, 100 - waste.wasteRate)}%` }}
                  />
                </div>
                <span className="text-xs text-white/70 ml-2">
                  활용률 {Math.round(100 - waste.wasteRate)}%
                </span>
              </div>
            </div>
          )}

          {/* Monthly spending chart */}
          {monthly && monthly.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-mint" />
                <h2 className="font-semibold text-navy">월별 식비</h2>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 11, fill: '#A0AEC0' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#A0AEC0' }}
                    tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()}원`, '식비']}
                    labelFormatter={formatMonth}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalSpent" fill="#00D4AA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {latestMonth && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-mint-light p-3">
                  <span className="text-sm text-navy">이번 달 총 식비</span>
                  <span className="font-bold text-mint">{latestMonth.totalSpent.toLocaleString()}원</span>
                </div>
              )}
            </div>
          )}

          {/* Category breakdown pie */}
          {latestMonth?.categoryBreakdown && latestMonth.categoryBreakdown.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-4 font-semibold text-navy">카테고리별 지출</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={latestMonth.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="amount"
                    nameKey="category"
                    paddingAngle={3}
                  >
                    {latestMonth.categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()}원`]}
                    labelFormatter={(label) => CATEGORY_LABELS[label] ?? label}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    formatter={(value) => CATEGORY_LABELS[value] ?? value}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Waste stats */}
          {waste && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-accent-orange" />
                <h2 className="font-semibold text-navy">음식물 낭비 통계</h2>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-navy">{waste.totalRegistered}</p>
                  <p className="text-xs text-gray-400">등록</p>
                </div>
                <div className="rounded-xl bg-freshness-urgent/10 p-3 text-center">
                  <p className="text-lg font-bold text-freshness-urgent">{waste.totalWasted}</p>
                  <p className="text-xs text-gray-400">폐기</p>
                </div>
                <div className="rounded-xl bg-mint-light p-3 text-center">
                  <p className="text-lg font-bold text-mint">
                    {waste.totalRegistered > 0
                      ? Math.round(100 - waste.wasteRate)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-400">활용률</p>
                </div>
              </div>

              {/* Waste rate bar */}
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">낭비율</span>
                  <span className="text-xs font-semibold text-accent-orange">
                    {waste.wasteRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-accent-orange transition-all"
                    style={{ width: `${Math.min(waste.wasteRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Top wasted items */}
              {waste.topWasted.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">자주 버리는 식재료</p>
                  <div className="flex flex-col gap-1.5">
                    {waste.topWasted.slice(0, 5).map((item, idx) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-4 text-xs font-bold text-gray-400">{idx + 1}</span>
                        <span className="flex-1 text-sm text-navy">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.count}회</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Monthly trend */}
          {monthly && monthly.length > 1 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent-blue" />
                <h2 className="font-semibold text-navy">월별 낭비 비교</h2>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name === 'totalWasted' ? '폐기' : '소비']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalConsumed" fill="#00D4AA" radius={[4, 4, 0, 0]} name="소비" />
                  <Bar dataKey="totalWasted" fill="#FF006E" radius={[4, 4, 0, 0]} name="폐기" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
