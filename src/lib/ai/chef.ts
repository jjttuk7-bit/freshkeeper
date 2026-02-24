import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ChefRecipe {
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  cookTime: number
  servings: number
  calories: number | null
  ingredients: { name: string; amount: string; inFridge: boolean }[]
  steps: string[]
  tags: string[]
}

export interface ChefResponse {
  message: string
  recipes?: ChefRecipe[]
}

export interface IngredientContext {
  name: string
  daysLeft: number
  category: string
}

export interface ChatHistoryEntry {
  role: 'user' | 'assistant'
  content: string
}

export interface PreferenceContext {
  liked: string[]
  disliked: string[]
  cooked: string[]
}

// ── System Prompt ──────────────────────────────────────────

function buildSystemPrompt(ingredients: IngredientContext[], preferences?: PreferenceContext): string {
  const urgent = ingredients.filter((i) => i.daysLeft <= 1)
  const caution = ingredients.filter((i) => i.daysLeft > 1 && i.daysLeft <= 3)
  const fresh = ingredients.filter((i) => i.daysLeft > 3)

  const formatList = (list: IngredientContext[]) =>
    list.map((i) => `${i.name}(D-${i.daysLeft})`).join(', ') || '없음'

  return `당신은 FreshKeeper의 AI 셰프 "프레셰프"입니다.
따뜻하고 친근한 한국 주방 친구처럼 반말 섞인 존댓말로 대화하세요.

## 가장 중요한 규칙 (절대 위반 금지)
**레시피의 주재료는 반드시 아래 "냉장고 재료 목록"에 있는 것만 사용하세요.**
냉장고에 없는 재료는 절대 주재료로 쓰지 마세요.
소금, 후추, 식용유, 설탕, 간장, 참기름 등 기본 양념만 예외로 추가할 수 있습니다.
냉장고에 없는 재료를 사용할 경우 반드시 inFridge: false로 표시하고, 그런 재료는 최대 1~2개로 제한하세요.

## 핵심 규칙
1. **유통기한 임박 재료 최우선 활용** — 긴급(D-0~1) 재료를 반드시 1개 이상 포함하세요.
2. **냉장고 재료로만 구성** — 냉장고 목록에 있는 재료 위주로 레시피를 만들고, 기본 양념 외 추가 재료는 최소화하세요.
3. **한국 가정식 중심** — 한식을 기본으로 하되, 양식·중식·일식도 추천 가능합니다.
4. **실용적 레시피** — 가정에서 쉽게 구할 수 있는 재료와 도구만 사용하세요.
5. **레시피 2~3개 추천** — 난이도와 조리시간을 다양하게 섞어주세요.
6. **조리 단계는 구체적으로** — "적당히", "약간" 대신 정확한 양과 시간을 명시하세요.
7. **calories는 1인분 기준 추정값**을 제공하세요.

## 냉장고 재료 목록 (이 재료만 사용하세요!)
${ingredients.length > 0 ? ingredients.map((i) => `- ${i.name} (D-${i.daysLeft}, ${i.category})`).join('\n') : '등록된 재료 없음'}

## 유통기한 현황
- 긴급(D-0~1): ${formatList(urgent)}
- 주의(D-2~3): ${formatList(caution)}
- 신선(D-4+): ${formatList(fresh)}
${preferences && (preferences.liked.length > 0 || preferences.disliked.length > 0 || preferences.cooked.length > 0) ? `
## 사용자 취향
${preferences.liked.length > 0 ? `- 좋아하는 레시피: ${preferences.liked.join(', ')}` : ''}
${preferences.disliked.length > 0 ? `- 선호하지 않는 레시피: ${preferences.disliked.join(', ')} (비슷한 스타일 피하기)` : ''}
${preferences.cooked.length > 0 ? `- 직접 만들어본 레시피: ${preferences.cooked.join(', ')}` : ''}
좋아하는 레시피와 비슷한 스타일을 추천하고, 선호하지 않는 스타일은 피해주세요.
이미 만들어본 레시피는 다른 변형을 제안하거나 새로운 레시피를 우선 추천하세요.` : ''}

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 포함하지 마세요.

{
  "message": "사용자에게 보여줄 자연스럽고 친근한 대화 메시지 (이모지 적절히 사용)",
  "recipes": [
    {
      "name": "레시피 이름",
      "description": "한 줄 설명",
      "difficulty": "easy | medium | hard",
      "cookTime": 조리시간(분),
      "servings": 인분수,
      "calories": 1인분_칼로리_추정값,
      "ingredients": [
        {"name": "재료명", "amount": "양과 단위", "inFridge": true/false}
      ],
      "steps": [
        "1. 구체적인 조리 단계 (시간, 양 명시)"
      ],
      "tags": ["한식", "초간단", "15분이내"]
    }
  ]
}

## 주의사항
- message에서 추천 이유를 간략히 설명해주세요 (임박 재료 활용 등)
- 레시피가 필요 없는 일반 대화에는 recipes를 빈 배열 []로 설정하세요
- difficulty: easy(30분 이하, 5단계 이하), medium(30~60분), hard(60분 이상)
- tags에 "임박재료활용" 태그를 포함하면 좋습니다`
}

// ── Gemini API Call ────────────────────────────────────────

export async function getChefResponse(
  userMessage: string,
  ingredients?: IngredientContext[],
  history?: ChatHistoryEntry[],
  preferences?: PreferenceContext
): Promise<ChefResponse> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return getMockResponse(userMessage, ingredients ?? [])
  }

  const systemPrompt = buildSystemPrompt(ingredients ?? [], preferences)

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    })

    // Build chat with history for contextual responses
    const chatHistory = (history ?? []).map((entry) => ({
      role: entry.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: entry.content }],
    }))

    const chat = model.startChat({ history: chatHistory })
    const result = await chat.sendMessage(userMessage)
    const text = result.response.text()

    const parsed = parseChefResponse(text, ingredients ?? [])
    if (parsed.recipes && parsed.recipes.length > 0) {
      return parsed
    }
    // If parsing returned no recipes but should have, try without JSON mode
    return parsed
  } catch {
    return getMockResponse(userMessage, ingredients ?? [])
  }
}

// ── JSON Parsing (Robust) ──────────────────────────────────

function parseChefResponse(text: string, ingredients: IngredientContext[]): ChefResponse {
  const ingredientNames = new Set(ingredients.map((i) => i.name))

  // Strategy 1: Direct JSON parse (when responseMimeType works)
  try {
    const data = JSON.parse(text)
    return normalizeResponse(data, ingredientNames)
  } catch {
    // continue to next strategy
  }

  // Strategy 2: Extract from ```json``` code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      const data = JSON.parse(codeBlockMatch[1])
      return normalizeResponse(data, ingredientNames)
    } catch {
      // continue
    }
  }

  // Strategy 3: Find outermost JSON object
  const jsonObjectMatch = text.match(/\{[\s\S]*\}/)
  if (jsonObjectMatch) {
    try {
      const data = JSON.parse(jsonObjectMatch[0])
      return normalizeResponse(data, ingredientNames)
    } catch {
      // continue
    }
  }

  // Fallback: return text as message
  return { message: text.replace(/```[\s\S]*?```/g, '').trim() || '레시피를 준비 중이에요. 다시 한 번 요청해주세요!' }
}

function isInFridge(recipeName: string, fridgeNames: Set<string>): boolean {
  const name = recipeName.toLowerCase().trim()
  // Basic seasonings are always considered "in fridge"
  const basicSeasonings = [
    '소금', '후추', '설탕', '간장', '국간장', '진간장', '참기름', '들기름',
    '식용유', '올리브오일', '고춧가루', '고추장', '된장', '다진마늘',
    '마늘', '생강', '식초', '맛술', '미림', '굴소스', '물', '소금·후추',
  ]
  if (basicSeasonings.some((s) => name.includes(s) || s.includes(name))) {
    return true
  }
  // Check against actual fridge contents with fuzzy matching
  const fridgeArray = Array.from(fridgeNames)
  for (let i = 0; i < fridgeArray.length; i++) {
    const fn = fridgeArray[i].toLowerCase()
    if (fn === name || fn.includes(name) || name.includes(fn)) {
      return true
    }
  }
  return false
}

function normalizeResponse(data: Record<string, unknown>, ingredientNames: Set<string>): ChefResponse {
  const message = (data.message as string) ?? '레시피를 준비했어요!'

  const rawRecipes = Array.isArray(data.recipes) ? data.recipes : []
  const recipes: ChefRecipe[] = rawRecipes.map((r: Record<string, unknown>) => ({
    name: (r.name as string) ?? '레시피',
    description: (r.description as string) ?? '',
    difficulty: (['easy', 'medium', 'hard'].includes(r.difficulty as string) ? r.difficulty : 'easy') as ChefRecipe['difficulty'],
    cookTime: typeof r.cookTime === 'number' ? r.cookTime : 20,
    servings: typeof r.servings === 'number' ? r.servings : 2,
    calories: typeof r.calories === 'number' ? r.calories : null,
    ingredients: Array.isArray(r.ingredients)
      ? r.ingredients.map((ing: Record<string, unknown>) => ({
          name: (ing.name as string) ?? '',
          amount: (ing.amount as string) ?? '',
          // Always verify inFridge server-side, never trust the LLM
          inFridge: isInFridge((ing.name as string) ?? '', ingredientNames),
        }))
      : [],
    steps: Array.isArray(r.steps) ? r.steps.map((s: unknown) => String(s)) : [],
    tags: Array.isArray(r.tags) ? r.tags.map((t: unknown) => String(t)) : [],
  }))

  return { message, recipes: recipes.length > 0 ? recipes : undefined }
}

// ── Smart Mock Responses ───────────────────────────────────

const MOCK_RECIPES: ChefResponse[] = [
  {
    message: '냉장고 재료로 후딱 만들 수 있는 볶음밥 어떠세요? 남은 재료 정리에 최고예요! 🍳',
    recipes: [
      {
        name: '간단 야채볶음밥',
        description: '냉장고 속 자투리 재료로 뚝딱 만드는 한 그릇 볶음밥',
        difficulty: 'easy',
        cookTime: 15,
        servings: 2,
        calories: 420,
        ingredients: [
          { name: '밥', amount: '2공기', inFridge: true },
          { name: '계란', amount: '2개', inFridge: true },
          { name: '양파', amount: '1/2개', inFridge: true },
          { name: '당근', amount: '1/3개', inFridge: true },
          { name: '간장', amount: '1큰술', inFridge: true },
          { name: '참기름', amount: '1작은술', inFridge: true },
        ],
        steps: [
          '1. 양파와 당근을 0.5cm 크기로 잘게 다져주세요',
          '2. 달군 팬에 식용유 1큰술을 두르고 계란을 스크램블해 접시에 덜어놓으세요',
          '3. 같은 팬에 양파, 당근을 중불에서 2분간 볶아주세요',
          '4. 밥을 넣고 덩어리를 풀며 3분간 볶아주세요',
          '5. 간장 1큰술로 간을 하고 스크램블 에그를 넣어 골고루 섞어주세요',
          '6. 참기름 1작은술을 둘러 마무리하세요',
        ],
        tags: ['한식', '초간단', '15분이내', '한그릇'],
      },
    ],
  },
  {
    message: '따끈한 국물 요리 어떨까요? 속이 든든해질 거예요 😊',
    recipes: [
      {
        name: '소고기 미역국',
        description: '깊은 맛이 우러나는 정성 가득 미역국',
        difficulty: 'easy',
        cookTime: 35,
        servings: 3,
        calories: 180,
        ingredients: [
          { name: '소고기', amount: '150g (국거리용)', inFridge: true },
          { name: '건미역', amount: '20g (한 줌)', inFridge: false },
          { name: '참기름', amount: '1큰술', inFridge: true },
          { name: '국간장', amount: '2큰술', inFridge: true },
          { name: '다진마늘', amount: '1큰술', inFridge: true },
        ],
        steps: [
          '1. 건미역을 찬물에 20분간 불린 뒤 물기를 짜고 먹기 좋게 잘라주세요',
          '2. 소고기를 1cm 크기로 썰어 참기름 1큰술에 중불로 3분간 볶아주세요',
          '3. 미역을 넣고 함께 2분간 더 볶아주세요',
          '4. 물 6컵(1.2L)을 붓고 센불로 끓여주세요',
          '5. 끓어오르면 중약불로 줄이고 국간장, 다진마늘을 넣어 20분간 끓여주세요',
          '6. 소금으로 간을 맞추고 마무리하세요',
        ],
        tags: ['한식', '국물요리', '정성가득', '건강식'],
      },
    ],
  },
  {
    message: '바빠도 맛있게! 10분이면 완성되는 초스피드 레시피예요 ⚡',
    recipes: [
      {
        name: '참치마요 덮밥',
        description: '참치캔 하나로 뚝딱 완성하는 일본식 덮밥',
        difficulty: 'easy',
        cookTime: 10,
        servings: 1,
        calories: 480,
        ingredients: [
          { name: '밥', amount: '1공기', inFridge: true },
          { name: '참치캔', amount: '1개', inFridge: true },
          { name: '마요네즈', amount: '2큰술', inFridge: true },
          { name: '간장', amount: '1작은술', inFridge: true },
          { name: '김가루', amount: '약간', inFridge: true },
          { name: '계란', amount: '1개', inFridge: true },
        ],
        steps: [
          '1. 참치캔의 기름을 살짝 빼고 마요네즈 2큰술, 간장 1작은술을 섞어주세요',
          '2. 달군 팬에 기름을 두르고 계란 후라이를 반숙으로 만들어주세요',
          '3. 그릇에 따뜻한 밥을 담고 참치마요를 올려주세요',
          '4. 계란 후라이를 올리고 김가루를 뿌려 완성하세요',
        ],
        tags: ['일식', '초간단', '10분이내', '혼밥'],
      },
    ],
  },
  {
    message: '고기가 있으니 오늘은 특별한 저녁 어때요? 불고기는 언제 먹어도 맛있잖아요~ 🥩',
    recipes: [
      {
        name: '간장 불고기',
        description: '달콤 짭짤한 양념에 재운 부드러운 불고기',
        difficulty: 'easy',
        cookTime: 25,
        servings: 3,
        calories: 350,
        ingredients: [
          { name: '소고기', amount: '300g (불고기용)', inFridge: true },
          { name: '양파', amount: '1개', inFridge: true },
          { name: '대파', amount: '1대', inFridge: true },
          { name: '간장', amount: '3큰술', inFridge: true },
          { name: '설탕', amount: '1큰술', inFridge: true },
          { name: '다진마늘', amount: '1큰술', inFridge: true },
          { name: '참기름', amount: '1큰술', inFridge: true },
          { name: '배', amount: '1/4개 (없으면 설탕 추가)', inFridge: false },
        ],
        steps: [
          '1. 간장 3큰술, 설탕 1큰술, 다진마늘 1큰술, 참기름 1큰술, 배즙(또는 설탕 1큰술 추가)을 섞어 양념장을 만들어주세요',
          '2. 소고기에 양념장을 넣고 골고루 버무려 15분간 재워주세요',
          '3. 양파는 채 썰고, 대파는 어슷 썰어주세요',
          '4. 달군 팬에 양파를 먼저 볶다가 양념된 소고기를 넣고 중강불에서 5분간 볶아주세요',
          '5. 대파를 넣고 1분 더 볶아 마무리하세요',
        ],
        tags: ['한식', '메인요리', '고기', '임박재료활용'],
      },
    ],
  },
  {
    message: '건강도 챙기고 맛도 챙기는 샐러드 한 접시 어때요? 🥗 비타민 충전 타임!',
    recipes: [
      {
        name: '닭가슴살 샐러드',
        description: '단백질 듬뿍! 포만감 높은 건강 샐러드',
        difficulty: 'easy',
        cookTime: 15,
        servings: 1,
        calories: 280,
        ingredients: [
          { name: '닭가슴살', amount: '1개 (150g)', inFridge: true },
          { name: '양상추', amount: '3~4장', inFridge: true },
          { name: '방울토마토', amount: '5~6개', inFridge: true },
          { name: '올리브오일', amount: '1큰술', inFridge: true },
          { name: '레몬즙', amount: '1큰술', inFridge: false },
          { name: '소금·후추', amount: '약간', inFridge: true },
        ],
        steps: [
          '1. 닭가슴살에 소금, 후추를 뿌리고 팬에 올리브오일을 두른 뒤 중불에서 앞뒤 5분씩 구워주세요',
          '2. 구운 닭가슴살을 5분간 쉬게 한 뒤 0.5cm 두께로 슬라이스 해주세요',
          '3. 양상추를 한입 크기로 찢고, 방울토마토를 반으로 잘라주세요',
          '4. 올리브오일 1큰술, 레몬즙 1큰술, 소금 약간을 섞어 드레싱을 만들어주세요',
          '5. 접시에 채소를 깔고 닭가슴살을 올린 뒤 드레싱을 뿌려 완성하세요',
        ],
        tags: ['양식', '건강식', '다이어트', '저칼로리'],
      },
    ],
  },
  {
    message: '비 오는 날엔 역시 전이죠! 바삭바삭하게 부쳐볼까요? 🌧️',
    recipes: [
      {
        name: '감자채전',
        description: '바삭하고 쫄깃한 감자전, 막걸리 안주로도 최고!',
        difficulty: 'easy',
        cookTime: 20,
        servings: 2,
        calories: 250,
        ingredients: [
          { name: '감자', amount: '3개 (중간 크기)', inFridge: true },
          { name: '양파', amount: '1/2개', inFridge: true },
          { name: '부침가루', amount: '2큰술', inFridge: true },
          { name: '소금', amount: '1/2작은술', inFridge: true },
          { name: '식용유', amount: '넉넉히', inFridge: true },
        ],
        steps: [
          '1. 감자를 껍질 벗기고 강판에 곱게 갈아주세요 (물기는 버리지 마세요)',
          '2. 양파를 잘게 다져주세요',
          '3. 간 감자에 양파, 부침가루 2큰술, 소금 1/2작은술을 넣고 섞어주세요',
          '4. 달군 팬에 식용유를 넉넉히 두르고 반죽을 얇게 펴 중약불에서 3~4분간 앞뒤로 노릇하게 구워주세요',
          '5. 간장에 식초를 섞어 양념장을 곁들여 드세요',
        ],
        tags: ['한식', '간식', '안주', '비오는날'],
      },
    ],
  },
  {
    message: '파스타가 땡기는 날이네요! 크림 파스타 하나 만들어볼까요? 🍝',
    recipes: [
      {
        name: '베이컨 크림 파스타',
        description: '진한 크림소스에 베이컨 향이 가득한 파스타',
        difficulty: 'medium',
        cookTime: 25,
        servings: 2,
        calories: 580,
        ingredients: [
          { name: '파스타면', amount: '200g', inFridge: true },
          { name: '베이컨', amount: '4줄', inFridge: true },
          { name: '양파', amount: '1/2개', inFridge: true },
          { name: '우유', amount: '1컵 (200ml)', inFridge: true },
          { name: '버터', amount: '1큰술', inFridge: true },
          { name: '파마산 치즈', amount: '2큰술 (없으면 슬라이스 치즈 1장)', inFridge: false },
          { name: '소금·후추', amount: '약간', inFridge: true },
        ],
        steps: [
          '1. 큰 냄비에 물을 끓이고 소금을 넣은 뒤 파스타면을 8분간 삶아주세요 (면수 1/2컵 남겨두세요)',
          '2. 베이컨을 1cm 폭으로 썰어 팬에 기름 없이 바삭하게 볶아주세요',
          '3. 같은 팬에 버터를 녹이고 다진 양파를 중불에서 3분간 투명해질 때까지 볶아주세요',
          '4. 우유 1컵과 면수 1/4컵을 넣고 약불에서 3분간 졸여주세요',
          '5. 삶은 면을 넣고 소스에 버무리며 파마산 치즈를 뿌려주세요',
          '6. 소금, 후추로 간을 맞추고 베이컨을 올려 완성하세요',
        ],
        tags: ['양식', '파스타', '크림소스', '든든한'],
      },
    ],
  },
  {
    message: '김치가 있으면 뭐든 맛있어요! 김치찌개 한 냄비 어떠세요? 🔥',
    recipes: [
      {
        name: '돼지고기 김치찌개',
        description: '칼칼하고 깊은 맛! 밥 한 그릇 뚝딱 김치찌개',
        difficulty: 'easy',
        cookTime: 25,
        servings: 2,
        calories: 320,
        ingredients: [
          { name: '김치', amount: '2컵 (잘 익은 것)', inFridge: true },
          { name: '돼지고기', amount: '150g (앞다리살)', inFridge: true },
          { name: '두부', amount: '1/2모', inFridge: true },
          { name: '대파', amount: '1/2대', inFridge: true },
          { name: '고춧가루', amount: '1큰술', inFridge: true },
          { name: '다진마늘', amount: '1큰술', inFridge: true },
        ],
        steps: [
          '1. 김치를 3cm 폭으로 썰고, 돼지고기는 한입 크기로 잘라주세요',
          '2. 냄비에 참기름 1큰술을 두르고 돼지고기를 중불에서 2분간 볶아주세요',
          '3. 김치와 고춧가루를 넣고 함께 3분간 볶아주세요',
          '4. 물 2컵(400ml)을 붓고 센불에서 끓여주세요',
          '5. 끓어오르면 중불로 줄이고 두부를 큼직하게 썰어 넣어 10분간 끓여주세요',
          '6. 다진마늘과 어슷 썬 대파를 넣고 2분 더 끓여 마무리하세요',
        ],
        tags: ['한식', '국물요리', '김치', '매운맛'],
      },
    ],
  },
  {
    message: '달걀만 있으면 되는 초간단 메뉴! 계란말이 도시락으로도 좋아요 🥚',
    recipes: [
      {
        name: '야채 계란말이',
        description: '폭신폭신 부드러운 계란말이, 반찬으로 딱!',
        difficulty: 'easy',
        cookTime: 10,
        servings: 2,
        calories: 200,
        ingredients: [
          { name: '계란', amount: '4개', inFridge: true },
          { name: '당근', amount: '1/4개', inFridge: true },
          { name: '대파', amount: '1/3대', inFridge: true },
          { name: '소금', amount: '1/3작은술', inFridge: true },
          { name: '식용유', amount: '약간', inFridge: true },
        ],
        steps: [
          '1. 당근과 대파를 아주 잘게 다져주세요 (2~3mm)',
          '2. 계란 4개를 풀고 소금, 다진 채소를 넣어 고루 섞어주세요',
          '3. 팬에 기름을 얇게 두르고 약불로 줄여주세요',
          '4. 계란물을 1/3만 부어 얇게 펴고, 반쯤 익으면 돌돌 말아주세요',
          '5. 나머지 계란물을 두 번에 나눠 부어가며 같은 방법으로 말아주세요',
          '6. 김발이나 키친타올로 모양을 잡아 2분간 식힌 뒤 1.5cm 두께로 썰어주세요',
        ],
        tags: ['한식', '반찬', '도시락', '10분이내'],
      },
    ],
  },
  {
    message: '면 요리가 끌리는 날이네요! 쫄깃한 잡채 어떠세요? 🍜',
    recipes: [
      {
        name: '당면 잡채',
        description: '명절에만 먹던 잡채, 평일에도 쉽게 만들어요',
        difficulty: 'medium',
        cookTime: 35,
        servings: 3,
        calories: 380,
        ingredients: [
          { name: '당면', amount: '200g', inFridge: true },
          { name: '시금치', amount: '한 줌', inFridge: true },
          { name: '당근', amount: '1/2개', inFridge: true },
          { name: '양파', amount: '1/2개', inFridge: true },
          { name: '소고기', amount: '100g', inFridge: true },
          { name: '간장', amount: '3큰술', inFridge: true },
          { name: '설탕', amount: '1큰술', inFridge: true },
          { name: '참기름', amount: '2큰술', inFridge: true },
        ],
        steps: [
          '1. 당면을 끓는 물에 6분간 삶고 찬물에 헹궈 가위로 적당히 잘라주세요',
          '2. 시금치를 30초간 데쳐 찬물에 헹구고 물기를 꽉 짜주세요',
          '3. 당근, 양파를 채 썰어 팬에 각각 볶아주세요 (2분씩)',
          '4. 소고기에 간장 1큰술, 설탕 약간을 넣고 재워둔 뒤 볶아주세요',
          '5. 큰 볼에 당면, 채소, 소고기를 모두 넣고 간장 2큰술, 설탕, 참기름을 넣어 버무려주세요',
          '6. 통깨를 뿌려 마무리하세요',
        ],
        tags: ['한식', '메인요리', '잔치음식', '손님접대'],
      },
    ],
  },
]

function getMockResponse(userMessage: string, ingredients: IngredientContext[]): ChefResponse {
  const msg = userMessage.toLowerCase()
  const ingredientNames = ingredients.map((i) => i.name)

  // Keyword-based matching for quick actions
  if (msg.includes('임박') || msg.includes('유통기한')) {
    const urgent = ingredients.filter((i) => i.daysLeft <= 3)
    if (urgent.length > 0) {
      return {
        message: `유통기한이 임박한 ${urgent.map((i) => i.name).join(', ')}을(를) 활용한 레시피를 추천할게요! ⏰`,
        recipes: MOCK_RECIPES[0].recipes,
      }
    }
  }

  if (msg.includes('간단') || msg.includes('빠른') || msg.includes('10분') || msg.includes('15분')) {
    return MOCK_RECIPES[2] // 참치마요 덮밥 (10분)
  }

  if (msg.includes('건강') || msg.includes('다이어트') || msg.includes('샐러드')) {
    return MOCK_RECIPES[4] // 닭가슴살 샐러드
  }

  if (msg.includes('국') || msg.includes('찌개') || msg.includes('국물')) {
    // 김치 있으면 김치찌개, 아니면 미역국
    if (ingredientNames.some((n) => n.includes('김치'))) {
      return MOCK_RECIPES[7]
    }
    return MOCK_RECIPES[1]
  }

  if (msg.includes('파스타') || msg.includes('양식') || msg.includes('크림')) {
    return MOCK_RECIPES[6]
  }

  if (msg.includes('전') || msg.includes('부침') || msg.includes('안주')) {
    return MOCK_RECIPES[5]
  }

  if (msg.includes('냉장고') || msg.includes('파먹')) {
    // Pick based on ingredient categories
    if (ingredientNames.some((n) => n.includes('고기') || n.includes('소고기') || n.includes('돼지'))) {
      return MOCK_RECIPES[3] // 불고기
    }
    return MOCK_RECIPES[0] // 볶음밥
  }

  // Default: random selection with some intelligence
  const idx = Math.floor(Math.random() * MOCK_RECIPES.length)
  return MOCK_RECIPES[idx]
}
