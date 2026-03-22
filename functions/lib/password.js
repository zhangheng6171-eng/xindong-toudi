/**
 * 后端密码加密工具模块
 * 提供密码加密、验证和升级功能
 */

import bcrypt from 'bcryptjs'

// 密码加密强度 - 12轮（生产环境推荐）
const SALT_ROUNDS = 12

/**
 * 检测密码是否已加密（bcrypt哈希以$2开头，长度60位）
 */
export function isPasswordHashed(password) {
  return password && password.startsWith('$2') && password.length === 60
}

/**
 * 加密密码
 * @param {string} plainPassword - 明文密码
 * @returns {Promise<string>} - 加密后的密码
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword) {
    throw new Error('Password is required')
  }
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

/**
 * 验证密码
 * @param {string} plainPassword - 明文密码
 * @param {string} hashedPassword - 加密后的密码
 * @returns {Promise<boolean>} - 是否匹配
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) {
    return false
  }
  
  // 如果密码未加密，直接比较（向后兼容）
  if (!isPasswordHashed(hashedPassword)) {
    return plainPassword === hashedPassword
  }
  
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * 升级明文密码到bcrypt加密
 * @param {string} userId - 用户ID
 * @param {string} plainPassword - 明文密码
 * @param {object} config - Supabase配置
 * @returns {Promise<boolean>} - 是否成功
 */
export async function upgradePasswordHash(userId, plainPassword, config) {
  try {
    const hashedPassword = await hashPassword(plainPassword)
    
    const updateResponse = await fetch(
      `${config.url}/rest/v1/users?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ password: hashedPassword })
      }
    )
    
    if (updateResponse.ok) {
      console.log(`[Password Upgrade] User ${userId} password upgraded to bcrypt`)
      return true
    } else {
      console.error('[Password Upgrade] Failed to upgrade password:', await updateResponse.text())
      return false
    }
  } catch (error) {
    console.error('[Password Upgrade] Error:', error.message)
    return false
  }
}

/**
 * 验证密码强度
 * @param {string} password - 待验证的密码
 * @returns {object} - 验证结果
 */
export function validatePasswordStrength(password) {
  const errors = []
  
  if (!password) {
    errors.push('请输入密码')
    return { valid: false, errors }
  }
  
  if (password.length < 6) {
    errors.push('密码长度至少6位')
  }
  
  if (password.length > 100) {
    errors.push('密码长度不能超过100位')
  }
  
  // 检查常见弱密码
  const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123', 'admin']
  if (commonPasswords.some(p => password.toLowerCase() === p)) {
    errors.push('请使用更复杂的密码')
  }
  
  // 检查空白字符
  if (/\s/.test(password)) {
    errors.push('密码不能包含空格')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 安全地比较密码（防止时序攻击）
 * @param {string} passwordMatch - 是否匹配
 * @returns {Promise<void>}
 */
export async function timingSafeDelay() {
  // 添加随机延迟，防止时序攻击
  const delay = 50 + Math.random() * 100
  return new Promise(resolve => setTimeout(resolve, delay))
}
