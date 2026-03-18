import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * 页面过渡动画包装器
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 淡入动画
 */
export function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.5,
  className = ''
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 滑入动画
 */
export function SlideIn({ 
  children, 
  direction = 'up',
  delay = 0,
  className = ''
}: { 
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  className?: string
}) {
  const directionMap = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 缩放动画
 */
export function ScaleIn({ 
  children, 
  delay = 0,
  className = ''
}: { 
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 交错动画容器
 */
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = ''
}: { 
  children: ReactNode
  staggerDelay?: number
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 交错动画子项
 */
export function StaggerItem({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 悬停动画包装器
 */
export function HoverCard({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 按钮按压动画
 */
export function Pressable({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 心跳动画
 */
export function Heartbeat({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.1, 1, 1.1, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 3
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 脉冲动画
 */
export function Pulse({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 浮动动画
 */
export function Float({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 摇摆动画
 */
export function Wiggle({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{
        rotate: [0, -5, 5, -5, 0]
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 2
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 旋转动画
 */
export function Spin({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{
        rotate: 360
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * 打字机动画文字
 */
export function TypewriterText({ 
  text,
  delay = 0.05,
  className = ''
}: { 
  text: string
  delay?: number
  className?: string
}) {
  return (
    <motion.span className={className}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * delay }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}
