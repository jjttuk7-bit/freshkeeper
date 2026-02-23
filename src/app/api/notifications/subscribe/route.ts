import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { pushSubscriptionSchema } from '@/lib/validators'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const parsed = pushSubscriptionSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0].message, 400)
    }

    const { endpoint, p256dh, auth } = parsed.data

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, userId: user.id },
      create: { endpoint, p256dh, auth, userId: user.id },
    })

    return successResponse(subscription)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { endpoint } = body as { endpoint?: string }

    if (!endpoint) {
      return errorResponse('VALIDATION_ERROR', 'endpoint 필드가 필요합니다', 400)
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: user.id },
    })

    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
