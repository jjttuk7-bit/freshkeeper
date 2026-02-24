import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { bulkIngredientCreateSchema } from '@/lib/validators'
import { getShelfLifeForFood } from '@/lib/food-db'
import { calculateFreshness } from '@/lib/freshness'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const parsed = bulkIngredientCreateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0].message, 400)
    }

    const { items } = parsed.data

    // Resolve shelf life and expiry for each item
    const ingredientData = await Promise.all(
      items.map(async (item) => {
        const storageType = item.storageType ?? 'fridge'
        const shelfLifeDays = await getShelfLifeForFood(item.name, storageType)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + shelfLifeDays)
        const freshnessStatus = calculateFreshness(expiryDate)

        return {
          userId: user.id,
          name: item.name,
          category: item.category ?? 'other',
          storageType,
          quantity: item.quantity ?? 1,
          unit: item.unit ?? '개',
          expiryDate,
          freshnessStatus,
        }
      })
    )

    const result = await prisma.ingredient.createMany({
      data: ingredientData,
    })

    return successResponse({ created: result.count })
  } catch (error) {
    return handleApiError(error)
  }
}
