/**
 * 密码加密工具模块
 * 
 * 注意：实际密码加密在后端（Cloudflare Workers）进行
 * 此模块提供前端密码验证和强度检查功能
 */

/**
 * 密码强度检查结果
 */
export interface PasswordStrengthResult {
  score: number // 0-4 分数
  level: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong'
  feedback: string[]
  isValid: boolean
}

/**
 * 密码强度检查
 * 返回密码强度分数和建议
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = []
  let score = 0
  
  // 长度检查
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('密码长度至少8位')
  }
  
  if (password.length >= 12) {
    score += 1
  }
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('建议包含小写字母')
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('建议包含大写字母')
  }
  
  // 包含数字
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('建议包含数字')
  }
  
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  }
  
  // 不包含常见弱密码
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
    score -= 2
    feedback.push('避免使用常见密码')
  }
  
  // 不包含连续字符
  if (/(.)\1{2,}/.test(password)) {
    score -= 1
    feedback.push('避免连续重复字符')
  }
  
  // 计算最终分数（0-4）
  score = Math.max(0, Math.min(4, Math.floor(score / 2)))
  
  const levels: PasswordStrengthResult['level'][] = [
    'very-weak', 'weak', 'fair', 'strong', 'very-strong'
  ]
  
  return {
    score,
    level: levels[score],
    feedback: feedback.length > 0 ? feedback : ['密码强度良好'],
    isValid: password.length >= 6 && score >= 1
  }
}

/**
 * 验证密码格式
 * 返回是否符合基本要求
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: '请输入密码' }
  }
  
  if (password.length < 6) {
    return { valid: false, error: '密码长度至少6位' }
  }
  
  if (password.length > 100) {
    return { valid: false, error: '密码长度不能超过100位' }
  }
  
  // 检查是否包含空白字符
  if (/\s/.test(password)) {
    return { valid: false, error: '密码不能包含空格' }
  }
  
  return { valid: true }
}

/**
 * 生成随机密码
 * 用于密码重置等场景
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // 确保包含各类字符
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)] // 小写
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)] // 大写
  password += '0123456789'[Math.floor(Math.random() * 10)] // 数字
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)] // 特殊字符
  
  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // 打乱顺序
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * 获取密码强度颜色
 * 用于UI显示
 */
export function getStrengthColor(level: PasswordStrengthResult['level']): string {
  const colors = {
    'very-weak': '#ef4444',   // red-500
    'weak': '#f97316',        // orange-500
    'fair': '#eab308',        // yellow-500
    'strong': '#22c55e',      // green-500
    'very-strong': '#10b981'  // emerald-500
  }
  return colors[level]
}

/**
 * 获取密码强度标签
 */
export function getStrengthLabel(level: PasswordStrengthResult['level']): string {
  const labels = {
    'very-weak': '非常弱',
    'weak': '弱',
    'fair': '一般',
    'strong': '强',
    'very-strong': '非常强'
  }
  return labels[level]
}
