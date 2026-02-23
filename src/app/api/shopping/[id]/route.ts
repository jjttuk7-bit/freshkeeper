import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Verify ownership via the list relation
    const item = await prisma.shoppingItem.findUnique({
      where: { id },
      include: { list: true },
    })

    if (!item) {
      return errorResponse('NOT_FOUND', '장보기 항목을 찾을 수 없습니다', 404)
    }
    if (item.list.userId !== user.id) {
      return errorResponse('FORBIDDEN', '접근 권한이 없습니다', 403)
    }

    const updateData: Prisma.ShoppingItemUpdateInput = {}
    if (body.checked !== undefined) updateData.checked = body.checked
    if (body.quantity !== undefined) updateData.quantity = body.quantity
    if (body.name !== undefined) updateData.name = body.name
    if (body.unit !== undefined) updateData.unit = body.unit
    if (body.estimatedPrice !== undefined) updateData.estimatedPrice = body.estimatedPrice

    const updated = await prisma.shoppingItem.update({
      where: { id },
      data: updateData,
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const { id } = await params

    const item = await prisma.shoppingItem.findUnique({
      where: { id },
      include: { list: true },
    })

    if (!item) {
      return errorResponse('NOT_FOUND', '장보기 항목을 찾을 수 없습니다', 404)
    }
    if (item.list.userId !== user.id) {
      return errorResponse('FORBIDDEN', '접근 권한이 없습니다', 403)
    }

    await prisma.shoppingItem.delete({ where: { id } })

    return successResponse({ id })
  } catch (error) {
    return handleApiError(error)
  }
}
