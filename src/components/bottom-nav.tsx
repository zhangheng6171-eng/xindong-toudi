'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, MessageCircle, User, Star, Home } from 'lucide-react'
import { UnreadBadge } from '@/hooks/useUnreadMessages'

interface BottomNavProps {
  unreadCount?: number
}

export function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { label: '首页', href: '/', icon: Home },
    { label: '匹配', href: '/match', icon: Heart },
    { 
      label: '消息', 
      href: '/chat', 
      icon: MessageCircle,
      showBadge: true 
    },
    { label: '我的', href: '/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 z-50">
      <div className="max-w-md mx-auto flex justify-around py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center transition-colors relative ${
                isActive ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                {item.showBadge && <UnreadBadge count={unreadCount} />}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
