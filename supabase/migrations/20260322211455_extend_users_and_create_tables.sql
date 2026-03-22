-- ============================================
-- 心动投递 - 数据库扩展
-- 执行时间: $(date)
-- ============================================

-- ============================================
-- 1. 在 users 表添加向量字段
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_vector JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS values_vector JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests_vector JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS questionnaire_completed_at TIMESTAMPTZ;

-- ============================================
-- 2. 创建问卷答案表
-- ============================================

CREATE TABLE IF NOT EXISTS questionnaire_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  personality_profile JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 3. 创建匹配记录表
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  matched_user_id UUID NOT NULL REFERENCES users(id),
  match_score INTEGER,
  match_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_user_id ON matches(matched_user_id);

SELECT 'Migration completed successfully!' as result;
