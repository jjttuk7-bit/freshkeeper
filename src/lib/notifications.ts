import { prisma } from './prisma'
import { calculateFreshness } from './freshness'

export async function updateFreshnessStatuses() {
  const ingredients = await prisma.ingredient.findMany({
    where: { isConsumed: false, isWasted: false },
  })

  for (const ingredient of ingredients) {
    const newStatus = calculateFreshness(ingredient.expiryDate)
    if (newStatus !== ingredient.freshnessStatus) {
      await prisma.ingredient.update({
        where: { id: ingredient.id },
        data: { freshnessStatus: newStatus },
      })
    }
  }
}

export async function createExpiryNotifications(userId: string) {
  const ingredients = await prisma.ingredient.findMany({
    where: {
      userId,
      isConsumed: false,
      isWasted: false,
      freshnessStatus: { in: ['caution', 'urgent', 'expired'] },
    },
  })

  const notifications = []

  for (const ingredient of ingredients) {
    const daysLeft = Math.ceil(
      (ingredient.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    let type: string
    if (daysLeft <= 0) type = 'expiry_today'
    else if (daysLeft <= 1) type = 'expiry_d1'
    else type = 'expiry_d3'

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        ingredientId: ingredient.id,
        type,
        status: { in: ['pending', 'sent'] },
      },
    })

    if (!existing) {
      let title: string
      let body: string

      if (daysLeft <= 0) {
        title = `${ingredient.name}의 유통기한이 오늘이에요!`
        body = '지금 바로 사용하거나 냉동 보관을 고려해보세요'
      } else if (daysLeft <= 1) {
        title = `${ingredient.name}의 유통기한이 내일이에요!`
        body = '오늘 활용할 수 있는 레시피를 확인해보세요'
      } else {
        title = `${ingredient.name}의 유통기한이 ${daysLeft}일 남았어요`
        body = '임박한 재료를 활용한 레시피를 추천해드릴게요'
      }

      notifications.push({
        userId,
        type,
        ingredientId: ingredient.id,
        title,
        body,
        scheduledAt: new Date(),
        status: 'sent',
        sentAt: new Date(),
      })
    }
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications })
  }

  return notifications.length
}

export async function createWeeklySummary(userId: string): Promise<boolean> {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  // Check if already created today
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: 'weekly_summary',
      createdAt: { gte: startOfToday },
    },
  })

  if (existing) return false

  const ingredients = await prisma.ingredient.findMany({
    where: { userId, isConsumed: false, isWasted: false },
  })

  const total = ingredients.length
  const urgent = ingredients.filter(
    (i) => i.freshnessStatus === 'urgent' || i.freshnessStatus === 'expired'
  ).length
  const caution = ingredients.filter((i) => i.freshnessStatus === 'caution').length

  let body = `냉장고에 총 ${total}개의 재료가 있어요.`
  if (urgent > 0) body += ` 긴급 ${urgent}개`
  if (caution > 0) body += `, 주의 ${caution}개`
  if (urgent > 0 || caution > 0) body += '를 확인해보세요!'

  await prisma.notification.create({
    data: {
      userId,
      type: 'weekly_summary',
      title: '주간 냉장고 현황 리포트',
      body,
      scheduledAt: new Date(),
      status: 'sent',
      sentAt: new Date(),
    },
  })

  return true
}
