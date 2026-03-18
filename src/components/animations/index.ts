/**
 * 心动投递动画组件库
 * 提供统一、流畅、有趣的动画效果
 */

// 页面过渡动画
export { PageTransition, FadeIn, SlideIn, ScaleIn, StaggerContainer, StaggerItem } from './page-transition'

// 匹配成功动画（重命名导出）
export { 
  MatchSuccessAnimation,
  HeartBeatButton,
  Skeleton,
  TypingIndicator,
  MessageBubble,
  AnimatedProgress,
  CountUp,
  ParticleExplosion,
  FlipCard,
  ParallaxScroll,
  RippleButton,
  AnimatedGradient,
  Shimmer,
} from './match-success'

// 动画变体配置
export const animationVariants = {
  // 淡入淡出
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // 从下往上滑入
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  // 从上往下滑入
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  
  // 从左往右滑入
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  // 从右往左滑入
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  // 缩放淡入
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  
  // 弹性缩放
  springScale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }
    },
    exit: { opacity: 0, scale: 0.8 },
  },
  
  // 弹跳效果
  bounce: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      }
    },
    exit: { opacity: 0, y: 20 },
  },
  
  // 心跳效果
  heartbeat: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatDelay: 1,
      }
    }
  },
  
  // 脉冲效果
  pulse: {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
      }
    }
  },
  
  // 浮动效果
  float: {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }
    }
  },
  
  // 摇摆效果
  wiggle: {
    initial: { rotate: 0 },
    animate: {
      rotate: [-3, 3, -3, 3, 0],
      transition: {
        duration: 0.5,
      }
    }
  },
  
  // 打字指示器（三点跳动）
  typingIndicator: {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      }
    }
  },
}

// 过渡时间配置
export const transitionConfig = {
  fast: { duration: 0.15, ease: 'easeOut' },
  standard: { duration: 0.3, ease: 'easeOut' },
  slow: { duration: 0.5, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 300, damping: 20 },
  softSpring: { type: 'spring', stiffness: 200, damping: 25 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
}

// 交错动画配置
export const staggerConfig = {
  fast: { staggerChildren: 0.05 },
  standard: { staggerChildren: 0.1 },
  slow: { staggerChildren: 0.15 },
  progressive: { staggerChildren: 0.1, delayChildren: 0.2 },
}

// 手势动画配置
export const gestureConfig = {
  tap: { scale: 0.95 },
  hover: { scale: 1.02 },
  press: { scale: 0.98 },
  focus: { scale: 1.01, boxShadow: '0 0 0 3px rgba(236, 72, 153, 0.3)' },
}
