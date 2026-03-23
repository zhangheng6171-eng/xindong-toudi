# 心动投递 - Phase 2 功能开发详细设计

## 功能一：约会反馈系统

### 1.1 数据库

已存在 `date_feedback` 表，无需修改：
```sql
CREATE TABLE date_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES weekly_matches(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- 反馈内容
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  would_meet_again BOOLEAN,
  
  -- 详细反馈
  what_went_well TEXT,
  what_could_improve TEXT,
  
  -- 性格匹配反馈
  personality_match_rating INTEGER CHECK (personality_match_rating >= 1 AND personality_match_rating <= 5),
  values_match_rating INTEGER CHECK (values_match_rating >= 1 AND values_match_rating <= 5),
  interests_match_rating INTEGER CHECK (interests_match_rating >= 1 AND interests_match_rating <= 5),
  
  -- 是否愿意继续接触
  want_to_continue BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(match_id, user_id)
);
```

### 1.2 API 设计

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/feedback | 提交反馈 |
| GET | /api/feedback | 获取当前用户的反馈列表 |
| GET | /api/feedback/[matchId] | 获取特定匹配的反馈 |

### 1.3 前端页面

**路径**: `/feedback` 或 `/match/[id]/feedback`

**页面结构**:
1. 匹配对象信息卡片（头像、昵称、匹配时间）
2. 星级评分组件（总体体验）
3. 三个维度评分：
   - 性格匹配度 (1-5星)
   - 价值观匹配度 (1-5星)
   - 兴趣爱好匹配度 (1-5星)
4. 开放问题：
   - 这次约会让你印象深刻的地方？
   - 有什么可以改进的？
5. 单选按钮：
   - 是否愿意见第二次？
   - 是否愿意继续了解？
6. 提交按钮
7. 提交成功后的感谢页

### 1.4 交互流程

```
匹配详情页 → 点击"提交反馈" → 反馈表单页 → 提交 → 成功提示 → 更新匹配状态为"completed"
```

---

## 功能二：匹配历史查看

### 2.1 数据库

已存在 `match_history` 表，无需修改：
```sql
CREATE TABLE match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  matched_user_id UUID NOT NULL REFERENCES users(id),
  week_number VARCHAR(10) NOT NULL,
  
  -- 匹配时的快照数据
  compatibility_score DECIMAL(5, 2),
  match_reasons JSONB,
  
  -- 结果
  outcome VARCHAR(20) CHECK (outcome IN (
    'viewed', 'contacted', 'dated', 'relationship', 'no_contact'
  )),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 API 设计

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/match/history | 获取匹配历史列表 |
| GET | /api/match/history/stats | 获取匹配统计数据 |

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `outcome`: 筛选结果类型

### 2.3 前端页面

**路径**: `/history` 或 `/profile/history`

**页面结构**:
1. **统计卡片区域**:
   - 总匹配次数
   - 成功约会次数
   - 匹配成功率
   - 平均匹配度

2. **筛选器**:
   - 全部 / 已联系 / 已约会 /  建立关系

3. **匹配历史列表**:
   - 卡片式设计
   - 显示：对方头像、昵称、匹配周次、匹配度、匹配理由、结果状态
   - 点击进入详情

4. **详情页 `/history/[id]`**:
   - 对方完整信息（基于历史快照）
   - 当时的匹配理由
   - 后续结果（是否联系、是否约会）
   - 如果有反馈，显示反馈内容

### 2.4 数据流

```
匹配完成时 → 写入 match_history 表（快照）
用户查看历史 → 从 match_history 读取
用户反馈 → 更新 weekly_matches 表 + 反馈影响后续匹配算法
```

---

## UI/UX 设计规范

### 视觉风格
- 主色调: 珊瑚粉 #FF6B6B + 深蓝 #2C3E50
- 卡片圆角: 16px
- 阴影: 0 4px 12px rgba(0,0,0,0.08)
- 字体: Noto Sans SC

### 动效
- 列表项依次淡入 (animation-delay递增)
- 卡片悬停微上浮
- 提交成功庆祝动画

### 响应式
- 移动端优先
- 卡片单列显示
- 桌面端可双列

---

## 技术实现要点

### 1. 需要创建的文件

**API**:
- `src/app/api/feedback/route.ts` - 反馈API
- `src/app/api/match/history/route.ts` - 历史API
- `src/app/api/match/history/stats/route.ts` - 统计API

**页面**:
- `src/app/feedback/page.tsx` - 反馈表单页
- `src/app/match/[id]/feedback/page.tsx` - 特定匹配的反馈页
- `src/app/history/page.tsx` - 匹配历史页
- `src/app/history/[id]/page.tsx` - 历史详情页

**组件**:
- `src/components/feedback/FeedbackForm.tsx` - 反馈表单
- `src/components/feedback/StarRating.tsx` - 星级评分
- `src/components/history/MatchHistoryList.tsx` - 历史列表
- `src/components/history/StatsCards.tsx` - 统计卡片
- `src/components/history/HistoryFilter.tsx` - 筛选器

### 2. 数据库操作
- 使用 Supabase Client
- 已有表结构，只需读写

### 3. 权限控制
- 反馈只能提交自己的匹配
- 历史只能查看自己的
- 未登录跳转登录页

---

## 验收标准

### 约会反馈系统
- [ ] 用户可以对已匹配的记录提交反馈
- [ ] 反馈包含：总体评分 + 三维度评分 + 开放问题 + 是否愿意见第二次
- [ ] 提交后更新匹配状态为 completed
- [ ] 已提交反馈的用户不能重复提交
- [ ] 可以查看自己提交的历史反馈

### 匹配历史查看
- [ ] 显示所有历史匹配记录
- [ ] 显示统计信息（总次数、约会次数、成功率、平均匹配度）
- [ ] 支持按结果筛选
- [ ] 点击进入详情页
- [ ] 详情页显示当时的匹配快照数据
- [ ] 分页支持

---

## 部署
- 部署后更新 henghe.site
- 验证功能正常
