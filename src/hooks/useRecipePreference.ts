'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserPreference } from '@/types/recipe'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'API Error')
  return json.data
}

export function useRecipePreference(recipeId: string) {
  return useQuery<UserPreference | null>({
    queryKey: ['recipePreference', recipeId],
    queryFn: async () => {
      const data = await fetchJson<{ userPreference?: UserPreference }>(`/api/recipes/${recipeId}`)
      return data.userPreference ?? null
    },
    enabled: !!recipeId,
  })
}

export function useRateRecipe(recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { rating?: number; liked?: boolean; cooked?: boolean; recipe?: Record<string, unknown> }) =>
      fetchJson<UserPreference>(`/api/recipes/${recipeId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['recipePreference', recipeId], updated)
    },
  })
}
