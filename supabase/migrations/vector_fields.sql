-- ============================================
-- 心动投递 - 向量匹配系统数据库迁移
-- 执行位置：Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. 添加向量字段到 users 表
-- ============================================

-- 性格向量 (30维，存储为 JSONB 数组)
ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_vector JSONB DEFAULT '[]'::jsonb;

-- 价值观向量 (10维，存储为 JSONB 数组)  
ALTER TABLE users ADD COLUMN IF NOT EXISTS values_vector JSONB DEFAULT '[]'::jsonb;

-- 兴趣爱好向量 (50维，存储为 JSONB 数组)
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests_vector JSONB DEFAULT '[]'::jsonb;

-- 生活方式向量 (20维，存储为 JSONB 数组)
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifestyle_vector JSONB DEFAULT '[]'::jsonb;

-- 综合向量 (110维，存储为 JSONB 数组)
ALTER TABLE users ADD COLUMN IF NOT EXISTS combined_vector JSONB DEFAULT '[]'::jsonb;

-- 向量计算时间戳
ALTER TABLE users ADD COLUMN IF NOT EXISTS vector_calculated_at TIMESTAMPTZ;

-- 向量版本号（用于算法迭代）
ALTER TABLE users ADD COLUMN IF NOT EXISTS vector_version INTEGER DEFAULT 1;

-- ============================================
-- 2. 创建向量索引（用于相似度搜索）
-- ============================================

-- 注意：Supabase/PostgreSQL 原生不支持向量索引
-- 如需高效向量搜索，建议使用 pgvector 扩展
-- 以下创建GIN索引用于JSONB数组的精确匹配

CREATE INDEX IF NOT EXISTS idx_users_personality_vector ON users USING gin(personality_vector);
CREATE INDEX IF NOT EXISTS idx_users_values_vector ON users USING gin(values_vector);
CREATE INDEX IF NOT EXISTS idx_users_interests_vector ON users USING gin(interests_vector);
CREATE INDEX IF NOT EXISTS idx_users_lifestyle_vector ON users USING gin(lifestyle_vector);

-- ============================================
-- 3. 添加向量存储元数据
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS vector_quality_score DECIMAL(5,2) DEFAULT 0;
-- 向量质量分数：0-100，表示用户画像完整度

ALTER TABLE users ADD COLUMN IF NOT EXISTS questionnaire_complete BOOLEAN DEFAULT FALSE;

-- ============================================
-- 4. 创建匹配结果缓存表
-- ============================================

CREATE TABLE IF NOT EXISTS match_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 匹配分数
  total_score DECIMAL(5,2) DEFAULT 0,
  personality_score DECIMAL(5,2) DEFAULT 0,
  values_score DECIMAL(5,2) DEFAULT 0,
  interests_score DECIMAL(5,2) DEFAULT 0,
  lifestyle_score DECIMAL(5,2) DEFAULT 0,
  complementarity_bonus DECIMAL(5,2) DEFAULT 0,
  
  -- 匹配原因
  match_reasons JSONB DEFAULT '[]'::jsonb,
  shared_traits JSONB DEFAULT '[]'::jsonb,
  complementary_traits JSONB DEFAULT '[]'::jsonb,
  
  -- 长期预测
  long_term_stability DECIMAL(5,2) DEFAULT 0,
  satisfaction_prediction DECIMAL(5,2) DEFAULT 0,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  strength_factors JSONB DEFAULT '[]'::jsonb,
  
  -- 缓存元数据
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(user1_id, user2_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_match_cache_user1 ON match_cache(user1_id);
CREATE INDEX IF NOT EXISTS idx_match_cache_user2 ON match_cache(user2_id);
CREATE INDEX IF NOT EXISTS idx_match_cache_total_score ON match_cache(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_cache_expires ON match_cache(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- 5. 创建向量计算日志表
-- ============================================

CREATE TABLE IF NOT EXISTS vector_calculation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 计算信息
  calculation_type VARCHAR(50), -- 'initial', 'update', 'batch'
  source VARCHAR(50), -- 'questionnaire', 'manual', 'import'
  
  -- 向量维度信息
  personality_dimensions INTEGER,
  values_dimensions INTEGER,
  interests_dimensions INTEGER,
  lifestyle_dimensions INTEGER,
  total_dimensions INTEGER,
  
  -- 质量指标
  completeness_score DECIMAL(5,2),
  reliability_score DECIMAL(5,2),
  
  -- 时间
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_vector_log_user ON vector_calculation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_vector_log_date ON vector_calculation_log(calculated_at DESC);

-- ============================================
-- 6. 创建用于相似度计算的 SQL 函数
-- ============================================

-- 余弦相似度计算函数
CREATE OR REPLACE FUNCTION cosine_similarity(vec1 JSONB, vec2 JSONB)
RETURNS DECIMAL(5,4) AS $$
DECLARE
  dot_product DECIMAL(10,4) := 0;
  norm1 DECIMAL(10,4) := 0;
  norm2 DECIMAL(10,4) := 0;
  result DECIMAL(5,4);
  i INTEGER;
BEGIN
  -- 检查向量长度
  IF jsonb_array_length(vec1) != jsonb_array_length(vec2) THEN
    RETURN 0;
  END IF;
  
  -- 计算点积和范数
  FOR i IN 0..(jsonb_array_length(vec1) - 1) LOOP
    dot_product := dot_product + (vec1->>i)::DECIMAL * (vec2->>i)::DECIMAL;
    norm1 := norm1 + power((vec1->>i)::DECIMAL, 2);
    norm2 := norm2 + power((vec2->>i)::DECIMAL, 2);
  END LOOP;
  
  norm1 := sqrt(norm1);
  norm2 := sqrt(norm2);
  
  -- 避免除零
  IF norm1 = 0 OR norm2 = 0 THEN
    RETURN 0;
  END IF;
  
  result := dot_product / (norm1 * norm2);
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 欧氏距离计算函数
CREATE OR REPLACE FUNCTION euclidean_distance(vec1 JSONB, vec2 JSONB)
RETURNS DECIMAL(10,4) AS $$
DECLARE
  sum_squares DECIMAL(10,4) := 0;
  i INTEGER;
BEGIN
  IF jsonb_array_length(vec1) != jsonb_array_length(vec2) THEN
    RETURN NULL;
  END IF;
  
  FOR i IN 0..(jsonb_array_length(vec1) - 1) LOOP
    sum_squares := sum_squares + power((vec1->>i)::DECIMAL - (vec2->>i)::DECIMAL, 2);
  END LOOP;
  
  RETURN sqrt(sum_squares);
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 加权相似度计算函数
CREATE OR REPLACE FUNCTION weighted_vector_similarity(
  user1_vecs JSONB,
  user2_vecs JSONB,
  weights JSONB
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  personality_sim DECIMAL(5,4);
  values_sim DECIMAL(5,4);
  interests_sim DECIMAL(5,4);
  lifestyle_sim DECIMAL(5,4);
  
  personality_weight DECIMAL(3,2) := 0.25;
  values_weight DECIMAL(3,2) := 0.30;
  interests_weight DECIMAL(3,2) := 0.20;
  lifestyle_weight DECIMAL(3,2) := 0.25;
BEGIN
  -- 提取权重
  IF weights ? 'personality' THEN
    personality_weight := (weights->>'personality')::DECIMAL;
  END IF;
  IF weights ? 'values' THEN
    values_weight := (weights->>'values')::DECIMAL;
  END IF;
  IF weights ? 'interests' THEN
    interests_weight := (weights->>'interests')::DECIMAL;
  END IF;
  IF weights ? 'lifestyle' THEN
    lifestyle_weight := (weights->>'lifestyle')::DECIMAL;
  END IF;
  
  -- 计算各维度相似度
  personality_sim := cosine_similarity(user1_vecs->'personality', user2_vecs->'personality');
  values_sim := cosine_similarity(user1_vecs->'values', user2_vecs->'values');
  interests_sim := cosine_similarity(user1_vecs->'interests', user2_vecs->'interests');
  lifestyle_sim := cosine_similarity(user1_vecs->'lifestyle', user2_vecs->'lifestyle');
  
  -- 计算加权总分
  RETURN (
    personality_sim * personality_weight +
    values_sim * values_weight +
    interests_sim * interests_weight +
    lifestyle_sim * lifestyle_weight
  ) * 100;
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 7. 验证 SQL
-- ============================================

-- 检查 users 表向量字段
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name LIKE '%vector%'
ORDER BY ordinal_position;

-- 检查函数是否创建成功
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('cosine_similarity', 'euclidean_distance', 'weighted_vector_similarity');

-- 检查 match_cache 表
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_cache'
ORDER BY ordinal_position;

-- 测试向量函数
SELECT cosine_similarity('[0.1, 0.2, 0.3]'::jsonb, '[0.1, 0.2, 0.3]'::jsonb) as test_similarity;
SELECT euclidean_distance('[0.1, 0.2, 0.3]'::jsonb, '[0.1, 0.2, 0.4]'::jsonb) as test_distance;
