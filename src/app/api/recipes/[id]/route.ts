import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await requireAuth()
    const { id } = await params

    const recipe = await prisma.recipe.findUnique({ where: { id } })

    if (!recipe) {
      return errorResponse('NOT_FOUND', '레시피를 찾을 수 없습니다', 404)
    }

    return successResponse(recipe)
  } catch (error) {
    return handleApiError(error)
  }
}
