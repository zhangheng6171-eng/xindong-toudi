# 心动投递 - 数据库 Schema 设计

## 概述

基于 PostgreSQL 的数据库设计，支持约会平台的核心功能。采用关系型数据库保证数据一致性和复杂查询能力。

---

## 核心表结构

### 1. 用户模块

#### users - 用户主表
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  wechat_openid VARCHAR(100) UNIQUE,
  wechat_unionid VARCHAR(100),
  wechat_verified BOOLEAN DEFAULT FALSE,
  nickname VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  birthday DATE,
  height INT,
  city VARCHAR(100),
  occupation VARCHAR(100),
  education VARCHAR(50),
  bio TEXT,
  
  -- 状态字段
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  last_active_at TIMESTAMP,
  
  -- 匹配设置
  min_age_pref INT DEFAULT 18,
  max_age_pref INT DEFAULT 40,
  gender_pref VARCHAR(10),
  city_pref VARCHAR(100),
  
  -- 隐私设置
  profile_visible BOOLEAN DEFAULT TRUE,
  show_online_status BOOLEAN DEFAULT TRUE,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_gender_age ON users(gender, birthday);
```

#### user_photos - 用户照片
```sql
CREATE TABLE user_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_photos_user_id ON user_photos(user_id);
```

#### user_sessions - 用户会话
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
```

---

### 2. 问卷模块

#### questions - 问题库
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 如 Q1, Q2...
  category VARCHAR(50) NOT NULL, -- 'values', 'lifestyle', 'interests', 'personality'
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN (
    'single_choice',    -- 单选
    'multiple_choice',  -- 多选
    'scale',            -- 1-10 量表
    'ranking',          -- 排序题
    'open_text'         -- 开放文本
  )),
  
  -- 选项配置 (JSONB 存储灵活选项)
  options JSONB, -- {"choices": ["选项1", "选项2", ...]}
  weight DECIMAL(3,2) DEFAULT 1.0, -- 权重
  
  -- 用于匹配算法
  matching_dimension VARCHAR(50), -- '价值观', '生活习惯', '兴趣爱好', '性格特质'
  
  display_order INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_dimension ON questions(matching_dimension);
```

#### user_answers - 用户答案
```sql
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  
  -- 答案数据
  answer_data JSONB NOT NULL, -- 根据题型存储不同格式
  /* 示例:
   * single_choice: {"choice": "选项A"}
   * multiple_choice: {"choices": ["选项A", "选项B"]}
   * scale: {"value": 8}
   * ranking: {"order": ["A", "B", "C"]}
   * open_text: {"text": "我的答案..."}
   */
  
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, question_id)
);

CREATE INDEX idx_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_answers_question_id ON user_answers(question_id);
```

#### questionnaire_progress - 问卷进度
```sql
CREATE TABLE questionnaire_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_questions INT DEFAULT 66,
  answered_count INT DEFAULT 0,
  current_question_code VARCHAR(50),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3. 匹配模块

#### weekly_matches - 每周匹配记录
```sql
CREATE TABLE weekly_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- 周一日期
  
  -- 匹配分数
  total_score DECIMAL(5,2),
  values_score DECIMAL(5,2),     -- 价值观匹配分
  interests_score DECIMAL(5,2),  -- 兴趣匹配分
  personality_score DECIMAL(5,2), -- 性格匹配分
  
  -- 匹配详情
  match_reasons JSONB, -- ["都喜欢旅行", "价值观相似", ...]
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 待查看
    'viewed',       -- 已查看
    'liked',        -- 已喜欢
    'disliked',     -- 已不喜欢
    'matched',      -- 双向匹配成功
    'expired'       -- 已过期
  )),
  
  -- 互动
  user_action VARCHAR(20) CHECK (user_action IN ('like', 'dislike', 'skip')),
  matched_user_action VARCHAR(20),
  
  action_at TIMESTAMP,
  matched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, matched_user_id, week_start_date)
);

CREATE INDEX idx_weekly_matches_user ON weekly_matches(user_id, week_start_date);
CREATE INDEX idx_weekly_matches_pair ON weekly_matches(user_id, matched_user_id);
CREATE INDEX idx_weekly_matches_week ON weekly_matches(week_start_date);
```

#### match_preferences - 匹配偏好设置
```sql
CREATE TABLE match_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- 基本偏好
  preferred_gender VARCHAR(10),
  min_age INT DEFAULT 18,
  max_age INT DEFAULT 40,
  preferred_cities TEXT[], -- ['北京', '上海']
  
  -- 权重配置
  values_weight DECIMAL(3,2) DEFAULT 0.4,
  interests_weight DECIMAL(3,2) DEFAULT 0.3,
  personality_weight DECIMAL(3,2) DEFAULT 0.3,
  
  -- 高级偏好
  education_pref TEXT[],
  height_range JSONB, -- {"min": 160, "max": 180}
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4. 爱神模式（撮合好友）

#### cupid_requests - 爱神请求
```sql
CREATE TABLE cupid_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE, -- 发起撮合的人
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- 被撮合的好友
  
  -- 推荐给谁
  recommend_to_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 推荐理由
  reason TEXT,
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 待确认
    'accepted',     -- 接受推荐
    'rejected',     -- 拒绝推荐
    'matched'       -- 匹配成功
  )),
  
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cupid_requests_requester ON cupid_requests(requester_id);
CREATE INDEX idx_cupid_requests_target ON cupid_requests(target_user_id);
```

---

### 5. 暗恋告白模块

#### secret_crushes - 暗恋记录
```sql
CREATE TABLE secret_crushes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crush_phone VARCHAR(20) NOT NULL, -- 暗恋对象的手机号（加密存储）
  crush_phone_hash VARCHAR(64) NOT NULL, -- 手机号哈希，用于匹配
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- 等待匹配
    'matched',      -- 双向暗恋成功
    'revealed',     -- 已揭晓
    'expired'       -- 过期未匹配
  )),
  
  -- 匹配结果
  matched_with_id UUID REFERENCES users(id),
  matched_at TIMESTAMP,
  
  -- 告白信息（匹配成功后显示）
  message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- 匿名表白有效期
  
  UNIQUE(user_id, crush_phone_hash)
);

CREATE INDEX idx_crushes_user ON secret_crushes(user_id);
CREATE INDEX idx_crushes_hash ON secret_crushes(crush_phone_hash);
```

#### crush_reveals - 告白揭晓
```sql
CREATE TABLE crush_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crush_id UUID REFERENCES secret_crushes(id) ON DELETE CASCADE,
  revealer_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  
  -- 告白内容
  message TEXT,
  
  -- 是否接受
  accepted BOOLEAN,
  responded_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 6. 反馈系统

#### user_feedback - 用户反馈
```sql
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  feedback_type VARCHAR(30) NOT NULL CHECK (feedback_type IN (
    'bug_report',
    'feature_request',
    'match_feedback',
    'user_report',     -- 举报用户
    'general'
  )),
  
  -- 关联对象
  related_match_id UUID REFERENCES weekly_matches(id),
  related_user_id UUID REFERENCES users(id),
  
  -- 反馈内容
  title VARCHAR(200),
  content TEXT NOT NULL,
  attachments TEXT[], -- 图片URL
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewing',
    'resolved',
    'dismissed'
  )),
  
  -- 处理信息
  handled_by VARCHAR(100),
  handled_at TIMESTAMP,
  response TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_user ON user_feedback(user_id);
CREATE INDEX idx_feedback_type ON user_feedback(feedback_type, status);
CREATE INDEX idx_feedback_related_match ON user_feedback(related_match_id);
```

#### match_ratings - 匹配评价
```sql
CREATE TABLE match_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES weekly_matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- 评分
  overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
  accuracy_rating INT CHECK (accuracy_rating BETWEEN 1 AND 5),
  
  -- 标签反馈
  feedback_tags TEXT[], -- ['很合拍', '价值观相似', '不太合适', ...]
  comment TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(match_id, user_id)
);
```

---

### 7. 推送通知系统

#### notification_tokens - 设备推送 Token
```sql
CREATE TABLE notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
  token TEXT NOT NULL,
  device_info JSONB,
  
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, token)
);

CREATE INDEX idx_notification_tokens_user ON notification_tokens(user_id);
```

#### notifications - 通知记录
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 通知类型
  notification_type VARCHAR(30) NOT NULL,
  /* 类型示例:
   * 'new_match'         - 新匹配
   * 'match_liked'       - 对方喜欢
   * 'mutual_match'      - 双向匹配
   * 'weekly_match'      - 每周匹配完成
   * 'secret_crush'      - 双向暗恋成功
   * 'cupid_request'     - 爱神推荐
   * 'system'            - 系统通知
   */
  
  -- 通知内容
  title VARCHAR(200) NOT NULL,
  content TEXT,
  data JSONB, -- 额外数据
  
  -- 状态
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- 推送状态
  push_sent BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

---

### 8. 定时任务系统

#### scheduled_tasks - 定时任务记录
```sql
CREATE TABLE scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type VARCHAR(50) NOT NULL, -- 'weekly_matching', 'match_expiry', ...
  
  -- 执行时间
  scheduled_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'running',
    'completed',
    'failed'
  )),
  
  -- 执行结果
  affected_count INT,
  error_message TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduled_tasks_type ON scheduled_tasks(task_type, scheduled_at);
CREATE INDEX idx_scheduled_tasks_status ON scheduled_tasks(status, scheduled_at);
```

#### task_locks - 任务锁（防止重复执行）
```sql
CREATE TABLE task_locks (
  task_type VARCHAR(50) PRIMARY KEY,
  locked_by VARCHAR(100),
  locked_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

---

### 9. 聊天模块

#### conversations - 会话表
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联匹配记录
  match_id UUID REFERENCES weekly_matches(id) ON DELETE CASCADE,
  
  -- 参与者
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 会话状态
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'active',      -- 正常
    'archived',    -- 已归档
    'blocked',     -- 已屏蔽
    'ended'        -- 已结束
  )),
  
  -- 最后消息预览
  last_message_id UUID REFERENCES messages(id),
  last_message_at TIMESTAMP,
  last_message_preview VARCHAR(200),
  
  -- 未读计数
  user1_unread_count INT DEFAULT 0,
  user2_unread_count INT DEFAULT 0,
  
  -- 破冰状态
  icebreaker_used BOOLEAN DEFAULT FALSE,
  icebreaker_question TEXT,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_match ON conversations(match_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

#### messages - 消息表
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 消息类型
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN (
    'text',        -- 文本消息
    'image',       -- 图片消息
    'voice',       -- 语音消息
    'sticker',     -- 表情贴纸
    'system',      -- 系统消息
    'icebreaker'   -- 破冰问题
  )),
  
  -- 消息内容
  content TEXT NOT NULL,
  
  -- 媒体内容
  media_url TEXT,
  media_type VARCHAR(50),
  media_size INT,
  media_duration INT,
  
  -- 消息状态
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN (
    'sending',     -- 发送中
    'sent',        -- 已发送
    'delivered',   -- 已送达
    'read',        -- 已读
    'recalled'     -- 已撤回
  )),
  
  -- 引用消息
  reply_to_id UUID REFERENCES messages(id),
  
  -- 元数据
  metadata JSONB,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recalled_at TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_status ON messages(conversation_id, status);
```

#### message_read_status - 消息已读状态表
```sql
CREATE TABLE message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(message_id, user_id)
);

CREATE INDEX idx_read_status_message ON message_read_status(message_id);
CREATE INDEX idx_read_status_user ON message_read_status(user_id);
```

#### user_online_status - 用户在线状态表
```sql
CREATE TABLE user_online_status (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP,
  last_active_device VARCHAR(50),
  
  show_online BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_online_status ON user_online_status(is_online) WHERE is_online = TRUE;
```

#### sensitive_words - 敏感词表
```sql
CREATE TABLE sensitive_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  severity VARCHAR(20) DEFAULT 'medium',
  replacement VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sensitive_words ON sensitive_words(word);
```

#### chat_reports - 举报记录表
```sql
CREATE TABLE chat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
    'harassment',     -- 骚扰
    'inappropriate',  -- 不当内容
    'spam',           -- 垃圾信息
    'fraud',          -- 欺诈
    'other'           -- 其他
  )),
  
  description TEXT,
  evidence_urls TEXT[],
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewing',
    'resolved',
    'dismissed'
  )),
  
  handled_by VARCHAR(100),
  handled_at TIMESTAMP,
  action_taken TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_reporter ON chat_reports(reporter_id);
CREATE INDEX idx_reports_reported ON chat_reports(reported_user_id);
CREATE INDEX idx_reports_status ON chat_reports(status);
```

---

### Redis 聊天缓存策略
```
# 聊天缓存
chat:messages:{conversationId}:{page}  # TTL: 5分钟
chat:typing:{conversationId}:{userId} # TTL: 5秒
chat:online:{userId}                   # TTL: 5分钟

# 会话缓存
conversation:{conversationId}         # TTL: 1小时
conversation:list:{userId}            # TTL: 10分钟

# 破冰问题缓存
icebreaker:match:{matchId}            # TTL: 24小时
```

---

## 视图（Views）

### v_user_profiles - 用户完整资料视图
```sql
CREATE VIEW v_user_profiles AS
SELECT 
  u.*,
  p.photo_urls,
  q.answered_count,
  q.is_completed AS questionnaire_completed,
  m.total_matches,
  m.pending_matches
FROM users u
LEFT JOIN (
  SELECT user_id, array_agg(url ORDER BY position) AS photo_urls
  FROM user_photos
  GROUP BY user_id
) p ON u.id = p.user_id
LEFT JOIN questionnaire_progress q ON u.id = q.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) FILTER (WHERE status = 'matched') AS total_matches,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_matches
  FROM weekly_matches
  GROUP BY user_id
) m ON u.id = m.user_id;
```

### v_match_statistics - 匹配统计视图
```sql
CREATE VIEW v_match_statistics AS
SELECT 
  DATE_TRUNC('week', created_at) AS week,
  COUNT(*) AS total_matches,
  COUNT(*) FILTER (WHERE status = 'matched') AS successful_matches,
  AVG(total_score) AS avg_match_score,
  COUNT(DISTINCT user_id) AS active_users
FROM weekly_matches
GROUP BY DATE_TRUNC('week', created_at);
```

---

## 索引策略

### 关键查询优化索引
```sql
-- 用户搜索索引
CREATE INDEX idx_users_search ON users(gender, city, birthday);
CREATE INDEX idx_users_active ON users(status, last_active_at) WHERE status = 'active';

-- 匹配查询索引
CREATE INDEX idx_matches_weekly ON weekly_matches(week_start_date, user_id, status);
CREATE INDEX idx_matches_pending ON weekly_matches(user_id, status) WHERE status = 'pending';

-- 暗恋匹配索引
CREATE INDEX idx_crushes_matching ON secret_crushes(crush_phone_hash, status);
```

---

## 分区策略

### 按时间分区的表
```sql
-- 通知表按月分区
CREATE TABLE notifications_y2025m01 PARTITION OF notifications
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE notifications_y2025m02 PARTITION OF notifications
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 匹配记录按月分区
CREATE TABLE weekly_matches_y2025m01 PARTITION OF weekly_matches
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

## 数据安全

### 敏感字段加密
```sql
-- 使用 pgcrypto 扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 手机号加密存储示例
-- 应用层加密后存储，数据库只存储密文
```

### 软删除
```sql
-- 用户删除使用软删除
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- 创建已删除用户视图
CREATE VIEW deleted_users AS
SELECT * FROM users WHERE deleted_at IS NOT NULL;
```

---

## Redis 缓存策略

### 缓存键设计
```
# 用户资料缓存
user:profile:{user_id}          # TTL: 1小时
user:photos:{user_id}           # TTL: 1小时

# 问卷缓存
questionnaire:progress:{user_id} # TTL: 30分钟
questions:all                    # TTL: 24小时

# 匹配缓存
matches:weekly:{user_id}:{week}  # TTL: 7天
matches:pending:{user_id}        # TTL: 10分钟

# 暗恋缓存
crush:hash:{phone_hash}          # TTL: 24小时

# 分布式锁
lock:matching:weekly             # 每周匹配任务锁
lock:user:update:{user_id}       # 用户更新锁
```

### 缓存更新策略
1. **Cache-Aside**: 读取时先查缓存，miss 则查数据库并写入缓存
2. **Write-Through**: 更新时同时更新缓存和数据库
3. **过期时间**: 根据数据变化频率设置不同 TTL

---

## 数据迁移脚本示例

```sql
-- 初始化问题库
INSERT INTO questions (code, category, question_text, question_type, options, matching_dimension, weight)
VALUES 
  ('Q1', 'values', '你认为婚姻中最重要的是什么？', 'single_choice', 
   '{"choices": ["信任与忠诚", "经济基础", "共同成长", "家庭和谐"]}', '价值观', 1.5),
  ('Q2', 'lifestyle', '你的作息习惯是？', 'single_choice',
   '{"choices": ["早睡早起", "晚睡晚起", "作息不规律", "随心情而定"]}', '生活习惯', 1.0);
-- ... 继续插入66道问题
```

---

## 数据库配置建议

### PostgreSQL 配置优化
```conf
# 连接池
max_connections = 200

# 内存配置
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB

# 查询优化
random_page_cost = 1.1
effective_io_concurrency = 200

# 日志
log_min_duration_statement = 1000
log_checkpoints = on
```

### 连接池配置
```typescript
// 使用 pgpool-II 或 PgBouncer
// 连接池大小建议: (CPU核心数 * 2) + 磁盘数
maxClient = 100
defaultPoolSize = 20
minPoolSize = 5
```
