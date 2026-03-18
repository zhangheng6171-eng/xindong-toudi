-- ============================================================
-- 心动投递 - 完整问卷系统数据库设计
-- 基于66道心理学专业问题
-- ============================================================

-- ============================================
-- 一、问卷维度定义表
-- ============================================

CREATE TABLE questionnaire_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  
  -- 大五人格映射
  big_five_mapping VARCHAR(50), -- 'O', 'C', 'E', 'A', 'N' 或组合
  
  -- 权重配置
  match_weight DECIMAL(4, 3) NOT NULL, -- 在匹配中的权重
  min_questions INT DEFAULT 5,
  max_questions INT DEFAULT 20,
  
  -- 显示配置
  display_order INT NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(20),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始化维度数据
INSERT INTO questionnaire_dimensions (code, name, name_en, description, big_five_mapping, match_weight, display_order, icon, color) VALUES
('VALUES', '价值观核心', 'Core Values', '人生核心价值观，决定长期关系走向', NULL, 0.25, 1, '💎', '#FF6B9D'),
('PERSONALITY', '性格特质', 'Personality Traits', '基于大五人格的性格维度分析', 'OCEAN', 0.20, 2, '🎭', '#B794F6'),
('RELATIONSHIP', '恋爱观', 'Relationship Views', '对感情的态度和期待', 'A', 0.15, 3, '💕', '#F97316'),
('LIFESTYLE', '生活方式', 'Lifestyle', '日常生活习惯和节奏', 'C', 0.15, 4, '🌟', '#48BB78'),
('INTERESTS', '兴趣爱好', 'Interests', '兴趣爱好和生活品味', 'O', 0.10, 5, '🎨', '#38B2AC'),
('FAMILY', '家庭观', 'Family Views', '家庭观念和亲子态度', 'A', 0.08, 6, '👨‍👩‍👧‍👦', '#ED8936'),
('DEALBREAKER', '底线与偏好', 'Deal-breakers & Preferences', '不可妥协的底线和个人偏好', NULL, 0.07, 7, '🚫', '#E53E3E');

-- ============================================
-- 二、问卷问题主表
-- ============================================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 问题编号和分类
  code VARCHAR(20) UNIQUE NOT NULL, -- 如 Q01, Q02...
  dimension_code VARCHAR(50) NOT NULL REFERENCES questionnaire_dimensions(code),
  group_code VARCHAR(50), -- 子分组，如 'values_career', 'personality_social'
  sequence_in_dimension INT NOT NULL, -- 在维度内的序号
  
  -- 问题内容
  question_text TEXT NOT NULL,
  question_text_en TEXT, -- 英文原文（如果是从国外量表翻译）
  help_text TEXT, -- 帮助说明
  
  -- 问题类型
  question_type VARCHAR(30) NOT NULL CHECK (question_type IN (
    'single_choice',      -- 单选
    'multiple_choice',    -- 多选
    'likert_5',          -- 李克特5点量表
    'likert_7',          -- 李克特7点量表
    'slider_100',        -- 0-100滑块
    'ranking',           -- 排序
    'open_text',         -- 开放文本
    'semantic_differential', -- 语义差异量表
    'forced_choice'      -- 强迫选择
  )),
  
  -- 心理学量表来源
  scale_source VARCHAR(100), -- 如 'NEO-PI-R', 'ECR', 'Schwartz PVQ'
  scale_reference TEXT, -- 文献引用
  adapted_from TEXT, -- 改编自哪道经典问题
  
  -- 选项配置 (JSONB格式)
  options JSONB, -- 选项列表
  /*
    单选/多选格式:
    [
      {"value": "A", "label": "选项A", "score": 1},
      {"value": "B", "label": "选项B", "score": 2}
    ]
    
    量表格式:
    {
      "min": 1, "max": 5,
      "minLabel": "完全不同意", "maxLabel": "完全同意"
    }
    
    排序格式:
    ["项目A", "项目B", "项目C"]
  */
  
  -- 评分配置
  scoring_method VARCHAR(30) NOT NULL DEFAULT 'direct' CHECK (scoring_method IN (
    'direct',       -- 直接计分
    'reverse',      -- 反向计分
    'weighted',     -- 加权计分
    'factor_based'  -- 因子分析计分
  )),
  
  -- 权重
  dimension_weight DECIMAL(4, 3) DEFAULT 1.0, -- 在维度内的权重
  global_weight DECIMAL(4, 3) DEFAULT 1.0,    -- 全局权重
  
  -- 测量维度 (大五人格子维度等)
  measures_trait VARCHAR(100), -- 如 'extraversion', 'conscientiousness'
  measures_facet VARCHAR(100), -- 如 'gregariousness', 'orderliness'
  
  -- 题目属性
  is_required BOOLEAN DEFAULT TRUE,
  is_core BOOLEAN DEFAULT FALSE, -- 是否核心问题
  is_sensitive BOOLEAN DEFAULT FALSE, -- 是否敏感问题
  show_condition JSONB, -- 显示条件
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(dimension_code, sequence_in_dimension)
);

-- 索引
CREATE INDEX idx_questions_dimension ON questions(dimension_code);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_trait ON questions(measures_trait);
CREATE INDEX idx_questions_sequence ON questions(dimension_code, sequence_in_dimension);

-- ============================================
-- 三、用户答案表
-- ============================================

CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- 原始答案
  answer_raw JSONB NOT NULL,
  /*
    单选: {"value": "A", "label": "选项A"}
    多选: {"values": ["A", "B"], "labels": ["选项A", "选项B"]}
    量表: {"value": 4}
    排序: {"order": ["C", "A", "B"]}
    文本: {"text": "我的回答..."}
  */
  
  -- 标准化分数 (自动计算)
  score_raw DECIMAL(10, 4),  -- 原始分数
  score_normalized DECIMAL(10, 4), -- 标准化分数 (T-score)
  score_percentile DECIMAL(5, 2),  -- 百分位数
  
  -- 答题元数据
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answer_duration_ms INT, -- 答题用时(毫秒)
  is_changed BOOLEAN DEFAULT FALSE, -- 是否修改过
  changed_from JSONB, -- 之前的答案
  
  -- 唯一约束
  UNIQUE(user_id, question_id)
);

-- 索引
CREATE INDEX idx_answers_user ON user_answers(user_id);
CREATE INDEX idx_answers_question ON user_answers(question_id);
CREATE INDEX idx_answers_trait ON user_answers(user_id, question_id);

-- ============================================
-- 四、用户人格画像表
-- ============================================

CREATE TABLE user_personality_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- 大五人格维度得分 (T-score, 平均50, 标准差10)
  openness DECIMAL(6, 3),           -- 开放性
  openness_facets JSONB,            -- 子维度: fantasy, aesthetics, feelings, actions, ideas, values
  
  conscientiousness DECIMAL(6, 3),  -- 尽责性
  conscientiousness_facets JSONB,   -- 子维度: competence, order, dutifulness, achievement_striving, self-discipline, deliberation
  
  extraversion DECIMAL(6, 3),       -- 外向性
  extraversion_facets JSONB,        -- 子维度: warmth, gregariousness, assertiveness, activity, excitement-seeking, positive_emotions
  
  agreeableness DECIMAL(6, 3),      -- 宜人性
  agreeableness_facets JSONB,       -- 子维度: trust, straightforwardness, altruism, compliance, modesty, tender_mindedness
  
  neuroticism DECIMAL(6, 3),        -- 神经质
  neuroticism_facets JSONB,         -- 子维度: anxiety, angry_hostility, depression, self_consciousness, impulsiveness, vulnerability
  
  -- 依恋风格
  attachment_style VARCHAR(30), -- 'secure', 'anxious', 'avoidant', 'fearful_avoidant'
  attachment_anxiety DECIMAL(6, 3),   -- 依恋焦虑维度
  attachment_avoidance DECIMAL(6, 3), -- 依恋回避维度
  
  -- 价值观向量
  values_vector JSONB, -- 各价值观维度得分
  
  -- 性格标签
  personality_tags TEXT[], -- ['内向', '理性', '完美主义']
  mbti_type VARCHAR(10), -- 可能的MBTI类型
  
  -- 计算元数据
  questionnaire_completed BOOLEAN DEFAULT FALSE,
  questions_answered INT DEFAULT 0,
  completeness_score DECIMAL(5, 2), -- 问卷完整度
  confidence_score DECIMAL(5, 2),   -- 结果置信度
  
  calculated_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user ON user_personality_profiles(user_id);
CREATE INDEX idx_profiles_attachment ON user_personality_profiles(attachment_style);
CREATE INDEX idx_profiles_openness ON user_personality_profiles(openness);

-- ============================================
-- 五、价值观详细评分表
-- ============================================

CREATE TABLE user_values_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Schwartz价值观理论 10个维度
  power DECIMAL(6, 3),           -- 权力
  achievement DECIMAL(6, 3),     -- 成就
  hedonism DECIMAL(6, 3),        -- 享乐
  stimulation DECIMAL(6, 3),     -- 刺激
  self_direction DECIMAL(6, 3),  -- 自主
  universalism DECIMAL(6, 3),    -- 普遍主义
  benevolence DECIMAL(6, 3),     -- 仁慈
  tradition DECIMAL(6, 3),       -- 传统
  conformity DECIMAL(6, 3),      -- 从众
  security DECIMAL(6, 3),        -- 安全
  
  -- 价值观类型
  dominant_value_type VARCHAR(50), -- 主导价值观类型
  value_profile JSONB, -- 完整价值观档案
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- 六、恋爱观评分表
-- ============================================

CREATE TABLE user_relationship_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 恋爱态度
  commitment_level DECIMAL(6, 3),     -- 承诺倾向
  intimacy_preference DECIMAL(6, 3),  -- 亲密偏好
  passion_importance DECIMAL(6, 3),   -- 激情重要性
  
  -- 沟通风格
  communication_style VARCHAR(30), -- 'direct', 'indirect', 'supportive', 'analytical'
  conflict_style VARCHAR(30),      -- 'competing', 'collaborating', 'compromising', 'avoiding', 'accommodating'
  
  -- 期望
  relationship_expectations JSONB,
  deal_breakers TEXT[], -- 底线
  preferences JSONB,    -- 偏好
  
  -- 恋爱阶段倾向
  preferred_pace VARCHAR(30), -- 'slow', 'moderate', 'fast'
  marriage_timeline VARCHAR(30), -- 'soon', 'in_time', 'unsure', 'no_rush'
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- 七、生活方式评分表
-- ============================================

CREATE TABLE user_lifestyle_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 作息
  chronotype VARCHAR(30), -- 'morning', 'intermediate', 'evening'
  sleep_pattern VARCHAR(30), -- 'regular', 'irregular'
  
  -- 社交
  social_energy DECIMAL(6, 3), -- 社交能量 0-100
  social_frequency VARCHAR(30), -- 'very_active', 'active', 'moderate', 'quiet', 'very_quiet'
  
  -- 生活节奏
  pace_preference VARCHAR(30), -- 'slow', 'moderate', 'fast'
  routine_preference VARCHAR(30), -- 'structured', 'flexible', 'spontaneous'
  
  -- 消费观
  spending_style VARCHAR(30), -- 'frugal', 'balanced', 'generous'
  saving_priority DECIMAL(6, 3),
  
  -- 健康
  health_consciousness DECIMAL(6, 3),
  exercise_frequency VARCHAR(30),
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- 八、用户兴趣标签表
-- ============================================

CREATE TABLE user_interest_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 兴趣标签及强度
  interests JSONB NOT NULL DEFAULT '{}',
  /*
    {
      "reading": {"level": 5, "categories": ["科幻", "文学"]},
      "travel": {"level": 4, "styles": ["深度游", "穷游"]},
      "music": {"level": 3, "genres": ["民谣", "电子"]}
    }
  */
  
  -- 主要兴趣类别
  primary_categories TEXT[],
  secondary_categories TEXT[],
  
  -- 文化品味
  cultural_preference JSONB, -- 文化消费偏好
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- 九、用户匹配向量表 (用于快速匹配)
-- ============================================

CREATE TABLE user_match_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- 高维向量 (用于相似度计算)
  personality_vector VECTOR(30), -- 性格向量 (30维)
  values_vector VECTOR(10),      -- 价值观向量 (10维)
  interests_vector VECTOR(50),   -- 兴趣向量 (50维)
  lifestyle_vector VECTOR(20),   -- 生活方式向量 (20维)
  
  -- 综合向量
  combined_vector VECTOR(110),   -- 组合向量 (110维)
  
  -- 向量版本
  vector_version INT DEFAULT 1,
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 如果没有pgvector扩展，先创建
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX idx_vectors_personality ON user_match_vectors USING ivfflat (personality_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_vectors_combined ON user_match_vectors USING ivfflat (combined_vector vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- 十、问卷进度表
-- ============================================

CREATE TABLE questionnaire_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- 完成进度
  total_questions INT DEFAULT 66,
  answered_questions INT DEFAULT 0,
  required_answered INT DEFAULT 0,
  
  -- 各维度进度
  dimension_progress JSONB DEFAULT '{}',
  /*
    {
      "VALUES": {"total": 17, "answered": 10, "required": 15},
      "PERSONALITY": {"total": 13, "answered": 5, "required": 10},
      ...
    }
  */
  
  -- 当前位置
  current_question_id UUID REFERENCES questions(id),
  current_dimension_code VARCHAR(50),
  
  -- 状态
  status VARCHAR(30) DEFAULT 'in_progress' CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'submitted'
  )),
  
  -- 时间
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 预计完成时间
  estimated_completion_minutes INT
);

-- ============================================
-- 十一、评分常模表 (用于标准化)
-- ============================================

CREATE TABLE scoring_norms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 维度/量表
  dimension_code VARCHAR(50) NOT NULL,
  trait_code VARCHAR(100), -- 特质代码
  
  -- 常模数据
  population_mean DECIMAL(10, 4),
  population_std DECIMAL(10, 4),
  sample_size INT,
  
  -- 性别差异常模
  male_mean DECIMAL(10, 4),
  male_std DECIMAL(10, 4),
  female_mean DECIMAL(10, 4),
  female_std DECIMAL(10, 4),
  
  -- 年龄常模
  age_norms JSONB, -- 各年龄段的常模
  
  -- 来源
  norm_source VARCHAR(100), -- 常模来源
  norm_year INT,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(dimension_code, trait_code)
);

-- ============================================
-- 十二、维度权重配置表
-- ============================================

CREATE TABLE dimension_match_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 维度组合
  dimension_code VARCHAR(50) NOT NULL REFERENCES questionnaire_dimensions(code),
  
  -- 匹配权重 (可动态调整)
  similarity_weight DECIMAL(4, 3), -- 相似度权重
  complementarity_weight DECIMAL(4, 3), -- 互补性权重
  
  -- 最小阈值
  min_score_threshold DECIMAL(5, 2), -- 低于此分数不推荐
  optimal_range_min DECIMAL(5, 2),
  optimal_range_max DECIMAL(5, 2),
  
  -- 版本控制
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(dimension_code, version)
);

-- ============================================
-- 触发器：更新时间戳
-- ============================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_questions_timestamp BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON user_personality_profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- 视图：问卷完成统计
-- ============================================

CREATE VIEW questionnaire_completion_stats AS
SELECT 
  u.id AS user_id,
  u.nickname,
  COUNT(DISTINCT ua.question_id) AS questions_answered,
  COUNT(DISTINCT q.dimension_code) AS dimensions_covered,
  SUM(CASE WHEN q.is_required THEN 1 ELSE 0 END) AS required_answered,
  SUM(CASE WHEN q.is_required THEN 1 ELSE 0 END) AS total_required,
  ROUND(
    COUNT(DISTINCT ua.question_id)::DECIMAL / 66 * 100, 2
  ) AS completion_percentage,
  qp.status,
  qp.started_at,
  qp.last_activity_at
FROM users u
LEFT JOIN user_answers ua ON u.id = ua.user_id
LEFT JOIN questions q ON ua.question_id = q.id
LEFT JOIN questionnaire_progress qp ON u.id = qp.user_id
GROUP BY u.id, u.nickname, qp.status, qp.started_at, qp.last_activity_at;

-- ============================================
-- 视图：用户完整画像
-- ============================================

CREATE VIEW user_complete_profiles AS
SELECT 
  u.id AS user_id,
  u.nickname,
  u.gender,
  EXTRACT(YEAR FROM AGE(u.birthday)) AS age,
  u.city,
  
  -- 大五人格
  upp.openness,
  upp.conscientiousness,
  upp.extraversion,
  upp.agreeableness,
  upp.neuroticism,
  upp.mbti_type,
  upp.attachment_style,
  
  -- 价值观
  uvs.dominant_value_type,
  
  -- 恋爱观
  urs.communication_style,
  urs.conflict_style,
  urs.preferred_pace,
  
  -- 生活方式
  uls.chronotype,
  uls.social_energy,
  uls.pace_preference,
  
  -- 进度
  qp.status AS questionnaire_status,
  upp.questionnaire_completed
  
FROM users u
LEFT JOIN user_personality_profiles upp ON u.id = upp.user_id
LEFT JOIN user_values_scores uvs ON u.id = uvs.user_id
LEFT JOIN user_relationship_scores urs ON u.id = urs.user_id
LEFT JOIN user_lifestyle_scores uls ON u.id = uls.user_id
LEFT JOIN questionnaire_progress qp ON u.id = qp.user_id;
