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
      freshnessStatus: { in: ['caution', 'urgent'] },
    },
  })

  const notifications = []

  for (const ingredient of ingredients) {
    const daysLeft = Math.ceil(
      (ingredient.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        ingredientId: ingredient.id,
        type: daysLeft <= 1 ? 'expiry_d1' : 'expiry_d3',
        status: { in: ['pending', 'sent'] },
      },
    })

    if (!existing) {
      const type = daysLeft <= 1 ? 'expiry_d1' : 'expiry_d3'
      const title = daysLeft <= 1
        ? `${ingredient.name}의 유통기한이 내일이에요!`
        : `${ingredient.name}의 유통기한이 ${daysLeft}일 남았어요`
      const body = daysLeft <= 1
        ? '오늘 활용할 수 있는 레시피를 확인해보세요'
        : '임박한 재료를 활용한 레시피를 추천해드릴게요'

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
