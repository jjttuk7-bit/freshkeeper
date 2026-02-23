import { prisma } from './prisma'

export interface ShelfLife {
  fridge: number
  freezer: number
  room: number
}

export async function findFoodByName(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    OR: [
      { name: { contains: name, mode: 'insensitive' } },
      { aliases: { has: name } },
    ],
  }
  const food = await prisma.foodDB.findFirst({ where })
  return food
}

export async function getShelfLifeForFood(name: string, storageType: string): Promise<number> {
  const food = await findFoodByName(name)
  if (!food) return 7 // default 7 days

  const shelfLife = food.avgShelfLife as unknown as ShelfLife
  return shelfLife[storageType as keyof ShelfLife] ?? 7
}

export async function searchFoods(query: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { aliases: { has: query } },
    ],
  }
  return prisma.foodDB.findMany({ where, take: 10 })
}
