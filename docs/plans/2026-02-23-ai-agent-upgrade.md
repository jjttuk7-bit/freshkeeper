# AI Agent Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 기존 AI 셰프를 종합 AI 에이전트로 업그레이드 — AI 대시보드 + 실시간 어시스턴트 + 주간 리포트 + AI 셰프를 하나의 AI 탭으로 통합

**Architecture:** 하단 네비의 "AI 셰프" 탭을 "AI" 탭으로 변경하고, `/ai` 경로 아래에 대시보드(기본), 셰프(채팅), 리포트 서브뷰를 구성. 백엔드에 `/api/ai/insights` (대시보드 인사이트)와 `/api/ai/report` (주간 리포트) API를 추가. 실시간 어시스턴트는 식재료 등록 시 클라이언트 식품DB + AI API를 조합하여 인사이트 팝업 제공.

**Tech Stack:** Next.js 14 App Router, Gemini 2.0 Flash API, Zustand, TanStack Query, Tailwind CSS, shadcn/ui, food-classifier (인메모리 DB)

---

## Task 1: 하단 네비게이션 "AI" 탭으로 변경

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

**Step 1: BottomNav의 AI 셰프 항목을 AI로 변경**

`BottomNav.tsx`에서 NAV_ITEMS 배열의 3번째 항목 변경:

```typescript
// 변경 전
{ href: '/chef', icon: ChefHat, label: 'AI 셰프' },
// 변경 후
{ href: '/ai', icon: Bot, label: 'AI' },
```

import에 `Bot`을 `lucide-react`에서 추가, `ChefHat` 제거.

**Step 2: 빌드 확인**

Run: `npm run dev` 후 하단 네비에 "AI" 탭 확인

**Step 3: Commit**

```bash
git add src/components/layout/BottomNav.tsx
git commit -m "feat: rename AI Chef tab to AI in bottom navigation"
```

---

## Task 2: AI 탭 레이아웃 + 서브뷰 라우팅 구조

**Files:**
- Create: `src/app/(main)/ai/page.tsx` (AI 대시보드 — 메인)
- Create: `src/app/(main)/ai/layout.tsx` (AI 탭 내부 서브탭 레이아웃)
- Move: `src/app/(main)/chef/page.tsx` → 기존 셰프 코드를 `src/app/(main)/ai/chef/page.tsx`로 이동
- Move: `src/app/(main)/chef/recipe/[id]/page.tsx` → `src/app/(main)/ai/recipe/[id]/page.tsx`
- Create: `src/app/(main)/ai/report/page.tsx` (주간 리포트 — 스텁)

**Step 1: AI 레이아웃 생성 (서브탭 네비게이션)**

`src/app/(main)/ai/layout.tsx`:

```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ChefHat, FileBarChart } from 'lucide-react'

const SUB_TABS = [
  { href: '/ai', icon: LayoutDashboard, label: '대시보드' },
  { href: '/ai/chef', icon: ChefHat, label: 'AI 셰프' },
  { href: '/ai/report', icon: FileBarChart, label: '리포트' },
]

export default function AILayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // recipe detail pages → hide sub tabs
  if (pathname.startsWith('/ai/recipe/')) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto flex max-w-md flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 border-b border-gray-100 bg-white px-4 pt-3 pb-0">
        {SUB_TABS.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/ai' ? pathname === '/ai' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2',
                isActive
                  ? 'border-mint text-mint bg-mint-light/50'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
```

**Step 2: AI 대시보드 스텁 페이지 생성**

`src/app/(main)/ai/page.tsx`:

```tsx
'use client'

export default function AIDashboardPage() {
  return (
    <div className="px-4 py-6">
      <p className="text-center text-gray-400">AI 대시보드 준비 중...</p>
    </div>
  )
}
```

**Step 3: 기존 셰프 페이지를 `/ai/chef`로 이동**

- `src/app/(main)/chef/page.tsx` 코드를 `src/app/(main)/ai/chef/page.tsx`로 복사
- `src/app/(main)/chef/recipe/[id]/page.tsx` 코드를 `src/app/(main)/ai/recipe/[id]/page.tsx`로 복사
- 셰프 페이지에서 높이 계산 부분을 `style={{ height: 'calc(100vh - 80px)' }}`에서 `className="flex flex-1 flex-col"`로 변경 (layout이 감싸므로)
- 레시피 링크를 `/chef/recipe/` → `/ai/recipe/`로 수정
- 기존 `/chef` 폴더에 redirect 추가 (하위호환):

`src/app/(main)/chef/page.tsx`:
```tsx
import { redirect } from 'next/navigation'
export default function ChefRedirect() { redirect('/ai/chef') }
```

`src/app/(main)/chef/recipe/[id]/page.tsx`:
```tsx
import { redirect } from 'next/navigation'
export default function RecipeRedirect({ params }: { params: { id: string } }) {
  redirect(`/ai/recipe/${params.id}`)
}
```

**Step 4: 리포트 스텁 페이지 생성**

`src/app/(main)/ai/report/page.tsx`:

```tsx
'use client'

export default function AIReportPage() {
  return (
    <div className="px-4 py-6">
      <p className="text-center text-gray-400">주간 리포트 준비 중...</p>
    </div>
  )
}
```

**Step 5: 빌드 확인**

네비게이션 전체 플로우 확인: 하단 AI 탭 → 대시보드/AI셰프/리포트 서브탭 전환

**Step 6: Commit**

```bash
git add src/app/(main)/ai/ src/app/(main)/chef/ src/components/layout/BottomNav.tsx
git commit -m "feat: create AI tab layout with dashboard, chef, report sub-views"
```

---

## Task 3: AI 인사이트 API 엔드포인트

**Files:**
- Create: `src/lib/ai/insights.ts` (인사이트 생성 로직)
- Create: `src/app/api/ai/insights/route.ts` (API 엔드포인트)
- Create: `src/types/ai.ts` (AI 관련 타입 정의)

**Step 1: AI 타입 정의**

`src/types/ai.ts`:

```typescript
export interface AIInsightCard {
  id: string
  type: 'urgent' | 'tip' | 'meal_plan' | 'status' | 'shopping'
  icon: string          // emoji
  title: string
  message: string
  actions?: { label: string; href?: string; action?: string }[]
  priority: number      // 0=highest
}

export interface AIInsightsResponse {
  greeting: string
  cards: AIInsightCard[]
  fridgeStats: {
    total: number
    urgent: number
    caution: number
    expired: number
    utilizationPercent: number
  }
}

export interface AIWeeklyReport {
  period: { start: string; end: string }
  highlights: string[]
  improvements: string[]
  mealPlan: { day: string; meals: string[] }[]
  shoppingSuggestions: { name: string; reason: string }[]
  wasteStats: { count: number; trend: 'up' | 'down' | 'same' }
}
```

**Step 2: 인사이트 생성 로직**

`src/lib/ai/insights.ts`:

서버에서 사용자의 재료 데이터를 분석하고 Gemini API를 호출하여 자연어 인사이트를 생성.

핵심 로직:
1. DB에서 사용자의 활성 재료 목록 조회
2. 유통기한별 분류 (urgent/caution/fresh/expired)
3. 식품DB에서 보관 팁, 궁합 정보 매칭
4. Gemini에 재료 컨텍스트 전달 → JSON 형태 인사이트 카드 생성
5. fallback: AI API 실패 시 로컬 로직으로 기본 인사이트 카드 생성

시스템 프롬프트:
```
당신은 FreshKeeper의 AI 냉장고 매니저입니다.
사용자의 냉장고 상태를 분석하여 실용적인 인사이트를 제공하세요.

응답 JSON 형식:
{
  "greeting": "오늘의 인사 메시지",
  "cards": [
    {
      "type": "urgent|tip|meal_plan|status|shopping",
      "icon": "이모지",
      "title": "카드 제목",
      "message": "상세 메시지",
      "priority": 0~4
    }
  ]
}
```

**Step 3: API 엔드포인트**

`src/app/api/ai/insights/route.ts`:

```typescript
// GET /api/ai/insights
// 1. requireAuth()
// 2. prisma에서 활성 재료 조회
// 3. getInsights(ingredients) 호출
// 4. successResponse(insights)
```

**Step 4: Commit**

```bash
git add src/types/ai.ts src/lib/ai/insights.ts src/app/api/ai/insights/route.ts
git commit -m "feat: add AI insights API for dashboard cards"
```

---

## Task 4: AI 대시보드 UI 구현

**Files:**
- Modify: `src/app/(main)/ai/page.tsx`
- Create: `src/hooks/useAI.ts` (AI 데이터 훅)

**Step 1: useAI 훅 생성**

`src/hooks/useAI.ts`:

```typescript
// useAIInsights() — TanStack Query로 /api/ai/insights GET
// - staleTime: 5분 (대시보드 진입 시마다 호출하되 5분 캐시)
// - refetchOnWindowFocus: true
```

**Step 2: AI 대시보드 페이지 구현**

`src/app/(main)/ai/page.tsx` 구성:

1. **헤더 영역**: "🤖 AI 매니저" + 날짜 표시
2. **인사 메시지**: AI가 생성한 오늘의 인사말
3. **인사이트 카드 리스트** (priority순 정렬):
   - `urgent` 카드: 빨간 테두리, 임박 재료 경고 + [레시피 보기] [냉동 전환] 버튼
   - `tip` 카드: 민트 테두리, 보관 팁/궁합 정보
   - `meal_plan` 카드: 보라 테두리, 오늘의 추천 식단
   - `status` 카드: 냉장고 현황 요약 + 활용도 프로그레스 바
   - `shopping` 카드: 파란 테두리, 장보기 제안 + [장보기에 추가] 버튼
4. **로딩 상태**: 스켈레톤 카드 3개

디자인 팔레트 (기존 컬러 활용):
- urgent → `freshness-urgent` (#FF006E)
- tip → `mint` (#00D4AA)
- meal_plan → `accent-purple` (#8338EC)
- status → `navy` (#0A1628)
- shopping → `accent-blue` (#3A86FF)

**Step 3: Commit**

```bash
git add src/hooks/useAI.ts src/app/(main)/ai/page.tsx
git commit -m "feat: implement AI dashboard with insight cards"
```

---

## Task 5: 식재료 등록 시 실시간 AI 어시스턴트

**Files:**
- Create: `src/components/ai/IngredientInsightPopup.tsx`
- Create: `src/lib/ai/ingredient-advisor.ts` (클라이언트 사이드 조언 로직)
- Modify: `src/app/(main)/scan/camera/page.tsx` (인사이트 팝업 연결)
- Modify: `src/app/(main)/scan/manual/page.tsx` (인사이트 팝업 연결)

**Step 1: 클라이언트 사이드 재료 조언 로직**

`src/lib/ai/ingredient-advisor.ts`:

인메모리 식품DB(food-database.ts)를 활용하여 AI API 호출 없이 즉시 조언 생성:

```typescript
export interface IngredientAdvice {
  storageTip: string | null       // 보관 팁
  pairingTip: string | null       // 궁합 재료 추천
  quickRecipe: string | null      // 간단 활용 레시피 한 줄
  duplicateWarning: string | null // 중복 등록 경고
  freezeRecommend: boolean        // 냉동 전환 추천 여부
}

// getIngredientAdvice(name, existingIngredients) → IngredientAdvice
// 1. food-classifier에서 보관 팁 가져오기 (getFoodTip)
// 2. existingIngredients에서 같은 이름 검색 → 중복 경고
// 3. 카테고리별 궁합 맵에서 추천 (예: 돼지고기 → 김치, 소고기 → 양파)
// 4. 유통기한 짧은 재료면 냉동 추천
```

궁합 맵 (PAIRING_MAP):
```typescript
const PAIRING_MAP: Record<string, string[]> = {
  '돼지고기': ['김치', '양파', '대파', '고추장'],
  '소고기': ['양파', '대파', '간장', '마늘'],
  '닭고기': ['감자', '당근', '간장', '고추장'],
  '두부': ['대파', '된장', '김치', '고추'],
  '계란': ['대파', '당근', '양파', '김치'],
  // ... 20개 정도
}
```

**Step 2: IngredientInsightPopup 컴포넌트**

`src/components/ai/IngredientInsightPopup.tsx`:

```tsx
// Props: { advice: IngredientAdvice; ingredientName: string; onClose: () => void }
// 바텀시트 스타일로 표시
// - 보관 팁 (💡 아이콘)
// - 궁합 재료 추천 (🤝 아이콘) — 냉장고에 있는 궁합 재료 하이라이트
// - 간단 활용법 (🍳 아이콘)
// - 중복 경고 (⚠️ 아이콘, 있을 때만)
// - 냉동 추천 (❄️ 아이콘, 해당 시만)
// auto-dismiss: 5초 후 자동 닫힘 (프로그레스 바)
```

**Step 3: camera/page.tsx에 어시스턴트 통합**

식재료 인식 완료 후(setRecognized 호출 후) 첫 번째 인식 재료에 대해 IngredientInsightPopup 표시.

**Step 4: manual/page.tsx에 어시스턴트 통합**

식재료 이름 입력(검색 선택) 후 IngredientInsightPopup 표시.

**Step 5: Commit**

```bash
git add src/lib/ai/ingredient-advisor.ts src/components/ai/IngredientInsightPopup.tsx src/app/(main)/scan/
git commit -m "feat: add real-time AI assistant for ingredient registration"
```

---

## Task 6: 주간 AI 리포트 API + UI

**Files:**
- Create: `src/lib/ai/report.ts` (리포트 생성 로직)
- Create: `src/app/api/ai/report/route.ts` (API 엔드포인트)
- Modify: `src/app/(main)/ai/report/page.tsx` (리포트 UI)
- Modify: `src/hooks/useAI.ts` (리포트 훅 추가)

**Step 1: 리포트 생성 로직**

`src/lib/ai/report.ts`:

```typescript
// getWeeklyReport(userId) → AIWeeklyReport
// 1. 이번 주(월~일) 등록/소비/폐기 재료 집계
// 2. 카테고리별 분포 계산
// 3. 폐기율 트렌드 (이번 주 vs 지난 주)
// 4. Gemini API로 자연어 분석:
//    - 잘한 점, 개선 포인트
//    - 다음 주 추천 식단 (현재 재고 기반)
//    - 추천 장보기 목록
// 5. fallback: 로컬 통계 기반 기본 리포트
```

시스템 프롬프트:
```
당신은 FreshKeeper의 AI 영양사 겸 절약 컨설턴트입니다.
주간 냉장고 데이터를 분석하여 실용적인 리포트를 작성하세요.
긍정적이고 격려하는 톤으로 작성하세요.

응답 JSON 형식:
{
  "highlights": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선 포인트 1"],
  "mealPlan": [{"day": "월", "meals": ["아침: ...", "점심: ...", "저녁: ..."]}],
  "shoppingSuggestions": [{"name": "재료명", "reason": "추천 이유"}]
}
```

**Step 2: API 엔드포인트**

`src/app/api/ai/report/route.ts`:

```typescript
// GET /api/ai/report
// query: ?week=current (default) | ?week=YYYY-MM-DD
// 1. requireAuth()
// 2. 주간 데이터 집계
// 3. getWeeklyReport(userId) 호출
// 4. successResponse(report)
```

**Step 3: useAI.ts에 리포트 훅 추가**

```typescript
// useWeeklyReport() — TanStack Query
// - staleTime: 1시간 (리포트는 자주 변경 안됨)
// - 캐시키: ['ai-report', weekString]
```

**Step 4: 리포트 UI 구현**

`src/app/(main)/ai/report/page.tsx`:

1. **기간 표시**: "2/17 ~ 2/23" + 주차 네비 (←→)
2. **잘한 점 섹션** (🏆): 리스트 (초록 체크 아이콘)
3. **개선 포인트 섹션** (📉): 리스트 (노란 경고 아이콘)
4. **다음 주 추천 식단** (🍽️): 요일별 아코디언
5. **추천 장보기** (🛒): 체크리스트 + [장보기에 추가] 버튼
6. **폐기 통계**: 이번 주 vs 지난 주 비교 뱃지
7. **로딩 상태**: 리포트 생성 중 애니메이션 (AI가 분석 중이에요...)

**Step 5: Commit**

```bash
git add src/lib/ai/report.ts src/app/api/ai/report/ src/app/(main)/ai/report/ src/hooks/useAI.ts
git commit -m "feat: implement weekly AI report with meal planning"
```

---

## Task 7: AI 셰프 페이지 정리 + 대시보드 연결

**Files:**
- Modify: `src/app/(main)/ai/page.tsx` (대시보드 카드에서 AI 셰프/리포트 딥링크)
- Modify: `src/app/(main)/ai/chef/page.tsx` (레이아웃 통합 조정)

**Step 1: 대시보드에서 셰프/리포트 연결**

대시보드 카드의 액션 버튼 구현:
- `urgent` 카드 → [레시피 보기] 클릭 시 `/ai/chef`로 이동 + 임박재료 프롬프트 자동 전송
- `meal_plan` 카드 → [자세히 보기] 클릭 시 `/ai/report`로 이동
- `shopping` 카드 → [장보기에 추가] 클릭 시 `/api/shopping` POST 호출

**Step 2: 셰프 페이지 높이 조정**

기존 셰프 페이지의 `style={{ height: 'calc(100vh - 80px)' }}`를 제거하고,
AI layout의 sub-tab 높이를 고려하여 `flex-1` 기반으로 변경.

**Step 3: Commit**

```bash
git add src/app/(main)/ai/
git commit -m "feat: connect dashboard cards to chef and report views"
```

---

## Task 8: 영수증/수동 등록 페이지에도 AI 어시스턴트 적용

**Files:**
- Modify: `src/app/(main)/scan/receipt/page.tsx`
- Modify: `src/app/(main)/scan/manual/page.tsx`

**Step 1: receipt/page.tsx에 IngredientInsightPopup 통합**

영수증 OCR 결과 확인 화면에서, 인식된 식재료 각각에 대해 식품DB 매칭하여
보관 팁 + 유통기한 추천을 인라인으로 표시 (카메라 페이지와 동일 패턴).

**Step 2: manual/page.tsx에 IngredientInsightPopup 통합**

수동 입력에서 이름 선택 후 팝업 표시 (이미 일부 팁 표시 중이면 개선).

**Step 3: Commit**

```bash
git add src/app/(main)/scan/receipt/page.tsx src/app/(main)/scan/manual/page.tsx
git commit -m "feat: add AI assistant to receipt and manual scan pages"
```

---

## Summary

| Task | 내용 | 핵심 파일 |
|------|------|----------|
| 1 | 하단 네비 AI 탭 변경 | `BottomNav.tsx` |
| 2 | AI 탭 레이아웃 + 라우팅 | `ai/layout.tsx`, `ai/page.tsx`, `ai/chef/`, `ai/report/` |
| 3 | AI 인사이트 API | `lib/ai/insights.ts`, `api/ai/insights/route.ts` |
| 4 | AI 대시보드 UI | `ai/page.tsx`, `hooks/useAI.ts` |
| 5 | 실시간 AI 어시스턴트 | `ingredient-advisor.ts`, `IngredientInsightPopup.tsx` |
| 6 | 주간 리포트 API + UI | `lib/ai/report.ts`, `api/ai/report/`, `ai/report/page.tsx` |
| 7 | 대시보드 ↔ 셰프/리포트 연결 | `ai/page.tsx`, `ai/chef/page.tsx` |
| 8 | 영수증/수동 등록에도 어시스턴트 | `scan/receipt/`, `scan/manual/` |
