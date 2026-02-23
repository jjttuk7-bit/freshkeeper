export const CATEGORIES = {
  vegetable: { label: '채소', emoji: '🥬' },
  meat: { label: '육류', emoji: '🥩' },
  seafood: { label: '수산물', emoji: '🐟' },
  dairy: { label: '유제품', emoji: '🥛' },
  grain: { label: '곡물', emoji: '🌾' },
  sauce: { label: '양념/소스', emoji: '🧂' },
  fruit: { label: '과일', emoji: '🍎' },
  other: { label: '기타', emoji: '📦' },
} as const

export type CategoryKey = keyof typeof CATEGORIES

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([key, val]) => ({
  value: key,
  label: `${val.emoji} ${val.label}`,
}))
