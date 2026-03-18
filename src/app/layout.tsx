import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '心动投递 - AI智能约会匹配平台',
    template: '%s | 心动投递'
  },
  description: '每周给你匹配一位对象，AI比你更懂你想要什么。告别无休止的滑动，让缘分如约而至。',
  keywords: ['约会', 'AI匹配', '相亲', '恋爱', '心动投递', '灵魂匹配', '深度问卷'],
  authors: [{ name: '心动投递团队' }],
  creator: '心动投递',
  publisher: '心动投递',
  metadataBase: new URL('https://xindongtoudi.com'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://xindongtoudi.com',
    title: '心动投递 - AI智能约会匹配平台',
    description: '每周给你匹配一位对象，AI比你更懂你想要什么。告别无休止的滑动，让缘分如约而至。',
    siteName: '心动投递',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '心动投递 - AI智能约会匹配平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '心动投递 - AI智能约会匹配平台',
    description: '每周给你匹配一位对象，AI比你更懂你想要什么。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#FF6B9D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
