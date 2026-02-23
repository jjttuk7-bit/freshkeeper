import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api'
import { updateFreshnessStatuses, createExpiryNotifications, createWeeklySummary } from '@/lib/notifications'
import { sendPushToUser } from '@/lib/push'
import { prisma } from '@/lib/prisma'

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()

    // Update freshness statuses for all ingredients
    await updateFreshnessStatuses()

    // Check user's notification preferences
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    let created = 0

    // Create expiry notifications (D-3, D-1, D-Day) if enabled
    if (!prefs || prefs.expiry) {
      created = await createExpiryNotifications(user.id)
    }

    // Create weekly summary (Monday) if enabled
    if (!prefs || prefs.weekly) {
      const today = new Date()
      if (today.getDay() === 1) {
        const weeklyCreated = await createWeeklySummary(user.id)
        created += weeklyCreated ? 1 : 0
      }
    }

    // Send push for unsent notifications
    const unsent = await prisma.notification.findMany({
      where: {
        userId: user.id,
        status: 'sent',
        sentAt: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Find truly new notifications (created in this check, within last minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const newNotifications = unsent.filter((n) => n.createdAt >= oneMinuteAgo)

    for (const notification of newNotifications) {
      const payload = (notification.payload as unknown as Record<string, unknown>) ?? {}
      await sendPushToUser(user.id, {
        title: notification.title,
        body: notification.body,
        tag: `${notification.type}-${notification.id}`,
        data: {
          type: notification.type,
          notificationId: notification.id,
          ingredientId: notification.ingredientId,
          ...payload,
        },
      })
    }

    return successResponse({ created, pushed: newNotifications.length })
  } catch (error) {
    return handleApiError(error)
  }
}
