'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, ImageDown, Share2, Download, CheckCircle, Loader2 } from 'lucide-react'
import { ShareCard } from './share-card'
import {
  copyToClipboard,
  generateShareCard,
  downloadImage,
  shareToWeChat,
  generateShareUrl,
  canNativeShare,
  isWeChatBrowser,
  isMobile,
} from '@/lib/share-utils'

interface SharePanelProps {
  isOpen: boolean
  onClose: () => void
  myNickname: string
  otherNickname: string
  otherUserId: string
  matchScore: number
}

type ToastType = {
  message: string
  type: 'success' | 'error'
}

export function SharePanel({
  isOpen,
  onClose,
  myNickname,
  otherNickname,
  otherUserId,
  matchScore,
}: SharePanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastType | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2000)
  }

  // 复制链接
  const handleCopyLink = async () => {
    setLoading('copy')
    const url = generateShareUrl(otherUserId, otherNickname)
    const success = await copyToClipboard(url)
    setLoading(null)
    if (success) {
      showToast('链接已复制到剪贴板')
    } else {
      showToast('复制失败，请重试', 'error')
    }
  }

  // 生成并下载分享卡片
  const handleDownloadCard = async () => {
    setLoading('download')
    const blob = await generateShareCard('share-card-container')
    if (blob) {
      const filename = `心动投递-${myNickname}与${otherNickname}-匹配报告.png`
      const success = await downloadImage(blob, filename)
      if (success) {
        showToast('图片已保存')
      } else {
        showToast('保存失败，请重试', 'error')
      }
    } else {
      showToast('生成图片失败，请重试', 'error')
    }
    setLoading(null)
  }

  // 分享到微信（或原生分享）
  const handleNativeShare = async () => {
    setLoading('share')
    const url = generateShareUrl(otherUserId, otherNickname)
    
    // 先生成分享卡片图片
    const blob = await generateShareCard('share-card-container')
    
    if (blob) {
      const file = new File([blob], `心动投递-匹配报告.png`, { type: 'image/png' })
      const success = await shareToWeChat({
        title: `${myNickname}与${otherNickname}的匹配报告`,
        text: `我们的AI匹配度高达${matchScore}分！快来看看你们的匹配度吧~`,
        url,
        files: [file],
      })
      
      if (success) {
        showToast('分享成功')
      }
      // 用户取消分享不显示提示
    } else {
      // 如果生成图片失败，尝试仅分享链接
      const success = await shareToWeChat({
        title: `${myNickname}与${otherNickname}的匹配报告`,
        text: `我们的AI匹配度高达${matchScore}分！快来看看你们的匹配度吧~`,
        url,
      })
      
      if (success) {
        showToast('分享成功')
      }
    }
    setLoading(null)
  }

  const shareOptions = [
    {
      id: 'copy',
      icon: Link2,
      label: '复制链接',
      description: '复制分享链接',
      onClick: handleCopyLink,
      available: true,
    },
    {
      id: 'download',
      icon: ImageDown,
      label: '保存图片',
      description: '保存分享卡片到本地',
      onClick: handleDownloadCard,
      available: true,
    },
    {
      id: 'share',
      icon: Share2,
      label: isWeChatBrowser() ? '分享给好友' : '原生分享',
      description: isWeChatBrowser() ? '分享到微信好友' : '调用系统分享',
      onClick: handleNativeShare,
      available: canNativeShare(),
    },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* 分享卡片（隐藏，用于生成图片） */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <ShareCard
          myNickname={myNickname}
          otherNickname={otherNickname}
          matchScore={matchScore}
        />
      </div>

      {/* 遮罩层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* 分享面板 */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto"
      >
        {/* 拖动指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">分享匹配报告</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 分享选项 */}
        <div className="p-6 space-y-3">
          {shareOptions
            .filter((option) => option.available)
            .map((option) => {
              const Icon = option.icon
              const isLoading = loading === option.id

              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={option.onClick}
                  disabled={loading !== null}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </motion.button>
              )
            })}
        </div>

        {/* 底部提示 */}
        <div className="px-6 pb-8 pt-2 text-center">
          <p className="text-xs text-gray-400">
            分享给好友，让更多人发现心动的缘分
          </p>
        </div>
      </motion.div>

      {/* Toast 提示 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-xl"
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
