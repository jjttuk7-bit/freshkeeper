import type { IngredientCategory, StorageType } from '@/types/ingredient'

export interface FoodEntry {
  name: string
  category: IngredientCategory
  defaultStorage: StorageType
  aliases: string[]
  shelfLife: { fridge: number; freezer: number; room: number }
  tips: string[]
}

/** 카테고리별 기본 팁 (매칭되는 식재료에 개별 팁이 없을 때 폴백) */
export const CATEGORY_TIPS: Record<IngredientCategory, string[]> = {
  vegetable: ['신선할 때 빨리 드세요', '물기를 제거 후 보관하면 오래가요'],
  meat: ['냉장 보관 시 빠른 소비를 추천해요', '냉동하면 장기 보관 가능해요'],
  seafood: ['냉장 시 당일~이틀 내 소비 추천', '냉동 보관 시 밀봉이 중요해요'],
  dairy: ['개봉 후 빨리 소비하세요', '냉장 보관 필수예요'],
  grain: ['서늘하고 건조한 곳에 보관하세요', '밀봉하면 벌레를 예방할 수 있어요'],
  sauce: ['개봉 후 냉장 보관을 추천해요', '뚜껑을 꼭 닫아 보관하세요'],
  fruit: ['익은 정도에 따라 보관 방법이 달라요', '세척은 먹기 직전에 하세요'],
  other: ['제품 포장의 보관법을 확인하세요', '개봉 후 빠른 소비를 추천해요'],
}

/**
 * 120개+ 한국 식재료 인메모리 분류 맵
 * - 클라이언트/서버 양쪽에서 사용 가능 (Prisma 미사용)
 */
export const FOOD_DATABASE: FoodEntry[] = [
  // ═══ 채소 (25+) ═══
  { name: '양파', category: 'vegetable', defaultStorage: 'room', aliases: ['onion', '양파채'], shelfLife: { fridge: 30, freezer: 180, room: 14 }, tips: ['서늘하고 통풍 잘 되는 곳에 보관하세요', '냉장 보관 시 한 달까지 가능해요'] },
  { name: '감자', category: 'vegetable', defaultStorage: 'room', aliases: ['potato', '감자채'], shelfLife: { fridge: 21, freezer: 180, room: 14 }, tips: ['빛을 피해 보관하면 싹이 나는 걸 방지해요', '양파와 함께 보관하면 빨리 상해요'] },
  { name: '당근', category: 'vegetable', defaultStorage: 'fridge', aliases: ['carrot'], shelfLife: { fridge: 14, freezer: 180, room: 5 }, tips: ['키친타올로 감싸 보관하면 오래가요', '다듬어서 냉동하면 요리할 때 편해요'] },
  { name: '배추', category: 'vegetable', defaultStorage: 'fridge', aliases: ['chinese cabbage', '알배추', '알배기배추'], shelfLife: { fridge: 14, freezer: 90, room: 3 }, tips: ['신문지로 감싸 세워서 보관하세요', '겉잎부터 떼어 쓰면 오래 보관 가능해요'] },
  { name: '대파', category: 'vegetable', defaultStorage: 'fridge', aliases: ['파', 'green onion', '쪽파'], shelfLife: { fridge: 7, freezer: 60, room: 2 }, tips: ['송송 썰어 냉동하면 언제든 사용 가능해요', '뿌리째 물에 꽂아두면 더 오래가요'] },
  { name: '마늘', category: 'vegetable', defaultStorage: 'room', aliases: ['garlic', '다진마늘', '깐마늘'], shelfLife: { fridge: 30, freezer: 180, room: 14 }, tips: ['통마늘은 망에 넣어 건조한 곳에 보관하세요', '다진 마늘은 냉동 보관이 좋아요'] },
  { name: '고추', category: 'vegetable', defaultStorage: 'fridge', aliases: ['chili', '청양고추', '풋고추', '오이고추'], shelfLife: { fridge: 7, freezer: 90, room: 3 }, tips: ['꼭지 붙인 채 보관하면 더 오래가요', '냉동하면 색과 매운맛이 유지돼요'] },
  { name: '토마토', category: 'vegetable', defaultStorage: 'fridge', aliases: ['tomato', '방울토마토', '대추토마토'], shelfLife: { fridge: 7, freezer: 60, room: 3 }, tips: ['덜 익었으면 실온에서 후숙하세요', '꼭지를 아래로 보관하면 오래가요'] },
  { name: '시금치', category: 'vegetable', defaultStorage: 'fridge', aliases: ['spinach'], shelfLife: { fridge: 5, freezer: 90, room: 1 }, tips: ['데쳐서 냉동하면 한 달 이상 보관 가능해요', '물기 제거 후 키친타올로 감싸 보관하세요'] },
  { name: '브로콜리', category: 'vegetable', defaultStorage: 'fridge', aliases: ['broccoli'], shelfLife: { fridge: 7, freezer: 180, room: 2 }, tips: ['소분해서 냉동하면 6개월 보관 가능해요', '줄기도 껍질 벗기면 맛있게 먹을 수 있어요'] },
  { name: '파프리카', category: 'vegetable', defaultStorage: 'fridge', aliases: ['paprika', '피망'], shelfLife: { fridge: 7, freezer: 90, room: 3 }, tips: ['씨를 제거하고 보관하면 더 오래가요', '비닐팩에 넣어 냉장하세요'] },
  { name: '버섯', category: 'vegetable', defaultStorage: 'fridge', aliases: ['mushroom', '팽이버섯', '새송이버섯', '표고버섯', '느타리버섯', '양송이버섯'], shelfLife: { fridge: 5, freezer: 90, room: 1 }, tips: ['물에 씻지 말고 키친타올로 닦아 보관하세요', '종이봉투에 넣으면 습기 조절이 돼요'] },
  { name: '콩나물', category: 'vegetable', defaultStorage: 'fridge', aliases: ['bean sprout', '숙주나물', '숙주'], shelfLife: { fridge: 3, freezer: 30, room: 1 }, tips: ['물에 담가 냉장하면 하루 더 보관 가능해요', '구매 후 빠른 소비를 추천해요'] },
  { name: '오이', category: 'vegetable', defaultStorage: 'fridge', aliases: ['cucumber'], shelfLife: { fridge: 7, freezer: 30, room: 2 }, tips: ['랩으로 감싸면 수분 증발을 막아요', '5°C 이하에서는 냉해를 입을 수 있어요'] },
  { name: '호박', category: 'vegetable', defaultStorage: 'fridge', aliases: ['zucchini', '애호박', '단호박', '늙은호박'], shelfLife: { fridge: 7, freezer: 90, room: 5 }, tips: ['단호박은 통째로 실온 보관 가능해요', '자른 호박은 씨를 제거 후 랩으로 감싸세요'] },
  { name: '고구마', category: 'vegetable', defaultStorage: 'room', aliases: ['sweet potato'], shelfLife: { fridge: 30, freezer: 180, room: 14 }, tips: ['냉장하면 맛이 떨어져요, 실온이 좋아요', '신문지로 감싸 서늘한 곳에 보관하세요'] },
  { name: '무', category: 'vegetable', defaultStorage: 'fridge', aliases: ['radish', '총각무'], shelfLife: { fridge: 14, freezer: 90, room: 5 }, tips: ['잎을 잘라내고 보관하면 오래가요', '랩으로 감싸 냉장 보관하세요'] },
  { name: '양배추', category: 'vegetable', defaultStorage: 'fridge', aliases: ['cabbage'], shelfLife: { fridge: 14, freezer: 90, room: 3 }, tips: ['심지를 빼고 젖은 키친타올을 넣어 보관하세요', '겉잎부터 떼어 쓰면 2주까지 보관 가능해요'] },
  { name: '상추', category: 'vegetable', defaultStorage: 'fridge', aliases: ['lettuce', '깻잎'], shelfLife: { fridge: 5, freezer: 30, room: 1 }, tips: ['젖은 키친타올로 감싸 보관하세요', '물기가 많으면 빨리 무르니 주의하세요'] },
  { name: '깻잎', category: 'vegetable', defaultStorage: 'fridge', aliases: ['perilla leaf'], shelfLife: { fridge: 5, freezer: 60, room: 1 }, tips: ['줄기 부분에 물을 적셔 보관하면 오래가요', '밀폐용기에 키친타올과 함께 보관하세요'] },
  { name: '생강', category: 'vegetable', defaultStorage: 'room', aliases: ['ginger'], shelfLife: { fridge: 21, freezer: 180, room: 7 }, tips: ['껍질째 냉동하면 강판에 갈기 편해요', '건조한 곳에 보관하세요'] },
  { name: '부추', category: 'vegetable', defaultStorage: 'fridge', aliases: ['chives', '부추'], shelfLife: { fridge: 5, freezer: 60, room: 1 }, tips: ['신문지로 감싸 세워서 보관하세요', '빠른 소비를 추천해요, 금방 시들어요'] },
  { name: '미나리', category: 'vegetable', defaultStorage: 'fridge', aliases: ['water parsley'], shelfLife: { fridge: 5, freezer: 30, room: 1 }, tips: ['물에 담가 냉장하면 신선도가 유지돼요', '뿌리 부분을 물에 담가 보관하세요'] },
  { name: '셀러리', category: 'vegetable', defaultStorage: 'fridge', aliases: ['celery'], shelfLife: { fridge: 10, freezer: 90, room: 2 }, tips: ['알루미늄 호일로 감싸면 2주까지 보관 가능해요', '물에 담가두면 아삭함이 살아나요'] },
  { name: '비트', category: 'vegetable', defaultStorage: 'fridge', aliases: ['beet'], shelfLife: { fridge: 14, freezer: 180, room: 5 }, tips: ['잎을 잘라내고 보관하면 뿌리가 오래가요', '삶아서 냉동하면 편하게 활용할 수 있어요'] },
  { name: '옥수수', category: 'vegetable', defaultStorage: 'fridge', aliases: ['corn'], shelfLife: { fridge: 5, freezer: 180, room: 2 }, tips: ['껍질째 냉장하면 신선도 유지에 좋아요', '삶아서 알맹이만 냉동하면 오래 보관 가능해요'] },

  // ═══ 육류 (10+) ═══
  { name: '소고기', category: 'meat', defaultStorage: 'fridge', aliases: ['beef', '쇠고기', '한우'], shelfLife: { fridge: 3, freezer: 180, room: 0 }, tips: ['3일 내 소비 추천, 냉동하면 6개월 보관 가능', '해동은 냉장실에서 천천히 하세요'] },
  { name: '돼지고기', category: 'meat', defaultStorage: 'fridge', aliases: ['pork'], shelfLife: { fridge: 3, freezer: 180, room: 0 }, tips: ['소분해서 냉동하면 필요한 만큼 쓸 수 있어요', '냉장 시 3일 내 소비하세요'] },
  { name: '닭고기', category: 'meat', defaultStorage: 'fridge', aliases: ['chicken', '닭', '닭가슴살', '닭다리'], shelfLife: { fridge: 2, freezer: 180, room: 0 }, tips: ['냉장 시 2일 내 소비가 안전해요', '냉동 시 밀봉하면 냄새 배는 걸 막아요'] },
  { name: '삼겹살', category: 'meat', defaultStorage: 'fridge', aliases: ['pork belly'], shelfLife: { fridge: 3, freezer: 180, room: 0 }, tips: ['1회분씩 소분 냉동이 편해요', '냉장 보관 시 3일 내 소비 추천해요'] },
  { name: '갈비', category: 'meat', defaultStorage: 'fridge', aliases: ['ribs', '소갈비', '돼지갈비', 'LA갈비'], shelfLife: { fridge: 3, freezer: 180, room: 0 }, tips: ['양념에 재워 냉동하면 바로 구울 수 있어요', '냉장 시 3일 내 소비하세요'] },
  { name: '목살', category: 'meat', defaultStorage: 'fridge', aliases: ['pork neck', '돼지목살'], shelfLife: { fridge: 3, freezer: 180, room: 0 }, tips: ['소분 냉동하면 해동 후 바로 조리 가능해요', '냉장 보관 시 빠른 소비를 추천해요'] },
  { name: '오리고기', category: 'meat', defaultStorage: 'fridge', aliases: ['duck', '오리'], shelfLife: { fridge: 2, freezer: 180, room: 0 }, tips: ['냉장 시 2일 내 소비를 추천해요', '기름기가 많아 밀봉 보관이 중요해요'] },
  { name: '양고기', category: 'meat', defaultStorage: 'fridge', aliases: ['lamb'], shelfLife: { fridge: 3, freezer: 180, room: 0 }, tips: ['냄새가 걱정되면 우유에 담가두세요', '냉동 시 6개월까지 보관 가능해요'] },
  { name: '다짐육', category: 'meat', defaultStorage: 'fridge', aliases: ['ground meat', '간고기', '다진고기'], shelfLife: { fridge: 2, freezer: 120, room: 0 }, tips: ['표면적이 넓어 빨리 상해요, 2일 내 소비 추천', '납작하게 펴서 냉동하면 빨리 해동돼요'] },
  { name: '베이컨', category: 'meat', defaultStorage: 'fridge', aliases: ['bacon'], shelfLife: { fridge: 7, freezer: 90, room: 0 }, tips: ['개봉 후 랩으로 감싸 냉장하세요', '한 장씩 떼어 냉동하면 편해요'] },
  { name: '족발', category: 'meat', defaultStorage: 'fridge', aliases: ['pig feet'], shelfLife: { fridge: 2, freezer: 90, room: 0 }, tips: ['소분해서 냉동하면 전자레인지로 데워 드세요', '냉장 시 2일 내 소비가 안전해요'] },

  // ═══ 수산물 (10+) ═══
  { name: '새우', category: 'seafood', defaultStorage: 'fridge', aliases: ['shrimp', '대하', '칵테일새우'], shelfLife: { fridge: 2, freezer: 180, room: 0 }, tips: ['머리를 제거하면 냉장 보관 시 더 오래가요', '냉동 새우는 흐르는 물에 해동하세요'] },
  { name: '고등어', category: 'seafood', defaultStorage: 'fridge', aliases: ['mackerel'], shelfLife: { fridge: 2, freezer: 90, room: 0 }, tips: ['소금 간 후 냉동하면 풍미가 유지돼요', '냉장 시 당일~이틀 내 소비 추천해요'] },
  { name: '연어', category: 'seafood', defaultStorage: 'fridge', aliases: ['salmon', '훈제연어'], shelfLife: { fridge: 2, freezer: 90, room: 0 }, tips: ['회로 먹을 거면 당일 소비가 좋아요', '소분해서 냉동하면 3개월 보관 가능해요'] },
  { name: '오징어', category: 'seafood', defaultStorage: 'fridge', aliases: ['squid'], shelfLife: { fridge: 2, freezer: 120, room: 0 }, tips: ['내장 제거 후 보관하면 오래가요', '냉동 시 물기를 빼고 밀봉하세요'] },
  { name: '조개', category: 'seafood', defaultStorage: 'fridge', aliases: ['clam', '바지락', '모시조개', '홍합'], shelfLife: { fridge: 2, freezer: 90, room: 0 }, tips: ['소금물에 해감 후 보관하세요', '살아있는 조개는 빨리 조리하는 게 좋아요'] },
  { name: '참치', category: 'seafood', defaultStorage: 'fridge', aliases: ['tuna', '참치회'], shelfLife: { fridge: 1, freezer: 90, room: 0 }, tips: ['회용은 당일 소비가 필수예요', '냉동 참치는 냉장실에서 천천히 해동하세요'] },
  { name: '멸치', category: 'seafood', defaultStorage: 'room', aliases: ['anchovy', '건멸치', '마른멸치'], shelfLife: { fridge: 90, freezer: 365, room: 60 }, tips: ['건멸치는 냉동 보관하면 1년까지 가요', '밀봉해서 습기를 차단하세요'] },
  { name: '갈치', category: 'seafood', defaultStorage: 'fridge', aliases: ['hairtail', '은갈치'], shelfLife: { fridge: 2, freezer: 90, room: 0 }, tips: ['토막 내서 냉동하면 조리할 때 편해요', '냉장 시 빠른 소비를 추천해요'] },
  { name: '꽃게', category: 'seafood', defaultStorage: 'fridge', aliases: ['crab', '대게'], shelfLife: { fridge: 2, freezer: 90, room: 0 }, tips: ['살아있을 때 빠르게 조리하세요', '찜이나 탕으로 활용하면 좋아요'] },
  { name: '전복', category: 'seafood', defaultStorage: 'fridge', aliases: ['abalone'], shelfLife: { fridge: 3, freezer: 90, room: 0 }, tips: ['소금물에 넣어 냉장하면 더 오래 살아요', '죽이나 구이로 활용하면 좋아요'] },
  { name: '미역', category: 'seafood', defaultStorage: 'room', aliases: ['seaweed', '건미역', '마른미역'], shelfLife: { fridge: 180, freezer: 365, room: 180 }, tips: ['건미역은 밀봉해서 건조한 곳에 보관하세요', '불리면 6~7배로 불어나니 양 조절하세요'] },
  { name: '김', category: 'seafood', defaultStorage: 'room', aliases: ['laver', '김밥김', '구운김', '조미김'], shelfLife: { fridge: 180, freezer: 365, room: 90 }, tips: ['습기에 약해요, 밀봉 보관이 필수예요', '냉동하면 바삭한 식감이 유지돼요'] },

  // ═══ 유제품 (8+) ═══
  { name: '우유', category: 'dairy', defaultStorage: 'fridge', aliases: ['milk', '밀크', '흰우유'], shelfLife: { fridge: 7, freezer: 30, room: 1 }, tips: ['개봉 후 3일 내 소비가 좋아요', '냉장실 안쪽에 보관하면 온도가 안정적이에요'] },
  { name: '계란', category: 'dairy', defaultStorage: 'fridge', aliases: ['egg', '달걀', '에그'], shelfLife: { fridge: 21, freezer: 120, room: 7 }, tips: ['뾰족한 쪽을 아래로 보관하면 오래가요', '물에 넣었을 때 뜨면 오래된 거예요'] },
  { name: '버터', category: 'dairy', defaultStorage: 'fridge', aliases: ['butter'], shelfLife: { fridge: 30, freezer: 180, room: 1 }, tips: ['소분해서 냉동하면 6개월 보관 가능해요', '냄새를 잘 흡수하니 밀봉 보관하세요'] },
  { name: '치즈', category: 'dairy', defaultStorage: 'fridge', aliases: ['cheese', '슬라이스치즈', '모짜렐라', '크림치즈', '체다치즈'], shelfLife: { fridge: 14, freezer: 90, room: 1 }, tips: ['개봉 후 랩으로 밀착 포장하세요', '곰팡이가 보이면 해당 부분을 넉넉히 잘라내세요'] },
  { name: '요거트', category: 'dairy', defaultStorage: 'fridge', aliases: ['yogurt', '요플레', '그릭요거트'], shelfLife: { fridge: 10, freezer: 60, room: 1 }, tips: ['유통기한이 지나도 1~2일은 괜찮지만 맛이 변해요', '냉동하면 아이스크림처럼 즐길 수 있어요'] },
  { name: '생크림', category: 'dairy', defaultStorage: 'fridge', aliases: ['heavy cream', '휘핑크림', '크림'], shelfLife: { fridge: 7, freezer: 90, room: 0 }, tips: ['개봉 후 빠른 소비를 추천해요', '소분해서 냉동하면 요리에 활용 가능해요'] },
  { name: '두유', category: 'dairy', defaultStorage: 'room', aliases: ['soy milk'], shelfLife: { fridge: 10, freezer: 30, room: 90 }, tips: ['미개봉 시 실온 보관 가능해요', '개봉 후에는 냉장 보관하고 빠르게 드세요'] },
  { name: '연유', category: 'dairy', defaultStorage: 'room', aliases: ['condensed milk'], shelfLife: { fridge: 90, freezer: 180, room: 180 }, tips: ['개봉 후 밀폐용기에 담아 냉장하세요', '당분이 높아 상온에서도 오래 보관돼요'] },

  // ═══ 과일 (10+) ═══
  { name: '사과', category: 'fruit', defaultStorage: 'fridge', aliases: ['apple'], shelfLife: { fridge: 30, freezer: 180, room: 7 }, tips: ['에틸렌 가스가 나와요, 다른 과일과 분리 보관하세요', '비닐팩에 넣어 냉장하면 한 달까지 가요'] },
  { name: '바나나', category: 'fruit', defaultStorage: 'room', aliases: ['banana'], shelfLife: { fridge: 7, freezer: 30, room: 3 }, tips: ['냉장하면 껍질이 까매지지만 과육은 괜찮아요', '꼭지를 랩으로 감싸면 숙성이 느려져요'] },
  { name: '딸기', category: 'fruit', defaultStorage: 'fridge', aliases: ['strawberry'], shelfLife: { fridge: 5, freezer: 60, room: 1 }, tips: ['씻지 말고 보관해야 오래가요', '꼭지를 떼지 말고 냉장하세요'] },
  { name: '포도', category: 'fruit', defaultStorage: 'fridge', aliases: ['grape', '청포도', '거봉', '샤인머스캣'], shelfLife: { fridge: 7, freezer: 60, room: 2 }, tips: ['씻지 말고 키친타올에 감싸 보관하세요', '알을 떼어 냉동하면 간식으로 좋아요'] },
  { name: '수박', category: 'fruit', defaultStorage: 'fridge', aliases: ['watermelon'], shelfLife: { fridge: 7, freezer: 30, room: 3 }, tips: ['자른 수박은 랩으로 감싸 냉장하세요', '자른 후 3~4일 내 소비를 추천해요'] },
  { name: '귤', category: 'fruit', defaultStorage: 'room', aliases: ['tangerine', '한라봉', '천혜향', '감귤'], shelfLife: { fridge: 21, freezer: 60, room: 7 }, tips: ['서늘한 곳에 겹치지 않게 보관하세요', '곰팡이 난 것은 바로 분리해 주세요'] },
  { name: '배', category: 'fruit', defaultStorage: 'fridge', aliases: ['pear'], shelfLife: { fridge: 21, freezer: 90, room: 5 }, tips: ['비닐팩에 넣어 냉장하면 3주까지 보관돼요', '사과와 함께 두면 빨리 익어요'] },
  { name: '키위', category: 'fruit', defaultStorage: 'fridge', aliases: ['kiwi'], shelfLife: { fridge: 14, freezer: 60, room: 5 }, tips: ['딱딱하면 실온에서 후숙하세요', '사과 옆에 두면 빨리 익어요'] },
  { name: '복숭아', category: 'fruit', defaultStorage: 'fridge', aliases: ['peach'], shelfLife: { fridge: 5, freezer: 60, room: 2 }, tips: ['무르기 쉬우니 겹치지 않게 보관하세요', '딱딱하면 실온 후숙 후 냉장하세요'] },
  { name: '블루베리', category: 'fruit', defaultStorage: 'fridge', aliases: ['blueberry'], shelfLife: { fridge: 7, freezer: 180, room: 1 }, tips: ['씻지 말고 냉장 보관하세요', '냉동하면 6개월까지 보관 가능해요'] },
  { name: '레몬', category: 'fruit', defaultStorage: 'fridge', aliases: ['lemon', '라임'], shelfLife: { fridge: 21, freezer: 90, room: 7 }, tips: ['자른 레몬은 랩으로 단면을 감싸세요', '즙을 짜서 얼음틀에 얼리면 편해요'] },
  { name: '오렌지', category: 'fruit', defaultStorage: 'fridge', aliases: ['orange'], shelfLife: { fridge: 21, freezer: 60, room: 5 }, tips: ['냉장하면 3주까지 보관 가능해요', '상온에서는 빨리 소비하세요'] },
  { name: '감', category: 'fruit', defaultStorage: 'room', aliases: ['persimmon', '단감', '홍시'], shelfLife: { fridge: 14, freezer: 60, room: 5 }, tips: ['꼭지에 물 묻힌 솜을 올려두면 오래가요', '냉동하면 홍시처럼 즐길 수 있어요'] },
  { name: '망고', category: 'fruit', defaultStorage: 'fridge', aliases: ['mango'], shelfLife: { fridge: 7, freezer: 90, room: 3 }, tips: ['익기 전엔 실온, 익으면 냉장하세요', '큐브로 잘라 냉동하면 스무디에 좋아요'] },
  { name: '아보카도', category: 'fruit', defaultStorage: 'room', aliases: ['avocado'], shelfLife: { fridge: 7, freezer: 60, room: 3 }, tips: ['딱딱하면 실온에서 2~3일 후숙하세요', '자른 아보카도에 레몬즙을 뿌리면 갈변을 막아요'] },

  // ═══ 곡물 (10+) ═══
  { name: '쌀', category: 'grain', defaultStorage: 'room', aliases: ['rice', '백미', '현미'], shelfLife: { fridge: 180, freezer: 365, room: 90 }, tips: ['밀봉해서 서늘한 곳에 보관하세요', '여름엔 냉장 보관이 벌레 예방에 좋아요'] },
  { name: '라면', category: 'grain', defaultStorage: 'room', aliases: ['ramen', 'instant noodle', '봉지라면', '컵라면'], shelfLife: { fridge: 180, freezer: 365, room: 180 }, tips: ['직사광선을 피해 실온 보관하세요', '유통기한이 넉넉해서 비축용으로 좋아요'] },
  { name: '식빵', category: 'grain', defaultStorage: 'room', aliases: ['bread', '빵'], shelfLife: { fridge: 7, freezer: 90, room: 3 }, tips: ['냉동하면 3개월 보관 가능, 토스터로 바로 구워 드세요', '냉장하면 오히려 빨리 딱딱해져요'] },
  { name: '파스타', category: 'grain', defaultStorage: 'room', aliases: ['pasta', '스파게티면', '파스타면', '스파게티'], shelfLife: { fridge: 365, freezer: 365, room: 365 }, tips: ['건면은 밀봉만 잘하면 1년 이상 보관돼요', '습기를 차단하는 게 핵심이에요'] },
  { name: '떡', category: 'grain', defaultStorage: 'fridge', aliases: ['rice cake', '떡볶이떡', '가래떡', '떡국떡'], shelfLife: { fridge: 5, freezer: 90, room: 2 }, tips: ['냉동하면 3개월 보관 가능해요', '해동 없이 바로 조리할 수 있어요'] },
  { name: '국수', category: 'grain', defaultStorage: 'room', aliases: ['noodle', '소면', '칼국수면', '우동면'], shelfLife: { fridge: 180, freezer: 365, room: 180 }, tips: ['건면은 밀봉해서 건조한 곳에 보관하세요', '생면은 냉장이나 냉동 보관하세요'] },
  { name: '시리얼', category: 'grain', defaultStorage: 'room', aliases: ['cereal', '그래놀라'], shelfLife: { fridge: 180, freezer: 365, room: 180 }, tips: ['개봉 후 밀봉하면 눅눅해지는 걸 방지해요', '서늘한 곳에 보관하세요'] },
  { name: '밀가루', category: 'grain', defaultStorage: 'room', aliases: ['flour', '박력분', '강력분'], shelfLife: { fridge: 365, freezer: 365, room: 180 }, tips: ['밀봉해서 벌레를 방지하세요', '냉장 보관하면 더 오래 사용할 수 있어요'] },
  { name: '오트밀', category: 'grain', defaultStorage: 'room', aliases: ['oatmeal', '오트'], shelfLife: { fridge: 365, freezer: 365, room: 180 }, tips: ['밀봉해서 건조한 곳에 보관하세요', '개봉 후에도 보관만 잘하면 반년 이상 가요'] },
  { name: '식혜', category: 'grain', defaultStorage: 'fridge', aliases: [], shelfLife: { fridge: 7, freezer: 60, room: 1 }, tips: ['개봉 후 냉장 보관하고 빠르게 드세요', '냉동하면 셔벗처럼 즐길 수 있어요'] },

  // ═══ 양념/소스 (12+) ═══
  { name: '된장', category: 'sauce', defaultStorage: 'fridge', aliases: ['doenjang', 'soybean paste'], shelfLife: { fridge: 180, freezer: 365, room: 90 }, tips: ['표면에 랩을 밀착하면 변색을 막아요', '냉장하면 6개월 이상 보관 가능해요'] },
  { name: '고추장', category: 'sauce', defaultStorage: 'fridge', aliases: ['gochujang', 'red pepper paste'], shelfLife: { fridge: 180, freezer: 365, room: 90 }, tips: ['깨끗한 숟가락만 사용하면 오래가요', '냉장 보관이 풍미 유지에 좋아요'] },
  { name: '간장', category: 'sauce', defaultStorage: 'room', aliases: ['soy sauce', '진간장', '국간장'], shelfLife: { fridge: 365, freezer: 365, room: 180 }, tips: ['직사광선을 피해 서늘한 곳에 보관하세요', '개봉 후에도 보관만 잘하면 오래가요'] },
  { name: '참기름', category: 'sauce', defaultStorage: 'room', aliases: ['sesame oil'], shelfLife: { fridge: 365, freezer: 365, room: 180 }, tips: ['빛과 열을 피해 보관하면 풍미가 유지돼요', '어두운 병에 담아 보관하면 좋아요'] },
  { name: '들기름', category: 'sauce', defaultStorage: 'fridge', aliases: ['perilla oil'], shelfLife: { fridge: 90, freezer: 180, room: 30 }, tips: ['산패가 빨라요, 냉장 보관 필수예요', '소량 구매해서 빠르게 소비하는 게 좋아요'] },
  { name: '마요네즈', category: 'sauce', defaultStorage: 'fridge', aliases: ['mayonnaise', '마요'], shelfLife: { fridge: 60, freezer: 120, room: 7 }, tips: ['개봉 후 냉장 보관하고 2개월 내 소비하세요', '입구를 깨끗하게 유지하세요'] },
  { name: '케첩', category: 'sauce', defaultStorage: 'fridge', aliases: ['ketchup'], shelfLife: { fridge: 90, freezer: 180, room: 30 }, tips: ['개봉 후 냉장 보관 추천해요', '뒤집어 보관하면 마지막까지 쓸 수 있어요'] },
  { name: '고춧가루', category: 'sauce', defaultStorage: 'room', aliases: ['red pepper powder', '고추가루'], shelfLife: { fridge: 365, freezer: 365, room: 180 }, tips: ['밀봉해서 건조한 곳에 보관하세요', '냉동하면 색과 향이 오래 유지돼요'] },
  { name: '올리브오일', category: 'sauce', defaultStorage: 'room', aliases: ['olive oil'], shelfLife: { fridge: 365, freezer: 365, room: 365 }, tips: ['빛을 차단하는 병에 보관하세요', '냉장하면 굳지만 품질에는 문제없어요'] },
  { name: '식초', category: 'sauce', defaultStorage: 'room', aliases: ['vinegar', '사과식초'], shelfLife: { fridge: 365, freezer: 365, room: 365 }, tips: ['거의 상하지 않아요, 보관이 편해요', '서늘한 곳에 뚜껑 닫아 보관하세요'] },
  { name: '굴소스', category: 'sauce', defaultStorage: 'fridge', aliases: ['oyster sauce'], shelfLife: { fridge: 180, freezer: 365, room: 60 }, tips: ['개봉 후 냉장 보관하세요', '입구를 깨끗이 닦아 보관하면 오래가요'] },
  { name: '쌈장', category: 'sauce', defaultStorage: 'fridge', aliases: ['ssamjang'], shelfLife: { fridge: 90, freezer: 180, room: 30 }, tips: ['냉장 보관하면 3개월까지 가요', '깨끗한 도구만 사용하세요'] },
  { name: '토마토소스', category: 'sauce', defaultStorage: 'fridge', aliases: ['tomato sauce', '파스타소스'], shelfLife: { fridge: 7, freezer: 90, room: 365 }, tips: ['개봉 후 냉장 보관, 1주일 내 소비하세요', '소분해서 냉동하면 3개월 보관 가능해요'] },
  { name: '카레', category: 'sauce', defaultStorage: 'room', aliases: ['curry', '카레가루', '카레분말'], shelfLife: { fridge: 365, freezer: 365, room: 365 }, tips: ['밀봉해서 건조한 곳에 보관하세요', '분말 카레는 보관이 매우 편해요'] },

  // ═══ 기타 (15+) ═══
  { name: '두부', category: 'other', defaultStorage: 'fridge', aliases: ['tofu', '순두부', '연두부'], shelfLife: { fridge: 5, freezer: 90, room: 1 }, tips: ['물에 담가 냉장하고 매일 물을 갈아주세요', '냉동하면 식감이 쫄깃하게 변해 찌개에 좋아요'] },
  { name: '김치', category: 'other', defaultStorage: 'fridge', aliases: ['kimchi', '배추김치', '깍두기', '총각김치'], shelfLife: { fridge: 30, freezer: 90, room: 7 }, tips: ['꾹꾹 눌러 공기를 빼고 보관하세요', '익은 김치는 찌개나 볶음에 활용하세요'] },
  { name: '어묵', category: 'other', defaultStorage: 'fridge', aliases: ['fish cake', '오뎅'], shelfLife: { fridge: 7, freezer: 90, room: 1 }, tips: ['냉동하면 3개월 보관 가능해요', '끓는 물에 데치면 기름기를 줄일 수 있어요'] },
  { name: '만두', category: 'other', defaultStorage: 'freezer', aliases: ['dumpling', '물만두', '군만두', '왕만두', '냉동만두'], shelfLife: { fridge: 3, freezer: 180, room: 0 }, tips: ['냉동실에서 바로 조리하면 돼요', '해동하면 피가 눅눅해지니 바로 조리하세요'] },
  { name: '햄', category: 'other', defaultStorage: 'fridge', aliases: ['ham', '슬라이스햄'], shelfLife: { fridge: 14, freezer: 90, room: 1 }, tips: ['개봉 후 밀봉해서 2주 내 소비하세요', '냉동하면 3개월까지 보관 가능해요'] },
  { name: '소시지', category: 'other', defaultStorage: 'fridge', aliases: ['sausage', '비엔나소시지', '프랑크소시지'], shelfLife: { fridge: 14, freezer: 90, room: 1 }, tips: ['개봉 후 지퍼백에 넣어 냉장하세요', '냉동 시 3개월까지 보관 가능해요'] },
  { name: '참치캔', category: 'other', defaultStorage: 'room', aliases: ['canned tuna', '참치통조림'], shelfLife: { fridge: 365, freezer: 365, room: 365 }, tips: ['개봉 후에는 다른 용기에 옮겨 냉장하세요', '미개봉 시 실온에서 오래 보관 가능해요'] },
  { name: '통조림', category: 'other', defaultStorage: 'room', aliases: ['canned food', '캔', '옥수수캔', '콩통조림'], shelfLife: { fridge: 365, freezer: 365, room: 365 }, tips: ['개봉 후 캔째 보관하지 말고 용기에 옮기세요', '서늘한 곳에 보관하면 오래가요'] },
  { name: '냉동피자', category: 'other', defaultStorage: 'freezer', aliases: ['frozen pizza', '피자'], shelfLife: { fridge: 3, freezer: 180, room: 0 }, tips: ['냉동 상태에서 바로 오븐에 구우세요', '해동 후 재냉동은 피하세요'] },
  { name: '아이스크림', category: 'other', defaultStorage: 'freezer', aliases: ['ice cream'], shelfLife: { fridge: 0, freezer: 180, room: 0 }, tips: ['뚜껑 안쪽에 랩을 씌우면 결빙을 막아요', '한번 녹으면 식감이 변하니 바로 냉동하세요'] },
  { name: '냉동밥', category: 'other', defaultStorage: 'freezer', aliases: ['frozen rice', '즉석밥'], shelfLife: { fridge: 3, freezer: 90, room: 90 }, tips: ['따뜻할 때 소분해서 냉동하면 맛이 좋아요', '전자레인지로 2~3분 데우면 바로 먹을 수 있어요'] },
  { name: '즉석밥', category: 'grain', defaultStorage: 'room', aliases: ['instant rice', '햇반'], shelfLife: { fridge: 180, freezer: 365, room: 180 }, tips: ['실온 보관 가능, 비축용으로 좋아요', '전자레인지 2분이면 바로 먹을 수 있어요'] },
  { name: '단무지', category: 'other', defaultStorage: 'fridge', aliases: ['pickled radish'], shelfLife: { fridge: 30, freezer: 90, room: 7 }, tips: ['개봉 후 국물에 담가 냉장하세요', '국물이 탁해지면 교체해 주세요'] },
  { name: '젓갈', category: 'other', defaultStorage: 'fridge', aliases: ['salted seafood', '새우젓', '멸치젓'], shelfLife: { fridge: 90, freezer: 180, room: 30 }, tips: ['냉장 보관하면 3개월까지 가요', '깨끗한 도구만 사용하면 오래 보관돼요'] },
  { name: '묵', category: 'other', defaultStorage: 'fridge', aliases: ['acorn jelly', '도토리묵', '메밀묵'], shelfLife: { fridge: 5, freezer: 60, room: 1 }, tips: ['물에 담가 냉장하면 식감이 유지돼요', '빠른 소비를 추천해요, 금방 물러져요'] },
  { name: '스팸', category: 'other', defaultStorage: 'room', aliases: ['spam', '런천미트'], shelfLife: { fridge: 7, freezer: 90, room: 365 }, tips: ['미개봉 시 실온에서 오래 보관 가능해요', '개봉 후에는 밀폐용기에 담아 냉장하세요'] },
  { name: '냉동새우', category: 'seafood', defaultStorage: 'freezer', aliases: ['frozen shrimp'], shelfLife: { fridge: 2, freezer: 180, room: 0 }, tips: ['흐르는 물에 해동하면 빨라요', '해동 후 재냉동은 식감이 떨어지니 피하세요'] },
  { name: '냉동볶음밥', category: 'other', defaultStorage: 'freezer', aliases: ['frozen fried rice'], shelfLife: { fridge: 2, freezer: 180, room: 0 }, tips: ['해동 없이 바로 볶으면 돼요', '계란 추가하면 더 맛있어요'] },
  { name: '핫도그', category: 'other', defaultStorage: 'freezer', aliases: ['hot dog', '냉동핫도그', '콘도그'], shelfLife: { fridge: 3, freezer: 120, room: 0 }, tips: ['에어프라이어로 조리하면 바삭해요', '냉동 상태에서 바로 조리하세요'] },
]

/** 이름으로 빠르게 조회하기 위한 정규화된 인덱스 */
const nameIndex = new Map<string, FoodEntry>()
const aliasIndex = new Map<string, FoodEntry>()

for (const entry of FOOD_DATABASE) {
  nameIndex.set(entry.name, entry)
  for (const alias of entry.aliases) {
    aliasIndex.set(alias.toLowerCase(), entry)
  }
}

/** 정확한 이름 매칭으로 조회 */
export function findFoodByExactName(name: string): FoodEntry | undefined {
  return nameIndex.get(name) ?? aliasIndex.get(name.toLowerCase())
}

/** 부분 매칭 (includes) 으로 조회 */
export function findFoodByPartialName(name: string): FoodEntry | undefined {
  const normalized = name.trim()
  if (!normalized) return undefined

  // 1. 정확 매칭
  const exact = findFoodByExactName(normalized)
  if (exact) return exact

  // 2. DB 이름이 입력을 포함하거나, 입력이 DB 이름을 포함
  for (const entry of FOOD_DATABASE) {
    if (entry.name.includes(normalized) || normalized.includes(entry.name)) {
      return entry
    }
  }

  // 3. 별칭 부분 매칭
  const lowerInput = normalized.toLowerCase()
  for (const entry of FOOD_DATABASE) {
    for (const alias of entry.aliases) {
      if (alias.toLowerCase().includes(lowerInput) || lowerInput.includes(alias.toLowerCase())) {
        return entry
      }
    }
  }

  return undefined
}
