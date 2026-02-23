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
    <div className="mx-auto flex max-w-md flex-col" style={{ minHeight: 'calc(100vh - 96px)' }}>
      {/* Pill tab navigation */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-1.5 rounded-2xl bg-gray-50 p-1.5">
          {SUB_TABS.map(({ href, icon: Icon, label }) => {
            const isActive = href === '/ai' ? pathname === '/ai' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white text-navy shadow-card'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
