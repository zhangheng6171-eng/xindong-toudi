/**
 * 分享工具函数
 */

import html2canvas from 'html2canvas'

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案：使用 execCommand
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 生成分享卡片图片
 */
export async function generateShareCard(elementId: string): Promise<Blob | null> {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error('未找到分享卡片元素')
      return null
    }

    // 临时显示元素
    const originalDisplay = element.style.display
    element.style.display = 'block'
    element.style.position = 'fixed'
    element.style.left = '-9999px'
    element.style.top = '0'

    const canvas = await html2canvas(element, {
      scale: 2, // 提高清晰度
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    // 恢复元素隐藏
    element.style.display = originalDisplay || 'none'
    element.style.position = ''
    element.style.left = ''
    element.style.top = ''

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png', 0.95)
    })
  } catch (error) {
    console.error('生成分享卡片失败:', error)
    return null
  }
}

/**
 * 下载图片到本地
 */
export async function downloadImage(blob: Blob, filename: string): Promise<boolean> {
  try {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('下载图片失败:', error)
    return false
  }
}

/**
 * 分享到微信（调用原生 Web Share API）
 */
export async function shareToWeChat(data: {
  title: string
  text: string
  url?: string
  files?: File[]
}): Promise<boolean> {
  try {
    // 检查是否支持 Web Share API
    if (!navigator.share) {
      console.warn('当前浏览器不支持原生分享')
      return false
    }

    // 检查是否可以分享文件
    if (data.files && data.files.length > 0 && !navigator.canShare) {
      console.warn('当前浏览器不支持分享文件')
      return false
    }

    const shareData: ShareData = {
      title: data.title,
      text: data.text,
    }

    // 添加 URL
    if (data.url) {
      shareData.url = data.url
    }

    // 添加文件（如果支持）
    if (data.files && data.files.length > 0 && navigator.canShare?.({ files: data.files })) {
      shareData.files = data.files
    }

    await navigator.share(shareData)
    return true
  } catch (error) {
    // 用户取消分享不算错误
    if ((error as Error).name === 'AbortError') {
      return false
    }
    console.error('分享失败:', error)
    return false
  }
}

/**
 * 生成分享链接
 */
export function generateShareUrl(userId: string, nickname: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/match/report?userId=${userId}&nickname=${encodeURIComponent(nickname)}`
}

/**
 * 检查是否支持原生分享
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/**
 * 检查是否在微信浏览器中
 */
export function isWeChatBrowser(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('micromessenger')
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}
