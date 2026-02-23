'use client'

import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/layout/BottomNav'
import { Camera, Shield, ChefHat, ArrowRight } from 'lucide-react'

const FridgePage = dynamic(() => import('./(main)/fridge/page'), { ssr: false })

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <main className="flex-1 pb-24">
          <FridgePage />
        </main>
        <BottomNav />
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
          <div className="flex flex-col gap-4 animate-stagger">
            {[
              { step: '01', icon: Camera, title: '사진으로 등록', desc: '식재료를 찍으면 AI가 자동 인식하고 유통기한까지 설정해요' },
              { step: '02', icon: Shield, title: '스마트 관리', desc: '유통기한 알림, 보관 팁, 낭비 방지까지 AI가 관리해요' },
              { step: '03', icon: ChefHat, title: '맞춤 레시피', desc: '냉장고 속 재료로 만들 수 있는 레시피를 AI가 추천해요' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex items-start gap-5 rounded-3xl bg-white p-5 shadow-card">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint/10">
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
