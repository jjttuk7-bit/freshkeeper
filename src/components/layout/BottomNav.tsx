'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Refrigerator, Plus, Bot, ShoppingCart, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { href: string; icon: typeof Refrigerator; primary?: boolean }[] = [
  { href: '/fridge', icon: Refrigerator },
  { href: '/ai', icon: Bot },
  { href: '/scan', icon: Plus, primary: true },
  { href: '/shopping', icon: ShoppingCart },
  { href: '/settings', icon: MoreHorizontal },
]

export const BottomNav = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-md">
        <div className="relative mx-3 mb-2 flex items-center justify-around rounded-2xl bg-white px-2 py-2 shadow-[0_-2px_20px_rgba(0,0,0,0.06)]">
          {NAV_ITEMS.map(({ href, icon: Icon, primary }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-2xl transition-all',
                  primary ? 'relative -mt-7' : ''
                )}
              >
                {primary ? (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint shadow-lg shadow-mint/30 active:scale-[0.95] transition-transform">
                    <Icon size={26} strokeWidth={2.2} className="text-white" />
                  </span>
                ) : (
                  <span className="flex flex-col items-center gap-1">
                    <Icon
                      size={24}
                      strokeWidth={isActive ? 2.2 : 1.6}
                      className={cn(
                        'transition-colors',
                        isActive ? 'text-navy' : 'text-gray-300'
                      )}
                    />
                    {isActive && (
                      <span className="h-1 w-1 rounded-full bg-mint" />
                    )}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
