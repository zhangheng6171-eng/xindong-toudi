'use client'

import { motion } from 'framer-motion'

// 骨架屏基础组件
export function Skeleton({ className = '', rounded = 'md' }: { className?: string; rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' }) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 
        bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]
        ${roundedClasses[rounded]}
        ${className}
      `}
    />
  )
}

// 用户卡片骨架屏
export function UserCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* 头像骨架 */}
        <Skeleton className="w-16 h-16 flex-shrink-0" rounded="2xl" />
        
        <div className="flex-1 space-y-2">
          {/* 昵称骨架 */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-8" rounded="full" />
          </div>
          
          {/* 信息骨架 */}
          <div className="flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          
          {/* 简介骨架 */}
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      
      {/* 标签骨架 */}
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-14" rounded="full" />
        <Skeleton className="h-6 w-16" rounded="full" />
        <Skeleton className="h-6 w-12" rounded="full" />
      </div>
      
      {/* 按钮骨架 */}
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-10 flex-1" rounded="xl" />
        <Skeleton className="h-10 w-10" rounded="xl" />
      </div>
    </div>
  )
}

// 消息骨架屏
export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
        {!isOwn && <Skeleton className="w-8 h-8" rounded="full" />}
        <div className={`space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
          <Skeleton className={`h-10 w-40 ${isOwn ? 'ml-auto' : ''}`} rounded="2xl" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// 会话卡片骨架屏
export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm">
      <Skeleton className="w-14 h-14 flex-shrink-0" rounded="full" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

// 详情页骨架屏
export function ProfileDetailSkeleton() {
  return (
    <div className="space-y-4">
      {/* 头部骨架 */}
      <div className="relative h-40 bg-gradient-to-br from-rose-100 to-pink-100">
        <div className="absolute -bottom-12 left-6">
          <Skeleton className="w-24 h-24" rounded="2xl" />
        </div>
      </div>
      
      {/* 信息骨架 */}
      <div className="pt-16 px-6 space-y-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
        
        {/* 照片墙骨架 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="aspect-square" rounded="xl" />
            <Skeleton className="aspect-square" rounded="xl" />
            <Skeleton className="aspect-square" rounded="xl" />
          </div>
        </div>
        
        {/* 简介骨架 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-16 w-full" rounded="xl" />
        </div>
      </div>
    </div>
  )
}

// 加载状态组件
export function LoadingState({ message = '加载中...', className = '' }: { message?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-3 border-rose-200 border-t-rose-500 rounded-full"
      />
      <p className="text-gray-500 mt-4">{message}</p>
    </div>
  )
}

// 空状态组件
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ElementType
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-gray-200 mb-4"
      >
        <Icon className="w-16 h-16" />
      </motion.div>
      <h3 className="text-lg font-medium text-gray-400 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-300 text-sm text-center max-w-xs mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
