/**
 * 心动投递 - 完整匹配服务 V2
 * 
 * 整合所有优化模块的一站式匹配服务
 */

import { calculateMatchV2 as calculateAdvancedMatch, MatchingResultV2 as MatchingResult, MatchConfigV2 } from './matching-algorithm-v2'
import { extractAdvancedFeatures, ExtractedFeatures } from './feature-engineering-v2'
import { generatePersonalityProfile, PersonalityProfile } from './scoring-system'

// ============================================
// 类型定义
// ============================================

export interface User {
  id: string
  nickname: string
  gender: 'male' | 'female'
  age: number
  city: string
  
  // 问卷答案
  answers: any[]
  
  // 行为数据
  behavioralData?: {
    startTime: number
    endTime: number
    answerChanges?: Record<string, any>
    skipHistory?: string[]
  }
}

export interface MatchRequest {
  user: User
  candidates: User[]
  config?: Partial<MatchConfigV2>
  filters?: MatchFilters
}

export interface MatchFilters {
  gender?: 'male' | 'female'
  ageRange?: [number, number]
  city?: string | string[]
  dealbreakers?: string[]
  minScore?: number
}

export interface MatchResponse {
  matches: MatchingResult[]
  totalCandidates: number
  filteredCount: number
  processingTimeMs: number
  metadata: {
    version: string
    features: string[]
    algorithm: string
  }
}

// ============================================
// 匹配服务类
// ============================================

export class MatchServiceV2 {
  private config: MatchConfigV2

  constructor(config?: Partial<MatchConfigV2>) {
    this.config = {
      weights: config?.weights ?? {
        personality: 0.25,
        values: 0.30,
        interests: 0.20,
        lifestyle: 0.25
      },
      hardFilter: {
        enable: config?.hardFilter?.enable ?? true,
        minCompatibility: config?.hardFilter?.minCompatibility ?? 40
      },
      complementarity: {
        enable: config?.complementarity?.enable ?? true,
        weight: config?.complementarity?.weight ?? 0.15,
        maxBonus: config?.complementarity?.maxBonus ?? 15
      },
      longTermPrediction: {
        enable: config?.longTermPrediction?.enable ?? true,
        riskWeight: config?.longTermPrediction?.riskWeight ?? 0.3,
        strengthWeight: config?.longTermPrediction?.strengthWeight ?? 0.2
      }
    }
  }

  /**
   * 执行批量匹配
   */
  async match(request: MatchRequest): Promise<MatchResponse> {
    const startTime = Date.now()
    const { user, candidates, filters } = request

    // 1. 提取用户画像
    const userProfile = await this.buildUserProfile(user)
    
    // 2. 过滤候选人
    const filteredCandidates = this.filterCandidates(candidates, filters)
    
    // 3. 计算每个候选人的匹配分数
    const matches: MatchingResult[] = []
    
    for (const candidate of filteredCandidates) {
      try {
        const candidateProfile = await this.buildUserProfile(candidate)
        
        const result = calculateAdvancedMatch(
          userProfile,
          candidateProfile,
          this.config
        )
        
        // 添加用户信息
        result.userId = user.id
        result.matchedUserId = candidate.id
        
        // 过滤低分匹配
        if (!filters?.minScore || result.scores.totalScore >= filters.minScore) {
          matches.push(result)
        }
      } catch (error) {
        console.error(`匹配计算失败: ${candidate.id}`, error)
      }
    }

    // 4. 排序并返回结果
    matches.sort((a, b) => b.scores.totalScore - a.scores.totalScore)

    const processingTime = Date.now() - startTime

    return {
      matches,
      totalCandidates: candidates.length,
      filteredCount: candidates.length - filteredCandidates.length,
      processingTimeMs: processingTime,
      metadata: {
        version: '2.0',
        features: this.getFeatureList(),
        algorithm: 'advanced-v2'
      }
    }
  }

  /**
   * 构建用户画像
   */
  private async buildUserProfile(user: User): Promise<{
    personality: PersonalityProfile
    features: ExtractedFeatures
    answers: any[]
  }> {
    // 1. 生成人格画像
    const personality = generatePersonalityProfile(
      user.answers as any
    )

    // 2. 提取高级特征
    const features = extractAdvancedFeatures(
      user.answers as any,
      user.behavioralData || {
        startTime: Date.now() - 600000,
        endTime: Date.now(),
        answerChanges: {},
        skipHistory: []
      }
    )

    return {
      personality,
      features,
      answers: user.answers
    }
  }

  /**
   * 过滤候选人
   */
  private filterCandidates(
    candidates: User[],
    filters?: MatchFilters
  ): User[] {
    if (!filters) return candidates

    return candidates.filter(candidate => {
      // 性别过滤
      if (filters.gender && candidate.gender !== filters.gender) {
        return false
      }

      // 年龄过滤
      if (filters.ageRange) {
        const [min, max] = filters.ageRange
        if (candidate.age < min || candidate.age > max) {
          return false
        }
      }

      // 城市过滤
      if (filters.city) {
        const allowedCities = Array.isArray(filters.city) 
          ? filters.city 
          : [filters.city]
        if (!allowedCities.includes(candidate.city)) {
          return false
        }
      }

      return true
    })
  }

  /**
   * 获取特征列表
   */
  private getFeatureList(): string[] {
    return [
      // 显性特征
      'values_mean',
      'values_std',
      'personality_openness',
      'personality_conscientiousness',
      'personality_extraversion',
      'personality_agreeableness',
      'personality_neuroticism',
      'lifestyle_score',
      'interests_overlap',
      'family_alignment',
      
      // 隐性特征
      'values_consistency',
      'emotional_stability',
      'self_awareness',
      'relationship_maturity',
      'growth_mindset',
      'authenticity',
      
      // 行为特征
      'engagement_level',
      'completion_consistency',
      'answer_change_count',
      
      // 交叉特征
      'values_personality_alignment',
      'relationship_family_coherence',
      'lifestyle_personality_fit',
      
      // 风险特征
      'cognitive_dissonance',
      'defensiveness',
      'social_desirability'
    ]
  }
}

// ============================================
// 辅助函数
// ============================================

/**
 * 创建匹配服务实例
 */
export function createMatchService(config?: Partial<MatchConfigV2>): MatchServiceV2 {
  return new MatchServiceV2(config)
}

/**
 * 快速单次匹配
 */
export async function quickMatch(
  user1: User,
  user2: User,
  config?: Partial<MatchConfigV2>
): Promise<MatchingResult> {
  const service = new MatchServiceV2(config)
  
  const result = await service.match({
    user: user1,
    candidates: [user2]
  })
  
  return result.matches[0]
}

/**
 * 批量匹配（并行优化）
 */
export async function batchMatch(
  user: User,
  candidates: User[],
  config?: Partial<MatchConfigV2>,
  concurrency: number = 10
): Promise<MatchResponse> {
  const service = new MatchServiceV2(config)
  
  // 分批处理以优化性能
  const batches: User[][] = []
  for (let i = 0; i < candidates.length; i += concurrency) {
    batches.push(candidates.slice(i, i + concurrency))
  }
  
  const allMatches: MatchingResult[] = []
  
  for (const batch of batches) {
    const result = await service.match({ user, candidates: batch })
    allMatches.push(...result.matches)
  }
  
  // 全局排序
  allMatches.sort((a, b) => b.scores.totalScore - a.scores.totalScore)
  
  return {
    matches: allMatches,
    totalCandidates: candidates.length,
    filteredCount: 0,
    processingTimeMs: 0, // 可添加计时
    metadata: {
      version: '2.0',
      features: service['getFeatureList'](),
      algorithm: 'advanced-v2-parallel'
    }
  }
}

// ============================================
// 预定义配置
// ============================================

/**
 * 保守型配置 - 重视匹配质量
 */
export const CONSERVATIVE_CONFIG: Partial<MatchConfigV2> = {
  hardFilter: {
    enableDealbreakerFilter: true,
    dealbreakerMatchThreshold: 0.9
  },
  dynamicWeights: {
    enable: true,
    personalizationStrength: 0.5
  },
  complementarity: {
    enable: true,
    weight: 0.10,
    maxBonus: 10
  },
  longTermPrediction: {
    enable: true,
    riskWeight: 0.4,
    strengthWeight: 0.3
  }
}

/**
 * 激进型配置 - 重视匹配数量
 */
export const AGGRESSIVE_CONFIG: Partial<MatchConfigV2> = {
  hardFilter: {
    enableDealbreakerFilter: true,
    dealbreakerMatchThreshold: 0.6
  },
  dynamicWeights: {
    enable: false,
    personalizationStrength: 0
  },
  complementarity: {
    enable: true,
    weight: 0.20,
    maxBonus: 20
  },
  longTermPrediction: {
    enable: true,
    riskWeight: 0.2,
    strengthWeight: 0.1
  }
}

/**
 * 平衡型配置 - 默认推荐
 */
export const BALANCED_CONFIG: Partial<MatchConfigV2> = {
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
// 导出
// ============================================

export default MatchServiceV2
