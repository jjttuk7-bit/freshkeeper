# Premium Minimal Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform FreshKeeper from a dev prototype into a production-grade premium minimal web app by redesigning all 12 screens while preserving existing functionality.

**Architecture:** UI-only changes — replace Tailwind classes and update component markup across all pages. No business logic, API, or state management changes. Foundation changes (tailwind config, globals.css, shared components) first, then page-by-page redesign.

**Tech Stack:** Next.js 14, Tailwind CSS 3.x, shadcn/ui, lucide-react, tailwindcss-animate

**Design Doc:** `docs/plans/2026-02-23-premium-minimal-redesign-design.md`

---

## Design System Reference (apply everywhere)

- **Cards:** `rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]` (no border)
- **Page padding:** `px-5 py-6`
- **Card inner:** `p-5`
- **Card gap:** `gap-4`
- **Section gap:** `mb-6`
- **Page title:** `text-2xl font-bold tracking-tight`
- **Section title:** `text-base font-semibold`
- **Body text:** `text-sm`
- **Caption:** `text-xs text-gray-400`
- **Primary button:** `rounded-2xl bg-mint py-4 text-[15px] font-semibold shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform`
- **Secondary button:** `rounded-2xl border-2 border-gray-200 py-4 text-[15px] font-semibold active:scale-[0.98] transition-transform`
- **Input:** `rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20`

---

### Task 1: Design System Foundation — Tailwind Config & Global CSS

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Step 1: Update tailwind.config.ts**

Add animation utilities needed for the redesign. Add `shadow-card` shorthand. In `tailwind.config.ts`, add these to the `extend` section:

```typescript
// Inside theme.extend, add:
boxShadow: {
  card: '0 2px 12px rgba(0,0,0,0.04)',
  'card-hover': '0 4px 20px rgba(0,0,0,0.08)',
},
keyframes: {
  'fade-in-up': {
    '0%': { opacity: '0', transform: 'translateY(8px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
animation: {
  'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
},
```

**Step 2: Update globals.css**

Add a utility for staggered card animations and premium input styling:

```css
@layer utilities {
  /* existing utilities stay */

  .animate-stagger > * {
    opacity: 0;
    animation: fade-in-up 0.3s ease-out forwards;
  }
  .animate-stagger > *:nth-child(1) { animation-delay: 0ms; }
  .animate-stagger > *:nth-child(2) { animation-delay: 60ms; }
  .animate-stagger > *:nth-child(3) { animation-delay: 120ms; }
  .animate-stagger > *:nth-child(4) { animation-delay: 180ms; }
  .animate-stagger > *:nth-child(5) { animation-delay: 240ms; }
  .animate-stagger > *:nth-child(6) { animation-delay: 300ms; }
  .animate-stagger > *:nth-child(7) { animation-delay: 360ms; }
  .animate-stagger > *:nth-child(8) { animation-delay: 420ms; }
}

@layer base {
  /* Override default Input styling for premium feel */
  input[type="date"] {
    @apply text-navy;
  }
}
```

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "style: add design system foundation for premium minimal redesign"
```

---

### Task 2: Bottom Navigation — Icon-Only with Floating Register Button

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/app/(main)/layout.tsx`

**Step 1: Rewrite BottomNav.tsx**

Replace the entire component. Key changes:
- Remove text labels from all items (icon-only nav)
- Make the register button a floating circle with mint color and shadow
- Increase icon sizes to 24px
- Add subtle active indicator dot below active icon
- Increase nav height to allow floating button to extend above

Replace `src/components/layout/BottomNav.tsx` with:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Refrigerator, Plus, Bot, ShoppingCart, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { href: string; icon: typeof Refrigerator; primary?: boolean }[] = [
  { href: '/fridge', icon: Refrigerator },
  { href: '/ai', icon: Bot },
  { href: '/scan', icon: Plus, primary: true },
  { href: '/shopping', icon: ShoppingCart },
  { href: '/settings', icon: MoreHorizontal },
]

export const BottomNav = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-md">
        <div className="relative mx-3 mb-2 flex items-center justify-around rounded-2xl bg-white px-2 py-2 shadow-[0_-2px_20px_rgba(0,0,0,0.06)]">
          {NAV_ITEMS.map(({ href, icon: Icon, primary }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-2xl transition-all',
                  primary ? 'relative -mt-7' : ''
                )}
              >
                {primary ? (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint shadow-lg shadow-mint/30 active:scale-[0.95] transition-transform">
                    <Icon size={26} strokeWidth={2.2} className="text-white" />
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-1">
                    <Icon
                      size={24}
                      strokeWidth={isActive ? 2.2 : 1.6}
                      className={cn(
                        'transition-colors',
                        isActive ? 'text-navy' : 'text-gray-300'
                      )}
                    />
                    {isActive && (
                      <span className="h-1 w-1 rounded-full bg-mint" />
                    )}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
```

**Step 2: Update main layout padding**

In `src/app/(main)/layout.tsx`, change `pb-20` to `pb-24` to account for floating nav:

```tsx
<main className="flex-1 pb-24">{children}</main>
```

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 4: Commit**

```bash
git add src/components/layout/BottomNav.tsx src/app/(main)/layout.tsx
git commit -m "style: redesign bottom nav with icon-only floating style"
```

---

### Task 3: Landing Page — White Hero with Storytelling

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Rewrite landing page**

Replace the entire component. Key changes:
- Remove gradient hero → white background with subtle pattern
- 3-step storytelling section (사진→관리→레시피) with numbered steps
- Large CTA button with mint shadow
- Stats section: minimal white cards instead of navy background
- Remove background decoration circles

Replace `src/app/page.tsx` with:

```tsx
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Camera, Shield, ChefHat, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/fridge')
    }
  }, [status, router])

  if (status === 'loading' || session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero */}
      <div className="px-6 pb-12 pt-20">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-3 text-sm font-semibold tracking-wider text-mint">SMART KITCHEN</p>
          <h1 className="mb-4 text-[32px] font-bold leading-tight tracking-tight text-navy">
            당신의 냉장고를<br />AI가 관리해요
          </h1>
          <p className="mb-10 text-[15px] leading-relaxed text-gray-400">
            사진 한 장으로 식재료 등록, 유통기한 자동 관리,<br />
            냉장고 속 재료로 맞춤 레시피까지
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/signup">
              <Button className="w-full rounded-2xl bg-mint py-4 text-[15px] font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform hover:bg-mint-dark">
                무료로 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full rounded-2xl py-4 text-[15px] font-semibold text-gray-500 hover:bg-gray-50">
                이미 계정이 있어요
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Step Story */}
      <div className="bg-gray-50/50 px-6 py-14">
        <div className="mx-auto max-w-md">
          <p className="mb-8 text-center text-xs font-semibold tracking-wider text-gray-400">HOW IT WORKS</p>
          <div className="flex flex-col gap-6 animate-stagger">
            {[
              { step: '01', icon: Camera, title: '사진으로 등록', desc: '식재료를 찍으면 AI가 자동 인식하고 유통기한까지 설정해요' },
              { step: '02', icon: Shield, title: '스마트 관리', desc: '유통기한 알림, 보관 팁, 낭비 방지까지 AI가 관리해요' },
              { step: '03', icon: ChefHat, title: '맞춤 레시피', desc: '냉장고 속 재료로 만들 수 있는 레시피를 AI가 추천해요' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex items-start gap-5 rounded-3xl bg-white p-5 shadow-card">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint/8">
                  <Icon className="h-6 w-6 text-mint" />
                </div>
                <div className="flex-1">
                  <p className="mb-0.5 text-xs font-bold text-mint">{step}</p>
                  <p className="text-base font-semibold text-navy">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-14">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-4">
          {[
            { value: '92%', label: 'AI 인식 정확도' },
            { value: '3만원', label: '월 평균 절감' },
            { value: '60%', label: '낭비 감소' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-2xl bg-gray-50 py-5 text-center">
              <p className="text-xl font-bold text-navy">{value}</p>
              <p className="mt-1 text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-12">
        <div className="mx-auto max-w-md text-center">
          <Link href="/signup">
            <Button className="w-full rounded-2xl bg-navy py-4 text-[15px] font-semibold text-white shadow-lg active:scale-[0.98] transition-transform hover:bg-navy-light">
              지금 시작하기
            </Button>
          </Link>
          <p className="mt-4 text-xs text-gray-300">
            demo@freshkeeper.kr / demo1234 로 체험할 수 있어요
          </p>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: redesign landing page with white hero and storytelling"
```

---

### Task 4: Login & Signup — Clean Minimal Auth

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/signup/page.tsx`

**Step 1: Rewrite login page**

Key changes:
- Remove gradient header → white background with logo
- No-border inputs (bg-gray-50)
- Stronger CTA shadow
- Cleaner layout with more whitespace

Replace `src/app/(auth)/login/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Refrigerator, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않아요')
      } else {
        router.push('/fridge')
        router.refresh()
      }
    } catch {
      setError('로그인 중 오류가 발생했어요. 다시 시도해주세요')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email: 'demo@freshkeeper.kr',
      password: 'demo1234',
      redirect: false,
    })
    if (result?.error) {
      setError('데모 계정 로그인에 실패했어요')
      setIsLoading(false)
    } else {
      router.push('/fridge')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="px-6 pb-8 pt-20 text-center">
        <div className="mb-5 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/8">
            <Refrigerator className="h-7 w-7 text-mint" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">다시 오셨군요</h1>
        <p className="mt-2 text-sm text-gray-400">로그인하고 냉장고를 관리하세요</p>
      </div>

      {/* Form */}
      <div className="mx-auto w-full max-w-md flex-1 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-navy">이메일</Label>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-accent-red">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-navy">비밀번호</Label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-accent-red">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-accent-red" />
              <p className="text-sm text-accent-red">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl bg-mint py-4 text-[15px] font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform hover:bg-mint-dark disabled:opacity-50"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-xs text-gray-300">또는</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        {/* Demo Login */}
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full rounded-2xl border-2 border-gray-100 py-3.5 text-[15px] font-semibold text-gray-500 transition-colors hover:border-mint/30 hover:bg-mint/5 disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          데모 계정으로 체험하기
        </button>

        {/* Signup link */}
        <p className="mt-8 pb-10 text-center text-sm text-gray-400">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-semibold text-mint">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 2: Rewrite signup page**

Same design language as login. Replace `src/app/(auth)/signup/page.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Refrigerator, AlertCircle, CheckCircle } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 해요').max(20, '이름은 20자 이하여야 해요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 해요').max(100, '비밀번호가 너무 길어요'),
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error?.message ?? '회원가입에 실패했어요')
        return
      }
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setError('회원가입은 완료됐지만 로그인에 실패했어요. 로그인 페이지로 이동하세요')
      } else {
        router.push('/fridge')
        router.refresh()
      }
    } catch {
      setError('오류가 발생했어요. 다시 시도해주세요')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="px-6 pb-8 pt-20 text-center">
        <div className="mb-5 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/8">
            <Refrigerator className="h-7 w-7 text-mint" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">시작하기</h1>
        <p className="mt-2 text-sm text-gray-400">무료로 냉장고를 스마트하게</p>
      </div>

      {/* Form */}
      <div className="mx-auto w-full max-w-md flex-1 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-navy">이름</Label>
            <Input
              type="text"
              placeholder="이름을 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-accent-red">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-navy">이메일</Label>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-accent-red">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-navy">비밀번호</Label>
            <Input
              type="password"
              placeholder="6자 이상 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-accent-red">{errors.password.message}</p>}
          </div>

          {/* Benefits */}
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="mb-2.5 text-xs font-semibold text-gray-500">무료 플랜 혜택</p>
            {['식재료 최대 50개 등록', 'AI 사진 인식 월 10회', '유통기한 알림 무료'].map((b) => (
              <div key={b} className="flex items-center gap-2 py-0.5">
                <CheckCircle className="h-3.5 w-3.5 text-mint" />
                <span className="text-xs text-gray-500">{b}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-accent-red" />
              <p className="text-sm text-accent-red">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl bg-mint py-4 text-[15px] font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform hover:bg-mint-dark disabled:opacity-50"
          >
            {isLoading ? '가입 중...' : '무료로 시작하기'}
          </Button>
        </form>

        <p className="mt-8 pb-10 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-semibold text-mint">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 4: Commit**

```bash
git add src/app/(auth)/login/page.tsx src/app/(auth)/signup/page.tsx
git commit -m "style: redesign login and signup pages with premium minimal style"
```

---

### Task 5: Fridge Main — 2-Column Grid with Freshness Dots

**Files:**
- Modify: `src/app/(main)/fridge/page.tsx`

**Step 1: Rewrite fridge page**

Key changes:
- 3-column → 2-column grid
- Card spacing increased (`p-5`, `gap-4`)
- Freshness indicator: small dot instead of text badge
- Header simplified: larger title, cleaner search
- Urgent alert banner: more prominent with rounded-3xl card
- Cards: `rounded-3xl shadow-card` (no border)
- Stagger animation on card grid

Replace `src/app/(main)/fridge/page.tsx` with the full redesigned component. The logic (hooks, useMemo, handlers) stays identical. Only markup/classes change:

- Header: `px-5 pt-6`, title `text-2xl font-bold tracking-tight text-navy`
- Search input: `rounded-2xl border-0 bg-white px-4 py-3 text-[15px] shadow-card`
- Storage tabs: `rounded-2xl py-2 text-[13px]`, active tab `bg-navy text-white` instead of `bg-mint text-white`
- Urgent banner: `rounded-3xl bg-freshness-urgent/5 p-5 shadow-card` (no border)
- Grid: `grid-cols-2 gap-4` instead of `grid-cols-3 gap-3`
- IngredientCard: `rounded-3xl bg-white p-5 shadow-card`, emoji in `h-14 w-14 rounded-2xl bg-gray-50`, name `text-sm font-semibold`, freshness as a colored dot `h-2 w-2 rounded-full` next to D-day text
- Empty state: larger emoji, more spacing
- Quick actions on hover: `rounded-2xl` buttons

The IngredientCard's freshness display changes from a badge to:
```tsx
<div className="flex items-center gap-1.5">
  <span className={`h-2 w-2 rounded-full ${dotColor}`} />
  <span className="text-xs text-gray-400" suppressHydrationWarning>
    {getDayLabel(daysLeft)}
  </span>
</div>
```

Where `dotColor` maps: fresh → `bg-freshness-fresh`, caution → `bg-freshness-caution`, urgent → `bg-freshness-urgent`, expired → `bg-freshness-expired`.

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/fridge/page.tsx
git commit -m "style: redesign fridge page with 2-col grid and freshness dots"
```

---

### Task 6: Fridge Detail Page — Premium Card Layout

**Files:**
- Modify: `src/app/(main)/fridge/[id]/page.tsx`

**Step 1: Redesign ingredient detail page**

Key changes:
- All cards: `rounded-3xl shadow-card` (no border)
- Page padding: `px-5`
- Hero card: larger emoji `h-20 w-20`, name `text-2xl`, freshness as dot + text
- Detail rows: more spacing `gap-5`
- Buttons: `rounded-2xl` with shadow
- Back button: cleaner circle
- Edit inputs: premium style `rounded-2xl border-0 bg-gray-50`

Apply the same pattern: same logic, only class changes. All `rounded-2xl bg-white p-5 shadow-sm` → `rounded-3xl bg-white p-5 shadow-card`. All `rounded-xl` buttons → `rounded-2xl`. Inputs get the premium input style.

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/fridge/[id]/page.tsx
git commit -m "style: redesign ingredient detail page with premium cards"
```

---

### Task 7: Scan Hub — Large Card Options

**Files:**
- Modify: `src/app/(main)/scan/page.tsx`

**Step 1: Redesign scan hub**

Key changes:
- Page padding: `px-5 pt-8`
- Title: `text-2xl font-bold tracking-tight`
- Cards: `rounded-3xl shadow-card p-6` instead of bg-color, all white
- Icon area: `h-16 w-16 rounded-2xl bg-{color}/8` (subtle tinted background)
- Badge: pill shape, same style
- Tips section: `rounded-3xl bg-gray-50 p-5`
- Add stagger animation to card list

Replace `src/app/(main)/scan/page.tsx` with:

```tsx
'use client'

import Link from 'next/link'
import { Camera, FileText, Receipt, ChevronRight } from 'lucide-react'

const SCAN_METHODS = [
  {
    href: '/scan/camera',
    icon: Camera,
    title: '사진 촬영',
    desc: 'AI가 사진을 분석해 식재료를 자동으로 인식해요',
    iconBg: 'bg-mint/8',
    iconColor: 'text-mint',
    badge: 'AI 추천',
    badgeColor: 'bg-mint text-white',
  },
  {
    href: '/scan/manual',
    icon: FileText,
    title: '직접 입력',
    desc: '이름, 수량, 유통기한을 직접 입력해 등록해요',
    iconBg: 'bg-accent-blue/8',
    iconColor: 'text-accent-blue',
    badge: null,
    badgeColor: '',
  },
  {
    href: '/scan/receipt',
    icon: Receipt,
    title: '영수증 스캔',
    desc: '영수증 사진을 찍으면 구매 목록을 한 번에 등록해요',
    iconBg: 'bg-accent-purple/8',
    iconColor: 'text-accent-purple',
    badge: '일괄등록',
    badgeColor: 'bg-accent-purple text-white',
  },
]

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-md px-5 pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-navy">식재료 등록</h1>
        <p className="mt-2 text-sm text-gray-400">원하는 방식으로 식재료를 등록하세요</p>
      </div>

      <div className="flex flex-col gap-4 animate-stagger">
        {SCAN_METHODS.map(({ href, icon: Icon, title, desc, iconBg, iconColor, badge, badgeColor }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-5 rounded-3xl bg-white p-6 shadow-card transition-all hover:shadow-card-hover active:scale-[0.98]">
              <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                <Icon className={`h-7 w-7 ${iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-navy">{title}</span>
                  {badge && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-400">{desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-200" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-gray-50 p-5">
        <p className="mb-3 text-sm font-semibold text-navy">등록 팁</p>
        <ul className="flex flex-col gap-2">
          <li className="text-xs leading-relaxed text-gray-400">• 사진 촬영 시 밝은 곳에서 찍으면 인식률이 높아져요</li>
          <li className="text-xs leading-relaxed text-gray-400">• 여러 식재료를 한 번에 사진 찍어도 돼요</li>
          <li className="text-xs leading-relaxed text-gray-400">• 영수증으로 마트 구매 목록을 한 번에 등록하세요</li>
        </ul>
      </div>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/scan/page.tsx
git commit -m "style: redesign scan hub with large card options"
```

---

### Task 8: Camera, Receipt, Manual Scan Pages — Expanded Upload Areas

**Files:**
- Modify: `src/app/(main)/scan/camera/page.tsx`
- Modify: `src/app/(main)/scan/receipt/page.tsx`
- Modify: `src/app/(main)/scan/manual/page.tsx`

**Step 1: Update all three scan sub-pages**

Apply the same premium minimal pattern to all three. Key changes for all:
- Page padding: `px-5`
- Header: back button `rounded-2xl` with `shadow-card`, title `text-base font-semibold`
- Upload area: `rounded-3xl min-h-52 shadow-card` (larger, no border-dashed, use subtle bg)
- Result cards: `rounded-3xl shadow-card p-5`
- Buttons: premium button style with `rounded-2xl shadow-lg`
- Inputs: premium input style `rounded-2xl border-0 bg-gray-50`
- Error states: `rounded-2xl`

For **camera page** (`src/app/(main)/scan/camera/page.tsx`):
- Upload area: `rounded-3xl border-2 border-dashed` → `rounded-3xl bg-gray-50`(no border when empty), `bg-mint/5` (when has preview)
- Recognized item cards: `rounded-3xl shadow-card p-4` with larger emoji icon
- Save button: premium CTA style

For **receipt page** (`src/app/(main)/scan/receipt/page.tsx`):
- Same upload area pattern
- Parsed item list: wider spacing, `rounded-3xl shadow-card`
- Save button: `rounded-2xl shadow-lg shadow-accent-purple/20`

For **manual page** (`src/app/(main)/scan/manual/page.tsx`):
- All form sections: `rounded-3xl shadow-card p-5`
- Category buttons: `rounded-2xl` instead of `rounded-xl`
- Storage buttons: `rounded-2xl`
- Inputs: premium style
- Recommendation box: `rounded-2xl bg-mint/5 p-4` (no border)

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/scan/camera/page.tsx src/app/(main)/scan/receipt/page.tsx src/app/(main)/scan/manual/page.tsx
git commit -m "style: redesign scan pages with expanded upload areas and premium cards"
```

---

### Task 9: AI Layout & Dashboard — Gradient Greeting, Circular Progress

**Files:**
- Modify: `src/app/(main)/ai/layout.tsx`
- Modify: `src/app/(main)/ai/page.tsx`

**Step 1: Redesign AI tab navigation**

Update `src/app/(main)/ai/layout.tsx`:
- Tab bar: pill-style tabs instead of underline
- Active tab: `rounded-2xl bg-navy text-white` pill
- Inactive: `text-gray-400`
- No border-bottom on container

```tsx
// Tab items get pill style:
<Link
  key={href}
  href={href}
  className={cn(
    'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-2xl transition-all',
    isActive
      ? 'bg-navy text-white shadow-sm'
      : 'text-gray-400 hover:text-gray-600'
  )}
>
```

**Step 2: Redesign AI Dashboard**

Update `src/app/(main)/ai/page.tsx`:
- Greeting card: `rounded-3xl bg-gradient-to-br from-navy to-navy-light p-6 text-white`
- FridgeStatsBar: circular progress ring instead of linear bar (use SVG circle)
- Insight cards: `rounded-3xl shadow-card` (no border)
- Add `animate-stagger` to card list
- Action buttons in cards: `rounded-2xl`

The circular progress for utilization:
```tsx
<svg className="h-16 w-16 -rotate-90">
  <circle cx="32" cy="32" r="28" strokeWidth="4" stroke="#f3f4f6" fill="none" />
  <circle
    cx="32" cy="32" r="28" strokeWidth="4" stroke="#00D4AA" fill="none"
    strokeLinecap="round"
    strokeDasharray={`${2 * Math.PI * 28}`}
    strokeDashoffset={`${2 * Math.PI * 28 * (1 - stats.utilizationPercent / 100)}`}
    className="transition-all duration-700"
  />
</svg>
```

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 4: Commit**

```bash
git add src/app/(main)/ai/layout.tsx src/app/(main)/ai/page.tsx
git commit -m "style: redesign AI dashboard with gradient greeting and circular progress"
```

---

### Task 10: AI Chef — Rounder Bubbles, Clean Input Bar

**Files:**
- Modify: `src/app/(main)/ai/chef/page.tsx`

**Step 1: Redesign AI Chef chat**

Key changes:
- Chat bubbles: `rounded-3xl` instead of `rounded-2xl`
- User bubble: `rounded-3xl rounded-br-lg` (tail on right)
- AI bubble: `rounded-3xl rounded-bl-lg` (tail on left)
- Input bar: no border, `bg-gray-50 rounded-3xl`, send button integrated inside
- Quick action pills: `rounded-2xl shadow-card`
- Header: `shadow-card` instead of border
- Recipe cards: `rounded-3xl shadow-card`

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/ai/chef/page.tsx
git commit -m "style: redesign AI chef with rounder bubbles and clean input bar"
```

---

### Task 11: AI Report — Card-Based Sections

**Files:**
- Modify: `src/app/(main)/ai/report/page.tsx`

**Step 1: Redesign weekly report**

Key changes:
- Week navigator: `rounded-3xl shadow-card`
- All section cards: `rounded-3xl shadow-card` (no border)
- Highlight items: green dot instead of checkmark circle
- Improvement items: yellow dot instead of exclamation circle
- Meal plan accordion: `rounded-3xl shadow-card`, days as `rounded-2xl` rows
- Shopping suggestions: `rounded-2xl bg-gray-50` items inside card
- More generous spacing between sections

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/ai/report/page.tsx
git commit -m "style: redesign AI report with card-based sections"
```

---

### Task 12: Shopping Page — Category Grouping with Check Animation

**Files:**
- Modify: `src/app/(main)/shopping/page.tsx`

**Step 1: Redesign shopping page**

Key changes:
- Header: `text-2xl font-bold tracking-tight`, progress bar `rounded-full h-1.5`
- Add form: `rounded-3xl shadow-card p-5`
- Category headers: `text-xs font-semibold tracking-wider text-gray-300 uppercase`
- Shopping items: `rounded-3xl shadow-card p-4` (no border)
- Check circle: smooth transition with `transition-all duration-200`
- Checked items: fade opacity `opacity-40`
- Total card: `rounded-3xl bg-navy p-5`
- Empty state: minimal with larger icon
- Add button: premium style

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/shopping/page.tsx
git commit -m "style: redesign shopping page with premium cards and clean grouping"
```

---

### Task 13: Analytics Page — Cards with Big Numbers

**Files:**
- Modify: `src/app/(main)/analytics/page.tsx`

**Step 1: Redesign analytics page**

Key changes:
- Savings badge: `rounded-3xl shadow-card` (keep gradient)
- Chart cards: `rounded-3xl shadow-card p-5`
- Stats grid: `rounded-2xl bg-gray-50 p-4` items (larger numbers `text-2xl`)
- Waste rate bar: thinner `h-1.5`
- Top wasted list: cleaner spacing
- Page title: `text-2xl font-bold tracking-tight`
- All card transitions: `shadow-card` → `shadow-card-hover` on hover

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/analytics/page.tsx
git commit -m "style: redesign analytics page with premium cards and big numbers"
```

---

### Task 14: Settings Page — Grouped Sections with Profile Card

**Files:**
- Modify: `src/app/(main)/settings/page.tsx`

**Step 1: Redesign settings page**

Key changes:
- Profile card: `rounded-3xl shadow-card p-6`, larger avatar `h-16 w-16`
- All section cards: `rounded-3xl shadow-card p-5`
- Toggle: slightly larger, more rounded
- Tag buttons: `rounded-2xl` instead of `rounded-full`
- Cooking level buttons: `rounded-2xl`
- Plan cards: `rounded-2xl` inside section
- Save button: premium CTA style
- Logout button: `rounded-2xl`
- Page title: `text-2xl font-bold tracking-tight`
- More section spacing `gap-5`

**Step 2: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 3: Commit**

```bash
git add src/app/(main)/settings/page.tsx
git commit -m "style: redesign settings page with premium grouped sections"
```

---

### Task 15: Recipe Detail & Remaining Components

**Files:**
- Modify: `src/app/(main)/ai/recipe/[id]/page.tsx`
- Modify: `src/components/ai/IngredientInsightPopup.tsx`

**Step 1: Redesign recipe detail page**

Key changes:
- All cards: `rounded-3xl shadow-card`
- Step numbers: `rounded-2xl` badges
- Ingredient pills: `rounded-2xl`
- Buttons: premium style
- Shopping add button: `rounded-2xl`
- Cooking mode: full-screen with larger step display

**Step 2: Update IngredientInsightPopup**

- Container: `rounded-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.1)]` (more prominent shadow)
- Inner sections: more spacing
- Dismiss progress bar: thinner

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds with 0 errors.

**Step 4: Commit**

```bash
git add src/app/(main)/ai/recipe/[id]/page.tsx src/components/ai/IngredientInsightPopup.tsx
git commit -m "style: redesign recipe detail and insight popup with premium style"
```

---

### Task 16: Final Build Verification & Polish

**Step 1: Run full build**

Run: `npx next build`
Expected: Build succeeds with 0 errors across all routes.

**Step 2: Visual consistency check**

Review each page for:
- Consistent rounded-3xl on all cards
- Consistent shadow-card on all cards
- Consistent px-5 page padding
- Consistent text-2xl page titles
- No leftover rounded-xl or border on main cards
- Animation stagger working on list pages

**Step 3: Final commit**

```bash
git add -A
git commit -m "style: premium minimal redesign polish and consistency pass"
```

---

## Summary of All Files Modified

| Task | Files |
|------|-------|
| 1 | `tailwind.config.ts`, `src/app/globals.css` |
| 2 | `src/components/layout/BottomNav.tsx`, `src/app/(main)/layout.tsx` |
| 3 | `src/app/page.tsx` |
| 4 | `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx` |
| 5 | `src/app/(main)/fridge/page.tsx` |
| 6 | `src/app/(main)/fridge/[id]/page.tsx` |
| 7 | `src/app/(main)/scan/page.tsx` |
| 8 | `src/app/(main)/scan/camera/page.tsx`, `src/app/(main)/scan/receipt/page.tsx`, `src/app/(main)/scan/manual/page.tsx` |
| 9 | `src/app/(main)/ai/layout.tsx`, `src/app/(main)/ai/page.tsx` |
| 10 | `src/app/(main)/ai/chef/page.tsx` |
| 11 | `src/app/(main)/ai/report/page.tsx` |
| 12 | `src/app/(main)/shopping/page.tsx` |
| 13 | `src/app/(main)/analytics/page.tsx` |
| 14 | `src/app/(main)/settings/page.tsx` |
| 15 | `src/app/(main)/ai/recipe/[id]/page.tsx`, `src/components/ai/IngredientInsightPopup.tsx` |
| 16 | All (polish pass) |

**Total: 19 files, 16 tasks, ~16 commits**
