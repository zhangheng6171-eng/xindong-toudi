# 心动投递 - Supabase 数据库配置指南

## 📋 概述

本文档说明如何在 Supabase 中配置心动投递项目的数据库，包括表结构、权限策略和实时订阅功能。

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Name: `xindong-toudi`
   - Database Password: 设置强密码
   - Region: 选择最近的区域（推荐 Singapore 或 Tokyo）
4. 等待项目创建完成（约 2 分钟）

### 2. 获取项目配置

创建完成后，在项目设置中获取以下信息：

```
项目设置 > API
- URL: https://xxxxx.supabase.co
- anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 数据库配置步骤

### Step 1: 执行 Schema SQL

1. 打开 Supabase Dashboard
2. 进入 **SQL Editor**
3. 创建新查询，粘贴 `supabase/schema.sql` 的内容
4. 点击 **Run** 执行

这将创建以下表：
- ✅ `users` - 用户基本信息
- ✅ `profiles` - 用户详细资料
- ✅ `matches` - 匹配记录
- ✅ `conversations` - 会话
- ✅ `messages` - 消息
- ✅ `message_reads` - 已读记录
- ✅ `gifts` - 礼物库
- ✅ `user_gifts` - 礼物赠送记录
- ✅ `user_actions` - 用户操作记录
- ✅ `user_settings` - 用户设置

### Step 2: 配置 Row Level Security

1. 在 SQL Editor 中创建新查询
2. 粘贴 `supabase/rls.sql` 的内容
3. 点击 **Run** 执行

这将配置以下安全策略：
- 🔒 用户只能访问自己的数据
- 🔒 用户可以查看其他用户的公开信息
- 🔒 消息只能在参与的会话中发送/接收
- 🔒 匹配记录只能被参与者查看

### Step 3: 启用 Realtime 功能

#### 方式一：通过 Dashboard（推荐）

1. 进入 **Database > Replication**
2. 找到 `messages` 表，点击配置
3. 启用 `INSERT` 和 `UPDATE` 事件
4. 对 `conversations` 和 `matches` 表重复上述步骤

#### 方式二：通过 SQL

1. 在 SQL Editor 中创建新查询
2. 粘贴 `supabase/realtime.sql` 的内容
3. 点击 **Run** 执行

这将配置：
- 📡 消息实时推送
- 📡 会话状态实时更新
- 📡 匹配通知实时推送

## 🔧 验证配置

### 验证表结构

```sql
-- 查看所有创建的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### 验证 RLS 策略

```sql
-- 查看所有 RLS 策略
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 验证 Realtime 配置

```sql
-- 查看 Realtime 发布配置
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

## 🧪 测试数据

### 创建测试用户

```sql
-- 插入测试用户
INSERT INTO users (email, nickname, gender, age, city)
VALUES 
  ('alice@example.com', 'Alice', 'female', 25, '北京'),
  ('bob@example.com', 'Bob', 'male', 28, '上海');

-- 查看用户
SELECT * FROM users;
```

### 测试匹配流程

```sql
-- 创建匹配
INSERT INTO matches (user1_id, user2_id, score, status)
SELECT 
  (SELECT id FROM users WHERE email = 'alice@example.com'),
  (SELECT id FROM users WHERE email = 'bob@example.com'),
  85.5,
  'matched';

-- 查看匹配
SELECT * FROM matches;
```

### 测试消息功能

```sql
-- 创建会话
INSERT INTO conversations (match_id, participant_ids)
SELECT 
  (SELECT id FROM matches WHERE status = 'matched' LIMIT 1),
  ARRAY[
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    (SELECT id FROM users WHERE email = 'bob@example.com')
  ];

-- 发送消息
INSERT INTO messages (conversation_id, sender_id, content)
SELECT 
  (SELECT id FROM conversations LIMIT 1),
  (SELECT id FROM users WHERE email = 'alice@example.com'),
  '你好！很高兴认识你';

-- 查看消息
SELECT * FROM messages;
```

## 📱 前端集成

### 安装依赖

```bash
npm install @supabase/supabase-js
# 或
pnpm add @supabase/supabase-js
```

### 基础使用

```typescript
import { supabase } from '@/lib/supabase'

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()

// 获取用户资料
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single()

// 发送消息
const { error } = await supabase
  .from('messages')
  .insert({
    conversation_id: 'xxx',
    sender_id: user.id,
    content: 'Hello!'
  })
```

### 实时订阅

```typescript
// 订阅会话消息
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('新消息:', payload.new)
      // 更新 UI
    }
  )
  .subscribe()

// 取消订阅
supabase.removeChannel(channel)
```

## 🔐 安全注意事项

1. **永远不要在客户端代码中使用 service_role key**
2. **所有客户端请求使用 anon key + RLS 策略**
3. **敏感操作通过 Edge Functions 执行**
4. **定期审查 RLS 策略**
5. **启用 Supabase 的审计日志**

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime 文档](https://supabase.com/docs/guides/realtime)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

## 🆘 常见问题

### Q: RLS 策略不生效？

确保：
1. 已启用 RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. 用户已通过 Supabase Auth 登录
3. 使用 `auth.uid()` 获取正确的用户 ID

### Q: Realtime 不工作？

确保：
1. 表已添加到 Realtime 发布
2. 客户端订阅使用正确的 filter
3. 用户有 RLS 权限访问数据

### Q: 如何重置数据库？

```sql
-- 警告：这将删除所有数据！
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 然后重新执行 schema.sql 和 rls.sql
```

---

## ✅ 配置完成清单

- [ ] 创建 Supabase 项目
- [ ] 配置环境变量
- [ ] 执行 schema.sql
- [ ] 执行 rls.sql
- [ ] 执行 realtime.sql
- [ ] 创建测试数据验证
- [ ] 前端集成测试
- [ ] 生产环境部署

配置完成后，你的心动投递项目就可以使用完整的数据库功能了！🎉
