'use client'

import { useEffect, useRef } from 'react'
import { X, BellOff, CheckCheck } from 'lucide-react'
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications'
import { NotificationItem } from './NotificationItem'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { data: notifications, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllRead()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sorted = [...(notifications ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const hasUnread = sorted.some((n) => !n.readAt)

  return (
    <div className="fixed inset-0 z-50 bg-black/20" aria-label="알림 패널">
      <div
        ref={panelRef}
        className="absolute right-2 top-14 w-[calc(100%-16px)] max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-navy">알림</h2>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                모두 읽음
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-mint border-t-transparent" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-400">알림이 없어요</p>
              <p className="mt-1 text-xs text-gray-300">
                유통기한 알림이 여기에 표시돼요
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {sorted.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={(id) => markRead.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
