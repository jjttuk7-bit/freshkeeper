import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { getChefResponse } from '@/lib/ai/chef'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { message } = body as { message?: string }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', '메시지를 입력해주세요', 400)
    }

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

    const response = await getChefResponse(message.trim(), ingredientContext)

    return successResponse(response)
  } catch (error) {
    return handleApiError(error)
  }
}
