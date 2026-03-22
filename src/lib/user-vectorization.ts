/**
 * 心动投递 - 用户画像向量化模块 V2
 * 
 * 将用户问卷答案转化为110维向量，用于高效相似度计算
 * 维度分布：personality 30 + values 10 + interests 50 + lifestyle 20 = 110维
 */

import { PersonalityProfile, DimensionScore } from './scoring-system'
import type { UserAnswers } from './match-calculator'

// ============================================
// 类型定义
// ============================================

export interface UserVector {
  userId: string
  
  // 各维度向量
  personalityVector: number[]      // 30维
  valuesVector: number[]           // 10维
  interestsVector: number[]        // 50维
  lifestyleVector: number[]        // 20维
  combinedVector: number[]         // 110维
  
  // 向量元数据
  calculatedAt: Date
  version: number
  completenessScore: number        // 完整度 0-100
  reliabilityScore: number         // 可靠性 0-100
}

// 问卷答案到向量的映射
export interface QuestionnaireVectorInput {
  answers: UserAnswers
  personality?: PersonalityProfile
}

// 向量配置
export interface VectorConfig {
  personalityDim: number
  valuesDim: number
  interestsDim: number
  lifestyleDim: number
  totalDim: number
}

export const VECTOR_CONFIG: VectorConfig = {
  personalityDim: 30,
  valuesDim: 10,
  interestsDim: 50,
  lifestyleDim: 20,
  totalDim: 110
}

// 大五人格问题到维度的映射
const PERSONALITY_QUESTION_MAP = {
  // 开放性 (维度0-5)
  openness: [1, 2, 3],
  // 尽责性 (维度6-11)
  conscientiousness: [4, 5, 6],
  // 外向性 (维度12-17)
  extraversion: [7, 8, 9],
  // 宜人性 (维度18-23)
  agreeableness: [10, 11, 12],
  // 神经质 (维度24-29)
  neuroticism: [13, 14, 15]
}

// 价值观问题映射 (10维)
const VALUES_QUESTION_MAP: Record<number, string> = {
  28: 'children',        // 生育观念
  29: 'loyalty',        // 忠诚观念
  30: 'living_style',   // 居住方式
  31: 'consumption',    // 消费观
  32: 'finance',        // 财务管理
  33: 'work_family',    // 工作家庭平衡
  34: 'family_boundary',// 原生家庭边界
  35: 'religion',       // 宗教信仰
  36: 'marriage_meaning', // 婚姻意义
  37: 'politics'        // 社会观点
}

// 兴趣爱好映射 (50维)
const INTERESTS_QUESTION_IDS = [58, 59, 60, 61, 62, 63, 64, 65]

const INTEREST_CATEGORIES = [
  // 文化艺术 (10维, 索引0-9)
  'reading', 'writing', 'painting', 'music', 'theater',
  'photography', 'film', 'dance', 'design', 'craft',
  
  // 运动健身 (10维, 索引10-19)
  'running', 'swimming', 'yoga', 'gym', 'basketball',
  'football', 'tennis', 'hiking', 'cycling', 'skiing',
  
  // 生活方式 (10维, 索引20-29)
  'cooking', 'baking', 'travel', 'coffee', 'wine',
  'gardening', 'pets', 'cars', 'fashion', 'beauty',
  
  // 科技游戏 (10维, 索引30-39)
  'gaming', 'programming', 'gadgets', 'anime', 'board_games',
  'puzzles', 'science', 'astronomy', 'ai', 'crypto',
  
  // 社交公益 (10维, 索引40-49)
  'volunteering', 'networking', 'teaching', 'mentoring', 'politics',
  'environment', 'religion', 'meditation', 'psychology', 'philosophy'
]

// 生活方式映射 (20维)
const LIFESTYLE_QUESTION_MAP = {
  // 作息类型 (3维 one-hot, 索引0-2)
  chronotype: {
    morning: 0,
    intermediate: 1,
    evening: 2
  },
  // 社交频率 (4维 one-hot, 索引3-6)
  socialFrequency: {
    very_active: 3,
    active: 4,
    moderate: 5,
    quiet: 6
  },
  // 生活节奏 (3维 one-hot, 索引7-9)
  pacePreference: {
    fast: 7,
    moderate: 8,
    slow: 9
  },
  // 消费风格 (3维 one-hot, 索引10-12)
  spendingStyle: {
    frugal: 10,
    balanced: 11,
    generous: 12
  }
}

// ============================================
// 核心向量化函数
// ============================================

/**
 * 主入口：将用户问卷答案转化为完整向量
 */
export function vectorizeUserFromQuestionnaire(
  userId: string,
  input: QuestionnaireVectorInput
): UserVector {
  const { answers, personality } = input
  
  // 1. 构建性格向量 (30维)
  const personalityVector = buildPersonalityVector(answers, personality)
  
  // 2. 构建价值观向量 (10维)
  const valuesVector = buildValuesVector(answers)
  
  // 3. 构建兴趣向量 (50维)
  const interestsVector = buildInterestsVector(answers)
  
  // 4. 构建生活方式向量 (20维)
  const lifestyleVector = buildLifestyleVector(answers)
  
  // 5. 组合成110维向量
  const combinedVector = [
    ...personalityVector,
    ...valuesVector,
    ...interestsVector,
    ...lifestyleVector
  ]
  
  // 6. 计算完整度和可靠性分数
  const { completenessScore, reliabilityScore } = calculateVectorQuality(
    personalityVector,
    valuesVector,
    interestsVector,
    lifestyleVector,
    answers
  )
  
  return {
    userId,
    personalityVector,
    valuesVector,
    interestsVector,
    lifestyleVector,
    combinedVector,
    calculatedAt: new Date(),
    version: 2,
    completenessScore,
    reliabilityScore
  }
}

/**
 * 构建性格向量 (30维)
 * 
 * 结构：
 * - 大五人格5个主维度 (5维)
 * - 大五人格25个子维度 (25维)
 */
function buildPersonalityVector(
  answers: UserAnswers,
  personality?: PersonalityProfile
): number[] {
  const vector: number[] = []
  
  // 如果有预处理的性格档案，直接使用
  if (personality) {
    // 主维度 (5维)
    vector.push(normalizeTScore(personality.openness.normalizedScore))
    vector.push(normalizeTScore(personality.conscientiousness.normalizedScore))
    vector.push(normalizeTScore(personality.extraversion.normalizedScore))
    vector.push(normalizeTScore(personality.agreeableness.normalizedScore))
    vector.push(normalizeTScore(personality.neuroticism.normalizedScore))
    
    // 子维度 (25维)
    const allFacets = [
      ...Object.values(personality.openness.facets || {}),
      ...Object.values(personality.conscientiousness.facets || {}),
      ...Object.values(personality.extraversion.facets || {}),
      ...Object.values(personality.agreeableness.facets || {}),
      ...Object.values(personality.neuroticism.facets || {})
    ]
    
    // 补齐或截断到25维
    while (allFacets.length < 25) {
      allFacets.push(50)
    }
    allFacets.slice(0, 25).forEach(score => {
      vector.push(normalizeTScore(score as number))
    })
    
    return vector
  }
  
  // 从问卷答案构建
  // 主维度 (5维)
  const mainTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
  
  mainTraits.forEach(trait => {
    const questionIds = PERSONALITY_QUESTION_MAP[trait as keyof typeof PERSONALITY_QUESTION_MAP]
    if (questionIds) {
      const scores = questionIds
        .map(qId => answerToScore(answers[qId]))
        .filter(s => s !== null)
      
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        vector.push(avg)
      } else {
        vector.push(0.5) // 默认值
      }
    }
  })
  
  // 子维度 - 从问卷答案推断 (25维)
  // 简化处理：复制主维度的值
  while (vector.length < 5) {
    vector.push(0.5)
  }
  
  for (let i = 0; i < 25; i++) {
    // 基于主维度添加小量噪声来模拟子维度
    const mainTraitIndex = Math.floor(i / 5)
    const mainValue = vector[mainTraitIndex]
    const variance = (Math.random() - 0.5) * 0.1
    vector.push(Math.max(0, Math.min(1, mainValue + variance)))
  }
  
  return vector
}

/**
 * 构建价值观向量 (10维)
 * 
 * 基于Schwartz价值观理论和问卷核心问题
 */
function buildValuesVector(answers: UserAnswers): number[] {
  const vector: number[] = []
  
  // 按顺序处理10个核心价值观维度
  for (let i = 0; i < 10; i++) {
    const questionId = 28 + i // 问题28-37
    const answer = answers[questionId]
    
    if (answer !== undefined) {
      // 转换为0-1的值
      const score = answerToScore(answer)
      vector.push(score)
    } else {
      vector.push(0.5) // 默认中性值
    }
  }
  
  return vector
}

/**
 * 构建兴趣向量 (50维)
 * 
 * 使用预定义的50个兴趣类别
 */
function buildInterestsVector(answers: UserAnswers): number[] {
  // 初始化50维向量为0
  const vector = new Array(50).fill(0)
  
  // 从问卷答案中提取兴趣
  INTERESTS_QUESTION_IDS.forEach(qId => {
    const answer = answers[qId]
    
    if (Array.isArray(answer)) {
      // 多选答案
      answer.forEach(interest => {
        const idx = INTEREST_CATEGORIES.indexOf(interest)
        if (idx !== -1) {
          vector[idx] = 1.0 // 标记为感兴趣
        }
      })
    } else if (typeof answer === 'string') {
      // 单选，转换为强度
      const idx = parseInt(answer, 10) - 1
      if (idx >= 0 && idx < 50) {
        vector[idx] = 0.7 // 有回应
      }
    }
  })
  
  // 如果没有任何答案，使用默认值
  if (vector.every(v => v === 0)) {
    return vector.map(() => 0.3) // 中等偏低
  }
  
  return vector
}

/**
 * 构建生活方式向量 (20维)
 * 
 * 结构：
 * - 作息类型: 3维 one-hot
 * - 社交频率: 4维 one-hot
 * - 生活节奏: 3维 one-hot
 * - 消费风格: 3维 one-hot
 * - 连续变量: 7维
 */
function buildLifestyleVector(answers: UserAnswers): number[] {
  const vector: number[] = new Array(20).fill(0)
  
  // 问题38-45 对应生活方式问题
  const q38 = answers[38] // 作息类型
  const q39 = answers[39] // 社交频率
  const q40 = answers[40] // 生活节奏
  const q41 = answers[41] // 消费风格
  const q42 = answers[42] // 社交能量
  const q43 = answers[43] // 健康意识
  const q44 = answers[44] // 储蓄偏好
  const q45 = answers[45] // 冒险精神
  
  // 处理作息类型 (3维 one-hot)
  if (q38 !== undefined) {
    const chronotypeMap: Record<string, number> = {
      'A': 0, // 早起
      'B': 1, // 中间
      'C': 2  // 夜猫
    }
    const idx = chronotypeMap[q38 as string]
    if (idx !== undefined) {
      vector[idx] = 1
    }
  }
  
  // 处理社交频率 (4维 one-hot)
  if (q39 !== undefined) {
    const socialMap: Record<string, number> = {
      'A': 3, // 非常活跃
      'B': 4, // 活跃
      'C': 5, // 适中
      'D': 6  // 内向
    }
    const idx = socialMap[q39 as string]
    if (idx !== undefined) {
      vector[idx] = 1
    }
  }
  
  // 处理生活节奏 (3维 one-hot)
  if (q40 !== undefined) {
    const paceMap: Record<string, number> = {
      'A': 7, // 快节奏
      'B': 8, // 适中
      'C': 9  // 慢节奏
    }
    const idx = paceMap[q40 as string]
    if (idx !== undefined) {
      vector[idx] = 1
    }
  }
  
  // 处理消费风格 (3维 one-hot)
  if (q41 !== undefined) {
    const spendingMap: Record<string, number> = {
      'A': 10, // 节俭
      'B': 11, // 平衡
      'C': 12  // 慷慨
    }
    const idx = spendingMap[q41 as string]
    if (idx !== undefined) {
      vector[idx] = 1
    }
  }
  
  // 处理连续变量 (7维, 索引13-19)
  // 社交能量 (索引13)
  if (q42 !== undefined) {
    vector[13] = answerToScore(q42)
  }
  
  // 健康意识 (索引14)
  if (q43 !== undefined) {
    vector[14] = answerToScore(q43)
  }
  
  // 储蓄偏好 (索引15)
  if (q44 !== undefined) {
    vector[15] = answerToScore(q44)
  }
  
  // 冒险精神 (索引16)
  if (q45 !== undefined) {
    vector[16] = answerToScore(q45)
  }
  
  // 剩余维度填充默认值
  for (let i = 17; i < 20; i++) {
    if (vector[i] === 0) {
      vector[i] = 0.5
    }
  }
  
  return vector
}

// ============================================
// 辅助函数
// ============================================

/**
 * 将问卷答案转换为0-1分数
 */
function answerToScore(answer: string | string[] | number | undefined): number {
  if (answer === undefined) {
    return 0.5
  }
  
  if (typeof answer === 'number') {
    return normalizeScore(answer, 0, 100)
  }
  
  if (typeof answer === 'string') {
    // 单选题: A=1, B=2, C=3, D=4, E=5
    const charCode = answer.toUpperCase().charCodeAt(0)
    if (charCode >= 65 && charCode <= 69) {
      return (charCode - 64) / 5 // 0.2, 0.4, 0.6, 0.8, 1.0
    }
    return 0.5
  }
  
  if (Array.isArray(answer)) {
    // 多选题：返回兴趣数量归一化
    return Math.min(1, answer.length / 5)
  }
  
  return 0.5
}

/**
 * T分数归一化到 0-1
 * T分数范围约20-80
 */
function normalizeTScore(tScore: number): number {
  return Math.max(0, Math.min(1, (tScore - 20) / 60))
}

/**
 * 普通分数归一化
 */
function normalizeScore(score: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (score - min) / (max - min)))
}

/**
 * 计算向量质量分数
 */
function calculateVectorQuality(
  personality: number[],
  values: number[],
  interests: number[],
  lifestyle: number[],
  answers: UserAnswers
): { completenessScore: number; reliabilityScore: number } {
  // 完整度：计算有多少维度的值不是默认值
  const defaultValue = 0.5
  let filledDimensions = 0
  const totalDimensions = 110
  
  ;[personality, values, interests, lifestyle].forEach(vec => {
    vec.forEach(v => {
      if (Math.abs(v - defaultValue) > 0.1) {
        filledDimensions++
      }
    })
  })
  
  const completenessScore = (filledDimensions / totalDimensions) * 100
  
  // 可靠性：基于答案数量
  const answeredQuestions = Object.keys(answers).length
  const reliabilityScore = Math.min(100, (answeredQuestions / 65) * 100)
  
  return { completenessScore, reliabilityScore }
}

// ============================================
// 向量序列化（用于数据库存储）
// ============================================

/**
 * 将向量转换为JSONB格式
 */
export function serializeVector(vector: UserVector): {
  personality_vector: string
  values_vector: string
  interests_vector: string
  lifestyle_vector: string
  combined_vector: string
  vector_calculated_at: string
  vector_version: number
  vector_quality_score: number
  questionnaire_complete: boolean
} {
  return {
    personality_vector: JSON.stringify(vector.personalityVector),
    values_vector: JSON.stringify(vector.valuesVector),
    interests_vector: JSON.stringify(vector.interestsVector),
    lifestyle_vector: JSON.stringify(vector.lifestyleVector),
    combined_vector: JSON.stringify(vector.combinedVector),
    vector_calculated_at: vector.calculatedAt.toISOString(),
    vector_version: vector.version,
    vector_quality_score: vector.completenessScore,
    questionnaire_complete: vector.completenessScore > 70
  }
}

/**
 * 从数据库记录反序列化向量
 */
export function deserializeVector(
  userId: string,
  record: {
    personality_vector?: any
    values_vector?: any
    interests_vector?: any
    lifestyle_vector?: any
    combined_vector?: any
    vector_calculated_at?: string
    vector_version?: number
    vector_quality_score?: number
    questionnaire_complete?: boolean
  }
): UserVector | null {
  try {
    const parseJsonb = (val: any): number[] => {
      if (Array.isArray(val)) return val
      if (typeof val === 'string') return JSON.parse(val)
      return []
    }
    
    return {
      userId,
      personalityVector: parseJsonb(record.personality_vector),
      valuesVector: parseJsonb(record.values_vector),
      interestsVector: parseJsonb(record.interests_vector),
      lifestyleVector: parseJsonb(record.lifestyle_vector),
      combinedVector: parseJsonb(record.combined_vector),
      calculatedAt: record.vector_calculated_at ? new Date(record.vector_calculated_at) : new Date(),
      version: record.vector_version || 1,
      completenessScore: record.vector_quality_score || 0,
      reliabilityScore: record.vector_quality_score || 0
    }
  } catch (e) {
    console.error('Failed to deserialize vector:', e)
    return null
  }
}

// ============================================
// 批量向量化
// ============================================

/**
 * 批量将多个用户的问卷答案向量化
 */
export function batchVectorize(
  users: Array<{ userId: string; answers: UserAnswers; personality?: PersonalityProfile }>
): UserVector[] {
  return users.map(user => 
    vectorizeUserFromQuestionnaire(user.userId, {
      answers: user.answers,
      personality: user.personality
    })
  )
}

// ============================================
// 导出
// ============================================

export {
  normalizeTScore,
  normalizeScore,
  answerToScore
}
