# 数据库配置指南

## 当前问题

localStorage 只能在同一浏览器内共享数据，无法实现跨浏览器消息同步。

## 解决方案：使用 Supabase（免费）

### 第一步：创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 或邮箱登录
4. 创建新组织（如果还没有）
5. 创建新项目：
   - 项目名称：xindong-toudi
   - 数据库密码：（自己设置，记住这个密码）
   - 区域：选择 Northeast Asia (Tokyo) - 离中国最近

### 第二步：获取 API 密钥

创建项目后：
1. 进入项目控制台
2. 点击左侧菜单 "Settings" (齿轮图标)
3. 点击 "API"
4. 复制以下内容：
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY，点击 "Reveal" 显示)

### 第三步：创建数据表

1. 进入 Supabase 控制台
2. 点击左侧 "SQL Editor"
3. 点击 "New query"
4. 复制 `supabase/schema.sql` 的内容并粘贴
5. 点击 "Run" 执行

### 第四步：配置环境变量

将获取的密钥填入 `.env.local`：

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
\`\`\`

### 第五步：部署

\`\`\`bash
npm run build
npx wrangler pages deploy out --project-name=xindong-toudi
\`\`\`

## 费用说明

Supabase 免费套餐包含：
- 500MB 数据库存储
- 1GB 文件存储
- 50,000 月活跃用户
- 无限 API 请求

对于小型应用完全够用！

## 替代方案

如果不想使用 Supabase，也可以使用：
- Firebase（Google）
- PlanetScale（MySQL）
- Neon（PostgreSQL）
- Turso（SQLite）

## 需要帮助？

如果你在配置过程中遇到问题，请告诉我：
1. 你已经完成了哪一步
2. 遇到了什么错误

我会帮你解决！
