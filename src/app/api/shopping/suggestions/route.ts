import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, handleApiError } from '@/lib/api'

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireAuth()

    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    // Find recently consumed or wasted ingredients
    const recentItems = await prisma.ingredient.findMany({
      where: {
        userId: user.id,
        OR: [
          { isConsumed: true, consumedAt: { gte: fourteenDaysAgo } },
          { isWasted: true, updatedAt: { gte: fourteenDaysAgo } },
        ],
      },
      select: {
        name: true,
        category: true,
        isConsumed: true,
        isWasted: true,
      },
    })

    if (recentItems.length === 0) {
      return successResponse([])
    }

    // Get names already on the active shopping list
    const activeList = await prisma.shoppingList.findFirst({
      where: { userId: user.id, status: 'active' },
      include: { items: { select: { name: true } } },
    })
    const existingNames = new Set(
      (activeList?.items ?? []).map((i) => i.name.toLowerCase())
    )

    // Aggregate by name, counting frequency and tracking reason
    const nameMap = new Map<
      string,
      { displayName: string; category: string; reason: string; count: number }
    >()

    for (const item of recentItems) {
      const key = item.name.toLowerCase()
      if (existingNames.has(key)) continue

      const existing = nameMap.get(key)
      if (existing) {
        existing.count += 1
      } else {
        nameMap.set(key, {
          displayName: item.name,
          category: item.category,
          reason: item.isWasted ? '최근 폐기' : '최근 소진',
          count: 1,
        })
      }
    }

    // Sort by frequency descending, limit to 8
    const suggestions = Array.from(nameMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(({ displayName, category, reason }) => ({
        name: displayName,
        category,
        reason,
      }))

    return successResponse(suggestions)
  } catch (error) {
    return handleApiError(error)
  }
}
