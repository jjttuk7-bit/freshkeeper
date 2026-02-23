# CLAUDE.md — FreshKeeper 웹앱 개발 가이드

> 이 문서는 Claude Code가 FreshKeeper 프로젝트를 개발할 때 참조하는 핵심 지침서입니다.
> 모든 코드 생성, 아키텍처 결정, 기능 구현 시 이 문서를 기준으로 합니다.

---

## 1. 프로젝트 개요

### 1.1 FreshKeeper란?

FreshKeeper는 AI 기술을 활용하여 일반 냉장고를 AI 냉장고로 전환시켜주는 스마트 주방 라이프 플랫폼입니다. 식재료 사진 한 장으로 자동 등록하고, 유통기한을 스마트하게 관리하며, 냉장고 속 재료로 AI 셰프가 맞춤형 레시피를 추천하는 웹앱입니다.

### 1.2 핵심 가치 제안

- **하드웨어 미의존**: 삼성/LG 스마트 냉장고 없이도 모든 냉장고를 AI 냉장고로 전환
- **End-to-End 통합**: 식재료 관리 + AI 레시피 + 장보기 + 식비 분석의 원스톱
- **한국 식문화 특화**: 김치/장류/반찬 문화, 국내 식품 DB 연동
- **데이터 플라이휠**: 사용자 증가 → AI 정확도 향상 → 만족도 증가 선순환

### 1.3 타겟 사용자

| 페르소나 | 연령 | 핵심 니즈 |
|---------|------|----------|
| 자취 신입생 | 20대 후반~30대 | 간편한 식재료 관리, 쉽고 빠른 레시피 |
| 맞벌이 부부 | 30~40대 | 식단 계획 자동화, 시간 절약 |
| 건강 관리자 | 30~50대 | 영양 밸런스, 건강 레시피 |
| 절약 가장 | 40~60대 | 음식물 쓰레기 방지, 식비 절감 |

---

## 2. 기술 스택

### 2.1 프론트엔드 (웹앱)

```
Framework:    Next.js 14+ (App Router)
Language:     TypeScript 5.x (strict mode)
Styling:      Tailwind CSS 3.x
UI Library:   shadcn/ui (Radix UI 기반)
State:        Zustand (클라이언트) + TanStack Query v5 (서버 상태)
Form:         React Hook Form + Zod (validation)
Chart:        Recharts (식비 분석 차트)
Camera:       react-webcam 또는 HTML5 MediaDevices API
PWA:          next-pwa (모바일 앱 경험)
```

### 2.2 백엔드

```
Runtime:      Node.js 20 LTS
Framework:    Next.js API Routes (App Router) + tRPC
ORM:          Prisma 5.x
Database:     PostgreSQL 16 (Supabase 또는 Neon)
Cache:        Redis (Upstash) — 세션, 캐시, 알림 큐
Storage:      AWS S3 또는 Supabase Storage (식재료 이미지)
Auth:         NextAuth.js v5 (OAuth: 카카오, 네이버, Google, Apple)
Payment:      Portone (구독 결제)
Push:         Web Push API + Firebase Cloud Messaging
```

### 2.3 AI / ML

```
Vision:       OpenAI GPT-4o Vision API (식재료 인식)
LLM:          Anthropic Claude API 또는 GPT-4o-mini (AI 셰프)
Embedding:    OpenAI text-embedding-3-small (레시피 검색)
OCR:          Naver Clova OCR 또는 Google Cloud Vision (영수증)
Vector DB:    Supabase pgvector (레시피 RAG 검색)
```

### 2.4 인프라 / DevOps

```
Hosting:      Vercel (프론트 + API) 또는 AWS Amplify
Database:     Supabase (PostgreSQL + Auth + Storage + Realtime)
CI/CD:        GitHub Actions
Monitoring:   Vercel Analytics + Sentry
IaC:          환경변수는 Vercel Environment Variables
```

### 2.5 핵심 패키지 요약

```json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18.3",
    "typescript": "^5.4",
    "tailwindcss": "^3.4",
    "@tanstack/react-query": "^5",
    "zustand": "^4.5",
    "prisma": "^5",
    "@prisma/client": "^5",
    "next-auth": "^5",
    "zod": "^3.23",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "recharts": "^2.12",
    "openai": "^4",
    "@anthropic-ai/sdk": "^0.30",
    "date-fns": "^3",
    "lucide-react": "^0.400"
  }
}
```

---

## 3. 프로젝트 구조

```
freshkeeper/
├── CLAUDE.md                    # 이 파일
├── .env.local                   # 환경변수 (gitignore)
├── .env.example                 # 환경변수 템플릿
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma            # DB 스키마
│   ├── seed.ts                  # 초기 데이터 (식품DB)
│   └── migrations/
├── public/
│   ├── icons/                   # PWA 아이콘
│   └── manifest.json            # PWA 매니페스트
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # 랜딩/홈
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (main)/              # 인증 필요 영역
│   │   │   ├── layout.tsx       # 하단 네비게이션 포함
│   │   │   ├── fridge/          # 냉장고 뷰 (메인)
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── scan/            # 식재료 등록
│   │   │   │   ├── page.tsx     # 등록 방법 선택
│   │   │   │   ├── camera/page.tsx
│   │   │   │   ├── barcode/page.tsx
│   │   │   │   ├── receipt/page.tsx
│   │   │   │   └── manual/page.tsx
│   │   │   ├── chef/            # AI 셰프
│   │   │   │   ├── page.tsx     # 대화형 UI
│   │   │   │   └── recipe/[id]/page.tsx
│   │   │   ├── shopping/        # 장보기
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/       # 식비 분석
│   │   │   │   └── page.tsx
│   │   │   ├── family/          # 가족 공유
│   │   │   │   └── page.tsx
│   │   │   └── settings/        # 설정
│   │   │       └── page.tsx
│   │   └── api/                 # API Routes
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── trpc/[trpc]/route.ts
│   │       ├── ai/
│   │       │   ├── recognize/route.ts    # 사진 AI 인식
│   │       │   ├── chef/route.ts         # AI 셰프 대화
│   │       │   └── ocr/route.ts          # 영수증 OCR
│   │       ├── ingredients/
│   │       │   └── route.ts
│   │       ├── recipes/
│   │       │   └── route.ts
│   │       ├── shopping/
│   │       │   └── route.ts
│   │       ├── notifications/
│   │       │   └── route.ts
│   │       └── webhooks/
│   │           └── payment/route.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileLayout.tsx
│   │   ├── fridge/
│   │   │   ├── FridgeView.tsx
│   │   │   ├── IngredientCard.tsx
│   │   │   ├── FreshnessBadge.tsx
│   │   │   ├── StorageFilter.tsx
│   │   │   └── CategoryFilter.tsx
│   │   ├── scan/
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── BarcodeScanner.tsx
│   │   │   ├── ReceiptScanner.tsx
│   │   │   ├── ManualInput.tsx
│   │   │   └── ScanResultConfirm.tsx
│   │   ├── chef/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── RecipeDetail.tsx
│   │   │   └── CookingMode.tsx
│   │   ├── shopping/
│   │   │   ├── ShoppingList.tsx
│   │   │   └── ShoppingItem.tsx
│   │   ├── analytics/
│   │   │   ├── MonthlyChart.tsx
│   │   │   ├── CategoryPie.tsx
│   │   │   ├── WasteStats.tsx
│   │   │   └── SavingsBadge.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── prisma.ts            # Prisma 클라이언트 싱글턴
│   │   ├── auth.ts              # NextAuth 설정
│   │   ├── trpc.ts              # tRPC 설정
│   │   ├── ai/
│   │   │   ├── vision.ts        # GPT-4o Vision 식재료 인식
│   │   │   ├── chef.ts          # AI 셰프 RAG 파이프라인
│   │   │   ├── ocr.ts           # 영수증 OCR
│   │   │   └── embedding.ts     # 레시피 벡터 검색
│   │   ├── food-db.ts           # 식품안전나라 API 연동
│   │   ├── notifications.ts     # 푸시 알림 로직
│   │   ├── freshness.ts         # 신선도 계산 로직
│   │   └── utils.ts             # 유틸리티 함수
│   ├── hooks/
│   │   ├── useIngredients.ts
│   │   ├── useChef.ts
│   │   ├── useShopping.ts
│   │   ├── useAnalytics.ts
│   │   └── useNotifications.ts
│   ├── stores/
│   │   ├── fridgeStore.ts
│   │   ├── scanStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── ingredient.ts
│   │   ├── recipe.ts
│   │   ├── shopping.ts
│   │   └── user.ts
│   └── constants/
│       ├── categories.ts        # 식재료 카테고리 정의
│       ├── storage-types.ts     # 보관위치 정의
│       └── freshness.ts         # 신선도 기준 정의
└── tests/
    ├── unit/
    └── e2e/
```

---

## 4. 데이터베이스 스키마 (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══ 사용자 ═══
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  image             String?
  provider          String?   // kakao, naver, google, apple
  providerId        String?
  householdSize     Int       @default(1)
  dietaryRestrictions String[]  // ["채식", "할랄", "글루텐프리"]
  allergies         String[]    // ["땅콩", "갑각류", "유제품"]
  preferredCuisine  String[]    // ["한식", "양식", "일식"]
  cookingLevel      String    @default("beginner") // beginner, intermediate, advanced
  plan              String    @default("free")      // free, plus, family, premium
  
  ingredients       Ingredient[]
  shoppingLists     ShoppingList[]
  notifications     Notification[]
  preferences       UserPreference[]
  familyMemberships FamilyMember[]
  ownedFamilies     Family[]

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@map("users")
}

// ═══ 식재료 ═══
model Ingredient {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name            String
  category        String    // vegetable, meat, seafood, dairy, grain, sauce, fruit, other
  storageType     String    // fridge, freezer, room
  registeredAt    DateTime  @default(now())
  expiryDate      DateTime
  freshnessStatus String    @default("fresh") // fresh, caution, urgent, expired
  quantity        Float     @default(1)
  unit            String    @default("개")    // 개, g, kg, ml, L, 팩, 봉
  memo            String?
  imageUrl        String?
  
  isConsumed      Boolean   @default(false)
  isWasted        Boolean   @default(false)
  consumedAt      DateTime?
  purchasePrice   Int?      // 원 단위
  
  notifications   Notification[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId, freshnessStatus])
  @@index([userId, storageType])
  @@index([userId, expiryDate])
  @@index([userId, category])
  @@map("ingredients")
}

// ═══ 레시피 ═══
model Recipe {
  id              String    @id @default(cuid())
  name            String
  description     String?
  difficulty      String    @default("easy") // easy, medium, hard
  cookTime        Int       // 분 단위
  prepTime        Int       // 분 단위
  servings        Int       @default(2)
  calories        Int?
  nutrition       Json?     // { protein, carbs, fat, sodium }
  steps           Json      // [{ order, instruction, time? }]
  ingredients     Json      // [{ name, amount, unit, required }]
  imageUrl        String?
  tags            String[]  // ["한식", "저칼로리", "15분이내", "초보"]
  source          String?   // "ai-generated", "community", "curated"
  
  // 벡터 검색용
  embedding       Unsupported("vector(1536)")?
  
  preferences     UserPreference[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("recipes")
}

// ═══ 장보기 ═══
model ShoppingList {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  familyId        String?
  family          Family?   @relation(fields: [familyId], references: [id])
  
  title           String    @default("장보기 목록")
  status          String    @default("active") // active, completed, archived
  
  items           ShoppingItem[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("shopping_lists")
}

model ShoppingItem {
  id              String    @id @default(cuid())
  listId          String
  list            ShoppingList @relation(fields: [listId], references: [id], onDelete: Cascade)
  
  name            String
  quantity        Float     @default(1)
  unit            String    @default("개")
  category        String?
  estimatedPrice  Int?
  checked         Boolean   @default(false)
  sourceRecipeId  String?   // 어떤 레시피에서 추가되었는지

  createdAt       DateTime  @default(now())

  @@map("shopping_items")
}

// ═══ 알림 ═══
model Notification {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type            String    // expiry_d3, expiry_d1, expiry_today, weekly_summary, shopping_reminder
  ingredientId    String?
  ingredient      Ingredient? @relation(fields: [ingredientId], references: [id], onDelete: SetNull)
  
  title           String
  body            String
  payload         Json?     // 추가 데이터 (레시피 추천 등)
  
  scheduledAt     DateTime
  sentAt          DateTime?
  readAt          DateTime?
  status          String    @default("pending") // pending, sent, read, failed

  createdAt       DateTime  @default(now())

  @@index([userId, status])
  @@index([scheduledAt, status])
  @@map("notifications")
}

// ═══ 가족 ═══
model Family {
  id              String    @id @default(cuid())
  ownerId         String
  owner           User      @relation(fields: [ownerId], references: [id])
  name            String    @default("우리 가족")
  inviteCode      String    @unique @default(cuid())
  
  members         FamilyMember[]
  shoppingLists   ShoppingList[]

  createdAt       DateTime  @default(now())

  @@map("families")
}

model FamilyMember {
  familyId        String
  family          Family    @relation(fields: [familyId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role            String    @default("member") // owner, member

  joinedAt        DateTime  @default(now())

  @@id([familyId, userId])
  @@map("family_members")
}

// ═══ 사용자 선호 (취향 학습) ═══
model UserPreference {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipeId        String
  recipe          Recipe    @relation(fields: [recipeId], references: [id])
  
  rating          Int?      // 1~5
  liked           Boolean   @default(false)
  cooked          Boolean   @default(false)

  createdAt       DateTime  @default(now())

  @@unique([userId, recipeId])
  @@map("user_preferences")
}

// ═══ 식품 DB (캐시) ═══
model FoodDB {
  id              String    @id @default(cuid())
  name            String
  category        String
  aliases         String[]  // ["계란", "달걀", "에그"]
  avgShelfLife    Json      // { fridge: 14, freezer: 90, room: 3 } (일 단위)
  nutrition       Json?     // { calories, protein, carbs, fat }
  barcode         String?   @unique
  imageUrl        String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("food_db")
}
```

---

## 5. API 설계

### 5.1 주요 API Routes

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/api/ai/recognize` | 사진 AI 식재료 인식 | O |
| POST | `/api/ai/chef` | AI 셰프 대화 | O |
| POST | `/api/ai/ocr` | 영수증 OCR | O |
| GET | `/api/ingredients` | 식재료 목록 조회 | O |
| POST | `/api/ingredients` | 식재료 등록 | O |
| PATCH | `/api/ingredients/:id` | 식재료 수정 | O |
| DELETE | `/api/ingredients/:id` | 식재료 삭제 | O |
| POST | `/api/ingredients/:id/consume` | 소비 처리 | O |
| POST | `/api/ingredients/:id/waste` | 폐기 처리 | O |
| GET | `/api/recipes/:id` | 레시피 상세 | O |
| POST | `/api/recipes/:id/rate` | 레시피 평가 | O |
| GET | `/api/shopping` | 장보기 목록 | O |
| POST | `/api/shopping` | 장보기 항목 추가 | O |
| PATCH | `/api/shopping/:id` | 항목 체크/수정 | O |
| GET | `/api/analytics/monthly` | 월별 식비 분석 | O |
| GET | `/api/analytics/waste` | 폐기 통계 | O |
| POST | `/api/family/invite` | 가족 초대 | O |
| GET | `/api/notifications` | 알림 목록 | O |

### 5.2 표준 API 응답 형식

```typescript
// 성공
{
  success: true,
  data: T,
  meta?: { page?: number, total?: number, timestamp: string }
}

// 에러
{
  success: false,
  error: { code: string, message: string }
}
```

---

## 6. AI 파이프라인 구현

### 6.1 식재료 인식 (src/lib/ai/vision.ts)

```typescript
// 핵심 로직 가이드
// 1. 이미지를 base64로 인코딩
// 2. GPT-4o Vision API 호출
// 3. 구조화된 JSON으로 파싱
// 4. food_db에서 메타데이터 매칭 (유통기한 등)

const SYSTEM_PROMPT = `
당신은 식재료 인식 전문가입니다.
사진에서 식재료를 분석하여 다음 JSON 형식으로 응답하세요:
{
  "ingredients": [
    {
      "name": "식재료명 (한국어)",
      "category": "vegetable|meat|seafood|dairy|grain|sauce|fruit|other",
      "quantity": 숫자,
      "unit": "개|g|kg|ml|팩|봉",
      "freshness": "fresh|caution|urgent",
      "confidence": 0.0~1.0
    }
  ]
}
반드시 JSON만 응답하세요. 한국 식재료에 특화하여 인식하세요.
`;
```

### 6.2 AI 셰프 (src/lib/ai/chef.ts)

```typescript
// RAG 기반 레시피 추천 파이프라인
// 1. 사용자 요청 의도 파악
// 2. 냉장고 재고 조회 (임박 재료 우선)
// 3. pgvector로 유사 레시피 검색
// 4. 사용자 선호/알레르기/식이제한 필터링
// 5. LLM으로 맞춤 응답 생성

const CHEF_SYSTEM_PROMPT = `
당신은 FreshKeeper의 AI 셰프입니다.
따뜻하고 친근한 '주방 친구' 말투로 대화하세요.

규칙:
- 사용자의 냉장고 재료를 기반으로 레시피를 추천하세요
- 유통기한 임박 재료를 우선적으로 활용하세요
- 사용자의 알레르기와 식이제한을 반드시 확인하세요
- 난이도와 조리시간을 고려하세요
- 부족한 재료는 최소화하고, 있으면 장보기 목록 추가를 제안하세요

응답 형식:
레시피 추천 시 반드시 다음 JSON을 포함하세요:
{
  "recipes": [
    {
      "name": "레시피명",
      "description": "한 줄 설명",
      "difficulty": "easy|medium|hard",
      "cookTime": 분,
      "ingredients": [{ "name": "재료명", "amount": "양", "inFridge": true/false }],
      "steps": ["1단계", "2단계", ...],
      "tags": ["한식", "저칼로리"]
    }
  ],
  "message": "사용자에게 보여줄 자연스러운 대화 메시지"
}
`;
```

### 6.3 신선도 계산 로직 (src/lib/freshness.ts)

```typescript
// 신선도 4단계 시스템
export type FreshnessStatus = 'fresh' | 'caution' | 'urgent' | 'expired';

export function calculateFreshness(expiryDate: Date): FreshnessStatus {
  const now = new Date();
  const daysLeft = differenceInDays(expiryDate, now);

  if (daysLeft < 0) return 'expired';   // 만료
  if (daysLeft <= 1) return 'urgent';    // D-1, D-Day → 빨간색
  if (daysLeft <= 3) return 'caution';   // D-3 ~ D-2 → 노란색
  return 'fresh';                         // 나머지 → 초록색
}

// 보관위치 변경 시 유통기한 재계산
export function recalculateExpiry(
  ingredient: Ingredient,
  newStorage: 'fridge' | 'freezer' | 'room',
  foodDbEntry: FoodDB
): Date {
  const shelfLifeDays = foodDbEntry.avgShelfLife[newStorage];
  
  if (ingredient.storageType === 'freezer' && newStorage === 'fridge') {
    // 냉동 → 냉장: 48시간 이내 소비 권장
    return addDays(new Date(), 2);
  }
  
  if (ingredient.storageType === 'fridge' && newStorage === 'freezer') {
    // 냉장 → 냉동: 남은 기간 + 냉동 기본 기간
    return addDays(new Date(), shelfLifeDays);
  }
  
  return addDays(new Date(), shelfLifeDays);
}
```

### 6.4 알림 스케줄링 (src/lib/notifications.ts)

```typescript
// 알림 종류
// 1. D-3 알림: "유통기한 3일 남은 재료가 있어요" + 활용 레시피 2개
// 2. D-1 알림: "내일 유통기한이에요!" + 즉시 사용 레시피 + 냉동 전환 안내
// 3. D-Day 알림: "오늘이 유통기한이에요" + 폐기/사용 선택
// 4. 주간 요약 (매주 월요일): 주간 냉장고 현황 + 임박 목록 + 추천 식단
```

---

## 7. UI/UX 가이드

### 7.1 디자인 시스템

```css
/* 컬러 팔레트 */
--color-mint:       #00D4AA;     /* 프라이머리 */
--color-mint-dark:  #00B894;     /* 프라이머리 다크 */
--color-mint-light: #E6FBF5;     /* 프라이머리 라이트 배경 */
--color-navy:       #0A1628;     /* 텍스트 */
--color-navy-light: #162D50;     /* 서브 텍스트 */
--color-orange:     #FF6B35;     /* 액센트/경고 */
--color-yellow:     #FFBE0B;     /* 주의 */
--color-red:        #FF006E;     /* 긴급/만료 */
--color-blue:       #3A86FF;     /* 정보 */
--color-purple:     #8338EC;     /* AI 관련 */
--color-bg:         #FAFCFD;     /* 배경 */
--color-gray:       #E2E8F0;     /* 구분선 */

/* 신선도 배지 컬러 */
--freshness-fresh:   #00D4AA;    /* 신선 → 초록 */
--freshness-caution: #FFBE0B;    /* 주의 → 노랑 */
--freshness-urgent:  #FF006E;    /* 긴급 → 빨강 */
--freshness-expired: #A0AEC0;    /* 만료 → 회색 */
```

### 7.2 모바일 퍼스트 원칙

- 모든 화면은 **모바일 뷰(375px)** 기준으로 먼저 설계
- 하단 네비게이션 바: 냉장고 | 등록(+) | AI 셰프 | 장보기 | 더보기
- 터치 타겟 최소 44px × 44px
- 스와이프 제스처: 식재료 카드 좌→소비, 우→폐기
- Pull-to-refresh 지원
- 다크모드 지원

### 7.3 핵심 화면별 구현 가이드

#### 냉장고 뷰 (메인 화면)
```
┌─────────────────────────┐
│ 🧊 내 냉장고     [검색] │
├─────────────────────────┤
│ [전체] [냉장] [냉동] [실온] │  ← 보관위치 필터 탭
├─────────────────────────┤
│ 유통기한 임박 2개          │  ← 알림 배너 (있을 때만)
├─────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐      │
│ │🥬│ │🥩│ │🥛│      │  ← 식재료 그리드
│ │배추│ │소고기│ │우유│      │     신선도 배지 표시
│ │D-5│ │D-2│ │D-1│      │
│ └───┘ └───┘ └───┘      │
│ ┌───┐ ┌───┐ ┌───┐      │
│ │...│ │...│ │...│      │
│ └───┘ └───┘ └───┘      │
├─────────────────────────┤
│ [냉장고] [+등록] [AI셰프] [장보기] [더보기] │
└─────────────────────────┘
```

#### AI 셰프 (대화형)
```
┌─────────────────────────┐
│ 👨‍🍳 AI 셰프              │
├─────────────────────────┤
│ 안녕하세요! 오늘 뭐       │
│ 해먹을까요?              │
│                         │
│ 냉장고에 소고기(D-2),    │
│ 양파, 감자가 있네요.     │
│ 간단한 소고기 볶음은     │
│ 어떠세요?               │
│                         │
│    [레시피 카드]         │
│    소고기 양파 볶음      │
│    ⏱ 20분 | ⭐ 쉬움     │
│                         │
│ ┌─────────────────────┐ │
│ │ 메시지 입력...    [➤]│ │
│ └─────────────────────┘ │
│ [임박재료 활용] [간단요리] │ ← 빠른 버튼
└─────────────────────────┘
```

---

## 8. 개발 단계별 구현 우선순위

### Phase 1 — MVP (Week 1~4)

> 목표: 핵심 루프 완성 (등록 → 관리 → 알림)

**Week 1: 기반 구축**
- [ ] Next.js 프로젝트 초기화 + Tailwind + shadcn/ui 설정
- [ ] Prisma 스키마 정의 + DB 마이그레이션
- [ ] NextAuth.js 설정 (카카오 로그인 우선)
- [ ] 프로젝트 구조 + 기본 레이아웃 (하단 네비게이션)

**Week 2: 식재료 등록 & 냉장고 뷰**
- [ ] 수동 검색 등록 (FR-105, FR-106, FR-107)
- [ ] 냉장고 뷰 메인 화면 (FR-201, FR-203, FR-204)
- [ ] 보관위치 필터 (전체/냉장/냉동/실온)
- [ ] 신선도 4단계 배지 표시
- [ ] 수량 조절 및 소비/폐기 처리 (FR-205)

**Week 3: 유통기한 알림 + 장보기**
- [ ] 유통기한 자동 추정 (food_db 연동) (FR-301)
- [ ] 신선도 자동 상태 전환 (FR-302)
- [ ] 수동 장보기 목록 CRUD (FR-503)
- [ ] 프로필 설정 (FR-703)

**Week 4: 알림 + 테스트**
- [ ] D-3, D-1 푸시 알림 구현 (FR-303, FR-304)
- [ ] 만료 식재료 처리 안내 (FR-307)
- [ ] 전체 플로우 통합 테스트
- [ ] PWA 설정 (오프라인 기본 지원)

### Phase 2 — AI 강화 (Week 5~8)

> 목표: AI 핵심 기능 탑재

**Week 5~6: AI 식재료 인식**
- [ ] 사진 촬영 UI (카메라 연동) 
- [ ] GPT-4o Vision API 연동 (FR-101, FR-102)
- [ ] 인식 결과 확인/수정 UI (FR-106)
- [ ] 바코드 스캔 + 식품안전나라 DB 매칭 (FR-103)

**Week 7~8: AI 셰프**
- [ ] AI 셰프 대화형 UI (FR-401)
- [ ] RAG 파이프라인: 냉장고 재고 → 레시피 검색 → LLM 응답
- [ ] 임박 재료 우선 반영 (FR-402)
- [ ] 레시피 상세 화면 (FR-404)
- [ ] 식이제한/알레르기 필터링 (FR-406)
- [ ] 부족 재료 → 장보기 연동 (FR-408)

### Phase 3 — 생태계 (Week 9~12)

> 목표: 유료 전환 가치 구축

- [ ] 영수증 OCR 스캔 (FR-104)
- [ ] 카테고리별 필터링 + 검색/정렬 (FR-202, FR-206)
- [ ] 스마트 장보기: 재고 부족 자동 감지 (FR-501)
- [ ] 레시피 연동 장보기 (FR-502)
- [ ] 체크 후 냉장고 등록 연동 (FR-504)
- [ ] 식비 분석: 월별 추이 차트 (FR-601)
- [ ] 카테고리별 지출 비율 (FR-602)
- [ ] 음식물 쓰레기 통계 (FR-603)
- [ ] 가족 초대 + 공유 냉장고 (FR-701, FR-702)
- [ ] 주간 요약 알림 (FR-305)

### Phase 4 — 수익화 (Week 13~16)

> 목표: 유료 전환 + 고도화

- [ ] 구독 결제 연동 (Portone)
- [ ] 플랜별 기능 제한 (Free/Plus/Family/Premium)
- [ ] 취향 학습 엔진 (FR-403)
- [ ] 요리 모드: 단계별 가이드 + 타이머 (FR-405)
- [ ] 영양 정보 자동 분석 (FR-407)
- [ ] 절감 성과 보고서 (FR-604)
- [ ] 성취 배지 시스템 (FR-606)
- [ ] 즐겨찾기 빠른 등록 (FR-108)

---

## 9. 환경변수 (.env.example)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/freshkeeper"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""
NAVER_CLIENT_ID=""
NAVER_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI APIs
OPENAI_API_KEY=""          # GPT-4o Vision + Embedding
ANTHROPIC_API_KEY=""       # AI 셰프 (Claude)

# Storage
S3_BUCKET=""
S3_REGION=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Redis
REDIS_URL=""

# Push Notifications
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""

# Payment
PORTONE_API_KEY=""
PORTONE_API_SECRET=""

# Food Safety API (식품안전나라)
FOOD_SAFETY_API_KEY=""
```

---

## 10. Claude Code 작업 규칙

### 10.1 코딩 컨벤션

- TypeScript strict mode 필수, any 사용 금지
- 컴포넌트는 함수형 + Arrow Function으로 작성
- 파일명: kebab-case (컴포넌트만 PascalCase)
- 모든 API 응답은 Zod 스키마로 검증
- 서버 컴포넌트 우선, 클라이언트는 `'use client'` 명시
- 에러 처리: try-catch + ErrorBoundary 필수
- console.log는 개발 중에만, 프로덕션은 structured logging

### 10.2 작업 흐름

1. 새 기능 구현 전 이 CLAUDE.md의 해당 섹션을 참조
2. Prisma 스키마 변경 시 반드시 마이그레이션 생성
3. API 엔드포인트 추가 시 Zod 입력 검증 + 표준 응답 형식 사용
4. AI API 호출 시 에러 핸들링 + 타임아웃(30초) + 재시도(1회) 적용
5. UI 구현 시 모바일 퍼스트 + shadcn/ui 컴포넌트 활용
6. 커밋 메시지: `feat:`, `fix:`, `refactor:`, `style:`, `docs:` 접두사

### 10.3 성능 기준

| 항목 | 목표 |
|------|------|
| API 응답 (일반) | p95 < 500ms |
| AI 식재료 인식 | < 3초 |
| AI 셰프 응답 | < 5초 |
| 앱 초기 로딩 | < 3초 |
| Lighthouse 점수 | 90+ (Performance) |
| Core Web Vitals | LCP < 2.5s, CLS < 0.1 |

### 10.4 보안 체크리스트

- [ ] 모든 API Route에 인증 미들웨어 적용
- [ ] 사용자 입력 Zod 검증 필수
- [ ] 이미지 업로드 시 파일 타입/크기 검증 (최대 10MB)
- [ ] SQL Injection 방지: Prisma 파라미터화 쿼리만 사용
- [ ] XSS 방지: dangerouslySetInnerHTML 사용 금지
- [ ] Rate Limiting: AI API 엔드포인트 (분당 20회)
- [ ] 환경변수 노출 금지: 클라이언트에서 서버 환경변수 접근 불가

---

## 11. 자주 참조할 외부 리소스

| 리소스 | URL | 용도 |
|--------|-----|------|
| Next.js Docs | https://nextjs.org/docs | 프레임워크 레퍼런스 |
| Prisma Docs | https://www.prisma.io/docs | ORM 레퍼런스 |
| shadcn/ui | https://ui.shadcn.com | UI 컴포넌트 |
| Tailwind CSS | https://tailwindcss.com/docs | 스타일링 |
| OpenAI API | https://platform.openai.com/docs | Vision + Embedding |
| Anthropic API | https://docs.anthropic.com | AI 셰프 LLM |
| 식품안전나라 API | https://www.foodsafetykorea.go.kr/api | 식품 DB |
| Supabase | https://supabase.com/docs | DB + Auth + Storage |
| Vercel | https://vercel.com/docs | 배포 |

---

> **이 문서는 FreshKeeper 개발의 단일 진실 공급원(Single Source of Truth)입니다.**
> 모든 구현 판단은 이 문서를 기준으로 하되, 상세 기획은 별도 문서를 참조하세요:
> - 앱기획서: FreshKeeper_앱기획서.docx
> - 기능가이드: FreshKeeper_기능_사용가이드.docx
> - PRD: FreshKeeper_PRD.docx
> - TRD: FreshKeeper_TRD.docx
> - 사업계획서: FreshKeeper_사업계획서.docx
