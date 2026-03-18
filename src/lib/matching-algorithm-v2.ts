/**
 * 心动投递 - 高级匹配算法 V2
 * 
 * 分层匹配策略 + 动态权重 + 互补性分析 + 长期关系预测
 */

import { ExtractedFeatures } from './feature-engineering-v2'
import { PersonalityProfile } from './scoring-system'

// ============================================
// 类型定义
// ============================================

export interface MatchConfigV2 {
  // 硬过滤配置
  hardFilter: {
    enableDealbreakerFilter: boolean
    dealbreakerMatchThreshold: number // 底线匹配阈值
  }
  
  // 动态权重配置
  dynamicWeights: {
    enable: boolean
    personalizationStrength: number // 个性化程度 0-1
  }
  
  // 互补性配置
  complementarity: {
    enable: boolean
    weight: number // 互补性加分权重
    maxBonus: number // 最大加分
  }
  
  // 长期关系预测
  longTermPrediction: {
    enable: boolean
    riskWeight: number // 风险因子权重
    strengthWeight: number // 优势因子权重
  }
}

export interface MatchingResult {
  // 基础匹配信息
  userId: string
  matchedUserId: string
  
  // 分层匹配分数
  scores: {
    hardFilter: 'passed' | 'failed'
    coreMatch: number // 价值观+性格
    compatibilityMatch: number // 生活方式+兴趣
    complementarityBonus: number // 互补性加分
    longTermPotential: number // 长期潜力
    totalScore: number // 综合分数
  }
  
  // 详细分析
  analysis: {
    // 核心维度匹配
    coreDimensions: {
      values: DimensionMatchDetail
      personality: DimensionMatchDetail
    }
    
    // 兼容性维度
    compatibilityDimensions: {
      lifestyle: DimensionMatchDetail
      interests: DimensionMatchDetail
      family: DimensionMatchDetail
    }
    
    // 互补性分析
    complementarity: {
      traits: ComplementaryTrait[]
      totalBonus: number
    }
    
    // 长期关系预测
    longTermPrediction: {
      riskFactors: RiskFactor[]
      strengthFactors: StrengthFactor[]
      stabilityScore: number
      predictedSatisfaction: number
    }
  }
  
  // 匹配解释
  explanation: {
    strengths: string[] // 为什么匹配
    challenges: string[] // 潜在挑战
    advice: string[] // 建议
  }
  
  // 元数据
  metadata: {
    calculatedAt: Date
    version: string
    reliability: number
  }
}

export interface DimensionMatchDetail {
  score: number
  similarity: number
  complementarity?: number
  traits: {
    name: string
    userValue: number
    matchedUserValue: number
    match: 'similar' | 'complementary' | 'neutral' | 'conflict'
    importance: 'high' | 'medium' | 'low'
  }[]
  interpretation: string
}

export interface ComplementaryTrait {
  trait: string
  user1Value: number
  user2Value: number
  complementarityType: 'balance' | 'growth' | 'support'
  bonus: number
  reason: string
}

export interface RiskFactor {
  factor: string
  severity: 'low' | 'medium' | 'high'
  probability: number
  description: string
  mitigation: string
}

export interface StrengthFactor {
  factor: string
  impact: 'moderate' | 'strong' | 'very_strong'
  probability: number
  description: string
}

// ============================================
// 默认配置
// ============================================

const DEFAULT_CONFIG_V2: MatchConfigV2 = {
  hardFilter: {
    enableDealbreakerFilter: true,
    dealbreakerMatchThreshold: 0.8
  },
  dynamicWeights: {
    enable: true,
    personalizationStrength: 0.3
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
// 核心匹配器类
// ============================================

export class AdvancedMatcherV2 {
  private config: MatchConfigV2

  constructor(config: Partial<MatchConfigV2> = {}) {
    this.config = { ...DEFAULT_CONFIG_V2, ...config }
  }

  /**
   * 计算完整匹配结果
   */
  calculateMatch(
    user1Profile: {
      personality: PersonalityProfile
      features: ExtractedFeatures
      answers: any
    },
    user2Profile: {
      personality: PersonalityProfile
      features: ExtractedFeatures
      answers: any
    }
  ): MatchingResult {
    // 第一层：硬过滤
    const hardFilterResult = this.applyHardFilter(user1Profile, user2Profile)
    
    if (hardFilterResult === 'failed') {
      return this.createFailedMatchResult(user1Profile, user2Profile)
    }

    // 第二层：核心维度匹配
    const coreMatch = this.calculateCoreMatch(user1Profile, user2Profile)

    // 第三层：兼容性匹配
    const compatibilityMatch = this.calculateCompatibilityMatch(user1Profile, user2Profile)

    // 第四层：互补性分析
    const complementarity = this.analyzeComplementarity(user1Profile, user2Profile)

    // 长期关系预测
    const longTermPrediction = this.predictLongTermPotential(user1Profile, user2Profile)

    // 计算总分
    const totalScore = this.calculateTotalScore({
      coreMatch: coreMatch.totalScore,
      compatibilityMatch: compatibilityMatch.totalScore,
      complementarityBonus: complementarity.totalBonus,
      longTermPotential: longTermPrediction.stabilityScore
    })

    // 生成解释
    const explanation = this.generateExplanation(
      coreMatch,
      compatibilityMatch,
      complementarity,
      longTermPrediction
    )

    return {
      userId: 'user1',
      matchedUserId: 'user2',
      scores: {
        hardFilter: hardFilterResult,
        coreMatch: coreMatch.totalScore,
        compatibilityMatch: compatibilityMatch.totalScore,
        complementarityBonus: complementarity.totalBonus,
        longTermPotential: longTermPrediction.stabilityScore,
        totalScore
      },
      analysis: {
        coreDimensions: {
          values: coreMatch.values,
          personality: coreMatch.personality
        },
        compatibilityDimensions: {
          lifestyle: compatibilityMatch.lifestyle,
          interests: compatibilityMatch.interests,
          family: compatibilityMatch.family
        },
        complementarity,
        longTermPrediction
      },
      explanation,
      metadata: {
        calculatedAt: new Date(),
        version: '2.0',
        reliability: Math.min(
          user1Profile.features.reliability,
          user2Profile.features.reliability
        )
      }
    }
  }

  // ============================================
  // 第一层：硬过滤
  // ============================================

  private applyHardFilter(
    user1: any,
    user2: any
  ): 'passed' | 'failed' {
    if (!this.config.hardFilter.enableDealbreakerFilter) {
      return 'passed'
    }

    // 检查底线冲突
    const dealbreakers1 = this.extractDealbreakers(user1.answers)
    const dealbreakers2 = this.extractDealbreakers(user2.answers)

    // 检查是否触发对方底线
    const triggers1 = this.checkDealbreakerTriggers(dealbreakers1, user2.answers)
    const triggers2 = this.checkDealbreakerTriggers(dealbreakers2, user1.answers)

    // 如果有任何底线冲突，过滤掉
    if (triggers1.length > 0 || triggers2.length > 0) {
      return 'failed'
    }

    return 'passed'
  }

  private extractDealbreakers(answers: any): string[] {
    const dealbreakers: string[] = []

    // 从底线问题中提取
    const dealbreakerQ = answers.find((a: any) => 
      a.dimension === 'dealbreaker' || 
      a.measuresTrait?.includes('dealbreaker')
    )

    if (dealbreakerQ?.answer?.values) {
      dealbreakers.push(...dealbreakerQ.answer.values)
    }

    return dealbreakers
  }

  private checkDealbreakerTriggers(dealbreakers: string[], targetAnswers: any): string[] {
    const triggers: string[] = []

    // 检查目标是否触发底线
    // 例如：底线是"不接受抽烟"，检查目标是否抽烟
    
    dealbreakers.forEach(db => {
      switch (db) {
        case 'A': // 不接受抽烟
          // 检查是否有抽烟标志
          const smokeQ = targetAnswers.find((a: any) => 
            a.questionText?.includes('抽烟')
          )
          if (smokeQ?.answer?.smokes) {
            triggers.push('吸烟')
          }
          break
        // ... 其他底线检查
      }
    })

    return triggers
  }

  // ============================================
  // 第二层：核心维度匹配
  // ============================================

  private calculateCoreMatch(
    user1: any,
    user2: any
  ): {
    totalScore: number
    values: DimensionMatchDetail
    personality: DimensionMatchDetail
  } {
    // 价值观匹配（最重要）
    const valuesMatch = this.matchValuesDimension(user1, user2)

    // 性格匹配
    const personalityMatch = this.matchPersonalityDimension(user1, user2)

    // 计算加权总分
    const weights = this.getDynamicWeights(user1, user2)
    const totalScore = (
      valuesMatch.score * weights.values +
      personalityMatch.score * weights.personality
    )

    return {
      totalScore,
      values: valuesMatch,
      personality: personalityMatch
    }
  }

  /**
   * 价值观维度匹配
   */
  private matchValuesDimension(user1: any, user2: any): DimensionMatchDetail {
    const traits: DimensionMatchDetail['traits'] = []
    
    // 核心价值观匹配
    const coreValues1 = user1.features.explicit['values_mean'] || 50
    const coreValues2 = user2.features.explicit['values_mean'] || 50
    
    traits.push({
      name: '核心价值观',
      userValue: coreValues1,
      matchedUserValue: coreValues2,
      match: this.judgeValueMatch(coreValues1, coreValues2),
      importance: 'high'
    })

    // 金钱观匹配
    const moneyView1 = user1.features.explicit['values_money'] || 50
    const moneyView2 = user2.features.explicit['values_money'] || 50
    
    traits.push({
      name: '金钱观',
      userValue: moneyView1,
      matchedUserValue: moneyView2,
      match: this.judgeValueMatch(moneyView1, moneyView2),
      importance: 'high'
    })

    // 家庭观匹配
    const familyView1 = user1.features.explicit['values_family'] || 50
    const familyView2 = user2.features.explicit['values_family'] || 50
    
    traits.push({
      name: '家庭观',
      userValue: familyView1,
      matchedUserValue: familyView2,
      match: this.judgeValueMatch(familyView1, familyView2),
      importance: 'high'
    })

    // 计算相似度
    const similarity = this.calculateSimilarity(
      [coreValues1, moneyView1, familyView1],
      [coreValues2, moneyView2, familyView2]
    )

    // 生成解释
    const interpretation = this.generateValuesInterpretation(traits, similarity)

    return {
      score: similarity,
      similarity,
      traits,
      interpretation
    }
  }

  /**
   * 性格维度匹配
   */
  private matchPersonalityDimension(user1: any, user2: any): DimensionMatchDetail {
    const traits: DimensionMatchDetail['traits'] = []

    // 大五人格匹配
    const p1 = user1.personality
    const p2 = user2.personality

    // 开放性 - 相似更好
    traits.push({
      name: '开放性',
      userValue: p1.openness.normalizedScore,
      matchedUserValue: p2.openness.normalizedScore,
      match: this.judgePersonalityMatch('openness', 
        p1.openness.normalizedScore, 
        p2.openness.normalizedScore
      ),
      importance: 'medium'
    })

    // 尽责性 - 相似更好
    traits.push({
      name: '尽责性',
      userValue: p1.conscientiousness.normalizedScore,
      matchedUserValue: p2.conscientiousness.normalizedScore,
      match: this.judgePersonalityMatch('conscientiousness',
        p1.conscientiousness.normalizedScore,
        p2.conscientiousness.normalizedScore
      ),
      importance: 'high'
    })

    // 外向性 - 可以互补
    traits.push({
      name: '外向性',
      userValue: p1.extraversion.normalizedScore,
      matchedUserValue: p2.extraversion.normalizedScore,
      match: this.judgePersonalityMatch('extraversion',
        p1.extraversion.normalizedScore,
        p2.extraversion.normalizedScore
      ),
      importance: 'medium'
    })

    // 宜人性 - 都高更好
    traits.push({
      name: '宜人性',
      userValue: p1.agreeableness.normalizedScore,
      matchedUserValue: p2.agreeableness.normalizedScore,
      match: this.judgePersonalityMatch('agreeableness',
        p1.agreeableness.normalizedScore,
        p2.agreeableness.normalizedScore
      ),
      importance: 'high'
    })

    // 神经质 - 都低更好
    traits.push({
      name: '情绪稳定性',
      userValue: 100 - p1.neuroticism.normalizedScore, // 反向
      matchedUserValue: 100 - p2.neuroticism.normalizedScore,
      match: this.judgePersonalityMatch('neuroticism',
        p1.neuroticism.normalizedScore,
        p2.neuroticism.normalizedScore
      ),
      importance: 'high'
    })

    // 依恋风格匹配
    traits.push({
      name: '依恋风格',
      userValue: this.attachmentToScore(p1.attachmentStyle),
      matchedUserValue: this.attachmentToScore(p2.attachmentStyle),
      match: this.judgeAttachmentMatch(p1.attachmentStyle, p2.attachmentStyle),
      importance: 'high'
    })

    // 计算总分
    const score = this.calculatePersonalityScore(traits)

    const interpretation = this.generatePersonalityInterpretation(traits, p1, p2)

    return {
      score,
      similarity: score,
      traits,
      interpretation
    }
  }

  // ============================================
  // 第三层：兼容性匹配
  // ============================================

  private calculateCompatibilityMatch(
    user1: any,
    user2: any
  ): {
    totalScore: number
    lifestyle: DimensionMatchDetail
    interests: DimensionMatchDetail
    family: DimensionMatchDetail
  } {
    const lifestyle = this.matchLifestyleDimension(user1, user2)
    const interests = this.matchInterestsDimension(user1, user2)
    const family = this.matchFamilyDimension(user1, user2)

    const weights = this.getDynamicWeights(user1, user2)
    const totalScore = (
      lifestyle.score * weights.lifestyle +
      interests.score * weights.interests +
      family.score * weights.family
    )

    return { totalScore, lifestyle, interests, family }
  }

  private matchLifestyleDimension(user1: any, user2: any): DimensionMatchDetail {
    const traits: DimensionMatchDetail['traits'] = []

    // 作息时间
    const sleep1 = user1.features.explicit['lifestyle_sleep'] || 50
    const sleep2 = user2.features.explicit['lifestyle_sleep'] || 50
    
    traits.push({
      name: '作息习惯',
      userValue: sleep1,
      matchedUserValue: sleep2,
      match: this.judgeLifestyleMatch('sleep', sleep1, sleep2),
      importance: 'medium'
    })

    // 社交能量
    const social1 = user1.features.behavioral?.socialEnergy || 50
    const social2 = user2.features.behavioral?.socialEnergy || 50
    
    traits.push({
      name: '社交能量',
      userValue: social1,
      matchedUserValue: social2,
      match: this.judgeLifestyleMatch('social', social1, social2),
      importance: 'low'
    })

    // 消费观
    const spend1 = user1.features.explicit['lifestyle_spending'] || 50
    const spend2 = user2.features.explicit['lifestyle_spending'] || 50
    
    traits.push({
      name: '消费观',
      userValue: spend1,
      matchedUserValue: spend2,
      match: this.judgeLifestyleMatch('spending', spend1, spend2),
      importance: 'high'
    })

    const similarity = this.calculateSimilarity(
      traits.map(t => t.userValue),
      traits.map(t => t.matchedUserValue)
    )

    return {
      score: similarity,
      similarity,
      traits,
      interpretation: this.generateLifestyleInterpretation(traits)
    }
  }

  private matchInterestsDimension(user1: any, user2: any): DimensionMatchDetail {
    // 兴趣匹配使用 Jaccard 相似度
    const interests1 = user1.features.implicit?.['interests'] || []
    const interests2 = user2.features.implicit?.['interests'] || []

    const set1 = new Set(interests1)
    const set2 = new Set(interests2)
    
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)))
    const union = new Set([...Array.from(set1), ...Array.from(set2)])
    
    const similarity = union.size > 0 ? intersection.size / union.size : 0.5

    return {
      score: similarity * 100,
      similarity: similarity * 100,
      traits: [],
      interpretation: similarity > 0.6 
        ? '有很多共同兴趣，相处不会无聊' 
        : '兴趣有差异，可以互相探索新领域'
    }
  }

  private matchFamilyDimension(user1: any, user2: any): DimensionMatchDetail {
    const traits: DimensionMatchDetail['traits'] = []

    // 婚姻期待
    const marriage1 = user1.features.explicit['family_marriage'] || 50
    const marriage2 = user2.features.explicit['family_marriage'] || 50
    
    traits.push({
      name: '婚姻期待',
      userValue: marriage1,
      matchedUserValue: marriage2,
      match: this.judgeValueMatch(marriage1, marriage2),
      importance: 'high'
    })

    // 孩子观念
    const kids1 = user1.features.explicit['family_kids'] || 50
    const kids2 = user2.features.explicit['family_kids'] || 50
    
    traits.push({
      name: '孩子观念',
      userValue: kids1,
      matchedUserValue: kids2,
      match: this.judgeValueMatch(kids1, kids2),
      importance: 'high'
    })

    const similarity = this.calculateSimilarity(
      [marriage1, kids1],
      [marriage2, kids2]
    )

    return {
      score: similarity,
      similarity,
      traits,
      interpretation: this.generateFamilyInterpretation(traits)
    }
  }

  // ============================================
  // 第四层：互补性分析
  // ============================================

  private analyzeComplementarity(
    user1: any,
    user2: any
  ): {
    traits: ComplementaryTrait[]
    totalBonus: number
  } {
    if (!this.config.complementarity.enable) {
      return { traits: [], totalBonus: 0 }
    }

    const traits: ComplementaryTrait[] = []

    // 外向-内向互补
    const ext1 = user1.personality.extraversion.normalizedScore
    const ext2 = user2.personality.extraversion.normalizedScore
    
    if (Math.abs(ext1 - ext2) > 30) {
      const highExt = ext1 > ext2 ? 'user1' : 'user2'
      const lowExt = highExt === 'user1' ? 'user2' : 'user1'
      
      traits.push({
        trait: '外向-内向',
        user1Value: ext1,
        user2Value: ext2,
        complementarityType: 'balance',
        bonus: 10,
        reason: `${highExt === 'user1' ? '你' : 'TA'}可以带动${lowExt === 'user1' ? '你' : 'TA'}社交，而${lowExt === 'user1' ? '你' : 'TA'}能让${highExt === 'user1' ? '你' : 'TA'}学会安静享受生活`
      })
    }

    // 理性-感性互补
    const agr1 = user1.personality.agreeableness.normalizedScore
    const agr2 = user2.personality.agreeableness.normalizedScore
    
    if (Math.abs(agr1 - agr2) > 25) {
      traits.push({
        trait: '理性-感性',
        user1Value: agr1,
        user2Value: agr2,
        complementarityType: 'growth',
        bonus: 8,
        reason: '理性与感性的结合，可以互相学习'
      })
    }

    // 焦虑型-安全型互补
    const att1 = user1.personality.attachmentStyle
    const att2 = user2.personality.attachmentStyle
    
    if (
      (att1 === 'anxious' && att2 === 'secure') ||
      (att1 === 'secure' && att2 === 'anxious')
    ) {
      traits.push({
        trait: '依恋风格',
        user1Value: this.attachmentToScore(att1),
        user2Value: this.attachmentToScore(att2),
        complementarityType: 'support',
        bonus: 12,
        reason: '安全型可以给焦虑型提供稳定的安全感'
      })
    }

    // 计算总加分
    const totalBonus = Math.min(
      this.config.complementarity.maxBonus,
      traits.reduce((sum, t) => sum + t.bonus, 0)
    )

    return { traits, totalBonus }
  }

  // ============================================
  // 长期关系预测
  // ============================================

  private predictLongTermPotential(
    user1: any,
    user2: any
  ): {
    riskFactors: RiskFactor[]
    strengthFactors: StrengthFactor[]
    stabilityScore: number
    predictedSatisfaction: number
  } {
    const riskFactors: RiskFactor[] = []
    const strengthFactors: StrengthFactor[] = []

    const p1 = user1.personality
    const p2 = user2.personality

    // 风险因子分析
    
    // 1. 双高神经质 = 高冲突风险
    if (p1.neuroticism.normalizedScore > 60 && p2.neuroticism.normalizedScore > 60) {
      riskFactors.push({
        factor: '双高神经质',
        severity: 'high',
        probability: 0.7,
        description: '双方都容易情绪波动，可能产生冲突循环',
        mitigation: '建议学习情绪管理技巧，建立冷静期机制'
      })
    }

    // 2. 低宜人性组合
    if (p1.agreeableness.normalizedScore < 40 && p2.agreeableness.normalizedScore < 40) {
      riskFactors.push({
        factor: '低宜人性组合',
        severity: 'medium',
        probability: 0.6,
        description: '双方都可能比较固执，协商成本较高',
        mitigation: '学习妥协技巧，建立明确的沟通规则'
      })
    }

    // 3. 依恋类型冲突
    if (
      (p1.attachmentStyle === 'anxious' && p2.attachmentStyle === 'avoidant') ||
      (p1.attachmentStyle === 'avoidant' && p2.attachmentStyle === 'anxious')
    ) {
      riskFactors.push({
        factor: '焦虑-回避型依恋',
        severity: 'high',
        probability: 0.65,
        description: '一方追求亲密，另一方需要空间，可能形成追逐-逃避模式',
        mitigation: '理解彼此的依恋需求，建立安全感'
      })
    }

    // 优势因子分析
    
    // 1. 双高宜人性
    if (p1.agreeableness.normalizedScore > 60 && p2.agreeableness.normalizedScore > 60) {
      strengthFactors.push({
        factor: '双高宜人性',
        impact: 'very_strong',
        probability: 0.8,
        description: '双方都善于理解和包容，关系和谐度高'
      })
    }

    // 2. 价值观高度一致
    const valuesSimilarity = this.calculateValuesSimilarity(user1, user2)
    if (valuesSimilarity > 80) {
      strengthFactors.push({
        factor: '价值观高度一致',
        impact: 'very_strong',
        probability: 0.85,
        description: '核心价值观念一致，关系稳定性强'
      })
    }

    // 3. 安全型依恋组合
    if (p1.attachmentStyle === 'secure' && p2.attachmentStyle === 'secure') {
      strengthFactors.push({
        factor: '双安全型依恋',
        impact: 'very_strong',
        probability: 0.9,
        description: '双方都有健康的依恋模式，关系稳定'
      })
    }

    // 4. 情绪稳定组合
    if (p1.neuroticism.normalizedScore < 40 && p2.neuroticism.normalizedScore < 40) {
      strengthFactors.push({
        factor: '双高情绪稳定',
        impact: 'strong',
        probability: 0.75,
        description: '双方都情绪稳定，冲突概率低'
      })
    }

    // 计算稳定性分数
    const stabilityScore = this.calculateStabilityScore(
      riskFactors,
      strengthFactors,
      p1,
      p2
    )

    // 预测满意度
    const predictedSatisfaction = this.predictSatisfaction(
      riskFactors,
      strengthFactors
    )

    return {
      riskFactors,
      strengthFactors,
      stabilityScore,
      predictedSatisfaction
    }
  }

  private calculateStabilityScore(
    risks: RiskFactor[],
    strengths: StrengthFactor[],
    p1: any,
    p2: any
  ): number {
    let baseScore = 70 // 基础分

    // 风险扣分
    risks.forEach(r => {
      const deduction = r.probability * (r.severity === 'high' ? 15 : r.severity === 'medium' ? 10 : 5)
      baseScore -= deduction
    })

    // 优势加分
    strengths.forEach(s => {
      const addition = s.probability * (s.impact === 'very_strong' ? 15 : s.impact === 'strong' ? 10 : 5)
      baseScore += addition
    })

    return Math.max(0, Math.min(100, baseScore))
  }

  private predictSatisfaction(
    risks: RiskFactor[],
    strengths: StrengthFactor[]
  ): number {
    // 类似稳定性计算，但权重不同
    let baseScore = 65

    risks.forEach(r => {
      const deduction = r.probability * (r.severity === 'high' ? 12 : r.severity === 'medium' ? 8 : 4)
      baseScore -= deduction
    })

    strengths.forEach(s => {
      const addition = s.probability * (s.impact === 'very_strong' ? 12 : s.impact === 'strong' ? 8 : 4)
      baseScore += addition
    })

    return Math.max(0, Math.min(100, baseScore))
  }

  // ============================================
  // 总分计算
  // ============================================

  private calculateTotalScore(scores: {
    coreMatch: number
    compatibilityMatch: number
    complementarityBonus: number
    longTermPotential: number
  }): number {
    const weights = {
      core: 0.40, // 核心维度最重要
      compatibility: 0.25,
      complementarity: 0.15,
      longTerm: 0.20
    }

    return (
      scores.coreMatch * weights.core +
      scores.compatibilityMatch * weights.compatibility +
      scores.complementarityBonus +
      scores.longTermPotential * weights.longTerm
    )
  }

  // ============================================
  // 解释生成
  // ============================================

  private generateExplanation(
    core: any,
    compatibility: any,
    complementarity: any,
    longTerm: any
  ): {
    strengths: string[]
    challenges: string[]
    advice: string[]
  } {
    const strengths: string[] = []
    const challenges: string[] = []
    const advice: string[] = []

    // 从核心维度提取优势
    if (core.values.score > 75) {
      strengths.push('价值观高度契合，这是关系稳定的重要基础')
    }
    if (core.personality.traits.some((t: any) => t.match === 'similar' && t.importance === 'high')) {
      strengths.push('核心性格特质相似，相处会比较轻松')
    }

    // 从互补性提取优势
    complementarity.traits.forEach((t: ComplementaryTrait) => {
      strengths.push(t.reason)
    })

    // 从长期预测提取优势
    longTerm.strengthFactors.forEach((s: StrengthFactor) => {
      strengths.push(s.description)
    })

    // 提取挑战
    longTerm.riskFactors.forEach((r: RiskFactor) => {
      challenges.push(r.description)
      advice.push(r.mitigation)
    })

    // 添加通用建议
    if (challenges.length === 0) {
      advice.push('这是一对潜力很大的组合，建议多沟通，珍惜彼此')
    }

    return { strengths, challenges, advice }
  }

  // ============================================
  // 辅助函数
  // ============================================

  private getDynamicWeights(user1: any, user2: any): Record<string, number> {
    // 基础权重
    const baseWeights = {
      values: 0.30,
      personality: 0.20,
      lifestyle: 0.15,
      interests: 0.10,
      family: 0.15
    }

    if (!this.config.dynamicWeights.enable) {
      return baseWeights
    }

    // 根据用户特征动态调整
    const adjusted = { ...baseWeights }

    // 如果用户家庭观念重，提高家庭维度权重
    if (user1.features.explicit['family_mean'] > 60) {
      adjusted.family *= 1.2
    }

    // 如果用户价值观强度高，提高价值观权重
    if (user1.features.implicit['values_consistency'] > 70) {
      adjusted.values *= 1.2
    }

    // 归一化
    const total = Object.values(adjusted).reduce((sum, w) => sum + w, 0)
    Object.keys(adjusted).forEach(k => {
      (adjusted as any)[k] /= total
    })

    return adjusted
  }

  private calculateSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 50
    
    const diff = vec1.reduce((sum, v, i) => sum + Math.abs(v - vec2[i]), 0)
    const maxDiff = vec1.length * 100
    
    return Math.max(0, 100 - (diff / maxDiff) * 100)
  }

  private judgeValueMatch(v1: number, v2: number): 'similar' | 'complementary' | 'neutral' | 'conflict' {
    const diff = Math.abs(v1 - v2)
    if (diff < 15) return 'similar'
    if (diff > 40) return 'conflict'
    return 'neutral'
  }

  private judgePersonalityMatch(
    trait: string,
    v1: number,
    v2: number
  ): 'similar' | 'complementary' | 'neutral' | 'conflict' {
    const diff = Math.abs(v1 - v2)

    // 不同特质有不同的最佳匹配方式
    switch (trait) {
      case 'openness':
      case 'conscientiousness':
        // 相似更好
        if (diff < 20) return 'similar'
        if (diff > 50) return 'conflict'
        return 'neutral'
      
      case 'extraversion':
        // 可以互补
        if (diff < 20) return 'similar'
        if (diff > 40 && diff < 60) return 'complementary'
        return 'neutral'
      
      case 'agreeableness':
        // 都高最好
        if (v1 > 60 && v2 > 60) return 'similar'
        if (v1 < 40 && v2 < 40) return 'conflict'
        return 'neutral'
      
      case 'neuroticism':
        // 都低最好
        if (v1 < 40 && v2 < 40) return 'similar'
        if (v1 > 60 && v2 > 60) return 'conflict'
        return 'neutral'
      
      default:
        if (diff < 20) return 'similar'
        return 'neutral'
    }
  }

  private judgeLifestyleMatch(
    type: string,
    v1: number,
    v2: number
  ): 'similar' | 'complementary' | 'neutral' | 'conflict' {
    const diff = Math.abs(v1 - v2)
    
    // 生活方式大多需要相似
    if (diff < 20) return 'similar'
    if (diff > 50) return 'conflict'
    return 'neutral'
  }

  private judgeAttachmentMatch(
    att1: string,
    att2: string
  ): 'similar' | 'complementary' | 'neutral' | 'conflict' {
    // 依恋类型匹配矩阵
    const matrix: Record<string, Record<string, 'similar' | 'complementary' | 'neutral' | 'conflict'>> = {
      secure: {
        secure: 'similar',
        anxious: 'complementary',
        avoidant: 'complementary',
        fearful_avoidant: 'neutral'
      },
      anxious: {
        secure: 'complementary',
        anxious: 'conflict',
        avoidant: 'conflict',
        fearful_avoidant: 'conflict'
      },
      avoidant: {
        secure: 'complementary',
        anxious: 'conflict',
        avoidant: 'neutral',
        fearful_avoidant: 'conflict'
      },
      fearful_avoidant: {
        secure: 'neutral',
        anxious: 'conflict',
        avoidant: 'conflict',
        fearful_avoidant: 'conflict'
      }
    }

    return matrix[att1]?.[att2] || 'neutral'
  }

  private attachmentToScore(style: string): number {
    const scores: Record<string, number> = {
      secure: 90,
      anxious: 50,
      avoidant: 40,
      fearful_avoidant: 30
    }
    return scores[style] || 50
  }

  private calculateExtraversionComplementarity(ext1: number, ext2: number): number {
    const diff = Math.abs(ext1 - ext2)
    if (diff > 40 && diff < 60) {
      return 10 // 适度互补加分
    }
    return 0
  }

  private calculatePersonalityScore(traits: DimensionMatchDetail['traits']): number {
    const weights: Record<string, number> = {
      high: 1.5,
      medium: 1.0,
      low: 0.5
    }

    let totalScore = 0
    let totalWeight = 0

    traits.forEach(trait => {
      const weight = weights[trait.importance] || 1
      let traitScore = 50

      switch (trait.match) {
        case 'similar':
          traitScore = 85
          break
        case 'complementary':
          traitScore = 75
          break
        case 'neutral':
          traitScore = 60
          break
        case 'conflict':
          traitScore = 30
          break
      }

      totalScore += traitScore * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? totalScore / totalWeight : 50
  }

  private calculateValuesSimilarity(user1: any, user2: any): number {
    // 计算价值观整体相似度
    const valuesKeys = ['values_mean', 'values_money', 'values_family', 'values_career']
    
    const vec1 = valuesKeys.map(k => user1.features.explicit[k] || 50)
    const vec2 = valuesKeys.map(k => user2.features.explicit[k] || 50)
    
    return this.calculateSimilarity(vec1, vec2)
  }

  // ... 更多解释生成函数
  private generateValuesInterpretation(
    traits: DimensionMatchDetail['traits'],
    similarity: number
  ): string {
    if (similarity > 80) {
      return '价值观高度一致，对人生重要事物的看法很接近'
    } else if (similarity > 60) {
      return '价值观基本一致，有一些差异但可以互相理解'
    } else {
      return '价值观存在较大差异，需要深入沟通确认是否可以接受'
    }
  }

  private generatePersonalityInterpretation(
    traits: DimensionMatchDetail['traits'],
    p1: any,
    p2: any
  ): string {
    const parts: string[] = []

    // 检查互补性
    const extraversionDiff = Math.abs(p1.extraversion.normalizedScore - p2.extraversion.normalizedScore)
    if (extraversionDiff > 30) {
      parts.push('外向-内向的互补可能带来化学反应')
    }

    // 检查风险
    if (p1.neuroticism.normalizedScore > 60 && p2.neuroticism.normalizedScore > 60) {
      parts.push('双方都容易情绪波动，需要学习情绪管理')
    }

    // 检查优势
    if (p1.agreeableness.normalizedScore > 60 && p2.agreeableness.normalizedScore > 60) {
      parts.push('双方都善解人意，关系和谐度预期较高')
    }

    return parts.join('。') || '性格匹配度良好'
  }

  private generateLifestyleInterpretation(traits: DimensionMatchDetail['traits']): string {
    const conflicts = traits.filter(t => t.match === 'conflict')
    
    if (conflicts.length > 0) {
      return `生活方式有些差异：${conflicts.map(c => c.name).join('、')}，需要磨合`
    }
    
    return '生活方式比较合拍，日常相处会很舒服'
  }

  private generateFamilyInterpretation(traits: DimensionMatchDetail['traits']): string {
    const conflicts = traits.filter(t => t.match === 'conflict')
    
    if (conflicts.length > 0) {
      return '家庭观念有较大差异，建议深入沟通'
    }
    
    return '家庭观念比较一致，对未来期待相似'
  }

  private createFailedMatchResult(user1: any, user2: any): MatchingResult {
    return {
      userId: 'user1',
      matchedUserId: 'user2',
      scores: {
        hardFilter: 'failed',
        coreMatch: 0,
        compatibilityMatch: 0,
        complementarityBonus: 0,
        longTermPotential: 0,
        totalScore: 0
      },
      analysis: {
        coreDimensions: {
          values: { score: 0, similarity: 0, traits: [], interpretation: '' },
          personality: { score: 0, similarity: 0, traits: [], interpretation: '' }
        },
        compatibilityDimensions: {
          lifestyle: { score: 0, similarity: 0, traits: [], interpretation: '' },
          interests: { score: 0, similarity: 0, traits: [], interpretation: '' },
          family: { score: 0, similarity: 0, traits: [], interpretation: '' }
        },
        complementarity: { traits: [], totalBonus: 0 },
        longTermPrediction: {
          riskFactors: [],
          strengthFactors: [],
          stabilityScore: 0,
          predictedSatisfaction: 0
        }
      },
      explanation: {
        strengths: [],
        challenges: ['存在底线冲突'],
        advice: ['此匹配可能不适合']
      },
      metadata: {
        calculatedAt: new Date(),
        version: '2.0',
        reliability: Math.min(user1.features.reliability, user2.features.reliability)
      }
    }
  }
}

// ============================================
// 导出
// ============================================

export function calculateAdvancedMatch(
  user1Profile: any,
  user2Profile: any,
  config?: Partial<MatchConfigV2>
): MatchingResult {
  const matcher = new AdvancedMatcherV2(config)
  return matcher.calculateMatch(user1Profile, user2Profile)
}
