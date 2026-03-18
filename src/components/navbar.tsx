'use client'

import { useState, useEffect } from 'react'
import { Heart, Sparkles, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navItems = [
  { label: '首页', href: '/' },
  { label: '关于我们', href: '/about' },
  { label: '匹配原理', href: '/how-it-works' },
  { label: '用户故事', href: '/stories' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-8 h-8 text-primary-500 fill-primary-500" />
              <Sparkles className="w-3 h-3 text-accent-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-romance-600 bg-clip-text text-transparent">
              心动投递
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-romance-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
            >
              开始匹配
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-600 hover:text-primary-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <Link
                href="/login"
                className="block py-2 text-center text-gray-600 hover:text-primary-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                登录
              </Link>
              <Link
                href="/register"
                className="block py-3 text-center bg-gradient-to-r from-primary-500 to-romance-500 text-white font-medium rounded-xl"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                开始匹配
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
