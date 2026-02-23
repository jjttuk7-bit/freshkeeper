'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon | string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        typeof icon === 'string'
          ? <span className="text-5xl mb-4">{icon}</span>
          : (() => { const Icon = icon; return <Icon className="w-16 h-16 text-border mb-4" strokeWidth={1.2} /> })()
      )}
      <h3 className="text-lg font-semibold text-navy mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-mint text-white rounded-lg text-sm font-medium hover:bg-mint-dark transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
