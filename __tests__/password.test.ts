/**
 * 密码加密功能测试
 */

import { checkPasswordStrength, validatePassword, getStrengthColor, getStrengthLabel, generateRandomPassword } from '../src/lib/password'

describe('密码强度检查', () => {
  test('弱密码检测', () => {
    const result = checkPasswordStrength('123456')
    expect(result.score).toBeLessThan(2)
    expect(result.isValid).toBe(false)
  })
  
  test('中等密码检测', () => {
    const result = checkPasswordStrength('Password123!')
    expect(result.score).toBeGreaterThanOrEqual(2)
    expect(result.isValid).toBe(true)
  })
  
  test('强密码检测', () => {
    const result = checkPasswordStrength('MyStr0ng!Pass')
    expect(result.score).toBeGreaterThanOrEqual(3)
    expect(result.isValid).toBe(true)
  })
  
  test('空密码处理', () => {
    const result = checkPasswordStrength('')
    expect(result.isValid).toBe(false)
  })
})

describe('密码格式验证', () => {
  test('有效密码', () => {
    const result = validatePassword('ValidPass123')
    expect(result.valid).toBe(true)
  })
  
  test('密码太短', () => {
    const result = validatePassword('12345')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('至少6位')
  })
  
  test('密码包含空格', () => {
    const result = validatePassword('Pass word123')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('空格')
  })
  
  test('密码太长', () => {
    const result = validatePassword('A'.repeat(101))
    expect(result.valid).toBe(false)
    expect(result.error).toContain('超过100位')
  })
})

describe('密码强度颜色和标签', () => {
  test('强度颜色返回正确的颜色值', () => {
    expect(getStrengthColor('very-weak')).toMatch(/^#/)
    expect(getStrengthColor('strong')).toMatch(/^#/)
  })
  
  test('强度标签返回中文', () => {
    expect(getStrengthLabel('very-weak')).toBe('非常弱')
    expect(getStrengthLabel('strong')).toBe('强')
    expect(getStrengthLabel('very-strong')).toBe('非常强')
  })
})

describe('随机密码生成', () => {
  test('生成指定长度的密码', () => {
    const password = generateRandomPassword(16)
    expect(password.length).toBe(16)
  })
  
  test('生成密码包含各种字符', () => {
    const password = generateRandomPassword(12)
    expect(/[a-z]/.test(password)).toBe(true) // 包含小写
    expect(/[A-Z]/.test(password)).toBe(true) // 包含大写
    expect(/[0-9]/.test(password)).toBe(true) // 包含数字
    expect(/[!@#$%^&*]/.test(password)).toBe(true) // 包含特殊字符
  })
})
