'use client'

import { useQuery } from '@tanstack/react-query'

export interface MonthlyData {
  month: string
  totalSpent: number
  totalWasted: number
  totalConsumed: number
  categoryBreakdown: { category: string; amount: number }[]
}

export interface WasteStats {
  totalWasted: number
  totalRegistered: number
  wasteRate: number
  savedAmount: number
  topWasted: { name: string; count: number }[]
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'API Error')
  return json.data
}

export function useMonthlyAnalytics(months = 6) {
  return useQuery<MonthlyData[]>({
    queryKey: ['analytics', 'monthly', months],
    queryFn: () => fetchJson(`/api/analytics?type=monthly&months=${months}`),
  })
}

export function useWasteStats() {
  return useQuery<WasteStats>({
    queryKey: ['analytics', 'waste'],
    queryFn: () => fetchJson('/api/analytics?type=waste'),
  })
}
