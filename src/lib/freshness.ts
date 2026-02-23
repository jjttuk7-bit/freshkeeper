import type { FreshnessStatus } from '@/types/ingredient'

export function calculateFreshness(expiryDate: Date | string): FreshnessStatus {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 1) return 'urgent'
  if (daysLeft <= 3) return 'caution'
  return 'fresh'
}

export function getShelfLife(
  storageType: 'fridge' | 'freezer' | 'room',
  avgShelfLife: { fridge: number; freezer: number; room: number }
): number {
  return avgShelfLife[storageType] ?? 7
}

export function recalculateExpiry(
  currentStorage: string,
  newStorage: 'fridge' | 'freezer' | 'room',
  shelfLifeDays: number
): Date {
  const now = new Date()

  if (currentStorage === 'freezer' && newStorage === 'fridge') {
    return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  }

  return new Date(now.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000)
}
