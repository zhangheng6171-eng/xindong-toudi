/**
 * 心动投递 - 图片处理工具
 */

// 压缩图片 - 进一步降低尺寸以适应 localStorage
export async function compressImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 计算缩放比例，确保图片不会太大
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建画布'))
          return
        }

        // 使用更小的质量参数
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        
        // 检查压缩后的大小（base64 会比原始大小大约 1.33 倍）
        const base64Length = dataUrl.length - 'data:image/jpeg;base64,'.length
        const sizeInMB = (base64Length * 0.75) / (1024 * 1024)
        
        if (sizeInMB > 1.5) {
          // 如果还是太大，继续压缩
          compressImage(file, 200, 200, 0.3)
            .then(resolve)
            .catch(reject)
          return
        }
        
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

// 验证图片类型
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

// 验证图片大小（默认最大5MB）
export function isValidImageSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}

// 选择图片
export function selectImage(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        resolve(file)
      } else {
        reject(new Error('未选择图片'))
      }
    }
    input.click()
  })
}
