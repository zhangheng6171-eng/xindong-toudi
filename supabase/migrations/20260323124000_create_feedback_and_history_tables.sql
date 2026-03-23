-- ============================================
-- 心动投递 - 创建反馈和历史表
-- 执行时间: 2026-03-23
-- ============================================

-- ============================================
-- 1. 每周匹配表 (Weekly Matches)
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 匹配用户
  user_id_1 TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 匹配周次
  week_number INTEGER NOT NULL, -- 例如: 12
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
  UNIQUE(user_id_1, user_id_2, week_number)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_weekly_matches_user1 ON weekly_matches(user_id_1);
CREATE INDEX IF NOT EXISTS idx_weekly_matches_user2 ON weekly_matches(user_id_2);
CREATE INDEX IF NOT EXISTS idx_weekly_matches_week ON weekly_matches(week_number);
CREATE INDEX IF NOT EXISTS idx_weekly_matches_date ON weekly_matches(match_date);

-- ============================================
-- 2. 匹配历史表 (Match History)
-- ============================================
CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- 索引
CREATE INDEX IF NOT EXISTS idx_match_history_user ON match_history(user_id);
CREATE INDEX IF NOT EXISTS idx_match_history_week ON match_history(week_number);

-- ============================================
-- 3. 约会反馈表 (Date Feedback)
-- ============================================
CREATE TABLE IF NOT EXISTS date_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES weekly_matches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
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

-- 索引
CREATE INDEX IF NOT EXISTS idx_date_feedback_match ON date_feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_date_feedback_user ON date_feedback(user_id);

-- ============================================
-- 4. 更新 updated_at 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 weekly_matches 添加触发器
DROP TRIGGER IF EXISTS update_weekly_matches_updated_at ON weekly_matches;
CREATE TRIGGER update_weekly_matches_updated_at BEFORE UPDATE ON weekly_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Migration completed: feedback and history tables created successfully!' as result;
