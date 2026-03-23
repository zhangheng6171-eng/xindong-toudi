# 数据库迁移指南

## 概述

本项目需要创建以下缺失的数据库表：

1. **weekly_matches** - 每周匹配记录表
2. **match_history** - 匹配历史表
3. **date_feedback** - 约会反馈表

## 执行迁移

### 方式一：在 Supabase Dashboard 中执行 SQL

1. 打开 Supabase 项目 Dashboard：https://supabase.com/dashboard
2. 选择项目：`ntaqnyegiiwtzdyqjiwy`
3. 进入 **SQL Editor**
4. 复制并粘贴 `supabase/migrations/20260323124000_create_feedback_and_history_tables.sql` 文件中的内容
5. 点击 **Run** 执行

### 方式二：使用 Supabase CLI

```bash
# 登录 Supabase
supabase login

# 链接本地项目
supabase link --project-ref ntaqnyegiiwtzdyqjiwy

# 执行迁移
supabase db push
```

## 测试数据

执行迁移后，可以运行测试数据脚本：

```bash
# 安装依赖
npm install

# 运行测试数据脚本
npx ts-node scripts/seed-test-data.ts
```

## 验证

执行以下命令验证表是否创建成功：

```bash
# 检查表是否存在
curl -s -H "apikey: <YOUR_ANON_KEY>" \
     -H "Authorization: Bearer <YOUR_ANON_KEY>" \
     "https://ntaqnyegiiwtzdyqjiwy.supabase.co/rest/v1/date_feedback?select=id&limit=1"
```

如果返回空数组 `[]` 表示表已存在。

## API 端点

- `GET /api/feedback` - 获取反馈列表
- `POST /api/feedback` - 提交反馈
- `GET /api/feedback/[matchId]` - 获取特定匹配的反馈
