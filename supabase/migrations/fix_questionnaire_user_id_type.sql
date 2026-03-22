-- ============================================
-- 修复 questionnaire_answers 表 user_id 数据类型
-- 问题：user_id 是 text 类型，但 users.id 是 uuid 类型
-- ============================================

-- 1. 先删除可能导致问题的外键约束（如果存在）
ALTER TABLE questionnaire_answers DROP CONSTRAINT IF EXISTS questionnaire_answers_user_id_fkey;

-- 2. 将 user_id 从 text 转换为 uuid
-- 注意：如果有现有数据，需要先确保数据格式正确
ALTER TABLE questionnaire_answers 
ALTER COLUMN user_id TYPE UUID USING (user_id::UUID);

-- 3. 重新添加外键约束
ALTER TABLE questionnaire_answers 
ADD CONSTRAINT questionnaire_answers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. 验证修复
SELECT 
  c.column_name,
  c.data_type,
  c.is_nullable,
  cu.constraint_name,
  cu REFERENCED_TABLE_NAME,
  cu REFERENCED_COLUMN_NAME
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage cu 
  ON c.table_name = cu.table_name 
  AND c.column_name = cu.column_name
WHERE c.table_name = 'questionnaire_answers'
  AND c.column_name = 'user_id';
