'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoryPieProps {
  data: { category: string; amount: number }[]
}

const COLORS = ['#00D4AA', '#3A86FF', '#FF6B35', '#FFBE0B', '#8338EC', '#FF006E', '#00B894', '#A0AEC0']

const CATEGORY_LABELS: Record<string, string> = {
  vegetable: '채소',
  meat: '육류',
  seafood: '수산물',
  dairy: '유제품',
  grain: '곡물',
  sauce: '양념',
  fruit: '과일',
  other: '기타',
}

export const CategoryPie = ({ data }: CategoryPieProps) => {
  const chartData = data.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    value: d.amount,
  }))

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <h3 className="font-semibold text-navy mb-4">카테고리별 지출</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`} />
          <Legend
            formatter={(value) => <span className="text-xs text-navy">{value}</span>}
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
