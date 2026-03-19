'use client'

import { useEffect, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedBackgroundProps {
  children: ReactNode
  variant?: 'default' | 'romance' | 'dream' | 'purple' | 'sunset'
  showParticles?: boolean
  showFloatingHearts?: boolean
}

// CSS动画样式
const fallbackStyles = `
  @keyframes float-particle {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
    50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
  }
  @keyframes float-up {
    0% { transform: translateY(0); opacity: 0; }
    10% { opacity: 0.6; }
    90% { opacity: 0.6; }
    100% { transform: translateY(-100vh); opacity: 0; }
  }
  .css-particle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(251, 113, 133, 0.3), rgba(168, 85, 247, 0.3));
    animation: float-particle 8s ease-in-out infinite;
  }
  .css-heart {
    position: absolute;
    color: rgba(251, 113, 133, 0.4);
    animation: float-up 12s linear infinite;
  }
`

// 使用CSS动画的粒子（兼容性更好）
function CSSParticles() {
  return (
    <>
      <style>{fallbackStyles}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="css-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>
    </>
  )
}

// 使用CSS动画的漂浮心形
function CSSHearts() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="css-heart"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '-30px',
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 8 + 8}s`,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      ))}
    </div>
  )
}

// 粒子组件（使用 framer-motion，如果不支持则降级）
function Particles() {
  const [useCSS, setUseCSS] = useState(false)
  
  useEffect(() => {
    // 检测是否支持 framer-motion
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      setUseCSS(true)
    }
  }, [])

  if (useCSS) {
    return <CSSParticles />
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.3), rgba(168, 85, 247, 0.3))',
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 5,
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
  const [useCSS, setUseCSS] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      setUseCSS(true)
    }
  }, [])

  if (!mounted) return null
  
  if (useCSS) {
    return <CSSHearts />
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 8 }).map((_, i) => {
        const size = Math.random() * 20 + 10
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-50px',
            }}
            animate={{
              y: [0, -1000],
              x: [0, Math.sin(i) * 50, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0, 0.4, 0.4, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              delay: Math.random() * 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fb7185' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.div>
        )
      })}
    </div>
  )
}

// 装饰圆圈组件
function DecorativeCircles({ variant }: { variant: string }) {
  const gradients: Record<string, string[]> = {
    default: ['#fecdd3', '#fbcfe8', '#f5d0fe'],
    romance: ['#fda4af', '#f9a8d4', '#fecdd3'],
    dream: ['#e9d5ff', '#c7d2fe', '#bfdbfe'],
    purple: ['#d8b4fe', '#ddd6fe', '#f0abfc'],
    sunset: ['#fed7aa', '#fecdd3', '#fbcfe8'],
  }

  const colors = gradients[variant] || gradients.default

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 大圆圈 */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors[0]}40 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '-10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors[1]}40 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '20%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors[2]}30 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }} />
    </div>
  )
}

export function AnimatedBackground({ 
  children, 
  variant = 'default',
  showParticles = true,
  showFloatingHearts = true,
}: AnimatedBackgroundProps) {
  const bgColors: Record<string, string> = {
    default: 'linear-gradient(180deg, #fff1f2 0%, #fdf2f8 50%, #faf5ff 100%)',
    romance: 'linear-gradient(180deg, #ffe4e6 0%, #fdf2f8 50%, #fff1f2 100%)',
    dream: 'linear-gradient(180deg, #f3e8ff 0%, #e0e7ff 50%, #dbeafe 100%)',
    purple: 'linear-gradient(180deg, #fae8ff 0%, #f5f3ff 50%, #fdf4ff 100%)',
    sunset: 'linear-gradient(180deg, #ffedd5 0%, #ffe4e6 50%, #fce7f3 100%)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bgColors[variant],
      position: 'relative',
    }}>
      {/* 背景装饰 */}
      <DecorativeCircles variant={variant} />
      {showParticles && <Particles />}
      {showFloatingHearts && <FloatingHearts />}
      
      {/* 玻璃拟态叠加层 */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      
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
    <div
      className={className}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(236, 72, 153, 0.08)',
        transition: 'all 0.3s ease',
        ...(hover && {
          cursor: 'pointer',
        }),
      }}
    >
      {children}
    </div>
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
  onClick?: (e?: React.MouseEvent) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}) {
  const sizes = {
    sm: { padding: '10px 20px', fontSize: '14px' },
    md: { padding: '16px 32px', fontSize: '16px' },
    lg: { padding: '20px 40px', fontSize: '18px' },
  }

  const baseStyle = {
    ...sizes[size],
    borderRadius: '9999px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  }

  const variants = {
    primary: {
      ...baseStyle,
      background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
    },
    secondary: {
      ...baseStyle,
      backgroundColor: 'white',
      color: '#e11d48',
      border: '2px solid #fda4af',
    },
    outline: {
      ...baseStyle,
      backgroundColor: 'transparent',
      border: '2px solid rgba(255, 255, 255, 0.5)',
      color: 'white',
    },
  }

  return (
    <button
      onClick={onClick}
      className={className}
      style={variants[variant]}
    >
      {children}
    </button>
  )
}

// 渐变文字组件
export function GradientText({ 
  children, 
  className = '',
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <span 
      className={className}
      style={{
        background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
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
    up: { initial: { y: 30, x: 0 } },
    down: { initial: { y: -30, x: 0 } },
    left: { initial: { x: 30, y: 0 } },
    right: { initial: { x: -30, y: 0 } },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction].initial }}
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  if (!mounted) {
    return <span>{prefix}{end}{suffix}</span>
  }

  return (
    <span style={{ fontWeight: 'bold' }}>
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
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                background: isActive 
                  ? 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)' 
                  : '#f3f4f6',
                color: isActive ? 'white' : '#9ca3af',
                boxShadow: isActive ? '0 4px 15px rgba(236, 72, 153, 0.3)' : 'none',
              }}
            >
              {isActive && step < currentStep ? '✓' : step}
            </div>
            {step < steps && (
              <div 
                style={{
                  width: 48,
                  height: 4,
                  margin: '0 8px',
                  borderRadius: 2,
                  background: isActive 
                    ? 'linear-gradient(90deg, #f43f5e 0%, #ec4899 100%)' 
                    : '#f3f4f6',
                }}
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
    rose: { bg: '#ffe4e6', text: '#be123c', border: '#fecdd3' },
    purple: { bg: '#f3e8ff', text: '#7c3aed', border: '#ddd6fe' },
    blue: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
    green: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    orange: { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
  }

  const c = colors[color]

  return (
    <span 
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {children}
    </span>
  )
}

// 星级评分组件
export function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 12,
    md: 16,
    lg: 24,
  }

  const s = sizes[size]

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={s}
          height={s}
          viewBox="0 0 20 20"
          fill={i < rating ? '#fbbf24' : '#e5e7eb'}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// 装饰分隔线
export function DecorativeDivider({ className = '' }: { className?: string }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '32px 0' }}>
      <div style={{ height: 1, width: 64, background: 'linear-gradient(90deg, transparent, #fda4af, transparent)' }} />
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fda4af">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <div style={{ height: 1, width: 64, background: 'linear-gradient(90deg, transparent, #fda4af, transparent)' }} />
    </div>
  )
}

// 脉冲光环效果
export function PulseRing({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fb7185, #ec4899)',
        animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        opacity: 0.2,
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fb7185, #ec4899)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        opacity: 0.4,
        transform: 'scale(1.1)',
      }} />
      <div style={{ position: 'relative' }}>
        {children}
      </div>
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
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
