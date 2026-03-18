/**
 * 心动投递 - 用户向量化与匹配算法
 * 
 * 将用户画像转化为高维向量，用于快速相似度计算
 */

import { PersonalityProfile, DimensionScore } from './scoring-system'

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
  
  // 元数据
  calculatedAt: Date
  version: number
}

export interface MatchScore {
  userId: string
  matchedUserId: string
  
  // 各维度匹配分
  personalityMatch: number
  valuesMatch: number
  interestsMatch: number
  lifestyleMatch: number
  
  // 综合匹配分
  totalScore: number
  
  // 匹配理由
  matchReasons: string[]
  sharedTraits: string[]
  complementaryTraits: string[]
}

export interface MatchConfig {
  weights: {
    personality: number
    values: number
    interests: number
    lifestyle: number
  }
  thresholds: {
    minScore: number
    minDimensionScore: number
  }
  preferences: {
    allowComplementarity: boolean
    complementarityWeight: number
  }
}

// ============================================
// 默认匹配配置
// ============================================

const DEFAULT_MATCH_CONFIG: MatchConfig = {
  weights: {
    personality: 0.25,
    values: 0.30,
    interests: 0.20,
    lifestyle: 0.25
  },
  thresholds: {
    minScore: 60,
    minDimensionScore: 40
  },
  preferences: {
    allowComplementarity: true,
    complementarityWeight: 0.15
  }
}

// ============================================
// 用户向量化
// ============================================

/**
 * 将用户画像转化为向量
 */
export function vectorizeUser(
  userId: string,
  profile: PersonalityProfile,
  interests: Record<string, any>,
  lifestyle: Record<string, any>
): UserVector {
  // 1. 性格向量 (30维)
  const personalityVector = buildPersonalityVector(profile)
  
  // 2. 价值观向量 (10维)
  const valuesVector = buildValuesVector(profile.valuesProfile)
  
  // 3. 兴趣向量 (50维)
  const interestsVector = buildInterestsVector(interests)
  
  // 4. 生活方式向量 (20维)
  const lifestyleVector = buildLifestyleVector(lifestyle)
  
  // 5. 组合向量 (110维)
  const combinedVector = [
    ...personalityVector,
    ...valuesVector,
    ...interestsVector,
    ...lifestyleVector
  ]
  
  return {
    userId,
    personalityVector,
    valuesVector,
    interestsVector,
    lifestyleVector,
    combinedVector,
    calculatedAt: new Date(),
    version: 1
  }
}

/**
 * 构建性格向量 (30维)
 * 
 * 结构：
 * - 大五人格5个维度 (5维)
 * - 大五人格30个子维度 (30维)
 * - 依恋风格 (2维)
 * 
 * 实际使用前30维
 */
function buildPersonalityVector(profile: PersonalityProfile): number[] {
  const vector: number[] = []
  
  // 1. 大五人格主维度 (归一化到 0-1)
  vector.push(normalizeTScore(profile.openness.normalizedScore))
  vector.push(normalizeTScore(profile.conscientiousness.normalizedScore))
  vector.push(normalizeTScore(profile.extraversion.normalizedScore))
  vector.push(normalizeTScore(profile.agreeableness.normalizedScore))
  vector.push(normalizeTScore(profile.neuroticism.normalizedScore))
  
  // 2. 大五人格子维度 (25维)
  const facets = [
    ...Object.values(profile.openness.facets || {}),
    ...Object.values(profile.conscientiousness.facets || {}),
    ...Object.values(profile.extraversion.facets || {}),
    ...Object.values(profile.agreeableness.facets || {}),
    ...Object.values(profile.neuroticism.facets || {})
  ]
  
  // 补齐或截断到25维
  while (facets.length < 25) {
    facets.push(50) // 默认均值
  }
  
  facets.slice(0, 25).forEach(score => {
    vector.push(normalizeTScore(score as number))
  })
  
  return vector
}

/**
 * 构建价值观向量 (10维)
 * 
 * 基于Schwartz价值观理论
 */
function buildValuesVector(valuesProfile: Record<string, number>): number[] {
  const dimensions = [
    'power',
    'achievement',
    'hedonism',
    'stimulation',
    'self_direction',
    'universalism',
    'benevolence',
    'tradition',
    'conformity',
    'security'
  ]
  
  return dimensions.map(dim => {
    const score = valuesProfile[dim] || 50
    return normalizeTScore(score)
  })
}

/**
 * 构建兴趣向量 (50维)
 * 
 * 使用预定义的兴趣类别
 */
function buildInterestsVector(interests: Record<string, any>): number[] {
  // 预定义50个兴趣类别
  const interestCategories = [
    // 文化艺术 (10)
    'reading', 'writing', 'painting', 'music', 'theater',
    'photography', 'film', 'dance', 'design', 'craft',
    
    // 运动健身 (10)
    'running', 'swimming', 'yoga', 'gym', 'basketball',
    'football', 'tennis', 'hiking', 'cycling', 'skiing',
    
    // 生活方式 (10)
    'cooking', 'baking', 'travel', 'coffee', 'wine',
    'gardening', 'pets', 'cars', 'fashion', 'beauty',
    
    // 科技游戏 (10)
    'gaming', 'programming', 'gadgets', 'anime', 'board_games',
    'puzzles', 'science', 'astronomy', 'ai', 'crypto',
    
    // 社交公益 (10)
    'volunteering', 'networking', 'teaching', 'mentoring', 'politics',
    'environment', 'religion', 'meditation', 'psychology', 'philosophy'
  ]
  
  return interestCategories.map(category => {
    const interest = interests[category]
    if (!interest) return 0
    
    // 归一化兴趣强度 (假设强度为1-5)
    return Math.min(1, (interest.level || 0) / 5)
  })
}

/**
 * 构建生活方式向量 (20维)
 */
function buildLifestyleVector(lifestyle: Record<string, any>): number[] {
  const vector: number[] = []
  
  // 作息类型 (3维 one-hot)
  const chronotype = lifestyle.chronotype || 'intermediate'
  vector.push(chronotype === 'morning' ? 1 : 0)
  vector.push(chronotype === 'intermediate' ? 1 : 0)
  vector.push(chronotype === 'evening' ? 1 : 0)
  
  // 社交频率 (4维 one-hot)
  const socialFreq = lifestyle.socialFrequency || 'moderate'
  vector.push(socialFreq === 'very_active' ? 1 : 0)
  vector.push(socialFreq === 'active' ? 1 : 0)
  vector.push(socialFreq === 'moderate' ? 1 : 0)
  vector.push(socialFreq === 'quiet' ? 1 : 0)
  
  // 生活节奏 (3维 one-hot)
  const pace = lifestyle.pacePreference || 'moderate'
  vector.push(pace === 'fast' ? 1 : 0)
  vector.push(pace === 'moderate' ? 1 : 0)
  vector.push(pace === 'slow' ? 1 : 0)
  
  // 消费风格 (3维 one-hot)
  const spending = lifestyle.spendingStyle || 'balanced'
  vector.push(spending === 'frugal' ? 1 : 0)
  vector.push(spending === 'balanced' ? 1 : 0)
  vector.push(spending === 'generous' ? 1 : 0)
  
  // 连续变量 (7维)
  vector.push(normalizeScore(lifestyle.socialEnergy || 50, 0, 100))
  vector.push(normalizeScore(lifestyle.healthConsciousness || 50, 0, 100))
  vector.push(normalizeScore(lifestyle.savingPriority || 50, 0, 100))
  vector.push(normalizeScore(lifestyle.routinePreference || 50, 0, 100)) // 结构化程度
  vector.push(normalizeScore(lifestyle.adventurousness || 50, 0, 100))
  vector.push(normalizeScore(lifestyle.familyOrientation || 50, 0, 100))
  vector.push(normalizeScore(lifestyle.careerAmbition || 50, 0, 100))
  
  return vector
}

// ============================================
// 相似度计算
// ============================================

/**
 * 计算余弦相似度
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vector dimensions must match')
  }
  
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }
  
  if (norm1 === 0 || norm2 === 0) {
    return 0
  }
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

/**
 * 计算欧氏距离
 */
export function euclideanDistance(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vector dimensions must match')
  }
  
  let sumSquares = 0
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i]
    sumSquares += diff * diff
  }
  
  return Math.sqrt(sumSquares)
}

/**
 * 将欧氏距离转换为相似度 (0-1)
 */
export function distanceToSimilarity(distance: number, maxDistance: number = 2): number {
  // 假设最大距离为 2 (因为向量已归一化到 0-1)
  return Math.max(0, 1 - distance / maxDistance)
}

/**
 * 计算加权相似度
 */
export function weightedSimilarity(
  similarities: Record<string, number>,
  weights: Record<string, number>
): number {
  let totalWeight = 0
  let weightedSum = 0
  
  Object.entries(similarities).forEach(([key, similarity]) => {
    const weight = weights[key] || 0
    weightedSum += similarity * weight
    totalWeight += weight
  })
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

// ============================================
// 匹配算法
// ============================================

/**
 * 计算两个用户的匹配分数
 */
export function calculateMatchScore(
  user1: UserVector,
  user2: UserVector,
  config: MatchConfig = DEFAULT_MATCH_CONFIG
): MatchScore {
  // 1. 计算各维度相似度
  const personalitySimilarity = cosineSimilarity(
    user1.personalityVector,
    user2.personalityVector
  )
  
  const valuesSimilarity = cosineSimilarity(
    user1.valuesVector,
    user2.valuesVector
  )
  
  const interestsSimilarity = cosineSimilarity(
    user1.interestsVector,
    user2.interestsVector
  )
  
  const lifestyleSimilarity = cosineSimilarity(
    user1.lifestyleVector,
    user2.lifestyleVector
  )
  
  // 2. 计算互补性加分
  let complementarityBonus = 0
  if (config.preferences.allowComplementarity) {
    complementarityBonus = calculateComplementarityBonus(user1, user2)
  }
  
  // 3. 计算加权总分
  const baseScore = weightedSimilarity(
    {
      personality: personalitySimilarity,
      values: valuesSimilarity,
      interests: interestsSimilarity,
      lifestyle: lifestyleSimilarity
    },
    config.weights
  )
  
  const totalScore = Math.min(1, baseScore + complementarityBonus * config.preferences.complementarityWeight)
  
  // 4. 生成匹配理由
  const matchReasons = generateMatchReasons(
    { personalitySimilarity, valuesSimilarity, interestsSimilarity, lifestyleSimilarity },
    user1,
    user2
  )
  
  // 5. 找出共同特质
  const sharedTraits = findSharedTraits(user1, user2)
  
  // 6. 找出互补特质
  const complementaryTraits = findComplementaryTraits(user1, user2)
  
  return {
    userId: user1.userId,
    matchedUserId: user2.userId,
    personalityMatch: Math.round(personalitySimilarity * 100),
    valuesMatch: Math.round(valuesSimilarity * 100),
    interestsMatch: Math.round(interestsSimilarity * 100),
    lifestyleMatch: Math.round(lifestyleSimilarity * 100),
    totalScore: Math.round(totalScore * 100),
    matchReasons,
    sharedTraits,
    complementaryTraits
  }
}

/**
 * 计算互补性加分
 */
function calculateComplementarityBonus(user1: UserVector, user2: UserVector): number {
  let bonus = 0
  
  // 外向-内向互补
  const extroversion1 = user1.personalityVector[2] // 外向性
  const extroversion2 = user2.personalityVector[2]
  if (Math.abs(extroversion1 - extroversion2) > 0.5) {
    // 一方外向，一方内向
    const avg = (extroversion1 + extroversion2) / 2
    if (avg >= 0.3 && avg <= 0.7) {
      // 适度互补
      bonus += 0.1
    }
  }
  
  // 焦虑-安全型互补
  // 神经质维度
  const neuroticism1 = user1.personalityVector[4]
  const neuroticism2 = user2.personalityVector[4]
  if (neuroticism1 > 0.6 && neuroticism2 < 0.4) {
    // 一方情绪稳定，可以给另一方安全感
    bonus += 0.05
  }
  
  return Math.min(0.15, bonus)
}

/**
 * 生成匹配理由
 */
function generateMatchReasons(
  similarities: {
    personalitySimilarity: number
    valuesSimilarity: number
    interestsSimilarity: number
    lifestyleSimilarity: number
  },
  user1: UserVector,
  user2: UserVector
): string[] {
  const reasons: string[] = []
  
  // 价值观相似
  if (similarities.valuesSimilarity > 0.8) {
    reasons.push('价值观高度契合')
  } else if (similarities.valuesSimilarity > 0.6) {
    reasons.push('价值观相近')
  }
  
  // 性格匹配
  if (similarities.personalitySimilarity > 0.8) {
    reasons.push('性格非常合拍')
  } else if (similarities.personalitySimilarity > 0.6) {
    reasons.push('性格互补')
  }
  
  // 兴趣共同点
  if (similarities.interestsSimilarity > 0.7) {
    reasons.push('有很多共同兴趣')
  }
  
  // 生活节奏
  if (similarities.lifestyleSimilarity > 0.7) {
    reasons.push('生活节奏相似')
  }
  
  // 互补性
  const extroversion1 = user1.personalityVector[2]
  const extroversion2 = user2.personalityVector[2]
  if (Math.abs(extroversion1 - extroversion2) > 0.5) {
    reasons.push('性格互补，可能产生化学反应')
  }
  
  // 默认理由
  if (reasons.length === 0) {
    reasons.push('综合匹配度较高')
  }
  
  return reasons.slice(0, 5)
}

/**
 * 找出共同特质
 */
function findSharedTraits(user1: UserVector, user2: UserVector): string[] {
  const traits: string[] = []
  
  // 性格特质
  const personalityTraits = [
    { index: 0, name: '开放', threshold: 0.6 },
    { index: 1, name: '尽责', threshold: 0.6 },
    { index: 2, name: '外向', threshold: 0.6 },
    { index: 3, name: '友善', threshold: 0.6 },
    { index: 4, name: '情绪稳定', threshold: 0.4 } // 注意神经质是反向的
  ]
  
  personalityTraits.forEach(trait => {
    const val1 = trait.index === 4 ? 1 - user1.personalityVector[trait.index] : user1.personalityVector[trait.index]
    const val2 = trait.index === 4 ? 1 - user2.personalityVector[trait.index] : user2.personalityVector[trait.index]
    
    if (val1 > trait.threshold && val2 > trait.threshold) {
      traits.push(trait.name)
    }
  })
  
  // 价值观特质
  const valuesDimensions = [
    '重视家庭', '追求成就', '重视自由', '重视安全'
  ]
  
  // 简化处理
  if (user1.valuesVector[6] > 0.6 && user2.valuesVector[6] > 0.6) {
    traits.push('重视家庭')
  }
  if (user1.valuesVector[1] > 0.6 && user2.valuesVector[1] > 0.6) {
    traits.push('追求成就')
  }
  if (user1.valuesVector[4] > 0.6 && user2.valuesVector[4] > 0.6) {
    traits.push('重视自由')
  }
  if (user1.valuesVector[9] > 0.6 && user2.valuesVector[9] > 0.6) {
    traits.push('重视安全')
  }
  
  return traits
}

/**
 * 找出互补特质
 */
function findComplementaryTraits(user1: UserVector, user2: UserVector): string[] {
  const traits: string[] = []
  
  // 外向-内向互补
  const ext1 = user1.personalityVector[2]
  const ext2 = user2.personalityVector[2]
  if (ext1 > 0.6 && ext2 < 0.4) {
    traits.push('外向↔内向')
  } else if (ext1 < 0.4 && ext2 > 0.6) {
    traits.push('内向↔外向')
  }
  
  // 理性-感性互补
  const agr1 = user1.personalityVector[3]
  const agr2 = user2.personalityVector[3]
  if (Math.abs(agr1 - agr2) > 0.4) {
    traits.push('理性↔感性')
  }
  
  return traits
}

// ============================================
// 辅助函数
// ============================================

/**
 * T分数归一化到 0-1
 */
function normalizeTScore(tScore: number): number {
  // T分数范围约20-80，归一化到0-1
  return Math.max(0, Math.min(1, (tScore - 20) / 60))
}

/**
 * 普通分数归一化
 */
function normalizeScore(score: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (score - min) / (max - min)))
}

// ============================================
// 批量匹配
// ============================================

/**
 * 为用户批量匹配
 */
export function batchMatch(
  user: UserVector,
  candidates: UserVector[],
  config: MatchConfig = DEFAULT_MATCH_CONFIG,
  topN: number = 10
): MatchScore[] {
  // 计算所有候选人的匹配分数
  const scores = candidates.map(candidate => 
    calculateMatchScore(user, candidate, config)
  )
  
  // 过滤低分候选人
  const filtered = scores.filter(s => s.totalScore >= config.thresholds.minScore)
  
  // 排序
  filtered.sort((a, b) => b.totalScore - a.totalScore)
  
  // 返回Top N
  return filtered.slice(0, topN)
}

// ============================================
// 导出
// ============================================

export {
  DEFAULT_MATCH_CONFIG,
  normalizeTScore,
  normalizeScore
}
