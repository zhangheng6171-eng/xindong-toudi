# 心动投递 - 聊天系统架构设计

## 概述

聊天系统是心动投递的核心功能，为匹配成功的用户提供实时、有趣、安全的沟通渠道。基于 Supabase Realtime 实现 WebSocket 实时通信，确保稳定性和低延迟。

---

## 1. 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           客户端层 (Client)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ChatInterface Component                                            │
│  ├── MessageList (消息列表)                                          │
│  ├── MessageInput (消息输入)                                         │
│  ├── TypingIndicator (打字提示)                                      │
│  ├── IceBreaker (破冰建议)                                           │
│  └── QuickReplies (快速回复)                                         │
├─────────────────────────────────────────────────────────────────────┤
│                          服务层 (Service)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ChatService                                                         │
│  ├── sendMessage() - 发送消息                                        │
│  ├── markAsRead() - 标记已读                                         │
│  ├── recallMessage() - 撤回消息                                      │
│  ├── subscribeToMessages() - 订阅消息                                │
│  ├── sendTypingIndicator() - 发送打字状态                            │
│  └── getConversationHistory() - 获取历史记录                         │
├─────────────────────────────────────────────────────────────────────┤
│                        实时通信层 (Realtime)                          │
├─────────────────────────────────────────────────────────────────────┤
│  Supabase Realtime (WebSocket)                                       │
│  ├── Channel: chat:{conversationId}                                 │
│  ├── Events: message, typing, read, recall                          │
│  └── Presence: 在线状态                                              │
├─────────────────────────────────────────────────────────────────────┤
│                         数据层 (Data)                                │
├─────────────────────────────────────────────────────────────────────┤
│  PostgreSQL + Redis                                                  │
│  ├── conversations - 会话表                                          │
│  ├── messages - 消息表                                               │
│  ├── message_read_status - 已读状态表                                │
│  └── user_online_status - 在线状态表                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 实时通信 | Supabase Realtime | 基于 PostgreSQL 的 WebSocket 服务 |
| 状态管理 | React Context + Hooks | 轻量级状态管理 |
| 消息渲染 | react-markdown | Markdown 渲染支持 |
| 表情系统 | emoji-mart | 表情选择器 |
| 动画效果 | Framer Motion | 消息气泡动画 |
| 缓存 | Redis | 在线状态、打字状态缓存 |
| 数据库 | PostgreSQL | 消息持久化存储 |

---

## 2. 数据库设计

### 2.1 会话表 (conversations)

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
  last_message_preview VARCHAR(200), -- 消息预览（用于列表显示）
  
  -- 未读计数
  user1_unread_count INT DEFAULT 0,
  user2_unread_count INT DEFAULT 0,
  
  -- 破冰状态
  icebreaker_used BOOLEAN DEFAULT FALSE,
  icebreaker_question TEXT, -- 使用的破冰问题
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 唯一约束：一对用户只能有一个会话
  UNIQUE(user1_id, user2_id)
);

-- 索引
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_match ON conversations(match_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

### 2.2 消息表 (messages)

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
    'system',      -- 系统消息（破冰提示等）
    'icebreaker'   -- 破冰问题
  )),
  
  -- 消息内容
  content TEXT NOT NULL, -- 文本内容或 JSON
  
  -- 媒体内容（图片/语音）
  media_url TEXT,
  media_type VARCHAR(50), -- image/jpeg, audio/mp4 等
  media_size INT, -- 文件大小（字节）
  media_duration INT, -- 语音时长（秒）
  media_width INT, -- 图片宽度
  media_height INT, -- 图片高度
  
  -- 消息状态
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN (
    'sending',     -- 发送中
    'sent',        -- 已发送
    'delivered',   -- 已送达
    'read',        -- 已读
    'recalled'     -- 已撤回
  )),
  
  -- 引用消息（回复功能）
  reply_to_id UUID REFERENCES messages(id),
  
  -- 元数据
  metadata JSONB, -- 扩展字段
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 撤回时间（2分钟内可撤回）
  recalled_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_status ON messages(conversation_id, status);
```

### 2.3 消息已读状态表 (message_read_status)

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

### 2.4 用户在线状态表 (user_online_status)

```sql
CREATE TABLE user_online_status (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP,
  last_active_device VARCHAR(50), -- web, ios, android
  
  -- 在线状态可见性
  show_online BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_online_status ON user_online_status(is_online) WHERE is_online = TRUE;
```

### 2.5 打字状态表 (typing_status)

```sql
-- 使用 Redis 存储，键设计：
-- typing:{conversationId}:{userId} -> TTL 5s

-- Redis 键结构：
-- Key: typing:conv_abc123:user_xyz
-- Value: {"typing": true, "timestamp": 1705000000}
-- TTL: 5秒自动过期
```

### 2.6 敏感词过滤表 (sensitive_words)

```sql
CREATE TABLE sensitive_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50), -- 'profanity', 'ad', 'fraud', 'political'
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  replacement VARCHAR(100), -- 替换词
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sensitive_words ON sensitive_words(word);
```

### 2.7 举报记录表 (chat_reports)

```sql
CREATE TABLE chat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  
  -- 举报类型
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
    'harassment',     -- 骚扰
    'inappropriate',  -- 不当内容
    'spam',           -- 垃圾信息
    'fraud',          -- 欺诈
    'other'           -- 其他
  )),
  
  -- 举报详情
  description TEXT,
  evidence_urls TEXT[], -- 截图证据
  
  -- 处理状态
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

## 3. WebSocket 通信协议

### 3.1 频道设计

```typescript
// 会话频道
const channel = supabase.channel(`chat:${conversationId}`)

// 用户在线状态频道
const presenceChannel = supabase.channel(`presence:${userId}`)
```

### 3.2 事件类型

| 事件名 | 方向 | 说明 | 数据结构 |
|--------|------|------|----------|
| `message:new` | Server → Client | 新消息 | `{ message: Message }` |
| `message:read` | Client → Server | 标记已读 | `{ messageId: string }` |
| `message:recall` | Client → Server | 撤回消息 | `{ messageId: string }` |
| `typing:start` | Client → Server | 开始打字 | `{ conversationId: string }` |
| `typing:stop` | Client → Server | 停止打字 | `{ conversationId: string }` |
| `presence:sync` | Server → Client | 在线状态同步 | `{ userIds: string[] }` |

### 3.3 消息格式示例

```typescript
// 发送消息
{
  event: 'message:new',
  payload: {
    id: 'msg_abc123',
    conversationId: 'conv_xyz',
    senderId: 'user_1',
    messageType: 'text',
    content: '你好！看了你的资料，我们有很多共同爱好',
    createdAt: '2025-03-18T10:00:00Z'
  }
}

// 打字状态
{
  event: 'typing:start',
  payload: {
    conversationId: 'conv_xyz',
    userId: 'user_1'
  }
}

// 在线状态
{
  event: 'presence:sync',
  payload: {
    onlineUsers: ['user_1', 'user_2'],
    timestamp: '2025-03-18T10:00:00Z'
  }
}
```

---

## 4. 核心功能实现

### 4.1 消息发送流程

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  用户输入  │────▶│ 敏感词过滤 │────▶│ 存储消息  │────▶│ 推送消息  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                       │
                       ▼
                 ┌──────────┐
                 │ 违规拦截  │
                 └──────────┘
```

1. **敏感词过滤**
   - 对消息内容进行敏感词检测
   - 低级敏感词：自动替换为 `*`
   - 中级敏感词：标记消息，允许发送但记录
   - 高级敏感词：拦截消息，提示用户

2. **存储消息**
   - 写入 messages 表
   - 更新 conversations 表的 last_message 字段

3. **推送消息**
   - 通过 Supabase Realtime 推送给对方
   - 如果对方离线，发送推送通知

### 4.2 消息已读机制

```
用户A                         用户B
  │                            │
  │  ──── message:new ────▶    │
  │                            │
  │  ◀─── message:read ────    │  (查看消息时发送)
  │                            │
  │  更新消息状态为 read         │
```

1. 用户打开聊天页面，自动将未读消息标记为已读
2. 发送 `message:read` 事件给对方
3. 更新 `message_read_status` 表
4. 更新会话的未读计数

### 4.3 消息撤回

- **时间限制**: 2分钟内可撤回
- **流程**:
  1. 检查消息发送时间
  2. 更新消息状态为 `recalled`
  3. 推送撤回通知给对方
  4. 对方客户端删除/隐藏消息

### 4.4 在线状态管理

```typescript
// Presence 机制
const presenceChannel = supabase.channel('online-users', {
  config: {
    presence: {
      key: userId
    }
  }
})

// 上线
presenceChannel.track({
  user_id: userId,
  online_at: new Date().toISOString(),
  device: 'web'
})

// 下线（自动处理）
// Supabase Presence 会在连接断开时自动移除
```

---

## 5. 智能功能设计

### 5.1 破冰功能

#### 破冰问题库

```typescript
const icebreakerQuestions = [
  {
    id: 'ice_1',
    category: 'travel',
    question: '如果可以瞬间移动到任何地方，你最想去哪里？',
    conditions: ['都喜欢旅行']
  },
  {
    id: 'ice_2',
    category: 'food',
    question: '你最近吃到最好吃的是什么？',
    conditions: ['都是吃货']
  },
  {
    id: 'ice_3',
    category: 'values',
    question: '你觉得什么样的生活才算是有意义的？',
    conditions: ['价值观相似']
  },
  // ... 更多问题
]
```

#### 智能推荐逻辑

1. **首次打开聊天**: 检测是否首次对话
2. **分析匹配理由**: 提取匹配理由关键词
3. **匹配破冰问题**: 根据匹配理由推荐相关破冰问题
4. **一键发送**: 用户可选择一键发送破冰问题

### 5.2 话题推荐

```typescript
interface TopicRecommendation {
  topic: string
  reason: string
  starterQuestions: string[]
}

// 示例
{
  topic: '旅行',
  reason: '你们都喜欢旅行',
  starterQuestions: [
    '你去过最喜欢的地方是哪里？',
    '有没有什么旅行中的趣事想分享？',
    '下一个想去的目的地是哪里？'
  ]
}
```

### 5.3 聊天氛围分析

```typescript
interface ChatAtmosphere {
  level: 'good' | 'neutral' | 'cold' | 'awkward'
  score: number // 0-100
  suggestions: string[]
  indicators: {
    responseRate: number // 回复率
    avgResponseTime: number // 平均回复时间
    messageLengthRatio: number // 消息长度比
    questionCount: number // 提问次数
    emojiUsage: number // 表情使用频率
  }
}

// 冷场检测逻辑
function analyzeConversation(messages: Message[]): ChatAtmosphere {
  // 1. 检查回复时间（超过30分钟未回复）
  // 2. 检查消息长度（单字回复如"哦"、"嗯"）
  // 3. 检查提问次数（连续多轮没有提问）
  // 4. 综合评分
}
```

### 5.4 快速回复建议

基于对方消息内容，提供快捷回复选项：

```typescript
const quickReplySuggestions = {
  'travel': [
    '哇，听起来很棒！',
    '我也想去那里！',
    '有什么推荐的景点吗？'
  ],
  'food': [
    '看起来好好吃！',
    '在哪里呀？我也想去',
    '你会做饭吗？'
  ],
  'default': [
    '哈哈，有意思',
    '然后呢？',
    '能详细说说吗？'
  ]
}
```

---

## 6. 安全与隐私

### 6.1 消息加密

- **传输加密**: HTTPS + WSS
- **存储加密**: 敏感字段（如手机号）加密存储
- **端到端加密**: 可选功能，适用于高隐私需求场景

### 6.2 敏感词过滤

```typescript
async function filterSensitiveContent(content: string): Promise<FilterResult> {
  // 1. 加载敏感词库
  // 2. DFA 算法检测
  // 3. 返回检测结果
  return {
    isClean: boolean,
    matchedWords: string[],
    severity: 'low' | 'medium' | 'high',
    filteredContent: string // 替换后的内容
  }
}
```

### 6.3 举报机制

1. **举报入口**: 长按消息 → 举报
2. **举报类型**: 骚扰、不当内容、垃圾信息、欺诈、其他
3. **处理流程**:
   - 用户举报 → 创建举报记录
   - 管理员审核 → 处理/驳回
   - 处理结果 → 通知举报人

### 6.4 防骚扰机制

- **消息频率限制**: 每分钟最多 20 条消息
- **首次对话限制**: 双方匹配后才能发送消息
- **拉黑功能**: 支持屏蔽用户

---

## 7. 性能优化

### 7.1 消息分页加载

```sql
-- 分页查询消息
SELECT * FROM messages
WHERE conversation_id = $1
ORDER BY created_at DESC
LIMIT 20 OFFSET $2;
```

### 7.2 Redis 缓存策略

```typescript
// 缓存键设计
const CACHE_KEYS = {
  conversation: (id: string) => `conv:${id}`,
  messages: (id: string, page: number) => `msgs:${id}:${page}`,
  onlineStatus: (userId: string) => `online:${userId}`,
  typingStatus: (convId: string, userId: string) => `typing:${convId}:${userId}`
}

// 缓存策略
const CACHE_TTL = {
  conversation: 3600,    // 1小时
  messages: 300,         // 5分钟
  onlineStatus: 300,     // 5分钟
  typingStatus: 5        // 5秒
}
```

### 7.3 消息索引优化

```sql
-- 复合索引优化查询
CREATE INDEX idx_messages_conv_created ON messages(conversation_id, created_at DESC);

-- 部分索引优化未读查询
CREATE INDEX idx_messages_unread ON messages(conversation_id, created_at)
WHERE status = 'sent';
```

---

## 8. API 接口设计

### 8.1 聊天相关 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/chat/conversations` | 获取会话列表 |
| GET | `/api/chat/conversations/:id` | 获取会话详情 |
| GET | `/api/chat/conversations/:id/messages` | 获取消息历史 |
| POST | `/api/chat/conversations/:id/messages` | 发送消息 |
| POST | `/api/chat/conversations/:id/read` | 标记已读 |
| POST | `/api/chat/messages/:id/recall` | 撤回消息 |
| POST | `/api/chat/conversations/:id/typing` | 发送打字状态 |
| GET | `/api/chat/conversations/:id/icebreaker` | 获取破冰建议 |
| POST | `/api/chat/conversations/:id/block` | 屏蔽会话 |
| POST | `/api/chat/messages/:id/report` | 举报消息 |

### 8.2 在线状态 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users/:id/online-status` | 获取用户在线状态 |
| POST | `/api/users/me/online` | 更新自己的在线状态 |

---

## 9. 前端组件设计

### 9.1 组件结构

```
src/components/chat/
├── ChatInterface.tsx       # 主聊天组件
├── MessageList.tsx         # 消息列表
├── MessageBubble.tsx       # 消息气泡
├── MessageInput.tsx        # 消息输入框
├── TypingIndicator.tsx     # 打字提示
├── IceBreakerPanel.tsx     # 破冰面板
├── QuickReplies.tsx        # 快速回复
├── EmojiPicker.tsx         # 表情选择器
├── ConversationList.tsx    # 会话列表
├── OnlineStatusBadge.tsx   # 在线状态徽章
└── ChatHeader.tsx          # 聊天头部
```

### 9.2 状态管理

```typescript
interface ChatState {
  // 当前会话
  currentConversation: Conversation | null
  
  // 消息列表
  messages: Message[]
  hasMore: boolean
  loadingMore: boolean
  
  // 在线状态
  isOtherUserOnline: boolean
  isOtherUserTyping: boolean
  
  // UI 状态
  isSending: boolean
  inputText: string
  showEmojiPicker: boolean
  showIceBreaker: boolean
  
  // 实时订阅
  channel: RealtimeChannel | null
}
```

---

## 10. 部署与监控

### 10.1 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Next.js  │   │ Next.js  │   │ Next.js  │
        │ Instance │   │ Instance │   │ Instance │
        └──────────┘   └──────────┘   └──────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  ┌──────────┐         ┌──────────┐         ┌──────────┐
  │ PostgreSQL│         │  Redis   │         │ Supabase │
  │ (Messages)│         │  (Cache) │         │ Realtime │
  └──────────┘         └──────────┘         └──────────┘
```

### 10.2 监控指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| WebSocket 连接数 | 实时连接数 | > 10000 |
| 消息延迟 | 消息发送到接收的时间 | > 500ms |
| 消息发送成功率 | 成功发送的消息占比 | < 99% |
| API 响应时间 | 接口响应时间 | > 200ms |
| 错误率 | 接口错误率 | > 1% |

---

## 11. 扩展规划

### 11.1 短期计划 (v1.0)

- [x] 文本消息
- [x] 表情支持
- [x] 消息已读
- [x] 消息撤回
- [x] 破冰功能
- [x] 在线状态

### 11.2 中期计划 (v2.0)

- [ ] 图片消息
- [ ] 语音消息
- [ ] 语音转文字
- [ ] 视频通话
- [ ] 消息翻译

### 11.3 长期计划 (v3.0)

- [ ] AI 聊天助手
- [ ] 聊天游戏
- [ ] 共享活动日历
- [ ] 礼物系统

---

## 12. 总结

心动投递聊天系统采用 Supabase Realtime 作为实时通信基础设施，结合 PostgreSQL 的可靠性，为用户提供稳定、有趣、安全的聊天体验。核心亮点：

1. **实时可靠**: WebSocket 实时通信，消息毫秒级送达
2. **智能破冰**: 基于匹配理由的智能破冰问题推荐
3. **氛围感知**: 实时分析聊天氛围，提供话题建议
4. **安全可控**: 敏感词过滤、举报机制、隐私保护
5. **体验优化**: 打字提示、已读回执、消息动画

这套架构既保证了系统的稳定性和可扩展性，又能提供良好的用户体验，是心动投递产品的核心竞争力之一。
