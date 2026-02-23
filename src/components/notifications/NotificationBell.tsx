'use client'

import { Bell } from 'lucide-react'
import { useUnreadCount } from '@/hooks/useNotifications'

interface NotificationBellProps {
  onClick: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const unreadCount = useUnreadCount()

  return (
    <button
      onClick={onClick}
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
      aria-label={`알림 ${unreadCount > 0 ? `${unreadCount}개 읽지 않음` : ''}`}
    >
      <Bell className="h-4 w-4 text-gray-400" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
