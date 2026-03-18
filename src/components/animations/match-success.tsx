/**
 * 心动投递 - 动画效果集合
 * 使用 Framer Motion 实现流畅动画
 */

import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { ReactNode, useEffect } from 'react'

/**
 * 匹配成功动画 - 心跳效果 + 粒子
 */
export function MatchSuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.8, 1] }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 0.5, repeat: 3, repeatDelay: 0.5 }}
        >
          <span className="text-8xl">💕</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/**
 * 心跳按钮
 */
export function HeartBeatButton({ 
  children, 
  isActive = false,
  onClick,
  className = ''
}: { 
  children: ReactNode
  isActive?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`${className} ${isActive ? 'text-rose-500' : 'text-gray-400'}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={isActive ? {
        scale: [1, 1.2, 1],
      } : {}}
      transition={isActive ? {
        duration: 0.3,
        repeat: 2
      } : {}}
    >
      {children}
    </motion.button>
  )
}

/**
 * 加载骨架屏
 */
export function Skeleton({ 
  className = '',
  variant = 'text'
}: { 
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  return (
    <motion.div
      className={`bg-gray-200 ${variants[variant]} ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

/**
 * 打字指示器（三个点跳动）
 */
export function TypingIndicator({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`flex space-x-1 px-4 py-3 bg-white rounded-2xl rounded-tl-none ${className}`}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.15
          }}
        />
      ))}
    </motion.div>
  )
}

/**
 * 消息气泡出现动画
 */
export function MessageBubble({ 
  children, 
  isOwn = false,
  className = ''
}: { 
  children: ReactNode
  isOwn?: boolean
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${className}`}
    >
      {children}
    </motion.div>
  )
}

/**
 * 进度条动画
 */
export function AnimatedProgress({ 
  value = 0,
  className = ''
}: { 
  value: number
  className?: string
}) {
  return (
    <div className={`h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  )
}

/**
 * 计数动画
 */
export function CountUp({ 
  end = 100,
  duration = 2,
  className = ''
}: { 
  end?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <CountUpInner end={end} duration={duration} />
    </motion.span>
  )
}

function CountUpInner({ end, duration }: { end: number; duration: number }) {
  // 简化实现
  return end
}

/**
 * 粒子效果组件
 */
export function ParticleExplosion({ 
  onComplete 
}: { 
  onComplete?: () => void 
}) {
  const particles = Array.from({ length: 12 })

  return (
    <motion.div
      className="relative"
      onAnimationComplete={onComplete}
    >
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-rose-500 rounded-full"
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 1,
            opacity: 1 
          }}
          animate={{ 
            x: Math.cos(i * 30 * Math.PI / 180) * 100,
            y: Math.sin(i * 30 * Math.PI / 180) * 100,
            scale: 0,
            opacity: 0
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  )
}

/**
 * 卡片翻转动画
 */
export function FlipCard({ 
  front, 
  back,
  isFlipped = false,
  className = ''
}: { 
  front: ReactNode
  back: ReactNode
  isFlipped?: boolean
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 backface-hidden">
          {front}
        </div>
        <div 
          className="absolute inset-0 backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}

/**
 * 视差滚动容器
 */
export function ParallaxScroll({ 
  children,
  speed = 0.5,
  className = ''
}: { 
  children: ReactNode
  speed?: number
  className?: string
}) {
  const y = useMotionValue(0)
  const yTransform = useTransform(y, [0, 300], [0, 300 * speed])

  useEffect(() => {
    const handleScroll = () => {
      y.set(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [y])

  return (
    <motion.div 
      style={{ y: yTransform }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 涟漪效果按钮
 */
export function RippleButton({ 
  children,
  onClick,
  className = ''
}: { 
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-white/30"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

/**
 * 渐变背景动画
 */
export function AnimatedGradient({ 
  className = ''
}: { 
  className?: string
}) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={{
        backgroundSize: '200% 200%'
      }}
    />
  )
}

/**
 * 闪光效果
 */
export function Shimmer({ 
  className = ''
}: { 
  className?: string
}) {
  return (
    <motion.div
      className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ${className}`}
      animate={{
        x: ['-100%', '100%']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}
