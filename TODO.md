# 心动投递 - 待处理事项清单

> 最后更新：2026-03-25

## 一、当前状态

✅ **已部署上线** - 生产环境运行中
- **网站地址：** https://xindong-toudi.vercel.app
- **部署时间：** 2026-03-25 22:57

---

## 二、已完成的事项

### 1. 环境配置 ✅

- [x] **设置 JWT_SECRET**
  - 生成了安全的密钥：`syCVqI6oIZntPoasssE8uArR+KPgIhU5eBDro5PtkHc=`
  - 已添加到 Vercel 环境变量

- [x] **配置 Supabase 环境变量**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`

### 2. 部署上线 ✅

- [x] **部署到 Vercel**
  - 使用 Vercel Token 部署成功
  - 域名已绑定：xindong-toudi.vercel.app

### 3. 代码修复 ✅

- [x] **修复 Supabase 客户端初始化问题**
  - 改用延迟初始化，避免构建时环境变量缺失错误
  - 修复了多个 API 路由的 supabaseAdmin 引用问题

- [x] **修复微信登录 API**
  - 添加条件判断，微信未配置时不会初始化 supabaseAdmin

---

## 三、待处理事项

### 1. 功能验证

- [ ] **验证功能**
  - [ ] 注册/登录流程
  - [ ] 问卷填写
  - [ ] 匹配功能
  - [ ] 约会反馈
  - [ ] 匹配历史查看
  - [ ] 聊天功能
  - [ ] 视频/语音通话

### 2. 微信登录配置

- [ ] **配置微信登录**
  - 需要在微信开放平台完成企业认证
  - 配置 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`
  - 详细步骤见 `docs/WECHAT_LOGIN.md`

---

## 四、功能检查清单

### 已完成 ✅

| 功能 | 状态 |
|------|------|
| 用户注册/登录 | ✅ 完成 |
| 手机号验证码登录 | ✅ 完成 |
| 微信登录 | ✅ 代码完成（需配置） |
| 问卷填写 (v2) | ✅ 完成 |
| AI 匹配算法 v3 | ✅ 完成 |
| 约会反馈系统 | ✅ 完成 |
| 匹配历史查看 | ✅ 完成 |
| 聊天功能 | ✅ 完成 |
| 视频通话 | ✅ 完成 |
| 语音聊天 | ✅ 完成 |
| 个人资料编辑 | ✅ 完成 |
| Vercel 部署 | ✅ 完成 |
| JWT_SECRET 配置 | ✅ 完成 |

### 待配置 ⚙️

| 功能 | 状态 |
|------|------|
| 微信登录正式环境 | ⚙️ 需配置 AppID/Secret |
| 功能验证 | ⏳ 待测试 |

---

## 五、技术债务

1. **登录页面 SSR 问题** - 已修复（动态导入 AnimatePresence）
2. **缺少管理员后台** - 可后续开发

---

## 六、相关文档

- `docs/WECHAT_LOGIN.md` - 微信登录配置指南
- `FEATURE_DESIGN.md` - 功能设计文档
- `DATABASE_MIGRATION.md` - 数据库迁移指南
- `ALGORITHM_V3_OPTIMIZATION_REPORT.md` - 算法优化报告