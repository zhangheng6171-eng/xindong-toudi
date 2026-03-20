# 心动投递 💕

> AI智能约会匹配平台 - 让缘分每周如约而至

## 项目概述

**心动投递** 是一款创新的AI驱动约会匹配平台，灵感来源于风靡全美名校的Date Drop。我们相信，真正的连接不来自滑动屏幕，而来自灵魂的共鸣。

### 核心特色

- 🎯 **每周一配** - 告别无止尽的滑动，每周精准匹配一位对象
- 🧠 **AI懂你** - 66道深度问题，AI比你更懂你想要什么
- 💝 **缘分理由** - 告诉你为什么你们合适，不是随机配对
- 🌟 **真诚连接** - 基于价值观、兴趣、生活方式的深度匹配
- 💘 **爱神模式** - 成为月老，撮合好友
- 💌 **暗恋告白** - 双向暗恋自动匹配

---

## 项目结构

```
心动投递/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx           # 首页
│   │   ├── layout.tsx         # 根布局
│   │   ├── questionnaire/     # 问卷系统
│   │   ├── match/             # 匹配结果
│   │   ├── cupid/             # 爱神模式
│   │   ├── crush/             # 暗恋告白
│   │   ├── profile/           # 个人主页
│   │   └── api/               # API路由
│   │       ├── auth/          # 认证
│   │       ├── match/         # 匹配
│   │       ├── cupid/         # 爱神
│   │       └── crush/         # 暗恋
│   ├── components/            # React组件
│   │   ├── ui.tsx            # UI组件库
│   │   ├── navbar.tsx        # 导航栏
│   │   └── layout.tsx        # 布局组件
│   └── lib/                   # 核心库
│       ├── utils.ts          # 工具函数
│       ├── matching-algorithm.ts  # 匹配算法
│       └── questionnaire-data.ts  # 问卷数据
│
├── architecture/              # 架构设计
│   ├── database-schema.sql   # 数据库设计
│   ├── questionnaire-design.md  # 问卷设计
│   ├── api-design.md         # API设计
│   └── matching-algorithm.md # 算法设计
│
├── design/                    # UI/UX设计
│   └── ui-design.md          # 设计文档
│
├── research/                  # 产品研究
│   └── product-analysis.md   # 产品分析
│
├── public/                    # 静态资源
├── package.json              # 依赖配置
├── tailwind.config.ts        # Tailwind配置
├── docker-compose.yml        # Docker编排
├── Dockerfile                # Docker镜像
├── vercel.json               # Vercel部署
└── README.md                 # 项目文档
```

---

## 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **状态**: React Hooks

### 后端
- **API**: Next.js API Routes
- **数据库**: PostgreSQL (Supabase推荐)
- **缓存**: Redis
- **认证**: JWT

### 部署
- **推荐**: Vercel
- **备选**: Docker + 云服务器

---

## 快速开始

### 1. 克隆项目

```bash
cd /root/.openclaw/workspace/心动投递
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入实际配置
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 生产构建

```bash
npm run build
npm start
```

---

## 核心功能

### 1. 灵魂问卷系统 📝

66道精心设计的问题，涵盖：
- 价值观核心 (30%)
- 恋爱观 (20%)
- 未来规划 (15%)
- 生活方式 (15%)
- 性格特质 (10%)
- 兴趣爱好 (5%)
- 家庭观 (3%)
- 政治观点 (1%)
- 底线问题 (1%)

详见: [问卷设计文档](architecture/questionnaire-design.md)

### 2. AI匹配引擎 🧠

多维度匹配算法：
- 价值观相似度计算
- 兴趣Jaccard相似度
- 性格特质向量匹配
- 行为反馈持续优化

详见: [匹配算法文档](architecture/matching-algorithm.md)

### 3. 每周投递机制 💌

- 每周二晚8点揭晓匹配
- 展示匹配理由和兼容度
- 提供联系方式，用户自主行动

### 4. 爱神模式 💘

- 成为月老，撮合好友
- 为朋友推荐合适的对象
- 匿名助攻，保护隐私

### 5. 暗恋告白 💌

- 悄悄填写暗恋名单
- 双向暗恋自动匹配
- 帮你戳破那层窗户纸

详见: [API设计文档](architecture/api-design.md)

---

## 部署指南

### Vercel部署 (推荐)

1. 推送代码到GitHub
2. 在Vercel导入项目
3. 配置环境变量
4. 部署完成

配置文件: `vercel.json`

### Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

配置文件: `docker-compose.yml`

---

## 数据库初始化

```bash
# 连接数据库
psql -U xindong -d xindongtoudi

# 执行初始化脚本
\i architecture/database-schema.sql
```

详见: [数据库设计](architecture/database-schema.sql)

---

## 开发指南

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 组件使用函数式写法
- 样式使用 Tailwind CSS

### Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

### 分支管理

```
main     - 生产环境
develop  - 开发环境
feature/* - 功能分支
hotfix/*  - 紧急修复
```

---

## 性能优化

- [x] 图片懒加载
- [x] 代码分割
- [x] API缓存
- [x] Redis缓存热门数据
- [x] 数据库索引优化
- [x] 静态资源CDN

---

## 安全措施

- [x] JWT认证
- [x] 密码加密存储
- [x] SQL注入防护
- [x] XSS防护
- [x] CSRF防护
- [x] 敏感信息加密
- [x] 请求频率限制

---

## 监控与告警

- 应用健康检查
- 错误日志收集
- 性能指标监控
- 匹配质量监控
- 用户行为分析

---

## 产品路线图

### Phase 1 - MVP (当前)
- [x] 用户注册/登录
- [x] 66道问卷系统
- [x] 核心匹配算法
- [x] 每周匹配展示
- [x] 基础个人主页
- [x] 爱神模式
- [x] 暗恋告白

### Phase 2 - 增强
- [ ] 实时聊天系统
- [ ] 约会反馈系统
- [ ] 视频认证
- [ ] 更多匹配维度
- [ ] 匹配历史查看

### Phase 3 - 商业化
- [ ] VIP会员系统
- [ ] 高级筛选功能
- [ ] 超级曝光
- [ ] 看谁喜欢我
- [ ] 无限匹配

---

## 竞品对比

| 维度 | 心动投递 | 探探 | Soul | Tinder |
|------|---------|------|------|--------|
| 匹配机制 | 每周固定 | 左滑右滑 | 灵魂测试 | 地理位置 |
| 匹配质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 社交压力 | 低 | 中 | 低 | 高 |
| 用户群体 | 20-35岁 | 18-35岁 | 18-30岁 | 18-40岁 |

---

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 许可证

Copyright © 2024 临沂鲁曜同创 All rights reserved.

---

## 联系方式

- 项目地址: `/root/.openclaw/workspace/心动投递`
- 文档地址: 各 `architecture/`、`design/`、`research/` 目录
- 版权所有: 临沂鲁曜同创

---

**让每一次心动，都有回响** 💕

_Made with ❤️ by 临沂鲁曜同创_
