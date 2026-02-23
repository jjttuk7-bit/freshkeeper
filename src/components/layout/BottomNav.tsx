'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Refrigerator, PlusCircle, Bot, ShoppingCart, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { href: string; icon: typeof Refrigerator; label: string; primary?: boolean }[] = [
  { href: '/fridge', icon: Refrigerator, label: '냉장고' },
  { href: '/scan', icon: PlusCircle, label: '등록', primary: true },
  { href: '/ai', icon: Bot, label: 'AI' },
  { href: '/shopping', icon: ShoppingCart, label: '장보기' },
  { href: '/settings', icon: MoreHorizontal, label: '더보기' },
]

export const BottomNav = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label, primary }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-3 py-1 rounded-xl transition-colors',
                primary
                  ? 'relative'
                  : isActive
                  ? 'text-mint'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {primary ? (
                <span
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-colors',
                    isActive
                      ? 'bg-mint-dark text-white'
                      : 'bg-mint text-white'
                  )}
                >
                  <Icon size={24} strokeWidth={2} />
                </span>
              ) : (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={cn(isActive ? 'text-mint' : 'text-gray-400')}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium leading-none',
                      isActive ? 'text-mint' : 'text-gray-400'
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
