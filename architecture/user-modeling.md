# 心动投递 - 用户画像建模与匹配算法技术文档

## 文档版本

- **版本**: v1.0
- **作者**: 数据科学团队
- **更新日期**: 2026-03-18
- **适用范围**: 心动投递核心算法系统

---

## 目录

1. [概述](#一概述)
2. [用户画像模型](#二用户画像模型)
3. [数据处理流程](#三数据处理流程)
4. [计分权重矩阵](#四计分权重矩阵)
5. [用户向量化方法](#五用户向量化方法)
6. [相似度计算公式](#六相似度计算公式)
7. [匹配评分算法](#七匹配评分算法)
8. [机器学习模型](#八机器学习模型)
9. [伪代码实现](#九伪代码实现)
10. [系统架构](#十系统架构)
11. [评估指标](#十一评估指标)

---

## 一、概述

### 1.1 设计目标

本技术文档定义心动投递平台的核心用户画像模型和匹配算法，旨在：

1. **精准刻画用户画像**：通过66道问卷构建多维度用户画像
2. **科学计算匹配度**：基于心理学和社会学研究设计匹配算法
3. **持续优化迭代**：通过用户反馈数据不断优化模型
4. **实时高效计算**：支持大规模用户的实时匹配需求

### 1.2 核心原则

| 原则 | 说明 |
|------|------|
| **价值观优先** | 核心价值观匹配度占最高权重 |
| **多维评估** | 从多个维度综合评估匹配度 |
| **互补与相似并重** | 某些维度强调相似，某些维度允许互补 |
| **动态权重** | 根据用户反馈动态调整权重 |
| **可解释性** | 匹配结果需提供可理解的解释 |

### 1.3 技术栈

```
数据处理: Python/NumPy/Pandas
向量计算: NumPy/SciPy
机器学习: Scikit-learn/PyTorch
相似度计算: FAISS (向量检索)
缓存: Redis
数据库: PostgreSQL + JSONB
```

---

## 二、用户画像模型

### 2.1 数据模型架构

```
User Profile
├── Basic Demographics (基础属性)
│   ├── Age (年龄)
│   ├── Gender (性别)
│   ├── Location (位置)
│   ├── Education (学历)
│   └── Occupation (职业)
│
├── Value Vector (价值观向量) - 30维
│   ├── Core Values (核心价值观)
│   ├── Money Attitude (金钱观)
│   ├── Risk Attitude (风险偏好)
│   ├── Independence (独立性)
│   └── Commitment (承诺态度)
│
├── Personality Vector (性格向量) - 15维
│   ├── Big Five (大五人格)
│   │   ├── Openness (开放性)
│   │   ├── Conscientiousness (尽责性)
│   │   ├── Extraversion (外向性)
│   │   ├── Agreeableness (宜人性)
│   │   └── Neuroticism (神经质)
│   ├── MBTI Dimensions (MBTI维度)
│   └── Communication Style (沟通风格)
│
├── Interest Tags (兴趣标签) - 多值
│   ├── Hobbies (爱好)
│   ├── Culture Preference (文化偏好)
│   ├── Sports (运动习惯)
│   └── Learning Style (学习方式)
│
├── Relationship Preference (恋爱偏好) - 20维
│   ├── Commitment Level (承诺程度)
│   ├── Intimacy Distance (亲密距离)
│   ├── Conflict Style (冲突处理)
│   ├── Love Language (爱的语言)
│   └── Future Plans (未来规划)
│
├── Lifestyle Vector (生活方式向量) - 12维
│   ├── Sleep Pattern (作息习惯)
│   ├── Social Energy (社交能量)
│   ├── Health Habits (健康习惯)
│   ├── Consumption Style (消费风格)
│   └── Living Environment (居住偏好)
│
└── Behavior Pattern (行为模式)
    ├── Active Hours (活跃时段)
    ├── Response Pattern (响应模式)
    └── Engagement Metrics (参与度指标)
```

### 2.2 核心维度定义

#### 2.2.1 价值观向量 (Value Vector)

```typescript
interface ValueVector {
  // 核心价值观排序 (权重: 3.0)
  core_values_ranking: string[];  // 18个价值观排序
  
  // 成功定义 (权重: 2.0)
  success_definition: 'career' | 'family' | 'freedom' | 'growth' | 'society' | 'wealth' | 'love';
  
  // 金钱观量表 (权重: 2.5)
  money_attitude: number;  // 1-5 量表
  
  // 风险偏好 (权重: 2.0)
  risk_seeking: number;  // 0-100 滑块
  
  // 个人vs集体 (权重: 1.5)
  individualism: 'individual' | 'collective' | 'balance' | 'winwin' | 'context';
  
  // 诚实vs善意谎言 (权重: 1.5)
  honesty_preference: 'absolute' | 'white_lie' | 'context';
  
  // 独立性 (权重: 2.0)
  independence: number;  // 1-5 量表
  
  // 完美主义 (权重: 1.0)
  perfectionism: 'perfectionist' | 'pragmatic' | 'selective' | 'recovering';
  
  // 竞争vs合作 (权重: 1.0)
  competition_preference: 'competitive' | 'cooperative' | 'self' | 'context';
  
  // 时间观 (权重: 1.5)
  time_orientation: 'present' | 'future' | 'past' | 'balance';
  
  // 承诺态度 (权重: 2.5)
  commitment_attitude: number;  // 1-5 量表
  
  // 失败态度 (权重: 1.5)
  failure_attitude: 'resilient' | 'processing' | 'struggling' | 'analytical' | 'seeking';
  
  // 道德准则 (权重: 2.0)
  moral_principles: string[];  // 最多3个
  
  // 人生优先级 (权重: 2.0)
  life_priorities: string[];  // 7个要素排序
}
```

#### 2.2.2 性格向量 (Personality Vector)

```typescript
interface PersonalityVector {
  // 大五人格 (Big Five / OCEAN)
  big_five: {
    openness: number;           // 开放性: 0-100
    conscientiousness: number;  // 尽责性: 0-100
    extraversion: number;       // 外向性: 0-100
    agreeableness: number;      // 宜人性: 0-100
    neuroticism: number;        // 神经质: 0-100
  };
  
  // MBTI 倾向
  mbti_tendencies: {
    EI: number;  // Extraversion-Introversion: -100 to 100
    SN: number;  // Sensing-Intuition: -100 to 100
    TF: number;  // Thinking-Feeling: -100 to 100
    JP: number;  // Judging-Perceiving: -100 to 100
  };
  
  // 沟通风格
  communication_style: {
    expression: 'direct' | 'indirect';      // 表达方式
    emotion: 'rational' | 'emotional';       // 情感表达
    conflict: 'confront' | 'avoid' | 'compromise';  // 冲突处理
  };
  
  // 社交能量
  social_energy: number;  // 1-5 量表
  
  // 情绪表达
  emotion_expression: number;  // 1-5 量表
  
  // 适应能力
  adaptability: 'quick' | 'moderate' | 'resistant' | 'context' | 'positive';
}
```

#### 2.2.3 兴趣标签 (Interest Tags)

```typescript
interface InterestProfile {
  // 兴趣爱好 (多选)
  hobbies: Set<string>;  // ['阅读', '电影', '运动', ...]
  
  // 文化偏好 (多选)
  culture_preference: Set<string>;  // ['流行文化', '独立艺术', '传统文化', ...]
  
  // 运动频率
  exercise_frequency: 'daily' | 'weekly_3_4' | 'occasional' | 'rare' | 'hate';
  
  // 学习方式
  learning_style: 'reading' | 'video' | 'practice' | 'discussion' | 'course' | 'passive';
  
  // 兴趣强度字典
  interest_intensity: Map<string, number>;  // 兴趣 -> 强度(1-5)
}
```

#### 2.2.4 恋爱偏好向量 (Relationship Preference)

```typescript
interface RelationshipPreference {
  // 恋爱目的
  relationship_goal: 'marriage' | 'serious' | 'casual' | 'fun' | 'friendship';
  
  // 恋爱节奏
  relationship_pace: 'fast' | 'slow' | 'friends_first' | 'natural';
  
  // 亲密距离
  intimacy_distance: number;  // 1-5 量表
  
  // 冲突处理
  conflict_resolution: 'direct' | 'cool_down' | 'avoid' | 'compromise' | 'persist';
  
  // 爱的语言 (最多3个)
  love_languages: string[];  // ['语言表达', '精心时刻', '礼物', ...]
  
  // 公开恋情偏好
  public_display: 'immediate' | 'later' | 'rare' | 'private';
  
  // 异地恋接受度
  long_distance: 'accepting' | 'conditional' | 'difficult' | 'reject';
  
  // 过去关系态度
  past_relationships: 'open' | 'ask_only' | 'forward' | 'ignore';
  
  // 独立性需求
  relationship_independence: 'independent' | 'balanced' | 'merged' | 'flexible';
}
```

#### 2.2.5 未来规划向量 (Future Planning)

```typescript
interface FuturePlanning {
  // 孩子重要性
  children_importance: 'essential' | 'wanted' | 'neutral' | 'not_important' | 'no';
  
  // 职业规划
  career_plan: 'study' | 'deepen' | 'pivot' | 'balance' | 'retire' | 'explore';
  
  // 居住规划
  location_plan: 'stay' | 'move' | 'abroad' | 'hometown' | 'open';
  
  // 家庭距离偏好
  family_distance: 'close' | 'same_city' | 'different_city' | 'anywhere' | 'distance';
  
  // 财务目标
  financial_goal: 'freedom' | 'stable' | 'enough' | 'not_focus' | 'improving';
  
  // 年龄态度
  age_attitude: 'enjoy' | 'anxious' | 'neutral' | 'fear' | 'present';
  
  // 理想结婚年龄
  ideal_marriage_age: 'early_20s' | 'late_20s' | 'early_30s' | 'late_30s' | 'whenever' | 'unsure';
}
```

---

## 三、数据处理流程

### 3.1 数据处理管道

```
Raw Answers (原始答案)
      │
      ▼
┌─────────────────────┐
│  1. 数据清洗         │
│  - 去除无效答案      │
│  - 标准化格式        │
│  - 处理缺失值        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  2. 答案数值化       │
│  - 单选 → One-hot   │
│  - 多选 → Multi-hot │
│  - 量表 → 归一化    │
│  - 排序 → 位置向量  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  3. 维度聚合         │
│  - 按类别分组        │
│  - 计算维度得分      │
│  - 应用权重          │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  4. 标准化处理       │
│  - Z-score 标准化   │
│  - Min-Max 归一化   │
│  - T-score 转换     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  5. 向量构建         │
│  - 价值观向量        │
│  - 性格向量          │
│  - 偏好向量          │
│  - 综合向量          │
└─────────┬───────────┘
          │
          ▼
Feature Vector (特征向量)
```

### 3.2 答案数值化规则

#### 3.2.1 单选题转换 (Single Choice)

```python
def encode_single_choice(answer: str, options: list) -> np.ndarray:
    """
    单选题 → One-hot 编码
    
    示例:
    问题: 成功的定义
    选项: ['事业有成', '家庭幸福', '自由自在', '成长', '社会价值', '财务自由', '真爱']
    答案: '家庭幸福'
    
    输出: [0, 1, 0, 0, 0, 0, 0]
    """
    encoding = np.zeros(len(options))
    if answer in options:
        idx = options.index(answer)
        encoding[idx] = 1
    return encoding
```

#### 3.2.2 多选题转换 (Multiple Choice)

```python
def encode_multiple_choice(answers: list, options: list) -> np.ndarray:
    """
    多选题 → Multi-hot 编码
    
    示例:
    问题: 你的兴趣爱好
    选项: ['阅读', '电影', '运动', '游戏', '旅行', ...]
    答案: ['阅读', '旅行']
    
    输出: [1, 0, 0, 0, 1, ...]
    """
    encoding = np.zeros(len(options))
    for answer in answers:
        if answer in options:
            idx = options.index(answer)
            encoding[idx] = 1
    return encoding
```

#### 3.2.3 量表题转换 (Scale)

```python
def encode_scale(value: int, min_val: int = 1, max_val: int = 5) -> float:
    """
    量表题 → 归一化到 [0, 1]
    
    示例:
    问题: 金钱是手段，不是目的 (1-5)
    答案: 4
    
    输出: (4 - 1) / (5 - 1) = 0.75
    """
    return (value - min_val) / (max_val - min_val)
```

#### 3.2.4 排序题转换 (Ranking)

```python
def encode_ranking(ranking: list, items: list) -> np.ndarray:
    """
    排序题 → 位置向量 + 权重衰减
    
    示例:
    问题: 核心价值观排序
    项目: 18个价值观
    排序: ['家庭', '爱', '诚实', ...]
    
    输出: 每个项目的位置分值，越靠前分值越高
    """
    vector = np.zeros(len(items))
    
    for position, item in enumerate(ranking):
        if item in items:
            idx = items.index(item)
            # 位置越靠前，分值越高（指数衰减）
            vector[idx] = np.exp(-0.3 * position)
    
    return vector
```

#### 3.2.5 开放式问题处理 (Open-ended)

```python
def encode_open_text(text: str, model_name: str = 'text-embedding-3-small') -> np.ndarray:
    """
    开放式问题 → 语义向量 (Embedding)
    
    使用预训练语言模型提取语义向量
    """
    # 使用 OpenAI Embedding API
    import openai
    
    response = openai.Embedding.create(
        model=model_name,
        input=text
    )
    
    return np.array(response['data'][0]['embedding'])

def extract_features_from_text(text: str) -> dict:
    """
    从开放文本中提取特征
    """
    return {
        'sentiment': analyze_sentiment(text),      # 情感倾向
        'keywords': extract_keywords(text),        # 关键词
        'values': infer_values(text),              # 推断价值观
        'interests': extract_interests(text)       # 提取兴趣
    }
```

### 3.3 标准化处理

#### 3.3.1 Z-score 标准化

```python
def z_score_normalize(values: np.ndarray) -> np.ndarray:
    """
    Z-score 标准化
    z = (x - μ) / σ
    
    适用于: 正态分布的数据
    """
    mean = np.mean(values)
    std = np.std(values)
    
    if std == 0:
        return np.zeros_like(values)
    
    return (values - mean) / std
```

#### 3.3.2 Min-Max 归一化

```python
def min_max_normalize(values: np.ndarray, 
                      target_min: float = 0, 
                      target_max: float = 1) -> np.ndarray:
    """
    Min-Max 归一化
    x' = (x - min) / (max - min) * (target_max - target_min) + target_min
    
    适用于: 需要固定范围的数据
    """
    min_val = np.min(values)
    max_val = np.max(values)
    
    if max_val == min_val:
        return np.full_like(values, (target_min + target_max) / 2)
    
    normalized = (values - min_val) / (max_val - min_val)
    return normalized * (target_max - target_min) + target_min
```

#### 3.3.3 T-score 转换

```python
def t_score_transform(z_scores: np.ndarray) -> np.ndarray:
    """
    T-score 转换
    T = 50 + 10 * Z
    
    优点: 
    - 平均分为 50
    - 标准差为 10
    - 易于理解和解释
    """
    return 50 + 10 * z_scores
```

---

## 四、计分权重矩阵

### 4.1 问题类别权重

| 类别 | 权重 | 题目范围 | 核心原因 |
|------|------|----------|----------|
| 价值观核心 | 30% | Q1-Q15 | 决定长期关系走向 |
| 恋爱观 | 20% | Q28-Q37 | 直接影响关系模式 |
| 未来规划 | 15% | Q38-Q45 | 人生方向一致性 |
| 生活方式 | 15% | Q16-Q27 | 日常相处兼容性 |
| 性格特质 | 10% | Q46-Q53 | 沟通互动方式 |
| 兴趣爱好 | 5% | Q54-Q58 | 共同话题和活动 |
| 家庭观 | 3% | Q59-Q62 | 家庭关系处理 |
| 政治观点 | 1% | Q63-Q64 | 可能的加分/减分项 |
| 底线问题 | 1% | Q65-Q66 | 筛选过滤作用 |

### 4.2 详细问题权重矩阵

#### 4.2.1 价值观核心 (Q1-Q15)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q1 | 核心价值观排序 | 排序 | 3.0 | ✓ | 排序相似度 |
| Q2 | 成功的定义 | 单选 | 2.0 | ✓ | 完全匹配 |
| Q3 | 金钱观 | 量表 | 2.5 | ✓ | 距离归一化 |
| Q4 | 冒险vs稳定 | 滑块 | 2.0 | - | 距离归一化 |
| Q5 | 个人vs集体 | 单选 | 1.5 | - | 相似度矩阵 |
| Q6 | 诚实vs善意谎言 | 单选 | 1.5 | ✓ | 完全匹配 |
| Q7 | 独立性 | 量表 | 2.0 | - | 距离归一化 |
| Q8 | 完美主义 | 单选 | 1.0 | - | 相似度矩阵 |
| Q9 | 竞争vs合作 | 单选 | 1.0 | - | 相似度矩阵 |
| Q10 | 时间观念 | 单选 | 1.5 | - | 相似度矩阵 |
| Q11 | 承诺态度 | 量表 | 2.5 | ✓ | 距离归一化 |
| Q12 | 失败态度 | 单选 | 1.5 | - | 相似度矩阵 |
| Q13 | 生命的意义 | 开放 | 1.0 | - | 语义相似度 |
| Q14 | 道德准则 | 多选 | 2.0 | ✓ | Jaccard相似度 |
| Q15 | 人生优先级 | 排序 | 2.0 | ✓ | 排序相似度 |

#### 4.2.2 生活方式 (Q16-Q27)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q16 | 作息习惯 | 单选 | 1.5 | - | 相似度矩阵 |
| Q17 | 周末偏好 | 单选 | 1.0 | - | 相似度矩阵 |
| Q18 | 社交能量 | 量表 | 1.5 | - | 互补性分析 |
| Q19 | 健康习惯 | 多选 | 1.0 | - | Jaccard相似度 |
| Q20 | 饮酒习惯 | 单选 | 0.5 | - | 完全匹配 |
| Q21 | 旅行偏好 | 单选 | 0.8 | - | 相似度矩阵 |
| Q22 | 居住环境 | 单选 | 0.8 | - | 相似度矩阵 |
| Q23 | 消费习惯 | 单选 | 1.0 | - | 相似度矩阵 |
| Q24 | 社交媒体使用 | 单选 | 0.5 | - | 相似度矩阵 |
| Q25 | 饮食偏好 | 多选 | 0.8 | - | Jaccard相似度 |
| Q26 | 宠物态度 | 单选 | 0.8 | - | 完全匹配 |
| Q27 | 家务态度 | 单选 | 1.0 | - | 相似度矩阵 |

#### 4.2.3 恋爱观 (Q28-Q37)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q28 | 恋爱目的 | 单选 | 3.0 | ✓ | 完全匹配 |
| Q29 | 恋爱节奏 | 单选 | 1.5 | - | 相似度矩阵 |
| Q30 | 约会偏好 | 开放 | 0.8 | - | 语义相似度 |
| Q31 | 亲密距离 | 量表 | 2.0 | - | 距离归一化 |
| Q32 | 冲突处理 | 单选 | 2.0 | ✓ | 互补性分析 |
| Q33 | 爱的语言 | 多选 | 2.5 | ✓ | Jaccard相似度 |
| Q34 | 公开恋情 | 单选 | 1.0 | - | 相似度矩阵 |
| Q35 | 异地恋 | 单选 | 1.5 | ✓ | 完全匹配 |
| Q36 | 过去的关系 | 单选 | 1.0 | - | 相似度矩阵 |
| Q37 | 恋爱中的独立性 | 单选 | 1.5 | - | 相似度矩阵 |

#### 4.2.4 未来规划 (Q38-Q45)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q38 | 孩子的重要性 | 单选 | 3.0 | ✓ | 完全匹配 |
| Q39 | 职业规划 | 单选 | 1.0 | - | 相似度矩阵 |
| Q40 | 居住地规划 | 单选 | 1.5 | ✓ | 完全匹配 |
| Q41 | 家庭距离 | 单选 | 1.0 | - | 相似度矩阵 |
| Q42 | 财务目标 | 单选 | 1.0 | - | 相似度矩阵 |
| Q43 | 年龄焦虑 | 单选 | 0.5 | - | 相似度矩阵 |
| Q44 | 婚姻时机 | 单选 | 1.5 | - | 相似度矩阵 |
| Q45 | 未来伴侣期待 | 开放 | 1.0 | - | 语义相似度 |

#### 4.2.5 性格特质 (Q46-Q53)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q46 | 内向vs外向 | 滑块 | 2.0 | - | 互补性分析 |
| Q47 | 决策方式 | 单选 | 1.5 | - | 互补性分析 |
| Q48 | 压力应对 | 单选 | 1.0 | - | 相似度矩阵 |
| Q49 | 情绪表达 | 量表 | 1.5 | - | 距离归一化 |
| Q50 | 承担责任 | 单选 | 1.0 | - | 相似度矩阵 |
| Q51 | 幽默风格 | 多选 | 0.8 | - | Jaccard相似度 |
| Q52 | 感性vs理性 | 滑块 | 1.5 | - | 互补性分析 |
| Q53 | 适应能力 | 单选 | 1.0 | - | 相似度矩阵 |

#### 4.2.6 兴趣爱好 (Q54-Q58)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q54 | 兴趣爱好 | 多选 | 1.5 | - | Jaccard相似度 |
| Q55 | 文化偏好 | 多选 | 1.0 | - | Jaccard相似度 |
| Q56 | 运动习惯 | 单选 | 0.8 | - | 相似度矩阵 |
| Q57 | 学习方式 | 单选 | 0.5 | - | 相似度矩阵 |
| Q58 | 周末爱好 | 开放 | 0.5 | - | 语义相似度 |

#### 4.2.7 家庭观 (Q59-Q62)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q59 | 家庭背景 | 单选 | 0.8 | - | 相似度矩阵 |
| Q60 | 与伴侣家庭的关系 | 单选 | 1.0 | - | 相似度矩阵 |
| Q61 | 家庭责任 | 单选 | 1.0 | - | 完全匹配 |
| Q62 | 原生家庭影响 | 单选 | 0.8 | - | 相似度矩阵 |

#### 4.2.8 政治与社会观点 (Q63-Q64)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q63 | 政治立场 | 单选 | 0.5 | - | 距离归一化 |
| Q64 | 社会参与 | 单选 | 0.5 | - | 相似度矩阵 |

#### 4.2.9 底线问题 (Q65-Q66)

| 题号 | 问题 | 类型 | 权重 | 是否核心 | 匹配策略 |
|------|------|------|------|----------|----------|
| Q65 | 年龄/身高/外貌偏好 | 开放 | 0.3 | - | 规则匹配 |
| Q66 | 不可妥协的事项 | 开放 | 0.7 | ✓ | 规则匹配 |

### 4.3 答案相似度矩阵

#### 4.3.1 作息习惯相似度

```python
SLEEP_SIMILARITY = {
    ('早起', '早起'): 1.0,
    ('早起', '正常'): 0.7,
    ('早起', '夜猫子'): 0.3,
    ('早起', '不规律'): 0.2,
    ('正常', '正常'): 1.0,
    ('正常', '夜猫子'): 0.5,
    ('正常', '不规律'): 0.4,
    ('夜猫子', '夜猫子'): 1.0,
    ('夜猫子', '不规律'): 0.6,
    ('不规律', '不规律'): 0.8,
}
```

#### 4.3.2 冲突处理相似度

```python
CONFLICT_SIMILARITY = {
    # 相似策略得分高
    ('直接', '直接'): 0.85,
    ('冷静', '冷静'): 0.90,
    ('回避', '回避'): 0.70,  # 两个回避者可能不解决问题
    ('妥协', '妥协'): 0.85,
    
    # 互补策略得分更高
    ('直接', '冷静'): 0.95,  # 一个主动解决，一个愿意沟通
    ('直接', '回避'): 0.50,  # 可能导致冲突升级
    ('冷静', '回避'): 0.60,
    ('妥协', '直接'): 0.80,
}
```

#### 4.3.3 恋爱目的相似度

```python
RELATIONSHIP_GOAL_SIMILARITY = {
    ('婚姻', '婚姻'): 1.0,
    ('婚姻', '认真'): 0.85,
    ('婚姻', '看看'): 0.40,  # 目标不一致
    ('婚姻', '享受'): 0.20,
    ('认真', '认真'): 1.0,
    ('认真', '看看'): 0.65,
    ('认真', '享受'): 0.35,
    ('看看', '看看'): 0.90,
    ('看看', '享受'): 0.60,
    ('享受', '享受'): 0.95,
}
```

### 4.4 动态权重调整机制

```python
class DynamicWeightAdjuster:
    """
    根据用户反馈动态调整问题权重
    """
    
    def __init__(self):
        self.base_weights = self.load_base_weights()
        self.feedback_history = []
    
    def adjust_weights(self, user_id: str) -> dict:
        """
        基于用户反馈调整权重
        """
        weights = self.base_weights.copy()
        
        # 获取用户的约会反馈
        feedbacks = self.get_user_feedbacks(user_id)
        
        for feedback in feedbacks:
            if feedback['satisfaction'] >= 4:  # 满意的约会
                # 提高共同高分问题的权重
                for question_id in feedback['high_match_questions']:
                    weights[question_id] *= 1.05
            else:  # 不满意的约会
                # 降低相关问题的权重
                for question_id in feedback['high_match_questions']:
                    weights[question_id] *= 0.95
        
        # 归一化权重
        total = sum(weights.values())
        return {k: v / total for k, v in weights.items()}
    
    def get_user_feedbacks(self, user_id: str) -> list:
        """
        获取用户的约会反馈历史
        """
        # 从数据库查询
        pass
    
    def load_base_weights(self) -> dict:
        """
        加载基础权重配置
        """
        return {
            'Q1': 3.0, 'Q2': 2.0, 'Q3': 2.5, ...  # 完整权重
        }
```

---

## 五、用户向量化方法

### 5.1 综合特征向量构建

```python
class UserVectorBuilder:
    """
    用户向量构建器
    将问卷答案转换为多维特征向量
    """
    
    def __init__(self, questions: dict):
        self.questions = questions
        self.encoders = self._init_encoders()
    
    def build_user_vector(self, user_answers: dict) -> UserVector:
        """
        构建用户综合向量
        """
        user_vector = UserVector()
        
        # 1. 价值观向量
        user_vector.values = self._build_values_vector(user_answers)
        
        # 2. 性格向量
        user_vector.personality = self._build_personality_vector(user_answers)
        
        # 3. 兴趣向量
        user_vector.interests = self._build_interests_vector(user_answers)
        
        # 4. 恋爱偏好向量
        user_vector.relationship = self._build_relationship_vector(user_answers)
        
        # 5. 生活方式向量
        user_vector.lifestyle = self._build_lifestyle_vector(user_answers)
        
        # 6. 综合向量
        user_vector.composite = self._build_composite_vector(user_vector)
        
        return user_vector
    
    def _build_values_vector(self, answers: dict) -> np.ndarray:
        """
        构建价值观向量 (30维)
        """
        vector = []
        
        # Q1: 核心价值观排序 (18维)
        ranking = answers.get('Q1', {}).get('ranking', [])
        vector.extend(self.encode_ranking(ranking, VALUE_ITEMS))
        
        # Q2: 成功定义 (7维 One-hot)
        choice = answers.get('Q2', {}).get('choice', '')
        vector.extend(self.encode_single_choice(choice, SUCCESS_OPTIONS))
        
        # Q3: 金钱观 (1维 归一化)
        scale = answers.get('Q3', {}).get('value', 3)
        vector.append(self.encode_scale(scale))
        
        # Q4: 风险偏好 (1维 归一化滑块)
        slider = answers.get('Q4', {}).get('value', 50)
        vector.append(slider / 100)
        
        # ... 继续处理其他价值观问题
        
        return np.array(vector)
    
    def _build_personality_vector(self, answers: dict) -> np.ndarray:
        """
        构建性格向量 (15维)
        
        基于大五人格模型 + MBTI维度
        """
        vector = []
        
        # 大五人格推断
        openness = self._infer_openness(answers)
        conscientiousness = self._infer_conscientiousness(answers)
        extraversion = self._infer_extraversion(answers)
        agreeableness = self._infer_agreeableness(answers)
        neuroticism = self._infer_neuroticism(answers)
        
        vector.extend([openness, conscientiousness, extraversion, agreeableness, neuroticism])
        
        # MBTI 维度
        ei = self._infer_EI(answers)
        sn = self._infer_SN(answers)
        tf = self._infer_TF(answers)
        jp = self._infer_JP(answers)
        
        vector.extend([ei, sn, tf, jp])
        
        # 沟通风格
        communication = self._infer_communication_style(answers)
        vector.extend(communication)
        
        return np.array(vector)
    
    def _infer_openness(self, answers: dict) -> float:
        """
        推断开放性 (Openness)
        
        相关问题：
        - Q4: 冒险vs稳定 (反向)
        - Q10: 时间观
        - Q21: 旅行偏好
        - Q48: 压力应对
        - Q53: 适应能力
        """
        score = 50  # 基准分
        
        # Q4: 冒险偏好高 → 开放性高
        risk = answers.get('Q4', {}).get('value', 50)
        score += (risk - 50) * 0.3
        
        # Q21: 旅行偏好
        travel = answers.get('Q21', {}).get('choice', '')
        if travel in ['说走就走', '小众目的地']:
            score += 10
        elif travel in ['精心规划', '不太喜欢']:
            score -= 5
        
        # Q53: 适应能力
        adapt = answers.get('Q53', {}).get('choice', '')
        if adapt in ['很快适应', '积极应对']:
            score += 10
        elif adapt == '比较抗拒':
            score -= 10
        
        return max(0, min(100, score))
    
    def _infer_extraversion(self, answers: dict) -> float:
        """
        推断外向性 (Extraversion)
        
        相关问题：
        - Q18: 社交能量 (反向)
        - Q46: 内向vs外向
        - Q54: 兴趣爱好
        """
        score = 50
        
        # Q46: 内向vs外向滑块
        slider = answers.get('Q46', {}).get('value', 50)
        score = slider  # 直接使用滑块值
        
        # Q18: 社交能量 (反向：社交后累 = 内向)
        social_energy = answers.get('Q18', {}).get('value', 3)
        score += (3 - social_energy) * 10  # 反向映射
        
        # Q17: 周末偏好
        weekend = answers.get('Q17', {}).get('choice', '')
        if weekend == '和朋友聚会':
            score += 10
        elif weekend == '在家休息':
            score -= 10
        
        return max(0, min(100, score))
    
    def _infer_agreeableness(self, answers: dict) -> float:
        """
        推断宜人性 (Agreeableness)
        
        相关问题：
        - Q5: 个人vs集体
        - Q6: 诚实vs善意谎言
        - Q9: 竞争vs合作
        - Q32: 冲突处理
        """
        score = 50
        
        # Q5: 个人vs集体
        collective = answers.get('Q5', {}).get('choice', '')
        if collective in ['集体优先', '双赢']:
            score += 15
        elif collective == '个人优先':
            score -= 10
        
        # Q9: 竞争vs合作
        competition = answers.get('Q9', {}).get('choice', '')
        if competition == '合作':
            score += 15
        elif competition == '竞争':
            score -= 10
        
        # Q32: 冲突处理
        conflict = answers.get('Q32', {}).get('choice', '')
        if conflict in ['妥协', '直接解决']:
            score += 10
        elif conflict in ['坚持', '回避']:
            score -= 5
        
        return max(0, min(100, score))
    
    def _build_composite_vector(self, user_vector: UserVector) -> np.ndarray:
        """
        构建综合向量
        将所有维度向量按权重拼接
        """
        # 权重配置
        weights = {
            'values': 0.30,
            'personality': 0.25,
            'relationship': 0.20,
            'lifestyle': 0.15,
            'interests': 0.10
        }
        
        # 归一化各维度向量
        normalized = {
            'values': self.normalize(user_vector.values),
            'personality': self.normalize(user_vector.personality),
            'relationship': self.normalize(user_vector.relationship),
            'lifestyle': self.normalize(user_vector.lifestyle),
            'interests': self.normalize(user_vector.interests)
        }
        
        # 加权拼接
        composite = np.concatenate([
            normalized['values'] * weights['values'],
            normalized['personality'] * weights['personality'],
            normalized['relationship'] * weights['relationship'],
            normalized['lifestyle'] * weights['lifestyle'],
            normalized['interests'] * weights['interests']
        ])
        
        return composite
```

### 5.2 向量存储与索引

```python
import faiss
import numpy as np

class UserVectorIndex:
    """
    用户向量索引
    使用 FAISS 进行高效向量检索
    """
    
    def __init__(self, dimension: int = 100):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)  # 内积相似度
        self.user_id_map = {}  # 向量ID -> 用户ID
    
    def add_user(self, user_id: str, vector: np.ndarray):
        """
        添加用户向量到索引
        """
        # 归一化向量（用于余弦相似度）
        vector = vector / np.linalg.norm(vector)
        vector = vector.reshape(1, -1).astype('float32')
        
        # 添加到索引
        idx = self.index.ntotal
        self.index.add(vector)
        self.user_id_map[idx] = user_id
    
    def search_similar(self, query_vector: np.ndarray, k: int = 10) -> list:
        """
        搜索最相似的 k 个用户
        """
        # 归一化
        query_vector = query_vector / np.linalg.norm(query_vector)
        query_vector = query_vector.reshape(1, -1).astype('float32')
        
        # 搜索
        scores, indices = self.index.search(query_vector, k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0:  # FAISS 返回 -1 表示不足 k 个结果
                results.append({
                    'user_id': self.user_id_map[idx],
                    'similarity': float(score)
                })
        
        return results
    
    def batch_search(self, query_vectors: np.ndarray, k: int = 10) -> list:
        """
        批量搜索
        """
        # 归一化
        norms = np.linalg.norm(query_vectors, axis=1, keepdims=True)
        query_vectors = query_vectors / norms
        query_vectors = query_vectors.astype('float32')
        
        scores, indices = self.index.search(query_vectors, k)
        
        return scores, indices
```

---

## 六、相似度计算公式

### 6.1 余弦相似度 (Cosine Similarity)

```python
def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    余弦相似度
    
    公式: cos(θ) = (A · B) / (||A|| * ||B||)
    
    适用场景:
    - 高维稀疏向量
    - 需要归一化的相似度
    
    取值范围: [-1, 1]
    - 1: 完全相同方向
    - 0: 正交（无关）
    - -1: 完全相反方向
    """
    dot_product = np.dot(vec_a, vec_b)
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return dot_product / (norm_a * norm_b)

# 批量计算
def cosine_similarity_batch(matrix: np.ndarray) -> np.ndarray:
    """
    批量计算余弦相似度矩阵
    
    输入: matrix (n x d) - n个d维向量
    输出: similarity_matrix (n x n)
    """
    # 归一化
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    normalized = matrix / norms
    
    # 计算相似度矩阵
    similarity_matrix = np.dot(normalized, normalized.T)
    
    return similarity_matrix
```

### 6.2 欧氏距离 (Euclidean Distance)

```python
def euclidean_distance(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    欧氏距离
    
    公式: d = √(Σ(ai - bi)²)
    
    适用场景:
    - 低维密集向量
    - 需要考虑绝对差异
    
    取值范围: [0, +∞)
    - 0: 完全相同
    """
    return np.linalg.norm(vec_a - vec_b)

def euclidean_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    欧氏相似度（距离归一化）
    
    公式: s = 1 / (1 + d)
    
    取值范围: (0, 1]
    """
    distance = euclidean_distance(vec_a, vec_b)
    return 1 / (1 + distance)

def normalized_euclidean_similarity(vec_a: np.ndarray, 
                                     vec_b: np.ndarray,
                                     max_distance: float = 10.0) -> float:
    """
    归一化欧氏相似度
    
    公式: s = 1 - (d / max_d)
    
    取值范围: [0, 1]
    """
    distance = euclidean_distance(vec_a, vec_b)
    return max(0, 1 - distance / max_distance)
```

### 6.3 Jaccard 相似度 (Jaccard Similarity)

```python
def jaccard_similarity(set_a: set, set_b: set) -> float:
    """
    Jaccard 相似度
    
    公式: J(A,B) = |A ∩ B| / |A ∪ B|
    
    适用场景:
    - 多选题答案
    - 兴趣标签
    - 集合数据
    
    取值范围: [0, 1]
    - 1: 完全相同
    - 0: 完全不同
    """
    if not set_a and not set_b:
        return 1.0  # 两个空集认为相同
    
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    
    if union == 0:
        return 0.0
    
    return intersection / union

def weighted_jaccard_similarity(dict_a: dict, dict_b: dict) -> float:
    """
    加权 Jaccard 相似度
    
    适用于带权重的集合（如兴趣强度）
    """
    all_keys = set(dict_a.keys()) | set(dict_b.keys())
    
    intersection_weight = 0
    union_weight = 0
    
    for key in all_keys:
        weight_a = dict_a.get(key, 0)
        weight_b = dict_b.get(key, 0)
        
        intersection_weight += min(weight_a, weight_b)
        union_weight += max(weight_a, weight_b)
    
    if union_weight == 0:
        return 0.0
    
    return intersection_weight / union_weight
```

### 6.4 Pearson 相关系数

```python
def pearson_correlation(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Pearson 相关系数
    
    公式: r = Σ((ai - ā)(bi - b̄)) / √(Σ(ai - ā)² * Σ(bi - b̄)²)
    
    适用场景:
    - 连续变量相关性分析
    - 性格特质向量
    
    取值范围: [-1, 1]
    - 1: 完全正相关
    - 0: 无相关
    - -1: 完全负相关
    """
    if len(vec_a) != len(vec_b):
        raise ValueError("Vectors must have the same length")
    
    n = len(vec_a)
    if n < 2:
        return 0.0
    
    mean_a = np.mean(vec_a)
    mean_b = np.mean(vec_b)
    
    numerator = np.sum((vec_a - mean_a) * (vec_b - mean_b))
    denominator = np.sqrt(np.sum((vec_a - mean_a) ** 2) * 
                         np.sum((vec_b - mean_b) ** 2))
    
    if denominator == 0:
        return 0.0
    
    return numerator / denominator
```

### 6.5 排序相似度 (Ranking Similarity)

```python
def spearman_rank_correlation(ranking_a: list, ranking_b: list) -> float:
    """
    Spearman 秩相关系数
    
    适用场景:
    - 排序题答案
    - 优先级比较
    
    公式: ρ = 1 - (6 * Σdi²) / (n * (n² - 1))
    其中 di 是两个排序中第 i 个元素的位置差
    """
    if len(ranking_a) != len(ranking_b):
        raise ValueError("Rankings must have the same length")
    
    n = len(ranking_a)
    if n < 2:
        return 1.0
    
    # 计算位置差
    position_diffs = []
    for item in ranking_a:
        pos_a = ranking_a.index(item)
        pos_b = ranking_b.index(item) if item in ranking_b else n
        position_diffs.append(pos_a - pos_b)
    
    # Spearman 公式
    sum_diff_sq = sum(d ** 2 for d in position_diffs)
    rho = 1 - (6 * sum_diff_sq) / (n * (n ** 2 - 1))
    
    return rho

def kendall_tau(ranking_a: list, ranking_b: list) -> float:
    """
    Kendall Tau 系数
    
    适用场景:
    - 排序相似度
    - 考虑相对顺序而非绝对位置
    
    取值范围: [-1, 1]
    """
    from scipy.stats import kendalltau
    
    # 转换为位置向量
    all_items = sorted(set(ranking_a) | set(ranking_b))
    
    rank_a = [ranking_a.index(item) if item in ranking_a else len(ranking_a) 
              for item in all_items]
    rank_b = [ranking_b.index(item) if item in ranking_b else len(ranking_b) 
              for item in all_items]
    
    tau, _ = kendalltau(rank_a, rank_b)
    return tau
```

### 6.6 综合相似度计算

```python
def calculate_comprehensive_similarity(
    user_a: UserVector,
    user_b: UserVector,
    weights: dict = None
) -> dict:
    """
    综合相似度计算
    
    返回各维度相似度和综合相似度
    """
    if weights is None:
        weights = {
            'values': 0.30,
            'personality': 0.25,
            'relationship': 0.20,
            'lifestyle': 0.15,
            'interests': 0.10
        }
    
    results = {}
    
    # 1. 价值观相似度（余弦）
    results['values'] = cosine_similarity(user_a.values, user_b.values)
    
    # 2. 性格相似度（考虑互补）
    results['personality'] = calculate_personality_match(
        user_a.personality, user_b.personality
    )
    
    # 3. 恋爱偏好相似度
    results['relationship'] = cosine_similarity(
        user_a.relationship, user_b.relationship
    )
    
    # 4. 生活方式相似度
    results['lifestyle'] = euclidean_similarity(
        user_a.lifestyle, user_b.lifestyle
    )
    
    # 5. 兴趣相似度（Jaccard）
    results['interests'] = jaccard_similarity(
        set(user_a.interest_tags), set(user_b.interest_tags)
    )
    
    # 综合相似度
    results['total'] = sum(
        results[k] * weights[k] for k in weights
    )
    
    return results
```

---

## 七、匹配评分算法

### 7.1 分层匹配框架

```
┌─────────────────────────────────────────────────────────┐
│                   匹配评分算法                           │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   硬过滤层    │  │   软过滤层    │  │   评分层     │
│  (筛选条件)   │  │  (降权条件)   │  │ (相似度计算)  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────────────────────────────────────────────┐
│                    综合匹配评分                        │
│                                                       │
│  Total = Σ (维度得分 × 维度权重) × 惩罚因子            │
└──────────────────────────────────────────────────────┘
```

### 7.2 硬过滤算法

```python
class HardFilter:
    """
    硬过滤条件
    不满足条件的用户直接排除
    """
    
    def __init__(self, user: User):
        self.user = user
    
    def filter(self, candidates: list) -> list:
        """
        应用硬过滤条件
        """
        filtered = []
        
        for candidate in candidates:
            # 检查所有硬过滤条件
            if self._check_all_filters(candidate):
                filtered.append(candidate)
        
        return filtered
    
    def _check_all_filters(self, candidate: User) -> bool:
        """
        检查所有硬过滤条件
        """
        checks = [
            self._check_gender_match(candidate),
            self._check_age_range(candidate),
            self._check_location(candidate),
            self._check_not_matched(candidate),
            self._check_not_blocked(candidate),
            self._check_dealbreakers(candidate),
            self._check_active_status(candidate)
        ]
        
        return all(checks)
    
    def _check_gender_match(self, candidate: User) -> bool:
        """
        性别偏好匹配
        """
        # 双向检查
        if not self._is_gender_preferred(self.user, candidate):
            return False
        if not self._is_gender_preferred(candidate, self.user):
            return False
        return True
    
    def _check_age_range(self, candidate: User) -> bool:
        """
        年龄范围检查
        """
        age = self._calculate_age(candidate.birthday)
        
        # 检查用户对候选人的年龄偏好
        if age < self.user.min_age_pref or age > self.user.max_age_pref:
            return False
        
        # 检查候选人对用户的年龄偏好
        user_age = self._calculate_age(self.user.birthday)
        if user_age < candidate.min_age_pref or user_age > candidate.max_age_pref:
            return False
        
        return True
    
    def _check_dealbreakers(self, candidate: User) -> bool:
        """
        底线问题检查
        
        根据开放式问题 Q66 提取的底线条件进行过滤
        """
        # 用户的底线
        user_dealbreakers = self._extract_dealbreakers(self.user)
        candidate_dealbreakers = self._extract_dealbreakers(candidate)
        
        # 检查候选人是否触发用户的底线
        for dealbreaker in user_dealbreakers:
            if self._violates_dealbreaker(candidate, dealbreaker):
                return False
        
        # 检查用户是否触发候选人的底线
        for dealbreaker in candidate_dealbreakers:
            if self._violates_dealbreaker(self.user, dealbreaker):
                return False
        
        return True
    
    def _extract_dealbreakers(self, user: User) -> list:
        """
        从 Q66 答案中提取底线条件
        """
        q66_answer = user.answers.get('Q66', {}).get('text', '')
        
        # 使用 NLP 或规则提取底线条件
        dealbreakers = []
        
        # 常见底线规则
        patterns = {
            r'不吸烟|不抽烟': 'no_smoking',
            r'不酗酒|不喝酒': 'no_drinking',
            r'不赌博': 'no_gambling',
            r'不吸毒': 'no_drugs',
            r'有(稳定)?工作': 'employed',
            r'有房': 'has_house',
            r'有车': 'has_car',
            r'身高\d+': 'height_requirement',
            # ... 更多规则
        }
        
        for pattern, dealbreaker in patterns.items():
            if re.search(pattern, q66_answer):
                dealbreakers.append(dealbreaker)
        
        return dealbreakers
```

### 7.3 软过滤算法（降权）

```python
class SoftFilter:
    """
    软过滤条件
    不满足条件则降低匹配分数，但不完全排除
    """
    
    def __init__(self, user: User):
        self.user = user
    
    def apply_penalties(self, candidates: list) -> list:
        """
        应用软过滤惩罚
        """
        for candidate in candidates:
            penalty = 0
            
            # 1. 距离惩罚
            distance = self._calculate_distance(
                self.user.location, 
                candidate.location
            )
            penalty += self._distance_penalty(distance)
            
            # 2. 活跃度惩罚
            days_inactive = self._get_days_since_active(candidate)
            penalty += self._activity_penalty(days_inactive)
            
            # 3. 资料完整度惩罚
            completeness = self._calculate_profile_completeness(candidate)
            penalty += self._completeness_penalty(completeness)
            
            # 4. 回复率惩罚
            response_rate = candidate.response_rate
            penalty += self._response_rate_penalty(response_rate)
            
            # 应用惩罚
            candidate.match_score *= (1 - min(penalty, 0.5))  # 最多惩罚50%
        
        return candidates
    
    def _distance_penalty(self, distance: float) -> float:
        """
        距离惩罚
        
        距离越远，惩罚越大
        """
        if distance <= 5:  # 5km内无惩罚
            return 0
        elif distance <= 20:
            return (distance - 5) / 100  # 0-15% 惩罚
        elif distance <= 100:
            return 0.15 + (distance - 20) / 200  # 15-55% 惩罚
        else:
            return min(0.30, 0.55 + (distance - 100) / 1000)
    
    def _activity_penalty(self, days_inactive: int) -> float:
        """
        活跃度惩罚
        """
        if days_inactive <= 3:
            return 0
        elif days_inactive <= 7:
            return days_inactive * 0.01  # 1-7% 惩罚
        elif days_inactive <= 30:
            return 0.07 + (days_inactive - 7) * 0.005  # 7-21% 惩罚
        else:
            return 0.25  # 25% 惩罚
```

### 7.4 分层评分算法

```python
class MatchScorer:
    """
    分层评分算法
    """
    
    def __init__(self, questions: dict, weights: dict):
        self.questions = questions
        self.weights = weights
        self.vector_builder = UserVectorBuilder(questions)
    
    def calculate_match_score(self, user_a: User, user_b: User) -> MatchResult:
        """
        计算综合匹配分数
        """
        # 1. 构建用户向量
        vector_a = self.vector_builder.build_user_vector(user_a.answers)
        vector_b = self.vector_builder.build_user_vector(user_b.answers)
        
        # 2. 分维度计算
        scores = {}
        
        # 2.1 价值观匹配
        scores['values'] = self._score_values(user_a, user_b, vector_a, vector_b)
        
        # 2.2 性格匹配
        scores['personality'] = self._score_personality(
            user_a, user_b, vector_a, vector_b
        )
        
        # 2.3 恋爱偏好匹配
        scores['relationship'] = self._score_relationship(
            user_a, user_b, vector_a, vector_b
        )
        
        # 2.4 生活方式匹配
        scores['lifestyle'] = self._score_lifestyle(
            user_a, user_b, vector_a, vector_b
        )
        
        # 2.5 兴趣匹配
        scores['interests'] = self._score_interests(
            user_a, user_b, vector_a, vector_b
        )
        
        # 3. 计算综合分数
        total_score = self._calculate_total(scores)
        
        # 4. 生成匹配理由
        reasons = self._generate_reasons(user_a, user_b, scores)
        
        return MatchResult(
            total_score=total_score,
            dimension_scores=scores,
            match_reasons=reasons,
            vector_a=vector_a,
            vector_b=vector_b
        )
    
    def _score_values(self, user_a: User, user_b: User, 
                      vec_a: UserVector, vec_b: UserVector) -> float:
        """
        价值观维度评分
        """
        # 价值观向量相似度
        vector_sim = cosine_similarity(vec_a.values, vec_b.values)
        
        # 核心问题匹配检查
        core_match_score = self._check_core_value_questions(user_a, user_b)
        
        # 综合（向量相似度 70% + 核心问题匹配 30%）
        score = vector_sim * 0.7 + core_match_score * 0.3
        
        return score * 100  # 转换为百分制
    
    def _check_core_value_questions(self, user_a: User, user_b: User) -> float:
        """
        检查核心价值观问题
        """
        core_questions = ['Q1', 'Q2', 'Q3', 'Q6', 'Q11', 'Q14', 'Q15']
        
        match_scores = []
        
        for q_id in core_questions:
            answer_a = user_a.answers.get(q_id, {})
            answer_b = user_b.answers.get(q_id, {})
            
            question = self.questions[q_id]
            
            if question['type'] == 'single_choice':
                score = self._match_single_choice(
                    answer_a.get('choice'),
                    answer_b.get('choice'),
                    is_core=True
                )
            elif question['type'] == 'multiple_choice':
                score = jaccard_similarity(
                    set(answer_a.get('choices', [])),
                    set(answer_b.get('choices', []))
                )
            elif question['type'] == 'scale':
                score = 1 - abs(answer_a.get('value', 3) - answer_b.get('value', 3)) / 4
            
            match_scores.append(score * self.weights[q_id])
        
        return sum(match_scores) / sum(self.weights[q] for q in core_questions)
    
    def _score_personality(self, user_a: User, user_b: User,
                           vec_a: UserVector, vec_b: UserVector) -> float:
        """
        性格维度评分
        
        考虑相似性和互补性
        """
        # 大五人格相似度
        big_five_sim = cosine_similarity(
            vec_a.personality[:5], 
            vec_b.personality[:5]
        )
        
        # MBTI 兼容性
        mbti_compat = self._calculate_mbti_compatibility(
            vec_a.personality[5:9],
            vec_b.personality[5:9]
        )
        
        # 互补性分析
        complementarity = self._analyze_complementarity(
            vec_a.personality, 
            vec_b.personality
        )
        
        # 综合评分
        score = (
            big_five_sim * 0.4 +
            mbti_compat * 0.3 +
            complementarity * 0.3
        )
        
        return score * 100
    
    def _analyze_complementarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """
        性格互补性分析
        
        某些维度互补比相似更好
        """
        complementarity_score = 0
        
        # 外向-内向互补
        ext_a = vec_a[2]  # extraversion
        ext_b = vec_b[2]
        if (ext_a > 60 and ext_b < 40) or (ext_a < 40 and ext_b > 60):
            complementarity_score += 0.3
        elif abs(ext_a - ext_b) <= 20:
            complementarity_score += 0.1  # 相似也可以
        
        # 理性-感性互补
        # 从 MBTI TF 维度获取
        tf_a = vec_a[7]
        tf_b = vec_b[7]
        if tf_a * tf_b < 0:  # 一个理性一个感性
            complementarity_score += 0.3
        elif abs(tf_a - tf_b) <= 20:
            complementarity_score += 0.1
        
        # 情绪稳定互补
        neu_a = vec_a[4]  # neuroticism
        neu_b = vec_b[4]
        if abs(neu_a - neu_b) > 30:  # 一个情绪稳定一个波动
            if neu_a < neu_b:  # 稳定的支持波动的
                complementarity_score += 0.4
        
        return min(1.0, complementarity_score)
    
    def _calculate_mbti_compatibility(self, mbti_a: np.ndarray, mbti_b: np.ndarray) -> float:
        """
        MBTI 兼容性计算
        
        基于 MBTI 官方兼容性研究
        """
        # 将连续值转换为类型
        def to_type(values):
            return ''.join([
                'E' if values[0] > 0 else 'I',
                'N' if values[1] > 0 else 'S',
                'T' if values[2] > 0 else 'F',
                'J' if values[3] > 0 else 'P'
            ])
        
        type_a = to_type(mbti_a)
        type_b = to_type(mbti_b)
        
        # MBTI 兼容性矩阵（基于研究数据）
        compatibility_matrix = {
            # NT (理性主义者) 配对
            ('INTJ', 'ENFP'): 0.95,
            ('INTJ', 'ENTP'): 0.85,
            ('INTP', 'ENTJ'): 0.90,
            ('INTP', 'ENFP'): 0.85,
            
            # NF (理想主义者) 配对
            ('INFJ', 'ENFP'): 0.95,
            ('INFJ', 'ENTP'): 0.85,
            ('INFP', 'ENFJ'): 0.90,
            ('ENFP', 'INFJ'): 0.95,
            
            # SJ (守护者) 配对
            ('ISFJ', 'ESFP'): 0.80,
            ('ESTJ', 'ISFP'): 0.75,
            
            # SP (工匠) 配对
            ('ISFP', 'ENFJ'): 0.80,
            ('ESFP', 'ISFJ'): 0.80,
            
            # 默认值
            'default': 0.60
        }
        
        # 查找兼容性
        compatibility = (
            compatibility_matrix.get((type_a, type_b),
            compatibility_matrix.get((type_b, type_a),
            compatibility_matrix['default']))
        )
        
        return compatibility
    
    def _score_interests(self, user_a: User, user_b: User,
                         vec_a: UserVector, vec_b: UserVector) -> float:
        """
        兴趣维度评分
        """
        # 兴趣标签 Jaccard 相似度
        tags_a = set(vec_a.interest_tags)
        tags_b = set(vec_b.interest_tags)
        
        jaccard = jaccard_similarity(tags_a, tags_b)
        
        # 兴趣向量余弦相似度
        vector_sim = cosine_similarity(vec_a.interests, vec_b.interests)
        
        # 文化偏好相似度
        culture_sim = jaccard_similarity(
            set(user_a.answers.get('Q55', {}).get('choices', [])),
            set(user_b.answers.get('Q55', {}).get('choices', []))
        )
        
        # 综合
        score = (
            jaccard * 0.4 +
            vector_sim * 0.3 +
            culture_sim * 0.3
        )
        
        return score * 100
    
    def _calculate_total(self, scores: dict) -> float:
        """
        计算综合匹配分数
        """
        weights = {
            'values': 0.30,
            'personality': 0.25,
            'relationship': 0.20,
            'lifestyle': 0.15,
            'interests': 0.10
        }
        
        total = sum(
            scores[k] * weights[k] 
            for k in weights
        )
        
        return round(total, 2)
```

### 7.5 匹配理由生成

```python
class MatchReasonGenerator:
    """
    匹配理由生成器
    """
    
    def generate_reasons(self, user_a: User, user_b: User, 
                         scores: dict) -> list:
        """
        生成匹配理由
        """
        reasons = []
        
        # 1. 价值观相似
        if scores['values'] >= 80:
            reasons.extend(self._generate_value_reasons(user_a, user_b))
        
        # 2. 性格互补
        if scores['personality'] >= 75:
            reasons.extend(self._generate_personality_reasons(user_a, user_b))
        
        # 3. 共同兴趣
        reasons.extend(self._generate_interest_reasons(user_a, user_b))
        
        # 4. 未来规划一致
        reasons.extend(self._generate_future_reasons(user_a, user_b))
        
        # 5. 恋爱观契合
        reasons.extend(self._generate_relationship_reasons(user_a, user_b))
        
        # 去重并限制数量
        reasons = list(dict.fromkeys(reasons))[:5]
        
        return reasons
    
    def _generate_value_reasons(self, user_a: User, user_b: User) -> list:
        """
        价值观相似理由
        """
        reasons = []
        
        # 找共同核心价值观
        values_a = set(user_a.answers.get('Q1', {}).get('ranking', [])[:5])
        values_b = set(user_b.answers.get('Q1', {}).get('ranking', [])[:5])
        common_values = values_a & values_b
        
        if common_values:
            values_str = '、'.join(list(common_values)[:3])
            reasons.append(f"价值观契合：都重视{values_str}")
        
        # 成功定义一致
        success_a = user_a.answers.get('Q2', {}).get('choice')
        success_b = user_b.answers.get('Q2', {}).get('choice')
        if success_a and success_a == success_b:
            success_map = {
                '事业有成': '事业',
                '家庭幸福': '家庭',
                '自由自在': '自由',
                '成长': '成长',
                '社会价值': '社会贡献',
                '财务自由': '财务',
                '真爱': '真爱'
            }
            reasons.append(f"人生追求相似：都向往{success_map.get(success_a, success_a)}")
        
        return reasons
    
    def _generate_interest_reasons(self, user_a: User, user_b: User) -> list:
        """
        共同兴趣理由
        """
        reasons = []
        
        interests_a = set(user_a.answers.get('Q54', {}).get('choices', []))
        interests_b = set(user_b.answers.get('Q54', {}).get('choices', []))
        common = interests_a & interests_b
        
        if common:
            interests_str = '、'.join(list(common)[:3])
            reasons.append(f"共同爱好：{interests_str}")
        
        # 旅行偏好
        travel_a = user_a.answers.get('Q21', {}).get('choice')
        travel_b = user_b.answers.get('Q21', {}).get('choice')
        if travel_a and travel_a == travel_b:
            travel_map = {
                '精心规划': '精心规划的旅行',
                '说走就走': '说走就走的旅行',
                '深度游': '深度旅行体验',
                '打卡景点': '打卡热门景点',
                '小众目的地': '探索小众目的地'
            }
            reasons.append(f"旅行方式相似：都喜欢{travel_map.get(travel_a, travel_a)}")
        
        return reasons
    
    def _generate_personality_reasons(self, user_a: User, user_b: User) -> list:
        """
        性格相关理由
        """
        reasons = []
        
        # 外向-内向互补
        ext_a = user_a.answers.get('Q46', {}).get('value', 50)
        ext_b = user_b.answers.get('Q46', {}).get('value', 50)
        
        if abs(ext_a - ext_b) > 30:
            if ext_a > ext_b:
                reasons.append("性格互补：一个外向开朗，一个内敛沉稳")
            else:
                reasons.append("性格互补：一个内敛沉稳，一个外向开朗")
        
        # 冲突处理互补
        conflict_a = user_a.answers.get('Q32', {}).get('choice')
        conflict_b = user_b.answers.get('Q32', {}).get('choice')
        
        if conflict_a and conflict_b:
            if {conflict_a, conflict_b} == {'直接', '冷静'}:
                reasons.append("冲突处理互补：一个善于表达，一个善于倾听")
        
        return reasons
```

---

## 八、机器学习模型

### 8.1 协同过滤推荐

```python
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity

class CollaborativeFilter:
    """
    基于用户行为的协同过滤
    """
    
    def __init__(self):
        self.user_item_matrix = None
        self.user_similarity_matrix = None
    
    def build_interaction_matrix(self, interactions: list):
        """
        构建用户-用户交互矩阵
        
        interactions: [
            {'user_a': 'u1', 'user_b': 'u2', 'action': 'like', 'rating': 4},
            ...
        ]
        """
        # 获取所有用户ID
        user_ids = list(set(
            [i['user_a'] for i in interactions] +
            [i['user_b'] for i in interactions]
        ))
        user_id_to_idx = {uid: idx for idx, uid in enumerate(user_ids)}
        
        # 构建评分矩阵
        n_users = len(user_ids)
        matrix = np.zeros((n_users, n_users))
        
        for interaction in interactions:
            idx_a = user_id_to_idx[interaction['user_a']]
            idx_b = user_id_to_idx[interaction['user_b']]
            
            # 评分权重
            action_weights = {
                'view': 1,
                'like': 3,
                'chat': 5,
                'date': 8,
                'positive_feedback': 10
            }
            
            weight = action_weights.get(interaction['action'], 1)
            if 'rating' in interaction:
                weight *= interaction['rating'] / 5
            
            matrix[idx_a, idx_b] = weight
        
        self.user_item_matrix = csr_matrix(matrix)
        self.user_id_to_idx = user_id_to_idx
        self.idx_to_user_id = {v: k for k, v in user_id_to_idx.items()}
    
    def calculate_user_similarity(self):
        """
        计算用户相似度矩阵
        """
        self.user_similarity_matrix = cosine_similarity(self.user_item_matrix)
    
    def find_similar_users(self, user_id: str, k: int = 10) -> list:
        """
        找到相似的用户
        """
        if user_id not in self.user_id_to_idx:
            return []
        
        idx = self.user_id_to_idx[user_id]
        similarities = self.user_similarity_matrix[idx]
        
        # 获取最相似的 k 个用户
        similar_indices = np.argsort(similarities)[::-1][1:k+1]  # 排除自己
        
        results = []
        for sim_idx in similar_indices:
            if similarities[sim_idx] > 0:
                results.append({
                    'user_id': self.idx_to_user_id[sim_idx],
                    'similarity': float(similarities[sim_idx])
                })
        
        return results
    
    def recommend_matches(self, user_id: str, n: int = 10) -> list:
        """
        基于协同过滤推荐匹配
        """
        # 找相似用户
        similar_users = self.find_similar_users(user_id, k=20)
        
        # 收集相似用户喜欢/交互过的用户
        candidate_scores = {}
        
        for similar_user in similar_users:
            similar_user_id = similar_user['user_id']
            similarity = similar_user['similarity']
            
            similar_user_idx = self.user_id_to_idx[similar_user_id]
            interactions = self.user_item_matrix[similar_user_idx].toarray()[0]
            
            for idx, score in enumerate(interactions):
                if score > 0:
                    candidate_id = self.idx_to_user_id[idx]
                    if candidate_id != user_id:
                        candidate_scores[candidate_id] = candidate_scores.get(
                            candidate_id, 0
                        ) + score * similarity
        
        # 排序推荐
        recommendations = sorted(
            candidate_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:n]
        
        return [
            {'user_id': uid, 'score': score}
            for uid, score in recommendations
        ]
```

### 8.2 深度学习 Embedding 模型

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class UserEmbeddingModel(nn.Module):
    """
    用户 Embedding 模型
    
    将用户特征映射到低维向量空间
    用于相似度计算和匹配
    """
    
    def __init__(self, 
                 value_dim: int = 30,
                 personality_dim: int = 15,
                 interest_dim: int = 20,
                 relationship_dim: int = 20,
                 lifestyle_dim: int = 12,
                 embedding_dim: int = 64):
        super().__init__()
        
        # 各维度的编码器
        self.value_encoder = nn.Sequential(
            nn.Linear(value_dim, 32),
            nn.ReLU(),
            nn.Linear(32, embedding_dim // 4)
        )
        
        self.personality_encoder = nn.Sequential(
            nn.Linear(personality_dim, 24),
            nn.ReLU(),
            nn.Linear(24, embedding_dim // 4)
        )
        
        self.interest_encoder = nn.Sequential(
            nn.Linear(interest_dim, 32),
            nn.ReLU(),
            nn.Linear(32, embedding_dim // 4)
        )
        
        self.relationship_encoder = nn.Sequential(
            nn.Linear(relationship_dim, 24),
            nn.ReLU(),
            nn.Linear(24, embedding_dim // 4)
        )
        
        # 融合层
        self.fusion = nn.Sequential(
            nn.Linear(embedding_dim, embedding_dim),
            nn.ReLU(),
            nn.Linear(embedding_dim, embedding_dim)
        )
        
        # 匹配预测头（用于训练）
        self.match_predictor = nn.Sequential(
            nn.Linear(embedding_dim * 2, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )
    
    def encode(self, user_features: dict) -> torch.Tensor:
        """
        编码用户特征为 Embedding
        """
        value_emb = self.value_encoder(user_features['values'])
        personality_emb = self.personality_encoder(user_features['personality'])
        interest_emb = self.interest_encoder(user_features['interests'])
        relationship_emb = self.relationship_encoder(user_features['relationship'])
        
        # 拼接
        concat = torch.cat([
            value_emb, personality_emb, interest_emb, relationship_emb
        ], dim=-1)
        
        # 融合
        embedding = self.fusion(concat)
        
        # L2 归一化
        embedding = F.normalize(embedding, p=2, dim=-1)
        
        return embedding
    
    def predict_match(self, user_a_emb: torch.Tensor, 
                      user_b_emb: torch.Tensor) -> torch.Tensor:
        """
        预测两个用户的匹配度
        """
        # 拼接两个用户的 embedding
        concat = torch.cat([user_a_emb, user_b_emb], dim=-1)
        
        # 预测
        match_prob = self.match_predictor(concat)
        
        return match_prob
    
    def forward(self, user_a_features: dict, user_b_features: dict) -> torch.Tensor:
        """
        前向传播
        """
        emb_a = self.encode(user_a_features)
        emb_b = self.encode(user_b_features)
        
        return self.predict_match(emb_a, emb_b)


class MatchPredictionTrainer:
    """
    匹配预测模型训练器
    """
    
    def __init__(self, model: UserEmbeddingModel, lr: float = 1e-3):
        self.model = model
        self.optimizer = torch.optim.Adam(model.parameters(), lr=lr)
        self.criterion = nn.BCELoss()
    
    def train_step(self, batch: dict) -> float:
        """
        单步训练
        
        batch: {
            'user_a_features': dict,
            'user_b_features': dict,
            'label': float (0-1, 是否成功匹配)
        }
        """
        self.optimizer.zero_grad()
        
        # 前向传播
        pred = self.model(
            batch['user_a_features'],
            batch['user_b_features']
        )
        
        # 计算损失
        label = torch.tensor([batch['label']], dtype=torch.float32)
        loss = self.criterion(pred, label)
        
        # 反向传播
        loss.backward()
        self.optimizer.step()
        
        return loss.item()
    
    def train_epoch(self, dataloader) -> dict:
        """
        训练一个 epoch
        """
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        for batch in dataloader:
            loss = self.train_step(batch)
            total_loss += loss
            
            # 计算准确率
            with torch.no_grad():
                pred = self.model(
                    batch['user_a_features'],
                    batch['user_b_features']
                )
                predicted = (pred > 0.5).float()
                correct += (predicted == batch['label']).sum().item()
                total += 1
        
        return {
            'loss': total_loss / len(dataloader),
            'accuracy': correct / total
        }
```

### 8.3 基于反馈的模型优化

```python
class FeedbackBasedOptimizer:
    """
    基于用户反馈的模型优化
    """
    
    def __init__(self, 
                 base_weights: dict,
                 learning_rate: float = 0.01):
        self.weights = base_weights.copy()
        self.learning_rate = learning_rate
        self.feedback_history = []
    
    def collect_feedback(self, match_id: str, feedback: dict):
        """
        收集约会反馈
        
        feedback: {
            'satisfaction': 1-5,  # 满意度
            'would_meet_again': bool,
            'reported_issues': list,  # 问题列表
            'positive_aspects': list  # 积极方面
        }
        """
        self.feedback_history.append({
            'match_id': match_id,
            'feedback': feedback,
            'timestamp': datetime.now()
        })
    
    def update_weights(self):
        """
        根据反馈更新权重
        """
        if len(self.feedback_history) < 10:
            return self.weights
        
        # 分析反馈
        positive_matches = [
            f for f in self.feedback_history 
            if f['feedback']['satisfaction'] >= 4
        ]
        negative_matches = [
            f for f in self.feedback_history 
            if f['feedback']['satisfaction'] <= 2
        ]
        
        # 统计各维度在积极/消极匹配中的表现
        for dimension in self.weights:
            positive_score = self._calculate_dimension_score(
                dimension, positive_matches
            )
            negative_score = self._calculate_dimension_score(
                dimension, negative_matches
            )
            
            # 调整权重
            if positive_score > negative_score:
                # 该维度在积极匹配中表现好，提高权重
                adjustment = self.learning_rate * (positive_score - negative_score)
                self.weights[dimension] *= (1 + adjustment)
            else:
                # 降低权重
                adjustment = self.learning_rate * (negative_score - positive_score)
                self.weights[dimension] *= (1 - adjustment)
        
        # 归一化
        total = sum(self.weights.values())
        self.weights = {k: v / total for k, v in self.weights.items()}
        
        return self.weights
    
    def _calculate_dimension_score(self, dimension: str, matches: list) -> float:
        """
        计算某维度在匹配列表中的平均得分
        """
        scores = []
        for match in matches:
            if 'dimension_scores' in match:
                scores.append(match['dimension_scores'].get(dimension, 50))
        return np.mean(scores) if scores else 50
```

### 8.4 混合推荐策略

```python
class HybridMatchRecommender:
    """
    混合推荐策略
    
    结合基于内容的推荐和协同过滤
    """
    
    def __init__(self,
                 content_scorer: MatchScorer,
                 collaborative_filter: CollaborativeFilter,
                 embedding_model: UserEmbeddingModel = None):
        self.content_scorer = content_scorer
        self.collaborative_filter = collaborative_filter
        self.embedding_model = embedding_model
    
    def recommend(self, 
                  user: User,
                  candidates: list,
                  n: int = 10) -> list:
        """
        混合推荐
        """
        recommendations = []
        
        for candidate in candidates:
            # 1. 基于内容的评分
            content_score = self.content_scorer.calculate_match_score(
                user, candidate
            ).total_score
            
            # 2. 协同过滤评分
            cf_score = self._get_cf_score(user.id, candidate.id)
            
            # 3. Embedding 相似度
            emb_score = self._get_embedding_score(user, candidate)
            
            # 4. 混合评分
            hybrid_score = self._combine_scores(
                content_score=content_score,
                cf_score=cf_score,
                emb_score=emb_score
            )
            
            recommendations.append({
                'user': candidate,
                'score': hybrid_score,
                'content_score': content_score,
                'cf_score': cf_score,
                'emb_score': emb_score
            })
        
        # 排序
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return recommendations[:n]
    
    def _get_cf_score(self, user_id: str, candidate_id: str) -> float:
        """
        获取协同过滤评分
        """
        similar_users = self.collaborative_filter.find_similar_users(user_id)
        
        for similar_user in similar_users:
            if similar_user['user_id'] == candidate_id:
                return similar_user['similarity'] * 100
        
        return 50  # 默认中等分数
    
    def _get_embedding_score(self, user: User, candidate: User) -> float:
        """
        获取 Embedding 相似度评分
        """
        if self.embedding_model is None:
            return 50
        
        with torch.no_grad():
            emb_user = self.embedding_model.encode(user.features)
            emb_candidate = self.embedding_model.encode(candidate.features)
            
            # 余弦相似度
            similarity = F.cosine_similarity(emb_user, emb_candidate)
            
            return float(similarity * 100)
    
    def _combine_scores(self,
                        content_score: float,
                        cf_score: float,
                        emb_score: float) -> float:
        """
        混合评分
        """
        # 权重配置
        weights = {
            'content': 0.6,  # 基于内容（最重要）
            'cf': 0.25,      # 协同过滤
            'embedding': 0.15  # 深度学习
        }
        
        combined = (
            content_score * weights['content'] +
            cf_score * weights['cf'] +
            emb_score * weights['embedding']
        )
        
        return combined
```

---

## 九、伪代码实现

### 9.1 完整匹配流程

```python
def match_users(user_id: str, 
                all_users: list, 
                config: MatchConfig) -> MatchResult:
    """
    完整匹配流程
    
    输入:
        user_id: 目标用户ID
        all_users: 所有候选用户
        config: 匹配配置
    
    输出:
        MatchResult: 匹配结果
    """
    
    # Step 1: 获取用户数据
    user = get_user(user_id)
    user_answers = get_user_answers(user_id)
    user_vector = build_user_vector(user_answers)
    
    # Step 2: 应用硬过滤
    candidates = all_users.copy()
    candidates = hard_filter(user, candidates, config.hard_filters)
    
    # Step 3: 计算匹配分数
    scored_candidates = []
    for candidate in candidates:
        # 3.1 构建候选用户向量
        candidate_answers = get_user_answers(candidate.id)
        candidate_vector = build_user_vector(candidate_answers)
        
        # 3.2 计算各维度分数
        scores = {
            'values': calculate_values_similarity(
                user_vector.values, 
                candidate_vector.values
            ),
            'personality': calculate_personality_match(
                user_vector.personality,
                candidate_vector.personality
            ),
            'relationship': calculate_relationship_similarity(
                user_vector.relationship,
                candidate_vector.relationship
            ),
            'lifestyle': calculate_lifestyle_similarity(
                user_vector.lifestyle,
                candidate_vector.lifestyle
            ),
            'interests': calculate_interest_similarity(
                user_vector.interests,
                candidate_vector.interests
            )
        }
        
        # 3.3 计算综合分数
        total_score = weighted_sum(scores, config.weights)
        
        # 3.4 生成匹配理由
        reasons = generate_match_reasons(user, candidate, scores)
        
        scored_candidates.append({
            'user': candidate,
            'scores': scores,
            'total_score': total_score,
            'reasons': reasons
        })
    
    # Step 4: 应用软过滤（降权）
    scored_candidates = apply_soft_filters(user, scored_candidates)
    
    # Step 5: 排序并返回 Top N
    scored_candidates.sort(key=lambda x: x['total_score'], reverse=True)
    top_matches = scored_candidates[:config.top_n]
    
    # Step 6: 保存匹配记录
    for match in top_matches:
        save_match_record(
            user_id=user.id,
            matched_user_id=match['user'].id,
            scores=match['scores'],
            total_score=match['total_score'],
            reasons=match['reasons']
        )
    
    # Step 7: 发送通知
    send_match_notification(user.id, top_matches)
    
    return MatchResult(
        user_id=user_id,
        matches=top_matches,
        timestamp=datetime.now()
    )
```

### 9.2 批量匹配优化

```python
def batch_match_all_users(users: list, config: MatchConfig):
    """
    批量匹配所有用户
    
    使用矩阵运算优化性能
    """
    # Step 1: 预计算所有用户向量
    user_vectors = {}
    for user in users:
        answers = get_user_answers(user.id)
        user_vectors[user.id] = build_user_vector(answers)
    
    # Step 2: 构建向量矩阵
    value_matrix = np.array([
        user_vectors[u.id].values for u in users
    ])
    personality_matrix = np.array([
        user_vectors[u.id].personality for u in users
    ])
    # ... 其他维度矩阵
    
    # Step 3: 批量计算相似度矩阵
    value_similarity_matrix = cosine_similarity_batch(value_matrix)
    personality_similarity_matrix = cosine_similarity_batch(personality_matrix)
    # ... 其他维度
    
    # Step 4: 综合相似度矩阵
    total_similarity_matrix = (
        value_similarity_matrix * config.weights['values'] +
        personality_similarity_matrix * config.weights['personality'] +
        # ... 其他维度
        0
    )
    
    # Step 5: 为每个用户找到 Top N 匹配
    all_matches = {}
    for i, user in enumerate(users):
        # 获取该用户的相似度
        similarities = total_similarity_matrix[i]
        
        # 排序
        ranked_indices = np.argsort(similarities)[::-1]
        
        # 应用过滤并取 Top N
        top_matches = []
        for j in ranked_indices:
            candidate = users[j]
            
            # 硬过滤检查
            if not hard_filter_check(user, candidate):
                continue
            
            top_matches.append({
                'user': candidate,
                'score': similarities[j]
            })
            
            if len(top_matches) >= config.top_n:
                break
        
        all_matches[user.id] = top_matches
    
    return all_matches
```

### 9.3 实时匹配 API

```python
@app.post('/api/match')
async def get_matches(request: MatchRequest):
    """
    实时匹配 API
    
    支持增量匹配和实时更新
    """
    user_id = request.user_id
    n = request.n or 10
    
    # 尝试从缓存获取
    cache_key = f"matches:{user_id}"
    cached = redis.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # 执行匹配
    matches = match_users(
        user_id=user_id,
        all_users=get_active_users(),
        config=MatchConfig(top_n=n)
    )
    
    # 缓存结果（1小时）
    redis.setex(cache_key, 3600, json.dumps(matches))
    
    return matches


@app.post('/api/match/feedback')
async def submit_feedback(request: FeedbackRequest):
    """
    提交约会反馈
    
    用于优化匹配算法
    """
    match_id = request.match_id
    feedback = request.feedback
    
    # 保存反馈
    save_feedback(match_id, feedback)
    
    # 触发权重更新
    optimizer.collect_feedback(match_id, feedback)
    optimizer.update_weights()
    
    # 清除相关缓存
    redis.delete(f"matches:{request.user_id}")
    
    return {'status': 'success'}
```

---

## 十、系统架构

### 10.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Web App │  │ iOS App  │  │Android App│  │ 小程序   │        │
│  └────┬─────┘  └────┬─────┘  └────┬──────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼──────────────┼───────────────┘
        └─────────────┴─────────────┴──────────────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │
                    │  (Kong/     │
                    │   Nginx)    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌────▼────┐
   │ 用户服务 │       │ 匹配服务   │      │ 反馈服务 │
   │         │       │           │      │         │
   │ - 问卷  │       │ - 实时匹配 │      │ - 反馈收集│
   │ - 画像  │       │ - 批量匹配 │      │ - 分析统计│
   │ - 向量  │       │ - 推荐生成 │      │ - 权重更新│
   └────┬────┘       └─────┬─────┘      └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌────▼────┐
   │PostgreSQL│       │   Redis   │      │ 向量存储 │
   │ - 用户数据│       │ - 缓存    │      │ (FAISS) │
   │ - 问卷答案│       │ - 会话    │      │ - 向量索引│
   │ - 匹配记录│       │ - 队列    │      │ - 相似搜索│
   └──────────┘       └───────────┘      └─────────┘

        ┌─────────────────────────────────┐
        │         定时任务调度             │
        │  ┌──────────┐  ┌──────────┐    │
        │  │ 每周匹配  │  │权重优化   │    │
        │  └──────────┘  └──────────┘    │
        │  ┌──────────┐  ┌──────────┐    │
        │  │向量重建   │  │数据分析   │    │
        │  └──────────┘  └──────────┘    │
        └─────────────────────────────────┘
```

### 10.2 数据流图

```
用户问卷答案
      │
      ▼
┌─────────────┐
│  数据清洗   │
└─────┬───────┘
      │
      ▼
┌─────────────┐     ┌─────────────┐
│  向量化     │────▶│  向量存储   │
└─────┬───────┘     └─────────────┘
      │
      ├──────────────┐
      ▼              ▼
┌─────────────┐ ┌─────────────┐
│  实时匹配   │ │  批量匹配   │
└─────┬───────┘ └─────┬───────┘
      │               │
      └───────┬───────┘
              ▼
      ┌─────────────┐
      │  匹配结果   │
      └─────┬───────┘
            │
            ▼
      ┌─────────────┐
      │  推送通知   │
      └─────────────┘
            │
            ▼
      ┌─────────────┐
      │  用户反馈   │
      └─────┬───────┘
            │
            ▼
      ┌─────────────┐
      │  权重优化   │
      └─────────────┘
```

---

## 十一、评估指标

### 11.1 离线评估指标

```python
def evaluate_matching_quality(test_data: list) -> dict:
    """
    评估匹配质量
    
    test_data: [
        {
            'user_a': User,
            'user_b': User,
            'actual_outcome': bool,  # 实际是否成功
            'match_score': float     # 算法预测分数
        },
        ...
    ]
    """
    from sklearn.metrics import (
        accuracy_score, 
        precision_score, 
        recall_score, 
        f1_score,
        roc_auc_score
    )
    
    y_true = [d['actual_outcome'] for d in test_data]
    y_pred = [d['match_score'] > 70 for d in test_data]  # 阈值70分
    y_scores = [d['match_score'] for d in test_data]
    
    return {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred),
        'recall': recall_score(y_true, y_pred),
        'f1': f1_score(y_true, y_pred),
        'auc_roc': roc_auc_score(y_true, y_scores),
        'coverage': calculate_coverage(test_data),
        'diversity': calculate_diversity(test_data)
    }

def calculate_coverage(test_data: list) -> float:
    """
    覆盖率：能被匹配的用户比例
    """
    all_users = set()
    matched_users = set()
    
    for d in test_data:
        all_users.add(d['user_a'].id)
        if d['match_score'] > 0:
            matched_users.add(d['user_a'].id)
    
    return len(matched_users) / len(all_users)

def calculate_diversity(test_data: list) -> float:
    """
    多样性：匹配结果的多样性
    """
    # 使用匹配对象的特征分布的熵来衡量
    pass
```

### 11.2 在线评估指标

```python
class OnlineMetrics:
    """
    在线业务指标
    """
    
    def calculate_metrics(self, time_range: tuple) -> dict:
        """
        计算在线指标
        """
        start_time, end_time = time_range
        
        # 1. 匹配成功率
        match_success_rate = self._calculate_match_success_rate(
            start_time, end_time
        )
        
        # 2. 双向喜欢率
        mutual_like_rate = self._calculate_mutual_like_rate(
            start_time, end_time
        )
        
        # 3. 聊天转化率
        chat_conversion_rate = self._calculate_chat_conversion_rate(
            start_time, end_time
        )
        
        # 4. 约会转化率
        date_conversion_rate = self._calculate_date_conversion_rate(
            start_time, end_time
        )
        
        # 5. 用户满意度
        avg_satisfaction = self._calculate_avg_satisfaction(
            start_time, end_time
        )
        
        # 6. 活跃度
        user_activity = self._calculate_user_activity(
            start_time, end_time
        )
        
        return {
            'match_success_rate': match_success_rate,
            'mutual_like_rate': mutual_like_rate,
            'chat_conversion_rate': chat_conversion_rate,
            'date_conversion_rate': date_conversion_rate,
            'avg_satisfaction': avg_satisfaction,
            'user_activity': user_activity
        }
    
    def _calculate_match_success_rate(self, start, end) -> float:
        """
        匹配成功率
        
        = 双向喜欢的匹配数 / 总匹配数
        """
        total_matches = count_matches(start, end)
        successful_matches = count_mutual_likes(start, end)
        
        return successful_matches / total_matches if total_matches > 0 else 0
```

### 11.3 A/B 测试框架

```python
class ABTestFramework:
    """
    A/B 测试框架
    """
    
    def __init__(self):
        self.experiments = {}
    
    def assign_variant(self, user_id: str, experiment_id: str) -> str:
        """
        为用户分配实验变体
        """
        experiment = self.experiments[experiment_id]
        
        # 使用用户ID的哈希进行分配
        hash_val = hash(user_id) % 100
        
        cumulative = 0
        for variant, percentage in experiment['variants'].items():
            cumulative += percentage
            if hash_val < cumulative:
                return variant
        
        return 'control'
    
    def get_algorithm_for_variant(self, variant: str) -> MatchScorer:
        """
        根据变体返回对应的算法
        """
        if variant == 'control':
            return MatchScorer(weights=DEFAULT_WEIGHTS)
        elif variant == 'treatment_a':
            return MatchScorer(weights=EXPERIMENTAL_WEIGHTS_A)
        elif variant == 'treatment_b':
            return MatchScorer(weights=EXPERIMENTAL_WEIGHTS_B)
    
    def analyze_experiment(self, experiment_id: str) -> dict:
        """
        分析实验结果
        """
        results = get_experiment_results(experiment_id)
        
        analysis = {}
        for variant in results:
            analysis[variant] = {
                'match_success_rate': np.mean([
                    r['success'] for r in results[variant]
                ]),
                'avg_satisfaction': np.mean([
                    r['satisfaction'] for r in results[variant]
                ]),
                'user_count': len(results[variant])
            }
        
        # 统计显著性检验
        p_value = self._significance_test(
            results['control'],
            results['treatment']
        )
        
        analysis['p_value'] = p_value
        analysis['is_significant'] = p_value < 0.05
        
        return analysis
```

---

## 附录

### A. 问题类型与编码方式对照表

| 问题类型 | 编码方式 | 输出维度 | 示例 |
|---------|---------|---------|------|
| 单选题 | One-hot | N (选项数) | Q2: 7维 |
| 多选题 | Multi-hot | N (选项数) | Q54: 12维 |
| 量表题 | 归一化 | 1 | Q3: 1维 |
| 滑块题 | 归一化 | 1 | Q4: 1维 |
| 排序题 | 位置向量 | N (项目数) | Q1: 18维 |
| 开放式 | Embedding | 384-1536 | Q13: 384维 |

### B. 向量维度汇总

| 维度 | 子维度 | 总维度 |
|------|--------|--------|
| 价值观向量 | 核心价值观、金钱观、风险偏好等 | 30 |
| 性格向量 | 大五人格、MBTI、沟通风格 | 15 |
| 恋爱偏好向量 | 目的、节奏、亲密距离等 | 20 |
| 生活方式向量 | 作息、社交、消费等 | 12 |
| 兴趣向量 | 爱好、文化、运动等 | 20 |
| **综合向量** | **加权拼接** | **97** |

### C. 性能基准

| 操作 | 目标延迟 | QPS |
|------|---------|-----|
| 单次匹配计算 | < 50ms | 1000+ |
| 批量匹配(10K用户) | < 10s | - |
| 向量相似度搜索 | < 5ms | 5000+ |
| 用户向量构建 | < 100ms | 500+ |

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2026-03-18 | 初始版本，完整的用户画像模型和匹配算法设计 |

---

**文档结束**

本技术文档为心动投递平台的核心算法设计文档，包含完整的用户画像模型、数据处理流程、相似度计算方法、匹配算法以及机器学习模型。文档设计基于心理学和社会学研究，结合实际业务需求，旨在提供科学、可解释、高效的匹配服务。
