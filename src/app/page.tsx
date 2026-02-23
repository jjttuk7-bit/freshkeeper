'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Refrigerator,
  Camera,
  ChefHat,
  Bell,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'

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
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-mint via-mint-dark to-navy px-6 pb-16 pt-20">
        {/* Background decoration */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-md text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
              <Refrigerator className="h-8 w-8 text-mint" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">FreshKeeper</h1>
          <p className="mb-2 text-lg font-medium text-white/90">
            AI가 관리하는 스마트 냉장고
          </p>
          <p className="mb-8 text-sm text-white/70">
            식재료 사진 한 장으로 자동 등록, 유통기한 스마트 관리,
            <br />
            AI 셰프의 맞춤형 레시피 추천
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full rounded-2xl bg-white py-6 text-base font-bold text-mint shadow-lg hover:bg-white/95">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="w-full rounded-2xl border-2 border-white/40 bg-transparent py-6 text-base font-bold text-white hover:bg-white/10"
              >
                회원가입 (무료)
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/60">
            데모 계정: demo@freshkeeper.kr / demo1234
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto w-full max-w-md px-6 py-10">
        <h2 className="mb-6 text-center text-xl font-bold text-navy">
          FreshKeeper가 특별한 이유
        </h2>

        <div className="flex flex-col gap-4">
          <FeatureCard
            icon={<Camera className="h-6 w-6 text-mint" />}
            title="AI 사진 인식"
            desc="식재료 사진을 찍으면 AI가 자동으로 인식하고 유통기한까지 추정해요"
            bg="bg-mint-light"
          />
          <FeatureCard
            icon={<Bell className="h-6 w-6 text-accent-orange" />}
            title="스마트 유통기한 알림"
            desc="D-3, D-1에 알림을 보내 음식물 쓰레기를 최소화해요"
            bg="bg-orange-50"
          />
          <FeatureCard
            icon={<ChefHat className="h-6 w-6 text-accent-purple" />}
            title="AI 셰프 레시피 추천"
            desc="냉장고 속 재료로 만들 수 있는 맞춤형 레시피를 추천해요"
            bg="bg-purple-50"
          />
          <FeatureCard
            icon={<ShoppingCart className="h-6 w-6 text-accent-blue" />}
            title="스마트 장보기"
            desc="부족한 재료를 자동으로 파악하고 장보기 목록을 만들어요"
            bg="bg-blue-50"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-navy px-6 py-8">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-mint">92%</p>
              <p className="text-xs text-white/60">AI 인식 정확도</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-mint">월 3만원</p>
              <p className="text-xs text-white/60">평균 식비 절감</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-mint">60%</p>
              <p className="text-xs text-white/60">음식물 낭비 감소</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-3 flex items-center justify-center gap-1">
            <Sparkles className="h-4 w-4 text-mint" />
            <span className="text-sm font-medium text-navy">
              지금 무료로 시작하세요
            </span>
          </div>
          <Link href="/signup">
            <Button className="w-full rounded-2xl bg-mint py-6 text-base font-bold text-white hover:bg-mint-dark">
              무료 시작하기
            </Button>
          </Link>
          <p className="mt-3 text-xs text-gray-400">
            신용카드 불필요 · 언제든지 취소 가능
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  bg,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  bg: string
}) {
  return (
    <div className={`flex items-start gap-4 rounded-2xl ${bg} p-4`}>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-navy">{title}</p>
        <p className="mt-0.5 text-sm text-navy/60">{desc}</p>
      </div>
    </div>
  )
}
