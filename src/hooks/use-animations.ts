'use client'

import { 
  useState, 
  useEffect, 
  useCallback, 
  useRef,
  useMemo,
} from 'react'
import { 
  useAnimation, 
  AnimationControls,
  useMotionValue,
  useTransform,
  useSpring,
  motion,
} from 'framer-motion'

// ==================== 打字指示器 Hook ====================

interface TypingIndicatorOptions {
  dotCount?: number
  animationDuration?: number
  staggerDelay?: number
}

export function useTypingIndicator(options: TypingIndicatorOptions = {}) {
  const {
    dotCount = 3,
    animationDuration = 0.6,
    staggerDelay = 0.15,
  } = options

  const dotVariants = useMemo(() => ({
    initial: { y: 0 },
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      }
    }
  }), [animationDuration])

  const getDotDelay = useCallback((index: number) => ({
    initial: { y: 0 },
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: animationDuration,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        delay: index * staggerDelay,
      }
    }
  }), [animationDuration, staggerDelay])

  return {
    dotCount,
    dotVariants,
    getDotDelay,
  }
}

// ==================== 消息气泡动画 Hook ====================

interface MessageAnimationOptions {
  onMessageSent?: () => void
}

export function useMessageAnimation(options: MessageAnimationOptions = {}) {
  const { onMessageSent } = options
  const [messages, setMessages] = useState<Array<{ id: string; content: React.ReactNode }>>([])
  const controls = useAnimation()

  const addMessage = useCallback((content: React.ReactNode) => {
    const id = Date.now().toString()
    setMessages(prev => [...prev, { id, content }])
    onMessageSent?.()
    return id
  }, [onMessageSent])

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  const messageVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      transition: { duration: 0.2 } 
    },
  }

  return {
    messages,
    addMessage,
    removeMessage,
    controls,
    messageVariants,
  }
}

// ==================== 按钮点击反馈 Hook ====================

interface ButtonFeedbackOptions {
  scale?: number
  duration?: number
}

export function useButtonFeedback(options: ButtonFeedbackOptions = {}) {
  const {
    scale = 0.95,
    duration = 0.15,
  } = options

  const [isPressed, setIsPressed] = useState(false)
  const controls = useAnimation()

  const handlePress = useCallback(() => {
    setIsPressed(true)
    controls.start({ scale })
  }, [scale, controls])

  const handleRelease = useCallback(() => {
    setIsPressed(false)
    controls.start({ scale: 1 })
  }, [controls])

  return {
    isPressed,
    controls,
    handlers: {
      onMouseDown: handlePress,
      onMouseUp: handleRelease,
      onMouseLeave: handleRelease,
      onTouchStart: handlePress,
      onTouchEnd: handleRelease,
    },
    variants: {
      tap: { scale },
      hover: { scale: 1.02 },
    },
  }
}

// ==================== 涟漪效果 Hook ====================

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const nextId = useRef(0)

  const addRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    
    let x: number, y: number
    
    if ('touches' in event) {
      x = event.touches[0].clientX - rect.left
      y = event.touches[0].clientY - rect.top
    } else {
      x = event.clientX - rect.left
      y = event.clientY - rect.top
    }
    
    const size = Math.max(rect.width, rect.height) * 2
    const id = nextId.current++
    
    setRipples(prev => [...prev, { id, x, y, size }])
    
    // 自动移除涟漪
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 1000)
  }, [])

  const rippleStyles = useCallback((ripple: Ripple) => ({
    left: ripple.x - ripple.size / 2,
    top: ripple.y - ripple.size / 2,
    width: ripple.size,
    height: ripple.size,
  }), [])

  return {
    ripples,
    addRipple,
    rippleStyles,
  }
}

// ==================== 滑动手势 Hook ====================

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 100,
  } = options

  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleDragEnd = useCallback((event: any, info: { offset: { x: number; y: number } }) => {
    const { offset } = info
    
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // 水平滑动
      if (offset.x > threshold) {
        setSwipeDirection('right')
        onSwipeRight?.()
      } else if (offset.x < -threshold) {
        setSwipeDirection('left')
        onSwipeLeft?.()
      }
    } else {
      // 垂直滑动
      if (offset.y > threshold) {
        setSwipeDirection('down')
        onSwipeDown?.()
      } else if (offset.y < -threshold) {
        setSwipeDirection('up')
        onSwipeUp?.()
      }
    }
    
    // 重置位置
    x.set(0)
    y.set(0)
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, x, y])

  const dragConstraints = useMemo(() => ({
    left: -threshold * 1.5,
    right: threshold * 1.5,
    top: -threshold * 1.5,
    bottom: threshold * 1.5,
  }), [threshold])

  return {
    swipeDirection,
    x,
    y,
    handleDragEnd,
    dragConstraints,
    bind: {
      drag: 'x' as const,
      dragConstraints,
      dragElastic: 0.7,
      onDragEnd: handleDragEnd,
      style: { x, y },
    },
  }
}

// ==================== 心跳动画 Hook ====================

export function useHeartbeat(options: {
  duration?: number
  repeatDelay?: number
} = {}) {
  const { duration = 1, repeatDelay = 1 } = options
  const controls = useAnimation()
  const isRunning = useRef(true)

  useEffect(() => {
    const runAnimation = async () => {
      while (isRunning.current) {
        await controls.start({
          scale: [1, 1.15, 1, 1.1, 1],
          transition: { duration, ease: 'easeInOut' }
        })
        await new Promise(resolve => setTimeout(resolve, repeatDelay * 1000))
      }
    }
    
    runAnimation()
    
    return () => {
      isRunning.current = false
    }
  }, [controls, duration, repeatDelay])

  const stop = useCallback(() => {
    isRunning.current = false
    controls.stop()
  }, [controls])

  const start = useCallback(() => {
    isRunning.current = true
  }, [])

  return { controls, start, stop }
}

// ==================== 视差滚动 Hook ====================

export function useParallax(speed: number = 0.5) {
  const [scrollY, setScrollY] = useState(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      y.set(window.scrollY * speed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, y])

  return { scrollY, y }
}

// ==================== 弹簧物理效果 Hook ====================

export function useSpringValue(initialValue: number, config?: {
  stiffness?: number
  damping?: number
  mass?: number
}) {
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
  } = config || {}

  const motionValue = useMotionValue(initialValue)
  const springValue = useSpring(motionValue, { stiffness, damping, mass })

  const set = useCallback((value: number) => {
    motionValue.set(value)
  }, [motionValue])

  return {
    value: springValue,
    set,
  }
}

// ==================== 触觉反馈 Hook ====================

export function useHapticFeedback() {
  const isSupported = useRef(false)

  useEffect(() => {
    isSupported.current = 'vibrate' in navigator
  }, [])

  const light = useCallback(() => {
    if (isSupported.current) {
      navigator.vibrate(10)
    }
  }, [])

  const medium = useCallback(() => {
    if (isSupported.current) {
      navigator.vibrate(20)
    }
  }, [])

  const heavy = useCallback(() => {
    if (isSupported.current) {
      navigator.vibrate([30, 10, 30])
    }
  }, [])

  const success = useCallback(() => {
    if (isSupported.current) {
      navigator.vibrate([20, 50, 40])
    }
  }, [])

  return {
    isSupported: isSupported.current,
    light,
    medium,
    heavy,
    success,
  }
}

// ==================== 表情弹出动画 Hook ====================

interface EmojiPickerState {
  isOpen: boolean
  selectedEmoji: string | null
}

export function useEmojiPicker() {
  const [state, setState] = useState<EmojiPickerState>({
    isOpen: false,
    selectedEmoji: null,
  })

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  const select = useCallback((emoji: string) => {
    setState({ isOpen: false, selectedEmoji: emoji })
  }, [])

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.03,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 10,
      transition: { duration: 0.15 }
    }
  }

  const emojiVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 15 }
    },
    tap: { scale: 0.8 },
    hover: { scale: 1.2 },
  }

  return {
    isOpen: state.isOpen,
    selectedEmoji: state.selectedEmoji,
    toggle,
    select,
    close,
    containerVariants,
    emojiVariants,
  }
}

// ==================== 加载状态 Hook ====================

export function useLoading(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  const [progress, setProgress] = useState(0)

  const start = useCallback(() => {
    setIsLoading(true)
    setProgress(0)
  }, [])

  const stop = useCallback(() => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 300)
  }, [])

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)))
  }, [])

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    start()
    try {
      const result = await fn()
      stop()
      return result
    } catch (error) {
      stop()
      throw error
    }
  }, [start, stop])

  return {
    isLoading,
    progress,
    start,
    stop,
    updateProgress,
    withLoading,
  }
}

// ==================== 浮动动画 Hook ====================

export function useFloatAnimation(options: {
  distance?: number
  duration?: number
  delay?: number
} = {}) {
  const {
    distance = 10,
    duration = 3,
    delay = 0,
  } = options

  return {
    animate: {
      y: [-distance / 2, distance / 2, -distance / 2],
    },
    transition: {
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }
}

// ==================== 旋转动画 Hook ====================

export function useRotateAnimation(options: {
  duration?: number
  clockwise?: boolean
} = {}) {
  const {
    duration = 2,
    clockwise = true,
  } = options

  return {
    animate: {
      rotate: clockwise ? 360 : -360,
    },
    transition: {
      duration,
      repeat: Infinity,
      ease: 'linear',
    },
  }
}

// ==================== 摇摆动画 Hook ====================

export function useWiggleAnimation(options: {
  angle?: number
  duration?: number
} = {}) {
  const {
    angle = 5,
    duration = 0.3,
  } = options

  return {
    animate: {
      rotate: [0, -angle, angle, -angle, angle, 0],
    },
    transition: {
      duration,
      ease: 'easeInOut',
    },
  }
}

// ==================== 淡入动画 Hook ====================

export function useFadeInAnimation(delay: number = 0) {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay,
        ease: 'easeOut',
      }
    })
  }, [controls, delay])

  return {
    controls,
    initial: { opacity: 0, y: 20 },
  }
}

// ==================== 交错动画 Hook ====================

export function useStaggerAnimation(itemCount: number, staggerDelay: number = 0.1) {
  const controls = useAnimation()
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          controls.start('visible')
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [controls])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      }
    }
  }

  return {
    ref,
    controls,
    isVisible,
    containerVariants,
    itemVariants,
  }
}
