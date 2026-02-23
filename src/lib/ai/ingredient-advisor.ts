import { classifyFood, getFoodTip } from '@/lib/food-classifier'

export interface IngredientAdvice {
  storageTip: string | null
  pairingTip: string | null
  quickRecipe: string | null
  duplicateWarning: string | null
  freezeRecommend: boolean
}

const PAIRING_MAP: Record<string, string[]> = {
  '돼지고기': ['김치', '양파', '대파', '고추장', '마늘'],
  '소고기': ['양파', '대파', '간장', '마늘', '버섯'],
  '닭고기': ['감자', '당근', '간장', '고추장', '양파'],
  '두부': ['대파', '된장', '김치', '고추', '양파'],
  '계란': ['대파', '당근', '양파', '김치', '햄'],
  '김치': ['돼지고기', '두부', '참치', '계란', '라면'],
  '양파': ['소고기', '돼지고기', '당근', '감자', '버섯'],
  '대파': ['된장', '두부', '소고기', '계란', '라면'],
  '감자': ['양파', '당근', '소고기', '버터', '우유'],
  '당근': ['양파', '감자', '소고기', '닭고기', '계란'],
  '버섯': ['양파', '소고기', '두부', '대파', '마늘'],
  '우유': ['계란', '밀가루', '버터', '설탕', '바나나'],
  '참치': ['김치', '양파', '마요네즈', '계란', '대파'],
  '라면': ['계란', '대파', '김치', '양파', '떡'],
  '쌀': ['계란', '김치', '참치', '김', '야채'],
  '토마토': ['양파', '마늘', '바질', '올리브오일', '치즈'],
  '배추': ['돼지고기', '두부', '대파', '고춧가루', '마늘'],
  '시금치': ['계란', '마늘', '참기름', '두부', '소고기'],
  '새우': ['마늘', '양파', '브로콜리', '올리브오일', '레몬'],
  '연어': ['레몬', '양파', '아보카도', '간장', '와사비'],
}

const QUICK_RECIPES: Record<string, string> = {
  '돼지고기': '돼지고기 김치찌개 — 김치와 함께 끓이면 15분 완성',
  '소고기': '소고기 볶음 — 양파, 대파와 간장 양념으로 간단히',
  '닭고기': '닭볶음탕 — 감자, 당근과 고추장 양념으로',
  '두부': '두부 된장찌개 — 대파, 호박과 함께 끓이기',
  '계란': '계란볶음밥 — 대파, 당근 넣고 참기름 마무리',
  '김치': '김치볶음밥 — 밥과 계란, 참기름으로 간단히',
  '양파': '양파볶음 — 간장, 설탕으로 달콤하게',
  '감자': '감자볶음 — 채 썰어 소금으로 간단히',
  '당근': '당근라페 — 올리브오일, 레몬즙으로 상큼하게',
  '버섯': '버섯볶음 — 마늘, 간장으로 간단히',
  '우유': '프렌치토스트 — 계란, 빵과 함께',
  '참치': '참치김치찌개 — 김치, 두부와 함께 끓이기',
  '토마토': '토마토 계란볶음 — 계란과 함께 볶으면 5분 완성',
  '시금치': '시금치나물 — 데쳐서 참기름, 마늘로 무치기',
  '새우': '새우볶음밥 — 계란, 대파와 함께',
  '연어': '연어덮밥 — 간장, 와사비와 밥 위에',
}

export function getIngredientAdvice(
  name: string,
  existingIngredients?: string[]
): IngredientAdvice {
  const storageTip = getFoodTip(name)
  const classification = classifyFood(name)

  // Pairing tip
  let pairingTip: string | null = null
  const pairings = PAIRING_MAP[name]
  if (pairings) {
    if (existingIngredients && existingIngredients.length > 0) {
      const inFridge = pairings.filter((p) =>
        existingIngredients.some((e) => e.includes(p) || p.includes(e))
      )
      if (inFridge.length > 0) {
        pairingTip = `냉장고에 ${inFridge.join(', ')}이(가) 있어요! 함께 활용해보세요`
      } else {
        pairingTip = `${pairings.slice(0, 3).join(', ')}와(과) 궁합이 좋아요`
      }
    } else {
      pairingTip = `${pairings.slice(0, 3).join(', ')}와(과) 궁합이 좋아요`
    }
  }

  // Quick recipe
  const quickRecipe = QUICK_RECIPES[name] ?? null

  // Duplicate warning
  let duplicateWarning: string | null = null
  if (existingIngredients) {
    const duplicate = existingIngredients.find((e) => e === name)
    if (duplicate) {
      duplicateWarning = `이미 냉장고에 ${name}이(가) 있어요. 수량을 확인해보세요`
    }
  }

  // Freeze recommend: short shelf life items
  let freezeRecommend = false
  if (classification) {
    const fridgeLife = classification.shelfLife.fridge
    if (fridgeLife <= 3 && classification.defaultStorage === 'fridge') {
      freezeRecommend = true
    }
  }

  return {
    storageTip,
    pairingTip,
    quickRecipe,
    duplicateWarning,
    freezeRecommend,
  }
}
