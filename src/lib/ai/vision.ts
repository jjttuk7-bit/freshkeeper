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

export async function recognizeIngredients(
  imageBase64: string
): Promise<RecognizedIngredient[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Mock response: return 2-4 random items
    const count = 2 + Math.floor(Math.random() * 3)
    const shuffled = [...MOCK_RESULTS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 식재료 인식 전문가입니다.
사진에서 식재료를 분석하여 다음 JSON 형식으로 응답하세요:
{"ingredients":[{"name":"식재료명(한국어)","category":"vegetable|meat|seafood|dairy|grain|sauce|fruit|other","quantity":숫자,"unit":"개|g|kg|ml|팩|봉","freshness":"fresh|caution|urgent","confidence":0.0~1.0}]}
반드시 JSON만 응답하세요.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '이 사진의 식재료를 인식해주세요.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(30000),
  })

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(content)
  return parsed.ingredients ?? []
}
