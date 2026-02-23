'use client'

import { cn } from '@/lib/utils'
import { FRESHNESS_CONFIG } from '@/constants/freshness'
import { formatDaysLeft } from '@/lib/utils'
import type { FreshnessStatus } from '@/types/ingredient'

interface FreshnessBadgeProps {
  status: FreshnessStatus
  daysLeft: number
  className?: string
  size?: 'sm' | 'md'
}

export const FreshnessBadge = ({
  status,
  daysLeft,
  className,
  size = 'sm',
}: FreshnessBadgeProps) => {
  const config = FRESHNESS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-bold leading-none',
        config.badgeClass,
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
        className
      )}
    >
      {formatDaysLeft(daysLeft)}
    </span>
  )
}
