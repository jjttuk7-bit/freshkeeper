import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { notificationPreferencesSchema } from '@/lib/validators'

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    // Return defaults if no preferences saved yet
    if (!prefs) {
      prefs = {
        id: '',
        userId: user.id,
        expiry: true,
        weekly: true,
        recipe: false,
        shopping: true,
        updatedAt: new Date(),
      }
    }

    return successResponse(prefs)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const parsed = notificationPreferencesSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0].message, 400)
    }

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: parsed.data,
      create: { userId: user.id, ...parsed.data },
    })

    return successResponse(prefs)
  } catch (error) {
    return handleApiError(error)
  }
}
