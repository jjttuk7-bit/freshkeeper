'use client'

import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export function PushPermissionBanner() {
  const { permission, isSubscribed, isSupported, isLoading, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if: not supported, already subscribed, denied, or dismissed
  if (!isSupported || isSubscribed || permission === 'denied' || dismissed) {
    return null
  }

  return (
    <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-accent-purple/10 px-4 py-3">
      <Bell className="h-5 w-5 flex-shrink-0 text-accent-purple" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-accent-purple">
          알림을 켜보세요
        </p>
        <p className="text-xs text-accent-purple/70">
          유통기한 알림을 받을 수 있어요
        </p>
      </div>
      <button
        onClick={subscribe}
        disabled={isLoading}
        className="rounded-xl bg-accent-purple px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-purple/90 disabled:opacity-50"
      >
        {isLoading ? '...' : '켜기'}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent-purple/10"
      >
        <X className="h-3.5 w-3.5 text-accent-purple/50" />
      </button>
    </div>
  )
}
