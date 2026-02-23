export interface AIInsightCard {
  id: string
  type: 'urgent' | 'tip' | 'meal_plan' | 'status' | 'shopping'
  icon: string
  title: string
  message: string
  actions?: { label: string; href?: string; action?: string }[]
  priority: number
}

export interface AIInsightsResponse {
  greeting: string
  cards: AIInsightCard[]
  fridgeStats: {
    total: number
    urgent: number
    caution: number
    expired: number
    utilizationPercent: number
  }
}

export interface AIWeeklyReport {
  period: { start: string; end: string }
  highlights: string[]
  improvements: string[]
  mealPlan: { day: string; meals: string[] }[]
  shoppingSuggestions: { name: string; reason: string }[]
  wasteStats: { count: number; trend: 'up' | 'down' | 'same' }
}
