# 数据库初始化指南

## 问题
profiles 表不存在，导致照片墙数据无法跨设备同步。

## 解决方案

需要在 Supabase Dashboard 中手动创建 profiles 表。

### 步骤：

1. **登录 Supabase Dashboard**
   - 打开 https://supabase.com/dashboard
   - 登录你的 Supabase 账号
   - 选择项目: `ntaqnyegiiwtzdyqjiwy`

2. **打开 SQL Editor**
   - 在左侧菜单点击 "SQL Editor"
   - 点击 "New query"

3. **执行以下 SQL**

```sql
-- ============================================
-- 创建 profiles 表（用户详细资料表）
-- ============================================

-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  bio TEXT,
  interests TEXT[],
  looking_for JSONB,
  occupation VARCHAR(200),
  education VARCHAR(200),
  height INTEGER,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 启用 Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取
CREATE POLICY "Allow public read" 
ON profiles FOR SELECT 
USING (true);

-- 创建策略：允许认证用户更新自己的资料
CREATE POLICY "Allow users update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid()::text = user_id);

-- 创建策略：允许服务角色所有操作
CREATE POLICY "Allow service role all" 
ON profiles FOR ALL 
TO service_role 
USING (true);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 验证表是否创建成功
-- ============================================
SELECT * FROM profiles LIMIT 1;
```

4. **验证**
   - 执行后应该会看到空结果（没有报错）
   - 在左侧 "Table Editor" 中应该能看到 `profiles` 表

### 表结构说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| user_id | TEXT | 关联 users 表的 id |
| bio | TEXT | 个人简介 |
| interests | TEXT[] | 兴趣爱好数组 |
| looking_for | JSONB | 择偶条件（JSON格式） |
| occupation | VARCHAR(200) | 职业 |
| education | VARCHAR(200) | 学历 |
| height | INTEGER | 身高（cm） |
| photos | TEXT[] | 照片墙数组（base64或URL） |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### 测试

创建表后，可以测试 API：

```bash
# 测试获取用户列表（包含照片墙）
curl https://xindong-toudi.pages.dev/api/users/list

# 测试更新用户资料
curl -X POST https://xindong-toudi.pages.dev/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1773933196118",
    "updates": {
      "photos": ["data:image/...", "data:image/..."]
    }
  }'
```

### 注意事项

1. 创建表后，之前用户上传的照片墙数据需要从 localStorage 重新上传才能同步到云端
2. 头像数据直接存储在 users 表，不需要 profiles 表
3. 如果执行 SQL 遇到权限问题，确保使用的是 project owner 账号

### 部署状态

- ✅ GitHub: https://github.com/zhangheng6171-eng/xindong-toudi
- ✅ Cloudflare: https://xindong-toudi.pages.dev
- ⏳ 等待 profiles 表创建

完成 SQL 执行后，跨设备照片墙同步功能将完全可用！
