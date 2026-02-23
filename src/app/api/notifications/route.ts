import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { scheduledAt: 'desc' },
    })

    return successResponse(notifications, { total: notifications.length })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { id, readAt } = body as { id?: string; readAt?: string }
    if (!id || typeof id !== 'string') {
      return errorResponse('VALIDATION_ERROR', 'id 필드가 필요합니다', 400)
    }

    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) {
      return errorResponse('NOT_FOUND', '알림을 찾을 수 없습니다', 404)
    }
    if (notification.userId !== user.id) {
      return errorResponse('FORBIDDEN', '접근 권한이 없습니다', 403)
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        readAt: readAt ? new Date(readAt) : new Date(),
        status: 'read',
      },
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
