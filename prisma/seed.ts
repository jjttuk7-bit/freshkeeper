import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@freshkeeper.kr' },
    update: {},
    create: {
      email: 'demo@freshkeeper.kr',
      password: 'demo1234',
      name: '데모 사용자',
      householdSize: 2,
      dietaryRestrictions: [],
      allergies: [],
      preferredCuisine: ['한식', '양식'],
      cookingLevel: 'beginner',
      plan: 'free',
    },
  })

  // Food DB - 30 Korean foods
  const foods = [
    { name: '계란', category: 'dairy', aliases: ['달걀', '에그', 'egg'], avgShelfLife: { fridge: 21, freezer: 120, room: 7 } },
    { name: '우유', category: 'dairy', aliases: ['밀크', 'milk'], avgShelfLife: { fridge: 7, freezer: 30, room: 1 } },
    { name: '두부', category: 'other', aliases: ['tofu'], avgShelfLife: { fridge: 5, freezer: 90, room: 1 } },
    { name: '양파', category: 'vegetable', aliases: ['onion'], avgShelfLife: { fridge: 30, freezer: 180, room: 14 } },
    { name: '감자', category: 'vegetable', aliases: ['potato'], avgShelfLife: { fridge: 21, freezer: 180, room: 14 } },
    { name: '당근', category: 'vegetable', aliases: ['carrot'], avgShelfLife: { fridge: 14, freezer: 180, room: 5 } },
    { name: '배추', category: 'vegetable', aliases: ['chinese cabbage'], avgShelfLife: { fridge: 14, freezer: 90, room: 3 } },
    { name: '대파', category: 'vegetable', aliases: ['파', 'green onion'], avgShelfLife: { fridge: 7, freezer: 60, room: 2 } },
    { name: '마늘', category: 'vegetable', aliases: ['garlic'], avgShelfLife: { fridge: 30, freezer: 180, room: 14 } },
    { name: '고추', category: 'vegetable', aliases: ['chili'], avgShelfLife: { fridge: 7, freezer: 90, room: 3 } },
    { name: '소고기', category: 'meat', aliases: ['beef', '쇠고기'], avgShelfLife: { fridge: 3, freezer: 180, room: 0 } },
    { name: '돼지고기', category: 'meat', aliases: ['pork', '삼겹살'], avgShelfLife: { fridge: 3, freezer: 180, room: 0 } },
    { name: '닭고기', category: 'meat', aliases: ['chicken', '닭'], avgShelfLife: { fridge: 2, freezer: 180, room: 0 } },
    { name: '새우', category: 'seafood', aliases: ['shrimp'], avgShelfLife: { fridge: 2, freezer: 180, room: 0 } },
    { name: '고등어', category: 'seafood', aliases: ['mackerel'], avgShelfLife: { fridge: 2, freezer: 90, room: 0 } },
    { name: '연어', category: 'seafood', aliases: ['salmon'], avgShelfLife: { fridge: 2, freezer: 90, room: 0 } },
    { name: '사과', category: 'fruit', aliases: ['apple'], avgShelfLife: { fridge: 30, freezer: 180, room: 7 } },
    { name: '바나나', category: 'fruit', aliases: ['banana'], avgShelfLife: { fridge: 7, freezer: 30, room: 3 } },
    { name: '딸기', category: 'fruit', aliases: ['strawberry'], avgShelfLife: { fridge: 5, freezer: 60, room: 1 } },
    { name: '토마토', category: 'vegetable', aliases: ['tomato'], avgShelfLife: { fridge: 7, freezer: 60, room: 3 } },
    { name: '쌀', category: 'grain', aliases: ['rice'], avgShelfLife: { fridge: 180, freezer: 365, room: 90 } },
    { name: '식빵', category: 'grain', aliases: ['bread'], avgShelfLife: { fridge: 7, freezer: 90, room: 3 } },
    { name: '라면', category: 'grain', aliases: ['ramen', 'instant noodle'], avgShelfLife: { fridge: 180, freezer: 365, room: 180 } },
    { name: '김치', category: 'other', aliases: ['kimchi'], avgShelfLife: { fridge: 30, freezer: 90, room: 7 } },
    { name: '된장', category: 'sauce', aliases: ['doenjang', 'soybean paste'], avgShelfLife: { fridge: 180, freezer: 365, room: 90 } },
    { name: '고추장', category: 'sauce', aliases: ['gochujang', 'red pepper paste'], avgShelfLife: { fridge: 180, freezer: 365, room: 90 } },
    { name: '간장', category: 'sauce', aliases: ['soy sauce'], avgShelfLife: { fridge: 365, freezer: 365, room: 180 } },
    { name: '버터', category: 'dairy', aliases: ['butter'], avgShelfLife: { fridge: 30, freezer: 180, room: 1 } },
    { name: '치즈', category: 'dairy', aliases: ['cheese'], avgShelfLife: { fridge: 14, freezer: 90, room: 1 } },
    { name: '요거트', category: 'dairy', aliases: ['yogurt'], avgShelfLife: { fridge: 10, freezer: 60, room: 1 } },
  ]

  for (const food of foods) {
    await prisma.foodDB.upsert({
      where: { id: food.name },
      update: food,
      create: { id: food.name, ...food },
    })
  }

  // Demo ingredients
  const now = new Date()
  const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000)

  const ingredients = [
    { name: '계란', category: 'dairy', storageType: 'fridge', expiryDate: addDays(now, 10), quantity: 8, unit: '개', freshnessStatus: 'fresh', purchasePrice: 5900 },
    { name: '우유', category: 'dairy', storageType: 'fridge', expiryDate: addDays(now, 2), quantity: 1, unit: 'L', freshnessStatus: 'caution', purchasePrice: 3200 },
    { name: '소고기', category: 'meat', storageType: 'fridge', expiryDate: addDays(now, 1), quantity: 300, unit: 'g', freshnessStatus: 'urgent', purchasePrice: 15000 },
    { name: '양파', category: 'vegetable', storageType: 'room', expiryDate: addDays(now, 12), quantity: 3, unit: '개', freshnessStatus: 'fresh', purchasePrice: 2980 },
    { name: '당근', category: 'vegetable', storageType: 'fridge', expiryDate: addDays(now, 7), quantity: 2, unit: '개', freshnessStatus: 'fresh', purchasePrice: 1500 },
    { name: '배추', category: 'vegetable', storageType: 'fridge', expiryDate: addDays(now, 5), quantity: 1, unit: '개', freshnessStatus: 'fresh', purchasePrice: 3500 },
    { name: '두부', category: 'other', storageType: 'fridge', expiryDate: addDays(now, 3), quantity: 1, unit: '팩', freshnessStatus: 'caution', purchasePrice: 1500 },
    { name: '김치', category: 'other', storageType: 'fridge', expiryDate: addDays(now, 20), quantity: 1, unit: '봉', freshnessStatus: 'fresh', purchasePrice: 8900 },
    { name: '삼겹살', category: 'meat', storageType: 'freezer', expiryDate: addDays(now, 60), quantity: 500, unit: 'g', freshnessStatus: 'fresh', purchasePrice: 12900 },
    { name: '대파', category: 'vegetable', storageType: 'fridge', expiryDate: addDays(now, 4), quantity: 1, unit: '봉', freshnessStatus: 'caution', purchasePrice: 1200 },
    { name: '사과', category: 'fruit', storageType: 'fridge', expiryDate: addDays(now, 15), quantity: 4, unit: '개', freshnessStatus: 'fresh', purchasePrice: 6000 },
    { name: '식빵', category: 'grain', storageType: 'room', expiryDate: addDays(now, 0), quantity: 1, unit: '봉', freshnessStatus: 'urgent', purchasePrice: 2500 },
  ]

  for (const ing of ingredients) {
    await prisma.ingredient.create({
      data: { userId: user.id, ...ing },
    })
  }

  // Demo recipes
  const recipes = [
    {
      name: '간단 계란볶음밥',
      description: '냉장고 속 재료로 뚝딱 만드는 볶음밥',
      difficulty: 'easy',
      cookTime: 15,
      prepTime: 5,
      servings: 2,
      calories: 450,
      nutrition: { protein: 18, carbs: 55, fat: 15, sodium: 800 },
      steps: [
        { order: 1, instruction: '양파와 당근을 잘게 다져주세요', time: 3 },
        { order: 2, instruction: '달군 팬에 기름을 두르고 계란을 스크램블해 덜어놓으세요', time: 2 },
        { order: 3, instruction: '같은 팬에 양파, 당근을 볶다가 밥을 넣어주세요', time: 5 },
        { order: 4, instruction: '간장으로 간을 하고 스크램블 에그를 넣어 섞어주세요', time: 3 },
      ],
      ingredients: [
        { name: '밥', amount: '2공기', unit: '공기', required: true },
        { name: '계란', amount: '2', unit: '개', required: true },
        { name: '양파', amount: '0.5', unit: '개', required: true },
        { name: '당근', amount: '0.3', unit: '개', required: false },
        { name: '간장', amount: '1', unit: '큰술', required: true },
      ],
      tags: ['한식', '초간단', '15분이내', '초보'],
      source: 'curated',
    },
    {
      name: '소고기 미역국',
      description: '정성 가득 따뜻한 한국식 미역국',
      difficulty: 'easy',
      cookTime: 30,
      prepTime: 20,
      servings: 4,
      calories: 280,
      nutrition: { protein: 22, carbs: 8, fat: 18, sodium: 950 },
      steps: [
        { order: 1, instruction: '미역을 물에 20분간 불려주세요', time: 20 },
        { order: 2, instruction: '소고기를 참기름에 볶아주세요', time: 5 },
        { order: 3, instruction: '불린 미역을 넣고 함께 볶아주세요', time: 3 },
        { order: 4, instruction: '물 6컵을 붓고 끓여주세요', time: 15 },
        { order: 5, instruction: '국간장과 다진마늘로 간을 맞춰주세요', time: 2 },
      ],
      ingredients: [
        { name: '소고기', amount: '150', unit: 'g', required: true },
        { name: '건미역', amount: '20', unit: 'g', required: true },
        { name: '참기름', amount: '1', unit: '큰술', required: true },
        { name: '국간장', amount: '2', unit: '큰술', required: true },
        { name: '다진마늘', amount: '1', unit: '큰술', required: true },
      ],
      tags: ['한식', '국물요리', '정성가득'],
      source: 'curated',
    },
    {
      name: '김치찌개',
      description: '얼큰하고 깊은 맛의 김치찌개',
      difficulty: 'easy',
      cookTime: 25,
      prepTime: 10,
      servings: 2,
      calories: 350,
      nutrition: { protein: 20, carbs: 15, fat: 22, sodium: 1200 },
      steps: [
        { order: 1, instruction: '김치를 한입 크기로 썰어주세요', time: 3 },
        { order: 2, instruction: '냄비에 참기름을 두르고 돼지고기를 볶아주세요', time: 5 },
        { order: 3, instruction: '김치를 넣고 함께 볶아주세요', time: 3 },
        { order: 4, instruction: '물 2컵을 넣고 끓여주세요', time: 10 },
        { order: 5, instruction: '두부를 넣고 간을 맞춰주세요', time: 5 },
      ],
      ingredients: [
        { name: '김치', amount: '200', unit: 'g', required: true },
        { name: '돼지고기', amount: '150', unit: 'g', required: true },
        { name: '두부', amount: '0.5', unit: '모', required: false },
        { name: '대파', amount: '1', unit: '대', required: false },
        { name: '고추장', amount: '0.5', unit: '큰술', required: false },
      ],
      tags: ['한식', '찌개', '매운맛', '겨울'],
      source: 'curated',
    },
    {
      name: '토마토 파스타',
      description: '간단하지만 맛있는 토마토 파스타',
      difficulty: 'easy',
      cookTime: 20,
      prepTime: 10,
      servings: 2,
      calories: 520,
      nutrition: { protein: 15, carbs: 72, fat: 18, sodium: 600 },
      steps: [
        { order: 1, instruction: '파스타면을 삶아주세요', time: 8 },
        { order: 2, instruction: '마늘을 다져 올리브오일에 볶아주세요', time: 2 },
        { order: 3, instruction: '토마토소스를 넣고 끓여주세요', time: 5 },
        { order: 4, instruction: '삶은 면을 넣고 소스와 섞어주세요', time: 3 },
      ],
      ingredients: [
        { name: '파스타면', amount: '200', unit: 'g', required: true },
        { name: '토마토소스', amount: '200', unit: 'ml', required: true },
        { name: '마늘', amount: '3', unit: '쪽', required: true },
        { name: '올리브오일', amount: '2', unit: '큰술', required: true },
      ],
      tags: ['양식', '파스타', '초간단'],
      source: 'curated',
    },
    {
      name: '된장찌개',
      description: '구수한 된장찌개 한 그릇',
      difficulty: 'easy',
      cookTime: 20,
      prepTime: 10,
      servings: 2,
      calories: 200,
      nutrition: { protein: 12, carbs: 18, fat: 8, sodium: 1100 },
      steps: [
        { order: 1, instruction: '감자, 양파, 두부를 깍둑썰기 해주세요', time: 5 },
        { order: 2, instruction: '멸치다시마 육수를 끓여주세요', time: 5 },
        { order: 3, instruction: '된장을 풀고 감자를 넣어 끓여주세요', time: 7 },
        { order: 4, instruction: '양파, 두부, 고추를 넣고 마무리해주세요', time: 5 },
      ],
      ingredients: [
        { name: '된장', amount: '2', unit: '큰술', required: true },
        { name: '감자', amount: '1', unit: '개', required: true },
        { name: '양파', amount: '0.5', unit: '개', required: true },
        { name: '두부', amount: '0.5', unit: '모', required: false },
        { name: '대파', amount: '0.5', unit: '대', required: false },
      ],
      tags: ['한식', '찌개', '구수한', '건강'],
      source: 'curated',
    },
    {
      name: '계란말이',
      description: '도시락 반찬으로 최고! 폭신폭신 계란말이',
      difficulty: 'medium',
      cookTime: 10,
      prepTime: 5,
      servings: 2,
      calories: 180,
      nutrition: { protein: 14, carbs: 2, fat: 12, sodium: 400 },
      steps: [
        { order: 1, instruction: '계란을 풀고 대파, 당근을 다져 넣어주세요', time: 3 },
        { order: 2, instruction: '팬에 기름을 두르고 계란물을 얇게 펴주세요', time: 2 },
        { order: 3, instruction: '반쯤 익으면 말아주세요', time: 2 },
        { order: 4, instruction: '나머지 계란물을 부어 반복해주세요', time: 3 },
      ],
      ingredients: [
        { name: '계란', amount: '4', unit: '개', required: true },
        { name: '대파', amount: '0.3', unit: '대', required: false },
        { name: '당근', amount: '0.2', unit: '개', required: false },
        { name: '소금', amount: '약간', unit: '', required: true },
      ],
      tags: ['한식', '반찬', '도시락', '초간단'],
      source: 'curated',
    },
    {
      name: '불고기',
      description: '달콤한 간장 양념의 소불고기',
      difficulty: 'medium',
      cookTime: 20,
      prepTime: 30,
      servings: 3,
      calories: 380,
      nutrition: { protein: 28, carbs: 20, fat: 22, sodium: 900 },
      steps: [
        { order: 1, instruction: '소고기를 얇게 썰어주세요', time: 5 },
        { order: 2, instruction: '간장, 설탕, 다진마늘, 참기름으로 양념을 만들어주세요', time: 3 },
        { order: 3, instruction: '고기에 양념을 재워 30분 숙성해주세요', time: 30 },
        { order: 4, instruction: '양파, 대파와 함께 볶아주세요', time: 10 },
      ],
      ingredients: [
        { name: '소고기', amount: '300', unit: 'g', required: true },
        { name: '양파', amount: '1', unit: '개', required: true },
        { name: '대파', amount: '1', unit: '대', required: false },
        { name: '간장', amount: '3', unit: '큰술', required: true },
        { name: '설탕', amount: '1', unit: '큰술', required: true },
        { name: '다진마늘', amount: '1', unit: '큰술', required: true },
      ],
      tags: ['한식', '메인요리', '소고기'],
      source: 'curated',
    },
    {
      name: '프렌치토스트',
      description: '달콤한 아침 식사, 프렌치토스트',
      difficulty: 'easy',
      cookTime: 10,
      prepTime: 5,
      servings: 2,
      calories: 320,
      nutrition: { protein: 12, carbs: 38, fat: 14, sodium: 350 },
      steps: [
        { order: 1, instruction: '계란, 우유, 설탕을 섞어 계란물을 만들어주세요', time: 2 },
        { order: 2, instruction: '식빵을 계란물에 충분히 적셔주세요', time: 2 },
        { order: 3, instruction: '팬에 버터를 녹이고 노릇하게 구워주세요', time: 5 },
        { order: 4, instruction: '꿀이나 시럽을 뿌려 완성해주세요', time: 1 },
      ],
      ingredients: [
        { name: '식빵', amount: '4', unit: '장', required: true },
        { name: '계란', amount: '2', unit: '개', required: true },
        { name: '우유', amount: '100', unit: 'ml', required: true },
        { name: '버터', amount: '1', unit: '큰술', required: true },
        { name: '설탕', amount: '1', unit: '큰술', required: false },
      ],
      tags: ['양식', '아침', '달콤한', '초간단'],
      source: 'curated',
    },
    {
      name: '닭볶음탕',
      description: '매콤달콤 온 가족이 좋아하는 닭볶음탕',
      difficulty: 'medium',
      cookTime: 40,
      prepTime: 15,
      servings: 4,
      calories: 420,
      nutrition: { protein: 32, carbs: 25, fat: 20, sodium: 1000 },
      steps: [
        { order: 1, instruction: '닭을 토막내고 감자, 당근을 큼직하게 썰어주세요', time: 10 },
        { order: 2, instruction: '고추장, 간장, 고춧가루로 양념을 만들어주세요', time: 3 },
        { order: 3, instruction: '냄비에 닭과 채소를 넣고 양념을 부어주세요', time: 2 },
        { order: 4, instruction: '물을 넣고 중불에서 30분 끓여주세요', time: 30 },
      ],
      ingredients: [
        { name: '닭고기', amount: '1', unit: '마리', required: true },
        { name: '감자', amount: '2', unit: '개', required: true },
        { name: '당근', amount: '1', unit: '개', required: true },
        { name: '양파', amount: '1', unit: '개', required: true },
        { name: '고추장', amount: '2', unit: '큰술', required: true },
      ],
      tags: ['한식', '메인요리', '매운맛', '가족'],
      source: 'curated',
    },
    {
      name: '과일 샐러드',
      description: '상큼한 과일 샐러드',
      difficulty: 'easy',
      cookTime: 0,
      prepTime: 10,
      servings: 2,
      calories: 150,
      nutrition: { protein: 2, carbs: 35, fat: 1, sodium: 10 },
      steps: [
        { order: 1, instruction: '과일을 한입 크기로 잘라주세요', time: 7 },
        { order: 2, instruction: '요거트를 뿌려 완성해주세요', time: 1 },
      ],
      ingredients: [
        { name: '사과', amount: '1', unit: '개', required: true },
        { name: '바나나', amount: '1', unit: '개', required: true },
        { name: '딸기', amount: '5', unit: '개', required: false },
        { name: '요거트', amount: '100', unit: 'ml', required: true },
      ],
      tags: ['양식', '디저트', '건강', '초간단'],
      source: 'curated',
    },
  ]

  for (const recipe of recipes) {
    await prisma.recipe.create({ data: recipe })
  }

  // Demo shopping list
  const list = await prisma.shoppingList.create({
    data: {
      userId: user.id,
      title: '이번 주 장보기',
      status: 'active',
    },
  })

  const shoppingItems = [
    { name: '우유', quantity: 1, unit: 'L', category: 'dairy', estimatedPrice: 3200 },
    { name: '식빵', quantity: 1, unit: '봉', category: 'grain', estimatedPrice: 2500 },
    { name: '닭가슴살', quantity: 500, unit: 'g', category: 'meat', estimatedPrice: 8900 },
    { name: '브로콜리', quantity: 1, unit: '개', category: 'vegetable', estimatedPrice: 2500 },
    { name: '요거트', quantity: 4, unit: '개', category: 'dairy', estimatedPrice: 4800 },
  ]

  for (const item of shoppingItems) {
    await prisma.shoppingItem.create({
      data: { listId: list.id, ...item },
    })
  }

  console.log('Seed completed successfully!')
  console.log('Demo account: demo@freshkeeper.kr / demo1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
