# 心动投递动画规范

> 设计原则：流畅、优雅、有趣、不卡顿

## 📋 目录

1. [设计原则](#设计原则)
2. [动画时长标准](#动画时长标准)
3. [缓动函数](#缓动函数)
4. [页面过渡动画](#页面过渡动画)
5. [匹配成功动画](#匹配成功动画)
6. [聊天动画](#聊天动画)
7. [交互反馈动画](#交互反馈动画)
8. [微交互细节](#微交互细节)
9. [性能优化指南](#性能优化指南)
10. [无障碍考虑](#无障碍考虑)

---

## 设计原则

### 核心理念

1. **流畅优先** - 60fps 是底线，30fps 是不可接受的
2. **有意义的动效** - 动画应该服务于用户体验，而非装饰
3. **自然感** - 遵循物理规律，使用自然的缓动曲线
4. **品牌一致性** - 所有动画都应体现"心动"的温暖与浪漫

### 设计词汇

| 情感 | 动画风格 | 示例 |
|------|----------|------|
| 浪漫 | 柔和、缓慢、曲线 | 心跳、爱心浮动 |
| 欢快 | 活泼、弹跳、色彩 | 匹配成功、彩纸 |
| 亲密 | 温和、淡入淡出 | 页面过渡、消息气泡 |
| 期待 | 渐进、节奏感 | 加载、进度条 |

---

## 动画时长标准

### 时间层级

```typescript
// 动画时长配置
export const durations = {
  // 微交互 - 按钮点击、hover效果
  instant: 100,    // 即时反馈
  fast: 150,       // 快速过渡
  quick: 200,      // 简单过渡
  
  // 标准动画 - 大多数UI元素
  normal: 300,     // 标准过渡
  moderate: 400,   // 中等过渡
  
  // 展示动画 - 页面切换、重要元素
  slow: 500,       // 缓慢过渡
  grand: 700,      // 盛大动画
  
  // 特殊场景
  celebration: 1500, // 庆祝动画
  loading: 2000,     // 加载动画周期
}
```

### 时长选择指南

| 交互类型 | 推荐时长 | 说明 |
|----------|----------|------|
| 按钮反馈 | 100-150ms | 用户期望即时反馈 |
| 弹窗出现 | 200-300ms | 足够快，又不会错过 |
| 页面切换 | 300-400ms | 需要给用户感知时间 |
| 匹配成功 | 800-1500ms | 特殊时刻，值得等待 |
| 加载指示 | 循环 | 需要明确的进度指示 |

---

## 缓动函数

### 标准缓动

```typescript
export const easings = {
  // 淡入淡出
  easeInOut: [0.4, 0, 0.2, 1],      // 标准的缓入缓出
  easeOut: [0, 0, 0.2, 1],           // 开始快，结束慢
  easeIn: [0.4, 0, 1, 1],            // 开始慢，结束快
  
  // 弹性效果
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
  
  // 柔和弹性
  softSpring: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  },
  
  // 弹跳效果
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
  
  // 心动弹性（用于爱心动画）
  heartbeat: {
    type: 'spring',
    stiffness: 500,
    damping: 15,
  },
}
```

### 缓动选择指南

| 场景 | 推荐缓动 | 理由 |
|------|----------|------|
| 通用过渡 | easeOut | 自然流畅 |
| 页面切换 | easeInOut | 平滑衔接 |
| 弹窗出现 | spring | 有活力 |
| 按钮点击 | softSpring | 有反馈感 |
| 心跳动画 | heartbeat | 强调心跳 |

---

## 页面过渡动画

### 页面进入动画

```tsx
// 页面进入变体
const pageEnterVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    }
  },
}
```

### 页面切换模式

```tsx
// AnimatePresence 的三种模式
type TransitionMode = 'wait' | 'popLayout' | 'sync'

// 推荐：popLayout - 新页面立即开始进入，旧页面平滑退出
<AnimatePresence mode="popLayout">
  <motion.div key={pathname} variants={variants} ... />
</AnimatePresence>
```

### 骨架屏加载

```tsx
// 骨架屏脉冲动画
const skeletonPulse = {
  animation: 'pulse 2s ease-in-out infinite',
}

// CSS关键帧
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 匹配成功动画

### 分阶段设计

匹配成功动画分为 4 个阶段：

| 阶段 | 时间 | 内容 | 动画 |
|------|------|------|------|
| 1 | 0ms | 背景出现 | 渐变放大 |
| 2 | 300ms | 爱心出现 | 缩放 + 旋转 |
| 3 | 600ms | 文字出现 | 淡入 + 上移 |
| 4 | 1000ms | 粒子效果 | 爱心飞散 |

### 心跳效果

```tsx
// 心跳变体
const heartbeatVariants = {
  animate: {
    scale: [1, 1.15, 1, 1.1, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatDelay: 2,
      ease: 'easeInOut',
    }
  }
}
```

### 粒子效果

```tsx
// 爱心粒子
interface HeartParticle {
  x: number        // 随机水平位置 (0-100%)
  delay: number    // 随机延迟 (0-1.5s)
  size: number     // 随机大小 (15-35px)
}

// 粒子动画
const particleVariants = {
  animate: {
    y: -500,                    // 向上飞
    opacity: [0, 1, 1, 0],      // 渐入渐出
    scale: [0, 1, 1, 0.5],      // 缩放
    transition: {
      duration: 2,
      ease: 'easeOut',
    }
  }
}
```

### 彩纸效果

```tsx
// 彩纸粒子
interface ConfettiParticle {
  x: number           // 随机水平位置
  rotation: number    // 随机旋转角度
  color: string       // 随机颜色
  size: number        // 随机大小
  delay: number       // 随机延迟
}

// 彩纸颜色
const confettiColors = [
  '#FF6B9D',  // 粉红
  '#FFA07A',  // 橙色
  '#FFD700',  // 金色
  '#FF69B4',  // 热粉
  '#87CEEB',  // 天蓝
  '#98FB98',  // 浅绿
]
```

### 卡片翻转动画

```tsx
// 3D翻转
const flipVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.6, type: 'spring' }
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.6, type: 'spring' }
  }
}

// 关键CSS
.card {
  transform-style: preserve-3d;
  perspective: 1000px;
}

.card-face {
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}
```

---

## 聊天动画

### 消息气泡动画

```tsx
// 消息气泡变体
const messageVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.8, 
    y: 20 
  },
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
```

### 打字指示器

```tsx
// 三点跳动动画
const typingDotVariants = {
  animate: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'reverse',
      delay: i * 0.15,  // 交错延迟
    }
  })
}

// JSX结构
<motion.div className="flex gap-1">
  {[0, 1, 2].map(i => (
    <motion.div
      key={i}
      className="w-2 h-2 bg-primary-500 rounded-full"
      custom={i}
      animate="animate"
      variants={typingDotVariants}
    />
  ))}
</motion.div>
```

### 消息发送动画

```tsx
// 发送按钮动画
const sendButtonVariants = {
  initial: { scale: 1 },
  tap: { 
    scale: 0.9,
    transition: { duration: 0.1 }
  },
  animate: { 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 400,
      damping: 15,
    }
  }
}

// 消息飞入效果
const messageFlyIn = {
  initial: { 
    x: 50, 
    opacity: 0 
  },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    }
  }
}
```

### 表情弹出动画

```tsx
// 表情面板容器
const emojiContainerVariants = {
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
      staggerChildren: 0.03,  // 表情交错出现
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 10,
    transition: { duration: 0.15 }
  }
}

// 单个表情
const emojiVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 15 
    }
  },
  tap: { scale: 0.8 },
  hover: { scale: 1.2 },
}
```

---

## 交互反馈动画

### 按钮点击反馈

```tsx
// 按钮变体
const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.95 },
}

// 带涟漪效果的按钮
<motion.button
  variants={buttonVariants}
  whileHover="hover"
  whileTap="tap"
>
  {children}
  {/* 涟漪效果 */}
  {ripples.map(ripple => (
    <motion.span
      key={ripple.id}
      className="absolute bg-white/30 rounded-full"
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.6 }}
    />
  ))}
</motion.button>
```

### 涟漪效果

```tsx
// 涟漪动画
const rippleVariants = {
  initial: { 
    scale: 0, 
    opacity: 0.3 
  },
  animate: { 
    scale: 2.5, 
    opacity: 0,
    transition: { 
      duration: 0.6,
      ease: 'easeOut',
    }
  }
}

// 涟漪尺寸计算
const rippleSize = Math.max(
  buttonRect.width,
  buttonRect.height
) * 2
```

### 滑动手势反馈

```tsx
// 滑动变体
const swipeVariants = {
  initial: { x: 0, rotate: 0 },
  drag: (x: number) => ({
    x,
    rotate: x * 0.1,  // 轻微旋转
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  }),
  swipeLeft: {
    x: -400,
    rotate: -20,
    opacity: 0,
    transition: { duration: 0.3 }
  },
  swipeRight: {
    x: 400,
    rotate: 20,
    opacity: 0,
    transition: { duration: 0.3 }
  },
  reset: {
    x: 0,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  }
}
```

### 下拉刷新动画

```tsx
// 下拉刷新变体
const pullToRefreshVariants = {
  initial: { height: 0 },
  pulling: (distance: number) => ({
    height: distance,
    transition: { duration: 0.1 }
  }),
  refreshing: {
    height: 60,
    transition: { duration: 0.2 }
  }
}

// 旋转指示器
const refreshIndicatorVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}
```

### 加载状态动画

```tsx
// 加载动画类型
type LoadingType = 'spinner' | 'dots' | 'heart' | 'ring'

// 旋转加载
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

// 脉冲加载
const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// 跳点加载
const dotsVariants = {
  animate: (i: number) => ({
    y: [0, -5, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'reverse',
      delay: i * 0.15
    }
  })
}
```

---

## 微交互细节

### 悬停效果

```tsx
// 通用悬停变体
const hoverVariants = {
  initial: { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
  hover: { 
    scale: 1.02, 
    boxShadow: '0 10px 30px rgba(236, 72, 153, 0.2)',
    transition: { duration: 0.2 }
  }
}

// 卡片悬停
const cardHoverVariants = {
  initial: { y: 0, boxShadow: 'none' },
  hover: { 
    y: -5, 
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}
```

### 聚焦效果

```tsx
// 输入框聚焦
const inputFocusVariants = {
  initial: { 
    borderColor: '#E5E7EB',
    boxShadow: 'none'
  },
  focus: { 
    borderColor: '#EC4899',
    boxShadow: '0 0 0 3px rgba(236, 72, 153, 0.2)',
    transition: { duration: 0.2 }
  }
}
```

### 视差滚动效果

```tsx
// 视差滚动实现
const ParallaxSection = ({ children, speed = 0.5 }) => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed])
  
  return (
    <motion.div style={{ y }}>
      {children}
    </motion.div>
  )
}
```

### 3D卡片效果

```tsx
// 3D倾斜卡片
const TiltCard = ({ children, tiltAmount = 10 }) => {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    setRotateX(((y - centerY) / centerY) * -tiltAmount)
    setRotateY(((x - centerX) / centerX) * tiltAmount)
  }
  
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setRotateX(0); setRotateY(0) }}
      animate={{ rotateX, rotateY }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 性能优化指南

### 动画属性选择

✅ **推荐使用**（GPU加速）
- `transform: translate()`
- `transform: scale()`
- `transform: rotate()`
- `opacity`

❌ **避免使用**（触发重排）
- `width` / `height`
- `top` / `left` / `right` / `bottom`
- `margin` / `padding`
- `border-width`

### 性能优化技巧

```tsx
// 1. 使用 will-change
.animated-element {
  will-change: transform, opacity;
}

// 2. 强制GPU加速
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}

// 3. 减少动画区域
// 使用 overflow: hidden 限制动画范围
.animation-container {
  overflow: hidden;
}

// 4. 使用 layout 动画优化
<motion.div layout />  // 自动处理布局变化
```

### 动画性能监控

```tsx
// 开发模式下监控帧率
const useAnimationPerformance = () => {
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measureFPS = () => {
      frameCount++
      const now = performance.now()
      
      if (now - lastTime >= 1000) {
        console.log(`FPS: ${frameCount}`)
        frameCount = 0
        lastTime = now
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    requestAnimationFrame(measureFPS)
  }, [])
}
```

### 减少动画策略

```tsx
// 尊重用户的动画偏好
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return prefersReducedMotion
}

// 使用示例
const variants = prefersReducedMotion 
  ? { initial: {}, animate: {} }
  : fullAnimationVariants
```

---

## 无障碍考虑

### 动画关闭支持

```tsx
// 全局动画开关
const AnimationProvider = ({ children }) => {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

### 屏幕阅读器支持

```tsx
// 动画状态通知
<motion.div
  role="status"
  aria-live="polite"
  aria-label={isAnimating ? "加载中" : "加载完成"}
>
  {content}
</motion.div>
```

### 焦点管理

```tsx
// 动画结束后焦点处理
const AnimatedModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null)
  
  useEffect(() => {
    if (isOpen) {
      // 动画结束后聚焦到模态框
      setTimeout(() => {
        modalRef.current?.focus()
      }, 300)
    }
  }, [isOpen])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          // ...动画配置
        />
      )}
    </AnimatePresence>
  )
}
```

---

## 附录：动画配置速查表

### 页面过渡

| 场景 | 时长 | 缓动 | 变体 |
|------|------|------|------|
| 页面切换 | 350ms | easeOut | fadeIn + slideUp |
| 弹窗出现 | 300ms | spring | scaleIn |
| 元素加载 | 400ms | easeOut | stagger |

### 匹配动画

| 场景 | 时长 | 缓动 | 变体 |
|------|------|------|------|
| 心跳 | 1.2s | easeInOut | scale |
| 粒子飞散 | 2s | easeOut | y + opacity + scale |
| 卡片翻转 | 600ms | spring | rotateY |

### 聊天动画

| 场景 | 时长 | 缓动 | 变体 |
|------|------|------|------|
| 消息出现 | 300ms | spring | scale + y |
| 打字指示 | 600ms | easeInOut | y (循环) |
| 表情弹出 | 300ms | spring | scale |

### 交互反馈

| 场景 | 时长 | 缓动 | 变体 |
|------|------|------|------|
| 按钮点击 | 150ms | easeOut | scale |
| 涟漪效果 | 600ms | easeOut | scale + opacity |
| 滑动反馈 | 300ms | spring | x + rotate |

---

## 版本历史

- **v1.0.0** (2024-03-18) - 初始版本
  - 页面过渡动画
  - 匹配成功动画
  - 聊天动画
  - 交互反馈动画
  - 微交互细节

---

*最后更新: 2024年3月18日*
