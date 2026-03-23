/**
 * 密码加密工具模块
 * 
 * 安全升级版：
 * - 使用 bcrypt 进行密码哈希（服务端）
 * - 添加更强的密码强度验证
 * - 防止弱密码
 * - 密码策略执行
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
 * 密码策略配置
 */
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // 可选，但建议
  minStrengthScore: 2, // 至少 "fair" 级别
}

// 常见弱密码列表（扩展版）
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'login', 'passw0rd', 'hello',
  'shadow', 'sunshine', 'princess', 'football', 'baseball',
  'iloveyou', 'trustno1', 'superman', 'batman', 'starwars',
  'michael', 'jennifer', 'jordan', 'hunter', 'ranger',
  'harley', 'liverpool', 'chelsea', 'arsenal', 'manchester',
  '888888', '000000', '121212', '111111', '666666',
  '1234567890', '9876543210', 'qazwsx', 'password1', '123123',
  'admin123', 'root', 'toor', 'test', 'guest',
  'password!', 'p@ssword', 'pa$$word', 'p4ssword',
  // 添加更多中文常见密码
  'woaini', 'nihao', 'zhangsan', 'lisi', 'wangwu',
  '111', '222', '333', '444', '555',
])

/**
 * 密码强度检查
 * 返回密码强度分数和建议
 * 
 * 升级版：更严格的检查规则
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = []
  let score = 0
  
  // ============== 基础检查 ==============
  
  // 长度检查（更严格）
  if (password.length >= 8) {
    score += 1
    if (password.length >= 12) {
      score += 1
    }
    if (password.length >= 16) {
      score += 0.5 // 额外加分
    }
  } else {
    feedback.push('密码长度至少8位')
  }
  
  // ============== 字符类型检查 ==============
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('必须包含小写字母')
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('必须包含大写字母')
  }
  
  // 包含数字
  if (/\d/.test(password)) {
    score += 1
    // 多种数字加分
    if (/\d.*\d.*\d/.test(password)) {
      score += 0.5
    }
  } else {
    feedback.push('必须包含数字')
  }
  
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password)) {
    score += 1
    // 多种特殊字符加分
    const specialCount = (password.match(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/g) || []).length
    if (specialCount >= 2) {
      score += 0.5
    }
  } else {
    feedback.push('建议包含特殊字符（如 !@#$%）')
  }
  
  // ============== 安全性检查 ==============
  
  // 检查是否为常见弱密码
  const lowerPassword = password.toLowerCase()
  if (COMMON_PASSWORDS.has(lowerPassword)) {
    score = 0
    feedback.length = 0
    feedback.push('密码过于常见，请更换')
  } else {
    // 检查是否包含常见弱密码
    for (const common of COMMON_PASSWORDS) {
      if (lowerPassword.includes(common)) {
        score -= 2
        feedback.push('避免使用常见密码或包含常见密码')
        break
      }
    }
  }
  
  // 检查连续重复字符
  if (/(.)\1{2,}/.test(password)) {
    score -= 1
    feedback.push('避免连续重复字符（如 aaa, 111）')
  }
  
  // 检查连续递增/递减序列
  const sequences = ['abc', '123', 'qwe', 'asd', 'zxc', 'xyz']
  for (const seq of sequences) {
    if (lowerPassword.includes(seq)) {
      score -= 0.5
      feedback.push('避免连续序列字符（如 abc, 123）')
      break
    }
  }
  
  // 检查键盘模式
  const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', 'qazwsx', '1qaz', '!qaz']
  for (const pattern of keyboardPatterns) {
    if (lowerPassword.includes(pattern)) {
      score -= 1
      feedback.push('避免键盘连续字符')
      break
    }
  }
  
  // ============== 最终评分 ==============
  
  // 计算最终分数（0-4）
  score = Math.max(0, Math.min(4, Math.round(score)))
  
  const levels: PasswordStrengthResult['level'][] = [
    'very-weak', 'weak', 'fair', 'strong', 'very-strong'
  ]
  
  // 确定是否有效（符合策略）
  const isValid = 
    password.length >= PASSWORD_POLICY.minLength &&
    (PASSWORD_POLICY.requireUppercase ? /[A-Z]/.test(password) : true) &&
    (PASSWORD_POLICY.requireLowercase ? /[a-z]/.test(password) : true) &&
    (PASSWORD_POLICY.requireNumbers ? /\d/.test(password) : true) &&
    score >= PASSWORD_POLICY.minStrengthScore
  
  return {
    score,
    level: levels[score],
    feedback: feedback.length > 0 ? feedback : ['密码强度良好'],
    isValid,
  }
}

/**
 * 验证密码格式（严格版）
 * 返回是否符合安全策略
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: '请输入密码' }
  }
  
  // 长度检查
  if (password.length < PASSWORD_POLICY.minLength) {
    return { valid: false, error: `密码长度至少${PASSWORD_POLICY.minLength}位` }
  }
  
  if (password.length > PASSWORD_POLICY.maxLength) {
    return { valid: false, error: `密码长度不能超过${PASSWORD_POLICY.maxLength}位` }
  }
  
  // 检查空白字符
  if (/\s/.test(password)) {
    return { valid: false, error: '密码不能包含空格' }
  }
  
  // 检查控制字符
  if (/[\x00-\x1F\x7F]/.test(password)) {
    return { valid: false, error: '密码包含非法字符' }
  }
  
  // 字符类型检查
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: '密码必须包含大写字母' }
  }
  
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, error: '密码必须包含小写字母' }
  }
  
  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    return { valid: false, error: '密码必须包含数字' }
  }
  
  // 强度检查
  const strength = checkPasswordStrength(password)
  if (!strength.isValid) {
    return { 
      valid: false, 
      error: '密码强度不足：' + strength.feedback.slice(0, 2).join('；')
    }
  }
  
  return { valid: true }
}

/**
 * 验证密码确认
 */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): { valid: boolean; error?: string } {
  if (!confirmation) {
    return { valid: false, error: '请确认密码' }
  }
  
  if (password !== confirmation) {
    return { valid: false, error: '两次输入的密码不一致' }
  }
  
  return { valid: true }
}

/**
 * 生成安全随机密码
 * 用于密码重置等场景
 */
export function generateRandomPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  
  const allChars = lowercase + uppercase + numbers + special
  
  let password = ''
  
  // 确保包含各类字符
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // 填充剩余长度（使用加密安全的随机数）
  const randomValues = new Uint32Array(length - 4)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < randomValues.length; i++) {
      password += allChars[randomValues[i] % allChars.length]
    }
  } else {
    // 回退到 Math.random（不推荐，但作为备用）
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
  }
  
  // Fisher-Yates 洗牌
  const chars = password.split('')
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  
  return chars.join('')
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

/**
 * 获取密码策略描述
 * 用于UI显示
 */
export function getPasswordPolicyDescription(): string[] {
  return [
    `密码长度至少${PASSWORD_POLICY.minLength}位`,
    PASSWORD_POLICY.requireUppercase ? '必须包含大写字母' : '',
    PASSWORD_POLICY.requireLowercase ? '必须包含小写字母' : '',
    PASSWORD_POLICY.requireNumbers ? '必须包含数字' : '',
    PASSWORD_POLICY.requireSpecialChars ? '必须包含特殊字符' : '建议包含特殊字符',
    '避免使用常见密码或连续字符',
  ].filter(Boolean)
}
