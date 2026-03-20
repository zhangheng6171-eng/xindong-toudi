# Supabase 数据库配置 SQL

> **执行位置：** https://supabase.com/dashboard/project/ntaqnyegiiwtzdyqjiwy/sql/new
> **执行方式：** 复制 SQL → 粘贴到编辑器 → 点击 "Run"

---

## 1. 照片墙功能（profiles 表）

```sql
-- 创建 profiles 表（存储用户的照片墙、个人简介等扩展信息）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT DEFAULT '',
  occupation TEXT DEFAULT '',
  education TEXT DEFAULT '',
  height INTEGER DEFAULT 0,
  interests JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  looking_for JSONB DEFAULT '{"minAge":18,"maxAge":35,"cities":[],"relationship":"serious"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);

-- 设置访问权限
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON profiles FOR UPDATE USING (true);

-- 为现有用户创建 profiles 记录
INSERT INTO profiles (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM profiles)
ON CONFLICT DO NOTHING;
```

---

## 2. 互相喜欢功能（users 表添加 likes 字段）

```sql
-- 在 users 表添加 likes 字段（存储用户喜欢的人的ID列表）
ALTER TABLE users ADD COLUMN IF NOT EXISTS likes JSONB DEFAULT '[]'::jsonb;
```

---

## 3. 可选：创建独立的 likes 表

```sql
-- 如果想用独立表存储喜欢关系（更灵活）
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_likes_from ON likes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_to ON likes(to_user_id);

-- 设置访问权限
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON likes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON likes FOR DELETE USING (true);
```

---

## 验证命令

执行完上述 SQL 后，可以运行以下命令验证：

```sql
-- 检查 users 表是否有 likes 字段
SELECT id, nickname, likes FROM users LIMIT 5;

-- 检查 profiles 表是否存在
SELECT * FROM profiles LIMIT 5;

-- 检查 likes 表是否存在（如果创建了）
SELECT * FROM likes LIMIT 5;
```

---

## 当前用户 ID 参考

| 昵称 | 用户 ID |
|------|---------|
| qwe | user_1773966789326 |
| 123456 | user_1773933286452 |
| 12345678 | user_1773933431204 |
| 新用户测试 | user_1773933196118 |
