import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import type { AIWeeklyReport } from '@/types/ai'

function getWeekRange(weekStr?: string): { start: Date; end: Date } {
  const now = weekStr ? new Date(weekStr) : new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(now)
  start.setDate(now.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export async function getWeeklyReport(userId: string, week?: string): Promise<AIWeeklyReport> {
  const { start, end } = getWeekRange(week)

  // Fetch weekly data
  const [registered, consumed, wasted, currentIngredients] = await Promise.all([
    prisma.ingredient.count({
      where: { userId, createdAt: { gte: start, lte: end } },
    }),
    prisma.ingredient.count({
      where: { userId, isConsumed: true, consumedAt: { gte: start, lte: end } },
    }),
    prisma.ingredient.count({
      where: { userId, isWasted: true, consumedAt: { gte: start, lte: end } },
    }),
    prisma.ingredient.findMany({
      where: { userId, isConsumed: false, isWasted: false },
      select: { name: true, category: true, expiryDate: true },
      orderBy: { expiryDate: 'asc' },
    }),
  ])

  // Previous week waste for trend
  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - 7)
  const prevEnd = new Date(start)
  prevEnd.setMilliseconds(-1)

  const prevWasted = await prisma.ingredient.count({
    where: { userId, isWasted: true, consumedAt: { gte: prevStart, lte: prevEnd } },
  })

  const wasteTrend: 'up' | 'down' | 'same' =
    wasted > prevWasted ? 'up' : wasted < prevWasted ? 'down' : 'same'

  const period = { start: formatDate(start), end: formatDate(end) }

  // Try AI-enhanced report
  const aiReport = await getAIReport(currentIngredients, { registered, consumed, wasted, wasteTrend })

  if (aiReport) {
    return {
      period,
      highlights: aiReport.highlights,
      improvements: aiReport.improvements,
      mealPlan: aiReport.mealPlan,
      shoppingSuggestions: aiReport.shoppingSuggestions,
      wasteStats: { count: wasted, trend: wasteTrend },
    }
  }

  // Fallback: local report
  return buildLocalReport(period, { registered, consumed, wasted, wasteTrend }, currentIngredients)
}

function buildLocalReport(
  period: { start: string; end: string },
  stats: { registered: number; consumed: number; wasted: number; wasteTrend: 'up' | 'down' | 'same' },
  ingredients: { name: string; category: string; expiryDate: Date }[]
): AIWeeklyReport {
  const highlights: string[] = []
  const improvements: string[] = []

  if (stats.consumed > 0) {
    highlights.push(`이번 주 ${stats.consumed}개 재료를 알뜰하게 소비했어요!`)
  }
  if (stats.registered > 0) {
    highlights.push(`${stats.registered}개의 새 재료를 등록했어요`)
  }
  if (stats.wasted === 0) {
    highlights.push('이번 주 음식물 쓰레기 제로! 대단해요!')
  }

  if (stats.wasted > 0) {
    improvements.push(`${stats.wasted}개 재료가 폐기되었어요. 유통기한 알림을 활용해보세요`)
  }
  if (stats.wasteTrend === 'up') {
    improvements.push('지난 주보다 폐기량이 늘었어요. 소량 구매를 고려해보세요')
  }

  const now = new Date()
  const urgentItems = ingredients.filter((i) => {
    const days = Math.ceil((new Date(i.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days <= 3 && days >= 0
  })

  if (urgentItems.length > 0) {
    improvements.push(`${urgentItems.map((i) => i.name).join(', ')} — 이번 주 안에 활용하세요`)
  }

  // Simple meal plan based on current ingredients
  const mealPlan = ['월', '화', '수', '목', '금', '토', '일'].map((day) => ({
    day,
    meals: ['현재 재료로 식단을 구성해보세요'],
  }))

  const shoppingSuggestions: { name: string; reason: string }[] = []
  const categories = ingredients.map((i) => i.category)
  if (!categories.includes('vegetable')) {
    shoppingSuggestions.push({ name: '채소류', reason: '냉장고에 채소가 부족해요' })
  }
  if (!categories.includes('dairy')) {
    shoppingSuggestions.push({ name: '유제품', reason: '우유나 치즈를 보충해보세요' })
  }

  return {
    period,
    highlights: highlights.length > 0 ? highlights : ['이번 주도 화이팅!'],
    improvements: improvements.length > 0 ? improvements : ['잘하고 있어요! 계속 유지하세요'],
    mealPlan,
    shoppingSuggestions,
    wasteStats: { count: stats.wasted, trend: stats.wasteTrend },
  }
}

async function getAIReport(
  ingredients: { name: string; category: string; expiryDate: Date }[],
  stats: { registered: number; consumed: number; wasted: number; wasteTrend: 'up' | 'down' | 'same' }
): Promise<{
  highlights: string[]
  improvements: string[]
  mealPlan: { day: string; meals: string[] }[]
  shoppingSuggestions: { name: string; reason: string }[]
} | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const now = new Date()
  const ingredientList = ingredients
    .map((i) => {
      const days = Math.ceil((new Date(i.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return `${i.name}(${i.category}, D-${days})`
    })
    .join(', ')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    })

    const prompt = `당신은 FreshKeeper의 AI 영양사 겸 절약 컨설턴트입니다.

이번 주 통계:
- 새로 등록: ${stats.registered}개
- 소비: ${stats.consumed}개
- 폐기: ${stats.wasted}개
- 폐기 트렌드: ${stats.wasteTrend === 'up' ? '증가' : stats.wasteTrend === 'down' ? '감소' : '동일'}

현재 냉장고 재료: ${ingredientList || '없음'}

긍정적이고 격려하는 톤으로 주간 리포트를 작성하세요.
반드시 JSON으로 응답:
{
  "highlights": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선 포인트 1"],
  "mealPlan": [{"day": "월", "meals": ["아침: 메뉴", "점심: 메뉴", "저녁: 메뉴"]}, ...],
  "shoppingSuggestions": [{"name": "재료명", "reason": "추천 이유"}]
}
mealPlan은 월~일 7일 모두 포함. 현재 재료를 우선 활용하고 유통기한 임박 재료를 먼저 사용하세요.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const data = JSON.parse(text)

    if (data.highlights && data.mealPlan) {
      return {
        highlights: data.highlights,
        improvements: data.improvements ?? [],
        mealPlan: data.mealPlan,
        shoppingSuggestions: data.shoppingSuggestions ?? [],
      }
    }
  } catch {
    // AI report is optional
  }

  return null
}
