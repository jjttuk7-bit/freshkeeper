'use client'

import { AlertTriangle, Clock, Calendar, ShoppingCart, ChefHat } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Notification } from '@/types/user'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'expiry_d3':
      return <Clock className="h-5 w-5 text-freshness-caution" />
    case 'expiry_d1':
      return <AlertTriangle className="h-5 w-5 text-freshness-urgent" />
    case 'expiry_today':
      return <AlertTriangle className="h-5 w-5 text-freshness-urgent" />
    case 'weekly_summary':
      return <Calendar className="h-5 w-5 text-accent-blue" />
    case 'recipe':
      return <ChefHat className="h-5 w-5 text-accent-purple" />
    case 'shopping':
      return <ShoppingCart className="h-5 w-5 text-mint" />
    default:
      return <Clock className="h-5 w-5 text-gray-400" />
  }
}

function getNotificationBg(type: string, isRead: boolean) {
  if (isRead) return 'bg-white'
  switch (type) {
    case 'expiry_d3':
      return 'bg-freshness-caution/5'
    case 'expiry_d1':
    case 'expiry_today':
      return 'bg-freshness-urgent/5'
    case 'weekly_summary':
      return 'bg-accent-blue/5'
    default:
      return 'bg-mint/5'
  }
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const isRead = !!notification.readAt
  const timeAgo = formatDistanceToNow(parseISO(notification.createdAt), {
    addSuffix: true,
    locale: ko,
  })

  return (
    <button
      onClick={() => !isRead && onRead(notification.id)}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${getNotificationBg(
        notification.type,
        isRead
      )}`}
    >
      <div className="mt-0.5 flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${isRead ? 'text-gray-500' : 'font-semibold text-navy'}`}>
          {notification.title}
        </p>
        <p className={`mt-0.5 text-xs ${isRead ? 'text-gray-400' : 'text-gray-500'}`}>
          {notification.body}
        </p>
        <p className="mt-1 text-[10px] text-gray-400">{timeAgo}</p>
      </div>
      {!isRead && (
        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent-red" />
      )}
    </button>
  )
}
