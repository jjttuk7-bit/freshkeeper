import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { calculateFreshness } from '@/lib/freshness'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const { id } = await params

    const ingredient = await prisma.ingredient.findUnique({ where: { id } })

    if (!ingredient) {
      return errorResponse('NOT_FOUND', '식재료를 찾을 수 없습니다', 404)
    }
    if (ingredient.userId !== user.id) {
      return errorResponse('FORBIDDEN', '접근 권한이 없습니다', 403)
    }

    return successResponse(ingredient)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.ingredient.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('NOT_FOUND', '식재료를 찾을 수 없습니다', 404)
    }
    if (existing.userId !== user.id) {
      return errorResponse('FORBIDDEN', '접근 권한이 없습니다', 403)
    }

    const updateData: Prisma.IngredientUpdateInput = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.category !== undefined) updateData.category = body.category
    if (body.storageType !== undefined) updateData.storageType = body.storageType
    if (body.quantity !== undefined) updateData.quantity = body.quantity
    if (body.unit !== undefined) updateData.unit = body.unit
    if (body.memo !== undefined) updateData.memo = body.memo
    if (body.isConsumed !== undefined) updateData.isConsumed = body.isConsumed
    if (body.isWasted !== undefined) updateData.isWasted = body.isWasted
    if (body.consumedAt !== undefined) updateData.consumedAt = body.consumedAt ? new Date(body.consumedAt) : null

    if (body.expiryDate !== undefined) {
      updateData.expiryDate = new Date(body.expiryDate)
      updateData.freshnessStatus = calculateFreshness(body.expiryDate)
    }

    if (body.freshnessStatus !== undefined && body.expiryDate === undefined) {
      updateData.freshnessStatus = body.freshnessStatus
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: updateData,
    })

    return successResponse(ingredient)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const { id } = await params

    const existing = await prisma.ingredient.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('NOT_FOUND', '식재료를 찾을 수 없습니다', 404)
    }
    if (existing.userId !== user.id) {
      return errorResponse('FORBIDDEN', '접근 권한이 없습니다', 403)
    }

    await prisma.ingredient.delete({ where: { id } })

    return successResponse({ id })
  } catch (error) {
    return handleApiError(error)
  }
}
