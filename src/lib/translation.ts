/**
 * 心动投递 - 消息翻译工具
 * 支持多种语言翻译
 */

// 支持的语言
export const LANGUAGES = {
  'zh': { name: '中文', flag: '🇨🇳' },
  'en': { name: 'English', flag: '🇺🇸' },
  'ja': { name: '日本語', flag: '🇯🇵' },
  'ko': { name: '한국어', flag: '🇰🇷' },
  'es': { name: 'Español', flag: '🇪🇸' },
  'fr': { name: 'Français', flag: '🇫🇷' },
  'de': { name: 'Deutsch', flag: '🇩🇪' },
  'ru': { name: 'Русский', flag: '🇷🇺' },
  'pt': { name: 'Português', flag: '🇧🇷' },
  'ar': { name: 'العربية', flag: '🇸🇦' },
} as const

export type LanguageCode = keyof typeof LANGUAGES

// 简单翻译函数（实际应用中应调用翻译API）
export async function translateText(
  text: string,
  fromLang: LanguageCode,
  toLang: LanguageCode
): Promise<string> {
  // 如果源语言和目标语言相同，直接返回
  if (fromLang === toLang) {
    return text
  }

  // 简单模拟翻译（实际项目中应该调用真实的翻译API）
  // 这里使用简单的占位逻辑
  console.log(`翻译: ${text} 从 ${fromLang} 到 ${toLang}`)

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 实际项目中，这里应该调用翻译API，例如：
  // const response = await fetch(`https://translation-api.example.com/translate`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ text, from: fromLang, to: toLang })
  // })
  // const data = await response.json()
  // return data.translatedText

  // 临时返回原文（实际部署时替换为真实翻译API）
  return `[${LANGUAGES[toLang].name}] ${text}`
}

// 检测语言（简化版本）
export function detectLanguage(text: string): LanguageCode {
  // 检测中文
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return 'zh'
  }
  
  // 检测日文
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return 'ja'
  }
  
  // 检测韩文
  if (/[\uac00-\ud7af]/.test(text)) {
    return 'ko'
  }
  
  // 检测阿拉伯文
  if (/[\u0600-\u06ff]/.test(text)) {
    return 'ar'
  }
  
  // 检测俄文
  if (/[\u0400-\u04ff]/.test(text)) {
    return 'ru'
  }
  
  // 默认返回英文
  return 'en'
}

// 翻译结果缓存
const translationCache = new Map<string, string>()

// 获取缓存的翻译
export function getCachedTranslation(
  text: string,
  toLang: LanguageCode
): string | null {
  const key = `${text}_${toLang}`
  return translationCache.get(key) || null
}

// 缓存翻译结果
export function cacheTranslation(
  text: string,
  toLang: LanguageCode,
  translation: string
): void {
  const key = `${text}_${toLang}`
  translationCache.set(key, translation)
}

// 智能翻译（带缓存）
export async function smartTranslate(
  text: string,
  toLang: LanguageCode
): Promise<string> {
  // 检查缓存
  const cached = getCachedTranslation(text, toLang)
  if (cached) {
    return cached
  }

  // 检测源语言
  const fromLang = detectLanguage(text)
  
  // 执行翻译
  const translation = await translateText(text, fromLang, toLang)
  
  // 缓存结果
  cacheTranslation(text, toLang, translation)
  
  return translation
}
