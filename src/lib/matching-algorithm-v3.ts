/**
 * 心动投递 - 高级匹配算法 V3 (优化版)
 * 
 * 优化内容：
 * 1. 年龄匹配 - 非线性衰减算法
 * 2. 兴趣匹配 - 分类权重 + 深度匹配
 * 3. 价值观匹配 - 提高权重 + 多维度分析
 * 4. 地理位置 - 同城加分 + 距离衰减
 * 5. 性格互补 - 全面的互补性分析
 * 6. 生活方式兼容性 - 多维度综合评估
 */

import { ExtractedFeatures } from './feature-engineering-v2'
import { PersonalityProfile } from './scoring-system'

// ============================================
// 类型定义
// ============================================

export interface MatchConfigV3 {
  // 硬过滤配置
  hardFilter: {
    enableDealbreakerFilter: boolean
    dealbreakerMatchThreshold: number
    enableAgeFilter: boolean
    ageRangeMax: number // 最大年龄差
  }
  
  // 动态权重配置
  dynamicWeights: {
    enable: boolean
    personalizationStrength: number
  }
  
  // 年龄匹配配置
  ageMatching: {
    optimalAgeGap: number // 最佳年龄差
    ageDecayRate: number // 衰减速率
    enableGenderBasedGap: boolean // 是否启用性别差异
  }
  
  // 地理位置配置
  locationMatching: {
    enable: boolean
    sameCityBonus: number // 同城加分
    maxDistanceKm: number // 最大距离
    distanceDecayRate: number // 距离衰减率
  }
  
  // 互补性配置
  complementarity: {
    enable: boolean
    weight: number
    maxBonus: number
  }
  
  // 长期关系预测
  longTermPrediction: {
    enable: boolean
    riskWeight: number
    strengthWeight: number
  }
}

export interface MatchingResultV3 {
  userId: string
  matchedUserId: string
  
  scores: {
    hardFilter: 'passed' | 'failed'
    coreMatch: number
    compatibilityMatch: number
    complementarityBonus: number
    locationBonus: number
    longTermPotential: number
    totalScore: number
  }
  
  analysis: {
    coreDimensions: {
      values: DimensionMatchDetailV3
      personality: DimensionMatchDetailV3
    }
    
    compatibilityDimensions: {
      lifestyle: DimensionMatchDetailV3
      interests: InterestMatchDetail
      family: DimensionMatchDetailV3
      age: AgeMatchDetail
      location: LocationMatchDetail
    }
    
    complementarity: ComplementarityAnalysisV3
    
    longTermPrediction: LongTermPredictionV3
  }
  
  explanation: {
    strengths: string[]
    challenges: string[]
    advice: string[]
  }
  
  metadata: {
    calculatedAt: Date
    version: string
    reliability: number
    optimizationFlags: string[]
  }
}

export interface DimensionMatchDetailV3 {
  score: number
  similarity: number
  complementarity?: number
  traits: TraitDetail[]
  interpretation: string
}

export interface TraitDetail {
  name: string
  userValue: number
  matchedUserValue: number
  match: 'similar' | 'complementary' | 'neutral' | 'conflict'
  importance: 'critical' | 'high' | 'medium' | 'low'
  weight: number
}

export interface InterestMatchDetail {
  score: number
  similarity: number
  categories: InterestCategoryMatch[]
  sharedInterests: string[]
  complementaryInterests: string[]
  interpretation: string
}

export interface InterestCategoryMatch {
  category: string
  userInterests: string[]
  matchedUserInterests: string[]
  similarity: number
  weight: number
  categoryScore: number
}

export interface AgeMatchDetail {
  ageGap: number
  idealGap: number
  score: number
  interpretation: string
  genderBasedOptimalGap?: number
}

export interface LocationMatchDetail {
  sameCity: boolean
  distanceKm?: number
  score: number
  interpretation: string
}

export interface ComplementarityAnalysisV3 {
  traits: ComplementaryTraitV3[]
  totalBonus: number
  balanceScore: number // 平衡性分数
  growthPotential: number // 成长潜力
  supportSystem: number // 支持系统
}

export interface ComplementaryTraitV3 {
  trait: string
  category: 'personality' | 'values' | 'lifestyle' | 'skills' | 'attachment'
  user1Value: number
  user2Value: number
  complementarityType: 'balance' | 'growth' | 'support' | 'synergy'
  bonus: number
  reason: string
  confidence: number
}

export interface LongTermPredictionV3 {
  riskFactors: RiskFactorV3[]
  strengthFactors: StrengthFactorV3[]
  stabilityScore: number
  predictedSatisfaction: number
  recommendedFocus: string[]
}

export interface RiskFactorV3 {
  factor: string
  category: 'personality' | 'values' | 'lifestyle' | 'attachment'
  severity: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  description: string
  mitigation: string
  impactOnScore: number
}

export interface StrengthFactorV3 {
  factor: string
  category: 'personality' | 'values' | 'lifestyle' | 'attachment'
  impact: 'moderate' | 'strong' | 'very_strong' | 'exceptional'
  probability: number
  description: string
  impactOnScore: number
}

// ============================================
// 默认配置 (优化版)
// ============================================

const DEFAULT_CONFIG_V3: MatchConfigV3 = {
  hardFilter: {
    enableDealbreakerFilter: true,
    dealbreakerMatchThreshold: 0.8,
    enableAgeFilter: true,
    ageRangeMax: 15
  },
  dynamicWeights: {
    enable: true,
    personalizationStrength: 0.3
  },
  ageMatching: {
    optimalAgeGap: 2, // 男大女2岁最佳
    ageDecayRate: 0.08,
    enableGenderBasedGap: true
  },
  locationMatching: {
    enable: true,
    sameCityBonus: 5,
    maxDistanceKm: 500,
    distanceDecayRate: 0.02
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
// 权重配置 (优化版 - 提高价值观权重)
// ============================================

const OPTIMIZED_WEIGHTS = {
  // 核心维度 (总权重 45% - 提高价值观权重)
  core: {
    values: 0.28, // 从0.30调整为28%，但在核心维度中占更高比例
    personality: 0.17 // 性格权重略降
  },
  // 兼容性维度 (总权重 30%)
  compatibility: {
    lifestyle: 0.10,
    interests: 0.08, // 兴趣权重略降
    family: 0.12 // 家庭权重提高
  },
  // 其他维度 (总权重 25%)
  other: {
    complementarity: 0.10,
    location: 0.05,
    longTerm: 0.10
  }
}

// ============================================
// 兴趣分类与权重
// ============================================

const INTEREST_CATEGORIES: Record<string, {
  weight: number
  keywords: string[]
  complementaryPairs: string[][]
}> = {
  'outdoor_adventure': {
    weight: 0.15,
    keywords: ['徒步', '爬山', '露营', '骑行', '滑雪', '潜水', '攀岩', '户外', '旅行', '探险'],
    complementaryPairs: []
  },
  'arts_culture': {
    weight: 0.12,
    keywords: ['音乐', '电影', '阅读', '绘画', '摄影', '艺术', '博物馆', '展览', '戏剧', '文学'],
    complementaryPairs: []
  },
  'sports_fitness': {
    weight: 0.12,
    keywords: ['健身', '跑步', '游泳', '瑜伽', '篮球', '羽毛球', '网球', '足球', '运动'],
    complementaryPairs: []
  },
  'social_entertainment': {
    weight: 0.10,
    keywords: ['美食', '烹饪', '游戏', '桌游', 'KTV', '聚会', '酒吧', '咖啡'],
    complementaryPairs: []
  },
  'intellectual_growth': {
    weight: 0.18, // 智力成长类权重较高
    keywords: ['学习', '编程', '写作', '投资', '创业', '心理学', '哲学', '历史', '科学', '研究'],
    complementaryPairs: []
  },
  'creative_hobbies': {
    weight: 0.13,
    keywords: ['手工', 'DIY', '烘焙', '园艺', '宠物', '书法', '乐器', '收藏'],
    complementaryPairs: []
  },
  'spiritual_wellness': {
    weight: 0.20, // 精神健康类权重最高
    keywords: ['冥想', '瑜伽', '信仰', '慈善', '志愿者', '心理咨询', '成长', '读书会'],
    complementaryPairs: []
  }
}

// ============================================
// 性格互补性配置
// ============================================

const PERSONALITY_COMPLEMENTARITY = {
  // 外向-内向：适度互补最佳
  extraversion: {
    idealGapRange: [15, 35], // 理想差距范围
    maxBonus: 12,
    tooSimilarThreshold: 5, // 过于相似阈值
    tooDifferentThreshold: 50 // 过于不同阈值
  },
  // 尽责性：相似更好
  conscientiousness: {
    idealGapRange: [0, 15],
    maxBonus: 5, // 相似加分
    conflictThreshold: 30
  },
  // 宜人性：都高最佳
  agreeableness: {
    bothHighBonus: 15,
    bothLowPenalty: -20,
    complementBonus: 8 // 一高一低可以互补
  },
  // 神经质：都低最佳
  neuroticism: {
    bothLowBonus: 15,
    bothHighPenalty: -25,
    stabilizerBonus: 10 // 一方低可以稳定另一方
  },
  // 开放性：相似更好
  openness: {
    idealGapRange: [0, 20],
    similarBonus: 10
  }
}

// ============================================
// 核心匹配器类 V3
// ============================================

export class AdvancedMatcherV3 {
  private config: MatchConfigV3
  private optimizationFlags: string[] = []

  constructor(config: Partial<MatchConfigV3> = {}) {
    this.config = { ...DEFAULT_CONFIG_V3, ...config }
    this.optimizationFlags.push('v3_optimized')
  }

  /**
   * 计算完整匹配结果
   */
  calculateMatch(
    user1Profile: {
      personality: PersonalityProfile
      features: ExtractedFeatures
      answers: any
      basicInfo?: {
        age?: number
        gender?: 'male' | 'female'
        city?: string
        location?: { lat: number; lng: number }
      }
    },
    user2Profile: {
      personality: PersonalityProfile
      features: ExtractedFeatures
      answers: any
      basicInfo?: {
        age?: number
        gender?: 'male' | 'female'
        city?: string
        location?: { lat: number; lng: number }
      }
    }
  ): MatchingResultV3 {
    this.optimizationFlags = ['v3_optimized']

    // 第一层：硬过滤
    const hardFilterResult = this.applyHardFilterV3(user1Profile, user2Profile)
    
    if (hardFilterResult === 'failed') {
      return this.createFailedMatchResultV3(user1Profile, user2Profile)
    }

    // 第二层：核心维度匹配 (优化版 - 提高价值观权重)
    const coreMatch = this.calculateCoreMatchV3(user1Profile, user2Profile)
    this.optimizationFlags.push('enhanced_values_weight')

    // 第三层：兼容性匹配 (优化版 - 兴趣分类)
    const compatibilityMatch = this.calculateCompatibilityMatchV3(user1Profile, user2Profile)
    this.optimizationFlags.push('categorized_interests')

    // 年龄匹配 (新增 - 非线性衰减)
    const ageMatch = this.calculateAgeMatchV3(
      user1Profile.basicInfo?.age,
      user2Profile.basicInfo?.age,
      user1Profile.basicInfo?.gender,
      user2Profile.basicInfo?.gender
    )
    this.optimizationFlags.push('nonlinear_age_decay')

    // 地理位置匹配 (新增)
    const locationMatch = this.calculateLocationMatchV3(
      user1Profile.basicInfo,
      user2Profile.basicInfo
    )
    this.optimizationFlags.push('location_aware')

    // 第四层：互补性分析 (优化版 - 全面分析)
    const complementarity = this.analyzeComplementarityV3(user1Profile, user2Profile)
    this.optimizationFlags.push('comprehensive_complementarity')

    // 长期关系预测
    const longTermPrediction = this.predictLongTermPotentialV3(user1Profile, user2Profile)

    // 计算总分 (优化版权重)
    const totalScore = this.calculateTotalScoreV3({
      coreMatch: coreMatch.totalScore,
      compatibilityMatch: compatibilityMatch.totalScore,
      complementarityBonus: complementarity.totalBonus,
      locationBonus: locationMatch.score,
      ageScore: ageMatch.score,
      longTermPotential: longTermPrediction.stabilityScore
    })

    // 生成解释
    const explanation = this.generateExplanationV3(
      coreMatch,
      compatibilityMatch,
      complementarity,
      longTermPrediction,
      ageMatch,
      locationMatch
    )

    return {
      userId: 'user1',
      matchedUserId: 'user2',
      scores: {
        hardFilter: hardFilterResult,
        coreMatch: coreMatch.totalScore,
        compatibilityMatch: compatibilityMatch.totalScore,
        complementarityBonus: complementarity.totalBonus,
        locationBonus: locationMatch.score,
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
          family: compatibilityMatch.family,
          age: ageMatch,
          location: locationMatch
        },
        complementarity,
        longTermPrediction
      },
      explanation,
      metadata: {
        calculatedAt: new Date(),
        version: '3.0',
        reliability: Math.min(
          user1Profile.features.reliability,
          user2Profile.features.reliability
        ),
        optimizationFlags: this.optimizationFlags
      }
    }
  }

  // ============================================
  // 第一层：硬过滤 V3 (增加年龄过滤)
  // ============================================

  private applyHardFilterV3(
    user1: any,
    user2: any
  ): 'passed' | 'failed' {
    // 底线过滤
    if (this.config.hardFilter.enableDealbreakerFilter) {
      const dealbreakers1 = this.extractDealbreakers(user1.answers)
      const dealbreakers2 = this.extractDealbreakers(user2.answers)

      const triggers1 = this.checkDealbreakerTriggers(dealbreakers1, user2.answers)
      const triggers2 = this.checkDealbreakerTriggers(dealbreakers2, user1.answers)

      if (triggers1.length > 0 || triggers2.length > 0) {
        return 'failed'
      }
    }

    // 年龄过滤 (新增)
    if (this.config.hardFilter.enableAgeFilter) {
      const age1 = user1.basicInfo?.age
      const age2 = user2.basicInfo?.age
      
      if (age1 && age2) {
        const ageGap = Math.abs(age1 - age2)
        if (ageGap > this.config.hardFilter.ageRangeMax) {
          return 'failed'
        }
      }
    }

    return 'passed'
  }

  // ============================================
  // 年龄匹配 V3 - 非线性衰减算法
  // ============================================

  private calculateAgeMatchV3(
    age1?: number,
    age2?: number,
    gender1?: 'male' | 'female',
    gender2?: 'male' | 'female'
  ): AgeMatchDetail {
    // 如果没有年龄信息，返回默认值
    if (!age1 || !age2) {
      return {
        ageGap: 0,
        idealGap: this.config.ageMatching.optimalAgeGap,
        score: 70,
        interpretation: '年龄信息不完整，使用默认分数'
      }
    }

    const ageGap = age1 - age2 // 正数表示用户1年龄更大
    const absGap = Math.abs(ageGap)

    // 计算最佳年龄差 (考虑性别)
    let idealGap = this.config.ageMatching.optimalAgeGap
    
    if (this.config.ageMatching.enableGenderBasedGap && gender1 && gender2) {
      // 传统模式：男大女2-4岁最佳
      if (gender1 === 'male' && gender2 === 'female') {
        idealGap = 3 // 男大女3岁
      } else if (gender1 === 'female' && gender2 === 'male') {
        idealGap = -3 // 女小男3岁
      }
    }

    // 非线性衰减算法
    // 使用指数衰减：score = 100 * exp(-decay * |gap - idealGap|)
    const decayRate = this.config.ageMatching.ageDecayRate
    const gapFromIdeal = Math.abs(ageGap - idealGap)
    
    // 非线性衰减公式
    // - 差距在理想范围内：高分
    // - 差距超出理想范围：指数衰减
    // - 女大男：额外轻微惩罚 (传统偏好)
    let score = 100 * Math.exp(-decayRate * Math.pow(gapFromIdeal, 1.5))

    // 女大男的额外衰减
    if (gender1 === 'female' && gender2 === 'male' && ageGap > 0) {
      score *= 0.95 // 轻微惩罚
    }

    // 年龄差距过大的额外衰减 (非线性)
    if (absGap > 10) {
      score *= Math.exp(-0.03 * Math.pow(absGap - 10, 1.2))
    }

    score = Math.max(0, Math.min(100, score))

    // 生成解释
    let interpretation = ''
    if (gapFromIdeal <= 2) {
      interpretation = '年龄差距接近理想范围，很匹配'
    } else if (gapFromIdeal <= 5) {
      interpretation = '年龄差距在可接受范围内'
    } else if (absGap <= 8) {
      interpretation = '年龄差距稍大，但可以接受'
    } else {
      interpretation = '年龄差距较大，可能存在代沟'
    }

    return {
      ageGap,
      idealGap,
      score,
      interpretation,
      genderBasedOptimalGap: idealGap
    }
  }

  // ============================================
  // 地理位置匹配 V3
  // ============================================

  private calculateLocationMatchV3(
    info1?: { city?: string; location?: { lat: number; lng: number } },
    info2?: { city?: string; location?: { lat: number; lng: number } }
  ): LocationMatchDetail {
    if (!this.config.locationMatching.enable) {
      return {
        sameCity: false,
        score: 50,
        interpretation: '地理位置匹配未启用'
      }
    }

    // 检查是否同城
    const sameCity = info1?.city && info2?.city && info1.city === info2.city

    if (sameCity) {
      return {
        sameCity: true,
        score: this.config.locationMatching.sameCityBonus,
        interpretation: '同城，见面方便'
      }
    }

    // 如果有精确位置，计算距离
    if (info1?.location && info2?.location) {
      const distanceKm = this.calculateDistance(
        info1.location.lat,
        info1.location.lng,
        info2.location.lat,
        info2.location.lng
      )

      // 距离衰减
      const decayRate = this.config.locationMatching.distanceDecayRate
      let score = 100 * Math.exp(-decayRate * Math.pow(distanceKm / 50, 0.8))
      
      // 超过最大距离，分数归零
      if (distanceKm > this.config.locationMatching.maxDistanceKm) {
        score = 0
      }

      let interpretation = ''
      if (distanceKm <= 10) {
        interpretation = '距离很近，日常见面方便'
      } else if (distanceKm <= 50) {
        interpretation = '同城或临近城市，见面较方便'
      } else if (distanceKm <= 200) {
        interpretation = '省内异地，周末可以见面'
      } else if (distanceKm <= 500) {
        interpretation = '跨省异地，需要更多努力'
      } else {
        interpretation = '距离较远，异地恋挑战较大'
      }

      return {
        sameCity: false,
        distanceKm,
        score: Math.max(0, Math.min(100, score)),
        interpretation
      }
    }

    // 无法确定位置
    return {
      sameCity: false,
      score: 50,
      interpretation: '地理位置信息不完整'
    }
  }

  /**
   * 计算两点距离 (Haversine公式)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // 地球半径(公里)
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // ============================================
  // 核心维度匹配 V3 (提高价值观权重)
  // ============================================

  private calculateCoreMatchV3(
    user1: any,
    user2: any
  ): {
    totalScore: number
    values: DimensionMatchDetailV3
    personality: DimensionMatchDetailV3
  } {
    // 价值观匹配 (权重提高)
    const valuesMatch = this.matchValuesDimensionV3(user1, user2)

    // 性格匹配
    const personalityMatch = this.matchPersonalityDimensionV3(user1, user2)

    // 使用优化后的权重
    const totalScore = (
      valuesMatch.score * OPTIMIZED_WEIGHTS.core.values / (OPTIMIZED_WEIGHTS.core.values + OPTIMIZED_WEIGHTS.core.personality) +
      personalityMatch.score * OPTIMIZED_WEIGHTS.core.personality / (OPTIMIZED_WEIGHTS.core.values + OPTIMIZED_WEIGHTS.core.personality)
    )

    return {
      totalScore,
      values: valuesMatch,
      personality: personalityMatch
    }
  }

  /**
   * 价值观匹配 V3 (多维度分析)
   */
  private matchValuesDimensionV3(user1: any, user2: any): DimensionMatchDetailV3 {
    const traits: TraitDetail[] = []
    
    // 核心价值观 (权重最高)
    const coreValues1 = user1.features.explicit['values_mean'] || 50
    const coreValues2 = user2.features.explicit['values_mean'] || 50
    
    traits.push({
      name: '核心价值观',
      userValue: coreValues1,
      matchedUserValue: coreValues2,
      match: this.judgeValueMatchV3(coreValues1, coreValues2),
      importance: 'critical',
      weight: 1.5
    })

    // 金钱观 (关键匹配因素)
    const moneyView1 = user1.features.explicit['values_money'] || 50
    const moneyView2 = user2.features.explicit['values_money'] || 50
    
    traits.push({
      name: '金钱观',
      userValue: moneyView1,
      matchedUserValue: moneyView2,
      match: this.judgeValueMatchV3(moneyView1, moneyView2),
      importance: 'critical',
      weight: 1.4
    })

    // 家庭观 (关键匹配因素)
    const familyView1 = user1.features.explicit['values_family'] || 50
    const familyView2 = user2.features.explicit['values_family'] || 50
    
    traits.push({
      name: '家庭观',
      userValue: familyView1,
      matchedUserValue: familyView2,
      match: this.judgeValueMatchV3(familyView1, familyView2),
      importance: 'critical',
      weight: 1.4
    })

    // 事业观 (新增)
    const careerView1 = user1.features.explicit['values_career'] || 50
    const careerView2 = user2.features.explicit['values_career'] || 50
    
    traits.push({
      name: '事业观',
      userValue: careerView1,
      matchedUserValue: careerView2,
      match: this.judgeValueMatchV3(careerView1, careerView2),
      importance: 'high',
      weight: 1.2
    })

    // 人生观 (新增)
    const lifeView1 = user1.features.explicit['values_life'] || 50
    const lifeView2 = user2.features.explicit['values_life'] || 50
    
    traits.push({
      name: '人生观',
      userValue: lifeView1,
      matchedUserValue: lifeView2,
      match: this.judgeValueMatchV3(lifeView1, lifeView2),
      importance: 'high',
      weight: 1.1
    })

    // 消费观 (新增)
    const consumption1 = user1.features.explicit['values_consumption'] || 50
    const consumption2 = user2.features.explicit['values_consumption'] || 50
    
    traits.push({
      name: '消费观',
      userValue: consumption1,
      matchedUserValue: consumption2,
      match: this.judgeValueMatchV3(consumption1, consumption2),
      importance: 'high',
      weight: 1.0
    })

    // 计算加权相似度
    const similarity = this.calculateWeightedSimilarity(
      traits.map(t => t.userValue),
      traits.map(t => t.matchedUserValue),
      traits.map(t => t.weight)
    )

    // 检查价值观一致性 (新增)
    const consistency1 = user1.features.implicit?.['values_consistency'] || 50
    const consistency2 = user2.features.implicit?.['values_consistency'] || 50
    
    // 如果双方价值观都很一致，额外加分
    let bonusScore = 0
    if (consistency1 > 70 && consistency2 > 70 && similarity > 70) {
      bonusScore = 5
      this.optimizationFlags.push('values_consistency_bonus')
    }

    const interpretation = this.generateValuesInterpretationV3(traits, similarity)

    return {
      score: Math.min(100, similarity + bonusScore),
      similarity,
      traits,
      interpretation
    }
  }

  /**
   * 性格匹配 V3
   */
  private matchPersonalityDimensionV3(user1: any, user2: any): DimensionMatchDetailV3 {
    const traits: TraitDetail[] = []

    const p1 = user1.personality
    const p2 = user2.personality

    // 大五人格匹配 (更细致的权重)

    // 开放性 - 相似更好，权重中等
    traits.push({
      name: '开放性',
      userValue: p1.openness.normalizedScore,
      matchedUserValue: p2.openness.normalizedScore,
      match: this.judgePersonalityMatchV3('openness', 
        p1.openness.normalizedScore, 
        p2.openness.normalizedScore
      ),
      importance: 'medium',
      weight: 1.0
    })

    // 尽责性 - 相似更好，权重高 (影响生活质量)
    traits.push({
      name: '尽责性',
      userValue: p1.conscientiousness.normalizedScore,
      matchedUserValue: p2.conscientiousness.normalizedScore,
      match: this.judgePersonalityMatchV3('conscientiousness',
        p1.conscientiousness.normalizedScore,
        p2.conscientiousness.normalizedScore
      ),
      importance: 'high',
      weight: 1.3
    })

    // 外向性 - 可以互补，权重中等
    traits.push({
      name: '外向性',
      userValue: p1.extraversion.normalizedScore,
      matchedUserValue: p2.extraversion.normalizedScore,
      match: this.judgePersonalityMatchV3('extraversion',
        p1.extraversion.normalizedScore,
        p2.extraversion.normalizedScore
      ),
      importance: 'medium',
      weight: 1.0
    })

    // 宜人性 - 都高更好，权重最高 (影响关系和谐)
    traits.push({
      name: '宜人性',
      userValue: p1.agreeableness.normalizedScore,
      matchedUserValue: p2.agreeableness.normalizedScore,
      match: this.judgePersonalityMatchV3('agreeableness',
        p1.agreeableness.normalizedScore,
        p2.agreeableness.normalizedScore
      ),
      importance: 'critical',
      weight: 1.5
    })

    // 情绪稳定性 - 都低更好，权重最高 (影响关系稳定)
    traits.push({
      name: '情绪稳定性',
      userValue: 100 - p1.neuroticism.normalizedScore,
      matchedUserValue: 100 - p2.neuroticism.normalizedScore,
      match: this.judgePersonalityMatchV3('neuroticism',
        p1.neuroticism.normalizedScore,
        p2.neuroticism.normalizedScore
      ),
      importance: 'critical',
      weight: 1.5
    })

    // 依恋风格匹配 (关键因素)
    traits.push({
      name: '依恋风格',
      userValue: this.attachmentToScoreV3(p1.attachmentStyle),
      matchedUserValue: this.attachmentToScoreV3(p2.attachmentStyle),
      match: this.judgeAttachmentMatchV3(p1.attachmentStyle, p2.attachmentStyle),
      importance: 'critical',
      weight: 1.6
    })

    // 计算加权分数
    const score = this.calculateWeightedPersonalityScore(traits)

    const interpretation = this.generatePersonalityInterpretationV3(traits, p1, p2)

    return {
      score,
      similarity: score,
      traits,
      interpretation
    }
  }

  // ============================================
  // 兼容性匹配 V3 (兴趣分类)
  // ============================================

  private calculateCompatibilityMatchV3(
    user1: any,
    user2: any
  ): {
    totalScore: number
    lifestyle: DimensionMatchDetailV3
    interests: InterestMatchDetail
    family: DimensionMatchDetailV3
  } {
    const lifestyle = this.matchLifestyleDimensionV3(user1, user2)
    const interests = this.matchInterestsDimensionV3(user1, user2)
    const family = this.matchFamilyDimensionV3(user1, user2)

    // 使用优化后的权重
    const totalWeight = OPTIMIZED_WEIGHTS.compatibility.lifestyle + 
                        OPTIMIZED_WEIGHTS.compatibility.interests +
                        OPTIMIZED_WEIGHTS.compatibility.family

    const totalScore = (
      lifestyle.score * OPTIMIZED_WEIGHTS.compatibility.lifestyle / totalWeight +
      interests.score * OPTIMIZED_WEIGHTS.compatibility.interests / totalWeight +
      family.score * OPTIMIZED_WEIGHTS.compatibility.family / totalWeight
    )

    return { totalScore, lifestyle, interests, family }
  }

  /**
   * 生活方式匹配 V3
   */
  private matchLifestyleDimensionV3(user1: any, user2: any): DimensionMatchDetailV3 {
    const traits: TraitDetail[] = []

    // 作息习惯 (权重高)
    const sleep1 = user1.features.explicit['lifestyle_sleep'] || 50
    const sleep2 = user2.features.explicit['lifestyle_sleep'] || 50
    
    traits.push({
      name: '作息习惯',
      userValue: sleep1,
      matchedUserValue: sleep2,
      match: this.judgeLifestyleMatchV3('sleep', sleep1, sleep2),
      importance: 'high',
      weight: 1.3
    })

    // 社交能量 (权重中)
    const social1 = user1.features.behavioral?.socialEnergy || 50
    const social2 = user2.features.behavioral?.socialEnergy || 50
    
    traits.push({
      name: '社交能量',
      userValue: social1,
      matchedUserValue: social2,
      match: this.judgeLifestyleMatchV3('social', social1, social2),
      importance: 'medium',
      weight: 1.0
    })

    // 消费习惯 (权重高)
    const spend1 = user1.features.explicit['lifestyle_spending'] || 50
    const spend2 = user2.features.explicit['lifestyle_spending'] || 50
    
    traits.push({
      name: '消费习惯',
      userValue: spend1,
      matchedUserValue: spend2,
      match: this.judgeLifestyleMatchV3('spending', spend1, spend2),
      importance: 'high',
      weight: 1.4
    })

    // 生活节奏 (新增)
    const pace1 = user1.features.explicit['lifestyle_pace'] || 50
    const pace2 = user2.features.explicit['lifestyle_pace'] || 50
    
    traits.push({
      name: '生活节奏',
      userValue: pace1,
      matchedUserValue: pace2,
      match: this.judgeLifestyleMatchV3('pace', pace1, pace2),
      importance: 'medium',
      weight: 1.1
    })

    // 卫生习惯 (新增)
    const hygiene1 = user1.features.explicit['lifestyle_hygiene'] || 50
    const hygiene2 = user2.features.explicit['lifestyle_hygiene'] || 50
    
    traits.push({
      name: '卫生习惯',
      userValue: hygiene1,
      matchedUserValue: hygiene2,
      match: this.judgeLifestyleMatchV3('hygiene', hygiene1, hygiene2),
      importance: 'medium',
      weight: 1.0
    })

    const similarity = this.calculateWeightedSimilarity(
      traits.map(t => t.userValue),
      traits.map(t => t.matchedUserValue),
      traits.map(t => t.weight)
    )

    return {
      score: similarity,
      similarity,
      traits,
      interpretation: this.generateLifestyleInterpretationV3(traits)
    }
  }

  /**
   * 兴趣匹配 V3 (分类权重)
   */
  private matchInterestsDimensionV3(user1: any, user2: any): InterestMatchDetail {
    const interests1 = user1.features.implicit?.['interests'] || []
    const interests2 = user2.features.implicit?.['interests'] || []

    const sharedInterests: string[] = []
    const complementaryInterests: string[] = []
    const categories: InterestCategoryMatch[] = []

    // 按分类计算匹配度
    let totalWeightedScore = 0
    let totalWeight = 0

    Object.entries(INTEREST_CATEGORIES).forEach(([category, config]) => {
      const user1CategoryInterests = interests1.filter((i: unknown) => 
        typeof i === 'string' && config.keywords.some(k => i.includes(k))
      ) as string[]
      const user2CategoryInterests = interests2.filter((i: unknown) => 
        typeof i === 'string' && config.keywords.some(k => i.includes(k))
      ) as string[]

      // 计算该分类的相似度
      const set1 = new Set<string>(user1CategoryInterests)
      const set2 = new Set<string>(user2CategoryInterests)
      const set1Array = Array.from(set1)
      const set2Array = Array.from(set2)
      const intersectionArr = set1Array.filter(x => set2.has(x))
      const unionArr = Array.from(new Set([...set1Array, ...set2Array]))
      
      const similarity = unionArr.length > 0 ? intersectionArr.length / unionArr.length : 0.5

      // 收集共同兴趣
      intersectionArr.forEach(i => {
        if (!sharedInterests.includes(i)) {
          sharedInterests.push(i)
        }
      })

      // 收集互补兴趣
      set1Array.forEach(i => {
        if (!set2.has(i) && !complementaryInterests.includes(i)) {
          complementaryInterests.push(i)
        }
      })
      set2Array.forEach(i => {
        if (!set1.has(i) && !complementaryInterests.includes(i)) {
          complementaryInterests.push(i)
        }
      })

      categories.push({
        category,
        userInterests: user1CategoryInterests,
        matchedUserInterests: user2CategoryInterests,
        similarity: similarity * 100,
        weight: config.weight,
        categoryScore: similarity * 100 * config.weight
      })

      totalWeightedScore += similarity * 100 * config.weight
      totalWeight += config.weight
    })

    const score = totalWeight > 0 ? totalWeightedScore / totalWeight : 50

    // 生成解释
    let interpretation = ''
    if (sharedInterests.length >= 5) {
      interpretation = `有很多共同兴趣(${sharedInterests.length}个)，相处不会无聊`
    } else if (sharedInterests.length >= 2) {
      interpretation = `有一些共同兴趣(${sharedInterests.length}个)，可以一起做喜欢的事`
    } else if (complementaryInterests.length > 0) {
      interpretation = '兴趣有差异，可以互相探索新领域'
    } else {
      interpretation = '兴趣信息不够完整，建议多交流'
    }

    return {
      score,
      similarity: score,
      categories,
      sharedInterests,
      complementaryInterests,
      interpretation
    }
  }

  /**
   * 家庭观念匹配 V3
   */
  private matchFamilyDimensionV3(user1: any, user2: any): DimensionMatchDetailV3 {
    const traits: TraitDetail[] = []

    // 婚姻期待 (权重最高)
    const marriage1 = user1.features.explicit['family_marriage'] || 50
    const marriage2 = user2.features.explicit['family_marriage'] || 50
    
    traits.push({
      name: '婚姻期待',
      userValue: marriage1,
      matchedUserValue: marriage2,
      match: this.judgeValueMatchV3(marriage1, marriage2),
      importance: 'critical',
      weight: 1.5
    })

    // 孩子观念 (权重最高)
    const kids1 = user1.features.explicit['family_kids'] || 50
    const kids2 = user2.features.explicit['family_kids'] || 50
    
    traits.push({
      name: '孩子观念',
      userValue: kids1,
      matchedUserValue: kids2,
      match: this.judgeValueMatchV3(kids1, kids2),
      importance: 'critical',
      weight: 1.5
    })

    // 家庭模式 (新增)
    const familyMode1 = user1.features.explicit['family_mode'] || 50
    const familyMode2 = user2.features.explicit['family_mode'] || 50
    
    traits.push({
      name: '家庭模式',
      userValue: familyMode1,
      matchedUserValue: familyMode2,
      match: this.judgeValueMatchV3(familyMode1, familyMode2),
      importance: 'high',
      weight: 1.2
    })

    // 与父母关系 (新增)
    const parents1 = user1.features.explicit['family_parents'] || 50
    const parents2 = user2.features.explicit['family_parents'] || 50
    
    traits.push({
      name: '与父母关系',
      userValue: parents1,
      matchedUserValue: parents2,
      match: this.judgeValueMatchV3(parents1, parents2),
      importance: 'medium',
      weight: 1.0
    })

    const similarity = this.calculateWeightedSimilarity(
      traits.map(t => t.userValue),
      traits.map(t => t.matchedUserValue),
      traits.map(t => t.weight)
    )

    return {
      score: similarity,
      similarity,
      traits,
      interpretation: this.generateFamilyInterpretationV3(traits)
    }
  }

  // ============================================
  // 互补性分析 V3 (全面分析)
  // ============================================

  private analyzeComplementarityV3(
    user1: any,
    user2: any
  ): ComplementarityAnalysisV3 {
    if (!this.config.complementarity.enable) {
      return { 
        traits: [], 
        totalBonus: 0,
        balanceScore: 50,
        growthPotential: 50,
        supportSystem: 50
      }
    }

    const traits: ComplementaryTraitV3[] = []
    const p1 = user1.personality
    const p2 = user2.personality

    let balanceScore = 50
    let growthPotential = 50
    let supportSystem = 50

    // ====== 性格互补 ======
    
    // 1. 外向-内向互补 (优化版)
    const ext1 = p1.extraversion.normalizedScore
    const ext2 = p2.extraversion.normalizedScore
    const extDiff = Math.abs(ext1 - ext2)
    
    if (extDiff >= PERSONALITY_COMPLEMENTARITY.extraversion.idealGapRange[0] &&
        extDiff <= PERSONALITY_COMPLEMENTARITY.extraversion.idealGapRange[1]) {
      const highExt = ext1 > ext2
      traits.push({
        trait: '外向-内向平衡',
        category: 'personality',
        user1Value: ext1,
        user2Value: ext2,
        complementarityType: 'balance',
        bonus: PERSONALITY_COMPLEMENTARITY.extraversion.maxBonus,
        reason: highExt 
          ? '你外向善社交，TA内向喜安静，你们可以互相平衡'
          : 'TA外向善社交，你内向喜安静，你们可以互相平衡',
        confidence: 0.85
      })
      balanceScore += 15
    } else if (extDiff < PERSONALITY_COMPLEMENTARITY.extraversion.tooSimilarThreshold) {
      // 过于相似，没有互补
      balanceScore -= 5
    } else if (extDiff > PERSONALITY_COMPLEMENTARITY.extraversion.tooDifferentThreshold) {
      // 差距过大，可能冲突
      balanceScore -= 10
    }

    // 2. 宜人性互补
    const agr1 = p1.agreeableness.normalizedScore
    const agr2 = p2.agreeableness.normalizedScore
    
    if (agr1 > 70 && agr2 > 70) {
      traits.push({
        trait: '高宜人性组合',
        category: 'personality',
        user1Value: agr1,
        user2Value: agr2,
        complementarityType: 'synergy',
        bonus: PERSONALITY_COMPLEMENTARITY.agreeableness.bothHighBonus,
        reason: '双方都善解人意，关系和谐度高',
        confidence: 0.9
      })
      supportSystem += 20
    } else if (agr1 < 40 && agr2 < 40) {
      traits.push({
        trait: '低宜人性风险',
        category: 'personality',
        user1Value: agr1,
        user2Value: agr2,
        complementarityType: 'growth',
        bonus: -10, // 惩罚
        reason: '双方都可能比较固执，需要学会妥协',
        confidence: 0.8
      })
      supportSystem -= 15
    } else if (Math.abs(agr1 - agr2) > 30) {
      traits.push({
        trait: '宜人性互补',
        category: 'personality',
        user1Value: agr1,
        user2Value: agr2,
        complementarityType: 'support',
        bonus: PERSONALITY_COMPLEMENTARITY.agreeableness.complementBonus,
        reason: '一方温和可以包容另一方的坚持',
        confidence: 0.75
      })
      supportSystem += 10
    }

    // 3. 情绪稳定性互补
    const neu1 = p1.neuroticism.normalizedScore
    const neu2 = p2.neuroticism.normalizedScore
    const stab1 = 100 - neu1
    const stab2 = 100 - neu2
    
    if (neu1 < 35 && neu2 < 35) {
      traits.push({
        trait: '双高情绪稳定',
        category: 'personality',
        user1Value: stab1,
        user2Value: stab2,
        complementarityType: 'synergy',
        bonus: PERSONALITY_COMPLEMENTARITY.neuroticism.bothLowBonus,
        reason: '双方都情绪稳定，关系质量高',
        confidence: 0.9
      })
      balanceScore += 20
      supportSystem += 15
    } else if (neu1 > 65 && neu2 > 65) {
      traits.push({
        trait: '双高神经质风险',
        category: 'personality',
        user1Value: stab1,
        user2Value: stab2,
        complementarityType: 'growth',
        bonus: PERSONALITY_COMPLEMENTARITY.neuroticism.bothHighPenalty,
        reason: '双方都容易情绪波动，需要学习情绪管理',
        confidence: 0.85
      })
      balanceScore -= 20
    } else if ((neu1 < 40 && neu2 > 60) || (neu1 > 60 && neu2 < 40)) {
      traits.push({
        trait: '情绪稳定者',
        category: 'personality',
        user1Value: stab1,
        user2Value: stab2,
        complementarityType: 'support',
        bonus: PERSONALITY_COMPLEMENTARITY.neuroticism.stabilizerBonus,
        reason: '情绪稳定的一方可以给另一方安全感',
        confidence: 0.85
      })
      supportSystem += 15
    }

    // 4. 依恋风格互补
    const att1 = p1.attachmentStyle
    const att2 = p2.attachmentStyle
    
    if (
      (att1 === 'anxious' && att2 === 'secure') ||
      (att1 === 'secure' && att2 === 'anxious')
    ) {
      traits.push({
        trait: '安全型疗愈',
        category: 'attachment',
        user1Value: this.attachmentToScoreV3(att1),
        user2Value: this.attachmentToScoreV3(att2),
        complementarityType: 'support',
        bonus: 12,
        reason: '安全型可以给焦虑型提供稳定的安全感，帮助成长',
        confidence: 0.8
      })
      growthPotential += 20
      supportSystem += 15
    } else if (att1 === 'secure' && att2 === 'secure') {
      traits.push({
        trait: '双安全型依恋',
        category: 'attachment',
        user1Value: 90,
        user2Value: 90,
        complementarityType: 'synergy',
        bonus: 15,
        reason: '双方都有健康的依恋模式，关系稳定',
        confidence: 0.9
      })
      balanceScore += 10
      supportSystem += 20
    } else if (
      (att1 === 'anxious' && att2 === 'avoidant') ||
      (att1 === 'avoidant' && att2 === 'anxious')
    ) {
      traits.push({
        trait: '焦虑-回避陷阱',
        category: 'attachment',
        user1Value: this.attachmentToScoreV3(att1),
        user2Value: this.attachmentToScoreV3(att2),
        complementarityType: 'growth',
        bonus: -15,
        reason: '可能形成追逐-逃避模式，需要特别努力',
        confidence: 0.85
      })
      balanceScore -= 15
      supportSystem -= 10
    }

    // ====== 价值观互补 ======
    
    // 5. 理性-感性互补
    const rational1 = user1.features.implicit?.['rationality'] || 50
    const rational2 = user2.features.implicit?.['rationality'] || 50
    
    if (Math.abs(rational1 - rational2) > 30) {
      traits.push({
        trait: '理性-感性平衡',
        category: 'values',
        user1Value: rational1,
        user2Value: rational2,
        complementarityType: 'balance',
        bonus: 8,
        reason: '理性与感性的结合，可以互相学习，决策更全面',
        confidence: 0.75
      })
      balanceScore += 10
      growthPotential += 10
    }

    // ====== 技能/兴趣互补 ======
    
    // 6. 技能互补
    const skills1 = (user1.features.implicit?.['skills'] as string[]) || []
    const skills2 = (user2.features.implicit?.['skills'] as string[]) || []
    
    if (skills1.length > 0 && skills2.length > 0) {
      const skillSet1 = new Set<string>(skills1)
      const skillSet2 = new Set<string>(skills2)
      const uniqueSkills = Array.from(skillSet2).filter(s => !skillSet1.has(s))
      
      if (uniqueSkills.length >= 3) {
        traits.push({
          trait: '技能互补',
          category: 'skills',
          user1Value: skills1.length,
          user2Value: skills2.length,
          complementarityType: 'growth',
          bonus: 6,
          reason: '你们有不同的技能，可以互相学习成长',
          confidence: 0.7
        })
        growthPotential += 15
      }
    }

    // 计算总加分
    const totalBonus = Math.min(
      this.config.complementarity.maxBonus,
      Math.max(-10, traits.reduce((sum, t) => sum + t.bonus, 0))
    )

    // 归一化分数
    balanceScore = Math.max(0, Math.min(100, balanceScore))
    growthPotential = Math.max(0, Math.min(100, growthPotential))
    supportSystem = Math.max(0, Math.min(100, supportSystem))

    return { 
      traits, 
      totalBonus,
      balanceScore,
      growthPotential,
      supportSystem
    }
  }

  // ============================================
  // 长期关系预测 V3
  // ============================================

  private predictLongTermPotentialV3(
    user1: any,
    user2: any
  ): LongTermPredictionV3 {
    const riskFactors: RiskFactorV3[] = []
    const strengthFactors: StrengthFactorV3[] = []

    const p1 = user1.personality
    const p2 = user2.personality

    // ====== 风险因子 ======
    
    // 1. 双高神经质
    if (p1.neuroticism.normalizedScore > 60 && p2.neuroticism.normalizedScore > 60) {
      riskFactors.push({
        factor: '双高神经质',
        category: 'personality',
        severity: 'high',
        probability: 0.7,
        description: '双方都容易情绪波动，可能产生冲突循环',
        mitigation: '建议学习情绪管理技巧，建立冷静期机制',
        impactOnScore: -15
      })
    }

    // 2. 低宜人性组合
    if (p1.agreeableness.normalizedScore < 40 && p2.agreeableness.normalizedScore < 40) {
      riskFactors.push({
        factor: '低宜人性组合',
        category: 'personality',
        severity: 'medium',
        probability: 0.6,
        description: '双方都可能比较固执，协商成本较高',
        mitigation: '学习妥协技巧，建立明确的沟通规则',
        impactOnScore: -12
      })
    }

    // 3. 焦虑-回避型依恋
    if (
      (p1.attachmentStyle === 'anxious' && p2.attachmentStyle === 'avoidant') ||
      (p1.attachmentStyle === 'avoidant' && p2.attachmentStyle === 'anxious')
    ) {
      riskFactors.push({
        factor: '焦虑-回避型依恋',
        category: 'attachment',
        severity: 'high',
        probability: 0.65,
        description: '一方追求亲密，另一方需要空间，可能形成追逐-逃避模式',
        mitigation: '理解彼此的依恋需求，建立安全感',
        impactOnScore: -18
      })
    }

    // 4. 价值观冲突 (新增)
    const valuesSimilarity = this.calculateValuesSimilarityV3(user1, user2)
    if (valuesSimilarity < 50) {
      riskFactors.push({
        factor: '价值观冲突',
        category: 'values',
        severity: 'critical',
        probability: 0.75,
        description: '核心价值观差异较大，可能产生根本性分歧',
        mitigation: '深入沟通价值观差异，确认是否可以接受',
        impactOnScore: -25
      })
    }

    // 5. 家庭观念冲突 (新增)
    const familyMatch = user1.features.explicit['family_mean'] - user2.features.explicit['family_mean']
    if (Math.abs(familyMatch) > 30) {
      riskFactors.push({
        factor: '家庭观念差异',
        category: 'values',
        severity: 'medium',
        probability: 0.55,
        description: '家庭观念差异较大，未来规划可能不一致',
        mitigation: '尽早沟通家庭规划，确认双方期待',
        impactOnScore: -10
      })
    }

    // ====== 优势因子 ======
    
    // 1. 双高宜人性
    if (p1.agreeableness.normalizedScore > 60 && p2.agreeableness.normalizedScore > 60) {
      strengthFactors.push({
        factor: '双高宜人性',
        category: 'personality',
        impact: 'very_strong',
        probability: 0.8,
        description: '双方都善于理解和包容，关系和谐度高',
        impactOnScore: 15
      })
    }

    // 2. 价值观高度一致
    if (valuesSimilarity > 80) {
      strengthFactors.push({
        factor: '价值观高度一致',
        category: 'values',
        impact: 'very_strong',
        probability: 0.85,
        description: '核心价值观念一致，关系稳定性强',
        impactOnScore: 18
      })
    }

    // 3. 安全型依恋组合
    if (p1.attachmentStyle === 'secure' && p2.attachmentStyle === 'secure') {
      strengthFactors.push({
        factor: '双安全型依恋',
        category: 'attachment',
        impact: 'exceptional',
        probability: 0.9,
        description: '双方都有健康的依恋模式，关系稳定',
        impactOnScore: 20
      })
    }

    // 4. 情绪稳定组合
    if (p1.neuroticism.normalizedScore < 40 && p2.neuroticism.normalizedScore < 40) {
      strengthFactors.push({
        factor: '双高情绪稳定',
        category: 'personality',
        impact: 'strong',
        probability: 0.75,
        description: '双方都情绪稳定，冲突概率低',
        impactOnScore: 12
      })
    }

    // 5. 互补性好 (新增)
    const complementarity = this.analyzeComplementarityV3(user1, user2)
    if (complementarity.balanceScore > 70) {
      strengthFactors.push({
        factor: '性格互补平衡',
        category: 'personality',
        impact: 'strong',
        probability: 0.7,
        description: '性格互补性好，可以互相平衡成长',
        impactOnScore: 10
      })
    }

    // 6. 关系成熟度高 (新增)
    const maturity1 = user1.features.implicit?.['relationship_maturity'] || 50
    const maturity2 = user2.features.implicit?.['relationship_maturity'] || 50
    if (maturity1 > 70 && maturity2 > 70) {
      strengthFactors.push({
        factor: '关系成熟度高',
        category: 'personality',
        impact: 'strong',
        probability: 0.75,
        description: '双方都对关系有成熟的理解和期待',
        impactOnScore: 12
      })
    }

    // 计算稳定性分数
    const stabilityScore = this.calculateStabilityScoreV3(
      riskFactors,
      strengthFactors,
      p1,
      p2
    )

    // 预测满意度
    const predictedSatisfaction = this.predictSatisfactionV3(
      riskFactors,
      strengthFactors
    )

    // 推荐关注点
    const recommendedFocus = this.generateRecommendedFocus(riskFactors, strengthFactors)

    return {
      riskFactors,
      strengthFactors,
      stabilityScore,
      predictedSatisfaction,
      recommendedFocus
    }
  }

  private calculateStabilityScoreV3(
    risks: RiskFactorV3[],
    strengths: StrengthFactorV3[],
    p1: any,
    p2: any
  ): number {
    let baseScore = 70

    // 风险扣分 (按严重程度加权)
    risks.forEach(r => {
      const severityWeight = {
        'low': 0.5,
        'medium': 1.0,
        'high': 1.5,
        'critical': 2.0
      }
      const deduction = r.probability * Math.abs(r.impactOnScore) * severityWeight[r.severity]
      baseScore -= deduction
    })

    // 优势加分
    strengths.forEach(s => {
      const impactWeight = {
        'moderate': 0.8,
        'strong': 1.0,
        'very_strong': 1.3,
        'exceptional': 1.5
      }
      const addition = s.probability * s.impactOnScore * impactWeight[s.impact]
      baseScore += addition
    })

    return Math.max(0, Math.min(100, baseScore))
  }

  private predictSatisfactionV3(
    risks: RiskFactorV3[],
    strengths: StrengthFactorV3[]
  ): number {
    let baseScore = 65

    risks.forEach(r => {
      baseScore += r.impactOnScore * r.probability * 0.8
    })

    strengths.forEach(s => {
      baseScore += s.impactOnScore * s.probability * 0.8
    })

    return Math.max(0, Math.min(100, baseScore))
  }

  private generateRecommendedFocus(
    risks: RiskFactorV3[],
    strengths: StrengthFactorV3[]
  ): string[] {
    const focus: string[] = []

    // 根据风险因子给出建议
    const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical')
    if (highRisks.length > 0) {
      focus.push(...highRisks.map(r => r.mitigation))
    }

    // 根据优势因子给出巩固建议
    if (strengths.some(s => s.factor.includes('价值观'))) {
      focus.push('继续保持开放的沟通，深化对彼此价值观的理解')
    }

    if (strengths.some(s => s.factor.includes('情绪稳定'))) {
      focus.push('利用双方情绪稳定的优势，建立健康的冲突解决机制')
    }

    return focus.slice(0, 3) // 最多3条
  }

  // ============================================
  // 总分计算 V3 (优化权重)
  // ============================================

  private calculateTotalScoreV3(scores: {
    coreMatch: number
    compatibilityMatch: number
    complementarityBonus: number
    locationBonus: number
    ageScore: number
    longTermPotential: number
  }): number {
    // 使用优化后的权重
    const weights = {
      core: 0.45, // 核心维度 45%
      compatibility: 0.25, // 兼容性 25%
      complementarity: 0.10, // 互补性 10%
      location: 0.05, // 地理位置 5%
      longTerm: 0.15 // 长期潜力 15%
    }

    // 年龄分数融入兼容性维度
    const adjustedCompatibility = (
      scores.compatibilityMatch * 0.7 +
      scores.ageScore * 0.3
    )

    return (
      scores.coreMatch * weights.core +
      adjustedCompatibility * weights.compatibility +
      scores.complementarityBonus +
      scores.locationBonus * weights.location / 100 * 10 + // 归一化
      scores.longTermPotential * weights.longTerm
    )
  }

  // ============================================
  // 辅助函数 V3
  // ============================================

  private calculateWeightedSimilarity(
    vec1: number[],
    vec2: number[],
    weights: number[]
  ): number {
    if (vec1.length !== vec2.length || vec1.length === 0) return 50
    
    let totalDiff = 0
    let totalWeight = 0
    
    for (let i = 0; i < vec1.length; i++) {
      totalDiff += Math.abs(vec1[i] - vec2[i]) * weights[i]
      totalWeight += weights[i]
    }
    
    const avgDiff = totalWeight > 0 ? totalDiff / totalWeight : 25
    return Math.max(0, 100 - avgDiff)
  }

  private judgeValueMatchV3(v1: number, v2: number): 'similar' | 'complementary' | 'neutral' | 'conflict' {
    const diff = Math.abs(v1 - v2)
    if (diff < 12) return 'similar' // 更严格的相似标准
    if (diff > 35) return 'conflict' // 更严格的冲突标准
    return 'neutral'
  }

  private judgePersonalityMatchV3(
    trait: string,
    v1: number,
    v2: number
  ): 'similar' | 'complementary' | 'neutral' | 'conflict' {
    const diff = Math.abs(v1 - v2)

    switch (trait) {
      case 'openness':
      case 'conscientiousness':
        if (diff < 15) return 'similar'
        if (diff > 45) return 'conflict'
        return 'neutral'
      
      case 'extraversion':
        if (diff < 15) return 'similar'
        if (diff >= 15 && diff <= 35) return 'complementary'
        if (diff > 50) return 'conflict'
        return 'neutral'
      
      case 'agreeableness':
        if (v1 > 65 && v2 > 65) return 'similar'
        if (v1 < 40 && v2 < 40) return 'conflict'
        if (Math.abs(v1 - v2) > 30) return 'complementary'
        return 'neutral'
      
      case 'neuroticism':
        if (v1 < 40 && v2 < 40) return 'similar'
        if (v1 > 60 && v2 > 60) return 'conflict'
        return 'neutral'
      
      default:
        if (diff < 20) return 'similar'
        return 'neutral'
    }
  }

  private judgeLifestyleMatchV3(
    type: string,
    v1: number,
    v2: number
  ): 'similar' | 'complementary' | 'neutral' | 'conflict' {
    const diff = Math.abs(v1 - v2)
    
    // 生活方式大多数需要相似
    if (diff < 15) return 'similar'
    if (diff > 45) return 'conflict'
    return 'neutral'
  }

  private judgeAttachmentMatchV3(
    att1: string,
    att2: string
  ): 'similar' | 'complementary' | 'neutral' | 'conflict' {
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

  private attachmentToScoreV3(style: string): number {
    const scores: Record<string, number> = {
      secure: 90,
      anxious: 50,
      avoidant: 45,
      fearful_avoidant: 35
    }
    return scores[style] || 50
  }

  private calculateWeightedPersonalityScore(traits: TraitDetail[]): number {
    let totalScore = 0
    let totalWeight = 0

    traits.forEach(trait => {
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

      totalScore += traitScore * trait.weight
      totalWeight += trait.weight
    })

    return totalWeight > 0 ? totalScore / totalWeight : 50
  }

  private calculateValuesSimilarityV3(user1: any, user2: any): number {
    const valuesKeys = ['values_mean', 'values_money', 'values_family', 'values_career', 'values_life']
    
    const vec1 = valuesKeys.map(k => user1.features.explicit[k] || 50)
    const vec2 = valuesKeys.map(k => user2.features.explicit[k] || 50)
    const weights = [1.5, 1.4, 1.4, 1.2, 1.1] // 对应权重
    
    return this.calculateWeightedSimilarity(vec1, vec2, weights)
  }

  // ============================================
  // 解释生成 V3
  // ============================================

  private generateExplanationV3(
    core: any,
    compatibility: any,
    complementarity: ComplementarityAnalysisV3,
    longTerm: LongTermPredictionV3,
    ageMatch: AgeMatchDetail,
    locationMatch: LocationMatchDetail
  ): {
    strengths: string[]
    challenges: string[]
    advice: string[]
  } {
    const strengths: string[] = []
    const challenges: string[] = []
    const advice: string[] = []

    // 核心维度优势
    if (core.values.score > 80) {
      strengths.push('价值观高度契合，这是关系稳定的重要基础')
    } else if (core.values.score > 65) {
      strengths.push('价值观基本一致，对人生重要事物的看法相近')
    }

    // 性格优势
    const similarTraits = core.personality.traits.filter((t: TraitDetail) => t.match === 'similar' && t.importance === 'critical')
    if (similarTraits.length > 0) {
      strengths.push(`核心性格特质相似：${similarTraits.map((t: TraitDetail) => t.name).join('、')}`)
    }

    // 互补性优势
    complementarity.traits
      .filter(t => t.bonus > 0)
      .forEach(t => {
        strengths.push(t.reason)
      })

    // 长期预测优势
    longTerm.strengthFactors.forEach(s => {
      strengths.push(s.description)
    })

    // 年龄匹配
    if (ageMatch.score > 80) {
      strengths.push(ageMatch.interpretation)
    }

    // 地理位置优势
    if (locationMatch.sameCity) {
      strengths.push('同城，见面方便，有利于关系发展')
    } else if (locationMatch.score > 70) {
      strengths.push('距离较近，日常见面方便')
    }

    // 挑战
    longTerm.riskFactors.forEach(r => {
      challenges.push(r.description)
      advice.push(r.mitigation)
    })

    // 互补性挑战
    complementarity.traits
      .filter(t => t.bonus < 0)
      .forEach(t => {
        challenges.push(t.reason)
      })

    // 通用建议
    if (challenges.length === 0) {
      advice.push('这是一对潜力很大的组合，建议多沟通，珍惜彼此')
    }

    // 年龄挑战
    if (ageMatch.score < 60) {
      challenges.push(ageMatch.interpretation)
      advice.push('年龄差距可能带来代沟，建议多交流理解彼此的成长背景')
    }

    // 地理位置挑战
    if (!locationMatch.sameCity && locationMatch.distanceKm && locationMatch.distanceKm > 100) {
      challenges.push(`异地(${Math.round(locationMatch.distanceKm)}公里)，需要更多努力`)
      advice.push('异地恋需要更多信任和沟通，建议制定见面计划')
    }

    return { strengths, challenges, advice }
  }

  private generateValuesInterpretationV3(
    traits: TraitDetail[],
    similarity: number
  ): string {
    const criticalTraits = traits.filter(t => t.importance === 'critical')
    const conflicts = traits.filter(t => t.match === 'conflict')
    
    if (conflicts.length > 0) {
      return `价值观存在冲突：${conflicts.map(t => t.name).join('、')}，建议深入沟通`
    }
    
    if (similarity > 85) {
      return '价值观高度一致，对人生重要事物的看法非常接近'
    } else if (similarity > 70) {
      return '价值观基本一致，有一些差异但可以互相理解'
    } else {
      return '价值观存在一定差异，建议多交流确认是否可以接受'
    }
  }

  private generatePersonalityInterpretationV3(
    traits: TraitDetail[],
    p1: any,
    p2: any
  ): string {
    const parts: string[] = []

    // 检查互补性
    const complementary = traits.filter(t => t.match === 'complementary')
    if (complementary.length > 0) {
      parts.push(`${complementary.map(t => t.name).join('、')}方面可以互补`)
    }

    // 检查相似性
    const similar = traits.filter(t => t.match === 'similar')
    if (similar.length > 0) {
      parts.push(`${similar.map(t => t.name).join('、')}方面比较相似`)
    }

    // 检查冲突
    const conflicts = traits.filter(t => t.match === 'conflict')
    if (conflicts.length > 0) {
      parts.push(`${conflicts.map(t => t.name).join('、')}方面可能存在摩擦`)
    }

    return parts.join('；') || '性格匹配度良好'
  }

  private generateLifestyleInterpretationV3(traits: TraitDetail[]): string {
    const conflicts = traits.filter(t => t.match === 'conflict')
    const similar = traits.filter(t => t.match === 'similar')
    
    if (conflicts.length > 1) {
      return `生活方式有多处差异：${conflicts.map(c => c.name).join('、')}，需要磨合`
    } else if (conflicts.length === 1) {
      return `${conflicts[0].name}有差异，需要磨合`
    } else if (similar.length >= 3) {
      return '生活方式很合拍，日常相处会很舒服'
    }
    
    return '生活方式基本合拍'
  }

  private generateFamilyInterpretationV3(traits: TraitDetail[]): string {
    const criticalTraits = traits.filter(t => t.importance === 'critical')
    const conflicts = traits.filter(t => t.match === 'conflict')
    
    if (conflicts.some(t => t.importance === 'critical')) {
      return '家庭观念存在重大差异，建议深入沟通未来规划'
    }
    
    if (conflicts.length > 0) {
      return '家庭观念有些差异，建议多交流'
    }
    
    return '家庭观念比较一致，对未来期待相似'
  }

  // ============================================
  // 底线检查 (保持原有逻辑)
  // ============================================

  private extractDealbreakers(answers: any): string[] {
    const dealbreakers: string[] = []
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
    dealbreakers.forEach(db => {
      switch (db) {
        case 'A':
          const smokeQ = targetAnswers.find((a: any) => 
            a.questionText?.includes('抽烟')
          )
          if (smokeQ?.answer?.smokes) {
            triggers.push('吸烟')
          }
          break
      }
    })
    return triggers
  }

  private createFailedMatchResultV3(user1: any, user2: any): MatchingResultV3 {
    return {
      userId: 'user1',
      matchedUserId: 'user2',
      scores: {
        hardFilter: 'failed',
        coreMatch: 0,
        compatibilityMatch: 0,
        complementarityBonus: 0,
        locationBonus: 0,
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
          interests: { score: 0, similarity: 0, categories: [], sharedInterests: [], complementaryInterests: [], interpretation: '' },
          family: { score: 0, similarity: 0, traits: [], interpretation: '' },
          age: { ageGap: 0, idealGap: 0, score: 0, interpretation: '' },
          location: { sameCity: false, score: 0, interpretation: '' }
        },
        complementarity: { traits: [], totalBonus: 0, balanceScore: 0, growthPotential: 0, supportSystem: 0 },
        longTermPrediction: {
          riskFactors: [],
          strengthFactors: [],
          stabilityScore: 0,
          predictedSatisfaction: 0,
          recommendedFocus: []
        }
      },
      explanation: {
        strengths: [],
        challenges: ['存在底线冲突'],
        advice: ['此匹配可能不适合']
      },
      metadata: {
        calculatedAt: new Date(),
        version: '3.0',
        reliability: Math.min(user1.features?.reliability || 50, user2.features?.reliability || 50),
        optimizationFlags: this.optimizationFlags
      }
    }
  }
}

// ============================================
// 导出
// ============================================

export function calculateAdvancedMatchV3(
  user1Profile: any,
  user2Profile: any,
  config?: Partial<MatchConfigV3>
): MatchingResultV3 {
  const matcher = new AdvancedMatcherV3(config)
  return matcher.calculateMatch(user1Profile, user2Profile)
}
