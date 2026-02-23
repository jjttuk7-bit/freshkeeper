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
