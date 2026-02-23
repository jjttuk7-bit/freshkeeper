'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  isPushSupported,
  getPermissionState,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
} from '@/lib/push-client'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const supported = isPushSupported()
    setIsSupported(supported)
    setPermission(getPermissionState())

    if (supported) {
      getCurrentSubscription().then((sub) => {
        setIsSubscribed(!!sub)
      })
    }
  }, [])

  const subscribe = useCallback(async () => {
    setIsLoading(true)
    try {
      const sub = await subscribeToPush()
      if (sub) {
        setIsSubscribed(true)
        setPermission('granted')
        return true
      }
      setPermission(getPermissionState())
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await unsubscribeFromPush()
      if (result) {
        setIsSubscribed(false)
      }
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    permission,
    isSubscribed,
    isSupported,
    isLoading,
    subscribe,
    unsubscribe,
  }
}
