# 心动投递 - Supabase 数据库配置指南

## 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project" 创建新项目
3. 填写项目名称和数据库密码
4. 选择离你最近的区域
5. 等待项目创建完成（约2分钟）

### 2. 执行数据库 Schema

在 Supabase Dashboard 中：

1. 进入项目后，点击左侧 "SQL Editor"
2. 点击 "New Query"
3. 按顺序执行以下文件：

```sql
-- 1. 首先执行表结构
-- 复制 supabase/schema.sql 的内容并执行

-- 2. 然后执行 RLS 策略
-- 复制 supabase/rls.sql 的内容并执行

-- 3. 最后执行实时订阅配置
-- 复制 supabase/realtime.sql 的内容并执行
```

### 3. 获取 API 密钥

1. 点击左侧 "Settings" → "API"
2. 复制以下值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

### 4. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 可选：Service Role Key（仅服务端使用）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. 配置实时订阅

在 Supabase Dashboard 中：

1. 进入 "Database" → "Replication"
2. 确保以下表已启用 Realtime：
   - `messages`
   - `conversations`
   - `matches`
   - `user_online_status`
   - `typing_indicators`

## 表结构说明

### users - 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | VARCHAR | 邮箱 |
| nickname | VARCHAR | 昵称 |
| avatar | TEXT | 头像URL |
| gender | VARCHAR | 性别 |
| age | INTEGER | 年龄 |
| city | VARCHAR | 城市 |

### profiles - 用户资料表
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | UUID | 用户ID（外键） |
| bio | TEXT | 个人简介 |
| interests | TEXT[] | 兴趣标签 |
| values | TEXT[] | 价值观标签 |
| looking_for | JSONB | 择偶要求 |
| questionnaire_answers | JSONB | 问卷答案 |
| personality_scores | JSONB | 人格分数 |

### matches - 匹配表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user1_id | UUID | 用户1 ID |
| user2_id | UUID | 用户2 ID |
| score | INTEGER | 匹配分数 |
| status | VARCHAR | 状态 |
| week_number | INTEGER | 周期号 |

### conversations - 会话表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| match_id | UUID | 匹配ID |
| participant_ids | UUID[] | 参与者ID列表 |
| last_message | TEXT | 最后消息 |
| last_message_at | TIMESTAMPTZ | 最后消息时间 |

### messages - 消息表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| conversation_id | UUID | 会话ID |
| sender_id | UUID | 发送者ID |
| content | TEXT | 消息内容 |
| type | VARCHAR | 消息类型 |
| status | VARCHAR | 状态 |

## 常见问题

### Q: 为什么有两个 RLS 策略文件？

A: `rls.sql` 包含两套策略：
1. **JWT 策略**：使用 Supabase Auth 的 JWT 进行认证
2. **开发策略**：更宽松的策略，用于开发环境

生产环境建议使用 JWT 策略。

### Q: 如何测试实时订阅？

A: 可以在 Supabase Dashboard 中测试：

```javascript
// 在浏览器控制台
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('your-url', 'your-anon-key')

// 订阅消息
supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
    payload => console.log(payload)
  )
  .subscribe()
```

### Q: 如何重置数据库？

A: 执行以下 SQL 清除所有数据：

```sql
-- 警告：这将删除所有数据！
DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS typing_indicators CASCADE;
DROP TABLE IF EXISTS user_online_status CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS user_likes CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 然后重新执行 schema.sql
```

## 下一步

1. ✅ 创建 Supabase 项目
2. ✅ 执行数据库 Schema
3. ✅ 配置环境变量
4. ✅ 启用 Realtime
5. 🚀 启动开发服务器：`npm run dev`

## 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Next.js 集成指南](https://supabase.com/docs/guides/with-nextjs)
- [Realtime 订阅](https://supabase.com/docs/guides/realtime)
