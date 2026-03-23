-- ========================================
-- 微信登录功能 - 数据库迁移
-- ========================================
-- 执行此SQL来添加微信openid字段到users表

-- 添加 wechat_openid 字段（唯一索引用于防止重复绑定）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wechat_openid TEXT UNIQUE;

-- 添加 wechat_unionid 字段（微信unionid，同一主体下多应用互通）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wechat_unionid TEXT;

-- 添加索引加速查询
CREATE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX IF NOT EXISTS idx_users_wechat_unionid ON users(wechat_unionid);

-- 查看表结构
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name LIKE 'wechat%';
