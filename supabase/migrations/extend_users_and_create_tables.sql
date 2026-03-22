-- ============================================
-- 心动投递 - 数据库扩展脚本
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- ============================================
-- 1. 在 users 表添加向量字段
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_vector JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS values_vector JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests_vector JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS questionnaire_completed_at TIMESTAMPTZ;

-- ============================================
-- 2. 创建问卷答案表 questionnaire_answers
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_questionnaire_answers_user_id ON questionnaire_answers(user_id);

-- ============================================
-- 3. 创建匹配记录表 matches
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

-- ============================================
-- 验证结果
-- ============================================

-- 查看 users 表的新字段
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('personality_vector', 'values_vector', 'interests_vector', 'questionnaire_completed_at')
ORDER BY column_name;

-- 查看新创建的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('questionnaire_answers', 'matches')
ORDER BY table_name;

SELECT '✅ 数据库扩展完成！' as result;
