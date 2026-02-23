import { GoogleGenerativeAI } from '@google/generative-ai'
import { getFoodTip } from '@/lib/food-classifier'
import type { AIInsightCard, AIInsightsResponse } from '@/types/ai'
import type { IngredientContext } from './chef'

// ── Greeting ─────────────────────────────────────────────

function buildGreeting(total: number): string {
  const hour = new Date().getHours()
  const timeGreeting =
    hour < 12 ? '좋은 아침이에요!' : hour < 18 ? '점심 잘 드셨나요?' : '좋은 저녁이에요!'

  if (total === 0) {
    return `${timeGreeting} 냉장고가 비어있어요. 식재료를 등록해보세요!`
  }
  return `${timeGreeting} 냉장고에 ${total}개의 식재료가 있어요.`
}

// ── Local Insight Generation ─────────────────────────────

function generateLocalInsights(ingredients: IngredientContext[]): AIInsightCard[] {
  const cards: AIInsightCard[] = []
  const urgent = ingredients.filter((i) => i.daysLeft <= 1)
  const caution = ingredients.filter((i) => i.daysLeft > 1 && i.daysLeft <= 3)
  const expired = ingredients.filter((i) => i.daysLeft < 0)

  // Urgent card
  if (urgent.length > 0) {
    const names = urgent.map((i) => i.name).join(', ')
    cards.push({
      id: 'urgent-expiry',
      type: 'urgent',
      icon: '⚠️',
      title: `긴급! ${urgent.length}개 재료 임박`,
      message: `${names}의 유통기한이 오늘/내일이에요! 빨리 활용해보세요.`,
      actions: [
        { label: '레시피 추천받기', href: '/ai/chef' },
        { label: '냉동 전환', action: 'freeze' },
      ],
      priority: 0,
    })
  }

  // Status card
  const total = ingredients.length
  const utilizationPercent = total > 0 ? Math.round(((total - expired.length) / total) * 100) : 0
  cards.push({
    id: 'fridge-status',
    type: 'status',
    icon: '📊',
    title: '냉장고 현황',
    message: `전체 ${total}개 | 임박 ${urgent.length + caution.length}개 | 만료 ${expired.length}개 | 활용도 ${utilizationPercent}%`,
    priority: 1,
  })

  // Tip card
  if (ingredients.length > 0) {
    const randomIng = ingredients[Math.floor(Math.random() * ingredients.length)]
    const tip = getFoodTip(randomIng.name)
    if (tip) {
      cards.push({
        id: 'storage-tip',
        type: 'tip',
        icon: '💡',
        title: `${randomIng.name} 보관 팁`,
        message: tip,
        priority: 2,
      })
    }
  }

  // Caution card
  if (caution.length > 0) {
    const names = caution.map((i) => `${i.name}(D-${i.daysLeft})`).join(', ')
    cards.push({
      id: 'caution-expiry',
      type: 'tip',
      icon: '🔔',
      title: `${caution.length}개 재료 주의`,
      message: `${names} — 2~3일 내 소비를 추천해요.`,
      actions: [{ label: '활용 레시피 보기', href: '/ai/chef' }],
      priority: 2,
    })
  }

  // Shopping card — if low inventory
  if (total < 5) {
    cards.push({
      id: 'shopping-suggest',
      type: 'shopping',
      icon: '🛒',
      title: '장보기 제안',
      message: '냉장고 재료가 적어요. 기본 식재료를 보충하는 건 어때요?',
      actions: [{ label: '장보기 목록', href: '/shopping' }],
      priority: 3,
    })
  }

  // Expired card
  if (expired.length > 0) {
    const names = expired.map((i) => i.name).join(', ')
    cards.push({
      id: 'expired-items',
      type: 'urgent',
      icon: '🗑️',
      title: `${expired.length}개 재료 만료`,
      message: `${names}의 유통기한이 지났어요. 폐기 처리하시겠어요?`,
      actions: [{ label: '냉장고 확인', href: '/fridge' }],
      priority: 0,
    })
  }

  return cards
}

// ── Gemini AI Meal Plan ──────────────────────────────────

async function getAIMealPlan(ingredients: IngredientContext[]): Promise<AIInsightCard | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || ingredients.length === 0) return null

  const ingredientList = ingredients.map((i) => `${i.name}(D-${i.daysLeft})`).join(', ')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    })

    const prompt = `냉장고 재료: ${ingredientList}

이 재료들로 오늘 하루 3끼 식단을 추천해주세요. 유통기한이 임박한 재료를 우선 활용하세요.
반드시 JSON으로 응답하세요:
{"meals":[{"time":"아침","menu":"메뉴명","reason":"간단한 이유"},{"time":"점심","menu":"메뉴명","reason":"이유"},{"time":"저녁","menu":"메뉴명","reason":"이유"}]}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const data = JSON.parse(text)

    if (data.meals && Array.isArray(data.meals)) {
      const mealList = data.meals
        .map((m: { time: string; menu: string }) => `${m.time}: ${m.menu}`)
        .join(' | ')

      return {
        id: 'meal-plan',
        type: 'meal_plan',
        icon: '🍽️',
        title: '오늘의 추천 식단',
        message: mealList,
        actions: [{ label: '자세히 보기', href: '/ai/chef' }],
        priority: 2,
      }
    }
  } catch {
    // AI meal plan is optional, fail silently
  }

  return null
}

// ── Main Function ────────────────────────────────────────

export async function getInsights(ingredients: IngredientContext[]): Promise<AIInsightsResponse> {
  const greeting = buildGreeting(ingredients.length)
  const localCards = generateLocalInsights(ingredients)

  // Try AI-enhanced cards
  const mealPlan = await getAIMealPlan(ingredients)
  const cards = mealPlan ? [...localCards, mealPlan] : localCards

  // Sort by priority
  cards.sort((a, b) => a.priority - b.priority)

  const total = ingredients.length
  const urgent = ingredients.filter((i) => i.daysLeft <= 1).length
  const caution = ingredients.filter((i) => i.daysLeft > 1 && i.daysLeft <= 3).length
  const expired = ingredients.filter((i) => i.daysLeft < 0).length

  return {
    greeting,
    cards,
    fridgeStats: {
      total,
      urgent,
      caution,
      expired,
      utilizationPercent: total > 0 ? Math.round(((total - expired) / total) * 100) : 0,
    },
  }
}
