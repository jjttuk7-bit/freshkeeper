import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { BottomNav } from '@/components/layout/BottomNav'
import { ServiceWorkerRegistrar } from '@/components/notifications/ServiceWorkerRegistrar'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <ServiceWorkerRegistrar />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
