import { prisma } from './prisma'

export interface ShelfLife {
  fridge: number
  freezer: number
  room: number
}

export async function findFoodByName(name: string) {
  const food = await prisma.foodDB.findFirst({
    where: {
      OR: [
        { name: { contains: name } },
        { aliases: { contains: name } },
      ],
    },
  })
  return food
}

export async function getShelfLifeForFood(name: string, storageType: string): Promise<number> {
  const food = await findFoodByName(name)
  if (!food) return 7 // default 7 days

  const shelfLife: ShelfLife = JSON.parse(food.avgShelfLife)
  return shelfLife[storageType as keyof ShelfLife] ?? 7
}

export async function searchFoods(query: string) {
  return prisma.foodDB.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { aliases: { contains: query } },
      ],
    },
    take: 10,
  })
}
