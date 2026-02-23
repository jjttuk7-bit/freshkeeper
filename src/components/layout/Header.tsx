'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  showBack?: boolean
  rightAction?: React.ReactNode
  className?: string
}

export const Header = ({ title, showBack = false, rightAction, className }: HeaderProps) => {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white border-b border-gray-100 px-4',
        className
      )}
    >
      <div className="max-w-md mx-auto flex items-center justify-between h-14">
        <div className="flex items-center gap-2 min-w-[44px]">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 -ml-1 rounded-full text-navy hover:bg-gray-50 active:bg-gray-100 transition-colors"
              aria-label="뒤로가기"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <h1 className="text-[17px] font-bold text-navy tracking-tight truncate max-w-[200px] text-center">
          {title}
        </h1>

        <div className="flex items-center justify-end min-w-[44px]">
          {rightAction ?? null}
        </div>
      </div>
    </header>
  )
}
