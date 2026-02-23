'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  text?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingSpinner = ({ text, className, size = 'md' }: LoadingSpinnerProps) => {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-12', className)}>
      <Loader2 className={cn('animate-spin text-mint', sizeClass[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
