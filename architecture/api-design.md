# 心动投递 - API 接口设计

## 概述

基于 Next.js 14 App Router 的 RESTful API 设计。所有接口遵循统一的响应格式和错误处理规范。

---

## 基础规范

### 基础 URL
```
开发环境: http://localhost:3000/api/v1
生产环境: https://api.xindongtoudi.com/v1
```

### 响应格式
```typescript
// 成功响应
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "请先登录",
    "details": {}
  }
}
```

### 状态码
| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 业务逻辑错误 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

### 认证方式
- **Bearer Token**: JWT Token，Header 中传递
- **Cookie**: 适用于 Web 端

---

## 一、认证模块

### 1.1 发送验证码
```
POST /auth/sms/send
```

**请求体:**
```json
{
  "phone": "13051166171",
  "scene": "login"  // login | bind
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "expiresIn": 60,
    "captchaId": "captcha_xxx"
  }
}
```

### 1.2 验证码登录
```
POST /auth/sms/login
```

**请求体:**
```json
{
  "phone": "13051166171",
  "code": "123456",
  "deviceInfo": {
    "type": "ios",
    "model": "iPhone 15 Pro",
    "osVersion": "17.2"
  }
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800,
    "user": {
      "id": "uuid",
      "nickname": "小明",
      "avatarUrl": "https://...",
      "gender": "male",
      "questionnaireCompleted": true
    }
  }
}
```

### 1.3 微信登录
```
POST /auth/wechat/login
```

**请求体:**
```json
{
  "code": "微信授权code",
  "encryptedData": "encryptedData",
  "iv": "iv"
}
```

**响应:** 同短信登录

### 1.4 刷新 Token
```
POST /auth/token/refresh
```

**请求体:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.5 登出
```
POST /auth/logout
```

**请求头:** `Authorization: Bearer <token>`

**响应:**
```json
{
  "success": true,
  "data": { "message": "登出成功" }
}
```

---

## 二、用户模块

### 2.1 获取当前用户资料
```
GET /users/me
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13051166171",
    "phoneVerified": true,
    "nickname": "小明",
    "avatarUrl": "https://...",
    "photos": [
      { "url": "https://...", "isPrimary": true },
      { "url": "https://...", "position": 1 }
    ],
    "gender": "male",
    "birthday": "1991-07-10",
    "height": 175,
    "city": "北京",
    "occupation": "金融",
    "education": "硕士",
    "bio": "热爱生活，喜欢旅行...",
    "profileVisible": true,
    "questionnaireCompleted": true,
    "totalMatches": 12,
    "pendingMatches": 3,
    "lastActiveAt": "2025-03-18T10:00:00Z"
  }
}
```

### 2.2 更新用户资料
```
PATCH /users/me
```

**请求体:**
```json
{
  "nickname": "新昵称",
  "avatarUrl": "https://...",
  "gender": "male",
  "birthday": "1991-07-10",
  "height": 175,
  "city": "北京",
  "occupation": "金融",
  "education": "硕士",
  "bio": "个人简介..."
}
```

### 2.3 上传照片
```
POST /users/me/photos
```

**请求体:** `multipart/form-data`
- `photo`: 图片文件
- `position`: 位置索引

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://...",
    "position": 2
  }
}
```

### 2.4 删除照片
```
DELETE /users/me/photos/:photoId
```

### 2.5 设置主照片
```
PUT /users/me/photos/:photoId/primary
```

### 2.6 获取其他用户资料
```
GET /users/:userId
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nickname": "小红",
    "avatarUrl": "https://...",
    "photos": ["https://..."],
    "gender": "female",
    "age": 28,
    "city": "北京",
    "occupation": "产品经理",
    "education": "本科",
    "bio": "..."
  }
}
```

### 2.7 更新匹配偏好
```
PUT /users/me/preferences
```

**请求体:**
```json
{
  "preferredGender": "female",
  "minAge": 22,
  "maxAge": 32,
  "preferredCities": ["北京", "上海"],
  "valuesWeight": 0.4,
  "interestsWeight": 0.3,
  "personalityWeight": 0.3,
  "educationPref": ["本科", "硕士"],
  "heightRange": { "min": 160, "max": 180 }
}
```

---

## 三、问卷模块

### 3.1 获取问卷列表
```
GET /questionnaire/questions
```

**查询参数:**
- `category`: values | lifestyle | interests | personality
- `page`: 页码
- `pageSize`: 每页数量

**响应:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "code": "Q1",
        "category": "values",
        "questionText": "你认为婚姻中最重要的是什么？",
        "questionType": "single_choice",
        "options": ["信任与忠诚", "经济基础", "共同成长", "家庭和谐"],
        "weight": 1.5,
        "answered": true,
        "answer": "信任与忠诚"
      }
    ],
    "progress": {
      "total": 66,
      "answered": 20,
      "completed": false,
      "currentQuestion": "Q21"
    }
  }
}
```

### 3.2 获取单个问题
```
GET /questionnaire/questions/:code
```

### 3.3 回答问题
```
POST /questionnaire/answers
```

**请求体:**
```json
{
  "questionCode": "Q1",
  "answer": {
    "choice": "信任与忠诚"  // 单选
    // 或
    "choices": ["选项A", "选项B"]  // 多选
    // 或
    "value": 8  // 量表
    // 或
    "order": ["A", "B", "C"]  // 排序
    // 或
    "text": "我的答案..."  // 开放文本
  }
}
```

### 3.4 批量回答问题
```
POST /questionnaire/answers/batch
```

**请求体:**
```json
{
  "answers": [
    { "questionCode": "Q1", "answer": { "choice": "信任与忠诚" } },
    { "questionCode": "Q2", "answer": { "choice": "早睡早起" } }
  ]
}
```

### 3.5 获取问卷进度
```
GET /questionnaire/progress
```

### 3.6 提交问卷（完成）
```
POST /questionnaire/complete
```

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "问卷已完成，开始为您匹配有缘人",
    "matchScore": 85
  }
}
```

---

## 四、匹配模块

### 4.1 获取本周匹配列表
```
GET /matches/weekly
```

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量

**响应:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "uuid",
        "matchedUser": {
          "id": "uuid",
          "nickname": "小红",
          "avatarUrl": "https://...",
          "gender": "female",
          "age": 26,
          "city": "北京",
          "occupation": "产品经理"
        },
        "totalScore": 85.5,
        "valuesScore": 88,
        "interestsScore": 82,
        "personalityScore": 86,
        "matchReasons": ["都喜欢旅行", "价值观相似", "生活习惯接近"],
        "status": "pending",
        "matchedAt": "2025-03-16T00:00:00Z"
      }
    ],
    "weekInfo": {
      "startDate": "2025-03-17",
      "endDate": "2025-03-23",
      "remainingViews": 5
    }
  },
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 8
  }
}
```

### 4.2 对匹配用户操作
```
POST /matches/:matchId/action
```

**请求体:**
```json
{
  "action": "like"  // like | dislike | skip
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "status": "liked",
    "isMutualMatch": false  // 是否双向匹配
  }
}
```

### 4.3 获取匹配详情
```
GET /matches/:matchId
```

### 4.4 获取匹配记录
```
GET /matches/history
```

**查询参数:**
- `status`: pending | viewed | liked | matched | expired
- `page`: 页码
- `pageSize`: 每页数量

### 4.5 重新计算匹配分（管理员）
```
POST /matches/:matchId/recalculate
```

### 4.6 获取匹配统计
```
GET /matches/statistics
```

**响应:**
```json
{
  "success": true,
  "data": {
    "totalMatches": 50,
    "successfulMatches": 12,
    "averageScore": 78.5,
    "weeklyTrend": [
      { "week": "2025-01", "count": 8, "success": 2 },
      { "week": "2025-02", "count": 10, "success": 3 }
    ]
  }
}
```

---

## 五、爱神模式（撮合好友）

### 5.1 发起爱神请求
```
POST /cupid/requests
```

**请求体:**
```json
{
  "friendPhone": "13900000000",  // 好友手机号
  "recommendToPhone": "13800000000",  // 推荐给谁
  "reason": "你们都很喜欢旅行，应该聊得来"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "已成功向TA推荐你的好友！"
  }
}
```

### 5.2 获取爱神请求列表
```
GET /cupid/requests
```

**查询参数:**
- `type`: sent | received
- `status`: pending | accepted | matched

**响应:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "uuid",
        "friend": {
          "phone": "139******00",
          "nickname": "小明",
          "gender": "male"
        },
        "recommendTo": {
          "id": "uuid",
          "nickname": "小红",
          "avatarUrl": "https://..."
        },
        "reason": "你们都很喜欢旅行",
        "status": "pending",
        "createdAt": "2025-03-18T10:00:00Z"
      }
    ]
  }
}
```

### 5.3 接受/拒绝爱神推荐
```
PUT /cupid/requests/:requestId
```

**请求体:**
```json
{
  "action": "accept"  // accept | reject
}
```

### 5.4 查看推荐详情
```
GET /cupid/requests/:requestId
```

---

## 六、暗恋告白模块

### 6.1 发起暗恋告白
```
POST /crushes
```

**请求体:**
```json
{
  "crushPhone": "13800000000",  // 暗恋对象手机号（加密存储）
  "message": "我注意你很久了...",
  "expiresIn": 7  // 有效期（天）
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "暗恋告白已成功提交！如果对方也暗恋你，将揭晓彼此身份"
  }
}
```

### 6.2 检查是否有暗恋自己的人
```
GET /crushes/check
```

**响应:**
```json
{
  "success": true,
  "data": {
    "hasCrush": true,
    "crushCount": 1  // 有多少人暗恋你
  }
}
```

### 6.3 确认暗恋（需要登录后查看）
```
POST /crushes/reveal
```

**请求体:**
```json
{
  "crushPhone": "13800000000"  // 你暗恋的人的手机号
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "isMutual": true,
    "crushInfo": {
      "nickname": "小红",
      "avatarUrl": "https://...",
      "message": "我注意你很久了..."
    }
  }
}
```

### 6.4 双向暗恋匹配成功通知
```
GET /crushes/mutual
```

**响应:**
```json
{
  "success": true,
  "data": {
    "mutualCrushes": [
      {
        "user": {
          "id": "uuid",
          "nickname": "小红",
          "avatarUrl": "https://..."
        },
        "message": "我注意你很久了...",
        "matchedAt": "2025-03-18T12:00:00Z"
      }
    ]
  }
}
```

### 6.5 回应暗恋告白
```
POST /crushes/:crushId/respond
```

**请求体:**
```json
{
  "accept": true,
  "message": "我也喜欢你很久了！"
}
```

---

## 七、反馈模块

### 7.1 提交反馈
```
POST /feedback
```

**请求体:**
```json
{
  "feedbackType": "match_feedback",  // bug_report | feature_request | match_feedback | user_report | general
  "title": "匹配体验很好",
  "content": "这次的匹配对象很合拍...",
  "relatedMatchId": "uuid",  // 可选
  "relatedUserId": "uuid",  // 可选
  "attachments": ["https://..."]
}
```

### 7.2 评价匹配
```
POST /matches/:matchId/rating
```

**请求体:**
```json
{
  "overallRating": 5,
  "accuracyRating": 4,
  "feedbackTags": ["很合拍", "价值观相似"],
  "comment": "总体很满意"
}
```

### 7.3 举报用户
```
POST /reports
```

**请求体:**
```json
{
  "reportedUserId": "uuid",
  "reason": "虚假信息",
  "description": "对方资料与实际情况不符",
  "evidence": ["https://..."]
}
```

---

## 八、通知模块

### 8.1 获取通知列表
```
GET /notifications
```

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量
- `type`: 通知类型筛选
- `unreadOnly`: 是否只获取未读

**响应:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "new_match",
        "title": "本周新匹配",
        "content": "为你匹配了3位新朋友，点击查看",
        "data": { "matchCount": 3 },
        "isRead": false,
        "createdAt": "2025-03-18T10:00:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

### 8.2 标记通知为已读
```
PUT /notifications/:notificationId/read
```

### 8.3 标记所有通知为已读
```
PUT /notifications/read-all
```

### 8.4 删除通知
```
DELETE /notifications/:notificationId
```

---

## 九、推送 Token 管理

### 9.1 绑定推送 Token
```
POST /devices/token
```

**请求体:**
```json
{
  "token": "xxx",
  "deviceType": "ios"  // ios | android | web
}
```

### 9.2 解绑推送 Token
```
DELETE /devices/token
```

---

## 十、定时任务（管理端）

### 10.1 触发每周匹配
```
POST /admin/tasks/weekly-match
```

### 10.2 任务状态查询
```
GET /admin/tasks/status
```

**响应:**
```json
{
  "success": true,
  "data": {
    "weeklyMatch": {
      "lastRun": "2025-03-17T00:00:00Z",
      "status": "completed",
      "affectedCount": 150
    },
    "matchExpiry": {
      "lastRun": "2025-03-18T00:00:00Z",
      "status": "completed"
    }
  }
}
```

---

## 中间件设计

### 认证中间件
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value 
    || request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_REQUIRED', message: '请先登录' } },
      { status: 401 }
    );
  }
  
  // 验证 token...
  return NextResponse.next();
}
```

### 速率限制中间件
```typescript
// 使用 Redis 实现
const RATE_LIMIT = 100; // 每分钟100次
const WINDOW = 60; // 1分钟窗口
```

---

## 错误代码表

| 错误码 | 描述 |
|--------|------|
| AUTH_REQUIRED | 请先登录 |
| AUTH_INVALID_TOKEN | Token 无效 |
| AUTH_TOKEN_EXPIRED | Token 已过期 |
| PHONE_INVALID | 手机号格式错误 |
| PHONE_NOT_VERIFIED | 手机号未验证 |
| CODE_INVALID | 验证码错误 |
| CODE_EXPIRED | 验证码已过期 |
| CODE_SEND_TOO_FREQUENT | 发送过于频繁 |
| USER_NOT_FOUND | 用户不存在 |
| USER_SUSPENDED | 用户已被封禁 |
| QUESTION_NOT_FOUND | 问题不存在 |
| QUESTIONNAIRE_NOT_COMPLETE | 问卷未完成 |
| MATCH_NOT_FOUND | 匹配记录不存在 |
| MATCH_ACTION_DUPLICATE | 重复操作 |
| CRUSH_ALREADY_EXISTS | 暗恋已存在 |
| CRUSH_NOT_FOUND | 暗恋记录不存在 |
| FEEDBACK_TOO_FREQUENT | 反馈过于频繁 |
| REPORT_DUPLICATE | 重复举报 |
| INVALID_PARAMS | 参数错误 |
| INTERNAL_ERROR | 服务器错误 |
