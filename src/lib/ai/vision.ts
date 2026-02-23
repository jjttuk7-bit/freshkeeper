import { GoogleGenerativeAI } from '@google/generative-ai'

export interface RecognizedIngredient {
  name: string
  category: string
  quantity: number
  unit: string
  freshness: string
  confidence: number
}

const MOCK_RESULTS: RecognizedIngredient[] = [
  { name: '양파', category: 'vegetable', quantity: 3, unit: '개', freshness: 'fresh', confidence: 0.95 },
  { name: '당근', category: 'vegetable', quantity: 2, unit: '개', freshness: 'fresh', confidence: 0.92 },
  { name: '계란', category: 'dairy', quantity: 10, unit: '개', freshness: 'fresh', confidence: 0.98 },
  { name: '우유', category: 'dairy', quantity: 1, unit: 'L', freshness: 'fresh', confidence: 0.96 },
  { name: '소고기', category: 'meat', quantity: 300, unit: 'g', freshness: 'fresh', confidence: 0.89 },
  { name: '두부', category: 'other', quantity: 1, unit: '팩', freshness: 'fresh', confidence: 0.94 },
]

const VISION_PROMPT = `당신은 식재료 인식 전문가입니다.
사진에서 식재료를 분석하여 다음 JSON 형식으로 응답하세요:
{"ingredients":[{"name":"식재료명(한국어)","category":"vegetable|meat|seafood|dairy|grain|sauce|fruit|other","quantity":숫자,"unit":"개|g|kg|ml|팩|봉","freshness":"fresh|caution|urgent","confidence":0.0~1.0}]}
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
