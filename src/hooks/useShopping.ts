'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ShoppingList, ShoppingItemCreateInput } from '@/types/shopping'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'API Error')
  return json.data
}

export function useShoppingLists() {
  return useQuery<ShoppingList[]>({
    queryKey: ['shopping'],
    queryFn: () => fetchJson('/api/shopping'),
  })
}

export function useAddShoppingItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ShoppingItemCreateInput & { listId?: string }) =>
      fetchJson('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping'] }),
  })
}

export function useToggleShoppingItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      fetchJson(`/api/shopping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping'] }),
  })
}

export function useDeleteShoppingItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/shopping/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping'] }),
  })
}
