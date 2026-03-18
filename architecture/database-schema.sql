-- 心动投递数据库设计
-- Database Schema for Xindong Toudi

-- ============================================
-- 用户表 (Users)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  wechat_openid VARCHAR(100) UNIQUE,
  email VARCHAR(255),
  
  -- 基本信息
  nickname VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  height INTEGER, -- cm
  university VARCHAR(100), -- 学校
  company VARCHAR(100), -- 公司
  occupation VARCHAR(100), -- 职业
  city VARCHAR(50),
  bio TEXT,
  
  -- 匹配偏好
  preferred_gender VARCHAR(10),
  age_range_min INTEGER DEFAULT 18,
  age_range_max INTEGER DEFAULT 35,
  preferred_city VARCHAR(50),
  
  -- 核心价值观 (多选)
  core_values TEXT[], -- ['勇气', '创造力', '冒险', '善良']
  
  -- 统计数据
  total_matches INTEGER DEFAULT 0,
  successful_dates INTEGER DEFAULT 0,
  
  -- 状态
  questionnaire_completed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_wechat ON users(wechat_openid);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_gender ON users(gender);

-- ============================================
-- 问卷问题表 (Questionnaire Questions)
-- ============================================
CREATE TABLE questionnaire_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 问题内容
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN (
    'single_choice', -- 单选
    'multiple_choice', -- 多选
    'scale', -- 量表 (1-5)
    'open_text', -- 开放式文本
    'ranking', -- 排序
    'slider' -- 滑块
  )),
  
  -- 分类
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'values', -- 价值观
    'lifestyle', -- 生活方式
    'relationship', -- 恋爱观
    'personality', -- 性格特质
    'future', -- 未来规划
    'interests', -- 兴趣爱好
    'political', -- 政治观点
    'family', -- 家庭观
    'religion', -- 宗教信仰
    'dealbreaker' -- 底线问题
  )),
  
  -- 选项 (JSON格式)
  options JSONB, -- [{"value": "option1", "label": "选项1"}, ...]
  
  -- 权重 (在匹配算法中的重要程度)
  weight DECIMAL(3, 2) DEFAULT 1.0,
  
  -- 是否必答
  is_required BOOLEAN DEFAULT TRUE,
  
  -- 排序
  display_order INTEGER,
  
  -- 是否启用
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_category ON questionnaire_questions(category);
CREATE INDEX idx_questions_order ON questionnaire_questions(display_order);

-- ============================================
-- 用户问卷答案表 (Questionnaire Answers)
-- ============================================
CREATE TABLE questionnaire_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questionnaire_questions(id) ON DELETE CASCADE,
  
  -- 答案 (根据问题类型存储不同格式)
  answer_value JSONB NOT NULL, -- 可以是字符串、数组、数字等
  
  -- 答案时间戳
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, question_id)
);

CREATE INDEX idx_answers_user ON questionnaire_answers(user_id);
CREATE INDEX idx_answers_question ON questionnaire_answers(question_id);

-- ============================================
-- 每周匹配表 (Weekly Matches)
-- ============================================
CREATE TABLE weekly_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 匹配用户
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 匹配周次
  week_number INTEGER NOT NULL, -- 例如: 2026-W12
  match_date DATE NOT NULL, -- 匹配日期
  
  -- 匹配详情
  compatibility_score DECIMAL(5, 2), -- 兼容度分数 (0-100)
  match_reasons JSONB, -- 匹配理由 ["理由1", "理由2", ...]
  shared_values TEXT[], -- 共同价值观
  shared_interests TEXT[], -- 共同兴趣
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', -- 等待用户查看
    'viewed', -- 已查看
    'accepted', -- 双方接受
    'rejected', -- 任一方拒绝
    'dated', -- 已约会
    'completed' -- 已完成反馈
  )),
  
  -- 用户反馈
  user1_feedback TEXT,
  user2_feedback TEXT,
  user1_rating INTEGER CHECK (user1_rating >= 1 AND user1_rating <= 5),
  user2_rating INTEGER CHECK (user2_rating >= 1 AND user2_rating <= 5),
  
  -- 是否愿意再次匹配
  user1_would_meet_again BOOLEAN,
  user2_would_meet_again BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保每周每对用户只有一条匹配记录
  UNIQUE(user_id_1, user_id_2, week_number),
  -- 确保不会重复匹配
  CHECK (user_id_1 < user_id_2) -- 确保ID有序存储，避免重复
);

CREATE INDEX idx_matches_user1 ON weekly_matches(user_id_1);
CREATE INDEX idx_matches_user2 ON weekly_matches(user_id_2);
CREATE INDEX idx_matches_week ON weekly_matches(week_number);
CREATE INDEX idx_matches_date ON weekly_matches(match_date);

-- ============================================
-- 暗恋表 (Secret Crushes)
-- ============================================
CREATE TABLE secret_crushes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crush_email VARCHAR(255) NOT NULL, -- 暗恋对象的邮箱
  
  -- 状态
  is_matched BOOLEAN DEFAULT FALSE, -- 是否双向暗恋匹配成功
  matched_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 每个用户对同一个邮箱只能暗恋一次
  UNIQUE(user_id, crush_email)
);

CREATE INDEX idx_crushes_user ON secret_crushes(user_id);
CREATE INDEX idx_crushes_email ON secret_crushes(crush_email);

-- ============================================
-- 双向暗恋匹配表 (Mutual Crush Matches)
-- ============================================
CREATE TABLE mutual_crush_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 匹配时间
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 通知状态
  user1_notified BOOLEAN DEFAULT FALSE,
  user2_notified BOOLEAN DEFAULT FALSE,
  
  -- 确保每对用户只有一条匹配记录
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

-- ============================================
-- 爱神模式表 (Cupid Mode)
-- ============================================
CREATE TABLE cupid_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 月老 (撮合者)
  cupid_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 被撮合的用户
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 推荐理由
  recommendation_reason TEXT,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', -- 等待双方同意
    'accepted', -- 双方同意
    'rejected', -- 任一方拒绝
    'dated' -- 已约会
  )),
  
  -- 双方是否同意
  user1_agreed BOOLEAN,
  user2_agreed BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保每对用户只有一条推荐
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_cupid_cupid ON cupid_matches(cupid_user_id);
CREATE INDEX idx_cupid_user1 ON cupid_matches(user_id_1);
CREATE INDEX idx_cupid_user2 ON cupid_matches(user_id_2);

-- ============================================
-- 用户设置表 (User Settings)
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- 通知设置
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  
  -- 隐私设置
  show_real_name BOOLEAN DEFAULT FALSE,
  show_university BOOLEAN DEFAULT TRUE,
  show_company BOOLEAN DEFAULT FALSE,
  show_age BOOLEAN DEFAULT TRUE,
  
  -- 匹配设置
  auto_opt_in_weekly BOOLEAN DEFAULT TRUE, -- 自动加入每周匹配
  max_distance_km INTEGER DEFAULT 50, -- 最大距离
  
  -- 其他设置
  language VARCHAR(10) DEFAULT 'zh-CN',
  theme VARCHAR(20) DEFAULT 'light',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 约会反馈表 (Date Feedback)
-- ============================================
CREATE TABLE date_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES weekly_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 反馈内容
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  would_meet_again BOOLEAN,
  
  -- 详细反馈
  what_went_well TEXT,
  what_could_improve TEXT,
  
  -- 性格匹配反馈
  personality_match_rating INTEGER CHECK (personality_match_rating >= 1 AND personality_match_rating <= 5),
  values_match_rating INTEGER CHECK (values_match_rating >= 1 AND values_match_rating <= 5),
  interests_match_rating INTEGER CHECK (interests_match_rating >= 1 AND interests_match_rating <= 5),
  
  -- 是否愿意继续接触
  want_to_continue BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(match_id, user_id) -- 每个用户对每个匹配只能反馈一次
);

CREATE INDEX idx_feedback_match ON date_feedback(match_id);
CREATE INDEX idx_feedback_user ON date_feedback(user_id);

-- ============================================
-- 用户关系网络表 (User Connections)
-- ============================================
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 关系类型
  connection_type VARCHAR(20) CHECK (connection_type IN (
    'matched', -- 匹配过
    'dated', -- 约会过
    'friend', -- 朋友
    'blocked' -- 拉黑
  )),
  
  -- 是否互相
  is_mutual BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_connections_user1 ON user_connections(user_id_1);
CREATE INDEX idx_connections_user2 ON user_connections(user_id_2);

-- ============================================
-- 匹配历史表 (Match History)
-- ============================================
CREATE TABLE match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number VARCHAR(10) NOT NULL, -- 例如: 2026-W12
  
  -- 匹配时的快照数据
  compatibility_score DECIMAL(5, 2),
  match_reasons JSONB,
  
  -- 结果
  outcome VARCHAR(20) CHECK (outcome IN (
    'viewed', -- 仅查看
    'contacted', -- 已联系
    'dated', -- 已约会
    'relationship', -- 建立关系
    'no_contact' -- 未联系
  )),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_history_user ON match_history(user_id);
CREATE INDEX idx_history_week ON match_history(week_number);

-- ============================================
-- 触发器: 更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_matches_updated_at BEFORE UPDATE ON weekly_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 视图: 活跃用户统计
-- ============================================
CREATE VIEW active_users_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE questionnaire_completed = TRUE) as completed_questionnaire,
  COUNT(*) FILTER (WHERE gender = 'male') as male_users,
  COUNT(*) FILTER (WHERE gender = 'female') as female_users,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month
FROM users
WHERE is_active = TRUE;

-- ============================================
-- 视图: 匹配统计
-- ============================================
CREATE VIEW match_stats AS
SELECT 
  COUNT(*) as total_matches,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted_matches,
  COUNT(*) FILTER (WHERE status = 'dated') as successful_dates,
  AVG(compatibility_score) as avg_compatibility,
  AVG(user1_rating) FILTER (WHERE user1_rating IS NOT NULL) as avg_user_rating,
  AVG(user2_rating) FILTER (WHERE user2_rating IS NOT NULL) as avg_match_rating
FROM weekly_matches;
