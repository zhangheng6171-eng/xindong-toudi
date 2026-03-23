/**
 * 服务端密码处理模块
 * 
 * 注意：此模块仅用于服务端（Next.js API Routes, Cloudflare Workers 等）
 * 不要在前端代码中导入使用！
 */

import bcrypt from 'bcryptjs'

// bcrypt 轮数配置
const BCRYPT_ROUNDS = 12

/**
 * 哈希密码
 * @param password 原始密码
 * @returns 哈希后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('密码不能为空')
  }
  
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * 验证密码
 * @param password 原始密码
 * @param hash 哈希后的密码
 * @returns 是否匹配
 */
export async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  if (!password || !hash) {
    return false
  }
  
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * 检查密码是否需要重新哈希
 * 用于升级旧的密码哈希算法
 * @param hash 现有哈希
 * @returns 是否需要重新哈希
 */
export function needsRehash(hash: string): boolean {
  // 检查当前的 bcrypt 轮数
  const rounds = bcrypt.getRounds(hash)
  return rounds < BCRYPT_ROUNDS
}

/**
 * 验证密码强度（服务端版）
 * 使用与前端相同的验证规则
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // 长度检查
  if (password.length < 8) {
    errors.push('密码长度至少8位')
  }
  
  if (password.length > 128) {
    errors.push('密码长度不能超过128位')
  }
  
  // 字符类型检查
  if (!/[a-z]/.test(password)) {
    errors.push('必须包含小写字母')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('必须包含大写字母')
  }
  
  if (!/\d/.test(password)) {
    errors.push('必须包含数字')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 生成密码重置令牌
 */
export function generatePasswordResetToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

/**
 * 验证密码重置令牌
 */
export function verifyPasswordResetToken(
  token: string,
  storedHash: string
): boolean {
  const crypto = require('crypto')
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
  
  return tokenHash === storedHash
}
