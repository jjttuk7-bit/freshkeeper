import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api'
import { getWeeklyReport } from '@/lib/ai/report'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const week = request.nextUrl.searchParams.get('week') ?? undefined

    const report = await getWeeklyReport(user.id, week)

    return successResponse(report)
  } catch (error) {
    return handleApiError(error)
  }
}
