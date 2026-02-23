import { GoogleGenerativeAI } from '@google/generative-ai'

export interface RecognizedIngredient {
  name: string
  category: string
  quantity: number
  unit: string
  freshness: string
  confidence: number
  storageType: string
  shelfLifeDays: number
}

const MOCK_RESULTS: RecognizedIngredient[] = [
  { name: '양파', category: 'vegetable', quantity: 3, unit: '개', freshness: 'fresh', confidence: 0.95, storageType: 'room', shelfLifeDays: 30 },
  { name: '당근', category: 'vegetable', quantity: 2, unit: '개', freshness: 'fresh', confidence: 0.92, storageType: 'fridge', shelfLifeDays: 14 },
  { name: '계란', category: 'dairy', quantity: 10, unit: '개', freshness: 'fresh', confidence: 0.98, storageType: 'fridge', shelfLifeDays: 21 },
  { name: '우유', category: 'dairy', quantity: 1, unit: 'L', freshness: 'fresh', confidence: 0.96, storageType: 'fridge', shelfLifeDays: 7 },
  { name: '소고기', category: 'meat', quantity: 300, unit: 'g', freshness: 'fresh', confidence: 0.89, storageType: 'fridge', shelfLifeDays: 3 },
  { name: '두부', category: 'other', quantity: 1, unit: '팩', freshness: 'fresh', confidence: 0.94, storageType: 'fridge', shelfLifeDays: 5 },
]

const VISION_PROMPT = `당신은 식재료 인식 전문가입니다.
사진에서 식재료를 분석하여 다음 JSON 형식으로 응답하세요:
{"ingredients":[{"name":"식재료명(한국어)","category":"vegetable|meat|seafood|dairy|grain|sauce|fruit|other","quantity":숫자,"unit":"개|g|kg|ml|팩|봉","freshness":"fresh|caution|urgent","confidence":0.0~1.0,"storageType":"fridge|freezer|room","shelfLifeDays":일반적인유통기한일수}]}

storageType 기준:
- fridge(냉장): 육류, 유제품, 두부, 채소 대부분
- freezer(냉동): 냉동식품, 장기보관 육류
- room(실온): 양파, 감자, 고구마, 마늘, 쌀, 라면 등

shelfLifeDays 기준 (냉장 기준):
- 육류/해산물: 2~3일
- 우유/두부: 5~7일
- 채소: 7~14일
- 계란: 14~21일
- 양파/감자(실온): 30일
- 소스/장류(냉장): 60~90일

반드시 JSON만 응답하세요. 한국 식재료에 특화하여 인식하세요.`

export async function recognizeIngredients(
  imageBase64: string
): Promise<RecognizedIngredient[]> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    const count = 2 + Math.floor(Math.random() * 3)
    const shuffled = [...MOCK_RESULTS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      VISION_PROMPT,
      '이 사진의 식재료를 인식해주세요.',
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*"ingredients"[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed.ingredients ?? []
    }
    return []
  } catch {
    const count = 2 + Math.floor(Math.random() * 3)
    const shuffled = [...MOCK_RESULTS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}
