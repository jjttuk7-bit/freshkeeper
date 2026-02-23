'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MonthlyChartProps {
  data: { month: string; totalSpent: number }[]
}

export const MonthlyChart = ({ data }: MonthlyChartProps) => {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <h3 className="font-semibold text-navy mb-4">월별 식비 추이</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
          <YAxis tick={{ fontSize: 11 }} stroke="#A0AEC0" tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
          <Tooltip
            formatter={(value: number) => [`${new Intl.NumberFormat('ko-KR').format(value)}원`, '식비']}
            labelStyle={{ color: '#0A1628' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
          />
          <Bar dataKey="totalSpent" fill="#00D4AA" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
