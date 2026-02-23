import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, handleApiError } from '@/lib/api'
import { getInsights } from '@/lib/ai/insights'

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireAuth()

    const rawIngredients = await prisma.ingredient.findMany({
      where: {
        userId: user.id,
        isConsumed: false,
        isWasted: false,
      },
      orderBy: { expiryDate: 'asc' },
      select: {
        name: true,
        category: true,
        expiryDate: true,
      },
    })

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const ingredientContext = rawIngredients.map((ing) => {
      const expiry = new Date(ing.expiryDate)
      expiry.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { name: ing.name, daysLeft, category: ing.category }
    })

    const insights = await getInsights(ingredientContext)

    return successResponse(insights)
  } catch (error) {
    return handleApiError(error)
  }
}
