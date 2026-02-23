import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: React.ReactNode
  className?: string
  withBottomNav?: boolean
}

export const MobileLayout = ({
  children,
  className,
  withBottomNav = false,
}: MobileLayoutProps) => {
  return (
    <div
      className={cn(
        'max-w-md mx-auto min-h-screen bg-bg relative',
        withBottomNav && 'pb-16',
        className
      )}
    >
      {children}
    </div>
  )
}
