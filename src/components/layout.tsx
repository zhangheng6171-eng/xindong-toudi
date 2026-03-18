import { ReactNode } from 'react'
import { Navbar } from './navbar'

interface RootLayoutProps {
  children: ReactNode
}

export function Layout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 md:pt-20">
        {children}
      </main>
    </div>
  )
}
