import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { ingredientCreateSchema } from '@/lib/validators'
import { calculateFreshness } from '@/lib/freshness'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    const storageType = searchParams.get('storageType')
    const category = searchParams.get('category')
    const freshnessStatus = searchParams.get('freshnessStatus')

    const where: Prisma.IngredientWhereInput = {
      userId: user.id,
      isConsumed: false,
      isWasted: false,
    }

    if (storageType) where.storageType = storageType
    if (category) where.category = category
    if (freshnessStatus) where.freshnessStatus = freshnessStatus

    const ingredients = await prisma.ingredient.findMany({
      where,
      orderBy: { expiryDate: 'asc' },
    })

    return successResponse(ingredients, { total: ingredients.length })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const parsed = ingredientCreateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0].message, 400)
    }

    const data = parsed.data
    const freshnessStatus = calculateFreshness(data.expiryDate)

    const ingredient = await prisma.ingredient.create({
      data: {
        userId: user.id,
        name: data.name,
        category: data.category,
        storageType: data.storageType,
        expiryDate: new Date(data.expiryDate),
        freshnessStatus,
        quantity: data.quantity ?? 1,
        unit: data.unit ?? '개',
        memo: data.memo ?? null,
        imageUrl: data.imageUrl ?? null,
        purchasePrice: data.purchasePrice ?? null,
      },
    })

    return successResponse(ingredient)
  } catch (error) {
    return handleApiError(error)
  }
}
