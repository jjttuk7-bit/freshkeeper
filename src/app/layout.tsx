import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'FreshKeeper - AI 스마트 냉장고',
  description: '식재료 사진 한 장으로 자동 등록하고, 유통기한을 스마트하게 관리하며, AI 셰프가 맞춤형 레시피를 추천하는 스마트 주방 플랫폼',
  manifest: '/manifest.json',
  themeColor: '#00D4AA',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-bg font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
