# 心动投递 - UI 组件规范

## 设计理念

**核心原则：温暖、专业、简洁**

- **温暖**：粉色、紫色渐变，柔和的圆角，贴心的提示
- **专业**：清晰的信息层次，科学的数据展示
- **简洁**：一次只做一件事，操作直观明了

---

## 色彩系统

### 主色调
- Rose (主色) - #f43f5e → rose-500
- Pink (辅助) - #ec4899 → pink-500
- Purple (点缀) - #a855f7 → purple-500

### 渐变色
```css
/* 主渐变 */
background: linear-gradient(to right, #f43f5e, #ec4899);

/* 次渐变 */
background: linear-gradient(to right, #ec4899, #a855f7);

/* 背景渐变 */
background: linear-gradient(to bottom, #fff1f2, #fdf2f8, #faf5ff);
```

### 语义色
- 成功：`#22c55e` (green-500)
- 警告：`#eab308` (yellow-500)
- 错误：`#ef4444` (red-500)
- 信息：`#3b82f6` (blue-500)

---

## 字体系统

### 字号
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)

### 字重
- normal: 400
- medium: 500
- semibold: 600
- bold: 700

---

## 间距系统

使用 Tailwind 默认间距：
- 0.5: 2px
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 6: 24px
- 8: 32px
- 12: 48px
- 16: 64px

---

## 组件规范

### 1. 按钮 Button

**主要按钮**
```tsx
<button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-medium hover:shadow-lg transition-all">
  立即开始
</button>
```

**次要按钮**
```tsx
<button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium hover:border-rose-300 hover:text-rose-500 transition-colors">
  了解更多
</button>
```

**禁用状态**
```tsx
<button className="px-6 py-3 bg-gray-300 text-gray-500 rounded-2xl font-medium cursor-not-allowed">
  不可用
</button>
```

### 2. 卡片 Card

**基础卡片**
```tsx
<div className="bg-white rounded-3xl shadow-sm p-6">
  {/* 内容 */}
</div>
```

**悬浮卡片**
```tsx
<motion.div 
  className="bg-white rounded-3xl shadow-sm p-6"
  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
>
  {/* 内容 */}
</motion.div>
```

### 3. 输入框 Input

**基础输入**
```tsx
<input 
  type="text"
  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300"
  placeholder="请输入..."
/>
```

**带图标输入**
```tsx
<div className="relative">
  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input 
    type="text"
    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl"
  />
</div>
```

### 4. 标签 Badge

**基础标签**
```tsx
<span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
  标签
</span>
```

**匹配分数标签**
```tsx
<span className="px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg">
  <span className="text-2xl font-bold text-rose-500">92%</span>
</span>
```

### 5. 进度条 Progress

```tsx
<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
  <motion.div 
    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
    initial={{ width: 0 }}
    animate={{ width: '75%' }}
    transition={{ duration: 1, ease: 'easeOut' }}
  />
</div>
```

---

## 动画规范

### 进入动画
- 淡入：opacity 0 → 1, duration 0.3s
- 滑入：translateY 20px → 0, duration 0.3s
- 缩放：scale 0.9 → 1, duration 0.3s

### 交互动画
- 悬浮：scale 1 → 1.02, duration 0.2s
- 按压：scale 1 → 0.98, duration 0.1s
- 心跳：scale 1 → 1.1 → 1, duration 0.3s, repeat 2

### 加载动画
- 骨架屏：opacity 0.5 → 1 → 0.5, duration 1.5s, repeat infinite
- 打字指示器：translateY 0 → -5px → 0, duration 0.5s, stagger 0.15s

---

## 响应式断点

```css
/* Mobile first */
sm: 640px   /* 平板竖屏 */
md: 768px   /* 平板横屏 */
lg: 1024px  /* 小屏电脑 */
xl: 1280px  /* 大屏电脑 */
2xl: 1536px /* 超大屏 */
```

---

## 特殊效果

### 玻璃态
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 阴影层次
```css
shadow-sm   /* 轻阴影 */
shadow      /* 标准阴影 */
shadow-lg   /* 重阴影 */
shadow-xl   /* 超重阴影 */
```

### 渐变装饰
```css
/* 背景装饰球 */
.decoration {
  position: absolute;
  width: 300px;
  height: 300px;
  background: rose-200;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}
```

---

## 无障碍支持

- 所有可交互元素需有 `focus:outline-none focus:ring-2 focus:ring-rose-300`
- 图片需有 `alt` 属性
- 按钮需有足够的点击区域（至少 44x44px）
- 颜色对比度需符合 WCAG 2.1 标准

---

## 图标使用

使用 Lucide React 图标库：
```tsx
import { Heart, Star, ChevronRight } from 'lucide-react'

<Heart className="w-5 h-5" />
```

常用图标：
- 导航：Home, User, Settings, Bell
- 操作：Heart, Star, MessageCircle, Send
- 方向：ChevronRight, ArrowRight, ArrowLeft
- 状态：Check, X, AlertCircle, Info
