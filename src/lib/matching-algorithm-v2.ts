/**
 * 心动投递 - 高级匹配算法 V2
 * 
 * 实现：
 * - 余弦相似度计算
 * - 分层匹配策略
 * - 动态权重调整
 * - 互补性分析
 * - 长期关系预测
 */

import { 
  UserVector, 
  serializeVector, 
  deserializeVector,
  vectorizeUserFromQuestionnaire,
  type QuestionnaireVectorInput
} from './user-vectorization'
import type { UserAnswers } from './match-calculator'
import type { PersonalityProfile } from './scoring-system'

// ============================================
// 类型定义
// ============================================

export interface MatchConfigV2 {
  // 权重配置
  weights: {
    personality: number    // 性格权重
    values: number        // 价值观权重
    interests: number     // 兴趣爱好权重
    lifestyle: number     // 生活方式权重
  }
  
  // 硬过滤配置
  hardFilter: {
    enable: boolean
    minCompatibility: number
  }
  
  // 互补性配置
  complementarity: {
    enable: boolean
    weight: number
    maxBonus: number
  }
  
  // 长期预测配置
  longTermPrediction: {
    enable: boolean
    riskWeight: number
    strengthWeight: number
  }
}

export interface MatchScoreV2 {
  // 用户ID
  userId: string
  matchedUserId: string
  
  // 各维度匹配分 (0-100)
  personalityMatch: number
  valuesMatch: number
  interestsMatch: number
  lifestyleMatch: number
  
  // 互补性加分
  complementarityBonus: number
  
  // 综合分数
  totalScore: number
  
  // 匹配解释
  matchReasons: string[]
  sharedTraits: string[]
  complementaryTraits: string[]
  
  // 长期预测
  longTermStability: number
  satisfactionPrediction: number
  riskFactors: string[]
  strengthFactors: string[]
  
  // 元数据
  metadata: {
    calculatedAt: Date
    version: string
    reliability: number
  }
}

export interface MatchingResultV2 {
  userId: string
  matchedUserId: string
  scores: MatchScoreV2
  analysis: {
    coreDimensions: {
      values: { score: number; similarity: number; interpretation: string }
      personality: { score: number; similarity: number; interpretation: string }
    }
    compatibilityDimensions: {
      lifestyle: { score: number; similarity: number; interpretation: string }
      interests: { score: number; similarity: number; interpretation: string }
    }
  }
  explanation: {
    strengths: string[]
    challenges: string[]
    advice: string[]
  }
}

// ============================================
// 默认配置
// ============================================

const DEFAULT_CONFIG_V2: MatchConfigV2 = {
  weights: {
    personality: 0.25,
    values: 0.30,
    interests: 0.20,
    lifestyle: 0.25
  },
  hardFilter: {
    enable: true,
    minCompatibility: 40
  },
  complementarity: {
    enable: true,
    weight: 0.15,
    maxBonus: 15
  },
  longTermPrediction: {
    enable: true,
    riskWeight: 0.3,
    strengthWeight: 0.2
  }
}

// ============================================
// 核心算法实现
// ============================================

/**
 * 计算两个向量的余弦相似度
 * 返回值范围: -1 到 1，转换为 0-100
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error(`Vector dimensions must match: ${vec1.length} vs ${vec2.length}`)
  }
  
  if (vec1.length === 0) {
    return 50 // 默认值
  }
  
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }
  
  const sqrtNorm1 = Math.sqrt(norm1)
  const sqrtNorm2 = Math.sqrt(norm2)
  
  if (sqrtNorm1 === 0 || sqrtNorm2 === 0) {
    return 50 // 默认值
  }
  
  // 余弦相似度范围 -1 到 1，转换为 0-100
  const similarity = dotProduct / (sqrtNorm1 * sqrtNorm2)
  return Math.round((similarity + 1) / 2 * 100)
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
 * 将距离转换为相似度
 */
export function distanceToSimilarity(distance: number, maxDistance: number = 10): number {
  return Math.max(0, Math.round((1 - distance / maxDistance) * 100))
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
    const weight = weights[key] ?? 0
    weightedSum += similarity * weight
    totalWeight += weight
  })
  
  if (totalWeight === 0) {
    return 50
  }
  
  return Math.round(weightedSum / totalWeight)
}

// ============================================
// 高级匹配器类
// ============================================

export class AdvancedMatcherV2 {
  private config: MatchConfigV2

  constructor(config: Partial<MatchConfigV2> = {}) {
    this.config = { ...DEFAULT_CONFIG_V2, ...config }
  }

  /**
   * 使用预计算的向量进行匹配
   */
  calculateMatchWithVectors(
    user1Vector: UserVector,
    user2Vector: UserVector
  ): MatchScoreV2 {
    // 1. 计算各维度余弦相似度
    const personalitySimilarity = cosineSimilarity(
      user1Vector.personalityVector,
      user2Vector.personalityVector
    )
    
    const valuesSimilarity = cosineSimilarity(
      user1Vector.valuesVector,
      user2Vector.valuesVector
    )
    
    const interestsSimilarity = cosineSimilarity(
      user1Vector.interestsVector,
      user2Vector.interestsVector
    )
    
    const lifestyleSimilarity = cosineSimilarity(
      user1Vector.lifestyleVector,
      user2Vector.lifestyleVector
    )
    
    // 2. 计算加权总分
    const baseScore = weightedSimilarity(
      {
        personality: personalitySimilarity,
        values: valuesSimilarity,
        interests: interestsSimilarity,
        lifestyle: lifestyleSimilarity
      },
      this.config.weights
    )
    
    // 3. 计算互补性加分
    let complementarityBonus = 0
    if (this.config.complementarity.enable) {
      complementarityBonus = this.calculateComplementarityBonus(
        user1Vector,
        user2Vector
      )
    }
    
    // 4. 计算总分
    const totalScore = Math.min(
      100,
      Math.round(baseScore + complementarityBonus * this.config.complementarity.weight)
    )
    
    // 5. 硬过滤检查
    if (this.config.hardFilter.enable && totalScore < this.config.hardFilter.minCompatibility) {
      return this.createFailedScore(user1Vector.userId, user2Vector.userId)
    }
    
    // 6. 生成匹配解释
    const matchReasons = this.generateMatchReasons({
      personality: personalitySimilarity,
      values: valuesSimilarity,
      interests: interestsSimilarity,
      lifestyle: lifestyleSimilarity
    })
    
    const sharedTraits = this.findSharedTraits(user1Vector, user2Vector)
    const complementaryTraits = this.findComplementaryTraits(user1Vector, user2Vector)
    
    // 7. 长期预测
    const longTerm = this.predictLongTerm(
      user1Vector,
      user2Vector,
      personalitySimilarity,
      valuesSimilarity
    )
    
    return {
      userId: user1Vector.userId,
      matchedUserId: user2Vector.userId,
      personalityMatch: personalitySimilarity,
      valuesMatch: valuesSimilarity,
      interestsMatch: interestsSimilarity,
      lifestyleMatch: lifestyleSimilarity,
      complementarityBonus,
      totalScore,
      matchReasons,
      sharedTraits,
      complementaryTraits,
      longTermStability: longTerm.stability,
      satisfactionPrediction: longTerm.satisfaction,
      riskFactors: longTerm.risks,
      strengthFactors: longTerm.strengths,
      metadata: {
        calculatedAt: new Date(),
        version: '2.0',
        reliability: Math.min(
          user1Vector.reliabilityScore,
          user2Vector.reliabilityScore
        )
      }
    }
  }

  /**
   * 使用问卷答案进行匹配（自动向量化）
   */
  calculateMatchWithAnswers(
    user1Answers: UserAnswers,
    user2Answers: UserAnswers,
    user1Id: string,
    user2Id: string,
    user1Personality?: PersonalityProfile,
    user2Personality?: PersonalityProfile
  ): MatchScoreV2 {
    // 自动向量化
    const user1Vector = vectorizeUserFromQuestionnaire(user1Id, {
      answers: user1Answers,
      personality: user1Personality
    })
    
    const user2Vector = vectorizeUserFromQuestionnaire(user2Id, {
      answers: user2Answers,
      personality: user2Personality
    })
    
    return this.calculateMatchWithVectors(user1Vector, user2Vector)
  }

  /**
   * 计算互补性加分
   */
  private calculateComplementarityBonus(
    user1: UserVector,
    user2: UserVector
  ): number {
    let bonus = 0
    
    // 外向-内向互补 (索引2是外向性)
    const ext1 = user1.personalityVector[2] ?? 0.5
    const ext2 = user2.personalityVector[2] ?? 0.5
    const extDiff = Math.abs(ext1 - ext2)
    
    // 适度外向-内向差异是互补的
    if (extDiff > 0.3 && extDiff < 0.7) {
      const avgExt = (ext1 + ext2) / 2
      // 中等外向的人和外向/内向的人组合更好
      if (avgExt >= 0.3 && avgExt <= 0.7) {
        bonus += 8
      }
    }
    
    // 神经质互补 (索引4是神经质，越低越稳定)
    const neu1 = user1.personalityVector[4] ?? 0.5
    const neu2 = user2.personalityVector[4] ?? 0.5
    
    // 一方情绪稳定可以平衡另一方
    if ((neu1 < 0.4 && neu2 > 0.5) || (neu2 < 0.4 && neu1 > 0.5)) {
      bonus += 5
    }
    
    // 开放性互补 (一方开放，一方稳健)
    const opn1 = user1.personalityVector[0] ?? 0.5
    const opn2 = user2.personalityVector[0] ?? 0.5
    if (Math.abs(opn1 - opn2) > 0.4) {
      bonus += 3
    }
    
    return Math.min(this.config.complementarity.maxBonus, bonus)
  }

  /**
   * 生成匹配理由
   */
  private generateMatchReasons(similarities: {
    personality: number
    values: number
    interests: number
    lifestyle: number
  }): string[] {
    const reasons: string[] = []
    
    // 价值观匹配
    if (similarities.values >= 80) {
      reasons.push('💑 价值观高度契合')
    } else if (similarities.values >= 65) {
      reasons.push('💕 价值观相近')
    }
    
    // 性格匹配
    if (similarities.personality >= 80) {
      reasons.push('🎭 性格非常合拍')
    } else if (similarities.personality >= 65) {
      reasons.push('🌟 性格互补')
    }
    
    // 兴趣匹配
    if (similarities.interests >= 70) {
      reasons.push('🎨 有很多共同兴趣')
    } else if (similarities.interests >= 50) {
      reasons.push('🔍 兴趣有交集')
    }
    
    // 生活方式
    if (similarities.lifestyle >= 75) {
      reasons.push('🏠 生活节奏相似')
    } else if (similarities.lifestyle >= 55) {
      reasons.push('🚶 生活方式较合拍')
    }
    
    // 综合评价
    const avgScore = (
      similarities.personality +
      similarities.values +
      similarities.interests +
      similarities.lifestyle
    ) / 4
    
    if (avgScore >= 75 && reasons.length < 3) {
      reasons.push('✨ 整体匹配度很高')
    } else if (avgScore >= 60 && reasons.length === 0) {
      reasons.push('💭 值得进一步了解')
    }
    
    return reasons.slice(0, 4)
  }

  /**
   * 找出共同特质
   */
  private findSharedTraits(user1: UserVector, user2: UserVector): string[] {
    const traits: string[] = []
    
    // 性格特质
    const personalityNames = ['开放', '尽责', '外向', '友善', '稳定']
    for (let i = 0; i < 5; i++) {
      const v1 = user1.personalityVector[i] ?? 0.5
      const v2 = user2.personalityVector[i] ?? 0.5
      
      // 神经质是反向的
      const val1 = i === 4 ? 1 - v1 : v1
      const val2 = i === 4 ? 1 - v2 : v2
      
      if (val1 > 0.6 && val2 > 0.6) {
        traits.push(personalityNames[i])
      }
    }
    
    // 价值观特质
    const valuesNames = ['成就', '安全', '自由', '传统', '仁慈']
    for (let i = 0; i < 5; i++) {
      const v1 = user1.valuesVector[i] ?? 0.5
      const v2 = user2.valuesVector[i] ?? 0.5
      
      if (v1 > 0.6 && v2 > 0.6) {
        traits.push(valuesNames[i])
      }
    }
    
    return traits.slice(0, 5)
  }

  /**
   * 找出互补特质
   */
  private findComplementaryTraits(user1: UserVector, user2: UserVector): string[] {
    const traits: string[] = []
    
    // 外向-内向互补
    const ext1 = user1.personalityVector[2] ?? 0.5
    const ext2 = user2.personalityVector[2] ?? 0.5
    if (ext1 > 0.6 && ext2 < 0.4) {
      traits.push('外向带动内向')
    } else if (ext1 < 0.4 && ext2 > 0.6) {
      traits.push('内向带动外向')
    }
    
    // 理性-感性互补
    const agr1 = user1.personalityVector[3] ?? 0.5
    const agr2 = user2.personalityVector[3] ?? 0.5
    if (Math.abs(agr1 - agr2) > 0.3) {
      traits.push('理性与感性互补')
    }
    
    return traits
  }

  /**
   * 长期关系预测
   */
  private predictLongTerm(
    user1: UserVector,
    user2: UserVector,
    personalitySim: number,
    valuesSim: number
  ): {
    stability: number
    satisfaction: number
    risks: string[]
    strengths: string[]
  } {
    let stability = 70
    let satisfaction = 65
    const risks: string[] = []
    const strengths: string[] = []
    
    // 价值观相似度对稳定性的影响
    if (valuesSim >= 80) {
      stability += 15
      strengths.push('价值观一致，关系基础稳固')
    } else if (valuesSim < 50) {
      stability -= 10
      risks.push('价值观差异可能导致冲突')
    }
    
    // 性格相似度影响
    if (personalitySim >= 75) {
      stability += 10
      satisfaction += 10
      strengths.push('性格合拍，相处融洽')
    }
    
    // 神经质影响
    const neu1 = user1.personalityVector[4] ?? 0.5
    const neu2 = user2.personalityVector[4] ?? 0.5
    if (neu1 > 0.7 || neu2 > 0.7) {
      stability -= 8
      risks.push('一方情绪波动可能影响关系')
    } else if (neu1 < 0.4 && neu2 < 0.4) {
      stability += 8
      strengths.push('双方情绪稳定')
    }
    
    // 向量质量影响
    const avgQuality = (user1.completenessScore + user2.completenessScore) / 2
    if (avgQuality >= 80) {
      satisfaction += 5
    } else if (avgQuality < 50) {
      satisfaction -= 5
    }
    
    return {
      stability: Math.max(0, Math.min(100, stability)),
      satisfaction: Math.max(0, Math.min(100, satisfaction)),
      risks: risks.slice(0, 3),
      strengths: strengths.slice(0, 3)
    }
  }

  /**
   * 创建失败分数
   */
  private createFailedScore(user1Id: string, user2Id: string): MatchScoreV2 {
    return {
      userId: user1Id,
      matchedUserId: user2Id,
      personalityMatch: 0,
      valuesMatch: 0,
      interestsMatch: 0,
      lifestyleMatch: 0,
      complementarityBonus: 0,
      totalScore: 0,
      matchReasons: ['匹配度未达标'],
      sharedTraits: [],
      complementaryTraits: [],
      longTermStability: 0,
      satisfactionPrediction: 0,
      riskFactors: ['综合匹配度过低'],
      strengthFactors: [],
      metadata: {
        calculatedAt: new Date(),
        version: '2.0',
        reliability: 0
      }
    }
  }
}

// ============================================
// 便捷函数
// ============================================

/**
 * 快速计算两个用户的匹配度
 */
export function calculateMatchV2(
  user1Answers: UserAnswers,
  user2Answers: UserAnswers,
  user1Id: string,
  user2Id: string
): MatchScoreV2 {
  const matcher = new AdvancedMatcherV2()
  return matcher.calculateMatchWithAnswers(
    user1Answers,
    user2Answers,
    user1Id,
    user2Id
  )
}

/**
 * 批量匹配
 */
export function batchMatchV2(
  currentUserAnswers: UserAnswers,
  currentUserId: string,
  candidates: Array<{ userId: string; answers: UserAnswers }>,
  config?: Partial<MatchConfigV2>
): MatchScoreV2[] {
  const matcher = new AdvancedMatcherV2(config)
  
  const results = candidates
    .map(candidate => 
      matcher.calculateMatchWithAnswers(
        currentUserAnswers,
        candidate.answers,
        currentUserId,
        candidate.userId
      )
    )
    .filter(r => r.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore)
  
  return results
}

/**
 * 使用预存向量批量匹配
 */
export function batchMatchWithVectors(
  currentUserVector: UserVector,
  candidateVectors: UserVector[],
  config?: Partial<MatchConfigV2>
): MatchScoreV2[] {
  const matcher = new AdvancedMatcherV2(config)
  
  return candidateVectors
    .map(candidate => 
      matcher.calculateMatchWithVectors(currentUserVector, candidate)
    )
    .filter(r => r.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore)
}

// ============================================
// 导出
// ============================================

export {
  DEFAULT_CONFIG_V2
}
