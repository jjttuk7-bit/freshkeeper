'use client'

import Link from 'next/link'
import { Camera, FileText, Receipt, ChevronRight } from 'lucide-react'

const SCAN_METHODS = [
  {
    href: '/scan/camera',
    icon: Camera,
    title: '사진 촬영',
    desc: 'AI가 사진을 분석해 식재료를 자동으로 인식해요',
    iconBg: 'bg-mint/10',
    iconColor: 'text-mint',
    badge: 'AI 추천',
    badgeColor: 'bg-mint text-white',
  },
  {
    href: '/scan/manual',
    icon: FileText,
    title: '직접 입력',
    desc: '이름, 수량, 유통기한을 직접 입력해 등록해요',
    iconBg: 'bg-accent-blue/10',
    iconColor: 'text-accent-blue',
    badge: null,
    badgeColor: '',
  },
  {
    href: '/scan/receipt',
    icon: Receipt,
    title: '영수증 스캔',
    desc: '영수증 사진을 찍으면 구매 목록을 한 번에 등록해요',
    iconBg: 'bg-accent-purple/10',
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
