/**
 * 心动投递 - 专业问卷计分系统
 * 
 * 基于心理学量表的标准化计分方法
 * 包含：大五人格、依恋风格、价值观等维度
 */

// ============================================
// 类型定义
// ============================================

export interface QuestionAnswer {
  questionId: string
  questionType: string
  dimension: string
  measuresTrait?: string
  measuresFacet?: string
  answer: any
  scoringMethod: 'direct' | 'reverse' | 'weighted' | 'factor_based'
  options?: any[]
}

export interface DimensionScore {
  dimension: string
  rawScore: number
  normalizedScore: number // T-score
  percentile: number
  confidence: number
  facets?: Record<string, number>
}

export interface PersonalityProfile {
  // 大五人格
  openness: DimensionScore
  conscientiousness: DimensionScore
  extraversion: DimensionScore
  agreeableness: DimensionScore
  neuroticism: DimensionScore
  
  // 依恋风格
  attachmentStyle: 'secure' | 'anxious' | 'avoidant' | 'fearful_avoidant'
  attachmentAnxiety: number
  attachmentAvoidance: number
  
  // 价值观
  valuesProfile: Record<string, number>
  dominantValueType: string
  
  // 元数据
  questionnaireCompleted: boolean
  questionsAnswered: number
  completenessScore: number
  confidenceScore: number
}

// ============================================
// 常模数据 (中国大陆人群常模)
// ============================================

const NORMS = {
  // 大五人格常模 (基于中国修订版 NEO-PI-R)
  bigFive: {
    openness: { mean: 27.5, std: 5.8 },
    conscientiousness: { mean: 31.2, std: 5.5 },
    extraversion: { mean: 28.4, std: 6.2 },
    agreeableness: { mean: 32.1, std: 5.3 },
    neuroticism: { mean: 26.8, std: 6.8 },
    
    // 子维度常模
    facets: {
      // 开放性子维度
      o1_fantasy: { mean: 4.2, std: 1.1 },
      o2_aesthetics: { mean: 4.5, std: 1.2 },
      o3_feelings: { mean: 4.8, std: 1.0 },
      o4_actions: { mean: 3.9, std: 1.3 },
      o5_ideas: { mean: 4.6, std: 1.2 },
      o6_values: { mean: 4.1, std: 1.1 },
      
      // 尽责性子维度
      c1_competence: { mean: 4.7, std: 0.9 },
      c2_order: { mean: 4.3, std: 1.2 },
      c3_dutifulness: { mean: 4.8, std: 0.8 },
      c4_achievement: { mean: 4.5, std: 1.1 },
      c5_self_discipline: { mean: 4.2, std: 1.2 },
      c6_deliberation: { mean: 4.4, std: 1.0 },
      
      // 外向性子维度
      e1_warmth: { mean: 4.6, std: 1.0 },
      e2_gregariousness: { mean: 4.2, std: 1.3 },
      e3_assertiveness: { mean: 4.1, std: 1.2 },
      e4_activity: { mean: 4.3, std: 1.1 },
      e5_excitement: { mean: 3.8, std: 1.4 },
      e6_positive_emotions: { mean: 4.5, std: 1.0 },
      
      // 宜人性子维度
      a1_trust: { mean: 4.4, std: 1.1 },
      a2_straightforwardness: { mean: 4.7, std: 0.9 },
      a3_altruism: { mean: 4.8, std: 0.8 },
      a4_compliance: { mean: 4.3, std: 1.1 },
      a5_modesty: { mean: 4.6, std: 0.9 },
      a6_tender_mindedness: { mean: 4.9, std: 0.7 },
      
      // 神经质子维度
      n1_anxiety: { mean: 4.1, std: 1.3 },
      n2_anger: { mean: 3.8, std: 1.3 },
      n3_depression: { mean: 3.5, std: 1.4 },
      n4_self_consciousness: { mean: 4.0, std: 1.2 },
      n5_impulsiveness: { mean: 4.2, std: 1.1 },
      n6_vulnerability: { mean: 3.6, std: 1.3 },
    }
  },
  
  // 依恋风格常模 (基于ECR中文版)
  attachment: {
    anxiety: { mean: 3.5, std: 1.0 },
    avoidance: { mean: 3.2, std: 0.9 }
  },
  
  // 价值观常模 (基于Schwartz PVQ中文版)
  values: {
    power: { mean: 3.8, std: 1.1 },
    achievement: { mean: 4.2, std: 1.0 },
    hedonism: { mean: 4.5, std: 1.0 },
    stimulation: { mean: 4.0, std: 1.2 },
    self_direction: { mean: 4.6, std: 0.9 },
    universalism: { mean: 4.3, std: 1.0 },
    benevolence: { mean: 4.7, std: 0.8 },
    tradition: { mean: 3.9, std: 1.1 },
    conformity: { mean: 4.0, std: 1.0 },
    security: { mean: 4.4, std: 0.9 }
  }
}

// ============================================
// 计分函数
// ============================================

/**
 * 计算单题得分
 */
export function calculateQuestionScore(
  answer: any,
  questionType: string,
  scoringMethod: string,
  options?: any[]
): number {
  switch (questionType) {
    case 'single_choice':
      return calculateSingleChoiceScore(answer, scoringMethod, options)
    
    case 'multiple_choice':
      return calculateMultipleChoiceScore(answer, options)
    
    case 'likert_5':
    case 'likert_7':
      return calculateLikertScore(answer, questionType, scoringMethod)
    
    case 'slider_100':
      return answer.value / 100
    
    case 'ranking':
      return calculateRankingScore(answer)
    
    case 'semantic_differential':
      return calculateSemanticDiffScore(answer)
    
    case 'forced_choice':
      return answer.value
    
    default:
      return 0
  }
}

/**
 * 单选题计分
 */
function calculateSingleChoiceScore(
  answer: any,
  scoringMethod: string,
  options?: any[]
): number {
  if (!options) return 0
  
  const option = options.find(o => o.value === answer.value)
  if (!option) return 0
  
  let score = option.score || 0
  
  // 反向计分
  if (scoringMethod === 'reverse') {
    const maxScore = Math.max(...options.map(o => o.score || 0))
    score = maxScore - score + 1
  }
  
  return score
}

/**
 * 多选题计分 (Jaccard相似度思想)
 */
function calculateMultipleChoiceScore(
  answer: any,
  options?: any[]
): number {
  if (!answer.values || !options) return 0
  
  // 计算选中选项的平均分数
  const selectedOptions = options.filter(o => answer.values.includes(o.value))
  if (selectedOptions.length === 0) return 0
  
  const avgScore = selectedOptions.reduce((sum, o) => sum + (o.score || 0), 0) / selectedOptions.length
  return avgScore
}

/**
 * 李克特量表计分
 */
function calculateLikertScore(
  answer: any,
  questionType: string,
  scoringMethod: string
): number {
  const maxValue = questionType === 'likert_5' ? 5 : 7
  let score = answer.value
  
  // 反向计分
  if (scoringMethod === 'reverse') {
    score = maxValue - score + 1
  }
  
  return score
}

/**
 * 排序题计分 (位置加权)
 */
function calculateRankingScore(answer: any): number {
  if (!answer.order || answer.order.length === 0) return 0
  
  // 排序越靠前，得分越高
  const n = answer.order.length
  let score = 0
  
  answer.order.forEach((item: string, index: number) => {
    // 第一名得n分，第二名得n-1分...
    score += (n - index)
  })
  
  // 归一化到 0-1
  return score / (n * (n + 1) / 2)
}

/**
 * 语义差异量表计分
 */
function calculateSemanticDiffScore(answer: any): number {
  // 1-7量表
  return answer.value
}

// ============================================
// 维度得分计算
// ============================================

/**
 * 计算维度总分
 */
export function calculateDimensionScore(
  answers: QuestionAnswer[],
  dimensionCode: string
): DimensionScore {
  const dimensionAnswers = answers.filter(a => a.dimension === dimensionCode)
  
  if (dimensionAnswers.length === 0) {
    return {
      dimension: dimensionCode,
      rawScore: 0,
      normalizedScore: 50, // 默认平均值
      percentile: 50,
      confidence: 0
    }
  }
  
  // 计算原始分数
  const rawScore = dimensionAnswers.reduce((sum, a) => {
    const questionScore = calculateQuestionScore(
      a.answer,
      a.questionType,
      a.scoringMethod,
      a.options
    )
    return sum + questionScore
  }, 0)
  
  // 标准化为T分数
  const norm = NORMS.bigFive[dimensionCode as keyof typeof NORMS.bigFive]
  const mean = (norm as any)?.mean || 25
  const std = (norm as any)?.std || 5
  const normalizedScore = calculateTScore(rawScore, mean, std)
  
  // 计算百分位数
  const percentile = tScoreToPercentile(normalizedScore)
  
  // 计算置信度 (基于题目数量)
  const confidence = Math.min(1, dimensionAnswers.length / 10)
  
  // 计算子维度分数
  const facets = calculateFacetScores(dimensionAnswers)
  
  return {
    dimension: dimensionCode,
    rawScore,
    normalizedScore,
    percentile,
    confidence,
    facets
  }
}

/**
 * 计算子维度分数
 */
function calculateFacetScores(answers: QuestionAnswer[]): Record<string, number> {
  const facetScores: Record<string, number[]> = {}
  
  // 按子维度分组
  answers.forEach(a => {
    if (a.measuresFacet) {
      if (!facetScores[a.measuresFacet]) {
        facetScores[a.measuresFacet] = []
      }
      const score = calculateQuestionScore(
        a.answer,
        a.questionType,
        a.scoringMethod,
        a.options
      )
      facetScores[a.measuresFacet].push(score)
    }
  })
  
  // 计算每个子维度的平均分
  const result: Record<string, number> = {}
  Object.entries(facetScores).forEach(([facet, scores]) => {
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
    
    // 标准化
    const normKey = facet.toLowerCase() as keyof typeof NORMS.bigFive.facets
    const norm = NORMS.bigFive.facets[normKey]
    if (norm) {
      result[facet] = calculateTScore(avgScore, norm.mean, norm.std)
    } else {
      result[facet] = avgScore * 10 // 简单归一化
    }
  })
  
  return result
}

/**
 * T分数计算
 * T = 50 + 10 * (X - μ) / σ
 */
export function calculateTScore(
  rawScore: number,
  populationMean: number,
  populationStd: number
): number {
  const zScore = (rawScore - populationMean) / populationStd
  return Math.round((50 + 10 * zScore) * 100) / 100
}

/**
 * T分数转百分位数
 */
export function tScoreToPercentile(tScore: number): number {
  // T分数服从均值为50，标准差为10的正态分布
  const zScore = (tScore - 50) / 10
  
  // 使用近似公式计算累积分布函数
  const percentile = normalCDF(zScore) * 100
  return Math.round(percentile * 100) / 100
}

/**
 * 标准正态分布累积分布函数近似
 */
function normalCDF(z: number): number {
  // 使用误差函数近似
  const a1 =  0.254829592
  const a2 = -0.284496736
  const a3 =  1.421413741
  const a4 = -1.453152027
  const a5 =  1.061405429
  const p  =  0.3275911

  const sign = z < 0 ? -1 : 1
  z = Math.abs(z) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * z)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z)

  return 0.5 * (1.0 + sign * y)
}

// ============================================
// 大五人格计算
// ============================================

/**
 * 计算完整大五人格档案
 */
export function calculateBigFiveProfile(
  answers: QuestionAnswer[]
): {
  openness: DimensionScore
  conscientiousness: DimensionScore
  extraversion: DimensionScore
  agreeableness: DimensionScore
  neuroticism: DimensionScore
} {
  return {
    openness: calculateDimensionScore(answers, 'openness'),
    conscientiousness: calculateDimensionScore(answers, 'conscientiousness'),
    extraversion: calculateDimensionScore(answers, 'extraversion'),
    agreeableness: calculateDimensionScore(answers, 'agreeableness'),
    neuroticism: calculateDimensionScore(answers, 'neuroticism')
  }
}

/**
 * 推断MBTI类型 (基于大五人格)
 */
export function inferMBTIType(
  profile: {
    openness: DimensionScore
    conscientiousness: DimensionScore
    extraversion: DimensionScore
    agreeableness: DimensionScore
    neuroticism: DimensionScore
  }
): string {
  // E/I: 基于外向性
  const ei = profile.extraversion.normalizedScore > 50 ? 'E' : 'I'
  
  // S/N: 基于开放性 (低开放性 = S, 高开放性 = N)
  const sn = profile.openness.normalizedScore > 50 ? 'N' : 'S'
  
  // T/F: 基于宜人性 (低宜人性 = T, 高宜人性 = F)
  const tf = profile.agreeableness.normalizedScore > 50 ? 'F' : 'T'
  
  // J/P: 基于尽责性 (高尽责性 = J, 低尽责性 = P)
  const jp = profile.conscientiousness.normalizedScore > 50 ? 'J' : 'P'
  
  return ei + sn + tf + jp
}

// ============================================
// 依恋风格计算
// ============================================

/**
 * 计算依恋风格
 */
export function calculateAttachmentStyle(
  answers: QuestionAnswer[]
): {
  style: 'secure' | 'anxious' | 'avoidant' | 'fearful_avoidant'
  anxiety: number
  avoidance: number
} {
  // 分离焦虑和回避维度的问题
  const anxietyAnswers = answers.filter(a => a.measuresTrait === 'attachment_anxiety')
  const avoidanceAnswers = answers.filter(a => a.measuresTrait === 'attachment_avoidance')
  
  // 计算各维度得分
  let anxietyScore = 0
  anxietyAnswers.forEach(a => {
    anxietyScore += calculateQuestionScore(a.answer, a.questionType, a.scoringMethod, a.options)
  })
  anxietyScore = anxietyAnswers.length > 0 ? anxietyScore / anxietyAnswers.length : 3
  
  let avoidanceScore = 0
  avoidanceAnswers.forEach(a => {
    avoidanceScore += calculateQuestionScore(a.answer, a.questionType, a.scoringMethod, a.options)
  })
  avoidanceScore = avoidanceAnswers.length > 0 ? avoidanceScore / avoidanceAnswers.length : 3
  
  // 标准化
  const anxietyNorm = NORMS.attachment.anxiety
  const avoidanceNorm = NORMS.attachment.avoidance
  
  const anxiety = calculateTScore(anxietyScore, anxietyNorm.mean, anxietyNorm.std)
  const avoidance = calculateTScore(avoidanceScore, avoidanceNorm.mean, avoidanceNorm.std)
  
  // 判断依恋类型
  // 基于四象限模型
  const anxietyHigh = anxiety > 50
  const avoidanceHigh = avoidance > 50
  
  let style: 'secure' | 'anxious' | 'avoidant' | 'fearful_avoidant'
  if (!anxietyHigh && !avoidanceHigh) {
    style = 'secure' // 安全型
  } else if (anxietyHigh && !avoidanceHigh) {
    style = 'anxious' // 焦虑型
  } else if (!anxietyHigh && avoidanceHigh) {
    style = 'avoidant' // 回避型
  } else {
    style = 'fearful_avoidant' // 恐惧型
  }
  
  return { style, anxiety, avoidance }
}

// ============================================
// 价值观计算
// ============================================

/**
 * 计算Schwartz价值观档案
 */
export function calculateValuesProfile(
  answers: QuestionAnswer[]
): {
  profile: Record<string, number>
  dominantType: string
} {
  const valuesDimensions = [
    'power', 'achievement', 'hedonism', 'stimulation',
    'self_direction', 'universalism', 'benevolence',
    'tradition', 'conformity', 'security'
  ]
  
  const profile: Record<string, number> = {}
  
  valuesDimensions.forEach(dim => {
    const dimAnswers = answers.filter(a => a.measuresTrait === `values_${dim}`)
    
    if (dimAnswers.length > 0) {
      let score = 0
      dimAnswers.forEach(a => {
        score += calculateQuestionScore(a.answer, a.questionType, a.scoringMethod, a.options)
      })
      score = score / dimAnswers.length
      
      // 标准化
      const norm = NORMS.values[dim as keyof typeof NORMS.values]
      profile[dim] = calculateTScore(score, norm.mean, norm.std)
    } else {
      profile[dim] = 50
    }
  })
  
  // 找出主导价值观
  let maxValue = -Infinity
  let dominantType = 'self_direction'
  
  Object.entries(profile).forEach(([type, value]) => {
    if (value > maxValue) {
      maxValue = value
      dominantType = type
    }
  })
  
  return { profile, dominantType }
}

// ============================================
// 完整用户画像生成
// ============================================

/**
 * 生成完整用户人格画像
 */
export function generatePersonalityProfile(
  answers: QuestionAnswer[]
): PersonalityProfile {
  // 大五人格
  const bigFive = calculateBigFiveProfile(answers)
  
  // MBTI推断
  const mbtiType = inferMBTIType(bigFive)
  
  // 依恋风格
  const attachment = calculateAttachmentStyle(answers)
  
  // 价值观
  const values = calculateValuesProfile(answers)
  
  // 完整度
  const totalQuestions = 66
  const questionsAnswered = answers.length
  const completenessScore = Math.round((questionsAnswered / totalQuestions) * 100)
  
  // 置信度 (基于必需问题完成比例)
  const requiredQuestions = answers.filter(a => true).length // 实际应有必需标记
  const confidenceScore = Math.round((requiredQuestions / 50) * 100) // 假设50道必需题
  
  return {
    ...bigFive,
    attachmentStyle: attachment.style,
    attachmentAnxiety: attachment.anxiety,
    attachmentAvoidance: attachment.avoidance,
    valuesProfile: values.profile,
    dominantValueType: values.dominantType,
    questionnaireCompleted: questionsAnswered >= 66,
    questionsAnswered,
    completenessScore,
    confidenceScore: Math.min(100, confidenceScore)
  }
}

// ============================================
// 导出
// ============================================

export {
  NORMS,
  normalCDF
}
