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

    const parsed = {
      ...recipe,
      steps: (() => { try { return JSON.parse(recipe.steps) } catch { return [] } })(),
      ingredients: (() => { try { return JSON.parse(recipe.ingredients) } catch { return [] } })(),
      tags: (() => { try { return JSON.parse(recipe.tags) } catch { return [] } })(),
      nutrition: recipe.nutrition
        ? (() => { try { return JSON.parse(recipe.nutrition as string) } catch { return null } })()
        : null,
    }

    return successResponse(parsed)
  } catch (error) {
    return handleApiError(error)
  }
}
