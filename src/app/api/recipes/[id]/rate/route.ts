import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { z } from 'zod'

const rateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  liked: z.boolean().optional(),
  cooked: z.boolean().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    const parsed = rateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', '잘못된 입력입니다', 400)
    }

    const { rating, liked, cooked } = parsed.data

    const recipe = await prisma.recipe.findUnique({ where: { id } })
    if (!recipe) {
      return errorResponse('NOT_FOUND', '레시피를 찾을 수 없습니다', 404)
    }

    const preference = await prisma.userPreference.upsert({
      where: { userId_recipeId: { userId: user.id, recipeId: id } },
      create: {
        userId: user.id,
        recipeId: id,
        rating: rating ?? null,
        liked: liked ?? false,
        cooked: cooked ?? false,
      },
      update: {
        ...(rating !== undefined && { rating }),
        ...(liked !== undefined && { liked }),
        ...(cooked !== undefined && { cooked }),
      },
      select: { id: true, recipeId: true, rating: true, liked: true, cooked: true },
    })

    return successResponse(preference)
  } catch (error) {
    return handleApiError(error)
  }
}
