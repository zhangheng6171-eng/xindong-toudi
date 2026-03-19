-- 心动投递 实时订阅配置
-- 在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 启用 Realtime
-- ============================================

-- 为消息表启用实时推送
ALTER publication supabase_realtime ADD TABLE messages;

-- 为会话表启用实时推送
ALTER publication supabase_realtime ADD TABLE conversations;

-- 为匹配表启用实时推送
ALTER publication supabase_realtime ADD TABLE matches;

-- ============================================
-- 创建实时订阅函数
-- ============================================

-- 获取用户参与的会话ID列表
CREATE OR REPLACE FUNCTION get_user_conversation_ids(user_uuid UUID)
RETURNS TABLE(id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id
  FROM conversations c
  WHERE user_uuid::text = ANY(c.participant_ids::text[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 创建消息通知函数
-- ============================================

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  participant_ids UUID[];
BEGIN
  -- 获取会话参与者
  SELECT c.participant_ids INTO participant_ids
  FROM conversations c
  WHERE c.id = NEW.conversation_id;
  
  -- 这里可以添加额外的通知逻辑
  -- 例如发送推送通知等
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS notify_new_message_trigger ON messages;
CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- ============================================
-- 创建在线状态表（可选）
-- ============================================

CREATE TABLE IF NOT EXISTS user_online_status (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 为在线状态表启用实时推送
ALTER publication supabase_realtime ADD TABLE user_online_status;

-- 创建更新在线状态的函数
CREATE OR REPLACE FUNCTION update_user_online_status(user_uuid UUID, online BOOLEAN)
RETURNS void AS $$
BEGIN
  INSERT INTO user_online_status (user_id, is_online, last_seen)
  VALUES (user_uuid, online, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    is_online = online,
    last_seen = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 创建输入状态表（可选）
-- ============================================

CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 为输入状态表启用实时推送
ALTER publication supabase_realtime ADD TABLE typing_indicators;

-- 自动清除过期的输入状态（超过5秒）
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators
  WHERE created_at < NOW() - INTERVAL '5 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
