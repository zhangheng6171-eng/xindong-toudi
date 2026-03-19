'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploaderProps {
  // 当前图片 URL
  value?: string | null
  // 图片变化回调
  onChange: (url: string | null) => void
  // 上传类型：avatar 或 photo
  type?: 'avatar' | 'photo'
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
  // 是否禁用
  disabled?: boolean
  // 自定义类名
  className?: string
}

export function ImageUploader({
  value,
  onChange,
  type = 'photo',
  size = 'md',
  disabled = false,
  className = '',
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }

  const handleFileSelect = useCallback(async (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 读取图片并转换为 base64
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        
        // 压缩图片（如果需要）
        const compressedImage = await compressImage(base64, type === 'avatar' ? 400 : 800)
        
        setPreview(compressedImage)
        onChange(compressedImage)
        setIsLoading(false)
      }
      
      reader.onerror = () => {
        setError('读取图片失败')
        setIsLoading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (err) {
      setError('上传失败，请重试')
      setIsLoading(false)
    }
  }, [type, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // 重置 input 以便可以重复选择同一文件
    e.target.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onChange(null)
  }

  const handleClick = () => {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isLoading}
      />

      {/* 上传区域 */}
      <div
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          ${type === 'avatar' ? 'rounded-full' : 'rounded-2xl'}
          ${!preview ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200' : ''}
          flex items-center justify-center cursor-pointer
          hover:border-rose-300 hover:bg-rose-50/30
          transition-all duration-300
          overflow-hidden relative
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
        ) : preview ? (
          <>
            <img
              src={preview}
              alt={type === 'avatar' ? '头像' : '照片'}
              className={`w-full h-full object-cover ${type === 'avatar' ? 'rounded-full' : 'rounded-2xl'}`}
            />
            {/* 悬停时显示更换/删除按钮 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={handleRemove}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            {type === 'avatar' ? (
              <Camera className="w-6 h-6 text-gray-300" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-gray-300" />
                <span className="text-xs text-gray-400">上传照片</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-red-500 bg-red-50 px-2 py-1 rounded"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 图片压缩函数
async function compressImage(base64: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // 计算缩放比例
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize
          width = maxSize
        } else {
          width = (width / height) * maxSize
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)

      // 返回压缩后的 base64
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.src = base64
  })
}

// 照片画廊组件
interface PhotoGalleryProps {
  photos: (string | null)[]
  onChange: (photos: (string | null)[]) => void
  maxPhotos?: number
  disabled?: boolean
}

export function PhotoGallery({
  photos,
  onChange,
  maxPhotos = 6,
  disabled = false,
}: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handlePhotoChange = (index: number, url: string | null) => {
    const newPhotos = [...photos]
    newPhotos[index] = url
    onChange(newPhotos)
  }

  // 确保照片数组长度正确
  const displayPhotos = [...photos]
  while (displayPhotos.length < maxPhotos) {
    displayPhotos.push(null)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {displayPhotos.map((photo, index) => (
        <div key={index} className="flex-shrink-0">
          <ImageUploader
            value={photo}
            onChange={(url) => handlePhotoChange(index, url)}
            type="photo"
            size="md"
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  )
}

// 头像上传组件（带渐变背景）
interface AvatarUploaderProps {
  value?: string | null
  onChange: (url: string | null) => void
  name?: string
  disabled?: boolean
  className?: string
}

export function AvatarUploader({
  value,
  onChange,
  name = '',
  disabled = false,
  className = '',
}: AvatarUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const compressedImage = await compressImage(base64, 400)
        onChange(compressedImage)
        setIsLoading(false)
      }
      
      reader.onerror = () => {
        setError('读取图片失败')
        setIsLoading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (err) {
      setError('上传失败，请重试')
      setIsLoading(false)
    }
  }, [onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    e.target.value = ''
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isLoading}
      />

      <div className="relative">
        {/* 光晕效果 */}
        {value && (
          <div className="absolute inset-0 bg-white/30 rounded-full blur-xl scale-125" />
        )}
        
        {/* 头像容器 */}
        <div
          onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
          className={`
            relative w-28 h-28 rounded-full cursor-pointer overflow-hidden
            ${!value ? 'bg-gradient-to-br from-rose-400 to-pink-500' : ''}
            shadow-2xl transition-transform hover:scale-105
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-white/20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : value ? (
            <>
              <img
                src={value}
                alt="头像"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
              {name ? name[0] : '?'}
            </div>
          )}
        </div>

        {/* 相机按钮 */}
        <button
          onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
          className={`
            absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full
            flex items-center justify-center shadow-lg
            hover:scale-110 transition-transform
            ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-red-500 bg-red-50 px-2 py-1 rounded"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
