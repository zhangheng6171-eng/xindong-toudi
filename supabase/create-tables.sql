-- 删除旧表并重新创建（包含所有必要字段）
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 创建用户表（完整版本）
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  avatar TEXT,
  gender VARCHAR(20),
  age INTEGER,
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);

SELECT '数据库重建成功！' as result;
