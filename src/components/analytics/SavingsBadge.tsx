'use client'

import { Trophy } from 'lucide-react'

interface SavingsBadgeProps {
  amount: number
}

export const SavingsBadge = ({ amount }: SavingsBadgeProps) => {
  return (
    <div className="bg-gradient-to-r from-mint to-mint-dark rounded-xl p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm opacity-90">절약한 금액</p>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('ko-KR').format(amount)}원
          </p>
        </div>
      </div>
    </div>
  )
}
