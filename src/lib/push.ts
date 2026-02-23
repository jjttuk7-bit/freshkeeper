import webpush from 'web-push'
import { prisma } from './prisma'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.NEXTAUTH_URL || 'http://localhost:3000'

let vapidConfigured = false

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
  vapidConfigured = true
}

export function isVapidConfigured(): boolean {
  return vapidConfigured
}

interface PushPayload {
  title: string
  body: string
  icon?: string
  tag?: string
  data?: Record<string, unknown>
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!vapidConfigured) return 0

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  let sent = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 24 }
      )
      sent++
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number }).statusCode
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } })
      }
    }
  }

  return sent
}
