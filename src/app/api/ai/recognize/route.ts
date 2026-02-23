import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'
import { recognizeIngredients } from '@/lib/ai/vision'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAuth()
    const body = await request.json()

    const { image } = body as { image?: string }
    if (!image || typeof image !== 'string') {
      return errorResponse('VALIDATION_ERROR', 'image(base64) 필드가 필요합니다', 400)
    }

    const results = await recognizeIngredients(image)

    return successResponse(results, { total: results.length })
  } catch (error) {
    return handleApiError(error)
  }
}
