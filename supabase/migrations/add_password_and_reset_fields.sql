-- ============================================
-- 添加密码和密码重置字段
-- 执行时间: 2024
-- ============================================

-- 1. 为 users 表添加密码字段（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. 添加密码重置令牌字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- 验证结果
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('password', 'reset_token', 'reset_token_expires');

SELECT '密码和重置字段添加成功！' as result;
