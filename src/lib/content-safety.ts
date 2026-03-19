/**
 * 心动投递 - 聊天安全工具
 * 敏感词过滤和内容安全
 */

// 敏感词列表（示例，实际应该从服务器获取）
const SENSITIVE_WORDS: string[] = [
  // 这里应该包含实际的敏感词列表
  // 由于是示例，这里用占位符
]

// 检查敏感词
export function checkSensitiveContent(content: string): {
  hasSensitive: boolean
  filteredContent: string
  matchedWords: string[]
} {
  let filteredContent = content
  const matchedWords: string[] = []

  SENSITIVE_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi')
    if (regex.test(content)) {
      matchedWords.push(word)
      filteredContent = filteredContent.replace(regex, '*'.repeat(word.length))
    }
  })

  return {
    hasSensitive: matchedWords.length > 0,
    filteredContent,
    matchedWords
  }
}

// 检查是否包含链接
export function containsLink(content: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  return urlRegex.test(content)
}

// 检查是否包含手机号
export function containsPhoneNumber(content: string): boolean {
  const phoneRegex = /1[3-9]\d{9}/g
  return phoneRegex.test(content)
}

// 检查是否包含微信号
export function containsWechatId(content: string): boolean {
  const wechatRegex = /微信|wechat|weixin/gi
  return wechatRegex.test(content)
}

// 内容安全检查
export function checkContentSafety(content: string): {
  safe: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // 检查链接
  if (containsLink(content)) {
    warnings.push('消息中包含链接，请谨慎点击')
  }

  // 检查手机号
  if (containsPhoneNumber(content)) {
    warnings.push('请勿在聊天中发送手机号码')
  }

  // 检查微信号
  if (containsWechatId(content)) {
    warnings.push('请勿在聊天中发送微信号')
  }

  return {
    safe: warnings.length === 0,
    warnings
  }
}

// 验证消息内容
export function validateMessage(content: string): {
  valid: boolean
  error?: string
} {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: '消息不能为空' }
  }

  if (content.length > 500) {
    return { valid: false, error: '消息长度不能超过500字' }
  }

  const safety = checkContentSafety(content)
  if (!safety.safe) {
    // 只是警告，不阻止发送
    console.warn('内容安全警告:', safety.warnings)
  }

  return { valid: true }
}
