'use client'

import { useEffect, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedBackgroundProps {
  children: ReactNode
  variant?: 'default' | 'romance' | 'dream' | 'purple' | 'sunset'
  showParticles?: boolean
  showFloatingHearts?: boolean
}

// 粒子组件
function Particles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-rose-300/30 to-purple-300/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// 漂浮心形组件
function FloatingHearts() {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; size: number; duration: number; delay: number; opacity: number }>>([])

  useEffect(() => {
    const newHearts = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 20 + 10,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.3 + 0.1,
    }))
    setHearts(newHearts)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{
            left: `${h.x}%`,
            bottom: '-50px',
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(h.id) * 50, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0, h.opacity, h.opacity, 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill="currentColor" className="text-rose-400">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

// 装饰圆圈组件
function DecorativeCircles({ variant }: { variant: string }) {
  const gradients: Record<string, string[]> = {
    default: ['from-rose-200/40', 'from-pink-200/30', 'from-purple-200/20'],
    romance: ['from-rose-300/50', 'from-pink-300/40', 'from-rose-200/30'],
    dream: ['from-purple-200/40', 'from-indigo-200/30', 'from-blue-200/20'],
    purple: ['from-purple-300/40', 'from-violet-200/30', 'from-fuchsia-200/20'],
    sunset: ['from-orange-200/40', 'from-rose-200/30', 'from-pink-200/20'],
  }

  const colors = gradients[variant] || gradients.default

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 大圆圈 */}
      <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br ${colors[0]} to-transparent blur-3xl`} />
      <div className={`absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-gradient-to-br ${colors[1]} to-transparent blur-3xl`} />
      <div className={`absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br ${colors[2]} to-transparent blur-3xl`} />
      
      {/* 小装饰 */}
      <div className="absolute top-20 right-1/4 w-4 h-4 rounded-full bg-rose-300/50 animate-pulse" />
      <div className="absolute top-40 left-1/3 w-3 h-3 rounded-full bg-pink-300/40 animate-pulse delay-300" />
      <div className="absolute bottom-40 right-1/3 w-5 h-5 rounded-full bg-purple-300/30 animate-pulse delay-700" />
    </div>
  )
}

export function AnimatedBackground({ 
  children, 
  variant = 'default',
  showParticles = true,
  showFloatingHearts = true,
}: AnimatedBackgroundProps) {
  const bgGradients: Record<string, string> = {
    default: 'from-rose-50/80 via-pink-50/60 to-purple-50/80',
    romance: 'from-rose-100/60 via-pink-50/50 to-rose-50/60',
    dream: 'from-purple-50/80 via-indigo-50/60 to-blue-50/50',
    purple: 'from-purple-50/80 via-violet-50/60 to-fuchsia-50/50',
    sunset: 'from-orange-50/60 via-rose-50/50 to-pink-50/60',
  }

  return (
    <div className={`relative min-h-screen bg-gradient-to-br ${bgGradients[variant]}`}>
      {/* 背景装饰 */}
      <DecorativeCircles variant={variant} />
      {showParticles && <Particles />}
      {showFloatingHearts && <FloatingHearts />}
      
      {/* 玻璃拟态叠加层 */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-[1px] pointer-events-none z-0" />
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// 玻璃卡片组件
export function GlassCard({ 
  children, 
  className = '',
  hover = true,
}: { 
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <motion.div
      className={`
        bg-white/70 backdrop-blur-xl 
        border border-white/50 
        rounded-3xl 
        shadow-[0_8px_32px_rgba(236,72,153,0.08)]
        ${hover ? 'hover:shadow-[0_20px_60px_rgba(236,72,153,0.15)] hover:bg-white/80' : ''}
        transition-all duration-500
        ${className}
      `}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  )
}

// 渐变按钮组件
export function GradientButton({ 
  children, 
  onClick,
  className = '',
  size = 'md',
  variant = 'primary',
}: { 
  children: ReactNode
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}) {
  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  }

  const variants = {
    primary: 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50',
    secondary: 'bg-white text-rose-600 border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50',
    outline: 'bg-transparent border-2 border-white/50 text-white hover:bg-white/10',
  }

  return (
    <motion.button
      onClick={onClick}
      className={`
        ${sizes[size]}
        ${variants[variant]}
        rounded-full font-semibold
        transition-all duration-300
        active:scale-95
        ${className}
      `}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  )
}

// 渐变文字组件
export function GradientText({ 
  children, 
  className = '',
  animate = false,
}: { 
  children: ReactNode
  className?: string
  animate?: boolean
}) {
  return (
    <span 
      className={`
        bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500
        bg-clip-text text-transparent
        ${animate ? 'animate-gradient bg-[length:200%_auto]' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

// 浮动动画包装器
export function FloatAnimation({ 
  children, 
  delay = 0,
  duration = 6,
}: { 
  children: ReactNode
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

// 渐入动画包装器
export function FadeIn({ 
  children, 
  delay = 0,
  direction = 'up',
  className = '',
}: { 
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}) {
  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 脉冲光环效果
export function PulseRing({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 animate-ping opacity-20" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 animate-pulse opacity-40 scale-110" />
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

// 统计数字动画
export function AnimatedCounter({ 
  end, 
  suffix = '',
  prefix = '',
  duration = 2,
}: { 
  end: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <span className="font-bold tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// 步骤指示器
export function StepIndicator({ 
  steps, 
  currentStep,
  className = '',
}: { 
  steps: number
  currentStep: number
  className?: string
}) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: steps }, (_, i) => {
        const step = i + 1
        const isActive = step <= currentStep
        const isCurrent = step === currentStep

        return (
          <div key={step} className="flex items-center">
            <motion.div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-sm font-bold transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30' 
                  : 'bg-gray-100 text-gray-400'
                }
              `}
              animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {isActive && step < currentStep ? '✓' : step}
            </motion.div>
            {step < steps && (
              <div 
                className={`w-12 h-1 mx-2 rounded-full transition-all duration-500 ${
                  isActive ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gray-100'
                }`} 
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// 标签组件
export function Tag({ 
  children, 
  color = 'rose',
  className = '',
}: { 
  children: ReactNode
  color?: 'rose' | 'purple' | 'blue' | 'green' | 'orange'
  className?: string
}) {
  const colors = {
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
  }

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full
      text-xs font-medium border
      ${colors[color]}
      ${className}
    `}>
      {children}
    </span>
  )
}

// 星级评分组件
export function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <motion.svg
          key={i}
          className={`${sizes[size]} ${i < rating ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1, type: "spring" }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </motion.svg>
      ))}
    </div>
  )
}

// 装饰分隔线
export function DecorativeDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 my-8 ${className}`}>
      <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      <Heart className="w-4 h-4 text-rose-300" />
      <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
    </div>
  )
}

import { Heart } from 'lucide-react'
