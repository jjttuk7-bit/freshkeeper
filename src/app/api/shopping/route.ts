import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { shoppingItemCreateSchema } from '@/lib/validators'

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()

    const lists = await prisma.shoppingList.findMany({
      where: {
        userId: user.id,
        status: 'active',
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(lists, { total: lists.length })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const parsed = shoppingItemCreateSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.errors[0].message, 400)
    }

    const data = parsed.data

    // Find or create the active shopping list
    let list = await prisma.shoppingList.findFirst({
      where: { userId: user.id, status: 'active' },
      orderBy: { createdAt: 'desc' },
    })

    if (!list) {
      list = await prisma.shoppingList.create({
        data: { userId: user.id, title: '장보기 목록', status: 'active' },
      })
    }

    const item = await prisma.shoppingItem.create({
      data: {
        listId: list.id,
        name: data.name,
        quantity: data.quantity ?? 1,
        unit: data.unit ?? '개',
        category: data.category ?? null,
        estimatedPrice: data.estimatedPrice ?? null,
        sourceRecipeId: data.sourceRecipeId ?? null,
      },
    })

    return successResponse(item)
  } catch (error) {
    return handleApiError(error)
  }
}
