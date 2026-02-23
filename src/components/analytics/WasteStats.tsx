'use client'

import { Trash2, TrendingDown } from 'lucide-react'

interface WasteStatsProps {
  wasteRate: number
  totalWasted: number
  totalRegistered: number
  topWasted: { name: string; count: number }[]
}

export const WasteStats = ({ wasteRate, totalWasted, totalRegistered, topWasted }: WasteStatsProps) => {
  const rateColor = wasteRate > 20 ? 'text-accent-red' : wasteRate > 10 ? 'text-accent-yellow' : 'text-freshness-fresh'

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-4">
      <h3 className="font-semibold text-navy flex items-center gap-2">
        <Trash2 className="w-4 h-4" /> 음식물 쓰레기 통계
      </h3>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className={`text-3xl font-bold ${rateColor}`}>{wasteRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">폐기율</p>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">총 등록</span>
            <span className="font-medium text-navy">{totalRegistered}개</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">폐기</span>
            <span className="font-medium text-accent-red">{totalWasted}개</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">소비</span>
            <span className="font-medium text-freshness-fresh">{totalRegistered - totalWasted}개</span>
          </div>
        </div>
      </div>

      {topWasted.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> 자주 버리는 식재료
          </p>
          <div className="flex flex-wrap gap-2">
            {topWasted.map((item) => (
              <span key={item.name} className="text-xs px-2 py-1 bg-accent-red/10 text-accent-red rounded-full">
                {item.name} ({item.count}회)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
