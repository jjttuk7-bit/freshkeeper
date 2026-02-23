'use client'

import Link from 'next/link'
import { Camera, FileText, Receipt, Barcode, ChevronRight } from 'lucide-react'

const SCAN_METHODS = [
  {
    href: '/scan/camera',
    icon: Camera,
    emoji: '📷',
    title: '사진 촬영',
    desc: 'AI가 사진을 분석해 식재료를 자동으로 인식해요',
    color: 'bg-mint-light',
    iconColor: 'text-mint',
    badge: 'AI 추천',
    badgeColor: 'bg-mint text-white',
  },
  {
    href: '/scan/manual',
    icon: FileText,
    emoji: '📝',
    title: '직접 입력',
    desc: '이름, 수량, 유통기한을 직접 입력해 등록해요',
    color: 'bg-blue-50',
    iconColor: 'text-accent-blue',
    badge: null,
    badgeColor: '',
  },
  {
    href: '/scan/receipt',
    icon: Receipt,
    emoji: '🧾',
    title: '영수증 스캔',
    desc: '영수증 사진을 찍으면 구매 목록을 한 번에 등록해요',
    color: 'bg-purple-50',
    iconColor: 'text-accent-purple',
    badge: '일괄등록',
    badgeColor: 'bg-accent-purple text-white',
  },
  {
    href: '/scan/barcode',
    icon: Barcode,
    emoji: '📊',
    title: '바코드 스캔',
    desc: '바코드 번호로 식품 정보를 자동으로 가져와요',
    color: 'bg-orange-50',
    iconColor: 'text-accent-orange',
    badge: null,
    badgeColor: '',
  },
]

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy">식재료 등록</h1>
        <p className="mt-1 text-sm text-gray-500">원하는 방식으로 식재료를 등록하세요</p>
      </div>

      {/* Method cards */}
      <div className="flex flex-col gap-3">
        {SCAN_METHODS.map(({ href, emoji, title, desc, color, badge, badgeColor }) => (
          <Link key={href} href={href}>
            <div
              className={`flex items-center gap-4 rounded-2xl ${color} p-4 transition-all active:scale-98 hover:shadow-md`}
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                {emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy">{title}</span>
                  {badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 rounded-2xl bg-navy/5 p-4">
        <p className="mb-2 text-sm font-semibold text-navy">💡 등록 팁</p>
        <ul className="flex flex-col gap-1.5">
          <li className="text-xs text-gray-500">• 사진 촬영 시 밝은 곳에서 찍으면 인식률이 높아져요</li>
          <li className="text-xs text-gray-500">• 여러 식재료를 한 번에 사진 찍어도 돼요</li>
          <li className="text-xs text-gray-500">• 영수증으로 마트 구매 목록을 한 번에 등록하세요</li>
        </ul>
      </div>
    </div>
  )
}
