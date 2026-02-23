export const STORAGE_TYPES = {
  fridge: { label: '냉장', emoji: '❄️', color: 'text-accent-blue' },
  freezer: { label: '냉동', emoji: '🧊', color: 'text-accent-purple' },
  room: { label: '실온', emoji: '🏠', color: 'text-accent-orange' },
} as const

export type StorageTypeKey = keyof typeof STORAGE_TYPES

export const STORAGE_OPTIONS = Object.entries(STORAGE_TYPES).map(([key, val]) => ({
  value: key,
  label: `${val.emoji} ${val.label}`,
}))
