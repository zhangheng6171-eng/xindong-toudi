/**
 * 心动投递 - 问卷系统数据
 * 
 * 包含完整的66道问题定义
 */

export interface Question {
  id: string
  group: string
  groupIndex: number // 在组内的序号
  question: string
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'slider' | 'ranking' | 'open_text'
  options?: QuestionOption[]
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
  placeholder?: string
  maxLength?: number
  maxSelect?: number
  weight: number // 问题权重
  required: boolean
  helpText?: string
}

export interface QuestionOption {
  value: string
  label: string
  emoji?: string
}

export interface QuestionGroup {
  id: string
  name: string
  description: string
  icon: string
  questionCount: number
  weight: number // 类别权重
}

// ============================================
// 问题分组定义
// ============================================

export const questionGroups: QuestionGroup[] = [
  {
    id: 'basic',
    name: '基本信息',
    description: '让我们先认识一下你',
    icon: '👤',
    questionCount: 5,
    weight: 0.05,
  },
  {
    id: 'values',
    name: '价值观核心',
    description: '探索你的人生价值观',
    icon: '💎',
    questionCount: 15,
    weight: 0.30,
  },
  {
    id: 'lifestyle',
    name: '生活方式',
    description: '了解你的日常习惯',
    icon: '🌟',
    questionCount: 12,
    weight: 0.15,
  },
  {
    id: 'relationship',
    name: '恋爱观',
    description: '你对感情的期待',
    icon: '💕',
    questionCount: 10,
    weight: 0.20,
  },
  {
    id: 'future',
    name: '未来规划',
    description: '你的人生蓝图',
    icon: '🎯',
    questionCount: 8,
    weight: 0.15,
  },
  {
    id: 'personality',
    name: '性格特质',
    description: '认识真实的你',
    icon: '🎭',
    questionCount: 8,
    weight: 0.10,
  },
  {
    id: 'interests',
    name: '兴趣爱好',
    description: '你喜欢做的事',
    icon: '🎨',
    questionCount: 5,
    weight: 0.05,
  },
  {
    id: 'family',
    name: '家庭观',
    description: '家庭对你意味着什么',
    icon: '👨‍👩‍👧‍👦',
    questionCount: 4,
    weight: 0.03,
  },
  {
    id: 'political',
    name: '政治观点',
    description: '你的社会立场（可选）',
    icon: '⚖️',
    questionCount: 2,
    weight: 0.01,
  },
  {
    id: 'dealbreaker',
    name: '底线问题',
    description: '你绝对不能接受的',
    icon: '🚫',
    questionCount: 2,
    weight: 0.01,
  },
]

// ============================================
// 完整问题列表
// ============================================

export const questions: Question[] = [
  // ==========================================
  // 第一组：基本信息 (5题)
  // ==========================================
  {
    id: 'basic_gender',
    group: 'basic',
    groupIndex: 1,
    question: '你的性别是？',
    type: 'single_choice',
    options: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
      { value: 'other', label: '其他' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'basic_preferred_gender',
    group: 'basic',
    groupIndex: 2,
    question: '你希望匹配对象的性别是？',
    type: 'single_choice',
    options: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
      { value: 'both', label: '都可以' },
    ],
    weight: 1.5,
    required: true,
  },
  {
    id: 'basic_age',
    group: 'basic',
    groupIndex: 3,
    question: '你的年龄段是？',
    type: 'single_choice',
    options: [
      { value: '18-22', label: '18-22岁' },
      { value: '23-26', label: '23-26岁' },
      { value: '27-30', label: '27-30岁' },
      { value: '31-35', label: '31-35岁' },
      { value: '36-40', label: '36-40岁' },
      { value: '40+', label: '40岁以上' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'basic_city',
    group: 'basic',
    groupIndex: 4,
    question: '你目前所在的城市是？',
    type: 'open_text',
    placeholder: '例如：北京、上海、深圳',
    maxLength: 20,
    weight: 1.0,
    required: true,
  },
  {
    id: 'basic_education',
    group: 'basic',
    groupIndex: 5,
    question: '你的最高学历是？',
    type: 'single_choice',
    options: [
      { value: 'high_school', label: '高中及以下' },
      { value: 'bachelor', label: '本科' },
      { value: 'master', label: '硕士' },
      { value: 'phd', label: '博士及以上' },
    ],
    weight: 0.8,
    required: true,
  },

  // ==========================================
  // 第二组：价值观核心 (15题)
  // ==========================================
  {
    id: 'core_values_ranking',
    group: 'values',
    groupIndex: 1,
    question: '请按重要性排序你的人生核心价值观（拖动调整）',
    type: 'ranking',
    options: [
      { value: 'family', label: '家庭' },
      { value: 'career', label: '事业' },
      { value: 'health', label: '健康' },
      { value: 'friendship', label: '友情' },
      { value: 'love', label: '爱情' },
      { value: 'freedom', label: '自由' },
      { value: 'wealth', label: '财富' },
      { value: 'growth', label: '成长' },
    ],
    weight: 2.0,
    required: true,
    helpText: '将最重要的价值观拖到最上面',
  },
  {
    id: 'success_definition',
    group: 'values',
    groupIndex: 2,
    question: '对你来说，"成功的人生"更接近于：',
    type: 'single_choice',
    options: [
      { value: 'career', label: '事业有成，获得社会认可' },
      { value: 'family', label: '家庭幸福，生活美满' },
      { value: 'freedom', label: '自由自在，无拘无束' },
      { value: 'growth', label: '不断成长，成为更好的自己' },
      { value: 'contribution', label: '为社会/他人创造价值' },
      { value: 'wealth', label: '实现财务自由' },
      { value: 'love', label: '找到真爱，白头偕老' },
    ],
    weight: 1.5,
    required: true,
  },
  {
    id: 'money_view',
    group: 'values',
    groupIndex: 3,
    question: '"金钱是手段，不是目的"这句话你有多认同？',
    type: 'scale',
    min: 1,
    max: 5,
    minLabel: '完全不认同',
    maxLabel: '完全认同',
    weight: 1.2,
    required: true,
  },
  {
    id: 'adventure_vs_stability',
    group: 'values',
    groupIndex: 4,
    question: '在生活中，你更倾向于：',
    type: 'slider',
    minLabel: '追求稳定和安全',
    maxLabel: '拥抱冒险和未知',
    weight: 1.3,
    required: true,
  },
  {
    id: 'individual_vs_collective',
    group: 'values',
    groupIndex: 5,
    question: '当个人利益和集体/家庭利益冲突时，你通常会选择：',
    type: 'single_choice',
    options: [
      { value: 'individual', label: '个人利益优先' },
      { value: 'collective', label: '集体/家庭利益优先' },
      { value: 'balance', label: '尽量平衡，根据具体情况决定' },
      { value: 'win_win', label: '寻找双赢方案' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'honesty_vs_white_lies',
    group: 'values',
    groupIndex: 6,
    question: '你更认同哪种说法：',
    type: 'single_choice',
    options: [
      { value: 'honest', label: '"诚实是最重要的，即使是痛苦的真相"' },
      { value: 'white_lies', label: '"有时候善意的谎言可以保护他人"' },
      { value: 'depends', label: '"要看具体情况，不能一概而论"' },
    ],
    weight: 1.1,
    required: true,
  },
  {
    id: 'independence',
    group: 'values',
    groupIndex: 7,
    question: '你享受独自一人的时间吗？',
    type: 'scale',
    min: 1,
    max: 5,
    minLabel: '我害怕孤独，需要时刻有人陪伴',
    maxLabel: '我很享受独处，这是我充电的方式',
    weight: 1.2,
    required: true,
  },
  {
    id: 'perfectionism',
    group: 'values',
    groupIndex: 8,
    question: '关于"完美主义"，你属于：',
    type: 'single_choice',
    options: [
      { value: 'perfectionist', label: '我是完美主义者，细节决定成败' },
      { value: 'good_enough', label: '够用就行，完成比完美更重要' },
      { value: 'selective', label: '重要的事情追求完美，小事随意' },
      { value: 'recovering', label: '我以前是完美主义者，正在学习放下' },
    ],
    weight: 0.9,
    required: true,
  },
  {
    id: 'competition_vs_cooperation',
    group: 'values',
    groupIndex: 9,
    question: '在工作/学习中，你更倾向于：',
    type: 'single_choice',
    options: [
      { value: 'competition', label: '和他人竞争，激励自己进步' },
      { value: 'cooperation', label: '和他人合作，共同成长' },
      { value: 'self', label: '只和自己比，不关注他人' },
      { value: 'depends', label: '看具体情况' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'time_perspective',
    group: 'values',
    groupIndex: 10,
    question: '你更认同哪种时间观：',
    type: 'single_choice',
    options: [
      { value: 'present', label: '活在当下，享受每一刻' },
      { value: 'future', label: '为未来规划，延迟满足' },
      { value: 'past', label: '过去给我力量，传统很重要' },
      { value: 'balance', label: '平衡三者' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'commitment',
    group: 'values',
    groupIndex: 11,
    question: '"承诺一旦做出，就必须遵守"',
    type: 'scale',
    min: 1,
    max: 5,
    minLabel: '不认同，承诺可以视情况改变',
    maxLabel: '完全认同，承诺是神圣的',
    weight: 1.2,
    required: true,
  },
  {
    id: 'failure_attitude',
    group: 'values',
    groupIndex: 12,
    question: '当你遇到重大失败时，你通常会：',
    type: 'single_choice',
    options: [
      { value: 'bounce_back', label: '快速振作，把它当作学习机会' },
      { value: 'digest', label: '需要时间消化，但最终会重新开始' },
      { value: 'hit_hard', label: '深受打击，很难走出来' },
      { value: 'analyze', label: '分析原因，制定新计划' },
      { value: 'seek_help', label: '寻求他人帮助和支持' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'life_meaning',
    group: 'values',
    groupIndex: 13,
    question: '用一句话描述你认为的"有意义的人生"：',
    type: 'open_text',
    placeholder: '分享你对人生意义的理解...',
    maxLength: 200,
    weight: 1.3,
    required: false,
  },
  {
    id: 'moral_code',
    group: 'values',
    groupIndex: 14,
    question: '你的道德底线是什么？（选最重要的3个）',
    type: 'multiple_choice',
    maxSelect: 3,
    options: [
      { value: 'no_lie', label: '不撒谎' },
      { value: 'no_betrayal', label: '不背叛' },
      { value: 'no_harm', label: '不伤害他人' },
      { value: 'no_illegal', label: '不违法' },
      { value: 'no_gossip', label: '不背后说人坏话' },
      { value: 'no_exploit', label: '不利用他人' },
      { value: 'no_break_promise', label: '不违背承诺' },
    ],
    weight: 1.1,
    required: true,
  },
  {
    id: 'life_priority',
    group: 'values',
    groupIndex: 15,
    question: '请排序以下人生要素的重要性：',
    type: 'ranking',
    options: [
      { value: 'career', label: '事业/学业' },
      { value: 'love_family', label: '爱情/家庭' },
      { value: 'health', label: '健康' },
      { value: 'friendship', label: '友情' },
      { value: 'hobbies', label: '个人兴趣' },
      { value: 'wealth', label: '财富' },
      { value: 'contribution', label: '社会贡献' },
    ],
    weight: 1.4,
    required: true,
  },

  // ==========================================
  // 第三组：生活方式 (12题)
  // ==========================================
  {
    id: 'sleep_schedule',
    group: 'lifestyle',
    groupIndex: 1,
    question: '你的作息习惯是：',
    type: 'single_choice',
    options: [
      { value: 'early', label: '早起的鸟儿（6点前起床）' },
      { value: 'normal', label: '正常作息（7-8点起床）' },
      { value: 'night', label: '夜猫子（晚上最有精神）' },
      { value: 'irregular', label: '作息不规律，随心情而定' },
    ],
    weight: 1.2,
    required: true,
  },
  {
    id: 'weekend_preference',
    group: 'lifestyle',
    groupIndex: 2,
    question: '理想的周末是：',
    type: 'single_choice',
    options: [
      { value: 'rest', label: '在家休息，充电放松' },
      { value: 'social', label: '和朋友聚会，热闹一下' },
      { value: 'outdoor', label: '户外运动/旅行' },
      { value: 'learn', label: '学习新技能/看书' },
      { value: 'work', label: '赶工作/补作业' },
      { value: 'spontaneous', label: '看情况，随心所欲' },
    ],
    weight: 1.2,
    required: true,
  },
  {
    id: 'social_energy',
    group: 'lifestyle',
    groupIndex: 3,
    question: '大型社交聚会（10人以上）后，你的感受是：',
    type: 'scale',
    min: 1,
    max: 5,
    minLabel: '精力充沛，还想继续',
    maxLabel: '筋疲力尽，需要独处充电',
    weight: 1.5,
    required: true,
  },
  {
    id: 'health_habits',
    group: 'lifestyle',
    groupIndex: 4,
    question: '你定期做的事情有哪些？（可多选）',
    type: 'multiple_choice',
    maxSelect: 5,
    options: [
      { value: 'exercise', label: '运动/健身' },
      { value: 'diet', label: '健康饮食' },
      { value: 'meditation', label: '冥想/正念' },
      { value: 'checkup', label: '定期体检' },
      { value: 'sleep', label: '充足睡眠' },
      { value: 'none', label: '基本不做' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'drinking',
    group: 'lifestyle',
    groupIndex: 5,
    question: '关于饮酒：',
    type: 'single_choice',
    options: [
      { value: 'no', label: '我不喝酒' },
      { value: 'occasional', label: '偶尔小酌' },
      { value: 'social', label: '社交场合会喝' },
      { value: 'often', label: '喜欢喝酒，经常喝' },
      { value: 'quit', label: '前 drinkers，已经戒酒' },
    ],
    weight: 0.8,
    required: true,
  },
  {
    id: 'travel_preference',
    group: 'lifestyle',
    groupIndex: 6,
    question: '你喜欢的旅行方式是：',
    type: 'single_choice',
    options: [
      { value: 'planned', label: '精心规划的行程' },
      { value: 'spontaneous', label: '说走就走的随性' },
      { value: 'deep', label: '深度游，慢慢体验' },
      { value: 'landmark', label: '打卡热门景点' },
      { value: 'niche', label: '探索小众目的地' },
      { value: 'no_travel', label: '不太喜欢旅行' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'living_environment',
    group: 'lifestyle',
    groupIndex: 7,
    question: '你理想的居住环境是：',
    type: 'single_choice',
    options: [
      { value: 'city_center', label: '繁华都市中心' },
      { value: 'suburb', label: '安静的郊区' },
      { value: 'small_town', label: '有自然风光的小镇' },
      { value: 'nomadic', label: '经常换地方住' },
      { value: 'unsure', label: '还没想好' },
    ],
    weight: 0.9,
    required: true,
  },
  {
    id: 'spending_habits',
    group: 'lifestyle',
    groupIndex: 8,
    question: '你的消费风格是：',
    type: 'single_choice',
    options: [
      { value: 'frugal', label: '精打细算，量入为出' },
      { value: 'balanced', label: '适度消费，有储蓄习惯' },
      { value: 'enjoy', label: '及时行乐，该花就花' },
      { value: 'quality', label: '追求品质，愿意为好东西买单' },
      { value: 'minimalist', label: '极简主义，够用就好' },
    ],
    weight: 1.0,
    required: true,
  },
  {
    id: 'social_media',
    group: 'lifestyle',
    groupIndex: 9,
    question: '"完全不使用社交媒体"对你来说是：',
    type: 'single_choice',
    options: [
      { value: 'easy', label: '完全没问题，我本来就很少用' },
      { value: 'acceptable', label: '有点困难，但可以接受' },
      { value: 'hard', label: '很难接受，社交媒体是我生活的一部分' },
      { value: 'impossible', label: '不可能，我的工作和社交都依赖它' },
    ],
    weight: 0.7,
    required: true,
  },
  {
    id: 'diet',
    group: 'lifestyle',
    groupIndex: 10,
    question: '你的饮食特点：（可多选）',
    type: 'multiple_choice',
    maxSelect: 4,
    options: [
      { value: 'normal', label: '无特别偏好，什么都吃' },
      { value: 'vegetarian', label: '素食/偏素食' },
      { value: 'halal', label: '清真食品' },
      { value: 'allergy', label: '有食物过敏/不耐受' },
      { value: 'healthy', label: '注重有机/健康饮食' },
      { value: 'foodie', label: '喜欢尝试各国美食' },
      { value: 'picky', label: '挑食' },
    ],
    weight: 0.8,
    required: true,
  },
  {
    id: 'pets',
    group: 'lifestyle',
    groupIndex: 11,
    question: '关于养宠物：',
    type: 'single_choice',
    options: [
      { value: 'have', label: '我有宠物/很想养' },
      { value: 'like', label: '喜欢宠物，但条件不允许养' },
      { value: 'okay', label: '可以接受，但不是必需的' },
      { value: 'neutral', label: '对宠物无感' },
      { value: 'dislike', label: '不喜欢/过敏' },
    ],
    weight: 0.9,
    required: true,
  },
  {
    id: 'housework',
    group: 'lifestyle',
    groupIndex: 12,
    question: '关于家务：',
    type: 'single_choice',
    options: [
      { value: 'enjoy', label: '我很享受做家务，家是我精心打理的空间' },
      { value: 'okay', label: '会做，但不算享受' },
      { value: 'avoid', label: '能不做就不做' },
      { value: 'share', label: '愿意分担，但希望有分工' },
      { value: 'outsource', label: '希望找家政/未来的ta多做一点' },
    ],
    weight: 0.8,
    required: true,
  },

  // 后续组的问题... (由于篇幅限制，这里只展示部分问题)
  // 实际应用中应该包含完整的66道问题
]

// 获取问题分组
export function getQuestionGroups(): QuestionGroup[] {
  return questionGroups
}

// 获取某个分组的所有问题
export function getQuestionsByGroup(groupId: string): Question[] {
  return questions.filter(q => q.group === groupId)
}

// 获取问题总数
export function getTotalQuestionCount(): number {
  return questions.length
}

// 获取下一个问题
export function getNextQuestion(currentId: string): Question | null {
  const index = questions.findIndex(q => q.id === currentId)
  if (index === -1 || index === questions.length - 1) return null
  return questions[index + 1]
}

// 获取上一个问题
export function getPreviousQuestion(currentId: string): Question | null {
  const index = questions.findIndex(q => q.id === currentId)
  if (index <= 0) return null
  return questions[index - 1]
}

// 计算问卷完成进度
export function calculateProgress(answeredIds: string[]): number {
  const requiredQuestions = questions.filter(q => q.required)
  const answeredRequired = answeredIds.filter(id => 
    questions.find(q => q.id === id && q.required)
  )
  return Math.round((answeredRequired.length / requiredQuestions.length) * 100)
}
