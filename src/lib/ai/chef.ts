import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ChefResponse {
  message: string
  recipes?: {
    name: string
    description: string
    difficulty: 'easy' | 'medium' | 'hard'
    cookTime: number
    ingredients: { name: string; amount: string; inFridge: boolean }[]
    steps: string[]
    tags: string[]
  }[]
}

interface IngredientContext {
  name: string
  daysLeft: number
  category: string
}

const MOCK_RESPONSES: ChefResponse[] = [
  {
    message: '냉장고에 있는 재료로 맛있는 요리를 만들어볼까요? 🍳 유통기한이 임박한 재료를 우선 활용해볼게요!',
    recipes: [
      {
        name: '간단 야채볶음밥',
        description: '냉장고 속 재료로 뚝딱 만드는 볶음밥',
        difficulty: 'easy',
        cookTime: 15,
        ingredients: [
          { name: '밥', amount: '2공기', inFridge: true },
          { name: '계란', amount: '2개', inFridge: true },
          { name: '양파', amount: '1/2개', inFridge: true },
          { name: '당근', amount: '1/3개', inFridge: true },
          { name: '간장', amount: '1큰술', inFridge: true },
        ],
        steps: [
          '양파와 당근을 잘게 다져주세요',
          '달군 팬에 기름을 두르고 계란을 스크램블해 덜어놓으세요',
          '같은 팬에 양파, 당근을 볶다가 밥을 넣어주세요',
          '간장으로 간을 하고 스크램블 에그를 넣어 섞어주세요',
        ],
        tags: ['한식', '초간단', '15분이내'],
      },
    ],
  },
  {
    message: '오늘은 든든한 한 끼 어떠세요? 소고기가 있으니 특별한 요리를 해볼까요! 😊',
    recipes: [
      {
        name: '소고기 미역국',
        description: '정성 가득 따뜻한 미역국',
        difficulty: 'easy',
        cookTime: 30,
        ingredients: [
          { name: '소고기', amount: '150g', inFridge: true },
          { name: '건미역', amount: '20g', inFridge: false },
          { name: '참기름', amount: '1큰술', inFridge: true },
          { name: '국간장', amount: '2큰술', inFridge: true },
          { name: '다진마늘', amount: '1큰술', inFridge: true },
        ],
        steps: [
          '미역을 물에 20분간 불려주세요',
          '소고기를 참기름에 볶아주세요',
          '불린 미역을 넣고 함께 볶아주세요',
          '물 6컵을 붓고 끓여주세요',
          '국간장과 다진마늘로 간을 맞춰주세요',
        ],
        tags: ['한식', '국물요리', '정성가득'],
      },
    ],
  },
]

export async function getChefResponse(
  userMessage: string,
  ingredients?: IngredientContext[]
): Promise<ChefResponse> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    const idx = Math.floor(Math.random() * MOCK_RESPONSES.length)
    return MOCK_RESPONSES[idx]
  }

  const ingredientList = ingredients
    ?.map((i) => `${i.name} (D-${i.daysLeft}, ${i.category})`)
    .join(', ') ?? '정보 없음'

  const systemPrompt = `당신은 FreshKeeper의 AI 셰프입니다.
따뜻하고 친근한 말투로 대화하세요.

규칙:
- 사용자의 냉장고 재료를 기반으로 레시피를 추천하세요
- 유통기한 임박 재료를 우선적으로 활용하세요
- 반드시 아래 JSON 형식을 포함하여 응답하세요

현재 냉장고 재료: ${ingredientList}

응답 형식 (JSON 블록 포함):
\`\`\`json
{"message":"자연스러운 대화","recipes":[{"name":"레시피명","description":"설명","difficulty":"easy|medium|hard","cookTime":분,"ingredients":[{"name":"재료","amount":"양","inFridge":true}],"steps":["단계"],"tags":["태그"]}]}
\`\`\``

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    })

    const result = await model.generateContent(userMessage)
    const text = result.response.text()
    return parseChefResponse(text)
  } catch {
    return MOCK_RESPONSES[0]
  }
}

function parseChefResponse(text: string): ChefResponse {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*"recipes"[\s\S]*\}/)
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] ?? jsonMatch[0]
      return JSON.parse(jsonStr)
    }
    return { message: text }
  } catch {
    return { message: text }
  }
}
