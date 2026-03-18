/**
 * 心动投递 - 高级特征工程系统 V2
 * 
 * 深入挖掘用户特征，提高匹配精准度
 */

import { QuestionAnswer } from './scoring-system'

// ============================================
// 类型定义
// ============================================

export interface ExtractedFeatures {
  // 显性特征（直接来自答案）
  explicit: Record<string, number>
  
  // 隐性特征（通过组合分析）
  implicit: Record<string, number>
  
  // 行为特征（答题行为）
  behavioral: BehavioralFeatures
  
  // 交叉特征（维度组合）
  cross: Record<string, number>
  
  // 风险特征（警示信号）
  risk: RiskFeatures
  
  // 可靠性指标
  reliability: number
}

export interface BehavioralFeatures {
  totalTimeMs: number
  avgTimePerQuestionMs: number
  answerChangeCount: number
  skipCount: number
  extremeAnswerCount: number // 总是选极端选项
  neutralAnswerCount: number // 总是选中立选项
  completionConsistency: number // 答题一致性
  engagementLevel: 'high' | 'medium' | 'low'
}

export interface RiskFeatures {
  contradictoryAnswers: ContradictionItem[]
  cognitiveDissonance: number // 认知失调程度
  defensiveness: number // 防御性程度
  socialDesirability: number // 社会期许偏差
}

export interface ContradictionItem {
  questionCodes: string[]
  contradictionType: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

// ============================================
// 高级特征提取器
// ============================================

export class AdvancedFeatureExtractor {
  private answers: QuestionAnswer[]
  private behavioralData: any

  constructor(
    answers: QuestionAnswer[],
    behavioralData: {
      startTime: number
      endTime: number
      answerChanges?: Record<string, any>
      skipHistory?: string[]
    }
  ) {
    this.answers = answers
    this.behavioralData = behavioralData
  }

  /**
   * 提取所有特征
   */
  extractAll(): ExtractedFeatures {
    return {
      explicit: this.extractExplicitFeatures(),
      implicit: this.extractImplicitFeatures(),
      behavioral: this.extractBehavioralFeatures(),
      cross: this.extractCrossFeatures(),
      risk: this.detectRiskFeatures(),
      reliability: this.calculateReliability()
    }
  }

  // ============================================
  // 1. 显性特征提取
  // ============================================
  
  private extractExplicitFeatures(): Record<string, number> {
    const features: Record<string, number> = {}

    // 按维度聚合答案
    const dimensionScores: Record<string, number[]> = {}
    
    this.answers.forEach(answer => {
      const score = this.calculateAnswerScore(answer)
      
      if (!dimensionScores[answer.dimension]) {
        dimensionScores[answer.dimension] = []
      }
      dimensionScores[answer.dimension].push(score)
    })

    // 计算各维度统计特征
    Object.entries(dimensionScores).forEach(([dim, scores]) => {
      if (scores.length > 0) {
        features[`${dim}_mean`] = this.mean(scores)
        features[`${dim}_std`] = this.std(scores)
        features[`${dim}_range`] = Math.max(...scores) - Math.min(...scores)
      }
    })

    return features
  }

  private calculateAnswerScore(answer: QuestionAnswer): number {
    switch (answer.questionType) {
      case 'single_choice':
        return answer.answer.value?.charCodeAt(0) - 65 || 0
      
      case 'likert_5':
      case 'likert_7':
        return answer.answer.value || 3
      
      case 'slider_100':
        return answer.answer.value / 20 // 归一化到0-5
      
      case 'multiple_choice':
        return answer.answer.values?.length || 0
      
      default:
        return 0
    }
  }

  // ============================================
  // 2. 隐性特征提取
  // ============================================

  private extractImplicitFeatures(): Record<string, number> {
    const features: Record<string, number> = {}

    // 2.1 价值观-一致性
    features['values_consistency'] = this.calculateValuesConsistency()

    // 2.2 情绪稳定性（基于多题的一致性）
    features['emotional_stability'] = this.inferEmotionalStability()

    // 2.3 自我认知准确度
    features['self_awareness'] = this.assessSelfAwareness()

    // 2.4 关系成熟度
    features['relationship_maturity'] = this.inferRelationshipMaturity()

    // 2.5 成长心态
    features['growth_mindset'] = this.inferGrowthMindset()

    // 2.6 真实性
    features['authenticity'] = this.assessAuthenticity()

    return features
  }

  /**
   * 计算价值观一致性
   * 检查用户的价值观回答是否一致
   */
  private calculateValuesConsistency(): number {
    const valuesAnswers = this.answers.filter(a => a.dimension === 'values')
    
    if (valuesAnswers.length < 5) return 50

    // 检查矛盾点
    let consistencyScore = 100
    const contradictions = this.findValueContradictions(valuesAnswers)
    
    contradictions.forEach(() => {
      consistencyScore -= 10
    })

    return Math.max(0, consistencyScore)
  }

  private findValueContradictions(answers: QuestionAnswer[]): any[] {
    const contradictions: any[] = []

    // 检查金钱观的一致性
    const moneyQ1 = answers.find(a => a.measuresTrait === 'values_money')
    const successQ = answers.find(a => a.measuresTrait === 'values_success_attribution')
    
    if (moneyQ1 && successQ) {
      const moneyScore = this.getAnswerValue(moneyQ1)
      const successScore = this.getAnswerValue(successQ)
      
      // 如果认为钱不重要(高分)但认为成功主要靠努力(低分)，可能存在矛盾
      if (moneyScore > 3 && successScore < 3) {
        contradictions.push({
          type: 'money_success_paradox',
          severity: 'medium'
        })
      }
    }

    return contradictions
  }

  private getAnswerValue(answer: QuestionAnswer): number {
    if (answer.questionType === 'single_choice') {
      return answer.answer.value?.charCodeAt(0) - 64 || 0
    }
    return answer.answer.value || 0
  }

  /**
   * 推断情绪稳定性
   */
  private inferEmotionalStability(): number {
    // 分析情绪相关问题的回答模式
    const emotionAnswers = this.answers.filter(a => 
      a.measuresTrait?.includes('emotion') ||
      a.measuresFacet === 'impulsiveness' ||
      a.measuresFacet === 'vulnerability'
    )

    if (emotionAnswers.length === 0) return 50

    const totalScore = emotionAnswers.reduce((sum, a) => {
      const score = this.getAnswerValue(a)
      // 反向计分：低分表示高神经质（低稳定性）
      return sum + (6 - score)
    }, 0)

    return (totalScore / emotionAnswers.length) * 20
  }

  /**
   * 评估自我认知准确度
   */
  private assessSelfAwareness(): number {
    // 检查是否能准确认识自己的缺点
    const weaknessQ = this.answers.find(a => 
      a.measuresTrait === 'personality_weaknesses'
    )
    const sensitivityQ = this.answers.find(a =>
      a.measuresTrait === 'personality_sensitivity'
    )

    if (!weaknessQ || !sensitivityQ) return 50

    // 能承认缺点的人通常自我认知较好
    const weaknessCount = weaknessQ.answer.values?.length || 0
    const sensitivityScore = this.getAnswerValue(sensitivityQ)

    // 承认2-3个缺点 + 中等敏感 = 好的自我认知
    let score = 50
    if (weaknessCount >= 2 && weaknessCount <= 3) score += 20
    if (sensitivityScore >= 2 && sensitivityScore <= 4) score += 20

    return Math.min(100, score)
  }

  /**
   * 推断关系成熟度
   */
  private inferRelationshipMaturity(): number {
    const relationshipAnswers = this.answers.filter(a => 
      a.dimension === 'relationship'
    )

    if (relationshipAnswers.length < 5) return 50

    // 成熟的标志：
    // 1. 意识到关系需要经营
    // 2. 接受对方不完美
    // 3. 愿意沟通

    let maturityScore = 50

    // 检查对冲突的态度
    const conflictQ = relationshipAnswers.find(a =>
      a.measuresTrait === 'relationship_dealbreakers'
    )
    if (conflictQ) {
      const dealbreakers = conflictQ.answer.values || []
      // 合理的底线数量（2-4个）表示成熟
      if (dealbreakers.length >= 2 && dealbreakers.length <= 4) {
        maturityScore += 15
      }
    }

    // 检查是否看重沟通
    const priorityQ = relationshipAnswers.find(a =>
      a.measuresTrait === 'relationship_priority'
    )
    if (priorityQ) {
      const priority = priorityQ.answer.value
      if (priority === 'A' || priority === 'B') { // 沟通或信任
        maturityScore += 15
      }
    }

    return Math.min(100, maturityScore)
  }

  /**
   * 推断成长心态
   */
  private inferGrowthMindset(): number {
    const growthIndicators = this.answers.filter(a =>
      a.measuresTrait?.includes('growth') ||
      a.measuresTrait?.includes('learning') ||
      a.measuresTrait === 'values_self_actualization'
    )

    if (growthIndicators.length === 0) return 50

    const avgScore = growthIndicators.reduce((sum, a) => {
      return sum + this.getAnswerValue(a)
    }, 0) / growthIndicators.length

    // 高分表示成长心态
    return avgScore * 20
  }

  /**
   * 评估真实性
   */
  private assessAuthenticity(): number {
    // 真实性 = 低社会期许 + 一致回答
    const socialDesirability = this.estimateSocialDesirability()
    const consistency = this.calculateValuesConsistency()

    return (consistency * 0.6 + (100 - socialDesirability) * 0.4)
  }

  private estimateSocialDesirability(): number {
    // 检测回答是否过于"正确"
    const suspiciousPatterns = [
      // 所有量表题都选中立（3）
      (a: QuestionAnswer) => {
        if (['likert_5', 'likert_7'].includes(a.questionType)) {
          return a.answer.value === 3 || a.answer.value === 4
        }
        return false
      },
      // 回避负面选项
      (a: QuestionAnswer) => {
        if (a.measuresTrait === 'personality_weaknesses') {
          const values = a.answer.values || []
          return values.length === 0
        }
        return false
      }
    ]

    let suspiciousCount = 0
    this.answers.forEach(answer => {
      suspiciousPatterns.forEach(pattern => {
        if (pattern(answer)) suspiciousCount++
      })
    })

    // 归一化
    return Math.min(100, suspiciousCount / this.answers.length * 200)
  }

  // ============================================
  // 3. 行为特征提取
  // ============================================

  private extractBehavioralFeatures(): BehavioralFeatures {
    const totalTime = this.behavioralData.endTime - this.behavioralData.startTime
    const changeCount = Object.keys(this.behavioralData.answerChanges || {}).length
    const skipCount = (this.behavioralData.skipHistory || []).length

    // 分析极端回答模式
    const extremeCount = this.countExtremeAnswers()
    const neutralCount = this.countNeutralAnswers()

    return {
      totalTimeMs: totalTime,
      avgTimePerQuestionMs: totalTime / this.answers.length,
      answerChangeCount: changeCount,
      skipCount: skipCount,
      extremeAnswerCount: extremeCount,
      neutralAnswerCount: neutralCount,
      completionConsistency: this.calculateCompletionConsistency(),
      engagementLevel: this.determineEngagementLevel(totalTime, changeCount)
    }
  }

  private countExtremeAnswers(): number {
    return this.answers.filter(a => {
      if (['likert_5', 'likert_7'].includes(a.questionType)) {
        const val = a.answer.value
        return val === 1 || val === (a.questionType === 'likert_5' ? 5 : 7)
      }
      return false
    }).length
  }

  private countNeutralAnswers(): number {
    return this.answers.filter(a => {
      if (['likert_5', 'likert_7'].includes(a.questionType)) {
        const val = a.answer.value
        const mid = a.questionType === 'likert_5' ? 3 : 4
        return val === mid
      }
      return false
    }).length
  }

  private calculateCompletionConsistency(): number {
    // 检查完成质量
    const requiredCount = this.answers.filter(a => (a as any).isRequired).length
    const completedRequired = this.answers.filter(a => (a as any).isRequired).length
    
    if (requiredCount === 0) return 100
    return (completedRequired / requiredCount) * 100
  }

  private determineEngagementLevel(
    totalTime: number,
    changeCount: number
  ): 'high' | 'medium' | 'low' {
    const avgTime = totalTime / this.answers.length
    
    if (avgTime > 10000 && changeCount > 5) return 'high'
    if (avgTime < 3000 && changeCount === 0) return 'low'
    return 'medium'
  }

  // ============================================
  // 4. 交叉特征提取
  // ============================================

  private extractCrossFeatures(): Record<string, number> {
    const features: Record<string, number> = {}

    // 4.1 价值观×性格交叉
    features['values_personality_alignment'] = this.calculateValuesPersonalityAlignment()

    // 4.2 恋爱观×家庭观交叉
    features['relationship_family_coherence'] = this.calculateRelationshipFamilyCoherence()

    // 4.3 生活方式×性格交叉
    features['lifestyle_personality_fit'] = this.calculateLifestylePersonalityFit()

    // 4.4 内在一致性
    features['inner_consistency'] = this.calculateInnerConsistency()

    return features
  }

  private calculateValuesPersonalityAlignment(): number {
    // 检查价值观和性格是否一致
    // 例如：低物质主义 + 低成就动机 = 一致
    
    const materialismQ = this.answers.find(a =>
      a.measuresTrait === 'values_materialism'
    )
    const ambitionQ = this.answers.find(a =>
      a.measuresTrait === 'values_success_attribution'
    )

    if (!materialismQ || !ambitionQ) return 50

    const materialism = this.getAnswerValue(materialismQ)
    const ambition = this.getAnswerValue(ambitionQ)

    // 两者都高或都低 = 一致
    const diff = Math.abs(materialism - ambition)
    return Math.max(0, 100 - diff * 20)
  }

  private calculateRelationshipFamilyCoherence(): number {
    // 检查恋爱观和家庭观是否一致
    const relationshipQ = this.answers.find(a =>
      a.measuresTrait === 'relationship_love_definition'
    )
    const familyQ = this.answers.find(a =>
      a.measuresTrait === 'relationship_time_orientation'
    )

    if (!relationshipQ || !familyQ) return 50

    // 看重责任和长期规划的 = 高一致性
    const responsibility = relationshipQ.answer.value === 'D' // 爱是责任
    const longTerm = familyQ.answer.value >= 4 // 看重未来

    if (responsibility && longTerm) return 90
    if (!responsibility && !longTerm) return 80
    return 50
  }

  private calculateLifestylePersonalityFit(): number {
    // 检查生活方式和性格是否匹配
    // 例如：外向 + 活跃社交 = 匹配
    
    const extraversionQ = this.answers.find(a =>
      a.measuresTrait === 'extraversion'
    )
    const socialFreqQ = this.answers.find(a =>
      a.dimension === 'lifestyle' && (a as any).questionText?.includes('社交')
    )

    if (!extraversionQ || !socialFreqQ) return 50

    const extraversion = this.getAnswerValue(extraversionQ)
    const socialFreq = this.getAnswerValue(socialFreqQ)

    // 两者都高或都低 = 匹配
    const diff = Math.abs(extraversion - socialFreq)
    return Math.max(0, 100 - diff * 25)
  }

  private calculateInnerConsistency(): number {
    // 计算用户回答的整体内在一致性
    // 使用余弦相似度
    
    const scores = this.answers.map(a => this.getAnswerValue(a))
    
    if (scores.length < 2) return 50

    // 计算相邻答案的变化程度
    let totalChange = 0
    for (let i = 1; i < scores.length; i++) {
      totalChange += Math.abs(scores[i] - scores[i - 1])
    }
    
    const avgChange = totalChange / (scores.length - 1)
    return Math.max(0, 100 - avgChange * 10)
  }

  // ============================================
  // 5. 风险特征检测
  // ============================================

  private detectRiskFeatures(): RiskFeatures {
    return {
      contradictoryAnswers: this.detectContradictions(),
      cognitiveDissonance: this.calculateCognitiveDissonance(),
      defensiveness: this.calculateDefensiveness(),
      socialDesirability: this.estimateSocialDesirability()
    }
  }

  private detectContradictions(): ContradictionItem[] {
    const contradictions: ContradictionItem[] = []

    // 检查经典矛盾组合
    const checks = [
      // 矛盾1：说自己是外向，但选择内向的生活方式
      () => {
        const extraversionQ = this.answers.find(a => a.measuresTrait === 'extraversion')
        const socialQ = this.answers.find(a => 
          (a as any).questionText?.includes('社交场合')
        )
        
        if (extraversionQ && socialQ) {
          const extraversion = this.getAnswerValue(extraversionQ)
          const socialStyle = this.getAnswerValue(socialQ)
          
          if (extraversion >= 4 && socialStyle === 1) {
            return {
              questionCodes: [extraversionQ.questionId, socialQ.questionId],
              contradictionType: 'extraversion_vs_social_behavior',
              severity: 'medium' as const,
              description: '自称外向但描述的行为偏内向'
            }
          }
        }
        return null
      },
      
      // 矛盾2：说钱不重要，但消费观很物质
      () => {
        const moneyQ = this.answers.find(a => a.measuresTrait === 'values_money')
        const spendingQ = this.answers.find(a => 
          (a as any).questionText?.includes('消费')
        )
        
        if (moneyQ && spendingQ) {
          const money = this.getAnswerValue(moneyQ)
          const spending = this.getAnswerValue(spendingQ)
          
          if (money === 1 && spending >= 4) {
            return {
              questionCodes: [moneyQ.questionId, spendingQ.questionId],
              contradictionType: 'money_attitude_vs_spending',
              severity: 'high' as const,
              description: '声称不在乎钱但实际消费观很物质'
            }
          }
        }
        return null
      },
      
      // 矛盾3：说重视家庭，但家庭观选择独立
      () => {
        const priorityQ = this.answers.find(a => 
          (a as any).questionText?.includes('人生要素')
        )
        const familyModeQ = this.answers.find(a =>
          (a as any).questionText?.includes('家庭模式')
        )
        
        if (priorityQ && familyModeQ) {
          const priority = priorityQ.answer.order?.indexOf('亲情')
          const familyMode = familyModeQ.answer.values
          
          if (priority === 0 && familyMode?.includes('独立小家庭')) {
            return {
              questionCodes: [priorityQ.questionId, familyModeQ.questionId],
              contradictionType: 'family_priority_vs_mode',
              severity: 'low' as const,
              description: '说家庭最重要但选择独立小家庭'
            }
          }
        }
        return null
      }
    ]

    checks.forEach(check => {
      const result = check()
      if (result) contradictions.push(result)
    })

    return contradictions
  }

  private calculateCognitiveDissonance(): number {
    // 认知失调程度 = 矛盾回答的数量和严重性
    const contradictions = this.detectContradictions()
    
    const severityScores = {
      'low': 1,
      'medium': 2,
      'high': 3
    }

    const totalScore = contradictions.reduce((sum, c) => {
      return sum + severityScores[c.severity]
    }, 0)

    return Math.min(100, totalScore * 15)
  }

  private calculateDefensiveness(): number {
    // 防御性 = 回避负面问题 + 完美回答数量
    let defensivenessScore = 0

    // 检查是否回避缺点问题
    const weaknessQ = this.answers.find(a =>
      a.measuresTrait === 'personality_weaknesses'
    )
    if (weaknessQ) {
      const weaknesses = weaknessQ.answer.values || []
      if (weaknesses.length === 0) {
        defensivenessScore += 30
      } else if (weaknesses.length === 1) {
        defensivenessScore += 10
      }
    }

    // 检查是否所有答案都很"正确"
    const tooPositiveCount = this.answers.filter(a => {
      if (['likert_5', 'likert_7'].includes(a.questionType)) {
        const val = a.answer.value
        // 总是选择正面选项
        return val >= 4
      }
      return false
    }).length

    defensivenessScore += (tooPositiveCount / this.answers.length) * 30

    return Math.min(100, defensivenessScore)
  }

  // ============================================
  // 6. 可靠性计算
  // ============================================

  private calculateReliability(): number {
    // 综合所有因素计算答案可靠性
    const factors = {
      completion: this.calculateCompletionConsistency() * 0.2,
      consistency: (100 - this.calculateCognitiveDissonance()) * 0.3,
      authenticity: this.assessAuthenticity() * 0.3,
      engagement: this.behavioralData.engagementLevel === 'high' ? 20 : 
                  this.behavioralData.engagementLevel === 'medium' ? 10 : 0
    }

    return Object.values(factors).reduce((sum, v) => sum + v, 0)
  }

  // ============================================
  // 工具函数
  // ============================================

  private mean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }

  private std(values: number[]): number {
    const mean = this.mean(values)
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    return Math.sqrt(this.mean(squaredDiffs))
  }
}

// ============================================
// 导出
// ============================================

export function extractAdvancedFeatures(
  answers: QuestionAnswer[],
  behavioralData: any
): ExtractedFeatures {
  const extractor = new AdvancedFeatureExtractor(answers, behavioralData)
  return extractor.extractAll()
}
