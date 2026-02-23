'use client'

import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Notification, NotificationPreferences } from '@/types/user'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message ?? 'API Error')
  return json.data
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => fetchJson('/api/notifications'),
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, readAt: new Date().toISOString() }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  const { data } = useNotifications()

  return useMutation({
    mutationFn: async () => {
      const unread = data?.filter((n) => !n.readAt) ?? []
      await Promise.all(
        unread.map((n) =>
          fetchJson('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: n.id, readAt: new Date().toISOString() }),
          })
        )
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useUnreadCount() {
  const { data } = useNotifications()
  return data?.filter((n) => !n.readAt).length ?? 0
}

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences'],
    queryFn: () => fetchJson('/api/notifications/preferences'),
  })
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      fetchJson('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-preferences'] }),
  })
}

export function useCheckNotifications(intervalMs = 30 * 60 * 1000) {
  const qc = useQueryClient()

  const check = useCallback(async () => {
    try {
      await fetch('/api/notifications/check', { method: 'POST' })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    } catch {
      // silent fail
    }
  }, [qc])

  useEffect(() => {
    check()
    const timer = setInterval(check, intervalMs)
    return () => clearInterval(timer)
  }, [check, intervalMs])

  return { check }
}
