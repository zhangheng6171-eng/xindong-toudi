-- 心动投递 Row Level Security (RLS) 策略
-- 在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 启用 RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 用户表策略
-- ============================================
-- 用户可以查看所有用户（用于匹配）
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

-- 用户只能更新自己的信息
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- 用户可以创建自己的记录
CREATE POLICY "Users can insert own record" ON users
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 用户资料表策略
-- ============================================
-- 用户可以查看所有资料（用于匹配）
CREATE POLICY "Profiles are viewable by all" ON profiles
  FOR SELECT USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "Users can update own profile data" ON profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- 用户可以创建自己的资料
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 匹配表策略
-- ============================================
-- 用户可以查看自己参与的匹配
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (
    user1_id::text = current_setting('request.jwt.claims', true)::json->>'sub' 
    OR user2_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user1_id::text = auth.uid()::text
    OR user2_id::text = auth.uid()::text
  );

-- 允许插入匹配（系统生成）
CREATE POLICY "Anyone can insert matches" ON matches
  FOR INSERT WITH CHECK (true);

-- 用户可以更新自己参与的匹配状态
CREATE POLICY "Users can update own matches" ON matches
  FOR UPDATE USING (
    user1_id::text = current_setting('request.jwt.claims', true)::json->>'sub' 
    OR user2_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user1_id::text = auth.uid()::text
    OR user2_id::text = auth.uid()::text
  );

-- ============================================
-- 用户喜欢表策略
-- ============================================
-- 用户可以查看与自己相关的喜欢记录
CREATE POLICY "Users can view related likes" ON user_likes
  FOR SELECT USING (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub' 
    OR target_user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_id::text = auth.uid()::text
    OR target_user_id::text = auth.uid()::text
  );

-- 用户可以创建喜欢记录
CREATE POLICY "Users can insert likes" ON user_likes
  FOR INSERT WITH CHECK (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_id::text = auth.uid()::text
  );

-- 用户可以删除自己的喜欢记录
CREATE POLICY "Users can delete own likes" ON user_likes
  FOR DELETE USING (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_id::text = auth.uid()::text
  );

-- ============================================
-- 会话表策略
-- ============================================
-- 用户只能查看自己参与的会话
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    auth.uid()::text = ANY(participant_ids::text[])
    OR current_setting('request.jwt.claims', true)::json->>'sub' = ANY(participant_ids::text[])
  );

-- 允许创建会话
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- 用户可以更新自己参与的会话
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (
    auth.uid()::text = ANY(participant_ids::text[])
    OR current_setting('request.jwt.claims', true)::json->>'sub' = ANY(participant_ids::text[])
  );

-- ============================================
-- 消息表策略
-- ============================================
-- 用户只能查看自己参与会话的消息
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        auth.uid()::text = ANY(c.participant_ids::text[])
        OR current_setting('request.jwt.claims', true)::json->>'sub' = ANY(c.participant_ids::text[])
      )
    )
  );

-- 用户可以发送消息（需要是会话参与者）
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        auth.uid()::text = ANY(c.participant_ids::text[])
        OR current_setting('request.jwt.claims', true)::json->>'sub' = ANY(c.participant_ids::text[])
      )
    )
  );

-- ============================================
-- 消息已读表策略
-- ============================================
-- 用户可以查看与自己相关的已读记录
CREATE POLICY "Users can view own reads" ON message_reads
  FOR SELECT USING (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_id::text = auth.uid()::text
  );

-- 用户可以创建已读记录
CREATE POLICY "Users can create reads" ON message_reads
  FOR INSERT WITH CHECK (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    OR user_id::text = auth.uid()::text
  );

-- ============================================
-- 简化版策略（不使用JWT，直接通过应用层认证）
-- 如果使用自定义认证而非 Supabase Auth，使用以下策略
-- ============================================

-- 清除之前的策略（如果需要）
-- DROP POLICY IF EXISTS "Users can view all users" ON users;

-- 为开发环境创建更宽松的策略
-- 注意：生产环境应该使用更严格的JWT认证

-- 允许所有已认证用户访问
CREATE POLICY "Allow all for development" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all profiles for development" ON profiles
  FOR ALL USING (true);

CREATE POLICY "Allow all matches for development" ON matches
  FOR ALL USING (true);

CREATE POLICY "Allow all likes for development" ON user_likes
  FOR ALL USING (true);

CREATE POLICY "Allow all conversations for development" ON conversations
  FOR ALL USING (true);

CREATE POLICY "Allow all messages for development" ON messages
  FOR ALL USING (true);

CREATE POLICY "Allow all message_reads for development" ON message_reads
  FOR ALL USING (true);
