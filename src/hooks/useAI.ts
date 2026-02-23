'use client'

import { useQuery } from '@tanstack/react-query'
import type { AIInsightsResponse, AIWeeklyReport } from '@/types/ai'

export function useAIInsights() {
  return useQuery<AIInsightsResponse>({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const res = await fetch('/api/ai/insights')
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message)
      return json.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useWeeklyReport(week?: string) {
  return useQuery<AIWeeklyReport>({
    queryKey: ['ai-report', week ?? 'current'],
    queryFn: async () => {
      const params = week ? `?week=${week}` : ''
      const res = await fetch(`/api/ai/report${params}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message)
      return json.data
    },
    staleTime: 60 * 60 * 1000,
  })
}
